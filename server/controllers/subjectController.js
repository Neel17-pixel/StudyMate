import { SubjectModel } from '../models/Subject.js';
import { TaskModel } from '../models/Task.js';
import { StudySessionModel } from '../models/StudySession.js';

export const getSubjects = async (req, res, next) => {
  try {
    const subjects = await SubjectModel.find({ userId: req.user.id }).lean();
    const tasks = await TaskModel.find({ userId: req.user.id }).lean();
    const sessions = await StudySessionModel.find({ userId: req.user.id }).lean();

    // Enrich subjects with task counts and logged study minutes
    const enriched = subjects.map(sub => {
      const subId = String(sub._id || sub.id);
      const subTasks = tasks.filter(t => String(t.subjectId) === subId);
      const pendingTasks = subTasks.filter(t => t.status !== 'completed').length;
      const completedTasks = subTasks.filter(t => t.status === 'completed').length;
      
      const subSessions = sessions.filter(s => String(s.subjectId) === subId);
      const totalMinutes = subSessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);

      return {
        ...sub,
        id: subId,
        _id: subId,
        pendingTasks,
        completedTasks,
        totalTasks: subTasks.length,
        totalStudyMinutes: totalMinutes
      };
    });

    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (error) {
    next(error);
  }
};

export const createSubject = async (req, res, next) => {
  try {
    const { name, code, color, instructor, credits, targetGrade, schedule } = req.body;

    if (!name || !code) {
      return res.status(400).json({ success: false, message: 'Please provide course name and code.' });
    }

    const subject = await SubjectModel.create({
      userId: req.user.id,
      name: name.trim(),
      code: code.trim().toUpperCase(),
      color: color || '#6366f1',
      instructor: instructor || '',
      credits: Number(credits) || 3,
      targetGrade: targetGrade || 'A',
      schedule: schedule || ''
    });

    res.status(201).json({ success: true, data: subject });
  } catch (error) {
    next(error);
  }
};

export const updateSubject = async (req, res, next) => {
  try {
    const subject = await SubjectModel.findById(req.params.id);
    if (!subject || subject.userId !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Subject not found or unauthorized.' });
    }

    const updated = await SubjectModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteSubject = async (req, res, next) => {
  try {
    const subject = await SubjectModel.findById(req.params.id);
    if (!subject || subject.userId !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Subject not found or unauthorized.' });
    }

    await SubjectModel.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Subject deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
