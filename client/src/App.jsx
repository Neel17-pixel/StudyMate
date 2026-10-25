import React, { useState, useEffect } from 'react';
import { ToastProvider, useToast } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TimerProvider } from './context/TimerContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { TaskModal } from './components/TaskModal';
import { SubjectModal } from './components/SubjectModal';
import { QuickAddModal } from './components/QuickAddModal';
import { AuthPage } from './pages/AuthPage';
import { Dashboard } from './pages/Dashboard';
import { TasksPage } from './pages/TasksPage';
import { SubjectsPage } from './pages/SubjectsPage';
import { PomodoroPage } from './pages/PomodoroPage';
import { NotesPage } from './pages/NotesPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AIChatPage } from './pages/AIChatPage';
import { SettingsPage } from './pages/SettingsPage';
import { api } from './services/api';

function MainApp() {
  const { user, isAuthenticated, loading } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [subjects, setSubjects] = useState([]);
  const [tasks, setTasks] = useState([]);

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);

  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  // Pre-filled prompt passed to AI Chat (e.g. from Note "Quiz Me")
  const [prefilledAIPrompt, setPrefilledAIPrompt] = useState(null);

  // Fetch subjects and tasks when authenticated
  const refreshGlobalData = async () => {
    if (!isAuthenticated) return;
    try {
      const [subsRes, tasksRes] = await Promise.all([
        api.getSubjects(),
        api.getTasks()
      ]);
      if (subsRes.success) setSubjects(subsRes.data);
      if (tasksRes.success) setTasks(tasksRes.data);
    } catch (err) {
      console.warn('Refresh error:', err.message);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshGlobalData();
    }
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid var(--accent-primary)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Starting StudyMate...</h3>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  const handleOpenTaskModal = (task = null) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (taskData) => {
    try {
      if (editingTask) {
        await api.updateTask(editingTask._id || editingTask.id, taskData);
        addToast('Task updated!', 'success');
      } else {
        await api.createTask(taskData);
        addToast('Task created successfully!', 'success');
      }
      setIsTaskModalOpen(false);
      refreshGlobalData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleOpenSubjectModal = (sub = null) => {
    setEditingSubject(sub);
    setIsSubjectModalOpen(true);
  };

  const handleSaveSubject = async (subjectData) => {
    try {
      if (editingSubject) {
        await api.updateSubject(editingSubject._id || editingSubject.id, subjectData);
        addToast('Course updated!', 'success');
      } else {
        await api.createSubject(subjectData);
        addToast('Course added to your portfolio!', 'success');
      }
      setIsSubjectModalOpen(false);
      refreshGlobalData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div className="app-layout">
      {/* Left Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="main-content">
        <Navbar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onOpenQuickAdd={() => setIsQuickAddOpen(true)} 
        />

        {/* Tab Pages */}
        <main style={{ flex: 1, minHeight: 0 }}>
          {activeTab === 'dashboard' && (
            <Dashboard 
              setActiveTab={setActiveTab} 
              onOpenTaskModal={() => handleOpenTaskModal()}
              onOpenSubjectModal={() => handleOpenSubjectModal()}
            />
          )}

          {activeTab === 'tasks' && (
            <TasksPage 
              subjects={subjects} 
              onOpenTaskModal={handleOpenTaskModal}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'subjects' && (
            <SubjectsPage 
              subjects={subjects} 
              onOpenSubjectModal={handleOpenSubjectModal}
              onSubjectUpdated={refreshGlobalData}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'pomodoro' && (
            <PomodoroPage 
              subjects={subjects} 
              tasks={tasks}
            />
          )}

          {activeTab === 'notes' && (
            <NotesPage 
              subjects={subjects}
              setActiveTab={setActiveTab}
              setPrefilledAIPrompt={setPrefilledAIPrompt}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsPage 
              subjects={subjects}
            />
          )}

          {activeTab === 'ai-tutor' && (
            <AIChatPage 
              key={user?.id || user?._id || 'ai-tutor'}
              subjects={subjects}
              prefilledPrompt={prefilledAIPrompt}
              onClearPrefilledPrompt={() => setPrefilledAIPrompt(null)}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsPage />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        task={editingTask}
        subjects={subjects}
      />

      <SubjectModal
        isOpen={isSubjectModalOpen}
        onClose={() => setIsSubjectModalOpen(false)}
        onSave={handleSaveSubject}
        subject={editingSubject}
      />

      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        subjects={subjects}
        onCreated={refreshGlobalData}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <TimerProvider>
          <MainApp />
        </TimerProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
