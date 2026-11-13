import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { StudyTask, Subject, TaskPriority } from '../types/study';
import { toISODate } from '../utils/dateUtils';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  editingTask?: StudyTask | null;
  defaultSubjectId?: string;
  onSave: (payload: {
    title: string;
    subjectId: string;
    priority: TaskPriority;
    dueDate: string;
    estimatedMinutes: number;
    notes: string;
  }) => void;
}

export function TaskModal({
  isOpen,
  onClose,
  subjects,
  editingTask,
  defaultSubjectId,
  onSave,
}: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState(toISODate());
  const [estimatedMinutes, setEstimatedMinutes] = useState('45');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{ title?: string; subjectId?: string; dueDate?: string; estimatedMinutes?: string }>({});

  useEffect(() => {
    if (!isOpen) return;
    if (editingTask) {
      setTitle(editingTask.title);
      setSubjectId(editingTask.subjectId);
      setPriority(editingTask.priority);
      setDueDate(editingTask.dueDate);
      setEstimatedMinutes(String(editingTask.estimatedMinutes));
      setNotes(editingTask.notes);
    } else {
      setTitle('');
      setSubjectId(defaultSubjectId || subjects[0]?.id || '');
      setPriority('medium');
      setDueDate(toISODate());
      setEstimatedMinutes('45');
      setNotes('');
    }
    setErrors({});
  }, [isOpen, editingTask, defaultSubjectId, subjects]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: typeof errors = {};

    const cleanTitle = title.trim();
    if (!cleanTitle) {
      nextErrors.title = 'Please enter a task title.';
    } else if (cleanTitle.length < 3) {
      nextErrors.title = 'Task title must be at least 3 characters.';
    }

    if (!subjectId && subjects.length > 0) {
      nextErrors.subjectId = 'Please choose a subject.';
    }

    if (!dueDate) {
      nextErrors.dueDate = 'Please select a due date.';
    }

    const parsedMinutes = Number(estimatedMinutes);
    if (!Number.isFinite(parsedMinutes) || parsedMinutes < 5 || parsedMinutes > 600) {
      nextErrors.estimatedMinutes = 'Enter between 5 and 600 minutes.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onSave({
      title: cleanTitle,
      subjectId,
      priority,
      dueDate,
      estimatedMinutes: Math.round(parsedMinutes),
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-modal-heading"
    >
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D162B] shadow-2xl shadow-slate-950/30 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h3 id="task-modal-heading" className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100">
            {editingTask ? 'Edit Task' : 'Create Study Task'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4" noValidate>
          <div>
            <label htmlFor="task-title" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Task title
            </label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
              }}
              placeholder="e.g., Complete Fourier transform problem set"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#070D1B] px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
              autoFocus
            />
            {errors.title && (
              <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.title}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="task-subject" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Subject
              </label>
              <select
                id="task-subject"
                value={subjectId}
                onChange={(e) => {
                  setSubjectId(e.target.value);
                  if (errors.subjectId) setErrors((prev) => ({ ...prev, subjectId: undefined }));
                }}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#070D1B] px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {subjects.length === 0 ? (
                  <option value="">No subjects created</option>
                ) : (
                  subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.code ? `${sub.code} — ${sub.name}` : sub.name}
                    </option>
                  ))
                )}
              </select>
              {errors.subjectId && (
                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.subjectId}</p>
              )}
            </div>

            <div>
              <label htmlFor="task-priority" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Priority
              </label>
              <select
                id="task-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#070D1B] px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="high">High priority</option>
                <option value="medium">Medium priority</option>
                <option value="low">Low priority</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="task-due" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Due date
              </label>
              <input
                id="task-due"
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  if (errors.dueDate) setErrors((prev) => ({ ...prev, dueDate: undefined }));
                }}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#070D1B] px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              {errors.dueDate && (
                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.dueDate}</p>
              )}
            </div>

            <div>
              <label htmlFor="task-est" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Estimated focus (minutes)
              </label>
              <input
                id="task-est"
                type="number"
                min={5}
                max={600}
                step={5}
                value={estimatedMinutes}
                onChange={(e) => {
                  setEstimatedMinutes(e.target.value);
                  if (errors.estimatedMinutes)
                    setErrors((prev) => ({ ...prev, estimatedMinutes: undefined }));
                }}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#070D1B] px-3.5 py-2.5 text-sm font-mono-tabular text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              {errors.estimatedMinutes && (
                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                  {errors.estimatedMinutes}
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="task-notes" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Study notes (optional)
            </label>
            <textarea
              id="task-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Chapters, formulas, or key deliverables..."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#070D1B] px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[40px] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-[40px] px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white shadow-sm shadow-violet-600/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 transition-colors"
            >
              {editingTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
