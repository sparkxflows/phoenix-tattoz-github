import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  CheckCircle2, 
  RotateCcw, 
  Eye, 
  Sparkles, 
  Gift, 
  Save, 
  Check, 
  Info,
  ExternalLink,
  Users,
  Heart,
  Tag
} from 'lucide-react';
import { 
  getStoredGiftsRewards, 
  saveGiftsRewards, 
  resetGiftsRewards, 
  GiftsRewardsSettings, 
  DEFAULT_GIFTS_REWARDS_SETTINGS 
} from '../lib/studioContent';
import { supabase } from '../lib/supabase';

// Curated presets for each tier
const TIER1_PRESETS = [
  {
    id: 'classical-david-sleeve',
    name: 'Classical Sculpt with Sleeve (Default)',
    url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=900&q=80',
    desc: 'Renaissance sculpted artwork with artistic tattoo sleeve and dark background'
  },
  {
    id: 'marble-bust-dark',
    name: 'Gothic Marble Bust',
    url: 'https://images.unsplash.com/photo-1582561424760-0321d75e81fa?auto=format&fit=crop&w=900&q=80',
    desc: 'Moody dark stone statue with dramatic studio side lighting'
  },
  {
    id: 'classical-renaissance-gold',
    name: 'Golden Light Sculpture',
    url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=900&q=80',
    desc: 'Classic museum marble with warm amber backlighting'
  },
  {
    id: 'neo-traditional-ink',
    name: 'Fine Art Realism Sleeve',
    url: 'https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?auto=format&fit=crop&w=900&q=80',
    desc: 'Full arm master realism ink with deep black and grey contrast'
  }
];

const TIER2_PRESETS = [
  {
    id: 'tattooed-guy-sunglasses',
    name: 'Inked Model in Sunglasses (Default)',
    url: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=900&q=80',
    desc: 'Tattooed client with black shades and sleeve art'
  },
  {
    id: 'edgy-portrait-ink',
    name: 'Bold Streetwear Tattoo Portrait',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80',
    desc: 'Editorial portrait of stylish client with custom arm ink'
  },
  {
    id: 'smiling-client-ink',
    name: 'Happy Inked Client',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80',
    desc: 'Confident client showcasing freshly healed tattoo art'
  },
  {
    id: 'hand-holding-art',
    name: 'Tattooed Hand Detail',
    url: 'https://images.unsplash.com/photo-1562962230-16e4623d36e6?auto=format&fit=crop&w=900&q=80',
    desc: 'Detailed tattooed hand holding voucher with studio ambiance'
  }
];

const TIER3_PRESETS = [
  {
    id: 'warm-studio-lounge',
    name: 'Warm Studio Lounge (Default)',
    url: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=900&q=80',
    desc: 'Moody studio atmosphere with glowing neon highlights'
  },
  {
    id: 'studio-reception-interior',
    name: 'Phoenix Studio Reception & Bed',
    url: 'https://images.unsplash.com/photo-1512690459411-b9245aed614b?auto=format&fit=crop&w=900&q=80',
    desc: 'Clean modern studio interior with leather tattoo furniture'
  },
  {
    id: 'artist-client-vibe',
    name: 'Artist & Client Consultation',
    url: '/uploads/repairs/compass-rose.jpg',
    desc: 'Collaborative consultation discussing custom tattoo placement'
  },
  {
    id: 'friends-getting-inked',
    name: 'Friends Inking Together',
    url: 'https://images.unsplash.com/photo-1611590027211-b954fd027b51?auto=format&fit=crop&w=900&q=80',
    desc: 'Shared tattoo experience celebrating connection and brotherhood'
  }
];

interface AdminRewardsManagerProps {
  onSavedCallback?: () => void;
  isModalMode?: boolean;
}

