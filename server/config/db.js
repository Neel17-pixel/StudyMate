import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Robust environment variable resolution: loads from server/.env then root .env
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

let isMongoConnected = false;

export const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('\n❌ MongoDB Connection Error: MONGO_URI is not defined in environment variables.');
    console.error('Please configure your MongoDB Atlas connection string in server/.env\n');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });

    isMongoConnected = true;
    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host} (Database: ${conn.connection.name})`);

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB Atlas connection error event:', err.message);
      isMongoConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB Atlas connection disconnected.');
      isMongoConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB Atlas connection re-established.');
      isMongoConnected = true;
    });

    return conn;
  } catch (error) {
    isMongoConnected = false;
    console.error(`\n❌ Failed to connect to MongoDB Atlas:`);
    console.error(`   ${error.message}`);
    console.error(`\nTroubleshooting checklist:`);
    console.error(`   1. Verify your MONGO_URI in .env contains valid cluster credentials.`);
    console.error(`   2. Ensure your client IP address is allowlisted in MongoDB Atlas Network Access.`);
    console.error(`   3. Confirm your Atlas cluster is active and accepting connections.`);
    console.error(`\nExiting process (JSON fallback is disabled per Atlas specification).\n`);
    process.exit(1);
  }
};

export const getDbStatus = () => ({
  isMongoConnected: mongoose.connection.readyState === 1,
  readyState: mongoose.connection.readyState,
  driver: 'MongoDB Atlas (Mongoose)',
  host: mongoose.connection.host || 'unknown',
  database: mongoose.connection.name || 'studymate'
});

// Process signal handling for clean shutdown
const gracefulShutdown = async (signal) => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log(`\n🛑 MongoDB connection closed on ${signal}. Exiting process.`);
    }
  } catch (err) {
    console.error(`Error closing MongoDB on ${signal}:`, err.message);
  } finally {
    process.exit(0);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

export { isMongoConnected };
export default connectDB;
