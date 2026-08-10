import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Volume2, VolumeX, Sparkles, Film } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CategoryIntroModalProps {
  isOpen: boolean;
  categoryName: string;
  targetCategorySlug?: string;
  introVideo?: string;
  onClose: () => void;
}

const DEFAULT_CATEGORY_VIDEOS: Record<string, string> = {
  gelato: 'https://assets.mixkit.co/videos/preview/mixkit-scoop-of-delicious-chocolate-ice-cream-41564-large.mp4',
  ice: 'https://assets.mixkit.co/videos/preview/mixkit-scoop-of-delicious-chocolate-ice-cream-41564-large.mp4',
  icecream: 'https://assets.mixkit.co/videos/preview/mixkit-scoop-of-delicious-chocolate-ice-cream-41564-large.mp4',
  beverages: 'https://assets.mixkit.co/videos/preview/mixkit-pouring-cold-beverage-in-a-glass-41569-large.mp4',
  drink: 'https://assets.mixkit.co/videos/preview/mixkit-pouring-cold-beverage-in-a-glass-41569-large.mp4',
  snacks: 'https://assets.mixkit.co/videos/preview/mixkit-hands-taking-potato-chips-from-a-bowl-41571-large.mp4',
  chocolates: 'https://assets.mixkit.co/videos/preview/mixkit-melting-dark-chocolate-41565-large.mp4',
  choco: 'https://assets.mixkit.co/videos/preview/mixkit-melting-dark-chocolate-41565-large.mp4',
  dairy: 'https://assets.mixkit.co/videos/preview/mixkit-pouring-milk-into-a-glass-41568-large.mp4',
  milk: 'https://assets.mixkit.co/videos/preview/mixkit-pouring-milk-into-a-glass-41568-large.mp4',
  fashion: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-in-stylish-clothes-41575-large.mp4',
  accessories: 'https://assets.mixkit.co/videos/preview/mixkit-close-up-of-silver-jewelry-and-accessories-41576-large.mp4',
  keychain: 'https://assets.mixkit.co/videos/preview/mixkit-close-up-of-silver-jewelry-and-accessories-41576-large.mp4',
  notebooks: 'https://assets.mixkit.co/videos/preview/mixkit-writing-notes-in-a-leather-journal-41578-large.mp4',
  stationery: 'https://assets.mixkit.co/videos/preview/mixkit-writing-notes-in-a-leather-journal-41578-large.mp4',
  coffeecups: 'https://assets.mixkit.co/videos/preview/mixkit-barista-pouring-coffee-into-a-ceramic-cup-41566-large.mp4',
  coffee: 'https://assets.mixkit.co/videos/preview/mixkit-barista-pouring-coffee-into-a-ceramic-cup-41566-large.mp4',
  facewash: 'https://assets.mixkit.co/videos/preview/mixkit-skincare-product-being-applied-to-face-41580-large.mp4',
  skincare: 'https://assets.mixkit.co/videos/preview/mixkit-skincare-product-being-applied-to-face-41580-large.mp4',
};

