import React, { useState, useEffect } from 'react';
import { Palette, Upload, Image as ImageIcon, Sparkles, Check, RefreshCw, Layers, Sliders, Type } from 'lucide-react';
import { apiService } from '../../services/api';
import { SiteTheme } from '../../types';
import toast from 'react-hot-toast';

const PRESET_GRADIENTS = [
  {
    id: 'cosmic-amber',
    name: 'Cosmic Amber 3D',
    gradient: 'linear-gradient(135deg, #1c0d06 0%, #3a1a0b 50%, #140803 100%)',
    navbarGradient: 'linear-gradient(90deg, #1c0d06 0%, #2d140a 50%, #140803 100%)',
    color: '#1c0d06',
    navbarTextColor: '#ffffff',
    navbarAccentColor: '#fbbf24',
    textColor: '#f8fafc',
  },
  {
    id: 'midnight-purple',
    name: 'Midnight Purple 3D',
    gradient: 'linear-gradient(135deg, #0f0728 0%, #2a0f4e 50%, #0a041c 100%)',
    navbarGradient: 'linear-gradient(90deg, #0f0728 0%, #1d0b38 50%, #0a041c 100%)',
    color: '#0f0728',
    navbarTextColor: '#ffffff',
    navbarAccentColor: '#c084fc',
    textColor: '#f3e8ff',
  },
  {
    id: 'cyber-obsidian',
    name: 'Cyber Obsidian 3D',
    gradient: 'linear-gradient(135deg, #030712 0%, #111827 50%, #030712 100%)',
    navbarGradient: 'linear-gradient(90deg, #030712 0%, #0f172a 50%, #030712 100%)',
    color: '#030712',
    navbarTextColor: '#f8fafc',
    navbarAccentColor: '#38bdf8',
    textColor: '#f1f5f9',
  },
  {
    id: 'deep-emerald',
    name: 'Deep Emerald 3D',
    gradient: 'linear-gradient(135deg, #022c22 0%, #064e3b 50%, #022c22 100%)',
    navbarGradient: 'linear-gradient(90deg, #022c22 0%, #043f2e 50%, #022c22 100%)',
    color: '#022c22',
    navbarTextColor: '#ffffff',
    navbarAccentColor: '#34d399',
    textColor: '#ecfdf5',
  },
  {
    id: 'royal-sapphire',
    name: 'Royal Sapphire 3D',
    gradient: 'linear-gradient(135deg, #0b192c 0%, #1e3e62 50%, #000000 100%)',
    navbarGradient: 'linear-gradient(90deg, #0b192c 0%, #152942 50%, #000000 100%)',
    color: '#0b192c',
    navbarTextColor: '#ffffff',
    navbarAccentColor: '#60a5fa',
    textColor: '#eff6ff',
  },
  {
    id: 'ruby-velvet',
    name: 'Ruby Velvet 3D',
    gradient: 'linear-gradient(135deg, #2a0813 0%, #4a0e23 50%, #140308 100%)',
    navbarGradient: 'linear-gradient(90deg, #2a0813 0%, #360a18 50%, #140308 100%)',
    color: '#2a0813',
    navbarTextColor: '#ffffff',
    navbarAccentColor: '#f43f5e',
    textColor: '#fff1f2',
  },
];

const toHexColor = (val?: string, fallback = '#ffffff') => {
  if (!val) return fallback;
  const cleaned = val.trim();
  if (/^#([0-9A-F]{3}){1,2}$/i.test(cleaned)) {
    if (cleaned.length === 4) {
      return `#${cleaned[1]}${cleaned[1]}${cleaned[2]}${cleaned[2]}${cleaned[3]}${cleaned[3]}`;
    }
    return cleaned;
  }
  return fallback;
};

const FONT_COLOR_PALETTES = [
  { name: 'Classic White & Black', navText: '#ffffff', navAccent: '#ffffff', bodyText: '#ffffff' },
  { name: 'Pure White & Gold', navText: '#ffffff', navAccent: '#fbbf24', bodyText: '#f8fafc' },
  { name: 'Cyber Neon Cyan', navText: '#e0f2fe', navAccent: '#38bdf8', bodyText: '#f0f9ff' },
  { name: 'Emerald Mint', navText: '#ecfdf5', navAccent: '#34d399', bodyText: '#f0fdf4' },
  { name: 'Amethyst Purple', navText: '#faf5ff', navAccent: '#c084fc', bodyText: '#f3e8ff' },
  { name: 'Sunset Rose', navText: '#fff1f2', navAccent: '#fb7185', bodyText: '#fff5f5' },
];

