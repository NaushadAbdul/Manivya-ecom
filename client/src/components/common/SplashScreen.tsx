import React, { useEffect, useState, useRef, useCallback } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// MANIVYA High-End Opening Intro Animation
// Ultra-smooth sequential letter reveal with Vel spear gravity drop & bounce
// ─────────────────────────────────────────────────────────────────────────────

interface SplashScreenProps {
  onComplete: () => void;
}

const PARTICLE_COUNT = 50;
interface Particle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
  delay: number;
}

const generateParticles = (): Particle[] =>
  Array.from({ length: PARTICLE_COUNT }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    opacity: Math.random() * 0.5 + 0.15,
    speed: Math.random() * 16 + 12,
    delay: Math.random() * 3,
  }));

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<
    'black' | 'glow' | 'reveal' | 'landing' | 'hold' | 'transition' | 'done'
  >('black');
  const [particles] = useState<Particle[]>(generateParticles);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  // Volumetric Canvas Light Rays
  const drawLightRays = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const w = canvas.width;
    const h = canvas.height;
    const t = Date.now() * 0.0005;

    ctx.clearRect(0, 0, w, h);

    for (let i = 0; i < 7; i++) {
      const angle = (Math.PI / 7) * i + t * 0.2 + Math.sin(t + i) * 0.06;
      const x = w * 0.75 + Math.cos(angle) * w * 0.2;
      const gradient = ctx.createRadialGradient(x, 0, 0, x, 0, h * 1.3);
      gradient.addColorStop(0, `rgba(145, 75, 255, ${0.06 + Math.sin(t + i) * 0.02})`);
      gradient.addColorStop(0.5, `rgba(90, 35, 200, ${0.02 + Math.sin(t * 1.3 + i) * 0.01})`);
      gradient.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x - 70, 0);
      ctx.lineTo(x + 70, 0);
      ctx.lineTo(x + w * 0.35, h);
      ctx.lineTo(x - w * 0.35, h);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.restore();
    }

    animFrameRef.current = requestAnimationFrame(drawLightRays);
  }, []);

  // Timeline Phase Sequencing
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    // 0.4s: Black -> Glow
    timers.push(setTimeout(() => setPhase('glow'), 400));

    // 1.0s: Glow -> Reveal (Sequential letters start)
    timers.push(setTimeout(() => setPhase('reveal'), 1000));

    // 1.95s: Vel Tip Lands (Shockwave + Sparkles)
    timers.push(setTimeout(() => setPhase('landing'), 1950));

    // 2.8s: Full Hold with Pulsing Glow
    timers.push(setTimeout(() => setPhase('hold'), 2800));

    // 4.5s: Smooth Scale-Down & Glide Up (Homepage Fade-In)
    timers.push(setTimeout(() => setPhase('transition'), 4500));

    // 5.8s: Complete & Unmount
    timers.push(
      setTimeout(() => {
        setPhase('done');
        onComplete();
      }, 5800)
    );

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  // Start Canvas animation
  useEffect(() => {
    if (phase !== 'black' && phase !== 'done') {
      drawLightRays();
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [phase, drawLightRays]);

  if (phase === 'done') return null;

  const isStarted = phase !== 'black';
  const isLandingOrHold = phase === 'landing' || phase === 'hold' || phase === 'transition';
  const isTransitioning = phase === 'transition';

  return (
    <div
      className="splash-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        pointerEvents: isTransitioning ? 'none' : 'all',
        opacity: isTransitioning ? 0 : 1,
        transition: 'opacity 1.3s cubic-bezier(0.22, 1, 0.36, 1)',
        overflow: 'hidden',
      }}
    >
      {/* Pitch Black Screen Base */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: '#000000',
          opacity: phase === 'black' ? 1 : 0.75,
          transition: 'opacity 1.2s ease',
        }}
      />

      {/* Dynamic Purple Radial Ambient Background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: isStarted ? 1 : 0,
          transition: 'opacity 1.6s cubic-bezier(0.22, 1, 0.36, 1)',
          background: `
            radial-gradient(ellipse 130% 90% at 75% 15%, rgba(100, 30, 220, 0.48) 0%, transparent 65%),
            radial-gradient(ellipse 100% 100% at 50% 55%, rgba(70, 15, 150, 0.38) 0%, transparent 75%),
            radial-gradient(ellipse 80% 60% at 95% 90%, rgba(200, 160, 255, 0.2) 0%, transparent 55%),
            radial-gradient(ellipse 60% 45% at 5% 10%, rgba(0, 0, 0, 0.95) 0%, transparent 65%)
          `,
        }}
      />

      {/* Volumetric Canvas Light Rays */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: isStarted ? 0.8 : 0,
          transition: 'opacity 2s ease',
          pointerEvents: 'none',
        }}
      />

      {/* Floating Particles */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: isStarted ? 1 : 0,
          transition: 'opacity 1.5s ease 0.3s',
          pointerEvents: 'none',
        }}
      >
        {particles.map((p, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              background: `radial-gradient(circle, rgba(210, 195, 255, ${p.opacity}) 0%, rgba(140, 95, 255, ${p.opacity * 0.3}) 100%)`,
              boxShadow: `0 0 ${p.size * 3.5}px rgba(160, 120, 255, ${p.opacity * 0.6})`,
              animation: `splashFloat ${p.speed}s ease-in-out infinite`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Central Vector Logo Scene */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '90%',
            maxWidth: '820px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: isTransitioning
              ? 'scale(0.14) translateY(-44vh)'
              : 'scale(1) translateY(0)',
            transition: isTransitioning
              ? 'transform 1.3s cubic-bezier(0.22, 1, 0.36, 1)'
              : 'transform 1s cubic-bezier(0.22, 1, 0.36, 1)',
            willChange: 'transform',
          }}
        >
          {/* SVG Vector Logo with Sequential Letters & Vel Drop */}
          <svg
            viewBox="0 0 760 220"
            className="w-full h-auto overflow-visible"
            style={{
              filter: `
                drop-shadow(0 0 25px rgba(180, 130, 255, ${isLandingOrHold ? 0.9 : 0.4}))
                drop-shadow(0 0 60px rgba(130, 70, 255, ${isLandingOrHold ? 0.65 : 0.2}))
              `,
              transition: 'filter 0.8s ease',
            }}
          >
            <defs>
              {/* Neon Glow Filter */}
              <filter id="neonGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Vel Tip Gradient */}
              <linearGradient id="velGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#F0E8FF" />
              </linearGradient>
            </defs>

            {/* Letter: M */}
            <text
              x="30"
              y="170"
              fill="#FFFFFF"
              fontSize="120"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              letterSpacing="-2"
              className={isStarted ? 'anim-letter-m' : ''}
              style={{ opacity: 0 }}
            >
              M
            </text>

            {/* Letter: a (first) */}
            <text
              x="165"
              y="170"
              fill="#FFFFFF"
              fontSize="120"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              letterSpacing="-2"
              className={isStarted ? 'anim-letter-a1' : ''}
              style={{ opacity: 0 }}
            >
              a
            </text>

            {/* Letter: n */}
            <text
              x="265"
              y="170"
              fill="#FFFFFF"
              fontSize="120"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              letterSpacing="-2"
              className={isStarted ? 'anim-letter-n' : ''}
              style={{ opacity: 0 }}
            >
              n
            </text>

            {/* ── Letter 'i' (Divine Vel Spear) ── */}
            <g transform="translate(385, 0)">
              {/* Vel Stem / Shaft - Rises from bottom */}
              <g className={isStarted ? 'anim-vel-stem' : ''} style={{ opacity: 0 }}>
                {/* Main Shaft */}
                <rect x="18" y="96" width="8" height="78" rx="4" fill="#FFFFFF" />
                {/* Base Ring / Stand */}
                <circle cx="22" cy="174" r="7" fill="#FFFFFF" />
                {/* Decorative Shaft Rings */}
                <rect x="14" y="102" width="16" height="5" rx="2.5" fill="#FFFFFF" />
                <rect x="15" y="112" width="14" height="4" rx="2" fill="#FFFFFF" />
              </g>

              {/* Vel Spearhead Tip - Drops from top with Gravity & Bounce */}
              <g className={isStarted ? 'anim-vel-tip' : ''} style={{ opacity: 0 }}>
                {/* Leaf/Flame Spearhead */}
                <path
                  d="M 22 14 C 44 48, 45 84, 22 100 C -1 84, 0 48, 22 14 Z"
                  fill="url(#velGradient)"
                  filter="url(#neonGlow)"
                />

                {/* 3 Horizontal Vibhuti / Tripundra Lines inside Spearhead */}
                <line x1="10" y1="50" x2="34" y2="50" stroke="#1A0736" strokeWidth="3" strokeLinecap="round" />
                <line x1="10" y1="57" x2="34" y2="57" stroke="#1A0736" strokeWidth="3" strokeLinecap="round" />
                <line x1="10" y1="64" x2="34" y2="64" stroke="#1A0736" strokeWidth="3" strokeLinecap="round" />
                {/* Center Kumkum / Bindi Dot */}
                <circle cx="22" cy="57" r="2.5" fill="#FFD700" />
              </g>
            </g>

            {/* Letter: v */}
            <text
              x="455"
              y="170"
              fill="#FFFFFF"
              fontSize="120"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              letterSpacing="-2"
              className={isStarted ? 'anim-letter-v' : ''}
              style={{ opacity: 0 }}
            >
              v
            </text>

            {/* Letter: y */}
            <text
              x="545"
              y="170"
              fill="#FFFFFF"
              fontSize="120"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              letterSpacing="-2"
              className={isStarted ? 'anim-letter-y' : ''}
              style={{ opacity: 0 }}
            >
              y
            </text>

            {/* Letter: a (second) */}
            <text
              x="645"
              y="170"
              fill="#FFFFFF"
              fontSize="120"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              letterSpacing="-2"
              className={isStarted ? 'anim-letter-a2' : ''}
              style={{ opacity: 0 }}
            >
              a
            </text>
          </svg>

          {/* Shockwave Energy Ripple on Vel Landing */}
          {isLandingOrHold && (
            <>
              <div className="splash-ripple" style={{ left: '53.5%', top: '30%', animationDelay: '0s' }} />
              <div className="splash-ripple" style={{ left: '53.5%', top: '30%', animationDelay: '0.25s' }} />
            </>
          )}

          {/* Soft Pulsing Aura behind Center Logo */}
          <div
            style={{
              position: 'absolute',
              width: 440,
              height: 440,
              borderRadius: '50%',
              background:
                'radial-gradient(circle, rgba(130, 75, 250, 0.35) 0%, rgba(85, 30, 200, 0.12) 50%, transparent 75%)',
              opacity: isLandingOrHold ? 1 : 0,
              animation: isLandingOrHold ? 'splashPulse 2.4s ease-in-out infinite' : 'none',
              transition: 'opacity 1s ease',
              pointerEvents: 'none',
              zIndex: -1,
            }}
          />
        </div>
      </div>

      {/* ── Ultra-Smooth Keyframe CSS ── */}
      <style>{`
        @keyframes splashFloat {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.5; }
          25% { transform: translateY(-20px) translateX(8px); opacity: 0.8; }
          50% { transform: translateY(-35px) translateX(-5px); opacity: 0.3; }
          75% { transform: translateY(-15px) translateX(12px); opacity: 0.7; }
        }

        @keyframes splashPulse {
          0%, 100% { transform: scale(1); opacity: 0.65; }
          50% { transform: scale(1.18); opacity: 1; }
        }

        /* Sequential Letter Fade-In + Rise */
        @keyframes letterRise {
          0% { opacity: 0; transform: translateY(24px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .anim-letter-m  { animation: letterRise 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.2s forwards; }
        .anim-letter-a1 { animation: letterRise 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.35s forwards; }
        .anim-letter-n  { animation: letterRise 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.5s forwards; }

        /* Vel Stem Smooth Upward Rise */
        @keyframes velStemRise {
          0% { opacity: 0; transform: translateY(35px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .anim-vel-stem { animation: velStemRise 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.65s forwards; }

        /* Vel Spearhead Drop with Gravity & Bounce */
        @keyframes velTipGravityDrop {
          0% { opacity: 0; transform: translateY(-160px) rotate(-14deg); }
          65% { opacity: 1; transform: translateY(6px) rotate(2deg); }
          82% { transform: translateY(-4px) rotate(-1deg); }
          100% { opacity: 1; transform: translateY(0) rotate(0deg); }
        }
        .anim-vel-tip { animation: velTipGravityDrop 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.85s forwards; }

        .anim-letter-v  { animation: letterRise 0.6s cubic-bezier(0.22, 1, 0.36, 1) 1.0s forwards; }
        .anim-letter-y  { animation: letterRise 0.6s cubic-bezier(0.22, 1, 0.36, 1) 1.15s forwards; }
        .anim-letter-a2 { animation: letterRise 0.6s cubic-bezier(0.22, 1, 0.36, 1) 1.3s forwards; }

        /* Shockwave Energy Ripple */
        .splash-ripple {
          position: absolute;
          width: 140px;
          height: 140px;
          margin-left: -70px;
          margin-top: -70px;
          border-radius: 50%;
          border: 1.5px solid rgba(190, 150, 255, 0.6);
          animation: splashRippleExpand 1.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          pointer-events: none;
        }

        @keyframes splashRippleExpand {
          0% { transform: scale(0.2); opacity: 0.9; }
          100% { transform: scale(4); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