export const CategoryIntroModal: React.FC<CategoryIntroModalProps> = ({
  isOpen,
  categoryName,
  targetCategorySlug = '',
  introVideo = '',
  onClose,
}) => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [fadingOut, setFadingOut] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);

  const fadeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const safetyTimerRef = useRef<NodeJS.Timeout | null>(null);

  const targetSlug = targetCategorySlug || categoryName;
  const targetPath = `/shop?category=${encodeURIComponent(targetSlug)}`;

  // Find effective video URL or fallback video stream
  const effectiveVideo = useMemo(() => {
    if (introVideo && introVideo.trim() !== '') return introVideo.trim();
    const slugStr = (targetCategorySlug || categoryName || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const [key, url] of Object.entries(DEFAULT_CATEGORY_VIDEOS)) {
      if (slugStr.includes(key)) return url;
    }
    return DEFAULT_CATEGORY_VIDEOS.gelato;
  }, [introVideo, targetCategorySlug, categoryName]);

  const finishAndNavigate = useCallback(() => {
    document.body.style.overflow = '';

    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);

    if (videoRef.current) {
      videoRef.current.pause();
    }

    onClose();
    navigate(targetPath);
  }, [navigate, targetPath, onClose]);

  const handleStartFadeOut = useCallback(() => {
    setFadingOut(true);
    fadeTimerRef.current = setTimeout(() => {
      finishAndNavigate();
    }, 350);
  }, [finishAndNavigate]);

  useEffect(() => {
    if (!isOpen) {
      setFadingOut(false);
      setVideoError(false);
      setProgress(0);
      return;
    }

    document.body.style.overflow = 'hidden';

    // Safety timer: auto navigate after 8s max
    safetyTimerRef.current = setTimeout(() => {
      handleStartFadeOut();
    }, 8000);

    // If fallback teaser is active (or video error), run smooth progress bar
    if (videoError || !effectiveVideo) {
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const pct = Math.min(100, (elapsed / 2200) * 100);
        setProgress(pct);
        if (pct >= 100) {
          clearInterval(interval);
          handleStartFadeOut();
        }
      }, 40);
      return () => clearInterval(interval);
    }

    return () => {
      document.body.style.overflow = '';
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
      if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
    };
  }, [isOpen, videoError, effectiveVideo, handleStartFadeOut]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: fadingOut ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[99999] bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto select-none"
        onClick={finishAndNavigate}
      >
        {/* Floating Responsive Video Theater Card */}
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: fadingOut ? 0.95 : 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl bg-slate-900 border border-white/20 rounded-3xl shadow-[0_30px_90px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Card Header Bar */}
          <div className="p-3.5 sm:p-4 bg-slate-950/95 border-b border-white/10 flex justify-between items-center gap-3">
            <div className="flex items-center space-x-2 truncate">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="text-xs font-black uppercase tracking-wider text-white truncate">
                {categoryName} Experience
              </span>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              {effectiveVideo && !videoError && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMuted(!isMuted);
                    if (videoRef.current) videoRef.current.muted = !isMuted;
                  }}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-full border border-white/10 transition-all text-xs"
                  title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
              )}

              <button
                type="button"
                onClick={finishAndNavigate}
                className="bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs px-3.5 py-1.5 rounded-full shadow-lg transition-all flex items-center gap-1 group"
              >
                <span>Explore Products</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Video Container with Proportional Aspect Ratio */}
          <div className="relative w-full aspect-video max-h-[50vh] bg-black flex items-center justify-center overflow-hidden">
            {effectiveVideo && !videoError ? (
              <video
                ref={videoRef}
                preload="auto"
                playsInline
                muted={isMuted}
                autoPlay
                onTimeUpdate={() => {
                  if (videoRef.current && videoRef.current.duration) {
                    setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
                  }
                }}
                onEnded={handleStartFadeOut}
                onError={() => {
                  console.warn('[CategoryIntroModal] Video stream error, running animated fallback');
                  setVideoError(true);
                }}
                className="w-full h-full object-cover bg-black"
              >
                <source src={effectiveVideo} type="video/mp4" />
                <source src={effectiveVideo} type="video/webm" />
              </video>
            ) : (
              /* Sleek Teaser Card if video stream fails or is offline */
              <div className="py-10 px-6 text-center max-w-md mx-auto space-y-4">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 p-0.5 shadow-xl shadow-indigo-500/30 flex items-center justify-center">
                  <div className="w-full h-full rounded-2xl bg-slate-950/80 backdrop-blur-md flex items-center justify-center text-white">
                    <Sparkles className="w-6 h-6 text-indigo-400 animate-spin-slow" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-extrabold text-white">
                    {categoryName}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Opening curated products catalog...
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Card Footer Progress Bar */}
          <div className="p-3 bg-slate-950/95 border-t border-white/10 flex flex-col items-center">
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-1.5">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-100 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between items-center w-full text-[10px] text-slate-400 font-medium">
              <span className="flex items-center gap-1">
                <Film className="w-3 h-3 text-indigo-400" /> Category Showcase
              </span>
              <span>Redirecting to {categoryName}...</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
