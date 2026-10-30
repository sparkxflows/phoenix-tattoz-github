import { useState, useEffect } from 'react';
import { ARTISTS, GALLERY_ITEMS, DEFAULT_VIDEO_ITEMS, Artist, GalleryItem, VideoGalleryItem } from '../data/studioData';
import { supabase } from './supabase';
import { uploadFileDirect } from './directUpload';

const ARTISTS_STORAGE_KEY = 'phoenix_studio_artists_v1';
const GALLERY_STORAGE_KEY = 'phoenix_studio_gallery_v1';

const ARTISTS_UPDATED_EVENT = 'phoenix_studio_artists_updated';
const GALLERY_UPDATED_EVENT = 'phoenix_studio_gallery_updated';

/**
 * Direct file upload helper that uploads images directly to Express /api/upload-image
 * and returns the permanent disk URL (e.g. /uploads/logo_123.png).
 * Automatically preserves all uploaded images across code updates, new features, and server restarts.
 */
export async function uploadImageToServer(file: File, type: string = 'image'): Promise<string> {
  // 0. Direct-to-storage upload (no serverless body limit, used in production)
  const direct = await uploadFileDirect(file, { folder: 'images', type });
  if (direct) return direct;

  // 1. Try binary streaming upload first (handles files of any size up to 50MB)
  try {
    const res = await fetch(`/api/upload-image?type=${encodeURIComponent(type)}&filename=${encodeURIComponent(file.name)}`, {
      method: 'POST',
      headers: {
        'Content-Type': file.type || 'image/png',
      },
      body: file,
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.url) {
        return data.url;
      }
    }
  } catch (err) {
    console.warn('Binary image upload error, trying base64 fallback:', err);
  }

  // 2. Base64 fallback through /api/upload-image so server saves to disk
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const dataUrl = e.target?.result as string;
        if (!dataUrl) {
          reject(new Error('Failed to read image data'));
          return;
        }
        const res = await fetch('/api/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dataUrl, filename: file.name, type }),
        });
        const data = await res.json();
        if (data.success && data.url) {
          resolve(data.url);
        } else {
          resolve(dataUrl);
        }
      } catch {
        resolve(e.target?.result as string);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

// ==========================================
// ARTISTS MANAGEMENT
// ==========================================

export function getStoredArtists(): Artist[] {
  try {
    const raw = localStorage.getItem(ARTISTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading stored artists:', e);
  }
  return ARTISTS;
}

export async function saveArtists(artists: Artist[]): Promise<{ success: boolean; error?: string }> {
  try {
    if (!Array.isArray(artists) || artists.length === 0) {
      return { success: false, error: 'Cannot save an empty artist roster. Keep at least 1 artist.' };
    }

    // 1. Save locally with quota error protection (large base64 photos)
    try {
      localStorage.setItem(ARTISTS_STORAGE_KEY, JSON.stringify(artists));
    } catch (storageErr) {
      console.warn('LocalStorage quota warning for artists, proceeding with server sync:', storageErr);
    }

    // 2. Dispatch custom event for immediate React component updates across all active pages
    window.dispatchEvent(new CustomEvent(ARTISTS_UPDATED_EVENT, { detail: artists }));

    // 3. Persist to Express server persistent storage so deletions & edits apply site-wide
    try {
      await fetch('/api/content/custom_artists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: artists }),
      });
    } catch (srvErr) {
      console.warn('Server artists sync warning:', srvErr);
    }

    // 4. Sync directly to Supabase site_settings table
    try {
      const { error: supaErr } = await supabase
        .from('site_settings')
        .upsert({
          key: 'custom_artists',
          value: artists,
          updated_at: new Date().toISOString(),
        });
      if (supaErr) {
        console.warn('Supabase artists sync warning:', supaErr.message);
      }
    } catch (err) {
      console.warn('Supabase artists sync warning:', err);
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to save artists.' };
  }
}

export async function resetArtists(): Promise<{ success: boolean }> {
  try {
    localStorage.setItem(ARTISTS_STORAGE_KEY, JSON.stringify(ARTISTS));
  } catch {}
  window.dispatchEvent(new CustomEvent(ARTISTS_UPDATED_EVENT, { detail: ARTISTS }));

  try {
    await fetch('/api/content/custom_artists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: ARTISTS }),
    });
  } catch {}

  try {
    await supabase
      .from('site_settings')
      .upsert([
        {
          key: 'custom_artists',
          value: ARTISTS,
          updated_at: new Date().toISOString(),
        },
      ]);
  } catch (err) {
    // Non-blocking
  }

  return { success: true };
}

export function useArtists(): Artist[] {
  const [artists, setArtists] = useState<Artist[]>(getStoredArtists);

  useEffect(() => {
    // Remote fetch on mount: Try Supabase Cloud first, then Express server
    const fetchRemote = async () => {
      // 1. Authoritative Supabase Cloud Store
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'custom_artists')
          .single();

        if (!error && data && Array.isArray(data.value) && data.value.length > 0) {
          try {
            localStorage.setItem(ARTISTS_STORAGE_KEY, JSON.stringify(data.value));
          } catch {}
          setArtists(data.value);
          return;
        }
      } catch (e) {
        // Fallback
      }

      // 2. Server store fallback
      try {
        const srvRes = await fetch('/api/content/custom_artists', { cache: 'no-store' });
        if (srvRes.ok) {
          const srvData = await srvRes.json();
          if (srvData.success && Array.isArray(srvData.value) && srvData.value.length > 0) {
            try {
              localStorage.setItem(ARTISTS_STORAGE_KEY, JSON.stringify(srvData.value));
            } catch {}
            setArtists(srvData.value);
            return;
          }
        }
      } catch (e) {
        // Fallback
      }
    };

    fetchRemote();

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<Artist[]>;
      if (customEvent.detail && Array.isArray(customEvent.detail)) {
        setArtists(customEvent.detail);
      } else {
        setArtists(getStoredArtists());
      }
    };

    window.addEventListener(ARTISTS_UPDATED_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(ARTISTS_UPDATED_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return artists;
}

// ==========================================
// GALLERY MANAGEMENT
// ==========================================

export function getStoredGallery(): GalleryItem[] {
  try {
    const raw = localStorage.getItem(GALLERY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure piercing showcase items are automatically available
        const hasPiercing = parsed.some((p: any) => 
          p.category?.toLowerCase() === 'piercing' || 
          p.tags?.some((t: string) => t.toLowerCase() === 'piercing')
        );
        if (!hasPiercing) {
          const piercingItems = GALLERY_ITEMS.filter((g) => g.category.toLowerCase() === 'piercing');
          const merged = [...parsed, ...piercingItems];
          localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(merged));
          return merged;
        }
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading stored gallery:', e);
  }
  return GALLERY_ITEMS;
}

export async function saveGallery(items: GalleryItem[]): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Save locally with quota error protection
    try {
      localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(items));
    } catch (storageErr) {
      console.warn('LocalStorage quota warning for gallery, proceeding with server sync:', storageErr);
    }

    // 2. Dispatch custom event
    window.dispatchEvent(new CustomEvent(GALLERY_UPDATED_EVENT, { detail: items }));

    // 3. Persist to Express server
    try {
      await fetch('/api/content/custom_gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: items }),
      });
    } catch (srvErr) {
      console.warn('Server gallery sync warning:', srvErr);
    }

    // 4. Sync to Supabase site_settings
    try {
      await supabase
        .from('site_settings')
        .upsert([
          {
            key: 'custom_gallery',
            value: items,
            updated_at: new Date().toISOString(),
          },
        ]);
    } catch (err) {
      console.warn('Supabase gallery sync warning:', err);
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to save gallery items.' };
  }
}

