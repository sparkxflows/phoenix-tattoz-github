import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Grid, 
  Sparkles, 
  Eye, 
  Feather, 
  Compass, 
  Smile, 
  Cloud, 
  Palette, 
  ArrowRight, 
  Calendar,
  CheckCircle2,
  CircleDot,
  Video,
  Film,
  Play,
  Clock,
  User,
  Image as ImageIcon
} from 'lucide-react';
import { GalleryItem, VideoGalleryItem } from '../data/studioData';
import { useGallery, useVideos } from '../lib/studioContent';
import { LightboxModal } from '../components/LightboxModal';
import { VideoLightboxModal } from '../components/VideoLightboxModal';
import { DragonOrnament } from '../components/Ornaments';

interface GalleryProps {
  onOpenBooking: (artistId?: string, serviceId?: string) => void;
}

export const Gallery: React.FC<GalleryProps> = ({ onOpenBooking }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const galleryItems = useGallery();
  const videoItems = useVideos();

  // Active view: 'photos' | 'videos'
  const activeTabParam = searchParams.get('tab');
  const [activeView, setActiveView] = useState<'photos' | 'videos'>(
    activeTabParam === 'videos' ? 'videos' : 'photos'
  );

  useEffect(() => {
    if (activeTabParam === 'videos') {
      setActiveView('videos');
    } else if (activeTabParam === 'photos') {
      setActiveView('photos');
    }
  }, [activeTabParam]);

  const handleSwitchView = (view: 'photos' | 'videos') => {
    setActiveView(view);
    setSearchParams({ tab: view });
  };

  // ------------------------------------------
  // PHOTO GALLERY STATE & FILTERS
  // ------------------------------------------
  const [selectedPhotoFilter, setSelectedPhotoFilter] = useState('All');
  const [selectedPhotoItem, setSelectedPhotoItem] = useState<GalleryItem | null>(null);

  const photoFilterOptions = [
    { label: 'All', icon: Grid },
    { label: 'Black & Grey', icon: Sparkles },
    { label: 'Realism', icon: Eye },
    { label: 'Fine Line', icon: Feather },
    { label: 'Traditional', icon: Compass },
    { label: 'Neo Traditional', icon: Smile },
    { label: 'Japanese', icon: Cloud },
    { label: 'Piercing', icon: CircleDot },
    { label: 'Minimal', icon: Sparkles },
    { label: 'Custom', icon: Palette },
  ];

  const filteredPhotoItems = useMemo(() => {
    if (selectedPhotoFilter === 'All') return galleryItems;
    return galleryItems.filter((item) =>
      item.category.toLowerCase().includes(selectedPhotoFilter.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(selectedPhotoFilter.toLowerCase()))
    );
  }, [galleryItems, selectedPhotoFilter]);

  // ------------------------------------------
  // VIDEO GALLERY STATE & FILTERS
  // ------------------------------------------
  const [selectedVideoFilter, setSelectedVideoFilter] = useState('All');
  const [selectedVideoItem, setSelectedVideoItem] = useState<VideoGalleryItem | null>(null);

  const videoFilterOptions = [
    { label: 'All', icon: Grid },
    { label: 'Tattoo Sessions', icon: Film },
    { label: 'Client Reveals', icon: Sparkles },
    { label: 'Piercing Work', icon: CircleDot },
    { label: 'Behind The Scenes', icon: User },
    { label: 'Academy', icon: Palette },
  ];

  const filteredVideoItems = useMemo(() => {
    if (selectedVideoFilter === 'All') return videoItems;
    const filterLower = selectedVideoFilter.toLowerCase();
    return videoItems.filter((video) =>
      video.category.toLowerCase().includes(filterLower) ||
      filterLower.includes(video.category.toLowerCase()) ||
      video.artist.toLowerCase().includes(filterLower) ||
      video.tags.some((t) => t.toLowerCase().includes(filterLower))
    );
  }, [videoItems, selectedVideoFilter]);

  return (
    <div className="bg-[#090A0D] text-zinc-100 min-h-screen pb-24">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-[#090A0D] border-b border-white/[0.08]">
        <DragonOrnament className="absolute -left-16 -top-12 w-96 h-96 text-zinc-800/40 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-4 relative z-10">
              <div className="flex items-center gap-2">
                <span className="w-6 h-0.5 bg-[#FFD60A]" />
                <span className="text-xs font-bold uppercase tracking-widest text-[#FFD60A]">
                  {activeView === 'videos' ? 'STUDIO VIDEO REELS & PROCESS' : 'TATTOO & PIERCING SHOWCASE'}
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                {activeView === 'videos' ? (
                  <>
                    STUDIO VIDEOS
                    <br />
                    <span className="text-[#FFD60A]">&amp; ARTIST REELS</span>
                  </>
                ) : (
                  <>
                    TATTOO &amp; PIERCING
                    <br />
                    <span className="text-[#FFD60A]">GALLERY</span>
                  </>
                )}
              </h1>

              <p className="text-base sm:text-lg font-bold text-zinc-200 font-serif">
                {activeView === 'videos' 
                  ? 'Real Inking In Motion. Needle Craft. Fresh Reveals.'
                  : 'Real Art. Real Piercings. Real Stories.'}
              </p>

              <p className="text-xs sm:text-sm text-zinc-300 max-w-md leading-relaxed">
                {activeView === 'videos'
                  ? 'Watch our master artists bring skin canvases to life. Explore behind-the-scenes tattoo sessions, intricate shading techniques, and precision body piercing reels.'
                  : 'Explore our collection of custom tattoos, precision body piercings, unique styles and creative work. Each piece tells a story.'}
              </p>

              {/* View Switcher Controls (Photos vs Videos) */}
              <div className="pt-2 flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => handleSwitchView('photos')}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all cursor-pointer shadow-sm ${
                    activeView === 'photos'
                      ? 'bg-[#FFD60A] text-black shadow-md shadow-amber-500/20 ring-2 ring-[#FFD60A]/60'
                      : 'bg-[#14161C] hover:bg-[#1A1D24] text-zinc-300 border border-white/10'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Photo Gallery ({galleryItems.length})</span>
                </button>

                <button
                  onClick={() => handleSwitchView('videos')}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all cursor-pointer shadow-sm ${
                    activeView === 'videos'
                      ? 'bg-[#FFD60A] text-black shadow-md shadow-amber-500/20 ring-2 ring-[#FFD60A]/60'
                      : 'bg-[#14161C] hover:bg-[#1A1D24] text-zinc-300 border border-white/10'
                  }`}
                >
                  <Film className="w-4 h-4" />
                  <span>Video Reels ({videoItems.length})</span>
                </button>
              </div>
            </div>

            {/* Right Photographic/Video Banner */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-xl border-2 border-white/[0.08] bg-black aspect-[16/9] sm:aspect-[2/1] group">
                <img
                  src={
                    activeView === 'videos'
                      ? (videoItems[0]?.thumbnailUrl || videoItems[0]?.posterUrl || 'https://images.unsplash.com/photo-1562962230-16e4623d36e6?auto=format&fit=crop&w=1200&q=80')
                      : 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=1200&q=80'
                  }
                  alt={activeView === 'videos' ? 'Studio video session' : 'Detailed tattoo session in progress with ink machine'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                
                {activeView === 'videos' && (
                  <div 
                    onClick={() => setSelectedVideoItem(videoItems[0] || null)}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer hover:bg-black/30 transition-colors"
                  >
                    <div className="w-16 h-16 rounded-full bg-[#FFD60A] text-black flex items-center justify-center shadow-2xl pl-1 hover:scale-110 transition-transform">
                      <Play className="w-7 h-7 fill-black" />
                    </div>
                  </div>
                )}

                {/* Yellow brush script slogan */}
                <div className="absolute top-4 right-4 pointer-events-none select-none text-right">
                  <span className="font-script text-2xl sm:text-3xl lg:text-4xl text-[#FFD60A] font-bold block drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] leading-tight">
                    {activeView === 'videos' ? 'Art In Motion' : 'Different Styles'}
                  </span>
                  <span className="font-script text-2xl sm:text-3xl lg:text-4xl text-[#FFD60A] font-bold block drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] leading-tight -mt-1">
                    {activeView === 'videos' ? 'Living Inks' : 'Same Passion'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. GALLERY INTERFACE: SIDEBAR + TOP PILLS + CARDS GRID */}
      <div id="gallery-grid-anchor" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* ========================================================= */}
        {/* VIEW A: PHOTO GALLERY */}
        {/* ========================================================= */}
        {activeView === 'photos' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Sidebar Filter (Desktop) */}
            <div className="hidden lg:block lg:col-span-3 space-y-6 sticky top-24">
              <div className="bg-[#121418] rounded-2xl border border-white/[0.08] p-3 shadow-sm space-y-1">
                <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-800 flex items-center justify-between">
                  <span>Photo Categories</span>
                  <span className="text-[10px] text-[#FFD60A] font-mono font-bold">{filteredPhotoItems.length} photos</span>
                </div>
                {photoFilterOptions.map((f) => {
                  const IconComponent = f.icon;
                  const isActive = selectedPhotoFilter === f.label;
                  return (
                    <button
                      key={f.label}
                      onClick={() => setSelectedPhotoFilter(f.label)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#FFD60A] text-black shadow-md font-bold'
                          : 'text-zinc-300 hover:text-white hover:bg-[#1A1D24]'
                      }`}
                    >
                      <IconComponent className={`w-4 h-4 ${isActive ? 'text-black' : 'text-zinc-400'}`} />
                      <span>{f.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Video Shortcut Card inside Sidebar */}
              <div 
                onClick={() => handleSwitchView('videos')}
                className="bg-[#14161C] text-white p-5 rounded-2xl border border-white/10 shadow-md space-y-2 cursor-pointer hover:border-amber-400/50 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FFD60A] bg-[#FFD60A]/10 px-2 py-0.5 rounded">
                    Featured Reels
                  </span>
                  <Film className="w-4 h-4 text-[#FFD60A] group-hover:scale-110 transition-transform" />
                </div>
                <h4 className="font-serif font-bold text-sm text-white leading-snug">
                  Watch Inking Videos &amp; Reels
                </h4>
                <p className="text-[11px] text-zinc-400 leading-snug">
                  See how Rohit and the master team create precision line art in high-definition video.
                </p>
                <div className="pt-1">
                  <span className="text-xs text-[#FFD60A] font-bold group-hover:underline inline-flex items-center gap-1">
                    <span>Open Video Section</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              {/* Piercing Studio & Jewelry Highlight Card */}
              <div className="bg-[#121418] text-white p-5 rounded-2xl border border-white/[0.08] shadow-md space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FFD60A] bg-[#FFD60A]/10 px-2 py-0.5 rounded">
                    Studio Piercing
                  </span>
                  <CircleDot className="w-4 h-4 text-[#FFD60A]" />
                </div>
                <h4 className="font-serif font-bold text-sm text-white leading-snug">
                  Medical-Grade Titanium &amp; Solid Gold
                </h4>
                <p className="text-[11px] text-zinc-400 leading-snug">
                  Autoclave sterilized, needle only &mdash; zero piercing guns. Safe healing guaranteed.
                </p>
                <div className="pt-1 flex gap-2">
                  <button
                    onClick={() => setSelectedPhotoFilter('Piercing')}
                    className="flex-1 bg-[#FFD60A] hover:bg-[#ffe033] text-black font-bold text-xs py-2 rounded-lg cursor-pointer transition-colors text-center"
                  >
                    View Piercings
                  </button>
                  <button
                    onClick={() => onOpenBooking(undefined, 'piercing')}
                    className="flex-1 bg-[#1A1D24] hover:bg-[#222730] border border-white/10 text-white font-medium text-xs py-2 rounded-lg cursor-pointer transition-colors text-center"
                  >
                    Book Slot
                  </button>
                </div>
              </div>
            </div>

            {/* Right Area: Top Pill Bar + Photos Grid */}
            <div className="lg:col-span-9 space-y-6">
              {/* Top Pill Filters (Synchronized) */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {photoFilterOptions.map((f) => {
                  const isActive = selectedPhotoFilter === f.label;
                  return (
                    <button
                      key={f.label}
                      onClick={() => setSelectedPhotoFilter(f.label)}
                      className={`px-4 py-2 rounded-lg text-xs whitespace-nowrap transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#FFD60A] text-black font-bold shadow'
                          : 'bg-[#14161C] border border-white/10 text-zinc-300 hover:text-white hover:bg-[#1A1D24]'
                      }`}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>

              {/* Piercing Feature Highlight Banner when Piercing filter is active */}
              {selectedPhotoFilter === 'Piercing' && (
                <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-black text-white rounded-2xl p-5 sm:p-6 border border-zinc-800 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFD60A]/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="relative z-10 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-[#FFD60A] text-black text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                        Specialty Department
                      </span>
                      <span className="text-zinc-400 text-xs">Aseptic Precision Piercing</span>
                    </div>
                    <h3 className="font-serif text-xl sm:text-2xl font-black text-white tracking-tight">
                      BODY PIERCING &amp; HIGH-GRADE JEWELRY
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
                      Every piercing at Phoenix Tattooz is performed with single-use tri-beveled needles, hospital-grade autoclave sterilization, and hypoallergenic ASTM F-136 implant-grade titanium or 14K solid gold.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] text-zinc-300 font-medium">
                      <div className="flex items-center gap-1.5 bg-[#13151A]/5 border border-white/10 rounded-lg px-2.5 py-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#FFD60A] shrink-0" />
                        <span>ASTM F-136 Titanium</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-[#13151A]/5 border border-white/10 rounded-lg px-2.5 py-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#FFD60A] shrink-0" />
                        <span>Needle Only (No Guns)</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-[#13151A]/5 border border-white/10 rounded-lg px-2.5 py-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#FFD60A] shrink-0" />
                        <span>Autoclave Sterilized</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-[#13151A]/5 border border-white/10 rounded-lg px-2.5 py-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#FFD60A] shrink-0" />
                        <span>Free Follow-Up Checks</span>
                      </div>
                    </div>
                    <div className="pt-2">
                      <button
                        onClick={() => onOpenBooking(undefined, 'piercing')}
                        className="inline-flex items-center gap-2 bg-[#FFD60A] hover:bg-[#ffe033] text-black font-bold text-xs sm:text-sm px-5 py-2.5 rounded-lg shadow cursor-pointer transition-all"
                      >
                        <Calendar className="w-4 h-4 text-black" />
                        <span>Book A Piercing Appointment</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Photo Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
                {filteredPhotoItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedPhotoItem(item)}
                    className="group relative rounded-xl sm:rounded-2xl overflow-hidden bg-black aspect-[3/4] cursor-pointer shadow-md hover:shadow-2xl transition-all duration-300"
                  >
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=900&q=80'}
                      alt={item.title || 'Studio Tattoo'}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Gradient shadow for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

                    {/* Bottom details & Zoom Icon */}
                    <div className="absolute bottom-2.5 sm:bottom-4 left-2.5 sm:left-4 right-2.5 sm:right-4 flex items-end justify-between gap-1">
                      <div className="min-w-0">
                        <h3 className="font-serif font-bold text-white text-xs sm:text-base leading-snug drop-shadow-sm truncate">
                          {item.title || 'Custom Tattoo'}
                        </h3>
                        <p className="text-[9px] sm:text-[11px] text-[#FFD60A] font-medium uppercase tracking-wider mt-0.5 truncate">
                          {item.category || 'Tattoo'}
                        </p>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPhotoItem(item);
                        }}
                        aria-label={`Zoom ${item.title}`}
                        className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-[#13151A]/20 hover:bg-[#FFD60A] text-white hover:text-black backdrop-blur-md flex items-center justify-center transition-all cursor-pointer shadow-lg shrink-0"
                      >
                        <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredPhotoItems.length === 0 && (
                <div className="py-16 text-center space-y-3 bg-[#121418] rounded-2xl border border-white/[0.08] p-8">
                  <p className="text-zinc-300 text-sm">
                    No works found under "{selectedPhotoFilter}".
                  </p>
                  <button
                    onClick={() => setSelectedPhotoFilter('All')}
                    className="text-xs font-bold text-[#FFD60A] hover:underline cursor-pointer"
                  >
                    View All Works &amp; Piercings
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW B: VIDEO GALLERY (MATCHING SLEEK DARK THEME) */}
        {/* ========================================================= */}
        {activeView === 'videos' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Sidebar Filter (Desktop) */}
            <div className="hidden lg:block lg:col-span-3 space-y-6 sticky top-24">
              <div className="bg-[#121418] rounded-2xl border border-white/[0.08] p-3 shadow-sm space-y-1">
                <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-800 flex items-center justify-between">
                  <span>Video Categories</span>
                  <span className="text-[10px] text-[#FFD60A] font-mono font-bold">{filteredVideoItems.length} reels</span>
                </div>
                {videoFilterOptions.map((f) => {
                  const IconComponent = f.icon;
                  const isActive = selectedVideoFilter === f.label;
                  return (
                    <button
                      key={f.label}
                      onClick={() => setSelectedVideoFilter(f.label)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#FFD60A] text-black shadow-md font-bold'
                          : 'text-zinc-300 hover:text-white hover:bg-[#1A1D24]'
                      }`}
                    >
                      <IconComponent className={`w-4 h-4 ${isActive ? 'text-black' : 'text-zinc-400'}`} />
                      <span>{f.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Photo Gallery Shortcut Card */}
              <div 
                onClick={() => handleSwitchView('photos')}
                className="bg-[#14161C] border border-white/10 p-5 rounded-2xl shadow-sm space-y-2 cursor-pointer hover:border-amber-400/50 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FFD60A] bg-[#FFD60A]/10 px-2 py-0.5 rounded">
                    Photo Stills
                  </span>
                  <ImageIcon className="w-4 h-4 text-[#FFD60A] group-hover:scale-110 transition-transform" />
                </div>
                <h4 className="font-serif font-bold text-sm text-white leading-snug">
                  High-Resolution Photo Gallery
                </h4>
                <p className="text-[11px] text-zinc-400 leading-snug">
                  Browse over {galleryItems.length} curated tattoo and body piercing photographs.
                </p>
                <div className="pt-1">
                  <span className="text-xs text-[#FFD60A] font-bold group-hover:underline inline-flex items-center gap-1">
                    <span>Switch to Photo Gallery</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              {/* Booking CTA card */}
              <div className="bg-gradient-to-br from-amber-400 to-[#FFD60A] text-black p-5 rounded-2xl shadow-lg space-y-2 text-center">
                <span className="font-script text-2xl font-bold block leading-tight">
                  Inspired By A Video? 🎬
                </span>
                <p className="text-[11px] font-semibold leading-snug text-black/85">
                  Show us any video from our collection during consultation to get a tailored sketch.
                </p>
                <button
                  onClick={() => onOpenBooking()}
                  className="w-full bg-black hover:bg-zinc-900 active:scale-95 text-white font-bold text-xs py-2.5 rounded-xl mt-2 cursor-pointer transition-all shadow-md"
                >
                  Book Consultation Now
                </button>
              </div>
            </div>

            {/* Right Area: Top Pill Bar + Video Cards Grid */}
            <div className="lg:col-span-9 space-y-6">
              {/* Top Pill Filters (Synchronized) */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {videoFilterOptions.map((f) => {
                  const isActive = selectedVideoFilter === f.label;
                  return (
                    <button
                      key={f.label}
                      onClick={() => setSelectedVideoFilter(f.label)}
                      className={`px-4 py-2 rounded-lg text-xs whitespace-nowrap transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#FFD60A] text-black font-bold shadow'
                          : 'bg-[#14161C] border border-white/10 text-zinc-300 hover:text-white hover:bg-[#1A1D24]'
                      }`}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>

              {/* Video Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {filteredVideoItems.map((video) => (
                  <div
                    key={video.id}
                    onClick={() => setSelectedVideoItem(video)}
                    className="group relative rounded-2xl overflow-hidden bg-black aspect-[4/5] cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/[0.08]/40 hover:border-amber-400/80"
                  >
                    {/* Poster Image */}
                    <img
                      src={video.thumbnailUrl || video.posterUrl}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/30 pointer-events-none" />

                    {/* Top Badges (Category + Duration) */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10 pointer-events-none">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-[#FFD60A] border border-amber-400/30 px-2.5 py-1 rounded-full shadow">
                        {video.category}
                      </span>
                      {video.duration && (
                        <span className="text-[10px] font-mono font-bold bg-black/70 backdrop-blur-md text-white px-2 py-0.5 rounded-md flex items-center gap-1 shadow">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>{video.duration}</span>
                        </span>
                      )}
                    </div>

                    {/* Center Glowing Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#FFD60A] text-black flex items-center justify-center shadow-xl pl-1 group-hover:scale-115 group-hover:bg-[#13151A] group-hover:text-black transition-all duration-300 ring-4 ring-black/40">
                        <Play className="w-6 h-6 fill-current" />
                      </div>
                    </div>

                    {/* Bottom Metadata */}
                    <div className="absolute bottom-3 left-3 right-3 z-10 pointer-events-none">
                      <h3 className="font-serif font-bold text-white text-sm sm:text-base leading-snug drop-shadow-md line-clamp-1 group-hover:text-[#FFD60A] transition-colors">
                        {video.title}
                      </h3>
                      
                      <div className="flex items-center justify-between mt-1 text-[11px] text-zinc-300">
                        <span className="truncate flex items-center gap-1">
                          <User className="w-3 h-3 text-amber-400 shrink-0" />
                          <span className="truncate font-medium">{video.artist}</span>
                        </span>
                        <span className="text-[10px] font-bold text-[#FFD60A] bg-amber-400/20 px-1.5 py-0.5 rounded ml-2 shrink-0">
                          Watch Video &rarr;
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredVideoItems.length === 0 && (
                <div className="py-16 text-center space-y-3 bg-[#121418] rounded-2xl border border-white/[0.08] p-8">
                  <Film className="w-10 h-10 text-[#FFD60A] mx-auto" />
                  <h4 className="font-serif font-bold text-base text-white">
                    No Videos Found
                  </h4>
                  <p className="text-zinc-300 text-xs max-w-sm mx-auto">
                    No videos matched "{selectedVideoFilter}". New reels uploaded in the Admin Panel will appear here automatically.
                  </p>
                  <button
                    onClick={() => setSelectedVideoFilter('All')}
                    className="text-xs font-bold text-[#FFD60A] hover:underline cursor-pointer"
                  >
                    View All Videos
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Photo Lightbox Modal */}
      <LightboxModal
        item={selectedPhotoItem}
        isOpen={Boolean(selectedPhotoItem)}
        onClose={() => setSelectedPhotoItem(null)}
        onBookAppointment={(artistId) => {
          setSelectedPhotoItem(null);
          onOpenBooking(artistId);
        }}
      />

      {/* Video Lightbox Modal with Full Player Controls */}
      <VideoLightboxModal
        item={selectedVideoItem}
        isOpen={Boolean(selectedVideoItem)}
        onClose={() => setSelectedVideoItem(null)}
        onBookAppointment={(artistId) => {
          setSelectedVideoItem(null);
          onOpenBooking(artistId);
        }}
      />
    </div>
  );
};
