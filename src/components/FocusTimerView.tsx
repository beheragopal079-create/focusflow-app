import { useMemo } from 'react';
import {
  Bell,
  BellOff,
  CheckCircle2,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { StudySession, StudyTask, Subject, TimerMode, UserPreferences } from '../types/study';
import { formatMinutesCompact, formatTimerSeconds, toISODate } from '../utils/dateUtils';

interface FocusTimerViewProps {
  mode: TimerMode;
  isRunning: boolean;
  secondsLeft: number;
  totalModeSeconds: number;
  progressRatio: number;
  completedFocusCount: number;
  selectedSubjectId: string;
  selectedTaskId: string;
  subjects: Subject[];
  tasks: StudyTask[];
  sessions: StudySession[];
  preferences: UserPreferences;
  onSwitchMode: (mode: TimerMode) => void;
  onToggleRun: () => void;
  onReset: () => void;
  onFinishEarly: () => void;
  onSelectSubject: (subjectId: string) => void;
  onSelectTask: (taskId: string) => void;
  onToggleSound: () => void;
  onToggleBrowserNotifications: () => void;
}

export function FocusTimerView({
  mode,
  isRunning,
  secondsLeft,
  totalModeSeconds,
  progressRatio,
  completedFocusCount,
  selectedSubjectId,
  selectedTaskId,
  subjects,
  tasks,
  sessions,
  preferences,
  onSwitchMode,
  onToggleRun,
  onReset,
  onFinishEarly,
  onSelectSubject,
  onSelectTask,
  onToggleSound,
  onToggleBrowserNotifications,
}: FocusTimerViewProps) {
  const todayISO = toISODate();

  const subjectMap = useMemo(() => {
    const map = new Map<string, Subject>();
    subjects.forEach((s) => map.set(s.id, s));
    return map;
  }, [subjects]);

  const pendingTasksForSubject = useMemo(
    () =>
      tasks.filter(
        (t) => !t.completed && (!selectedSubjectId || t.subjectId === selectedSubjectId)
      ),
    [tasks, selectedSubjectId]
  );

  const todaySessions = useMemo(
    () => sessions.filter((s) => s.date === todayISO),
    [sessions, todayISO]
  );

  const todayMinutes = useMemo(
    () => todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0),
    [todaySessions]
  );

  // SVG Ring geometry
  const radius = 114;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progressRatio);

  const modeLabel =
    mode === 'focus'
      ? 'Focus Session'
      : mode === 'shortBreak'
        ? 'Short Break'
        : 'Long Break';

  const cyclePosition = (completedFocusCount % 4) + (mode === 'focus' ? 1 : 0);
  const canCompleteEarly = secondsLeft < totalModeSeconds - 10;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          Focus Timer
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Structured Pomodoro intervals that automatically log study time to your selected subject.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Main Timer Card (7 cols) */}
        <div className="xl:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0D162B] p-6 sm:p-8 flex flex-col items-center">
          {/* Segmented Mode Selector */}
          <div
            role="tablist"
            aria-label="Timer session mode"
            className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-[#070D1B] border border-slate-200/80 dark:border-slate-800 w-full sm:w-auto"
          >
            {(
              [
                { id: 'focus', label: `Focus (${preferences.focusDurationMinutes}m)` },
                { id: 'shortBreak', label: `Short Break (${preferences.shortBreakMinutes}m)` },
                { id: 'longBreak', label: `Long Break (${preferences.longBreakMinutes}m)` },
              ] as const
            ).map((item) => {
              const active = mode === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => onSwitchMode(item.id)}
                  className={`flex-1 sm:flex-initial min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                    active
                      ? 'bg-white dark:bg-[#131F3D] text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Circular Progress Indicator */}
          <div className="relative my-8 flex items-center justify-center">
            <svg
              width="272"
              height="272"
              viewBox="0 0 272 272"
              className="-rotate-90"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="pomo-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={mode === 'focus' ? '#8B5CF6' : '#38BDF8'} />
                  <stop offset="100%" stopColor={mode === 'focus' ? '#38BDF8' : '#10B981'} />
                </linearGradient>
              </defs>

              {/* Track ring */}
              <circle
                cx="136"
                cy="136"
                r={radius}
                fill="none"
                className="stroke-slate-200 dark:stroke-slate-800"
                strokeWidth="10"
              />

              {/* Subtle inner orbital guide */}
              <circle
                cx="136"
                cy="136"
                r={radius - 14}
                fill="none"
                className="stroke-slate-200/70 dark:stroke-slate-800/70"
                strokeWidth="1"
                strokeDasharray="4 6"
              />

              {/* Active progress arc */}
              <circle
                cx="136"
                cy="136"
                r={radius}
                fill="none"
                stroke="url(#pomo-ring-grad)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-[stroke-dashoffset] duration-300 ease-linear"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {modeLabel}
              </span>
              <span
                aria-live="off"
                className="mt-1 font-mono-tabular text-5xl sm:text-6xl font-bold tracking-tight text-slate-900 dark:text-white"
              >
                {formatTimerSeconds(secondsLeft)}
              </span>
              <span className="mt-2 text-xs font-mono-tabular text-slate-500 dark:text-slate-400">
                Cycle {Math.min(4, Math.max(1, cyclePosition))} of 4
              </span>
            </div>
          </div>

          {/* Primary Controls */}
          <div className="flex flex-wrap items-center justify-center gap-3 w-full">
            <button
              type="button"
              onClick={onToggleRun}
              className="min-h-[44px] min-w-[140px] px-6 py-2.5 inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-sm font-semibold text-white shadow-sm shadow-violet-600/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 transition-colors whitespace-nowrap"
            >
              {isRunning ? (
                <>
                  <Pause className="h-4 w-4" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  <span>{secondsLeft < totalModeSeconds ? 'Resume' : 'Start Focus'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onReset}
              className="min-h-[44px] px-4 py-2.5 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-[#070D1B] text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 transition-colors whitespace-nowrap"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset</span>
            </button>

            {mode === 'focus' && canCompleteEarly && (
              <button
                type="button"
                onClick={onFinishEarly}
                className="min-h-[44px] px-4 py-2.5 inline-flex items-center justify-center gap-2 rounded-xl border border-sky-500/40 bg-sky-500/10 text-xs font-medium text-sky-700 dark:text-sky-300 hover:bg-sky-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 transition-colors whitespace-nowrap"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Log & Finish</span>
              </button>
            )}
          </div>

          {/* 4-Step Session Counter Strip */}
          <div className="mt-7 pt-5 border-t border-slate-100 dark:border-slate-800/80 w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Pomodoro Cycle
              </span>
              <div className="flex items-center gap-1.5" aria-label={`${completedFocusCount} completed focus sessions`}>
                {[0, 1, 2, 3].map((step) => {
                  const filled = step < completedFocusCount % 4 || (completedFocusCount > 0 && completedFocusCount % 4 === 0);
                  return (
                    <span
                      key={step}
                      className={`h-2.5 w-6 rounded-xs transition-colors ${
                        filled
                          ? 'bg-violet-600 dark:bg-violet-400'
                          : 'bg-slate-200 dark:bg-slate-800'
                      }`}
                    />
                  );
                })}
              </div>
              <span className="font-mono-tabular text-xs font-semibold text-slate-800 dark:text-slate-200">
                {completedFocusCount} completed
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onToggleSound}
                aria-pressed={preferences.soundEnabled}
                className={`min-h-[36px] px-3 py-1.5 inline-flex items-center gap-1.5 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap ${
                  preferences.soundEnabled
                    ? 'border-violet-500/40 bg-violet-500/10 text-violet-700 dark:text-violet-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                }`}
              >
                {preferences.soundEnabled ? (
                  <Volume2 className="h-3.5 w-3.5" />
                ) : (
                  <VolumeX className="h-3.5 w-3.5" />
                )}
                <span>Chime</span>
              </button>

              <button
                type="button"
                onClick={onToggleBrowserNotifications}
                aria-pressed={preferences.browserNotificationsEnabled}
                className={`min-h-[36px] px-3 py-1.5 inline-flex items-center gap-1.5 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap ${
                  preferences.browserNotificationsEnabled
                    ? 'border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                }`}
              >
                {preferences.browserNotificationsEnabled ? (
                  <Bell className="h-3.5 w-3.5" />
                ) : (
                  <BellOff className="h-3.5 w-3.5" />
                )}
                <span>Alerts</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Session Binding & Today's Log (5 cols) */}
        <div className="xl:col-span-5 space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0D162B] p-6 space-y-4">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                Current Focus Context
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Attach a subject and task so completed blocks update your analytics.
              </p>
            </div>

            <div>
              <label
                htmlFor="timer-subject"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Subject
              </label>
              <select
                id="timer-subject"
                value={selectedSubjectId}
                onChange={(e) => {
                  onSelectSubject(e.target.value);
                  onSelectTask('');
                }}
                className="w-full min-h-[40px] rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#070D1B] px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.code ? `${sub.code} — ${sub.name}` : sub.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="timer-task"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Linked task (optional)
              </label>
              <select
                id="timer-task"
                value={selectedTaskId}
                onChange={(e) => onSelectTask(e.target.value)}
                className="w-full min-h-[40px] rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#070D1B] px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="">General study block</option>
                {pendingTasksForSubject.map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0D162B] p-6">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                Today’s Study Log
              </h2>
              <span className="font-mono-tabular text-xs font-semibold text-violet-600 dark:text-violet-400">
                {formatMinutesCompact(todayMinutes)} total
              </span>
            </div>

            {todaySessions.length === 0 ? (
              <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                No sessions logged today yet. Start a 25-minute focus block to record your first session.
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-slate-100 dark:divide-slate-800/80 max-h-64 overflow-y-auto">
                {todaySessions.map((sess) => {
                  const sub = subjectMap.get(sess.subjectId);
                  const timeStr = new Date(sess.completedAt).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  });

                  return (
                    <li
                      key={sess.id}
                      className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="h-2.5 w-2.5 rounded-xs shrink-0"
                          style={{ backgroundColor: sub?.color ?? '#8B5CF6' }}
                          aria-hidden="true"
                        />
                        <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                          {sub?.name ?? 'General Study'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 font-mono-tabular text-slate-500 dark:text-slate-400">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {sess.durationMinutes}m
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{timeStr}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