export async function resetGallery(): Promise<{ success: boolean }> {
  try {
    localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(GALLERY_ITEMS));
  } catch {}
  window.dispatchEvent(new CustomEvent(GALLERY_UPDATED_EVENT, { detail: GALLERY_ITEMS }));

  try {
    await fetch('/api/content/custom_gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: GALLERY_ITEMS }),
    });
  } catch {}

  try {
    await supabase
      .from('site_settings')
      .upsert([
        {
          key: 'custom_gallery',
          value: GALLERY_ITEMS,
          updated_at: new Date().toISOString(),
        },
      ]);
  } catch (err) {
    // Non-blocking
  }

  return { success: true };
}

export function useGallery(): GalleryItem[] {
  const [gallery, setGallery] = useState<GalleryItem[]>(getStoredGallery);

  useEffect(() => {
    // Remote fetch on mount: Try Supabase Cloud first
    const fetchRemote = async () => {
      // 1. Authoritative Supabase Cloud Store
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'custom_gallery')
          .single();

        if (!error && data && Array.isArray(data.value) && data.value.length > 0) {
          try {
            localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(data.value));
          } catch {}
          setGallery(data.value);
          return;
        }
      } catch (e) {
        // Fallback
      }

      // 2. Express server store fallback
      try {
        const srvRes = await fetch('/api/content/custom_gallery', { cache: 'no-store' });
        if (srvRes.ok) {
          const srvData = await srvRes.json();
          if (srvData.success && Array.isArray(srvData.value) && srvData.value.length > 0) {
            try {
              localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(srvData.value));
            } catch {}
            setGallery(srvData.value);
            return;
          }
        }
      } catch (e) {
        // Fallback
      }
    };

    fetchRemote();

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<GalleryItem[]>;
      if (customEvent.detail && Array.isArray(customEvent.detail)) {
        setGallery(customEvent.detail);
      } else {
        setGallery(getStoredGallery());
      }
    };

    window.addEventListener(GALLERY_UPDATED_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(GALLERY_UPDATED_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return gallery;
}

// ==========================================
// VIDEO GALLERY MANAGEMENT
// ==========================================

const VIDEOS_STORAGE_KEY = 'phoenix_studio_videos_v1';
const VIDEOS_UPDATED_EVENT = 'phoenix_studio_videos_updated';

export function getStoredVideos(): VideoGalleryItem[] {
  try {
    const raw = localStorage.getItem(VIDEOS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading stored videos:', e);
  }
  return DEFAULT_VIDEO_ITEMS;
}

export async function saveVideos(items: VideoGalleryItem[]): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Save locally with quota error protection
    try {
      localStorage.setItem(VIDEOS_STORAGE_KEY, JSON.stringify(items));
    } catch (storageErr) {
      console.warn('LocalStorage quota warning for videos, proceeding with server sync:', storageErr);
    }

    // 2. Dispatch custom event for real-time reactive UI update
    window.dispatchEvent(new CustomEvent(VIDEOS_UPDATED_EVENT, { detail: items }));

    // 3. Persist to Express server store
    try {
      await fetch('/api/content/custom_videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: items }),
      });
    } catch (srvErr) {
      console.warn('Server videos sync warning:', srvErr);
    }

    // 4. Sync to Supabase site_settings in background (non-blocking)
    try {
      await supabase
        .from('site_settings')
        .upsert([
          {
            key: 'custom_videos',
            value: items,
            updated_at: new Date().toISOString(),
          },
        ]);
    } catch (err) {
      // Non-blocking
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to save videos.' };
  }
}

export async function resetVideos(): Promise<{ success: boolean }> {
  try {
    localStorage.setItem(VIDEOS_STORAGE_KEY, JSON.stringify(DEFAULT_VIDEO_ITEMS));
  } catch {}
  window.dispatchEvent(new CustomEvent(VIDEOS_UPDATED_EVENT, { detail: DEFAULT_VIDEO_ITEMS }));

  try {
    await fetch('/api/content/custom_videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: DEFAULT_VIDEO_ITEMS }),
    });
  } catch {}

  try {
    await supabase
      .from('site_settings')
      .upsert([
        {
          key: 'custom_videos',
          value: DEFAULT_VIDEO_ITEMS,
          updated_at: new Date().toISOString(),
        },
      ]);
  } catch (err) {
    // Non-blocking
  }

  return { success: true };
}

