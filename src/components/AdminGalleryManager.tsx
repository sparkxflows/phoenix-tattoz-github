import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  Upload, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  RefreshCw, 
  RotateCcw, 
  Search, 
  Tag, 
  User, 
  Sparkles, 
  Check, 
  X,
  ExternalLink,
  ArrowUpDown
} from 'lucide-react';
import { GalleryItem } from '../data/studioData';
import { getStoredGallery, saveGallery, resetGallery, getStoredArtists, uploadImageToServer } from '../lib/studioContent';
import { supabase } from '../lib/supabase';

export const AdminGalleryManager: React.FC = () => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(getStoredGallery);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Sync latest gallery showcase directly from Supabase Cloud on mount
  useEffect(() => {
    let isMounted = true;
    const fetchFreshGallery = async () => {
      // 1. Authoritative Supabase Cloud Store
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'custom_gallery')
          .single();

        if (!error && data && Array.isArray(data.value) && data.value.length > 0) {
          if (isMounted) {
            setGalleryItems(data.value);
            try {
              localStorage.setItem('phoenix_studio_gallery_v1', JSON.stringify(data.value));
            } catch {}
          }
          return;
        }
      } catch (e) {
        // Fallback
      }

      // 2. Server fallback
      try {
        const res = await fetch('/api/content/custom_gallery', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success && Array.isArray(data.value) && data.value.length > 0) {
            setGalleryItems(data.value);
            try {
              localStorage.setItem('phoenix_studio_gallery_v1', JSON.stringify(data.value));
            } catch {}
          }
        }
      } catch {}
    };
    fetchFreshGallery();
    return () => {
      isMounted = false;
    };
  }, []);

  // Editing / New Item Modal State
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Available artists for assignment
  const artistsList = useMemo(() => getStoredArtists(), []);

  // Filtered gallery items
  const filteredItems = useMemo(() => {
    return galleryItems.filter((item) => {
      const cat = (item.category || '').toLowerCase();
      const matchesCategory =
        categoryFilter === 'All' ||
        cat === categoryFilter.toLowerCase();
      const q = searchQuery.toLowerCase();
      const title = (item.title || '').toLowerCase();
      const artist = (item.artist || '').toLowerCase();
      const desc = (item.description || '').toLowerCase();
      const tags = Array.isArray(item.tags) ? item.tags : [];
      const matchesSearch =
        !q ||
        title.includes(q) ||
        artist.includes(q) ||
        desc.includes(q) ||
        tags.some((t) => (t || '').toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [galleryItems, categoryFilter, searchQuery]);

  // Categories list
  const categories = [
    'All',
    'Realism',
    'Black & Grey',
    'Fine Line',
    'Traditional',
    'Neo Traditional',
    'Japanese',
    'Piercing',
    'Minimal',
    'Portraits',
    'Custom',
  ];

  // Upload image directly to persistent server storage /data/uploads/
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingItem) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WebP).');
      return;
    }

    setIsUploading(true);
    setStatusMessage('Uploading tattoo photo to server disk storage...');

    try {
      const serverUrl = await uploadImageToServer(file, 'gallery');
      setEditingItem((prev) => prev ? { ...prev, image: serverUrl } : null);
      setStatusMessage('Photo saved to server disk!');
    } catch (err: any) {
      console.error('Failed to upload gallery image:', err);
      alert('Failed to upload image to server disk.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Open modal to create new artwork
  const handleStartCreate = () => {
    const newItem: GalleryItem = {
      id: 'gallery_' + Date.now(),
      title: 'New Tattoo Design',
      category: 'Realism',
      artist: artistsList[0]?.name || 'Rohit Sharma',
      description: 'Custom tattoo artwork created with precision shading and sterile hygiene standards.',
      tags: ['Custom', 'Realism', 'Hisar'],
      image: 'https://images.unsplash.com/photo-1562962230-16e4623d36e6?auto=format&fit=crop&w=900&q=80',
    };
    setEditingItem(newItem);
    setIsCreatingNew(true);
  };

  // Save current item modal
  const handleSaveItemModal = () => {
    if (!editingItem) return;
    if (!editingItem.title.trim()) {
      alert('Please enter a title for this tattoo.');
      return;
    }

    if (isCreatingNew) {
      setGalleryItems((prev) => [editingItem, ...prev]);
    } else {
      setGalleryItems((prev) =>
        prev.map((item) => (item.id === editingItem.id ? editingItem : item))
      );
    }

    setEditingItem(null);
    setIsCreatingNew(false);
  };

  // Delete item
  const handleDeleteItem = (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}" from the gallery?`)) return;
    setGalleryItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Save changes to persistence
  const handleSaveAll = async () => {
    setIsSaving(true);
    const res = await saveGallery(galleryItems);
    setIsSaving(false);

    if (res.success) {
      setStatusMessage('Gallery artworks and details successfully updated across the website!');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } else {
      alert('Error saving gallery: ' + (res.error || 'Unknown error'));
    }
  };

  // Reset to default
  const handleReset = async () => {
    if (!window.confirm('Reset the tattoo gallery back to the original studio showcase?')) return;
    await resetGallery();
    setGalleryItems(getStoredGallery());
    setStatusMessage('Restored default studio gallery showcase.');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Top Banner */}
      <div className="bg-[#161616] border border-zinc-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-[#FFD60A]/15 text-[#FFD60A]">
              <ImageIcon className="w-5 h-5" />
            </span>
            <h3 className="font-serif font-bold text-xl text-white">
              Tattoo Gallery Showcase Management
            </h3>
          </div>
          <p className="text-xs text-zinc-400 mt-1.5 max-w-2xl leading-relaxed">
            Upload new tattoo photos, edit tattoo titles, descriptions, categories, tagged artists, and tags. Edits update live on the public Tattoo Gallery showcase page and Home page mosaic.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 hover:border-zinc-700 px-3.5 py-2.5 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={handleStartCreate}
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#FFD60A]" />
            <span>Add New Tattoo</span>
          </button>

          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="flex items-center gap-2 bg-[#FFD60A] hover:bg-[#ffe033] active:scale-[0.98] text-black font-bold text-xs px-5 py-2.5 rounded-lg shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-black" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 text-black" />
                <span>Save &amp; Apply Gallery</span>
              </>
            )}
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 px-4 py-3 rounded-xl text-xs flex items-center justify-between animate-in fade-in duration-200">
          <span className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{statusMessage}</span>
          </span>
          <button onClick={() => setSaveSuccess(false)} className="text-emerald-400 hover:text-white text-xs">
            &times;
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#161616] p-3 rounded-xl border border-zinc-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tattoo by title, artist, style, or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-zinc-800 text-[#FFD60A] font-bold border border-zinc-700'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-[#161616] border border-zinc-800 hover:border-zinc-700 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
          >
            {/* Image Thumbnail with Overlay Controls */}
            <div className="relative aspect-[4/5] bg-zinc-900 overflow-hidden">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />

              <span className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-md border border-zinc-700 text-[#FFD60A] text-[10px] font-bold px-2 py-0.5 rounded-md">
                {item.category}
              </span>

              <div className="absolute top-2.5 right-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => {
                    setEditingItem(item);
                    setIsCreatingNew(false);
                  }}
                  className="p-1.5 bg-zinc-900/90 hover:bg-[#FFD60A] text-white hover:text-black rounded-lg transition-colors cursor-pointer shadow-md"
                  title="Edit tattoo artwork"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteItem(item.id, item.title)}
                  className="p-1.5 bg-zinc-900/90 hover:bg-rose-600 text-white rounded-lg transition-colors cursor-pointer shadow-md"
                  title="Delete artwork"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="absolute bottom-3 left-3 right-3 text-white">
                <h4 className="font-serif font-bold text-base text-white truncate">
                  {item.title}
                </h4>
                <p className="text-[11px] text-zinc-300 flex items-center gap-1 mt-0.5">
                  <User className="w-3 h-3 text-[#FFD60A]" />
                  <span>By {item.artist}</span>
                </p>
              </div>
            </div>

            {/* Description and Tags */}
            <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2 bg-zinc-900/40">
              <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                {item.description}
              </p>

              <div className="pt-2 border-t border-zinc-800/80 flex flex-wrap gap-1">
                {item.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-[9px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded"
                  >
                    #{t}
                  </span>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingItem(item);
                  setIsCreatingNew(false);
                }}
                className="w-full text-center text-xs font-semibold text-zinc-300 hover:text-[#FFD60A] pt-1 transition-colors cursor-pointer"
              >
                Edit Details &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-16 bg-[#161616] border border-zinc-800 rounded-2xl space-y-3">
          <ImageIcon className="w-8 h-8 text-zinc-600 mx-auto" />
          <p className="text-sm text-zinc-400">No tattoo artworks match your search or category filter.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setCategoryFilter('All');
            }}
            className="text-xs text-[#FFD60A] hover:underline font-semibold cursor-pointer"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* EDIT / CREATE ARTWORK MODAL */}
      {/* ============================================================== */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div 
            className="relative w-full max-w-xl bg-[#141414] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-6 text-zinc-200 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-[#FFD60A]/15 text-[#FFD60A] rounded-lg">
                  <ImageIcon className="w-4 h-4" />
                </span>
                <h3 className="font-serif text-base font-bold text-white">
                  {isCreatingNew ? 'Add New Tattoo Artwork' : `Edit "${editingItem.title}"`}
                </h3>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Photo Upload & Preview */}
              <div className="flex flex-col sm:flex-row gap-4 items-center bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
                <div className="relative w-28 h-36 rounded-xl overflow-hidden border border-zinc-700 bg-black shrink-0">
                  <img
                    src={editingItem.image}
                    alt={editingItem.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 space-y-2 w-full">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 bg-[#FFD60A] hover:bg-[#ffe033] text-black font-bold text-xs py-2.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-black" />
                    <span>Upload Tattoo Photo</span>
                  </button>
                  <div>
                    <label className="block text-[10px] text-zinc-400 mb-0.5">Or paste direct image URL:</label>
                    <input
                      type="url"
                      value={editingItem.image}
                      onChange={(e) => setEditingItem({ ...editingItem, image: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
                    />
                  </div>
                </div>
              </div>

              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                    Tattoo Piece Title
                  </label>
                  <input
                    type="text"
                    value={editingItem.title}
                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                    placeholder="e.g. Lion King Realism"
                    required
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                    Style Category
                  </label>
                  <select
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
                  >
                    <option value="Realism">Realism</option>
                    <option value="Black & Grey">Black & Grey</option>
                    <option value="Fine Line">Fine Line</option>
                    <option value="Traditional">Traditional</option>
                    <option value="Neo Traditional">Neo Traditional</option>
                    <option value="Japanese">Japanese</option>
                    <option value="Minimal">Minimal</option>
                    <option value="Portraits">Portraits</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>
              </div>

              {/* Tagged Artist */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Inked By (Artist)
                </label>
                <div className="flex gap-2">
                  <select
                    value={editingItem.artist}
                    onChange={(e) => setEditingItem({ ...editingItem, artist: e.target.value })}
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
                  >
                    {artistsList.map((a) => (
                      <option key={a.id} value={a.name}>
                        {a.name} ({a.role})
                      </option>
                    ))}
                    <option value="Guest Artist">Guest Artist</option>
                    <option value="Phoenix Studio Team">Phoenix Studio Team</option>
                  </select>
                </div>
              </div>

              {/* Detailed Description */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Tattoo Story &amp; Details
                </label>
                <textarea
                  rows={3}
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  placeholder="Describe the placement, inspiration, shading techniques, or needle mechanics..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-[#FFD60A] leading-relaxed"
                />
              </div>

              {/* Tags (comma separated) */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Search Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={editingItem.tags.join(', ')}
                  onChange={(e) => {
                    const parsed = e.target.value
                      .split(',')
                      .map((t) => t.trim())
                      .filter(Boolean);
                    setEditingItem({ ...editingItem, tags: parsed });
                  }}
                  placeholder="e.g. Realism, Wildlife, Forearm, Sleeve"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-zinc-900 border-t border-zinc-800 px-6 py-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveItemModal}
                className="bg-[#FFD60A] hover:bg-[#ffe033] text-black font-bold text-xs px-5 py-2.5 rounded-lg transition-colors cursor-pointer shadow-md"
              >
                {isCreatingNew ? 'Add to Gallery' : 'Update Artwork'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
