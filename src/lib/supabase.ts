import { createClient } from '@supabase/supabase-js';

// Project credentials provided by the user
const getEnvVar = (name: string, fallback: string): string => {
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env[name]) {
      return (import.meta as any).env[name];
    }
  } catch {}
  try {
    if (typeof process !== 'undefined' && process.env && process.env[name]) {
      return process.env[name] as string;
    }
  } catch {}
  return fallback;
};

// ---------------------------------------------------------------------------
// CONFIGURATION
// Nothing secret is ever hardcoded here: the project URL and the *publishable*
// (anon) key are injected at build time from VITE_* variables.
// ---------------------------------------------------------------------------
const RAW_URL = getEnvVar('VITE_SUPABASE_URL', 'https://hadecaexijgjjzsweyuu.supabase.co').trim();
const RAW_KEY = getEnvVar('VITE_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhZGVjYWV4aWpnamp6c3dleXV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyMDQ1NTcsImV4cCI6MjEwODc4MDU1N30.fVebR00XLhQYMNTqYq1LUdCvOmvsMINPgQO3O__9p6Y').trim();
const REMOTE_REQUESTED = getEnvVar('VITE_USE_REMOTE_SUPABASE', 'true').trim() === 'true';

const URL_LOOKS_VALID = /^https?:\/\/[^\s]+$/.test(RAW_URL) && !/YOUR-|YOUR_|xxxx/i.test(RAW_URL);
const KEY_LOOKS_VALID = RAW_KEY.length > 20 && !/YOUR-|YOUR_|xxxx|missing/i.test(RAW_KEY);
export const SUPABASE_CONFIGURED = URL_LOOKS_VALID && KEY_LOOKS_VALID;

export const SUPABASE_URL = URL_LOOKS_VALID ? RAW_URL : '';
export const SUPABASE_ANON_KEY = KEY_LOOKS_VALID ? RAW_KEY : '';

/**
 * Remote Supabase is used only when it was requested *and* fully configured.
 * Otherwise the app stays on its own backend (Express locally, /api functions
 * on Vercel) so it never silently talks to a foreign project.
 */
export const USE_REMOTE_SUPABASE = REMOTE_REQUESTED && SUPABASE_CONFIGURED;
export const SUPABASE_MISCONFIGURED = REMOTE_REQUESTED && !SUPABASE_CONFIGURED;

if (SUPABASE_MISCONFIGURED && typeof window !== 'undefined') {
  console.error(
    '[Phoenix Tattooz] VITE_USE_REMOTE_SUPABASE is true but VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are missing or invalid.\n' +
      'Falling back to the built-in /api layer. Add both variables in Vercel → Settings → Environment Variables, then Redeploy.'
  );
}

if (typeof window !== 'undefined') {
  (window as any).__PHOENIX_SUPABASE__ = {
    remoteRequested: REMOTE_REQUESTED,
    configured: SUPABASE_CONFIGURED,
    url: SUPABASE_URL || null,
  };
}

/** Project ref parsed from the configured URL (e.g. `abcdxyz...` for dashboard links). */
export function getSupabaseProjectRef(): string {
  const match = SUPABASE_URL.match(/^https:\/\/([a-z0-9]+)\.supabase\.(co|in)$/i);
  return match ? match[1] : '';
}

/** Deep link into the Supabase dashboard for the configured project. */
export function supabaseDashboardUrl(path = ''): string {
  const ref = getSupabaseProjectRef();
  return ref ? `https://supabase.com/dashboard/project/${ref}${path}` : 'https://supabase.com/dashboard';
}

const LOCAL_SUPABASE_BASE =
  typeof window !== 'undefined'
    ? `${window.location.origin}/__local-supabase`
    : 'http://127.0.0.1:3000/__local-supabase';

const ACTIVE_SUPABASE_URL = USE_REMOTE_SUPABASE ? SUPABASE_URL : LOCAL_SUPABASE_BASE;
const ACTIVE_SUPABASE_ANON_KEY = USE_REMOTE_SUPABASE ? SUPABASE_ANON_KEY : 'local-clone-anon-key';

export const supabase = createClient(ACTIVE_SUPABASE_URL, ACTIVE_SUPABASE_ANON_KEY, {
  auth: {
    persistSession: USE_REMOTE_SUPABASE,
    autoRefreshToken: USE_REMOTE_SUPABASE,
  },
});

export interface AppointmentData {
  booking_code: string;
  client_name: string;
  client_phone: string;
  service: string;
  artist: string;
  placement: string;
  size: string;
  appointment_date: string;
  time_slot: string;
  notes?: string;
  status?: string;
}

export interface ContactData {
  name: string;
  phone: string;
  email?: string;
  service?: string;
  message?: string;
}

export interface SaveResult {
  success: boolean;
  data?: any;
  error?: string;
  tableMissing?: boolean;
}

/**
 * Saves an appointment booking record to the Supabase database.
 * Tries the primary 'appointments' table and falls back to 'bookings'.
 */
export async function saveAppointmentToSupabase(payload: AppointmentData): Promise<SaveResult> {
  try {
    const record = {
      booking_code: payload.booking_code,
      client_name: payload.client_name,
      client_phone: payload.client_phone,
      service: payload.service,
      artist: payload.artist,
      placement: payload.placement,
      size: payload.size,
      appointment_date: payload.appointment_date,
      time_slot: payload.time_slot,
      notes: payload.notes || '',
      status: payload.status || 'pending',
      created_at: new Date().toISOString(),
    };

    // Primary attempt: 'appointments'
    const { data, error } = await supabase
      .from('appointments')
      .insert([record])
      .select();

    if (!error) {
      return { success: true, data };
    }

    // Check if table missing (PGRST205)
    if (error.code === 'PGRST205') {
      // Try fallback to 'bookings'
      const fallback = await supabase
        .from('bookings')
        .insert([record])
        .select();

      if (!fallback.error) {
        return { success: true, data: fallback.data };
      }

      return {
        success: false,
        error: error.message,
        tableMissing: true,
      };
    }

    return {
      success: false,
      error: error.message,
      tableMissing: false,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Unknown network error saving appointment',
    };
  }
}

/**
 * Saves a contact form message to Supabase.
 */
export async function saveContactToSupabase(payload: ContactData): Promise<SaveResult> {
  try {
    const record = {
      name: payload.name,
      phone: payload.phone,
      email: payload.email || '',
      service: payload.service || 'General Inquiry',
      message: payload.message || '',
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('contact_inquiries')
      .insert([record])
      .select();

    if (!error) {
      return { success: true, data };
    }

    if (error.code === 'PGRST205') {
      return {
        success: false,
        error: error.message,
        tableMissing: true,
      };
    }

    return {
      success: false,
      error: error.message,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Unknown error saving contact inquiry',
    };
  }
}

/**
 * Fetches existing appointments from Supabase (for studio dashboard / validation).
 */
export async function getAppointmentsFromSupabase(): Promise<{ data: any[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error && error.code === 'PGRST205') {
      const fallback = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });
      return fallback;
    }

    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Ready-to-run SQL schema script shown inside the admin panel.
 * Single source of truth: the repo's `supabase-schema.sql` file.
 */
import sqlSchemaRaw from '../../supabase-schema.sql?raw';

export const SUPABASE_SQL_SCHEMA = sqlSchemaRaw;