export function useVideos(): VideoGalleryItem[] {
  const [videos, setVideos] = useState<VideoGalleryItem[]>(getStoredVideos);

  useEffect(() => {
    const fetchRemote = async () => {
      // 1. Authoritative Supabase Cloud Store
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'custom_videos')
          .single();

        if (!error && data && Array.isArray(data.value) && data.value.length > 0) {
          try {
            localStorage.setItem(VIDEOS_STORAGE_KEY, JSON.stringify(data.value));
          } catch {}
          setVideos(data.value);
          return;
        }
      } catch (e) {
        // Fallback
      }

      // 2. Express server store fallback
      try {
        const srvRes = await fetch('/api/content/custom_videos', { cache: 'no-store' });
        if (srvRes.ok) {
          const srvData = await srvRes.json();
          if (srvData.success && Array.isArray(srvData.value) && srvData.value.length > 0) {
            try {
              localStorage.setItem(VIDEOS_STORAGE_KEY, JSON.stringify(srvData.value));
            } catch {}
            setVideos(srvData.value);
            return;
          }
        }
      } catch (e) {
        // Fallback
      }
    };

    fetchRemote();

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<VideoGalleryItem[]>;
      if (customEvent.detail && Array.isArray(customEvent.detail)) {
        setVideos(customEvent.detail);
      } else {
        setVideos(getStoredVideos());
      }
    };

    window.addEventListener(VIDEOS_UPDATED_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(VIDEOS_UPDATED_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return videos;
}

// ==========================================
// HOME HERO ("SAME SKIN DIFFERENT STORY") MANAGEMENT
// ==========================================

export interface HomeHeroSettings {
  heroImage: string;
  slogan: string;
  subtitle: string;
  altText: string;
  mainHeadingLine1: string;
  mainHeadingLine2: string;
  studioSubheading: string;
  heroDescription: string;
  badge1: string;
  badge2: string;
  badge3: string;
  updatedAt?: string;

  // Background Media Settings
  bgMediaType?: 'video' | 'image';
  bgVideoUrl?: string;
  bgVideoPoster?: string;
  bgOverlayOpacity?: number; // 0.2 to 0.9 (default 0.65)
  bgVideoMuted?: boolean;
}

export const DEFAULT_HOME_HERO_SETTINGS: HomeHeroSettings = {
  heroImage: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=1200&q=80',
  slogan: 'Same Skin Different Story',
  subtitle: 'Hisar Studio',
  altText: 'Tattoo artist tattooing realistic lion on arm with black gloves',
  mainHeadingLine1: 'INK YOUR',
  mainHeadingLine2: 'STORY',
  studioSubheading: 'Phoenix Tattooz Studio & Academy',
  heroDescription: 'Custom tattoos. Professional artistry. A space where creativity meets expression. Located in Hisar, Haryana.',
  badge1: '8+ Years of Excellence',
  badge2: '100% Sterile & Safe',
  badge3: '5.0 ★ Top Rated',
  bgMediaType: 'video',
  bgVideoUrl: '/uploads/studio_bg_video.mp4',
  bgVideoPoster: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=1200&q=80',
  bgOverlayOpacity: 0.65,
  bgVideoMuted: true,
};

const HERO_STORAGE_KEY = 'phoenix_studio_hero_v1';
const HERO_UPDATED_EVENT = 'phoenix_studio_hero_updated';

export function getStoredHomeHero(): HomeHeroSettings {
  try {
    const raw = localStorage.getItem(HERO_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.bgVideoUrl && parsed.bgVideoUrl.includes('1793020241737')) {
        parsed.bgVideoUrl = '/uploads/studio_bg_video.mp4';
      }
      return { ...DEFAULT_HOME_HERO_SETTINGS, ...parsed };
    }
  } catch (e) {
    console.error('Error reading stored hero settings:', e);
  }
  return DEFAULT_HOME_HERO_SETTINGS;
}

export async function saveHomeHero(settings: HomeHeroSettings): Promise<{ success: boolean; error?: string }> {
  try {
    const payload = {
      ...settings,
      updatedAt: new Date().toISOString(),
    };

    // 1. Save to local storage safely (catch quota errors if a large data URI is present)
    try {
      localStorage.setItem(HERO_STORAGE_KEY, JSON.stringify(payload));
    } catch (storageErr) {
      console.warn('LocalStorage quota warning, proceeding with server sync:', storageErr);
    }

    // 2. Broadcast custom event for zero-latency UI update across all active components
    window.dispatchEvent(new CustomEvent(HERO_UPDATED_EVENT, { detail: payload }));

    // 3. Persist to Express server store so live website and all visitors get the update
    try {
      await fetch('/api/content/home_hero', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: payload }),
      });
    } catch (srvErr) {
      console.warn('Server hero sync warning:', srvErr);
    }

    // 4. Sync to Supabase site_settings
    try {
      await supabase
        .from('site_settings')
        .upsert([
          {
            key: 'custom_home_hero',
            value: payload,
            updated_at: new Date().toISOString(),
          },
        ]);
    } catch (err) {
      console.warn('Supabase hero sync warning:', err);
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to save hero settings.' };
  }
}

export async function resetHomeHero(): Promise<{ success: boolean }> {
  try {
    localStorage.setItem(HERO_STORAGE_KEY, JSON.stringify(DEFAULT_HOME_HERO_SETTINGS));
  } catch {}
  window.dispatchEvent(new CustomEvent(HERO_UPDATED_EVENT, { detail: DEFAULT_HOME_HERO_SETTINGS }));

  try {
    await fetch('/api/content/home_hero', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: DEFAULT_HOME_HERO_SETTINGS }),
    });
  } catch {}

  try {
    await supabase
      .from('site_settings')
      .upsert([
        {
          key: 'custom_home_hero',
          value: DEFAULT_HOME_HERO_SETTINGS,
          updated_at: new Date().toISOString(),
        },
      ]);
  } catch (err) {
    // Non-blocking
  }

  return { success: true };
}

