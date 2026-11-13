import { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Check,
  Clock,
  Play,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { MOTIVATIONAL_QUOTES } from '../data/seedData';
import {
  AppView,
  StudySession,
  StudyTask,
  Subject,
  UserPreferences,
} from '../types/study';
import {
  formatLongDate,
  formatMinutesCompact,
  getLastNDays,
  getRelativeDueInfo,
  getTimeOfDayGreeting,
  toISODate,
} from '../utils/dateUtils';

interface DashboardViewProps {
  subjects: Subject[];
  tasks: StudyTask[];
  sessions: StudySession[];
  preferences: UserPreferences;
  onToggleTask: (id: string) => void;
  onNavigate: (view: AppView) => void;
  onQuickStartFocus: (subjectId: string, taskId?: string) => void;
  onQuickLogMinutes: (subjectId: string, minutes: number) => void;
  onOpenNewTaskModal: () => void;
}

export function DashboardView({
  subjects,
  tasks,
  sessions,
  preferences,
  onToggleTask,
  onNavigate,
  onQuickStartFocus,
  onQuickLogMinutes,
  onOpenNewTaskModal,
}: DashboardViewProps) {
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [hoveredDayIso, setHoveredDayIso] = useState<string | null>(null);

  const today = new Date();
  const todayISO = toISODate(today);
  const firstName = preferences.studentName.trim().split(/\s+/)[0] || 'Student';
  const greeting = getTimeOfDayGreeting(today);

  const subjectMap = useMemo(() => {
    const map = new Map<string, Subject>();
    subjects.forEach((s) => map.set(s.id, s));
    return map;
  }, [subjects]);

  const last7Days = useMemo(() => getLastNDays(7), []);
  const last7Set = useMemo(() => new Set(last7Days.map((d) => d.iso)), [last7Days]);

  const todayMinutes = useMemo(
    () =>
      sessions
        .filter((s) => s.date === todayISO)
        .reduce((acc, s) => acc + s.durationMinutes, 0),
    [sessions, todayISO]
  );

  const weeklyMinutes = useMemo(
    () =>
      sessions
        .filter((s) => last7Set.has(s.date))
        .reduce((acc, s) => acc + s.durationMinutes, 0),
    [sessions, last7Set]
  );

  const totalMinutesAllTime = useMemo(
    () => sessions.reduce((acc, s) => acc + s.durationMinutes, 0),
    [sessions]
  );

  const completedTasksCount = useMemo(
    () => tasks.filter((t) => t.completed).length,
    [tasks]
  );

  const todaySessionsCount = useMemo(
    () => sessions.filter((s) => s.date === todayISO).length,
    [sessions, todayISO]
  );

  const weeklySessionsCount = useMemo(
    () => sessions.filter((s) => last7Set.has(s.date)).length,
    [sessions, last7Set]
  );

  const dailyGoalPct = Math.min(
    100,
    Math.round((todayMinutes / Math.max(1, preferences.dailyGoalMinutes)) * 100)
  );

  // Weekly chart bars
  const weeklyChartData = useMemo(() => {
    return last7Days.map((day) => {
      const daySessions = sessions.filter((s) => s.date === day.iso);
      const mins = daySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
      return {
        ...day,
        minutes: mins,
        sessionsCount: daySessions.length,
        isToday: day.iso === todayISO,
      };
    });
  }, [last7Days, sessions, todayISO]);

  const maxChartMinutes = useMemo(() => {
    const maxData = Math.max(...weeklyChartData.map((d) => d.minutes), 0);
    return Math.max(preferences.dailyGoalMinutes, maxData, 60);
  }, [weeklyChartData, preferences.dailyGoalMinutes]);

  // Upcoming pending deadlines sorted by dueDate, then priority
  const upcomingDeadlines = useMemo(() => {
    const priorityRank = { high: 0, medium: 1, low: 2 };
    return tasks
      .filter((t) => !t.completed)
      .sort((a, b) => {
        if (a.dueDate !== b.dueDate) return a.dueDate.localeCompare(b.dueDate);
        return priorityRank[a.priority] - priorityRank[b.priority];
      })
      .slice(0, 5);
  }, [tasks]);

  // Subject-wise progress
  const subjectProgress = useMemo(() => {
    return subjects.map((subject) => {
      const subTasks = tasks.filter((t) => t.subjectId === subject.id);
      const doneTasks = subTasks.filter((t) => t.completed).length;
      const weekMins = sessions
        .filter((s) => s.subjectId === subject.id && last7Set.has(s.date))
        .reduce((acc, s) => acc + s.durationMinutes, 0);
      const targetMins = Math.max(60, subject.weeklyTargetHours * 60);
      const pct = Math.min(100, Math.round((weekMins / targetMins) * 100));
      return {
        subject,
        totalTasks: subTasks.length,
        doneTasks,
        weekMins,
        pct,
      };
    });
  }, [subjects, tasks, sessions, last7Set]);

  const activeQuote = MOTIVATIONAL_QUOTES[quoteIdx % MOTIVATIONAL_QUOTES.length];

  return (
    <div className="space-y-6">
      {/* Welcome Header & Motivational Prompt */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {formatLongDate(today)}
          </p>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white text-balance">
            {greeting}, {firstName}
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
            {todayMinutes >= preferences.dailyGoalMinutes
              ? 'You reached today’s study goal. Keep your momentum steady or review your upcoming deadlines.'
              : `You have ${formatMinutesCompact(Math.max(0, preferences.dailyGoalMinutes - todayMinutes))} remaining to hit today’s ${formatMinutesCompact(preferences.dailyGoalMinutes)} target.`}
          </p>
        </div>

        <div className="lg:max-w-md w-full rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0D162B] px-4 py-3.5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-violet-600 dark:text-violet-400">
              {activeQuote.context}
            </p>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {activeQuote.text}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setQuoteIdx((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length)}
            aria-label="Next motivational quote"
            className="shrink-0 rounded-lg p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </section>

      {/* 4-Column KPI Strip */}
      <section aria-label="Study metrics summary" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* KPI 1: Daily Study Goal */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0D162B] p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Daily Study Goal
              </p>
              <p className="mt-2 font-mono-tabular text-2xl font-bold text-slate-900 dark:text-white">
                {formatMinutesCompact(todayMinutes)}
                <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
                  {' '}
                  / {formatMinutesCompact(preferences.dailyGoalMinutes)}
                </span>
              </p>
            </div>
            {subjects[0] && (
              <button
                type="button"
                onClick={() => onQuickLogMinutes(subjects[0].id, 15)}
                title={`Quick log 15m to ${subjects[0].name}`}
                className="min-h-[32px] px-2.5 py-1 inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700/80 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 transition-colors whitespace-nowrap shrink-0"
              >
                <Plus className="h-3 w-3" />
                <span>15m</span>
              </button>
            )}
          </div>
          <div className="mt-4">
            <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-600 to-sky-400 transition-all duration-300"
                style={{ width: `${dailyGoalPct}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 font-mono-tabular">
              {dailyGoalPct}% of today’s target
            </p>
          </div>
        </div>

        {/* KPI 2: Total Study Time */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0D162B] p-5 flex flex-col justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Weekly Study Time
            </p>
            <p className="mt-2 font-mono-tabular text-2xl font-bold text-slate-900 dark:text-white">
              {formatMinutesCompact(weeklyMinutes)}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>All-time total</span>
            <span className="font-mono-tabular font-medium text-slate-700 dark:text-slate-200">
              {formatMinutesCompact(totalMinutesAllTime)}
            </span>
          </div>
        </div>

        {/* KPI 3: Tasks Completed */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0D162B] p-5 flex flex-col justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Tasks Completed
            </p>
            <p className="mt-2 font-mono-tabular text-2xl font-bold text-slate-900 dark:text-white">
              {completedTasksCount}
              <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
                {' '}
                / {tasks.length}
              </span>
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              {tasks.length - completedTasksCount} pending
            </span>
            <button
              type="button"
              onClick={() => onNavigate('tasks')}
              className="font-medium text-violet-600 dark:text-violet-400 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded whitespace-nowrap"
            >
              Manage tasks
            </button>
          </div>
        </div>

        {/* KPI 4: Focus Sessions */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0D162B] p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Focus Sessions
              </p>
              <p className="mt-2 font-mono-tabular text-2xl font-bold text-slate-900 dark:text-white">
                {weeklySessionsCount}
                <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
                  {' '}
                  this week
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('timer')}
              className="min-h-[32px] px-2.5 py-1 inline-flex items-center gap-1 rounded-lg bg-violet-600/10 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300 text-xs font-medium hover:bg-violet-600/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 transition-colors whitespace-nowrap shrink-0"
            >
              <Play className="h-3 w-3" />
              <span>Focus</span>
            </button>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Completed today</span>
            <span className="font-mono-tabular font-medium text-slate-700 dark:text-slate-200">
              {todaySessionsCount} sessions
            </span>
          </div>
        </div>
      </section>

      {/* Main Content Split: Weekly Chart + Upcoming Deadlines */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        {/* Left: Weekly Study Progress Chart (7 cols) */}
        <div className="xl:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0D162B] p-6 flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                Weekly Study Progress
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Daily focused minutes over the last 7 days · Goal line at{' '}
                <span className="font-mono-tabular">
                  {formatMinutesCompact(preferences.dailyGoalMinutes)}
                </span>
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('analytics')}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-600 dark:text-sky-400 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded whitespace-nowrap shrink-0"
            >
              <span>Full analytics</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-6 relative">
            <div className="relative h-56 flex items-end justify-between gap-2 sm:gap-4 pt-8 pb-2">
              {/* Daily Goal Horizontal Dashed Line */}
              <div
                aria-hidden="true"
                style={{
                  bottom: `${Math.min(92, Math.max(8, (preferences.dailyGoalMinutes / maxChartMinutes) * 100))}%`,
                }}
                className="pointer-events-none absolute left-0 right-0 border-t border-dashed border-sky-500/45 dark:border-sky-400/35 z-0"
              >
                <span className="absolute -top-4 right-0 text-[10px] font-mono-tabular text-sky-600 dark:text-sky-400 bg-white dark:bg-[#0D162B] px-1">
                  Goal {formatMinutesCompact(preferences.dailyGoalMinutes)}
                </span>
              </div>

              {weeklyChartData.map((day) => {
                const heightPct =
                  day.minutes > 0
                    ? Math.max(6, Math.round((day.minutes / maxChartMinutes) * 100))
                    : 0;
                const isHovered = hoveredDayIso === day.iso;
                const metGoal = day.minutes >= preferences.dailyGoalMinutes;

                return (
                  <div
                    key={day.iso}
                    onMouseEnter={() => setHoveredDayIso(day.iso)}
                    onMouseLeave={() => setHoveredDayIso(null)}
                    className="relative z-10 flex-1 h-full flex flex-col items-center justify-end group"
                  >
                    {isHovered && (
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-900 dark:bg-slate-800 px-2.5 py-1.5 text-[11px] text-white shadow-lg whitespace-nowrap">
                        <span className="font-mono-tabular font-semibold">
                          {formatMinutesCompact(day.minutes)}
                        </span>{' '}
                        · {day.sessionsCount} {day.sessionsCount === 1 ? 'session' : 'sessions'}
                      </div>
                    )}

                    <div className="w-full max-w-[44px] h-full flex items-end">
                      <div
                        style={{ height: `${heightPct}%` }}
                        className={`w-full rounded-t-lg transition-all duration-200 ${
                          day.minutes === 0
                            ? 'h-[3px] bg-slate-200 dark:bg-slate-800'
                            : day.isToday
                              ? 'bg-gradient-to-t from-violet-600 to-sky-400'
                              : metGoal
                                ? 'bg-violet-500/85 group-hover:bg-violet-500'
                                : 'bg-blue-500/65 group-hover:bg-blue-500/85'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Day Labels */}
            <div className="flex items-center justify-between gap-2 sm:gap-4 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              {weeklyChartData.map((day) => (
                <div key={day.iso} className="flex-1 text-center">
                  <p
                    className={`text-xs font-medium ${
                      day.isToday
                        ? 'text-violet-600 dark:text-violet-400 font-semibold'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {day.dayShort}
                  </p>
                  <p className="text-[11px] font-mono-tabular text-slate-400 dark:text-slate-500">
                    {day.minutes > 0 ? formatMinutesCompact(day.minutes) : '—'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Upcoming Deadlines (5 cols) */}
        <div className="xl:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0D162B] p-6 flex flex-col">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                Upcoming Deadlines
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Prioritized pending assignments
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('tasks')}
              className="text-xs font-medium text-violet-600 dark:text-violet-400 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded whitespace-nowrap shrink-0"
            >
              View all
            </button>
          </div>

          {upcomingDeadlines.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-10 px-4">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                All caught up on deadlines
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                Add a new study task to plan your next milestone.
              </p>
              <button
                type="button"
                onClick={onOpenNewTaskModal}
                className="mt-4 min-h-[38px] px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white transition-colors"
              >
                Add Task
              </button>
            </div>
          ) : (
            <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800/80">
              {upcomingDeadlines.map((task) => {
                const subject = subjectMap.get(task.subjectId);
                const dueInfo = getRelativeDueInfo(task.dueDate);
                const dueColor =
                  dueInfo.urgency === 'overdue'
                    ? 'text-rose-600 dark:text-rose-400'
                    : dueInfo.urgency === 'today'
                      ? 'text-amber-600 dark:text-amber-400'
                      : dueInfo.urgency === 'soon'
                        ? 'text-sky-600 dark:text-sky-400'
                        : 'text-slate-500 dark:text-slate-400';

                return (
                  <div
                    key={task.id}
                    className="py-3.5 first:pt-1 last:pb-1 flex items-start gap-3 group"
                  >
                    <button
                      type="button"
                      onClick={() => onToggleTask(task.id)}
                      aria-label={`Mark "${task.title}" as completed`}
                      className="mt-0.5 h-5 w-5 shrink-0 rounded-md border border-slate-300 dark:border-slate-600 hover:border-violet-500 flex items-center justify-center text-transparent hover:text-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 transition-colors"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-snug truncate">
                        {task.title}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
                        {subject && (
                          <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                            <span
                              className="h-2 w-2 rounded-xs shrink-0"
                              style={{ backgroundColor: subject.color }}
                              aria-hidden="true"
                            />
                            <span className="truncate max-w-[140px]">{subject.code || subject.name}</span>
                          </span>
                        )}
                        <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">
                          ·
                        </span>
                        <span className={`inline-flex items-center gap-1 font-medium ${dueColor}`}>
                          {dueInfo.urgency === 'overdue' ? (
                            <AlertCircle className="h-3 w-3 shrink-0" />
                          ) : (
                            <Clock className="h-3 w-3 shrink-0" />
                          )}
                          <span>{dueInfo.label}</span>
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onQuickStartFocus(task.subjectId, task.id)}
                      title="Start focus session for this task"
                      aria-label={`Start focus timer for ${task.title}`}
                      className="min-h-[34px] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700/80 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-300 hover:border-violet-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 transition-colors whitespace-nowrap shrink-0"
                    >
                      Focus
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Subject-wise Progress Cards */}
      <section aria-label="Subject progress">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
              Subject Progress
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Weekly study hours against target and task completion by course
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('subjects')}
            className="text-xs font-medium text-violet-600 dark:text-violet-400 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded whitespace-nowrap shrink-0"
          >
            Manage subjects
          </button>
        </div>

        {subjectProgress.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0D162B] p-8 text-center">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              No subjects configured yet
            </p>
            <button
              type="button"
              onClick={() => onNavigate('subjects')}
              className="mt-3 min-h-[38px] px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white transition-colors"
            >
              Add First Subject
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {subjectProgress.map(({ subject, totalTasks, doneTasks, weekMins, pct }) => (
              <div
                key={subject.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0D162B] p-5 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-xs shrink-0"
                          style={{ backgroundColor: subject.color }}
                          aria-hidden="true"
                        />
                        <span className="text-xs font-mono-tabular font-medium text-slate-500 dark:text-slate-400">
                          {subject.code}
                        </span>
                      </div>
                      <h3 className="mt-1.5 font-display text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {subject.name}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => onQuickStartFocus(subject.id)}
                      aria-label={`Start focus timer for ${subject.name}`}
                      className="rounded-lg p-2 text-slate-400 hover:text-violet-600 dark:hover:text-violet-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 transition-colors shrink-0"
                    >
                      <Play className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-500 dark:text-slate-400">Weekly study</span>
                      <span className="font-mono-tabular font-medium text-slate-800 dark:text-slate-200">
                        {formatMinutesCompact(weekMins)} / {subject.weeklyTargetHours}h
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: subject.color,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-mono-tabular">
                    {doneTasks} of {totalTasks} tasks done
                  </span>
                  <span className="font-mono-tabular font-medium text-slate-700 dark:text-slate-300">
                    {pct}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
