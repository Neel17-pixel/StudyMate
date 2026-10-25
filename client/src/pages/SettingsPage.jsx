import React, { useState, useEffect } from 'react';
import { 
  User, 
  Clock, 
  Save, 
  Sun,
  Moon,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const SettingsPage = () => {
  const { user, updateProfile, theme, toggleTheme } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = useState('');
  const [major, setMajor] = useState('');
  const [university, setUniversity] = useState('');
  const [dailyTargetHours, setDailyTargetHours] = useState('3.0');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setMajor(user.major || '');
      setUniversity(user.university || '');
      setDailyTargetHours(((user.dailyStudyTargetMinutes || 180) / 60).toFixed(1));
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const targetMins = Math.round(parseFloat(dailyTargetHours) * 60);
      const payload = {
        name,
        major,
        university,
        dailyStudyTargetMinutes: targetMins
      };

      await updateProfile(payload);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 840 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Student Profile & Settings</h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Manage your personal details, academic focus goals, and display preferences.
        </p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        {/* Profile Details */}
        <div className="glass-panel" style={{ padding: 26, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 12, borderBottom: '1px solid var(--border-subtle)' }}>
            <User size={20} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Academic Identity</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Full Name
              </label>
              <input
                type="text"
                className="input-field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Email Address (Account ID)
              </label>
              <input
                type="email"
                className="input-field"
                value={user?.email || ''}
                disabled
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Major / Field of Study
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Information Technology, Computer Science, Engineering"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                College or University
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. SAKEC, Stanford, MIT"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Study Goals */}
        <div className="glass-panel" style={{ padding: 26, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 12, borderBottom: '1px solid var(--border-subtle)' }}>
            <Clock size={20} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Daily Focus Targets</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, alignItems: 'center' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Daily Target Study Hours
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="16"
                className="input-field"
                value={dailyTargetHours}
                onChange={(e) => setDailyTargetHours(e.target.value)}
              />
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Controls your daily progress bar on the Dashboard and guides study milestones.
            </p>
          </div>
        </div>

        {/* Theme Preferences */}
        <div className="glass-panel" style={{ padding: 26, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Interface Theme</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>
                Choose between dark glassmorphism and crisp light mode.
              </p>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="btn btn-secondary"
              style={{ gap: 8 }}
            >
              {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
              <span>{theme === 'dark' ? 'Dark Mode (Active)' : 'Light Mode (Active)'}</span>
            </button>
          </div>
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
          <button type="submit" className="btn btn-primary btn-lg" disabled={saving} style={{ gap: 8 }}>
            <Save size={18} />
            <span>{saving ? 'Saving Profile...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
