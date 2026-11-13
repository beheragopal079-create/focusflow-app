import { useCallback, useEffect, useRef, useState } from 'react';
import { TimerMode } from '../types/study';
import { playCompletionChime } from '../utils/sound';

interface UsePomodoroTimerOptions {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  defaultSubjectId: string;
  soundEnabled: boolean;
  browserNotificationsEnabled: boolean;
  onSessionComplete: (payload: {
    mode: TimerMode;
    durationMinutes: number;
    subjectId: string;
    taskId?: string;
  }) => void;
}

export function usePomodoroTimer({
  focusMinutes,
  shortBreakMinutes,
  longBreakMinutes,
  defaultSubjectId,
  soundEnabled,
  browserNotificationsEnabled,
  onSessionComplete,
}: UsePomodoroTimerOptions) {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [isRunning, setIsRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(() => focusMinutes * 60);
  const [completedFocusCount, setCompletedFocusCount] = useState(0);
  const [selectedSubjectId, setSelectedSubjectId] = useState(defaultSubjectId);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');

  const getModeDurationSeconds = useCallback(
    (targetMode: TimerMode) => {
      if (targetMode === 'focus') return Math.max(1, focusMinutes) * 60;
      if (targetMode === 'shortBreak') return Math.max(1, shortBreakMinutes) * 60;
      return Math.max(1, longBreakMinutes) * 60;
    },
    [focusMinutes, shortBreakMinutes, longBreakMinutes]
  );

  // Keep selectedSubjectId valid if subjects change
  useEffect(() => {
    if (!selectedSubjectId && defaultSubjectId) {
      setSelectedSubjectId(defaultSubjectId);
    }
  }, [defaultSubjectId, selectedSubjectId]);

  // Update remaining time when preferences change while timer is idle at full duration
  const prevDurationsRef = useRef({ focusMinutes, shortBreakMinutes, longBreakMinutes });
  useEffect(() => {
    const prev = prevDurationsRef.current;
    const changed =
      prev.focusMinutes !== focusMinutes ||
      prev.shortBreakMinutes !== shortBreakMinutes ||
      prev.longBreakMinutes !== longBreakMinutes;
    if (changed && !isRunning) {
      setSecondsLeft(getModeDurationSeconds(mode));
    }
    prevDurationsRef.current = { focusMinutes, shortBreakMinutes, longBreakMinutes };
  }, [focusMinutes, shortBreakMinutes, longBreakMinutes, isRunning, mode, getModeDurationSeconds]);

  const handleComplete = useCallback(
    (completedMode: TimerMode, elapsedMinutes?: number) => {
      setIsRunning(false);
      if (soundEnabled) {
        playCompletionChime();
      }

      if (
        browserNotificationsEnabled &&
        typeof Notification !== 'undefined' &&
        Notification.permission === 'granted'
      ) {
        const title =
          completedMode === 'focus'
            ? 'Focus session complete'
            : completedMode === 'shortBreak'
              ? 'Short break finished'
              : 'Long break finished';
        const body =
          completedMode === 'focus'
            ? 'Great work. Your study minutes have been logged.'
            : 'Ready to start your next focus block.';
        try {
          new Notification(title, { body });
        } catch {
          // Ignore notification runtime restrictions
        }
      }

      const durationMins =
        elapsedMinutes ??
        (completedMode === 'focus'
          ? focusMinutes
          : completedMode === 'shortBreak'
            ? shortBreakMinutes
            : longBreakMinutes);

      onSessionComplete({
        mode: completedMode,
        durationMinutes: durationMins,
        subjectId: selectedSubjectId || defaultSubjectId,
        taskId: selectedTaskId || undefined,
      });

      if (completedMode === 'focus') {
        const nextCount = completedFocusCount + 1;
        setCompletedFocusCount(nextCount);
        const nextMode: TimerMode = nextCount % 4 === 0 ? 'longBreak' : 'shortBreak';
        setMode(nextMode);
        setSecondsLeft(getModeDurationSeconds(nextMode));
      } else {
        setMode('focus');
        setSecondsLeft(getModeDurationSeconds('focus'));
      }
    },
    [
      soundEnabled,
      browserNotificationsEnabled,
      focusMinutes,
      shortBreakMinutes,
      longBreakMinutes,
      onSessionComplete,
      selectedSubjectId,
      defaultSubjectId,
      selectedTaskId,
      completedFocusCount,
      getModeDurationSeconds,
    ]
  );

  // Interval countdown
  useEffect(() => {
    if (!isRunning) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          // Defer completion slightly so state update exits cleanly
          window.setTimeout(() => handleComplete(mode), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isRunning, mode, handleComplete]);

  const switchMode = useCallback(
    (nextMode: TimerMode) => {
      setIsRunning(false);
      setMode(nextMode);
      setSecondsLeft(getModeDurationSeconds(nextMode));
    },
    [getModeDurationSeconds]
  );

  const start = useCallback(() => setIsRunning(true), []);
  const pause = useCallback(() => setIsRunning(false), []);
  const toggle = useCallback(() => setIsRunning((prev) => !prev), []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setSecondsLeft(getModeDurationSeconds(mode));
  }, [mode, getModeDurationSeconds]);

  const finishEarly = useCallback(() => {
    const totalSeconds = getModeDurationSeconds(mode);
    const elapsedSeconds = Math.max(60, totalSeconds - secondsLeft);
    const elapsedMinutes = Math.max(1, Math.round(elapsedSeconds / 60));
    handleComplete(mode, elapsedMinutes);
  }, [mode, secondsLeft, getModeDurationSeconds, handleComplete]);

  const totalModeSeconds = getModeDurationSeconds(mode);
  const progressRatio =
    totalModeSeconds > 0 ? Math.min(1, Math.max(0, (totalModeSeconds - secondsLeft) / totalModeSeconds)) : 0;

  return {
    mode,
    isRunning,
    secondsLeft,
    totalModeSeconds,
    progressRatio,
    completedFocusCount,
    selectedSubjectId,
    selectedTaskId,
    setSelectedSubjectId,
    setSelectedTaskId,
    switchMode,
    start,
    pause,
    toggle,
    reset,
    finishEarly,
  };
}
