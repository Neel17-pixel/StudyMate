import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const SubjectSchema = new mongoose.Schema({
  _id: { type: String, default: () => uuidv4() },
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, trim: true, uppercase: true },
  color: { type: String, default: '#6366f1' },
  instructor: { type: String, default: '', trim: true },
  credits: { type: Number, default: 3, min: 0, max: 30 },
  targetGrade: { type: String, default: 'A', trim: true },
  schedule: { type: String, default: '', trim: true },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

SubjectSchema.virtual('id').get(function() {
  return this._id;
});

SubjectSchema.index({ userId: 1, code: 1 });

export const SubjectModel = mongoose.models.Subject || mongoose.model('Subject', SubjectSchema);
export default SubjectModel;
