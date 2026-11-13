import { useId } from 'react';

export type LogoVariant = 'wordmark' | 'icon' | 'transparent' | 'favicon';

interface FocusFlowLogoProps {
  variant?: LogoVariant;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function FocusFlowLogo({
  variant = 'wordmark',
  size = 'md',
  className = '',
}: FocusFlowLogoProps) {
  const uid = useId().replace(/:/g, '');

  const markPixelSize =
    size === 'sm' ? 28 : size === 'lg' ? 48 : 36;

  const textSizeClass =
    size === 'sm'
      ? 'text-sm tracking-[0.14em]'
      : size === 'lg'
        ? 'text-xl tracking-[0.16em]'
        : 'text-base tracking-[0.15em]';

  const renderMarkSvg = (simplified: boolean, withSquareBackdrop: boolean) => (
    <svg
      width={markPixelSize}
      height={markPixelSize}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      <defs>
        <linearGradient
          id={`orbit-${uid}`}
          x1="10"
          y1="54"
          x2="54"
          y2="10"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="55%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#F8FAFC" />
        </linearGradient>

        <linearGradient
          id={`letter-${uid}`}
          x1="22"
          y1="17"
          x2="44"
          y2="47"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#F8FAFC" />
          <stop offset="60%" stopColor="#BAE6FD" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>

        <radialGradient
          id={`node-glow-${uid}`}
          cx="50%"
          cy="50%"
          r="50%"
        >
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
          <stop offset="45%" stopColor="#38BDF8" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
        </radialGradient>
      </defs>

      {withSquareBackdrop && (
        <>
          <rect width="64" height="64" rx="16" fill="#070D1B" />
          <rect
            x="0.75"
            y="0.75"
            width="62.5"
            height="62.5"
            rx="15.25"
            stroke="#38BDF8"
            strokeOpacity="0.18"
            strokeWidth="1.5"
          />
        </>
      )}

      {/* Subtle inner trajectory ring */}
      {!simplified && (
        <circle
          cx="32"
          cy="32"
          r="18.2"
          stroke="#7C3AED"
          strokeOpacity="0.28"
          strokeWidth="1"
          strokeDasharray="3 5"
        />
      )}

      {/* Primary open orbital ring */}
      <circle
        cx="32"
        cy="32"
        r="22.5"
        stroke={`url(#orbit-${uid})`}
        strokeWidth={simplified ? 3.5 : 2.8}
        strokeLinecap="round"
        strokeDasharray={simplified ? '118 24' : '118 23.5'}
        transform="rotate(-38 32 32)"
      />

      {/* Precision directional tick at ring tail */}
      {!simplified && (
        <path
          d="M14.2 44.5L11.8 46.8"
          stroke="#7C3AED"
          strokeWidth="2"
          strokeLinecap="round"
          strokeOpacity="0.85"
        />
      )}

      {/* Custom Geometric F integrated into the orbital field */}
      <path
        d="M24.2 19.5H42.2L39.4 24.8H29.8V29.8H37.8L35.4 34.8H29.8V45.2H24.2V19.5Z"
        fill={withSquareBackdrop || simplified ? `url(#letter-${uid})` : 'currentColor'}
      />

      {/* Luminous focal point riding the orbital arc */}
      {!simplified && (
        <circle cx="48.8" cy="17.6" r="6.5" fill={`url(#node-glow-${uid})`} />
      )}
      <circle cx="48.8" cy="17.6" r={simplified ? 3.4 : 2.9} fill="#38BDF8" />
      <circle cx="48.8" cy="17.6" r={simplified ? 1.5 : 1.35} fill="#FFFFFF" />
    </svg>
  );

  if (variant === 'icon') {
    return (
      <span className={`inline-flex items-center justify-center shrink-0 ${className}`}>
        {renderMarkSvg(false, true)}
      </span>
    );
  }

  if (variant === 'favicon') {
    return (
      <span className={`inline-flex items-center justify-center shrink-0 ${className}`}>
        {renderMarkSvg(true, true)}
      </span>
    );
  }

  if (variant === 'transparent') {
    return (
      <span
        className={`inline-flex items-center justify-center shrink-0 text-slate-900 dark:text-slate-50 ${className}`}
      >
        {renderMarkSvg(false, false)}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-2.5 shrink-0 select-none ${className}`}>
      {renderMarkSvg(false, true)}
      <span
        className={`font-display font-bold ${textSizeClass} text-slate-900 dark:text-slate-50 whitespace-nowrap`}
      >
        FOCUSFLOW
      </span>
    </span>
  );
}
