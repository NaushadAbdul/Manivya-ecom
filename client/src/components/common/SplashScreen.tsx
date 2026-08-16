import React, { useEffect, useState, useRef, useCallback } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// MANIVYA High-End Cinematic 200-Frame Sequence Intro Animation
// Plays 200 high-resolution frames from /manivyaintro3/ instantly on Canvas
// without any loading screen interruptions.
// ─────────────────────────────────────────────────────────────────────────────

interface SplashScreenProps {
  onComplete: () => void;
}

const TOTAL_FRAMES = 200;
const TARGET_FPS = 35; // ~28.5ms per frame for smooth ~5.7s sequence
const FRAME_DURATION_MS = 1000 / TARGET_FPS;

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'playing' | 'hold' | 'transition' | 'done'>('playing');
  const [images, setImages] = useState<HTMLImageElement[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const currentFrameRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);

  // Preload frames in background while playing immediately
  useEffect(() => {
    let isMounted = true;
    const loadedImages: HTMLImageElement[] = new Array(TOTAL_FRAMES);

    const getFrameUrl = (index: number) => {
      const frameNum = String(index + 1).padStart(3, '0');
      return `/manivyaintro3/ezgif-frame-${frameNum}.jpg`;
    };

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = getFrameUrl(i);
      img.onload = () => {
        if (isMounted) {
          loadedImages[i] = img;
          setImages([...loadedImages]);
        }
      };
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // Canvas Frame Rendering Logic (Aspect-ratio Cover Fit)
  const drawFrame = useCallback((img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const displayWidth = window.innerWidth;
    const displayHeight = window.innerHeight;

    if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, displayWidth, displayHeight);

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

      if (elapsed >= FRAME_DURATION_MS) {
        lastFrameTimeRef.current = timestamp - (elapsed % FRAME_DURATION_MS);

        const frameIndex = currentFrameRef.current;
        if (frameIndex < TOTAL_FRAMES) {
          const currentImg = images[frameIndex];
          if (currentImg) {
            drawFrame(currentImg);
          }
          currentFrameRef.current++;
        } else {
          // Reached end of 200 frames
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
  }, [phase, images, drawFrame]);

  // Handle Resize during animation
  useEffect(() => {
    const handleResize = () => {
      const currentImg = images[currentFrameRef.current - 1] || images[0];
      if (currentImg && phase === 'playing') {
        drawFrame(currentImg);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [images, phase, drawFrame]);

  // Hold Phase -> Transition Phase -> Done
  useEffect(() => {
    if (phase === 'hold') {
      const holdTimer = setTimeout(() => {
        setPhase('transition');
      }, 400); // 400ms hold on final frame

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
      className="splash-overlay fixed inset-0 z-[9999] overflow-hidden select-none bg-[#080212]"
      style={{
        pointerEvents: isTransitioning ? 'none' : 'all',
        opacity: isTransitioning ? 0 : 1,
        transform: isTransitioning ? 'scale(1.02)' : 'scale(1)',
        transition: 'opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1), transform 0.9s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      {/* Background Ambient Radial Glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 100% 100% at 50% 50%, rgba(90, 35, 200, 0.2) 0%, rgba(8,2,18,0.95) 85%)',
        }}
      />

      {/* Canvas Frame Renderer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover block"
      />

      {/* Skip Button */}
      <button
        onClick={handleSkip}
        className="absolute top-6 right-6 z-30 flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 hover:bg-black/70 border border-white/10 hover:border-purple-500/50 text-white/70 hover:text-white text-xs font-medium tracking-wider backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 group"
        title="Press Space or Esc to skip"
      >
        <span>SKIP INTRO</span>
        <svg className="w-3.5 h-3.5 text-purple-400 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-m0 0l-7 7m7-7H3" />
        </svg>
      </button>

      {/* Subtle Vignette Overlay */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.6)]" />
    </div>
  );
};

export default SplashScreen;
