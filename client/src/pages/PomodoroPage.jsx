import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  Coffee, 
  Zap, 
  CheckCircle2, 
  Star, 
  Clock, 
  BookOpen,
  Volume2
} from 'lucide-react';
import { useTimer } from '../context/TimerContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

export const PomodoroPage = ({ subjects = [], tasks = [] }) => {
  const { 
    mode, 
    timeLeft, 
    totalSeconds, 
    isRunning, 
    progressPercent, 
    startTimer, 
    pauseTimer, 
    resetTimer, 
    setSessionMode, 
    formatTime,
    activeSubjectId,
    setActiveSubjectId,
    activeTaskId,
    setActiveTaskId,
    activeTaskTitle,
    setActiveTaskTitle
  } = useTimer();

  const { addToast } = useToast();
  const [sessions, setSessions] = useState([]);
  const [customMins, setCustomMins] = useState(25);

  const fetchSessions = async () => {
    try {
      const res = await api.getSessions();
      if (res.success) setSessions(res.data);
    } catch (err) {
      console.warn('Error fetching sessions:', err.message);
    }
  };

  useEffect(() => {
    fetchSessions();

    const handleLogged = () => fetchSessions();
    window.addEventListener('studymate-session-logged', handleLogged);
    return () => window.removeEventListener('studymate-session-logged', handleLogged);
  }, []);

  // SVG circle calculations
  const radius = 130;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const handleTaskSelect = (taskId) => {
    setActiveTaskId(taskId);
    const selectedTask = tasks.find(t => (t._id || t.id) === taskId);
    if (selectedTask) {
      setActiveTaskTitle(selectedTask.title);
      if (selectedTask.subjectId) setActiveSubjectId(selectedTask.subjectId);
    } else {
      setActiveTaskTitle('');
    }
  };

  return (
    <div className="page-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Header */}
      <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Pomodoro Focus Studio</h1>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginTop: 4 }}>
          Harness structured interval training to eliminate distractions and accelerate retention.
        </p>
      </div>

      {/* Main Focus Console */}
      <div
        className="glass-panel"
        style={{
          maxWidth: 720,
          margin: '0 auto',
          width: '100%',
          padding: '36px 32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 28,
          position: 'relative'
        }}
      >
        {/* Mode Selector Tabs */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            padding: 5,
            background: 'rgba(255, 255, 255, 0.04)',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-subtle)',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}
        >
          <button
            onClick={() => setSessionMode('pomodoro')}
            className="btn btn-sm"
            style={{
              background: mode === 'pomodoro' ? 'var(--gradient-brand)' : 'transparent',
              color: mode === 'pomodoro' ? '#ffffff' : 'var(--text-secondary)',
              borderRadius: 'var(--radius-full)',
              padding: '8px 18px'
            }}
          >
            <Zap size={14} />
            <span>Focus (25m)</span>
          </button>

          <button
            onClick={() => setSessionMode('deep_work')}
            className="btn btn-sm"
            style={{
              background: mode === 'deep_work' ? 'linear-gradient(135deg, #06b6d4, #3b82f6)' : 'transparent',
              color: mode === 'deep_work' ? '#ffffff' : 'var(--text-secondary)',
              borderRadius: 'var(--radius-full)',
              padding: '8px 18px'
            }}
          >
            <Sparkles size={14} />
            <span>Deep Work (50m)</span>
          </button>

          <button
            onClick={() => setSessionMode('short_break')}
            className="btn btn-sm"
            style={{
              background: mode === 'short_break' ? 'var(--accent-emerald)' : 'transparent',
              color: mode === 'short_break' ? '#ffffff' : 'var(--text-secondary)',
              borderRadius: 'var(--radius-full)',
              padding: '8px 18px'
            }}
          >
            <Coffee size={14} />
            <span>Short Break (5m)</span>
          </button>

          <button
            onClick={() => setSessionMode('long_break')}
            className="btn btn-sm"
            style={{
              background: mode === 'long_break' ? '#8b5cf6' : 'transparent',
              color: mode === 'long_break' ? '#ffffff' : 'var(--text-secondary)',
              borderRadius: 'var(--radius-full)',
              padding: '8px 18px'
            }}
          >
            <Coffee size={14} />
            <span>Long Break (15m)</span>
          </button>
        </div>

        {/* Circular Progress Display */}
        <div style={{ position: 'relative', width: 300, height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="300" height="300" style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx="150"
              cy="150"
              r={radius}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="10"
              fill="transparent"
            />
            <circle
              cx="150"
              cy="150"
              r={radius}
              stroke={mode === 'short_break' || mode === 'long_break' ? '#10b981' : 'url(#timerGradient)'}
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
            <defs>
              <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>

          {/* Time digits */}
          <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '3.8rem',
                fontWeight: 800,
                letterSpacing: '-0.04em',
                color: 'var(--text-main)',
                lineHeight: 1
              }}
            >
              {formatTime(timeLeft)}
            </span>
            <span
              style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: isRunning ? 'var(--accent-cyan)' : 'var(--text-muted)',
                marginTop: 8,
                textTransform: 'uppercase',
                letterSpacing: '0.08em'
              }}
            >
              {isRunning ? 'Session Active' : 'Ready to Focus'}
            </span>
            {activeTaskTitle && (
              <span
                style={{
                  fontSize: '0.78rem',
                  color: 'var(--accent-primary)',
                  maxWidth: 200,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginTop: 6
                }}
              >
                🎯 {activeTaskTitle}
              </span>
            )}
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={resetTimer}
            className="btn btn-secondary"
            style={{ width: 50, height: 50, borderRadius: '50%', padding: 0 }}
            title="Reset Timer"
          >
            <RotateCcw size={19} />
          </button>

          <button
            onClick={isRunning ? pauseTimer : startTimer}
            className="btn btn-primary btn-lg"
            style={{
              padding: '16px 40px',
              borderRadius: 'var(--radius-full)',
              fontSize: '1.2rem',
              gap: 10,
              boxShadow: isRunning ? '0 0 25px rgba(99, 102, 241, 0.6)' : 'none'
            }}
          >
            {isRunning ? (
              <>
                <Pause size={22} />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play size={22} fill="currentColor" />
                <span>Start Focus</span>
              </>
            )}
          </button>
        </div>

        {/* Task & Subject Assignment Linker */}
        <div
          style={{
            width: '100%',
            maxWidth: 520,
            padding: 18,
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12
          }}
        >
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Link Focus Session to Course & Task (Optional)
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                Course
              </label>
              <select
                className="input-field"
                value={activeSubjectId}
                onChange={(e) => setActiveSubjectId(e.target.value)}
                style={{ fontSize: '0.82rem', height: 38 }}
              >
                <option value="">General Study</option>
                {subjects.map((s) => (
                  <option key={s._id || s.id} value={s._id || s.id}>
                    {s.code}: {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                Specific Assignment
              </label>
              <select
                className="input-field"
                value={activeTaskId}
                onChange={(e) => handleTaskSelect(e.target.value)}
                style={{ fontSize: '0.82rem', height: 38 }}
              >
                <option value="">None (Free Focus)</option>
                {tasks.filter(t => t.status !== 'completed').map((t) => (
                  <option key={t._id || t.id} value={t._id || t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Study Sessions Table */}
      <div className="glass-panel" style={{ padding: 24 }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 16 }}>
          Recent Focus Logs
        </h3>

        {sessions.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '30px 0' }}>
            No study sessions logged yet. Complete your first Pomodoro to track focus history!
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '10px 12px' }}>Course</th>
                  <th style={{ padding: '10px 12px' }}>Type</th>
                  <th style={{ padding: '10px 12px' }}>Duration</th>
                  <th style={{ padding: '10px 12px' }}>Rating</th>
                  <th style={{ padding: '10px 12px' }}>Notes</th>
                  <th style={{ padding: '10px 12px' }}>Completed At</th>
                </tr>
              </thead>
              <tbody>
                {sessions.slice(0, 10).map((s) => (
                  <tr key={s._id || s.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 4,
                          background: `${s.subjectColor || '#6366f1'}22`,
                          color: s.subjectColor || '#6366f1'
                        }}
                      >
                        {s.subjectCode || 'FOCUS'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textTransform: 'capitalize', color: 'var(--text-secondary)' }}>
                      {s.sessionType?.replace('_', ' ')}
                    </td>
                    <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
                      {s.durationMinutes} mins
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', gap: 2, color: '#f59e0b' }}>
                        {[...Array(s.productivityRating || 5)].map((_, i) => (
                          <Star key={i} size={13} fill="currentColor" />
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)', maxWidth: 260, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {s.notes || '—'}
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {new Date(s.completedAt || s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
