import mongoose from 'mongoose';
import { isMongoConnected, collections } from '../config/db.js';

const TaskSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  subjectId: { type: String, default: '' },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  type: {
    type: String,
    enum: ['Assignment', 'Exam Prep', 'Project', 'Reading', 'Lab Report', 'Quiz', 'General'],
    default: 'Assignment'
  },
  priority: {
    type: String,
    enum: ['urgent', 'high', 'medium', 'low'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed'],
    default: 'pending'
  },
  dueDate: { type: Date, default: () => new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
  estimatedMinutes: { type: Number, default: 60 },
  actualMinutes: { type: Number, default: 0 },
  completedAt: { type: Date, default: null },
  tags: { type: [String], default: [] },
  isPinned: { type: Boolean, default: false }
}, { timestamps: true });

const MongooseTaskModel = mongoose.models.Task || mongoose.model('Task', TaskSchema);

export const TaskModel = {
  find: (query) => (isMongoConnected ? MongooseTaskModel.find(query).lean() : collections.tasks.find(query)),
  findOne: (query) => (isMongoConnected ? MongooseTaskModel.findOne(query).lean() : collections.tasks.findOne(query)),
  findById: (id) => (isMongoConnected ? MongooseTaskModel.findById(id).lean() : collections.tasks.findById(id)),
  create: (data) => (isMongoConnected ? MongooseTaskModel.create(data) : collections.tasks.create(data)),
  findByIdAndUpdate: (id, data, options) => (isMongoConnected ? MongooseTaskModel.findByIdAndUpdate(id, data, options).lean() : collections.tasks.findByIdAndUpdate(id, data, options)),
  findByIdAndDelete: (id) => (isMongoConnected ? MongooseTaskModel.findByIdAndDelete(id).lean() : collections.tasks.findByIdAndDelete(id)),
  countDocuments: (query) => (isMongoConnected ? MongooseTaskModel.countDocuments(query) : collections.tasks.countDocuments(query))
};

export default TaskModel;
