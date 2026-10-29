/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { MobileBottomBar } from './components/MobileBottomBar';
import { LeftBookingLauncher } from './components/LeftBookingLauncher';
import { ModernCtaEffects } from './components/ModernCtaEffects';
import type { BookingCategory } from './components/BookAppointmentModal';
import { OPEN_AUTH_MODAL_EVENT, OpenAuthModalDetail, triggerAuthModal } from './lib/memberAuth';
import { Home } from './pages/Home';

// Code-split non-initial routes for instant First Contentful Paint & 90+ Lighthouse score
const About = lazy(() => import('./pages/About').then(m => ({ default: m.About })));
const Artists = lazy(() => import('./pages/Artists').then(m => ({ default: m.Artists })));
const ArtistDetail = lazy(() => import('./pages/ArtistDetail').then(m => ({ default: m.ArtistDetail })));
const Experience = lazy(() => import('./pages/Experience').then(m => ({ default: m.Experience })));
const Gallery = lazy(() => import('./pages/Gallery').then(m => ({ default: m.Gallery })));
const Contact = lazy(() => import('./pages/Contact').then(m => ({ default: m.Contact })));
const Reviews = lazy(() => import('./pages/Reviews').then(m => ({ default: m.Reviews })));
const AdminPanel = lazy(() => import('./pages/AdminPanel').then(m => ({ default: m.AdminPanel })));

// Lazy-loaded modals: loaded on demand only when opened
const BookAppointmentModal = lazy(() => import('./components/BookAppointmentModal').then(m => ({ default: m.BookAppointmentModal })));
const AuthModal = lazy(() => import('./components/AuthModal').then(m => ({ default: m.AuthModal })));
const GiftRewardModal = lazy(() => import('./components/GiftRewardModal').then(m => ({ default: m.GiftRewardModal })));

const getAppBasename = () => {
  if (typeof window !== 'undefined') {
    const path = window.location.pathname;
    if (path.includes('/phoenix-new-repo')) return '/phoenix-new-repo';
    if (path.includes('/phoenix_tattoz_github')) return '/phoenix_tattoz_github';
    if (path.includes('/phoenix-tattoz-github')) return '/phoenix-tattoz-github';
    if (window.location.hostname.endsWith('github.io')) {
      const segments = path.split('/').filter(Boolean);
      if (segments.length > 0) {
        return '/' + segments[0];
      }
    }
  }
  return '';
};

// Scroll to top automatically on route changes, or scroll to hash anchor if provided
const ScrollToTop: React.FC = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const elementId = hash.replace('#', '');
      setTimeout(() => {
        const elem = document.getElementById(elementId);
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);
  return null;
};

interface MainLayoutProps {
  onOpenBooking: (artistId?: string, serviceId?: string, categoryId?: BookingCategory) => void;
  onOpenRewards: (tab?: 'birthday' | 'referral') => void;
}

