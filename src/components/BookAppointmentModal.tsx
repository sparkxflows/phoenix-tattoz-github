import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  CheckCircle2, 
  Phone, 
  MapPin, 
  User, 
  Sparkles, 
  MessageSquare, 
  Database, 
  AlertCircle, 
  Copy, 
  ExternalLink,
  Loader2,
  Palette,
  Eye,
  Layers,
  Zap,
  GraduationCap,
  Award,
  Disc,
  ShieldCheck,
  Check,
  Clock,
  Info,
  DollarSign,
  ChevronRight,
  BookOpen,
  Scissors,
  CircleDot
} from 'lucide-react';
import { STUDIO_INFO } from '../data/studioData';
import { useArtists } from '../lib/studioContent';
import { saveAppointmentToSupabase, supabaseDashboardUrl, SUPABASE_SQL_SCHEMA } from '../lib/supabase';
import { 
  TATTOO_SUB_SERVICES, 
  REMOVAL_SIZE_TIERS, 
  REMOVAL_PROTOCOL_FACTS,
  TRAINING_SYLLABUS, 
  TRAINING_COURSES, 
  PIERCING_AREAS, 
  PIERCING_JEWELRY_OPTIONS,
  TattooServiceOption,
  RemovalSizeTier,
  TrainingCourse,
  PiercingArea,
  PiercingJewelryOption
} from '../data/bookingServicesData';

export type BookingCategory = 'tattoo' | 'removal' | 'training' | 'piercing';

interface BookAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedArtistId?: string;
  preselectedServiceId?: string;
  initialCategory?: BookingCategory;
}

