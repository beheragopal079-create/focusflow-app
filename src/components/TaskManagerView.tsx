import { useMemo, useState } from 'react';
import {
  AlertCircle,
  Check,
  Clock,
  Pencil,
  Play,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { StudyTask, Subject, TaskPriority } from '../types/study';
import { formatMinutesCompact, getRelativeDueInfo } from '../utils/dateUtils';

interface TaskManagerViewProps {
  tasks: StudyTask[];
  subjects: Subject[];
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onOpenNewTaskModal: () => void;
  onOpenEditTaskModal: (task: StudyTask) => void;
  onStartFocusOnTask: (subjectId: string, taskId: string) => void;
}

type StatusFilter = 'all' | 'pending' | 'completed';
type SortOption = 'dueDate' | 'priority' | 'title';

export function TaskManagerView({
  tasks,
  subjects,
  onToggleTask,
  onDeleteTask,
  onOpenNewTaskModal,
  onOpenEditTaskModal,
  onStartFocusOnTask,
}: TaskManagerViewProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('dueDate');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const subjectMap = useMemo(() => {
    const map = new Map<string, Subject>();
    subjects.forEach((s) => map.set(s.id, s));
    return map;
  }, [subjects]);

  const counts = useMemo(() => {
    const completed = tasks.filter((t) => t.completed).length;
    return {
      all: tasks.length,
      pending: tasks.length - completed,
      completed,
    };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const priorityWeight: Record<TaskPriority, number> = {
      high: 0,
      medium: 1,
      low: 2,
    };

    return tasks
      .filter((task) => {
        if (statusFilter === 'pending' && task.completed) return false;
        if (statusFilter === 'completed' && !task.completed) return false;
        if (subjectFilter !== 'all' && task.subjectId !== subjectFilter) return false;
        if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
        if (query) {
          const subjectName = subjectMap.get(task.subjectId)?.name.toLowerCase() ?? '';
          const match =
            task.title.toLowerCase().includes(query) ||
            task.notes.toLowerCase().includes(query) ||
            subjectName.includes(query);
          if (!match) return false;
        }
        return true;
      })
      .sort((a, b) => {
        // Keep pending above completed when viewing "all"
        if (statusFilter === 'all' && a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        if (sortBy === 'priority') {
          const diff = priorityWeight[a.priority] - priorityWeight[b.priority];
          if (diff !== 0) return diff;
          return a.dueDate.localeCompare(b.dueDate);
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        if (a.dueDate !== b.dueDate) return a.dueDate.localeCompare(b.dueDate);
        return priorityWeight[a.priority] - priorityWeight[b.priority];
      });
  }, [tasks, statusFilter, subjectFilter, priorityFilter, sortBy, searchQuery, subjectMap]);

  const hasActiveFilters =
    statusFilter !== 'all' ||
    subjectFilter !== 'all' ||
    priorityFilter !== 'all' ||
    searchQuery.trim().length > 0;

  const resetFilters = () => {
    setStatusFilter('all');
    setSubjectFilter('all');
    setPriorityFilter('all');
    setSearchQuery('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            Task Manager
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Organize assignments by course, priority, and due date.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenNewTaskModal}
          className="min-h-[42px] px-4 py-2 inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white shadow-sm shadow-violet-600/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Task</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0D162B] p-4 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Segmented Status Filter */}
          <div
            role="tablist"
            aria-label="Filter tasks by status"
            className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-[#070D1B] border border-slate-200/70 dark:border-slate-800 w-full sm:w-auto"
          >
            {(
              [
                { id: 'all', label: `All (${counts.all})` },
                { id: 'pending', label: `Pending (${counts.pending})` },
                { id: 'completed', label: `Completed (${counts.completed})` },
              ] as const
            ).map((tab) => {
              const active = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`flex-1 sm:flex-initial min-h-[36px] px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                    active
                      ? 'bg-white dark:bg-[#131F3D] text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative flex-1 lg:max-w-sm">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks, notes, or subject..."
              aria-label="Search tasks"
              className="w-full min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070D1B] pl-10 pr-9 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Secondary Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <div className="flex items-center gap-2">
            <label htmlFor="filter-subject" className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Subject
            </label>
            <select
              id="filter-subject"
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="min-h-[36px] rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070D1B] px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="all">All subjects</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.code ? `${sub.code} — ${sub.name}` : sub.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="filter-priority" className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Priority
            </label>
            <select
              id="filter-priority"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="min-h-[36px] rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070D1B] px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="all">All priorities</option>
              <option value="high">High priority</option>
              <option value="medium">Medium priority</option>
              <option value="low">Low priority</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="sort-tasks" className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Sort
            </label>
            <select
              id="sort-tasks"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="min-h-[36px] rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070D1B] px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="dueDate">Due date</option>
              <option value="priority">Priority</option>
              <option value="title">Alphabetical</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs font-medium text-violet-600 dark:text-violet-400 hover:underline ml-auto"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Task List */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0D162B] overflow-hidden">
        {filteredTasks.length === 0 ? (
          <div className="py-16 px-6 text-center">
            <p className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
              {tasks.length === 0 ? 'No study tasks yet' : 'No matching tasks found'}
            </p>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              {tasks.length === 0
                ? 'Break your coursework into concrete tasks with due dates and focus estimates.'
                : 'Try adjusting your search query or status filters.'}
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="min-h-[40px] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Clear Filters
                </button>
              )}
              <button
                type="button"
                onClick={onOpenNewTaskModal}
                className="min-h-[40px] px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white transition-colors"
              >
                {tasks.length === 0 ? 'Create First Task' : 'Add New Task'}
              </button>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredTasks.map((task) => {
              const subject = subjectMap.get(task.subjectId);
              const dueInfo = getRelativeDueInfo(task.dueDate);
              const isDeleting = confirmDeleteId === task.id;

              const priorityLabel =
                task.priority === 'high'
                  ? 'High priority'
                  : task.priority === 'medium'
                    ? 'Medium priority'
                    : 'Low priority';

              const priorityColor =
                task.priority === 'high'
                  ? 'text-rose-600 dark:text-rose-400'
                  : task.priority === 'medium'
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-slate-500 dark:text-slate-400';

              const dueColor = task.completed
                ? 'text-slate-400 dark:text-slate-500'
                : dueInfo.urgency === 'overdue'
                  ? 'text-rose-600 dark:text-rose-400'
                  : dueInfo.urgency === 'today'
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-slate-500 dark:text-slate-400';

              return (
                <li
                  key={task.id}
                  className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/25 transition-colors"
                >
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => onToggleTask(task.id)}
                      aria-label={
                        task.completed
                          ? `Mark "${task.title}" as pending`
                          : `Mark "${task.title}" as completed`
                      }
                      className={`mt-0.5 h-5 w-5 shrink-0 rounded-md border flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                        task.completed
                          ? 'bg-violet-600 border-violet-600 text-white'
                          : 'border-slate-300 dark:border-slate-600 text-transparent hover:border-violet-500'
                      }`}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>

                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-medium leading-snug ${
                          task.completed
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        {task.title}
                      </p>

                      {task.notes && (
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                          {task.notes}
                        </p>
                      )}

                      {/* Unboxed Metadata Row */}
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                        {subject && (
                          <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                            <span
                              className="h-2 w-2 rounded-xs shrink-0"
                              style={{ backgroundColor: subject.color }}
                              aria-hidden="true"
                            />
                            <span>{subject.name}</span>
                          </span>
                        )}
                        <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">
                          ·
                        </span>
                        <span className={`font-medium ${priorityColor}`}>{priorityLabel}</span>
                        <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">
                          ·
                        </span>
                        <span className={`inline-flex items-center gap-1 ${dueColor}`}>
                          {!task.completed && dueInfo.urgency === 'overdue' ? (
                            <AlertCircle className="h-3 w-3 shrink-0" />
                          ) : (
                            <Clock className="h-3 w-3 shrink-0" />
                          )}
                          <span>{task.completed ? 'Completed' : dueInfo.label}</span>
                        </span>
                        <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">
                          ·
                        </span>
                        <span className="font-mono-tabular text-slate-500 dark:text-slate-400">
                          Est. {formatMinutesCompact(task.estimatedMinutes)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Row Actions */}
                  <div className="flex items-center gap-1.5 sm:shrink-0 pl-8 sm:pl-0">
                    {!task.completed && (
                      <button
                        type="button"
                        onClick={() => onStartFocusOnTask(task.subjectId, task.id)}
                        title="Start Pomodoro session for this task"
                        className="min-h-[36px] px-2.5 py-1.5 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-300 hover:border-violet-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 transition-colors whitespace-nowrap"
                      >
                        <Play className="h-3.5 w-3.5" />
                        <span>Focus</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onOpenEditTaskModal(task)}
                      aria-label={`Edit "${task.title}"`}
                      className="min-h-[36px] min-w-[36px] inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

                    {isDeleting ? (
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteTask(task.id);
                            setConfirmDeleteId(null);
                          }}
                          className="min-h-[34px] px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white transition-colors whitespace-nowrap"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="min-h-[34px] px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(task.id)}
                        aria-label={`Delete "${task.title}"`}
                        className="min-h-[36px] min-w-[36px] inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
