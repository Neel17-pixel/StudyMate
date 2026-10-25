import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/sound';
import { api } from '../services/api';
import { useToast } from './ToastContext';

const TimerContext = createContext(null);

const DURATIONS = {
  pomodoro: 25 * 60,
  short_break: 5 * 60,
  long_break: 15 * 60,
  deep_work: 50 * 60,
};

export const TimerProvider = ({ children }) => {
  const [mode, setMode] = useState('pomodoro');
  const [totalSeconds, setTotalSeconds] = useState(DURATIONS.pomodoro);
  const [timeLeft, setTimeLeft] = useState(DURATIONS.pomodoro);
  const [isRunning, setIsRunning] = useState(false);
  const [activeSubjectId, setActiveSubjectId] = useState('');
  const [activeTaskId, setActiveTaskId] = useState('');
  const [activeTaskTitle, setActiveTaskTitle] = useState('');
  const [completedSessionData, setCompletedSessionData] = useState(null);
  
  const intervalRef = useRef(null);
  const { addToast } = useToast();

  // Tick timer
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, mode, totalSeconds, activeSubjectId, activeTaskId]);

  const handleTimerComplete = async () => {
    setIsRunning(false);
    sounds.playTimerComplete();

    // Launch celebratory confetti
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // ignore
    }

    const durationMinutes = Math.round(totalSeconds / 60);

    // Auto-log if it was a focus session
    if (mode === 'pomodoro' || mode === 'deep_work') {
      try {
        await api.createSession({
          subjectId: activeSubjectId,
          taskId: activeTaskId,
          durationMinutes,
          sessionType: mode,
          productivityRating: 5,
          notes: activeTaskTitle ? `Focused on task: ${activeTaskTitle}` : 'Dedicated study session'
        });
        addToast(`🎉 Great focus! Completed ${durationMinutes}-minute study session.`, 'success');
        window.dispatchEvent(new Event('studymate-session-logged'));
      } catch (err) {
        console.warn('Could not auto-log session:', err.message);
      }
    } else {
      addToast('🔔 Break completed! Ready for your next focus session.', 'info');
    }
  };

  const startTimer = () => {
    sounds.playClick();
    setIsRunning(true);
  };

  const pauseTimer = () => {
    sounds.playClick();
    setIsRunning(false);
  };

  const resetTimer = () => {
    sounds.playClick();
    setIsRunning(false);
    setTimeLeft(totalSeconds);
  };

  const setSessionMode = (newMode) => {
    sounds.playClick();
    setIsRunning(false);
    setMode(newMode);
    const secs = DURATIONS[newMode] || 25 * 60;
    setTotalSeconds(secs);
    setTimeLeft(secs);
  };

  const setCustomMinutes = (mins) => {
    const secs = mins * 60;
    setIsRunning(false);
    setTotalSeconds(secs);
    setTimeLeft(secs);
  };

  const linkTaskToTimer = (task) => {
    setActiveTaskId(task._id || task.id);
    setActiveTaskTitle(task.title);
    if (task.subjectId) setActiveSubjectId(task.subjectId);
    setSessionMode('pomodoro');
    addToast(`Timer linked to "${task.title}"`, 'info');
  };

  // Format MM:SS
  const formatTime = (secs = timeLeft) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Progress percentage (0 to 100)
  const progressPercent = totalSeconds > 0 ? ((totalSeconds - timeLeft) / totalSeconds) * 100 : 0;

  return (
    <TimerContext.Provider
      value={{
        mode,
        timeLeft,
        totalSeconds,
        isRunning,
        progressPercent,
        activeSubjectId,
        setActiveSubjectId,
        activeTaskId,
        setActiveTaskId,
        activeTaskTitle,
        setActiveTaskTitle,
        startTimer,
        pauseTimer,
        resetTimer,
        setSessionMode,
        setCustomMinutes,
        linkTaskToTimer,
        formatTime
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};
