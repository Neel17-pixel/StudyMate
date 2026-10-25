import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const ChatMessageSchema = new mongoose.Schema({
  _id: { type: String, default: () => uuidv4() },
  userId: { type: String, required: true, index: true },
  role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
  content: { type: String, required: true },
  mode: {
    type: String,
    enum: ['general', 'explain', 'quiz', 'summary', 'code', 'schedule'],
    default: 'general'
  },
  subjectId: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

ChatMessageSchema.virtual('id').get(function() {
  return this._id;
});

ChatMessageSchema.index({ userId: 1, timestamp: 1 });

export const ChatMessageModel = mongoose.models.ChatMessage || mongoose.model('ChatMessage', ChatMessageSchema);
export default ChatMessageModel;
