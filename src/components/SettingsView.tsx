import { useState } from 'react';
import { Download, Moon, Play, RotateCcw, Sun } from 'lucide-react';
import { AppState, UserPreferences } from '../types/study';
import { formatMinutesCompact } from '../utils/dateUtils';
import { Avatar } from './Avatar';
import { FocusFlowLogo } from './FocusFlowLogo';

interface SettingsViewProps {
  state: AppState;
  onUpdatePreferences: (updates: Partial<UserPreferences>) => void;
  onResetSampleData: () => void;
  onReplayIntro: () => void;
  onNotify: (title: string, description?: string) => void;
}

export function SettingsView({
  state,
  onUpdatePreferences,
  onResetSampleData,
  onReplayIntro,
  onNotify,
}: SettingsViewProps) {
  const { preferences } = state;

  const [studentName, setStudentName] = useState(preferences.studentName);
  const [academicTrack, setAcademicTrack] = useState(preferences.academicTrack);
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(preferences.dailyGoalMinutes);
  const [focusDurationMinutes, setFocusDurationMinutes] = useState(
    preferences.focusDurationMinutes
  );
  const [shortBreakMinutes, setShortBreakMinutes] = useState(preferences.shortBreakMinutes);
  const [longBreakMinutes, setLongBreakMinutes] = useState(preferences.longBreakMinutes);
  const [formError, setFormError] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);

  const handleSaveProfileAndGoals = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = studentName.trim();
    if (!cleanName) {
      setFormError('Display name cannot be empty.');
      return;
    }
    if (dailyGoalMinutes < 15 || dailyGoalMinutes > 720) {
      setFormError('Daily goal must be between 15 and 720 minutes.');
      return;
    }
    if (focusDurationMinutes < 5 || focusDurationMinutes > 120) {
      setFormError('Focus duration must be between 5 and 120 minutes.');
      return;
    }
    if (shortBreakMinutes < 1 || shortBreakMinutes > 30) {
      setFormError('Short break must be between 1 and 30 minutes.');
      return;
    }
    if (longBreakMinutes < 5 || longBreakMinutes > 60) {
      setFormError('Long break must be between 5 and 60 minutes.');
      return;
    }

    setFormError('');
    onUpdatePreferences({
      studentName: cleanName,
      academicTrack: academicTrack.trim() || 'Independent Study',
      dailyGoalMinutes,
      focusDurationMinutes,
      shortBreakMinutes,
      longBreakMinutes,
    });
    onNotify('Preferences saved', 'Your profile, study goals, and Pomodoro timers were updated.');
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `focusflow-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onNotify('Study data exported', 'Your tasks, notes, and sessions were downloaded as JSON.');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          Profile & Settings
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Customize your profile, daily study targets, Pomodoro intervals, and workspace theme.
        </p>
      </div>

      {/* Profile & Study Targets Form */}
      <form
        onSubmit={handleSaveProfileAndGoals}
        className="rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0D162B] p-6 space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-5 border-b border-slate-100 dark:border-slate-800/80">
          <Avatar src={preferences.avatarUrl} name={studentName || 'Student'} size="lg" />
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
              Student Profile
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              All preferences and study history are stored locally in your browser.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="pref-name"
              className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Student name
            </label>
            <input
              id="pref-name"
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full min-h-[40px] rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#070D1B] px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div>
            <label
              htmlFor="pref-track"
              className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Major / Study track
            </label>
            <input
              id="pref-track"
              type="text"
              value={academicTrack}
              onChange={(e) => setAcademicTrack(e.target.value)}
              className="w-full min-h-[40px] rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#070D1B] px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>

        {/* Daily Goal */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="pref-daily-goal"
              className="text-xs font-medium text-slate-700 dark:text-slate-300"
            >
              Daily study goal
            </label>
            <span className="font-mono-tabular text-xs font-semibold text-violet-600 dark:text-violet-400">
              {formatMinutesCompact(dailyGoalMinutes)} ({dailyGoalMinutes} mins)
            </span>
          </div>
          <input
            id="pref-daily-goal"
            type="range"
            min={30}
            max={480}
            step={15}
            value={dailyGoalMinutes}
            onChange={(e) => setDailyGoalMinutes(Number(e.target.value))}
            className="w-full accent-violet-600 cursor-pointer"
          />
        </div>

        {/* Pomodoro Durations */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label
              htmlFor="pref-focus-mins"
              className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Focus duration (min)
            </label>
            <input
              id="pref-focus-mins"
              type="number"
              min={5}
              max={120}
              value={focusDurationMinutes}
              onChange={(e) => setFocusDurationMinutes(Number(e.target.value))}
              className="w-full min-h-[40px] rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#070D1B] px-3.5 py-2 text-sm font-mono-tabular text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div>
            <label
              htmlFor="pref-short-mins"
              className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Short break (min)
            </label>
            <input
              id="pref-short-mins"
              type="number"
              min={1}
              max={30}
              value={shortBreakMinutes}
              onChange={(e) => setShortBreakMinutes(Number(e.target.value))}
              className="w-full min-h-[40px] rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#070D1B] px-3.5 py-2 text-sm font-mono-tabular text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div>
            <label
              htmlFor="pref-long-mins"
              className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Long break (min)
            </label>
            <input
              id="pref-long-mins"
              type="number"
              min={5}
              max={60}
              value={longBreakMinutes}
              onChange={(e) => setLongBreakMinutes(Number(e.target.value))}
              className="w-full min-h-[40px] rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#070D1B] px-3.5 py-2 text-sm font-mono-tabular text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>

        {formError && <p className="text-xs text-rose-600 dark:text-rose-400">{formError}</p>}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="min-h-[42px] px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white shadow-sm shadow-violet-600/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 transition-colors"
          >
            Save Preferences
          </button>
        </div>
      </form>

      {/* Appearance & Brand Identity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0D162B] p-6 space-y-4">
          <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
            Appearance
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Switch between Midnight Navy dark mode and crisp daylight mode.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={() => onUpdatePreferences({ theme: 'dark' })}
              className={`min-h-[46px] px-4 py-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-colors ${
                preferences.theme === 'dark'
                  ? 'border-violet-500 bg-violet-600/15 text-violet-200'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Moon className="h-4 w-4" />
              <span>Midnight Dark</span>
            </button>

            <button
              type="button"
              onClick={() => onUpdatePreferences({ theme: 'light' })}
              className={`min-h-[46px] px-4 py-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-colors ${
                preferences.theme === 'light'
                  ? 'border-violet-600 bg-violet-50 text-violet-700'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Sun className="h-4 w-4" />
              <span>Crisp Light</span>
            </button>
          </div>
        </div>

        {/* Brand Showcase & Replay Opening Animation */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0D162B] p-6 flex flex-col justify-between gap-4">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
              FOCUSFLOW Brand System
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Main wordmark, standalone app icon, and simplified favicon variants.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-4">
              <FocusFlowLogo variant="wordmark" size="sm" />
              <FocusFlowLogo variant="icon" size="sm" />
              <FocusFlowLogo variant="favicon" size="sm" />
            </div>
          </div>

          <button
            type="button"
            onClick={onReplayIntro}
            className="min-h-[40px] px-4 py-2 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700/80 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors self-start"
          >
            <Play className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
            <span>Replay Opening Animation</span>
          </button>
        </div>
      </div>

      {/* Data Management */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0D162B] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
            Workspace Data
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Export a JSON backup or restore the initial sample study workspace.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExportJSON}
            className="min-h-[40px] px-4 py-2 inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export JSON</span>
          </button>

          {confirmReset ? (
            <div className="inline-flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onResetSampleData();
                  setConfirmReset(false);
                  onNotify('Sample data restored', 'Dashboard reset to initial FOCUSFLOW workspace.');
                }}
                className="min-h-[40px] px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white whitespace-nowrap"
              >
                Confirm Reset
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="min-h-[40px] px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="min-h-[40px] px-4 py-2 inline-flex items-center gap-2 rounded-xl border border-rose-500/30 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors whitespace-nowrap"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Sample Data</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
