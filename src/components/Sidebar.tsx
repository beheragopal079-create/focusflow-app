import {
  BarChart3,
  BookOpen,
  CheckSquare,
  FileText,
  LayoutDashboard,
  Settings,
  Timer,
  X,
} from 'lucide-react';
import { AppView, TimerMode, UserPreferences } from '../types/study';
import { formatMinutesCompact, formatTimerSeconds } from '../utils/dateUtils';
import { Avatar } from './Avatar';
import { FocusFlowLogo } from './FocusFlowLogo';

interface SidebarProps {
  activeView: AppView;
  onSelectView: (view: AppView) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  preferences: UserPreferences;
  todayMinutes: number;
  pendingTasksCount: number;
  timerRunning: boolean;
  timerSecondsLeft: number;
  timerMode: TimerMode;
}

const NAV_ITEMS: { id: AppView; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'timer', label: 'Focus Timer', icon: Timer },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'subjects', label: 'Subjects', icon: BookOpen },
  { id: 'notes', label: 'Notes', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({
  activeView,
  onSelectView,
  mobileOpen,
  onCloseMobile,
  preferences,
  todayMinutes,
  pendingTasksCount,
  timerRunning,
  timerSecondsLeft,
  timerMode,
}: SidebarProps) {
  const goalPct = Math.min(
    100,
    Math.round((todayMinutes / Math.max(1, preferences.dailyGoalMinutes)) * 100)
  );

  const handleNavClick = (view: AppView) => {
    onSelectView(view);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex h-full flex-col bg-white dark:bg-[#0A1122] border-r border-slate-200 dark:border-slate-800/80">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-200/80 dark:border-slate-800/70">
        <div>
          <button
            type="button"
            onClick={() => handleNavClick('dashboard')}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded-lg text-left"
          >
            <FocusFlowLogo variant="wordmark" size="sm" />
          </button>
          <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
            Plan smarter. Focus deeper.
          </p>
        </div>

        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close navigation menu"
          className="lg:hidden rounded-lg p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Primary Navigation */}
      <nav aria-label="Primary navigation" className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`w-full min-h-[42px] flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 whitespace-nowrap ${
                isActive
                  ? 'bg-violet-600/10 text-violet-700 dark:bg-violet-500/15 dark:text-violet-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <span className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    isActive
                      ? 'text-violet-600 dark:text-violet-400'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </span>

              {item.id === 'tasks' && pendingTasksCount > 0 && (
                <span className="font-mono-tabular text-xs text-slate-500 dark:text-slate-400">
                  {pendingTasksCount}
                </span>
              )}

              {item.id === 'timer' && timerRunning && (
                <span className="font-mono-tabular text-xs font-semibold text-sky-600 dark:text-sky-400">
                  {formatTimerSeconds(timerSecondsLeft)}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Active Timer Mini-Status when running outside Timer View */}
      {timerRunning && activeView !== 'timer' && (
        <div className="mx-3 mb-3">
          <button
            type="button"
            onClick={() => handleNavClick('timer')}
            className="w-full rounded-xl border border-sky-500/30 bg-sky-500/10 px-3.5 py-2.5 text-left transition-colors hover:bg-sky-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-sky-700 dark:text-sky-300 whitespace-nowrap">
                {timerMode === 'focus'
                  ? 'Focus session active'
                  : timerMode === 'shortBreak'
                    ? 'Short break'
                    : 'Long break'}
              </span>
              <span className="font-mono-tabular text-sm font-semibold text-sky-700 dark:text-sky-200">
                {formatTimerSeconds(timerSecondsLeft)}
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Daily Goal Compact Progress + Profile Footer */}
      <div className="border-t border-slate-200/80 dark:border-slate-800/70 p-4 space-y-4">
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-medium text-slate-600 dark:text-slate-400">Daily study goal</span>
            <span className="font-mono-tabular font-medium text-slate-900 dark:text-slate-200">
              {formatMinutesCompact(todayMinutes)} / {formatMinutesCompact(preferences.dailyGoalMinutes)}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-600 to-sky-400 transition-all duration-300"
              style={{ width: `${goalPct}%` }}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleNavClick('settings')}
          className="w-full flex items-center gap-3 rounded-xl p-1.5 -m-1.5 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
        >
          <Avatar src={preferences.avatarUrl} name={preferences.studentName} size="md" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
              {preferences.studentName}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {preferences.academicTrack}
            </p>
          </div>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block lg:w-64 lg:shrink-0 lg:sticky lg:top-0 lg:h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile / Tablet Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative z-10 w-72 max-w-[82vw] h-full">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
