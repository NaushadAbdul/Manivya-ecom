import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Image as ImageIcon, Video, Upload, Check, X } from 'lucide-react';
import { apiService } from '../../services/api';
import { Category } from '../../types';
import toast from 'react-hot-toast';

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');

  const [imageInputMode, setImageInputMode] = useState<'url' | 'file'>('url');

  const loadCategories = async () => {
    try {
      const res = await apiService.getAllCategoriesAdmin();
      if (res.data && res.data.success) {
        setCategories(res.data.data);
        return;
      }
    } catch (err) {
      try {
        const fallbackRes = await apiService.getCategories();
        if (fallbackRes.data && fallbackRes.data.success) {
          setCategories(fallbackRes.data.data);
          return;
        }
      } catch (fErr) {
        toast.error('Failed to load categories');
      }
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setImage('');
    setImageInputMode('url');
    setModalOpen(true);
  };

  const handleOpenEditModal = (c: Category) => {
    setEditingCategory(c);
    setName(c.name || '');
    setDescription(c.description || '');
    setImage(c.image || '');
    setImageInputMode('url');
    setModalOpen(true);
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImage(event.target.result as string);
        toast.success('Category banner image attached!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        const res = await apiService.updateCategory(editingCategory._id, {
          name,
          description,
          image,
        });
        if (res.data.success) {
          toast.success(`Category "${name}" updated successfully!`);
        }
      } else {
        const res = await apiService.createCategory({
          name,
          description,
          image,
        });
        if (res.data.success) {
          toast.success(`New category "${name}" created!`);
        }
      }

      setModalOpen(false);
      setEditingCategory(null);
      setName('');
      setDescription('');
      setImage('');
      loadCategories();
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Operation failed';
      toast.error(`Save failed: ${errMsg}`);
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (confirm(`Delete category "${catName}"?`)) {
      await apiService.deleteCategory(id);
      toast.success(`Category "${catName}" deleted`);
      loadCategories();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex justify-between items-center bg-slate-900/60 border border-slate-800 p-6 rounded-3xl">
        <div>
          <h2 className="text-xl font-extrabold text-white">Categories Manager</h2>
          <p className="text-xs text-slate-400 mt-0.5">Create, edit and manage storefront product categories & intro videos</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-2xl transition-all flex items-center space-x-1.5 shadow-lg shadow-indigo-600/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      {/* Category Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {categories.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-slate-900/40 border border-slate-800 rounded-3xl text-slate-400 text-xs">
            No categories configured. Click "+ New Category" above to add your first category.
          </div>
        ) : (
          categories.map((c) => (
            <div
              key={c._id}
              className="p-4 bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-2xl flex justify-between items-center gap-3 transition-all"
            >
              <div className="flex items-center space-x-3 truncate">
                <img src={c.image || ''} alt="" className="w-12 h-12 object-cover rounded-xl bg-slate-950 shrink-0" />
                <div className="truncate">
                  <h4 className="text-xs font-bold text-white truncate">{c.name}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{c.description || 'Curated category collection'}</p>
                </div>
              </div>

              {/* Action Buttons: Edit Pencil & Delete Trash Icons */}
              <div className="flex items-center space-x-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleOpenEditModal(c)}
                  className="p-2 hover:bg-slate-800 text-slate-400 hover:text-indigo-400 rounded-xl transition-colors"
                  title="Edit Category & Intro Video"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(c._id, c.name)}
                  className="p-2 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded-xl transition-colors"
                  title="Delete Category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleSubmit}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 my-8 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingCategory ? `Edit "${editingCategory.name}"` : 'Add New Category'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category Name */}
            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1">Category Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Gelato & Ice Creams"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1">Description</label>
              <textarea
                rows={2}
                placeholder="Enter category description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none"
              />
            </div>

            {/* Category Banner Image Asset */}
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-indigo-400" />
                  <span>Category Banner Image</span>
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
                    placeholder="e.g. https://... or /images/..."
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none"
                  />
                  {image && (
                    <div className="w-10 h-10 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
                      <img src={image} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/80 rounded-xl p-3 text-center cursor-pointer transition-all bg-slate-900/60">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="hidden"
                      id="cat-image-upload"
                    />
                    <label htmlFor="cat-image-upload" className="cursor-pointer space-y-1 block">
                      <Upload className="w-5 h-5 text-indigo-400 mx-auto" />
                      <span className="text-xs text-slate-200 font-bold block">Select banner image file</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-xs font-semibold py-2.5 rounded-xl text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold py-2.5 rounded-xl text-white transition-colors shadow-lg shadow-indigo-600/20"
              >
                {editingCategory ? 'Update Category' : 'Create Category'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
