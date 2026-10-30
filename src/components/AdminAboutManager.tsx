import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  CheckCircle2, 
  RotateCcw, 
  Eye, 
  Save, 
  Check, 
  Info,
  ExternalLink,
  BookOpen,
  FileText,
  Sparkles
} from 'lucide-react';
import { 
  getStoredAboutSettings, 
  saveAboutSettings, 
  resetAboutSettings, 
  AboutSectionSettings, 
  DEFAULT_ABOUT_SETTINGS,
  uploadImageToServer
} from '../lib/studioContent';
import { supabase } from '../lib/supabase';

// Studio photo presets for About sections
const ABOUT_PRESETS = [
  {
    id: 'studio-reception-counter',
    name: 'Studio Reception (Original)',
    url: 'https://images.unsplash.com/photo-1512690459411-b9245aed614b?auto=format&fit=crop&w=1000&q=80',
    desc: 'Reception desk and waiting lounge at Hisar Studio',
  },
  {
    id: 'hygiene-station',
    name: 'Hygiene & Sterile Station',
    url: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=1000&q=80',
    desc: 'Hospital-grade barrier protected tattoo work table',
  },
  {
    id: 'artist-sketching',
    name: 'Custom Concept & Stenciling',
    url: 'https://images.unsplash.com/photo-1562962230-16e4623d36e6?auto=format&fit=crop&w=1000&q=80',
    desc: 'Drawing hand-crafted custom tattoo stencil art',
  },
  {
    id: 'cozy-studio-chairs',
    name: 'Tattoo Station & Equipment',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80',
    desc: 'High-comfort ergonomic client beds and professional lighting',
  },
  {
    id: 'academy-training',
    name: 'Academy Masterclass Session',
    url: 'https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?auto=format&fit=crop&w=1000&q=80',
    desc: 'Students learning machine mechanics and skin stretching',
  },
];

