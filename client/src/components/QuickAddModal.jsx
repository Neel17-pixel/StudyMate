import React, { useState } from 'react';
import { X, CheckSquare, FileText } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export const QuickAddModal = ({ isOpen, onClose, subjects = [], onCreated }) => {
  const [tab, setTab] = useState('task'); // 'task' | 'note'
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      if (tab === 'task') {
        await api.createTask({
          title: title.trim(),
          description: content.trim(),
          subjectId,
          priority,
          dueDate,
          type: 'Assignment'
        });
        addToast('Task added successfully!', 'success');
      } else {
        await api.createNote({
          title: title.trim(),
          content: content.trim(),
          subjectId
        });
        addToast('Study note saved!', 'success');
      }

      setTitle('');
      setContent('');
      if (onCreated) onCreated();
      onClose();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Tab switch header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', gap: 6, background: 'rgba(255, 255, 255, 0.05)', padding: 4, borderRadius: 'var(--radius-md)' }}>
            <button
              type="button"
              onClick={() => setTab('task')}
              className="btn btn-sm"
              style={{
                background: tab === 'task' ? 'var(--accent-primary)' : 'transparent',
                color: tab === 'task' ? '#ffffff' : 'var(--text-secondary)',
                gap: 6
              }}
            >
              <CheckSquare size={14} />
              <span>Quick Task</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('note')}
              className="btn btn-sm"
              style={{
                background: tab === 'note' ? 'var(--accent-cyan)' : 'transparent',
                color: tab === 'note' ? '#ffffff' : 'var(--text-secondary)',
                gap: 6
              }}
            >
              <FileText size={14} />
              <span>Quick Note</span>
            </button>
          </div>

          <button onClick={onClose} className="btn btn-ghost" style={{ padding: 6, borderRadius: '50%' }}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              {tab === 'task' ? 'Task Title *' : 'Note Title *'}
            </label>
            <input
              type="text"
              className="input-field"
              placeholder={tab === 'task' ? 'What do you need to study or submit?' : 'Topic or lecture title...'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Course
              </label>
              <select
                className="input-field"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
              >
                <option value="">General (No Course)</option>
                {subjects.map((s) => (
                  <option key={s._id || s.id} value={s._id || s.id}>
                    {s.code}: {s.name}
                  </option>
                ))}
              </select>
            </div>

            {tab === 'task' ? (
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Priority
                </label>
                <select
                  className="input-field"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="urgent">🔥 Urgent</option>
                  <option value="high">⚡ High</option>
                  <option value="medium">📌 Medium</option>
                  <option value="low">🌱 Low</option>
                </select>
              </div>
            ) : null}
          </div>

          {tab === 'task' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Due Date
              </label>
              <input
                type="date"
                className="input-field"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              {tab === 'task' ? 'Notes / Description (Optional)' : 'Note Content / Ideas'}
            </label>
            <textarea
              className="input-field"
              rows={3}
              placeholder={tab === 'task' ? 'Add context or links...' : 'Jot down formula, lecture bullet points, or concepts...'}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : tab === 'task' ? 'Add Task' : 'Save Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
