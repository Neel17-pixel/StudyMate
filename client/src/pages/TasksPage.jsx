import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  LayoutGrid, 
  List, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Play, 
  Pin, 
  MoreVertical, 
  Trash2, 
  Edit3,
  Calendar,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { useTimer } from '../context/TimerContext';
import { useToast } from '../context/ToastContext';

export const TasksPage = ({ subjects = [], onOpenTaskModal, setActiveTab }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list'
  const [subjectFilter, setSubjectFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { linkTaskToTimer } = useTimer();
  const { addToast } = useToast();

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = {};
      if (subjectFilter) params.subjectId = subjectFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (statusFilter) params.status = statusFilter;
      if (searchQuery) params.search = searchQuery;

      const res = await api.getTasks(params);
      if (res.success) {
        setTasks(res.data);
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [subjectFilter, priorityFilter, statusFilter, searchQuery]);

  const handleToggleTask = async (id) => {
    try {
      await api.toggleTask(id);
      addToast('Task status updated!', 'success');
      fetchTasks();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.updateTask(id, { status: newStatus });
      addToast(`Moved to ${newStatus.replace('_', ' ')}`, 'success');
      fetchTasks();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.deleteTask(id);
      addToast('Task deleted.', 'info');
      fetchTasks();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleStartTimer = (task) => {
    linkTaskToTimer(task);
    setActiveTab('pomodoro');
  };

  const renderPriorityBadge = (priority) => {
    switch (priority) {
      case 'urgent': return <span className="badge badge-urgent">🔥 Urgent</span>;
      case 'high': return <span className="badge badge-high">⚡ High</span>;
      case 'medium': return <span className="badge badge-medium">📌 Med</span>;
      case 'low': return <span className="badge badge-low">🌱 Low</span>;
      default: return null;
    }
  };

  const renderTaskCard = (task) => {
    const isCompleted = task.status === 'completed';
    const daysLeft = Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    const isOverdue = daysLeft < 0 && !isCompleted;
    const isDueSoon = daysLeft >= 0 && daysLeft <= 1 && !isCompleted;

    return (
      <div
        key={task._id || task.id}
        className="glass-card-interactive"
        style={{
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          borderLeft: `4px solid ${task.subjectColor || '#6366f1'}`,
          opacity: isCompleted ? 0.75 : 1
        }}
      >
        {/* Top Badges & Pinned */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: 4,
                background: `${task.subjectColor || '#6366f1'}22`,
                color: task.subjectColor || '#6366f1',
                border: `1px solid ${task.subjectColor || '#6366f1'}44`
              }}
            >
              {task.subjectCode}
            </span>
            {renderPriorityBadge(task.priority)}
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{task.type}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {task.isPinned && <Pin size={14} color="#f59e0b" fill="#f59e0b" />}
            <button
              onClick={() => onOpenTaskModal(task)}
              className="btn btn-ghost"
              style={{ padding: 4 }}
              title="Edit Task"
            >
              <Edit3 size={14} />
            </button>
            <button
              onClick={() => handleDeleteTask(task._id || task.id)}
              className="btn btn-ghost"
              style={{ padding: 4, color: '#f43f5e' }}
              title="Delete Task"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Task Title & Description */}
        <div>
          <h4
            style={{
              fontSize: '0.98rem',
              fontWeight: 700,
              color: isCompleted ? 'var(--text-muted)' : 'var(--text-main)',
              textDecoration: isCompleted ? 'line-through' : 'none',
              marginBottom: 4
            }}
          >
            {task.title}
          </h4>
          {task.description && (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {task.description}
            </p>
          )}
        </div>

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {task.tags.map((tg, i) => (
              <span key={i} style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: 4, background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)' }}>
                #{tg}
              </span>
            ))}
          </div>
        )}

        {/* Bottom Metadata & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid var(--border-subtle)', fontSize: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: isOverdue ? '#f43f5e' : isDueSoon ? '#fbbf24' : 'var(--text-muted)' }}>
            <Calendar size={13} />
            <span>
              {isOverdue ? `Overdue (${Math.abs(daysLeft)}d)` : isDueSoon ? 'Due Soon!' : new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
              <Clock size={12} />
              {task.actualMinutes > 0 ? `${task.actualMinutes}/${task.estimatedMinutes}m` : `${task.estimatedMinutes}m`}
            </span>

            {!isCompleted && (
              <button
                onClick={() => handleStartTimer(task)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '4px 8px', fontSize: '0.72rem', gap: 4 }}
                title="Start Pomodoro"
              >
                <Play size={11} fill="currentColor" />
                <span>Focus</span>
              </button>
            )}

            <button
              onClick={() => handleToggleTask(task._id || task.id)}
              className={isCompleted ? "btn btn-ghost btn-sm" : "btn btn-primary btn-sm"}
              style={{ padding: '4px 8px', fontSize: '0.72rem' }}
            >
              {isCompleted ? 'Mark Pending' : 'Done ✓'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const columns = [
    { id: 'pending', title: 'Pending', icon: '⏳', color: '#6366f1' },
    { id: 'in_progress', title: 'In Progress', icon: '🚀', color: '#06b6d4' },
    { id: 'completed', title: 'Completed', icon: '✅', color: '#10b981' }
  ];

  return (
    <div className="page-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Academic Tasks & Deadlines</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Track assignments, problem sets, exam prep, and research milestones.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* View switcher */}
          <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.05)', borderRadius: 'var(--radius-md)', padding: 3 }}>
            <button
              onClick={() => setViewMode('kanban')}
              className="btn btn-sm"
              style={{
                background: viewMode === 'kanban' ? 'var(--accent-primary)' : 'transparent',
                color: viewMode === 'kanban' ? '#ffffff' : 'var(--text-secondary)',
                padding: '6px 12px'
              }}
            >
              <LayoutGrid size={15} />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className="btn btn-sm"
              style={{
                background: viewMode === 'list' ? 'var(--accent-primary)' : 'transparent',
                color: viewMode === 'list' ? '#ffffff' : 'var(--text-secondary)',
                padding: '6px 12px'
              }}
            >
              <List size={15} />
              <span>List</span>
            </button>
          </div>

          <button
            onClick={() => onOpenTaskModal()}
            className="btn btn-primary"
            style={{ gap: 8 }}
          >
            <Plus size={18} />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '14px 18px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 260 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search tasks by title, tag, or keyword..."
              className="input-field"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: 36, height: 40, fontSize: '0.88rem' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <select
            className="input-field"
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            style={{ height: 40, width: 'auto', minWidth: 150, fontSize: '0.85rem' }}
          >
            <option value="">All Courses</option>
            {subjects.map((s) => (
              <option key={s._id || s.id} value={s._id || s.id}>
                {s.code}: {s.name}
              </option>
            ))}
          </select>

          <select
            className="input-field"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{ height: 40, width: 'auto', fontSize: '0.85rem' }}
          >
            <option value="">All Priorities</option>
            <option value="urgent">🔥 Urgent</option>
            <option value="high">⚡ High</option>
            <option value="medium">📌 Medium</option>
            <option value="low">🌱 Low</option>
          </select>

          {viewMode === 'list' && (
            <select
              className="input-field"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ height: 40, width: 'auto', fontSize: '0.85rem' }}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          )}
        </div>
      </div>

      {/* Main Task View */}
      {viewMode === 'kanban' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, alignItems: 'start' }}>
          {columns.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.id);

            return (
              <div
                key={col.id}
                className="glass-panel"
                style={{
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  minHeight: 480,
                  background: 'rgba(15, 20, 34, 0.65)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>{col.icon}</span>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{col.title}</h3>
                  </div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 12,
                      background: 'rgba(255, 255, 255, 0.08)',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    {colTasks.length}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, overflowY: 'auto' }}>
                  {colTasks.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      No tasks in this column
                    </div>
                  ) : (
                    colTasks.map(renderTaskCard)
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="glass-panel" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {tasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 10px', color: 'var(--text-muted)' }}>
              No tasks found matching your filter criteria.
            </div>
          ) : (
            tasks.map(renderTaskCard)
          )}
        </div>
      )}
    </div>
  );
};
