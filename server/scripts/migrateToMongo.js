import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Models
import { UserModel } from '../models/User.js';
import { SubjectModel } from '../models/Subject.js';
import { TaskModel } from '../models/Task.js';
import { StudySessionModel } from '../models/StudySession.js';
import { NoteModel } from '../models/Note.js';
import { ChatMessageModel } from '../models/ChatMessage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Robust environment loading
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const DATA_DIR = path.join(__dirname, '..', 'data');

/**
 * Creates a timestamped local backup of all JSON data files
 */
const createBackup = () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(DATA_DIR, `backup_${timestamp}`);

  if (!fs.existsSync(DATA_DIR)) {
    throw new Error(`Data directory not found at ${DATA_DIR}`);
  }

  fs.mkdirSync(backupDir, { recursive: true });

  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json') && !f.startsWith('backup'));
  const backedUp = [];

  for (const file of files) {
    const src = path.join(DATA_DIR, file);
    const dest = path.join(backupDir, file);
    fs.copyFileSync(src, dest);
    backedUp.push(file);
  }

  console.log(`\n📦 Backup created successfully in:\n   ${backupDir}`);
  console.log(`   Files backed up: ${backedUp.join(', ')}\n`);
  return backupDir;
};

/**
 * Safely reads and parses a JSON data file
 */
const readJsonFile = (filename) => {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`   ⚠️ File ${filename} not found. Skipping.`);
    return [];
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    if (!raw.trim()) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      console.warn(`   ⚠️ File ${filename} did not contain a JSON array.`);
      return [];
    }
    return parsed;
  } catch (err) {
    console.error(`   ❌ Failed to parse ${filename}: ${err.message}`);
    throw err;
  }
};

/**
 * Generic migration runner for a collection
 */
const migrateCollection = async ({ name, filename, model, transform, validate }) => {
  console.log(`--------------------------------------------------`);
  console.log(`🔄 Migrating collection: ${name} (${filename})...`);

  const rawItems = readJsonFile(filename);
  let imported = 0;
  let skipped = 0;
  let failed = 0;

  for (const item of rawItems) {
    try {
      if (validate && !validate(item)) {
        skipped++;
        continue;
      }

      const doc = transform ? transform(item) : { ...item };
      const docId = doc._id || doc.id;

      if (!docId) {
        failed++;
        console.error(`   ⚠️ Item missing valid _id in ${filename}. Skipped.`);
        continue;
      }

      doc._id = String(docId);
      delete doc.id; // Avoid conflicting with virtual

      // Check if document already exists
      const existing = await model.findById(doc._id);
      if (existing) {
        skipped++;
      } else {
        await model.create(doc);
        imported++;
      }
    } catch (err) {
      failed++;
      console.error(`   ❌ Error migrating document (${item._id || item.id}): ${err.message}`);
    }
  }

  console.log(`   ✅ Total read: ${rawItems.length} | Imported: ${imported} | Skipped (existing/invalid): ${skipped} | Failed: ${failed}`);
  return { name, total: rawItems.length, imported, skipped, failed };
};

/**
 * Main migration coordinator
 */
