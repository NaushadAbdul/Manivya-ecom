import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, X } from 'lucide-react';

export const isIceCreamCategory = (categoryInput?: { name?: string; slug?: string } | string | null): boolean => {
  if (!categoryInput) return false;
  const str = typeof categoryInput === 'string' ? categoryInput : `${categoryInput.name || ''} ${categoryInput.slug || ''}`;
  const lower = str.toLowerCase();
  return lower.includes('ice cream') || lower.includes('icecream') || lower.includes('ice-cream');
};

interface IceCreamIntroModalProps {
  isOpen: boolean;
  targetCategorySlug?: string;
  onClose: () => void;
}

export const IceCreamIntroModal: React.FC<IceCreamIntroModalProps> = ({
  isOpen,
  targetCategorySlug = 'amul-ice-creams',
  onClose,
}) => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [showSkip, setShowSkip] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const skipTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fadeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const targetPath = `/shop?category=${targetCategorySlug}`;

  const finishAndNavigate = useCallback(() => {
    // Restore scrolling
    document.body.style.overflow = '';

    // Clear timers
    if (skipTimerRef.current) clearTimeout(skipTimerRef.current);
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);

    // Pause video
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }

    onClose();
    navigate(targetPath);
  }, [navigate, targetPath, onClose]);

  const handleStartFadeOut = useCallback(() => {
    setFadingOut(true);
    fadeTimerRef.current = setTimeout(() => {
      finishAndNavigate();
    }, 350); // 350ms smooth fade-out duration
  }, [finishAndNavigate]);

  useEffect(() => {
    if (!isOpen) {
      setShowSkip(false);
      setFadingOut(false);
      setVideoError(false);
      return;
    }

    // Disable scrolling while intro plays
    document.body.style.overflow = 'hidden';

    // Show Skip button after 1 second
    skipTimerRef.current = setTimeout(() => {
      setShowSkip(true);
    }, 1000);

    // Attempt video playback
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('[IceCreamIntro] Autoplay prevented or error:', err);
          // If video fails to autoplay/load, skip cleanly without error
          finishAndNavigate();
        });
      }
    }

    return () => {
      document.body.style.overflow = '';
      if (skipTimerRef.current) clearTimeout(skipTimerRef.current);
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, [isOpen, finishAndNavigate]);

  if (!isOpen || videoError) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] bg-black flex items-center justify-center transition-opacity duration-350 ease-in-out ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        pointerEvents: fadingOut ? 'none' : 'auto',
      }}
    >
      {/* Skip Button (appears after 1 second) */}
      {showSkip && (
        <button
          onClick={finishAndNavigate}
          className="absolute top-6 right-6 z-[100001] bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-2 rounded-full backdrop-blur-xl border border-white/20 shadow-2xl transition-all duration-300 flex items-center gap-1.5 group animate-fade-in"
        >
          <span>Skip</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}

      {/* Video Stream Container */}
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          preload="auto"
          playsInline
          muted
          autoPlay
          onEnded={handleStartFadeOut}
          onError={() => {
            console.warn('[IceCreamIntro] Video error encountered, skipping intro.');
            setVideoError(true);
            finishAndNavigate();
          }}
          className="w-full h-full object-cover sm:object-contain"
        >
          {/* Primary local file path */}
          <source src="/ice-cream-intro.mp4" type="video/mp4" />
          {/* Public streaming CDN fallback */}
          <source
            src="https://assets.mixkit.co/videos/preview/mixkit-scoop-of-delicious-chocolate-ice-cream-41564-large.mp4"
            type="video/mp4"
          />
        </video>

        {/* Subtle vignette gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-radial-gradient from-transparent via-black/20 to-black/80" />
      </div>
    </div>
  );
};