export const AdminRewardsManager: React.FC<AdminRewardsManagerProps> = ({
  onSavedCallback,
  isModalMode = false
}) => {
  const [settings, setSettings] = useState<GiftsRewardsSettings>(getStoredGiftsRewards);
  const [activeTier, setActiveTier] = useState<'tier1' | 'tier2' | 'tier3' | 'coupon'>('tier1');
  
  // Custom URL inputs
  const [tier1UrlInput, setTier1UrlInput] = useState(settings.tier1Image);
  const [tier2UrlInput, setTier2UrlInput] = useState(settings.tier2Image);
  const [tier3UrlInput, setTier3UrlInput] = useState(settings.tier3Image);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync directly from Supabase Cloud on mount
  useEffect(() => {
    let isMounted = true;
    const fetchRemote = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'custom_gifts_rewards')
          .single();

        if (!error && data && data.value && isMounted) {
          const merged = { ...DEFAULT_GIFTS_REWARDS_SETTINGS, ...data.value };
          setSettings(merged);
          setTier1UrlInput(merged.tier1Image || '');
          setTier2UrlInput(merged.tier2Image || '');
          setTier3UrlInput(merged.tier3Image || '');
          try {
            localStorage.setItem('phoenix_gifts_rewards_v1', JSON.stringify(merged));
          } catch {}
        }
      } catch (e) {}
    };
    fetchRemote();
    return () => {
      isMounted = false;
    };
  }, []);

  // File upload handler with client-side compression
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, targetTier: 'tier1' | 'tier2' | 'tier3') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WebP, SVG).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Image file size should be less than 10MB.');
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;

      const img = new Image();
      img.onload = () => {
        const maxDimension = 1400;
        let { width, height } = img;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.88);
          
          if (targetTier === 'tier1') {
            setSettings(prev => ({ ...prev, tier1Image: compressed }));
            setTier1UrlInput(compressed);
          } else if (targetTier === 'tier2') {
            setSettings(prev => ({ ...prev, tier2Image: compressed }));
            setTier2UrlInput(compressed);
          } else if (targetTier === 'tier3') {
            setSettings(prev => ({ ...prev, tier3Image: compressed }));
            setTier3UrlInput(compressed);
          }
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Save changes
  const handleSave = async () => {
    setIsSaving(true);
    const res = await saveGiftsRewards(settings);
    setIsSaving(false);

    if (res.success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      if (onSavedCallback) {
        onSavedCallback();
      }
    } else {
      alert(res.error || 'Failed to save gifts & rewards images.');
    }
  };

  // Reset to default
  const handleReset = async () => {
    if (!window.confirm('Reset all Gifts & Rewards images back to the default reference designs?')) {
      return;
    }
    await resetGiftsRewards();
    setSettings(DEFAULT_GIFTS_REWARDS_SETTINGS);
    setTier1UrlInput(DEFAULT_GIFTS_REWARDS_SETTINGS.tier1Image);
    setTier2UrlInput(DEFAULT_GIFTS_REWARDS_SETTINGS.tier2Image);
    setTier3UrlInput(DEFAULT_GIFTS_REWARDS_SETTINGS.tier3Image);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    if (onSavedCallback) {
      onSavedCallback();
    }
  };

  return (
    <div className={`space-y-6 ${isModalMode ? '' : 'bg-[#141414] border border-zinc-800 p-4 sm:p-6 rounded-2xl shadow-xl'}`}>
      
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFD60A] animate-pulse" />
            <h2 className="font-serif font-bold text-lg sm:text-xl text-white flex items-center gap-2">
              <Gift className="w-5 h-5 text-[#FFD60A]" />
              <span>Gifts & Rewards Images Manager</span>
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            Customize the images for each of the 3 tiers in the Gifts & Rewards section: Tier 1 (Classical Artwork), Tier 2 (Birthday Gift Card), and Tier 3 (Refer & Earn Lounge).
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white transition-all cursor-pointer"
            title="Reset to default template images"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-extrabold bg-[#FFD60A] hover:bg-yellow-400 text-black shadow-lg shadow-yellow-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <span className="animate-spin">⏳</span>
            ) : saveSuccess ? (
              <Check className="w-4 h-4 stroke-[3]" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saveSuccess ? 'Changes Saved!' : 'Save Reward Images'}</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 px-4 py-3 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Reward images and coupon settings saved successfully! Live website updated.</span>
        </div>
      )}

      {/* Tier Selector Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
        <button
          onClick={() => setActiveTier('tier1')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTier === 'tier1'
              ? 'bg-[#FFD60A] text-black shadow-md'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Tier 1: Thank You Artwork</span>
        </button>

        <button
          onClick={() => setActiveTier('tier2')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTier === 'tier2'
              ? 'bg-[#FFD60A] text-black shadow-md'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <Gift className="w-3.5 h-3.5" />
          <span>Tier 2: Birthday Gift Card</span>
        </button>

        <button
          onClick={() => setActiveTier('tier3')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTier === 'tier3'
              ? 'bg-[#FFD60A] text-black shadow-md'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Tier 3: Refer & Earn Lounge</span>
        </button>

        <button
          onClick={() => setActiveTier('coupon')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTier === 'coupon'
              ? 'bg-[#FFD60A] text-black shadow-md'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>Coupon & Discount</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TIER 1: THANK YOU SHOWCASE */}
      {/* ============================================================== */}
      {activeTier === 'tier1' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Controls Column */}
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-zinc-900/80 border border-zinc-800 p-4 sm:p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-white text-base">Tier 1: Thank You Showcase Image</h3>
                  <p className="text-[11px] text-zinc-400">Classical sculpture or statue artwork with tattoo sleeve details</p>
                </div>
                <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/30">
                  Dark Gold Tier
                </span>
              </div>

              {/* Upload Local File */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300 block">Option A: Upload Image File (PNG, JPG, WebP)</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-zinc-700 hover:border-[#FFD60A] rounded-xl p-4 text-center cursor-pointer transition-colors bg-black/40 group"
                >
                  <Upload className="w-6 h-6 text-zinc-400 group-hover:text-[#FFD60A] mx-auto mb-1 transition-colors" />
                  <span className="text-xs font-semibold text-white block">Click to browse or drag & drop</span>
                  <span className="text-[10px] text-zinc-500">Optimized automatically for high performance</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'tier1')}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Direct URL Input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300 block">Option B: Or Paste Image Web URL</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={tier1UrlInput}
                      onChange={(e) => setTier1UrlInput(e.target.value)}
                      className="w-full bg-black/60 border border-zinc-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
                    />
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, tier1Image: tier1UrlInput }))}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-[#FFD60A] font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Apply URL
                  </button>
                </div>
              </div>

              {/* Alt Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 block">Image Alt Description</label>
                <input
                  type="text"
                  value={settings.tier1ImageAlt}
                  onChange={(e) => setSettings(prev => ({ ...prev, tier1ImageAlt: e.target.value }))}
                  placeholder="Classical sculpted artwork with custom tattoo sleeve"
                  className="w-full bg-black/60 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
                />
              </div>
            </div>

            {/* Curated Presets */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#FFD60A]" />
                  <span>Curated High-Res Presets</span>
                </span>
                <span className="text-[10px] text-zinc-400">Click any preset to apply instantly</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {TIER1_PRESETS.map((preset) => {
                  const isSelected = settings.tier1Image === preset.url;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => {
                        setSettings(prev => ({ ...prev, tier1Image: preset.url }));
                        setTier1UrlInput(preset.url);
                      }}
                      className={`p-2.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#FFD60A] bg-amber-400/10'
                          : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-12 h-12 rounded-lg object-cover shrink-0 border border-zinc-700"
                      />
                      <div className="min-w-0">
                        <span className={`text-xs font-bold block truncate ${isSelected ? 'text-[#FFD60A]' : 'text-white'}`}>
                          {preset.name}
                        </span>
                        <span className="text-[10px] text-zinc-400 line-clamp-2 mt-0.5">
                          {preset.desc}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Live Preview Column */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#FFD60A]" />
                <span>Live Card Preview</span>
              </span>
              <span className="text-[11px] font-mono text-[#FFD60A]">3:4 Aspect Ratio</span>
            </div>

            {/* Preview Frame */}
            <div className="relative w-full max-w-sm mx-auto rounded-3xl overflow-hidden shadow-2xl border border-amber-500/40 bg-[#090A0D] p-3">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-black">
                <img
                  src={settings.tier1Image}
                  alt={settings.tier1ImageAlt}
                  className="w-full h-full object-cover filter contrast-[1.1] brightness-[0.9]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#090A0D] via-transparent to-black/30 pointer-events-none" />
                
                {/* Simulated Medallion Badge */}
                <div className="absolute top-[38%] left-[28%] -translate-x-1/2 -translate-y-1/2">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 via-[#FFD60A] to-amber-200 p-0.5 shadow-[0_0_20px_6px_rgba(255,214,10,0.6)] flex items-center justify-center">
                    <div className="w-full h-full rounded-full bg-[#111317]/90 p-1 flex flex-col items-center justify-center text-center">
                      <span className="text-[5px] font-bold text-amber-300 uppercase">★ PHOENIX ★</span>
                      <span className="text-xs">🦅</span>
                      <span className="text-[6px] font-extrabold text-[#FFD60A]">STUDIO</span>
                    </div>
                  </div>
                </div>

                {/* Ribbon */}
                <div className="absolute bottom-3 left-3 right-3 bg-black/80 backdrop-blur-md border border-amber-500/40 p-2 rounded-xl flex items-center justify-between">
                  <span className="text-[10px] font-serif font-bold text-white">Client Loyalty Crest</span>
                  <span className="text-[9px] font-mono font-bold text-[#FFD60A] bg-amber-500/20 px-1.5 py-0.5 rounded">★ 5.0 Rated</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TIER 2: BIRTHDAY GIFT CARD */}
      {/* ============================================================== */}
      {activeTier === 'tier2' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Controls Column */}
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-zinc-900/80 border border-zinc-800 p-4 sm:p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-white text-base">Tier 2: Birthday Gift Card Photo</h3>
                  <p className="text-[11px] text-zinc-400">Tattooed client holding the Phoenix 15% discount card</p>
                </div>
                <span className="text-[10px] uppercase font-bold text-black bg-[#FFD60A] px-2.5 py-1 rounded-full font-sans">
                  Yellow Accent Tier
                </span>
              </div>

              {/* Upload Local File */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300 block">Option A: Upload Image File</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-zinc-700 hover:border-[#FFD60A] rounded-xl p-4 text-center cursor-pointer transition-colors bg-black/40 group"
                >
                  <Upload className="w-6 h-6 text-zinc-400 group-hover:text-[#FFD60A] mx-auto mb-1 transition-colors" />
                  <span className="text-xs font-semibold text-white block">Click to browse or drag & drop</span>
                  <span className="text-[10px] text-zinc-500">Supports PNG, JPG, WebP</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'tier2')}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Direct URL Input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300 block">Option B: Or Paste Image Web URL</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={tier2UrlInput}
                      onChange={(e) => setTier2UrlInput(e.target.value)}
                      className="w-full bg-black/60 border border-zinc-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
                    />
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, tier2Image: tier2UrlInput }))}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-[#FFD60A] font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Apply URL
                  </button>
                </div>
              </div>

              {/* Alt Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 block">Image Alt Description</label>
                <input
                  type="text"
                  value={settings.tier2ImageAlt}
                  onChange={(e) => setSettings(prev => ({ ...prev, tier2ImageAlt: e.target.value }))}
                  placeholder="Tattooed client holding Phoenix Birthday Gift Card"
                  className="w-full bg-black/60 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
                />
              </div>
            </div>

            {/* Presets */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#FFD60A]" />
                  <span>Curated Birthday Tier Presets</span>
                </span>
                <span className="text-[10px] text-zinc-400">Click any preset to apply</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {TIER2_PRESETS.map((preset) => {
                  const isSelected = settings.tier2Image === preset.url;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => {
                        setSettings(prev => ({ ...prev, tier2Image: preset.url }));
                        setTier2UrlInput(preset.url);
                      }}
                      className={`p-2.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#FFD60A] bg-amber-400/10'
                          : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-12 h-12 rounded-lg object-cover shrink-0 border border-zinc-700"
                      />
                      <div className="min-w-0">
                        <span className={`text-xs font-bold block truncate ${isSelected ? 'text-[#FFD60A]' : 'text-white'}`}>
                          {preset.name}
                        </span>
                        <span className="text-[10px] text-zinc-400 line-clamp-2 mt-0.5">
                          {preset.desc}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Live Preview Column */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#FFD60A]" />
                <span>Live Card Preview</span>
              </span>
              <span className="text-[11px] font-mono text-[#FFD60A]">Offset Yellow Frame</span>
            </div>

            {/* Preview Frame */}
            <div className="relative w-full max-w-sm mx-auto p-4 bg-[#FFD60A] rounded-3xl">
              <div className="relative rounded-2xl overflow-hidden border-2 border-black bg-black aspect-[4/3] shadow-xl">
                <img
                  src={settings.tier2Image}
                  alt={settings.tier2ImageAlt}
                  className="w-full h-full object-cover filter contrast-[1.15]"
                />
                
                {/* Overlaid Gold Card */}
                <div className="absolute top-[42%] left-[48%] -translate-x-1/2 -translate-y-1/2 w-40 bg-gradient-to-br from-[#1A1C20] via-black to-[#131518] border border-[#FFD60A] rounded-lg p-2 shadow-xl transform -rotate-6">
                  <div className="flex items-center justify-between border-b border-amber-500/40 pb-1 mb-1">
                    <span className="text-[7px] font-bold uppercase text-amber-200">Phoenix Tattooz</span>
                    <span className="text-[7px] font-extrabold text-black bg-[#FFD60A] px-1 rounded">15% OFF</span>
                  </div>
                  <div className="text-[9px] font-serif font-black text-[#FFD60A] text-center">BIRTHDAY GIFT CARD</div>
                  <div className="text-[7px] text-zinc-400 font-mono text-center tracking-wider">CODE: {settings.couponCode}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TIER 3: REFER & EARN LOUNGE */}
      {/* ============================================================== */}
      {activeTier === 'tier3' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Controls Column */}
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-zinc-900/80 border border-zinc-800 p-4 sm:p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-white text-base">Tier 3: Refer & Earn Studio Lounge</h3>
                  <p className="text-[11px] text-zinc-400">Warm studio lounge or community photo with clients and artists</p>
                </div>
                <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/30">
                  Studio Warmth Tier
                </span>
              </div>

              {/* Upload Local File */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300 block">Option A: Upload Image File</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-zinc-700 hover:border-[#FFD60A] rounded-xl p-4 text-center cursor-pointer transition-colors bg-black/40 group"
                >
                  <Upload className="w-6 h-6 text-zinc-400 group-hover:text-[#FFD60A] mx-auto mb-1 transition-colors" />
                  <span className="text-xs font-semibold text-white block">Click to browse or drag & drop</span>
                  <span className="text-[10px] text-zinc-500">Supports PNG, JPG, WebP</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'tier3')}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Direct URL Input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300 block">Option B: Or Paste Image Web URL</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={tier3UrlInput}
                      onChange={(e) => setTier3UrlInput(e.target.value)}
                      className="w-full bg-black/60 border border-zinc-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
                    />
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, tier3Image: tier3UrlInput }))}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-[#FFD60A] font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Apply URL
                  </button>
                </div>
              </div>

              {/* Alt Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 block">Image Alt Description</label>
                <input
                  type="text"
                  value={settings.tier3ImageAlt}
                  onChange={(e) => setSettings(prev => ({ ...prev, tier3ImageAlt: e.target.value }))}
                  placeholder="Happy clients in Phoenix Tattooz studio lounge"
                  className="w-full bg-black/60 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
                />
              </div>
            </div>

            {/* Presets */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#FFD60A]" />
                  <span>Curated Lounge & Community Presets</span>
                </span>
                <span className="text-[10px] text-zinc-400">Click any preset to apply</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {TIER3_PRESETS.map((preset) => {
                  const isSelected = settings.tier3Image === preset.url;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => {
                        setSettings(prev => ({ ...prev, tier3Image: preset.url }));
                        setTier3UrlInput(preset.url);
                      }}
                      className={`p-2.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#FFD60A] bg-amber-400/10'
                          : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-12 h-12 rounded-lg object-cover shrink-0 border border-zinc-700"
                      />
                      <div className="min-w-0">
                        <span className={`text-xs font-bold block truncate ${isSelected ? 'text-[#FFD60A]' : 'text-white'}`}>
                          {preset.name}
                        </span>
                        <span className="text-[10px] text-zinc-400 line-clamp-2 mt-0.5">
                          {preset.desc}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Live Preview Column */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#FFD60A]" />
                <span>Live Card Preview</span>
              </span>
              <span className="text-[11px] font-mono text-[#FFD60A]">Studio Lounge Frame</span>
            </div>

            {/* Preview Frame */}
            <div className="relative w-full max-w-sm mx-auto rounded-3xl overflow-hidden shadow-2xl border border-amber-500/30 bg-[#0A0C0F] p-3">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black">
                <img
                  src={settings.tier3Image}
                  alt={settings.tier3ImageAlt}
                  className="w-full h-full object-cover filter contrast-[1.1] brightness-[0.92]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
                
                {/* Neon Crest */}
                <div className="absolute top-3 right-3 bg-black/85 backdrop-blur-md border border-amber-500/50 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#FFD60A] animate-ping" />
                  <span className="text-[9px] font-extrabold uppercase text-[#FFD60A]">Phoenix Lounge • Hisar</span>
                </div>

                {/* Badge */}
                <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md border border-zinc-700 px-2 py-1 rounded-md text-right">
                  <span className="text-[9px] font-bold text-white block">15% Bonus For Both</span>
                  <span className="text-[8px] text-zinc-400 font-mono">Code: {settings.couponCode}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* COUPON & DISCOUNT SETTINGS */}
      {/* ============================================================== */}
      {activeTier === 'coupon' && (
        <div className="max-w-2xl bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl space-y-4">
          <div>
            <h3 className="font-serif font-bold text-white text-base">Coupon Code & Reward Discount</h3>
            <p className="text-xs text-zinc-400">Configure the promotional voucher code and discount value featured across the rewards cards.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 block">Promotional Coupon Code</label>
              <input
                type="text"
                value={settings.couponCode}
                onChange={(e) => setSettings(prev => ({ ...prev, couponCode: e.target.value.toUpperCase() }))}
                placeholder="PHOENIX15"
                className="w-full bg-black/60 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#FFD60A] uppercase tracking-wider focus:outline-none focus:border-[#FFD60A]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 block">Discount Percentage (%)</label>
              <input
                type="number"
                min="5"
                max="50"
                value={settings.discountPercentage}
                onChange={(e) => setSettings(prev => ({ ...prev, discountPercentage: Number(e.target.value) }))}
                className="w-full bg-black/60 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-[#FFD60A]"
              />
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-200">
            <Info className="w-4 h-4 text-[#FFD60A] shrink-0 mt-0.5" />
            <span>Updating this coupon code automatically synchronizes the digital voucher cards, copy-to-clipboard badges, and WhatsApp booking templates across the site.</span>
          </div>
        </div>
      )}

    </div>
  );
};
