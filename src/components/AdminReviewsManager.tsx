import React, { useState, useEffect } from 'react';
import { 
  Star, 
  MessageSquare, 
  Trash2, 
  CheckCircle2, 
  RotateCcw, 
  Save, 
  Plus, 
  ShieldCheck, 
  Edit3, 
  X, 
  Check, 
  BookOpen, 
  ExternalLink, 
  Sparkles, 
  Quote, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Upload, 
  Play, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Wand2,
  Calendar,
  Filter,
  RefreshCw,
  Globe,
  UploadCloud
} from 'lucide-react';
import { 
  getStoredReviews, 
  saveReviews, 
  resetReviews, 
  getStoredPhilosophy, 
  savePhilosophy, 
  resetPhilosophy, 
  CustomerReview, 
  StudioPhilosophy,
  DEFAULT_CUSTOMER_REVIEWS,
  DEFAULT_STUDIO_PHILOSOPHY,
  syncAllCurrentContentToServer
} from '../lib/studioContent';
import { supabase } from '../lib/supabase';

// Quick realistic review templates for admin convenience
const QUICK_REVIEW_PRESETS = [
  {
    name: "Vikram Malhotra",
    city: "Hisar",
    rating: 5,
    service: "Custom Tattooing",
    artist: "Rohit Sharma",
    title: "Masterpiece Lion & Geometric Sleeve! 100% Painless",
    text: "Had a 6-hour realism session with master Rohit Sharma. The shading gradient and fine whiskers on the lion look alive. Hospital-like cleanliness and sterile needle packs opened right in front of me.",
    images: [
      "https://images.unsplash.com/photo-1562962230-16e4623d36e6?auto=format&fit=crop&w=900&q=80"
    ],
    videos: [
      "/uploads/studio_bg_video.mp4#t=6.4"
    ],
    studioReply: "Thank you Vikram! It was an absolute honor crafting this custom realism sleeve for you."
  },
  {
    name: "Simran Kaur",
    city: "Delhi",
    rating: 5,
    service: "Custom Tattooing",
    artist: "Sneha Verma",
    title: "Delicate lavender fine-line on wrist - Healed crisp!",
    text: "Drove down from Delhi after seeing Sneha's fine-line portfolio. She took 30 minutes just adjusting the stencil to my natural wrist anatomy. Zero blowouts, healed within 6 days with their Dermalize bandage.",
    images: [
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80"
    ]
  },
  {
    name: "Amit Choudhary",
    city: "Rohtak",
    rating: 5,
    service: "Cover-Up & Rework",
    artist: "Rohit Sharma",
    title: "Genius cover-up! Completely swallowed my 8-year blurry tribal tattoo",
    text: "I thought my old faded college tattoo could never be saved. Rohit designed a dynamic Japanese dragon and smoke clouds that totally masked the old ink. People can't believe there was an old tattoo underneath!",
    images: [
      "https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?auto=format&fit=crop&w=900&q=80"
    ]
  },
  {
    name: "Priya Sangwan",
    city: "Hisar",
    rating: 5,
    service: "Cosmetic Tattooing",
    artist: "Sneha Verma",
    title: "Microblading & Lip Blush look incredibly soft and natural",
    text: "Got ombre powder brows and sheer lip blush done. Sneha was so patient and hygienic with disposable cartridges and medical numbing cream. I wake up with perfect brows every morning!",
    images: [
      "https://images.unsplash.com/photo-1512690459411-b9245aed614b?auto=format&fit=crop&w=900&q=80"
    ]
  },
  {
    name: "Harish Nain",
    city: "Sirsa",
    rating: 5,
    service: "Academy Course",
    artist: "Rohit Sharma",
    title: "Phoenix Academy 3-month certification course changed my life",
    text: "Completed the 3-month tattoo mastery course under Rohit sir. Hands-on machine tuning, skin depth control, autoclave safety, and supervised live models. I now run my own setup in Sirsa!",
    images: [
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=900&q=80"
    ]
  }
];

