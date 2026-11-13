import { useEffect, useMemo, useState } from 'react';
import { Pin, Plus, Search, Trash2, X } from 'lucide-react';
import { StudyNote, Subject } from '../types/study';

interface NotesViewProps {
  notes: StudyNote[];
  subjects: Subject[];
  onAddNote: (input: Omit<StudyNote, 'id' | 'createdAt' | 'updatedAt'>) => StudyNote;
  onUpdateNote: (id: string, updates: Partial<Omit<StudyNote, 'id' | 'createdAt'>>) => void;
  onDeleteNote: (id: string) => void;
}

export function NotesView({
  notes,
  subjects,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
}: NotesViewProps) {
  const [selectedNoteId, setSelectedNoteId] = useState<string>(() => notes[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const subjectMap = useMemo(() => {
    const map = new Map<string, Subject>();
    subjects.forEach((s) => map.set(s.id, s));
    return map;
  }, [subjects]);

  const filteredNotes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return [...notes]
      .filter((n) => {
        if (subjectFilter !== 'all' && n.subjectId !== subjectFilter) return false;
        if (q) {
          return (
            n.title.toLowerCase().includes(q) ||
            n.content.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return b.updatedAt.localeCompare(a.updatedAt);
      });
  }, [notes, searchQuery, subjectFilter]);

  useEffect(() => {
    if (notes.length > 0 && !notes.some((n) => n.id === selectedNoteId)) {
      setSelectedNoteId(notes[0].id);
    }
    setConfirmDelete(false);
  }, [notes, selectedNoteId]);

  const activeNote = notes.find((n) => n.id === selectedNoteId) || null;

  const handleCreateNote = () => {
    const created = onAddNote({
      title: 'Untitled Study Note',
      content: '',
      subjectId: subjectFilter !== 'all' ? subjectFilter : subjects[0]?.id || '',
      pinned: false,
    });
    setSelectedNoteId(created.id);
    setConfirmDelete(false);
  };

  const wordCount = activeNote
    ? activeNote.content
        .trim()
        .split(/\s+/)
        .filter(Boolean).length
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            Personal Notes
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Capture lecture takeaways, formulas, and exam summaries—automatically saved.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateNote}
          className="min-h-[42px] px-4 py-2 inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white shadow-sm shadow-violet-600/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>New Note</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Master List (4 cols) */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0D162B] flex flex-col overflow-hidden min-h-[420px]">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 space-y-2.5">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes..."
                aria-label="Search notes"
                className="w-full min-h-[38px] rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070D1B] pl-9 pr-8 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              aria-label="Filter notes by subject"
              className="w-full min-h-[36px] rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070D1B] px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="all">All subjects</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.code ? `${sub.code} — ${sub.name}` : sub.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredNotes.length === 0 ? (
              <div className="py-12 px-5 text-center">
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {notes.length === 0 ? 'No notes yet' : 'No matching notes'}
                </p>
                <button
                  type="button"
                  onClick={handleCreateNote}
                  className="mt-3 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline"
                >
                  Create a note
                </button>
              </div>
            ) : (
              filteredNotes.map((note) => {
                const sub = subjectMap.get(note.subjectId);
                const isSelected = activeNote?.id === note.id;
                const updatedLabel = new Date(note.updatedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                });

                return (
                  <button
                    key={note.id}
                    type="button"
                    onClick={() => {
                      setSelectedNoteId(note.id);
                      setConfirmDelete(false);
                    }}
                    className={`w-full text-left px-4 py-3.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-500 ${
                      isSelected
                        ? 'bg-violet-600/10 dark:bg-violet-500/15'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {note.title || 'Untitled Note'}
                      </p>
                      {note.pinned && (
                        <Pin className="h-3.5 w-3.5 shrink-0 text-violet-600 dark:text-violet-400" />
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                      {note.content.trim() || 'Empty note'}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      {sub && (
                        <span className="inline-flex items-center gap-1.5 truncate">
                          <span
                            className="h-2 w-2 rounded-xs shrink-0"
                            style={{ backgroundColor: sub.color }}
                            aria-hidden="true"
                          />
                          <span className="truncate">{sub.code || sub.name}</span>
                        </span>
                      )}
                      {sub && <span aria-hidden="true">·</span>}
                      <span className="font-mono-tabular shrink-0">{updatedLabel}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Note Editor (8 cols) */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0D162B] flex flex-col min-h-[480px]">
          {!activeNote ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <p className="font-display text-base font-semibold text-slate-900 dark:text-white">
                Select or create a study note
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                Keep lecture outlines, formula sheets, and essay drafts organized alongside your courses.
              </p>
              <button
                type="button"
                onClick={handleCreateNote}
                className="mt-5 min-h-[40px] px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white transition-colors"
              >
                Create First Note
              </button>
            </div>
          ) : (
            <>
              {/* Editor Toolbar */}
              <div className="px-6 py-3.5 border-b border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <select
                    value={activeNote.subjectId}
                    onChange={(e) => onUpdateNote(activeNote.id, { subjectId: e.target.value })}
                    aria-label="Note subject"
                    className="min-h-[36px] rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070D1B] px-3 py-1 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="">General</option>
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.code ? `${sub.code} — ${sub.name}` : sub.name}
                      </option>
                    ))}
                  </select>

                  <span className="text-xs font-mono-tabular text-slate-400 dark:text-slate-500">
                    {wordCount} {wordCount === 1 ? 'word' : 'words'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onUpdateNote(activeNote.id, { pinned: !activeNote.pinned })}
                    aria-pressed={activeNote.pinned}
                    className={`min-h-[36px] px-3 py-1.5 inline-flex items-center gap-1.5 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap ${
                      activeNote.pinned
                        ? 'border-violet-500/40 bg-violet-500/10 text-violet-700 dark:text-violet-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Pin className="h-3.5 w-3.5" />
                    <span>{activeNote.pinned ? 'Pinned' : 'Pin'}</span>
                  </button>

                  {confirmDelete ? (
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteNote(activeNote.id);
                          setConfirmDelete(false);
                        }}
                        className="min-h-[36px] px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white"
                      >
                        Confirm Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(false)}
                        className="min-h-[36px] px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(true)}
                      aria-label="Delete note"
                      className="min-h-[36px] min-w-[36px] inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-500/40 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Editor Inputs */}
              <div className="flex-1 flex flex-col p-6 space-y-4">
                <input
                  type="text"
                  value={activeNote.title}
                  onChange={(e) => onUpdateNote(activeNote.id, { title: e.target.value })}
                  placeholder="Note title..."
                  aria-label="Note title"
                  className="w-full bg-transparent font-display text-xl font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                />

                <textarea
                  value={activeNote.content}
                  onChange={(e) => onUpdateNote(activeNote.id, { content: e.target.value })}
                  placeholder="Start writing lecture notes, key formulas, or study outlines..."
                  aria-label="Note content"
                  className="flex-1 min-h-[320px] w-full bg-transparent text-sm leading-relaxed text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none resize-none"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
