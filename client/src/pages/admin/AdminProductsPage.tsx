import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Image as ImageIcon, Search, Link as LinkIcon, Upload, X } from 'lucide-react';
import { apiService } from '../../services/api';
import { Product, Category } from '../../types';
import toast from 'react-hot-toast';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Add/Edit Product Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [mrp, setMrp] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [stock, setStock] = useState('');
  const [sku, setSku] = useState('');
  const [tags, setTags] = useState('');
  const [featured, setFeatured] = useState(false);
  const [trending, setTrending] = useState(false);

  // Dual Image Input State
  const [imageInputMode, setImageInputMode] = useState<'url' | 'file'>('url');
  const [imagesList, setImagesList] = useState<string[]>([]);
  const [pastedUrl, setPastedUrl] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      try {
        const prodRes = await apiService.getProducts({ limit: 100 });
        if (prodRes.data && prodRes.data.success) setProducts(prodRes.data.data);
      } catch (pErr) {
        console.warn('Failed loading products catalog', pErr);
      }

      try {
        const catRes = await apiService.getCategories();
        if (catRes.data && catRes.data.success) setCategories(catRes.data.data);
      } catch (cErr) {
        console.warn('Failed loading categories for products page', cErr);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setCategory(categories[0]?._id || '');
    setBrand('');
    setMrp('');
    setSellingPrice('');
    setStock('');
    setSku('');
    setTags('');
    setFeatured(false);
    setTrending(false);
    setImagesList([]);
    setPastedUrl('');
  };

  const handleOpenAddModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name || '');
    setDescription(p.description || '');
    let catVal = '';
    if (p.category) {
      if (typeof p.category === 'object') {
        catVal = p.category._id || (p.category as any).name || '';
      } else {
        catVal = p.category;
      }
    }
    setCategory(catVal);
    setBrand(p.brand || '');
    setMrp((p.mrp ?? 0).toString());
    setSellingPrice((p.sellingPrice ?? 0).toString());
    setStock((p.stock ?? 0).toString());
    setSku(p.sku || '');
    setTags(Array.isArray(p.tags) ? p.tags.join(', ') : (p.tags || ''));
    setFeatured(Boolean(p.featured));
    setTrending(Boolean(p.trending));
    setImagesList(p.images || []);
    setModalOpen(true);
  };

  // Add Public / Google Image URL to gallery
  const handleAddImageUrl = () => {
    if (!pastedUrl) return;
    if (!pastedUrl.startsWith('http://') && !pastedUrl.startsWith('https://')) {
      toast.error('Please enter a valid HTTP/HTTPS image URL');
      return;
    }
    setImagesList((prev) => [...prev, pastedUrl]);
    setPastedUrl('');
    toast.success('Image URL added to product gallery preview');
  };

  // Local File Upload Simulation / Reader
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingFile(true);
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImagesList((prev) => [...prev, event.target!.result as string]);
        toast.success('Local image file attached!');
      }
      setUploadingFile(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (index: number) => {
    setImagesList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const finalImages = imagesList;
      const categoryToUse = category || categories[0]?._id || 'General';

      if (editingProduct) {
        await apiService.updateProduct(editingProduct._id, {
          name,
          description,
          category: categoryToUse,
          brand,
          mrp: parseFloat(mrp) || 0,
          sellingPrice: parseFloat(sellingPrice) || 0,
          stock: parseInt(stock) || 0,
          sku,
          tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
          featured,
          trending,
          images: finalImages,
        });
        toast.success(`Product "${name}" updated!`);
      } else {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('category', categoryToUse);
        formData.append('brand', brand || 'MANIVYA');
        formData.append('mrp', mrp || sellingPrice || '0');
        formData.append('sellingPrice', sellingPrice || '0');
        formData.append('stock', stock || '0');
        formData.append('sku', sku || `SKU-${Date.now().toString().slice(-6)}`);
        formData.append('tags', tags);
        formData.append('featured', String(featured));
        formData.append('trending', String(trending));
        finalImages.forEach((img) => formData.append('images', img));

        await apiService.createProduct(formData);
        toast.success(`New product "${name}" created successfully!`);
      }
      setModalOpen(false);
      resetForm();
      await loadData();
    } catch (err: any) {
      console.error('Product save error:', err);
      const errMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Operation failed';
      toast.error(`Save failed: ${errMsg}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Hide / Delete this product from active catalog?')) {
      await apiService.deleteProduct(id);
      toast.success('Product hidden');
      loadData();
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl">
        <div>
          <h2 className="text-xl font-extrabold text-white">Product Inventory & Image Gallery Manager</h2>
          <p className="text-xs text-slate-400 mt-0.5">Manage catalog listings, pricing, dual image inputs (URL/File), and stock levels</p>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search SKU or Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500"
          />
          <button
            onClick={handleOpenAddModal}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Products Data Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 uppercase font-bold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">SKU</th>
                <th className="p-4">Selling Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Flags</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No products found in database. Click "+ Add Product" to create your first listing.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 flex items-center space-x-3">
                      <img src={p.images?.[0]} alt="" className="w-10 h-10 object-cover rounded-xl bg-slate-950" />
                      <div>
                        <span className="font-bold text-white block max-w-xs truncate">{p.name}</span>
                        <span className="text-[11px] text-slate-400">{p.brand}</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono">{p.sku}</td>
                    <td className="p-4 font-bold text-white">₹{p.sellingPrice.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded font-bold ${p.stock > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                        {p.stock} units
                      </span>
                    </td>
                    <td className="p-4 space-x-1">
                      {p.featured && <span className="bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded text-[10px] font-bold">Featured</span>}
                      {p.trending && <span className="bg-pink-500/20 text-pink-400 px-1.5 py-0.5 rounded text-[10px] font-bold">Trending</span>}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button onClick={() => handleOpenEditModal(p)} className="p-1.5 hover:text-indigo-400"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(p._id)} className="p-1.5 hover:text-rose-400"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white">
              {editingProduct ? 'Edit Product Details' : 'Add New Product'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Product Name</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Brand</label>
                <input type="text" required value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-400">Category</label>
                <span className="text-[10px] text-slate-500">Select existing or type custom</span>
              </div>
              {categories.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="">Select Existing Category...</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Or type new category name..."
                    value={category && !categories.some((c) => c._id === category) ? category : ''}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500"
                  />
                </div>
              ) : (
                <input
                  type="text"
                  placeholder="Enter Category Name (e.g. Water Bottels, Electronics)..."
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500"
                />
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">MRP ₹</label>
                <input type="number" required value={mrp} onChange={(e) => setMrp(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Selling Price ₹</label>
                <input type="number" required value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Stock Count</label>
                <input type="number" required value={stock} onChange={(e) => setStock(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
              </div>
            </div>

            {/* DUAL IMAGE INPUT SECTION */}
            <div className="bg-slate-950 border border-slate-800/80 p-4 rounded-2xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4" /> Dual Image Input (Public URL or Local Upload)
                </span>

                <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => setImageInputMode('url')}
                    className={`px-2.5 py-1 rounded-md transition-all ${imageInputMode === 'url' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                  >
                    Paste Image URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageInputMode('file')}
                    className={`px-2.5 py-1 rounded-md transition-all ${imageInputMode === 'file' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                  >
                    Upload Local File
                  </button>
                </div>
              </div>

              {imageInputMode === 'url' ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Paste Google Image or Public URL (https://...)"
                    value={pastedUrl}
                    onChange={(e) => setPastedUrl(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-2 rounded-xl"
                  >
                    Add URL
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500 rounded-xl p-4 text-center cursor-pointer transition-all">
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id="local-file-input" />
                  <label htmlFor="local-file-input" className="cursor-pointer space-y-1 block">
                    <Upload className="w-6 h-6 text-indigo-400 mx-auto" />
                    <span className="text-xs text-slate-300 font-semibold block">Click to select image file from computer</span>
                    <span className="text-[10px] text-slate-500 block">Supports PNG, JPG, WEBP formats</span>
                  </label>
                </div>
              )}

              {/* Gallery Preview Grid */}
              {imagesList.length > 0 && (
                <div className="grid grid-cols-4 gap-2 pt-2">
                  {imagesList.map((img, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-800 h-20 bg-slate-900">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Description</label>
              <textarea rows={3} required value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white" />
            </div>

            <div className="flex gap-4">
              <label className="flex items-center space-x-2 text-xs text-slate-300">
                <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="rounded bg-slate-950" />
                <span>Featured Product</span>
              </label>

              <label className="flex items-center space-x-2 text-xs text-slate-300">
                <input type="checkbox" checked={trending} onChange={(e) => setTrending(e.target.checked)} className="rounded bg-slate-950" />
                <span>Trending Product</span>
              </label>
            </div>

            <div className="flex space-x-3 pt-2">
              <button type="button" onClick={() => setModalOpen(false)} className="flex-1 bg-slate-800 text-xs font-semibold py-2.5 rounded-xl">Cancel</button>
              <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2.5 rounded-xl">Save Product</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
