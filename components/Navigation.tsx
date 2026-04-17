import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { getNavigation, type NavigationItem } from '../services/contentService';
import { SITE_CONTENT } from '../constants';

interface NavigationProps {
  onMenuStateChange?: (isOpen: boolean) => void;
}

const Navigation: React.FC<NavigationProps> = ({ onMenuStateChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const menuItemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const isAnimatingRef = useRef(false);

  const [sections, setSections] = useState<{ name: string; id: string }[]>([
    { name: 'HOME', id: 'hero' },
    { name: 'STUDIO', id: 'studio-work' },
    { name: 'ABOUT', id: 'about' },
    { name: 'CATALOG', id: 'catalog' },
    { name: 'RESERVE NOW', id: 'footer' }
  ]);

  const [siteContent, setSiteContent] = useState<typeof SITE_CONTENT | null>(null);

  useEffect(() => {
    const fetchNav = async () => {
      const items = await getNavigation();
      setSiteContent(SITE_CONTENT as typeof SITE_CONTENT);

      if (items.length > 0) {
        const mappedItems = items.map(item => ({
          name: item.name === 'RESERVE' ? 'RESERVE NOW' : item.name,
          id: item.url.replace('#', '')
        }));

        const finalSections = [...mappedItems];

        if (!finalSections.some(s => s.id === 'hero')) {
          finalSections.unshift({ name: 'HOME', id: 'hero' });
        }
        if (!finalSections.some(s => s.id === 'footer')) {
          finalSections.push({ name: 'RESERVE NOW', id: 'footer' });
        }

        setSections(finalSections);
      }
    };
    fetchNav();
  }, []);

  const { contextSafe } = useGSAP({ scope: containerRef });

  const toggleMenu = () => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;

    const willOpen = !isOpen;
    setIsOpen(willOpen);

    if (onMenuStateChange) {
      onMenuStateChange(willOpen);
    }

    const items = menuItemsRef.current.filter(Boolean);

    if (willOpen) {
      document.body.style.overflow = 'hidden';

      // Backdrop fade in - reduced duration
      gsap.to(backdropRef.current, {
        opacity: 1,
        pointerEvents: 'auto',
        duration: 0.3,
        ease: 'power2.out'
      });

      // Drawer slide in - faster
      gsap.to(drawerRef.current, {
        x: '0%',
        duration: 0.4,
        ease: 'power3.out',
      });

      // Menu items stagger in - much faster
      gsap.fromTo(items,
        { x: 20, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.35,
          stagger: 0.03,
          ease: 'power2.out',
          delay: 0.1,
          onComplete: () => {
            isAnimatingRef.current = false;
          }
        }
      );

    } else {
      document.body.style.overflow = '';

      // Menu items slide out fast
      gsap.to(items, {
        x: 15,
        opacity: 0,
        duration: 0.2,
        stagger: -0.02,
        ease: 'power2.in',
      });

      // Drawer slide out - faster
      gsap.to(drawerRef.current, {
        x: '100%',
        duration: 0.35,
        ease: 'power3.in',
        delay: 0.05
      });

      // Backdrop fade out - faster
      gsap.to(backdropRef.current, {
        opacity: 0,
        pointerEvents: 'none',
        duration: 0.3,
        ease: 'power2.in',
        delay: 0.05,
        onComplete: () => {
          isAnimatingRef.current = false;
        }
      });
    }
  };

  const handleNav = (id: string) => {
    // Navigate immediately - don't wait
    const el = document.getElementById(id);
    if (!el) return;
    const lenis = (window as any).__lenis;
    if (lenis) {
      lenis.scrollTo(el, { offset: 0, duration: 1.2 });
    } else {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Close menu if open - without waiting
    if (isOpen && !isAnimatingRef.current) {
      toggleMenu();
    }
  };

  const handleLogoClick = () => {
    if (isOpen && !isAnimatingRef.current) {
      toggleMenu();
    }
    handleNav('hero');
  };

  return (
    <div ref={containerRef}>
      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] as const }}
        className="fixed top-4 md:top-6 left-0 right-0 mx-auto w-[calc(100%-1.5rem)] md:w-[calc(100%-3rem)] lg:w-[calc(100%-4rem)] max-w-[1600px] z-[200] px-5 py-3 md:px-8 md:py-4 flex justify-between items-center pointer-events-auto bg-white/10 backdrop-blur-[12px] border border-white/20 rounded-full shadow-[0_8px_32px_rgba(255,255,255,0.1)]">

        <div onClick={handleLogoClick} className="pointer-events-auto flex items-center gap-3 cursor-pointer group">
          {siteContent?.header?.logo_image && (
            <img
              src={siteContent.header.logo_image}
              alt="Logo"
              className="h-6 md:h-8 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
              style={{ background: 'transparent' }}
              loading="lazy"
            />
          )}
          <div className="flex flex-col gap-0.5">
            <span className="font-impact text-[10px] md:text-[14px] text-white tracking-[0.2em] uppercase opacity-90 transition-opacity duration-300 group-hover:opacity-100">
              {siteContent?.header?.logo_text || ''}
            </span>
            <div className="w-8 md:w-12 h-[1px] bg-[#E0A9C5] transition-all duration-300 group-hover:w-full" />
          </div>
        </div>

        <div
          onClick={() => toggleMenu()}
          className="pointer-events-auto cursor-pointer flex items-center gap-3 group hover:bg-white/10 px-4 py-2 rounded-full transition-colors duration-300"
        >
          <span className="font-mono text-[9px] md:text-[10px] text-white/80 uppercase tracking-[0.2em] select-none transition-colors duration-300 group-hover:text-white hidden sm:block">
            {isOpen ? 'CLOSE' : 'MENU'}
          </span>
          <div className="relative w-6 md:w-8 h-4 flex flex-col items-end justify-center gap-1.5">
            <span className={`h-[2px] bg-white transition-all duration-300 ${isOpen ? 'w-6 md:w-8 rotate-45 translate-y-[4px]' : 'w-6 md:w-8 group-hover:w-full'}`}></span>
            <span className={`h-[2px] bg-[#E0A9C5] transition-all duration-300 ${isOpen ? 'w-6 md:w-8 -rotate-45 -translate-y-[4px] bg-white' : 'w-4 md:w-5 group-hover:w-full group-hover:bg-white'}`}></span>
          </div>
        </div>
      </motion.nav>

      {/* GSAP Managed Backdrop */}
      <div
        ref={backdropRef}
        onClick={() => { if (isOpen && !isAnimatingRef.current) toggleMenu() }}
        className="fixed inset-0 z-[205] bg-black/50 backdrop-blur-[8px] pointer-events-none opacity-0"
      />

      {/* GSAP Managed Drawer */}
      <div
        ref={drawerRef}
        className="fixed top-0 right-0 h-screen w-[320px] sm:w-[450px] z-[210] bg-black/50 backdrop-blur-[20px] border-l border-white/10 flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.6)] overflow-hidden translate-x-full pointer-events-auto"
      >
        <button 
          onClick={() => toggleMenu()}
          className="absolute top-6 right-6 md:top-8 md:right-8 w-12 h-12 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/20 hover:border-white/30 transition-all duration-300 z-10 group backdrop-blur-md"
        >
          <svg className="w-5 h-5 md:w-6 md:h-6 text-white premium-cross-svg group-hover:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex-1 py-16 px-6 sm:px-12 flex flex-col justify-center h-screen">
          <div className="font-mono text-[10px] md:text-[12px] text-white/50 tracking-[0.4em] uppercase text-center w-full mb-12 relative flex justify-center opacity-100">
            <span className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">NAVIGATION</span>
          </div>

          <div className="flex flex-col gap-6 sm:gap-8 items-center w-full">
            {sections.map((section, idx) => {
              const isReserve = section.name === 'RESERVE NOW';
              return (
                <div
                  key={section.id}
                  ref={(el) => { menuItemsRef.current[idx] = el; }}
                  onClick={() => handleNav(section.id)}
                  className={`group cursor-pointer relative w-full text-center opacity-0 ${isReserve ? 'mt-8' : ''}`}
                >
                  {isReserve ? (
                    <div className="relative overflow-hidden inline-flex items-center justify-center rounded-full border border-white/20 hover:border-white transition-colors duration-500 bg-white/5 hover:bg-white/20 px-8 py-3 sm:px-10 sm:py-4 group backdrop-blur-md">
                      <span className="font-impact text-xl sm:text-2xl text-white tracking-widest uppercase relative z-10 transition-colors duration-300">
                        {section.name}
                      </span>
                    </div>
                  ) : (
                    <span className="font-impact text-4xl sm:text-6xl text-white/60 group-hover:text-white transition-all duration-300 group-hover:scale-[1.02] tracking-tighter uppercase inline-block py-1">
                      {section.name}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-auto pt-16 w-full opacity-100 flex justify-center">
            <div className="w-16 h-[2px] bg-white/20 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
