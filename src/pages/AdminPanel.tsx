import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Lock, 
  UserCheck, 
  ShieldAlert, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Search, 
  RefreshCw, 
  LogOut, 
  Phone, 
  MessageSquare, 
  Database, 
  Filter, 
  ExternalLink, 
  Copy, 
  Mail, 
  ChevronRight,
  Eye,
  Trash2,
  FileText,
  AlertTriangle,
  Image as ImageIcon,
  Users,
  Palette,
  Star,
  ChevronDown,
  Menu,
  X,
  Layers,
  Smartphone,
  Laptop,
  ArrowLeft,
  Globe,
  Gift,
  Video,
  Key
} from 'lucide-react';
import { 
  loginAdmin, 
  getCurrentAdminSession, 
  logoutAdmin, 
  AdminSession,
  updateAppointmentStatusInSupabase,
  deleteAppointmentFromSupabase,
  getContactInquiriesFromSupabase,
  ADMIN_SETUP_SQL,
  updateAdminPassword
} from '../lib/adminAuth';
import { getAppointmentsFromSupabase, getSupabaseProjectRef, supabaseDashboardUrl, SUPABASE_SQL_SCHEMA, SUPABASE_URL } from '../lib/supabase';
import { PhoenixLogo } from '../components/PhoenixLogo';
import { AdminArtistsManager } from '../components/AdminArtistsManager';
import { AdminGalleryManager } from '../components/AdminGalleryManager';
import { AdminVideoGalleryManager } from '../components/AdminVideoGalleryManager';
import { AdminHeroManager } from '../components/AdminHeroManager';
import { AdminAboutManager } from '../components/AdminAboutManager';
import { AdminReviewsManager } from '../components/AdminReviewsManager';
import { AdminRewardsManager } from '../components/AdminRewardsManager';
import { AdminMembersManager } from '../components/AdminMembersManager';

