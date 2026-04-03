# Product Specification Document: Parlour Website

## 1. Project Overview
**Parlour** is a premium, high-performance beauty and styling studio website designed to provide a seamless user experience for browsing services, viewing portfolio work, and booking appointments. The project emphasizes rich aesthetics, smooth interactions, and real-time content management.

### 1.1 Objective
To create a "WOW" factor through modern web design (GSAP, Framer Motion) while maintaining 100% responsiveness and functionality across all devices (Mobile, Tablet, Desktop).

---

## 2. Core Features

### 2.1 Interactive Experience
- **Intro Animation:** A custom "Scribble" animation sequence that introduces the brand (Parlour) upon page load.
- **Smooth Navigation:** A persistent, elegant navigation system that allows users to jump to sections or open a mobile-friendly menu.
- **Smooth Scroll (Lenis):** Implementation of inertial scrolling for a premium, non-jittery feel.

### 2.2 Services Catalog
- **Categorization:** Services are grouped (e.g., ALL, Styling, Treatments).
- **Service Details:** Each service displays title, duration (e.g., 45m), and price.
- **Data Source:** Real-time synchronization with Supabase, allowing studio owners to update prices/services instantly.

### 2.3 Studio Work (Portfolio)
- **Dynamic Slider:** A high-performance horizontal slider using GSAP `Draggable` with spring-back momentum.
- **Gallery Modal:** Full-screen viewing of portfolio items with responsive image handling.
- **Interaction:** Supports mouse dragging, touch swiping, and mouse wheel navigation.

### 2.4 Appointment Booking System
- **Service Selection:** Multi-select interface for choosing one or more studio services.
- **Custom Calendar:** A bespoke date picker allowing users to choose available dates.
- **User Information:** Collection of Name, Email, and Communication preferences (Coms Link).
- **Validation:** Visual feedback for incomplete fields (vibration animations on error).
- **Confirmation Flow:** Clear "Processing" and "Success" states to confirm booking.

---

## 3. Technical Requirements

### 3.1 Tech Stack
- **Frontend:** React (Vite), TypeScript.
- **Styling:** Tailwind CSS, Vanilla CSS for micro-animations.
- **Animations:** GSAP (ScrollTrigger, Draggable), Framer Motion.
- **Backend:** Supabase (Database, Real-time Subscription, Edge Functions).

### 3.2 Responsiveness & UX
- **Fluid Typography:** Use of CSS `clamp()` for headings to ensure readability from 320px to 4K displays.
- **Responsive Layouts:**
    - **Mobile:** Single-column layouts, touch-optimized targets.
    - **Desktop:** Multi-column grids, hover effects, parallax elements.
- **Anti-Glitch Measures:**
    - Scroll locking when modals/panels are open.
    - GPU-accelerated transforms for all animations.
    - Balanced line breaking for hero headings.

### 3.3 SEO & Performance
- **Semantic HTML:** Correct use of `<h1>` through `<h6>`, `<section>`, and `<nav>`.
- **Media Optimization:** Lazy loading for gallery images.

---

## 4. Quality Standards
- **Zero Errors:** No console warnings or runtime exceptions.
- **No Glitch:** Transitions must be smooth without frame drops.
- **Interactive Feedback:** Every user action (hover, click, error) must have a visual response.
