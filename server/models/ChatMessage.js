import mongoose from 'mongoose';
import { isMongoConnected, collections } from '../config/db.js';

const ChatMessageSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
  content: { type: String, required: true },
  mode: {
    type: String,
    enum: ['general', 'explain', 'quiz', 'summary', 'code', 'schedule'],
    default: 'general'
  },
  subjectId: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

const MongooseChatMessageModel = mongoose.models.ChatMessage || mongoose.model('ChatMessage', ChatMessageSchema);

export const ChatMessageModel = {
  find: (query) => (isMongoConnected ? MongooseChatMessageModel.find(query).lean() : collections.chatMessages.find(query)),
  findOne: (query) => (isMongoConnected ? MongooseChatMessageModel.findOne(query).lean() : collections.chatMessages.findOne(query)),
  findById: (id) => (isMongoConnected ? MongooseChatMessageModel.findById(id).lean() : collections.chatMessages.findById(id)),
  create: (data) => (isMongoConnected ? MongooseChatMessageModel.create(data) : collections.chatMessages.create(data)),
  findByIdAndUpdate: (id, data, options) => (isMongoConnected ? MongooseChatMessageModel.findByIdAndUpdate(id, data, options).lean() : collections.chatMessages.findByIdAndUpdate(id, data, options)),
  findByIdAndDelete: (id) => (isMongoConnected ? MongooseChatMessageModel.findByIdAndDelete(id).lean() : collections.chatMessages.findByIdAndDelete(id)),
  deleteMany: (query) => (isMongoConnected ? MongooseChatMessageModel.deleteMany(query) : collections.chatMessages.deleteMany(query)),
  countDocuments: (query) => (isMongoConnected ? MongooseChatMessageModel.countDocuments(query) : collections.chatMessages.countDocuments(query))
};

export default ChatMessageModel;
