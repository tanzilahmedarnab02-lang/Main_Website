# Parlour Website Admin Panel & Database Setup

## Database Configuration

**Supabase URL:** Set via `VITE_SUPABASE_URL` environment variable
**Anon Key:** Set via `VITE_SUPABASE_ANON_KEY` environment variable

## Database Schema (5 Tables)

### Important Changes in Latest Update:
- **book_now section removed from site_content table** - UI labels now use local constants only
- **consultation section removed from site_content table** - Not used in main website
- **Added missing columns in services INSERT** - duration, is_active, is_featured now included

Run this SQL in Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. SITE CONTENT (All editable text sections)
-- =====================================================
CREATE TABLE IF NOT EXISTS site_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section VARCHAR(100) NOT NULL,
    key_name VARCHAR(100) NOT NULL,
    value_text TEXT,
    value_number DECIMAL(10, 2),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(section, key_name)
);

-- =====================================================
-- 2. APPOINTMENT BOOKINGS (Stores submitted appointments)
-- =====================================================
CREATE TABLE IF NOT EXISTS appointment_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    email VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    services TEXT[] DEFAULT '{}',
    price VARCHAR(50),
    phone_num VARCHAR(50),
    date DATE,
    custom_date VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. GALLERY
-- =====================================================
CREATE TABLE IF NOT EXISTS gallery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    image_url TEXT NOT NULL,
    alt_text VARCHAR(200),
    description TEXT,
    gallery_type VARCHAR(50) DEFAULT 'portfolio',
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. NAVIGATION
-- =====================================================
CREATE TABLE IF NOT EXISTS navigation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    url VARCHAR(255) NOT NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. SERVICES (Text-only - no images/videos)
-- =====================================================
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    price VARCHAR(50),
    duration VARCHAR(50),
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- DELETE UNUSED CONTENT ROWS
-- =====================================================

-- Delete consultation section rows (not used in main website)
DELETE FROM site_content WHERE section = 'consultation';

-- Delete book_now section rows (not used in main website - now uses local constants)
DELETE FROM site_content WHERE section = 'book_now';

-- =====================================================
-- INSERT DEFAULT DATA - SITE CONTENT
-- =====================================================

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 🎯 CRITICAL CONTENT - Main headings, descriptions, and brand messaging
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Header Section
INSERT INTO site_content (section, key_name, value_text, sort_order) VALUES
('header', 'main_heading', '***********', 1),
('header', 'subtitle', '*********************', 2),
('header', 'status_label', 'IDENTITY REFINEMENT', 3),
('header', 'status_value', 'STATUS: OPERATIONAL', 4),
('header', 'logo_text', 'YOUR LOGO TEXT', 5),
('header', 'logo_image', 'https://png.pngtree.com/png-vector/20220513/ourmid/pngtree-beauty-logo-png-image_4585130.png', 6)
ON CONFLICT (section, key_name) DO UPDATE SET value_text = EXCLUDED.value_text;

-- Intro Section
INSERT INTO site_content (section, key_name, value_text, sort_order) VALUES
('intro', 'phase1_heading', 'BEAUTY REFINED', 1),
('intro', 'phase1_subtitle', 'Est. 0000 — Salon & Spa', 2)
ON CONFLICT (section, key_name) DO UPDATE SET value_text = EXCLUDED.value_text;

-- Studio Work Section
INSERT INTO site_content (section, key_name, value_text, sort_order) VALUES
('studio', 'status_text', 'SEQUENCE ACTIVE: 100% COMPLETE', 1)
ON CONFLICT (section, key_name) DO UPDATE SET value_text = EXCLUDED.value_text;

