import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

import { UserModel } from '../models/User.js';
import { SubjectModel } from '../models/Subject.js';
import { TaskModel } from '../models/Task.js';
import { StudySessionModel } from '../models/StudySession.js';
import { NoteModel } from '../models/Note.js';
import { ChatMessageModel } from '../models/ChatMessage.js';

const BASE_URL = 'http://localhost:5000/api';

const runTests = async () => {
  console.log('====================================================');
  console.log('🧪 StudyMate MongoDB Atlas Comprehensive Test Suite');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, desc) => {
    if (condition) {
      console.log(`  ✅ PASS: ${desc}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${desc}`);
      failed++;
    }
  };

  // Connect to DB directly for validation
  await mongoose.connect(process.env.MONGO_URI);

  try {
    // 1. Health check
    console.log('--- 1. Server & MongoDB Health Check ---');
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200, 'Health endpoint responds with 200');
    assert(healthData.database?.isMongoConnected === true, 'Database isMongoConnected is true');
    assert(healthData.database?.driver === 'MongoDB Atlas (Mongoose)', 'Driver is MongoDB Atlas (Mongoose)');
    assert(healthData.status === 'online', 'Status is online');

    // 2. User Registration
    console.log('\n--- 2. User Registration (Atlas Document Creation) ---');
    const testEmailA = `test_atlas_a_${Date.now()}@studymate.test`;
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Atlas Test User A',
        email: testEmailA,
        password: 'Password123!',
        major: 'Data Science',
        university: 'Atlas University'
      })
    });
    const regData = await regRes.json();
    assert(regRes.status === 201, 'Registration returns 201 Created');
    assert(Boolean(regData.token), 'Registration returns a valid JWT token');
    assert(regData.user?.email === testEmailA, 'Returned user object matches registered email');
    assert(!regData.user?.password, 'User password hash is NEVER exposed in registration response');
    assert(!regData.user?.geminiApiKey, 'No API key or internal secret exposed in user response');

    // Verify document in Atlas directly
    const userADoc = await UserModel.findOne({ email: testEmailA });
    assert(Boolean(userADoc), 'User A document successfully persisted in MongoDB Atlas');
    assert(userADoc?._id === regData.user.id, 'Atlas document _id matches returned user ID');
    assert(userADoc?.password !== 'Password123!', 'Password stored in Atlas is properly bcrypt-hashed');

    const tokenA = regData.token;
    const userAId = regData.user.id;

    // 3. User Login
    console.log('\n--- 3. User Login Authentication ---');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmailA,
        password: 'Password123!'
      })
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200, 'Login returns 200 OK');
    assert(Boolean(loginData.token), 'Login returns valid token');
    assert(!loginData.user?.password, 'Login response does not expose password hash');

    // Test Invalid Login
    const badLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmailA, password: 'WrongPassword' })
    });
    assert(badLoginRes.status === 401, 'Invalid password returns 401 Unauthorized');

    // 4. Subject CRUD in Atlas
    console.log('\n--- 4. Subject Operations in Atlas ---');
    const subRes = await fetch(`${BASE_URL}/subjects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        name: 'Deep Learning & Neural Networks',
        code: 'CS601',
        color: '#8b5cf6',
        credits: 4,
        targetGrade: 'A+'
      })
    });
    const subData = await subRes.json();
    assert(subRes.status === 201, 'Subject created with 201');
    const subjectId = subData.data?._id || subData.data?.id;
    assert(Boolean(subjectId), 'Subject returned valid ID');

    // Direct Atlas check
    const subDoc = await SubjectModel.findById(subjectId);
    assert(Boolean(subDoc), 'Subject document found directly in MongoDB Atlas');
    assert(subDoc?.code === 'CS601', 'Subject code matches CS601');
    assert(subDoc?.userId === userAId, 'Subject userId matches User A');

    // 5. Task CRUD in Atlas
    console.log('\n--- 5. Task Operations in Atlas ---');
    const taskRes = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        title: 'Train Transformer on Wikitext-103',
        description: 'Multi-GPU training and validation perplexity logging',
        subjectId,
        type: 'Project',
        priority: 'high',
        estimatedMinutes: 90
      })
    });
    const taskData = await taskRes.json();
    assert(taskRes.status === 201, 'Task created with 201');
    const taskId = taskData.data?._id || taskData.data?.id;

    // Direct Atlas check
    const taskDoc = await TaskModel.findById(taskId);
    assert(Boolean(taskDoc), 'Task document found directly in MongoDB Atlas');
    assert(taskDoc?.subjectId === subjectId, 'Task correctly associated with Subject');

    // Toggle Task status
    const toggleRes = await fetch(`${BASE_URL}/tasks/${taskId}/toggle`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    const toggleData = await toggleRes.json();
    assert(toggleRes.status === 200, 'Task toggle status returns 200');
    assert(toggleData.data?.status === 'completed', 'Task status changed to completed');
    assert(Boolean(toggleData.data?.completedAt), 'Task completedAt timestamp set');

    // 6. Study Session in Atlas
    console.log('\n--- 6. Study Session Operations in Atlas ---');
    const sessRes = await fetch(`${BASE_URL}/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        subjectId,
        taskId,
        durationMinutes: 45,
        sessionType: 'pomodoro',
        productivityRating: 5,
        notes: 'Hyperparameter tuning completed'
      })
    });
    const sessData = await sessRes.json();
    assert(sessRes.status === 201, 'Study session created with 201');
    const sessionId = sessData.data?._id || sessData.data?.id;

    // Check Atlas session and task actualMinutes increment
    const sessDoc = await StudySessionModel.findById(sessionId);
    assert(Boolean(sessDoc), 'Session document persisted in Atlas');
    const updatedTaskDoc = await TaskModel.findById(taskId);
    assert(updatedTaskDoc?.actualMinutes === 45, 'Task actualMinutes incremented in Atlas by 45');

    // 7. Notes & AI Summary in Atlas
    console.log('\n--- 7. Note Operations & AI Summary in Atlas ---');
    const noteRes = await fetch(`${BASE_URL}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        title: 'Attention Is All You Need Notes',
        content: 'Transformers use multi-head self-attention mechanisms to model relationships between tokens regardless of distance. Queries, keys, and values are mapped via projection matrices.',
        subjectId,
        tags: ['transformers', 'deep-learning']
      })
    });
    const noteData = await noteRes.json();
    assert(noteRes.status === 201, 'Note created with 201');
    const noteId = noteData.data?._id || noteData.data?.id;

    const summRes = await fetch(`${BASE_URL}/notes/${noteId}/summarize`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    const summData = await summRes.json();
    assert(summRes.status === 200, 'AI summarization endpoint returns 200');
    assert(Boolean(summData.aiSummary), 'AI summary successfully generated');

    const updatedNoteDoc = await NoteModel.findById(noteId);
    assert(Boolean(updatedNoteDoc?.aiSummary), 'aiSummary persisted directly in MongoDB Atlas note document');

    // 8. AI Chat Messages in Atlas
    console.log('\n--- 8. AI Chat History & Cleanup in Atlas ---');
    const chatRes = await fetch(`${BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        prompt: 'Give binary search code in java',
        mode: 'code',
        subjectId
      })
    });
    const chatData = await chatRes.json();
    assert(chatRes.status === 200, 'AI Chat endpoint returns 200');
    assert(Boolean(chatData.assistantMessage?.content), 'Assistant generated response content');
    // Verify it gave Java code as requested
    assert(chatData.assistantMessage.content.includes('public class BinarySearch') || chatData.assistantMessage.content.includes('java'), 'Chatbot returned Java code as requested');

    // Verify messages stored in Atlas
    const userMsgDoc = await ChatMessageModel.findById(chatData.userMessage._id || chatData.userMessage.id);
    const assistMsgDoc = await ChatMessageModel.findById(chatData.assistantMessage._id || chatData.assistantMessage.id);
    assert(Boolean(userMsgDoc), 'User message document stored in Atlas');
    assert(Boolean(assistMsgDoc), 'Assistant message document stored in Atlas');

    // Clear chat
    const clearRes = await fetch(`${BASE_URL}/ai/history`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    const clearData = await clearRes.json();
    assert(clearRes.status === 200, 'Clear chat returns 200');
    assert(Array.isArray(clearData.data) && clearData.data.length === 0, 'Clear chat returns empty array');

    const remainingChats = await ChatMessageModel.find({ userId: userAId });
    assert(remainingChats.length === 0, 'Atlas documents for User A chat messages deleted');

    // 9. User Isolation Testing
    console.log('\n--- 9. User Data Isolation Security Check ---');
    const testEmailB = `test_atlas_b_${Date.now()}@studymate.test`;
    const regBRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Atlas Test User B',
        email: testEmailB,
        password: 'Password123!',
        major: 'Bioengineering',
        university: 'Atlas University'
      })
    });
    const regBData = await regBRes.json();
    const tokenB = regBData.token;
    const userBId = regBData.user.id;

    // User B tries to get User A's subjects
    const bSubjectsRes = await fetch(`${BASE_URL}/subjects`, {
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    const bSubjectsData = await bSubjectsRes.json();
    assert(bSubjectsData.data.length === 0, 'User B sees 0 subjects (cannot see User A subjects)');

    // User B tries to update User A's task
    const bEditTaskRes = await fetch(`${BASE_URL}/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenB}`
      },
      body: JSON.stringify({ title: 'Hacked Task' })
    });
    assert(bEditTaskRes.status === 404, 'User B editing User A task is blocked with 404 Unauthorized');

    // User B tries to delete User A's note
    const bDelNoteRes = await fetch(`${BASE_URL}/notes/${noteId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    assert(bDelNoteRes.status === 404, 'User B deleting User A note is blocked with 404 Unauthorized');

    // 10. Clean up test users & records
    console.log('\n--- 10. Cleaning up test artifacts from Atlas ---');
    await SubjectModel.deleteMany({ userId: { $in: [userAId, userBId] } });
    await TaskModel.deleteMany({ userId: { $in: [userAId, userBId] } });
    await StudySessionModel.deleteMany({ userId: { $in: [userAId, userBId] } });
    await NoteModel.deleteMany({ userId: { $in: [userAId, userBId] } });
    await ChatMessageModel.deleteMany({ userId: { $in: [userAId, userBId] } });
    await UserModel.deleteMany({ _id: { $in: [userAId, userBId] } });
    console.log('  🧹 Test users and records cleanly purged from Atlas.');

    console.log('\n====================================================');
    console.log(`🏁 TEST SUITE COMPLETED: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
};

runTests();
