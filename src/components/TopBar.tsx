import { Menu, Moon, Plus, Sun } from 'lucide-react';
import { AppView, ThemeMode } from '../types/study';
import { FocusFlowLogo } from './FocusFlowLogo';

interface TopBarProps {
  activeView: AppView;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenMobileNav: () => void;
  onQuickAddTask: () => void;
}

const VIEW_LABELS: Record<AppView, string> = {
  dashboard: 'Dashboard',
  tasks: 'Task Manager',
  timer: 'Focus Timer',
  analytics: 'Study Analytics',
  subjects: 'Subjects',
  notes: 'Personal Notes',
  settings: 'Profile & Settings',
};

export function TopBar({
  activeView,
  theme,
  onToggleTheme,
  onOpenMobileNav,
  onQuickAddTask,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-20 h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/90 dark:bg-[#070D1B]/90 backdrop-blur-md">
      {/* Left: Mobile Trigger + Context Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileNav}
          aria-label="Open navigation menu"
          className="lg:hidden min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E172D] text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 transition-colors shrink-0"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="lg:hidden flex items-center shrink-0">
          <FocusFlowLogo variant="transparent" size="sm" />
        </div>

        <div className="flex items-center gap-2 text-sm min-w-0">
          <span className="hidden lg:inline text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap">
            FOCUSFLOW
          </span>
          <span className="hidden lg:inline text-slate-300 dark:text-slate-700" aria-hidden="true">
            /
          </span>
          <h2 className="font-display font-semibold text-slate-900 dark:text-slate-100 truncate">
            {VIEW_LABELS[activeView]}
          </h2>
        </div>
      </div>

      {/* Right: Theme Toggle & Primary Action */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="min-h-[40px] px-3 py-2 inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E172D] text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 transition-colors whitespace-nowrap shrink-0"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="h-4 w-4 text-amber-400 shrink-0" />
              <span className="hidden sm:inline">Light</span>
            </>
          ) : (
            <>
              <Moon className="h-4 w-4 text-violet-600 shrink-0" />
              <span className="hidden sm:inline">Dark</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onQuickAddTask}
          className="min-h-[40px] px-4 py-2 inline-flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white shadow-sm shadow-violet-600/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:focus-visible:ring-offset-[#070D1B] transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="h-4 w-4 shrink-0" />
          <span>New Task</span>
        </button>
      </div>
    </header>
  );
}
