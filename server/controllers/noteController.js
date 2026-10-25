import { NoteModel } from '../models/Note.js';
import { SubjectModel } from '../models/Subject.js';
import { generateAIResponse } from '../services/geminiService.js';

export const getNotes = async (req, res, next) => {
  try {
    const { subjectId, search } = req.query;
    let notes = await NoteModel.find({ userId: req.user.id });

    if (subjectId) {
      notes = notes.filter(n => n.subjectId === subjectId);
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      notes = notes.filter(n => 
        (n.title && n.title.toLowerCase().includes(q)) ||
        (n.content && n.content.toLowerCase().includes(q)) ||
        (n.tags && n.tags.some(tag => tag.toLowerCase().includes(q)))
      );
    }

    const subjects = await SubjectModel.find({ userId: req.user.id });
    const subMap = new Map();
    subjects.forEach(s => subMap.set(s._id || s.id, s));

    const enriched = notes.map(n => {
      const sub = subMap.get(n.subjectId);
      return {
        ...n,
        subjectName: sub ? sub.name : 'General Notes',
        subjectCode: sub ? sub.code : 'NOTE',
        subjectColor: sub ? sub.color : '#6366f1'
      };
    });

    enriched.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return b.isPinned ? 1 : -1;
      return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
    });

    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (error) {
    next(error);
  }
};

export const createNote = async (req, res, next) => {
  try {
    const { title, content, subjectId, tags, isPinned } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Please provide a note title.' });
    }

    const note = await NoteModel.create({
      userId: req.user.id,
      title: title.trim(),
      content: content || '',
      subjectId: subjectId || '',
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []),
      isPinned: Boolean(isPinned),
      aiSummary: ''
    });

    res.status(201).json({ success: true, data: note });
  } catch (error) {
    next(error);
  }
};

export const updateNote = async (req, res, next) => {
  try {
    const note = await NoteModel.findById(req.params.id);
    if (!note || note.userId !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Note not found or unauthorized.' });
    }

    const updated = await NoteModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const summarizeNote = async (req, res, next) => {
  try {
    const note = await NoteModel.findById(req.params.id);
    if (!note || note.userId !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Note not found or unauthorized.' });
    }

    if (!note.content || note.content.trim().length < 15) {
      return res.status(400).json({ success: false, message: 'Note content is too short to generate a summary.' });
    }

    const subject = note.subjectId ? await SubjectModel.findById(note.subjectId) : null;
    const subjectContext = subject ? `${subject.code}: ${subject.name}` : '';

    const aiResult = await generateAIResponse({
      prompt: `Please generate a concise 2-sentence high-yield summary of these study notes titled "${note.title}":\n\n${note.content}`,
      mode: 'summary',
      subjectContext,
      userApiKey: req.user.geminiApiKey
    });

    const cleanSummary = aiResult.text.replace(/^#+.*$/gm, '').trim();

    const updated = await NoteModel.findByIdAndUpdate(
      req.params.id,
      { aiSummary: cleanSummary },
      { new: true }
    );

    res.json({
      success: true,
      message: 'AI summary generated successfully!',
      aiSummary: cleanSummary,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNote = async (req, res, next) => {
  try {
    const note = await NoteModel.findById(req.params.id);
    if (!note || note.userId !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Note not found or unauthorized.' });
    }

    await NoteModel.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Note deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
