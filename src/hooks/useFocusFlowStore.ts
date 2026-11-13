import { useCallback, useEffect, useState } from 'react';
import { createInitialSeedState } from '../data/seedData';
import {
  AppState,
  StudyNote,
  StudySession,
  StudyTask,
  Subject,
  UserPreferences,
} from '../types/study';
import { toISODate } from '../utils/dateUtils';

const STORAGE_KEY = 'focusflow_state_v1';

function loadInitialState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = createInitialSeedState();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw) as Partial<AppState>;
    const seed = createInitialSeedState();
    return {
      subjects: Array.isArray(parsed.subjects) ? parsed.subjects : seed.subjects,
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : seed.tasks,
      notes: Array.isArray(parsed.notes) ? parsed.notes : seed.notes,
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : seed.sessions,
      preferences: {
        ...seed.preferences,
        ...(parsed.preferences || {}),
      },
    };
  } catch {
    return createInitialSeedState();
  }
}

export function useFocusFlowStore() {
  const [state, setState] = useState<AppState>(() => loadInitialState());

  // Persist every state change to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors gracefully
    }
  }, [state]);

  // Sync Tailwind dark mode class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (state.preferences.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [state.preferences.theme]);

  const addTask = useCallback(
    (input: Omit<StudyTask, 'id' | 'createdAt' | 'completedAt' | 'completed'>) => {
      const newTask: StudyTask = {
        ...input,
        id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        completed: false,
        completedAt: null,
        createdAt: new Date().toISOString(),
      };
      setState((prev) => ({
        ...prev,
        tasks: [newTask, ...prev.tasks],
      }));
      return newTask;
    },
    []
  );

  const updateTask = useCallback((id: string, updates: Partial<Omit<StudyTask, 'id'>>) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) => (task.id === id ? { ...task, ...updates } : task)),
    }));
  }, []);

  const toggleTask = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) => {
        if (task.id !== id) return task;
        const nextCompleted = !task.completed;
        return {
          ...task,
          completed: nextCompleted,
          completedAt: nextCompleted ? new Date().toISOString() : null,
        };
      }),
    }));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((task) => task.id !== id),
    }));
  }, []);

  const addSubject = useCallback((input: Omit<Subject, 'id'>) => {
    const newSubject: Subject = {
      ...input,
      id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    };
    setState((prev) => ({
      ...prev,
      subjects: [...prev.subjects, newSubject],
    }));
    return newSubject;
  }, []);

  const updateSubject = useCallback((id: string, updates: Partial<Omit<Subject, 'id'>>) => {
    setState((prev) => ({
      ...prev,
      subjects: prev.subjects.map((sub) => (sub.id === id ? { ...sub, ...updates } : sub)),
    }));
  }, []);

  const deleteSubject = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((sub) => sub.id !== id),
      tasks: prev.tasks.filter((t) => t.subjectId !== id),
      notes: prev.notes.filter((n) => n.subjectId !== id),
    }));
  }, []);

  const addNote = useCallback((input: Omit<StudyNote, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newNote: StudyNote = {
      ...input,
      id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: now,
      updatedAt: now,
    };
    setState((prev) => ({
      ...prev,
      notes: [newNote, ...prev.notes],
    }));
    return newNote;
  }, []);

  const updateNote = useCallback(
    (id: string, updates: Partial<Omit<StudyNote, 'id' | 'createdAt'>>) => {
      setState((prev) => ({
        ...prev,
        notes: prev.notes.map((note) =>
          note.id === id
            ? { ...note, ...updates, updatedAt: new Date().toISOString() }
            : note
        ),
      }));
    },
    []
  );

  const deleteNote = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      notes: prev.notes.filter((note) => note.id !== id),
    }));
  }, []);

  const logStudySession = useCallback(
    (input: {
      subjectId: string;
      taskId?: string;
      durationMinutes: number;
      type: 'pomodoro' | 'manual';
    }) => {
      const now = new Date();
      const session: StudySession = {
        id: `sess-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        subjectId: input.subjectId,
        taskId: input.taskId,
        durationMinutes: Math.max(1, Math.round(input.durationMinutes)),
        date: toISODate(now),
        completedAt: now.toISOString(),
        type: input.type,
      };
      setState((prev) => ({
        ...prev,
        sessions: [session, ...prev.sessions],
      }));
      return session;
    },
    []
  );

  const updatePreferences = useCallback((updates: Partial<UserPreferences>) => {
    setState((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        ...updates,
      },
    }));
  }, []);

  const toggleTheme = useCallback(() => {
    setState((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        theme: prev.preferences.theme === 'dark' ? 'light' : 'dark',
      },
    }));
  }, []);

  const resetToSampleData = useCallback(() => {
    const seed = createInitialSeedState();
    setState((prev) => ({
      ...seed,
      preferences: {
        ...seed.preferences,
        theme: prev.preferences.theme,
      },
    }));
  }, []);

  const clearTasksAndNotes = useCallback(() => {
    setState((prev) => ({
      ...prev,
      tasks: [],
      notes: [],
      sessions: [],
    }));
  }, []);

  return {
    state,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    addSubject,
    updateSubject,
    deleteSubject,
    addNote,
    updateNote,
    deleteNote,
    logStudySession,
    updatePreferences,
    toggleTheme,
    resetToSampleData,
    clearTasksAndNotes,
  };
}
