import { ChatMessageModel } from '../models/ChatMessage.js';
import { SubjectModel } from '../models/Subject.js';
import { UserModel } from '../models/User.js';
import { generateAIResponse } from '../services/geminiService.js';

export const chat = async (req, res, next) => {
  try {
    const { prompt, mode = 'general', subjectId = '' } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide a message prompt.' });
    }

    const userId = req.user.id;
    const user = await UserModel.findById(userId);

    // Save user's message
    const userMessage = await ChatMessageModel.create({
      userId,
      role: 'user',
      content: prompt.trim(),
      mode,
      subjectId: subjectId || '',
      timestamp: new Date().toISOString()
    });

    // Resolve subject name/code for context
    let subjectContext = '';
    if (subjectId) {
      const sub = await SubjectModel.findById(subjectId);
      if (sub) {
        subjectContext = `${sub.code}: ${sub.name}`;
      }
    }

    // Call AI Tutor Engine
    const aiResult = await generateAIResponse({
      prompt: prompt.trim(),
      mode,
      subjectContext
    });

    // Save assistant's response
    const assistantMessage = await ChatMessageModel.create({
      userId,
      role: 'assistant',
      content: aiResult.text,
      mode,
      subjectId: subjectId || '',
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      userMessage,
      assistantMessage,
      meta: {
        modelUsed: aiResult.modelUsed,
        source: aiResult.source
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getChatHistory = async (req, res, next) => {
  try {
    const userId = String(req.user.id || req.user._id);
    const messages = await ChatMessageModel.find({ userId }).lean();
    messages.sort((a, b) => new Date(a.timestamp || a.createdAt).getTime() - new Date(b.timestamp || b.createdAt).getTime());

    res.json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    next(error);
  }
};

export const clearChatHistory = async (req, res, next) => {
  try {
    const userId = String(req.user.id || req.user._id);
    await ChatMessageModel.deleteMany({ userId });

    res.json({ success: true, message: 'Chat history cleared.', data: [] });
  } catch (error) {
    next(error);
  }
};
