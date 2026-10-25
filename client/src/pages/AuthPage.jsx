import React, { useState } from 'react';
import { 
  GraduationCap, 
  Sparkles, 
  Zap, 
  ArrowRight, 
  Lock, 
  Mail, 
  User, 
  BookOpen, 
  ShieldCheck 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const AuthPage = () => {
  const { login, register, demoLogin } = useAuth();
  const { addToast } = useToast();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    major: '',
    university: ''
  });
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await login({ email: formData.email, password: formData.password });
      } else {
        await register(formData);
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = async () => {
    setDemoLoading(true);
    try {
      await demoLogin();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        position: 'relative',
        background: 'radial-gradient(ellipse at 50% 20%, rgba(99, 102, 241, 0.18) 0%, rgba(10, 13, 20, 1) 75%)'
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: 480,
          padding: '36px 32px',
          boxShadow: 'var(--shadow-lg), 0 0 50px rgba(99, 102, 241, 0.25)',
          border: '1px solid var(--border-medium)',
          display: 'flex',
          flexDirection: 'column',
          gap: 22
        }}
      >
        {/* Brand Icon & Heading */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'var(--gradient-brand)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 22px rgba(99, 102, 241, 0.45)',
              marginBottom: 14
            }}
          >
            <GraduationCap size={32} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'var(--gradient-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            StudyMate
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: 4 }}>
            AI-Powered Student Productivity & Academic Platform
          </p>
        </div>

        {/* 1-Click Demo Login Banner */}
        <div
          style={{
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.35)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Zap size={18} color="#f59e0b" fill="#f59e0b" />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Evaluate Instantly: Demo Student Account
            </span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            Pre-loaded with realistic courses (Data Structures, Linear Algebra), upcoming tasks, study logs, and notes.
          </p>
          <button
            type="button"
            onClick={handleDemoAccess}
            disabled={demoLoading}
            className="btn btn-primary"
            style={{ width: '100%', gap: 8, fontSize: '0.9rem', padding: '10px 14px' }}
          >
            <Sparkles size={16} />
            <span>{demoLoading ? 'Logging in as Demo...' : 'Enter as Demo Student (Alex Chen)'}</span>
            <ArrowRight size={15} />
          </button>
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '2px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>or sign in manually</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
        </div>

        {/* Mode Tabs */}
        <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.04)', borderRadius: 'var(--radius-md)', padding: 4 }}>
          <button
            type="button"
            onClick={() => setMode('login')}
            className="btn btn-sm"
            style={{
              flex: 1,
              background: mode === 'login' ? 'var(--accent-primary)' : 'transparent',
              color: mode === 'login' ? '#ffffff' : 'var(--text-secondary)'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className="btn btn-sm"
            style={{
              flex: 1,
              background: mode === 'register' ? 'var(--accent-primary)' : 'transparent',
              color: mode === 'register' ? '#ffffff' : 'var(--text-secondary)'
            }}
          >
            Register Student
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {mode === 'register' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Full Name *
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Jordan Smith"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ paddingLeft: 38 }}
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Student Email *
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                className="input-field"
                placeholder="student@university.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{ paddingLeft: 38 }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Password *
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                style={{ paddingLeft: 38 }}
                required
              />
            </div>
          </div>

          {mode === 'register' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Major
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Computer Science"
                  value={formData.major}
                  onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  University
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. State University"
                  value={formData.university}
                  onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: 6 }}
          >
            {loading ? 'Authenticating...' : mode === 'login' ? 'Sign In to StudyMate' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {mode === 'login' ? (
            <span>Don't have an account? <a href="#register" onClick={(e) => { e.preventDefault(); setMode('register'); }} style={{ fontWeight: 600 }}>Create one now</a></span>
          ) : (
            <span>Already have an account? <a href="#login" onClick={(e) => { e.preventDefault(); setMode('login'); }} style={{ fontWeight: 600 }}>Sign in</a></span>
          )}
        </div>
      </div>
    </div>
  );
};
