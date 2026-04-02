import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions for Supabase data
export interface NavigationItem {
    id: string;
    name: string;
    url: string;
    icon?: string;
    sort_order: number;
    is_active: boolean;
}

export interface FooterContent {
    id: string;
    section_name: string;
    content: string;
    link_url?: string;
    link_text?: string;
    sort_order: number;
}

export interface GalleryItem {
    id: string;
    title?: string;
    image_url: string;
    alt_text?: string;
    description?: string;
    sort_order: number;
    is_active: boolean;
}

export interface IntroPhase {
    id: string;
    phase: number;
    heading?: string;
    subheading?: string;
    description?: string;
}

export interface StyleConsultation {
    id: string;
    title?: string;
    subtitle?: string;
    placeholder_text?: string;
    button_text?: string;
    is_active: boolean;
}

export interface PortfolioCategory {
    id: string;
    name: string;
    slug: string;
    description?: string;
    sort_order: number;
    is_active: boolean;
}

export interface PortfolioImage {
    id: string;
    category_id?: string;
    title: string;
    image_url: string;
    alt_text?: string;
    description?: string;
    sort_order: number;
    is_active: boolean;
}

export interface ServiceItem {
    id: string;
    title: string;
    description?: string;
    price: number;
    duration_minutes: number;
    category: string;
    image_url?: string;
    is_active: boolean;
    is_featured: boolean;
}

export interface SiteSetting {
    id: string;
    key_name: string;
    key_value: string;
    description?: string;
}

export interface ContactInfo {
    id: string;
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    country?: string;
    whatsapp_link?: string;
    instagram_link?: string;
    facebook_link?: string;
    opening_hours?: string;
}

export interface SEOSetting {
    id: string;
    page_name: string;
    meta_title?: string;
    meta_description?: string;
    keywords?: string[];
    og_image_url?: string;
}

export interface BookingSettings {
    id: string;
    appointment_duration: number;
    advance_booking_days: number;
    is_booking_enabled: boolean;
}
