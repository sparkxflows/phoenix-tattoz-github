import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Award, 
  Users, 
  Star, 
  ShieldCheck, 
  Calendar, 
  ArrowRight, 
  Eye, 
  Sparkles, 
  GraduationCap, 
  PenTool, 
  Flower2, 
  Disc, 
  CheckCircle2, 
  Phone, 
  MapPin, 
  Clock 
} from 'lucide-react';
import { STUDIO_INFO, SERVICES, CERTIFICATIONS } from '../data/studioData';
import { useArtists, useAboutContent } from '../lib/studioContent';
import { PhoenixLogo } from '../components/PhoenixLogo';

interface AboutProps {
  onOpenBooking: (artistId?: string, serviceId?: string) => void;
}

export const About: React.FC<AboutProps> = ({ onOpenBooking }) => {
  const artists = useArtists();
  const aboutSettings = useAboutContent();
  const rohit = artists.find((a) => a.id === 'rohit-sharma') || artists[0];

  return (
    <div className="bg-[#090A0D] text-zinc-100 min-h-screen pb-16 md:pb-0">
      {/* 1. DARK HERO SECTION */}
      <section className="relative overflow-hidden bg-[#0B0B0B] text-white py-20 sm:py-28 lg:py-32 border-b border-[#222222]">
        {/* Background photographic overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity pointer-events-none"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=1600&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0B] via-[#0B0B0B]/90 to-[#0B0B0B]/60 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-8 space-y-5">
              <span className="font-script text-3xl sm:text-4xl text-[#FFD60A] block tracking-wide">
                About Us
              </span>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
                Phoenix Tattooz
                <br />
                <span className="text-[#FFD60A]">Studio &amp; Academy</span>
              </h1>

              <div className="tracking-[0.25em] text-xs sm:text-sm font-semibold text-zinc-300 uppercase">
                ART &nbsp;/&nbsp; EXPRESSION &nbsp;/&nbsp; LIFESTYLE
              </div>

              <p className="text-zinc-300 text-sm sm:text-base max-w-xl leading-relaxed pt-1">
                {aboutSettings.aboutHeroDescription}
              </p>
            </div>

            {/* Right side slogan */}
            <div className="lg:col-span-4 flex flex-col items-center lg:items-end justify-center text-center lg:text-right">
              <div className="space-y-1">
                <span className="font-script text-4xl sm:text-5xl lg:text-6xl text-[#FFD60A] font-bold block drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] leading-tight">
                  {aboutSettings.aboutHeroTagline || 'Your Story'}
                </span>
                <div className="w-28 h-1 bg-[#FFD60A] mx-auto lg:ml-auto lg:mr-0 mt-3 rounded-full opacity-80" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT ALL BEGAN (OUR STORY) */}
      <section className="py-20 sm:py-28 bg-[#0D0E12] border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Narrative */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-0.5 bg-[#FFD60A]" />
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                    OUR STORY
                  </span>
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
                  {aboutSettings.aboutStoryHeading}
                </h2>
              </div>

              <div className="space-y-4 text-zinc-300 text-sm sm:text-base leading-relaxed">
                <p>
                  {aboutSettings.aboutStoryParagraph1}
                </p>
                <p>
                  {aboutSettings.aboutStoryParagraph2}
                </p>
              </div>

              <div className="pt-2">
                <div className="font-script text-3xl text-white font-bold">
                  {aboutSettings.aboutStoryTagline}
                </div>
                <div className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
                  Studio &amp; Academy
                </div>
              </div>
            </div>

            {/* Center: Studio Photo with Yellow Offset Frame */}
            <div className="lg:col-span-4 relative">
              <div className="relative mx-auto max-w-sm">
                {/* Yellow offset background plate */}
                <div className="absolute inset-0 bg-[#FFD60A] rounded-2xl transform translate-x-3 translate-y-3 sm:translate-x-4 sm:translate-y-4" />
                
                {/* Photo container */}
                <div className="relative rounded-2xl overflow-hidden shadow-xl border-2 border-zinc-900 bg-zinc-900 aspect-[4/5]">
                  <img
                    src={aboutSettings.aboutStoryImage}
                    alt={aboutSettings.aboutStoryHeading}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-zinc-700">
                    <span className="text-[11px] font-bold text-[#FFD60A] tracking-wider uppercase">
                      {aboutSettings.aboutStoryImageBadge}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: 4 Stat Cards */}
            <div className="lg:col-span-3 grid grid-cols-2 lg:grid-cols-1 gap-2.5 sm:gap-4">
              {/* Stat 1 */}
              <div className="p-3 sm:p-4 rounded-xl bg-[#13151A] border border-white/[0.08]/90 shadow-sm flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-[#FFD60A]/20 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <div className="text-lg sm:text-xl font-bold font-serif text-white">8+</div>
                  <div className="text-[11px] sm:text-xs font-semibold text-zinc-200">Years of Excellence</div>
                  <div className="text-[10px] sm:text-[11px] text-zinc-500">Since 2019</div>
                </div>
              </div>

              {/* Stat 2 */}
              <div className="p-3 sm:p-4 rounded-xl bg-[#13151A] border border-white/[0.08]/90 shadow-sm flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-[#FFD60A]/20 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <div className="text-lg sm:text-xl font-bold font-serif text-white">5000+</div>
                  <div className="text-[11px] sm:text-xs font-semibold text-zinc-200">Happy Clients</div>
                  <div className="text-[10px] sm:text-[11px] text-zinc-500">And counting...</div>
                </div>
              </div>

              {/* Stat 3 */}
              <div className="p-3 sm:p-4 rounded-xl bg-[#13151A] border border-white/[0.08]/90 shadow-sm flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-[#FFD60A]/20 flex items-center justify-center shrink-0">
                  <Star className="w-5 h-5 sm:w-6 sm:h-6 text-[#FFD60A] fill-[#FFD60A]" />
                </div>
                <div>
                  <div className="text-lg sm:text-xl font-bold font-serif text-white">4.9</div>
                  <div className="text-[11px] sm:text-xs font-semibold text-zinc-200">Client Rating</div>
                  <div className="flex text-[#FFD60A] text-xs justify-center sm:justify-start">★★★★★</div>
                </div>
              </div>

              {/* Stat 4 */}
              <div className="p-3 sm:p-4 rounded-xl bg-[#13151A] border border-white/[0.08]/90 shadow-sm flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-[#FFD60A]/20 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <div className="text-lg sm:text-xl font-bold font-serif text-white">100%</div>
                  <div className="text-[11px] sm:text-xs font-semibold text-zinc-200">Hygiene &amp; Safety</div>
                  <div className="text-[10px] sm:text-[11px] text-zinc-500">Sterilized &amp; Clean</div>
                </div>
              </div>

              <div className="col-span-2 lg:col-span-1 pt-2 text-center lg:text-left">
                <span className="font-script text-xl sm:text-2xl text-zinc-200 block">
                  {aboutSettings.aboutStorySlogan}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. OUR SERVICES (WHAT WE DO) - DARK SECTION */}
      <section className="py-20 sm:py-28 bg-[#0B0B0B] text-white border-y border-[#1F1F1F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-0.5 bg-[#FFD60A]" />
                <span className="text-xs font-bold uppercase tracking-widest text-[#FFD60A]">
                  WHAT WE DO
                </span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
                Our Services
              </h2>
              <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mt-2 leading-relaxed">
                From traditional tattoos to advanced cosmetic procedures, we offer a wide range of services to help you look, feel and express your best self.
              </p>
            </div>

            <button
              onClick={() => onOpenBooking()}
              className="inline-flex items-center gap-2 bg-[#FFD60A] hover:bg-[#ffe033] text-black font-bold text-sm px-6 py-3 rounded-lg shadow-md transition-all self-start md:self-auto cursor-pointer"
            >
              <span>Explore All Services</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </button>
          </div>

          {/* 6 Services Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((s) => {
              const renderIcon = () => {
                switch (s.icon) {
                  case 'needle': return <PenTool className="w-6 h-6 text-black" />;
                  case 'eye': return <Eye className="w-6 h-6 text-black" />;
                  case 'lotus': return <Flower2 className="w-6 h-6 text-black" />;
                  case 'sparkles': return <Sparkles className="w-6 h-6 text-black" />;
                  case 'academy': return <GraduationCap className="w-6 h-6 text-black" />;
                  case 'piercing': return <Disc className="w-6 h-6 text-black" />;
                  default: return <Sparkles className="w-6 h-6 text-black" />;
                }
              };

              return (
                <div
                  key={s.id}
                  className="bg-[#141414] hover:bg-[#181818] p-7 rounded-2xl border border-zinc-800/80 shadow-md hover:border-zinc-700 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-full bg-[#FFD60A] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                      {renderIcon()}
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-lg text-white tracking-wide uppercase">
                        {s.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed">
                        {s.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 mt-4 border-t border-zinc-800/60 flex items-center justify-between">
                    <span className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider">
                      {s.subtitle}
                    </span>
                    <button
                      onClick={() => onOpenBooking(undefined, s.id)}
                      className="text-xs text-[#FFD60A] font-semibold hover:underline cursor-pointer"
                    >
                      Book &rarr;
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. EXPERIENCE BUILDS TRUST + MEET ROHIT SHARMA + CERTIFICATIONS */}
      <section className="py-20 sm:py-28 bg-[#0D0E12] border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
            {/* Col 1: Experience That Builds Trust */}
            <div className="lg:col-span-4 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-0.5 bg-[#FFD60A]" />
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                    OUR EXPERIENCE
                  </span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Experience That
                  <br />
                  Builds Trust
                </h2>
              </div>

              <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
                With over 8+ years of experience, we have worked with 5000+ clients and completed thousands of tattoos, cosmetic procedures and training sessions. Our team follows international safety standards and the latest techniques to ensure the best results.
              </p>

              {/* 3 Stats Row */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-[#13151A] p-3 rounded-lg border border-white/[0.08] text-center">
                  <div className="text-base font-bold text-white font-serif">8+</div>
                  <div className="text-[10px] text-zinc-500 uppercase">Years</div>
                </div>
                <div className="bg-[#13151A] p-3 rounded-lg border border-white/[0.08] text-center">
                  <div className="text-base font-bold text-white font-serif">5000+</div>
                  <div className="text-[10px] text-zinc-500 uppercase">Clients</div>
                </div>
                <div className="bg-[#13151A] p-3 rounded-lg border border-white/[0.08] text-center">
                  <div className="text-base font-bold text-white font-serif">4.9</div>
                  <div className="text-[10px] text-zinc-500 uppercase">Rating</div>
                </div>
              </div>
            </div>

            {/* Col 2: Meet the Owner Rohit Sharma */}
            <div className="lg:col-span-5 space-y-5 lg:px-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-0.5 bg-[#FFD60A]" />
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                    MEET THE OWNER
                  </span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Rohit Sharma
                </h2>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Founder &amp; Lead Artist
                </p>
              </div>

              <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
                Rohit is a passionate tattoo artist with a unique style that blends creativity, precision and deep meaning. He specializes in custom tattoos, black &amp; grey realism, and intricate designs that tell a story. His vision and commitment to quality and detail have made Phoenix Tattooz a trusted name in Hisar.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-5 pt-1">
                {/* Rohit photo with yellow offset frame */}
                <div className="relative shrink-0">
                  <div className="absolute inset-0 bg-[#FFD60A] rounded-xl transform translate-x-2.5 translate-y-2.5" />
                  <div className="relative w-36 h-36 rounded-xl overflow-hidden border-2 border-zinc-900 bg-black">
                    <img
                      src={rohit.image}
                      alt="Rohit Sharma tattooing in studio"
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="font-script text-xl text-white italic font-medium leading-snug">
                    “Art is not just what I do, it's who I am.”
                  </p>
                  <p className="text-xs text-zinc-500 font-medium">
                    &mdash; Rohit Sharma
                  </p>
                  <Link
                    to="/artists/rohit-sharma"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-white hover:text-black border-b border-[#FFD60A]"
                  >
                    <span>View Full Profile</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Col 3: Certifications & Training */}
            <div className="lg:col-span-3 space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-0.5 bg-[#FFD60A]" />
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                    CERTIFICATIONS &amp; TRAINING
                  </span>
                </div>
              </div>

              <div className="space-y-3.5">
                {CERTIFICATIONS.map((cert, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#FFD60A]/20 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white leading-snug">
                        {cert.title}
                      </h4>
                      <p className="text-[11px] text-zinc-500">
                        ({cert.location})
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-white/[0.08]">
                <span className="font-script text-2xl text-[#FFD60A] font-bold block drop-shadow-sm text-center">
                  Skilled | Certified | Trusted
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. MEET OUR RESIDENT ARTISTS */}
      <section id="artists" className="py-20 sm:py-28 bg-[#090A0D] border-t border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="w-6 h-0.5 bg-[#FFD60A]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#FFD60A]">
                STUDIO ARTISTS
              </span>
              <span className="w-6 h-0.5 bg-[#FFD60A]" />
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              Meet Our Artists
            </h2>
            <p className="text-sm text-zinc-400 mt-2 max-w-xl mx-auto leading-relaxed">
              Award-winning resident tattooists and educators. Each brings decades of dedication, anatomical intuition, and international hygiene ethics.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {artists.map((artist) => (
              <div
                key={artist.id}
                className="bg-[#121418] rounded-2xl border border-white/[0.08] hover:border-amber-400/40 overflow-hidden shadow-xl transition-all duration-300 flex flex-col group"
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
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121418] via-transparent to-transparent opacity-90" />
                  
                  {artist.id === 'rohit-sharma' && (
                    <div className="absolute top-3 left-3 bg-[#FFD60A] text-black text-[10px] font-extrabold px-2.5 py-1 rounded shadow uppercase tracking-wider">
                      Lead Artist
                    </div>
                  )}

                  <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-[11px] font-bold text-[#FFD60A] flex items-center gap-1 border border-white/10">
                    <Star className="w-3 h-3 fill-[#FFD60A]" />
                    <span>{artist.rating || 4.9}</span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-serif font-bold text-lg text-white">
                      {artist.name}
                    </h3>
                    <p className="text-xs font-medium text-amber-300/80 mt-0.5">
                      {artist.role || 'Resident Artist'}
                    </p>
                    <p className="text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                      {artist.bio || 'Premier tattoo specialist in Hisar.'}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {(artist.specialties || ['Custom Inks', 'Realism']).slice(0, 2).map((spec) => (
                        <span
                          key={spec}
                          className="bg-zinc-800/80 border border-zinc-700/60 text-zinc-300 text-[10px] font-medium px-2 py-0.5 rounded"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-zinc-800/80 flex items-center gap-2">
                    <Link
                      to={artist.id === 'rohit-sharma' ? '/artists/rohit-sharma' : '/artists'}
                      className="flex-1 py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold text-center transition-colors"
                    >
                      Portfolio
                    </Link>
                    <button
                      type="button"
                      onClick={() => onOpenBooking(artist.id)}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#FFD60A] hover:bg-[#ffe033] text-black text-xs font-bold text-center transition-colors cursor-pointer"
                    >
                      Book Artist
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. BOTTOM CTA BANNER: "Ink It Your Way" */}
      <section className="bg-[#0B0B0B] text-white py-12 border-t border-[#1F1F1F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <PhoenixLogo size={56} />
              <div>
                <div className="font-serif font-bold text-lg text-white">
                  Phoenix Tattooz Studio &amp; Academy
                </div>
                <div className="text-xs text-zinc-400">
                  Hisar, Haryana
                </div>
              </div>
            </div>

            <div className="text-center">
              <span className="font-script text-3xl sm:text-4xl text-[#FFD60A] font-bold">
                Ink It Your Way
              </span>
            </div>

            <div>
              <button
                onClick={() => onOpenBooking()}
                className="flex items-center gap-2 bg-[#FFD60A] hover:bg-[#ffe033] text-black font-bold text-sm px-7 py-3 rounded-lg shadow-md transition-all cursor-pointer"
              >
                <span>Book Appointment</span>
                <Calendar className="w-4 h-4 text-black" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
