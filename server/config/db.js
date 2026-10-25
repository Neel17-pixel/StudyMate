import mongoose from 'mongoose';
import { collections } from './storage.js';

let isMongoConnected = false;

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/studymate';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    isMongoConnected = true;
    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    isMongoConnected = false;
    console.log(`ℹ️  MongoDB not running locally (${error.message}).`);
    console.log(`⚡ StudyMate is running with built-in Persistent File Storage (server/data/*.json). All features, authentication, and data persistence remain 100% active!`);
  }
};

export const getDbStatus = () => ({
  isMongoConnected,
  driver: isMongoConnected ? 'MongoDB (Mongoose)' : 'Local File Persistence (JSON)'
});

export { isMongoConnected, collections };
