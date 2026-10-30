import React, { useState, useRef, useEffect } from 'react';
import { uploadFileDirect } from '../lib/directUpload';
import { 
  Upload, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  CheckCircle2, 
  RotateCcw, 
  Eye, 
  Sparkles, 
  Type, 
  Save, 
  Check, 
  Info,
  ExternalLink,
  Video,
  Film,
  SlidersHorizontal,
  VolumeX,
  Volume2,
  Play,
  Loader2
} from 'lucide-react';
import { 
  getStoredHomeHero, 
  saveHomeHero, 
  resetHomeHero, 
  HomeHeroSettings, 
  DEFAULT_HOME_HERO_SETTINGS,
  uploadImageToServer
} from '../lib/studioContent';
import { supabase } from '../lib/supabase';

// Curated high-resolution studio tattoo presets
const HERO_PRESETS = [
  {
    id: 'lion-realism',
    name: 'Lion Realism (Original)',
    url: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=1200&q=80',
    desc: 'Intricate black & grey lion realism with gold glow and black gloves',
  },
  {
    id: 'artist-inking-action',
    name: 'Master Artist In Action',
    url: 'https://images.unsplash.com/photo-1562962230-16e4623d36e6?auto=format&fit=crop&w=1200&q=80',
    desc: 'Close-up of sterile needle gun applying precision shade art',
  },
  {
    id: 'full-sleeve-art',
    name: 'Detailed Sleeve Work',
    url: 'https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?auto=format&fit=crop&w=1200&q=80',
    desc: 'Dynamic dragon and geometric detailed sleeve ink',
  },
  {
    id: 'geometric-mandala',
    name: 'Sacred Mandala Concept',
    url: '/uploads/repairs/compass-rose.jpg',
    desc: 'Sharp geometric symmetry and dot-work precision',
  },
  {
    id: 'studio-reception-vibes',
    name: 'Modern Studio Lounge',
    url: 'https://images.unsplash.com/photo-1512690459411-b9245aed614b?auto=format&fit=crop&w=1200&q=80',
    desc: 'Hospital-grade clean studio interior and tattoo beds',
  },
  {
    id: 'dark-portrait-realism',
    name: 'Dark Portrait Realism',
    url: 'https://images.unsplash.com/photo-1611590027211-b954fd027b51?auto=format&fit=crop&w=1200&q=80',
    desc: 'Spiritual Hindu deity Shiva realism portrait in deep contrast',
  },
];

// Curated high-performance tattoo studio video loop presets
export const HERO_VIDEO_PRESETS = [
  {
    id: 'machine-inking-macro',
    name: 'Sterile Needle Inking (Recommended)',
    url: '/uploads/studio_bg_video.mp4#t=5.5',
    desc: 'Macro close-up of sterile tattoo gun applying precision ink',
    tag: 'Tattoo Gun Macro',
  },
  {
    id: 'artist-shading-client',
    name: 'Precision Shade Art',
    url: '/uploads/studio_bg_video.mp4#t=4.6',
    desc: 'Master artist carefully shading portrait details with black gloves',
    tag: 'Studio Inking',
  },
  {
    id: 'fine-line-detail',
    name: 'Fine Line Forearm Detail',
    url: '/uploads/studio_bg_video.mp4#t=1.0',
    desc: 'Crisp fine line needle work on arm in moody studio lighting',
    tag: 'Fine Line',
  },
  {
    id: 'machine-rotation-moody',
    name: 'Moody Studio Motion',
    url: '/uploads/studio_bg_video.mp4#t=1.9',
    desc: 'Slow motion focus on tattoo machine vibration and ink dip',
    tag: 'Atmosphere',
  },
];

