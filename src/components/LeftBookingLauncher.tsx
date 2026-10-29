import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Phone, X } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';

interface LeftBookingLauncherProps {
  onOpenBooking: (artistId?: string, serviceId?: string, categoryId?: 'tattoo' | 'removal' | 'training' | 'piercing') => void;
}

export const LeftBookingLauncher: React.FC<LeftBookingLauncherProps> = ({ onOpenBooking }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const userDismissedRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Uneven periodic popup interval (e.g. 4s -> 6s -> 5s -> 7s)
  useEffect(() => {
    // Disable background timer on mobile screens (<768px) where launcher is hidden
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return;
    }

    const intervals = [4500, 7000, 5500, 8000, 6000];
    let step = 0;

    const scheduleNext = () => {
      // Don't trigger if user switched tab or dismissed
      if (typeof document !== 'undefined' && document.hidden) return;

      const delay = intervals[step % intervals.length];
      step++;

      timerRef.current = setTimeout(() => {
        if (!userDismissedRef.current && !isHovered && (!document.hidden)) {
          // Smoothly slide open popup
          setIsOpen(true);

          // Auto tuck back after 3.6 seconds if user is not hovering
          setTimeout(() => {
            if (!isHovered && !userDismissedRef.current) {
              setIsOpen(false);
              scheduleNext();
            }
          }, 3600);
        } else if (!userDismissedRef.current) {
          scheduleNext();
        }
      }, delay);
    };

    scheduleNext();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isHovered]);

  return (
    <aside 
      aria-label="Quick Booking Pop-up"
      className="hidden md:block fixed bottom-6 left-6 z-30 select-none font-sans"
      onMouseEnter={() => {
        setIsHovered(true);
        setIsOpen(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
    >
      {/* Smoothly Animated Slide-up & Fade Popup Card */}
      <div 
        className={`absolute bottom-full left-0 mb-3 w-72 bg-[#121418]/95 backdrop-blur-xl border border-amber-500/35 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_20px_rgba(255,214,10,0.12)] space-y-3 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] origin-bottom-left ${
          isOpen
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
            : 'opacity-0 translate-y-3 scale-95 pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Quick Studio Connect
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              userDismissedRef.current = true;
              setIsOpen(false);
            }}
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors cursor-pointer"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-[11px] text-zinc-400 leading-tight">
          Consult master tattoo artists or schedule instant priority slot in Hisar.
        </p>

        <div className="space-y-2 pt-0.5">
          <button
            onClick={() => {
              setIsOpen(false);
              onOpenBooking();
            }}
            className="w-full flex items-center justify-center gap-2 bg-[#FFD60A] hover:bg-[#ffe033] hover:scale-[1.02] active:scale-95 text-black font-extrabold text-xs py-2.5 px-3.5 rounded-xl transition-all duration-200 shadow-md cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Book Appointment</span>
          </button>

          <a
            href="https://wa.me/919992969919"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 hover:border-emerald-400/50 hover:scale-[1.02] active:scale-95 text-emerald-300 text-xs py-2 px-3 rounded-xl transition-all duration-200"
          >
            <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span>WhatsApp Consultation</span>
          </a>

          <a
            href="tel:+919992969919"
            className="w-full flex items-center justify-center gap-2 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 hover:scale-[1.02] active:scale-95 text-zinc-300 hover:text-white text-xs py-2 px-3 rounded-xl transition-all duration-200"
          >
            <Phone className="w-3.5 h-3.5 text-[#FFD60A]" />
            <span>Direct Call Studio</span>
          </a>
        </div>
      </div>

      {/* Floating Anchor Button with Smooth State Animation */}
      <button
        onClick={() => {
          userDismissedRef.current = false;
          setIsOpen(!isOpen);
        }}
        className={`group flex items-center gap-2.5 px-4 py-2.5 rounded-full text-xs font-semibold shadow-xl shadow-black/70 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer ${
          isOpen
            ? 'bg-[#FFD60A] text-black shadow-amber-500/20'
            : 'bg-[#121418]/95 hover:bg-[#181A20] border border-white/10 hover:border-amber-400/50 text-zinc-300 hover:text-white'
        }`}
      >
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOpen ? 'bg-black' : 'bg-amber-400'}`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${isOpen ? 'bg-black' : 'bg-[#FFD60A]'}`}></span>
        </span>
        <Calendar className={`w-3.5 h-3.5 group-hover:rotate-6 transition-transform ${isOpen ? 'text-black' : 'text-[#FFD60A]'}`} />
        <span>{isOpen ? 'Close Menu' : 'Quick Book'}</span>
      </button>
    </aside>
  );
};
