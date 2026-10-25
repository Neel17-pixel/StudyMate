import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Tag, Flag, BookOpen } from 'lucide-react';

export const TaskModal = ({ isOpen, onClose, onSave, task = null, subjects = [] }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subjectId: '',
    type: 'Assignment',
    priority: 'medium',
    status: 'pending',
    dueDate: '',
    estimatedMinutes: 60,
    tags: '',
    isPinned: false
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        subjectId: task.subjectId || '',
        type: task.type || 'Assignment',
        priority: task.priority || 'medium',
        status: task.status || 'pending',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        estimatedMinutes: task.estimatedMinutes || 60,
        tags: Array.isArray(task.tags) ? task.tags.join(', ') : '',
        isPinned: Boolean(task.isPinned)
      });
    } else {
      const defaultDue = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      setFormData({
        title: '',
        description: '',
        subjectId: subjects.length > 0 ? (subjects[0]._id || subjects[0].id) : '',
        type: 'Assignment',
        priority: 'medium',
        status: 'pending',
        dueDate: defaultDue,
        estimatedMinutes: 60,
        tags: '',
        isPinned: false
      });
    }
  }, [task, subjects, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    onSave({
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{task ? 'Edit Assignment / Task' : 'Add New Academic Task'}</h3>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: 6, borderRadius: '50%' }}>
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Task Title *
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Implement Red-Black Tree Balancing or Chapter 4 Calculus Problems"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              autoFocus
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Course / Subject
              </label>
              <select
                className="input-field"
                value={formData.subjectId}
                onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
              >
                <option value="">General (No Course)</option>
                {subjects.map((s) => (
                  <option key={s._id || s.id} value={s._id || s.id}>
                    {s.code}: {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Task Type
              </label>
              <select
                className="input-field"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="Assignment">Assignment</option>
                <option value="Exam Prep">Exam Prep</option>
                <option value="Project">Project</option>
                <option value="Reading">Reading</option>
                <option value="Lab Report">Lab Report</option>
                <option value="Quiz">Quiz</option>
                <option value="General">General</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Priority Level
              </label>
              <select
                className="input-field"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="urgent">🔥 Urgent (Due Very Soon)</option>
                <option value="high">⚡ High Priority</option>
                <option value="medium">📌 Medium Priority</option>
                <option value="low">🌱 Low Priority</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Due Date
              </label>
              <input
                type="date"
                className="input-field"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Estimated Focus Time (mins)
              </label>
              <input
                type="number"
                min="5"
                step="5"
                className="input-field"
                value={formData.estimatedMinutes}
                onChange={(e) => setFormData({ ...formData, estimatedMinutes: Number(e.target.value) })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Status
              </label>
              <select
                className="input-field"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Tags (comma separated)
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. midterm, algorithms, chapter4"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Description & Requirements
            </label>
            <textarea
              className="input-field"
              rows={3}
              placeholder="Add key rubric requirements, submission links, or study notes..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <input
              type="checkbox"
              id="isPinned"
              checked={formData.isPinned}
              onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
              style={{ width: 16, height: 16, accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
            />
            <label htmlFor="isPinned" style={{ fontSize: '0.88rem', color: 'var(--text-main)', cursor: 'pointer' }}>
              Pin this task to top of Dashboard
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {task ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