export function useHomeHero(): HomeHeroSettings {
  const [heroSettings, setHeroSettings] = useState<HomeHeroSettings>(getStoredHomeHero);

  useEffect(() => {
    const fetchRemote = async () => {
      // 1. Authoritative Supabase Cloud Store
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'custom_home_hero')
          .single();

        if (!error && data && data.value) {
          const merged = { ...DEFAULT_HOME_HERO_SETTINGS, ...data.value };
          try {
            localStorage.setItem(HERO_STORAGE_KEY, JSON.stringify(merged));
          } catch {}
          setHeroSettings(merged);
          return;
        }
      } catch (e) {
        // Fallback
      }

      // 2. Fetch from Express server storage fallback
      try {
        const srvRes = await fetch('/api/content/home_hero', { cache: 'no-store' });
        if (srvRes.ok) {
          const srvData = await srvRes.json();
          if (srvData && srvData.success && srvData.value) {
            const merged = { ...DEFAULT_HOME_HERO_SETTINGS, ...srvData.value };
            try {
              localStorage.setItem(HERO_STORAGE_KEY, JSON.stringify(merged));
            } catch {}
            setHeroSettings(merged);
            return;
          }
        }
      } catch (srvErr) {
        // Fallback
      }
    };

    fetchRemote();

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<HomeHeroSettings>;
      if (customEvent.detail) {
        setHeroSettings(customEvent.detail);
      } else {
        setHeroSettings(getStoredHomeHero());
      }
    };

    window.addEventListener(HERO_UPDATED_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(HERO_UPDATED_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return heroSettings;
}

// ==========================================
// ABOUT SECTION & STORY MANAGEMENT
// ==========================================

export interface AboutSectionSettings {
  // Home Page About Section
  homeAboutImage: string;
  homeAboutImageBadge: string;
  homeAboutHeading: string;
  homeAboutParagraph1: string;
  homeAboutParagraph2: string;
  homeAboutTagline: string;

  // Dedicated About Page Story Section
  aboutStoryImage: string;
  aboutStoryImageBadge: string;
  aboutStoryHeading: string;
  aboutStoryParagraph1: string;
  aboutStoryParagraph2: string;
  aboutStoryTagline: string;
  aboutStorySlogan: string;
  aboutHeroTagline: string;
  aboutHeroDescription: string;
  updatedAt?: string;
}

export const DEFAULT_ABOUT_SETTINGS: AboutSectionSettings = {
  homeAboutImage: 'https://images.unsplash.com/photo-1512690459411-b9245aed614b?auto=format&fit=crop&w=1000&q=80',
  homeAboutImageBadge: 'Studio Reception • Hisar',
  homeAboutHeading: 'Phoenix Tattooz Studio & Academy',
  homeAboutParagraph1: 'Phoenix Tattooz Studio & Academy is a creative space in Hisar, Haryana, where art, passion and self-expression come together. We specialize in custom tattoos with a focus on quality, hygiene and a comfortable experience for every client.',
  homeAboutParagraph2: 'Along with our studio, we run a dedicated academy to help aspiring artists learn, grow and build their skills in the world of tattooing.',
  homeAboutTagline: '“Ink Your Story”',

  aboutStoryImage: 'https://images.unsplash.com/photo-1512690459411-b9245aed614b?auto=format&fit=crop&w=800&q=80',
  aboutStoryImageBadge: 'Hisar Studio',
  aboutStoryHeading: 'How It All Began',
  aboutStoryParagraph1: 'Phoenix Tattooz Studio & Academy was founded in 2019 with a simple vision — to create a space where art, creativity and self-expression come together. What started as a passion for tattooing has now grown into a trusted studio and academy, known for its quality, hygiene and artistic excellence in Hisar, Haryana.',
  aboutStoryParagraph2: 'We are not just about tattoos, we are about people, their stories, and the art that brings them to life.',
  aboutStoryTagline: 'Phoenix Tattooz Studio & Academy',
  aboutStorySlogan: '“Same Skin Different Story”',
  aboutHeroTagline: 'Your Story / Our Art',
  aboutHeroDescription: 'More than just a tattoo studio, we are a creative space where art meets passion. We help you express your story through ink, with safety, professionalism and unmatched artistry.',
};

const ABOUT_STORAGE_KEY = 'phoenix_studio_about_v1';
const ABOUT_UPDATED_EVENT = 'phoenix_studio_about_updated';

export function getStoredAboutSettings(): AboutSectionSettings {
  try {
    const raw = localStorage.getItem(ABOUT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_ABOUT_SETTINGS, ...parsed };
    }
  } catch (e) {
    console.error('Error reading stored about settings:', e);
  }
  return DEFAULT_ABOUT_SETTINGS;
}

