import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Star, ArrowRight, Calendar, User, Sparkles } from 'lucide-react';
import { Artist } from '../data/studioData';
import { useArtists } from '../lib/studioContent';
import { FeaturedArtistModal } from '../components/FeaturedArtistModal';

interface ArtistsProps {
  onOpenBooking: (artistId?: string) => void;
}

export const Artists: React.FC<ArtistsProps> = ({ onOpenBooking }) => {
  const artists = useArtists();
  const [activeCategory, setActiveCategory] = useState('All');
  const [modalArtist, setModalArtist] = useState<Artist | null>(null);

  const categories = [
    'All',
    'Realism',
    'Black & Grey',
    'Fine Line',
    'Traditional',
    'Neo Traditional',
    'Japanese',
    'Minimal',
    'Custom',
  ];

  const filteredArtists = useMemo(() => {
    if (activeCategory === 'All') return artists;
    const catLower = (activeCategory || '').toLowerCase();
    return artists.filter((artist) =>
      (artist.specialties || []).some(
        (s) => (s || '').toLowerCase().includes(catLower)
      )
    );
  }, [artists, activeCategory]);

  return (
    <div className="bg-[#0B0B0B] text-zinc-200 min-h-screen pb-20 md:pb-24">
      {/* 1. DARK HERO */}
      <section className="relative overflow-hidden bg-[#0B0B0B] border-b border-[#222222] py-12 sm:py-24">
        {/* Atmospheric background */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity pointer-events-none"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=1600&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0B] via-[#0B0B0B]/90 to-[#0B0B0B]/70 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-8 space-y-3 sm:space-y-4 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="w-6 h-0.5 bg-[#FFD60A]" />
                <span className="text-xs font-bold uppercase tracking-widest text-[#FFD60A]">
                  OUR ARTISTS
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight">
                Meet Our Tattoo Artists
              </h1>

              <p className="text-sm sm:text-lg font-medium text-zinc-300">
                Skilled. Creative. Passionate.
              </p>

              <p className="text-xs sm:text-base text-zinc-400 max-w-2xl leading-relaxed">
                Explore our team of talented tattoo artists, each with their own unique style and story. Find the artist who matches your vision.
              </p>
            </div>

            {/* Right side slogan */}
            <div className="lg:col-span-4 flex flex-col items-center lg:items-end justify-center text-center lg:text-right">
              <div className="relative">
                <span className="font-script text-2xl sm:text-4xl lg:text-5xl text-[#FFD60A] font-bold block drop-shadow-md leading-tight">
                  Different Styles
                </span>
                <span className="font-script text-2xl sm:text-4xl lg:text-5xl text-[#FFD60A] font-bold block drop-shadow-md leading-tight -mt-1">
                  Same Passion
                </span>
                <div className="flex items-center justify-center lg:justify-end gap-1.5 text-[11px] text-zinc-400 font-mono tracking-widest uppercase mt-2">
                  <span>Crown Quality &bull; Phoenix Hisar</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FILTER CHIPS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-4 sm:pb-6">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-[#FFD60A] text-black font-bold shadow-md shadow-yellow-500/10'
                  : 'bg-[#181818] text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* 3. ARTISTS GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredArtists.map((artist) => (
            <div
              key={artist.id}
              className="bg-[#141414] rounded-2xl border border-zinc-800/80 overflow-hidden shadow-lg hover:border-zinc-700 hover:shadow-2xl transition-all duration-300 flex flex-col group"
            >
              {/* Photo */}
              <div className="relative aspect-[4/5] bg-black overflow-hidden">
                <img
                  src={artist.image || 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=800&q=80'}
                  alt={artist.name}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent opacity-90" />
                
                {/* Featured indicator for Rohit */}
                {artist.id === 'rohit-sharma' && (
                  <div className="absolute top-3 left-3 bg-[#FFD60A] text-black text-[10px] font-extrabold px-2.5 py-1 rounded shadow uppercase tracking-wider">
                    Lead Artist
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-serif font-bold text-xl text-white">
                    {artist.name}
                  </h3>
                  <p className="text-xs font-medium text-zinc-400 mt-0.5">
                    {(artist.specialties || ['Custom Design', 'Realism']).slice(0, 2).join(' | ')}
                  </p>

                  {/* Rating */}
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="flex text-[#FFD60A] text-xs">
                      {'★★★★★'.split('').map((star, i) => (
                        <span key={i} className="text-[#FFD60A]">★</span>
                      ))}
                    </div>
                    <span className="text-xs font-bold text-white">
                      {artist.rating}
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      ({artist.reviewCount} reviews)
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-2 border-t border-zinc-800">
                  <button
                    onClick={() => setModalArtist(artist)}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>View Profile</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#FFD60A]" />
                  </button>

                  <div className="flex items-center gap-2">
                    {artist.id === 'rohit-sharma' && (
                      <Link
                        to="/artists/rohit-sharma"
                        className="flex-1 text-center bg-transparent border border-zinc-700 hover:border-zinc-500 text-zinc-300 text-[11px] py-2 rounded-lg transition-colors"
                      >
                        Detailed Story
                      </Link>
                    )}
                    <button
                      onClick={() => onOpenBooking(artist.id)}
                      className="flex-1 bg-[#FFD60A] hover:bg-[#ffe033] text-black font-bold text-[11px] py-2 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Calendar className="w-3 h-3 text-black" />
                      <span>Book</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Artist Modal */}
      <FeaturedArtistModal
        artist={modalArtist}
        isOpen={Boolean(modalArtist)}
        onClose={() => setModalArtist(null)}
        onBookAppointment={(artistId) => {
          setModalArtist(null);
          onOpenBooking(artistId);
        }}
      />
    </div>
  );
};
