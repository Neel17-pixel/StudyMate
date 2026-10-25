import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Sparkles, 
  FileText, 
  Pin, 
  Trash2, 
  Edit3, 
  HelpCircle,
  X,
  Check
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export const NotesPage = ({ subjects = [], setActiveTab, setPrefilledAIPrompt }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subjectFilter, setSubjectFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Note Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    subjectId: '',
    tags: '',
    isPinned: false
  });

  const [summarizingId, setSummarizingId] = useState(null);
  const { addToast } = useToast();

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const params = {};
      if (subjectFilter) params.subjectId = subjectFilter;
      if (searchQuery) params.search = searchQuery;

      const res = await api.getNotes(params);
      if (res.success) setNotes(res.data);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [subjectFilter, searchQuery]);

  const handleOpenModal = (note = null) => {
    if (note) {
      setEditingNote(note);
      setFormData({
        title: note.title || '',
        content: note.content || '',
        subjectId: note.subjectId || '',
        tags: Array.isArray(note.tags) ? note.tags.join(', ') : '',
        isPinned: Boolean(note.isPinned)
      });
    } else {
      setEditingNote(null);
      setFormData({
        title: '',
        content: '',
        subjectId: subjects.length > 0 ? (subjects[0]._id || subjects[0].id) : '',
        tags: '',
        isPinned: false
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveNote = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      };

      if (editingNote) {
        await api.updateNote(editingNote._id || editingNote.id, payload);
        addToast('Note updated!', 'success');
      } else {
        await api.createNote(payload);
        addToast('Note created!', 'success');
      }

      setIsModalOpen(false);
      fetchNotes();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this study note?')) return;
    try {
      await api.deleteNote(id);
      addToast('Note deleted.', 'info');
      fetchNotes();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleSummarizeWithAI = async (id) => {
    try {
      setSummarizingId(id);
      addToast('AI Tutor is analyzing and summarizing note...', 'info');
      const res = await api.summarizeNote(id);
      if (res.success) {
        addToast('AI Cheat Sheet Summary generated!', 'success');
        fetchNotes();
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSummarizingId(null);
    }
  };

  const handleQuizMe = (note) => {
    if (setPrefilledAIPrompt) {
      setPrefilledAIPrompt({
        prompt: `Please quiz me with 3 challenging exam-style questions based on my study notes titled "${note.title}":\n\n${note.content.slice(0, 500)}`,
        mode: 'quiz',
        subjectId: note.subjectId
      });
    }
    setActiveTab('ai-tutor');
  };

  return (
    <div className="page-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Smart Notes & Cheatsheets</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Organize lecture notes, generate AI summaries, and transform notes into active recall quizzes.
          </p>
        </div>

        <button onClick={() => handleOpenModal()} className="btn btn-primary" style={{ gap: 8 }}>
          <Plus size={18} />
          <span>New Note</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
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
        <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search notes by title, tag, or content keywords..."
            className="input-field"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: 36, height: 40, fontSize: '0.88rem' }}
          />
        </div>

        <select
          className="input-field"
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          style={{ height: 40, width: 'auto', minWidth: 160, fontSize: '0.85rem' }}
        >
          <option value="">All Courses</option>
          {subjects.map((s) => (
            <option key={s._id || s.id} value={s._id || s.id}>
              {s.code}: {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Notes Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
        {notes.length === 0 ? (
          <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', gridColumn: '1 / -1', color: 'var(--text-muted)' }}>
            <FileText size={42} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: 6 }}>No study notes found</h3>
            <p style={{ fontSize: '0.88rem', marginBottom: 16 }}>Capture key formulas, definitions, and lecture concepts.</p>
            <button onClick={() => handleOpenModal()} className="btn btn-primary btn-sm">
              Create First Note
            </button>
          </div>
        ) : (
          notes.map((note) => {
            const isSummarizing = summarizingId === (note._id || note.id);

            return (
              <div
                key={note._id || note.id}
                className="glass-panel"
                style={{
                  padding: 22,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                  borderTop: `4px solid ${note.subjectColor || '#6366f1'}`
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <div>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 4,
                        background: `${note.subjectColor || '#6366f1'}22`,
                        color: note.subjectColor || '#6366f1',
                        border: `1px solid ${note.subjectColor || '#6366f1'}44`
                      }}
                    >
                      {note.subjectCode}
                    </span>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: 8 }}>
                      {note.title}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {note.isPinned && <Pin size={15} color="#f59e0b" fill="#f59e0b" />}
                    <button
                      onClick={() => handleOpenModal(note)}
                      className="btn btn-ghost"
                      style={{ padding: 4 }}
                      title="Edit Note"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(note._id || note.id)}
                      className="btn btn-ghost"
                      style={{ padding: 4, color: '#f43f5e' }}
                      title="Delete Note"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Content snippet */}
                <div
                  style={{
                    fontSize: '0.88rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.6,
                    maxHeight: 160,
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap',
                    background: 'rgba(0, 0, 0, 0.2)',
                    padding: 12,
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  {note.content}
                </div>

                {/* AI Summary Banner */}
                {note.aiSummary ? (
                  <div
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(99, 102, 241, 0.08)',
                      border: '1px solid rgba(99, 102, 241, 0.25)',
                      fontSize: '0.82rem',
                      lineHeight: 1.5,
                      color: '#cbd5e1'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: 'var(--accent-primary)', marginBottom: 4 }}>
                      <Sparkles size={14} color="#38bdf8" />
                      <span>AI Key Takeaway:</span>
                    </div>
                    {note.aiSummary}
                  </div>
                ) : null}

                {/* Tags */}
                {note.tags && note.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {note.tags.map((tag, idx) => (
                      <span key={idx} style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: 6, background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)' }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* AI Action Buttons Footer */}
                <div style={{ display: 'flex', gap: 8, paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
                  <button
                    onClick={() => handleSummarizeWithAI(note._id || note.id)}
                    disabled={isSummarizing}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, gap: 6, fontSize: '0.78rem' }}
                  >
                    <Sparkles size={13} color="#38bdf8" />
                    <span>{isSummarizing ? 'Summarizing...' : note.aiSummary ? 'Refresh AI Summary' : 'Summarize with AI'}</span>
                  </button>

                  <button
                    onClick={() => handleQuizMe(note)}
                    className="btn btn-ghost btn-sm"
                    style={{ gap: 6, fontSize: '0.78rem', border: '1px solid var(--border-subtle)' }}
                    title="Generate practice quiz based on this note"
                  >
                    <HelpCircle size={13} color="#10b981" />
                    <span>Quiz Me</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Note Edit / Create Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 650 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{editingNote ? 'Edit Study Note' : 'Create New Study Note'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="btn btn-ghost" style={{ padding: 6, borderRadius: '50%' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveNote} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Note Title *
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Balanced Search Trees (AVL vs Red-Black)"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  autoFocus
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Course
                  </label>
                  <select
                    className="input-field"
                    value={formData.subjectId}
                    onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                  >
                    <option value="">General Notes</option>
                    {subjects.map((s) => (
                      <option key={s._id || s.id} value={s._id || s.id}>
                        {s.code}: {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. algorithms, trees, midterm"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Lecture Content & Notes
                </label>
                <textarea
                  className="input-field"
                  rows={8}
                  placeholder="Type or paste lecture slides, formulas, key axioms, code snippets, or definitions..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  id="isNotePinned"
                  checked={formData.isPinned}
                  onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                  style={{ width: 16, height: 16, accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                />
                <label htmlFor="isNotePinned" style={{ fontSize: '0.88rem', color: 'var(--text-main)', cursor: 'pointer' }}>
                  Pin this cheatsheet to the top
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingNote ? 'Save Note' : 'Create Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
