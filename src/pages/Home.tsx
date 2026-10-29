import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  MapPin, 
  Phone, 
  Clock, 
  CheckCircle,
  Star,
  GraduationCap,
  MessageCircle,
  PenTool,
  Heart,
  Flame
} from 'lucide-react';
import { STUDIO_INFO } from '../data/studioData';
import { useArtists, useHomeHero } from '../lib/studioContent';
import { LightboxModal } from '../components/LightboxModal';
import { GiftsAndRewardsSection } from '../components/GiftsAndRewardsSection';
import { GiftRewardModal } from '../components/GiftRewardModal';
import { StudioLegacyStrip } from '../components/StudioLegacyStrip';
import { triggerAuthModal } from '../lib/memberAuth';
import { WhatsAppIcon } from '../components/WhatsAppIcon';

interface HomeProps {
  onOpenBooking: (artistId?: string, serviceId?: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onOpenBooking }) => {
  const artists = useArtists();
  const heroSettings = useHomeHero();
  const [selectedLightboxItem, setSelectedLightboxItem] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const PRIMARY_VIDEO_URL = '/uploads/studio_bg_video.mp4';
  const LOCAL_VIDEO_URL = '/uploads/studio_bg_video.mp4';

  const [activeVideoSrc, setActiveVideoSrc] = useState<string>(() => {
    if (heroSettings.bgVideoUrl && !heroSettings.bgVideoUrl.includes('1793020241737')) {
      return heroSettings.bgVideoUrl;
    }
    return PRIMARY_VIDEO_URL;
  });

  useEffect(() => {
    if (heroSettings.bgVideoUrl) {
      if (heroSettings.bgVideoUrl.includes('1793020241737')) {
        setActiveVideoSrc(PRIMARY_VIDEO_URL);
      } else {
        setActiveVideoSrc(heroSettings.bgVideoUrl);
      }
    }
  }, [heroSettings.bgVideoUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeVideoSrc || heroSettings.bgMediaType === 'image') return;
    video.defaultMuted = true;
    video.muted = true;

    // IntersectionObserver: automatically pause video when user scrolls away to save CPU/battery
    let observer: IntersectionObserver | null = null;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const playPromise = video.play();
              if (playPromise !== undefined) playPromise.catch(() => {});
            } else {
              video.pause();
            }
          });
        },
        { threshold: 0.15 }
      );
      observer.observe(video);
    } else {
      const playPromise = video.play();
      if (playPromise !== undefined) playPromise.catch(() => {});
    }

    return () => {
      if (observer) observer.disconnect();
    };
  }, [activeVideoSrc, heroSettings.bgMediaType]);

  // Gifts & Rewards Modal State
  const [rewardModalOpen, setRewardModalOpen] = useState(false);
  const [rewardModalTab, setRewardModalTab] = useState<'birthday' | 'referral'>('birthday');

  const handleOpenRewardModal = (tab: 'birthday' | 'referral' = 'birthday') => {
    setRewardModalTab(tab);
    setRewardModalOpen(true);
  };

  return (
    <div className="bg-[#090A0D] text-zinc-100 min-h-screen">
      {/* 1. HERO SECTION */}
      <section 
        id="hero"
        className="relative overflow-hidden bg-[#090A0D] border-b border-white/[0.08] min-h-[640px] md:min-h-[760px] flex items-center justify-center"
      >
        {/* Layer 0: Full-Cover Looping Background Video */}
        {heroSettings.bgMediaType !== 'image' && activeVideoSrc && (
          <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
            <video
              ref={videoRef}
              key={activeVideoSrc}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              poster={heroSettings.bgVideoPoster || heroSettings.heroImage}
              onError={() => {
                if (activeVideoSrc !== LOCAL_VIDEO_URL) {
                  setActiveVideoSrc(LOCAL_VIDEO_URL);
                }
              }}
              className="absolute inset-0 w-full h-full object-cover"
              src={activeVideoSrc}
            >
              <source src={activeVideoSrc} type="video/mp4" />
            </video>
            {/* Dark contrast scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#090A0D] via-[#090A0D]/75 to-[#090A0D]/60 pointer-events-none" />
          </div>
        )}

        {/* Ambient subtle warm glow */}
        <div className="absolute inset-0 bg-radial-[circle_at_50%_40%,rgba(229,184,66,0.06),transparent_65%] pointer-events-none z-0" />

        {/* Main Hero Container */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10 w-full text-center">
          {/* Stately Headline */}
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight uppercase leading-[1.08] drop-shadow-md max-w-4xl mx-auto">
            INK YOUR STORY
          </h1>

          {/* Subtitle */}
          <h2 className="font-serif text-lg sm:text-2xl font-bold text-amber-200/90 tracking-wide mt-3 sm:mt-4">
            {heroSettings.studioSubheading || 'Wear Your Story, Leave the Rest Behind.'}
          </h2>

          {/* Body Narrative */}
          <p className="text-zinc-300 text-sm sm:text-base leading-relaxed mt-4 max-w-2xl mx-auto">
            {heroSettings.heroDescription || 'Premier custom tattoos, certified sterilization, and professional artistry in Hisar, Haryana. Where imagination transforms into timeless body art.'}
          </p>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mt-8 max-w-md mx-auto">
            <button
              onClick={() => onOpenBooking()}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#FFD60A] hover:bg-[#ffe033] hover:scale-105 active:scale-95 text-black font-extrabold text-sm sm:text-base px-7 py-3.5 rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/35 transition-all duration-300 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-black stroke-[2.5]" />
              <span>Book Appointment</span>
            </button>

            <a
              href="https://wa.me/919992969919"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#121418]/90 hover:bg-[#1A1D24] hover:scale-105 active:scale-95 border border-white/10 hover:border-emerald-500/50 text-white font-semibold text-sm sm:text-base px-6 py-3.5 rounded-xl transition-all duration-300 shadow-md hover:shadow-emerald-950/40"
            >
              <WhatsAppIcon className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp Us</span>
            </a>
          </div>

          {/* Clean Google Rating & 100% Sterile Verification Strip */}
          <div className="mt-10 max-w-2xl mx-auto">
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent('Phoenix Tattooz Studio & Academy Hisar')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#121418] border border-white/10 hover:border-amber-400/40 hover:scale-105 transition-all duration-300 text-zinc-300 hover:text-white shadow-sm"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z" />
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.94 0 12s.45 3.84 1.25 5.42l4.03-3.15Z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z" />
                </svg>
                <span className="font-bold text-white">4.9 ★</span>
                <span className="text-zinc-400">Google Rating (500+ Reviews)</span>
              </a>

              <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#121418] border border-white/10 hover:border-emerald-400/30 hover:scale-105 transition-all duration-300 text-zinc-300 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-emerald-400">100% Sterile</span>
                <span className="text-zinc-400">Single-Use Needles</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STUDIO BRAND LEGACY & RECENT WORKS */}
      <div id="experience">
        <StudioLegacyStrip onOpenBooking={onOpenBooking} />
      </div>

      {/* 3. GIFTS & REWARDS SECTION */}
      <GiftsAndRewardsSection 
        onOpenClaimModal={handleOpenRewardModal} 
        onRequestAuth={(mode, title, subtitle, afterTab) => {
          triggerAuthModal({
            mode,
            title,
            subtitle,
            afterTab: afterTab || 'birthday',
          });
        }}
      />

      {/* 4. STUDIO LOCATION & MAP (No Form, No Box Wrappers) */}
      <section id="contact" className="py-16 sm:py-24 bg-[#090A0D] border-t border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            {/* Direct Studio Location & Contact Details */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-0.5 bg-[#FFD60A]" />
                  <span className="text-xs font-bold uppercase tracking-widest text-[#FFD60A]">
                    STUDIO LOCATION
                  </span>
                </div>
                <h3 className="font-serif text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Visit Phoenix Tattooz
                </h3>
                <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
                  Located at Red Square Market, Hisar. Welcoming clients for custom tattoos, sterile piercings, laser removal, and professional academy admissions.
                </p>
              </div>

              {/* Address */}
              <div className="flex items-start gap-3.5 pt-2">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#FFD60A] shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Address</h4>
                  <p className="text-xs sm:text-sm text-zinc-300 mt-1 leading-relaxed">
                    {STUDIO_INFO.address}
                  </p>
                </div>
              </div>

              {/* Working Hours */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#FFD60A] shrink-0 mt-0.5">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Studio Hours</h4>
                  <p className="text-xs sm:text-sm text-zinc-300 mt-1">
                    {STUDIO_INFO.hours} <span className="text-[#FFD60A] font-semibold">(Open All 7 Days)</span>
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#FFD60A] shrink-0 mt-0.5">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Direct Phone Support</h4>
                  <a
                    href={`tel:${STUDIO_INFO.phone}`}
                    className="text-xs sm:text-sm text-zinc-300 hover:text-[#FFD60A] transition-colors mt-1 block font-mono"
                  >
                    {STUDIO_INFO.displayPhone || STUDIO_INFO.phone}
                  </a>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <a
                  href="https://maps.google.com/maps?q=Red+Square+Market+Hisar+Haryana"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#FFD60A] hover:bg-[#ffe033] text-black font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all shadow-md shadow-amber-500/15"
                >
                  <MapPin className="w-4 h-4 text-black" />
                  <span>Get Directions on Google Maps</span>
                </a>

                <a
                  href={`https://wa.me/${STUDIO_INFO.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#14161C] hover:bg-[#1A1D24] border border-white/10 hover:border-emerald-500/40 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all"
                >
                  <WhatsAppIcon className="w-4 h-4 text-emerald-400" />
                  <span>WhatsApp Studio</span>
                </a>
              </div>
            </div>

            {/* Seamless Interactive Google Map (No container box) */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-zinc-950 aspect-[16/10] sm:aspect-[16/9] min-h-[360px]">
                <iframe
                  title="Phoenix Tattooz Hisar Location Map"
                  src="https://maps.google.com/maps?q=Red+Square+Market+Hisar+Haryana&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  className="w-full h-full min-h-[360px] border-0"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      <LightboxModal
        item={selectedLightboxItem}
        isOpen={Boolean(selectedLightboxItem)}
        onClose={() => setSelectedLightboxItem(null)}
        onBookAppointment={() => {
          setSelectedLightboxItem(null);
          onOpenBooking();
        }}
      />

      {/* Gifts & Rewards 15% Discount Modal */}
      <GiftRewardModal
        isOpen={rewardModalOpen}
        onClose={() => setRewardModalOpen(false)}
        initialTab={rewardModalTab}
        onOpenBooking={() => onOpenBooking()}
        onRequestAuth={(mode, title, subtitle) => {
          setRewardModalOpen(false);
          triggerAuthModal({
            mode,
            title,
            subtitle,
            afterTab: rewardModalTab,
          });
        }}
      />
    </div>
  );
};
