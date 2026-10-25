import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

const PALETTE = [
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#3b82f6', // Blue
  '#14b8a6', // Teal
];

export const SubjectModal = ({ isOpen, onClose, onSave, subject = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    color: '#6366f1',
    instructor: '',
    credits: 3,
    targetGrade: 'A',
    schedule: ''
  });

  useEffect(() => {
    if (subject) {
      setFormData({
        name: subject.name || '',
        code: subject.code || '',
        color: subject.color || '#6366f1',
        instructor: subject.instructor || '',
        credits: subject.credits || 3,
        targetGrade: subject.targetGrade || 'A',
        schedule: subject.schedule || ''
      });
    } else {
      setFormData({
        name: '',
        code: '',
        color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        instructor: '',
        credits: 3,
        targetGrade: 'A',
        schedule: ''
      });
    }
  }, [subject, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) return;
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{subject ? 'Edit Course / Subject' : 'Add New Academic Course'}</h3>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: 6, borderRadius: '50%' }}>
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Course Code *
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. CS201"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                required
                autoFocus
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Course Title *
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Data Structures & Algorithms"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
              Course Accent Color
            </label>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: c })}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: c,
                    border: formData.color === c ? '2.5px solid #ffffff' : '1px solid rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: formData.color === c ? `0 0 14px ${c}` : 'none',
                    transition: 'transform var(--transition-fast)'
                  }}
                >
                  {formData.color === c && <Check size={16} color="#ffffff" />}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Instructor / Professor
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Dr. Sarah Mitchell"
                value={formData.instructor}
                onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Weekly Lecture Schedule
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Mon, Wed 10:00 - 11:30 AM"
                value={formData.schedule}
                onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Credits
              </label>
              <input
                type="number"
                min="1"
                max="10"
                className="input-field"
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Target Grade Goal
              </label>
              <select
                className="input-field"
                value={formData.targetGrade}
                onChange={(e) => setFormData({ ...formData, targetGrade: e.target.value })}
              >
                <option value="A+">A+ (Exceptional)</option>
                <option value="A">A (Excellent)</option>
                <option value="A-">A- (Very Good)</option>
                <option value="B+">B+</option>
                <option value="B">B</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {subject ? 'Update Course' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
