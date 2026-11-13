import { useMemo, useState } from 'react';
import { CheckCircle2, Clock, Plus } from 'lucide-react';
import { StudySession, StudyTask, Subject, UserPreferences } from '../types/study';
import { formatMinutesCompact, getLastNDays, toISODate } from '../utils/dateUtils';

interface AnalyticsViewProps {
  subjects: Subject[];
  tasks: StudyTask[];
  sessions: StudySession[];
  preferences: UserPreferences;
  onLogManualSession: (subjectId: string, minutes: number) => void;
}

export function AnalyticsView({
  subjects,
  tasks,
  sessions,
  preferences,
  onLogManualSession,
}: AnalyticsViewProps) {
  const [rangeDays, setRangeDays] = useState<7 | 14>(7);
  const [hoveredSubjectId, setHoveredSubjectId] = useState<string | null>(null);
  const [manualSubjectId, setManualSubjectId] = useState(subjects[0]?.id || '');
  const [manualMinutes, setManualMinutes] = useState('30');
  const [manualError, setManualError] = useState('');

  const todayISO = toISODate();
  const daysList = useMemo(() => getLastNDays(rangeDays), [rangeDays]);
  const daysSet = useMemo(() => new Set(daysList.map((d) => d.iso)), [daysList]);

  const last7Days = useMemo(() => getLastNDays(7), []);

  // Study time chart data
  const studyTimeSeries = useMemo(() => {
    return daysList.map((d) => {
      const daySessions = sessions.filter((s) => s.date === d.iso);
      const mins = daySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
      return {
        ...d,
        minutes: mins,
        sessionsCount: daySessions.length,
      };
    });
  }, [daysList, sessions]);

  const maxMinutes = useMemo(() => {
    const peak = Math.max(...studyTimeSeries.map((d) => d.minutes), 0);
    return Math.max(preferences.dailyGoalMinutes, peak, 60);
  }, [studyTimeSeries, preferences.dailyGoalMinutes]);

  const rangeTotalMinutes = useMemo(
    () => studyTimeSeries.reduce((acc, d) => acc + d.minutes, 0),
    [studyTimeSeries]
  );

  const avgDailyMinutes = Math.round(rangeTotalMinutes / rangeDays);

  // Subject-wise study distribution
  const subjectDistribution = useMemo(() => {
    const totals = new Map<string, number>();
    sessions
      .filter((s) => daysSet.has(s.date))
      .forEach((s) => {
        totals.set(s.subjectId, (totals.get(s.subjectId) ?? 0) + s.durationMinutes);
      });

    const grandTotal = Array.from(totals.values()).reduce((a, b) => a + b, 0);

    const rows = subjects
      .map((sub) => {
        const mins = totals.get(sub.id) ?? 0;
        const pct = grandTotal > 0 ? Math.round((mins / grandTotal) * 100) : 0;
        return {
          subject: sub,
          minutes: mins,
          pct,
        };
      })
      .sort((a, b) => b.minutes - a.minutes);

    return { rows, grandTotal };
  }, [subjects, sessions, daysSet]);

  // SVG Donut segments
  const donutSegments = useMemo(() => {
    const radius = 68;
    const circumference = 2 * Math.PI * radius;
    const { rows, grandTotal } = subjectDistribution;
    if (grandTotal === 0) return [];

    let cumulativeRatio = 0;
    return rows
      .filter((r) => r.minutes > 0)
      .map((r) => {
        const ratio = r.minutes / grandTotal;
        const dashLength = ratio * circumference;
        const dashOffset = -cumulativeRatio * circumference;
        cumulativeRatio += ratio;
        return {
          ...r,
          circumference,
          dashLength,
          dashOffset,
        };
      });
  }, [subjectDistribution]);

  // Completed vs Pending Tasks
  const taskStats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const pending = total - completed;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const byPriority = (['high', 'medium', 'low'] as const).map((prio) => {
      const list = tasks.filter((t) => t.priority === prio);
      const done = list.filter((t) => t.completed).length;
      return {
        priority: prio,
        label: prio === 'high' ? 'High' : prio === 'medium' ? 'Medium' : 'Low',
        total: list.length,
        completed: done,
        pending: list.length - done,
      };
    });

    return { total, completed, pending, rate, byPriority };
  }, [tasks]);

  // Daily productivity overview (last 7 days)
  const dailyOverviewRows = useMemo(() => {
    return [...last7Days].reverse().map((day) => {
      const daySess = sessions.filter((s) => s.date === day.iso);
      const mins = daySess.reduce((acc, s) => acc + s.durationMinutes, 0);
      const completedTasksOnDay = tasks.filter(
        (t) => t.completed && t.completedAt && t.completedAt.slice(0, 10) === day.iso
      ).length;
      const goalMet = mins >= preferences.dailyGoalMinutes;
      return {
        ...day,
        sessionsCount: daySess.length,
        minutes: mins,
        completedTasks: completedTasksOnDay,
        goalMet,
        isToday: day.iso === todayISO,
      };
    });
  }, [last7Days, sessions, tasks, preferences.dailyGoalMinutes, todayISO]);

  const handleManualLog = (e: React.FormEvent) => {
    e.preventDefault();
    const mins = Number(manualMinutes);
    const targetSub = manualSubjectId || subjects[0]?.id;
    if (!targetSub) {
      setManualError('Create a subject first.');
      return;
    }
    if (!Number.isFinite(mins) || mins < 5 || mins > 480) {
      setManualError('Enter 5 to 480 minutes.');
      return;
    }
    setManualError('');
    onLogManualSession(targetSub, Math.round(mins));
  };

  const activeDonutInfo = hoveredSubjectId
    ? subjectDistribution.rows.find((r) => r.subject.id === hoveredSubjectId)
    : null;

  return (
    <div className="space-y-6">
      {/* Header + Timeframe Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            Study Analytics
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Track weekly focus distribution, task completion velocity, and daily consistency.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Analytics timeframe"
          className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-[#0D162B] border border-slate-200 dark:border-slate-800 self-start"
        >
          <button
            type="button"
            role="tab"
            aria-selected={rangeDays === 7}
            onClick={() => setRangeDays(7)}
            className={`min-h-[36px] px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              rangeDays === 7
                ? 'bg-white dark:bg-[#172546] text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Last 7 Days
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={rangeDays === 14}
            onClick={() => setRangeDays(14)}
            className={`min-h-[36px] px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              rangeDays === 14
                ? 'bg-white dark:bg-[#172546] text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Last 14 Days
          </button>
        </div>
      </div>

      {/* Top Row: Weekly Study-Time Chart + Quick Offline Study Log */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8 rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0D162B] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                Study Time Trend
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Total{' '}
                <span className="font-mono-tabular font-semibold text-slate-800 dark:text-slate-200">
                  {formatMinutesCompact(rangeTotalMinutes)}
                </span>{' '}
                · Daily average{' '}
                <span className="font-mono-tabular font-semibold text-slate-800 dark:text-slate-200">
                  {formatMinutesCompact(avgDailyMinutes)}
                </span>
              </p>
            </div>
          </div>

          <div className="mt-6 relative h-56 flex items-end gap-1.5 sm:gap-2.5 pt-6 pb-2">
            {/* Goal Dashed Line */}
            <div
              aria-hidden="true"
              style={{
                bottom: `${Math.min(92, Math.max(8, (preferences.dailyGoalMinutes / maxMinutes) * 100))}%`,
              }}
              className="pointer-events-none absolute left-0 right-0 border-t border-dashed border-sky-500/45 dark:border-sky-400/35"
            />

            {studyTimeSeries.map((day) => {
              const heightPct =
                day.minutes > 0 ? Math.max(6, Math.round((day.minutes / maxMinutes) * 100)) : 0;
              const isToday = day.iso === todayISO;
              return (
                <div
                  key={day.iso}
                  title={`${day.dateLabel}: ${formatMinutesCompact(day.minutes)} (${day.sessionsCount} sessions)`}
                  className="flex-1 h-full flex flex-col items-center justify-end group"
                >
                  <div className="w-full max-w-[38px] h-full flex items-end">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-t-md transition-all duration-200 ${
                        day.minutes === 0
                          ? 'h-[3px] bg-slate-200 dark:bg-slate-800'
                          : isToday
                            ? 'bg-gradient-to-t from-violet-600 to-sky-400'
                            : day.minutes >= preferences.dailyGoalMinutes
                              ? 'bg-violet-500/85 group-hover:bg-violet-500'
                              : 'bg-blue-500/65 group-hover:bg-blue-500/85'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-1.5 sm:gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            {studyTimeSeries.map((day, idx) => (
              <div key={day.iso} className="flex-1 text-center min-w-0">
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                  {rangeDays === 14 && idx % 2 === 1 ? '' : day.dayShort}
                </p>
                <p className="text-[10px] font-mono-tabular text-slate-400 dark:text-slate-500 truncate">
                  {rangeDays === 14 && idx % 2 === 1 ? '' : day.dateLabel.split(' ')[1]}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Manual Session Log + Completed vs Pending Summary */}
        <div className="xl:col-span-4 space-y-6">
          {/* Completed vs Pending Tasks Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0D162B] p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                Completed vs. Pending Tasks
              </h2>
              <span className="font-mono-tabular text-sm font-bold text-violet-600 dark:text-violet-400">
                {taskStats.rate}%
              </span>
            </div>

            <div className="mt-4 h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
              <div
                className="h-full bg-gradient-to-r from-violet-600 to-sky-400 transition-all duration-300"
                style={{ width: `${taskStats.rate}%` }}
              />
            </div>

            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-300 font-mono-tabular">
                {taskStats.completed} completed
              </span>
              <span className="text-slate-500 dark:text-slate-400 font-mono-tabular">
                {taskStats.pending} pending
              </span>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5">
              {taskStats.byPriority.map((row) => (
                <div key={row.priority} className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">
                    {row.label} priority
                  </span>
                  <span className="font-mono-tabular text-slate-500 dark:text-slate-400">
                    {row.completed} done · {row.pending} open
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Manual Study Log */}
          <form
            onSubmit={handleManualLog}
            className="rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0D162B] p-6 space-y-3"
          >
            <h2 className="font-display text-sm font-semibold text-slate-900 dark:text-white">
              Log Offline Study Session
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <select
                value={manualSubjectId || subjects[0]?.id || ''}
                onChange={(e) => setManualSubjectId(e.target.value)}
                aria-label="Subject for manual session"
                className="sm:col-span-2 min-h-[38px] rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#070D1B] px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code || s.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={5}
                max={480}
                value={manualMinutes}
                onChange={(e) => setManualMinutes(e.target.value)}
                aria-label="Minutes studied"
                placeholder="Mins"
                className="min-h-[38px] rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#070D1B] px-3 py-1.5 text-xs font-mono-tabular text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            {manualError && (
              <p className="text-xs text-rose-600 dark:text-rose-400">{manualError}</p>
            )}
            <button
              type="submit"
              className="w-full min-h-[38px] inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#070D1B] hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-100 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Log Study Time</span>
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Row: Subject Distribution Donut + Daily Productivity Overview Table */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Subject-wise Study Distribution */}
        <div className="xl:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0D162B] p-6">
          <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
            Subject-wise Study Distribution
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Time share across active subjects ({rangeDays} days)
          </p>

          {subjectDistribution.grandTotal === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400">
              Complete a focus session or log study minutes to see subject distribution.
            </div>
          ) : (
            <div className="mt-6 flex flex-col sm:flex-row items-center gap-6">
              <div className="relative shrink-0">
                <svg width="168" height="168" viewBox="0 0 168 168" className="-rotate-90">
                  <circle
                    cx="84"
                    cy="84"
                    r="68"
                    fill="none"
                    className="stroke-slate-100 dark:stroke-slate-800"
                    strokeWidth="18"
                  />
                  {donutSegments.map((seg) => (
                    <circle
                      key={seg.subject.id}
                      cx="84"
                      cy="84"
                      r="68"
                      fill="none"
                      stroke={seg.subject.color}
                      strokeWidth={hoveredSubjectId === seg.subject.id ? '22' : '18'}
                      strokeDasharray={`${seg.dashLength} ${seg.circumference}`}
                      strokeDashoffset={seg.dashOffset}
                      onMouseEnter={() => setHoveredSubjectId(seg.subject.id)}
                      onMouseLeave={() => setHoveredSubjectId(null)}
                      className="transition-all duration-150 cursor-pointer"
                    />
                  ))}
                </svg>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                  <span className="font-mono-tabular text-lg font-bold text-slate-900 dark:text-white">
                    {activeDonutInfo
                      ? formatMinutesCompact(activeDonutInfo.minutes)
                      : formatMinutesCompact(subjectDistribution.grandTotal)}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[96px]">
                    {activeDonutInfo ? activeDonutInfo.subject.code || activeDonutInfo.subject.name : 'Total time'}
                  </span>
                </div>
              </div>

              <ul className="flex-1 w-full space-y-2.5">
                {subjectDistribution.rows.map((row) => (
                  <li
                    key={row.subject.id}
                    onMouseEnter={() => setHoveredSubjectId(row.subject.id)}
                    onMouseLeave={() => setHoveredSubjectId(null)}
                    className="flex items-center justify-between gap-2 text-xs rounded-lg px-2 py-1 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="h-2.5 w-2.5 rounded-xs shrink-0"
                        style={{ backgroundColor: row.subject.color }}
                        aria-hidden="true"
                      />
                      <span className="text-slate-700 dark:text-slate-200 truncate">
                        {row.subject.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 font-mono-tabular">
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {formatMinutesCompact(row.minutes)}
                      </span>
                      <span className="text-slate-400 dark:text-slate-500 w-9 text-right">
                        {row.pct}%
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Daily Productivity Overview Table */}
        <div className="xl:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0D162B] p-6 overflow-hidden">
          <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
            Daily Productivity Overview
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Session volume, focus time, and daily target status for the past 7 days
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  <th className="py-2.5 pr-4">Day</th>
                  <th className="py-2.5 px-3 text-right">Sessions</th>
                  <th className="py-2.5 px-3 text-right">Study Time</th>
                  <th className="py-2.5 px-3 text-right">Tasks Done</th>
                  <th className="py-2.5 pl-3 text-right">Daily Goal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                {dailyOverviewRows.map((row) => (
                  <tr
                    key={row.iso}
                    className="h-10 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-2 pr-4 font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      {row.dayShort}, {row.dateLabel}
                      {row.isToday && (
                        <span className="ml-2 text-[11px] font-semibold text-violet-600 dark:text-violet-400">
                          Today
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-right font-mono-tabular text-slate-600 dark:text-slate-300">
                      {row.sessionsCount}
                    </td>
                    <td className="py-2 px-3 text-right font-mono-tabular font-semibold text-slate-900 dark:text-slate-100">
                      {row.minutes > 0 ? formatMinutesCompact(row.minutes) : '0m'}
                    </td>
                    <td className="py-2 px-3 text-right font-mono-tabular text-slate-600 dark:text-slate-300">
                      {row.completedTasks}
                    </td>
                    <td className="py-2 pl-3 text-right whitespace-nowrap">
                      {row.goalMet ? (
                        <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Goal met</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
                          <Clock className="h-3.5 w-3.5" />
                          <span className="font-mono-tabular">
                            {Math.round(
                              (row.minutes / Math.max(1, preferences.dailyGoalMinutes)) * 100
                            )}
                            %
                          </span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
