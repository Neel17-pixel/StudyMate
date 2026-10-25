import mongoose from 'mongoose';
import { isMongoConnected, collections } from '../config/db.js';

const NoteSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  subjectId: { type: String, default: '' },
  title: { type: String, required: true },
  content: { type: String, default: '' },
  tags: { type: [String], default: [] },
  isPinned: { type: Boolean, default: false },
  aiSummary: { type: String, default: '' },
}, { timestamps: true });

const MongooseNoteModel = mongoose.models.Note || mongoose.model('Note', NoteSchema);

export const NoteModel = {
  find: (query) => (isMongoConnected ? MongooseNoteModel.find(query).lean() : collections.notes.find(query)),
  findOne: (query) => (isMongoConnected ? MongooseNoteModel.findOne(query).lean() : collections.notes.findOne(query)),
  findById: (id) => (isMongoConnected ? MongooseNoteModel.findById(id).lean() : collections.notes.findById(id)),
  create: (data) => (isMongoConnected ? MongooseNoteModel.create(data) : collections.notes.create(data)),
  findByIdAndUpdate: (id, data, options) => (isMongoConnected ? MongooseNoteModel.findByIdAndUpdate(id, data, options).lean() : collections.notes.findByIdAndUpdate(id, data, options)),
  findByIdAndDelete: (id) => (isMongoConnected ? MongooseNoteModel.findByIdAndDelete(id).lean() : collections.notes.findByIdAndDelete(id)),
  countDocuments: (query) => (isMongoConnected ? MongooseNoteModel.countDocuments(query) : collections.notes.countDocuments(query))
};

export default NoteModel;
