import { createClient } from '@supabase/supabase-js';
import { SITE_CONTENT, USE_LOCAL_CONTENT_ONLY } from '../constants';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
    }
});

// =====================================================
// Database Schema Types (Matching supabase_schema.sql)
// =====================================================

export interface SiteContent {
    id: string;
    section: string;
    key_name: string;
    value_text: string | null;
    value_number: number | null;
    is_active: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export interface AppointmentBooking {
    id?: string;
    name: string;
    email: string;
    category?: string;
    services: string[];
    price?: string;
    phone_num: string;
    custom_date?: string | null;
    status?: string;
    notes?: string;
}

export interface GalleryItem {
    id?: string;
    title: string;
    category?: string;
    image_url: string;
    alt_text?: string;
    description?: string;
    gallery_type?: string;
    sort_order?: number;
    is_active?: boolean;
}

export interface NavigationItem {
    id?: string;
    name: string;
    url: string;
    sort_order?: number;
    is_active?: boolean;
}

export interface ServiceItem {
    id?: string;
    title: string;
    description?: string;
    price?: string;
    duration?: string;
    category?: string;
    is_active?: boolean;
    is_featured?: boolean;
}

export interface FooterSettings {
    reserve_heading?: string;
    reserve_description?: string;
    book_button_text?: string;
    page_title?: string;
    page_subtitle?: string;
    subject_label?: string;
    subject_placeholder?: string;
    email_label?: string;
    email_placeholder?: string;
    category_label?: string;
    category_placeholder?: string;
    services_label?: string;
    services_placeholder?: string;
    coms_label?: string;
    coms_placeholder?: string;
    date_label?: string;
    date_placeholder?: string;
    date_calendar_label?: string;
    map_label?: string;
    google_map_embed?: string;
    submit_button?: string;
    add_protocol_button?: string;
    estimated_label?: string;
    sessions_button?: string;
    confirm_status_label?: string;
    confirm_heading?: string;
    confirm_description?: string;
    confirm_subject_label?: string;
    confirm_coordinate_label?: string;
    confirm_investment_label?: string;
    confirm_protocol_label?: string;
    confirmed_badge?: string;
    cancel_button?: string;
    download_button?: string;
    // Footer
    text?: string;
    copyright_text?: string;
    contact_email?: string;
    gmail?: string;
    gmail_embed?: string;
    instagram?: string;
    facebook?: string;
    whatsapp?: string;
}

// =====================================================
// Static Fallback Data
// =====================================================

const STATIC_NAVIGATION = [
    { name: 'HOME', url: '#hero', sort_order: 1 },
    { name: 'STUDIO', url: '#studio-work', sort_order: 2 },
    { name: 'ABOUT', url: '#about', sort_order: 3 },
    { name: 'CATALOG', url: '#catalog', sort_order: 4 },
    { name: 'RESERVE', url: '#footer', sort_order: 5 }
];

const STATIC_GALLERY: GalleryItem[] = [];
const STATIC_SERVICES: ServiceItem[] = [];

const STATIC_SITE_CONTENT: Record<string, Record<string, string>> = SITE_CONTENT as unknown as Record<string, Record<string, string>>;
const STATIC_BOOK_NOW: BookNowSettings = SITE_CONTENT.bookNow || {};

// =====================================================
// Helper Functions
// =====================================================

const isSupabaseConfigured = () => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const configured = !!(url && key);
    console.log('[Supabase] Config check:', { url: !!url, key: !!key, configured, useLocalOnly: USE_LOCAL_CONTENT_ONLY });
    return configured;
};

// =====================================================
// Content Fetching Functions
// =====================================================

export const getNavigation = async (): Promise<NavigationItem[]> => {
    if (USE_LOCAL_CONTENT_ONLY === true) {
        return STATIC_NAVIGATION;
    }

    if (!isSupabaseConfigured()) {
        return STATIC_NAVIGATION;
    }

    const { data, error } = await supabase
        .from('navigation')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

    if (error) {
        console.error('Navigation fetch error:', error);
        return STATIC_NAVIGATION;
    }

    return data || [];
};

export const getGallery = async (type?: string): Promise<GalleryItem[]> => {
    if (USE_LOCAL_CONTENT_ONLY === true) {
        return type === 'ticker' ? [] : STATIC_GALLERY;
    }

    if (!isSupabaseConfigured()) {
        return type === 'ticker' ? [] : STATIC_GALLERY;
    }

    let query = supabase.from('gallery').select('*').eq('is_active', true);
    if (type) query = query.eq('gallery_type', type);

    const { data, error } = await query.order('sort_order');

    if (error) {
        console.error('Gallery fetch error:', error);
        return type === 'ticker' ? [] : STATIC_GALLERY;
    }

    return data || (type === 'ticker' ? [] : STATIC_GALLERY);
};

export const getServices = async (): Promise<ServiceItem[]> => {
    if (USE_LOCAL_CONTENT_ONLY === true) {
        return STATIC_SERVICES;
    }

    if (!isSupabaseConfigured()) {
        return STATIC_SERVICES;
    }

    const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('title');

    if (error) {
        console.error('Services fetch error:', error);
        return STATIC_SERVICES;
    }

    return data || STATIC_SERVICES;
};