export const AdminThemePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Theme Settings State
  const [presetId, setPresetId] = useState('cosmic-amber');
  const [bgType, setBgType] = useState<'gradient' | 'image' | 'color'>('gradient');
  const [navbarBgType, setNavbarBgType] = useState<'gradient' | 'image' | 'color'>('gradient');

  const [bgColor, setBgColor] = useState('#1c0d06');
  const [bgGradient, setBgGradient] = useState('linear-gradient(135deg, #1c0d06 0%, #3a1a0b 50%, #140803 100%)');
  const [bgImage, setBgImage] = useState('');

  const [navbarBgColor, setNavbarBgColor] = useState('#241108');
  const [navbarBgGradient, setNavbarBgGradient] = useState('linear-gradient(90deg, #1c0d06 0%, #2d140a 50%, #140803 100%)');
  const [navbarBgImage, setNavbarBgImage] = useState('');

  // Font Color State
  const [navbarTextColor, setNavbarTextColor] = useState('#ffffff');
  const [navbarAccentColor, setNavbarAccentColor] = useState('#fbbf24');
  const [textColor, setTextColor] = useState('#f8fafc');

  // Custom Color Builder State
  const [customStart, setCustomStart] = useState('#1c0d06');
  const [customEnd, setCustomEnd] = useState('#3a1a0b');

  const loadTheme = async () => {
    try {
      setLoading(true);
      const res = await apiService.getTheme();
      if (res.data && res.data.success && res.data.data) {
        const t: SiteTheme = res.data.data;
        setPresetId(t.presetId || 'cosmic-amber');
        setBgType(t.bgType || 'gradient');
        setNavbarBgType(t.navbarBgType || 'gradient');

        setBgColor(t.bgColor || '#1c0d06');
        setBgGradient(t.bgGradient || 'linear-gradient(135deg, #1c0d06 0%, #3a1a0b 50%, #140803 100%)');
        setBgImage(t.bgImage || '');

        setNavbarBgColor(t.navbarBgColor || '#241108');
        setNavbarBgGradient(t.navbarBgGradient || 'linear-gradient(90deg, #1c0d06 0%, #2d140a 50%, #140803 100%)');
        setNavbarBgImage(t.navbarBgImage || '');

        setNavbarTextColor(t.navbarTextColor || '#ffffff');
        setNavbarAccentColor(t.navbarAccentColor || '#fbbf24');
        setTextColor(t.textColor || '#f8fafc');
      }
    } catch (err) {
      toast.error('Failed to load theme settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTheme();
  }, []);

  const applyPreset = (preset: (typeof PRESET_GRADIENTS)[0]) => {
    setPresetId(preset.id);
    setBgType('gradient');
    setNavbarBgType('gradient');
    setBgGradient(preset.gradient);
    setNavbarBgGradient(preset.navbarGradient);
    setBgColor(preset.color);
    setNavbarBgColor(preset.color);
    setNavbarTextColor(preset.navbarTextColor);
    setNavbarAccentColor(preset.navbarAccentColor);
    setTextColor(preset.textColor);
    toast.success(`Applied ${preset.name}`);
  };

  const applyFontPalette = (pal: (typeof FONT_COLOR_PALETTES)[0]) => {
    setNavbarTextColor(pal.navText);
    setNavbarAccentColor(pal.navAccent);
    setTextColor(pal.bodyText);
    toast.success(`Applied ${pal.name} Font Colors`);
  };

  const applyCustomGradient = () => {
    const fullGrad = `linear-gradient(135deg, ${customStart} 0%, ${customEnd} 100%)`;
    const navGrad = `linear-gradient(90deg, ${customStart} 0%, ${customEnd} 100%)`;
    setBgType('gradient');
    setNavbarBgType('gradient');
    setBgGradient(fullGrad);
    setNavbarBgGradient(navGrad);
    setPresetId('custom');
    toast.success('Custom 3D Gradient created!');
  };

  const handleBgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setBgImage(event.target.result as string);
        setBgType('image');
        toast.success('Page Background Image attached!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleNavbarImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setNavbarBgImage(event.target.result as string);
        setNavbarBgType('image');
        toast.success('Navbar Background Image attached!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveTheme = async () => {
    try {
      setSaving(true);
      const res = await apiService.updateTheme({
        presetId,
        bgType,
        navbarBgType,
        bgColor,
        bgGradient,
        bgImage,
        navbarBgColor,
        navbarBgGradient,
        navbarBgImage,
        navbarTextColor,
        navbarAccentColor,
        textColor,
      });

      if (res.data && res.data.success) {
        toast.success('Theme, Background & Font Colors published live!');
        window.dispatchEvent(new Event('themeUpdated'));
      }
    } catch (err: any) {
      toast.error('Failed to save theme settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex justify-between items-center bg-slate-900/80 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Palette className="w-6 h-6 text-indigo-400" /> Storefront Theme, Navbar & Font Manager
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Customize navbar background, site background colors, uploaded background images, 3D gradients & font colors.
          </p>
        </div>

        <button
          onClick={handleSaveTheme}
          disabled={saving}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs px-6 py-3 rounded-2xl shadow-xl shadow-indigo-600/30 transition-all flex items-center space-x-2 disabled:opacity-50"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          <span>{saving ? 'Publishing Theme...' : 'Save & Publish Theme'}</span>
        </button>
      </div>

      {/* Real-time Interactive Live Preview */}
      <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-3xl space-y-3">
        <div className="flex justify-between items-center text-xs font-bold text-slate-300">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" /> Real-time Storefront Preview
          </span>
          <span className="text-[11px] text-slate-400 font-mono">Live Render Mockup</span>
        </div>

        <div
          className="w-full rounded-2xl overflow-hidden border border-white/20 shadow-2xl p-4 space-y-4 min-h-[180px] transition-all relative"
          style={{
            background:
              bgType === 'image' && bgImage
                ? `url(${bgImage}) center/cover no-repeat`
                : bgType === 'color'
                ? bgColor
                : bgGradient,
            color: textColor,
          }}
        >
          {/* Mock Navbar */}
          <div
            className="w-full rounded-xl p-3 border border-white/20 shadow-lg flex justify-between items-center transition-all"
            style={{
              background:
                navbarBgType === 'image' && navbarBgImage
                  ? `url(${navbarBgImage}) center/cover no-repeat`
                  : navbarBgType === 'color'
                  ? navbarBgColor
                  : navbarBgGradient,
              color: navbarTextColor,
            }}
          >
            <div className="flex items-center space-x-2">
              <div
                className="w-6 h-6 rounded-lg border flex items-center justify-center text-[10px] font-black"
                style={{ borderColor: navbarAccentColor, color: navbarAccentColor }}
              >
                M
              </div>
              <span className="text-xs font-extrabold tracking-wide" style={{ color: navbarTextColor }}>
                MANIVYA ENTERPRISES
              </span>
            </div>

            <div className="hidden sm:flex flex-1 max-w-xs mx-4 bg-black/40 border border-white/20 rounded-lg px-3 py-1 text-[11px] text-slate-300">
              Search premium products...
            </div>

            <div className="flex items-center space-x-2 text-[10px] font-bold">
              <span className="px-2 py-1 rounded-md" style={{ color: navbarTextColor, backgroundColor: 'rgba(255,255,255,0.15)' }}>
                Catalog
              </span>
              <span className="px-2 py-1 rounded-md" style={{ color: navbarAccentColor, backgroundColor: 'rgba(255,255,255,0.15)' }}>
                My Orders
              </span>
            </div>
          </div>

          {/* Mock Hero Content */}
          <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-xl p-6 text-center space-y-2 max-w-sm mx-auto my-4">
            <span className="text-xs font-extrabold block" style={{ color: textColor }}>
              DYNAMIC STOREFRONT PREVIEW
            </span>
            <span className="text-[11px] block opacity-80" style={{ color: textColor }}>
              Custom background, navbar gradients and font color themes active.
            </span>
          </div>
        </div>
      </div>

      {/* Font Color Controls Section */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
            <Type className="w-4 h-4 text-emerald-400" /> Font & Text Color Customization
          </h2>
          <span className="text-[11px] text-slate-400">Live Typography Palette</span>
        </div>

        {/* Font Color Presets */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 block">Quick Font Palette Presets</label>
          <div className="flex flex-wrap gap-2">
            {FONT_COLOR_PALETTES.map((pal) => (
              <button
                key={pal.name}
                type="button"
                onClick={() => applyFontPalette(pal)}
                className="bg-slate-950 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-xl text-xs flex items-center space-x-2 transition-all"
              >
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: pal.navText }} />
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: pal.navAccent }} />
                </div>
                <span className="text-slate-300 font-semibold">{pal.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Color Pickers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">Navbar Text Color</label>
            <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 rounded-xl p-2">
              <input
                type="color"
                value={toHexColor(navbarTextColor, '#ffffff')}
                onChange={(e) => setNavbarTextColor(e.target.value)}
                className="w-9 h-9 rounded-lg cursor-pointer bg-transparent border-0 shrink-0"
              />
              <input
                type="text"
                value={navbarTextColor}
                onChange={(e) => setNavbarTextColor(e.target.value)}
                placeholder="#ffffff"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">Navbar Accent / Link Color</label>
            <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 rounded-xl p-2">
              <input
                type="color"
                value={toHexColor(navbarAccentColor, '#fbbf24')}
                onChange={(e) => setNavbarAccentColor(e.target.value)}
                className="w-9 h-9 rounded-lg cursor-pointer bg-transparent border-0 shrink-0"
              />
              <input
                type="text"
                value={navbarAccentColor}
                onChange={(e) => setNavbarAccentColor(e.target.value)}
                placeholder="#fbbf24"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">Storefront Primary Font Color</label>
            <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 rounded-xl p-2">
              <input
                type="color"
                value={toHexColor(textColor, '#f8fafc')}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-9 h-9 rounded-lg cursor-pointer bg-transparent border-0 shrink-0"
              />
              <input
                type="text"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                placeholder="#f8fafc"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Preset 3D Gradient Themes Section */}
      <div className="space-y-4">
        <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-400" /> Curated 3D Gradient Themes
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {PRESET_GRADIENTS.map((preset) => {
            const isSelected = presetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset)}
                className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                  isSelected
                    ? 'border-indigo-500 ring-2 ring-indigo-500/40 shadow-xl scale-[1.02]'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-900/60'
                }`}
              >
                <div
                  className="w-full h-16 rounded-xl border border-white/20 mb-3 shadow-inner"
                  style={{ background: preset.gradient }}
                />

                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white">{preset.name}</span>
                  {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom 3D Gradient Builder */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl space-y-4">
        <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-400" /> Custom 3D Gradient Color Builder
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">Start Color</label>
            <div className="flex items-center space-x-3 bg-slate-950 border border-slate-800 rounded-xl p-2">
              <input
                type="color"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
              />
              <span className="text-xs font-mono text-white">{customStart}</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">End Color</label>
            <div className="flex items-center space-x-3 bg-slate-950 border border-slate-800 rounded-xl p-2">
              <input
                type="color"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
              />
              <span className="text-xs font-mono text-white">{customEnd}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={applyCustomGradient}
          className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all border border-slate-700"
        >
          Generate & Apply Custom 3D Gradient
        </button>
      </div>

      {/* Detailed Background Upload & Solid Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Navbar Background Options */}
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Palette className="w-4 h-4 text-amber-400" /> Navbar Background Settings
            </h3>
            <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setNavbarBgType('gradient')}
                className={`px-2 py-1 rounded-md transition-all ${
                  navbarBgType === 'gradient' ? 'bg-amber-600 text-white' : 'text-slate-400'
                }`}
              >
                Gradient
              </button>
              <button
                type="button"
                onClick={() => setNavbarBgType('image')}
                className={`px-2 py-1 rounded-md transition-all ${
                  navbarBgType === 'image' ? 'bg-amber-600 text-white' : 'text-slate-400'
                }`}
              >
                File Image
              </button>
              <button
                type="button"
                onClick={() => setNavbarBgType('color')}
                className={`px-2 py-1 rounded-md transition-all ${
                  navbarBgType === 'color' ? 'bg-amber-600 text-white' : 'text-slate-400'
                }`}
              >
                Solid
              </button>
            </div>
          </div>

          {navbarBgType === 'image' ? (
            <div className="space-y-3">
              <div className="border-2 border-dashed border-slate-800 hover:border-amber-500/80 rounded-xl p-4 text-center cursor-pointer transition-all bg-slate-950/60">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleNavbarImageUpload}
                  className="hidden"
                  id="navbar-bg-upload"
                />
                <label htmlFor="navbar-bg-upload" className="cursor-pointer space-y-1 block">
                  <Upload className="w-6 h-6 text-amber-400 mx-auto" />
                  <span className="text-xs text-slate-200 font-bold block">Upload Navbar Background File</span>
                </label>
              </div>

              {navbarBgImage && (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div className="flex items-center space-x-3 truncate">
                    <img src={navbarBgImage} alt="" className="w-10 h-10 object-cover rounded-lg" />
                    <span className="text-xs text-slate-300 font-mono truncate">Navbar Image Attached</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNavbarBgImage('')}
                    className="text-xs text-rose-400 font-bold px-2 py-1 bg-rose-500/10 rounded-lg"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          ) : navbarBgType === 'color' ? (
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">Navbar Solid Color</label>
              <div className="flex items-center space-x-3 bg-slate-950 border border-slate-800 rounded-xl p-2">
                <input
                  type="color"
                  value={navbarBgColor}
                  onChange={(e) => setNavbarBgColor(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <span className="text-xs font-mono text-white">{navbarBgColor}</span>
              </div>
            </div>
          ) : (
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">Navbar Gradient String</label>
              <input
                type="text"
                value={navbarBgGradient}
                onChange={(e) => setNavbarBgGradient(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:border-amber-500 outline-none"
              />
            </div>
          )}
        </div>

        {/* Entire Storefront Background Options */}
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-indigo-400" /> Entire Page Background Settings
            </h3>
            <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setBgType('gradient')}
                className={`px-2 py-1 rounded-md transition-all ${
                  bgType === 'gradient' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                }`}
              >
                Gradient
              </button>
              <button
                type="button"
                onClick={() => setBgType('image')}
                className={`px-2 py-1 rounded-md transition-all ${
                  bgType === 'image' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                }`}
              >
                File Image
              </button>
              <button
                type="button"
                onClick={() => setBgType('color')}
                className={`px-2 py-1 rounded-md transition-all ${
                  bgType === 'color' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                }`}
              >
                Solid
              </button>
            </div>
          </div>

          {bgType === 'image' ? (
            <div className="space-y-3">
              <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/80 rounded-xl p-4 text-center cursor-pointer transition-all bg-slate-950/60">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBgImageUpload}
                  className="hidden"
                  id="page-bg-upload"
                />
                <label htmlFor="page-bg-upload" className="cursor-pointer space-y-1 block">
                  <Upload className="w-6 h-6 text-indigo-400 mx-auto" />
                  <span className="text-xs text-slate-200 font-bold block">Upload Page Background Image File</span>
                </label>
              </div>

              {bgImage && (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div className="flex items-center space-x-3 truncate">
                    <img src={bgImage} alt="" className="w-10 h-10 object-cover rounded-lg" />
                    <span className="text-xs text-slate-300 font-mono truncate">Page Image Attached</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBgImage('')}
                    className="text-xs text-rose-400 font-bold px-2 py-1 bg-rose-500/10 rounded-lg"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          ) : bgType === 'color' ? (
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">Page Solid Color</label>
              <div className="flex items-center space-x-3 bg-slate-950 border border-slate-800 rounded-xl p-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <span className="text-xs font-mono text-white">{bgColor}</span>
              </div>
            </div>
          ) : (
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">Page Gradient String</label>
              <input
                type="text"
                value={bgGradient}
                onChange={(e) => setBgGradient(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:border-indigo-500 outline-none"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
