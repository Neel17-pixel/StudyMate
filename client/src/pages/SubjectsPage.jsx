import React from 'react';
import { 
  Plus, 
  BookOpen, 
  GraduationCap, 
  User, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Edit3, 
  Trash2,
  Award
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export const SubjectsPage = ({ subjects = [], onOpenSubjectModal, onSubjectUpdated, setActiveTab }) => {
  const { addToast } = useToast();

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove ${name}?`)) return;

    try {
      await api.deleteSubject(id);
      addToast(`Course ${name} deleted.`, 'info');
      if (onSubjectUpdated) onSubjectUpdated();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const totalCredits = subjects.reduce((sum, s) => sum + (s.credits || 0), 0);

  return (
    <div className="page-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Course Portfolio</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Manage current courses, syllabi, professors, target grades, and workload.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ padding: '8px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.05)', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Enrolled: </span>
            <strong style={{ color: 'var(--text-main)' }}>{subjects.length} Courses</strong>
            <span style={{ margin: '0 6px', color: 'var(--text-muted)' }}>•</span>
            <strong style={{ color: 'var(--accent-cyan)' }}>{totalCredits} Credits</strong>
          </div>

          <button
            onClick={() => onOpenSubjectModal()}
            className="btn btn-primary"
            style={{ gap: 8 }}
          >
            <Plus size={18} />
            <span>Add Course</span>
          </button>
        </div>
      </div>

      {/* Course Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {subjects.map((sub) => {
          const subColor = sub.color || '#6366f1';

          return (
            <div
              key={sub._id || sub.id}
              className="glass-panel"
              style={{
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                position: 'relative',
                borderTop: `4px solid ${subColor}`
              }}
            >
              {/* Header */}
              <div style={{ padding: '20px 20px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: 6,
                        background: `${subColor}22`,
                        color: subColor,
                        border: `1px solid ${subColor}44`
                      }}
                    >
                      {sub.code}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {sub.credits} Credits
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
                    {sub.name}
                  </h3>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <button
                    onClick={() => onOpenSubjectModal(sub)}
                    className="btn btn-ghost"
                    style={{ padding: 6 }}
                    title="Edit Course"
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(sub._id || sub.id, sub.name)}
                    className="btn btn-ghost"
                    style={{ padding: 6, color: '#f43f5e' }}
                    title="Delete Course"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Course Info Details */}
              <div style={{ padding: '0 20px 16px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <User size={15} color="var(--text-muted)" />
                  <span>{sub.instructor || 'Instructor Not Listed'}</span>
                </div>

                {sub.schedule && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <Calendar size={15} color="var(--text-muted)" />
                    <span>{sub.schedule}</span>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <Award size={15} color="#f59e0b" />
                  <span>Target Grade Goal: <strong style={{ color: '#f59e0b' }}>{sub.targetGrade || 'A'}</strong></span>
                </div>
              </div>

              {/* Workload & Study Statistics Footer */}
              <div
                style={{
                  padding: '14px 20px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.8rem'
                }}
              >
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Tasks: </span>
                  <strong style={{ color: 'var(--text-main)' }}>{sub.pendingTasks || 0} active</strong>
                  <span style={{ color: 'var(--text-muted)' }}> / {sub.totalTasks || 0} total</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent-cyan)' }}>
                  <Clock size={13} />
                  <strong>{sub.totalStudyMinutes || 0} mins logged</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
