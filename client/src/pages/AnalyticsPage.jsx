import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Clock, 
  Flame, 
  CheckCircle2, 
  Award, 
  TrendingUp, 
  Calendar,
  Sparkles,
  PieChart,
  Target
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export const AnalyticsPage = ({ subjects = [] }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const loadStats = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboardStats();
      if (res.success) setStats(res.stats);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <p style={{ color: 'var(--text-secondary)' }}>Calculating analytics...</p>
      </div>
    );
  }

  const allTimeHours = stats ? (stats.allTimeMinutes / 60).toFixed(1) : '0';
  const weekHours = stats ? (stats.weekMinutes / 60).toFixed(1) : '0';
  const totalSubjectMins = stats?.subjectBreakdown?.reduce((sum, s) => sum + s.minutes, 0) || 1;

  return (
    <div className="page-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Productivity & Retention Analytics</h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Real-time metrics on study volume, subject distribution, task velocity, and habit consistency.
        </p>
      </div>

      {/* Top 4 KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18 }}>
        <div className="glass-panel" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>All-Time Focus</span>
            <Clock size={18} color="var(--accent-primary)" />
          </div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 8 }}>{allTimeHours} <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>hours</span></h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>Total deep work logged</p>
        </div>

        <div className="glass-panel" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Weekly Volume</span>
            <TrendingUp size={18} color="var(--accent-cyan)" />
          </div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 8 }}>{weekHours} <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>hours</span></h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>Past 7 days activity</p>
        </div>

        <div className="glass-panel" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Active Habit Streak</span>
            <Flame size={18} color="#f59e0b" />
          </div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 8, color: '#f59e0b' }}>{stats?.streakDays || 1} <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>days</span></h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>Consecutive daily study</p>
        </div>

        <div className="glass-panel" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Task Completion</span>
            <CheckCircle2 size={18} color="var(--accent-emerald)" />
          </div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 8, color: 'var(--accent-emerald)' }}>{stats?.completionRate || 0}%</h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>{stats?.completedTasksCount || 0} of {stats?.totalTasks || 0} tasks done</p>
        </div>
      </div>

      {/* 2 Main Visual Analytics: Daily Trend & Course Distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: 24 }}>
        {/* Daily Breakdown */}
        <div className="glass-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Daily Focus Time Breakdown</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Daily minutes recorded</p>
            </div>
            <span className="badge badge-cyan">Past 7 Days</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {stats?.last7Days?.map((d) => {
              const maxM = Math.max(...(stats.last7Days.map(x => x.minutes)), 180);
              const percent = Math.min(100, Math.round((d.minutes / maxM) * 100));

              return (
                <div key={d.date} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span style={{ width: 44, fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {d.dayName}
                  </span>
                  <div style={{ flex: 1, height: 12, background: 'rgba(255, 255, 255, 0.05)', borderRadius: 6, overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${percent}%`,
                        height: '100%',
                        borderRadius: 6,
                        background: d.minutes > 0 ? 'var(--gradient-brand)' : 'transparent',
                        transition: 'width 0.6s ease-out'
                      }}
                    />
                  </div>
                  <span style={{ width: 65, textAlign: 'right', fontSize: '0.82rem', fontWeight: 600, color: d.minutes > 0 ? 'var(--text-main)' : 'var(--text-muted)' }}>
                    {d.minutes} min
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Subject Time Distribution */}
        <div className="glass-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Course Focus Distribution</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Time investment by subject</p>
            </div>
            <PieChart size={18} color="var(--accent-primary)" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {stats?.subjectBreakdown?.map((sub, i) => {
              const percent = totalSubjectMins > 0 ? Math.round((sub.minutes / totalSubjectMins) * 100) : 0;

              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: sub.color || '#6366f1' }} />
                      <strong style={{ color: 'var(--text-main)' }}>{sub.code}</strong>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{sub.name}</span>
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                      {sub.minutes} mins ({percent}%)
                    </span>
                  </div>

                  <div style={{ width: '100%', height: 7, borderRadius: 4, background: 'rgba(255, 255, 255, 0.05)', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${percent}%`,
                        height: '100%',
                        borderRadius: 4,
                        backgroundColor: sub.color || '#6366f1',
                        transition: 'width 0.6s ease'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI Academic Coach Audit */}
      <div
        className="glass-panel"
        style={{
          padding: 26,
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(6, 182, 212, 0.1) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 16
        }}
      >
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Sparkles size={22} color="#ffffff" />
        </div>
        <div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 6 }}>
            AI Academic Coach: Cognitive Load & Retention Audit
          </h4>
          <p style={{ fontSize: '0.92rem', color: '#cbd5e1', lineHeight: 1.6 }}>
            {stats?.aiCoachInsight}
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 14, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', padding: '4px 10px', borderRadius: 20, background: 'rgba(255, 255, 255, 0.08)', color: '#a5b4fc' }}>
              💡 Recommendation: 50-min study / 10-min walk ratio
            </span>
            <span style={{ fontSize: '0.78rem', padding: '4px 10px', borderRadius: 20, background: 'rgba(255, 255, 255, 0.08)', color: '#38bdf8' }}>
              🧠 Peak Focus Window: 09:00 AM – 01:00 PM
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