export const runMigration = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('\n❌ Error: MONGO_URI is not defined in environment variables.');
    console.error('Please verify your MongoDB Atlas connection string in server/.env\n');
    process.exit(1);
  }

  console.log('==================================================');
  console.log('🚀 StudyMate JSON -> MongoDB Atlas Migration Utility');
  console.log('==================================================');

  // Step 1: Backup
  createBackup();

  // Step 2: Connect to Atlas
  console.log('📡 Connecting to MongoDB Atlas...');
  let conn;
  try {
    conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
    console.log(`✅ Connected to cluster host: ${conn.connection.host}`);
    console.log(`   Database name: ${conn.connection.name}\n`);
  } catch (err) {
    console.error(`\n❌ Failed to connect to MongoDB Atlas: ${err.message}`);
    process.exit(1);
  }

  const results = [];

  try {
    // 1. Users
    const userRes = await migrateCollection({
      name: 'Users',
      filename: 'users.json',
      model: UserModel,
      validate: (u) => {
        // Skip placeholder records that do not have real hashed passwords
        if (u.password === 'REPLACE_WITH_DEMO_PASSWORD_HASH' || u.password === 'PLACEHOLDER') {
          return false;
        }
        return Boolean(u.email && u.password);
      },
      transform: (u) => {
        const cleaned = { ...u };
        // Clean out any secrets or API keys that should never be in MongoDB
        delete cleaned.geminiApiKey;
        delete cleaned.apiKey;
        delete cleaned.secret;
        return cleaned;
      }
    });
    results.push(userRes);

    // 2. Subjects
    const subjectRes = await migrateCollection({
      name: 'Subjects',
      filename: 'subjects.json',
      model: SubjectModel,
      validate: (s) => Boolean(s.userId && s.name && s.code),
      transform: (s) => ({
        ...s,
        credits: Number(s.credits) || 3
      })
    });
    results.push(subjectRes);

    // 3. Tasks
    const taskRes = await migrateCollection({
      name: 'Tasks',
      filename: 'tasks.json',
      model: TaskModel,
      validate: (t) => Boolean(t.userId && t.title),
      transform: (t) => ({
        ...t,
        estimatedMinutes: Number(t.estimatedMinutes) || 60,
        actualMinutes: Number(t.actualMinutes) || 0,
        dueDate: t.dueDate ? new Date(t.dueDate) : new Date(),
        completedAt: t.completedAt ? new Date(t.completedAt) : null,
        tags: Array.isArray(t.tags) ? t.tags : []
      })
    });
    results.push(taskRes);

    // 4. Study Sessions
    const sessionRes = await migrateCollection({
      name: 'StudySessions',
      filename: 'sessions.json',
      model: StudySessionModel,
      validate: (s) => Boolean(s.userId && s.durationMinutes),
      transform: (s) => ({
        ...s,
        durationMinutes: Number(s.durationMinutes) || 25,
        productivityRating: Number(s.productivityRating) || 4,
        completedAt: s.completedAt ? new Date(s.completedAt) : new Date()
      })
    });
    results.push(sessionRes);

    // 5. Notes
    const noteRes = await migrateCollection({
      name: 'Notes',
      filename: 'notes.json',
      model: NoteModel,
      validate: (n) => Boolean(n.userId && n.title),
      transform: (n) => ({
        ...n,
        tags: Array.isArray(n.tags) ? n.tags : [],
        isPinned: Boolean(n.isPinned)
      })
    });
    results.push(noteRes);

    // 6. Chat Messages
    const chatRes = await migrateCollection({
      name: 'ChatMessages',
      filename: 'chat_messages.json',
      model: ChatMessageModel,
      validate: (m) => Boolean(m.userId && m.role && m.content),
      transform: (m) => ({
        ...m,
        timestamp: m.timestamp ? new Date(m.timestamp) : new Date()
      })
    });
    results.push(chatRes);

    // Summary
    console.log('\n==================================================');
    console.log('📊 MIGRATION SUMMARY REPORT');
    console.log('==================================================');
    console.table(results.map(r => ({
      Collection: r.name,
      'JSON Records': r.total,
      'Imported': r.imported,
      'Skipped': r.skipped,
      'Failed': r.failed
    })));

    const totalImported = results.reduce((acc, r) => acc + r.imported, 0);
    const totalSkipped = results.reduce((acc, r) => acc + r.skipped, 0);
    const totalFailed = results.reduce((acc, r) => acc + r.failed, 0);

    console.log(`🎉 Migration completed!`);
    console.log(`   Total Records Processed: ${results.reduce((acc, r) => acc + r.total, 0)}`);
    console.log(`   Successfully Imported:   ${totalImported}`);
    console.log(`   Skipped:                 ${totalSkipped}`);
    console.log(`   Failed:                  ${totalFailed}`);
    console.log('==================================================\n');

  } catch (err) {
    console.error('❌ Fatal error during migration execution:', err);
  } finally {
    await mongoose.connection.close();
    console.log('🔒 Database connection closed cleanly.');
  }
};

// Auto-run if executed from CLI
if (process.argv[1] && process.argv[1].endsWith('migrateToMongo.js')) {
  runMigration().then(() => process.exit(0)).catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
}
