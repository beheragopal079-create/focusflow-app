export type AppView =
  | 'dashboard'
  | 'tasks'
  | 'timer'
  | 'analytics'
  | 'subjects'
  | 'notes'
  | 'settings';

export type TaskPriority = 'high' | 'medium' | 'low';

export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

export type ThemeMode = 'dark' | 'light';

export interface Subject {
  id: string;
  name: string;
  code: string;
  color: string; // Hex color for crisp chart & swatch encoding
  weeklyTargetHours: number;
}

export interface StudyTask {
  id: string;
  title: string;
  subjectId: string;
  priority: TaskPriority;
  dueDate: string; // YYYY-MM-DD
  completed: boolean;
  completedAt: string | null;
  estimatedMinutes: number;
  notes: string;
  createdAt: string;
}

export interface StudyNote {
  id: string;
  title: string;
  content: string;
  subjectId: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudySession {
  id: string;
  subjectId: string;
  taskId?: string;
  durationMinutes: number;
  date: string; // YYYY-MM-DD
  completedAt: string; // ISO string
  type: 'pomodoro' | 'manual';
}

export interface UserPreferences {
  studentName: string;
  academicTrack: string;
  avatarUrl: string;
  dailyGoalMinutes: number;
  focusDurationMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  soundEnabled: boolean;
  browserNotificationsEnabled: boolean;
  theme: ThemeMode;
}

export interface AppState {
  subjects: Subject[];
  tasks: StudyTask[];
  notes: StudyNote[];
  sessions: StudySession[];
  preferences: UserPreferences;
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  tone?: 'info' | 'success' | 'warning';
}
