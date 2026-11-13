import { AppState, Subject } from '../types/study';
import { addDaysISO, toISODate } from '../utils/dateUtils';

export const SUBJECT_COLOR_PALETTE = [
  { name: 'Electric Violet', hex: '#8B5CF6' },
  { name: 'Soft Blue', hex: '#3B82F6' },
  { name: 'Cyan', hex: '#06B6D4' },
  { name: 'Emerald', hex: '#10B981' },
  { name: 'Amber', hex: '#F59E0B' },
  { name: 'Rose', hex: '#F43F5E' },
  { name: 'Indigo', hex: '#6366F1' },
];

export const MOTIVATIONAL_QUOTES = [
  {
    text: 'Deep focus is a quiet compound interest: twenty-five uninterrupted minutes today saves two scattered hours tomorrow.',
    context: 'Focus Principle',
  },
  {
    text: 'Clarity comes from finishing one defined problem set before opening the next tab.',
    context: 'Study Rhythm',
  },
  {
    text: 'Consistency beats marathon cramming. Protect your daily baseline, even on busy days.',
    context: 'Daily Habit',
  },
  {
    text: 'Small, visible progress on hard subjects builds durable confidence before exam week.',
    context: 'Momentum',
  },
  {
    text: 'Plan the work in calm moments; execute the plan in focused blocks.',
    context: 'Execution',
  },
];

