import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const NoteSchema = new mongoose.Schema({
  _id: { type: String, default: () => uuidv4() },
  userId: { type: String, required: true, index: true },
  subjectId: { type: String, default: '', index: true },
  title: { type: String, required: true, trim: true },
  content: { type: String, default: '' },
  tags: { type: [String], default: [] },
  isPinned: { type: Boolean, default: false },
  aiSummary: { type: String, default: '' },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

NoteSchema.virtual('id').get(function() {
  return this._id;
});

NoteSchema.index({ userId: 1, updatedAt: -1 });

export const NoteModel = mongoose.models.Note || mongoose.model('Note', NoteSchema);
export default NoteModel;
