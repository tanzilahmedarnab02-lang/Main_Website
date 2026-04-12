
// =====================================================
// Database Schema Types (Matching supabase_schema.sql)
// =====================================================

// 1. SITE CONTENT (All editable text sections)
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

// 2. APPOINTMENT BOOKINGS
export interface AppointmentBooking {
    id: string;
    name: string;
    email: string;
    category: string | null;
    services: string[];  // PostgreSQL TEXT[] array
    price: string | null;
    phone_num: string | null;
    custom_date: string | null;  // Using custom_date only (no date column)
    status: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

// 3. GALLERY
export interface GalleryItem {
    id: string;
    title: string;
    category: string | null;
    image_url: string;
    alt_text: string | null;
    description: string | null;
    gallery_type: string;  // 'portfolio' | 'ticker'
    sort_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// 4. NAVIGATION
export interface NavigationItem {
    id: string;
    name: string;
    url: string;
    sort_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// 5. SERVICES (Text-only - no images/videos)
export interface ServiceItem {
    id: string;
    title: string;
    description: string | null;
    price: string | null;
    duration: string | null;
    category: string | null;
    is_active: boolean;
    is_featured: boolean;
    created_at: string;
    updated_at: string;
}

// =====================================================
// Application State Types
// =====================================================

export enum AppState {
    LOADING = 'LOADING',
    INTRO = 'INTRO',
    READY = 'READY'
}

// Book Now Settings from site_content (book_now section)
export interface BookNowSettings {
    // Header
    reserve_heading?: string;
    reserve_description?: string;
    book_button_text?: string;
    // Page
    page_title?: string;
    page_subtitle?: string;
    // Form Fields
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
    // Map
    map_label?: string;
    google_map_embed?: string;
    // Buttons
    submit_button?: string;
    add_protocol_button?: string;
    estimated_label?: string;
    sessions_button?: string;
    // Confirmation
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
}

// Footer Settings
export interface FooterSettings {
    text: string;
    copyright_text?: string;
    dev_email?: string;
    phone_number?: string;
    contact_email?: string;
    gmail?: string;
    gmail_embed?: string;
    instagram?: string;
    facebook?: string;
    whatsapp?: string;
}

// Site Content Sections (for TypeScript access)
export interface SiteContentSections {
    header: {
        main_heading?: string;
        subtitle?: string;
        status_label?: string;
        status_value?: string;
        logo_text?: string;
        logo_image?: string;
    };
    intro: {
        phase1_heading?: string;
        phase1_subtitle?: string;
    };
    studio: {
        status_text?: string;
    };
    about: {
        heading?: string;
        label?: string;
        description?: string;
        image?: string;
        imageText1?: string;
    };
    catalog: {
        heading?: string;
        catalog_label?: string;
        description?: string;
    };
    profile: {
        label?: string;
        name?: string;
        title?: string;
        quote?: string;
        mission_label?: string;
        mission_heading?: string;
        established_label?: string;
        established_value?: string;
        staff_label?: string;
        staff_value?: string;
        success_label?: string;
        success_value?: string;
        coordinate_label?: string;
        coordinate_value?: string;
    };
    footer: {
        text?: string;
        copyright_text?: string;
        dev_email?: string;
        phone_number?: string;
        contact_email?: string;
        gmail?: string;
        gmail_embed?: string;
        instagram?: string;
        facebook?: string;
        whatsapp?: string;
    };
}
