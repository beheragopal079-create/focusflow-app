export function toISODate(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDaysISO(baseDate: Date, offsetDays: number): string {
  const copy = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  copy.setDate(copy.getDate() + offsetDays);
  return toISODate(copy);
}

export function formatLongDate(date: Date = new Date()): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatShortDate(isoDate: string): string {
  if (!isoDate) return 'No date';
  const [y, m, d] = isoDate.split('-').map(Number);
  if (!y || !m || !d) return isoDate;
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function getRelativeDueInfo(isoDate: string): {
  label: string;
  urgency: 'overdue' | 'today' | 'soon' | 'normal';
} {
  if (!isoDate) {
    return { label: 'No due date', urgency: 'normal' };
  }
  const today = new Date();
  const todayISO = toISODate(today);
  const tomorrowISO = addDaysISO(today, 1);

  if (isoDate < todayISO) {
    const [y, m, d] = isoDate.split('-').map(Number);
    const due = new Date(y, m - 1, d);
    const diffDays = Math.round((today.setHours(0, 0, 0, 0) - due.getTime()) / 86400000);
    return {
      label: diffDays === 1 ? 'Overdue by 1d' : `Overdue by ${diffDays}d`,
      urgency: 'overdue',
    };
  }
  if (isoDate === todayISO) {
    return { label: 'Due today', urgency: 'today' };
  }
  if (isoDate === tomorrowISO) {
    return { label: 'Due tomorrow', urgency: 'soon' };
  }

  const [y, m, d] = isoDate.split('-').map(Number);
  const due = new Date(y, m - 1, d);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const diffDays = Math.round((due.getTime() - startOfToday.getTime()) / 86400000);

  if (diffDays <= 3) {
    return { label: `In ${diffDays} days`, urgency: 'soon' };
  }
  return { label: formatShortDate(isoDate), urgency: 'normal' };
}

export function formatMinutesCompact(totalMinutes: number): string {
  const safe = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(safe / 60);
  const mins = safe % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function formatTimerSeconds(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function getTimeOfDayGreeting(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function getLastNDays(n: number): { iso: string; dayShort: string; dateLabel: string }[] {
  const result: { iso: string; dayShort: string; dateLabel: string }[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    result.push({
      iso: toISODate(d),
      dayShort: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dateLabel: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    });
  }
  return result;
}
