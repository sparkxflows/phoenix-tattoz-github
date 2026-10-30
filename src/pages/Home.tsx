import React, { useState, useRef, useEffect, lazy, Suspense } from 'react';
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
  Flame,
  Plus 
} from 'lucide-react';
import { STUDIO_INFO } from '../data/studioData';
import { useArtists, useHomeHero } from '../lib/studioContent';
import { LightboxModal } from '../components/LightboxModal';
import { GiftsAndRewardsSection } from '../components/GiftsAndRewardsSection';
import { StudioLegacyStrip } from '../components/StudioLegacyStrip';
import { triggerAuthModal } from '../lib/memberAuth';
import { WhatsAppIcon } from '../components/WhatsAppIcon';

const GiftRewardModal = lazy(() => import('../components/GiftRewardModal').then(m => ({ default: m.GiftRewardModal })));

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
        className="relative overflow-hidden bg-[#090A0D] border-b border-white/[0.08] min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-5rem)] min-h-[calc(100dvh-4rem)] sm:min-h-[calc(100dvh-5rem)] flex items-center justify-center py-6 sm:py-8 md:py-10"
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

        {/* Ambient subtle warm glow behind card */}
        <div className="absolute inset-0 bg-radial-[circle_at_50%_45%,rgba(229,184,66,0.12),transparent_70%] pointer-events-none z-0" />

        {/* Main Hero Container with Curved Layer & Floating Trust Badges */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8 relative z-10 w-full">
          {/* Outer Ambient Glow Container matching user's blue marked layer */}
          <div className="relative mx-auto max-w-5xl">
            {/* Soft Ambient Golden/Amber Halo behind both the card and badges */}
            <div className="absolute -inset-4 sm:-inset-6 rounded-[36px] sm:rounded-[48px] bg-gradient-to-b from-amber-500/25 via-yellow-500/15 to-amber-900/20 blur-2xl opacity-90 pointer-events-none" />

            {/* Responsive Layout: On desktop (md+) Badges float on the side, on mobile they sit below the hero box */}
            <div className="relative flex flex-col md:flex-row items-center justify-center gap-5 sm:gap-6 lg:gap-8">
              
              {/* Floating Trust Badges Column (Matching User's Reference Image) */}
              <div className="order-2 md:order-1 flex flex-row md:flex-col items-center justify-center gap-3.5 sm:gap-4 shrink-0">
                {/* 1. Google Reviews Floating Card */}
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent('Phoenix Tattooz Studio & Academy Hisar')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-36 sm:w-40 lg:w-44 p-3.5 sm:p-4 rounded-2xl bg-[#14161C]/92 backdrop-blur-md border border-amber-500/25 hover:border-amber-400/50 shadow-[0_15px_40px_rgba(0,0,0,0.7),0_0_20px_rgba(255,214,10,0.1)] flex flex-col items-center justify-center text-center hover:scale-105 active:scale-95 transition-all duration-300 group cursor-pointer"
                >
                  {/* Google Icon Circle */}
                  <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-110 transition-transform">
                    <svg viewBox="0 0 24 24" className="w-5 h-5">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" />
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z" />
                      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.94 0 12s.45 3.84 1.25 5.42l4.03-3.15Z" />
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z" />
                    </svg>
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-zinc-400 uppercase">Google Reviews</span>
                  <div className="flex items-center gap-0.5 my-1 text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  </div>
                  <span className="text-xl sm:text-2xl font-black text-white font-serif">4.9</span>
                </a>

                {/* 2. Hygiene & Safety Floating Card */}
                <div className="w-36 sm:w-40 lg:w-44 p-3.5 sm:p-4 rounded-2xl bg-[#14161C]/92 backdrop-blur-md border border-amber-500/25 hover:border-amber-400/50 shadow-[0_15px_40px_rgba(0,0,0,0.7),0_0_20px_rgba(255,214,10,0.1)] flex flex-col items-center justify-center text-center hover:scale-105 transition-all duration-300 group">
                  <div className="w-10 h-10 rounded-full bg-amber-500/15 border border-amber-500/35 flex items-center justify-center mb-1.5 shadow-sm text-[#FFD60A] group-hover:scale-110 transition-transform">
                    <Plus className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-zinc-400 uppercase">Hygiene &amp; Safety</span>
                  <span className="text-[11px] sm:text-xs font-bold tracking-wider text-emerald-400 my-0.5">STERILIZED</span>
                  <span className="text-xl sm:text-2xl font-black text-[#FFD60A] font-serif">100%</span>
                </div>
              </div>

              {/* Main Curved Hero Card Layer (Adjusted snugly to buttons) */}
              <div className="order-1 md:order-2 relative flex-1 max-w-2xl lg:max-w-3xl rounded-[28px] sm:rounded-[36px] bg-[#121418]/92 backdrop-blur-md border border-amber-500/30 shadow-[0_20px_70px_rgba(0,0,0,0.85),0_0_60px_rgba(255,214,10,0.18)] p-6 sm:p-9 md:p-11 text-center overflow-hidden">
                {/* Subtle top golden light rim */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent pointer-events-none" />

                {/* Stately Headline */}
                <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight uppercase leading-[1.08] drop-shadow-md max-w-2xl mx-auto">
                  INK YOUR STORY
                </h1>

                {/* Subtitle */}
                <h2 className="font-serif text-base sm:text-xl font-bold text-amber-200/90 tracking-wide mt-2 sm:mt-3">
                  {heroSettings.studioSubheading || 'Phoenix Tattooz Studio & Academy'}
                </h2>

                {/* Body Narrative */}
                <p className="text-zinc-300 text-xs sm:text-sm md:text-base leading-relaxed mt-3 sm:mt-4 max-w-xl mx-auto font-light">
                  {heroSettings.heroDescription || 'Custom tattoos. Professional artistry. A space where creativity meets expression. Located in Hisar, Haryana.'}
                </p>

                {/* Action Row - 3 Buttons matching reference mockup */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6 sm:mt-8 max-w-xl mx-auto">
                  <button
                    onClick={() => onOpenBooking()}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#FFD60A] hover:bg-[#ffe033] hover:scale-105 active:scale-95 text-black font-extrabold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/35 transition-all duration-300 cursor-pointer"
                  >
                    <Calendar className="w-4 h-4 text-black stroke-[2.5]" />
                    <span>Book Appointment 📅</span>
                  </button>

                  <a
                    href="https://wa.me/919992969919"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#181A20] hover:bg-[#20232A] hover:scale-105 active:scale-95 border border-white/10 hover:border-emerald-500/50 text-white font-semibold text-xs sm:text-sm px-5 py-3 rounded-xl transition-all duration-300 shadow-md"
                  >
                    <WhatsAppIcon className="w-4 h-4 text-emerald-400" />
                    <span>Book on WhatsApp</span>
                  </a>

                  <a
                    href={`tel:${STUDIO_INFO.phone}`}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#181A20] hover:bg-[#20232A] hover:scale-105 active:scale-95 border border-white/10 hover:border-amber-400/40 text-white font-semibold text-xs sm:text-sm px-5 py-3 rounded-xl transition-all duration-300 shadow-md"
                  >
                    <Phone className="w-4 h-4 text-[#FFD60A]" />
                    <span>Book on Call</span>
                  </a>
                </div>
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

              {/* Two Studio Addresses */}
              <div className="space-y-4 pt-1">
                {/* Branch 1 - Highlighted Main Branch in Yellow */}
                <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-amber-500/10 border border-[#FFD60A]/40 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-[#FFD60A] shrink-0 mt-0.5">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-[#FFD60A]">Branch 1 &bull; Red Square Market</h4>
                      <span className="text-[10px] font-bold bg-[#FFD60A] text-black px-2 py-0.5 rounded shadow-sm">Main Branch</span>
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-200 mt-1 leading-relaxed">
                      {STUDIO_INFO.address}
                    </p>
                  </div>
                </div>

                {/* Branch 2 - Plain and clean in White */}
                <div className="flex items-start gap-3.5 pt-1">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800/70 border border-zinc-700/60 flex items-center justify-center text-white shrink-0 mt-0.5">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-white">Branch 2 &bull; Silver Square Mall</h4>
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-300 mt-1 leading-relaxed">
                      {STUDIO_INFO.address2}
                    </p>
                  </div>
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

      {/* Gifts & Rewards 15% Discount Modal (Loads on demand) */}
      {rewardModalOpen && (
        <Suspense fallback={null}>
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
        </Suspense>
      )}
    </div>
  );
};
