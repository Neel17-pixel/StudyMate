import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const StudySessionSchema = new mongoose.Schema({
  _id: { type: String, default: () => uuidv4() },
  userId: { type: String, required: true, index: true },
  subjectId: { type: String, default: '', index: true },
  taskId: { type: String, default: '', index: true },
  durationMinutes: { type: Number, required: true, min: 1 },
  sessionType: {
    type: String,
    enum: ['pomodoro', 'short_break', 'long_break', 'deep_work'],
    default: 'pomodoro'
  },
  productivityRating: { type: Number, min: 1, max: 5, default: 4 },
  notes: { type: String, default: '', trim: true },
  completedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

StudySessionSchema.virtual('id').get(function() {
  return this._id;
});

StudySessionSchema.index({ userId: 1, completedAt: -1 });

export const StudySessionModel = mongoose.models.StudySession || mongoose.model('StudySession', StudySessionSchema);
export default StudySessionModel;