export const AdminAboutManager: React.FC = () => {
  const [settings, setSettings] = useState<AboutSectionSettings>(getStoredAboutSettings);
  const [activeSubTab, setActiveSubTab] = useState<'home-about' | 'about-page'>('home-about');
  
  const [homeUrlInput, setHomeUrlInput] = useState(settings.homeAboutImage);
  const [storyUrlInput, setStoryUrlInput] = useState(settings.aboutStoryImage);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [fileName, setFileName] = useState('');
  
  const homeFileRef = useRef<HTMLInputElement>(null);
  const storyFileRef = useRef<HTMLInputElement>(null);

  // Sync directly from Supabase Cloud on mount
  useEffect(() => {
    let isMounted = true;
    const fetchRemote = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'custom_about_content')
          .single();

        if (!error && data && data.value && isMounted) {
          const merged = { ...DEFAULT_ABOUT_SETTINGS, ...data.value };
          setSettings(merged);
          setHomeUrlInput(merged.homeAboutImage || '');
          setStoryUrlInput(merged.aboutStoryImage || '');
          try {
            localStorage.setItem('phoenix_studio_about_v1', JSON.stringify(merged));
          } catch {}
        }
      } catch (e) {}
    };
    fetchRemote();
    return () => {
      isMounted = false;
    };
  }, []);

  // File upload for Home About image directly to server disk storage
  const handleHomeFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file.');
      return;
    }

    setFileName(file.name);
    try {
      const serverUrl = await uploadImageToServer(file, 'about_home');
      setSettings((prev) => ({ ...prev, homeAboutImage: serverUrl }));
      setHomeUrlInput('');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Failed to upload about image:', err);
      alert('Failed to upload image to server disk storage.');
    } finally {
      if (homeFileRef.current) homeFileRef.current.value = '';
    }
  };

  // File upload for About Page story image directly to server disk storage
  const handleStoryFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file.');
      return;
    }

    setFileName(file.name);
    try {
      const serverUrl = await uploadImageToServer(file, 'about_story');
      setSettings((prev) => ({ ...prev, aboutStoryImage: serverUrl }));
      setStoryUrlInput('');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Failed to upload story image:', err);
      alert('Failed to upload image to server disk storage.');
    } finally {
      if (storyFileRef.current) storyFileRef.current.value = '';
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const res = await saveAboutSettings(settings);
    setIsSaving(false);
    if (res.success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } else {
      alert(res.error || 'Failed to save about section changes.');
    }
  };

  const handleReset = async () => {
    if (window.confirm('Reset all About section images, descriptions, and story text to studio defaults?')) {
      await resetAboutSettings();
      setSettings(DEFAULT_ABOUT_SETTINGS);
      setHomeUrlInput(DEFAULT_ABOUT_SETTINGS.homeAboutImage);
      setStoryUrlInput(DEFAULT_ABOUT_SETTINGS.aboutStoryImage);
      setFileName('');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-[#181818] border border-zinc-800 rounded-2xl p-6 sm:p-7 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFD60A]" />
            <span className="text-xs font-bold text-[#FFD60A] uppercase tracking-wider">
              Studio Content Customizer
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight">
            About Section Image &amp; Description
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Customize the About section images, badges, headings, and detailed descriptions appearing both on the <strong className="text-white">Home page</strong> and the dedicated <strong className="text-white">About page</strong>.
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
                <span>Saving...</span>
              </>
            ) : saveSuccess ? (
              <>
                <Check className="w-4 h-4 text-black" />
                <span>Saved Live!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-black" />
                <span>Save About Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 px-4 py-3 rounded-xl text-xs flex items-center gap-2.5 animate-in fade-in duration-200 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Success!</strong> About section images and descriptions have been updated and are now live on both the Home and About pages.
          </span>
        </div>
      )}

      {/* Sub-tabs: Home Page About vs About Page Story */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
        <button
          onClick={() => setActiveSubTab('home-about')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'home-about'
              ? 'bg-[#FFD60A] text-black shadow-md'
              : 'bg-zinc-900 text-zinc-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Home Page About Section</span>
        </button>
        <button
          onClick={() => setActiveSubTab('about-page')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'about-page'
              ? 'bg-[#FFD60A] text-black shadow-md'
              : 'bg-zinc-900 text-zinc-400 hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Dedicated About Page Story</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* VIEW 1: HOME PAGE ABOUT SECTION CUSTOMIZER */}
      {/* ========================================================= */}
      {activeSubTab === 'home-about' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: Live Preview on Home Page */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#141414] border border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-md lg:sticky lg:top-24">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#FFD60A]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                    Home Page About Preview
                  </h3>
                </div>
                <span className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded font-mono">
                  Live View
                </span>
              </div>

              {/* Mock Home About Layout */}
              <div className="bg-white text-zinc-800 p-5 rounded-xl border border-zinc-300 shadow-inner space-y-5">
                {/* Image with yellow offset frame */}
                <div className="relative mx-auto max-w-xs">
                  <div className="absolute inset-0 bg-[#FFD60A] rounded-xl transform translate-x-2.5 translate-y-2.5" />
                  <div className="relative rounded-xl overflow-hidden shadow-lg border-2 border-zinc-900 bg-zinc-900 aspect-[4/3]">
                    <img
                      src={settings.homeAboutImage}
                      alt="About studio reception"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = DEFAULT_ABOUT_SETTINGS.homeAboutImage;
                      }}
                    />
                    <div className="absolute bottom-2.5 left-2.5 bg-black/85 backdrop-blur-md px-2.5 py-1 rounded-md border border-zinc-700">
                      <span className="text-[9px] font-bold text-[#FFD60A] tracking-wider uppercase">
                        {settings.homeAboutImageBadge || 'Studio Reception • Hisar'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Text preview */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-0.5 bg-[#FFD60A]" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                      ABOUT US
                    </span>
                  </div>
                  <h4 className="font-serif text-lg font-bold text-zinc-900 leading-tight">
                    {settings.homeAboutHeading}
                  </h4>
                  <p className="text-xs text-zinc-600 line-clamp-3 leading-relaxed">
                    {settings.homeAboutParagraph1}
                  </p>
                  <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
                    {settings.homeAboutParagraph2}
                  </p>
                  <div className="pt-2 flex items-center justify-between border-t border-zinc-200">
                    <span className="text-xs font-bold text-zinc-900 border-b border-[#FFD60A]">
                      Learn More About Our Journey &rarr;
                    </span>
                    <span className="font-script text-base text-zinc-800">
                      {settings.homeAboutTagline}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-[#FFD60A]" />
                  Displays right below Hero on Homepage
                </span>
                <a
                  href="/#about"
                  target="_blank"
                  rel="noreferrer"
                  className="text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                  <span>View on Home</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* RIGHT: Form controls for Home About */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Image Selector */}
            <div className="bg-[#141414] border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#FFD60A]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  1. Home About Section Image
                </h3>
              </div>

              {/* Upload file */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-zinc-300">
                  Upload Image from Device
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    ref={homeFileRef}
                    onChange={handleHomeFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => homeFileRef.current?.click()}
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
                      Replaces studio reception image
                    </span>
                  )}
                </div>
              </div>

              {/* Direct URL */}
              <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                <label className="block text-xs font-medium text-zinc-300">
                  Or Paste Direct Image URL
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="absolute left-3 top-3 w-3.5 h-3.5 text-zinc-500" />
                    <input
                      type="url"
                      value={homeUrlInput}
                      onChange={(e) => setHomeUrlInput(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#FFD60A]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (homeUrlInput.trim()) {
                        setSettings({ ...settings, homeAboutImage: homeUrlInput.trim() });
                      }
                    }}
                    className="px-3.5 py-2 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl border border-zinc-700 transition-colors cursor-pointer"
                  >
                    Apply URL
                  </button>
                </div>
              </div>

              {/* Presets */}
              <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                <label className="block text-xs font-medium text-zinc-300">
                  Quick Studio Presets
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ABOUT_PRESETS.map((p) => {
                    const isSelected = settings.homeAboutImage === p.url;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setSettings({ ...settings, homeAboutImage: p.url });
                          setHomeUrlInput(p.url);
                        }}
                        className={`p-1.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#FFD60A] ring-2 ring-[#FFD60A]/40 bg-zinc-900'
                            : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                        }`}
                      >
                        <div className="aspect-[4/3] rounded-lg overflow-hidden bg-black mb-1">
                          <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="block text-[11px] font-bold text-white truncate">
                          {p.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Badge text on image */}
              <div className="space-y-1.5 pt-2 border-t border-zinc-800/80">
                <label className="block text-xs font-medium text-zinc-300">
                  Image Badge Overlay Text
                </label>
                <input
                  type="text"
                  value={settings.homeAboutImageBadge}
                  onChange={(e) => setSettings({ ...settings, homeAboutImageBadge: e.target.value })}
                  placeholder="Studio Reception • Hisar"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
                />
              </div>
            </div>

            {/* Descriptions & Headings */}
            <div className="bg-[#141414] border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#FFD60A]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  2. Home About Headings &amp; Descriptions
                </h3>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-300">
                  Section Heading
                </label>
                <input
                  type="text"
                  value={settings.homeAboutHeading}
                  onChange={(e) => setSettings({ ...settings, homeAboutHeading: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-[#FFD60A]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-300">
                  About Paragraph 1 (Main Introduction)
                </label>
                <textarea
                  rows={4}
                  value={settings.homeAboutParagraph1}
                  onChange={(e) => setSettings({ ...settings, homeAboutParagraph1: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#FFD60A] resize-none leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-300">
                  About Paragraph 2 (Academy &amp; Growth)
                </label>
                <textarea
                  rows={3}
                  value={settings.homeAboutParagraph2}
                  onChange={(e) => setSettings({ ...settings, homeAboutParagraph2: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#FFD60A] resize-none leading-relaxed"
                />
              </div>

              <div className="space-y-1.5 pt-2 border-t border-zinc-800/80">
                <label className="block text-xs font-medium text-zinc-300">
                  Cursive Script Tagline
                </label>
                <input
                  type="text"
                  value={settings.homeAboutTagline}
                  onChange={(e) => setSettings({ ...settings, homeAboutTagline: e.target.value })}
                  placeholder="“Ink Your Story”"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-[#FFD60A] font-bold focus:outline-none focus:border-[#FFD60A]"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full sm:w-auto flex items-center justify-center gap-2 text-xs font-bold bg-[#FFD60A] hover:bg-[#ffe033] active:scale-[0.98] text-black px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4 text-black" />
                <span>Publish About Section</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW 2: DEDICATED ABOUT PAGE STORY CUSTOMIZER */}
      {/* ========================================================= */}
      {activeSubTab === 'about-page' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: About Page Story Preview */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#141414] border border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-md lg:sticky lg:top-24">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#FFD60A]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                    About Page Story Preview
                  </h3>
                </div>
                <span className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded font-mono">
                  /about
                </span>
              </div>

              {/* Story section card */}
              <div className="bg-white text-zinc-800 p-5 rounded-xl border border-zinc-300 shadow-inner space-y-4">
                <div className="relative mx-auto max-w-xs">
                  <div className="absolute inset-0 bg-[#FFD60A] rounded-xl transform translate-x-2.5 translate-y-2.5" />
                  <div className="relative rounded-xl overflow-hidden shadow-lg border-2 border-zinc-900 bg-zinc-900 aspect-[4/5]">
                    <img
                      src={settings.aboutStoryImage}
                      alt="How it all began story"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = DEFAULT_ABOUT_SETTINGS.aboutStoryImage;
                      }}
                    />
                    <div className="absolute bottom-2.5 left-2.5 bg-black/85 backdrop-blur-md px-2.5 py-1 rounded-md border border-zinc-700">
                      <span className="text-[9px] font-bold text-[#FFD60A] tracking-wider uppercase">
                        {settings.aboutStoryImageBadge || 'Hisar Studio'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-0.5 bg-[#FFD60A]" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                      OUR STORY
                    </span>
                  </div>
                  <h4 className="font-serif text-lg font-bold text-zinc-900">
                    {settings.aboutStoryHeading}
                  </h4>
                  <p className="text-xs text-zinc-600 line-clamp-3 leading-relaxed">
                    {settings.aboutStoryParagraph1}
                  </p>
                  <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
                    {settings.aboutStoryParagraph2}
                  </p>
                  <div className="pt-2 border-t border-zinc-200">
                    <span className="font-script text-base text-zinc-800 block">
                      {settings.aboutStorySlogan}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-[#FFD60A]" />
                  Displays on the dedicated /about page
                </span>
                <a
                  href="/about"
                  target="_blank"
                  rel="noreferrer"
                  className="text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                  <span>Open /about</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* RIGHT: Story form controls */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Story Image */}
            <div className="bg-[#141414] border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#FFD60A]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  1. Story Section Image (/about)
                </h3>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-medium text-zinc-300">
                  Upload Image from Device
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    ref={storyFileRef}
                    onChange={handleStoryFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => storyFileRef.current?.click()}
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
                      High-resolution portrait or studio photo
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                <label className="block text-xs font-medium text-zinc-300">
                  Or Paste Direct Image URL
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="absolute left-3 top-3 w-3.5 h-3.5 text-zinc-500" />
                    <input
                      type="url"
                      value={storyUrlInput}
                      onChange={(e) => setStoryUrlInput(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#FFD60A]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (storyUrlInput.trim()) {
                        setSettings({ ...settings, aboutStoryImage: storyUrlInput.trim() });
                      }
                    }}
                    className="px-3.5 py-2 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl border border-zinc-700 transition-colors cursor-pointer"
                  >
                    Apply URL
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-zinc-800/80">
                <label className="block text-xs font-medium text-zinc-300">
                  Image Badge Overlay Text
                </label>
                <input
                  type="text"
                  value={settings.aboutStoryImageBadge}
                  onChange={(e) => setSettings({ ...settings, aboutStoryImageBadge: e.target.value })}
                  placeholder="Hisar Studio"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
                />
              </div>
            </div>

            {/* Story text */}
            <div className="bg-[#141414] border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#FFD60A]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  2. Story Narrative &amp; Slogans (/about)
                </h3>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-300">
                  Story Heading
                </label>
                <input
                  type="text"
                  value={settings.aboutStoryHeading}
                  onChange={(e) => setSettings({ ...settings, aboutStoryHeading: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-[#FFD60A]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-300">
                  Narrative Paragraph 1 (Genesis in 2019)
                </label>
                <textarea
                  rows={4}
                  value={settings.aboutStoryParagraph1}
                  onChange={(e) => setSettings({ ...settings, aboutStoryParagraph1: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#FFD60A] resize-none leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-300">
                  Narrative Paragraph 2 (People &amp; Stories)
                </label>
                <textarea
                  rows={3}
                  value={settings.aboutStoryParagraph2}
                  onChange={(e) => setSettings({ ...settings, aboutStoryParagraph2: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#FFD60A] resize-none leading-relaxed"
                />
              </div>

              <div className="space-y-1.5 pt-2 border-t border-zinc-800/80">
                <label className="block text-xs font-medium text-zinc-300">
                  Story Script Slogan
                </label>
                <input
                  type="text"
                  value={settings.aboutStorySlogan}
                  onChange={(e) => setSettings({ ...settings, aboutStorySlogan: e.target.value })}
                  placeholder="“Same Skin Different Story”"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-[#FFD60A] font-bold focus:outline-none focus:border-[#FFD60A]"
                />
              </div>

              <div className="space-y-1.5 pt-2 border-t border-zinc-800/80">
                <label className="block text-xs font-medium text-zinc-300">
                  About Page Hero Banner Tagline
                </label>
                <input
                  type="text"
                  value={settings.aboutHeroTagline}
                  onChange={(e) => setSettings({ ...settings, aboutHeroTagline: e.target.value })}
                  placeholder="Your Story / Our Art"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-300">
                  About Page Hero Subtitle Description
                </label>
                <textarea
                  rows={3}
                  value={settings.aboutHeroDescription}
                  onChange={(e) => setSettings({ ...settings, aboutHeroDescription: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#FFD60A] resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full sm:w-auto flex items-center justify-center gap-2 text-xs font-bold bg-[#FFD60A] hover:bg-[#ffe033] active:scale-[0.98] text-black px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4 text-black" />
                <span>Publish Story Changes</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
