import { useCallback, useMemo, useState } from 'react';
import { AnalyticsView } from './components/AnalyticsView';
import { DashboardView } from './components/DashboardView';
import { FocusOrbitIntro } from './components/FocusOrbitIntro';
import { FocusTimerView } from './components/FocusTimerView';
import { NotesView } from './components/NotesView';
import { SettingsView } from './components/SettingsView';
import { Sidebar } from './components/Sidebar';
import { SubjectsView } from './components/SubjectsView';
import { TaskManagerView } from './components/TaskManagerView';
import { TaskModal } from './components/TaskModal';
import { ToastStack } from './components/Toast';
import { TopBar } from './components/TopBar';
import { useFocusFlowStore } from './hooks/useFocusFlowStore';
import { usePomodoroTimer } from './hooks/usePomodoroTimer';
import { AppView, StudyTask, ToastMessage } from './types/study';
import { toISODate } from './utils/dateUtils';

const INTRO_SESSION_KEY = 'focusflow_intro_seen';

function shouldShowIntroOnLaunch(): boolean {
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return false;
    }
    return sessionStorage.getItem(INTRO_SESSION_KEY) !== '1';
  } catch {
    return false;
  }
}

export default function App() {
  const {
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
  } = useFocusFlowStore();

  const [showIntro, setShowIntro] = useState<boolean>(() => shouldShowIntroOnLaunch());
  const [activeView, setActiveView] = useState<AppView>('dashboard');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<StudyTask | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const pushToast = useCallback(
    (title: string, description?: string, tone: ToastMessage['tone'] = 'info') => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev.slice(-2), { id, title, description, tone }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleIntroComplete = useCallback(() => {
    try {
      sessionStorage.setItem(INTRO_SESSION_KEY, '1');
    } catch {
      // Ignore storage errors
    }
    setShowIntro(false);
  }, []);

  const handleReplayIntro = useCallback(() => {
    setShowIntro(true);
  }, []);

  const timer = usePomodoroTimer({
    focusMinutes: state.preferences.focusDurationMinutes,
    shortBreakMinutes: state.preferences.shortBreakMinutes,
    longBreakMinutes: state.preferences.longBreakMinutes,
    defaultSubjectId: state.subjects[0]?.id || '',
    soundEnabled: state.preferences.soundEnabled,
    browserNotificationsEnabled: state.preferences.browserNotificationsEnabled,
    onSessionComplete: ({ mode, durationMinutes, subjectId, taskId }) => {
      if (mode === 'focus') {
        logStudySession({
          subjectId: subjectId || state.subjects[0]?.id || '',
          taskId,
          durationMinutes,
          type: 'pomodoro',
        });
        const subName = state.subjects.find((s) => s.id === subjectId)?.name || 'Study';
        pushToast(
          'Focus session completed',
          `Logged ${durationMinutes}m to ${subName}.`,
          'success'
        );
      } else {
        pushToast('Break complete', 'Ready for your next focus session.', 'info');
      }
    },
  });

  const todayISO = toISODate();
  const todayMinutes = useMemo(
    () =>
      state.sessions
        .filter((s) => s.date === todayISO)
        .reduce((acc, s) => acc + s.durationMinutes, 0),
    [state.sessions, todayISO]
  );

  const pendingTasksCount = useMemo(
    () => state.tasks.filter((t) => !t.completed).length,
    [state.tasks]
  );

  const handleOpenNewTaskModal = () => {
    setEditingTask(null);
    setTaskModalOpen(true);
  };

  const handleOpenEditTaskModal = (task: StudyTask) => {
    setEditingTask(task);
    setTaskModalOpen(true);
  };

  const handleSaveTaskModal = (payload: Parameters<typeof addTask>[0]) => {
    if (editingTask) {
      updateTask(editingTask.id, payload);
      pushToast('Task updated', payload.title, 'success');
    } else {
      addTask(payload);
      pushToast('Task created', payload.title, 'success');
    }
  };

  const handleQuickStartFocus = (subjectId: string, taskId?: string) => {
    timer.switchMode('focus');
    timer.setSelectedSubjectId(subjectId);
    timer.setSelectedTaskId(taskId || '');
    timer.start();
    setActiveView('timer');
  };

  const handleQuickLogMinutes = (subjectId: string, minutes: number) => {
    logStudySession({
      subjectId,
      durationMinutes: minutes,
      type: 'manual',
    });
    const subName = state.subjects.find((s) => s.id === subjectId)?.name || 'Study';
    pushToast(`Logged ${minutes}m`, `Added to ${subName}.`, 'success');
  };

  const handleToggleBrowserNotifications = async () => {
    if (!state.preferences.browserNotificationsEnabled) {
      if (typeof Notification === 'undefined') {
        pushToast('Notifications unavailable', 'Your browser does not support desktop alerts.', 'warning');
        return;
      }
      if (Notification.permission === 'default') {
        try {
          const perm = await Notification.requestPermission();
          if (perm === 'granted') {
            updatePreferences({ browserNotificationsEnabled: true });
            pushToast('Browser alerts enabled', 'You will be notified when sessions finish.', 'success');
          } else {
            pushToast('Permission declined', 'Desktop alerts remain off.', 'warning');
          }
        } catch {
          pushToast('Permission error', 'Unable to request notification permission.', 'warning');
        }
        return;
      }
      if (Notification.permission === 'denied') {
        pushToast('Notifications blocked', 'Allow notifications in your browser site settings.', 'warning');
        return;
      }
      updatePreferences({ browserNotificationsEnabled: true });
      pushToast('Browser alerts enabled', undefined, 'success');
    } else {
      updatePreferences({ browserNotificationsEnabled: false });
      pushToast('Browser alerts muted', undefined, 'info');
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 dark:bg-[#070D1B] dark:text-slate-100 transition-colors duration-200">
      {showIntro && <FocusOrbitIntro onComplete={handleIntroComplete} />}

      <Sidebar
        activeView={activeView}
        onSelectView={setActiveView}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
        preferences={state.preferences}
        todayMinutes={todayMinutes}
        pendingTasksCount={pendingTasksCount}
        timerRunning={timer.isRunning}
        timerSecondsLeft={timer.secondsLeft}
        timerMode={timer.mode}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar
          activeView={activeView}
          theme={state.preferences.theme}
          onToggleTheme={toggleTheme}
          onOpenMobileNav={() => setMobileNavOpen(true)}
          onQuickAddTask={handleOpenNewTaskModal}
        />

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {activeView === 'dashboard' && (
            <DashboardView
              subjects={state.subjects}
              tasks={state.tasks}
              sessions={state.sessions}
              preferences={state.preferences}
              onToggleTask={toggleTask}
              onNavigate={setActiveView}
              onQuickStartFocus={handleQuickStartFocus}
              onQuickLogMinutes={handleQuickLogMinutes}
              onOpenNewTaskModal={handleOpenNewTaskModal}
            />
          )}

          {activeView === 'tasks' && (
            <TaskManagerView
              tasks={state.tasks}
              subjects={state.subjects}
              onToggleTask={toggleTask}
              onDeleteTask={(id) => {
                deleteTask(id);
                pushToast('Task deleted', undefined, 'info');
              }}
              onOpenNewTaskModal={handleOpenNewTaskModal}
              onOpenEditTaskModal={handleOpenEditTaskModal}
              onStartFocusOnTask={handleQuickStartFocus}
            />
          )}

          {activeView === 'timer' && (
            <FocusTimerView
              mode={timer.mode}
              isRunning={timer.isRunning}
              secondsLeft={timer.secondsLeft}
              totalModeSeconds={timer.totalModeSeconds}
              progressRatio={timer.progressRatio}
              completedFocusCount={timer.completedFocusCount}
              selectedSubjectId={timer.selectedSubjectId}
              selectedTaskId={timer.selectedTaskId}
              subjects={state.subjects}
              tasks={state.tasks}
              sessions={state.sessions}
              preferences={state.preferences}
              onSwitchMode={timer.switchMode}
              onToggleRun={timer.toggle}
              onReset={timer.reset}
              onFinishEarly={timer.finishEarly}
              onSelectSubject={timer.setSelectedSubjectId}
              onSelectTask={timer.setSelectedTaskId}
              onToggleSound={() =>
                updatePreferences({ soundEnabled: !state.preferences.soundEnabled })
              }
              onToggleBrowserNotifications={handleToggleBrowserNotifications}
            />
          )}

          {activeView === 'analytics' && (
            <AnalyticsView
              subjects={state.subjects}
              tasks={state.tasks}
              sessions={state.sessions}
              preferences={state.preferences}
              onLogManualSession={handleQuickLogMinutes}
            />
          )}

          {activeView === 'subjects' && (
            <SubjectsView
              subjects={state.subjects}
              tasks={state.tasks}
              sessions={state.sessions}
              onAddSubject={(input) => {
                addSubject(input);
                pushToast('Subject added', input.name, 'success');
              }}
              onUpdateSubject={(id, updates) => {
                updateSubject(id, updates);
                pushToast('Subject updated', updates.name, 'success');
              }}
              onDeleteSubject={(id) => {
                deleteSubject(id);
                pushToast('Subject removed', undefined, 'info');
              }}
            />
          )}

          {activeView === 'notes' && (
            <NotesView
              notes={state.notes}
              subjects={state.subjects}
              onAddNote={addNote}
              onUpdateNote={updateNote}
              onDeleteNote={(id) => {
                deleteNote(id);
                pushToast('Note deleted', undefined, 'info');
              }}
            />
          )}

          {activeView === 'settings' && (
            <SettingsView
              state={state}
              onUpdatePreferences={updatePreferences}
              onResetSampleData={resetToSampleData}
              onReplayIntro={handleReplayIntro}
              onNotify={(title, desc) => pushToast(title, desc, 'success')}
            />
          )}
        </main>
      </div>

      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => {
          setTaskModalOpen(false);
          setEditingTask(null);
        }}
        subjects={state.subjects}
        editingTask={editingTask}
        onSave={handleSaveTaskModal}
      />

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
