import React, { useEffect, useState, useCallback } from 'react';
import {
  Plus, Trash2, Save, RefreshCw, Image, Link as LinkIcon,
  GripVertical, Eye, EyeOff, CheckCircle, AlertCircle, ImagePlus, ArrowUp, ArrowDown
} from 'lucide-react';
import { apiService } from '../../services/api';

interface Slide {
  src: string;
  label: string;
  name: string;
  price: string;
  original: string;
  linkUrl: string;
  _previewError?: boolean;
}

const EMPTY_SLIDE: Slide = {
  src: '',
  label: '',
  name: '',
  price: '',
  original: '',
  linkUrl: '/shop',
};

const AdminShowcasePage: React.FC = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [previewSlide, setPreviewSlide] = useState<number | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch current slides
  const fetchSlides = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiService.getShowcase();
      if (res.data.success) {
        setSlides(res.data.data);
      }
    } catch {
      showToast('error', 'Failed to load showcase slides');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSlides(); }, [fetchSlides]);

  const addSlide = () => setSlides(prev => [...prev, { ...EMPTY_SLIDE }]);

  const removeSlide = (idx: number) => {
    setSlides(prev => prev.filter((_, i) => i !== idx));
  };

  const moveSlide = (idx: number, dir: 'up' | 'down') => {
    setSlides(prev => {
      const arr = [...prev];
      const target = dir === 'up' ? idx - 1 : idx + 1;
      if (target < 0 || target >= arr.length) return prev;
      [arr[idx], arr[target]] = [arr[target], arr[idx]];
      return arr;
    });
  };

  const updateSlide = (idx: number, field: keyof Omit<Slide, '_previewError'>, value: string) => {
    setSlides(prev => prev.map((s, i) =>
      i === idx
        ? { ...s, [field]: value, _previewError: field === 'src' ? false : s._previewError }
        : s
    ));
  };

  const setPreviewError = (idx: number, hasError: boolean) => {
    setSlides(prev => prev.map((s, i) =>
      i === idx ? { ...s, _previewError: hasError } : s
    ));
  };

  const handleSave = async () => {
    const valid = slides.filter(s => s.src.trim());
    try {
      setSaving(true);
      const res = await apiService.updateShowcase(valid.map(({ _previewError, ...rest }) => rest));
      if (res.data.success) {
        showToast('success', valid.length > 0 ? `✅ ${valid.length} slide${valid.length !== 1 ? 's' : ''} saved! Hero reel updated.` : '✅ Hero reel cleared successfully!');
        setSlides(res.data.data);
      } else {
        showToast('error', res.data.message || 'Save failed');
      }
    } catch (err: any) {
      showToast('error', err?.response?.data?.message || 'Failed to save showcase');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-semibold border transition-all animate-slide-in
          ${toast.type === 'success'
            ? 'bg-emerald-950/90 border-emerald-700/50 text-emerald-300'
            : 'bg-red-950/90 border-red-700/50 text-red-300'}`}>
          {toast.type === 'success'
            ? <CheckCircle className="w-4 h-4 shrink-0" />
            : <AlertCircle className="w-4 h-4 shrink-0" />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Hero Showcase Reel</h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage the scrolling product images on the homepage hero section.
            Changes go live <span className="text-indigo-400 font-semibold">instantly</span> after saving.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchSlides}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white transition-all"
            title="Reload from server"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/25 transition-all"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save & Go Live'}
          </button>
        </div>
      </div>

      {/* Slide Count Banner */}
      <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800 rounded-2xl px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center">
            <ImagePlus className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <p className="text-white font-bold">{slides.length} slide{slides.length !== 1 ? 's' : ''} configured</p>
            <p className="text-slate-400 text-xs">Minimum 2 recommended for smooth looping</p>
          </div>
        </div>
        <button
          onClick={addSlide}
          className="flex items-center gap-2 bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-600/40 text-indigo-300 font-semibold text-sm px-4 py-2 rounded-xl transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Slide
        </button>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 bg-slate-900/40 border border-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Slides list */}
      {!loading && slides.length === 0 && (
        <div className="py-12 px-4 text-center bg-slate-900/40 border border-slate-800 rounded-2xl space-y-3">
          <p className="text-slate-300 font-bold text-sm">No Hero Showcase Slides Configured</p>
          <p className="text-slate-500 text-xs max-w-sm mx-auto">
            Click "+ Add Slide" below to configure custom slides, or click "Save & Go Live" to keep the hero showcase clear.
          </p>
        </div>
      )}

      {!loading && slides.length > 0 && (
        <div className="space-y-4">
          {slides.map((slide, idx) => (
            <div
              key={idx}
              className="group relative bg-slate-900/60 border border-slate-800 hover:border-indigo-600/40 rounded-2xl overflow-hidden transition-all"
            >
              {/* Slide number badge */}
              <div className="absolute top-4 left-4 w-7 h-7 rounded-full bg-indigo-600/30 border border-indigo-600/40 flex items-center justify-center text-xs font-bold text-indigo-300 z-10">
                {idx + 1}
              </div>

              <div className="flex flex-col sm:flex-row gap-0">
                {/* Image preview column */}
                <div className="relative w-full sm:w-52 h-40 shrink-0 bg-slate-950 overflow-hidden">
                  {slide.src && !slide._previewError ? (
                    <img
                      src={slide.src}
                      alt={slide.name || 'Preview'}
                      className="w-full h-full object-cover"
                      onError={() => setPreviewError(idx, true)}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-600">
                      <Image className="w-8 h-8" />
                      <span className="text-xs">{slide._previewError ? '⚠️ Invalid URL' : 'No image yet'}</span>
                    </div>
                  )}
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => setPreviewSlide(previewSlide === idx ? null : idx)}
                      className="p-2 bg-white/10 backdrop-blur rounded-lg text-white"
                    >
                      {previewSlide === idx ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Fields column */}
                <div className="flex-1 p-5 space-y-4">
                  {/* Image URL row */}
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                      <Image className="w-3.5 h-3.5" /> Image URL <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Paste image URL here — e.g. https://example.com/photo.jpg"
                      value={slide.src}
                      onChange={e => updateSlide(idx, 'src', e.target.value)}
                      onPaste={e => {
                        e.preventDefault();
                        const pasted = e.clipboardData.getData('text/plain').trim();
                        updateSlide(idx, 'src', pasted);
                      }}
                      className="w-full bg-slate-950/70 border border-slate-700 focus:border-indigo-500 text-white text-sm px-4 py-2.5 rounded-xl outline-none placeholder-slate-600 transition-colors font-mono"
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck={false}
                    />
                    {slide.src && (
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${slide._previewError ? 'bg-red-400' : 'bg-emerald-400'}`} />
                        <span className={`text-[10px] font-medium ${slide._previewError ? 'text-red-400' : 'text-emerald-400'}`}>
                          {slide._previewError ? 'Cannot load image — check the URL' : 'Image URL accepted'}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateSlide(idx, 'src', '')}
                          className="ml-auto text-[10px] text-slate-500 hover:text-red-400 transition-colors"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Row: label + name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Badge Label</label>
                      <input
                        type="text"
                        placeholder="e.g. Flagship Release"
                        value={slide.label}
                        onChange={e => updateSlide(idx, 'label', e.target.value)}
                        className="w-full bg-slate-950/70 border border-slate-700 focus:border-indigo-500 text-white text-sm px-4 py-2.5 rounded-xl outline-none placeholder-slate-600 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Product Name</label>
                      <input
                        type="text"
                        placeholder="e.g. MANIVYA Ultra Headphones"
                        value={slide.name}
                        onChange={e => updateSlide(idx, 'name', e.target.value)}
                        className="w-full bg-slate-950/70 border border-slate-700 focus:border-indigo-500 text-white text-sm px-4 py-2.5 rounded-xl outline-none placeholder-slate-600 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Row: price + original + linkUrl */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Selling Price</label>
                      <input
                        type="text"
                        placeholder="₹8,999"
                        value={slide.price}
                        onChange={e => updateSlide(idx, 'price', e.target.value)}
                        className="w-full bg-slate-950/70 border border-slate-700 focus:border-indigo-500 text-white text-sm px-4 py-2.5 rounded-xl outline-none placeholder-slate-600 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Original MRP</label>
                      <input
                        type="text"
                        placeholder="₹14,999"
                        value={slide.original}
                        onChange={e => updateSlide(idx, 'original', e.target.value)}
                        className="w-full bg-slate-950/70 border border-slate-700 focus:border-indigo-500 text-white text-sm px-4 py-2.5 rounded-xl outline-none placeholder-slate-600 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                        <LinkIcon className="w-3 h-3" /> Link URL
                      </label>
                      <input
                        type="text"
                        placeholder="/shop or /product/slug"
                        value={slide.linkUrl}
                        onChange={e => updateSlide(idx, 'linkUrl', e.target.value)}
                        className="w-full bg-slate-950/70 border border-slate-700 focus:border-indigo-500 text-white text-sm px-4 py-2.5 rounded-xl outline-none placeholder-slate-600 transition-colors font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Action buttons column */}
                <div className="flex sm:flex-col items-center justify-center gap-2 px-4 py-4 sm:py-6 border-t sm:border-t-0 sm:border-l border-slate-800">
                  <button
                    onClick={() => moveSlide(idx, 'up')}
                    disabled={idx === 0}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-400 hover:text-white transition-all"
                    title="Move up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveSlide(idx, 'down')}
                    disabled={idx === slides.length - 1}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-400 hover:text-white transition-all"
                    title="Move down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <div className="w-px h-4 bg-slate-700 hidden sm:block" />
                  <button
                    onClick={() => removeSlide(idx)}
                    className="p-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-400 hover:text-red-300 transition-all"
                    title="Remove slide"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Full preview (expanded) */}
              {previewSlide === idx && slide.src && !slide._previewError && (
                <div className="border-t border-slate-800 bg-slate-950 p-4">
                  <p className="text-xs text-slate-500 mb-3 font-semibold uppercase tracking-wider">Live Preview</p>
                  <div className="relative h-56 rounded-xl overflow-hidden">
                    <img src={slide.src} alt={slide.name} className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-md border-t border-slate-800/60 p-3 flex justify-between items-center">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-indigo-400 tracking-wider block">{slide.label || 'Badge Label'}</span>
                        <h4 className="text-xs font-bold text-white">{slide.name || 'Product Name'}</h4>
                        <p className="text-[11px] text-emerald-400 font-extrabold mt-0.5">
                          {slide.price || '₹0'} <span className="text-slate-500 line-through text-[10px]">{slide.original}</span>
                        </p>
                      </div>
                      <span className="bg-indigo-600 text-white text-[10px] font-semibold px-3 py-1.5 rounded-lg">Buy Now</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add slide button (bottom) */}
      {!loading && (
        <button
          onClick={addSlide}
          className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-slate-700 hover:border-indigo-600/50 hover:bg-indigo-600/5 text-slate-500 hover:text-indigo-400 rounded-2xl font-semibold text-sm transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Another Slide
        </button>
      )}

      {/* Save bar */}
      {!loading && slides.length > 0 && (
        <div className="sticky bottom-4 flex justify-center">
          <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl px-6 py-3.5 flex items-center gap-4 shadow-2xl">
            <p className="text-slate-400 text-sm">
              <span className="text-white font-bold">{slides.filter(s => s.src).length}</span> of{' '}
              <span className="text-white font-bold">{slides.length}</span> slides have images
            </p>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-lg shadow-indigo-600/25 transition-all"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Publishing...' : 'Save & Go Live'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminShowcasePage;
