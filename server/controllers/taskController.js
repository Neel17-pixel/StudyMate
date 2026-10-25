import { TaskModel } from '../models/Task.js';
import { SubjectModel } from '../models/Subject.js';

export const getTasks = async (req, res, next) => {
  try {
    const { subjectId, status, priority, search } = req.query;
    let tasks = await TaskModel.find({ userId: req.user.id }).lean();

    if (subjectId) {
      tasks = tasks.filter(t => String(t.subjectId) === String(subjectId));
    }

    if (status && status !== 'all') {
      tasks = tasks.filter(t => t.status === status);
    }

    if (priority && priority !== 'all') {
      tasks = tasks.filter(t => t.priority === priority);
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      tasks = tasks.filter(t => 
        (t.title && t.title.toLowerCase().includes(q)) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.tags && t.tags.some(tag => tag.toLowerCase().includes(q)))
      );
    }

    // Attach subject color and code if available
    const subjects = await SubjectModel.find({ userId: req.user.id }).lean();
    const subMap = new Map();
    subjects.forEach(s => subMap.set(String(s._id || s.id), s));

    const enriched = tasks.map(t => {
      const sub = subMap.get(String(t.subjectId));
      const taskId = String(t._id || t.id);
      return {
        ...t,
        id: taskId,
        _id: taskId,
        subjectName: sub ? sub.name : 'General',
        subjectCode: sub ? sub.code : 'GEN',
        subjectColor: sub ? sub.color : '#6366f1'
      };
    });

    // Sort: pinned first, then by due date
    enriched.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return b.isPinned ? 1 : -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const {
      title,
      description,
      subjectId,
      type,
      priority,
      status,
      dueDate,
      estimatedMinutes,
      tags,
      isPinned
    } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Please provide a task title.' });
    }

    const task = await TaskModel.create({
      userId: req.user.id,
      title: title.trim(),
      description: description || '',
      subjectId: subjectId || '',
      type: type || 'Assignment',
      priority: priority || 'medium',
      status: status || 'pending',
      dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      estimatedMinutes: Number(estimatedMinutes) || 60,
      actualMinutes: 0,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []),
      isPinned: Boolean(isPinned)
    });

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const task = await TaskModel.findById(req.params.id);
    if (!task || task.userId !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Task not found or unauthorized.' });
    }

    const updateData = { ...req.body };
    if (updateData.status === 'completed' && task.status !== 'completed') {
      updateData.completedAt = new Date().toISOString();
    } else if (updateData.status && updateData.status !== 'completed') {
      updateData.completedAt = null;
    }

    const updated = await TaskModel.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const toggleTaskStatus = async (req, res, next) => {
  try {
    const task = await TaskModel.findById(req.params.id);
    if (!task || task.userId !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Task not found or unauthorized.' });
    }

    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    const completedAt = newStatus === 'completed' ? new Date().toISOString() : null;

    const updated = await TaskModel.findByIdAndUpdate(
      req.params.id,
      { status: newStatus, completedAt },
      { new: true }
    );

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const task = await TaskModel.findById(req.params.id);
    if (!task || task.userId !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Task not found or unauthorized.' });
    }

    await TaskModel.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Task deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
