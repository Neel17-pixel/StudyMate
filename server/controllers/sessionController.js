import { StudySessionModel } from '../models/StudySession.js';
import { TaskModel } from '../models/Task.js';
import { SubjectModel } from '../models/Subject.js';

export const getSessions = async (req, res, next) => {
  try {
    const sessions = await StudySessionModel.find({ userId: req.user.id }).lean();
    const subjects = await SubjectModel.find({ userId: req.user.id }).lean();
    const subMap = new Map();
    subjects.forEach(s => subMap.set(String(s._id || s.id), s));

    const enriched = sessions.map(s => {
      const sub = subMap.get(String(s.subjectId));
      const sessionId = String(s._id || s.id);
      return {
        ...s,
        id: sessionId,
        _id: sessionId,
        subjectName: sub ? sub.name : 'Independent Focus',
        subjectCode: sub ? sub.code : 'FOCUS',
        subjectColor: sub ? sub.color : '#6366f1'
      };
    });

    enriched.sort((a, b) => new Date(b.completedAt || b.createdAt).getTime() - new Date(a.completedAt || a.createdAt).getTime());

    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (error) {
    next(error);
  }
};

export const createSession = async (req, res, next) => {
  try {
    const { subjectId, taskId, durationMinutes, sessionType, productivityRating, notes } = req.body;

    if (!durationMinutes || Number(durationMinutes) <= 0) {
      return res.status(400).json({ success: false, message: 'Please specify session duration in minutes.' });
    }

    const session = await StudySessionModel.create({
      userId: req.user.id,
      subjectId: subjectId || '',
      taskId: taskId || '',
      durationMinutes: Number(durationMinutes),
      sessionType: sessionType || 'pomodoro',
      productivityRating: Number(productivityRating) || 4,
      notes: notes || '',
      completedAt: new Date().toISOString()
    });

    // If linked to a task, increment the task's actual minutes
    if (taskId) {
      const task = await TaskModel.findById(taskId);
      if (task && task.userId === req.user.id) {
        const updatedMinutes = (task.actualMinutes || 0) + Number(durationMinutes);
        await TaskModel.findByIdAndUpdate(taskId, { actualMinutes: updatedMinutes });
      }
    }

    res.status(201).json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
};

export const deleteSession = async (req, res, next) => {
  try {
    const session = await StudySessionModel.findById(req.params.id);
    if (!session || session.userId !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Session not found or unauthorized.' });
    }

    await StudySessionModel.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Study session removed.' });
  } catch (error) {
    next(error);
  }
};
