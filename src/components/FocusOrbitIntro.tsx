import { useEffect, useRef, useState } from 'react';

interface FocusOrbitIntroProps {
  onComplete: () => void;
}

export function FocusOrbitIntro({ onComplete }: FocusOrbitIntroProps) {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const finishedRef = useRef(false);

  const finishIntro = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onComplete();
  };

  useEffect(() => {
    // Respect prefers-reduced-motion accessibility preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      finishIntro();
      return;
    }

    const startTime = performance.now();
    let rafId = 0;

    const tick = (now: number) => {
      const dt = now - startTime;
      setElapsedMs(dt);

      if (dt >= 3500 && !isExiting) {
        setIsExiting(true);
      }

      if (dt >= 4050) {
        finishIntro();
        return;
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        finishIntro();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (window.innerWidth < 768) return;
    const nx = (e.clientX / window.innerWidth - 0.5) * 14;
    const ny = (e.clientY / window.innerHeight - 0.5) * 14;
    setParallax({ x: nx, y: ny });
  };

  // Scene choreography timeline (0 - 4000ms)
  // Scene 1: 0 - 700ms (The Void: single icy-blue focal point in center)
  // Scene 2: 700 - 1600ms (Orbital Formation: light travels circular path, fragments emerge & rotate)
  // Scene 3: 1600 - 2600ms (Logo Construction: fragments converge into F-orbit logo + edge pulse)
  // Scene 4: 2600 - 3500ms (Brand Reveal: FOCUSFLOW + tagline kinetic reveal)
  // Scene 5: 3500 - 4000ms (Transition: orbital ring expands into circular light reveal)

  const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);
  const easeInOutCubic = (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  // Scene 1: Center point emergence
  const voidDotOpacity = easeOutCubic(elapsedMs / 320);
  const voidDotScale = 0.25 + 0.75 * easeOutCubic(elapsedMs / 480);

  // Scene 2: Orbital travel (700ms -> 1750ms)
  const orbitT = easeInOutCubic(clamp01((elapsedMs - 680) / 1050));
  const orbitTrailDraw = easeOutCubic(clamp01((elapsedMs - 720) / 960));
  const orbitAngleDeg = -90 + orbitT * 315; // Sweeps cleanly into upper-right focal rest (-90 -> +225 -> -42deg equivalent)
  const orbitRadius = 22.5 * orbitT;
  const pointRad = (orbitAngleDeg * Math.PI) / 180;
  const focalX = 60 + orbitRadius * 1.45 * Math.cos(pointRad);
  const focalY = 60 + orbitRadius * 1.45 * Math.sin(pointRad);

  // Geometric fragments emerge during Scene 2 (850ms-1600ms) & converge into F in Scene 3 (1600ms-2400ms)
  const fragAppear = easeOutCubic(clamp01((elapsedMs - 820) / 550));
  const convergeT = easeInOutCubic(clamp01((elapsedMs - 1580) / 820));
  const fragmentRotation = (1 - convergeT) * 58;

  // Offsets for the 3 geometric strokes of F before converging
  const stemOffsetX = (1 - convergeT) * -22;
  const stemOffsetY = (1 - convergeT) * 14;
  const topArmOffsetX = (1 - convergeT) * 20;
  const topArmOffsetY = (1 - convergeT) * -18;
  const midArmOffsetX = (1 - convergeT) * 24;
  const midArmOffsetY = (1 - convergeT) * 14;

  // Scene 3 pulse along edges (2050ms - 2650ms)
  const pulseProgress = clamp01((elapsedMs - 2050) / 620);
  const pulseOpacity = pulseProgress > 0 && pulseProgress < 1 ? Math.sin(pulseProgress * Math.PI) : 0;

  // Scene 4: Brand reveal (2600ms - 3500ms)
  const titleT = easeOutCubic(clamp01((elapsedMs - 2580) / 480));
  const taglineT = easeOutCubic(clamp01((elapsedMs - 2900) / 480));

  // Scene 5: Circular expansion reveal (3500ms - 4050ms)
  const exitT = easeInOutCubic(clamp01((elapsedMs - 3500) / 520));
  const ringExpandScale = 1 + exitT * 24;
  const overlayOpacity = 1 - clamp01((elapsedMs - 3680) / 360);

  return (
    <div
      onPointerMove={handlePointerMove}
      role="dialog"
      aria-modal="true"
      aria-label="FOCUSFLOW Opening Sequence"
      style={{ opacity: overlayOpacity }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#050A17] text-slate-50 select-none"
    >
      {/* Layered subtle deep navy radial depth */}
      <div
        aria-hidden="true"
        style={{
          transform: `translate3d(${parallax.x * 0.4}px, ${parallax.y * 0.4}px, 0)`,
        }}
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_46%,rgba(56,189,248,0.09)_0%,rgba(124,58,237,0.06)_32%,rgba(5,10,23,1)_72%)] transition-transform duration-200 ease-out"
      />

      {/* Subtle architectural concentric guides with parallax */}
      <div
        aria-hidden="true"
        style={{
          transform: `translate3d(${parallax.x * 0.7}px, ${parallax.y * 0.7}px, 0)`,
          opacity: orbitTrailDraw * 0.22 * (1 - exitT),
        }}
        className="pointer-events-none absolute h-[380px] w-[380px] sm:h-[480px] sm:w-[480px] rounded-full border border-sky-400/15"
      />
      <div
        aria-hidden="true"
        style={{
          transform: `translate3d(${parallax.x * 0.35}px, ${parallax.y * 0.35}px, 0)`,
          opacity: orbitTrailDraw * 0.14 * (1 - exitT),
        }}
        className="pointer-events-none absolute h-[540px] w-[540px] sm:h-[660px] sm:w-[660px] rounded-full border border-violet-400/10"
      />

      {/* Center Stage: Orbital Formation + F-Orbit Logo Construction */}
      <div
        style={{
          transform: `translate3d(${parallax.x * -0.5}px, ${parallax.y * -0.5}px, 0)`,
        }}
        className="relative flex flex-col items-center justify-center px-6"
      >
        <div
          style={{
            transform: `scale(${1 - exitT * 0.08})`,
          }}
          className="relative flex items-center justify-center"
        >
          {/* Scene 5 Expanding Circular Light Transition Ring */}
          <div
            aria-hidden="true"
            style={{
              opacity: exitT > 0 ? Math.max(0, 0.9 - exitT * 0.7) : 0,
              transform: `scale(${ringExpandScale})`,
            }}
            className="pointer-events-none absolute h-24 w-24 rounded-full border-2 border-sky-300/80 shadow-[0_0_50px_rgba(56,189,248,0.55)]"
          />

          <svg
            width="136"
            height="136"
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="h-28 w-28 sm:h-34 sm:w-34 overflow-visible"
          >
            <defs>
              <linearGradient id="intro-orbit-grad" x1="20" y1="98" x2="98" y2="20" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#7C3AED" />
                <stop offset="55%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#F8FAFC" />
              </linearGradient>
              <linearGradient id="intro-f-grad" x1="42" y1="32" x2="78" y2="88" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="65%" stopColor="#BAE6FD" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
              <radialGradient id="intro-point-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                <stop offset="40%" stopColor="#38BDF8" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Inner precision dashed orbit */}
            <circle
              cx="60"
              cy="60"
              r="27"
              stroke="#7C3AED"
              strokeOpacity={0.35 * convergeT}
              strokeWidth="1.2"
              strokeDasharray="4 6"
            />

            {/* Scene 2: Luminous Orbital Trail */}
            <circle
              cx="60"
              cy="60"
              r="33.5"
              stroke="url(#intro-orbit-grad)"
              strokeWidth="3.6"
              strokeLinecap="round"
              strokeDasharray="176 36"
              strokeDashoffset={176 * (1 - orbitTrailDraw)}
              opacity={orbitTrailDraw}
              transform="rotate(-38 60 60)"
            />

            {/* Scene 3: Controlled Edge Light Pulse across the orbit */}
            <circle
              cx="60"
              cy="60"
              r="33.5"
              stroke="#FFFFFF"
              strokeWidth="4.6"
              strokeLinecap="round"
              strokeDasharray="42 180"
              strokeDashoffset={-190 * pulseProgress}
              opacity={pulseOpacity * 0.85}
              transform="rotate(-38 60 60)"
            />

            {/* Scene 2 & 3: Geometric F Fragments Rotating & Converging */}
            <g
              opacity={fragAppear}
              transform={`rotate(${fragmentRotation} 60 60)`}
            >
              {/* Vertical Stem */}
              <path
                d="M46.5 39H55.5V82H46.5V39Z"
                fill="url(#intro-f-grad)"
                transform={`translate(${stemOffsetX}, ${stemOffsetY})`}
              />
              {/* Top Swept Arm */}
              <path
                d="M52 39H76.5L72.2 47.2H52V39Z"
                fill="url(#intro-f-grad)"
                transform={`translate(${topArmOffsetX}, ${topArmOffsetY})`}
              />
              {/* Middle Precision Crossbar */}
              <path
                d="M52 55.5H69.5L65.6 63.2H52V55.5Z"
                fill="url(#intro-f-grad)"
                transform={`translate(${midArmOffsetX}, ${midArmOffsetY})`}
              />
            </g>

            {/* Scene 3 Controlled Luminous Edge Highlight on the F */}
            <path
              d="M46.5 82V39H76.5L72.2 47.2H55.5V55.5H69.5L65.6 63.2H55.5V82"
              stroke="#FFFFFF"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={pulseOpacity * 0.9}
            />

            {/* Scene 1 -> 3: Focal Point of Light */}
            <g opacity={voidDotOpacity}>
              <circle
                cx={orbitT < 0.02 ? 60 : focalX}
                cy={orbitT < 0.02 ? 60 : focalY}
                r={10 * voidDotScale}
                fill="url(#intro-point-glow)"
              />
              <circle
                cx={orbitT < 0.02 ? 60 : focalX}
                cy={orbitT < 0.02 ? 60 : focalY}
                r={4.2 * voidDotScale}
                fill="#38BDF8"
              />
              <circle
                cx={orbitT < 0.02 ? 60 : focalX}
                cy={orbitT < 0.02 ? 60 : focalY}
                r={2 * voidDotScale}
                fill="#FFFFFF"
              />
            </g>
          </svg>
        </div>

        {/* Scene 4: Brand Reveal */}
        <div className="mt-6 flex flex-col items-center text-center">
          <h1
            style={{
              opacity: titleT,
              transform: `translate3d(0, ${(1 - titleT) * 14}px, 0)`,
              letterSpacing: `${0.34 - titleT * 0.14}em`,
            }}
            className="font-display text-2xl sm:text-4xl font-bold text-white pl-[0.2em]"
          >
            FOCUSFLOW
          </h1>

          <p
            style={{
              opacity: taglineT,
              transform: `translate3d(0, ${(1 - taglineT) * 10}px, 0)`,
            }}
            className="mt-3 text-[11px] sm:text-xs font-medium tracking-[0.2em] text-sky-200/80 pl-[0.2em]"
          >
            PLAN SMARTER. FOCUS DEEPER. ACHIEVE MORE.
          </p>
        </div>
      </div>

      {/* Skip Intro Button */}
      <button
        type="button"
        onClick={finishIntro}
        className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 min-h-[40px] px-4 py-2 rounded-lg border border-slate-700/70 bg-slate-900/75 text-xs font-medium text-slate-300 hover:text-white hover:border-sky-400/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 transition-colors whitespace-nowrap shrink-0 backdrop-blur-sm"
      >
        Skip Intro
      </button>
    </div>
  );
}