-- About Section
INSERT INTO site_content (section, key_name, value_text, sort_order) VALUES
('about', 'heading', 'CRAFTED IN CHAOS', 1),
('about', 'label', '[ PHILOSOPHY.EXE ]', 2),
('about', 'description', 'We do not just cut hair; we engineer identities. Our Parlour is a sanctuary for those who seek to bridge the gap between their vision and reality.', 3),
('about', 'image', 'https://i.pinimg.com/736x/da/4a/71/da4a71c1e8529cb1543ca1eedfeb4653.jpg', 4),
('about', 'imageText1', '****', 5)
ON CONFLICT (section, key_name) DO UPDATE SET value_text = EXCLUDED.value_text;

-- Catalog Section
INSERT INTO site_content (section, key_name, value_text, sort_order) VALUES
('catalog', 'heading', 'THE CATALOG', 1),
('catalog', 'catalog_label', '[ ARCHIVE // SERVICES ]', 2),
('catalog', 'description', 'A curated selection of aesthetic protocols designed for identity calibration.', 3)
ON CONFLICT (section, key_name) DO UPDATE SET value_text = EXCLUDED.value_text;

-- Profile Section
INSERT INTO site_content (section, key_name, value_text, sort_order) VALUES
('profile', 'label', '[ PERSONNEL RECORD // ARCH-01 ]', 1),
('profile', 'name', 'XXXX', 2),
('profile', 'title', 'CHIEF AESTHETIC ARCHITECT. 00 YEARS OF IDENTITY CALIBRATION. DISTRICT 41 REPRESENTATIVE.', 3),
('profile', 'quote', '"EVERY LINE IS A CALIBRATION, EVERY SHADE A CHOICE. WE DISCARD THE CONVENTIONAL TO ENGINEER THE EXCEPTIONAL."', 4),
('profile', 'mission_label', '// THE MISSION ARCHITECTURE', 5),
('profile', 'mission_heading', 'WE DO NOT PROVIDE SERVICE. WE EXECUTE PROTOCOL. THE PARLOUR IS A CALIBRATION HUB FOR THE AVANT-GARDE.', 6),
('profile', 'established_label', 'ESTABLISHED', 7),
('profile', 'established_value', '0000', 8),
('profile', 'staff_label', 'STAFF COUNT', 9),
('profile', 'staff_value', '00', 10),
('profile', 'success_label', 'SUCCESS RATE', 11),
('profile', 'success_value', '100%', 12),
('profile', 'coordinate_label', 'COORDINATE', 13),
('profile', 'coordinate_value', 'D-41', 14)
ON CONFLICT (section, key_name) DO UPDATE SET value_text = EXCLUDED.value_text;

-- Footer Section
INSERT INTO site_content (section, key_name, value_text, sort_order) VALUES
('footer', 'text', '****', 1),
('footer', 'copyright_text', '© 0000 ******. ALL RIGHTS RESERVED.', 2),
('footer', 'dev_email', '****@.com', 3),
('footer', 'contact_email', '****@.com', 4),
('footer', 'instagram', '', 5),
('footer', 'facebook', '', 6),
('footer', 'gmail', '', 7),
('footer', 'gmail_embed', '', 8),
('footer', 'whatsapp', '880123456789', 9)
ON CONFLICT (section, key_name) DO UPDATE SET value_text = EXCLUDED.value_text;

-- =====================================================
-- INSERT DEFAULT DATA - OTHER TABLES
-- =====================================================

-- Navigation
INSERT INTO navigation (name, url, sort_order) VALUES
('HOME', '#hero', 1),
('STUDIO', '#studio-work', 2),
('ABOUT', '#about', 3),
('CATALOG', '#catalog', 4),
('RESERVE', '#footer', 5)
ON CONFLICT DO NOTHING;

