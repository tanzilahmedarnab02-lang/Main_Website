import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger, Draggable } from 'gsap/all';
import { useGSAP } from '@gsap/react';
import html2canvas from 'html2canvas';
import Lenis from 'lenis';
import IntroScribble from './components/IntroScribble';
import Navigation from './components/Navigation';
import FooterTitle from './components/FooterTitle';
import GradientBlinds from './components/GradientBlinds';
import HeroSbg from './components/herosbg';
import TiltedCard from './components/TiltedCard';
import DynamicMainHeading from './components/DynamicMainHeading';
import TornEdge from './components/TornEdge';
import { CalendarIcon } from './components/BookingIcons';
import DateInput from './components/DateInput';
import CountUpText from './components/CountUpText';

// Lazy load heavy components
const SimpleCalendar = lazy(() => import('./components/SimpleCalendar'));
const ServicePanel = lazy(() => import('./components/ServicePanel'));
import { AppState } from './types';
import { SERVICES, SITE_CONTENT, USE_LOCAL_CONTENT_ONLY } from './constants';
import { getFooterSettings, getBookNowSettings, createAppointmentBooking, getAllSiteContent, getServices, getGallery, BookNowSettings, ServiceItem, GalleryItem } from './services/contentService';
import { supabase } from './services/supabaseClient';

gsap.registerPlugin(ScrollTrigger, Draggable);

