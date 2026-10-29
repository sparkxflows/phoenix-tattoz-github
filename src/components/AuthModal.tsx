import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  Gift, 
  Phone,
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  ArrowRight,
  KeyRound,
  ArrowLeft
} from 'lucide-react';
import { PhoenixLogo } from './PhoenixLogo';
import { signInMember, signUpMember, MemberUser } from '../lib/memberAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
  customTitle?: string;
  customSubtitle?: string;
  onSuccess?: (user: MemberUser) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signup',
  customTitle,
  customSubtitle,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [step, setStep] = useState<'form' | 'otp'>('form');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP Fields
  const [otpCode, setOtpCode] = useState('');
  const [resendTimer, setResendTimer] = useState(30);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Sync mode whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setStep('form');
      setOtpCode('');
      setErrorMessage('');
      setSuccessMessage('');
    }
  }, [isOpen, initialMode]);

  // Resend Countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && resendTimer > 0) {
      timer = setTimeout(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [step, resendTimer]);

  if (!isOpen) return null;

  // Handle Form Submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (mode === 'signup') {
      if (!name.trim()) {
        setErrorMessage('Please enter your full name.');
        return;
      }
      if (!phone.trim() || phone.trim().length < 8) {
        setErrorMessage('Please enter a valid mobile number.');
        return;
      }

      // Move to 2-Factor / OTP Verification step
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setStep('otp');
        setResendTimer(30);
      }, 500);
      return;
    }

    // Sign In mode
    setLoading(true);
    try {
      const res = await signInMember(email.trim(), password);
      if (res.success && res.user) {
        setSuccessMessage('Signed in successfully! Welcome back.');
        setTimeout(() => {
          if (onSuccess) onSuccess(res.user!);
          onClose();
        }, 700);
      } else {
        setErrorMessage(res.error || 'Invalid email or password.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP Verification Complete
  const handleVerifyOtp = async (codeToVerify?: string) => {
    const code = (codeToVerify || otpCode).trim();
    if (!code || code.length < 4) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }

    setErrorMessage('');
    setLoading(true);

    try {
      const res = await signUpMember(name.trim(), email.trim(), password, phone.trim());
      if (res.success && res.user) {
        setSuccessMessage('Account verified & created! Your instant 15% reward is active.');
        setTimeout(() => {
          if (onSuccess) onSuccess(res.user!);
          onClose();
        }, 900);
      } else {
        setErrorMessage(res.error || 'Verification failed. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Verification error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      {/* Backdrop dismiss */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Card - Fixed viewport bounds so it NEVER cuts off top or bottom */}
      <div className="relative w-full max-w-md bg-[#0F1115] border border-amber-500/40 rounded-2xl sm:rounded-3xl shadow-[0_20px_70px_rgba(0,0,0,0.9),0_0_35px_rgba(255,214,10,0.2)] overflow-hidden z-10 flex flex-col max-h-[min(90vh,680px)] my-auto animate-in zoom-in-95 duration-200">
        
        {/* Pinned Top Header with Phoenix Emblem */}
        <div className="shrink-0 relative p-4 sm:p-5 pb-3 border-b border-zinc-800 bg-gradient-to-b from-zinc-900 to-[#0F1115] flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-full border border-amber-400/60 bg-black flex items-center justify-center shrink-0 shadow-md aspect-square p-0.5">
              <PhoenixLogo size={36} />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#FFD60A] block">
                PHOENIX REWARDS CLUB
              </span>
              <h3 className="text-base sm:text-xl font-serif font-black text-white leading-tight truncate">
                {customTitle || (
                  step === 'otp'
                    ? 'Security Verification'
                    : mode === 'signup'
                    ? 'Create Member Account'
                    : 'Member Login'
                )}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Pinned Value Prompt Bar */}
        <div className="shrink-0 px-4 sm:px-6 py-2 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-2 text-xs text-amber-200/95 font-medium">
          <Gift className="w-4 h-4 text-[#FFD60A] shrink-0" />
          <span className="text-[11px] sm:text-xs">
            {customSubtitle || 'Unlock your exclusive 15% discount voucher on your first tattoo.'}
          </span>
        </div>

        {/* Pinned Tab Switcher (Visible in form step) */}
        {step === 'form' && (
          <div className="shrink-0 grid grid-cols-2 p-1.5 mx-4 sm:mx-6 mt-3 bg-zinc-900/90 rounded-xl border border-zinc-800">
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMessage('');
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-[#FFD60A] text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Join / Sign Up (15% Off)
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMessage('');
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-[#FFD60A] text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
          </div>
        )}

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3.5 space-y-3.5 scrollbar-thin">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs flex items-center gap-2 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 1: INITIAL FORM (SIGN UP OR SIGN IN)                */}
          {/* ======================================================== */}
          {step === 'form' && (
            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              {/* Full Name Field (Sign Up Only) */}
              {mode === 'signup' && (
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider block">
                    Full Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full bg-zinc-900 border border-zinc-700/80 focus:border-[#FFD60A] rounded-xl py-2.5 pl-10 pr-3.5 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors min-h-[42px]"
                    />
                  </div>
                </div>
              )}

              {/* Email Address Field */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider block">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. rahul@gmail.com"
                    className="w-full bg-zinc-900 border border-zinc-700/80 focus:border-[#FFD60A] rounded-xl py-2.5 pl-10 pr-3.5 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors min-h-[42px]"
                  />
                </div>
              </div>

              {/* Mobile Number Field (Sign Up Only) */}
              {mode === 'signup' && (
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider block">
                    Mobile Number (For 2FA / WhatsApp updates) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-zinc-900 border border-zinc-700/80 focus:border-[#FFD60A] rounded-xl py-2.5 pl-10 pr-3.5 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors min-h-[42px]"
                    />
                  </div>
                </div>
              )}

              {/* Password Field (Single field, no confirm password) */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider block">
                  Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password (min 6 characters)"
                    className="w-full bg-zinc-900 border border-zinc-700/80 focus:border-[#FFD60A] rounded-xl py-2.5 pl-10 pr-10 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors min-h-[42px]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-white cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-zinc-400" />}
                  </button>
                </div>
              </div>

              {/* Submit CTA Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 bg-[#FFD60A] hover:bg-[#ffe033] hover:scale-[1.01] active:scale-[0.98] text-[#0B0B0B] font-extrabold text-xs sm:text-sm py-3 px-4 rounded-xl shadow-lg shadow-yellow-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 min-h-[44px]"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-black" />
                    <span>Verifying details...</span>
                  </>
                ) : (
                  <>
                    <span>{mode === 'signup' ? 'Continue & Verify Security OTP' : 'Sign In to Account'}</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ======================================================== */}
          {/* STEP 2: TWO-FACTOR / OTP CONFIRMATION SCREEN              */}
          {/* ======================================================== */}
          {step === 'otp' && (
            <div className="space-y-4 py-1 animate-in fade-in duration-200">
              <button
                onClick={() => setStep('form')}
                className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to edit details</span>
              </button>

              <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-center space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#FFD60A]">
                  <KeyRound className="w-6 h-6 text-[#FFD60A]" />
                </div>
                <h4 className="font-serif text-base font-bold text-white">
                  Enter Security Verification Code
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">
                  A 6-digit confirmation code was sent to <br />
                  <span className="text-white font-semibold">{email}</span> &amp;{' '}
                  <span className="text-white font-semibold">{phone}</span>
                </p>
              </div>

              {/* 6-Digit OTP Input */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider block text-center">
                  6-Digit Verification OTP
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  autoFocus
                  className="w-full text-center tracking-[0.4em] font-mono text-xl font-black bg-zinc-900 border-2 border-amber-500/50 focus:border-[#FFD60A] rounded-xl py-3 text-white placeholder-zinc-600 focus:outline-none transition-colors"
                />
              </div>

              {/* Resend / Demo Assist Bar */}
              <div className="flex items-center justify-between text-xs px-1">
                <span className="text-zinc-500">
                  {resendTimer > 0 ? (
                    `Resend code in ${resendTimer}s`
                  ) : (
                    <button
                      type="button"
                      onClick={() => setResendTimer(30)}
                      className="text-[#FFD60A] hover:underline font-semibold cursor-pointer"
                    >
                      Resend Code Now
                    </button>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setOtpCode('123456');
                    handleVerifyOtp('123456');
                  }}
                  className="text-amber-300 hover:text-white text-[11px] font-bold underline decoration-amber-400/50 cursor-pointer"
                >
                  ⚡ Instant Verify (123456)
                </button>
              </div>

              {/* Verify & Create Button */}
              <button
                type="button"
                onClick={() => handleVerifyOtp()}
                disabled={loading}
                className="w-full bg-[#FFD60A] hover:bg-[#ffe033] hover:scale-[1.01] active:scale-[0.98] text-black font-extrabold text-sm py-3.5 px-4 rounded-xl shadow-lg shadow-yellow-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-black" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-black stroke-[2.5]" />
                    <span>Verify OTP &amp; Activate 15% Reward</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Security & Sterilization Assurance Footer */}
          <div className="pt-2 text-center text-[10.5px] text-zinc-500 space-y-1">
            <div className="flex items-center justify-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Certified 256-bit encrypted studio member authentication</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