export async function saveAboutSettings(settings: AboutSectionSettings): Promise<{ success: boolean; error?: string }> {
  try {
    const payload = {
      ...settings,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(ABOUT_STORAGE_KEY, JSON.stringify(payload));
    window.dispatchEvent(new CustomEvent(ABOUT_UPDATED_EVENT, { detail: payload }));

    try {
      await supabase
        .from('site_settings')
        .upsert([
          {
            key: 'custom_about_content',
            value: payload,
            updated_at: new Date().toISOString(),
          },
        ]);
    } catch (err) {
      console.warn('Supabase about sync warning:', err);
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to save about settings.' };
  }
}

export async function resetAboutSettings(): Promise<{ success: boolean }> {
  localStorage.setItem(ABOUT_STORAGE_KEY, JSON.stringify(DEFAULT_ABOUT_SETTINGS));
  window.dispatchEvent(new CustomEvent(ABOUT_UPDATED_EVENT, { detail: DEFAULT_ABOUT_SETTINGS }));

  try {
    await supabase
      .from('site_settings')
      .upsert([
        {
          key: 'custom_about_content',
          value: DEFAULT_ABOUT_SETTINGS,
          updated_at: new Date().toISOString(),
        },
      ]);
  } catch (err) {
    // Non-blocking
  }

  return { success: true };
}

export function useAboutContent(): AboutSectionSettings {
  const [aboutSettings, setAboutSettings] = useState<AboutSectionSettings>(getStoredAboutSettings);

  useEffect(() => {
    const fetchRemote = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'custom_about_content')
          .limit(1);

        if (!error && data && data.length > 0 && data[0].value) {
          const merged = { ...DEFAULT_ABOUT_SETTINGS, ...data[0].value };
          localStorage.setItem(ABOUT_STORAGE_KEY, JSON.stringify(merged));
          setAboutSettings(merged);
        }
      } catch (e) {
        // Fallback to local
      }
    };

    fetchRemote();

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<AboutSectionSettings>;
      if (customEvent.detail) {
        setAboutSettings(customEvent.detail);
      } else {
        setAboutSettings(getStoredAboutSettings());
      }
    };

    window.addEventListener(ABOUT_UPDATED_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(ABOUT_UPDATED_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return aboutSettings;
}

// ==========================================
// REVIEWS & STUDIO VIEWS MANAGEMENT
// ==========================================

export interface CustomerReview {
  id: string;
  name: string;
  city: string;
  rating: number; // 1 to 5
  date: string;
  title: string;
  text: string;
  service: string;
  artist: string;
  verified: boolean;
  featured: boolean;
  approved: boolean; // True = shown on website, False = hidden / pending approval
  studioReply?: string;
  createdAt?: string;
  images?: string[];
  videos?: string[];
}

export interface PhilosophyPillar {
  id: string;
  title: string;
  summary: string;
  tagline: string;
}

export interface StudioPhilosophy {
  heading: string;
  badge: string;
  subtitle: string;
  founderQuote: string;
  founderName: string;
  founderTitle: string;
  founderImage: string;
  pillars: PhilosophyPillar[];
  updatedAt?: string;
}

export const DEFAULT_CUSTOMER_REVIEWS: CustomerReview[] = [
  {
    id: "r-1",
    name: "Aman Verma",
    city: "Hisar",
    rating: 5,
    date: "March 2026",
    title: "Unreal hyper-realism sleeve! Rohit is a master.",
    text: "Rohit did an extraordinary job on my lion and compass sleeve tattoo. The shading depth and needle precision is unlike anything I've seen in Haryana. 100% painless experience and healed like a dream with the Dermalize film.",
    service: "Custom Tattooing",
    artist: "Rohit Sharma",
    verified: true,
    featured: true,
    approved: true,
    studioReply: "Thank you Aman! Honored to bring your lion piece to life. Keep rocking the sleeve!",
    images: [
      "https://images.unsplash.com/photo-1562962230-16e4623d36e6?auto=format&fit=crop&w=900&q=80",
      "/uploads/repairs/compass-rose.jpg"
    ],
    videos: [
      "/uploads/studio_bg_video.mp4#t=6.4"
    ]
  },
  {
    id: "r-2",
    name: "Neha Sharma",
    city: "Hisar",
    rating: 5,
    date: "February 2026",
    title: "Delicate fine-line botanicals & zero discomfort",
    text: "Got a fine-line collarbone floral piece with Sneha. She was incredibly gentle, took time to adjust the stencil 4 times till it was millimeter-perfect. Super clean studio with autoclave sterilization visible everywhere.",
    service: "Custom Tattooing",
    artist: "Sneha Verma",
    verified: true,
    featured: true,
    approved: true,
    studioReply: "We love delicate placement work! Thank you for trusting us with your first floral piece Neha.",
    images: [
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=900&q=80"
    ]
  },
  {
    id: "r-3",
    name: "Sahil Rajput",
    city: "Hisar",
    rating: 5,
    date: "January 2026",
    title: "Flawless tiger realism and unmatched studio hygiene",
    text: "Best tattoo studio in Hisar without doubt. Sterile needles opened right in front of me, medical barrier films on all equipment, and the contrast in the tiger's fur is jaw-dropping.",
    service: "Custom Tattooing",
    artist: "Rohit Sharma",
    verified: true,
    featured: true,
    approved: true,
    images: [
      "https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&w=900&q=80"
    ],
    videos: [
      "/uploads/studio_bg_video.mp4#t=2.8"
    ]
  },
  {
    id: "r-4",
    name: "Pooja Bishnoi",
    city: "Hisar",
    rating: 5,
    date: "January 2026",
    title: "Microblading & Lip Blush look so natural!",
    text: "I was nervous about permanent makeup, but Sneha explained the organic pigment tones and undertones so thoroughly. My ombre powder brows healed beautifully and save me 20 minutes every morning!",
    service: "Cosmetic Tattooing",
    artist: "Sneha Verma",
    verified: true,
    featured: true,
    approved: true,
    studioReply: "Natural enhancement is our goal! So thrilled you are loving the brows and blush Pooja.",
    images: [
      "https://images.unsplash.com/photo-1512690459411-b9245aed614b?auto=format&fit=crop&w=900&q=80"
    ]
  },
  {
    id: "r-5",
    name: "Deepak Mor",
    city: "Rohtak",
    rating: 5,
    date: "December 2025",
    title: "Phoenix Academy 3-month course launched my tattoo career",
    text: "Travelled from Rohtak for the Phoenix Tattoo Academy certification. Real hands-on machine calibration, artificial skin practice, hygiene exams, and live model supervision. Rohit sir is a mentor who genuinely cares about your growth.",
    service: "Academy Course",
    artist: "Rohit Sharma",
    verified: true,
    featured: true,
    approved: true,
    studioReply: "Proud to have you represent the Phoenix alumni in Rohtak Deepak! Keep creating magic.",
    images: [
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=900&q=80"
    ]
  },
  {
    id: "r-6",
    name: "Vikas Chahal",
    city: "Jind",
    rating: 5,
    date: "November 2025",
    title: "Lord Shiva portrait realism brought goosebumps",
    text: "Travelled all the way from Jind. Rohit bhaiya's portraiture of Mahadev is unbelievable—the depth in the eyes and trident sacred geometry is magnificent. Worth every single rupee and kilometer travelled.",
    service: "Custom Tattooing",
    artist: "Rohit Sharma",
    verified: true,
    featured: false,
    approved: true,
    images: [
      "https://images.unsplash.com/photo-1611590027211-b954fd027b51?auto=format&fit=crop&w=900&q=80"
    ]
  },
  {
    id: "r-7",
    name: "Ananya Sethi",
    city: "Delhi",
    rating: 5,
    date: "October 2025",
    title: "Better than high-end studios in Delhi NCR",
    text: "Discovered Phoenix Tattooz through Instagram and drove down. World-class setup, hospital-clean hygiene, warm coffee lounge, and artists who listen without ego. My constellation piece healed razor sharp.",
    service: "Custom Tattooing",
    artist: "Sneha Verma",
    verified: true,
    featured: false,
    approved: true,
    images: [
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80"
    ]
  },
  {
    id: "r-8",
    name: "Rajesh Kumar",
    city: "Hisar",
    rating: 5,
    date: "September 2025",
    title: "Master cover-up of a 10-year old faded tattoo",
    text: "Had a disastrous blurry tattoo from college days. Rohit designed a dynamic Japanese koi and dragon cover-up that completely swallowed the old ink. People can't believe there was an old tattoo underneath!",
    service: "Cover-Up & Rework",
    artist: "Rohit Sharma",
    verified: true,
    featured: true,
    approved: true,
    images: [
      "https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?auto=format&fit=crop&w=900&q=80"
    ]
  },
];

export const DEFAULT_STUDIO_PHILOSOPHY: StudioPhilosophy = {
  heading: "Our Thoughts & Views: The Phoenix Philosophy",
  badge: "STUDIO CREED & VISION",
  subtitle: "“Same Skin Different Story” — Artistry Grounded in Reverence, Medical-Grade Hygiene, and Unwavering Respect.",
  founderQuote: "A tattoo is not merely ink pushed into the dermis; it is an intimate, permanent milestone of your life's journey. At Phoenix, our sacred pledge is to treat your body with medical sterility, honest artistic counsel, and master-level craft.",
  founderName: "Rohit Sharma",
  founderTitle: "Founder & Master Tattoo Artist",
  founderImage: "https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=800&q=80",
  pillars: [
    {
      id: "p1",
      title: "Same Skin, Different Story",
      tagline: "Custom Art, Never Stencil Clones",
      summary: "Every client who walks into our Hisar studio carries unique memories, triumphs, or memorials. We reject cookie-cutter Google copy-pastes. Every custom piece is drafted from your soul, contoured to your natural muscular flow and skin tone.",
    },
    {
      id: "p2",
      title: "Hospital-Grade Sterile Sanctuary",
      tagline: "Uncompromising Medical Safety",
      summary: "We operate with the hygiene standards of a surgical theater. 100% single-use EO-sterilized needle cartridges, class-B autoclave sanitation, medical barrier plastics, and cruelty-free vegan inks imported from USA/Europe.",
    },
    {
      id: "p3",
      title: "Lifelong Brotherhood & Aftercare",
      tagline: "Our Commitment Doesn't End at Checkout",
      summary: "Every tattoo comes with hospital-grade Dermalize second-skin healing film, detailed aftercare booklets, 24/7 direct artist WhatsApp guidance, and our lifetime free touch-up guarantee.",
    },
    {
      id: "p4",
      title: "Elevating the Profession at Phoenix Academy",
      tagline: "Cultivating India's Next Tattoo Masters",
      summary: "Tattooing is a dignified fine art. Through our Academy, we train young aspiring artists across Haryana in dermatological anatomy, sterile cross-contamination prevention, machine mechanics, and ethical client care.",
    },
  ],
};

const REVIEWS_STORAGE_KEY = 'phoenix_studio_reviews_v1';
const REVIEWS_UPDATED_EVENT = 'phoenix_studio_reviews_updated';

const PHILOSOPHY_STORAGE_KEY = 'phoenix_studio_philosophy_v1';
const PHILOSOPHY_UPDATED_EVENT = 'phoenix_studio_philosophy_updated';

// ------------------------------------------
// REVIEWS HANDLERS
// ------------------------------------------

export function getStoredReviews(): CustomerReview[] {
  try {
    const raw = localStorage.getItem(REVIEWS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item: CustomerReview) => {
          const match = DEFAULT_CUSTOMER_REVIEWS.find((d) => d.id === item.id);
          const approved = item.approved !== false;
          if (match) {
            return {
              ...item,
              approved,
              images: item.images && item.images.length > 0 ? item.images : match.images,
              videos: item.videos && item.videos.length > 0 ? item.videos : match.videos,
            };
          }
          return {
            ...item,
            approved,
          };
        });
      }
    }
  } catch (e) {
    console.error('Error reading stored reviews:', e);
  }
  return DEFAULT_CUSTOMER_REVIEWS;
}

