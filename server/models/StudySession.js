import mongoose from 'mongoose';
import { isMongoConnected, collections } from '../config/db.js';

const StudySessionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  subjectId: { type: String, default: '' },
  taskId: { type: String, default: '' },
  durationMinutes: { type: Number, required: true },
  sessionType: {
    type: String,
    enum: ['pomodoro', 'short_break', 'long_break', 'deep_work'],
    default: 'pomodoro'
  },
  productivityRating: { type: Number, min: 1, max: 5, default: 4 },
  notes: { type: String, default: '' },
  completedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const MongooseSessionModel = mongoose.models.StudySession || mongoose.model('StudySession', StudySessionSchema);

export const StudySessionModel = {
  find: (query) => (isMongoConnected ? MongooseSessionModel.find(query).lean() : collections.sessions.find(query)),
  findOne: (query) => (isMongoConnected ? MongooseSessionModel.findOne(query).lean() : collections.sessions.findOne(query)),
  findById: (id) => (isMongoConnected ? MongooseSessionModel.findById(id).lean() : collections.sessions.findById(id)),
  create: (data) => (isMongoConnected ? MongooseSessionModel.create(data) : collections.sessions.create(data)),
  findByIdAndUpdate: (id, data, options) => (isMongoConnected ? MongooseSessionModel.findByIdAndUpdate(id, data, options).lean() : collections.sessions.findByIdAndUpdate(id, data, options)),
  findByIdAndDelete: (id) => (isMongoConnected ? MongooseSessionModel.findByIdAndDelete(id).lean() : collections.sessions.findByIdAndDelete(id)),
  countDocuments: (query) => (isMongoConnected ? MongooseSessionModel.countDocuments(query) : collections.sessions.countDocuments(query))
};

export default StudySessionModel;
