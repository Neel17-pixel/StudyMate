import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const TaskSchema = new mongoose.Schema({
  _id: { type: String, default: () => uuidv4() },
  userId: { type: String, required: true, index: true },
  subjectId: { type: String, default: '', index: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '', trim: true },
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
  estimatedMinutes: { type: Number, default: 60, min: 0 },
  actualMinutes: { type: Number, default: 0, min: 0 },
  completedAt: { type: Date, default: null },
  tags: { type: [String], default: [] },
  isPinned: { type: Boolean, default: false }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

TaskSchema.virtual('id').get(function() {
  return this._id;
});

TaskSchema.index({ userId: 1, status: 1, dueDate: 1 });

export const TaskModel = mongoose.models.Task || mongoose.model('Task', TaskSchema);
export default TaskModel;