export async function saveReviews(reviews: CustomerReview[]): Promise<{ success: boolean; error?: string }> {
  try {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
    window.dispatchEvent(new CustomEvent(REVIEWS_UPDATED_EVENT, { detail: reviews }));

    try {
      await supabase
        .from('site_settings')
        .upsert([
          {
            key: 'customer_reviews',
            value: reviews,
            updated_at: new Date().toISOString(),
          },
        ]);
    } catch (err) {
      console.warn('Supabase reviews sync warning:', err);
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to save reviews.' };
  }
}

export async function addCustomerReview(review: Omit<CustomerReview, 'id' | 'date' | 'createdAt' | 'approved'> & { approved?: boolean }): Promise<{ success: boolean; newReview?: CustomerReview; error?: string }> {
  try {
    const current = getStoredReviews();
    const newRev: CustomerReview = {
      ...review,
      id: `rev-${Date.now()}`,
      approved: review.approved !== undefined ? review.approved : true,
      date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      createdAt: new Date().toISOString(),
    };

    const updated = [newRev, ...current];
    const res = await saveReviews(updated);
    if (res.success) {
      return { success: true, newReview: newRev };
    }
    return { success: false, error: res.error };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Error submitting review.' };
  }
}

export async function updateCustomerReview(id: string, updates: Partial<CustomerReview>): Promise<{ success: boolean }> {
  const current = getStoredReviews();
  const updated = current.map((r) => r.id === id ? { ...r, ...updates } : r);
  await saveReviews(updated);
  return { success: true };
}

export async function toggleReviewApproval(id: string): Promise<{ success: boolean; approved?: boolean }> {
  const current = getStoredReviews();
  let nextApproved = true;
  const updated = current.map((r) => {
    if (r.id === id) {
      nextApproved = !(r.approved !== false);
      return { ...r, approved: nextApproved };
    }
    return r;
  });
  await saveReviews(updated);
  return { success: true, approved: nextApproved };
}

export async function deleteCustomerReview(id: string): Promise<{ success: boolean }> {
  const current = getStoredReviews();
  const updated = current.filter((r) => r.id !== id);
  await saveReviews(updated);
  return { success: true };
}

export async function resetReviews(): Promise<{ success: boolean }> {
  localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(DEFAULT_CUSTOMER_REVIEWS));
  window.dispatchEvent(new CustomEvent(REVIEWS_UPDATED_EVENT, { detail: DEFAULT_CUSTOMER_REVIEWS }));

  try {
    await supabase
      .from('site_settings')
      .upsert([
        {
          key: 'customer_reviews',
          value: DEFAULT_CUSTOMER_REVIEWS,
          updated_at: new Date().toISOString(),
        },
      ]);
  } catch (err) {
    // Non-blocking
  }

  return { success: true };
}