export const BookAppointmentModal: React.FC<BookAppointmentModalProps> = ({
  isOpen,
  onClose,
  preselectedArtistId,
  preselectedServiceId,
  initialCategory = 'tattoo',
}) => {
  const artists = useArtists();

  // 1. Primary Category State (4 Top-Level Buttons)
  const [activeCategory, setActiveCategory] = useState<BookingCategory>(initialCategory);

  // 2. Tattoo Flow State
  const [selectedTattooService, setSelectedTattooService] = useState<string>('custom-tattoo');
  const [selectedArtist, setSelectedArtist] = useState<string>(preselectedArtistId || 'rohit-sharma');
  const [placement, setPlacement] = useState<string>('Forearm');
  const [size, setSize] = useState<string>('Medium (4-6 in)');

  // 3. Tattoo Removal Flow State
  const [selectedRemovalTier, setSelectedRemovalTier] = useState<string>('medium');
  const [removalPlacement, setRemovalPlacement] = useState<string>('Inner Forearm');
  const [tattooAge, setTattooAge] = useState<string>('2 - 5 years old');
  const [inkColorType, setInkColorType] = useState<string>('Solid Black / Dark Grey');

  // 4. Tattoo Training Flow State
  const [selectedCourseId, setSelectedCourseId] = useState<string>('master');
  const [batchSchedule, setBatchSchedule] = useState<string>('Full-Time Regular (Mon - Fri)');
  const [priorArtExperience, setPriorArtExperience] = useState<string>('Beginner / Sketching Hobby');

  // 5. Piercing Flow State
  const [selectedPiercingAreaId, setSelectedPiercingAreaId] = useState<string>('ear-lobe');
  const [piercingCategoryFilter, setPiercingCategoryFilter] = useState<'All' | 'Ear' | 'Nose' | 'Face' | 'Body'>('All');
  const [selectedJewelryId, setSelectedJewelryId] = useState<string>('titanium-grade23');
  const [piercingSide, setPiercingSide] = useState<string>('Right Side');

  // Common Scheduling & Client Info State
  const [date, setDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState<string>('02:00 PM');
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [clientNotes, setClientNotes] = useState<string>('');
  const [referenceImageCategory, setReferenceImageCategory] = useState<string>('Custom Reference / Client Idea');
  const [imageDescription, setImageDescription] = useState<string>('');

  // Submission & Supabase state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [bookingCode, setBookingCode] = useState('');
  const [supabaseStatus, setSupabaseStatus] = useState<'idle' | 'success' | 'table_missing' | 'error'>('idle');
  const [supabaseError, setSupabaseError] = useState<string>('');
  const [copiedSQL, setCopiedSQL] = useState(false);
  const [formErrors, setFormErrors] = useState<{ name?: string; phone?: string }>({});

  // Sync props when opening
  useEffect(() => {
    if (initialCategory) {
      setActiveCategory(initialCategory);
    }
  }, [initialCategory, isOpen]);

  useEffect(() => {
    if (preselectedArtistId) setSelectedArtist(preselectedArtistId);
  }, [preselectedArtistId]);

  useEffect(() => {
    if (preselectedServiceId) {
      if (['removal', 'laser-removal'].includes(preselectedServiceId)) {
        setActiveCategory('removal');
      } else if (['training', 'academy', 'course'].includes(preselectedServiceId)) {
        setActiveCategory('training');
      } else if (['piercing', 'body-piercing'].includes(preselectedServiceId)) {
        setActiveCategory('piercing');
      } else {
        setActiveCategory('tattoo');
        const match = TATTOO_SUB_SERVICES.find(s => s.id === preselectedServiceId);
        if (match) setSelectedTattooService(match.id);
      }
    }
  }, [preselectedServiceId]);

  // Handle ESC key and scroll locking
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
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
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Selected Objects based on current Category
  const curTattooService = TATTOO_SUB_SERVICES.find(s => s.id === selectedTattooService) || TATTOO_SUB_SERVICES[0];
  const curArtist = artists.find(a => a.id === selectedArtist) || artists[0];
  const curRemovalTier = REMOVAL_SIZE_TIERS.find(t => t.id === selectedRemovalTier) || REMOVAL_SIZE_TIERS[1];
  const curCourse = TRAINING_COURSES.find(c => c.id === selectedCourseId) || TRAINING_COURSES[1];
  const curPiercingArea = PIERCING_AREAS.find(p => p.id === selectedPiercingAreaId) || PIERCING_AREAS[0];
  const curJewelry = PIERCING_JEWELRY_OPTIONS.find(j => j.id === selectedJewelryId) || PIERCING_JEWELRY_OPTIONS[0];

  // Calculated Pricing String per Category
  const getCategorySummary = () => {
    switch (activeCategory) {
      case 'tattoo':
        return {
          serviceTitle: `Tattoo — ${curTattooService.name}`,
          assignedTo: 'Phoenix Resident Master Team',
          locationOrPlacement: placement,
          specification: size,
          priceQuote: 'Consultation & Custom Quote',
          categoryBadge: 'Tattoo Art'
        };
      case 'removal':
        return {
          serviceTitle: `Laser Tattoo Removal — ${curRemovalTier.name}`,
          assignedTo: 'Lead Laser Specialist',
          locationOrPlacement: removalPlacement,
          specification: `${curRemovalTier.dimension} • ${curRemovalTier.expectedSessions}`,
          priceQuote: `${curRemovalTier.startingPrice} / session`,
          categoryBadge: 'Laser Removal'
        };
      case 'training':
        return {
          serviceTitle: `Tattoo Academy — ${curCourse.title}`,
          assignedTo: 'Rohit Sharma (Master Educator)',
          locationOrPlacement: 'Phoenix Academy Campus, Hisar',
          specification: `${curCourse.duration} • ${batchSchedule}`,
          priceQuote: curCourse.fee,
          categoryBadge: 'Tattoo Academy'
        };
      case 'piercing':
        return {
          serviceTitle: `Sterile Body Piercing — ${curPiercingArea.name}`,
          assignedTo: 'Lead Certified Piercer',
          locationOrPlacement: `${curPiercingArea.name} (${piercingSide})`,
          specification: curJewelry.name,
          priceQuote: curPiercingArea.price,
          categoryBadge: 'Sterile Piercing'
        };
    }
  };

  const summary = getCategorySummary();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { name?: string; phone?: string } = {};
    if (!clientName.trim()) {
      errors.name = 'Please enter your full name';
    }
    if (!clientPhone.trim() || clientPhone.replace(/\D/g, '').length < 10) {
      errors.phone = 'Please enter a valid 10-digit mobile number';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);

    const randomCode = 'PTZ-' + Math.floor(100000 + Math.random() * 900000);
    setBookingCode(randomCode);

    // Build category-specific detailed notes
    let fullNotes = clientNotes.trim();
    if (referenceImageCategory || imageDescription.trim()) {
      fullNotes = `${fullNotes} [Ref: ${referenceImageCategory}${imageDescription.trim() ? ` - ${imageDescription.trim()}` : ''}]`;
    }
    if (activeCategory === 'tattoo') {
      fullNotes = `[Category: Tattoo | Sub-service: ${curTattooService.name}] ${fullNotes}`;
    } else if (activeCategory === 'removal') {
      fullNotes = `[Category: Laser Removal | Size: ${curRemovalTier.name} (${curRemovalTier.dimension}) | Tattoo Age: ${tattooAge} | Ink: ${inkColorType} | Est. ${curRemovalTier.expectedSessions}] ${fullNotes}`;
    } else if (activeCategory === 'training') {
      fullNotes = `[Category: Tattoo Academy | Course: ${curCourse.title} (${curCourse.fee}) | Schedule: ${batchSchedule} | Art Background: ${priorArtExperience}] ${fullNotes}`;
    } else if (activeCategory === 'piercing') {
      fullNotes = `[Category: Piercing | Area: ${curPiercingArea.name} (${piercingSide}) | Jewelry: ${curJewelry.name} | Fee: ${curPiercingArea.price}] ${fullNotes}`;
    }

    // Save directly to Supabase Backend table
    const result = await saveAppointmentToSupabase({
      booking_code: randomCode,
      client_name: clientName.trim(),
      client_phone: clientPhone.trim(),
      service: summary.serviceTitle,
      artist: summary.assignedTo,
      placement: summary.locationOrPlacement,
      size: summary.specification,
      appointment_date: date,
      time_slot: timeSlot,
      notes: fullNotes,
      status: 'pending',
    });

    setIsSubmitting(false);

    if (result.success) {
      setSupabaseStatus('success');
    } else if (result.tableMissing) {
      setSupabaseStatus('table_missing');
      setSupabaseError(result.error || '');
    } else {
      setSupabaseStatus('error');
      setSupabaseError(result.error || '');
    }

    setIsSubmitted(true);
  };

  const handleWhatsAppNotify = () => {
    let specificDetail = '';
    if (activeCategory === 'tattoo') {
      specificDetail = `Service: ${curTattooService.name}\nArtist: ${curArtist.name}\nPlacement: ${placement}\nApprox Size: ${size}\nPricing: Custom Quote upon Artist Consultation`;
    } else if (activeCategory === 'removal') {
      specificDetail = `Service: Laser Tattoo Removal\nDimension: ${curRemovalTier.name} (${curRemovalTier.dimension})\nEst. Price: ${curRemovalTier.startingPrice} per session\nEst. Sessions: ${curRemovalTier.expectedSessions}\nTattoo Location: ${removalPlacement}\nInk Type: ${inkColorType}`;
    } else if (activeCategory === 'training') {
      specificDetail = `Service: Phoenix Tattoo Academy\nCourse: ${curCourse.title}\nCourse Fee: ${curCourse.fee}\nDuration: ${curCourse.duration}\nBatch Schedule: ${batchSchedule}\nPrior Art Experience: ${priorArtExperience}`;
    } else if (activeCategory === 'piercing') {
      specificDetail = `Service: Sterile Body Piercing\nPiercing Area: ${curPiercingArea.name} (${piercingSide})\nPrice: ${curPiercingArea.price}\nJewelry Choice: ${curJewelry.name}\nHealing Est: ${curPiercingArea.healingTime}`;
    }

    const text = encodeURIComponent(
      `🔥 *Phoenix Tattooz Appointment Request*\n\n` +
      `*Booking ID:* ${bookingCode}\n` +
      `*Client Name:* ${clientName}\n` +
      `*Phone Number:* ${clientPhone}\n` +
      `*Category:* ${summary.categoryBadge}\n` +
      `${specificDetail}\n` +
      `*Preferred Date:* ${date} at ${timeSlot}\n` +
      (clientNotes ? `*Client Notes:* ${clientNotes}\n` : '') +
      `\nPlease confirm availability and details for my appointment.`
    );
    window.open(`https://wa.me/919992969919?text=${text}`, '_blank');
  };

  const copySQL = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSQL(true);
    setTimeout(() => setCopiedSQL(false), 2500);
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setSupabaseStatus('idle');
    onClose();
  };

  const filteredPiercingAreas = piercingCategoryFilter === 'All' 
    ? PIERCING_AREAS 
    : PIERCING_AREAS.filter(p => p.category === piercingCategoryFilter);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden">
      <div 
        className="relative w-full max-w-3xl bg-[#111111] border-t sm:border border-zinc-800 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden text-zinc-200 animate-in fade-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 flex flex-col h-[94vh] sm:h-auto sm:max-h-[92vh] max-h-[96vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile top pull handle */}
        <div className="w-10 h-1 bg-zinc-700/80 rounded-full mx-auto mt-2.5 sm:hidden shrink-0" />

        {/* Top Header Ribbon */}
        <div className="bg-[#161616] border-b border-zinc-800 px-4 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#FFD60A] text-black font-bold flex items-center justify-center text-sm shadow shrink-0">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2 className="font-serif text-base sm:text-lg font-bold text-white tracking-tight truncate">
                  Book Studio Appointment
                </h2>
                <span className="hidden sm:inline-flex text-[9px] sm:text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono items-center gap-1 shrink-0">
                  <Database className="w-2.5 h-2.5" />
                  <span>Instant</span>
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-zinc-400 truncate">
                Phoenix Tattooz Studio &amp; Academy &bull; Hisar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close booking modal"
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ============================================================== */}
        {/* 4 CATEGORY BUTTONS (MOBILE DOCK & DESKTOP SWITCHER) */}
        {/* Tattoo, Tattoo Removal, Tattoo Training, Piercing */}
        {/* ============================================================== */}
        {!isSubmitted && (
          <div className="bg-[#141414] border-b border-zinc-800 px-3 sm:px-6 py-2 sm:py-2.5 shrink-0">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] sm:text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Select Category:
              </p>
              <span className="text-[10px] text-zinc-500 hidden sm:inline">Tap to switch specialized flow</span>
            </div>
            
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
              {/* Category 1: Tattoo */}
              <button
                type="button"
                onClick={() => setActiveCategory('tattoo')}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-1 sm:px-3 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[44px] ${
                  activeCategory === 'tattoo'
                    ? 'bg-[#FFD60A] text-black shadow-lg shadow-amber-500/20 scale-[1.01]'
                    : 'bg-zinc-900/90 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <Palette className="w-4 h-4 sm:w-4 sm:h-4 shrink-0" />
                <span className="text-[11px] sm:text-xs tracking-tight truncate">Tattoo</span>
              </button>

              {/* Category 2: Tattoo Removal */}
              <button
                type="button"
                onClick={() => setActiveCategory('removal')}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-1 sm:px-3 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[44px] ${
                  activeCategory === 'removal'
                    ? 'bg-[#FFD60A] text-black shadow-lg shadow-amber-500/20 scale-[1.01]'
                    : 'bg-zinc-900/90 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <Zap className="w-4 h-4 sm:w-4 sm:h-4 shrink-0" />
                <span className="text-[11px] sm:text-xs tracking-tight truncate">
                  <span className="sm:hidden">Removal</span>
                  <span className="hidden sm:inline">Tattoo Removal</span>
                </span>
              </button>

              {/* Category 3: Tattoo Training */}
              <button
                type="button"
                onClick={() => setActiveCategory('training')}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-1 sm:px-3 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[44px] ${
                  activeCategory === 'training'
                    ? 'bg-[#FFD60A] text-black shadow-lg shadow-amber-500/20 scale-[1.01]'
                    : 'bg-zinc-900/90 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <GraduationCap className="w-4 h-4 sm:w-4 sm:h-4 shrink-0" />
                <span className="text-[11px] sm:text-xs tracking-tight truncate">
                  <span className="sm:hidden">Training</span>
                  <span className="hidden sm:inline">Tattoo Training</span>
                </span>
              </button>

              {/* Category 4: Piercing */}
              <button
                type="button"
                onClick={() => setActiveCategory('piercing')}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-1 sm:px-3 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[44px] ${
                  activeCategory === 'piercing'
                    ? 'bg-[#FFD60A] text-black shadow-lg shadow-amber-500/20 scale-[1.01]'
                    : 'bg-zinc-900/90 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <Disc className="w-4 h-4 sm:w-4 sm:h-4 shrink-0" />
                <span className="text-[11px] sm:text-xs tracking-tight truncate">Piercing</span>
              </button>
            </div>
          </div>
        )}

        {/* Modal Body / Flows */}
        {isSubmitted ? (
          /* ============================================================== */
          /* BOOKING SUBMISSION SUCCESS SCREEN */
          /* ============================================================== */
          <div className="p-6 sm:p-8 text-center space-y-6 overflow-y-auto">
            <div className="w-16 h-16 bg-[#FFD60A]/10 border border-[#FFD60A]/30 rounded-2xl flex items-center justify-center mx-auto text-[#FFD60A] shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-1 bg-amber-400/10 border border-amber-400/30 text-[#FFD60A] text-xs font-bold rounded-full">
                {summary.categoryBadge} Booked
              </span>
              <h3 className="font-serif text-2xl font-bold text-white">
                Appointment Request Received!
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 max-w-md mx-auto leading-relaxed">
                Thank you, <strong className="text-white">{clientName}</strong>. Your session request has been registered under booking code:
              </p>
              <div className="inline-block bg-black border border-[#FFD60A]/50 px-5 py-2.5 rounded-xl text-[#FFD60A] font-mono font-bold text-xl tracking-wider shadow-lg">
                {bookingCode}
              </div>
            </div>

            {/* Supabase Status Banner */}
            {supabaseStatus === 'success' && (
              <div className="bg-emerald-950/60 border border-emerald-500/30 rounded-xl p-3 text-xs text-emerald-300 flex items-center justify-center gap-2 max-w-lg mx-auto">
                <Database className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Saved to your live <strong>Supabase</strong> appointments database.</span>
              </div>
            )}

            {supabaseStatus === 'table_missing' && (
              <div className="bg-amber-950/50 border border-amber-500/40 rounded-xl p-4 text-xs text-amber-200 text-left max-w-lg mx-auto space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Admin Database Notice</span>
                </div>
                <p className="text-zinc-300 text-[11px] leading-relaxed">
                  The appointment was archived locally. To synchronize directly into your remote Supabase cloud table, execute the 1-click SQL in your Supabase dashboard.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={copySQL}
                    className="bg-[#FFD60A] hover:bg-yellow-400 text-black font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedSQL ? 'Copied SQL!' : 'Copy SQL Script'}</span>
                  </button>
                  <a
                    href={supabaseDashboardUrl('/sql/new')}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <span>Supabase SQL</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}

            {/* Structured Receipt Summary Card */}
            <div className="bg-[#161616] border border-zinc-800 rounded-2xl p-5 text-left text-xs sm:text-sm space-y-3 max-w-lg mx-auto shadow-md">
              <div className="flex justify-between border-b border-zinc-800 pb-2.5">
                <span className="text-zinc-400">Selected Service:</span>
                <span className="font-bold text-white text-right">{summary.serviceTitle}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-2.5">
                <span className="text-zinc-400">Assigned Expert:</span>
                <span className="font-semibold text-[#FFD60A]">{summary.assignedTo}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-2.5">
                <span className="text-zinc-400">Scheduled Date &amp; Time:</span>
                <span className="font-semibold text-white">{date} at {timeSlot}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-2.5">
                <span className="text-zinc-400">Placement / Dimension / Area:</span>
                <span className="text-zinc-200 text-right">{summary.locationOrPlacement}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-2.5">
                <span className="text-zinc-400">Specification:</span>
                <span className="text-zinc-300 text-right">{summary.specification}</span>
              </div>
              <div className="flex justify-between items-center pt-1 text-sm">
                <span className="font-semibold text-zinc-300">
                  {activeCategory === 'tattoo' ? 'Consultation & Pricing:' : 'Pricing Estimate:'}
                </span>
                <span className="font-bold text-[#FFD60A] text-sm sm:text-base">
                  {activeCategory === 'tattoo' ? 'Custom Quote (Studio Consultation)' : summary.priceQuote}
                </span>
              </div>
              <div className="flex items-start gap-2 pt-2 border-t border-zinc-800/80 text-zinc-400 text-xs">
                <MapPin className="w-4 h-4 text-[#FFD60A] shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-[11px] leading-snug">
                  <div><span className="text-[#FFD60A] font-semibold">Branch 1 (Main Branch):</span> {STUDIO_INFO.address}</div>
                  <div><span className="text-white font-medium">Branch 2:</span> {STUDIO_INFO.address2}</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                type="button"
                onClick={handleWhatsAppNotify}
                className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-lg transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Confirm on WhatsApp (Instant)</span>
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="border border-zinc-700 hover:border-zinc-500 text-zinc-300 text-xs sm:text-sm px-6 py-3 rounded-xl transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
            {/* Scrollable Form Body */}
            <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1 overscroll-contain">
            
            {/* ------------------------------------------------------------ */}
            {/* CATEGORY 1: TATTOO FLOW */}
            {/* Sub-services: Tattoo, Commercial Tattoo, Cosmetic Tattoo, Cover-up */}
            {/* Followed by: Select Artist, Body Placement, Approx Size */}
            {/* ------------------------------------------------------------ */}
            {activeCategory === 'tattoo' && (
              <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
                {/* 1.1 Select Sub-Service (Clean Minimalist Tiles, Zero Crowding, No Prices) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                      <Palette className="w-4 h-4 text-[#FFD60A]" />
                      <span>Select Tattoo Style</span>
                    </label>
                    <span className="text-[11px] text-zinc-400">Custom Studio Inking</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {TATTOO_SUB_SERVICES.map((srv) => {
                      const isSelected = selectedTattooService === srv.id;
                      const IconComponent = srv.id === 'custom-tattoo' ? Palette :
                                           srv.id === 'commercial-tattoo' ? Sparkles :
                                           srv.id === 'cosmetic-tattoo' ? Eye : Layers;
                      return (
                        <button
                          type="button"
                          key={srv.id}
                          onClick={() => setSelectedTattooService(srv.id)}
                          className={`p-3 sm:p-3.5 rounded-xl text-left border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isSelected
                              ? 'bg-zinc-800/90 border-[#FFD60A] ring-1 ring-[#FFD60A] shadow-md shadow-amber-500/10'
                              : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                              isSelected 
                                ? 'bg-[#FFD60A] text-black font-bold shadow-sm' 
                                : 'bg-zinc-800/80 text-zinc-300 border border-zinc-700/60'
                            }`}>
                              <IconComponent className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs sm:text-sm font-bold text-white truncate">
                                {srv.name}
                              </div>
                              <div className="text-[11px] text-zinc-400 truncate mt-0.5">
                                {srv.subtitle}
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0 pl-1">
                            {isSelected ? (
                              <div className="w-5 h-5 rounded-full bg-[#FFD60A] text-black flex items-center justify-center shadow-sm">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-full border border-zinc-700 bg-zinc-800/40" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 1.2 Body Placement & Approximate Size */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Body Placement
                    </label>
                    <select
                      value={placement}
                      onChange={(e) => setPlacement(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm sm:text-xs text-white focus:outline-none focus:border-[#FFD60A] min-h-[44px]"
                    >
                      <option value="Forearm">Forearm</option>
                      <option value="Full Arm Sleeve">Full Arm Sleeve Project</option>
                      <option value="Wrist / Hand">Wrist / Hand</option>
                      <option value="Shoulder / Bicep">Shoulder / Bicep</option>
                      <option value="Chest / Ribs">Chest / Ribs</option>
                      <option value="Full Back / Spine">Full Back / Spine</option>
                      <option value="Calf / Leg / Thigh">Calf / Leg / Thigh</option>
                      <option value="Neck / Behind Ear">Neck / Behind Ear</option>
                      <option value="Collarbone / Ankle">Collarbone / Ankle</option>
                      <option value="Eyebrows / Lips (Cosmetic)">Eyebrows / Lips (Cosmetic)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Approximate Size
                    </label>
                    <select
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm sm:text-xs text-white focus:outline-none focus:border-[#FFD60A] min-h-[44px]"
                    >
                      <option value="Small (1-3 inches)">Small (1-3 inches) - Minimalist/Name</option>
                      <option value="Medium (4-6 inches)">Medium (4-6 inches) - Palm Size</option>
                      <option value="Large (7-10 inches)">Large (7-10 inches) - Hand Span</option>
                      <option value="Half Sleeve">Half Sleeve Project</option>
                      <option value="Full Sleeve / Back">Full Sleeve / Full Back Project</option>
                      <option value="Custom Consultation">Custom Measurement at Studio</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------ */}
            {/* CATEGORY 2: TATTOO REMOVAL FLOW */}
            {/* Sizing Tiers with Pricing, Predicted Dates & Session Estimator */}
            {/* ------------------------------------------------------------ */}
            {activeCategory === 'removal' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                {/* Protocol Info Header */}
                <div className="bg-gradient-to-r from-amber-500/10 via-zinc-900 to-zinc-900 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-[#FFD60A]/10 border border-[#FFD60A]/30 text-[#FFD60A] flex items-center justify-center shrink-0">
                      <Zap className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-white font-serif">
                        Q-Switched Nd:YAG Laser Removal
                      </h3>
                      <p className="text-[11px] text-zinc-400">
                        Safe, clinical ink fading with cryo-cooling. Zero tissue burning or scarring.
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Starting At</span>
                    <span className="text-base font-bold text-[#FFD60A] font-mono">₹1,499 / sit</span>
                  </div>
                </div>

                {/* Sizing & Pricing Cards Grid */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                    Select Tattoo Approximate Size &amp; Pricing Tier
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {REMOVAL_SIZE_TIERS.map((tier) => {
                      const isSelected = selectedRemovalTier === tier.id;
                      return (
                        <button
                          type="button"
                          key={tier.id}
                          onClick={() => setSelectedRemovalTier(tier.id)}
                          className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer relative ${
                            isSelected
                              ? 'bg-zinc-800/90 border-[#FFD60A] ring-1 ring-[#FFD60A] shadow-md'
                              : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                <span>{tier.name}</span>
                                {tier.popular && (
                                  <span className="text-[9px] bg-amber-400/20 text-[#FFD60A] px-1.5 py-0.2 rounded font-mono font-semibold">
                                    Popular
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-zinc-400 block mt-0.5">
                                {tier.dimension}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-bold text-[#FFD60A] font-mono">
                                {tier.startingPrice}
                              </span>
                              <span className="text-[10px] text-zinc-500 block">per session</span>
                            </div>
                          </div>

                          <div className="mt-3 pt-2.5 border-t border-zinc-800/60 flex items-center justify-between text-[11px]">
                            <span className="text-zinc-400">Expected Sessions:</span>
                            <span className="font-semibold text-emerald-400 font-mono">{tier.expectedSessions}</span>
                          </div>

                          <div className="text-[10px] text-zinc-500 mt-1 truncate">
                            e.g. {tier.examples}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Additional Laser Consultation Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Location of Tattoo
                    </label>
                    <input
                      type="text"
                      placeholder="Placeholder for Placement Area (e.g. Forearm, Neck, Ankle)"
                      value={removalPlacement}
                      onChange={(e) => setRemovalPlacement(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Approximate Ink Age
                    </label>
                    <select
                      value={tattooAge}
                      onChange={(e) => setTattooAge(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
                    >
                      <option value="Under 6 months">Under 6 months old</option>
                      <option value="6 months to 2 years">6 months to 2 years old</option>
                      <option value="2 - 5 years old">2 - 5 years old (Fading easier)</option>
                      <option value="5+ years old">5+ years old (Deep settled)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Ink Pigment Tone
                    </label>
                    <select
                      value={inkColorType}
                      onChange={(e) => setInkColorType(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
                    >
                      <option value="Solid Black / Dark Grey">Solid Black / Dark Grey (Fastest)</option>
                      <option value="Multi-Color (Red, Blue, Green)">Multi-Color (Red, Blue, Green)</option>
                      <option value="Faded Cover-up Attempt">Prior Cover-up / Heavy Pigment</option>
                    </select>
                  </div>
                </div>

                {/* Clinical Safety Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  {REMOVAL_PROTOCOL_FACTS.map((fact, idx) => (
                    <div key={idx} className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3 space-y-1">
                      <div className="text-[11px] font-bold text-white flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#FFD60A]" />
                        <span>{fact.title}</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 leading-relaxed">
                        {fact.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------ */}
            {/* CATEGORY 3: TATTOO TRAINING FLOW (ACADEMY) */}
            {/* What we train, What we do, and What we charge */}
            {/* ------------------------------------------------------------ */}
            {activeCategory === 'training' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                {/* Academy Banner */}
                <div className="bg-gradient-to-r from-amber-500/15 via-zinc-900 to-zinc-900 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-[#FFD60A]/10 border border-[#FFD60A]/30 text-[#FFD60A] flex items-center justify-center shrink-0">
                      <GraduationCap className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-white font-serif">
                        Phoenix Tattoo Academy &bull; Hisar
                      </h3>
                      <p className="text-[11px] text-zinc-400">
                        Learn hands-on from Master Artist Rohit Sharma. Industry certification included.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-amber-400/20 text-[#FFD60A] border border-amber-400/40 px-2.5 py-1 rounded-full font-bold">
                    Next Batch Enrolling
                  </span>
                </div>

                {/* Academy Program Selection (Clean, Transparent, Direct) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-[#FFD60A]" />
                      <span>Select Training Course</span>
                    </label>
                    <span className="text-[11px] text-zinc-400">Certified by Master Rohit Sharma</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {TRAINING_COURSES.map((course) => {
                      const isSelected = selectedCourseId === course.id;
                      return (
                        <button
                          type="button"
                          key={course.id}
                          onClick={() => setSelectedCourseId(course.id)}
                          className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-zinc-850 border-[#FFD60A] ring-1 ring-[#FFD60A] shadow-md shadow-amber-500/10'
                              : 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-700'
                          }`}
                        >
                          <div>
                            {course.popular && (
                              <span className="text-[9px] bg-[#FFD60A] text-black font-extrabold px-2 py-0.5 rounded uppercase tracking-wider inline-block mb-1.5">
                                Recommended
                              </span>
                            )}
                            <h4 className="text-xs font-bold text-white leading-tight">
                              {course.title}
                            </h4>
                            <div className="text-[11px] text-zinc-400 mt-1">
                              {course.duration}
                            </div>
                            <div className="text-sm font-bold text-[#FFD60A] mt-2 font-mono">
                              {course.fee}
                            </div>

                            <ul className="mt-2.5 space-y-1 text-[10px] text-zinc-300 border-t border-zinc-800/80 pt-2">
                              {course.whatYouLearn.slice(0, 3).map((feat, i) => (
                                <li key={i} className="flex items-start gap-1.5">
                                  <Check className="w-3 h-3 text-[#FFD60A] shrink-0 mt-0.5" />
                                  <span className="leading-snug">{feat}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="mt-3 pt-1.5 border-t border-zinc-800/60 text-[10px] font-mono text-zinc-400">
                            {course.certificateType}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section C: Schedule & Experience */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Preferred Batch Timing
                    </label>
                    <select
                      value={batchSchedule}
                      onChange={(e) => setBatchSchedule(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
                    >
                      <option value="Full-Time Regular (Mon - Fri, 11 AM - 4 PM)">Full-Time Regular (Mon - Fri, 11 AM - 4 PM)</option>
                      <option value="Evening Fast-Track (Mon - Fri, 5 PM - 8 PM)">Evening Fast-Track (Mon - Fri, 5 PM - 8 PM)</option>
                      <option value="Weekend Master Batch (Sat & Sun, 10 AM - 5 PM)">Weekend Master Batch (Sat & Sun, 10 AM - 5 PM)</option>
                      <option value="Flexible Customized Schedule">Flexible Customized Schedule</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Your Art / Drawing Background
                    </label>
                    <select
                      value={priorArtExperience}
                      onChange={(e) => setPriorArtExperience(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
                    >
                      <option value="Absolute Beginner (No prior experience)">Absolute Beginner (No prior experience needed)</option>
                      <option value="Hobby Artist / Pencil Sketcher">Hobby Artist / Pencil Sketcher</option>
                      <option value="Fine Arts Student / Graphic Designer">Fine Arts Student / Graphic Designer</option>
                      <option value="Working Tattooist looking to upgrade">Working Tattooist looking to upgrade</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------ */}
            {/* CATEGORY 4: PIERCING FLOW */}
            {/* Area of piercing, jewelry style, and transparent pricing */}
            {/* ------------------------------------------------------------ */}
            {activeCategory === 'piercing' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                {/* Piercing Hygiene Banner */}
                <div className="bg-gradient-to-r from-amber-500/10 via-zinc-900 to-zinc-900 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-[#FFD60A]/10 border border-[#FFD60A]/30 text-[#FFD60A] flex items-center justify-center shrink-0">
                      <Disc className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-white font-serif">
                        100% Sterile Needle Piercing
                      </h3>
                      <p className="text-[11px] text-zinc-400">
                        Zero piercing guns. Medical single-use sterile cannulas with hypoallergenic implant titanium.
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Selected Fee</span>
                    <span className="text-base font-bold text-[#FFD60A] font-mono">{curPiercingArea.price}</span>
                  </div>
                </div>

                {/* Piercing Area Selector with Filters */}
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                      1. Select Area of Piercing
                    </label>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-lg border border-zinc-800 text-[10px]">
                      {(['All', 'Ear', 'Nose', 'Face', 'Body'] as const).map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setPiercingCategoryFilter(cat)}
                          className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                            piercingCategoryFilter === cat
                              ? 'bg-[#FFD60A] text-black font-bold'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {filteredPiercingAreas.map((area) => {
                      const isSelected = selectedPiercingAreaId === area.id;
                      return (
                        <button
                          type="button"
                          key={area.id}
                          onClick={() => setSelectedPiercingAreaId(area.id)}
                          className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-zinc-800/90 border-[#FFD60A] ring-1 ring-[#FFD60A] shadow-md'
                              : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[9px] text-zinc-400 font-mono uppercase">
                                {area.category}
                              </span>
                              <span className={`text-[9px] px-1 rounded font-semibold ${
                                area.painLevel === 'Mild' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                              }`}>
                                {area.painLevel}
                              </span>
                            </div>
                            <div className="text-xs font-bold text-white mt-1 leading-tight">
                              {area.name}
                            </div>
                          </div>

                          <div className="mt-3 pt-2 border-t border-zinc-800/60 flex items-center justify-between">
                            <span className="text-xs font-bold text-[#FFD60A] font-mono">
                              {area.price}
                            </span>
                            <span className="text-[9px] text-zinc-400">
                              ~{area.healingTime}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Piercing Options: Side / Placement & Kind of Piercing (Jewelry) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Piercing Side / Orientation
                    </label>
                    <select
                      value={piercingSide}
                      onChange={(e) => setPiercingSide(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
                    >
                      <option value="Right Side">Right Side</option>
                      <option value="Left Side">Left Side</option>
                      <option value="Both / Pair">Both / Pair</option>
                      <option value="Center / Symmetry">Center / Symmetry</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Healing Care &amp; Pain Index
                    </label>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-300 flex items-center justify-between">
                      <span>Healing: <strong className="text-white">{curPiercingArea.healingTime}</strong></span>
                      <span className="text-zinc-500">&bull;</span>
                      <span>Pain: <strong className="text-amber-400">{curPiercingArea.painLevel}</strong></span>
                    </div>
                  </div>
                </div>

                {/* What kind of piercing jewelry they need */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                    2. Select Sterile Starter Jewelry Material
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {PIERCING_JEWELRY_OPTIONS.map((jewel) => {
                      const isSelected = selectedJewelryId === jewel.id;
                      return (
                        <button
                          type="button"
                          key={jewel.id}
                          onClick={() => setSelectedJewelryId(jewel.id)}
                          className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-zinc-800/90 border-[#FFD60A] ring-1 ring-[#FFD60A]'
                              : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white truncate">{jewel.name}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-[#FFD60A]" />}
                          </div>
                          <p className="text-[10px] text-zinc-400 mt-1 leading-snug line-clamp-2">
                            {jewel.description}
                          </p>
                          <span className="text-[10px] text-[#FFD60A] font-semibold block mt-2">
                            {jewel.priceNote}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------ */}
            {/* COMMON STEP: PREFERRED DATE & TIME SLOT */}
            {/* ------------------------------------------------------------ */}
            <div className="pt-2 border-t border-zinc-800">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2.5 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#FFD60A]" />
                <span>Select Appointment Date &amp; Time Slot</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                    Preferred Date *
                  </label>
                  <input
                    type="date"
                    value={date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm sm:text-xs text-white focus:outline-none focus:border-[#FFD60A] min-h-[44px]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                    Time Slot *
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm sm:text-xs text-white focus:outline-none focus:border-[#FFD60A] min-h-[44px]"
                  >
                    <option value="11:00 AM">11:00 AM (Morning Session)</option>
                    <option value="01:30 PM">01:30 PM (Afternoon Session)</option>
                    <option value="04:00 PM">04:00 PM (Late Afternoon)</option>
                    <option value="06:30 PM">06:30 PM (Evening Session)</option>
                    <option value="08:00 PM">08:00 PM (Night Consultation)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ------------------------------------------------------------ */}
            {/* COMMON STEP: CLIENT DETAILS & DESIGN SPECIFICATIONS */}
            {/* (Single section per line: Name, Mobile below, Notes, Image Dropdown, Image Desc) */}
            {/* ------------------------------------------------------------ */}
            <div className="pt-2 border-t border-zinc-800 space-y-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#FFD60A]" />
                <span>Your Contact Information &amp; Tattoo Details</span>
              </label>

              {/* Line 1: Full Name */}
              <div className="w-full">
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="Placeholder for Full Name"
                  value={clientName}
                  onChange={(e) => {
                    setClientName(e.target.value);
                    if (formErrors.name) setFormErrors({ ...formErrors, name: undefined });
                  }}
                  className={`w-full bg-zinc-900 border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none min-h-[44px] ${
                    formErrors.name ? 'border-rose-500' : 'border-zinc-800 focus:border-[#FFD60A]'
                  }`}
                />
                {formErrors.name && (
                  <p className="text-[11px] text-rose-400 mt-1">{formErrors.name}</p>
                )}
              </div>

              {/* Line 2: Mobile Number directly below Full Name */}
              <div className="w-full">
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                  WhatsApp Mobile Number *
                </label>
                <input
                  type="tel"
                  placeholder="Placeholder for WhatsApp Mobile Number"
                  value={clientPhone}
                  onChange={(e) => {
                    setClientPhone(e.target.value);
                    if (formErrors.phone) setFormErrors({ ...formErrors, phone: undefined });
                  }}
                  className={`w-full bg-zinc-900 border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none min-h-[44px] ${
                    formErrors.phone ? 'border-rose-500' : 'border-zinc-800 focus:border-[#FFD60A]'
                  }`}
                />
                {formErrors.phone && (
                  <p className="text-[11px] text-rose-400 mt-1">{formErrors.phone}</p>
                )}
              </div>

              {/* Line 3: Design Notes or Tattoo Ideas */}
              <div className="w-full">
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                  Design Notes / Tattoo Ideas / Special Instructions
                </label>
                <textarea
                  rows={2}
                  placeholder="Placeholder for Design Notes or Tattoo Ideas"
                  value={clientNotes}
                  onChange={(e) => setClientNotes(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#FFD60A] resize-none"
                />
              </div>

              {/* Line 4: Image Dropdown / Reference Style Selection */}
              <div className="w-full">
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1 flex items-center justify-between">
                  <span>Reference Style Selection</span>
                  <span className="text-[10px] text-zinc-500">Choose reference genre</span>
                </label>
                <select
                  value={referenceImageCategory}
                  onChange={(e) => setReferenceImageCategory(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFD60A] min-h-[44px]"
                >
                  <option value="Commercial Tattoo (Minimalist / Script / Symbol)">Commercial Tattoo (Minimalist / Names / Couple Initials / Zodiac)</option>
                  <option value="Cover-Up Tattoo (Old Ink / Scar Camouflage)">Cover-Up Tattoo (Old Ink Transformation / Scar Camouflage)</option>
                  <option value="Custom Bespoke Tattoo (Original Concept)">Custom Bespoke Tattoo (Original Concept &amp; Design)</option>
                  <option value="Realism / Portrait (Black & Grey)">Realism / Portrait (Hyper-Detailed Shading)</option>
                  <option value="Spiritual / Devotional (Shiva, Trishul, Mandala)">Spiritual / Devotional (Shiva, Trishul, Mandala, Buddha)</option>
                  <option value="Geometric & Dotwork">Geometric &amp; Dotwork (Sacred Geometry)</option>
                  <option value="Fine-Line & Floral Elegance">Fine-Line &amp; Floral Elegance</option>
                  <option value="Tattoo Training Academy Inquiry">Tattoo Training Academy Inquiry</option>
                </select>
              </div>

              {/* Line 5: Image Description or Reference Link */}
              <div className="w-full">
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                  Image Description / Reference Link (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Placeholder for Image Description or Reference Link"
                  value={imageDescription}
                  onChange={(e) => setImageDescription(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#FFD60A] min-h-[44px]"
                />
              </div>
            </div>
          </div>

            {/* Pinned Bottom Action Dock (Always visible & comfortable on mobile and desktop) */}
            <div className="shrink-0 bg-[#161616]/98 backdrop-blur-md border-t border-zinc-800 px-4 sm:px-6 py-2.5 sm:py-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-4 shadow-[0_-8px_24px_rgba(0,0,0,0.6)] pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <div className="min-w-0">
                <div className="text-[10px] sm:text-[11px] text-zinc-400 truncate">
                  {activeCategory === 'tattoo' ? 'Selected Studio Service' : 'Estimated Pricing'} &bull; <strong className="text-white">{summary.serviceTitle}</strong>
                </div>
                <div className="text-sm sm:text-base font-serif font-bold text-[#FFD60A] truncate">
                  {activeCategory === 'tattoo' ? 'Custom Quote (Studio Consultation)' : summary.priceQuote}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#FFD60A] hover:bg-[#ffe033] active:scale-[0.98] text-black font-extrabold text-xs sm:text-sm px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 shrink-0 min-h-[44px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>Confirming Appointment...</span>
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4 text-black stroke-[2.5]" />
                    <span>Confirm Appointment Request</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
