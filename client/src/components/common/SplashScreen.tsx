import React, { useEffect, useState, useRef, useCallback } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// MANIVYA Responsive High-Definition Cinematic Intro Animation
// - Desktop / PC / TV (16:9): /maniintro4/ (240 high-res frames)
// - Mobile / Phone / Portrait (9:16): /maniintro44/ (200 high-res frames)
// ─────────────────────────────────────────────────────────────────────────────

interface SplashScreenProps {
  onComplete: () => void;
}

const TARGET_FPS = 35; // ~28.5ms per frame for smooth playback
const FRAME_DURATION_MS = 1000 / TARGET_FPS;

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'playing' | 'hold' | 'transition' | 'done'>('playing');
  const [progressPct, setProgressPct] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const currentFrameRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);
  const lastDrawnImageRef = useRef<HTMLImageElement | null>(null);

  // Fast direct Ref cache for preloaded images (bypasses React state overhead)
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);

  // Detect Mobile / Phone (9:16) vs Desktop / PC (16:9)
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const isPortrait = window.innerHeight > window.innerWidth;
    const isSmallScreen = window.innerWidth < 768;
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    return isPortrait || isSmallScreen || isMobileUA;
  });

  const folder = isMobile ? '/maniintro44' : '/maniintro4';
  const totalFrames = isMobile ? 200 : 240;
  const totalFramesRef = useRef<number>(totalFrames);

  // Re-check orientation/device type on window resize before playback completes
  useEffect(() => {
    const checkDevice = () => {
      const isPortrait = window.innerHeight > window.innerWidth;
      const isSmallScreen = window.innerWidth < 768;
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const mobileStatus = isPortrait || isSmallScreen || isMobileUA;
      setIsMobile(mobileStatus);
    };

    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Preload frames in background using direct Ref storage
  useEffect(() => {
    let isMounted = true;
    imagesRef.current = new Array(totalFrames).fill(null);
    totalFramesRef.current = totalFrames;

    const getFrameUrl = (index: number) => {
      const frameNum = String(index + 1).padStart(3, '0');
      return `${folder}/ezgif-frame-${frameNum}.jpg`;
    };

    for (let i = 0; i < totalFrames; i++) {
      const img = new Image();
      img.src = getFrameUrl(i);
      img.onload = () => {
        if (isMounted) {
          imagesRef.current[i] = img;
        }
      };
    }

    return () => {
      isMounted = false;
    };
  }, [folder, totalFrames]);

  // Canvas Frame Rendering Logic (High DPR Cover Fit + Image Sharpening)
  const drawFrame = useCallback((img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Use double device pixel ratio for crisp super-sampled sharpness
    const dpr = Math.max(window.devicePixelRatio || 1, 2);
    const displayWidth = window.innerWidth;
    const displayHeight = window.innerHeight;

    const targetW = Math.floor(displayWidth * dpr);
    const targetH = Math.floor(displayHeight * dpr);

    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, displayWidth, displayHeight);

    // Force ultra-high quality image smoothing & sharpness
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const imgWidth = img.naturalWidth || img.width;
    const imgHeight = img.naturalHeight || img.height;

    if (imgWidth && imgHeight) {
      const imgAspect = imgWidth / imgHeight;
      const screenAspect = displayWidth / displayHeight;

      let drawW = displayWidth;
      let drawH = displayHeight;
      let offsetX = 0;
      let offsetY = 0;

      if (screenAspect > imgAspect) {
        drawH = displayWidth / imgAspect;
        offsetY = (displayHeight - drawH) / 2;
      } else {
        drawW = displayHeight * imgAspect;
        offsetX = (displayWidth - drawW) / 2;
      }

      ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
    }

    ctx.restore();
  }, []);

  // Frame Sequence Playback Loop
  useEffect(() => {
    if (phase !== 'playing') return;

    currentFrameRef.current = 0;
    lastFrameTimeRef.current = performance.now();

    const renderLoop = (timestamp: number) => {
      const elapsed = timestamp - lastFrameTimeRef.current;
      const currentTotalFrames = totalFramesRef.current;

      if (elapsed >= FRAME_DURATION_MS) {
        lastFrameTimeRef.current = timestamp - (elapsed % FRAME_DURATION_MS);

        const frameIndex = currentFrameRef.current;
        if (frameIndex < currentTotalFrames) {
          // Update visual progress percentage
          setProgressPct(Math.round(((frameIndex + 1) / currentTotalFrames) * 100));

          // Try current frame or fallback to last rendered frame to prevent blank frames/blur
          const currentImg = imagesRef.current[frameIndex] || lastDrawnImageRef.current;
          if (currentImg) {
            drawFrame(currentImg);
            lastDrawnImageRef.current = currentImg;
          }

          currentFrameRef.current++;
        } else {
          // Reached end of sequence
          setPhase('hold');
          return;
        }
      }

      animFrameRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [phase, drawFrame]);

  // Handle Window Resize during animation
  useEffect(() => {
    const handleResize = () => {
      const currentFrame = Math.max(0, currentFrameRef.current - 1);
      const currentImg = imagesRef.current[currentFrame] || lastDrawnImageRef.current;
      if (currentImg && phase === 'playing') {
        drawFrame(currentImg);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [phase, drawFrame]);

  // Hold Phase -> Transition Phase -> Done
  useEffect(() => {
    if (phase === 'hold') {
      const holdTimer = setTimeout(() => {
        setPhase('transition');
      }, 400); // 400ms hold on final crisp frame

      return () => clearTimeout(holdTimer);
    }

    if (phase === 'transition') {
      const transTimer = setTimeout(() => {
        setPhase('done');
        onComplete();
      }, 900); // 900ms smooth fade out

      return () => clearTimeout(transTimer);
    }
  }, [phase, onComplete]);

  // Skip functionality & Keyboard handler
  const handleSkip = useCallback(() => {
    if (phase === 'done' || phase === 'transition') return;
    setPhase('transition');
  }, [phase]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ') {
        handleSkip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSkip]);

  if (phase === 'done') return null;

  const isTransitioning = phase === 'transition';

  return (
    <div
      className="splash-overlay fixed inset-0 z-[99999] overflow-hidden select-none bg-[#04010a]"
      style={{
        pointerEvents: isTransitioning ? 'none' : 'all',
        opacity: isTransitioning ? 0 : 1,
        transform: isTransitioning ? 'scale(1.015)' : 'scale(1)',
        transition: 'opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1), transform 0.9s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      {/* High-Contrast Canvas Frame Renderer with Hardware-Accelerated Sharpening Filter */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover block"
        style={{
          filter: 'contrast(1.08) brightness(1.04) saturate(1.12)',
          imageRendering: '-webkit-optimize-contrast',
        }}
      />

      {/* Top Progress Beam Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-black/40 z-30 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400 transition-all duration-75 ease-out shadow-[0_0_12px_#818cf8]"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Ultra-Sharp High-End HUD / Brand Overlay */}
      <div className="absolute bottom-8 left-6 sm:left-10 z-30 flex items-center space-x-4 pointer-events-none">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-amber-500 p-0.5 shadow-[0_0_25px_rgba(99,102,241,0.5)] flex items-center justify-center">
          <div className="w-full h-full bg-slate-950/90 rounded-2xl flex items-center justify-center">
            <span className="font-black text-amber-400 text-base tracking-tighter drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]">
              M
            </span>
          </div>
        </div>

        <div className="space-y-0.5">
          <div className="flex items-center space-x-2">
            <h1 className="text-white font-extrabold text-xs sm:text-sm tracking-[0.2em] uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              MANIVYA ENTERPRISES
            </h1>
            <span className="bg-indigo-600/80 text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded-full border border-indigo-400/40 shadow-sm">
              {isMobile ? '9:16 MOBILE HD' : '16:9 DESKTOP HD'}
            </span>
          </div>
          <p className="text-slate-300 text-[11px] font-medium tracking-wider drop-shadow flex items-center gap-2">
            <span>Curated Luxury Storefront</span>
            <span className="text-amber-400 font-mono font-bold">{progressPct}%</span>
          </p>
        </div>
      </div>

      {/* Skip Button with Glow Border */}
      <button
        onClick={handleSkip}
        className="absolute top-6 right-6 z-30 flex items-center gap-2 px-4 py-2 rounded-full bg-black/50 hover:bg-black/80 border border-purple-500/40 hover:border-purple-400 text-white text-xs font-bold tracking-widest backdrop-blur-xl shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all duration-300 hover:scale-105 active:scale-95 group cursor-pointer"
        title="Press Space or Esc to skip"
      >
        <span>SKIP INTRO</span>
        <svg className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 5l7 7-m0 0l-7 7m7-7H3" />
        </svg>
      </button>

      {/* Sharp Edge Vignette */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_120px_rgba(0,0,0,0.7)]" />
    </div>
  );
};

export default SplashScreen;

