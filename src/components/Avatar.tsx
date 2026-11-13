import { useState } from 'react';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Avatar({ src, name, size = 'md' }: AvatarProps) {
  const [hasError, setHasError] = useState(false);

  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'FF';

  const sizeClass =
    size === 'sm'
      ? 'h-8 w-8 text-xs'
      : size === 'lg'
        ? 'h-16 w-16 text-lg'
        : 'h-9 w-9 text-xs';

  if (!src || hasError) {
    return (
      <div
        className={`${sizeClass} shrink-0 rounded-xl bg-violet-600/15 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300 border border-violet-500/25 flex items-center justify-center font-display font-semibold select-none`}
        aria-label={name}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={`${sizeClass} shrink-0 rounded-xl object-cover border border-slate-200 dark:border-slate-700/80 bg-slate-200 dark:bg-slate-800`}
    />
  );
}