export const AdminReviewsManager: React.FC = () => {
  const [reviews, setReviews] = useState<CustomerReview[]>(getStoredReviews);
  const [philosophy, setPhilosophy] = useState<StudioPhilosophy>(getStoredPhilosophy);
  const [activeSubTab, setActiveSubTab] = useState<'reviews' | 'philosophy'>('reviews');

  // Moderation filter tab
  const [moderationFilter, setModerationFilter] = useState<'all' | 'approved' | 'hidden' | 'featured'>('all');

  // State for replying to a review
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Editing existing review state
  const [editingReview, setEditingReview] = useState<CustomerReview | null>(null);

  // Sync latest customer reviews directly from Supabase Cloud on mount
  useEffect(() => {
    let isMounted = true;
    const fetchRemote = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'customer_reviews')
          .single();

        if (!error && data && Array.isArray(data.value) && data.value.length > 0 && isMounted) {
          setReviews(data.value);
          try {
            localStorage.setItem('phoenix_studio_reviews_v1', JSON.stringify(data.value));
          } catch {}
        }
      } catch (e) {}
    };
    fetchRemote();
    return () => {
      isMounted = false;
    };
  }, []);

  // State for adding new custom/fake review
  const [isAddingReview, setIsAddingReview] = useState(false);
  const [newRevName, setNewRevName] = useState('');
  const [newRevCity, setNewRevCity] = useState('Hisar');
  const [newRevRating, setNewRevRating] = useState(5);
  const [newRevDate, setNewRevDate] = useState('March 2026');
  const [newRevTitle, setNewRevTitle] = useState('');
  const [newRevText, setNewRevText] = useState('');
  const [newRevService, setNewRevService] = useState('Custom Tattooing');
  const [newRevArtist, setNewRevArtist] = useState('Rohit Sharma');
  const [newRevApproved, setNewRevApproved] = useState(true);
  const [newRevVerified, setNewRevVerified] = useState(true);
  const [newRevFeatured, setNewRevFeatured] = useState(true);
  const [newRevStudioReply, setNewRevStudioReply] = useState('');
  const [newRevImages, setNewRevImages] = useState<string[]>([]);
  const [newRevImageUrl, setNewRevImageUrl] = useState('');
  const [newRevVideos, setNewRevVideos] = useState<string[]>([]);
  const [newRevVideoUrl, setNewRevVideoUrl] = useState('');

  // In-UI modal for adding photos/videos to existing reviews without prompt()
  const [mediaModalTarget, setMediaModalTarget] = useState<{ reviewId: string; type: 'image' | 'video'; reviewName: string } | null>(null);
  const [modalMediaUrl, setModalMediaUrl] = useState('');
  const [modalMediaFile, setModalMediaFile] = useState<string | null>(null);

  // In-UI modal for deleting review without confirm()
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{ reviewId: string; name: string } | null>(null);

  // Lightbox preview inside admin
  const [previewMedia, setPreviewMedia] = useState<{ type: 'image' | 'video'; url: string; title: string } | null>(null);

  // Status feedback & Live Sync State
  const [statusMsg, setStatusMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingLive, setIsSavingLive] = useState(false);
  const [hasUnsavedLiveChanges, setHasUnsavedLiveChanges] = useState(false);
  const [lastSavedLiveTime, setLastSavedLiveTime] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(''), 4500);
  };

  // Master "Save in Live" Action Handler
  const handleSaveInLive = async () => {
    setIsSavingLive(true);
    try {
      // 1. Save all current reviews to localStorage & broadcast event
      await saveReviews(reviews);
      
      // 2. Save studio philosophy
      await savePhilosophy(philosophy);

      // 3. Full server sync to database
      await syncAllCurrentContentToServer();

      setIsSavingLive(false);
      setHasUnsavedLiveChanges(false);
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSavedLiveTime(timeStr);
      showNotification(`✓ Successfully saved in LIVE website at ${timeStr}! All customizations, deleted photos, and reviews are now published live for all visitors.`);
    } catch (err: any) {
      setIsSavingLive(false);
      showNotification('Error saving in live website: ' + (err?.message || 'Unknown error'));
    }
  };

  // Approved and hidden counts
  const approvedCount = reviews.filter((r) => r.approved !== false).length;
  const hiddenCount = reviews.filter((r) => r.approved === false).length;
  const featuredCount = reviews.filter((r) => r.featured).length;

  // Toggle approval status (Show or Hide from public website)
  const handleToggleApproval = async (id: string) => {
    const updated = reviews.map((r) => {
      if (r.id === id) {
        const nextApproved = !(r.approved !== false);
        return { ...r, approved: nextApproved };
      }
      return r;
    });
    setReviews(updated);
    await saveReviews(updated);
    setHasUnsavedLiveChanges(true);
    const target = updated.find((r) => r.id === id);
    showNotification(
      target?.approved 
        ? `Review by "${target.name}" is now APPROVED. Click "Save in Live" to publish live.` 
        : `Review by "${target?.name}" is now HIDDEN. Click "Save in Live" to publish live.`
    );
  };

  // Bulk Approve All
  const handleApproveAll = async () => {
    const updated = reviews.map((r) => ({ ...r, approved: true }));
    setReviews(updated);
    await saveReviews(updated);
    setHasUnsavedLiveChanges(true);
    showNotification('All reviews set to APPROVED. Click "Save in Live" to commit changes.');
  };

  // Bulk Hide All
  const handleHideAll = async () => {
    const updated = reviews.map((r) => ({ ...r, approved: false }));
    setReviews(updated);
    await saveReviews(updated);
    setHasUnsavedLiveChanges(true);
    showNotification('All reviews set to HIDDEN. Click "Save in Live" to commit changes.');
  };

  // Toggle Featured status
  const handleToggleFeatured = async (id: string) => {
    const updated = reviews.map((r) => (r.id === id ? { ...r, featured: !r.featured } : r));
    setReviews(updated);
    await saveReviews(updated);
    setHasUnsavedLiveChanges(true);
    showNotification('Updated featured status. Click "Save in Live" to commit changes.');
  };

  // Delete review execution
  const executeDeleteReview = async (id: string, saveLiveNow: boolean = false) => {
    const updated = reviews.filter((r) => r.id !== id);
    setReviews(updated);
    await saveReviews(updated);
    setDeleteConfirmTarget(null);
    setHasUnsavedLiveChanges(true);
    if (saveLiveNow) {
      await handleSaveInLive();
    } else {
      showNotification('Review deleted permanently. Click "Save in Live" to update the live website.');
    }
  };

  // Submit Studio Reply
  const handleSaveReply = async (id: string) => {
    const updated = reviews.map((r) => (r.id === id ? { ...r, studioReply: replyText.trim() || undefined } : r));
    setReviews(updated);
    await saveReviews(updated);
    setReplyingReviewId(null);
    setReplyText('');
    showNotification('Official Phoenix studio reply saved.');
  };

  // Apply quick preset to new review form
  const handleApplyPreset = (preset: typeof QUICK_REVIEW_PRESETS[0]) => {
    setNewRevName(preset.name);
    setNewRevCity(preset.city);
    setNewRevRating(preset.rating);
    setNewRevService(preset.service);
    setNewRevArtist(preset.artist);
    setNewRevTitle(preset.title);
    setNewRevText(preset.text);
    setNewRevImages(preset.images || []);
    setNewRevVideos(preset.videos || []);
    setNewRevStudioReply(preset.studioReply || '');
    setNewRevApproved(true);
    setNewRevVerified(true);
    setNewRevFeatured(true);
    showNotification(`Filled template: "${preset.title.slice(0, 30)}..."`);
  };

  // Handle image upload from file in manual form
  const handleManualImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX = 900;
          let w = img.width;
          let h = img.height;
          if (w > h && w > MAX) {
            h = Math.round((h * MAX) / w);
            w = MAX;
          } else if (h > MAX) {
            w = Math.round((w * MAX) / h);
            h = MAX;
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
            setNewRevImages((prev) => [...prev, dataUrl]);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  // Open media attachment modal for review
  const openAddMediaModal = (reviewId: string, type: 'image' | 'video', reviewName: string) => {
    setMediaModalTarget({ reviewId, type, reviewName });
    setModalMediaUrl('');
    setModalMediaFile(null);
  };

  // Confirm adding media from modal
  const handleConfirmAddMedia = async () => {
    if (!mediaModalTarget) return;
    const finalUrl = modalMediaFile || modalMediaUrl.trim();
    if (!finalUrl) {
      showNotification('Please provide a URL or upload a file.');
      return;
    }

    const { reviewId, type } = mediaModalTarget;
    const updated = reviews.map((r) => {
      if (r.id === reviewId) {
        if (type === 'image') {
          return { ...r, images: [...(r.images || []), finalUrl] };
        } else {
          return { ...r, videos: [...(r.videos || []), finalUrl] };
        }
      }
      return r;
    });

    setReviews(updated);
    await saveReviews(updated);
    setMediaModalTarget(null);
    setModalMediaUrl('');
    setModalMediaFile(null);
    showNotification(`Added ${type} to review.`);
  };

  // Handle modal image/video file upload
  const handleModalFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'image') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX = 900;
          let w = img.width;
          let h = img.height;
          if (w > h && w > MAX) {
            h = Math.round((h * MAX) / w);
            w = MAX;
          } else if (h > MAX) {
            w = Math.round((w * MAX) / h);
            h = MAX;
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            setModalMediaFile(canvas.toDataURL('image/jpeg', 0.82));
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setModalMediaFile(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove media from an existing review
  const handleRemoveMediaFromReview = async (reviewId: string, type: 'image' | 'video', index: number) => {
    const updated = reviews.map((r) => {
      if (r.id === reviewId) {
        if (type === 'image') {
          return { ...r, images: r.images?.filter((_, i) => i !== index) };
        } else {
          return { ...r, videos: r.videos?.filter((_, i) => i !== index) };
        }
      }
      return r;
    });

    setReviews(updated);
    await saveReviews(updated);
    setHasUnsavedLiveChanges(true);
    showNotification(`Removed ${type}. Click "Save in Live" to publish changes live to the website.`);
  };

  // Create Custom/Fake Review Form Submit
  const handleCreateManualReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRevName.trim() || !newRevText.trim()) {
      showNotification('Please enter at least client name and review text.');
      return;
    }

    const newRev: CustomerReview = {
      id: `rev-${Date.now()}`,
      name: newRevName.trim(),
      city: newRevCity.trim() || 'Hisar',
      rating: newRevRating,
      date: newRevDate.trim() || new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      title: newRevTitle.trim() || `${newRevService} Experience`,
      text: newRevText.trim(),
      service: newRevService,
      artist: newRevArtist,
      verified: newRevVerified,
      featured: newRevFeatured,
      approved: newRevApproved,
      studioReply: newRevStudioReply.trim() || undefined,
      images: newRevImages.length > 0 ? newRevImages : undefined,
      videos: newRevVideos.length > 0 ? newRevVideos : undefined,
      createdAt: new Date().toISOString(),
    };

    const updated = [newRev, ...reviews];
    setReviews(updated);
    await saveReviews(updated);
    setIsAddingReview(false);

    // Reset form
    setNewRevName('');
    setNewRevTitle('');
    setNewRevText('');
    setNewRevStudioReply('');
    setNewRevImages([]);
    setNewRevVideos([]);

    showNotification(
      newRev.approved 
        ? 'New review created and published live on website!' 
        : 'New review created and saved in pending/hidden state.'
    );
  };

  // Update existing review in edit mode
  const handleSaveEditedReview = async () => {
    if (!editingReview) return;
    const updated = reviews.map((r) => (r.id === editingReview.id ? editingReview : r));
    setReviews(updated);
    await saveReviews(updated);
    setEditingReview(null);
    showNotification('Review edits saved successfully.');
  };

  // Reset Reviews to studio default set
  const handleResetReviews = async () => {
    if (window.confirm('Reset all customer reviews to studio default set (with sample photos & videos)?')) {
      await resetReviews();
      setReviews(DEFAULT_CUSTOMER_REVIEWS);
      showNotification('Customer reviews reset to defaults.');
    }
  };

  // Save Philosophy Changes
  const handleSavePhilosophy = async () => {
    setIsSaving(true);
    const res = await savePhilosophy(philosophy);
    setIsSaving(false);
    if (res.success) {
      showNotification('Studio thoughts & philosophy updated successfully.');
    } else {
      alert(res.error || 'Failed to save philosophy.');
    }
  };

  // Reset Philosophy
  const handleResetPhilosophy = async () => {
    if (window.confirm('Reset Studio Thoughts & Views to defaults?')) {
      await resetPhilosophy();
      setPhilosophy(DEFAULT_STUDIO_PHILOSOPHY);
      showNotification('Studio thoughts reset to defaults.');
    }
  };

  // Filtered reviews based on moderation filter
  const displayedReviews = reviews.filter((r) => {
    if (moderationFilter === 'approved') return r.approved !== false;
    if (moderationFilter === 'hidden') return r.approved === false;
    if (moderationFilter === 'featured') return r.featured;
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-[#181818] border border-zinc-800 rounded-2xl p-6 sm:p-7 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFD60A]" />
            <span className="text-xs font-bold text-[#FFD60A] uppercase tracking-wider">
              Reviews &amp; Moderation Center
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight">
            Client Reviews &amp; Studio Creed Management
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Full administrative power: Add custom/synthetic reviews, approve or hide client submissions, attach tattoo photos &amp; videos, and delete unwanted feedback.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto shrink-0">
          {/* Status Indicator */}
          {hasUnsavedLiveChanges ? (
            <span className="flex items-center gap-1.5 text-[11px] text-amber-300 font-semibold bg-amber-500/10 border border-amber-500/30 px-3 py-2 rounded-xl animate-pulse">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Pending Live Save</span>
            </span>
          ) : lastSavedLiveTime ? (
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl">
              <Check className="w-3.5 h-3.5" />
              <span>Live Synced {lastSavedLiveTime}</span>
            </span>
          ) : null}

          <a
            href="/reviews"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-700 px-3.5 py-2.5 rounded-xl transition-colors"
          >
            <span>View Public /reviews</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {/* Primary Save in Live Button */}
          <button
            onClick={handleSaveInLive}
            disabled={isSavingLive}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 active:scale-95 text-black font-extrabold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/25 transition-all cursor-pointer disabled:opacity-50"
            title="Save and deploy all changes to the live website"
          >
            {isSavingLive ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-black" />
                <span>Saving to Live...</span>
              </>
            ) : (
              <>
                <Globe className="w-4 h-4 text-black" />
                <span>Save in Live</span>
              </>
            )}
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 px-4 py-3 rounded-xl text-xs flex items-center gap-2.5 shadow-sm animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Main Subtabs */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 border-b border-zinc-800 pb-3">
        <button
          onClick={() => setActiveSubTab('reviews')}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'reviews'
              ? 'bg-[#FFD60A] text-black shadow-md'
              : 'bg-zinc-900 text-zinc-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Reviews Moderation ({reviews.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('philosophy')}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'philosophy'
              ? 'bg-[#FFD60A] text-black shadow-md'
              : 'bg-zinc-900 text-zinc-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Studio Thoughts &amp; Creed</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* SUBTAB 1: REVIEWS MODERATION & CREATION */}
      {/* ========================================================= */}
      {activeSubTab === 'reviews' && (
        <div className="space-y-6">
          
          {/* Action Bar: Stats, Filter Tabs & Add Review Button */}
          <div className="bg-[#141414] p-4 sm:p-5 rounded-2xl border border-zinc-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* Moderation filter buttons */}
                <button
                  onClick={() => setModerationFilter('all')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                    moderationFilter === 'all'
                      ? 'bg-zinc-800 text-white border border-zinc-600'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  All ({reviews.length})
                </button>
                <button
                  onClick={() => setModerationFilter('approved')}
                  className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    moderationFilter === 'approved'
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50'
                      : 'bg-zinc-900 text-emerald-400/80 hover:text-emerald-300'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Live on Website ({approvedCount})</span>
                </button>
                <button
                  onClick={() => setModerationFilter('hidden')}
                  className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    moderationFilter === 'hidden'
                      ? 'bg-amber-950/80 text-amber-300 border border-amber-500/50'
                      : 'bg-zinc-900 text-amber-400/80 hover:text-amber-300'
                  }`}
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Hidden / Needs Approval ({hiddenCount})</span>
                </button>
                <button
                  onClick={() => setModerationFilter('featured')}
                  className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    moderationFilter === 'featured'
                      ? 'bg-yellow-950/80 text-[#FFD60A] border border-[#FFD60A]/50'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  <Star className="w-3.5 h-3.5 fill-[#FFD60A] text-[#FFD60A]" />
                  <span>Featured ({featuredCount})</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleSaveInLive}
                  disabled={isSavingLive}
                  className="flex items-center gap-1.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-xl transition-all cursor-pointer shadow-md disabled:opacity-50"
                  title="Save all review customizations directly to the live website"
                >
                  {isSavingLive ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-black" />
                  ) : (
                    <Globe className="w-3.5 h-3.5 text-black" />
                  )}
                  <span>Save in Live</span>
                </button>
                <button
                  onClick={handleResetReviews}
                  className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-xl transition-colors cursor-pointer"
                  title="Reset to default set"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span className="hidden sm:inline">Reset Defaults</span>
                </button>
                <button
                  onClick={() => setIsAddingReview(!isAddingReview)}
                  className="flex items-center gap-1.5 text-xs font-bold bg-[#FFD60A] hover:bg-[#ffe033] text-black px-4 py-2 rounded-xl transition-all cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4 text-black" />
                  <span>+ Add New Review</span>
                </button>
              </div>
            </div>

            {/* Quick Bulk Action row */}
            <div className="pt-2 border-t border-zinc-800/80 flex flex-wrap items-center justify-between text-[11px] text-zinc-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#FFD60A]" />
                Toggle <strong>"Live on Website"</strong> to control which reviews are publicly visible to clients.
              </span>
              <div className="flex items-center gap-2 mt-1 sm:mt-0">
                <button
                  onClick={handleApproveAll}
                  className="text-emerald-400 hover:underline cursor-pointer"
                >
                  Approve All ({reviews.length})
                </button>
                <span>&bull;</span>
                <button
                  onClick={handleHideAll}
                  className="text-amber-400 hover:underline cursor-pointer"
                >
                  Hide All ({reviews.length})
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* DRAWER: ADD NEW CUSTOM / FAKE REVIEW */}
          {/* ========================================================= */}
          {isAddingReview && (
            <form onSubmit={handleCreateManualReview} className="bg-[#181818] border-2 border-[#FFD60A]/40 p-6 rounded-2xl space-y-5 animate-in slide-in-from-top-3 duration-200 shadow-xl">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#FFD60A]" />
                    <span>Create New Custom / Synthetic Review</span>
                  </h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Add customer reviews manually or generate high-converting client feedback with 1 click.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingReview(false)}
                  className="p-1.5 text-zinc-400 hover:text-white bg-zinc-900 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 1-Click Preset Generators */}
              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 space-y-2">
                <span className="text-[11px] font-bold text-[#FFD60A] uppercase tracking-wider flex items-center gap-1.5">
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>⚡ 1-Click Realistic Review Templates:</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_REVIEW_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className="text-[11px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white px-3 py-1 rounded-lg border border-zinc-700/80 transition-colors cursor-pointer"
                    >
                      {preset.name} ({preset.service})
                    </button>
                  ))}
                </div>
              </div>

              {/* Name, City, Rating, Date */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] text-zinc-300 block mb-1">Client Name *</label>
                  <input
                    type="text"
                    required
                    value={newRevName}
                    onChange={(e) => setNewRevName(e.target.value)}
                    placeholder="e.g. Vikram Batra"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-300 block mb-1">City / Location</label>
                  <input
                    type="text"
                    value={newRevCity}
                    onChange={(e) => setNewRevCity(e.target.value)}
                    placeholder="Hisar"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-300 block mb-1">Star Rating</label>
                  <select
                    value={newRevRating}
                    onChange={(e) => setNewRevRating(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
                  >
                    <option value={5}>5.0 Stars (★★★★★)</option>
                    <option value={4}>4.0 Stars (★★★★☆)</option>
                    <option value={3}>3.0 Stars (★★★☆☆)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-zinc-300 block mb-1">Review Date</label>
                  <input
                    type="text"
                    value={newRevDate}
                    onChange={(e) => setNewRevDate(e.target.value)}
                    placeholder="e.g. March 2026"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
                  />
                </div>
              </div>

              {/* Service & Artist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-zinc-300 block mb-1">Service Received</label>
                  <select
                    value={newRevService}
                    onChange={(e) => setNewRevService(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
                  >
                    <option value="Custom Tattooing">Custom Tattooing (Realism / Fine Line)</option>
                    <option value="Cover-Up & Rework">Tattoo Cover-Up &amp; Rework</option>
                    <option value="Cosmetic Tattooing">Cosmetic Tattooing (Microblading / Lip Blush)</option>
                    <option value="Body Piercing">Sterile Body Piercing</option>
                    <option value="Academy Course">Phoenix Tattoo Academy Certification</option>
                    <option value="Studio Consultation">Studio Consultation</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-zinc-300 block mb-1">Artist</label>
                  <select
                    value={newRevArtist}
                    onChange={(e) => setNewRevArtist(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
                  >
                    <option value="Rohit Sharma">Rohit Sharma (Master Artist)</option>
                    <option value="Sneha Verma">Sneha Verma (Fine-Line Specialist)</option>
                    <option value="Arjun Mehta">Arjun Mehta (Color / Traditional)</option>
                    <option value="Phoenix Studio Team">Phoenix Studio Team</option>
                  </select>
                </div>
              </div>

              {/* Title & Body */}
              <div>
                <label className="text-[11px] text-zinc-300 block mb-1">Headline / Title *</label>
                <input
                  type="text"
                  required
                  value={newRevTitle}
                  onChange={(e) => setNewRevTitle(e.target.value)}
                  placeholder="e.g. Masterpiece lion realism on my forearm!"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-300 block mb-1">Review Body *</label>
                <textarea
                  required
                  rows={3}
                  value={newRevText}
                  onChange={(e) => setNewRevText(e.target.value)}
                  placeholder="Describe the tattoo experience, shading mastery, hygiene standard, healing, etc..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#FFD60A] resize-none"
                />
              </div>

              {/* Media Attachments */}
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3">
                <span className="text-xs font-bold text-white block flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-[#FFD60A]" />
                  <span>Attach Tattoo Photos &amp; Video</span>
                </span>

                {/* Photos */}
                <div className="flex items-center gap-2">
                  <label className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-lg text-[11px] font-semibold text-zinc-200 cursor-pointer flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-[#FFD60A]" />
                    <span>Upload Photo</span>
                    <input type="file" accept="image/*" multiple onChange={handleManualImageUpload} className="hidden" />
                  </label>
                  <div className="flex-1 flex gap-1">
                    <input
                      type="url"
                      value={newRevImageUrl}
                      onChange={(e) => setNewRevImageUrl(e.target.value)}
                      placeholder="Or photo web URL..."
                      className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-[11px] text-white focus:outline-none focus:border-[#FFD60A]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newRevImageUrl.trim()) {
                          setNewRevImages((prev) => [...prev, newRevImageUrl.trim()]);
                          setNewRevImageUrl('');
                        }
                      }}
                      className="px-2.5 py-1 bg-zinc-800 text-white rounded-lg text-[11px]"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {newRevImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {newRevImages.map((img, i) => (
                      <div key={i} className="relative w-14 h-14 rounded-lg overflow-hidden border border-zinc-700 group">
                        <img src={img} alt="preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setNewRevImages(newRevImages.filter((_, idx) => idx !== i))}
                          className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Videos */}
                <div className="flex gap-1 pt-1">
                  <input
                    type="url"
                    value={newRevVideoUrl}
                    onChange={(e) => setNewRevVideoUrl(e.target.value)}
                    placeholder="Tattoo showcase video URL (MP4 / Reel / YouTube)..."
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-[11px] text-white focus:outline-none focus:border-[#FFD60A]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newRevVideoUrl.trim()) {
                        setNewRevVideos((prev) => [...prev, newRevVideoUrl.trim()]);
                        setNewRevVideoUrl('');
                      }
                    }}
                    className="px-2.5 py-1 bg-zinc-800 text-white rounded-lg text-[11px]"
                  >
                    Add Video
                  </button>
                </div>
              </div>

              {/* Status and Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newRevApproved}
                    onChange={(e) => setNewRevApproved(e.target.checked)}
                    className="w-4 h-4 accent-[#FFD60A] rounded"
                  />
                  <span className="text-white font-semibold">
                    ✓ Approve Immediately (Show on Website)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newRevVerified}
                    onChange={(e) => setNewRevVerified(e.target.checked)}
                    className="w-4 h-4 accent-[#FFD60A] rounded"
                  />
                  <span className="text-white font-semibold">
                    Verified Client Badge
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newRevFeatured}
                    onChange={(e) => setNewRevFeatured(e.target.checked)}
                    className="w-4 h-4 accent-[#FFD60A] rounded"
                  />
                  <span className="text-white font-semibold">
                    Feature on Homepage
                  </span>
                </label>
              </div>

              {/* Optional Studio Reply */}
              <div>
                <label className="text-[11px] text-zinc-300 block mb-1">
                  Optional Official Phoenix Studio Reply
                </label>
                <input
                  type="text"
                  value={newRevStudioReply}
                  onChange={(e) => setNewRevStudioReply(e.target.value)}
                  placeholder="e.g. Thank you Vikram! Honored to bring your lion piece to life."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingReview(false)}
                  className="px-4 py-2 text-xs text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#FFD60A] hover:bg-[#ffe033] text-black font-bold text-xs px-6 py-2.5 rounded-xl shadow-md cursor-pointer"
                >
                  Save &amp; Create Review
                </button>
              </div>
            </form>
          )}

          {/* ========================================================= */}
          {/* REVIEWS LIST CARDS WITH APPROVAL CONTROLS & DELETE */}
          {/* ========================================================= */}
          <div className="space-y-4">
            {displayedReviews.length === 0 ? (
              <div className="bg-[#141414] border border-zinc-800 p-8 rounded-2xl text-center space-y-2">
                <AlertCircle className="w-8 h-8 text-zinc-600 mx-auto" />
                <h4 className="text-sm font-bold text-zinc-300">No reviews found in this filter</h4>
                <p className="text-xs text-zinc-500">
                  Switch the filter above or click "+ Add New Review" to add customer feedback.
                </p>
              </div>
            ) : (
              displayedReviews.map((rev) => {
                const isLive = rev.approved !== false;

                return (
                  <div
                    key={rev.id}
                    className={`bg-[#141414] border rounded-2xl p-5 space-y-4 transition-colors ${
                      isLive 
                        ? 'border-zinc-800 hover:border-zinc-700' 
                        : 'border-amber-600/30 bg-amber-950/10'
                    }`}
                  >
                    {/* Top Row: Client info & Approval/Delete Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-serif font-bold text-white text-base">
                            {rev.name}
                          </span>
                          <span className="text-xs text-zinc-400">({rev.city})</span>
                          <div className="flex text-[#FFD60A] text-xs">
                            {[...Array(Math.max(1, Math.min(5, Math.round(Number(rev.rating) || 5))))].map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-[#FFD60A]" />
                            ))}
                          </div>
                          {rev.verified && (
                            <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                              <ShieldCheck className="w-2.5 h-2.5" />
                              <span>Verified Client</span>
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-zinc-500 block mt-0.5">
                          {rev.service || (rev as any).tattooType || 'Custom Tattooing'} &bull; Artist: <strong className="text-zinc-300">{rev.artist || 'Rohit Sharma'}</strong> &bull; {rev.date || 'Recent'}
                        </span>
                      </div>

                      {/* Administrative Controls */}
                      <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto">
                        {/* THE MAIN APPROVAL SWITCH BUTTON - Full width on mobile, auto on laptop */}
                        <button
                          onClick={() => handleToggleApproval(rev.id)}
                          className={`w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            isLive
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 hover:bg-amber-950/40 hover:text-amber-300 hover:border-amber-500/40'
                              : 'bg-amber-950/85 text-amber-300 border-amber-500/60 hover:bg-emerald-950/40 hover:text-emerald-300 hover:border-emerald-500/40 animate-pulse'
                          }`}
                          title={isLive ? 'Click to hide from website' : 'Click to approve and show on website'}
                        >
                          {isLive ? (
                            <>
                              <Eye className="w-4 h-4 text-emerald-400 shrink-0" />
                              <span>✓ Live on Website (Public)</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-4 h-4 text-amber-400 shrink-0" />
                              <span>✕ Hidden / Needs Approval (Click to Approve)</span>
                            </>
                          )}
                        </button>

                        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto justify-end sm:justify-start">
                          {/* Feature on Home Toggle */}
                          <button
                            onClick={() => handleToggleFeatured(rev.id)}
                            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-colors cursor-pointer ${
                              rev.featured
                                ? 'bg-[#FFD60A]/15 text-[#FFD60A] border-[#FFD60A]/40'
                                : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-zinc-300'
                            }`}
                            title="Toggle homepage featured status"
                          >
                            {rev.featured ? '★ Featured' : 'Not Featured'}
                          </button>

                          {/* Add Media Buttons - Opens In-UI Modal */}
                          <button
                            onClick={() => openAddMediaModal(rev.id, 'image', rev.name)}
                            className="px-2.5 py-1.5 text-[11px] font-semibold text-zinc-200 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                            title="Attach tattoo photo"
                          >
                            <ImageIcon className="w-3.5 h-3.5 text-[#FFD60A]" />
                            <span>+ Photo</span>
                          </button>

                          <button
                            onClick={() => openAddMediaModal(rev.id, 'video', rev.name)}
                            className="px-2.5 py-1.5 text-[11px] font-semibold text-zinc-200 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                            title="Attach tattoo video clip"
                          >
                            <VideoIcon className="w-3.5 h-3.5 text-red-400" />
                            <span>+ Video</span>
                          </button>

                          {/* Studio Reply Edit */}
                          <button
                            onClick={() => {
                              setReplyingReviewId(rev.id);
                              setReplyText(rev.studioReply || '');
                            }}
                            className="p-1.5 text-zinc-400 hover:text-[#FFD60A] bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-lg transition-colors cursor-pointer"
                            title="Add or edit official studio reply"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* PERMANENT DELETE BUTTON - Opens in-UI modal */}
                          <button
                            onClick={() => setDeleteConfirmTarget({ reviewId: rev.id, name: rev.name })}
                            className="p-1.5 text-rose-400 hover:text-white hover:bg-rose-900/60 bg-rose-950/40 border border-rose-800/50 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                            title="Permanently remove review"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                            <span className="text-[11px] hidden sm:inline">Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Headline and Body */}
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-bold text-white">"{rev.title}"</h4>
                      <p className="text-xs text-zinc-300 leading-relaxed">{rev.text}</p>
                    </div>

                    {/* Attached Media */}
                    {((rev.images && rev.images.length > 0) || (rev.videos && rev.videos.length > 0)) && (
                      <div className="bg-zinc-950/80 p-3 rounded-xl border border-zinc-800/80 space-y-2">
                        <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">
                          Attached Media (Tap to view full size):
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {rev.images?.map((img, i) => (
                            <div key={`img-${i}`} className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-zinc-700 group cursor-pointer bg-zinc-900">
                              <img 
                                src={img} 
                                alt="tattoo" 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                                onClick={() => setPreviewMedia({ type: 'image', url: img, title: `${rev.name}'s Tattoo Photo` })}
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveMediaFromReview(rev.id, 'image', i);
                                }}
                                className="absolute top-1 right-1 bg-black/80 hover:bg-rose-900 p-1 rounded text-rose-300 transition-colors"
                                title="Remove photo"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}

                          {rev.videos?.map((vid, i) => (
                            <div 
                              key={`vid-${i}`} 
                              className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-[#FFD60A]/40 bg-zinc-900 flex items-center justify-center group cursor-pointer"
                              onClick={() => setPreviewMedia({ type: 'video', url: vid, title: `${rev.name}'s Tattoo Video` })}
                            >
                              <Play className="w-5 h-5 text-[#FFD60A] group-hover:scale-110 transition-transform" />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveMediaFromReview(rev.id, 'video', i);
                                }}
                                className="absolute top-1 right-1 bg-black/80 hover:bg-rose-900 p-1 rounded text-rose-300 transition-colors"
                                title="Remove video"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Studio Reply display or edit box */}
                    {replyingReviewId === rev.id ? (
                      <div className="bg-zinc-900/90 border border-[#FFD60A]/40 p-3.5 rounded-xl space-y-2">
                        <label className="text-[11px] font-bold text-[#FFD60A] block flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Official Phoenix Studio Reply:</span>
                        </label>
                        <textarea
                          rows={2}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Thank the client and acknowledge their tattoo..."
                          className="w-full bg-black border border-zinc-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#FFD60A] resize-none"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setReplyingReviewId(null)}
                            className="px-3 py-1 text-xs text-zinc-400 hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveReply(rev.id)}
                            className="px-3.5 py-1 text-xs font-bold bg-[#FFD60A] text-black rounded-lg"
                          >
                            Publish Reply
                          </button>
                        </div>
                      </div>
                    ) : rev.studioReply ? (
                      <div className="bg-zinc-900/60 border border-zinc-800/80 p-3 rounded-xl flex items-start gap-2.5 text-xs">
                        <ShieldCheck className="w-4 h-4 text-[#FFD60A] shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] font-bold text-[#FFD60A] uppercase block">
                            Phoenix Studio Reply:
                          </span>
                          <p className="text-xs text-zinc-400 italic mt-0.5">"{rev.studioReply}"</p>
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Save in Live Call-To-Action Banner */}
          <div className="bg-gradient-to-r from-[#181818] via-[#1c1c1c] to-[#181818] p-5 sm:p-6 rounded-2xl border-2 border-emerald-500/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h5 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <span>Save Review Customizations in Live Website</span>
                  {hasUnsavedLiveChanges && (
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full font-bold">
                      Pending Changes
                    </span>
                  )}
                </h5>
                <p className="text-xs text-zinc-400 mt-1 max-w-xl leading-relaxed">
                  Done deleting photos, removing reviews, or editing feedback? Click "Save in Live" to lock all changes permanently into the live website database for all visitors.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-end">
              <button
                onClick={handleSaveInLive}
                disabled={isSavingLive}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 active:scale-95 text-black font-extrabold text-xs sm:text-sm px-7 py-3.5 rounded-xl shadow-lg shadow-emerald-500/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSavingLive ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-black" />
                    <span>Saving to Live Website...</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4 text-black" />
                    <span>Save in Live</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUBTAB 2: CUSTOMIZE STUDIO THOUGHTS & VIEWS */}
      {/* ========================================================= */}
      {activeSubTab === 'philosophy' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <h3 className="font-serif font-bold text-lg text-white">
                Customize Founder Thoughts &amp; Studio Creed
              </h3>
              <p className="text-xs text-zinc-400">
                These views are prominently displayed in the "Our Thoughts &amp; Views" section on the Homepage and `/reviews` page.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetPhilosophy}
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-xl transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Defaults</span>
              </button>
              <button
                onClick={handleSavePhilosophy}
                disabled={isSaving}
                className="flex items-center gap-1.5 text-xs font-bold bg-[#FFD60A] hover:bg-[#ffe033] text-black px-4 py-2 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5 text-black" />
                <span>Save Studio Creed</span>
              </button>
            </div>
          </div>

          {/* Founder Quote & Header Inputs */}
          <div className="bg-[#141414] border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Quote className="w-4 h-4 text-[#FFD60A]" />
              <span>Founder's Quote &amp; Profile</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-zinc-300 block mb-1">Founder Name</label>
                <input
                  type="text"
                  value={philosophy.founderName}
                  onChange={(e) => setPhilosophy({ ...philosophy, founderName: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
                />
              </div>
              <div>
                <label className="text-[11px] text-zinc-300 block mb-1">Founder Title</label>
                <input
                  type="text"
                  value={philosophy.founderTitle}
                  onChange={(e) => setPhilosophy({ ...philosophy, founderTitle: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-zinc-300 block mb-1">Founder Photo URL</label>
              <input
                type="url"
                value={philosophy.founderImage}
                onChange={(e) => setPhilosophy({ ...philosophy, founderImage: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
              />
            </div>

            <div>
              <label className="text-[11px] text-zinc-300 block mb-1">Founder Core Quote</label>
              <textarea
                rows={3}
                value={philosophy.founderQuote}
                onChange={(e) => setPhilosophy({ ...philosophy, founderQuote: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#FFD60A] resize-none leading-relaxed"
              />
            </div>

            <div>
              <label className="text-[11px] text-zinc-300 block mb-1">Subtitle / Slogan Narrative</label>
              <input
                type="text"
                value={philosophy.subtitle}
                onChange={(e) => setPhilosophy({ ...philosophy, subtitle: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
              />
            </div>
          </div>

          {/* 4 Pillars Inputs */}
          <div className="bg-[#141414] border border-zinc-800 rounded-2xl p-6 space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FFD60A]" />
              <span>4 Creed Pillars</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {philosophy.pillars.map((pillar, idx) => (
                <div key={pillar.id || idx} className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3">
                  <div className="text-[11px] font-mono text-[#FFD60A] font-bold">
                    Pillar 0{idx + 1}
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-0.5">Pillar Title</label>
                    <input
                      type="text"
                      value={pillar.title}
                      onChange={(e) => {
                        const copy = [...philosophy.pillars];
                        copy[idx] = { ...copy[idx], title: e.target.value };
                        setPhilosophy({ ...philosophy, pillars: copy });
                      }}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-0.5">Pillar Tagline</label>
                    <input
                      type="text"
                      value={pillar.tagline}
                      onChange={(e) => {
                        const copy = [...philosophy.pillars];
                        copy[idx] = { ...copy[idx], tagline: e.target.value };
                        setPhilosophy({ ...philosophy, pillars: copy });
                      }}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-0.5">Description / Viewpoint</label>
                    <textarea
                      rows={3}
                      value={pillar.summary}
                      onChange={(e) => {
                        const copy = [...philosophy.pillars];
                        copy[idx] = { ...copy[idx], summary: e.target.value };
                        setPhilosophy({ ...philosophy, pillars: copy });
                      }}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#FFD60A] resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              <button
                onClick={handleSavePhilosophy}
                disabled={isSaving}
                className="bg-[#FFD60A] hover:bg-[#ffe033] text-black font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                Save Creed Changes
              </button>
              <button
                onClick={handleSaveInLive}
                disabled={isSavingLive}
                className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                title="Save all changes directly to the live website"
              >
                {isSavingLive ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-black" />
                ) : (
                  <Globe className="w-3.5 h-3.5 text-black" />
                )}
                <span>Save in Live</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: ADD PHOTO OR VIDEO TO EXISTING REVIEW */}
      {/* ============================================================== */}
      {mediaModalTarget && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setMediaModalTarget(null)}
        >
          <div 
            className="bg-[#181818] border border-zinc-700 rounded-2xl p-5 sm:p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                {mediaModalTarget.type === 'image' ? (
                  <ImageIcon className="w-5 h-5 text-[#FFD60A]" />
                ) : (
                  <VideoIcon className="w-5 h-5 text-red-400" />
                )}
                <div>
                  <h4 className="font-serif font-bold text-white text-sm sm:text-base">
                    Attach {mediaModalTarget.type === 'image' ? 'Tattoo Photo' : 'Video Clip'}
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    To review by <strong className="text-zinc-200">{mediaModalTarget.reviewName}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMediaModalTarget(null)}
                className="p-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Option 1: Upload from Device */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 block">
                Option A: Upload from Phone / Laptop
              </label>
              <label className="flex items-center justify-center gap-2 w-full p-3 bg-zinc-900 hover:bg-zinc-850 border border-dashed border-zinc-700 hover:border-[#FFD60A] rounded-xl text-xs font-semibold text-zinc-300 cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-[#FFD60A]" />
                <span>
                  {modalMediaFile ? '✓ File Loaded (Tap to change)' : `Select ${mediaModalTarget.type === 'image' ? 'Image' : 'Video'} File`}
                </span>
                <input
                  type="file"
                  accept={mediaModalTarget.type === 'image' ? 'image/*' : 'video/mp4,video/webm'}
                  onChange={(e) => handleModalFileUpload(e, mediaModalTarget.type)}
                  className="hidden"
                />
              </label>
            </div>

            {/* Option 2: Paste Web URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 block">
                Option B: Or Enter Web URL
              </label>
              <input
                type="url"
                value={modalMediaUrl}
                onChange={(e) => {
                  setModalMediaUrl(e.target.value);
                  setModalMediaFile(null);
                }}
                placeholder={mediaModalTarget.type === 'image' ? 'https://images.unsplash.com/...' : 'https://example.com/tattoo-video.mp4'}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#FFD60A]"
              />
            </div>

            {/* Live Preview */}
            {(modalMediaFile || modalMediaUrl) && (
              <div className="p-3 bg-black/60 rounded-xl border border-zinc-800 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">
                  Live Preview:
                </span>
                {mediaModalTarget.type === 'image' ? (
                  <img
                    src={modalMediaFile || modalMediaUrl}
                    alt="Preview"
                    className="w-full h-36 object-cover rounded-lg border border-zinc-700"
                  />
                ) : (
                  <video
                    src={modalMediaFile || modalMediaUrl}
                    controls
                    className="w-full h-36 bg-black rounded-lg border border-zinc-700"
                  />
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setMediaModalTarget(null)}
                className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAddMedia}
                disabled={!modalMediaFile && !modalMediaUrl.trim()}
                className="bg-[#FFD60A] hover:bg-[#ffe033] disabled:opacity-40 text-black font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-md"
              >
                Add {mediaModalTarget.type === 'image' ? 'Photo' : 'Video'} to Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: DELETE CONFIRMATION MODAL */}
      {/* ============================================================== */}
      {deleteConfirmTarget && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setDeleteConfirmTarget(null)}
        >
          <div 
            className="bg-[#181818] border border-rose-900/60 rounded-2xl p-5 sm:p-6 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-full bg-rose-950/80 border border-rose-800 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-white text-base">Remove Review?</h4>
                <p className="text-xs text-zinc-400">Permanently delete from database</p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-900/80 p-3 rounded-xl border border-zinc-800">
              Are you sure you want to delete the review by <strong className="text-white">"{deleteConfirmTarget.name}"</strong>? This will remove it from both the admin moderation queue and the public website.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmTarget(null)}
                className="w-full sm:w-auto px-3.5 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => executeDeleteReview(deleteConfirmTarget.reviewId, false)}
                className="w-full sm:w-auto bg-zinc-800 hover:bg-zinc-700 text-rose-300 font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all cursor-pointer border border-zinc-700"
              >
                Delete (Draft)
              </button>
              <button
                type="button"
                onClick={() => executeDeleteReview(deleteConfirmTarget.reviewId, true)}
                className="w-full sm:w-auto bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
              >
                <Globe className="w-3.5 h-3.5 text-white" />
                <span>Delete &amp; Save in Live</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: MEDIA PREVIEW LIGHTBOX & VIDEO PLAYER */}
      {/* ============================================================== */}
      {previewMedia && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setPreviewMedia(null)}
        >
          <div 
            className="relative max-w-3xl w-full bg-[#141414] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3.5 bg-zinc-900 border-b border-zinc-800">
              <span className="font-serif font-bold text-xs sm:text-sm text-white truncate pr-4">
                {previewMedia.title}
              </span>
              <button
                onClick={() => setPreviewMedia(null)}
                className="p-1 rounded-lg bg-black text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2 sm:p-4 bg-black flex items-center justify-center min-h-[300px] max-h-[75vh]">
              {previewMedia.type === 'image' ? (
                <img
                  src={previewMedia.url}
                  alt={previewMedia.title}
                  className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg"
                />
              ) : (
                <video
                  src={previewMedia.url}
                  controls
                  autoPlay
                  className="max-h-[70vh] w-full rounded-lg"
                />
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
