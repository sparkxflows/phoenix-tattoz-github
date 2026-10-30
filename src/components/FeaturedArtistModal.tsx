import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Heart, Calendar, Award } from 'lucide-react';
import { Artist } from '../data/studioData';
import { useArtists } from '../lib/studioContent';

interface FeaturedArtistModalProps {
  artist: Artist | null;
  isOpen: boolean;
  onClose: () => void;
  onBookAppointment: (artistId: string) => void;
}

export const FeaturedArtistModal: React.FC<FeaturedArtistModalProps> = ({
  artist,
  isOpen,
  onClose,
  onBookAppointment,
}) => {
  const artists = useArtists();
  const currentArtist = artist || (artists && artists.length > 0 ? artists[0] : null) || {
    id: 'rohit-sharma',
    name: 'Rohit Sharma',
    role: 'Lead Artist',
    subtitle: 'CUSTOM TATTOO SPECIALIST',
    rating: 5.0,
    reviewCount: 240,
    image: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=800&q=80',
    specialties: ['Custom Designs', 'Realism'],
    bio: 'Professional tattoo artist.',
    experienceYears: 5,
    tattoosCompleted: 1000,
    clientsCount: 500,
    timeline: [],
    portfolio: [],
    socials: { instagram: '', facebook: '', youtube: '' }
  };
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  // Safe gallery of photos for the artist
  const portfolioItems = Array.isArray(currentArtist.portfolio) ? currentArtist.portfolio : [];
  const images = [
    {
      url: currentArtist.image || 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=800&q=80',
      caption: currentArtist.name ? `${currentArtist.name} - Inking in studio` : 'Inking in studio',
    },
    ...portfolioItems.map((p) => ({
      url: p.image,
      caption: p.title || 'Studio Artwork',
    })),
  ];

  useEffect(() => {
    setActiveImageIndex(0);
  }, [currentArtist]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, activeImageIndex, images.length]);

  if (!isOpen) return null;

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      {/* Compact modal container: max-w-2xl with max-h-[90vh] */}
      <div 
        className="relative w-full max-w-2xl bg-[#F8F8F8] text-[#1A1A1A] rounded-2xl shadow-2xl overflow-hidden my-auto border border-zinc-200 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="bg-white border-b border-zinc-200 px-4 sm:px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="bg-[#FFD60A] text-black font-extrabold text-[10px] tracking-widest uppercase px-2.5 py-0.5 rounded shadow-sm">
              FEATURED ARTIST
            </span>
            <span className="text-xs text-zinc-500 font-medium hidden sm:inline">
              Phoenix Tattooz Studio &bull; Hisar
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Top Title & Rating Bar */}
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-zinc-200 pb-3">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-900 leading-tight">
                {currentArtist.name}
              </h2>
              <p className="text-xs font-semibold text-zinc-600 uppercase tracking-wider mt-0.5">
                {(currentArtist.specialties || ['Custom Design', 'Realism']).slice(0, 2).join(' | ')}
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="flex text-[#FFD60A] text-xs">
                {'★★★★★'.split('').map((star, i) => (
                  <span key={i} className="text-[#FFD60A]">★</span>
                ))}
              </div>
              <span className="text-xs font-bold text-zinc-900">
                {currentArtist.rating || 5.0}
              </span>
              <span className="text-[11px] text-zinc-500">
                ({currentArtist.reviewCount || 0} reviews)
              </span>
            </div>
          </div>

          {/* Compact Photo Slider & Thumbnails */}
          <div className="space-y-3">
            <div className="relative rounded-xl overflow-hidden bg-black aspect-[16/10] sm:aspect-[2/1] max-h-[220px] sm:max-h-[250px] shadow-md group">
              <img
                src={images[activeImageIndex]?.url || currentArtist.image}
                alt={images[activeImageIndex]?.caption || currentArtist.name}
                className="w-full h-full object-cover transition-transform duration-300"
              />

              {/* Slogan watermark */}
              <div className="absolute top-2.5 left-3 pointer-events-none select-none z-10">
                <span className="font-script text-lg sm:text-xl text-[#FFD60A] font-bold block drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] leading-tight">
                  Turning Ideas Into Art
                </span>
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={prevImage}
                aria-label="Previous slide"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 hover:bg-white text-zinc-800 flex items-center justify-center shadow transition-transform hover:scale-110 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextImage}
                aria-label="Next slide"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 hover:bg-white text-zinc-800 flex items-center justify-center shadow transition-transform hover:scale-110 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="absolute bottom-2 right-2.5 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded text-[10px] text-zinc-200">
                {activeImageIndex + 1} / {images.length}
              </div>
            </div>

            {/* Horizontal thumbnail selector */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-12 h-12 shrink-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                    activeImageIndex === idx
                      ? 'border-[#FFD60A] ring-1 ring-[#FFD60A] scale-105 shadow'
                      : 'border-zinc-300 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt={img.caption} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Bio & Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 pt-1">
            {/* Bio Column */}
            <div className="sm:col-span-7 space-y-3">
              <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed">
                {currentArtist.bio}
              </p>

              <div className="pt-1">
                <div className="font-script text-xl text-zinc-900 font-bold">
                  {currentArtist.name}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">
                  Lead Tattoo Artist &bull; Phoenix Tattooz
                </div>
              </div>

              {/* Specialization Tags */}
              <div className="pt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1.5">
                  Specializations:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(currentArtist.specialties || ['Custom Design', 'Realism']).map((spec, i) => (
                    <span
                      key={i}
                      className="bg-zinc-900 text-white text-[11px] font-medium px-2.5 py-1 rounded-md"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Timeline Column */}
            <div className="sm:col-span-5 bg-white p-3.5 rounded-xl border border-zinc-200 space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-800 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-[#FFD60A]" />
                <span>Experience Timeline</span>
              </span>

              <div className="relative pl-4 space-y-2.5 before:content-[''] before:absolute before:left-1.5 before:top-1.5 before:bottom-1.5 before:w-[1.5px] before:bg-zinc-200">
                {(currentArtist.timeline || []).slice(0, 4).map((item, i) => (
                  <div key={i} className="relative text-[11px]">
                    <span className="absolute -left-4 top-1 w-2 h-2 rounded-full bg-[#FFD60A] ring-2 ring-white" />
                    <div className="font-bold text-zinc-900">{item.year}</div>
                    <div className="text-zinc-600 leading-tight">{item.title}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-white border-t border-zinc-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={() => setIsLiked(!isLiked)}
            aria-label="Save artist"
            className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
              isLiked
                ? 'bg-rose-50 border-rose-300 text-rose-600'
                : 'bg-zinc-50 border-zinc-300 text-zinc-700 hover:text-black'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={() => {
              onClose();
              onBookAppointment(currentArtist.id);
            }}
            className="flex-1 flex items-center justify-center gap-2 bg-[#FFD60A] hover:bg-[#ffe033] active:scale-[0.98] text-[#0B0B0B] font-bold text-xs sm:text-sm py-2.5 px-4 rounded-xl shadow transition-all cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-[#0B0B0B]" />
            <span>Book Appointment with {currentArtist.name}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