export const AdminPanel: React.FC = () => {
  const navigate = useNavigate();

  // Authentication State
  const [session, setSession] = useState<AdminSession | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Form Inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Dashboard Data State
  const [activeTab, setActiveTab] = useState<'appointments' | 'inquiries' | 'members' | 'hero' | 'about' | 'reviews' | 'artists' | 'gallery' | 'videos' | 'rewards'>('appointments');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [copiedSQL, setCopiedSQL] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');
  const [mobileMoreDrawerOpen, setMobileMoreDrawerOpen] = useState(false);


  // Check auth session on load
  const verifyAuth = async () => {
    setAuthLoading(true);
    const curSession = getCurrentAdminSession();
    setSession(curSession);
    setAuthLoading(false);
  };

  useEffect(() => {
    verifyAuth();
  }, []);

  // Fetch appointments and inquiries when session exists
  const fetchData = async () => {
    setDataLoading(true);
    const aptRes = await getAppointmentsFromSupabase();
    if (aptRes.data) {
      setAppointments(aptRes.data);
    }

    const inqRes = await getContactInquiriesFromSupabase();
    if (inqRes.data) {
      setInquiries(inqRes.data);
    }
    setDataLoading(false);
  };

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSubmitting(true);

    const res = await loginAdmin(loginEmail, loginPassword);
    setAuthSubmitting(false);

    if (res.success && res.session) {
      setSession(res.session);
    } else {
      setAuthError(res.error || 'Invalid email or password.');
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    await logoutAdmin();
    setSession(null);
    setLoginPassword('');
    verifyAuth();
  };

  // Handle Appointment Status Change
  const handleStatusChange = async (bookingCode: string, newStatus: string) => {
    const res = await updateAppointmentStatusInSupabase(bookingCode, newStatus);
    if (res.success) {
      setAppointments((prev) =>
        prev.map((a) => (a.booking_code === bookingCode ? { ...a, status: newStatus } : a))
      );
      setActionSuccessMsg(`Booking ${bookingCode} marked as ${newStatus}`);
      setTimeout(() => setActionSuccessMsg(''), 3000);
    } else {
      alert('Error updating status: ' + (res.error || 'Unknown error'));
    }
  };

  // Handle Delete Appointment
  const handleDeleteAppointment = async (bookingCode: string) => {
    if (!window.confirm(`Are you sure you want to delete appointment ${bookingCode}?`)) {
      return;
    }
    const res = await deleteAppointmentFromSupabase(bookingCode);
    if (res.success) {
      setAppointments((prev) => prev.filter((a) => a.booking_code !== bookingCode));
      setActionSuccessMsg(`Booking ${bookingCode} removed.`);
      setTimeout(() => setActionSuccessMsg(''), 3000);
    } else {
      alert('Error deleting: ' + (res.error || ''));
    }
  };

  // Filtered Appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const matchesStatus =
        statusFilter === 'All' ||
        (apt.status || 'pending').toLowerCase() === statusFilter.toLowerCase();

      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        (apt.client_name && apt.client_name.toLowerCase().includes(q)) ||
        (apt.client_phone && apt.client_phone.includes(q)) ||
        (apt.booking_code && apt.booking_code.toLowerCase().includes(q)) ||
        (apt.service && apt.service.toLowerCase().includes(q)) ||
        (apt.artist && apt.artist.toLowerCase().includes(q));

      return matchesStatus && matchesSearch;
    });
  }, [appointments, statusFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = appointments.length;
    const pending = appointments.filter((a) => (a.status || 'pending').toLowerCase() === 'pending').length;
    const confirmed = appointments.filter((a) => (a.status || '').toLowerCase() === 'confirmed').length;
    const completed = appointments.filter((a) => (a.status || '').toLowerCase() === 'completed').length;
    return { total, pending, confirmed, completed };
  }, [appointments]);

  const copySQL = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA + '\n\n' + ADMIN_SETUP_SQL);
    setCopiedSQL(true);
    setTimeout(() => setCopiedSQL(false), 2500);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center text-zinc-400">
        <RefreshCw className="w-8 h-8 text-[#FFD60A] animate-spin" />
      </div>
    );
  }

  // ==========================================
  // VIEW A: NOT LOGGED IN (SIGN IN OR CLAIM SLOT)
  // ==========================================
  if (!session) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] text-zinc-200 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full mx-auto space-y-8 my-auto">
          {/* Brand Seal Header */}
          <div className="text-center space-y-3">
            <Link to="/" className="inline-block hover:scale-105 transition-transform">
              <PhoenixLogo size={68} className="mx-auto shadow-2xl" />
            </Link>
            <h1 className="font-serif text-3xl font-bold text-white tracking-tight">
              Phoenix Tattooz
            </h1>
            <p className="text-xs uppercase tracking-widest text-[#FFD60A] font-semibold">
              Administrative Control Portal
            </p>
          </div>

          {/* Card Container */}
          <div className="bg-[#141414] border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            {/* Admin Authentication Security Header */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3.5 flex items-start gap-3">
              <Lock className="w-4 h-4 text-[#FFD60A] shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-white">Protected Studio Administrator Portal</p>
                <p className="text-zinc-400 mt-0.5 text-[11px] leading-relaxed">
                  Sign in using your administrative credentials. Admin accounts are managed directly in Supabase Authentication.
                </p>
              </div>
            </div>

            {authError && (
              <div className="p-3 bg-rose-950/50 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{authError}</span>
              </div>
            )}

            {/* ADMIN LOGIN FORM */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Admin Username / Email
                </label>
                <input
                  type="text"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin or admin@phoenixtattooz.com"
                  required
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFD60A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="admin123"
                  required
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFD60A]"
                />
              </div>

              <button
                type="submit"
                disabled={authSubmitting}
                className="w-full bg-[#FFD60A] hover:bg-[#ffe033] active:scale-[0.99] text-black font-bold text-sm py-3 rounded-lg shadow-md transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {authSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-black" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-black" />
                    <span>Sign In to Admin Panel</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 text-center border-t border-zinc-800/80">
              <Link
                to="/"
                className="text-xs text-zinc-400 hover:text-white transition-colors"
              >
                &larr; Return to Studio Public Site
              </Link>
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-zinc-600">
          Phoenix Tattooz Studio &amp; Academy &bull; Hisar, Haryana &bull; Protected Management Area
        </p>
      </div>
    );
  }

  // ==========================================
  // VIEW B: LOGGED IN (FULL ADMIN DASHBOARD)
  // ==========================================
  interface AdminTabItem {
    id: 'appointments' | 'inquiries' | 'members' | 'hero' | 'about' | 'reviews' | 'artists' | 'gallery' | 'videos' | 'rewards';
    label: string;
    short: string;
    icon: any;
    badge?: number;
  }

  const tabsList: AdminTabItem[] = [
    { id: 'appointments', label: 'Bookings & Appointments', short: 'Bookings', icon: Calendar, badge: appointments.length },
    { id: 'members', label: 'Client Sign-Ins & Members', short: 'Members', icon: Users },
    { id: 'inquiries', label: 'Contact Messages', short: 'Messages', icon: MessageSquare, badge: inquiries.length },
    { id: 'reviews', label: 'Reviews & Studio Creed', short: 'Reviews', icon: Star },
    { id: 'artists', label: 'Manage Artists & Bios', short: 'Artists', icon: Users },
    { id: 'gallery', label: 'Manage Tattoo Gallery', short: 'Gallery', icon: Palette },
    { id: 'videos', label: 'Manage Video Gallery', short: 'Videos', icon: Video },
    { id: 'rewards', label: 'Gifts & Rewards Images', short: 'Rewards', icon: Gift },
    { id: 'hero', label: 'Home Loop Video & Hero', short: 'Hero Video', icon: Video },
    { id: 'about', label: 'About Section & Story', short: 'About Story', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-zinc-200">
      {/* Top Admin Bar - Clean, Fluid & Responsive */}
      <header className="sticky top-0 z-30 bg-[#141414]/95 backdrop-blur-md border-b border-zinc-800 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex items-center justify-between transition-all">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <PhoenixLogo size={38} className="shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-serif font-bold text-white text-sm sm:text-base truncate">
                Phoenix Admin
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-zinc-400 truncate max-w-[130px] sm:max-w-none">
              <span className="hidden sm:inline">Logged in as </span>
              <strong className="text-white">{session.full_name}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Go back to live side */}
          <Link
            to="/"
            className="text-[11px] sm:text-xs text-[#FFD60A] hover:text-black hover:bg-[#FFD60A] bg-amber-400/10 border border-amber-400/40 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg transition-all inline-flex items-center gap-1.5 font-semibold shrink-0 shadow-sm"
            title="Go back to live public website"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Go back to live side</span>
            <span className="sm:hidden">Live Site</span>
          </Link>

          {/* Refresh Database Button */}
          <button
            onClick={fetchData}
            title="Refresh database records"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${dataLoading ? 'animate-spin text-[#FFD60A]' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Log Out Button */}
          <button
            onClick={handleLogout}
            title="Log out of admin"
            className="flex items-center gap-1 text-xs font-semibold bg-rose-950/40 text-rose-300 border border-rose-800/40 hover:bg-rose-900/60 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Log Out</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-5 sm:space-y-6 pb-28 lg:pb-10 transition-all">
        {actionSuccessMsg && (
          <div className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 px-4 py-3 rounded-xl text-xs flex items-center justify-between animate-in fade-in duration-200">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {actionSuccessMsg}
            </span>
            <button onClick={() => setActionSuccessMsg('')} className="text-emerald-400 hover:text-white text-xs">
              &times;
            </button>
          </div>
        )}

        {/* 4 Stats Cards - Responsive 2x2 grid on mobile, 4 columns on laptop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="bg-[#161616] border border-zinc-800 rounded-xl p-3 sm:p-4 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] sm:text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Bookings</p>
              <p className="text-xl sm:text-2xl font-bold font-serif text-white mt-0.5 sm:mt-1">{stats.total}</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-300">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFD60A]" />
            </div>
          </div>

          <div className="bg-[#161616] border border-zinc-800 rounded-xl p-3 sm:p-4 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] sm:text-[11px] font-semibold text-amber-400 uppercase tracking-wider">Pending Action</p>
              <p className="text-xl sm:text-2xl font-bold font-serif text-amber-300 mt-0.5 sm:mt-1">{stats.pending}</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>

          <div className="bg-[#161616] border border-zinc-800 rounded-xl p-3 sm:p-4 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] sm:text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">Confirmed</p>
              <p className="text-xl sm:text-2xl font-bold font-serif text-emerald-300 mt-0.5 sm:mt-1">{stats.confirmed}</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>

          <div className="bg-[#161616] border border-zinc-800 rounded-xl p-3 sm:p-4 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] sm:text-[11px] font-semibold text-blue-400 uppercase tracking-wider">Completed Inks</p>
              <p className="text-xl sm:text-2xl font-bold font-serif text-blue-300 mt-0.5 sm:mt-1">{stats.completed}</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* RESPONSIVE NAVIGATION: LAPTOP HORIZONTAL BAR + MOBILE CONTROLS */}
        {/* ============================================================== */}

        {/* Navigation Tabs - Responsive: Mobile Dropdown + Fluid Tabs Ribbon */}
        <div className="space-y-3">
          {/* Mobile Select Menu for Fast Touch Navigation */}
          <div className="lg:hidden relative">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as any)}
              className="w-full bg-[#181818] border border-zinc-700/80 text-white font-bold text-xs rounded-xl px-3.5 py-3 appearance-none focus:outline-none focus:border-[#FFD60A] shadow-md pr-10 cursor-pointer"
            >
              <option value="appointments">📅 Bookings &amp; Appointments ({appointments.length})</option>
              <option value="members">👥 Client Members &amp; Live Sign-Ins</option>
              <option value="inquiries">✉️ Contact Messages ({inquiries.length})</option>
              <option value="reviews">⭐ Client Reviews &amp; Creed Moderation</option>
              <option value="artists">👥 Manage Artists &amp; Bios</option>
              <option value="gallery">🎨 Manage Tattoo Gallery (Photos)</option>
              <option value="videos">🎬 Manage Video Gallery &amp; Reels</option>
              <option value="rewards">🎁 Gifts &amp; Rewards Images (3 Tiers)</option>
              <option value="hero">🎬 Home Section 1 Loop Video &amp; Image</option>
              <option value="about">📄 About Section &amp; Story</option>
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FFD60A] pointer-events-none" />
          </div>

          {/* Fluid Horizontal Tab Ribbon (Works beautifully on all screens) */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-2 border-b border-zinc-800">
            {tabsList.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-[#FFD60A] text-black shadow-md font-bold'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-850 border border-zinc-800'
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-0.5 ${
                      isActive ? 'bg-black text-white' : 'bg-zinc-800 text-[#FFD60A]'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: APPOINTMENTS */}
        {/* ============================================================== */}
        {activeTab === 'appointments' && (
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#161616] p-3 rounded-xl border border-zinc-800">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by client name, phone, booking ID, artist, or service..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
                />
              </div>

              {/* Status Filter Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                      statusFilter === st
                        ? 'bg-zinc-800 text-[#FFD60A] font-bold border border-zinc-700'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Bookings List */}
            {dataLoading ? (
              <div className="py-20 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-[#FFD60A] animate-spin mx-auto" />
                <p className="text-xs text-zinc-400 font-medium">Loading bookings from Supabase database...</p>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="bg-[#161616] border border-zinc-800 rounded-2xl p-12 text-center space-y-3">
                <Calendar className="w-10 h-10 text-zinc-600 mx-auto" />
                <h3 className="font-serif font-bold text-lg text-white">No Bookings Found</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  {searchQuery || statusFilter !== 'All'
                    ? 'No appointments matched your search filters.'
                    : 'Appointments submitted by clients on the website will instantly appear here.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAppointments.map((apt) => {
                  const status = (apt.status || 'pending').toLowerCase();
                  const statusColors: Record<string, string> = {
                    pending: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
                    confirmed: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
                    completed: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
                    cancelled: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
                  };

                  const whatsappMessage = encodeURIComponent(
                    `Hello ${apt.client_name}! This is Phoenix Tattooz Studio & Academy (Hisar). Regarding your booking #${apt.booking_code} for ${apt.service} with ${apt.artist} on ${apt.appointment_date} at ${apt.time_slot}.`
                  );

                  return (
                    <div
                      key={apt.id || apt.booking_code}
                      className="bg-[#161616] border border-zinc-800 rounded-xl p-4 sm:p-5 hover:border-zinc-700 transition-colors space-y-4"
                    >
                      {/* Row 1: Header */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-bold text-[#FFD60A] bg-black/60 px-2.5 py-1 rounded border border-zinc-800">
                            {apt.booking_code}
                          </span>
                          <span className="font-serif font-bold text-base text-white">
                            {apt.client_name}
                          </span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${statusColors[status] || statusColors.pending}`}>
                            {apt.status || 'Pending'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-zinc-400">
                            {apt.created_at ? new Date(apt.created_at).toLocaleString() : ''}
                          </span>
                        </div>
                      </div>

                      {/* Row 2: Details Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                        <div>
                          <span className="text-zinc-500 block text-[10px] uppercase tracking-wider">Service</span>
                          <span className="font-semibold text-white">{apt.service}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-[10px] uppercase tracking-wider">Assigned Artist</span>
                          <span className="font-semibold text-[#FFD60A]">{apt.artist}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-[10px] uppercase tracking-wider">Appointment Schedule</span>
                          <span className="font-semibold text-zinc-200">
                            {apt.appointment_date} &bull; {apt.time_slot}
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-[10px] uppercase tracking-wider">Client Phone</span>
                          <a
                            href={`tel:${apt.client_phone}`}
                            className="font-semibold text-zinc-200 hover:text-white underline tracking-wide"
                          >
                            {apt.client_phone}
                          </a>
                        </div>
                      </div>

                      {/* Row 3: Placement, Size & Client Notes */}
                      <div className="bg-zinc-900/60 p-3 rounded-lg border border-zinc-800/60 text-xs text-zinc-300 space-y-1">
                        <div className="flex flex-wrap items-center gap-4">
                          <span><strong>Placement:</strong> {apt.placement || 'Not specified'}</span>
                          <span><strong>Size:</strong> {apt.size || 'Standard'}</span>
                        </div>
                        {apt.notes && (
                          <p className="text-zinc-400 pt-1 text-[11px] italic">
                            &ldquo;{apt.notes}&rdquo;
                          </p>
                        )}
                      </div>

                      {/* Row 4: Action Controls */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        {/* Quick Status Selectors */}
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-zinc-400 font-medium">Update Status:</span>
                          <button
                            onClick={() => handleStatusChange(apt.booking_code, 'confirmed')}
                            disabled={status === 'confirmed'}
                            className="px-2.5 py-1 rounded bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold cursor-pointer disabled:opacity-40"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => handleStatusChange(apt.booking_code, 'completed')}
                            disabled={status === 'completed'}
                            className="px-2.5 py-1 rounded bg-blue-950/40 hover:bg-blue-900/60 border border-blue-500/30 text-blue-300 text-[11px] font-semibold cursor-pointer disabled:opacity-40"
                          >
                            Completed
                          </button>
                          <button
                            onClick={() => handleStatusChange(apt.booking_code, 'cancelled')}
                            disabled={status === 'cancelled'}
                            className="px-2.5 py-1 rounded bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 text-[11px] font-semibold cursor-pointer disabled:opacity-40"
                          >
                            Cancel
                          </button>
                        </div>

                        {/* WhatsApp Dispatch & Delete */}
                        <div className="flex items-center gap-2">
                          {apt.client_phone && (
                            <a
                              href={`https://wa.me/${(apt.client_phone || '').replace(/\D/g, '')}?text=${whatsappMessage}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>WhatsApp Client</span>
                            </a>
                          )}
                          <button
                            onClick={() => handleDeleteAppointment(apt.booking_code)}
                            title="Delete booking"
                            className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB: CLIENT MEMBERS & LIVE SIGN-INS */}
        {/* ============================================================== */}
        {activeTab === 'members' && (
          <div className="space-y-4">
            <AdminMembersManager />
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: CONTACT INQUIRIES */}
        {/* ============================================================== */}
        {activeTab === 'inquiries' && (
          <div className="space-y-4">
            {inquiries.length === 0 ? (
              <div className="bg-[#161616] border border-zinc-800 rounded-2xl p-12 text-center space-y-3">
                <Mail className="w-10 h-10 text-zinc-600 mx-auto" />
                <h3 className="font-serif font-bold text-lg text-white">No Contact Messages Yet</h3>
                <p className="text-xs text-zinc-400">
                  Submissions sent through the Contact Us form will be archived here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {inquiries.map((inq) => (
                  <div
                    key={inq.id || inq.created_at}
                    className="bg-[#161616] border border-zinc-800 rounded-xl p-5 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-white text-base">
                          {inq.name}
                        </span>
                        <span className="text-xs text-[#FFD60A] font-medium">
                          ({inq.service || 'Inquiry'})
                        </span>
                      </div>
                      <span className="text-xs text-zinc-500">
                        {inq.created_at ? new Date(inq.created_at).toLocaleString() : ''}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs text-zinc-400">
                      <span><strong>Phone:</strong> <a href={`tel:${inq.phone}`} className="text-white underline">{inq.phone}</a></span>
                      {inq.email && <span><strong>Email:</strong> {inq.email}</span>}
                    </div>

                    {inq.message && (
                      <p className="text-xs text-zinc-300 bg-zinc-900/60 p-3 rounded-lg border border-zinc-800/60">
                        {inq.message}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB: CUSTOMIZE HOME FIRST IMAGE & SAME SKIN SLOGAN */}
        {/* ============================================================== */}
        {activeTab === 'hero' && (
          <div className="space-y-4">
            <AdminHeroManager />
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB: CUSTOMIZE ABOUT SECTION IMAGE & DESCRIPTION */}
        {/* ============================================================== */}
        {activeTab === 'about' && (
          <div className="space-y-4">
            <AdminAboutManager />
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB: CUSTOMER REVIEWS & STUDIO PHILOSOPHY */}
        {/* ============================================================== */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <AdminReviewsManager />
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: MANAGE ARTISTS & BIOS */}
        {/* ============================================================== */}
        {activeTab === 'artists' && (
          <div className="space-y-4">
            <AdminArtistsManager />
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: MANAGE TATTOO GALLERY */}
        {/* ============================================================== */}
        {activeTab === 'gallery' && (
          <div className="space-y-4">
            <AdminGalleryManager />
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB: MANAGE VIDEO GALLERY & REELS */}
        {/* ============================================================== */}
        {activeTab === 'videos' && (
          <div className="space-y-4">
            <AdminVideoGalleryManager />
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB: GIFTS & REWARDS IMAGES (ALL 3 TIERS) */}
        {/* ============================================================== */}
        {activeTab === 'rewards' && (
          <div className="space-y-4">
            <AdminRewardsManager />
          </div>
        )}

      </main>

      {/* Mobile Admin Bottom Dock (Visible on Mobile/Tablet screens < 1024px) */}
      <nav
        aria-label="Mobile Admin Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#121212]/95 backdrop-blur-xl border-t border-zinc-800 px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(0,0,0,0.7)]"
      >
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {/* Bookings */}
          <button
            onClick={() => setActiveTab('appointments')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'appointments'
                ? 'text-[#FFD60A] font-bold scale-105'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <div className="relative">
              <Calendar className="w-5 h-5 mb-0.5" />
              {appointments.length > 0 && (
                <span className="absolute -top-1 -right-2 bg-[#FFD60A] text-black font-extrabold text-[9px] px-1 rounded-full">
                  {appointments.length}
                </span>
              )}
            </div>
            <span className="text-[10px]">Bookings</span>
          </button>

          {/* Reviews */}
          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'reviews'
                ? 'text-[#FFD60A] font-bold scale-105'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Star className={`w-5 h-5 mb-0.5 ${activeTab === 'reviews' ? 'fill-[#FFD60A]' : ''}`} />
            <span className="text-[10px]">Reviews</span>
          </button>

          {/* Artists */}
          <button
            onClick={() => setActiveTab('artists')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'artists'
                ? 'text-[#FFD60A] font-bold scale-105'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Users className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Artists</span>
          </button>

          {/* Gallery */}
          <button
            onClick={() => setActiveTab('gallery')}
            className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'gallery'
                ? 'text-[#FFD60A] font-bold scale-105'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Palette className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Gallery</span>
          </button>

          {/* Live Site (Return to Public Website) */}
          <Link
            to="/"
            className="flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all text-[#FFD60A] hover:text-white cursor-pointer active:scale-95"
            title="Go back to live public website"
          >
            <ArrowLeft className="w-5 h-5 mb-0.5 text-[#FFD60A]" />
            <span className="text-[10px] font-bold text-[#FFD60A] whitespace-nowrap">Live Side</span>
          </Link>

          {/* More Tools Drawer Button */}
          <button
            onClick={() => setMobileMoreDrawerOpen(!mobileMoreDrawerOpen)}
            className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all cursor-pointer ${
              ['members', 'hero', 'about', 'inquiries', 'videos', 'rewards'].includes(activeTab) || mobileMoreDrawerOpen
                ? 'text-[#FFD60A] font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Layers className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">More</span>
          </button>
        </div>
      </nav>

      {/* Slide-Up Mobile Admin "More Tools" Drawer */}
      {mobileMoreDrawerOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-200"
          onClick={() => setMobileMoreDrawerOpen(false)}
        >
          <div 
            className="bg-[#181818] border-t-2 border-[#FFD60A]/40 rounded-t-3xl p-5 space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-5 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFD60A]" />
                <h3 className="font-serif font-bold text-white text-base">All Admin Studio Tools</h3>
              </div>
              <button 
                onClick={() => setMobileMoreDrawerOpen(false)}
                className="p-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <button
                onClick={() => { setActiveTab('members'); setMobileMoreDrawerOpen(false); }}
                className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-left space-y-1 col-span-2 bg-gradient-to-r from-amber-500/10 to-transparent border-amber-500/30"
              >
                <div className="flex items-center gap-2 text-white font-bold">
                  <Users className="w-4 h-4 text-[#FFD60A]" />
                  <span>Client Members &amp; Live Sign-Ins</span>
                </div>
                <p className="text-[10px] text-zinc-400">DOB, instant birthday discount codes, live login monitoring</p>
              </button>

              <button
                onClick={() => { setActiveTab('appointments'); setMobileMoreDrawerOpen(false); }}
                className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-left space-y-1"
              >
                <div className="flex items-center gap-2 text-white font-bold">
                  <Calendar className="w-4 h-4 text-[#FFD60A]" />
                  <span>Bookings</span>
                </div>
                <p className="text-[10px] text-zinc-400">{appointments.length} clients booked</p>
              </button>

              <button
                onClick={() => { setActiveTab('inquiries'); setMobileMoreDrawerOpen(false); }}
                className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-left space-y-1"
              >
                <div className="flex items-center gap-2 text-white font-bold">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>Messages</span>
                </div>
                <p className="text-[10px] text-zinc-400">{inquiries.length} contact queries</p>
              </button>

              <button
                onClick={() => { setActiveTab('reviews'); setMobileMoreDrawerOpen(false); }}
                className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-left space-y-1"
              >
                <div className="flex items-center gap-2 text-white font-bold">
                  <Star className="w-4 h-4 text-[#FFD60A]" />
                  <span>Reviews &amp; Creed</span>
                </div>
                <p className="text-[10px] text-zinc-400">Moderate &amp; add reviews</p>
              </button>

              <button
                onClick={() => { setActiveTab('artists'); setMobileMoreDrawerOpen(false); }}
                className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-left space-y-1"
              >
                <div className="flex items-center gap-2 text-white font-bold">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span>Manage Artists</span>
                </div>
                <p className="text-[10px] text-zinc-400">Bios, specialties &amp; photos</p>
              </button>

              <button
                onClick={() => { setActiveTab('gallery'); setMobileMoreDrawerOpen(false); }}
                className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-left space-y-1"
              >
                <div className="flex items-center gap-2 text-white font-bold">
                  <Palette className="w-4 h-4 text-purple-400" />
                  <span>Tattoo Photos</span>
                </div>
                <p className="text-[10px] text-zinc-400">Add &amp; delete tattoo photos</p>
              </button>

              <button
                onClick={() => { setActiveTab('videos'); setMobileMoreDrawerOpen(false); }}
                className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-left space-y-1"
              >
                <div className="flex items-center gap-2 text-white font-bold">
                  <Video className="w-4 h-4 text-amber-300" />
                  <span>Video Gallery</span>
                </div>
                <p className="text-[10px] text-zinc-400">Reels, process &amp; work videos</p>
              </button>

              <button
                onClick={() => { setActiveTab('hero'); setMobileMoreDrawerOpen(false); }}
                className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-left space-y-1"
              >
                <div className="flex items-center gap-2 text-white font-bold">
                  <ImageIcon className="w-4 h-4 text-amber-400" />
                  <span>Home First Image</span>
                </div>
                <p className="text-[10px] text-zinc-400">Same Skin Different Story</p>
              </button>

              <button
                onClick={() => { setActiveTab('about'); setMobileMoreDrawerOpen(false); }}
                className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-left space-y-1"
              >
                <div className="flex items-center gap-2 text-white font-bold">
                  <FileText className="w-4 h-4 text-teal-400" />
                  <span>About Section</span>
                </div>
                <p className="text-[10px] text-zinc-400">Story &amp; studio description</p>
              </button>

              <button
                onClick={() => { setActiveTab('rewards'); setMobileMoreDrawerOpen(false); }}
                className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-left space-y-1"
              >
                <div className="flex items-center gap-2 text-white font-bold">
                  <Gift className="w-4 h-4 text-[#FFD60A]" />
                  <span>Rewards Images</span>
                </div>
                <p className="text-[10px] text-zinc-400">Change 3 tier reward images</p>
              </button>
            </div>

            <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
              <Link
                to="/"
                className="text-xs text-[#FFD60A] font-bold flex items-center gap-1.5 bg-amber-400/10 border border-amber-400/30 px-3 py-1.5 rounded-lg hover:bg-amber-400/20 transition-colors"
                title="Go back to live public website"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Go back to live side</span>
              </Link>
              <button
                onClick={handleLogout}
                className="text-xs text-rose-400 font-semibold flex items-center gap-1 bg-rose-950/30 border border-rose-800/30 px-2.5 py-1.5 rounded-lg hover:bg-rose-900/40 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
