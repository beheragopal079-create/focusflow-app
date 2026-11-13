import { useMemo, useState } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { SUBJECT_COLOR_PALETTE } from '../data/seedData';
import { StudySession, StudyTask, Subject } from '../types/study';
import { formatMinutesCompact, getLastNDays } from '../utils/dateUtils';

interface SubjectsViewProps {
  subjects: Subject[];
  tasks: StudyTask[];
  sessions: StudySession[];
  onAddSubject: (input: Omit<Subject, 'id'>) => void;
  onUpdateSubject: (id: string, updates: Partial<Omit<Subject, 'id'>>) => void;
  onDeleteSubject: (id: string) => void;
}

export function SubjectsView({
  subjects,
  tasks,
  sessions,
  onAddSubject,
  onUpdateSubject,
  onDeleteSubject,
}: SubjectsViewProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [color, setColor] = useState(SUBJECT_COLOR_PALETTE[0].hex);
  const [weeklyTargetHours, setWeeklyTargetHours] = useState('5');
  const [error, setError] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const last7Set = useMemo(() => new Set(getLastNDays(7).map((d) => d.iso)), []);

  const openNewForm = () => {
    setEditingId(null);
    setName('');
    setCode('');
    setColor(SUBJECT_COLOR_PALETTE[subjects.length % SUBJECT_COLOR_PALETTE.length].hex);
    setWeeklyTargetHours('5');
    setError('');
    setIsFormOpen(true);
  };

  const openEditForm = (subject: Subject) => {
    setEditingId(subject.id);
    setName(subject.name);
    setCode(subject.code);
    setColor(subject.color);
    setWeeklyTargetHours(String(subject.weeklyTargetHours));
    setError('');
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const target = Number(weeklyTargetHours);

    if (!cleanName || cleanName.length < 2) {
      setError('Subject name must be at least 2 characters.');
      return;
    }
    if (!Number.isFinite(target) || target < 1 || target > 60) {
      setError('Weekly target must be between 1 and 60 hours.');
      return;
    }

    const payload = {
      name: cleanName,
      code: code.trim().toUpperCase(),
      color,
      weeklyTargetHours: Math.round(target),
    };

    if (editingId) {
      onUpdateSubject(editingId, payload);
    } else {
      onAddSubject(payload);
    }
    setIsFormOpen(false);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            Subjects
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Manage your courses, color coding, and weekly study targets.
          </p>
        </div>

        <button
          type="button"
          onClick={openNewForm}
          className="min-h-[42px] px-4 py-2 inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white shadow-sm shadow-violet-600/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Add Subject</span>
        </button>
      </div>

      {/* Add / Edit Subject Form */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-violet-500/35 bg-white dark:bg-[#0D162B] p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
              {editingId ? 'Edit Subject' : 'New Subject'}
            </h2>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              aria-label="Close subject form"
              className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label
                htmlFor="sub-name"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Course / Subject name
              </label>
              <input
                id="sub-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Distributed Systems"
                className="w-full min-h-[40px] rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#070D1B] px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                autoFocus
              />
            </div>

            <div>
              <label
                htmlFor="sub-code"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Course code (optional)
              </label>
              <input
                id="sub-code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="CS 410"
                className="w-full min-h-[40px] rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#070D1B] px-3.5 py-2 text-sm font-mono-tabular text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div>
              <span className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                Accent color
              </span>
              <div className="flex flex-wrap items-center gap-2.5">
                {SUBJECT_COLOR_PALETTE.map((swatch) => {
                  const selected = color === swatch.hex;
                  return (
                    <button
                      key={swatch.hex}
                      type="button"
                      onClick={() => setColor(swatch.hex)}
                      aria-label={swatch.name}
                      className={`h-8 w-8 rounded-lg transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                        selected ? 'scale-110 ring-2 ring-offset-2 ring-slate-900 dark:ring-white dark:ring-offset-[#0D162B]' : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: swatch.hex }}
                    />
                  );
                })}
              </div>
            </div>

            <div>
              <label
                htmlFor="sub-target"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Weekly study target (hours)
              </label>
              <input
                id="sub-target"
                type="number"
                min={1}
                max={60}
                value={weeklyTargetHours}
                onChange={(e) => setWeeklyTargetHours(e.target.value)}
                className="w-full min-h-[40px] rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#070D1B] px-3.5 py-2 text-sm font-mono-tabular text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>

          {error && <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="min-h-[40px] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-[40px] px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white transition-colors"
            >
              {editingId ? 'Save Subject' : 'Create Subject'}
            </button>
          </div>
        </form>
      )}

      {/* Subjects Grid */}
      {subjects.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0D162B] py-16 px-6 text-center">
          <p className="font-display text-base font-semibold text-slate-900 dark:text-white">
            No subjects added yet
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Create your courses to group tasks, notes, and Pomodoro focus sessions.
          </p>
          <button
            type="button"
            onClick={openNewForm}
            className="mt-5 min-h-[40px] px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white transition-colors"
          >
            Add First Subject
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {subjects.map((subject) => {
            const subTasks = tasks.filter((t) => t.subjectId === subject.id);
            const doneTasks = subTasks.filter((t) => t.completed).length;
            const weekMins = sessions
              .filter((s) => s.subjectId === subject.id && last7Set.has(s.date))
              .reduce((acc, s) => acc + s.durationMinutes, 0);
            const targetMins = Math.max(60, subject.weeklyTargetHours * 60);
            const pct = Math.min(100, Math.round((weekMins / targetMins) * 100));
            const isDeleting = confirmDeleteId === subject.id;

            return (
              <div
                key={subject.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0D162B] p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-xs shrink-0"
                          style={{ backgroundColor: subject.color }}
                          aria-hidden="true"
                        />
                        <span className="text-xs font-mono-tabular font-medium text-slate-500 dark:text-slate-400">
                          {subject.code || 'COURSE'}
                        </span>
                      </div>
                      <h3 className="mt-1.5 font-display text-base font-semibold text-slate-900 dark:text-white truncate">
                        {subject.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => openEditForm(subject)}
                        aria-label={`Edit ${subject.name}`}
                        className="rounded-lg p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(isDeleting ? null : subject.id)}
                        aria-label={`Delete ${subject.name}`}
                        className="rounded-lg p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {isDeleting && (
                    <div className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs space-y-2">
                      <p className="text-rose-700 dark:text-rose-300">
                        Delete this subject and its {subTasks.length} linked tasks?
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteSubject(subject.id);
                            setConfirmDeleteId(null);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold"
                        >
                          Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="mt-5">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-500 dark:text-slate-400">Weekly target</span>
                      <span className="font-mono-tabular font-medium text-slate-800 dark:text-slate-200">
                        {formatMinutesCompact(weekMins)} / {subject.weeklyTargetHours}h
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${pct}%`, backgroundColor: subject.color }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-mono-tabular">
                    {doneTasks}/{subTasks.length} tasks completed
                  </span>
                  <span className="font-mono-tabular font-semibold text-slate-700 dark:text-slate-200">
                    {pct}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
