import React from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Sun, 
  Moon, 
  Sparkles, 
  Plus, 
  Flame,
  Search,
  Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTimer } from '../context/TimerContext';

export const Navbar = ({ activeTab, setActiveTab, onOpenQuickAdd }) => {
  const { user, theme, toggleTheme } = useAuth();
  const { isRunning, timeLeft, formatTime, startTimer, pauseTimer, resetTimer, mode } = useTimer();

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Academic Command Center';
      case 'tasks': return 'Tasks & Deadlines';
      case 'subjects': return 'Course Catalog';
      case 'pomodoro': return 'Pomodoro Focus Studio';
      case 'notes': return 'Smart Notes & Cheatsheets';
      case 'analytics': return 'Productivity Analytics';
      case 'ai-tutor': return 'Gemini AI Study Tutor';
      case 'settings': return 'Profile & Settings';
      default: return 'StudyMate';
    }
  };

  return (
    <header
      style={{
        height: 70,
        backgroundColor: 'var(--bg-surface)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        position: 'sticky',
        top: 0,
        zIndex: 40
      }}
    >
      {/* Title */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{getPageTitle()}</h2>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        </p>
      </div>

      {/* Right Controls: Mini Pomodoro, Ask AI, Quick Add, Theme Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Mini Pomodoro Controller */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            background: isRunning ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.04)',
            border: `1px solid ${isRunning ? 'rgba(16, 185, 129, 0.35)' : 'var(--border-subtle)'}`,
            cursor: 'pointer'
          }}
          onClick={() => setActiveTab('pomodoro')}
          title="Click to open Pomodoro Studio"
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: isRunning ? '#10b981' : '#64748b',
              boxShadow: isRunning ? '0 0 10px #10b981' : 'none'
            }}
          />
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.9rem', color: isRunning ? '#10b981' : 'var(--text-main)' }}>
            {formatTime(timeLeft)}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              isRunning ? pauseTimer() : startTimer();
            }}
            style={{
              background: isRunning ? '#10b981' : 'var(--accent-primary)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '50%',
              width: 26,
              height: 26,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              marginLeft: 4
            }}
          >
            {isRunning ? <Pause size={13} /> : <Play size={13} style={{ marginLeft: 2 }} />}
          </button>
        </div>

        {/* Ask AI Pill Button */}
        <button
          onClick={() => setActiveTab('ai-tutor')}
          className="btn btn-secondary btn-sm"
          style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            color: '#c7d2fe',
            fontWeight: 600
          }}
        >
          <Sparkles size={15} color="#38bdf8" />
          <span>Ask AI Tutor</span>
        </button>

        {/* Quick Add Button */}
        <button
          onClick={onOpenQuickAdd}
          className="btn btn-primary btn-sm"
          style={{ gap: 6 }}
        >
          <Plus size={16} />
          <span>Quick Task</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="btn btn-ghost"
          style={{ width: 38, height: 38, padding: 0, borderRadius: '50%' }}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#6366f1" />}
        </button>
      </div>
    </header>
  );
};
