import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User.js';
import { ensureDemoUser, seedDemoUserData } from '../seed/demoData.js';

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'studymate_super_secret_jwt_key_2026_academic_productivity',
    { expiresIn: '30d' }
  );
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, major, university } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    const existing = await UserModel.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A student account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await UserModel.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      major: major || 'Computer Science',
      university: university || 'University Student',
      dailyStudyTargetMinutes: 180,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
      theme: 'dark'
    });

    const userId = user._id || user.id;

    const token = generateToken(userId);

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        major: user.major,
        university: user.university,
        dailyStudyTargetMinutes: user.dailyStudyTargetMinutes,
        avatar: user.avatar,
        theme: user.theme,
        hasGeminiKey: Boolean(user.geminiApiKey || process.env.GEMINI_API_KEY)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const user = await UserModel.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const userId = user._id || user.id;
    const token = generateToken(userId);

    res.json({
      success: true,
      token,
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        major: user.major,
        university: user.university,
        dailyStudyTargetMinutes: user.dailyStudyTargetMinutes,
        avatar: user.avatar,
        theme: user.theme,
        hasGeminiKey: Boolean(user.geminiApiKey || process.env.GEMINI_API_KEY)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const demoLogin = async (req, res, next) => {
  try {
    const demoUser = await ensureDemoUser();
    const userId = demoUser._id || demoUser.id;
    const token = generateToken(userId);

    res.json({
      success: true,
      message: 'Signed in as Demo Student (Alex Chen)!',
      token,
      user: {
        id: userId,
        name: demoUser.name,
        email: demoUser.email,
        major: demoUser.major,
        university: demoUser.university,
        dailyStudyTargetMinutes: demoUser.dailyStudyTargetMinutes,
        avatar: demoUser.avatar,
        theme: demoUser.theme,
        hasGeminiKey: Boolean(demoUser.geminiApiKey || process.env.GEMINI_API_KEY)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({
      success: true,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        major: user.major,
        university: user.university,
        dailyStudyTargetMinutes: user.dailyStudyTargetMinutes,
        avatar: user.avatar,
        theme: user.theme,
        hasGeminiKey: Boolean(user.geminiApiKey || process.env.GEMINI_API_KEY)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, major, university, dailyStudyTargetMinutes, geminiApiKey, theme } = req.body;
    const updateData = {};

    if (name) updateData.name = name.trim();
    if (major) updateData.major = major.trim();
    if (university) updateData.university = university.trim();
    if (dailyStudyTargetMinutes) updateData.dailyStudyTargetMinutes = Number(dailyStudyTargetMinutes);
    if (geminiApiKey !== undefined) updateData.geminiApiKey = geminiApiKey.trim();
    if (theme) updateData.theme = theme;

    const updated = await UserModel.findByIdAndUpdate(req.user.id, updateData, { new: true });

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        id: updated._id || updated.id,
        name: updated.name,
        email: updated.email,
        major: updated.major,
        university: updated.university,
        dailyStudyTargetMinutes: updated.dailyStudyTargetMinutes,
        avatar: updated.avatar,
        theme: updated.theme,
        hasGeminiKey: Boolean(updated.geminiApiKey || process.env.GEMINI_API_KEY)
      }
    });
  } catch (error) {
    next(error);
  }
};
