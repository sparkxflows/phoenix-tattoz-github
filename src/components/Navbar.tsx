import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Calendar, Menu, X, Phone, ChevronDown, Image as ImageIcon, Film, User, LogOut, Gift, Sparkles } from 'lucide-react';
import { PhoenixLogo } from './PhoenixLogo';
import { useMemberAuth, triggerAuthModal } from '../lib/memberAuth';

interface NavbarProps {
  onOpenBooking: (artistId?: string, serviceId?: string) => void;
  onOpenRewards?: (tab?: 'birthday' | 'referral') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenBooking, onOpenRewards }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [galleryDropdownOpen, setGalleryDropdownOpen] = useState(false);
  const [memberDropdownOpen, setMemberDropdownOpen] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const memberDropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, signOut } = useMemberAuth();

  const isHome = location.pathname === '/';

  // Sticky header listener
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on route change or outside click
  useEffect(() => {
    setGalleryDropdownOpen(false);
    setMemberDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setGalleryDropdownOpen(false);
      }
      if (memberDropdownRef.current && !memberDropdownRef.current.contains(e.target as Node)) {
        setMemberDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('nav-drawer-open', mobileMenuOpen);
    return () => document.body.classList.remove('nav-drawer-open');
  }, [mobileMenuOpen]);

  const navLinks = [
    { name: 'Home', pagePath: '/' },
    { name: 'About', pagePath: '/about' },
    { name: 'Gallery', pagePath: '/gallery', isDropdown: true },
    { name: 'Reviews', pagePath: '/reviews' },
    { name: 'Contact', pagePath: '/contact' },
  ];

  // Mobile drawer links: Gallery removed per client request (already on bottom bar)
  const mobileNavLinks = [
    { name: 'Home', pagePath: '/' },
    { name: 'About', pagePath: '/about' },
    { name: 'Artists', pagePath: '/artists' },
    { name: 'Experience', pagePath: '/experience' },
    { name: 'Reviews', pagePath: '/reviews' },
    { name: 'Contact', pagePath: '/contact' },
  ];

  const handleNavClick = (link: { pagePath: string; isDropdown?: boolean }, e: React.MouseEvent) => {
    if (link.isDropdown) return;
    
    if (link.pagePath === '/' && isHome) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isLinkActive = (link: { pagePath: string; isDropdown?: boolean }) => {
    if (link.pagePath === '/') {
      return location.pathname === '/';
    }
    if (link.isDropdown) {
      return location.pathname.startsWith('/gallery');
    }
    if (link.pagePath === '/about') {
      return location.pathname === '/about';
    }
    return location.pathname === link.pagePath;
  };

  return (
    <header
      className={`sticky top-0 left-0 right-0 z-50 w-full transition-all duration-200 ${
        scrolled
          ? 'bg-[#090A0D]/95 backdrop-blur-md border-b border-white/[0.08] shadow-xl shadow-black/60'
          : 'bg-[#090A0D]/90 backdrop-blur-sm border-b border-white/[0.05]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3 sm:gap-4">
        {/* Left: Phoenix Studio Logo - Responsively scaled for mobile */}
        <Link to="/" className="flex items-center gap-2 sm:gap-3 shrink-0 group">
          <div className="sm:hidden">
            <PhoenixLogo size={32} className="transition-transform duration-200 group-hover:scale-105" />
          </div>
          <div className="hidden sm:block">
            <PhoenixLogo size={42} className="transition-transform duration-200 group-hover:scale-105" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-bold text-white tracking-wide text-xs sm:text-lg group-hover:text-[#FFD60A] transition-colors leading-tight">
              Phoenix Tattooz
            </span>
            <span className="text-[8px] sm:text-[10px] tracking-wider sm:tracking-[0.2em] uppercase text-zinc-400 font-medium">
              Studio &amp; Academy
            </span>
          </div>
        </Link>

        {/* Center: Desktop Navigation with shifting yellow capsule hover effect */}
        <nav 
          className="hidden lg:flex items-center gap-1.5 bg-[#121418]/90 border border-white/[0.08] rounded-full px-2.5 py-1.5 shadow-sm"
          onMouseLeave={() => setHoveredNav(null)}
        >
          {navLinks.map((link) => {
            const isCurrentRouteActive = isLinkActive(link);
            const isHighlighted = hoveredNav !== null ? hoveredNav === link.name : isCurrentRouteActive;

            if (link.isDropdown) {
              return (
                <div
                  key={link.name}
                  ref={dropdownRef}
                  className="relative"
                  onMouseEnter={() => {
                    setGalleryDropdownOpen(true);
                    setHoveredNav(link.name);
                  }}
                  onMouseLeave={() => setGalleryDropdownOpen(false)}
                >
                  <button
                    onClick={() => setGalleryDropdownOpen(!galleryDropdownOpen)}
                    className={`nav-pill cursor-pointer transition-all duration-200 ${
                      isHighlighted ? 'nav-pill-active scale-[1.02]' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span>{link.name}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        galleryDropdownOpen ? 'rotate-180 text-black' : isHighlighted ? 'text-black' : 'text-zinc-400'
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {galleryDropdownOpen && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                      <div className="w-64 bg-[#121418] border border-zinc-800 rounded-xl p-2 shadow-2xl shadow-black/90">
                        <Link
                          to="/gallery?tab=photos"
                          onClick={() => setGalleryDropdownOpen(false)}
                          className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${
                            location.pathname === '/gallery' && !location.search.includes('videos')
                              ? 'bg-zinc-800 text-[#FFD60A]'
                              : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                            <ImageIcon className="w-4 h-4 text-[#FFD60A]" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-white">Photo Gallery</div>
                            <div className="text-[11px] text-zinc-400">Tattoos &amp; custom art</div>
                          </div>
                        </Link>

                        <div className="border-t border-zinc-800/80 my-1" />

                        <Link
                          to="/gallery?tab=videos"
                          onClick={() => setGalleryDropdownOpen(false)}
                          className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${
                            location.search.includes('videos')
                              ? 'bg-zinc-800 text-[#FFD60A]'
                              : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                            <Film className="w-4 h-4 text-amber-400" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-white">Video Reels</div>
                            <div className="text-[11px] text-zinc-400">Process &amp; reveal clips</div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={link.name}
                to={link.pagePath}
                onMouseEnter={() => setHoveredNav(link.name)}
                onClick={(e) => handleNavClick(link, e)}
                className={`nav-pill transition-all duration-200 ${
                  isHighlighted ? 'nav-pill-active scale-[1.02]' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right: Book Appointment (Left) & Login CTA with 15% Reward badge at corner (Right) */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          {/* 1. Primary CTA: Book Appointment (Left) */}
          <button
            onClick={() => onOpenBooking()}
            className="h-10 px-5 sm:px-6 rounded-xl bg-[#FFD60A] hover:bg-[#ffe033] hover:scale-105 active:scale-95 text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 hover:shadow-amber-500/35 transition-all duration-300 cursor-pointer shrink-0"
          >
            <Calendar className="w-4 h-4 text-black stroke-[2.5]" />
            <span>Book Appointment</span>
          </button>

          {/* 2. Login CTA (Always at the far right corner) */}
          {isAuthenticated && user ? (
            <div className="relative" ref={memberDropdownRef}>
              <button
                onClick={() => setMemberDropdownOpen(!memberDropdownOpen)}
                className="h-10 px-3.5 sm:px-4 rounded-xl bg-[#14161C] hover:bg-[#1A1D24] hover:scale-105 active:scale-95 border border-white/10 hover:border-amber-400/40 text-white text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer"
              >
                <div className="w-5 h-5 rounded-full bg-[#FFD60A] text-black font-bold flex items-center justify-center text-[10px]">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="truncate max-w-[85px]">{user.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              {memberDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-[#121418] border border-zinc-800 rounded-xl p-2 shadow-xl z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-3 py-2 border-b border-zinc-800 text-xs">
                    <div className="font-semibold text-white truncate">{user.name}</div>
                    <div className="text-zinc-400 truncate text-[11px]">{user.email}</div>
                  </div>
                  <div className="py-1 space-y-1">
                    <button
                      onClick={() => {
                        setMemberDropdownOpen(false);
                        if (onOpenRewards) onOpenRewards('birthday');
                        else {
                          const elem = document.getElementById('rewards');
                          if (elem) elem.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer text-left"
                    >
                      <Gift className="w-4 h-4 text-[#FFD60A]" />
                      <span>My 15% Rewards &amp; Codes</span>
                    </button>
                    <button
                      onClick={() => {
                        setMemberDropdownOpen(false);
                        signOut();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="relative">
              {/* 15% Reward Badge */}
              <span className="absolute -top-2.5 -right-1 z-10 bg-gradient-to-r from-amber-400 to-[#FFD60A] text-black text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-md uppercase tracking-wider animate-pulse flex items-center gap-0.5 pointer-events-none">
                <Sparkles className="w-2.5 h-2.5 fill-black" />
                15% Reward
              </span>

              <button
                onClick={() => triggerAuthModal({ mode: 'signin', title: 'Member Login', subtitle: 'Sign in to unlock your 15% instant reward voucher.' })}
                className="h-10 px-4 sm:px-5 rounded-xl bg-[#14161C] hover:bg-[#1A1D24] hover:scale-105 active:scale-95 border border-white/10 hover:border-amber-400/50 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer shrink-0"
              >
                <User className="w-4 h-4 text-[#FFD60A]" />
                <span>Login</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile Header Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 lg:hidden">
          {/* Quick Book Button - Compact size */}
          <button
            onClick={() => onOpenBooking()}
            className="h-8 px-2.5 rounded-lg bg-[#FFD60A] hover:bg-[#ffe033] hover:scale-105 active:scale-95 text-black font-extrabold text-[11px] flex items-center gap-1 shadow-sm transition-all duration-200 cursor-pointer"
          >
            <Calendar className="w-3 h-3 stroke-[2.5]" />
            <span>Book</span>
          </button>

          {/* Quick Mobile User Photo / Avatar Icon Button (No 'Login' text on mobile) */}
          {isAuthenticated && user ? (
            <button
              onClick={() => {
                if (onOpenRewards) onOpenRewards('birthday');
                else {
                  const elem = document.getElementById('rewards');
                  if (elem) elem.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="w-8 h-8 rounded-full bg-[#14161C] border border-[#FFD60A]/50 text-white flex items-center justify-center p-0.5 hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer"
              title={user.name || 'Member Account'}
              aria-label="Member Account"
            >
              <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#FFD60A] to-amber-300 text-black font-bold flex items-center justify-center text-xs shadow-inner">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            </button>
          ) : (
            <div className="relative">
              <span className="absolute -top-1.5 -right-1 z-10 bg-gradient-to-r from-amber-400 to-[#FFD60A] text-black text-[7.5px] font-black px-1 rounded-full shadow pointer-events-none">
                15%
              </span>
              <button
                onClick={() => triggerAuthModal({ mode: 'signin', title: 'Member Login', subtitle: 'Sign in to unlock your 15% reward voucher.' })}
                className="w-8 h-8 rounded-full bg-[#14161C] border border-white/15 hover:border-amber-400/60 text-zinc-300 hover:text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer"
                title="Member Sign In"
                aria-label="Member Sign In"
              >
                <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[#FFD60A]">
                  <User className="w-3.5 h-3.5" />
                </div>
              </button>
            </div>
          )}

          {/* Hamburger Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4 text-[#FFD60A]" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation (Gallery removed per request) */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-zinc-800 bg-[#090A0D]/98 backdrop-blur-xl px-4 py-5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col space-y-1">
            {mobileNavLinks.map((link) => {
              const active = isLinkActive(link);
              return (
                <Link
                  key={link.name}
                  to={link.pagePath}
                  onClick={(e) => {
                    handleNavClick(link, e);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${
                    active
                      ? 'bg-[#FFD60A] text-black font-bold'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Member / Club Row */}
          <div className="pt-3 border-t border-zinc-800/80">
            {isAuthenticated && user ? (
              <div className="flex items-center justify-between p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FFD60A] to-amber-300 text-black font-bold flex items-center justify-center text-xs">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{user.name}</div>
                    <div className="text-[10px] text-zinc-400">{user.email}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut();
                  }}
                  className="text-xs font-semibold text-rose-400 hover:text-rose-300 cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  triggerAuthModal({ mode: 'signin', title: 'Member Login', subtitle: 'Sign in for your 15% instant discount voucher' });
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#14161C] border border-amber-500/30 text-xs font-semibold text-white hover:bg-zinc-800 cursor-pointer"
              >
                <User className="w-4 h-4 text-[#FFD60A]" />
                <span>Member Login &bull; <strong className="text-[#FFD60A]">15% Off</strong></span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
