import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Clock, 
  Mail, 
  Send, 
  MessageSquare, 
  CheckCircle2, 
  Calendar,
  Compass
} from 'lucide-react';
import { STUDIO_INFO } from '../data/studioData';
import { DragonOrnament, RoseOrnament } from '../components/Ornaments';
import { saveContactToSupabase } from '../lib/supabase';
import { WhatsAppIcon } from '../components/WhatsAppIcon';

interface ContactProps {
  onOpenBooking: () => void;
}

export const Contact: React.FC<ContactProps> = ({ onOpenBooking }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    service: 'Custom Tattooing',
    message: '',
  });
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; phone?: string } = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.phone.trim() || formData.phone.length < 10) {
      newErrors.phone = 'Valid 10-digit phone number is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    // Save to Supabase
    await saveContactToSupabase({
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      service: formData.service,
      message: formData.message.trim(),
    });

    setIsSubmitting(false);
    setSubmitted(true);
  };

  const openWhatsApp = () => {
    const text = encodeURIComponent(
      `Hello Phoenix Tattooz! My name is ${formData.name || 'a client'}. I would like to inquire about ${formData.service}. Contact: ${formData.phone || ''}`
    );
    window.open(`https://wa.me/919992969919?text=${text}`, '_blank');
  };

  return (
    <div className="bg-[#090A0D] text-zinc-100 min-h-screen pb-16 md:pb-0">
      {/* 1. HERO HEADER */}
      <section className="relative overflow-hidden bg-[#0B0B0B] text-white py-16 sm:py-24 border-b border-[#222222]">
        <RoseOrnament className="absolute -right-12 top-6 w-72 h-72 text-zinc-300/20" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-0.5 bg-[#FFD60A]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#FFD60A]">
                GET IN TOUCH
              </span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight">
              Visit Our Studio in Hisar
            </h1>

            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
              Have a question about your tattoo concept, cover-up, or academy enrollment? Reach out directly or drop by Red Square Market.
            </p>
          </div>
        </div>
      </section>

      {/* 2. CONTACT DETAILS & FORM */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Details */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-6">
              {/* Studio Locations: Both Branches */}
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#FFD60A]/15 border border-[#FFD60A]/30 flex items-center justify-center shrink-0 text-[#FFD60A]">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif font-bold text-lg text-white">Branch 1 &bull; Red Square Market</h3>
                      <span className="text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">Main Studio</span>
                    </div>
                    <p className="text-sm text-zinc-300 mt-1 leading-relaxed">
                      {STUDIO_INFO.address}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1 font-medium">
                      Landmarks: Above SCO-159 &bull; Near Bikaner Sweets &amp; Pahuja Bakers
                    </p>
                  </div>
                </div>

                {/* Branch 2 - Red Accent Highlight */}
                <div className="flex items-start gap-4 p-3.5 rounded-2xl bg-red-950/25 border border-red-500/35">
                  <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center shrink-0 text-red-500 shadow-md shadow-red-950/40">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif font-bold text-lg text-white">Branch 2 &bull; Silver Square Mall</h3>
                      <span className="text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded shadow">📍 New Branch</span>
                    </div>
                    <p className="text-sm text-red-100 font-medium mt-1 leading-relaxed">
                      {STUDIO_INFO.address2}
                    </p>
                    <p className="text-xs text-red-300/80 mt-1 font-medium">
                      Landmarks: Ground Floor, Shop 30 &bull; Rajguru Market Central
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#FFD60A]/15 border border-[#FFD60A]/30 flex items-center justify-center shrink-0 text-[#FFD60A]">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-white">Call / WhatsApp</h3>
                  <p className="text-sm text-zinc-300 mt-1">
                    Direct studio hotline:
                  </p>
                  <a
                    href={`tel:${STUDIO_INFO.phone}`}
                    className="text-base font-bold text-white hover:text-[#FFD60A] underline tracking-wider block mt-0.5 transition-colors"
                  >
                    {STUDIO_INFO.displayPhone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#FFD60A]/15 border border-[#FFD60A]/30 flex items-center justify-center shrink-0 text-[#FFD60A]">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-white">Operating Hours</h3>
                  <p className="text-sm text-zinc-300 mt-1">
                    {STUDIO_INFO.hours}
                  </p>
                  <span className="inline-block mt-2 text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 px-2.5 py-1 rounded-md">
                    Open All 7 Days
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Consultation CTA */}
            <div className="bg-zinc-900 text-white p-6 rounded-2xl border border-zinc-800 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FFD60A] animate-ping" />
                <span className="text-xs font-bold text-[#FFD60A] uppercase tracking-wider">
                  Need Fast Answers?
                </span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Connect directly with Rohit Sharma and senior artists on WhatsApp for rapid size &amp; price estimations.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={openWhatsApp}
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs py-2.5 px-4 rounded-lg cursor-pointer transition-colors"
                >
                  <WhatsAppIcon className="w-4 h-4 text-black" />
                  <span>WhatsApp Chat</span>
                </button>
                <button
                  onClick={onOpenBooking}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#FFD60A] hover:bg-yellow-400 text-black font-bold text-xs py-2.5 px-4 rounded-lg cursor-pointer transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Visit</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right: Interactive Form */}
          <div className="lg:col-span-7 bg-[#0D0E12] border border-white/[0.08] p-8 rounded-2xl shadow-sm">
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-white">
                  Message Sent Successfully
                </h3>
                <p className="text-sm text-zinc-300 max-w-md mx-auto">
                  Thank you, <strong className="text-white">{formData.name}</strong>. Our team at Phoenix Tattooz Hisar has received your request and will call you shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-xs font-bold text-[#FFD60A] hover:underline pt-2 cursor-pointer"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="mb-4">
                  <h3 className="font-serif text-2xl font-bold text-white">
                    Send Us a Message
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    Fill out the form below and we will get back to you within 2 hours during studio hours.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Placeholder for Full Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full bg-[#13151A] border rounded-lg px-3.5 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-[#FFD60A] ${
                        errors.name ? 'border-rose-400' : 'border-zinc-800'
                      }`}
                      required
                    />
                    {errors.name && (
                      <p className="text-xs text-rose-500 mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      placeholder="Placeholder for Phone Number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={`w-full bg-[#13151A] border rounded-lg px-3.5 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-[#FFD60A] ${
                        errors.phone ? 'border-rose-400' : 'border-zinc-800'
                      }`}
                      required
                    />
                    {errors.phone && (
                      <p className="text-xs text-rose-500 mt-1">{errors.phone}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="Placeholder for Email Address"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-[#13151A] border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-[#FFD60A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Service of Interest
                    </label>
                    <select
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="w-full bg-[#13151A] border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-[#FFD60A]"
                    >
                      <option value="Custom Tattooing">Custom Tattooing</option>
                      <option value="Commercial Tattoo">Commercial Tattoo</option>
                      <option value="Cover-Up Tattoo">Cover-Up Tattoo</option>
                      <option value="Black & Grey Realism">Black &amp; Grey Realism</option>
                      <option value="Cosmetic Tattooing">Cosmetic Tattooing (Brows/Lips)</option>
                      <option value="Laser Tattoo Removal">Laser Tattoo Removal</option>
                      <option value="Academy Apprenticeship">Tattoo Academy Course</option>
                      <option value="Body Piercing">Body Piercing</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Tell Us About Your Idea
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Placeholder for Design Notes or Query Details"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-[#13151A] border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-[#FFD60A]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-[#FFD60A] hover:bg-[#ffe033] text-black font-bold text-sm py-3.5 rounded-lg shadow-md transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4 text-black" />
                  <span>Send Message to Phoenix Studio</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 3. STUDIO MAP SECTION (Contained & Responsive) */}
      <section className="bg-[#090A0D] border-t border-white/[0.08] py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <Compass className="w-5 h-5 text-[#FFD60A]" />
              <span className="font-serif font-bold text-base sm:text-lg text-white">
                Studio Location &bull; Red Square Market, Hisar
              </span>
            </div>
            <a
              href="https://maps.google.com/?q=Red+Square+Market+Hisar+Haryana"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold text-[#FFD60A] hover:underline inline-flex items-center gap-1"
            >
              <span>Open in Google Maps</span>
              <span>&rarr;</span>
            </a>
          </div>

          <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-zinc-950 aspect-[16/9] max-h-[420px] w-full">
            <iframe
              title="Phoenix Tattooz Studio Location Map in Hisar"
              src="https://maps.google.com/maps?q=Red+Square+Market+Hisar+Haryana&t=&z=16&ie=UTF8&iwloc=&output=embed"
              className="w-full h-full border-0"
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </div>
  );
};
