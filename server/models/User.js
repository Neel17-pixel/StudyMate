import mongoose from 'mongoose';
import { isMongoConnected, collections } from '../config/db.js';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '' },
  major: { type: String, default: 'Computer Science' },
  university: { type: String, default: 'University of Technology' },
  dailyStudyTargetMinutes: { type: Number, default: 180 },
  geminiApiKey: { type: String, default: '' },
  theme: { type: String, default: 'dark' },
}, { timestamps: true });

const MongooseUserModel = mongoose.models.User || mongoose.model('User', UserSchema);

export const UserModel = {
  find: (query) => (isMongoConnected ? MongooseUserModel.find(query).lean() : collections.users.find(query)),
  findOne: (query) => (isMongoConnected ? MongooseUserModel.findOne(query).lean() : collections.users.findOne(query)),
  findById: (id) => (isMongoConnected ? MongooseUserModel.findById(id).lean() : collections.users.findById(id)),
  create: (data) => (isMongoConnected ? MongooseUserModel.create(data) : collections.users.create(data)),
  findByIdAndUpdate: (id, data, options) => (isMongoConnected ? MongooseUserModel.findByIdAndUpdate(id, data, options).lean() : collections.users.findByIdAndUpdate(id, data, options)),
  findByIdAndDelete: (id) => (isMongoConnected ? MongooseUserModel.findByIdAndDelete(id).lean() : collections.users.findByIdAndDelete(id)),
  countDocuments: (query) => (isMongoConnected ? MongooseUserModel.countDocuments(query) : collections.users.countDocuments(query))
};

export default UserModel;
