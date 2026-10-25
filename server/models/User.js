import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const UserSchema = new mongoose.Schema({
  _id: { type: String, default: () => uuidv4() },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '' },
  major: { type: String, default: 'Computer Science', trim: true },
  university: { type: String, default: 'University Student', trim: true },
  dailyStudyTargetMinutes: { type: Number, default: 180, min: 10, max: 1440 },
  theme: { type: String, default: 'dark', enum: ['dark', 'light'] },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

UserSchema.virtual('id').get(function() {
  return this._id;
});

export const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
export default UserModel;
