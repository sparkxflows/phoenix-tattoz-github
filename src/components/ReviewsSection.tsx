import React, { useState } from 'react';
import { 
  Star, 
  MessageSquare, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Heart, 
  Filter, 
  Plus, 
  Award, 
  Quote, 
  ChevronRight,
  ExternalLink,
  BookOpen,
  Image as ImageIcon,
  Video as VideoIcon,
  Play,
  X,
  Maximize2
} from 'lucide-react';
import { 
  useCustomerReviews, 
  useStudioPhilosophy, 
  CustomerReview 
} from '../lib/studioContent';
import { SubmitReviewModal } from './SubmitReviewModal';

interface ReviewsSectionProps {
  onOpenBooking?: (artistId?: string, serviceId?: string) => void;
  showAllInitially?: boolean;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ onOpenBooking, showAllInitially = false }) => {
  const reviews = useCustomerReviews();
  const philosophy = useStudioPhilosophy();

  const [activeTab, setActiveTab] = useState<'reviews' | 'philosophy'>('reviews');
  const [serviceFilter, setServiceFilter] = useState<string>('All');
  const [modalOpen, setModalOpen] = useState(false);

  // Active Lightbox Media State
  const [activeMedia, setActiveMedia] = useState<{
    type: 'image' | 'video';
    url: string;
    reviewTitle?: string;
    reviewerName?: string;
  } | null>(null);

  // Only display reviews approved by admin
  const approvedReviews = reviews.filter((r) => r.approved !== false);

  // Compute average rating based on approved reviews safely
  const averageRating = (
    approvedReviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0) / (approvedReviews.length || 1)
  ).toFixed(1);

  // Filter reviews safely
  const filteredReviews = approvedReviews.filter((r) => {
    if (serviceFilter === 'All') return true;
    if (serviceFilter === 'Media') return (Array.isArray(r.images) && r.images.length > 0) || (Array.isArray(r.videos) && r.videos.length > 0);
    const s = String(r.service || (r as any).tattooType || '').toLowerCase();
    if (serviceFilter === 'Tattoos') return s.includes('tattoo') || s.includes('cover') || s.includes('sleeve') || s.includes('realism');
    if (serviceFilter === 'Cosmetic') return s.includes('cosmetic') || s.includes('piercing');
    if (serviceFilter === 'Academy') return s.includes('academy');
    return true;
  });

  return (
    <section id="reviews" className="py-20 sm:py-28 bg-[#0D0D0D] text-zinc-100 relative overflow-hidden border-t border-[#1C1C1C]">
      {/* Background ambient gold aura (Subtle, No Overglow) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-amber-500/[0.03] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        
        {/* Top Header & Overview */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFD60A]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#FFD60A]">
                {philosophy.badge || 'CLIENT EXPERIENCES & PHILOSOPHY'}
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              Client Reviews &amp; Studio Views
            </h2>
            <p className="text-xs sm:text-base text-zinc-400 mt-2 max-w-2xl leading-relaxed">
              Read authentic client feedback, see photos &amp; videos of healed tattoos, and discover our founding creed: <strong className="text-zinc-200">“Same Skin Different Story”</strong>.
            </p>
          </div>

          {/* Action & Stats Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-[#141414] border border-zinc-800 px-4 py-2.5 rounded-xl flex items-center gap-3">
              <div className="text-right">
                <div className="flex items-center gap-1 text-[#FFD60A] text-sm justify-end font-highlight font-extrabold">
                  <span>★</span>
                  <span>{averageRating}</span>
                </div>
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-bold font-highlight">
                  {approvedReviews.length}+ Verified Reviews
                </span>
              </div>
              <div className="w-px h-8 bg-zinc-800" />
              <div className="text-[11px] text-zinc-300">
                <span className="text-emerald-400 font-bold block">100% Sterile</span>
                <span className="text-zinc-500 text-[10px]">Medical Safety</span>
              </div>
            </div>

            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 bg-[#FFD60A] hover:bg-[#ffe033] active:scale-[0.98] text-black font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-lg shadow-yellow-500/15 transition-all cursor-pointer"
            >
              <Star className="w-4 h-4 fill-black" />
              <span>Write a Review</span>
            </button>
          </div>
        </div>

        {/* View Switcher Tabs: Client Reviews vs Studio Thoughts & Views */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center p-1 bg-[#141414] border border-zinc-800 rounded-xl">
            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'reviews'
                  ? 'bg-[#FFD60A] text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Client Reviews ({approvedReviews.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('philosophy')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'philosophy'
                  ? 'bg-[#FFD60A] text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Our Thoughts &amp; Views</span>
            </button>
          </div>

          {/* Service & Media Filter (Only shown when Reviews tab is active) */}
          {activeTab === 'reviews' && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-zinc-500 text-[11px] mr-1 hidden sm:inline flex items-center gap-1">
                <Filter className="w-3 h-3" /> Filter:
              </span>
              {[
                { id: 'All', label: 'All Reviews' },
                { id: 'Media', label: '📸 With Photos / Videos' },
                { id: 'Tattoos', label: 'Tattoos' },
                { id: 'Cosmetic', label: 'Cosmetic' },
                { id: 'Academy', label: 'Academy' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setServiceFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                    serviceFilter === tab.id
                      ? 'bg-zinc-800 text-[#FFD60A] border border-[#FFD60A]/40'
                      : 'bg-zinc-900/80 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* TAB 1: CLIENT REVIEWS GRID (WITH PHOTOS & VIDEOS) */}
        {/* ============================================================== */}
        {activeTab === 'reviews' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReviews.map((rev) => {
                const hasImages = rev.images && rev.images.length > 0;
                const hasVideos = rev.videos && rev.videos.length > 0;

                return (
                  <div
                    key={rev.id}
                    className="bg-[#141414] hover:bg-[#181818] border border-zinc-800 hover:border-zinc-700/80 p-6 rounded-2xl flex flex-col justify-between transition-all group shadow-sm"
                  >
                    <div className="space-y-3.5">
                      {/* Top Bar: Stars, Date, and Media Badges */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-[#FFD60A] text-xs gap-0.5">
                          {[...Array(Math.max(1, Math.min(5, Math.round(Number(rev.rating) || 5))))].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-[#FFD60A]" />
                          ))}
                        </div>
                        <div className="flex items-center gap-1.5">
                          {hasVideos && (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-red-950/40 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded-md font-mono">
                              <VideoIcon className="w-2.5 h-2.5" />
                              <span>Video</span>
                            </span>
                          )}
                          {hasImages && (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-yellow-950/40 text-[#FFD60A] border border-[#FFD60A]/30 px-1.5 py-0.5 rounded-md font-mono">
                              <ImageIcon className="w-2.5 h-2.5" />
                              <span>{rev.images!.length} Photos</span>
                            </span>
                          )}
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {rev.date || 'Recent'}
                          </span>
                        </div>
                      </div>

                      {/* Review Title */}
                      <h3 className="font-serif text-base font-bold text-white group-hover:text-[#FFD60A] transition-colors leading-snug">
                        "{rev.title || (rev as any).tattooType || 'Exceptional Tattoo Work'}"
                      </h3>

                      {/* Review Narrative */}
                      <p className="text-xs sm:text-[13px] text-zinc-300 leading-relaxed">
                        {rev.text}
                      </p>

                      {/* ================================================== */}
                      {/* ATTACHED MEDIA PREVIEW (IMAGES & VIDEOS) */}
                      {/* ================================================== */}
                      {(hasImages || hasVideos) && (
                        <div className="pt-2 space-y-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                            Client Healed Tattoo Showcase:
                          </span>

                          <div className="grid grid-cols-3 gap-2">
                            {/* Images thumbnails */}
                            {rev.images?.map((imgUrl, i) => (
                              <button
                                key={`img-${i}`}
                                type="button"
                                onClick={() => setActiveMedia({
                                  type: 'image',
                                  url: imgUrl,
                                  reviewTitle: rev.title,
                                  reviewerName: rev.name,
                                })}
                                className="relative aspect-square rounded-xl overflow-hidden border border-zinc-700/80 group/img focus:outline-none cursor-pointer bg-black"
                              >
                                <img
                                  src={imgUrl}
                                  alt={`${rev.name} tattoo`}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                                  <Maximize2 className="w-4 h-4 text-white" />
                                </div>
                              </button>
                            ))}

                            {/* Videos thumbnails / mini players */}
                            {rev.videos?.map((vidUrl, i) => (
                              <button
                                key={`vid-${i}`}
                                type="button"
                                onClick={() => setActiveMedia({
                                  type: 'video',
                                  url: vidUrl,
                                  reviewTitle: rev.title,
                                  reviewerName: rev.name,
                                })}
                                className="relative aspect-square rounded-xl overflow-hidden border border-[#FFD60A]/50 group/vid focus:outline-none cursor-pointer bg-black flex items-center justify-center"
                              >
                                {vidUrl.endsWith('.mp4') || vidUrl.endsWith('.webm') ? (
                                  <video
                                    src={vidUrl}
                                    muted
                                    playsInline
                                    className="w-full h-full object-cover opacity-70 group-hover/vid:opacity-90"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                                    <VideoIcon className="w-6 h-6 text-zinc-500" />
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover/vid:scale-110 transition-transform">
                                  <div className="w-7 h-7 rounded-full bg-[#FFD60A] text-black flex items-center justify-center shadow-md">
                                    <Play className="w-3.5 h-3.5 fill-black ml-0.5" />
                                  </div>
                                </div>
                                <span className="absolute bottom-1 right-1 text-[9px] bg-black/80 px-1 rounded text-white font-mono">
                                  Video
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Studio Reply (if exists) */}
                      {rev.studioReply && (
                        <div className="mt-3 p-3 bg-zinc-900/90 rounded-xl border border-zinc-800/80 space-y-1 text-xs">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#FFD60A]">
                            <ShieldCheck className="w-3 h-3 text-[#FFD60A]" />
                            <span>Phoenix Studio Reply</span>
                          </div>
                          <p className="text-[11px] text-zinc-400 italic">
                            "{rev.studioReply}"
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Reviewer info */}
                    <div className="pt-4 mt-4 border-t border-zinc-800/80 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white">
                            {rev.name}
                          </span>
                          <span className="text-[10px] text-zinc-400">
                            &bull; {rev.city}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#FFD60A] block">
                          {rev.service || (rev as any).tattooType || 'Custom Tattooing'} &bull; Artist: {rev.artist || 'Rohit Sharma'}
                        </span>
                      </div>

                      {rev.verified && (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>Verified</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Invitation to Share Review */}
            <div className="bg-gradient-to-r from-zinc-900 via-[#181818] to-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
              <div>
                <h4 className="font-serif text-xl font-bold text-white flex items-center justify-center sm:justify-start gap-2">
                  <span>Got inked at Phoenix Tattooz?</span>
                  <span className="text-xs bg-[#FFD60A]/20 text-[#FFD60A] px-2 py-0.5 rounded-full font-mono">
                    Add Photos &amp; Video
                  </span>
                </h4>
                <p className="text-xs text-zinc-400 mt-1 max-w-md">
                  Upload photos or a short video clip of your healed piece. Your review helps tattoo lovers make confident choices!
                </p>
              </div>

              <button
                onClick={() => setModalOpen(true)}
                className="bg-[#FFD60A] hover:bg-[#ffe033] active:scale-[0.98] text-black font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition-all cursor-pointer shrink-0 shadow-md flex items-center gap-2"
              >
                <Plus className="w-4 h-4 text-black" />
                <span>Share Your Tattoo Experience</span>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: OUR THOUGHTS & VIEWS (STUDIO PHILOSOPHY CREED) */}
        {/* ============================================================== */}
        {activeTab === 'philosophy' && (
          <div className="space-y-10 animate-in fade-in duration-300">
            
            {/* Founder Thought Card with Photo */}
            <div className="bg-[#141414] border border-zinc-800 rounded-2xl p-6 sm:p-10 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-80 h-80 bg-[#FFD60A]/5 rounded-full blur-3xl pointer-events-none" />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* Founder Photo */}
                <div className="lg:col-span-4 relative mx-auto lg:mx-0 max-w-xs">
                  <div className="relative rounded-2xl overflow-hidden border-2 border-zinc-700 aspect-[4/5] shadow-2xl bg-black">
                    <img
                      src={philosophy.founderImage || 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=800&q=80'}
                      alt={philosophy.founderName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-3 left-3 right-3 bg-black/85 backdrop-blur-md px-3 py-2 rounded-xl border border-zinc-700">
                      <span className="font-serif text-sm font-bold text-white block">
                        {philosophy.founderName}
                      </span>
                      <span className="text-[10px] text-[#FFD60A] uppercase tracking-wider block">
                        {philosophy.founderTitle}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Founder Narrative Quote */}
                <div className="lg:col-span-8 space-y-4 text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFD60A]/10 border border-[#FFD60A]/30 rounded-full text-[11px] font-bold text-[#FFD60A]">
                    <Quote className="w-3 h-3" />
                    <span>FOUNDER'S PERSPECTIVE</span>
                  </div>

                  <blockquote className="font-serif text-xl sm:text-2xl lg:text-3xl font-normal text-white leading-relaxed italic">
                    "{philosophy.founderQuote}"
                  </blockquote>

                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-2xl pt-2">
                    {philosophy.subtitle}
                  </p>

                  <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                    {onOpenBooking && (
                      <button
                        onClick={() => onOpenBooking()}
                        className="bg-[#FFD60A] hover:bg-[#ffe033] active:scale-[0.98] text-black font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all cursor-pointer"
                      >
                        Book a Consultation with Rohit
                      </button>
                    )}
                    <button
                      onClick={() => setModalOpen(true)}
                      className="bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                    >
                      Share Your Thoughts on Our Vision
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* 4 Pillars of Phoenix Views */}
            <div className="space-y-4">
              <div className="text-center max-w-2xl mx-auto space-y-1">
                <span className="text-xs font-bold text-[#FFD60A] uppercase tracking-wider">
                  OUR CORE PILLARS
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                  How We View Our Art &amp; Studio Responsibilities
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                {philosophy.pillars.map((pillar, index) => (
                  <div
                    key={pillar.id || index}
                    className="bg-[#141414] border border-zinc-800/90 hover:border-[#FFD60A]/50 p-6 sm:p-7 rounded-2xl space-y-3 transition-all shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-[#FFD60A] font-bold">
                        0{index + 1} &bull; CREED
                      </span>
                      <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
                        {pillar.tagline}
                      </span>
                    </div>

                    <h4 className="font-serif text-lg font-bold text-white">
                      {pillar.title}
                    </h4>

                    <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                      {pillar.summary}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* ============================================================== */}
      {/* FULLSCREEN LIGHTBOX FOR IMAGES & VIDEO SHOWCASES */}
      {/* ============================================================== */}
      {activeMedia && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setActiveMedia(null)}
        >
          <div 
            className="relative max-w-3xl w-full bg-[#111111] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-zinc-900 border-b border-zinc-800">
              <div>
                <span className="text-xs font-bold text-white block">
                  {activeMedia.reviewTitle || 'Client Tattoo Media'}
                </span>
                <span className="text-[10px] text-zinc-400">
                  Shared by {activeMedia.reviewerName || 'Verified Client'}
                </span>
              </div>
              <button
                onClick={() => setActiveMedia(null)}
                className="p-1.5 text-zinc-400 hover:text-white bg-zinc-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Media Content */}
            <div className="p-2 sm:p-4 flex items-center justify-center bg-black min-h-[300px] max-h-[75vh]">
              {activeMedia.type === 'image' ? (
                <img
                  src={activeMedia.url}
                  alt={activeMedia.reviewTitle || 'Tattoo showcase'}
                  className="max-h-[70vh] w-auto max-w-full rounded-xl object-contain mx-auto"
                />
              ) : (
                <div className="w-full flex items-center justify-center">
                  {activeMedia.url.endsWith('.mp4') || activeMedia.url.endsWith('.webm') ? (
                    <video
                      src={activeMedia.url}
                      controls
                      autoPlay
                      className="max-h-[70vh] w-full rounded-xl"
                    />
                  ) : (
                    <div className="aspect-video w-full">
                      <iframe
                        src={activeMedia.url}
                        title="Tattoo Video Review"
                        className="w-full h-full rounded-xl border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Review Submission Modal */}
      <SubmitReviewModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setActiveTab('reviews');
        }}
      />
    </section>
  );
};