export function useCustomerReviews(): CustomerReview[] {
  const [reviews, setReviews] = useState<CustomerReview[]>(getStoredReviews);

  useEffect(() => {
    const fetchRemote = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'customer_reviews')
          .limit(1);

        if (!error && data && data.length > 0 && Array.isArray(data[0].value) && data[0].value.length > 0) {
          localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(data[0].value));
          setReviews(data[0].value);
        }
      } catch (e) {
        // Fallback to local
      }
    };

    fetchRemote();

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<CustomerReview[]>;
      if (customEvent.detail && Array.isArray(customEvent.detail)) {
        setReviews(customEvent.detail);
      } else {
        setReviews(getStoredReviews());
      }
    };

    window.addEventListener(REVIEWS_UPDATED_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(REVIEWS_UPDATED_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return reviews;
}

// ------------------------------------------
// STUDIO PHILOSOPHY / THOUGHTS & VIEWS HANDLERS
// ------------------------------------------

export function getStoredPhilosophy(): StudioPhilosophy {
  try {
    const raw = localStorage.getItem(PHILOSOPHY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_STUDIO_PHILOSOPHY, ...parsed };
    }
  } catch (e) {
    console.error('Error reading stored philosophy:', e);
  }
  return DEFAULT_STUDIO_PHILOSOPHY;
}

