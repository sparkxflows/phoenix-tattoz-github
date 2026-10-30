import React, { useState, useRef, useEffect } from 'react';
import { 
  Users, 
  Upload, 
  Link as LinkIcon, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  RefreshCw, 
  RotateCcw, 
  Star, 
  Clock, 
  Image as ImageIcon, 
  Sparkles, 
  Check, 
  X, 
  ChevronRight,
  ExternalLink,
  Award,
  AlertTriangle
} from 'lucide-react';
import { Artist } from '../data/studioData';
import { getStoredArtists, saveArtists, resetArtists, uploadImageToServer } from '../lib/studioContent';
import { supabase } from '../lib/supabase';

export const AdminArtistsManager: React.FC = () => {
  const [artists, setArtists] = useState<Artist[]>(getStoredArtists);
  const [selectedArtistIndex, setSelectedArtistIndex] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [newSpecialtyInput, setNewSpecialtyInput] = useState('');

  // In-app deletion and reset confirmation state (avoids blocked window.confirm in iframe)
  const [artistPendingDeletion, setArtistPendingDeletion] = useState<{ index: number; name: string } | null>(null);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const portfolioFileInputRef = useRef<HTMLInputElement>(null);
  const [portfolioTargetIndex, setPortfolioTargetIndex] = useState<number | null>(null);

  // Sync latest roster directly from Supabase Cloud on mount
  useEffect(() => {
    let isMounted = true;
    const loadFreshArtists = async () => {
      // 1. Authoritative Supabase Cloud Store
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'custom_artists')
          .single();

        if (!error && data && Array.isArray(data.value) && data.value.length > 0) {
          if (isMounted) {
            setArtists(data.value);
            try {
              localStorage.setItem('phoenix_studio_artists_v1', JSON.stringify(data.value));
            } catch {}
          }
          return;
        }
      } catch (e) {
        // Fallback
      }

      // 2. Server fallback
      try {
        const res = await fetch('/api/content/custom_artists', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success && Array.isArray(data.value) && data.value.length > 0) {
            setArtists(data.value);
            try {
              localStorage.setItem('phoenix_studio_artists_v1', JSON.stringify(data.value));
            } catch {}
          }
        }
      } catch {}
    };
    loadFreshArtists();
    return () => {
      isMounted = false;
    };
  }, []);

  const safeIndex = Math.min(Math.max(0, selectedArtistIndex), Math.max(0, artists.length - 1));
  const currentArtist = artists[safeIndex] || artists[0];

  // Helper to update fields of current artist safely
  const updateCurrentArtist = (updater: (prev: Artist) => Artist) => {
    setArtists((prev) => {
      if (!prev || prev.length === 0) return prev;
      const targetIdx = Math.min(Math.max(0, selectedArtistIndex), prev.length - 1);
      const copy = [...prev];
      if (copy[targetIdx]) {
        copy[targetIdx] = updater(copy[targetIdx]);
      }
      return copy;
    });
  };

  // Profile image upload directly to server persistent storage
  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WebP).');
      return;
    }

    setIsUploadingImage(true);
    setStatusMessage('Uploading profile photo to persistent server disk...');
    try {
      const serverUrl = await uploadImageToServer(file, 'artist_profile');
      updateCurrentArtist((a) => ({ ...a, image: serverUrl }));
      setStatusMessage('Artist profile photo saved to server storage!');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Failed to upload artist photo:', err);
      alert('Failed to upload photo to server storage.');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Portfolio image upload directly to server persistent storage
  const handlePortfolioImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || portfolioTargetIndex === null) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WebP).');
      return;
    }

    const targetIdx = portfolioTargetIndex;
    setIsUploadingImage(true);
    setStatusMessage('Uploading artwork to persistent server disk...');
    try {
      const serverUrl = await uploadImageToServer(file, 'artist_portfolio');
      updateCurrentArtist((a) => {
        const newPortfolio = [...a.portfolio];
        if (newPortfolio[targetIdx]) {
          newPortfolio[targetIdx] = {
            ...newPortfolio[targetIdx],
            image: serverUrl,
          };
        }
        return { ...a, portfolio: newPortfolio };
      });
      setStatusMessage('Portfolio artwork saved to server storage!');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Failed to upload portfolio artwork:', err);
      alert('Failed to upload artwork to server storage.');
    } finally {
      setIsUploadingImage(false);
      if (portfolioFileInputRef.current) portfolioFileInputRef.current.value = '';
    }
  };

  // Add specialty
  const handleAddSpecialty = () => {
    if (!newSpecialtyInput.trim()) return;
    const tag = newSpecialtyInput.trim();
    if (!currentArtist.specialties.includes(tag)) {
      updateCurrentArtist((a) => ({
        ...a,
        specialties: [...a.specialties, tag],
      }));
    }
    setNewSpecialtyInput('');
  };

  const handleRemoveSpecialty = (tag: string) => {
    updateCurrentArtist((a) => ({
      ...a,
      specialties: a.specialties.filter((s) => s !== tag),
    }));
  };

  // Timeline items
  const handleAddTimeline = () => {
    updateCurrentArtist((a) => ({
      ...a,
      timeline: [
        ...a.timeline,
        {
          year: new Date().getFullYear().toString(),
          title: 'New Milestone',
          desc: 'Description of achievement or specialization.',
        },
      ],
    }));
  };

  const handleRemoveTimeline = (idx: number) => {
    updateCurrentArtist((a) => ({
      ...a,
      timeline: a.timeline.filter((_, i) => i !== idx),
    }));
  };

  // Portfolio items
  const handleAddPortfolio = () => {
    updateCurrentArtist((a) => ({
      ...a,
      portfolio: [
        ...a.portfolio,
        {
          id: 'p_' + Date.now(),
          title: 'Custom Tattoo Artwork',
          category: 'Realism',
          image: 'https://images.unsplash.com/photo-1562962230-16e4623d36e6?auto=format&fit=crop&w=800&q=80',
        },
      ],
    }));
  };

  const handleRemovePortfolio = (idx: number) => {
    updateCurrentArtist((a) => ({
      ...a,
      portfolio: a.portfolio.filter((_, i) => i !== idx),
    }));
  };

  // Add new artist
  const handleAddNewArtist = () => {
    const newId = 'artist_' + Date.now();
    const newArtistObj: Artist = {
      id: newId,
      name: 'New Artist Name',
      role: 'Resident Tattoo Artist',
      subtitle: 'CUSTOM TATTOO SPECIALIST',
      rating: 4.8,
      reviewCount: 50,
      image: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=800&q=80',
      specialties: ['Custom Designs', 'Realism', 'Black & Grey'],
      bio: 'Professional tattoo artist dedicated to hygienic, high-detail, custom ink artistry.',
      experienceYears: 4,
      tattoosCompleted: 400,
      clientsCount: 250,
      timeline: [
        {
          year: new Date().getFullYear().toString(),
          title: 'Joined Phoenix Tattooz',
          desc: 'Resident artist crafting custom body art in Hisar.',
        },
      ],
      portfolio: [
        {
          id: 'p1_' + newId,
          title: 'Featured Custom Ink',
          category: 'Custom',
          image: 'https://images.unsplash.com/photo-1562962230-16e4623d36e6?auto=format&fit=crop&w=800&q=80',
        },
      ],
      socials: {
        instagram: 'https://instagram.com/phoenixtattooz',
        facebook: 'https://facebook.com/phoenixtattooz',
        youtube: 'https://youtube.com/@phoenixtattooz',
      },
    };

    setArtists((prev) => [...prev, newArtistObj]);
    setSelectedArtistIndex(artists.length);
    setStatusMessage(`New artist profile draft added! Update their details below and click Save.`);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  // Trigger in-app deletion modal
  const handleDeleteArtistClick = (idx: number) => {
    if (artists.length <= 1) {
      setErrorMessage('Studio roster must have at least 1 resident artist. You cannot delete the only remaining artist.');
      setTimeout(() => setErrorMessage(''), 5000);
      return;
    }
    const targetArtist = artists[idx];
    if (!targetArtist) return;
    setArtistPendingDeletion({
      index: idx,
      name: targetArtist.name,
    });
  };

  // Confirmed delete execution: applies filter, auto-saves to server & storage immediately
  const handleConfirmDelete = async () => {
    if (!artistPendingDeletion) return;
    const targetIdx = artistPendingDeletion.index;
    const targetName = artistPendingDeletion.name;
    const updated = artists.filter((_, i) => i !== targetIdx);

    setArtists(updated);
    setSelectedArtistIndex(0);
    setArtistPendingDeletion(null);

    // Save immediately so changes persist on server and across the entire website
    setIsSaving(true);
    setErrorMessage('');
    const res = await saveArtists(updated);
    setIsSaving(false);

    if (res.success) {
      setStatusMessage(`Artist "${targetName}" removed and roster updated successfully across website!`);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } else {
      setErrorMessage(res.error || 'Failed to persist artist deletion. Please try again.');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  // Explicit save changes for all fields (bio, photos, tags, stats, timeline, portfolio)
  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage('');
    const res = await saveArtists(artists);
    setIsSaving(false);

    if (res.success) {
      setStatusMessage('Artist details, bios, photos, and portfolio artworks successfully saved across the website!');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } else {
      setErrorMessage(res.error || 'Error saving artist details. Please check your network and try again.');
      setTimeout(() => setErrorMessage(''), 6000);
    }
  };

  // Open in-app reset confirmation modal
  const handleResetClick = () => {
    setShowResetConfirmModal(true);
  };

  // Confirmed reset to defaults
  const handleConfirmReset = async () => {
    setShowResetConfirmModal(false);
    setIsSaving(true);
    setErrorMessage('');
    await resetArtists();
    setArtists(getStoredArtists());
    setSelectedArtistIndex(0);
    setIsSaving(false);
    setStatusMessage('Restored default studio artists roster across website!');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleProfileImageUpload}
        className="hidden"
      />
      <input
        ref={portfolioFileInputRef}
        type="file"
        accept="image/*"
        onChange={handlePortfolioImageUpload}
        className="hidden"
      />

      {/* TOP PRIMARY ACTION BAR - Guaranteed at the very top for Mobile and Desktop */}
      <div className="sticky top-14 z-20 bg-[#161616]/95 backdrop-blur-md border border-zinc-800 rounded-2xl p-3.5 sm:p-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="p-2 rounded-xl bg-[#FFD60A]/15 text-[#FFD60A] shrink-0">
            <Users className="w-5 h-5" />
          </span>
          <div className="min-w-0">
            <h3 className="font-serif font-bold text-sm sm:text-base text-white truncate">
              Studio Artists Management
            </h3>
            <p className="text-[11px] text-zinc-400 truncate">
              Edits save to Supabase Cloud &amp; sync live to website
            </p>
          </div>
        </div>

        {/* Action Buttons: Very top of the screen */}
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto shrink-0">
          <button
            onClick={handleResetClick}
            type="button"
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            type="button"
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#FFD60A] hover:bg-[#ffe033] active:scale-[0.98] text-black font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-yellow-500/10 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-black" />
                <span>Saving to Supabase...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 text-black" />
                <span>Save &amp; Apply Artists</span>
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

      {/* Main Grid: Artist List on Left, Comprehensive Editor on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (4 cols): Artist Roster List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Studio Artists ({artists.length})
            </span>
            <button
              onClick={handleAddNewArtist}
              className="flex items-center gap-1 text-[11px] font-bold text-black bg-[#FFD60A] hover:bg-yellow-400 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Artist</span>
            </button>
          </div>

          <div className="space-y-2">
            {artists.map((artist, idx) => {
              const isSelected = idx === selectedArtistIndex;
              return (
                <div
                  key={artist.id}
                  onClick={() => setSelectedArtistIndex(idx)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-zinc-800/90 border-[#FFD60A] ring-1 ring-[#FFD60A] shadow-md'
                      : 'bg-[#161616] border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={artist.image}
                      alt={artist.name}
                      className="w-12 h-12 rounded-lg object-cover shrink-0 border border-zinc-700 bg-zinc-900"
                    />
                    <div className="min-w-0">
                      <h4 className="font-serif font-bold text-sm text-white truncate">
                        {artist.name}
                      </h4>
                      <p className="text-[11px] text-[#FFD60A] font-medium truncate">
                        {artist.role}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-zinc-400">
                        <span className="flex items-center gap-0.5 text-amber-300">
                          <Star className="w-2.5 h-2.5 fill-current" />
                          <span>{artist.rating}</span>
                        </span>
                        <span>&bull;</span>
                        <span>{artist.experienceYears}y exp</span>
                        <span>&bull;</span>
                        <span>{artist.portfolio.length} pieces</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {artists.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteArtistClick(idx);
                        }}
                        title={`Delete ${artist.name}`}
                        className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-[#FFD60A]' : 'text-zinc-600'}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (8 cols): Complete Editor for Selected Artist */}
        <div className="lg:col-span-8 bg-[#161616] border border-zinc-800 p-6 rounded-2xl space-y-6">
          {/* Section 1: Profile Photo & Basic Identity */}
          <div className="space-y-4">
            <h4 className="font-serif font-bold text-sm text-white flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#FFD60A]" />
                <span>1. Artist Profile Image &amp; Identity</span>
              </span>
              <span className="text-[10px] font-mono text-zinc-500">
                ID: {currentArtist.id}
              </span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-start">
              {/* Photo Card Preview & Upload */}
              <div className="sm:col-span-4 flex flex-col items-center gap-2.5 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
                <div className="relative aspect-[3/4] w-full max-w-[160px] rounded-xl overflow-hidden border-2 border-zinc-700 shadow-lg group">
                  <img
                    src={currentArtist.image}
                    alt={currentArtist.name}
                    className="w-full h-full object-cover"
                  />
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1.5 transition-opacity cursor-pointer text-white text-xs font-semibold"
                  >
                    <Upload className="w-5 h-5 text-[#FFD60A]" />
                    <span>Upload New</span>
                  </div>
                </div>

                <div className="w-full space-y-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#FFD60A]" />
                    <span>Upload Image File</span>
                  </button>

                  <div className="relative">
                    <input
                      type="url"
                      value={currentArtist.image}
                      onChange={(e) => updateCurrentArtist((a) => ({ ...a, image: e.target.value }))}
                      placeholder="Paste Image URL..."
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-[11px] text-zinc-300 focus:outline-none focus:border-[#FFD60A]"
                    />
                  </div>
                </div>
              </div>

              {/* Identity Form */}
              <div className="sm:col-span-8 space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                      Artist Full Name
                    </label>
                    <input
                      type="text"
                      value={currentArtist.name}
                      onChange={(e) => updateCurrentArtist((a) => ({ ...a, name: e.target.value }))}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                      Studio Role / Title
                    </label>
                    <input
                      type="text"
                      value={currentArtist.role}
                      onChange={(e) => updateCurrentArtist((a) => ({ ...a, role: e.target.value }))}
                      placeholder="e.g. Founder & Lead Artist"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                    Header Subtitle / Tagline
                  </label>
                  <input
                    type="text"
                    value={currentArtist.subtitle}
                    onChange={(e) => updateCurrentArtist((a) => ({ ...a, subtitle: e.target.value }))}
                    placeholder="e.g. CUSTOM TATTOO ARTIST | BLACK & GREY SPECIALIST"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                      Rating (e.g. 4.9)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="1.0"
                      max="5.0"
                      value={currentArtist.rating}
                      onChange={(e) => updateCurrentArtist((a) => ({ ...a, rating: parseFloat(e.target.value) || 5.0 }))}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                      Reviews Count (e.g. 245)
                    </label>
                    <input
                      type="number"
                      value={currentArtist.reviewCount}
                      onChange={(e) => updateCurrentArtist((a) => ({ ...a, reviewCount: parseInt(e.target.value) || 0 }))}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Bio & Experience Metrics */}
          <div className="space-y-4 pt-3 border-t border-zinc-800">
            <h4 className="font-serif font-bold text-sm text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-[#FFD60A]" />
              <span>2. About / Bio &amp; Statistics</span>
            </h4>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                Artist Biography / Story
              </label>
              <textarea
                rows={4}
                value={currentArtist.bio}
                onChange={(e) => updateCurrentArtist((a) => ({ ...a, bio: e.target.value }))}
                placeholder="Write the artist's backstory, artistic journey, and specialties..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-[#FFD60A] leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Years Exp
                </label>
                <input
                  type="number"
                  value={currentArtist.experienceYears}
                  onChange={(e) => updateCurrentArtist((a) => ({ ...a, experienceYears: parseInt(e.target.value) || 1 }))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Tattoos Inked
                </label>
                <input
                  type="number"
                  value={currentArtist.tattoosCompleted}
                  onChange={(e) => updateCurrentArtist((a) => ({ ...a, tattoosCompleted: parseInt(e.target.value) || 100 }))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Clients Count
                </label>
                <input
                  type="number"
                  value={currentArtist.clientsCount}
                  onChange={(e) => updateCurrentArtist((a) => ({ ...a, clientsCount: parseInt(e.target.value) || 100 }))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Specialties Tags */}
          <div className="space-y-3 pt-3 border-t border-zinc-800">
            <h4 className="font-serif font-bold text-sm text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FFD60A]" />
                <span>3. Style Specialties &amp; Categories</span>
              </span>
            </h4>

            {/* Existing Tags */}
            <div className="flex flex-wrap items-center gap-2">
              {currentArtist.specialties.map((spec) => (
                <span
                  key={spec}
                  className="inline-flex items-center gap-1.5 bg-zinc-800 border border-zinc-700 text-white text-xs px-3 py-1.5 rounded-lg"
                >
                  <span>{spec}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSpecialty(spec)}
                    className="text-zinc-400 hover:text-rose-400 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>

            {/* Add tag input */}
            <div className="flex items-center gap-2 max-w-sm">
              <input
                type="text"
                value={newSpecialtyInput}
                onChange={(e) => setNewSpecialtyInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSpecialty())}
                placeholder="Add specialty (e.g. Fine Line, Japanese)..."
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
              />
              <button
                type="button"
                onClick={handleAddSpecialty}
                className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs px-3 py-2 rounded-lg font-semibold transition-colors cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>

          {/* Section 4: Timeline Milestones */}
          <div className="space-y-3 pt-3 border-t border-zinc-800">
            <div className="flex items-center justify-between">
              <h4 className="font-serif font-bold text-sm text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#FFD60A]" />
                <span>4. Experience Timeline Milestones ({currentArtist.timeline.length})</span>
              </h4>
              <button
                type="button"
                onClick={handleAddTimeline}
                className="flex items-center gap-1 text-[11px] text-[#FFD60A] hover:underline font-semibold"
              >
                <Plus className="w-3 h-3" />
                <span>Add Milestone</span>
              </button>
            </div>

            <div className="space-y-3">
              {currentArtist.timeline.map((item, idx) => (
                <div key={idx} className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                      <input
                        type="text"
                        value={item.year}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateCurrentArtist((a) => {
                            const tl = [...a.timeline];
                            tl[idx] = { ...tl[idx], year: val };
                            return { ...a, timeline: tl };
                          });
                        }}
                        placeholder="Year (e.g. 2021)"
                        className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-[#FFD60A] font-bold focus:outline-none focus:border-[#FFD60A]"
                      />
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateCurrentArtist((a) => {
                            const tl = [...a.timeline];
                            tl[idx] = { ...tl[idx], title: val };
                            return { ...a, timeline: tl };
                          });
                        }}
                        placeholder="Title of milestone"
                        className="sm:col-span-2 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveTimeline(idx)}
                      className="p-1.5 text-zinc-500 hover:text-rose-400 rounded-lg transition-colors shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={item.desc}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateCurrentArtist((a) => {
                        const tl = [...a.timeline];
                        tl[idx] = { ...tl[idx], desc: val };
                        return { ...a, timeline: tl };
                      });
                    }}
                    placeholder="Milestone description..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-[11px] text-zinc-300 focus:outline-none focus:border-[#FFD60A]"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Portfolio Artworks */}
          <div className="space-y-3 pt-3 border-t border-zinc-800">
            <div className="flex items-center justify-between">
              <h4 className="font-serif font-bold text-sm text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#FFD60A]" />
                <span>5. Artist Portfolio Artworks ({currentArtist.portfolio.length})</span>
              </h4>
              <button
                type="button"
                onClick={handleAddPortfolio}
                className="flex items-center gap-1 text-[11px] text-[#FFD60A] hover:underline font-semibold"
              >
                <Plus className="w-3 h-3" />
                <span>Add Artwork</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentArtist.portfolio.map((item, idx) => (
                <div key={item.id || idx} className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800 flex gap-3">
                  <div className="relative w-20 h-24 rounded-lg overflow-hidden shrink-0 border border-zinc-700 bg-zinc-950 group">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setPortfolioTargetIndex(idx);
                        portfolioFileInputRef.current?.click();
                      }}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-semibold transition-opacity cursor-pointer"
                    >
                      Replace
                    </button>
                  </div>

                  <div className="flex-1 space-y-1.5 min-w-0">
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateCurrentArtist((a) => {
                          const pf = [...a.portfolio];
                          pf[idx] = { ...pf[idx], title: val };
                          return { ...a, portfolio: pf };
                        });
                      }}
                      placeholder="Piece Title"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
                    />
                    <input
                      type="text"
                      value={item.category}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateCurrentArtist((a) => {
                          const pf = [...a.portfolio];
                          pf[idx] = { ...pf[idx], category: val };
                          return { ...a, portfolio: pf };
                        });
                      }}
                      placeholder="Category (e.g. Realism)"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-[11px] text-zinc-300 focus:outline-none focus:border-[#FFD60A]"
                    />
                    <input
                      type="url"
                      value={item.image}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateCurrentArtist((a) => {
                          const pf = [...a.portfolio];
                          pf[idx] = { ...pf[idx], image: val };
                          return { ...a, portfolio: pf };
                        });
                      }}
                      placeholder="Image URL"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-[10px] text-zinc-400 focus:outline-none focus:border-[#FFD60A]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemovePortfolio(idx)}
                    className="p-1 text-zinc-500 hover:text-rose-400 self-start"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Save Action Banner at Bottom */}
          <div className="pt-4 border-t border-zinc-800 flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="bg-[#FFD60A] hover:bg-[#ffe033] text-black font-bold text-xs px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-black" />
                  <span>Save &amp; Apply All Artist Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* In-App Confirmation Modal for Artist Deletion */}
      {artistPendingDeletion && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#141414] border border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-lg text-white">
                  Remove Artist Profile?
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Permanent removal from studio roster
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-900/70 p-3 rounded-xl border border-zinc-800/80">
              Are you sure you want to remove <strong className="text-white font-semibold">"{artistPendingDeletion.name}"</strong>? 
              This will remove their profile photo, bio, style specialties, experience timeline, and portfolio works across the live website and booking system.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setArtistPendingDeletion(null)}
                disabled={isSaving}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-950/50 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                    <span>Removing...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Remove Artist</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-App Confirmation Modal for Roster Reset */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#141414] border border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-amber-500/10 text-[#FFD60A] border border-amber-500/20 shrink-0">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-lg text-white">
                  Reset Artists to Default?
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Restores default 4 resident artists
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-900/70 p-3 rounded-xl border border-zinc-800/80">
              This will reset the entire roster back to default studio artists (<span className="text-white">Rohit Sharma, Sneha Verma, Arjun Mehta, Kavya Singh</span>), removing any custom profiles or bio edits.
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
