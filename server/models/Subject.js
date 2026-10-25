import mongoose from 'mongoose';
import { isMongoConnected, collections } from '../config/db.js';

const SubjectSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  code: { type: String, required: true },
  color: { type: String, default: '#6366f1' },
  instructor: { type: String, default: '' },
  credits: { type: Number, default: 3 },
  targetGrade: { type: String, default: 'A' },
  schedule: { type: String, default: '' },
}, { timestamps: true });

const MongooseSubjectModel = mongoose.models.Subject || mongoose.model('Subject', SubjectSchema);

export const SubjectModel = {
  find: (query) => (isMongoConnected ? MongooseSubjectModel.find(query).lean() : collections.subjects.find(query)),
  findOne: (query) => (isMongoConnected ? MongooseSubjectModel.findOne(query).lean() : collections.subjects.findOne(query)),
  findById: (id) => (isMongoConnected ? MongooseSubjectModel.findById(id).lean() : collections.subjects.findById(id)),
  create: (data) => (isMongoConnected ? MongooseSubjectModel.create(data) : collections.subjects.create(data)),
  findByIdAndUpdate: (id, data, options) => (isMongoConnected ? MongooseSubjectModel.findByIdAndUpdate(id, data, options).lean() : collections.subjects.findByIdAndUpdate(id, data, options)),
  findByIdAndDelete: (id) => (isMongoConnected ? MongooseSubjectModel.findByIdAndDelete(id).lean() : collections.subjects.findByIdAndDelete(id)),
  countDocuments: (query) => (isMongoConnected ? MongooseSubjectModel.countDocuments(query) : collections.subjects.countDocuments(query))
};

export default SubjectModel;
