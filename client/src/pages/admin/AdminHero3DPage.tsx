import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown, Eye, Check, X, Sparkles, Layers, Palette, Image as ImageIcon, DollarSign, Type, Upload, Video, Film } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiService } from '../../services/api';
import { CategoryHeroItem } from '../../components/common/Category3DHero';

export const AdminHero3DPage: React.FC = () => {
  const [items, setItems] = useState<CategoryHeroItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<CategoryHeroItem> | null>(null);
  const [imageInputMode, setImageInputMode] = useState<'url' | 'file'>('url');
  const [videoInputMode, setVideoInputMode] = useState<'url' | 'file'>('url');
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result && editingItem) {
        setEditingItem({
          ...editingItem,
          image: event.target.result as string,
        });
        toast.success('Local image file attached!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingVideo(true);
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result && editingItem) {
        setEditingItem({
          ...editingItem,
          introVideo: event.target.result as string,
        });
        toast.success('Category intro video attached successfully!');
      }
      setUploadingVideo(false);
    };
    reader.readAsDataURL(file);
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await apiService.getAllHero3DAdmin();
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        setItems(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load 3D hero categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleOpenAddModal = () => {
    setEditingItem({
      id: `hero-${Date.now().toString(36)}`,
      name: '',
      watermark: '',
      badge: 'FEATURED',
      title: '',
      description: '',
      priceDisplay: '$19.00',
      priceValue: 19.00,
      bgSolid: '#6366f1',
      bgGradient: 'radial-gradient(ellipse at 50% 40%, #6366f1 0%, #4f46e5 35%, #3730a3 70%, #1e1b4b 100%)',
      cardBg: 'rgba(238, 242, 255, 0.55)',
      badgeColor: '#4338ca',
      textColor: '#1e1b4b',
      buttonBg: '#3730a3',
      image: '/images/3d-categories/facewash.png',
      slug: 'general',
    });
    setModalOpen(true);
  };

  const handleEdit = (item: CategoryHeroItem) => {
    setEditingItem({ ...item });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this 3D Hero category?')) return;
    try {
      const res = await apiService.deleteHero3D(id);
      if (res.data.success) {
        toast.success('3D Hero Category deleted!');
        fetchItems();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.name || !editingItem.title || !editingItem.image) {
      toast.error('Please fill in Name, Title, and Image URL');
      return;
    }

    try {
      const isExisting = items.some((i) => i.id === editingItem.id);
      let res;
      if (isExisting) {
        res = await apiService.updateHero3D(editingItem.id!, editingItem);
      } else {
        res = await apiService.createHero3D(editingItem);
      }

      if (res.data.success) {
        toast.success(isExisting ? 'Category updated successfully!' : 'Category created successfully!');
        setModalOpen(false);
        setEditingItem(null);
        fetchItems();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  };

  // Helper to auto update bgGradient when bgSolid changes
  const handleBgSolidChange = (color: string) => {
    if (!editingItem) return;
    const gradient = `radial-gradient(ellipse at 50% 40%, ${color} 0%, ${color}dd 35%, ${color}99 70%, #0b0f17 100%)`;
    setEditingItem({
      ...editingItem,
      bgSolid: color,
      bgGradient: gradient,
    });
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-3xl border border-indigo-500/20 shadow-xl">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            <span>Admin Customizer</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            3D Category Hero Section Manager
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Customize, add, edit, or delete interactive 3D hero categories displayed on the homepage. Assign custom images, background colors, descriptions, prices, and watermark labels.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-2 shrink-0 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New 3D Category</span>
        </button>
      </div>

      {/* Grid of 3D Hero Categories */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">
          <Sparkles className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-2" />
          Loading 3D Hero categories...
        </div>
      ) : items.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-4">
          <Layers className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No 3D Hero Categories Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Click the button above to add your first interactive 3D Category Hero slide.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, idx) => (
            <div
              key={item.id}
              className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between group"
            >
              {/* Top Visual Preview Header */}
              <div
                className="relative h-44 p-4 flex flex-col justify-between overflow-hidden"
                style={{ background: item.bgGradient || item.bgSolid }}
              >
                {/* Background Watermark Preview */}
                <span className="absolute inset-0 flex items-center justify-center text-5xl font-black text-white/10 tracking-widest uppercase select-none pointer-events-none">
                  {item.watermark}
                </span>

                {/* Top Badge & Index */}
                <div className="relative z-10 flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full text-white bg-black/40 backdrop-blur-md border border-white/20">
                    {item.badge}
                  </span>
                  <span className="text-xs font-mono font-bold text-white/70 bg-black/30 px-2 py-0.5 rounded-md">
                    #{idx + 1}
                  </span>
                </div>

                {/* Floating Image Preview */}
                <div className="relative z-10 flex items-center justify-center">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-24 h-24 object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </div>

              {/* Card Body Details */}
              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="text-base font-extrabold text-white tracking-tight">{item.name}</h3>
                    <span className="text-xs font-extrabold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-lg">
                      {item.priceDisplay}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-indigo-300 mt-1">{item.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Theme Swatches */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center space-x-2">
                    <Palette className="w-3.5 h-3.5 text-slate-500" />
                    <span>Theme:</span>
                    <span
                      className="w-4 h-4 rounded-full border border-white/30 inline-block shadow-inner"
                      style={{ background: item.bgSolid }}
                      title={item.bgSolid}
                    />
                  </div>
                  <span className="font-mono text-[10px] text-slate-500">ID: {item.id}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="flex-1 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 text-xs font-semibold py-2 px-3 rounded-xl transition-colors flex items-center justify-center space-x-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Category</span>
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 bg-rose-950/30 hover:bg-rose-900/50 text-rose-400 border border-rose-800/40 rounded-xl transition-colors"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Add / Edit 3D Hero Category */}
      {modalOpen && editingItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  {items.some((i) => i.id === editingItem.id) ? 'Edit 3D Category Hero' : 'Add New 3D Category Hero'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Customize title, description, colors, image, and price display.</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Category Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Face Wash"
                    value={editingItem.name || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none"
                  />
                </div>

                {/* Slug / Identifier */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Unique Identifier / ID</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. facewash"
                    value={editingItem.id || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, id: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Product Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Product Showcase Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hydrating Botanical Cleanser"
                    value={editingItem.title || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none"
                  />
                </div>

                {/* Badge Text */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Badge Text (e.g. NEW, BESTSELLER)</label>
                  <input
                    type="text"
                    placeholder="e.g. BOTANICAL"
                    value={editingItem.badge || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, badge: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Enter detailed description..."
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Watermark Text */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Background Watermark</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SKINCARE"
                    value={editingItem.watermark || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, watermark: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white uppercase placeholder-slate-500 focus:border-indigo-500 outline-none"
                  />
                </div>

                {/* Price Display */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Price Display String</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. $19.00"
                    value={editingItem.priceDisplay || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, priceDisplay: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none"
                  />
                </div>

                {/* Price Value */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Numeric Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="19.00"
                    value={editingItem.priceValue || 0}
                    onChange={(e) => setEditingItem({ ...editingItem, priceValue: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* Dual Image Input Section (URL / Path or Computer File Upload) */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-indigo-400" />
                    <span>3D Image Asset (URL Path or Computer File Upload)</span>
                  </label>

                  <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setImageInputMode('url')}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        imageInputMode === 'url' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      URL / Path
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMode('file')}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        imageInputMode === 'file' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Upload File
                    </button>
                  </div>
                </div>

                {imageInputMode === 'url' ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="e.g. /images/3d-categories/facewash.png or https://..."
                      value={editingItem.image || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, image: e.target.value })}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none"
                    />
                    {editingItem.image && (
                      <div className="w-10 h-10 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
                        <img src={editingItem.image} alt="Preview" className="w-full h-full object-contain" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/80 rounded-xl p-4 text-center cursor-pointer transition-all bg-slate-900/60">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="hero-file-upload"
                      />
                      <label htmlFor="hero-file-upload" className="cursor-pointer space-y-1 block">
                        <Upload className="w-6 h-6 text-indigo-400 mx-auto" />
                        <span className="text-xs text-slate-200 font-bold block">
                          Click to select image file from computer
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          Supports PNG, WEBP, JPG, SVG formats
                        </span>
                      </label>
                    </div>

                    {editingItem.image && (
                      <div className="flex items-center space-x-3 p-2.5 bg-slate-900 border border-slate-800 rounded-xl">
                        <div className="w-10 h-10 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                          <img src={editingItem.image} alt="Attached asset" className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1 text-[11px] overflow-hidden">
                          <span className="font-bold text-emerald-400 block">Image Selected</span>
                          <span className="text-slate-400 font-mono truncate block text-[10px]">{editingItem.image.slice(0, 45)}...</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Category Intro Video Asset (URL Path or Computer File Upload) */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-purple-400" />
                    <span>Category Intro Video Asset (URL Path or Computer File Upload)</span>
                  </label>

                  <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setVideoInputMode('url')}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        videoInputMode === 'url' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      URL / Path
                    </button>
                    <button
                      type="button"
                      onClick={() => setVideoInputMode('file')}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        videoInputMode === 'file' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Upload File
                    </button>
                  </div>
                </div>

                {videoInputMode === 'url' ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. /videos/gelato-intro.mp4 or https://..."
                      value={editingItem.introVideo?.startsWith('data:') ? '' : editingItem.introVideo || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, introVideo: e.target.value })}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-purple-500 outline-none"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="border-2 border-dashed border-slate-800 hover:border-purple-500/80 rounded-xl p-4 text-center cursor-pointer transition-all bg-slate-900/60">
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/ogg,video/*"
                        onChange={handleVideoFileUpload}
                        className="hidden"
                        id="hero-video-upload"
                      />
                      <label htmlFor="hero-video-upload" className="cursor-pointer space-y-1 block">
                        <Upload className="w-6 h-6 text-purple-400 mx-auto" />
                        <span className="text-xs text-slate-200 font-bold block">
                          {uploadingVideo ? 'Processing video file...' : 'Click to select category intro video file from computer'}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          Supports MP4, WEBP, MOV, OGG formats
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {editingItem.introVideo && (
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center space-x-3">
                    <div className="w-16 h-12 bg-black rounded-lg border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center relative">
                      <video
                        src={editingItem.introVideo}
                        className="w-full h-full object-cover"
                        muted
                        autoPlay
                        loop
                        playsInline
                        preload="auto"
                      />
                      <Film className="w-4 h-4 text-purple-400 absolute pointer-events-none opacity-50" />
                    </div>
                    <div className="flex-1 text-[11px] overflow-hidden">
                      <span className="font-bold text-emerald-400 block">Intro Video Attached</span>
                      <span className="text-slate-400 font-mono truncate block text-[10px]">
                        {editingItem.introVideo.startsWith('data:')
                          ? 'Uploaded Video File (Embedded Base64 Media)'
                          : editingItem.introVideo}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingItem({ ...editingItem, introVideo: '' })}
                      className="text-xs text-rose-400 hover:text-rose-300 font-bold px-2.5 py-1 bg-rose-500/10 rounded-lg shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Background Color Customization */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-4">
                <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold">
                  <Palette className="w-4 h-4" />
                  <span>Background Theme & Colors</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Solid Color Picker */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Theme Accent Solid Color</label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={editingItem.bgSolid || '#6366f1'}
                        onChange={(e) => handleBgSolidChange(e.target.value)}
                        className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={editingItem.bgSolid || ''}
                        onChange={(e) => handleBgSolidChange(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  {/* Gradient String */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">CSS Radial Gradient</label>
                    <input
                      type="text"
                      value={editingItem.bgGradient || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, bgGradient: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Category</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
