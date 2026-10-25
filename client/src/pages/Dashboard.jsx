import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  Plus, 
  Sparkles, 
  BookOpen, 
  Calendar,
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTimer } from '../context/TimerContext';
import { useToast } from '../context/ToastContext';

export const Dashboard = ({ setActiveTab, onOpenTaskModal, onOpenSubjectModal }) => {
  const { user } = useAuth();
  const { linkTaskToTimer } = useTimer();
  const { addToast } = useToast();

  const [stats, setStats] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      const [statsRes, subsRes] = await Promise.all([
        api.getDashboardStats(),
        api.getSubjects()
      ]);
      if (statsRes.success) setStats(statsRes.stats);
      if (subsRes.success) setSubjects(subsRes.data);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    const handleSessionLogged = () => loadDashboardData();
    window.addEventListener('studymate-session-logged', handleSessionLogged);
    return () => window.removeEventListener('studymate-session-logged', handleSessionLogged);
  }, []);

  const handleToggleTask = async (taskId) => {
    try {
      await api.toggleTask(taskId);
      addToast('Task status updated!', 'success');
      loadDashboardData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleStartTaskFocus = (task) => {
    linkTaskToTimer(task);
    setActiveTab('pomodoro');
  };

  if (loading) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', border: '3px solid var(--accent-primary)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Loading your academic workspace...</p>
        </div>
      </div>
    );
  }

  const todayHours = stats ? (stats.todayMinutes / 60).toFixed(1) : '0';
  const targetHours = stats ? (stats.dailyTargetMinutes / 60).toFixed(1) : '3.0';

  return (
    <div className="page-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Welcome Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '28px 32px',
          background: 'radial-gradient(ellipse at 80% 0%, rgba(99, 102, 241, 0.22) 0%, rgba(15, 20, 34, 0.95) 75%)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20,
          border: '1px solid rgba(99, 102, 241, 0.25)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: '0.85rem', padding: '4px 10px', borderRadius: 20, background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc', fontWeight: 600 }}>
              🎓 {user?.university || 'University Campus'}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>•</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>
              {user?.major || 'Undergraduate Studies'}
            </span>
          </div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800 }}>
            Welcome back, {user?.name ? user.name.split(' ')[0] : 'Scholar'}!
          </h1>
          <p style={{ maxWidth: 620, marginTop: 4, fontSize: '0.95rem' }}>
            {stats?.aiCoachInsight || 'Stay consistent today. Review your priorities, start a focus block, and conquer your deadlines.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => setActiveTab('pomodoro')}
            className="btn btn-primary"
            style={{ gap: 8 }}
          >
            <Play size={16} fill="currentColor" />
            <span>Start Study Session</span>
          </button>
          <button
            onClick={() => setActiveTab('ai-tutor')}
            className="btn btn-secondary"
            style={{ gap: 8 }}
          >
            <Sparkles size={16} color="#38bdf8" />
            <span>AI Study Tutor</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
        {/* Card 1: Focus Time Today */}
        <div className="glass-panel" style={{ padding: 22, position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Focus Time Today</p>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 6, color: 'var(--text-main)' }}>
                {stats?.todayMinutes || 0} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-secondary)' }}>mins</span>
              </h3>
            </div>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={22} color="var(--accent-primary)" />
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 6 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Daily Goal: {targetHours}h</span>
              <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{stats?.todayGoalProgress || 0}%</span>
            </div>
            <div style={{ width: '100%', height: 6, borderRadius: 3, background: 'rgba(255, 255, 255, 0.08)', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${stats?.todayGoalProgress || 0}%`,
                  height: '100%',
                  borderRadius: 3,
                  background: 'var(--gradient-brand)',
                  transition: 'width 0.6s ease-out'
                }}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Study Streak */}
        <div className="glass-panel" style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Streak</p>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 6, color: '#f59e0b' }}>
                {stats?.streakDays || 1} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Days 🔥</span>
              </h3>
            </div>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Flame size={22} color="#f59e0b" />
            </div>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 14 }}>
            Spaced repetition habit active! Study today to maintain your fire.
          </p>
        </div>

        {/* Card 3: Completion Rate */}
        <div className="glass-panel" style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tasks Completed</p>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 6, color: 'var(--accent-emerald)' }}>
                {stats?.completedTasksCount || 0} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-secondary)' }}>/ {stats?.totalTasks || 0}</span>
              </h3>
            </div>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={22} color="#10b981" />
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <span className="badge badge-low" style={{ fontSize: '0.72rem' }}>
              {stats?.completionRate || 0}% Academic Success Rate
            </span>
          </div>
        </div>

        {/* Card 4: Urgent Deadlines */}
        <div className="glass-panel" style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Urgent Approaching</p>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 6, color: (stats?.urgentTasksCount || 0) > 0 ? '#fb7185' : 'var(--text-main)' }}>
                {stats?.urgentTasksCount || 0} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Tasks</span>
              </h3>
            </div>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(244, 63, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={22} color="#f43f5e" />
            </div>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 14 }}>
            {(stats?.urgentTasksCount || 0) > 0 ? 'Action required: prioritize high-weight assignments.' : 'All high priority assignments on track.'}
          </p>
        </div>
      </div>

      {/* Main Grid: Weekly Focus Chart & Upcoming Deadlines */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: 24 }}>
        {/* Weekly Study Activity Chart */}
        <div className="glass-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Focus Activity (Last 7 Days)</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Minutes studied per day</p>
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
              Total: {stats?.weekMinutes || 0} mins ({((stats?.weekMinutes || 0)/60).toFixed(1)}h)
            </span>
          </div>

          {/* Simple custom SVG bar chart */}
          <div style={{ flex: 1, minHeight: 180, display: 'flex', alignItems: 'flex-end', gap: 14, paddingTop: 10 }}>
            {stats?.last7Days?.map((d, idx) => {
              const maxMinutes = Math.max(...(stats.last7Days.map(x => x.minutes)), 120);
              const heightPercent = Math.max(8, Math.round((d.minutes / maxMinutes) * 100));
              const isToday = idx === stats.last7Days.length - 1;

              return (
                <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: d.minutes > 0 ? 'var(--text-main)' : 'var(--text-muted)' }}>
                    {d.minutes > 0 ? `${d.minutes}m` : '0'}
                  </span>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: 36,
                      height: `${heightPercent}%`,
                      borderRadius: '6px 6px 2px 2px',
                      background: isToday
                        ? 'linear-gradient(180deg, #06b6d4 0%, #6366f1 100%)'
                        : d.minutes > 0
                        ? 'linear-gradient(180deg, #6366f1 0%, rgba(99, 102, 241, 0.4) 100%)'
                        : 'rgba(255, 255, 255, 0.05)',
                      boxShadow: isToday ? '0 0 16px rgba(6, 182, 212, 0.4)' : 'none',
                      transition: 'height 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  />
                  <span style={{ fontSize: '0.78rem', fontWeight: isToday ? 700 : 500, color: isToday ? 'var(--accent-cyan)' : 'var(--text-secondary)' }}>
                    {d.dayName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="glass-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Upcoming Deadlines</h3>
            <button
              onClick={() => setActiveTab('tasks')}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '0.8rem', gap: 4 }}
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, overflowY: 'auto' }}>
            {(!stats?.upcomingTasks || stats.upcomingTasks.length === 0) ? (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)' }}>
                <CheckCircle2 size={36} color="var(--accent-emerald)" style={{ margin: '0 auto 10px', opacity: 0.8 }} />
                <p style={{ fontWeight: 600 }}>Zero upcoming deadlines in the next 7 days!</p>
                <p style={{ fontSize: '0.8rem' }}>Take time to review or plan ahead.</p>
              </div>
            ) : (
              stats.upcomingTasks.map((task) => {
                const daysLeft = Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                const isUrgent = daysLeft <= 1;

                return (
                  <div
                    key={task._id || task.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 14px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      transition: 'background var(--transition-fast)'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={task.status === 'completed'}
                      onChange={() => handleToggleTask(task._id || task.id)}
                      style={{ width: 17, height: 17, accentColor: 'var(--accent-emerald)', cursor: 'pointer' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: 4,
                            background: `${task.subjectColor || '#6366f1'}22`,
                            color: task.subjectColor || '#6366f1',
                            border: `1px solid ${task.subjectColor || '#6366f1'}44`
                          }}
                        >
                          {task.subjectCode}
                        </span>
                        <span
                          style={{
                            fontSize: '0.88rem',
                            fontWeight: 600,
                            color: task.status === 'completed' ? 'var(--text-muted)' : 'var(--text-main)',
                            textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {task.title}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: isUrgent ? '#fb7185' : 'var(--text-muted)', marginTop: 2 }}>
                        {daysLeft <= 0 ? '⚠️ Due today' : `Due in ${daysLeft} day${daysLeft > 1 ? 's' : ''}`}
                      </div>
                    </div>

                    <button
                      onClick={() => handleStartTaskFocus(task)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                      title="Focus on this task with Pomodoro"
                    >
                      <Play size={12} fill="currentColor" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Courses Overview Grid */}
      <div className="glass-panel" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Course Portfolio</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Registered courses this term</p>
          </div>
          <button
            onClick={onOpenSubjectModal}
            className="btn btn-secondary btn-sm"
            style={{ gap: 6 }}
          >
            <Plus size={15} />
            <span>Add Course</span>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {subjects.map((sub) => (
            <div
              key={sub._id || sub.id}
              onClick={() => setActiveTab('subjects')}
              className="glass-card-interactive"
              style={{
                padding: 18,
                borderLeft: `4px solid ${sub.color || '#6366f1'}`
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 6,
                    background: `${sub.color || '#6366f1'}22`,
                    color: sub.color || '#6366f1'
                  }}
                >
                  {sub.code}
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {sub.credits} Credits
                </span>
              </div>

              <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '10px 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {sub.name}
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                {sub.instructor || 'Campus Faculty'}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>
                  <strong>{sub.pendingTasks || 0}</strong> active task{sub.pendingTasks !== 1 ? 's' : ''}
                </span>
                <span style={{ color: 'var(--accent-cyan)' }}>
                  <strong>{sub.totalStudyMinutes || 0}</strong> mins studied
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
