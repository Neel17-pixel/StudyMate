import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. Please log in.'
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'studymate_super_secret_jwt_key_2026_academic_productivity'
    );

    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.'
      });
    }

    // Attach user to request
    req.user = {
      _id: user._id || user.id,
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      major: user.major,
      university: user.university,
      dailyStudyTargetMinutes: user.dailyStudyTargetMinutes || 180,
      geminiApiKey: user.geminiApiKey || '',
      theme: user.theme || 'dark'
    };

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Token verification failed or token has expired.'
    });
  }
};