-- Services (Text-only - no images/videos)
-- Note: Services data should be added via Supabase Dashboard → Services Table
-- INSERT INTO services (title, category, price, description, duration, is_active, is_featured) VALUES
-- ('THE SIGNATURE CUT', 'HAIR ARTISTRY', '$85.00', 'Signature hair cutting service', '60 MIN', true, false),
-- ('INK & ETHOS', 'CUSTOM TATTOO', '$150/HR', 'Custom tattoo design and application', '60 MIN', true, false),
-- ('FORGED AESTHETICS', 'GROOMING', '$65.00', 'Professional grooming services', '45 MIN', true, false),
-- ('THE PARLOUR LOUNGE', 'EXPERIENCE', 'COMPLIMENTARY', 'Luxury lounge experience', '30 MIN', true, false),
-- ('NOIR TREATMENTS', 'FACIAL CARE', '$95.00', 'Premium facial treatments', '60 MIN', true, false)
-- ON CONFLICT DO NOTHING;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE navigation ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Public Read Access
CREATE POLICY "Public read site_content" ON site_content FOR SELECT USING (true);
CREATE POLICY "Public read appointment_bookings" ON appointment_bookings FOR SELECT USING (true);
CREATE POLICY "Public read gallery" ON gallery FOR SELECT USING (is_active = true);
CREATE POLICY "Public read navigation" ON navigation FOR SELECT USING (is_active = true);
CREATE POLICY "Public read services" ON services FOR SELECT USING (is_active = true);

-- Public INSERT Access (for anonymous booking submissions)
CREATE POLICY "Public insert appointment_bookings" ON appointment_bookings FOR INSERT WITH CHECK (true);

-- Authenticated Write Access (Admin)
CREATE POLICY "Admin manage site_content" ON site_content FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin manage appointment_bookings" ON appointment_bookings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin manage gallery" ON gallery FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin manage navigation" ON navigation FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin manage services" ON services FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_site_content_time BEFORE UPDATE ON site_content FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_appointment_bookings_time BEFORE UPDATE ON appointment_bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_gallery_time BEFORE UPDATE ON gallery FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_navigation_time BEFORE UPDATE ON navigation FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_services_time BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_site_content_section ON site_content(section);
CREATE INDEX idx_appointment_bookings_status ON appointment_bookings(status);
CREATE INDEX idx_gallery_type ON gallery(gallery_type);
CREATE INDEX idx_gallery_order ON gallery(sort_order);
CREATE INDEX idx_nav_order ON navigation(sort_order);
CREATE INDEX idx_services_category ON services(category);
```

## Admin Panel Sections

### 1. Site Content (Edit ALL Text)
Edit any text on the website by section:
- **header**: main_heading, subtitle, status_label, status_value, logo_text, logo_image
- **intro**: phase1_heading, phase1_subtitle
- **studio**: status_text
- **about**: heading, label, description, image, imageText1
- **catalog**: heading, catalog_label, description
- **profile**: label, name, title, quote, mission_label, mission_heading, established_label, established_value, staff_label, staff_value, success_label, success_value, coordinate_label, coordinate_value
- **footer**: text, copyright_text, dev_email, contact_email, gmail, gmail_embed, instagram, facebook, whatsapp

### 2. Appointment Bookings
- View all appointment submissions
- Filter by status (pending/confirmed/cancelled)
- See customer details and selected services
- Update booking status

### 3. Gallery
- Add/Edit/Delete images
- Set category
- Choose type: Portfolio or Ticker
- Drag to reorder

### 4. Navigation
- Edit menu names
- Change URLs
- Reorder menu items
- Show/hide items

### 5. Services (Text-only)
- Add/Edit/Delete services
- Set name, price, description, duration
- Categorize
- Feature popular services
- **Note: Services are text-only (no images or videos)**

## Features Required
- Login/Authentication
- Dashboard overview
- Live preview of changes
- Image upload for gallery
- Drag-and-drop sorting
- Mobile responsive
- Success notifications

## Environment Variables
```
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
VITE_GEMINI_API_KEY=<your-gemini-api-key>
```

These values should be configured as Netlify environment variables in Site Settings → Build & deploy → Environment variables. Do not commit actual values to the repository.