// Main App Layout Wrapper to selectively render public header/footer/mobile bar
function MainLayout({ onOpenBooking, onOpenRewards }: MainLayoutProps) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen bg-[#0B0B0B] text-zinc-100 font-sans selection:bg-[#FFD60A] selection:text-black">
      {/* Adds the unified CTA hover glow/shine to every button and CTA link */}
      <ModernCtaEffects />

      {/* Show public Navbar only when not in admin dashboard */}
      {!isAdminRoute && (
        <Navbar 
          onOpenBooking={onOpenBooking} 
          onOpenRewards={onOpenRewards} 
        />
      )}

      {/* Dynamic Route Pages with Suspense */}
      <main className="flex-grow">
        <Suspense fallback={<div className="min-h-[50vh] bg-[#090A0D]" />}>
          <Routes>
            <Route path="/" element={<Home onOpenBooking={onOpenBooking} />} />
            <Route path="/about" element={<About onOpenBooking={onOpenBooking} />} />
            <Route path="/artists" element={<Artists onOpenBooking={onOpenBooking} />} />
            <Route path="/artists/rohit-sharma" element={<ArtistDetail onOpenBooking={onOpenBooking} />} />
            <Route path="/experience" element={<Experience onOpenBooking={onOpenBooking} />} />
            <Route path="/gallery" element={<Gallery onOpenBooking={onOpenBooking} />} />
            <Route path="/reviews" element={<Reviews onOpenBooking={onOpenBooking} />} />
            <Route path="/contact" element={<Contact onOpenBooking={() => onOpenBooking()} />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="*" element={<Home onOpenBooking={onOpenBooking} />} />
          </Routes>
        </Suspense>
      </main>

      {/* Show public Footer with Admin link only when not in admin dashboard */}
      {!isAdminRoute && <Footer />}

      {/* Adaptive Mobile Bottom Quick Bar */}
      {!isAdminRoute && <MobileBottomBar onOpenBooking={() => onOpenBooking()} />}

      {/* Left Corner Floating Booking & Direct Contact Pop-up */}
      {!isAdminRoute && <LeftBookingLauncher onOpenBooking={() => onOpenBooking()} />}
    </div>
  );
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error?: Error }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App ErrorBoundary caught error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0B0B0B] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md space-y-4">
            <h2 className="text-2xl font-serif font-bold text-[#FFD60A]">Phoenix Tattooz</h2>
            <p className="text-sm text-zinc-300">An unexpected glitch occurred while loading. Please refresh to continue.</p>
            <button 
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className="px-6 py-2.5 bg-[#FFD60A] text-black font-bold rounded-xl text-xs hover:bg-[#ffe033] transition-colors cursor-pointer"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingArtistId, setBookingArtistId] = useState<string | undefined>(undefined);
  const [bookingServiceId, setBookingServiceId] = useState<string | undefined>(undefined);
  const [bookingCategoryId, setBookingCategoryId] = useState<BookingCategory | undefined>(undefined);

  // Global Auth Modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signup');
  const [authCustomTitle, setAuthCustomTitle] = useState<string | undefined>(undefined);
  const [authCustomSubtitle, setAuthCustomSubtitle] = useState<string | undefined>(undefined);
  const [afterAuthTab, setAfterAuthTab] = useState<'birthday' | 'referral' | null>(null);

  // Global Gifts & Rewards Modal state
  const [globalRewardsOpen, setGlobalRewardsOpen] = useState(false);
  const [globalRewardsTab, setGlobalRewardsTab] = useState<'birthday' | 'referral'>('birthday');

  useEffect(() => {
    const handleOpenAuth = (e: Event) => {
      const custom = e as CustomEvent<OpenAuthModalDetail | undefined>;
      const detail = custom.detail;
      setAuthModalMode(detail?.mode || 'signin');
      setAuthCustomTitle(detail?.title);
      setAuthCustomSubtitle(detail?.subtitle);
      setAfterAuthTab(detail?.afterTab || null);
      setAuthModalOpen(true);
    };

    window.addEventListener(OPEN_AUTH_MODAL_EVENT, handleOpenAuth);
    return () => window.removeEventListener(OPEN_AUTH_MODAL_EVENT, handleOpenAuth);
  }, []);

  const handleOpenBooking = (artistId?: string, serviceId?: string, categoryId?: BookingCategory) => {
    setBookingArtistId(artistId);
    setBookingServiceId(serviceId);
    setBookingCategoryId(categoryId);
    setBookingModalOpen(true);
  };

  const handleCloseBooking = () => {
    setBookingModalOpen(false);
  };

  const handleOpenRewards = (tab: 'birthday' | 'referral' = 'birthday') => {
    setGlobalRewardsTab(tab);
    setGlobalRewardsOpen(true);
  };

  return (
    <ErrorBoundary>
      <BrowserRouter basename={getAppBasename()}>
        <ScrollToTop />
        <MainLayout 
          onOpenBooking={handleOpenBooking} 
          onOpenRewards={handleOpenRewards} 
        />

        {/* Global Appointment Booking Modal (Loads on demand with smooth transition) */}
        {bookingModalOpen && (
          <Suspense fallback={null}>
            <BookAppointmentModal
              isOpen={bookingModalOpen}
              onClose={handleCloseBooking}
              preselectedArtistId={bookingArtistId}
              preselectedServiceId={bookingServiceId}
              initialCategory={bookingCategoryId}
            />
          </Suspense>
        )}

        {/* Global Professional Member Sign Up & Sign In Modal (Loads on demand) */}
        {authModalOpen && (
          <Suspense fallback={null}>
            <AuthModal
              isOpen={authModalOpen}
              onClose={() => setAuthModalOpen(false)}
              initialMode={authModalMode}
              customTitle={authCustomTitle}
              customSubtitle={authCustomSubtitle}
              onSuccess={() => {
                setAuthModalOpen(false);
                if (afterAuthTab) {
                  setGlobalRewardsTab(afterAuthTab);
                  setGlobalRewardsOpen(true);
                  setAfterAuthTab(null);
                }
              }}
            />
          </Suspense>
        )}

        {/* Global Rewards & Gifts Modal (Loads on demand) */}
        {globalRewardsOpen && (
          <Suspense fallback={null}>
            <GiftRewardModal
              isOpen={globalRewardsOpen}
              onClose={() => setGlobalRewardsOpen(false)}
              initialTab={globalRewardsTab}
              onOpenBooking={() => handleOpenBooking()}
              onRequestAuth={(mode, title, subtitle) => {
                setGlobalRewardsOpen(false);
                triggerAuthModal({
                  mode,
                  title,
                  subtitle,
                  afterTab: globalRewardsTab,
                });
              }}
            />
          </Suspense>
        )}
      </BrowserRouter>
    </ErrorBoundary>
  );
}

