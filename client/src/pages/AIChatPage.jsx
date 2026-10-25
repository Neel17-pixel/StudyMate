import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Trash2, 
  BookOpen, 
  Lightbulb, 
  Copy, 
  Check, 
  HelpCircle,
  Code,
  FileText,
  Calendar,
  Zap,
  CornerDownLeft
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const AIChatPage = ({ subjects = [], prefilledPrompt = null, onClearPrefilledPrompt, setActiveTab }) => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [messages, setMessages] = useState([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [selectedMode, setSelectedMode] = useState('general');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const [clearing, setClearing] = useState(false);

  const messagesEndRef = useRef(null);

  // Fetch chat history strictly for the authenticated user
  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.getAIChatHistory();
      if (res.success && Array.isArray(res.data)) {
        setMessages(res.data);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.warn('Could not load chat history:', err.message);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch and isolate chat whenever the user changes or logs in
  useEffect(() => {
    setMessages([]);
    if (user?.id || user?._id) {
      fetchHistory();
    }
  }, [user?.id, user?._id]);

  // Handle prefilled prompt from NotesPage ("Quiz Me")
  useEffect(() => {
    if (prefilledPrompt) {
      setInputPrompt(prefilledPrompt.prompt || '');
      if (prefilledPrompt.mode) setSelectedMode(prefilledPrompt.mode);
      if (prefilledPrompt.subjectId) setSelectedSubjectId(prefilledPrompt.subjectId);
      if (onClearPrefilledPrompt) onClearPrefilledPrompt();
    }
  }, [prefilledPrompt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (customText = null) => {
    const textToSend = customText || inputPrompt;
    if (!textToSend.trim() || loading) return;

    const userMsg = {
      role: 'user',
      content: textToSend.trim(),
      mode: selectedMode,
      subjectId: selectedSubjectId,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setLoading(true);

    try {
      const res = await api.sendAIChat({
        prompt: textToSend.trim(),
        mode: selectedMode,
        subjectId: selectedSubjectId
      });

      if (res.success && res.assistantMessage) {
        setMessages((prev) => [...prev, res.assistantMessage]);
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const executeClearHistory = async () => {
    setIsConfirmingClear(false);
    setClearing(true);
    // Optimistically clear all messages from the view immediately
    setMessages([]);

    try {
      const res = await api.clearAIChatHistory();
      if (res.success) {
        setMessages([]);
        addToast('Chat conversation cleared.', 'info');
      }
    } catch (err) {
      console.error('Failed to clear chat history:', err);
      addToast(err.message || 'Could not clear chat history', 'error');
      // If error, reload history to stay in sync
      fetchHistory();
    } finally {
      setClearing(false);
    }
  };

  const handleCopyCode = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    addToast('Copied to clipboard!', 'success');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const quickPrompts = [
    { title: 'Explain Big O Notation', mode: 'explain', prompt: 'Explain Big O time and space complexity with simple everyday analogies and common pitfalls.' },
    { title: 'Generate Quiz: AVL Trees', mode: 'quiz', prompt: 'Generate 3 challenging multiple-choice exam questions on AVL tree rotations and balance factor invariants.' },
    { title: 'Summarize Dijkstra Algorithm', mode: 'summary', prompt: 'Give me a high-yield cheat sheet summary for Dijkstra Shortest Path algorithm with time complexity and edge cases.' },
    { title: 'Midterm Study Routine', mode: 'schedule', prompt: 'Create an optimal 4-day Pomodoro study schedule for preparing for an upcoming Algorithms & Linear Algebra exam.' }
  ];

  // Render markdown text including tables, code blocks, lists, headers, quotes
  const renderFormattedContent = (content, msgIdx) => {
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, pIdx) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).trim().split('\n');
        const lang = lines[0].trim().match(/^[a-zA-Z0-9_-]+$/) ? lines[0].trim() : '';
        const codeText = lang ? lines.slice(1).join('\n') : lines.join('\n');

        return (
          <div key={pIdx} style={{ position: 'relative', margin: '14px 0', width: '100%' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '6px 14px',
                background: '#04070e',
                borderTopLeftRadius: 'var(--radius-md)',
                borderTopRightRadius: 'var(--radius-md)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderBottom: 'none',
                fontSize: '0.75rem',
                color: 'var(--text-muted)'
              }}
            >
              <span style={{ textTransform: 'uppercase', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                {lang || 'code'}
              </span>
              <button
                onClick={() => handleCopyCode(codeText, `${msgIdx}-${pIdx}`)}
                className="btn btn-ghost btn-sm"
                style={{ padding: '2px 8px', fontSize: '0.72rem', gap: 4 }}
              >
                {copiedIndex === `${msgIdx}-${pIdx}` ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                <span>{copiedIndex === `${msgIdx}-${pIdx}` ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre
              style={{
                margin: 0,
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '14px 18px',
                overflowX: 'auto',
                fontSize: '0.88rem',
                lineHeight: 1.5,
                background: '#070b13'
              }}
            >
              <code style={{ fontFamily: 'var(--font-mono)' }}>{codeText}</code>
            </pre>
          </div>
        );
      }

      return (
        <div
          key={pIdx}
          className="markdown-body"
          dangerouslySetInnerHTML={{
            __html: formatMarkdownToHTML(part)
          }}
        />
      );
    });
  };

  return (
    <div 
      className="animate-fade-in" 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: 'calc(100vh - 68px)', 
        padding: '8px 24px 12px',
        maxWidth: 1680, 
        margin: '0 auto', 
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* Sleek Compact Header Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '10px 18px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 8,
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(99, 102, 241, 0.4)'
            }}
          >
            <Bot size={20} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>StudyMate AI Tutor</h2>
              <span className="badge badge-cyan" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                Gemini Live 3 Flash
              </span>
            </div>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: 0 }}>
              24/7 Problem Solver, Concept Explainer & Study Planner
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Integrated Course Context Select */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', background: 'rgba(255,255,255,0.03)', padding: '3px 8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Course:</span>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              style={{ 
                background: 'transparent', 
                border: 'none', 
                color: 'var(--text-main)', 
                fontSize: '0.8rem', 
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="" style={{ background: '#0a0d14' }}>All / General Questions</option>
              {subjects.map((s) => (
                <option key={s._id || s.id} value={s._id || s.id} style={{ background: '#0a0d14' }}>
                  {s.code}: {s.name}
                </option>
              ))}
            </select>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 12px',
              borderRadius: 20,
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              fontSize: '0.74rem',
              color: '#34d399',
              fontWeight: 600
            }}
          >
            <Sparkles size={12} color="#34d399" />
            <span>AI Connected</span>
          </div>

          {isConfirmingClear ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.35)', borderRadius: 'var(--radius-md)', padding: '3px 8px' }}>
              <span style={{ fontSize: '0.74rem', color: '#fca5a5', fontWeight: 600 }}>Clear all messages?</span>
              <button
                type="button"
                onClick={executeClearHistory}
                disabled={clearing}
                style={{
                  background: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 4,
                  padding: '2px 8px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {clearing ? 'Clearing...' : 'Yes, Clear'}
              </button>
              <button
                type="button"
                onClick={() => setIsConfirmingClear(false)}
                disabled={clearing}
                style={{
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  border: 'none',
                  padding: '2px 6px',
                  fontSize: '0.72rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsConfirmingClear(true)}
              className="btn btn-ghost btn-sm"
              style={{ color: 'var(--text-muted)', padding: '5px 8px' }}
              title="Clear all chat messages"
            >
              <Trash2 size={15} />
              <span style={{ fontSize: '0.75rem', marginLeft: 4 }}>Clear Chat</span>
            </button>
          )}
        </div>
      </div>

      {/* Slim Mode Selector Strip */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          overflowX: 'auto',
          paddingBottom: 4,
          marginBottom: 8,
          flexShrink: 0
        }}
      >
        {[
          { id: 'general', label: 'General Tutor', icon: Sparkles },
          { id: 'explain', label: 'Concept Explainer', icon: Lightbulb },
          { id: 'quiz', label: 'Exam Quizzer', icon: HelpCircle },
          { id: 'summary', label: 'Cheat Sheet Summary', icon: FileText },
          { id: 'code', label: 'Code & Math Solver', icon: Code },
          { id: 'schedule', label: 'Study Planner', icon: Calendar }
        ].map((m) => {
          const Icon = m.icon;
          const isActive = selectedMode === m.id;

          return (
            <button
              key={m.id}
              onClick={() => setSelectedMode(m.id)}
              className="btn btn-sm"
              style={{
                background: isActive ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.04)',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                border: isActive ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-full)',
                padding: '4px 12px',
                fontSize: '0.78rem',
                gap: 5,
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={13} />
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Spacious Full-Height Chat Messages Body */}
      <div
        className="glass-panel"
        style={{
          flex: 1,
          minHeight: 0,
          padding: '20px 24px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          borderRadius: 'var(--radius-lg)'
        }}
      >
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', margin: 'auto', maxWidth: 640, padding: '20px 0' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
              <Bot size={34} color="var(--accent-primary)" />
            </div>
            <h3 style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: 8, color: 'var(--text-main)' }}>
              Ask StudyMate AI Anything
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.5 }}>
              Your dedicated personal study tutor powered by Google Gemini. Select a mode or choose a prompt to get started:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
              {quickPrompts.map((qp, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedMode(qp.mode);
                    setInputPrompt(qp.prompt);
                    handleSendMessage(qp.prompt);
                  }}
                  className="btn btn-secondary"
                  style={{
                    padding: '14px 16px',
                    fontSize: '0.85rem',
                    textAlign: 'left',
                    justifyContent: 'flex-start',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 6,
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <strong style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>{qp.title}</strong>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4 }}>
                    {qp.prompt}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  gap: 14,
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                  width: isUser ? 'auto' : '100%',
                  maxWidth: isUser ? '85%' : '96%'
                }}
              >
                {!isUser && (
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 12,
                      background: 'var(--gradient-brand)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: 2,
                      boxShadow: '0 2px 10px rgba(99, 102, 241, 0.3)'
                    }}
                  >
                    <Bot size={20} color="#ffffff" />
                  </div>
                )}

                <div
                  style={{
                    flex: isUser ? 'initial' : 1,
                    minWidth: 0,
                    padding: isUser ? '14px 18px' : '18px 24px',
                    borderRadius: 'var(--radius-lg)',
                    borderTopLeftRadius: !isUser ? 4 : 'var(--radius-lg)',
                    borderTopRightRadius: isUser ? 4 : 'var(--radius-lg)',
                    background: isUser
                      ? 'var(--gradient-brand)'
                      : 'var(--bg-surface-elevated)',
                    border: isUser
                      ? 'none'
                      : '1px solid var(--border-medium)',
                    color: isUser ? '#ffffff' : 'var(--text-main)',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  {isUser ? (
                    <p style={{ margin: 0, color: '#ffffff', whiteSpace: 'pre-wrap', lineHeight: 1.5, fontSize: '0.95rem' }}>
                      {msg.content}
                    </p>
                  ) : (
                    renderFormattedContent(msg.content, index)
                  )}

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                      marginTop: 10,
                      fontSize: '0.72rem',
                      color: isUser ? 'rgba(255, 255, 255, 0.75)' : 'var(--text-muted)',
                      borderTop: isUser ? 'none' : '1px solid rgba(255, 255, 255, 0.05)',
                      paddingTop: isUser ? 0 : 8
                    }}
                  >
                    <span>
                      {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {!isUser && (
                      <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
                        StudyMate AI • Gemini
                      </span>
                    )}
                  </div>
                </div>

                {isUser && (
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 12,
                      background: 'rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: 2
                    }}
                  >
                    <User size={20} color="var(--text-main)" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {loading && (
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', maxWidth: '90%' }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Bot size={20} color="#ffffff" />
            </div>
            <div className="glass-panel" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10, borderRadius: 'var(--radius-lg)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-cyan)', animation: 'pulse 1s infinite' }} />
              <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                StudyMate AI is analyzing context and formulating detailed academic response...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Spacious Bottom Input Area */}
      <div style={{ marginTop: 10, flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            type="text"
            className="input-field"
            placeholder={`Ask in [${selectedMode.toUpperCase()}] mode (e.g. explain concepts, quiz me, summarize, or debug code in Java/Python)...`}
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={loading}
            style={{ 
              fontSize: '0.96rem', 
              padding: '14px 20px', 
              height: 50,
              borderRadius: 'var(--radius-md)'
            }}
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!inputPrompt.trim() || loading}
            className="btn btn-primary"
            style={{ 
              height: 50, 
              padding: '0 24px', 
              borderRadius: 'var(--radius-md)', 
              gap: 8,
              fontSize: '0.92rem',
              fontWeight: 600,
              whiteSpace: 'nowrap'
            }}
          >
            <span>Send</span>
            <Send size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 6px 0', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          <span>Tip: Press <strong>Enter ↵</strong> to send query immediately</span>
          {selectedSubjectId ? (
            <span style={{ color: 'var(--accent-cyan)' }}>Course context filter active</span>
          ) : (
            <span>General Academic Mode</span>
          )}
        </div>
      </div>
    </div>
  );
};

// Rich Markdown to HTML formatter with Table, List, and Blockquote support
function formatMarkdownToHTML(text) {
  if (!text) return '';

  const lines = text.split('\n');
  let inTable = false;
  let inList = false;
  let listType = 'ul';
  let processedLines = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Check if line is a table row (starts and ends with | or contains |)
    const isTableRow = line.trim().startsWith('|') && line.trim().endsWith('|');
    const isTableDivider = isTableRow && /^[|\s:-]+$/.test(line.trim());

    if (isTableRow) {
      if (inList) {
        processedLines.push(`</${listType}>`);
        inList = false;
      }

      const rawCells = line.split('|');
      const cells = rawCells.slice(1, rawCells.length - 1).map(c => c.trim());

      if (!inTable) {
        inTable = true;
        let tableHeader = '<div class="table-container" style="overflow-x:auto; margin:14px 0; border-radius:var(--radius-md); border:1px solid var(--border-subtle); background:rgba(0,0,0,0.2);"><table style="width:100%; border-collapse:collapse; font-size:0.88rem; text-align:left;"><thead><tr style="background:rgba(99,102,241,0.16); border-bottom:1px solid var(--border-medium);">';
        cells.forEach(cell => {
          tableHeader += `<th style="padding:10px 14px; color:var(--text-main); font-weight:700;">${formatInline(cell)}</th>`;
        });
        tableHeader += '</tr></thead><tbody>';
        processedLines.push(tableHeader);
      } else if (isTableDivider) {
        continue;
      } else {
        let rowHtml = '<tr style="border-bottom:1px solid rgba(255,255,255,0.06);">';
        cells.forEach(cell => {
          rowHtml += `<td style="padding:10px 14px; color:var(--text-secondary); line-height:1.5;">${formatInline(cell)}</td>`;
        });
        rowHtml += '</tr>';
        processedLines.push(rowHtml);
      }

      const nextLine = lines[i + 1];
      if (!nextLine || !nextLine.trim().startsWith('|')) {
        processedLines.push('</tbody></table></div>');
        inTable = false;
      }
      continue;
    }

    // Check for lists
    const isBulletItem = /^[-*]\s+(.*)$/.test(line.trim());
    const isNumberedItem = /^\d+\.\s+(.*)$/.test(line.trim());

    if (isBulletItem || isNumberedItem) {
      const currentListType = isNumberedItem ? 'ol' : 'ul';
      const itemContent = isBulletItem 
        ? line.trim().replace(/^[-*]\s+/, '') 
        : line.trim().replace(/^\d+\.\s+/, '');

      if (!inList) {
        inList = true;
        listType = currentListType;
        processedLines.push(`<${listType} style="margin:8px 0; padding-left:22px;">`);
      } else if (listType !== currentListType) {
        processedLines.push(`</${listType}>`);
        listType = currentListType;
        processedLines.push(`<${listType} style="margin:8px 0; padding-left:22px;">`);
      }

      processedLines.push(`<li style="margin-bottom:5px; color:var(--text-secondary); line-height:1.5;">${formatInline(itemContent)}</li>`);

      const nextLine = lines[i + 1];
      if (!nextLine || (!/^[-*]\s+/.test(nextLine.trim()) && !/^\d+\.\s+/.test(nextLine.trim()))) {
        processedLines.push(`</${listType}>`);
        inList = false;
      }
      continue;
    } else if (inList) {
      processedLines.push(`</${listType}>`);
      inList = false;
    }

    // Horizontal divider
    if (/^---+$|^===+$/.test(line.trim())) {
      processedLines.push('<hr style="border:none; border-top:1px solid rgba(255,255,255,0.12); margin:16px 0;" />');
      continue;
    }

    // Headers
    if (/^### (.*$)/.test(line)) {
      processedLines.push(`<h3 style="margin:16px 0 8px; font-size:1.15rem; color:var(--text-main);">${formatInline(line.replace(/^### /, ''))}</h3>`);
      continue;
    }
    if (/^## (.*$)/.test(line)) {
      processedLines.push(`<h2 style="margin:18px 0 10px; font-size:1.3rem; color:var(--text-main);">${formatInline(line.replace(/^## /, ''))}</h2>`);
      continue;
    }
    if (/^# (.*$)/.test(line)) {
      processedLines.push(`<h1 style="margin:20px 0 12px; font-size:1.45rem; color:var(--text-main);">${formatInline(line.replace(/^# /, ''))}</h1>`);
      continue;
    }

    // Blockquote
    if (/^>\s*(.*$)/.test(line)) {
      processedLines.push(`<blockquote style="border-left:3px solid var(--accent-cyan); padding:8px 14px; margin:10px 0; background:rgba(6,182,212,0.08); border-radius:0 var(--radius-md) var(--radius-md) 0; color:var(--text-secondary); font-style:italic;">${formatInline(line.replace(/^>\s*/, ''))}</blockquote>`);
      continue;
    }

    // Empty line
    if (!line.trim()) {
      processedLines.push('<div style="height: 8px;"></div>');
      continue;
    }

    processedLines.push(`<p style="margin: 4px 0; line-height: 1.6; color:var(--text-secondary);">${formatInline(line)}</p>`);
  }

  if (inList) {
    processedLines.push(`</${listType}>`);
  }
  if (inTable) {
    processedLines.push('</tbody></table></div>');
  }

  return processedLines.join('');
}

function formatInline(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text-main);">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code style="background:rgba(99,102,241,0.18); color:#a5b4fc; padding:2px 6px; border-radius:4px; font-family:var(--font-mono); font-size:0.88em;">$1</code>');
}
