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
      onClick={handleSkip}
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

      {/* Sharp Edge Vignette */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_120px_rgba(0,0,0,0.7)]" />
    </div>
  );
};

export default SplashScreen;