const App: React.FC = () => {
    const [appState, setAppState] = useState<AppState>(AppState.INTRO);
    const [showAppointment, setShowAppointment] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [customDateText, setCustomDateText] = useState("");
    const [activePanel, setActivePanel] = useState<'calendar' | 'services' | null>(null);
    const [activeCatalogCategory, setActiveCatalogCategory] = useState<string>('ALL');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Form values & Errors
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [subjectName, setSubjectName] = useState("");
    const [emailLink, setEmailLink] = useState("");
    const [comsLink, setComsLink] = useState("");
    const [bookingError, setBookingError] = useState<string | null>(null);
    const [vibrateKey, setVibrateKey] = useState(0);

    const containerRef = useRef<HTMLDivElement>(null);
    const portfolioRef = useRef<HTMLElement>(null);
    const sliderRef = useRef<HTMLDivElement>(null);
    const appointmentRef = useRef<HTMLDivElement>(null);
    const pathRef = useRef<SVGPathElement>(null);
    const footerRef = useRef<HTMLElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const calendarPanelRef = useRef<HTMLDivElement>(null);
    const ticketRef = useRef<HTMLDivElement>(null);
    const draggableRef = useRef<any>(null);

    // Parallax refs
    const heroContentRef = useRef<HTMLDivElement>(null);
    const heroBgRef = useRef<HTMLDivElement>(null);
    const aboutTextRef = useRef<HTMLDivElement>(null);
    const aboutCardRef = useRef<HTMLDivElement>(null);
    const catalogHeaderRef = useRef<HTMLDivElement>(null);
    const archiveProfileRef = useRef<HTMLDivElement>(null);
    const archiveStatsRef = useRef<HTMLDivElement>(null);
    const footerTitleRef = useRef<HTMLDivElement>(null);
    const parallaxElementsRef = useRef<HTMLDivElement>(null);

    const [footerText, setFooterText] = useState((SITE_CONTENT as any).footer?.text || '');
    const [bookNowSettings, setBookNowSettings] = useState<BookNowSettings | null>(null);
    const [siteContent, setSiteContent] = useState<Record<string, Record<string, string>> | null>(SITE_CONTENT as any);
    const [services, setServices] = useState<ServiceItem[]>([]);
    const [gallery, setGallery] = useState<GalleryItem[]>([]);
    const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
    const [galleryModalIndex, setGalleryModalIndex] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const dragStartY = useRef(0);
    const dragStartScroll = useRef(0);
    const galleryScrollRef = useRef<HTMLDivElement>(null);
    const lenisRef = useRef<Lenis | null>(null);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isGalleryModalOpen) {
            document.body.style.overflow = 'hidden';
            if (lenisRef.current) {
                lenisRef.current.stop();
            }
        } else {
            document.body.style.overflow = '';
            if (lenisRef.current) {
                lenisRef.current.start();
            }
        }
        return () => {
            document.body.style.overflow = '';
            if (lenisRef.current) {
                lenisRef.current.start();
            }
        };
    }, [isGalleryModalOpen]);

    // Fetch footer text, book now settings, and all site content from Supabase
    const fetchSettings = async () => {
        // If USE_LOCAL_CONTENT_ONLY is true, skip Supabase fetch entirely and use local content
        if (USE_LOCAL_CONTENT_ONLY) {
            console.log('[App] USE_LOCAL_CONTENT_ONLY is true, using local content only');
            setSiteContent(SITE_CONTENT as any);
            return;
        }

        console.log('[App] Starting to fetch settings from Supabase...');
        const settings = await getFooterSettings();
        console.log('[App] Footer settings received:', settings);
        if (settings) {
            console.log('[App] Setting footerText to:', settings.text);
            setFooterText(settings.text);
        } else {
            console.log('[App] No footer settings received, footerText remains:', footerText);
        }

        const bookNow = await getBookNowSettings();
        setBookNowSettings(bookNow);

        // Fetch all site content from Supabase (or use local if configured)
        const allContent = await getAllSiteContent();
        console.log('[App] All site content fetched:', allContent);
        console.log('[App] Footer content in allContent:', allContent?.footer);
        setSiteContent(allContent);

        // Fetch services from Supabase
        const fetchedServices = await getServices();
        console.log('[App] Services fetched:', fetchedServices);
        setServices(fetchedServices);

        // Fetch gallery/portfolio from Supabase
        const fetchedGallery = await getGallery('portfolio');
        console.log('[App] Gallery fetched:', fetchedGallery);
        setGallery(fetchedGallery);
    };

    useEffect(() => {
        fetchSettings();

        // Real-time subscription for site_content changes
        const siteContentChannel = supabase
            .channel('site_content_changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'site_content' },
                (payload) => {
                    console.log('[App] Site content changed:', payload);
                    fetchSettings(); // Re-fetch all settings when content changes
                }
            )
            .subscribe();

        // Real-time subscription for services changes
        const servicesChannel = supabase
            .channel('services_changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'services' },
                (payload) => {
                    console.log('[App] Services changed:', payload);
                    getServices().then(services => setServices(services));
                }
            )
            .subscribe();

        // Real-time subscription for gallery changes
        const galleryChannel = supabase
            .channel('gallery_changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'gallery' },
                (payload) => {
                    console.log('[App] Gallery changed:', payload);
                    getGallery('portfolio').then(gallery => setGallery(gallery));
                }
            )
            .subscribe();

        // Re-fetch when window gains focus (after switching tabs or returning from Supabase editor)
        const handleFocus = () => {
            console.log('[Settings] Window focused - re-fetching from Supabase...');
            fetchSettings();
        };

        window.addEventListener('focus', handleFocus);

        return () => {
            supabase.removeChannel(siteContentChannel);
            supabase.removeChannel(servicesChannel);
            supabase.removeChannel(galleryChannel);
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    // Lenis smooth scroll
    useEffect(() => {
        if (appState !== AppState.READY) return;
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            infinite: false,
        });
        lenisRef.current = lenis;
        (window as any).__lenis = lenis; // Store globally for ServicePanel access
        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
        return () => lenis.destroy();
    }, [appState]);

    // Panel close handler
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (activePanel && !panelRef.current?.contains(event.target as Node) && !calendarPanelRef.current?.contains(event.target as Node)) {
                setActivePanel(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [activePanel]);

    const sliderTrackRef = useRef<HTMLDivElement>(null);

    // GSAP animations - Initialize Draggable immediately when DOM is ready
    useGSAP(() => {
        console.log('[App] useGSAP running, appState:', appState);

        // Parallax Animations for all sections



        // About Section Parallax removed to keep static alignment with card



        // Studio Work section cards parallax
        const studioCards = document.querySelectorAll('.studio-project-card');
        studioCards.forEach((card, index) => {
            gsap.to(card, {
                y: -20 - (index * 5),
                ease: 'none',
                scrollTrigger: {
                    trigger: '#studio-work',
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1
                }
            });
        });


    }, { scope: containerRef });

    // Sync ScrollTrigger with page height changes (Booking form, etc)
    useEffect(() => {
        const handleScrollRefresh = () => {
            ScrollTrigger.refresh();
            console.log('[App] ScrollTrigger refreshed due to layout change');
        };

        // Refresh twice to ensure stability
        const timer1 = setTimeout(handleScrollRefresh, 100);
        const timer2 = setTimeout(handleScrollRefresh, 800);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, [showAppointment, isConfirmed, selectedServiceIds.length, appState]);

    // Initialize slider for Studio Work section
    useEffect(() => {
        let isDragging = false;
        let startX = 0;
        let scrollLeft = 0;
        let velocity = 0;
        let lastX = 0;
        let lastTime = 0;
        let momentumID: number | null = null;

        const initSlider = () => {
            const track = sliderTrackRef.current;
            const container = sliderRef.current;
            if (!track || !container) return;

            // Kill any existing Draggable
            const existingDraggable = Draggable.get(track);
            if (existingDraggable) existingDraggable.kill();

            // Stop any existing momentum
            if (momentumID) {
                cancelAnimationFrame(momentumID);
                momentumID = null;
            }

            // Use native scroll on all devices for full visibility
            const isDesktop = window.innerWidth >= 1024;

            if (isDesktop) {
                // Desktop: use native scroll + mouse drag with spring bounce
                track.style.scrollSnapType = 'none';
                track.style.overflowY = 'hidden';
                container.style.overflowY = 'hidden';
                container.style.width = '100%';
                track.style.cursor = 'grab';
                track.style.userSelect = 'none';
                track.style.touchAction = 'pan-x';

                // Reset scroll position to show first image fully
                track.scrollLeft = 0;

                // Add mouse drag functionality with spring momentum
                const handleMouseDown = (e: MouseEvent) => {
                    isDragging = true;
                    track.style.cursor = 'grabbing';
                    startX = e.pageX - track.offsetLeft;
                    scrollLeft = track.scrollLeft;
                    velocity = 0;
                    lastX = e.pageX;
                    lastTime = Date.now();

                    // Stop any momentum when starting to drag
                    if (momentumID) {
                        cancelAnimationFrame(momentumID);
                        momentumID = null;
                    }
                };

                const handleMouseLeave = () => {
                    if (isDragging) {
                        isDragging = false;
                        track.style.cursor = 'grab';
                        // Apply momentum on leave
                        applyMomentum();
                    }
                };

                const handleMouseUp = () => {
                    if (isDragging) {
                        isDragging = false;
                        track.style.cursor = 'grab';
                        // Apply momentum on release
                        applyMomentum();
                    }
                };

                const handleMouseMove = (e: MouseEvent) => {
                    if (!isDragging) return;
                    e.preventDefault();
                    const x = e.pageX - track.offsetLeft;
                    const walk = (x - startX) * 2; // Scroll speed multiplier
                    track.scrollLeft = scrollLeft - walk;

                    // Calculate velocity for momentum
                    const now = Date.now();
                    const dt = now - lastTime;
                    if (dt > 0) {
                        velocity = (e.pageX - lastX) / dt;
                    }
                    lastX = e.pageX;
                    lastTime = now;
                };

                // Spring momentum function - bounces back when at edges
                const applyMomentum = () => {
                    const maxScroll = track.scrollWidth - track.clientWidth;
                    let currentVelocity = velocity * 15; // Velocity multiplier

                    const momentumStep = () => {
                        if (Math.abs(currentVelocity) < 0.5) {
                            // Apply spring bounce at edges
                            if (track.scrollLeft < 0) {
                                // Spring back from left edge
                                currentVelocity = -track.scrollLeft * 0.15;
                                track.scrollLeft += currentVelocity;
                                if (track.scrollLeft >= 0) {
                                    track.scrollLeft = 0;
                                    momentumID = null;
                                    return;
                                }
                            } else if (track.scrollLeft > maxScroll) {
                                // Spring back from right edge
                                currentVelocity = -(track.scrollLeft - maxScroll) * 0.15;
                                track.scrollLeft += currentVelocity;
                                if (track.scrollLeft <= maxScroll) {
                                    track.scrollLeft = maxScroll;
                                    momentumID = null;
                                    return;
                                }
                            } else {
                                momentumID = null;
                                return;
                            }
                        } else {
                            // Apply momentum with decay
                            track.scrollLeft -= currentVelocity;
                            currentVelocity *= 0.95; // Friction

                            // Bounce at edges
                            if (track.scrollLeft < 0) {
                                track.scrollLeft = 0;
                                currentVelocity *= -0.3; // Bounce with energy loss
                            } else if (track.scrollLeft > maxScroll) {
                                track.scrollLeft = maxScroll;
                                currentVelocity *= -0.3; // Bounce with energy loss
                            }
                        }

                        if (momentumID) {
                            momentumID = requestAnimationFrame(momentumStep);
                        }
                    };

                    momentumID = requestAnimationFrame(momentumStep);
                };

                // Remove old listeners if they exist
                track.removeEventListener('mousedown', handleMouseDown);
                track.removeEventListener('mouseleave', handleMouseLeave);
                track.removeEventListener('mouseup', handleMouseUp);
                track.removeEventListener('mousemove', handleMouseMove);

                // Add new listeners
                track.addEventListener('mousedown', handleMouseDown);
                track.addEventListener('mouseleave', handleMouseLeave);
                track.addEventListener('mouseup', handleMouseUp);
                track.addEventListener('mousemove', handleMouseMove);

                console.log('[Studio Work] Desktop: Using native scroll + mouse drag with spring bounce for full visibility', window.innerWidth);
            } else {
                // Mobile/tablet: use native scroll - both horizontal and vertical
                track.style.scrollSnapType = 'x mandatory';
                track.style.overflowX = 'auto';
                track.style.overflowY = 'auto';
                track.style.touchAction = 'pan-x pan-y';
                container.style.overflowX = 'auto';
                container.style.overflowY = 'auto';
                track.style.cursor = 'auto';
                track.style.userSelect = 'auto';

                console.log('[Studio Work] Mobile/Tablet: Horizontal + Vertical scroll');
            }
        };

        // Initialize after a short delay
        const timer = setTimeout(initSlider, 800);
        window.addEventListener('load', initSlider);

        // Handle resize with debounce to recalculate bounds
        let resizeTimer: NodeJS.Timeout;
        const handleResize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(initSlider, 300);
        };
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            clearTimeout(timer);
            clearTimeout(resizeTimer);
            window.removeEventListener('load', initSlider);
            window.removeEventListener('resize', handleResize);
            const track = sliderTrackRef.current;
            if (track) {
                const draggable = Draggable.get(track);
                if (draggable) draggable.kill();
            }
        };
    }, [appState]);


    const moveSlider = (direction: 'prev' | 'next', e?: React.MouseEvent) => {
        if (e) e.preventDefault();
        if (!sliderTrackRef.current || !sliderRef.current) return;
        const track = sliderTrackRef.current;
        const container = sliderRef.current;

        // Recalculate bounds before animation to ensure accuracy
        const containerWidth = container.offsetWidth;
        const trackWidth = track.scrollWidth;
        const itemStyle = window.getComputedStyle(track);

        // Allow full scroll to show complete last image
        const minX = -(trackWidth - containerWidth);
        const maxX = 0;

        // Update Draggable bounds before animation
        const draggable = Draggable.get(track);
        if (draggable) {
            draggable.vars.bounds = { minX, maxX };
            draggable.update(true);
        }

        // Get item width dynamically
        const firstItemEl = track.querySelector('.gallery-item') as HTMLElement;
        if (!firstItemEl) return;
        const gap = parseInt(itemStyle.gap) || 32;
        const itemWidth = firstItemEl.offsetWidth + gap;

        const currentX = gsap.getProperty(track, 'x') as number;

        // Check if already at bounds - strict check
        if (direction === 'next') {
            // At end if current position is at or past minimum
            if (Math.abs(currentX) >= Math.abs(minX) - 1) return;
        } else {
            // At start if position is at or past maximum
            if (currentX >= -1) return;
        }

        let targetX = direction === 'next' ? currentX - itemWidth : currentX + itemWidth;

        // Strict clamping to prevent over-scroll
        targetX = Math.min(0, Math.max(minX, targetX));

        gsap.killTweensOf(track);
        gsap.to(track, {
            x: targetX,
            duration: 0.5,
            ease: 'power3.out',
            force3D: true,
            onUpdate: () => {
                const draggable = Draggable.get(track);
                if (draggable) draggable.update(true);
            },
            onComplete: () => {
                // Force complete update after animation ends
                const draggable = Draggable.get(track);
                if (draggable) {
                    draggable.update(true);
                }
                // Force re-render of the track
                track.style.transform = `translate3d(${targetX}px, 0px, 0px)`;
            }
        });
    };

    const handleBookNow = () => {
        if (!pathRef.current) return;
        if (showAppointment) {
            appointmentRef.current?.scrollIntoView({ behavior: 'smooth' });
            return;
        }
        const start = "M 0 100 V 50 Q 50 0 100 50 V 100 z";
        const end = "M 0 100 V 0 Q 50 0 100 0 V 100 z";
        const reset = "M 0 100 V 100 Q 50 100 100 100 V 100 z";
        const wrapper = document.querySelector('.transition-wrapper') as HTMLElement;
        if (wrapper) wrapper.style.pointerEvents = 'auto';
        const tl = gsap.timeline();
        tl.to(pathRef.current, { attr: { d: start }, duration: 0.6, ease: "power2.in" })
            .to(pathRef.current, {
                attr: { d: end }, duration: 0.6, ease: "power2.out", onComplete: () => {
                    setShowAppointment(true);
                    setTimeout(() => {
                        appointmentRef.current?.scrollIntoView({ behavior: 'auto' });
                        gsap.to(pathRef.current, { attr: { d: reset }, duration: 0.8, ease: "power2.inOut", delay: 0.2, onComplete: () => { if (wrapper) wrapper.style.pointerEvents = 'none'; } });
                    }, 100);
                }
            });
    };

    // Reset all form fields to initial state
    const resetFormFields = () => {
        setSubjectName("");
        setEmailLink("");
        setComsLink("");
        setSelectedServiceIds([]);
        setSelectedDate(null);
        setCustomDateText("");
        setErrors({});
    };

    const confirmBooking = async () => {
        const newErrors: { [key: string]: string } = {};

        if (!subjectName.trim()) newErrors.subjectName = "FILL THIS FIRST";
        if (!emailLink.trim()) {
            newErrors.emailLink = "FILL THIS FIRST";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLink)) {
            newErrors.emailLink = "INVALID EMAIL FORMAT";
        }
        if (!comsLink.trim()) newErrors.comsLink = "FILL THIS FIRST";
        // Check displayDate which contains the final date value (from calendar or manual input)
        if (!displayDate.trim()) newErrors.date = "SELECT DATE";
        if (selectedServiceIds.length === 0) newErrors.services = "SELECT PROTOCOL";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setVibrateKey(prev => prev + 1); // Trigger vibration animation
            return;
        }

        setErrors({});

        // Get selected service titles
        const selectedServiceTitles = services
            .filter(s => selectedServiceIds.includes(s.id))
            .map(s => s.title);

        // Get ALL unique categories from selected services (comma-separated)
        const selectedCategories = services
            .filter(s => selectedServiceIds.includes(s.id))
            .map(s => s.category)
            .filter((cat): cat is string => cat !== undefined && cat !== null);
        const uniqueCategories = [...new Set(selectedCategories)];
        const category = uniqueCategories.join(', ');

        // Prepare booking data - using custom_date column only (no date column in DB)
        const booking = {
            name: subjectName.trim(),
            email: emailLink.trim(),
            category: category, // Now shows all categories comma-separated
            services: selectedServiceTitles, // Shows all selected service titles
            price: calculateTotalPrice(),
            phone_num: comsLink.trim(),
            custom_date: displayDate.trim() || null, // Using custom_date column for date
            status: 'pending'
        };

        // Save to Supabase
        const { data, error } = await createAppointmentBooking(booking);

        if (error) {
            console.error('Failed to save appointment:', error);
            setBookingError('Failed to save appointment: ' + error.message);
            return;
        }

        console.log('Appointment saved:', data);
        setBookingError(null);
        setIsConfirmed(true);
        setTimeout(() => {
            ticketRef.current?.scrollIntoView({ behavior: 'auto' });
        }, 100);
    };

    const downloadTicket = async () => {
        if (ticketRef.current) {
            const canvas = await html2canvas(ticketRef.current, {
                backgroundColor: '#010101',
                scale: 2,
            });
            const link = document.createElement('a');
            link.download = `appointment.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        }
    };

    const selectedServices = services.filter(s => selectedServiceIds.includes(s.id));

    const calculateTotalPrice = () => {
        let total = 0;
        selectedServices.forEach(s => {
            const priceStr = String(s.price).replace('$', '').replace(',', '');
            const priceNum = parseFloat(priceStr);
            if (!isNaN(priceNum)) {
                total += priceNum;
            }
        });
        return total.toFixed(2);
    };

    const toggleService = (id: string) => {
        setSelectedServiceIds(prev =>
            prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
        );
    };

    const displayDate = selectedDate
        ? `${String(selectedDate.getDate()).padStart(2, '0')}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${selectedDate.getFullYear()}`
        : (customDateText || "");

    return (
        <div ref={containerRef} className="relative w-full bg-[#010101] overflow-x-hidden">
            <AnimatePresence mode="wait">
                {appState === AppState.INTRO && <IntroScribble key="intro" onComplete={() => setAppState(AppState.READY)} />}
                {appState === AppState.READY && (
                    <motion.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative w-full">
                        <div className="transition-wrapper"><svg className="transition-svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMin slice"><defs><linearGradient id="grad" x1="0" y1="0" x2="99" y2="99" gradientUnits="userSpaceOnUse"><stop offset="0.1" stopColor="rgba(224, 169, 197, 0.9)" /><stop offset="0.9" stopColor="rgba(255, 255, 255, 0.4)" /></linearGradient></defs><path ref={pathRef} className="path" stroke="url(#grad)" fill="url(#grad)" strokeWidth="2px" vectorEffect="non-scaling-stroke" d="M 0 100 V 100 Q 50 100 100 100 V 100 z" /></svg></div>

                        <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-[200] flex flex-row gap-2 md:gap-3 items-center">
                            <motion.a
                                href={`https://wa.me/${siteContent?.footer?.whatsapp || '880123456789'}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="bg-[#25D366] text-white p-3 md:p-4 rounded-full flex items-center justify-center group whatsapp-glow"
                                title="Chat with us on WhatsApp"
                            >
                                <svg className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 fill-current" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                            </motion.a>

                            <motion.button
                                onClick={handleBookNow}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="relative px-4 py-2 md:px-8 md:py-4 rounded-full font-impact text-xs md:text-sm uppercase tracking-wider flex items-center justify-center gap-2 overflow-hidden border border-[#E0A9C5]/50 premium-btn-glow"
                                style={{
                                    background: '#db72a8',
                                    color: 'white',
                                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                                }}
                            >
                                {selectedServiceIds.length > 0
                                    ? `BOOK ${selectedServiceIds.length} ${selectedServiceIds.length === 1 ? 'SESSION' : 'SESSIONS'}`
                                    : (bookNowSettings?.book_button_text || 'BOOK NOW')}
                            </motion.button>
                        </div>

                        <Navigation onMenuStateChange={(isOpen) => setIsMenuOpen(isOpen)} />

                        <section id="hero" className="relative h-screen w-full flex items-center justify-center bg-black overflow-hidden">
                            <div ref={heroBgRef} className="absolute inset-0 z-0 opacity-100">
                                <HeroSbg />
                            </div>
                            <div className="absolute inset-0 z-10 pointer-events-none p-4 sm:p-8 md:p-12">
                                <div className="w-full h-full border border-zinc-800 border-dashed relative">
                                    <div className="absolute top-0 right-0 w-[1px] h-full border-r border-zinc-800 border-dashed translate-x-4 sm:translate-x-8 md:translate-x-12" />
                                    <div className="absolute bottom-0 left-0 w-full h-[1px] border-b border-zinc-800 border-dashed translate-y-4 sm:translate-y-8 md:translate-y-12" />
                                </div>
                            </div>
                            <div ref={heroContentRef} className="absolute inset-0 z-20 flex items-center justify-start pointer-events-none p-6 sm:p-12 md:p-24">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 2, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] as const }}
                                    className="mb-[-4vh] md:mb-[-8vh]">
                                    <div className="flex flex-col items-start px-2 sm:px-0">
                                        <div className="flex items-center gap-4 mb-4">
                                            <span className="font-mono text-[clamp(12px,1.5vw,14px)] premium-glow-text tracking-[0.6em] uppercase font-black">{siteContent?.header?.status_label || 'SYSTEM.P41'}</span>
                                            <div className="h-[1px] w-24 sm:w-32 bg-zinc-800" />
                                        </div>
                                        <div className="relative mb-6 pl-4 md:pl-0">
                                            <div className="absolute -left-6 md:-left-12 top-0 h-full w-[1px] bg-[#FFC1E3]/40 hidden sm:block shadow-[0_0_15px_rgba(255,193,227,0.5)]" />
                                            <div className="max-w-full">
                                                <DynamicMainHeading text={siteContent?.header?.main_heading || (SITE_CONTENT as any).header?.main_heading || ''} className="tracking-wide" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8 mt-4">
                                            <div className="max-w-[280px] sm:max-w-xs"><p className="font-mono text-[clamp(12px,1.3vw,14px)] premium-glow-text-white tracking-[0.3em] uppercase leading-relaxed text-shadow-sm">{siteContent?.header?.subtitle || (SITE_CONTENT as any).header?.subtitle || ''}</p></div>
                                            <div className="flex flex-col font-mono text-[clamp(10px,1vw,12px)] premium-glow-text tracking-[0.4em] uppercase border-l border-[#FFC1E3]/30 pl-6 py-1"><span>{siteContent?.header?.status_label || 'IDENTITY REFINEMENT'}</span><span className="premium-glow-text-white opacity-60">{siteContent?.header?.status_value || 'STATUS: OPERATIONAL'}</span></div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </section>

                        <section id="studio-work" ref={portfolioRef} className="relative min-h-[100vh] md:h-[100vh] w-full bg-black overflow-x-auto overflow-y-auto md:overflow-y-hidden flex items-center z-50 mt-20 md:mt-32 lg:mt-48">
                            {/* Horizontal Scroll Container - Premium GSAP Animation */}
                            <div ref={sliderRef} className="studio-scroll-container w-full h-auto md:h-full overflow-x-auto overflow-y-auto md:overflow-y-hidden relative z-10">
                                <div ref={sliderTrackRef} className="studio-scroll-track relative flex h-full items-center gap-4 sm:gap-8 md:gap-10 lg:gap-12 xl:gap-16 2xl:gap-20 pl-16 sm:pl-20 md:pl-28 lg:pl-32 xl:pl-36 2xl:pl-40 pr-8 will-change-transform scrollbar-hide ml-2 sm:ml-4 md:ml-6" style={{ zIndex: 1, touchAction: 'pan-x pan-y' }}>
                                    {gallery.map((item, index) => (
                                        <motion.div
                                            key={item.id}
                                            className="gallery-item studio-project-card group relative w-[280px] h-[350px] sm:w-[350px] sm:h-[450px] md:w-[450px] md:h-[600px] lg:w-[500px] lg:h-[650px] xl:w-[550px] xl:h-[700px] 2xl:w-[600px] 2xl:h-[750px] shrink-0 overflow-hidden border transition-colors duration-700 bg-zinc-900 scroll-snap-start studio-glow-pulse"
                                            data-index={index}
                                            style={{ animationDelay: `${index * 1.5}s` }}
                                        >
                                            <div className="absolute inset-0 overflow-hidden">
                                                <img
                                                    src={item.image_url}
                                                    alt={item.title}
                                                    className="h-full w-full object-contain grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
                                                    draggable={false}
                                                    loading="lazy"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
                                            </div>
                                            <div className="absolute bottom-8 left-8 right-8 z-20 pointer-events-none">
                                                <h3 className="text-4xl md:text-5xl font-impact text-white uppercase tracking-tighter leading-none mb-2">{item.title}</h3>
                                                <div className="w-0 h-[2px] bg-[#E0A9C5] transition-all duration-500 group-hover:w-full" />
                                            </div>
                                            <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/10 group-hover:border-[#E0A9C5] transition-colors" />
                                            <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-white/10 group-hover:border-[#E0A9C5] transition-colors" />
                                        </motion.div>
                                    ))}
                                </div>

                                {/* See All Button - Opens Gallery Modal */}
                                <button
                                    onClick={() => { setGalleryModalIndex(0); setIsGalleryModalOpen(true); }}
                                    className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[60] px-6 py-3 border border-[#E0A9C5] bg-[#E0A9C5]/10 hover:bg-[#E0A9C5]/20 text-[#E0A9C5] font-impact text-sm tracking-[0.2em] uppercase transition-all duration-300 cursor-pointer backdrop-blur-sm"
                                >
                                    See All Works
                                </button>
                            </div>

                            {/* Overlays - Sidebar and accents moved after slider container for natural stacking */}
                            <div className="absolute left-0 top-0 h-full w-16 sm:w-24 md:w-32 lg:w-36 xl:w-40 2xl:w-44 border-r border-zinc-800 border-dashed flex flex-col items-center justify-between py-8 z-[70] bg-black">
                                <div className="flex-1 flex flex-col justify-center gap-1 sm:gap-2 font-impact text-[40px] sm:text-[50px] md:text-[65px] lg:text-[75px] xl:text-[85px] 2xl:text-[95px] uppercase tracking-tighter leading-none select-none text-center">
                                    <span className="text-white relative z-[55]">S</span><span className="text-white relative z-[55]">T</span><span className="text-white relative z-[55]">U</span><span className="text-white relative z-[55]">D</span><span className="text-white relative z-[55]">I</span><span className="text-white relative z-[55]">O</span>
                                    <div className="h-4 sm:h-6 md:h-8" />
                                    <span className="text-[#E0A9C5] relative z-[55]">W</span><span className="text-[#E0A9C5] relative z-[55]">O</span><span className="text-[#E0A9C5] relative z-[55]">R</span><span className="text-[#E0A9C5] relative z-[55]">K</span>
                                </div>
                                <div className="mt-4 w-[1px] h-12 sm:h-16 md:h-24 bg-zinc-800 relative shrink-0 z-[55]"><div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 sm:w-2 h-1.5 sm:h-2 border-r border-b border-zinc-800 rotate-45" /></div>
                            </div>

                            <div className="absolute bottom-16 sm:bottom-24 left-16 sm:left-24 right-0 h-[1px] border-b border-zinc-800 border-dashed z-[30]" />

                            {/* Progress Indicator */}
                            <div className="absolute bottom-6 sm:bottom-8 right-8 sm:right-12 z-[55] flex items-center gap-2 sm:gap-3">
                                <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-[#E0A9C5] animate-pulse" />
                            </div>
                        </section>

                        <section id="about" className="relative z-30 w-full bg-black">
                            <div className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 md:px-8 overflow-visible flex items-center min-h-[600px] sm:min-h-[800px] md:min-h-[1000px] lg:min-h-[1200px] pt-32 sm:pt-48 md:pt-64 pb-80 sm:pb-96 md:pb-[400px] lg:pb-[500px]">
                                <TornEdge color="rgba(0,0,0,0.8)" />

                                <div
                                    ref={aboutTextRef}
                                    className="text-left pointer-events-auto flex-1 min-w-0 pr-[45%] sm:pr-[42%] md:pr-[40%] lg:pr-[38%] xl:pr-[32%] lg:pl-2 xl:pl-0 xl:-ml-16 2xl:-ml-28 translate-x-4 sm:translate-x-8 md:translate-x-0 translate-y-48 sm:translate-y-52 md:translate-y-56 lg:translate-y-80 max-w-full overflow-hidden"
                                >
                                    <h2 className="font-impact text-[clamp(1.75rem,7.5vw,4.5rem)] md:text-[clamp(3rem,11vw,9rem)] text-white leading-[0.85] md:leading-none uppercase mb-6 md:mb-8 break-words">CRAFTED <span className="block text-[#E0A9C5]">IN CHAOS</span></h2>
                                    <p className="text-zinc-300 font-light text-[clamp(0.75rem,1.4vw,1.2rem)] leading-relaxed max-w-[180px] sm:max-w-[300px] md:max-w-[450px]">
                                        {siteContent?.about?.description || "We don't just cut hair; we engineer identities. The Parlour is a sanctuary for those who seek to bridge the gap between their vision and reality."}
                                    </p>
                                </div>

                                <motion.div
                                    ref={aboutCardRef}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
                                    viewport={{ once: false, amount: 0.2 }}
                                    className="pointer-events-auto absolute right-2 sm:right-6 md:right-10 lg:right-16 top-1/2 -translate-y-1/2 z-[50] flex items-center"
                                >
                                    <div className="absolute inset-0 bg-white/30 blur-[150px] rounded-full scale-[1.8] pointer-events-none" />
                                    <TiltedCard
                                        imageSrc={siteContent?.about?.image || ""}
                                        altText={siteContent?.about?.imageText1 || ''}
                                        containerHeight="auto"
                                        containerWidth="auto"
                                        imageHeight="clamp(180px, 40vw, 620px)"
                                        imageWidth="clamp(140px, 38vw, 550px)"
                                        rotateAmplitude={10}
                                        scaleOnHover={1.08}
                                        showMobileWarning={false}
                                        showTooltip={false}
                                        displayOverlayContent={!!(siteContent?.about?.imageText1)}
                                        overlayContent={
                                            siteContent?.about?.imageText1 ? (
                                                <p className="font-impact text-sm md:text-xl lg:text-2xl text-white uppercase tracking-wider text-center px-4">
                                                    {siteContent.about.imageText1}
                                                </p>
                                            ) : undefined
                                        }
                                    />
                                </motion.div>
                            </div>
                        </section>

                        <section id="catalog" className="relative py-16 md:py-24 mt-20 md:mt-32 lg:mt-48 bg-black border-t border-b border-zinc-900 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-black to-[#050505] pointer-events-none" />
                            <div ref={catalogHeaderRef} className="max-w-7xl lg:mx-0 mx-auto px-6 sm:px-8 lg:pl-32 relative z-10">
                                <div className="flex flex-col items-start mb-8 md:mb-12 gap-6">
                                    <div>
                                        <div className="font-mono text-[clamp(8px,1vw,10px)] text-[#E0A9C5] tracking-[0.4em] md:tracking-[0.5em] mb-2 uppercase">{siteContent?.catalog?.catalog_label || '[ ARCHIVE // SERVICES ]'}</div>
                                        <h2 className="font-impact text-[clamp(3rem,10vw,8rem)] text-white leading-none uppercase whitespace-nowrap">{siteContent?.catalog?.heading || 'THE CATALOG'}</h2>
                                    </div>
                                    <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4 border-b border-zinc-900 pb-2 w-full">
                                        {['ALL', ...Array.from(new Set(services.map(s => s.category)))].map((cat, index, array) => (
                                            <React.Fragment key={cat}>
                                                <button onClick={() => setActiveCatalogCategory(cat)} className={`font-impact text-[clamp(12px,2vw,20px)] tracking-[0.2em] uppercase py-1.5 px-1 transition-all duration-300 ${activeCatalogCategory === cat ? 'text-white border-b-2 border-[#E0A9C5]' : 'text-zinc-500 hover:text-white'}`}>
                                                    {cat}
                                                </button>
                                                {index < array.length - 1 && <span className="text-[#E0A9C5] self-center opacity-30 select-none hidden sm:inline">|</span>}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                    <div className="max-w-xs">
                                        <p className="font-mono text-[10px] md:text-[12px] text-zinc-500 uppercase tracking-widest leading-relaxed">{siteContent?.catalog?.description || 'A curated selection of aesthetic protocols designed for identity calibration.'}</p>
                                    </div>
                                </div>

                                {/* Multi-select Encouragement Text - Shows when services are selected */}
                                <AnimatePresence>
                                    {selectedServiceIds.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                            className="mb-6 md:mb-8 relative"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-[#E0A9C5]/20 via-[#E0A9C5]/5 to-transparent rounded-lg blur-sm" />
                                            <div className="relative bg-black/80 border border-[#E0A9C5]/50 rounded-lg p-4 md:p-5 flex flex-col sm:flex-row items-center gap-3 md:gap-4 justify-center">
                                                <div className="flex items-center gap-2">
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E0A9C5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse">
                                                        <polyline points="20 6 9 17 4 12" />
                                                    </svg>
                                                    <span className="font-mono text-[10px] md:text-[11px] text-[#E0A9C5] uppercase tracking-wider">NICE CHOICE!</span>
                                                </div>
                                                <div className="h-4 w-[1px] bg-[#E0A9C5]/30 hidden sm:block" />
                                                <span className="font-impact text-sm md:text-base text-white uppercase tracking-wide text-center">
                                                    {selectedServiceIds.length === 1
                                                        ? "Add more services to complete your experience"
                                                        : `You're building an epic combo! ${selectedServiceIds.length} services selected`}
                                                </span>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {services.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-16 md:py-24 gap-4 opacity-40">
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#E0A9C5" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                            <polyline points="14 2 14 8 20 8" />
                                            <line x1="16" y1="13" x2="8" y2="13" />
                                            <line x1="16" y1="17" x2="8" y2="17" />
                                            <polyline points="10 9 9 9 8 9" />
                                        </svg>
                                        <span className="font-mono text-[10px] text-[#E0A9C5] uppercase tracking-[0.3em]">Services Loading...</span>
                                    </div>
                                )}
                                <div className="flex flex-col gap-8 md:gap-12">
                                    {Object.entries(services.filter(s => activeCatalogCategory === 'ALL' || s.category === activeCatalogCategory).reduce<Record<string, typeof services>>((acc, service) => { const cat = service.category || 'OTHER'; if (!acc[cat]) acc[cat] = []; acc[cat].push(service); return acc; }, {})).map(([category, categoryServices]) => (
                                        <div key={category} className="category-group">
                                            <div className="mb-4 md:mb-6">
                                                <div className="flex items-baseline gap-3 md:gap-4">
                                                    <h3 className="font-impact text-[clamp(2rem,6vw,4rem)] text-[#E0A9C5] uppercase leading-none tracking-tight">{category}</h3>
                                                    <div className="flex items-center gap-2 md:gap-3">
                                                        <div className="h-[1px] w-8 md:w-12 bg-[#E0A9C5]" />
                                                        <span className="font-mono text-[clamp(8px,1.5vw,12px)] text-white/60 uppercase tracking-widest">{categoryServices.length} ITEMS</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                                                {categoryServices.map((service) => {
                                                    const isSelected = selectedServiceIds.includes(service.id);
                                                    return (
                                                        <motion.div key={service.id} layout onClick={() => toggleService(service.id)}
                                                            className={`catalog-item group relative bg-[#050505] border ${isSelected ? 'border-[#E0A9C5] bg-zinc-900 shadow-[0_0_20px_rgba(224,169,197,0.4)] z-10' : 'border-zinc-800 hover:border-[#E0A9C5]/50 hover:shadow-[0_0_15px_rgba(255,193,227,0.25)] hover:z-10'} transition-all duration-300 p-2 md:p-3 cursor-pointer flex flex-row items-center justify-between gap-2 h-[60px] md:h-[70px]`}>
                                                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                                <h4 className={`font-impact text-lg md:text-xl uppercase truncate transition-colors ${isSelected ? 'text-[#E0A9C5]' : 'text-white group-hover:text-[#E0A9C5]'}`}>{service.title}</h4>
                                                            </div>
                                                            <div className="w-[1px] h-8 md:h-10 bg-zinc-700 mx-1" />
                                                            <div className="flex flex-col items-end justify-center min-w-[50px] gap-1">
                                                                {service.duration && <div className="flex items-center gap-1"><span className="text-[#E0A9C5] text-[8px]">●</span><span className={`font-mono text-[12px] md:text-[14px] uppercase tracking-wider ${isSelected ? 'text-[#E0A9C5]' : 'text-white group-hover:text-[#E0A9C5]'}`}>{service.duration}</span></div>}
                                                                <span className="font-impact text-sm md:text-lg text-white whitespace-nowrap">{service.price}</span>
                                                            </div>
                                                            {isSelected && <div className="absolute top-1 right-1 w-3 h-3 md:w-4 md:h-4 bg-[#E0A9C5] flex items-center justify-center"><svg width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg></div>}
                                                            <div className={`absolute inset-0 border-2 ${isSelected ? 'border-[#E0A9C5]' : 'border-transparent group-hover:border-[#E0A9C5]/30'} pointer-events-none transition-colors`} />
                                                        </motion.div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <AnimatePresence>
                                    {selectedServiceIds.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 50 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 50 }}
                                            className="mt-8 md:mt-12 flex flex-col items-center gap-4 md:gap-6 border-t border-zinc-900 pt-8 md:pt-12"
                                        >
                                            <div className="w-full flex flex-col items-center pt-6 border-t-4 border-white">
                                                <span className="font-mono text-[7px] md:text-[8px] text-white uppercase tracking-[0.3em] md:tracking-[0.4em] mb-2 md:mb-4">ESTIMATED TOTAL INVESTMENT</span>
                                                <div className="font-impact text-3xl sm:text-4xl md:text-6xl text-[#E0A9C5]">
                                                    ${calculateTotalPrice()}
                                                </div>
                                            </div>
                                            <button
                                                onClick={handleBookNow}
                                                className="group relative px-6 py-3 md:px-10 md:py-6 bg-[#db72a8] text-white font-impact text-xl md:text-2xl uppercase tracking-tighter overflow-hidden transition-all duration-500 hover:bg-white hover:text-black w-full sm:w-auto premium-btn-glow"
                                            >
                                                <span className="relative z-10 flex items-center justify-center gap-3 md:gap-4">
                                                    BOOK {selectedServiceIds.length} {selectedServiceIds.length === 1 ? 'SESSION' : 'SESSIONS'}
                                                    <div className="w-6 md:w-8 h-[2px] bg-white group-hover:bg-black" />
                                                </span>
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </section>

                        <section id="footer" ref={footerRef} className="relative z-20 bg-[#E0A9C5] py-16 md:py-20 flex flex-col items-center justify-center text-black overflow-visible">
                            <TornEdge color="#E0A9C5" position="top" />
                            <div className="text-center px-6">
                                <h2 className="text-[clamp(4rem,15vw,12rem)] font-impact leading-[0.85] tracking-tighter mb-4 uppercase">{bookNowSettings?.reserve_heading || 'RESERVE'} <br />{bookNowSettings?.reserve_heading ? '' : 'NOW'}</h2>
                                <p className="max-w-xl mx-auto font-mono text-[clamp(10px,1.2vw,12px)] uppercase tracking-[0.3em] md:tracking-[0.4em] mb-8 md:mb-10 px-4">{bookNowSettings?.reserve_description || 'AVAILABILITY IS LIMITED. EXPERIENCE IS MANDATORY.'}</p>
                                <motion.button onClick={handleBookNow} whileHover={{ scale: 1.05, backgroundColor: "black", color: "#db72a8" }} whileTap={{ scale: 0.95 }} className="px-8 py-3 md:px-10 md:py-3 border-2 border-black font-impact text-lg md:text-xl uppercase tracking-widest transition-colors duration-300">
                                    {selectedServiceIds.length > 0
                                        ? `Book ${selectedServiceIds.length} ${selectedServiceIds.length === 1 ? 'Session' : 'SESSIONS'}`
                                        : (bookNowSettings?.book_button_text || 'Book Appointment')}
                                </motion.button>
                            </div>
                            <div className="w-full h-[1px] md:h-[2px] bg-[#E0A9C5]" />
                        </section>

                        <AnimatePresence>
                            {showAppointment && !isConfirmed && (
                                <motion.section ref={appointmentRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative z-[30] bg-black text-white pt-24 md:pt-32 pb-24 md:pb-32 px-6 md:px-12 flex flex-col items-center overflow-visible">
                                    <div className="w-full max-w-7xl relative z-10">
                                        <div className="mb-12 md:mb-16 w-full flex flex-col md:flex-row items-center md:items-baseline justify-center gap-2">
                                            <span className="font-mono text-[clamp(10px,1.5vw,12px)] tracking-[0.2em] md:tracking-[0.3em] text-[#E0A9C5] font-bold uppercase whitespace-nowrap md:translate-y-[-0.2vw]">// BEGIN YOUR TRANSFORMATION</span>
                                            <h2 className="font-impact text-[clamp(3rem,10vw,8vw)] uppercase tracking-tighter leading-none text-center md:text-left">{bookNowSettings?.page_title || 'BOOK'} <span className="text-zinc-700">{bookNowSettings?.page_title ? '' : 'NOW'}</span> <span className="text-zinc-500 text-[0.5em] font-impact tracking-[0.1em] ml-4 uppercase transition-all duration-500">{bookNowSettings?.page_subtitle || 'CUSTOM'}</span></h2>
                                        </div>
                                        <div className="relative border-t border-zinc-800 pt-10 md:pt-12 pb-20 md:pb-24">
                                            <div className="absolute top-0 left-0 w-[95%] h-[2px] bg-[#E0A9C5]" />
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 md:gap-x-12 gap-y-12 md:gap-y-16">
                                                <div className="group border-b border-zinc-800 pb-2 relative transition-colors focus-within:border-[#E0A9C5]">
                                                    <label className="block font-mono text-[clamp(11px,1.2vw,12px)] text-zinc-500 uppercase mb-1">{bookNowSettings?.subject_label || 'Subject Name'}</label>
                                                    <input type="text" value={subjectName} onChange={(e) => { setSubjectName(e.target.value); if (errors.subjectName) setErrors(prev => ({ ...prev, subjectName: "" })); }} placeholder={bookNowSettings?.subject_placeholder || 'ENTER NAME_'} autoComplete="off" className="w-full bg-transparent font-impact text-[clamp(1.25rem,2.5vw,2rem)] outline-none placeholder-zinc-800 text-white [-webkit-autofill]:bg-transparent [-webkit-autofill]:text-white [&::selection]:bg-transparent [&::selection]:text-white" />
                                                    {errors.subjectName && <span key={`subject-${vibrateKey}`} className="absolute -bottom-5 left-0 font-mono text-sm text-red-500 font-bold animate-vibrate">{errors.subjectName}</span>}
                                                </div>
                                                <div className="group border-b border-zinc-800 pb-2 relative transition-colors focus-within:border-[#E0A9C5]">
                                                    <label className="block font-mono text-[clamp(11px,1.2vw,12px)] text-zinc-500 uppercase mb-1">{bookNowSettings?.email_label || 'Email Link'}</label>
                                                    <input type="email" value={emailLink} onChange={(e) => { setEmailLink(e.target.value); if (errors.emailLink) setErrors(prev => ({ ...prev, emailLink: "" })); }} placeholder={bookNowSettings?.email_placeholder || 'ENTER EMAIL_'} autoComplete="off" className="w-full bg-transparent font-impact text-[clamp(1.25rem,2.5vw,2rem)] outline-none placeholder-zinc-800 text-white [-webkit-autofill]:bg-transparent [-webkit-autofill]:text-white [&::selection]:bg-transparent [&::selection]:text-white" />
                                                    {errors.emailLink && <span key={`email-${vibrateKey}`} className="absolute -bottom-5 left-0 font-mono text-sm text-red-500 font-bold animate-vibrate">{errors.emailLink}</span>}
                                                </div>
                                                <div className="group border-b border-zinc-800 pb-2 relative focus-within:border-[#E0A9C5] transition-colors">
                                                    <label className="block font-mono text-[clamp(11px,1.2vw,12px)] text-[#E0A9C5] uppercase tracking-widest mb-1">{bookNowSettings?.coms_label || 'Coms. Link'}</label>
                                                    <input type="tel" value={comsLink} onChange={(e) => { const val = e.target.value.replace(/[^0-9+\s-]/g, ''); setComsLink(val); if (errors.comsLink) setErrors(prev => ({ ...prev, comsLink: "" })); }} placeholder={bookNowSettings?.coms_placeholder || '+1 (000) 000-0000'} autoComplete="off" className="w-full bg-transparent font-impact text-[clamp(1.25rem,2.5vw,2rem)] outline-none placeholder-zinc-800 text-white [-webkit-autofill]:bg-transparent [-webkit-autofill]:text-white [&::selection]:bg-transparent [&::selection]:text-white" />
                                                    {errors.comsLink && <span key={`coms-${vibrateKey}`} className="absolute -bottom-5 left-0 font-mono text-sm text-red-500 font-bold animate-vibrate">{errors.comsLink}</span>}
                                                </div>

                                                {/* 1. Date Section (Moved to First Position) */}
                                                <div className="group relative">
                                                    <label className="block font-mono text-[11px] md:text-[12px] text-[#E0A9C5] uppercase tracking-widest mb-1">{bookNowSettings?.date_label || 'Temporal Coordinate'}</label>
                                                    <div className="relative flex justify-between items-center border-b border-zinc-800 pb-1 focus-within:border-[#E0A9C5] transition-colors">
                                                        <div className="flex flex-col flex-1">
                                                            <DateInput
                                                                value={displayDate}
                                                                onChange={(val) => { setCustomDateText(val); setSelectedDate(null); if (errors.date) setErrors(prev => ({ ...prev, date: "" })); }}
                                                                placeholder={bookNowSettings?.date_placeholder}
                                                                error={errors.date}
                                                                triggerKey={vibrateKey}
                                                            />
                                                        </div>
                                                        <div className="cursor-pointer p-1 hover:text-[#E0A9C5] transition-colors" onClick={(e) => { e.stopPropagation(); setActivePanel(activePanel === 'calendar' ? null : 'calendar'); }}>
                                                            <CalendarIcon />
                                                        </div>
                                                        <AnimatePresence>
                                                            {activePanel === 'calendar' && (
                                                                <motion.div ref={calendarPanelRef} onClick={(e) => e.stopPropagation()} initial={{ opacity: 0, y: 0 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 0 }} className="absolute top-full left-0 mt-0 z-[100] w-[280px] sm:w-[320px] md:w-[350px] shadow-2xl">
                                                                    <Suspense fallback={<div className="p-4 bg-zinc-900 border border-zinc-800 text-white font-mono text-xs">LOADING CALENDAR...</div>}>
                                                                        <SimpleCalendar onSelect={(d) => { setSelectedDate(d); const formatted = `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`; setCustomDateText(formatted); setActivePanel(null); if (errors.date) setErrors(prev => ({ ...prev, date: "" })); }} selectedDate={selectedDate} />
                                                                    </Suspense>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                </div>

                                                {/* 2. Services Section (Moved to Second Position) */}
                                                <div className="group relative transition-colors hover:border-[#E0A9C5]">
                                                    <label className="block font-mono text-[11px] md:text-[12px] text-zinc-500 uppercase">{bookNowSettings?.services_label || 'Services'}</label>
                                                    <div className={`relative ${errors.services ? 'border-[#E0A9C5]' : 'border-zinc-800'} pb-2`}>
                                                        <div className="flex flex-col gap-2 mt-4 border-t border-zinc-800 pt-4">
                                                            {selectedServices.map(s => (
                                                                <div key={s.id} className="flex items-center justify-between bg-zinc-900 border border-zinc-800 px-3 py-2 md:px-4 md:py-2">
                                                                    <span className="font-impact text-lg md:text-xl uppercase text-white leading-none">{s.title}</span>
                                                                    <div className="flex items-center gap-3">
                                                                        <span className="font-mono text-sm md:text-base text-zinc-400 uppercase min-w-[60px] text-right">{s.price}</span>
                                                                        <span onClick={() => toggleService(s.id)} className="w-5 h-5 flex items-center justify-center border border-zinc-700 text-zinc-500 hover:border-[#E0A9C5] hover:text-[#E0A9C5] transition-colors cursor-pointer text-[10px]">✕</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            {selectedServices.length > 0 && (
                                                                <>
                                                                    <div className="border-t border-white/50 my-2"></div>
                                                                    <div className="flex items-center justify-between px-3 py-2">
                                                                        <span className="font-mono text-sm md:text-base text-white uppercase">{bookNowSettings?.estimated_label || 'ESTIMATED TOTAL INVESTMENT'}</span>
                                                                        <span className="font-mono text-sm md:text-base text-white uppercase">{calculateTotalPrice()}</span>
                                                                    </div>
                                                                </>
                                                            )}
                                                            <button onClick={(e) => { e.stopPropagation(); setActivePanel(activePanel === 'services' ? null : 'services'); }} className="w-full flex items-center justify-center gap-1 px-2 py-2 bg-[#E0A9C5] text-white hover:bg-[#8B6B8B] transition-colors mt-2 group">
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                                                </svg>
                                                                <span className="font-impact text-sm uppercase tracking-wide">ADD SERVICES</span>
                                                            </button>
                                                        </div>
                                                        {errors.services && <span key={`services-${vibrateKey}`} className="absolute -bottom-5 left-0 font-mono text-sm text-red-500 font-bold animate-vibrate">{errors.services}</span>}
                                                        <AnimatePresence>
                                                            {activePanel === 'services' && (
                                                                <motion.div ref={panelRef} onClick={(e) => e.stopPropagation()} initial={{ opacity: 0, y: 0 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 0 }} className="absolute top-full left-0 mt-4 z-[100] w-[90vw] md:w-[600px] shadow-2xl">
                                                                    <Suspense fallback={<div className="p-4 bg-zinc-900 border border-zinc-800 text-white font-mono text-xs">LOADING PROTOCOLS...</div>}>
                                                                        <ServicePanel
                                                                            services={services}
                                                                            onToggle={(id) => { toggleService(id); if (errors.services) setErrors(prev => ({ ...prev, services: "" })); }}
                                                                            selectedIds={selectedServiceIds}
                                                                            onClose={() => setActivePanel(null)}
                                                                        />
                                                                    </Suspense>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                </div>

                                                {/* 3. Map Section (Visible on Desktop) */}
                                                <div className="relative w-full aspect-square overflow-hidden border border-zinc-800 hidden md:block">
                                                    <label className="absolute top-2 left-2 z-10 font-mono text-[7px] md:text-[8px] text-zinc-500 uppercase tracking-widest">{bookNowSettings?.map_label || 'STRATEGIC COORDINATE'}</label>
                                                    <iframe src={siteContent?.footer?.map_embed || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.1422937950147!2d-73.98731968482413!3d40.75889497932681!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25855c6480299%3A0x55194ec5a1ae072e!2sTimes%20Square!5e0!3m2!1sen!2sus!4v1620000000000!5m2!1sen!2sus'} width="100%" height="100%" style={{ border: 0, filter: 'grayscale(100%) invert(90%) contrast(150%) brightness(0.8)' }} allowFullScreen={false} loading="lazy" title="Location Map"></iframe>
                                                    <div className="absolute bottom-0 right-0 p-1 md:p-2 font-mono text-[6px] md:text-[7px] text-[#E0A9C5] uppercase tracking-widest bg-black/90 border-t border-l border-zinc-800">COORDS: D-41 // HQ</div>
                                                </div>
                                            </div>
                                            <div className="mt-16 md:mt-24 flex flex-col items-center gap-4">
                                                <motion.button onClick={confirmBooking} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-[#db72a8] text-white px-10 md:px-16 py-4 md:py-6 flex items-center justify-center gap-4 md:gap-6 group w-full sm:w-auto">
                                                    <span className="font-impact text-2xl md:text-4xl uppercase tracking-tighter">{bookNowSettings?.submit_button || 'START SESSION'}</span>
                                                </motion.button>
                                                {/* Map Section (Visible on Mobile - After Button) */}
                                                <div className="relative w-full aspect-square overflow-hidden border border-zinc-800 block md:hidden mt-8">
                                                    <label className="absolute top-2 left-2 z-10 font-mono text-[7px] text-zinc-500 uppercase tracking-widest">{bookNowSettings?.map_label || 'STRATEGIC COORDINATE'}</label>
                                                    <iframe src={siteContent?.footer?.map_embed || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.1422937950147!2d-73.98731968482413!3d40.75889497932681!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25855c6480299%3A0x55194ec5a1ae072e!2sTimes%20Square!5e0!3m2!1sen!2sus!4v1620000000000!5m2!1sen!2sus'} width="100%" height="100%" style={{ border: 0, filter: 'grayscale(100%) invert(90%) contrast(150%) brightness(0.8)' }} allowFullScreen={false} loading="lazy" title="Location Map"></iframe>
                                                    <div className="absolute bottom-0 right-0 p-1 font-mono text-[6px] text-[#E0A9C5] uppercase tracking-widest bg-black/90 border-t border-l border-zinc-800">COORDS: D-41 // HQ</div>
                                                </div>
                                                {bookingError && (
                                                    <div className="font-mono text-[9px] md:text-[10px] text-[#E0A9C5] font-bold mt-4">
                                                        ⚠️ {bookingError}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.section>
                            )}

                            {isConfirmed && (
                                <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-[30] bg-black text-white px-3 md:px-12 flex flex-col items-center justify-center min-h-[70vh] md:min-h-[600px] max-w-[95%] md:max-w-[600px] mx-auto overflow-hidden">
                                    <div className="w-full max-w-[320px] sm:max-w-[400px] text-center mb-3 md:mb-8 flex-shrink-0">
                                        <h2 className="font-impact text-xl sm:text-3xl md:text-4xl uppercase tracking-tighter mb-2 md:mb-3">{bookNowSettings?.confirm_heading || 'PROTOCOL INITIATED'}</h2>
                                        <p className="font-impact text-[10px] sm:text-xs md:text-sm text-zinc-400 uppercase tracking-wider">{bookNowSettings?.confirm_description || 'YOUR ARCHIVE HAS BEEN SUCCESSFULLY CREATED. DOWNLOAD YOUR PASS BELOW.'}</p>
                                    </div>

                                    <div ref={ticketRef} className="relative w-full max-w-[300px] sm:max-w-[400px] aspect-[3/4] sm:aspect-auto bg-black border-2 border-[#E0A9C5] p-3 sm:p-6 md:p-8 overflow-hidden shadow-[0_0_30px_rgba(224,169,197,0.3)] rounded-sm overflow-y-auto">
                                        <div className="absolute top-0 right-0 w-12 h-12 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-[#E0A9C5]/5 -rotate-45 translate-x-6 -translate-y-6 sm:translate-x-10 sm:-translate-y-10 md:translate-x-12 md:-translate-y-12 border-b-2 border-l-2 border-[#E0A9C5]" />
                                        <div className="absolute bottom-0 left-0 w-12 h-12 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-[#E0A9C5]/5 -rotate-45 -translate-x-6 translate-y-6 sm:-translate-x-10 sm:translate-y-10 md:-translate-x-12 md:translate-y-12 border-t-2 border-r-2 border-[#E0A9C5]" />

                                        <div className="border-b border-zinc-800 pb-3 sm:pb-4 md:pb-6 mb-3 sm:mb-4 md:mb-6 flex justify-between items-start">
                                            <div className="text-left">
                                                <h3 className="font-impact text-lg sm:text-xl md:text-2xl uppercase leading-none mb-0.5 sm:mb-1">ESTILO BEAUTY SALON</h3>
                                                <span className="font-mono text-[5px] sm:text-[6px] md:text-[7px] text-zinc-500 tracking-[0.15em] md:tracking-[0.2em]"></span>
                                            </div>
                                            <div className="bg-[#E0A9C5] px-1.5 py-0.5 sm:px-2 sm:py-1 font-mono text-[5px] sm:text-[6px] md:text-[7px] text-black font-black uppercase">{bookNowSettings?.confirmed_badge || 'CONFIRMED'}</div>
                                        </div>

                                        <div className="space-y-1 sm:space-y-2 md:space-y-3 text-left">
                                            <div>
                                                <label className="block font-mono text-[7px] sm:text-[8px] md:text-[9px] text-[#E0A9C5] uppercase tracking-widest mb-1">{bookNowSettings?.confirm_subject_label || 'Name'}</label>
                                                <p className="font-impact text-xs sm:text-sm md:text-base text-white">{subjectName}</p>
                                            </div>
                                            <div>
                                                <label className="block font-mono text-[7px] sm:text-[8px] md:text-[9px] text-[#E0A9C5] uppercase tracking-widest mb-1">Email</label>
                                                <p className="font-impact text-xs sm:text-sm md:text-base text-white">{emailLink}</p>
                                            </div>
                                            <div>
                                                <label className="block font-mono text-[7px] sm:text-[8px] md:text-[9px] text-[#E0A9C5] uppercase tracking-widest mb-1">Phone</label>
                                                <p className="font-impact text-xs sm:text-sm md:text-base text-white">{comsLink}</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                                <div>
                                                    <label className="block font-mono text-[7px] sm:text-[8px] md:text-[9px] text-[#E0A9C5] uppercase tracking-widest mb-1">{bookNowSettings?.confirm_coordinate_label || 'Coordinate'}</label>
                                                    <p className="font-impact text-xs sm:text-sm md:text-base text-white">{displayDate}</p>
                                                </div>
                                                <div>
                                                    <label className="block font-mono text-[7px] sm:text-[8px] md:text-[9px] text-[#E0A9C5] uppercase tracking-widest mb-1">{bookNowSettings?.confirm_investment_label || 'Investment'}</label>
                                                    <p className="font-impact text-xs sm:text-sm md:text-base text-white">${calculateTotalPrice()}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block font-mono text-[7px] sm:text-[8px] md:text-[9px] text-[#E0A9C5] uppercase tracking-widest mb-1">{bookNowSettings?.confirm_protocol_label || 'Protocol Sequence'}</label>
                                                <div className="space-y-0.5">
                                                    {selectedServices.map(s => (
                                                        <p key={s.id} className="font-impact text-[10px] sm:text-xs md:text-sm text-white leading-none">{s.title}</p>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="pt-3 sm:pt-4 border-t border-zinc-900 flex justify-between items-end">
                                                <div className="space-y-0.5">
                                                    <span className="block font-mono text-[4px] sm:text-[5px] md:text-[5px] text-zinc-600 uppercase"> {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                                                    <span className="block font-mono text-[4px] sm:text-[5px] md:text-[5px] text-zinc-600 uppercase"></span>
                                                </div>
                                                <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 border border-[#E0A9C5] opacity-30 flex items-center justify-center">
                                                    <div className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 border-t-2 border-l-2 border-[#E0A9C5]" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-4 sm:pt-6 md:pt-8 flex gap-2 sm:gap-3 md:gap-4 w-full sm:w-auto">
                                        <motion.button onClick={() => {
                                            // Close confirmation without reloading - just go back to form
                                            setIsConfirmed(false);
                                            resetFormFields();
                                        }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1 border border-zinc-800 px-3 py-3 sm:px-6 sm:py-3 md:px-8 md:py-4 font-impact text-xs sm:text-base md:text-lg uppercase tracking-tighter">{bookNowSettings?.cancel_button || 'CANCEL'}</motion.button>
                                        <motion.button onClick={() => {
                                            // Download ticket then close without reload
                                            downloadTicket();
                                            setTimeout(() => {
                                                setIsConfirmed(false);
                                                resetFormFields();
                                            }, 100);
                                        }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1 bg-white text-black px-3 py-3 sm:px-6 sm:py-3 md:px-8 md:py-4 font-impact text-xs sm:text-base md:text-lg uppercase tracking-tighter">{bookNowSettings?.download_button || 'DOWNLOAD'}</motion.button>
                                    </div>
                                </motion.section>
                            )}
                        </AnimatePresence>

                        <section id="archive-details" className="relative z-20 bg-[#050505] py-8 md:py-32 px-4 sm:px-8 md:px-12 border-t border-zinc-900 overflow-hidden">
                            <div className="max-w-7xl mx-auto">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 xl:gap-20 items-start">
                                    <div ref={archiveProfileRef} className="lg:col-span-4 text-left min-w-0">
                                        <div className="font-mono text-[10px] md:text-[12px] text-[#E0A9C5] tracking-[0.4em] md:tracking-[0.5em] mb-4 md:mb-6 uppercase"> {siteContent?.profile?.label || '[ PERSONNEL RECORD // ARCH-01 ]'} </div>
                                        <h3 className="font-impact text-4xl sm:text-6xl md:text-7xl text-white uppercase leading-[0.85] mb-3 md:mb-8"> {siteContent?.profile?.name || ''} <br /> {siteContent?.profile?.name ? '' : ''} </h3>
                                        <div className="space-y-4">
                                            <p className="font-mono text-[11px] md:text-[13px] text-zinc-400 uppercase leading-relaxed tracking-wider border-l border-[#E0A9C5] pl-4">{siteContent?.profile?.title || 'CHIEF AESTHETIC ARCHITECT. <br />15 YEARS OF IDENTITY CALIBRATION. <br />DISTRICT 41 REPRESENTATIVE.'}</p>
                                            <p className="font-mono text-[11px] md:text-[13px] text-zinc-400 uppercase italic">{siteContent?.profile?.quote || '"EVERY LINE IS A CALIBRATION, EVERY SHADE A CHOICE. WE DISCARD THE CONVENTIONAL TO ENGINEER THE EXCEPTIONAL."'}</p>
                                        </div>
                                    </div>
                                    <div ref={archiveStatsRef} className="lg:col-span-8 flex flex-col justify-center min-w-0 overflow-hidden lg:min-h-[400px] lg:pl-16 xl:pl-24">
                                        <div className="font-mono text-[10px] md:text-[12px] text-zinc-500 tracking-[0.4em] md:tracking-[0.5em] mb-5 md:mb-8 uppercase lg:pl-6"> {siteContent?.profile?.mission_label || '// THE MISSION ARCHITECTURE'} </div>
                                        <h2 className="text-white font-impact text-[clamp(1.2rem,3.5vw,4rem)] uppercase tracking-tighter leading-tight mb-7 md:mb-12 break-words lg:pl-6 lg:pl-6">{siteContent?.profile?.mission_heading || "WE DON'T PROVIDE SERVICE. WE EXECUTE PROTOCOL. THE PARLOUR IS A CALIBRATION HUB FOR THE AVANT-GARDE."}</h2>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-12 pt-5 md:pt-16 border-t border-zinc-900">
                                            <div className="flex flex-col"><span className="font-mono text-[10px] md:text-[12px] text-zinc-400 uppercase mb-1 md:mb-2 tracking-widest">{siteContent?.profile?.established_label || 'ESTABLISHED'}</span><span className="font-impact text-2xl md:text-3xl text-white"><CountUpText value={siteContent?.profile?.established_value || '2009'} /></span><div className="w-6 md:w-8 h-[1px] bg-[#E0A9C5] mt-2" /></div>
                                            <div className="flex flex-col"><span className="font-mono text-[10px] md:text-[12px] text-zinc-400 uppercase mb-1 md:mb-2 tracking-widest">{siteContent?.profile?.staff_label || 'STAFF COUNT'}</span><span className="font-impact text-2xl md:text-3xl text-white"><CountUpText value={siteContent?.profile?.staff_value || '14'} /></span><div className="w-6 md:w-8 h-[1px] bg-zinc-800 mt-2" /></div>
                                            <div className="flex flex-col"><span className="font-mono text-[10px] md:text-[12px] text-zinc-400 uppercase mb-1 md:mb-2 tracking-widest">{siteContent?.profile?.success_label || 'SUCCESS RATE'}</span><span className="font-impact text-2xl md:text-3xl text-white"><CountUpText value={siteContent?.profile?.success_value || '96%'} /></span><div className="w-6 md:w-8 h-[1px] bg-[#E0A9C5] mt-2" /></div>
                                            <div className="flex flex-col"><span className="font-mono text-[10px] md:text-[12px] text-zinc-400 uppercase mb-1 md:mb-2 tracking-widest">{siteContent?.profile?.coordinate_label || 'COORDINATE'}</span><span className="font-impact text-2xl md:text-3xl text-white"><CountUpText value={siteContent?.profile?.coordinate_value || 'D-41'} /></span><div className="w-6 md:w-8 h-[1px] bg-zinc-800 mt-2" /></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <footer ref={footerRef} className="premium-footer relative z-[25] bg-white w-full h-[20vh] sm:h-[30vh] md:h-[50vh] flex flex-col justify-end overflow-hidden border-t border-zinc-200 p-0 m-0">
                            <div className="footer-top absolute top-0 left-0 w-full z-40 p-3 sm:p-4 md:pl-6 md:pr-8 lg:p-8 xl:p-10 flex flex-row justify-between items-start text-black">
                                <div className="flex flex-col gap-0.5 md:gap-1 font-sans text-[9px] sm:text-[11px] md:text-[12px] lg:text-[14px] xl:text-[15px] tracking-[0.05em] font-medium uppercase transition-all duration-300">
                                    <span className="text-black/60">{siteContent?.footer?.copyright_text || '© 2024 THE PARLOUR. ALL RIGHTS RESERVED.'}</span>
                                    <span className="opacity-70 normal-case">dev: {siteContent?.footer?.dev_email || 'studio@parlour.com'}</span>
                                    <span className="opacity-100 font-bold border-t border-black/10 pt-1 normal-case text-black/90 tracking-tight">contact with us: {siteContent?.footer?.contact_email || 'info@theparlour.com'}</span>
                                </div>
                                <div className="flex gap-2 sm:gap-3 md:gap-6 items-center sm:items-start">
                                    <a href={siteContent?.footer?.instagram || '#'} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform duration-300 group">
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 fill-current text-black group-hover:text-red-600" viewBox="0 0 24 24">
                                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                        </svg>
                                    </a>
                                    <a href={`mailto:${siteContent?.footer?.gmail || ''}`} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform duration-300 group">
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 fill-current text-black group-hover:text-red-600" viewBox="0 0 24 24">
                                            <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 010 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
                                        </svg>
                                    </a>
                                    <a href={siteContent?.footer?.facebook || '#'} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform duration-300 group">
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 fill-current text-black group-hover:text-red-600" viewBox="0 0 24 24">
                                            <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                            <div ref={footerTitleRef} className="w-full h-full flex items-end justify-center z-10 pointer-events-none">
                                <FooterTitle text={footerText} className="giant-text text-black select-none" />
                            </div>
                        </footer>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Gallery Modal - Full Screen Lightbox */}
            <AnimatePresence>
                {isGalleryModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-[9999] bg-black/95 flex flex-col"
                        style={{ height: '100vh', maxHeight: '100vh' }}
                        onClick={() => setIsGalleryModalOpen(false)}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-black/50 backdrop-blur-sm">
                            <h2 className="font-impact text-2xl text-white uppercase tracking-wider">All Works</h2>
                            <button
                                onClick={() => setIsGalleryModalOpen(false)}
                                className="w-10 h-10 flex items-center justify-center border border-zinc-700 hover:border-[#E0A9C5] text-white hover:text-[#E0A9C5] transition-colors"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        {/* Gallery Grid */}
                        <div
                            ref={galleryScrollRef}
                            className="flex-1 gallery-modal-scroll h-0 min-h-0 p-3 sm:p-4 md:p-6"
                            style={{
                                scrollBehavior: 'smooth',
                                WebkitOverflowScrolling: 'touch',
                                cursor: isDragging ? 'grabbing' : 'grab'
                            }}
                            onClick={(e) => e.stopPropagation()}
                            onWheel={(e) => e.stopPropagation()}
                            onMouseDown={(e) => {
                                setIsDragging(true);
                                dragStartY.current = e.clientY;
                                dragStartScroll.current = galleryScrollRef.current?.scrollTop || 0;
                            }}
                            onMouseMove={(e) => {
                                if (!isDragging) return;
                                const deltaY = e.clientY - dragStartY.current;
                                if (galleryScrollRef.current) {
                                    galleryScrollRef.current.scrollTop = dragStartScroll.current - deltaY;
                                }
                            }}
                            onMouseUp={() => setIsDragging(false)}
                            onMouseLeave={() => setIsDragging(false)}
                            onTouchStart={(e) => {
                                dragStartY.current = e.touches[0].clientY;
                                dragStartScroll.current = galleryScrollRef.current?.scrollTop || 0;
                            }}
                            onTouchMove={(e) => {
                                const deltaY = e.touches[0].clientY - dragStartY.current;
                                if (galleryScrollRef.current) {
                                    galleryScrollRef.current.scrollTop = dragStartScroll.current - deltaY;
                                }
                            }}
                        >
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
                                {gallery.map((item, index) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="group relative aspect-[3/4] overflow-hidden border border-zinc-800 cursor-pointer"
                                        onClick={() => { setGalleryModalIndex(index); }}
                                    >
                                        <img
                                            src={item.image_url}
                                            alt={item.title}
                                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform">
                                            <h3 className="font-impact text-white text-lg uppercase">{item.title}</h3>
                                            <p className="font-mono text-[#E0A9C5] text-xs uppercase">{item.category || 'WORK'}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Image Counter */}
                        <div className="px-6 py-3 border-t border-zinc-800 flex items-center justify-center bg-black/50">
                            <span className="font-mono text-zinc-500 text-sm">
                                {gallery.length} WORKS DISPLAYED
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
};

export default App;