export const getSiteContent = async (section: string, key: string): Promise<string | null> => {
    console.log('[Supabase] getSiteContent called:', { section, key });

    if (!isSupabaseConfigured()) {
        console.log('[Supabase] Not configured, using static data');
        return STATIC_SITE_CONTENT[section]?.[key] || null;
    }

    const { data, error } = await supabase
        .from('site_content')
        .select('value_text')
        .eq('section', section)
        .eq('key_name', key)
        .eq('is_active', true)
        .limit(1);

    if (error) {
        console.error('[Supabase] Site content fetch error:', error);
        return STATIC_SITE_CONTENT[section]?.[key] || null;
    }

    console.log('[Supabase] Fetched value:', data?.[0]?.value_text);
    return data?.[0]?.value_text || null;
};

export const getAllSiteContent = async (): Promise<Record<string, Record<string, string>>> => {
    console.log('[Supabase] getAllSiteContent called');

    if (USE_LOCAL_CONTENT_ONLY === true) {
        console.log('[Supabase] Using local content from constants.tsx (USE_LOCAL_CONTENT_ONLY = true)');
        return SITE_CONTENT as unknown as Record<string, Record<string, string>>;
    }

    const localContent = SITE_CONTENT as unknown as Record<string, Record<string, string>>;

    if (!isSupabaseConfigured()) {
        console.log('[Supabase] Using local content (Supabase not configured)');
        return localContent;
    }

    const { data, error } = await supabase
        .from('site_content')
        .select('section, key_name, value_text')
        .eq('is_active', true);

    if (error) {
        console.error('[Supabase] Error fetching all site content:', error);
        return localContent;
    }

    console.log('[Supabase] Fetched all content:', data?.length, 'items');

    const result: Record<string, Record<string, string>> = { ...localContent };
    
    data?.forEach(item => {
        if (!result[item.section]) {
            result[item.section] = {};
        }
        if (item.value_text) {
            result[item.section][item.key_name] = item.value_text;
        }
    });

    console.log('[Supabase] Processed content sections:', Object.keys(result));
    return result;
};

export const getBookNowSettings = async (): Promise<BookNowSettings> => {
    console.log('[Supabase] getBookNowSettings called');
    const base: BookNowSettings = { ...STATIC_BOOK_NOW };

    if (!isSupabaseConfigured() || USE_LOCAL_CONTENT_ONLY === true) {
        return base;
    }

    // Fetch map_embed from DB (book_now section)
    const { data, error } = await supabase
        .from('site_content')
        .select('key_name, value_text')
        .eq('section', 'book_now')
        .eq('is_active', true);

    if (!error && data) {
        data.forEach(item => {
            if (item.value_text) {
                (base as any)[item.key_name] = item.value_text;
            }
        });
    }

    return base;
};

export const createAppointmentBooking = async (booking: AppointmentBooking): Promise<{ data?: any; error?: any }> => {
    if (!isSupabaseConfigured()) {
        console.log('[Supabase] Appointment would be saved (not configured):', booking);
        return { data: { id: 'static-' + Date.now() } };
    }

    console.log('[Supabase] Saving appointment to database...');
    console.log('[Supabase] Booking data:', JSON.stringify(booking, null, 2));

    const { data, error } = await supabase
        .from('appointment_bookings')
        .insert(booking)
        .select()
        .single();

    if (error) {
        console.error('[Supabase] Error saving appointment:', error);
    } else {
        console.log('[Supabase] Appointment saved successfully:', data);
    }

    return { data, error };
};

export const getFooterSettings = async (): Promise<{ text: string } | null> => {
    console.log('[Supabase] getFooterSettings called');
    const footerContent = await getSiteContent('footer', 'text');
    console.log('[Supabase] footer_content result:', footerContent);
    console.log('[Supabase] Will return:', { text: footerContent || '' });
    return { text: footerContent || '' };
};

export const updateNavigation = async (items: NavigationItem[]) => {
    if (!isSupabaseConfigured()) return { error: 'Supabase not configured' };
    const { error } = await supabase.from('navigation').upsert(items);
    return { error };
};

export const updateGallery = async (items: GalleryItem[]) => {
    if (!isSupabaseConfigured()) return { error: 'Supabase not configured' };
    const { error } = await supabase.from('gallery').upsert(items);
    return { error };
};

export const updateServices = async (items: ServiceItem[]) => {
    if (!isSupabaseConfigured()) return { error: 'Supabase not configured' };
    const { error } = await supabase.from('services').upsert(items);
    return { error };
};

export const updateSiteContent = async (section: string, key: string, value_text: string) => {
    if (!isSupabaseConfigured()) return { error: 'Supabase not configured' };
    const { error } = await supabase.from('site_content').upsert({ section, key_name: key, value_text });
    return { error };
};

export const addGalleryItem = async (item: Omit<GalleryItem, 'id' | 'created_at' | 'updated_at'>) => {
    if (!isSupabaseConfigured()) return { error: 'Supabase not configured' };
    const { error } = await supabase.from('gallery').insert(item);
    return { error };
};

export const deleteGalleryItem = async (id: string) => {
    if (!isSupabaseConfigured()) return { error: 'Supabase not configured' };
    const { error } = await supabase.from('gallery').delete().eq('id', id);
    return { error };
};

export const deleteNavigationItem = async (id: string) => {
    if (!isSupabaseConfigured()) return { error: 'Supabase not configured' };
    const { error } = await supabase.from('navigation').delete().eq('id', id);
    return { error };
};

export type { SiteContent, AppointmentBooking, GalleryItem, NavigationItem, ServiceItem, BookNowSettings };
