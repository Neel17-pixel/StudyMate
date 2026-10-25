import React from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  BookOpen, 
  Timer, 
  FileText, 
  BarChart3, 
  Bot, 
  Settings, 
  LogOut, 
  Sparkles,
  Flame,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTimer } from '../context/TimerContext';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const { isRunning, formatTime } = useTimer();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks & Deadlines', icon: CheckSquare },
    { id: 'subjects', label: 'My Courses', icon: BookOpen },
    { id: 'pomodoro', label: 'Pomodoro Studio', icon: Timer, badge: isRunning ? formatTime() : null },
    { id: 'notes', label: 'Notes & Cheatsheets', icon: FileText },
    { id: 'analytics', label: 'Productivity Analytics', icon: BarChart3 },
    { id: 'ai-tutor', label: 'AI Study Tutor', icon: Bot, isAIPill: true },
    { id: 'settings', label: 'Settings & Profile', icon: Settings }
  ];

  return (
    <aside
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: 260,
        backgroundColor: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
        padding: '20px 14px'
      }}
    >
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 12px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: 'var(--gradient-brand)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
          }}
        >
          <GraduationCap size={22} color="#ffffff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'var(--gradient-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              StudyMate
            </span>
            <span style={{ fontSize: '0.65rem', padding: '2px 6px', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', borderRadius: 6, fontWeight: 700 }}>
              AI
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Student Productivity Hub</p>
        </div>
      </div>

      {/* Nav Menu */}
      <nav style={{ flex: 1, padding: '16px 0', display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: isActive ? 'rgba(99, 102, 241, 0.16)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.92rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all var(--transition-fast)',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.color = 'var(--text-main)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: '20%',
                    bottom: '20%',
                    width: 3.5,
                    borderRadius: '0 4px 4px 0',
                    background: 'var(--accent-primary)'
                  }}
                />
              )}
              <Icon size={19} color={isActive ? 'var(--accent-primary)' : 'currentColor'} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span
                  style={{
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    borderRadius: 10,
                    background: '#10b981',
                    color: '#ffffff',
                    fontWeight: 700
                  }}
                >
                  {item.badge}
                </span>
              )}
              {item.isAIPill && (
                <Sparkles size={14} color="#06b6d4" />
              )}
            </button>
          );
        })}
      </nav>

      {/* User Card & Sign Out */}
      <div style={{ paddingTop: 14, borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {user && (
          <div
            onClick={() => setActiveTab('settings')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 10px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.03)',
              cursor: 'pointer'
            }}
          >
            <img
              src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.name)}`}
              alt={user.name}
              style={{ width: 34, height: 34, borderRadius: '50%', border: '1.5px solid var(--accent-primary)', objectFit: 'cover' }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.name}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.major || 'College Student'}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className="btn btn-ghost"
          style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 12px', fontSize: '0.85rem' }}
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