export function createInitialSeedState(): AppState {
  const now = new Date();
  const today = toISODate(now);

  const subjects: Subject[] = [
    {
      id: 'sub-alg',
      name: 'Algorithms & Data Structures',
      code: 'CS 301',
      color: '#8B5CF6',
      weeklyTargetHours: 8,
    },
    {
      id: 'sub-calc',
      name: 'Linear Algebra & Calculus',
      code: 'MATH 240',
      color: '#3B82F6',
      weeklyTargetHours: 6,
    },
    {
      id: 'sub-sys',
      name: 'Operating Systems',
      code: 'CS 342',
      color: '#06B6D4',
      weeklyTargetHours: 5,
    },
    {
      id: 'sub-bio',
      name: 'Cognitive Neuroscience',
      code: 'NEUR 210',
      color: '#10B981',
      weeklyTargetHours: 4,
    },
    {
      id: 'sub-econ',
      name: 'Macroeconomic Policy',
      code: 'ECON 205',
      color: '#F59E0B',
      weeklyTargetHours: 4,
    },
  ];

  const tasks = [
    {
      id: 'task-1',
      title: 'Implement Dijkstra & A* shortest-path benchmarks',
      subjectId: 'sub-alg',
      priority: 'high' as const,
      dueDate: today,
      completed: false,
      completedAt: null,
      estimatedMinutes: 75,
      notes: 'Compare binary heap vs Fibonacci heap runtime on sparse graphs.',
      createdAt: addDaysISO(now, -3) + 'T09:00:00.000Z',
    },
    {
      id: 'task-2',
      title: 'Complete Eigenvalues & Spectral Theorem problem set 6',
      subjectId: 'sub-calc',
      priority: 'high' as const,
      dueDate: addDaysISO(now, 1),
      completed: false,
      completedAt: null,
      estimatedMinutes: 60,
      notes: 'Review symmetric matrix orthogonal diagonalization proofs.',
      createdAt: addDaysISO(now, -2) + 'T11:30:00.000Z',
    },
    {
      id: 'task-3',
      title: 'Read Chapter 9: Virtual Memory & Page Replacement',
      subjectId: 'sub-sys',
      priority: 'medium' as const,
      dueDate: addDaysISO(now, 2),
      completed: false,
      completedAt: null,
      estimatedMinutes: 50,
      notes: 'Summarize LRU approximation and Clock algorithm trade-offs.',
      createdAt: addDaysISO(now, -2) + 'T14:00:00.000Z',
    },
    {
      id: 'task-4',
      title: 'Draft lab reflection on working memory fMRI datasets',
      subjectId: 'sub-bio',
      priority: 'medium' as const,
      dueDate: addDaysISO(now, 3),
      completed: false,
      completedAt: null,
      estimatedMinutes: 45,
      notes: 'Include dorsolateral prefrontal cortex activation summary.',
      createdAt: addDaysISO(now, -1) + 'T10:15:00.000Z',
    },
    {
      id: 'task-5',
      title: 'Annotate central bank inflation targeting case study',
      subjectId: 'sub-econ',
      priority: 'low' as const,
      dueDate: addDaysISO(now, 5),
      completed: false,
      completedAt: null,
      estimatedMinutes: 40,
      notes: 'Focus on Taylor Rule deviations in 2021–2024.',
      createdAt: addDaysISO(now, -1) + 'T16:20:00.000Z',
    },
    {
      id: 'task-6',
      title: 'Revise dynamic programming memoization patterns',
      subjectId: 'sub-alg',
      priority: 'medium' as const,
      dueDate: addDaysISO(now, 4),
      completed: false,
      completedAt: null,
      estimatedMinutes: 50,
      notes: 'Practice knapsack and edit-distance state transitions.',
      createdAt: today + 'T08:00:00.000Z',
    },
    {
      id: 'task-7',
      title: 'Solve Singular Value Decomposition worksheet',
      subjectId: 'sub-calc',
      priority: 'high' as const,
      dueDate: addDaysISO(now, -1),
      completed: true,
      completedAt: addDaysISO(now, -1) + 'T17:40:00.000Z',
      estimatedMinutes: 55,
      notes: 'Verified low-rank matrix approximation norms.',
      createdAt: addDaysISO(now, -4) + 'T09:00:00.000Z',
    },
    {
      id: 'task-8',
      title: 'Build multi-threaded producer-consumer lab mutex tests',
      subjectId: 'sub-sys',
      priority: 'high' as const,
      dueDate: addDaysISO(now, -2),
      completed: true,
      completedAt: addDaysISO(now, -2) + 'T19:15:00.000Z',
      estimatedMinutes: 90,
      notes: 'Passed deadlock stress test with 16 worker threads.',
      createdAt: addDaysISO(now, -5) + 'T12:00:00.000Z',
    },
    {
      id: 'task-9',
      title: 'Review synaptic plasticity & LTP flashcard deck',
      subjectId: 'sub-bio',
      priority: 'low' as const,
      dueDate: today,
      completed: true,
      completedAt: today + 'T09:10:00.000Z',
      estimatedMinutes: 30,
      notes: '94% recall accuracy across 48 cards.',
      createdAt: addDaysISO(now, -3) + 'T15:00:00.000Z',
    },
    {
      id: 'task-10',
      title: 'Plot IS-LM equilibrium shift scenarios for seminar',
      subjectId: 'sub-econ',
      priority: 'medium' as const,
      dueDate: addDaysISO(now, -1),
      completed: true,
      completedAt: addDaysISO(now, -1) + 'T13:20:00.000Z',
      estimatedMinutes: 35,
      notes: 'Prepared fiscal multiplier comparison chart.',
      createdAt: addDaysISO(now, -4) + 'T10:00:00.000Z',
    },
  ];

  const sessions = [
    // Today (3 sessions = 100 mins so daily goal 240m has crisp visible progress)
    {
      id: 'sess-t1',
      subjectId: 'sub-alg',
      taskId: 'task-1',
      durationMinutes: 50,
      date: today,
      completedAt: today + 'T09:30:00.000Z',
      type: 'pomodoro' as const,
    },
    {
      id: 'sess-t2',
      subjectId: 'sub-bio',
      taskId: 'task-9',
      durationMinutes: 25,
      date: today,
      completedAt: today + 'T10:15:00.000Z',
      type: 'pomodoro' as const,
    },
    {
      id: 'sess-t3',
      subjectId: 'sub-calc',
      taskId: 'task-2',
      durationMinutes: 45,
      date: today,
      completedAt: today + 'T11:20:00.000Z',
      type: 'pomodoro' as const,
    },
    // Yesterday (-1d): 175m
    {
      id: 'sess-y1',
      subjectId: 'sub-calc',
      durationMinutes: 75,
      date: addDaysISO(now, -1),
      completedAt: addDaysISO(now, -1) + 'T14:00:00.000Z',
      type: 'pomodoro' as const,
    },
    {
      id: 'sess-y2',
      subjectId: 'sub-econ',
      durationMinutes: 50,
      date: addDaysISO(now, -1),
      completedAt: addDaysISO(now, -1) + 'T16:00:00.000Z',
      type: 'pomodoro' as const,
    },
    {
      id: 'sess-y3',
      subjectId: 'sub-alg',
      durationMinutes: 50,
      date: addDaysISO(now, -1),
      completedAt: addDaysISO(now, -1) + 'T19:00:00.000Z',
      type: 'pomodoro' as const,
    },
    // -2d: 200m
    {
      id: 'sess-2d1',
      subjectId: 'sub-sys',
      durationMinutes: 100,
      date: addDaysISO(now, -2),
      completedAt: addDaysISO(now, -2) + 'T15:30:00.000Z',
      type: 'pomodoro' as const,
    },
    {
      id: 'sess-2d2',
      subjectId: 'sub-alg',
      durationMinutes: 50,
      date: addDaysISO(now, -2),
      completedAt: addDaysISO(now, -2) + 'T18:00:00.000Z',
      type: 'pomodoro' as const,
    },
    {
      id: 'sess-2d3',
      subjectId: 'sub-bio',
      durationMinutes: 50,
      date: addDaysISO(now, -2),
      completedAt: addDaysISO(now, -2) + 'T20:15:00.000Z',
      type: 'pomodoro' as const,
    },
    // -3d: 125m
    {
      id: 'sess-3d1',
      subjectId: 'sub-calc',
      durationMinutes: 75,
      date: addDaysISO(now, -3),
      completedAt: addDaysISO(now, -3) + 'T11:00:00.000Z',
      type: 'pomodoro' as const,
    },
    {
      id: 'sess-3d2',
      subjectId: 'sub-econ',
      durationMinutes: 50,
      date: addDaysISO(now, -3),
      completedAt: addDaysISO(now, -3) + 'T16:30:00.000Z',
      type: 'pomodoro' as const,
    },
    // -4d: 190m
    {
      id: 'sess-4d1',
      subjectId: 'sub-alg',
      durationMinutes: 90,
      date: addDaysISO(now, -4),
      completedAt: addDaysISO(now, -4) + 'T10:30:00.000Z',
      type: 'pomodoro' as const,
    },
    {
      id: 'sess-4d2',
      subjectId: 'sub-sys',
      durationMinutes: 50,
      date: addDaysISO(now, -4),
      completedAt: addDaysISO(now, -4) + 'T14:45:00.000Z',
      type: 'pomodoro' as const,
    },
    {
      id: 'sess-4d3',
      subjectId: 'sub-bio',
      durationMinutes: 50,
      date: addDaysISO(now, -4),
      completedAt: addDaysISO(now, -4) + 'T17:10:00.000Z',
      type: 'pomodoro' as const,
    },
    // -5d: 150m
    {
      id: 'sess-5d1',
      subjectId: 'sub-sys',
      durationMinutes: 75,
      date: addDaysISO(now, -5),
      completedAt: addDaysISO(now, -5) + 'T13:15:00.000Z',
      type: 'pomodoro' as const,
    },
    {
      id: 'sess-5d2',
      subjectId: 'sub-calc',
      durationMinutes: 75,
      date: addDaysISO(now, -5),
      completedAt: addDaysISO(now, -5) + 'T17:45:00.000Z',
      type: 'pomodoro' as const,
    },
    // -6d: 115m
    {
      id: 'sess-6d1',
      subjectId: 'sub-alg',
      durationMinutes: 65,
      date: addDaysISO(now, -6),
      completedAt: addDaysISO(now, -6) + 'T11:30:00.000Z',
      type: 'pomodoro' as const,
    },
    {
      id: 'sess-6d2',
      subjectId: 'sub-econ',
      durationMinutes: 50,
      date: addDaysISO(now, -6),
      completedAt: addDaysISO(now, -6) + 'T15:30:00.000Z',
      type: 'pomodoro' as const,
    },
  ];

  const notes = [
    {
      id: 'note-1',
      title: 'Graph Traversal & Shortest Path Complexity Cheatsheet',
      subjectId: 'sub-alg',
      pinned: true,
      content: `Key invariants before Friday's lab:

1. BFS (unweighted): O(V + E) time, guarantees shortest path in edge count.
2. Dijkstra (non-negative weights): O((V + E) log V) with binary heap. Never use with negative edge weights.
3. Bellman-Ford: O(VE), detects negative cycles on the V-th relaxation pass.
4. A* Search: f(n) = g(n) + h(n). Admissible heuristic h(n) never overestimates true distance to target.`,
      createdAt: addDaysISO(now, -4) + 'T10:00:00.000Z',
      updatedAt: today + 'T09:15:00.000Z',
    },
    {
      id: 'note-2',
      title: 'Spectral Theorem & Orthogonal Projections',
      subjectId: 'sub-calc',
      pinned: true,
      content: `If A is a real symmetric n x n matrix (A = A^T):
- All eigenvalues of A are real.
- Eigenvectors from distinct eigenvalues are strictly orthogonal.
- A is orthogonally diagonalizable: A = Q Λ Q^T where Q^-1 = Q^T.

Quick check for positive definiteness: all pivots > 0, all eigenvalues > 0, and x^T A x > 0 for all nonzero x.`,
      createdAt: addDaysISO(now, -3) + 'T15:00:00.000Z',
      updatedAt: addDaysISO(now, -1) + 'T16:45:00.000Z',
    },
    {
      id: 'note-3',
      title: 'Virtual Memory Page Replacement Comparison',
      subjectId: 'sub-sys',
      pinned: false,
      content: `Belady's Anomaly: FIFO can incur MORE page faults when allocated more physical frames. Stack algorithms like LRU never suffer from Belady's anomaly.

Clock (Second-Chance) Algorithm:
- Uses a single reference bit per frame in a circular buffer.
- On page fault, inspect hand pointer: if R=1, clear R=0 and advance; if R=0, evict frame.`,
      createdAt: addDaysISO(now, -2) + 'T14:20:00.000Z',
      updatedAt: addDaysISO(now, -2) + 'T14:20:00.000Z',
    },
    {
      id: 'note-4',
      title: 'Prefrontal Cortex Executive Control Notes',
      subjectId: 'sub-bio',
      pinned: false,
      content: `DLPFC (Dorsolateral Prefrontal Cortex) maintains task-relevant goals during delay intervals in working memory tasks.
Dopamine D1 receptor modulation follows an inverted-U curve: both insufficient and excessive catecholamine drive impair persistent firing.`,
      createdAt: addDaysISO(now, -1) + 'T11:00:00.000Z',
      updatedAt: addDaysISO(now, -1) + 'T11:30:00.000Z',
    },
  ];

  return {
    subjects,
    tasks,
    notes,
    sessions,
    preferences: {
      studentName: 'Maya Lin',
      academicTrack: 'B.S. Computer Science & Applied Math',
      avatarUrl: '/src/assets/images/student_profile_avatar_1794582960024.jpg',
      dailyGoalMinutes: 180, // 3 hours daily goal
      focusDurationMinutes: 25,
      shortBreakMinutes: 5,
      longBreakMinutes: 15,
      soundEnabled: true,
      browserNotificationsEnabled: false,
      theme: 'dark',
    },
  };
}