export async function savePhilosophy(philosophy: StudioPhilosophy): Promise<{ success: boolean; error?: string }> {
  try {
    const payload = {
      ...philosophy,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(PHILOSOPHY_STORAGE_KEY, JSON.stringify(payload));
    window.dispatchEvent(new CustomEvent(PHILOSOPHY_UPDATED_EVENT, { detail: payload }));

    try {
      await supabase
        .from('site_settings')
        .upsert([
          {
            key: 'studio_philosophy',
            value: payload,
            updated_at: new Date().toISOString(),
          },
        ]);
    } catch (err) {
      console.warn('Supabase philosophy sync warning:', err);
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to save studio thoughts.' };
  }
}

export async function resetPhilosophy(): Promise<{ success: boolean }> {
  localStorage.setItem(PHILOSOPHY_STORAGE_KEY, JSON.stringify(DEFAULT_STUDIO_PHILOSOPHY));
  window.dispatchEvent(new CustomEvent(PHILOSOPHY_UPDATED_EVENT, { detail: DEFAULT_STUDIO_PHILOSOPHY }));

  try {
    await supabase
      .from('site_settings')
      .upsert([
        {
          key: 'studio_philosophy',
          value: DEFAULT_STUDIO_PHILOSOPHY,
          updated_at: new Date().toISOString(),
        },
      ]);
  } catch (err) {
    // Non-blocking
  }

  return { success: true };
}

export function useStudioPhilosophy(): StudioPhilosophy {
  const [philosophy, setPhilosophy] = useState<StudioPhilosophy>(getStoredPhilosophy);

  useEffect(() => {
    const fetchRemote = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'studio_philosophy')
          .limit(1);

        if (!error && data && data.length > 0 && data[0].value) {
          const merged = { ...DEFAULT_STUDIO_PHILOSOPHY, ...data[0].value };
          localStorage.setItem(PHILOSOPHY_STORAGE_KEY, JSON.stringify(merged));
          setPhilosophy(merged);
        }
      } catch (e) {
        // Fallback to local
      }
    };

    fetchRemote();

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<StudioPhilosophy>;
      if (customEvent.detail) {
        setPhilosophy(customEvent.detail);
      } else {
        setPhilosophy(getStoredPhilosophy());
      }
    };

    window.addEventListener(PHILOSOPHY_UPDATED_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(PHILOSOPHY_UPDATED_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return philosophy;
}

// ==========================================
// GIFTS & REWARDS MANAGEMENT
// ==========================================

export interface GiftsRewardsSettings {
  tier1Image: string; // Classical Statue / Artwork in Thank You tier
  tier1ImageAlt: string;
  tier2Image: string; // Tattooed Client holding Birthday Card in Tier 2
  tier2ImageAlt: string;
  tier3Image: string; // Studio Lounge / Refer & Earn image in Tier 3
  tier3ImageAlt: string;
  couponCode: string;
  discountPercentage: number;
  updatedAt?: string;
}

export const DEFAULT_GIFTS_REWARDS_SETTINGS: GiftsRewardsSettings = {
  tier1Image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=900&q=80',
  tier1ImageAlt: 'Classical sculpted artwork with custom tattoo sleeve',
  tier2Image: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=900&q=80',
  tier2ImageAlt: 'Tattooed client holding Phoenix Birthday Gift Card',
  tier3Image: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=900&q=80',
  tier3ImageAlt: 'Happy clients in Phoenix Tattooz studio lounge',
  couponCode: 'PHOENIX15',
  discountPercentage: 15,
};

const GIFTS_REWARDS_STORAGE_KEY = 'phoenix_studio_gifts_rewards_v1';
export const GIFTS_REWARDS_UPDATED_EVENT = 'phoenix_studio_gifts_rewards_updated';

export function getStoredGiftsRewards(): GiftsRewardsSettings {
  try {
    const raw = localStorage.getItem(GIFTS_REWARDS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_GIFTS_REWARDS_SETTINGS, ...parsed };
    }
  } catch (e) {
    console.error('Error reading stored gifts & rewards settings:', e);
  }
  return DEFAULT_GIFTS_REWARDS_SETTINGS;
}

export async function saveGiftsRewards(settings: GiftsRewardsSettings): Promise<{ success: boolean; error?: string }> {
  try {
    const payload = {
      ...settings,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(GIFTS_REWARDS_STORAGE_KEY, JSON.stringify(payload));
    window.dispatchEvent(new CustomEvent(GIFTS_REWARDS_UPDATED_EVENT, { detail: payload }));

    try {
      await supabase
        .from('site_settings')
        .upsert([
          {
            key: 'custom_gifts_rewards',
            value: payload,
            updated_at: new Date().toISOString(),
          },
        ]);
    } catch (err) {
      console.warn('Supabase gifts & rewards sync warning:', err);
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to save gifts & rewards settings.' };
  }
}

export async function resetGiftsRewards(): Promise<{ success: boolean }> {
  localStorage.setItem(GIFTS_REWARDS_STORAGE_KEY, JSON.stringify(DEFAULT_GIFTS_REWARDS_SETTINGS));
  window.dispatchEvent(new CustomEvent(GIFTS_REWARDS_UPDATED_EVENT, { detail: DEFAULT_GIFTS_REWARDS_SETTINGS }));

  try {
    await supabase
      .from('site_settings')
      .upsert([
        {
          key: 'custom_gifts_rewards',
          value: DEFAULT_GIFTS_REWARDS_SETTINGS,
          updated_at: new Date().toISOString(),
        },
      ]);
  } catch (err) {
    // Non-blocking
  }

  return { success: true };
}

export function useGiftsRewards(): GiftsRewardsSettings {
  const [rewardsSettings, setRewardsSettings] = useState<GiftsRewardsSettings>(getStoredGiftsRewards);

  useEffect(() => {
    const fetchRemote = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'custom_gifts_rewards')
          .limit(1);

        if (!error && data && data.length > 0 && data[0].value) {
          const merged = { ...DEFAULT_GIFTS_REWARDS_SETTINGS, ...data[0].value };
          localStorage.setItem(GIFTS_REWARDS_STORAGE_KEY, JSON.stringify(merged));
          setRewardsSettings(merged);
        }
      } catch (e) {
        // Fallback to local
      }
    };

    fetchRemote();

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<GiftsRewardsSettings>;
      if (customEvent.detail) {
        setRewardsSettings(customEvent.detail);
      } else {
        setRewardsSettings(getStoredGiftsRewards());
      }
    };

    window.addEventListener(GIFTS_REWARDS_UPDATED_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(GIFTS_REWARDS_UPDATED_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return rewardsSettings;
}

export async function syncAllCurrentContentToServer(): Promise<{ success: boolean; error?: string }> {
  try {
    const artists = getStoredArtists();
    const gallery = getStoredGallery();
    const videos = getStoredVideos();
    const hero = getStoredHomeHero();
    const about = getStoredAboutSettings();
    const philosophy = getStoredPhilosophy();
    const rewards = getStoredGiftsRewards();
    const reviews = getStoredReviews();

    // 1. Sync to Express server persistent storage
    try {
      await Promise.allSettled([
        fetch('/api/content/home_hero', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value: hero }),
        }),
        fetch('/api/content/custom_gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value: gallery }),
        }),
        fetch('/api/content/custom_videos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value: videos }),
        }),
        fetch('/api/content/custom_artists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value: artists }),
        }),
      ]);
    } catch {}

    // 2. Sync to Supabase
    await Promise.allSettled([
      supabase.from('site_settings').upsert([
        { key: 'custom_artists', value: artists, updated_at: new Date().toISOString() },
        { key: 'custom_gallery', value: gallery, updated_at: new Date().toISOString() },
        { key: 'custom_videos', value: videos, updated_at: new Date().toISOString() },
        { key: 'custom_home_hero', value: hero, updated_at: new Date().toISOString() },
        { key: 'custom_about_content', value: about, updated_at: new Date().toISOString() },
        { key: 'studio_philosophy', value: philosophy, updated_at: new Date().toISOString() },
        { key: 'custom_gifts_rewards', value: rewards, updated_at: new Date().toISOString() },
        { key: 'customer_reviews', value: reviews, updated_at: new Date().toISOString() },
      ]),
    ]);

    return { success: true };
  } catch (err: any) {
    console.warn('Sync all content warning:', err);
    return { success: true };
  }
}



