
import React from 'react';

// Services will be fetched from Supabase
// To add services, go to Supabase Dashboard → Services Table
export const SERVICES: any[] = [];

export const ScribbleIcon = () => (
  <svg viewBox="0 0 100 100" className="w-24 h-24 stroke-white fill-none opacity-60">
    <path d="M20,20 L80,20 L80,80 L20,80 Z" strokeWidth="1" />
    <path d="M15,25 L85,25" strokeWidth="0.5" />
    <path d="M30,10 L30,90" strokeWidth="0.5" />
    <path d="M40,40 L60,60 M60,40 L40,60" strokeWidth="1" />
  </svg>
);

// ═══════════════════════════════════════════════════════════════════════════════════
// SITE CONTENT CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════
// Edit these values to change website text without touching Supabase.
// Organized into sections matching site_content database table columns:
// - section: 'header', 'intro', 'studio', 'about', 'catalog', 'profile', 'footer'
// - key_name: The specific field name within each section
// - value_text: The actual text content
//
// Note: The 'book_now' section is deprecated (rows deleted from DB) but kept here
// as local fallback constants for booking form UI labels and placeholders.
// ═══════════════════════════════════════════════════════════════════════════════════

export const SITE_CONTENT = {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🎯 CRITICAL CONTENT - Main headings, descriptions, and brand messaging
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // Hero Section - First thing visitors see
  // DB: site_content.section = 'header'
  header: {
    main_heading: 'YOUR BUSINESS NAME',
    subtitle: 'YOUR BUSINESS SUBTITLE',
    status_label: 'IDENTITY REFINEMENT',
    status_value: 'STATUS: OPERATIONAL',
    logo_text: 'YOUR BUSINESS NAME', // Text to display as logo in navigation
    logo_image: `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/about%20section/post-estilobeautysalon-oct-10-2019%20(2).jpeg` // Optional: URL to logo image
  },

  // Intro Animation
  // DB: site_content.section = 'intro'
  intro: {
    phase1_heading: '',
    phase1_subtitle: ''
  },

  // About Section - Brand philosophy
  // DB: site_content.section = 'about'
  about: {
    heading: 'CRAFTED IN CHAOS',
    label: 'PHILOSOPHY.EXE',
    description: 'We do not just cut hair; we engineer identities. Our Parlour is a sanctuary for those who seek to bridge the gap between their vision and reality.',
    image: '',
    imageText1: ''
  },

  // Catalog Section
  // DB: site_content.section = 'catalog'
  catalog: {
    heading: 'THE CATALOG',
    catalog_label: '[ ARCHIVE // SERVICES ]',
    description: 'A curated selection of aesthetic protocols designed for identity calibration.'
  },

  // Profile/Archive Section - Team and mission
  // DB: site_content.section = 'profile'
  profile: {
    label: '[ PERSONNEL RECORD // ARCH-01 ]',
    name: '',
    title: 'CHIEF AESTHETIC ARCHITECT. 00 YEARS OF IDENTITY CALIBRATION. DISTRICT 41 REPRESENTATIVE.',
    quote: '"EVERY LINE IS A CALIBRATION, EVERY SHADE A CHOICE. WE DISCARD THE CONVENTIONAL TO ENGINEER THE EXCEPTIONAL."',
    mission_label: '// THE MISSION ARCHITECTURE',
    mission_heading: 'WE DO NOT PROVIDE SERVICE. WE EXECUTE PROTOCOL. THE PARLOUR IS A CALIBRATION HUB FOR THE AVANT-GARDE.',
    established_label: 'ESTABLISHED',
    established_value: '',
    staff_label: 'STAFF COUNT',
    staff_value: '',
    success_label: 'SUCCESS RATE',
    success_value: '',
    coordinate_label: 'COORDINATE',
    coordinate_value: ''
  },

  // Footer
  // DB: site_content.section = 'footer'
  footer: {
    text: '',
    copyright_text: '',
    dev_email: '',
    contact_email: '',
    instagram: '',
    facebook: '',
    gmail: '',
    gmail_embed: '', // Gmail embed link (e.g., Gmail compose URL or embed code)
    map_embed: '', // Google Maps embed URL
    whatsapp: '' // WhatsApp number with country code (no + symbol)
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🏷️ UI LABELS & PLACEHOLDERS - Form fields, buttons, and status messages
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Note: These are kept as local constants. The 'book_now' section was removed
  // from the database, but these values serve as fallback for the booking form UI.

  // Studio Work Gallery
  // DB: site_content.section = 'studio'
  studio: {
    status_text: ''
  },

  // Booking Form & Confirmation
  // Local constants (no DB storage - schema 'book_now' section deleted)
  bookNow: {
    // Reserve Section
    reserve_heading: 'RESERVE NOW',
    reserve_description: 'AVAILABILITY IS LIMITED. EXPERIENCE IS MANDATORY.',
    book_button_text: 'Book Appointment',

    // Form Page
    page_title: 'BOOK NOW',
    page_subtitle: 'ONLINE',

    // Form Fields
    subject_label: 'NAME',
    subject_placeholder: 'ENTER NAME_',
    email_label: 'Email',
    email_placeholder: 'ENTER EMAIL_',
    category_label: 'Category',
    category_placeholder: 'SELECT CATEGORY',
    services_label: 'Services',
    services_placeholder: 'SELECT SERVICES',
    coms_label: 'NUMBER',
    coms_placeholder: '+1 (000) 000-0000',
    date_label: 'DATE',
    date_placeholder: '',
    date_calendar_label: 'CALENDAR // QUANTUM',
    map_label: 'STRATEGIC COORDINATE',

    // Form Actions
    submit_button: 'START SESSION',
    add_protocol_button: 'ADD PROTOCOL',
    estimated_label: 'ESTIMATED TOTAL INVESTMENT',
    sessions_button: 'BOOK {COUNT} {SESSIONS}',

    // Confirmation Screen
    confirm_status_label: '// CONFIRMATION STATUS: ALPHA-1',
    confirm_heading: 'PROTOCOL INITIATED',
    confirm_description: 'YOUR ARCHIVE HAS BEEN SUCCESSFULLY CREATED. DOWNLOAD YOUR PASS BELOW.', // P41
    confirm_subject_label: 'Subject',
    confirm_coordinate_label: 'Coordinate',
    confirm_investment_label: 'Investment',
    confirm_protocol_label: 'Protocol Sequence',
    confirmed_badge: 'CONFIRMED',
    cancel_button: '',
    download_button: ''
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ⚙️ TECHNICAL SETTINGS - URLs, embeds, and configuration
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // Note: Google Maps embed is in bookNow.google_map_embed above
};

// Set to true to use local content only (Supabase will be ignored)
export const USE_LOCAL_CONTENT_ONLY = false;