export const AdminHeroManager: React.FC = () => {
  const [settings, setSettings] = useState<HomeHeroSettings>(getStoredHomeHero);
  const [urlInput, setUrlInput] = useState(settings.heroImage);
  const [videoUrlInput, setVideoUrlInput] = useState(settings.bgVideoUrl || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [fileName, setFileName] = useState('');
  const [videoFileName, setVideoFileName] = useState('');
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [activeMediaTab, setActiveMediaTab] = useState<'video' | 'image'>(
    settings.bgMediaType === 'image' ? 'image' : 'video'
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);

  // Sync directly from Supabase Cloud on mount
  useEffect(() => {
    let isMounted = true;
    const fetchRemote = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'custom_home_hero')
          .single();

        if (!error && data && data.value && isMounted) {
          const merged = { ...DEFAULT_HOME_HERO_SETTINGS, ...data.value };
          setSettings(merged);
          setUrlInput(merged.heroImage || '');
          setVideoUrlInput(merged.bgVideoUrl || '');
          try {
            localStorage.setItem('phoenix_studio_hero_v1', JSON.stringify(merged));
          } catch {}
        }
      } catch (e) {}
    };
    fetchRemote();
    return () => {
      isMounted = false;
    };
  }, []);

  // Guarantee seamless video loop playback in Section 1 preview
  useEffect(() => {
    const video = previewVideoRef.current;
    if (!video || !settings.bgVideoUrl || activeMediaTab !== 'video') return;
    video.defaultMuted = true;
    video.muted = true;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {});
    }

    const handleEnded = () => {
      video.currentTime = 0;
      video.play().catch(() => {});
    };
    video.addEventListener('ended', handleEnded);
    return () => {
      video.removeEventListener('ended', handleEnded);
    };
  }, [settings.bgVideoUrl, activeMediaTab]);

  // File upload for images directly to persistent server disk storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WebP, SVG).');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      alert('Image file size should be less than 25MB.');
      return;
    }

    setFileName(file.name);
    try {
      const serverUrl = await uploadImageToServer(file, 'hero');
      setSettings((prev) => ({ ...prev, heroImage: serverUrl }));
      setUrlInput('');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Failed to upload hero image:', err);
      alert('Failed to upload image to server disk storage.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Video File Upload handler: streams directly to Express /api/upload-video
  const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/') && !file.name.match(/\.(mp4|webm|mov|ogg)$/i)) {
      alert('Please upload a valid MP4 or WebM video file.');
      return;
    }

    if (file.size > 80 * 1024 * 1024) {
      alert('Video file size exceeds 80MB. For faster loading, please use an MP4 under 50MB.');
      return;
    }

    setVideoFileName(file.name);
    setUploadError(null);

    // 1. Instant 0ms local preview in the Section 1 preview box
    const localBlobUrl = URL.createObjectURL(file);
    setSettings((prev) => ({
      ...prev,
      bgMediaType: 'video',
      bgVideoUrl: localBlobUrl,
    }));
    setActiveMediaTab('video');
    setVideoUrlInput('');

    // 2. Upload the video: direct to Supabase Storage (large files), then the
    //    classic /api/upload-video endpoint as a fallback.
    setIsUploadingVideo(true);
    try {
      const directUrl = await uploadFileDirect(file, { folder: 'videos' });
      if (directUrl) {
        setSettings((prev) => ({
          ...prev,
          bgMediaType: 'video',
          bgVideoUrl: directUrl,
        }));
        setVideoUrlInput(directUrl);
        setIsUploadingVideo(false);
        return;
      }

      const res = await fetch(`/api/upload-video?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        headers: {
          'Content-Type': file.type || 'video/mp4',
        },
        body: file,
      });

      if (!res.ok) {
        throw new Error(`Upload returned status ${res.status}`);
      }

      const data = await res.json();
      if (data.success && data.url) {
        setSettings((prev) => ({
          ...prev,
          bgMediaType: 'video',
          bgVideoUrl: data.url,
        }));
        setVideoUrlInput(data.url);
      } else {
        throw new Error(data.error || 'Server did not return a valid video URL');
      }
    } catch (err: any) {
      console.error('Video upload error:', err);
      setUploadError('Server upload failed, using local playback. You can also paste an online video link.');
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    setSettings((prev) => ({ ...prev, heroImage: urlInput.trim() }));
    setFileName('');
  };

  const handleApplyVideoUrl = () => {
    if (!videoUrlInput.trim()) return;
    setSettings((prev) => ({
      ...prev,
      bgMediaType: 'video',
      bgVideoUrl: videoUrlInput.trim(),
    }));
    setVideoFileName('');
    setUploadError(null);
  };

  const handleSelectPreset = (url: string) => {
    setSettings((prev) => ({ ...prev, heroImage: url }));
    setUrlInput(url);
    setFileName('');
  };

  const handleSelectVideoPreset = (url: string) => {
    setSettings((prev) => ({
      ...prev,
      bgMediaType: 'video',
      bgVideoUrl: url,
    }));
    setVideoUrlInput(url);
    setVideoFileName('');
    setUploadError(null);
  };

  const handleSave = async () => {
    if (isUploadingVideo) {
      alert('Please wait for the video upload to complete before saving.');
      return;
    }

    setIsSaving(true);
    const payload: HomeHeroSettings = {
      ...settings,
      bgMediaType: activeMediaTab,
    };
    const res = await saveHomeHero(payload);
    setIsSaving(false);
    if (res.success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } else {
      alert(res.error || 'Failed to save hero changes.');
    }
  };

  const handleReset = async () => {
    if (window.confirm('Reset Home Page Hero Section (video background, first image, and slogans) to studio default values?')) {
      await resetHomeHero();
      setSettings(DEFAULT_HOME_HERO_SETTINGS);
      setUrlInput(DEFAULT_HOME_HERO_SETTINGS.heroImage);
      setVideoUrlInput(DEFAULT_HOME_HERO_SETTINGS.bgVideoUrl || '');
      setActiveMediaTab(DEFAULT_HOME_HERO_SETTINGS.bgMediaType || 'video');
      setFileName('');
      setVideoFileName('');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const overlayOpacityPercent = Math.round(((settings.bgOverlayOpacity ?? 0.65) * 100));

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-[#181818] border border-zinc-800 rounded-2xl p-6 sm:p-7 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFD60A]" />
            <span className="text-xs font-bold text-[#FFD60A] uppercase tracking-wider">
              Home Section 1 Customizer
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight flex items-center gap-2.5">
            <span>Hero Background Video &amp; Showcase Art</span>
            <span className="text-xs font-sans font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-400/30 text-[#FFD60A]">
              Full Section Cover
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Manage the looping background video that fully covers Section 1 on the homepage. Set video URLs, upload video files, choose curated tattoo presets, and adjust background darkness so all text remains crisp and readable.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 text-xs font-bold bg-[#FFD60A] hover:bg-[#ffe033] active:scale-[0.98] text-black px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Saving Live...</span>
              </>
            ) : saveSuccess ? (
              <>
                <Check className="w-4 h-4 text-black" />
                <span>Saved Live!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-black" />
                <span>Save in Live</span>
              </>
            )}
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 px-4 py-3 rounded-xl text-xs flex items-center gap-2.5 animate-in fade-in duration-200 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Success!</strong> Section 1 background media and hero settings have been updated. The changes are live across the public website.
          </span>
        </div>
      )}

      {/* Main Grid: Live Preview & Form Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT: Live Interactive Preview */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-[#141414] border border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-md lg:sticky lg:top-24">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#FFD60A]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Live Section 1 Background Preview
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800/60 px-2 py-0.5 rounded font-mono font-bold">
                  {activeMediaTab === 'video' ? '🎬 Looping Video Active' : '🖼️ Static Image'}
                </span>
              </div>
            </div>

            {/* Mocked Home Hero Section with Real Video Background */}
            <div className="relative rounded-2xl overflow-hidden border border-zinc-750 bg-black min-h-[380px] p-5 flex flex-col justify-between shadow-2xl">
              
              {/* Layer 0: Video or Image Background in Preview */}
              {activeMediaTab === 'video' && settings.bgVideoUrl ? (
                <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0">
                  <video
                    ref={previewVideoRef}
                    key={settings.bgVideoUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover scale-[1.02]"
                    poster={settings.bgVideoPoster || settings.heroImage}
                    src={settings.bgVideoUrl}
                  >
                    <source src={settings.bgVideoUrl} type="video/mp4" />
                    <source src={settings.bgVideoUrl} type="video/webm" />
                  </video>

                  {/* Configurable Overlay Darkness from Opacity Slider */}
                  <div 
                    className="absolute inset-0 bg-black transition-opacity duration-200 pointer-events-none"
                    style={{ opacity: settings.bgOverlayOpacity ?? 0.65 }}
                  />
                </div>
              ) : (
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-40 pointer-events-none"
                  style={{ backgroundImage: `url(${settings.heroImage})` }}
                />
              )}

              {/* Ambient Golden Glows layered over the preview */}
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-amber-500/25 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute inset-0 bg-radial-[circle_at_center,transparent_40%,rgba(5,7,9,0.75)_100%] pointer-events-none" />

              {/* Foreground Hero Elements in Preview */}
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-widest text-[#FFD60A] uppercase bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-amber-400/30">
                    <Sparkles className="w-3 h-3 text-[#FFD60A]" />
                    <span>Phoenix Tattooz Hisar</span>
                  </span>

                  <span className="text-[10px] text-zinc-300 font-mono bg-black/70 px-2 py-0.5 rounded border border-zinc-700">
                    Overlay: {overlayOpacityPercent}%
                  </span>
                </div>

                {/* Headings */}
                <div>
                  <h1 className="font-serif text-2xl font-black text-white leading-tight drop-shadow-md">
                    {settings.mainHeadingLine1} <span className="text-[#FFD60A]">{settings.mainHeadingLine2}</span>
                  </h1>
                  <p className="text-xs font-semibold text-zinc-300 mt-0.5">
                    {settings.studioSubheading}
                  </p>
                  <p className="text-[11px] text-zinc-300/90 mt-1 line-clamp-2 max-w-sm">
                    {settings.heroDescription}
                  </p>
                </div>
              </div>

              {/* Foreground Image Card with "Same Skin Different Story" */}
              <div className="relative z-10 pt-3 flex items-end justify-between gap-3">
                <div className="relative w-32 sm:w-40 aspect-[4/3] rounded-xl overflow-hidden border border-zinc-700 shadow-2xl bg-black shrink-0">
                  <img
                    src={settings.heroImage}
                    alt={settings.altText || 'Hero tattoo art'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEFAULT_HOME_HERO_SETTINGS.heroImage;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-1.5 right-1.5 bg-black/90 px-2 py-1 rounded border border-[#FFD60A]/40 text-right">
                    <span className="font-script text-xs text-[#FFD60A] font-bold block leading-none">
                      {settings.slogan || 'Same Skin Different Story'}
                    </span>
                  </div>
                </div>

                {/* Quick Badges */}
                <div className="space-y-1 text-right">
                  <div className="inline-block bg-black/70 backdrop-blur-md border border-zinc-700/80 px-2.5 py-1 rounded-lg text-[10px] text-zinc-300">
                    ⭐ 4.9 Google Reviews
                  </div>
                  <div className="block bg-black/70 backdrop-blur-md border border-zinc-700/80 px-2.5 py-1 rounded-lg text-[10px] text-[#FFD60A]">
                    ✓ 100% Sterile Needle Sets
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
              <span className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#FFD60A]" />
                Loop video covers only Section 1 and plays seamlessly
              </span>
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <span>View Live Site</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* RIGHT: Controls & Upload Panels */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* ============================================================== */}
          {/* 1. HERO BACKGROUND MEDIA: LOOP VIDEO CONTROLS */}
          {/* ============================================================== */}
          <div className="bg-[#141414] border-2 border-amber-500/30 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-[#FFD60A]">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                    1. Section 1 Background: Looping Video
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Set a continuous loop video for the entire background of this section
                  </p>
                </div>
              </div>
            </div>

            {/* Media Type Toggle: Video vs Image */}
            <div className="flex items-center bg-zinc-900 p-1 rounded-xl border border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  setActiveMediaTab('video');
                  setSettings((prev) => ({ ...prev, bgMediaType: 'video' }));
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeMediaTab === 'video'
                    ? 'bg-[#FFD60A] text-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Cinematic Looping Video (Active)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveMediaTab('image');
                  setSettings((prev) => ({ ...prev, bgMediaType: 'image' }));
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeMediaTab === 'image'
                    ? 'bg-[#FFD60A] text-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Static Image Texture</span>
              </button>
            </div>

            {activeMediaTab === 'video' && (
              <div className="space-y-4 pt-1">
                {/* A. Adjustable Overlay Darkness Slider */}
                <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-[#FFD60A]" />
                      <span>Adjust Background Overlay Darkness</span>
                    </label>
                    <span className="text-xs font-mono font-bold text-[#FFD60A] bg-black px-2 py-0.5 rounded border border-zinc-800">
                      {overlayOpacityPercent}% Dark
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0.2"
                    max="0.9"
                    step="0.05"
                    value={settings.bgOverlayOpacity ?? 0.65}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setSettings((prev) => ({ ...prev, bgOverlayOpacity: val }));
                    }}
                    className="w-full accent-[#FFD60A] cursor-pointer"
                  />

                  <div className="flex justify-between text-[10px] text-zinc-500 font-medium">
                    <span>20% (More Video)</span>
                    <span className="text-amber-400/80">65% (Recommended Balance)</span>
                    <span>90% (Deep Dark)</span>
                  </div>
                </div>

                {/* B. Enter Video Web URL (MP4 / WebM) */}
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-zinc-300">
                    Video Direct Web Link (MP4 or WebM)
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Film className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-500" />
                      <input
                        type="url"
                        value={videoUrlInput}
                        onChange={(e) => setVideoUrlInput(e.target.value)}
                        placeholder="https://assets.mixkit.co/videos/...mp4"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#FFD60A] transition-colors"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyVideoUrl}
                      className="px-3.5 py-2 text-xs font-semibold bg-[#FFD60A] hover:bg-[#ffe033] text-black rounded-xl transition-colors cursor-pointer shrink-0 font-bold"
                    >
                      Apply Video
                    </button>
                  </div>
                </div>

                {/* C. Upload Local Video File */}
                <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                  <label className="block text-xs font-medium text-zinc-300">
                    Or Upload Video File from Computer / Phone
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      type="file"
                      ref={videoFileInputRef}
                      onChange={handleVideoFileUpload}
                      accept="video/mp4,video/webm,video/quicktime,video/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={isUploadingVideo}
                      onClick={() => videoFileInputRef.current?.click()}
                      className="flex items-center gap-2 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2.5 rounded-xl border border-zinc-700 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isUploadingVideo ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 text-[#FFD60A] animate-spin" />
                          <span>Uploading &amp; Optimizing Video...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5 text-[#FFD60A]" />
                          <span>Choose Video File...</span>
                        </>
                      )}
                    </button>

                    {isUploadingVideo && (
                      <span className="text-xs text-[#FFD60A] flex items-center gap-1.5 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-[#FFD60A] animate-ping" />
                        Saving loop stream to server...
                      </span>
                    )}

                    {!isUploadingVideo && videoFileName && (
                      <span className="text-xs text-emerald-400 truncate max-w-xs flex items-center gap-1 font-medium bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-lg">
                        <Check className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{videoFileName}</span>
                        <span className="text-[10px] text-emerald-300/80 ml-1">(Ready to Save Live)</span>
                      </span>
                    )}

                    {!isUploadingVideo && !videoFileName && (
                      <span className="text-[11px] text-zinc-500">
                        MP4, WebM or MOV (up to 80MB)
                      </span>
                    )}
                  </div>

                  {uploadError && (
                    <div className="text-xs text-amber-400 bg-amber-950/40 border border-amber-800/40 p-2 rounded-lg mt-1">
                      {uploadError}
                    </div>
                  )}
                </div>

                {/* D. Studio Tattoo Loop Presets */}
                <div className="space-y-2.5 pt-2 border-t border-zinc-800/80">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-zinc-300">
                      Curated Tattoo Loop Presets (Click to Select)
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {HERO_VIDEO_PRESETS.map((preset) => {
                      const isSelected = settings.bgVideoUrl === preset.url;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handleSelectVideoPreset(preset.url)}
                          className={`relative rounded-xl border p-3 text-left transition-all cursor-pointer group ${
                            isSelected
                              ? 'border-[#FFD60A] ring-2 ring-[#FFD60A]/40 bg-zinc-900'
                              : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1 mb-1">
                            <span className="text-[11px] font-bold text-white group-hover:text-[#FFD60A] transition-colors leading-tight">
                              {preset.name}
                            </span>
                            {isSelected && (
                              <span className="w-4 h-4 rounded-full bg-[#FFD60A] text-black flex items-center justify-center shrink-0">
                                <Check className="w-2.5 h-2.5" />
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-zinc-400 line-clamp-2">
                            {preset.desc}
                          </p>
                          <div className="mt-2 flex items-center gap-1.5 text-[9px] text-[#FFD60A] font-mono">
                            <Play className="w-2.5 h-2.5 fill-current" />
                            <span>{preset.tag}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ============================================================== */}
          {/* 2. FOREGROUND SHOWCASE IMAGE & "SAME SKIN" BADGE */}
          {/* ============================================================== */}
          <div className="bg-[#141414] border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#FFD60A]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                2. Foreground Tattoo Showcase Image &amp; Badge
              </h3>
            </div>

            {/* Option A: Upload Local Image File */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-zinc-300">
                Upload Custom Image from Device
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2.5 rounded-xl border border-zinc-700 transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-[#FFD60A]" />
                  <span>Choose Image File...</span>
                </button>
                {fileName ? (
                  <span className="text-xs text-emerald-400 truncate max-w-xs flex items-center gap-1">
                    <Check className="w-3 h-3" /> {fileName}
                  </span>
                ) : (
                  <span className="text-[11px] text-zinc-500">
                    PNG, JPG, WebP (up to 8MB)
                  </span>
                )}
              </div>
            </div>

            {/* Option B: Enter Direct Image URL */}
            <div className="space-y-2 pt-2 border-t border-zinc-800/80">
              <label className="block text-xs font-medium text-zinc-300">
                Or Paste Image Web Link (URL)
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <LinkIcon className="absolute left-3 top-3 w-3.5 h-3.5 text-zinc-500" />
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#FFD60A] transition-colors"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="px-3.5 py-2 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl border border-zinc-700 transition-colors cursor-pointer"
                >
                  Apply URL
                </button>
              </div>
            </div>

            {/* Option C: Curated Tattoo Presets */}
            <div className="space-y-2 pt-2 border-t border-zinc-800/80">
              <label className="block text-xs font-medium text-zinc-300">
                Or Pick from Studio Presets
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {HERO_PRESETS.map((preset) => {
                  const isSelected = settings.heroImage === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset.url)}
                      className={`relative rounded-xl overflow-hidden border text-left p-1.5 transition-all group cursor-pointer ${
                        isSelected
                          ? 'border-[#FFD60A] ring-2 ring-[#FFD60A]/40 bg-zinc-900'
                          : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                      }`}
                    >
                      <div className="aspect-[4/3] rounded-lg overflow-hidden bg-black mb-1.5">
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <span className="block text-[11px] font-bold text-white truncate px-1">
                        {preset.name}
                      </span>
                      {isSelected && (
                        <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#FFD60A] text-black flex items-center justify-center">
                          <Check className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Slogan & Slogan Badge Settings */}
            <div className="pt-2 border-t border-zinc-800/80 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#FFD60A]" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  “Same Skin Different Story” Slogan Badge
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-zinc-400">
                    Script Slogan Text
                  </label>
                  <input
                    type="text"
                    value={settings.slogan}
                    onChange={(e) => setSettings({ ...settings, slogan: e.target.value })}
                    placeholder="Same Skin Different Story"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-[#FFD60A] font-bold focus:outline-none focus:border-[#FFD60A]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-zinc-400">
                    Badge Subtitle / Location
                  </label>
                  <input
                    type="text"
                    value={settings.subtitle}
                    onChange={(e) => setSettings({ ...settings, subtitle: e.target.value })}
                    placeholder="Hisar Studio"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* 3. HERO HEADLINES & HIGHLIGHTS */}
          {/* ============================================================== */}
          <div className="bg-[#141414] border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-[#FFD60A]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                3. Hero Headings &amp; Badges
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-300">
                  Hero Big Heading (Line 1)
                </label>
                <input
                  type="text"
                  value={settings.mainHeadingLine1}
                  onChange={(e) => setSettings({ ...settings, mainHeadingLine1: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-300">
                  Hero Big Heading (Line 2)
                </label>
                <input
                  type="text"
                  value={settings.mainHeadingLine2}
                  onChange={(e) => setSettings({ ...settings, mainHeadingLine2: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-300">
                Studio Subtitle
              </label>
              <input
                type="text"
                value={settings.studioSubheading}
                onChange={(e) => setSettings({ ...settings, studioSubheading: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-300">
                Hero Description Paragraph
              </label>
              <textarea
                rows={3}
                value={settings.heroDescription}
                onChange={(e) => setSettings({ ...settings, heroDescription: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD60A] resize-none"
              />
            </div>

            {/* Badges */}
            <div className="space-y-2 pt-2 border-t border-zinc-800/80">
              <label className="block text-xs font-medium text-zinc-300">
                Key Credibility Badges (3 items)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  value={settings.badge1}
                  onChange={(e) => setSettings({ ...settings, badge1: e.target.value })}
                  placeholder="6+ Years of Excellence"
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
                />
                <input
                  type="text"
                  value={settings.badge2}
                  onChange={(e) => setSettings({ ...settings, badge2: e.target.value })}
                  placeholder="100% Sterile & Safe"
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
                />
                <input
                  type="text"
                  value={settings.badge3}
                  onChange={(e) => setSettings({ ...settings, badge3: e.target.value })}
                  placeholder="5.0 ★ Top Rated"
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
                />
              </div>
            </div>
          </div>

          {/* Bottom Save Action */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full sm:w-auto flex items-center justify-center gap-2 text-xs font-bold bg-[#FFD60A] hover:bg-[#ffe033] active:scale-[0.98] text-black px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <span>Saving Changes...</span>
              ) : (
                <>
                  <Save className="w-4 h-4 text-black" />
                  <span>Save in Live</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
