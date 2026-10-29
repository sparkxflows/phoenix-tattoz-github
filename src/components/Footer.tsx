import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, MapPin, Clock, Instagram, Facebook, Youtube, Calendar, Lock } from 'lucide-react';
import { PhoenixLogo } from './PhoenixLogo';
import { STUDIO_INFO } from '../data/studioData';
import { WhatsAppIcon } from './WhatsAppIcon';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#07080A] text-zinc-300 border-t border-white/[0.08] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          
          {/* Col 1: Studio Identity (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <PhoenixLogo size={48} />
              <div>
                <h3 className="font-serif text-lg font-bold text-white tracking-wide">
                  Phoenix Tattooz
                </h3>
                <p className="text-xs uppercase tracking-widest text-[#FFD60A] font-medium">
                  Studio &amp; Academy
                </p>
                <p className="text-xs text-zinc-400">Hisar, Haryana</p>
              </div>
            </div>
            
            <p className="text-sm text-zinc-400 leading-relaxed max-w-sm">
              Premier custom tattoo studio and professional training academy in Hisar. Dedicated to precision artistry, certified sterilization, and wearable stories that endure.
            </p>

            <div className="pt-1">
              <p className="text-xs text-zinc-400 font-medium">
                “Wear Your Story, <span className="text-[#FFD60A]">Leave the Rest Behind.</span>”
              </p>
            </div>
          </div>

          {/* Col 2: Navigation Links (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Studio Guide
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-zinc-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-zinc-400 hover:text-white transition-colors">
                  About &amp; Studio Philosophy
                </Link>
              </li>
              <li>
                <Link to="/artists" className="text-zinc-400 hover:text-white transition-colors">
                  Resident Artists
                </Link>
              </li>
              <li>
                <Link to="/gallery?tab=photos" className="text-zinc-400 hover:text-white transition-colors">
                  Photo Gallery
                </Link>
              </li>
              <li>
                <Link to="/gallery?tab=videos" className="text-zinc-400 hover:text-white transition-colors">
                  Video Reels
                </Link>
              </li>
              <li>
                <Link to="/reviews" className="text-zinc-400 hover:text-white transition-colors">
                  Client Reviews &amp; Stories
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-zinc-400 hover:text-white transition-colors">
                  Contact &amp; Location
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Studio Hours & Info (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Studio Hours &amp; Visit
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#FFD60A] shrink-0 mt-0.5" />
                <span className="text-zinc-400 text-xs leading-relaxed">
                  {STUDIO_INFO.address}
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#FFD60A] shrink-0" />
                <a
                  href={`tel:${STUDIO_INFO.phone}`}
                  className="text-zinc-300 hover:text-[#FFD60A] transition-colors text-xs font-medium"
                >
                  {STUDIO_INFO.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#FFD60A] shrink-0" />
                <span className="text-zinc-400 text-xs">
                  {STUDIO_INFO.hours}
                </span>
              </li>
            </ul>

            <div className="pt-2">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-950/40 via-[#111317] to-zinc-900/90 border border-emerald-500/35 hover:border-emerald-400/70 shadow-lg shadow-black/60 transition-all duration-300 hover:scale-[1.02] group">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <div>
                    <span className="text-xs font-bold text-white block tracking-wide group-hover:text-emerald-300 transition-colors">
                      Walk-ins Welcome
                    </span>
                    <span className="text-[11px] text-zinc-400 block font-medium">
                      Appointments Prioritized &bull; Live Studio
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Col 4: Quick Actions & Connect (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Direct Channels
            </h4>
            <div className="space-y-2">
              <a
                href={`https://wa.me/919992969919?text=${encodeURIComponent('Hello Phoenix Tattooz! I would like to book a consultation.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 px-3 py-2 rounded-xl text-xs font-medium transition-colors"
              >
                <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp Studio</span>
              </a>

              <a
                href={`https://maps.google.com/?q=${encodeURIComponent('Phoenix Tattooz Studio & Academy Hisar')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white px-3 py-2 rounded-xl text-xs font-medium transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-[#FFD60A]" />
                <span>Get Directions</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 text-center sm:text-left">
            <p className="text-xs text-zinc-500">
              &copy; {new Date().getFullYear()} Phoenix Tattooz Studio &amp; Academy. All rights reserved.
            </p>
            <span className="text-zinc-700 hidden sm:inline">&bull;</span>
            <Link
              to="/admin"
              className="text-xs text-zinc-500 hover:text-[#FFD60A] transition-colors inline-flex items-center gap-1 font-medium"
            >
              <Lock className="w-3 h-3" />
              <span>Studio Admin</span>
            </Link>
          </div>

          {/* Social Icons */}
          <div className="flex items-center space-x-3">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-[#FFD60A] hover:border-zinc-700 transition-colors"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-[#FFD60A] hover:border-zinc-700 transition-colors"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube"
              className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-[#FFD60A] hover:border-zinc-700 transition-colors"
            >
              <Youtube className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
