import React, { useState, useRef, useMemo, useEffect } from 'react';
import { uploadFileDirect } from '../lib/directUpload';
import { 
  Video, 
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
  Play, 
  Pause, 
  ExternalLink, 
  Clock, 
  Eye, 
  AlertTriangle,
  ArrowUpDown,
  Image as ImageIcon
} from 'lucide-react';
import { VideoGalleryItem } from '../data/studioData';
import { getStoredVideos, saveVideos, resetVideos, getStoredArtists, uploadImageToServer } from '../lib/studioContent';
import { supabase } from '../lib/supabase';

export const AdminVideoGalleryManager: React.FC = () => {
  const [videos, setVideos] = useState<VideoGalleryItem[]>(getStoredVideos);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Editing / New Item Modal State
  const [editingItem, setEditingItem] = useState<VideoGalleryItem | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [videoPendingDeletion, setVideoPendingDeletion] = useState<VideoGalleryItem | null>(null);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);

  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const posterFileInputRef = useRef<HTMLInputElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const [previewPlaying, setPreviewPlaying] = useState(false);

  // Available artists for assignment
  const artistsList = useMemo(() => getStoredArtists(), []);

  // Sync directly from Supabase Cloud on mount
  useEffect(() => {
    let isMounted = true;
    const fetchRemote = async () => {
      // 1. Authoritative Supabase Cloud Store
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'custom_videos')
          .single();

        if (!error && data && Array.isArray(data.value) && data.value.length > 0) {
          if (isMounted) {
            setVideos(data.value);
            try {
              localStorage.setItem('phoenix_studio_videos_v1', JSON.stringify(data.value));
            } catch {}
          }
          return;
        }
      } catch (e) {
        // Fallback
      }

      // 2. Server fallback
      try {
        const res = await fetch('/api/content/custom_videos', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success && Array.isArray(data.value) && data.value.length > 0) {
            setVideos(data.value);
            try {
              localStorage.setItem('phoenix_studio_videos_v1', JSON.stringify(data.value));
            } catch {}
          }
        }
      } catch {}
    };
    fetchRemote();
    return () => {
      isMounted = false;
    };
  }, []);

  const categories = [
    'All',
    'Tattoo Sessions',
    'Client Reveals',
    'Piercing Work',
    'Behind The Scenes',
    'Cover-up Process',
    'Academy',
  ];

  // Filtered videos
  const filteredVideos = useMemo(() => {
    return videos.filter((item) => {
      const matchesCategory =
        categoryFilter === 'All' ||
        item.category.toLowerCase() === categoryFilter.toLowerCase();
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.artist.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [videos, categoryFilter, searchQuery]);

  // Video File Upload directly to Express /api/upload-video
  const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingItem) return;

    if (!file.type.startsWith('video/')) {
      setErrorMessage('Please select a valid video file (MP4, WebM, MOV).');
      return;
    }

    setIsUploadingVideo(true);
    setErrorMessage('');

    try {
      // Direct-to-storage first (Vercel functions cap request bodies at ~4.5 MB)
      const directUrl = await uploadFileDirect(file, { folder: 'videos' });
      if (directUrl) {
        setEditingItem((prev) => (prev ? { ...prev, videoUrl: directUrl } : null));
        setStatusMessage('Video file successfully uploaded!');
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        setIsUploadingVideo(false);
        return;
      }

      const res = await fetch(`/api/upload-video?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        headers: { 'Content-Type': file.type || 'video/mp4' },
        body: file,
      });

      if (!res.ok) {
        throw new Error(`Upload returned status ${res.status}`);
      }

      const data = await res.json();
      if (data.success && data.url) {
        setEditingItem((prev) => prev ? { ...prev, videoUrl: data.url } : null);
        setStatusMessage('Video file successfully uploaded!');
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        throw new Error(data.error || 'Server rejected video payload');
      }
    } catch (err: any) {
      console.error('Video upload failed:', err);
      // Fallback to base64 reader if server endpoint has issues
      try {
        const reader = new FileReader();
        reader.onload = (evt) => {
          const dataUrl = evt.target?.result as string;
          if (dataUrl) {
            setEditingItem((prev) => prev ? { ...prev, videoUrl: dataUrl } : null);
            setStatusMessage('Video loaded into memory (large files may take storage quota).');
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
          }
        };
        reader.readAsDataURL(file);
      } catch (fbErr: any) {
        setErrorMessage('Failed to upload video: ' + (err.message || 'Unknown error'));
      }
    } finally {
      setIsUploadingVideo(false);
      if (videoFileInputRef.current) videoFileInputRef.current.value = '';
    }
  };

  // Thumbnail poster image upload directly to server disk storage
  const handlePosterImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingItem) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    try {
      const serverUrl = await uploadImageToServer(file, 'video_poster');
      setEditingItem((prev) => (prev ? { ...prev, thumbnailUrl: serverUrl } : null));
      setStatusMessage('Video thumbnail poster saved to server disk!');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Failed to upload poster image:', err);
      setErrorMessage('Failed to upload thumbnail to server storage.');
    } finally {
      if (posterFileInputRef.current) posterFileInputRef.current.value = '';
    }
  };

  // Open modal to add new video
  const handleAddNewVideo = () => {
    const newItem: VideoGalleryItem = {
      id: 'vid_' + Date.now(),
      title: 'New Studio Reel Video',
      category: 'Tattoo Sessions',
      artist: artistsList[0]?.name || 'Rohit Sharma',
      videoUrl: '/uploads/studio_bg_video.mp4#t=5.5',
      thumbnailUrl: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=900&q=80',
      duration: '1:00',
      description: 'Studio video showing live inking technique, custom design process, and client satisfaction.',
      tags: ['Tattoo', 'Studio Work', 'Custom'],
      views: '1.2K',
      likes: 120,
      featured: false,
    };
    setEditingItem(newItem);
    setIsCreatingNew(true);
  };

  // Save modal draft to local array
  const handleSaveModalDraft = () => {
    if (!editingItem) return;
    if (!editingItem.title.trim()) {
      setErrorMessage('Please provide a video title.');
      return;
    }
    if (!editingItem.videoUrl.trim()) {
      setErrorMessage('Please provide a video URL or upload a video file.');
      return;
    }

    if (isCreatingNew) {
      setVideos((prev) => [editingItem, ...prev]);
    } else {
      setVideos((prev) =>
        prev.map((v) => (v.id === editingItem.id ? editingItem : v))
      );
    }

    setEditingItem(null);
    setIsCreatingNew(false);
    setStatusMessage('Video updated in working list. Click "Save & Apply Videos" to push live!');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  // Save changes to live website & server
  const handleSaveAllToLive = async () => {
    setIsSaving(true);
    setErrorMessage('');
    const res = await saveVideos(videos);
    setIsSaving(false);

    if (res.success) {
      setStatusMessage('Video Gallery successfully saved and published to the live website!');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } else {
      setErrorMessage(res.error || 'Failed to save videos to server.');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  // Confirmed Delete
  const handleConfirmDelete = async () => {
    if (!videoPendingDeletion) return;
    const targetId = videoPendingDeletion.id;
    const targetTitle = videoPendingDeletion.title;
    const updated = videos.filter((v) => v.id !== targetId);

    setVideos(updated);
    setVideoPendingDeletion(null);

    // Auto-save immediately to server and local storage
    setIsSaving(true);
    const res = await saveVideos(updated);
    setIsSaving(false);

    if (res.success) {
      setStatusMessage(`Video "${targetTitle}" was removed and saved live!`);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } else {
      setErrorMessage(res.error || 'Failed to save deletion.');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  // Confirmed Reset to defaults
  const handleConfirmReset = async () => {
    setShowResetConfirmModal(false);
    setIsSaving(true);
    await resetVideos();
    setVideos(getStoredVideos());
    setIsSaving(false);
    setStatusMessage('Restored default studio video reels across the website!');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Hidden File Inputs */}
      <input
        ref={videoFileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        onChange={handleVideoFileUpload}
        className="hidden"
      />
      <input
        ref={posterFileInputRef}
        type="file"
        accept="image/*"
        onChange={handlePosterImageUpload}
        className="hidden"
      />

      {/* Top Banner */}
      <div className="bg-[#161616] border border-zinc-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-[#FFD60A]/15 text-[#FFD60A]">
              <Video className="w-5 h-5" />
            </span>
            <h3 className="font-serif font-bold text-xl text-white">
              Studio Video Gallery &amp; Reels Management
            </h3>
          </div>
          <p className="text-xs text-zinc-400 mt-1.5 max-w-2xl leading-relaxed">
            Upload and manage inking process videos, client reveals, piercing sessions, and studio work videos. Video uploads and edits are secured exclusively in this admin panel and sync live to the gallery video section.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setShowResetConfirmModal(true)}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 hover:border-zinc-700 px-3.5 py-2.5 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={handleSaveAllToLive}
            disabled={isSaving}
            className="flex items-center gap-2 bg-[#FFD60A] hover:bg-[#ffe033] active:scale-[0.98] text-black font-bold text-xs px-5 py-2.5 rounded-lg shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-black" />
                <span>Saving Live...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 text-black" />
                <span>Save &amp; Apply Videos</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {saveSuccess && (
        <div className="bg-emerald-950/70 border border-emerald-500/50 text-emerald-200 px-4 py-3 rounded-xl text-xs flex items-center justify-between animate-in fade-in duration-200 shadow-lg">
          <span className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{statusMessage}</span>
          </span>
          <button onClick={() => setSaveSuccess(false)} className="text-emerald-400 hover:text-white text-xs cursor-pointer">
            &times;
          </button>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="bg-rose-950/80 border border-rose-500/50 text-rose-200 px-4 py-3 rounded-xl text-xs flex items-center justify-between animate-in fade-in duration-200 shadow-lg">
          <span className="flex items-center gap-2 font-medium">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </span>
          <button onClick={() => setErrorMessage('')} className="text-rose-400 hover:text-white text-xs cursor-pointer">
            &times;
          </button>
        </div>
      )}

      {/* Control Bar: Search + Category Filter + Add Video Button */}
      <div className="bg-[#161616] border border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-sm">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, artist, category, or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FFD60A]"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 text-xs text-white rounded-lg px-3 py-2 focus:outline-none focus:border-[#FFD60A] cursor-pointer"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'All' ? 'All Categories' : c}
              </option>
            ))}
          </select>

          <button
            onClick={handleAddNewVideo}
            className="flex items-center gap-1.5 text-xs font-bold text-black bg-[#FFD60A] hover:bg-yellow-400 px-4 py-2 rounded-lg transition-all cursor-pointer shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Upload New Video</span>
          </button>
        </div>
      </div>

      {/* Video Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredVideos.map((item, index) => (
          <div
            key={item.id}
            className="bg-[#161616] border border-zinc-800 rounded-2xl overflow-hidden shadow-md hover:border-zinc-700 transition-all flex flex-col group"
          >
            {/* Video Thumbnail / Preview Container */}
            <div className="relative aspect-[16/10] bg-black overflow-hidden">
              <img
                src={item.thumbnailUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

              {/* Play Icon Badge */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-12 h-12 rounded-full bg-black/60 group-hover:bg-[#FFD60A] text-white group-hover:text-black flex items-center justify-center backdrop-blur-md transition-all shadow-lg">
                  <Play className="w-5 h-5 fill-current translate-x-0.5" />
                </div>
              </div>

              {/* Top Duration and Category Badges */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                <span className="bg-black/70 backdrop-blur-md text-[#FFD60A] text-[10px] font-black uppercase px-2.5 py-1 rounded-md border border-white/10">
                  {item.category}
                </span>
                <span className="bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#FFD60A]" />
                  <span>{item.duration || '0:45'}</span>
                </span>
              </div>

              {/* Bottom Artist and Views */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white pointer-events-none">
                <span className="font-semibold text-zinc-200 truncate">{item.artist}</span>
                {item.views && (
                  <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                    <Eye className="w-3 h-3 text-zinc-400" />
                    <span>{item.views}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Video Details */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h4 className="font-serif font-bold text-sm text-white line-clamp-1">
                  {item.title}
                </h4>
                <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Style Tags */}
              <div className="flex flex-wrap gap-1">
                {item.tags.slice(0, 3).map((t) => (
                  <span
                    key={t}
                    className="bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] px-2 py-0.5 rounded"
                  >
                    #{t}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingItem({ ...item });
                    setIsCreatingNew(false);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold py-2 rounded-lg border border-zinc-800 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#FFD60A]" />
                  <span>Edit Video</span>
                </button>

                <button
                  type="button"
                  onClick={() => setVideoPendingDeletion(item)}
                  className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer border border-zinc-800"
                  title="Delete Video"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredVideos.length === 0 && (
        <div className="py-16 text-center space-y-3 bg-[#161616] border border-zinc-800 rounded-2xl p-8">
          <Video className="w-10 h-10 text-zinc-600 mx-auto" />
          <p className="text-zinc-400 text-sm">
            No video reels found matching your search.
          </p>
          <button
            onClick={handleAddNewVideo}
            className="text-xs font-bold text-[#FFD60A] underline cursor-pointer"
          >
            Upload a New Video Reel
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* EDIT / UPLOAD VIDEO MODAL */}
      {/* ============================================================== */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-[#141414] border border-zinc-800 rounded-3xl max-w-3xl w-full p-5 sm:p-7 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-[#FFD60A]/15 text-[#FFD60A] rounded-xl">
                  <Video className="w-5 h-5" />
                </span>
                <div>
                  <h4 className="font-serif font-bold text-lg text-white">
                    {isCreatingNew ? 'Upload & Add New Video' : 'Edit Studio Video Reel'}
                  </h4>
                  <p className="text-xs text-zinc-400">
                    Control video files, posters, descriptions, and artist tags
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video File / URL Section */}
            <div className="space-y-3 bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#FFD60A]">
                1. Video Media Source (Upload File or Direct MP4 Link)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                {/* Upload Button */}
                <button
                  type="button"
                  onClick={() => videoFileInputRef.current?.click()}
                  disabled={isUploadingVideo}
                  className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs py-3 rounded-xl transition-all cursor-pointer border border-zinc-700 disabled:opacity-50"
                >
                  {isUploadingVideo ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-[#FFD60A]" />
                      <span>Uploading to Server...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 text-[#FFD60A]" />
                      <span>Upload Video File (MP4/WebM)</span>
                    </>
                  )}
                </button>

                {/* Direct URL input */}
                <div>
                  <input
                    type="url"
                    placeholder="Or paste direct video URL (e.g. https://.../video.mp4)"
                    value={editingItem.videoUrl}
                    onChange={(e) => setEditingItem({ ...editingItem, videoUrl: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
                  />
                </div>
              </div>

              {/* Video Player Preview */}
              {editingItem.videoUrl && (
                <div className="relative aspect-[16/9] w-full max-w-md mx-auto bg-black rounded-xl overflow-hidden border border-zinc-800">
                  <video
                    ref={previewVideoRef}
                    src={editingItem.videoUrl}
                    poster={editingItem.thumbnailUrl}
                    playsInline
                    loop
                    controls
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
            </div>

            {/* Thumbnail Poster Image */}
            <div className="space-y-3 bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#FFD60A]">
                2. Video Cover / Thumbnail Poster
              </label>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-28 h-20 bg-black rounded-xl overflow-hidden border border-zinc-700 shrink-0">
                  <img
                    src={editingItem.thumbnailUrl}
                    alt="Thumbnail preview"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 space-y-2 w-full">
                  <button
                    type="button"
                    onClick={() => posterFileInputRef.current?.click()}
                    className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer"
                  >
                    <ImageIcon className="w-4 h-4 text-[#FFD60A]" />
                    <span>Upload Cover Image File</span>
                  </button>

                  <input
                    type="url"
                    placeholder="Or paste image URL for thumbnail poster..."
                    value={editingItem.thumbnailUrl}
                    onChange={(e) => setEditingItem({ ...editingItem, thumbnailUrl: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
                  />
                </div>
              </div>
            </div>

            {/* Video Details Form */}
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Video Reel Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hyper-Realism Wolf Forearm Inking Session"
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Category
                  </label>
                  <select
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFD60A] cursor-pointer"
                  >
                    {categories.filter(c => c !== 'All').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Artist */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Resident Artist
                  </label>
                  <select
                    value={editingItem.artist}
                    onChange={(e) => setEditingItem({ ...editingItem, artist: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFD60A] cursor-pointer"
                  >
                    {artistsList.map((a) => (
                      <option key={a.id} value={a.name}>{a.name}</option>
                    ))}
                  </select>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Video Duration (e.g. 1:15)
                  </label>
                  <input
                    type="text"
                    value={editingItem.duration}
                    onChange={(e) => setEditingItem({ ...editingItem, duration: e.target.value })}
                    placeholder="1:15"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Video Story &amp; Technique Description
                </label>
                <textarea
                  rows={3}
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  placeholder="Describe the tattoo process, needles used, placement, or client story..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#FFD60A] leading-relaxed"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="Realism, Black & Grey, Sleeve, Rohit Sharma"
                  value={editingItem.tags.join(', ')}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      tags: e.target.value
                        .split(',')
                        .map((t) => t.trim())
                        .filter(Boolean),
                    })
                  }
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
                />
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveModalDraft}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-black bg-[#FFD60A] hover:bg-[#ffe033] shadow-md transition-all cursor-pointer flex items-center gap-2"
              >
                <Check className="w-4 h-4 text-black" />
                <span>Save Video Draft</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {videoPendingDeletion && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#141414] border border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-lg text-white">
                  Remove Video Reel?
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Permanent removal from live gallery
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-900/70 p-3 rounded-xl border border-zinc-800/80">
              Are you sure you want to remove <strong className="text-white font-semibold">"{videoPendingDeletion.title}"</strong>? 
              This video will be removed immediately from the public video gallery and reels reel.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setVideoPendingDeletion(null)}
                disabled={isSaving}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                    <span>Removing...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Remove Video</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#141414] border border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-amber-500/10 text-[#FFD60A] border border-amber-500/20 shrink-0">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-lg text-white">
                  Reset Videos to Default?
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Restores 6 studio process &amp; reveal reels
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-900/70 p-3 rounded-xl border border-zinc-800/80">
              This will reset the entire video list back to the default studio videos (Inking sessions, client reveals, piercings, and academy sessions).
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirmModal(false)}
                disabled={isSaving}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-black bg-[#FFD60A] hover:bg-[#ffe033] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-black" />
                    <span>Resetting...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 text-black" />
                    <span>Confirm Reset</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
