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

  const toggleMenu = contextSafe(() => {
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
      
      // Backdrop fade in
      gsap.to(backdropRef.current, {
        opacity: 1,
        pointerEvents: 'auto',
        duration: 0.5,
        ease: 'power2.out'
      });
      
      // Drawer slide in
      gsap.to(drawerRef.current, {
        x: '0%',
        duration: 0.8,
        ease: 'power4.out',
      });
      
      // Menu items stagger in
      gsap.fromTo(items, 
        { x: 40, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.05,
          ease: 'power3.out',
          delay: 0.2,
          onComplete: () => {
            isAnimatingRef.current = false;
          }
        }
      );
      
    } else {
      document.body.style.overflow = '';
      
      // Menu items slide out fast
      gsap.to(items, {
        x: 20,
        opacity: 0,
        duration: 0.3,
        stagger: -0.02,
        ease: 'power2.in',
      });
      
      // Drawer slide out
      gsap.to(drawerRef.current, {
        x: '100%',
        duration: 0.6,
        ease: 'power4.inOut',
        delay: 0.1
      });
      
      // Backdrop fade out
      gsap.to(backdropRef.current, {
        opacity: 0,
        pointerEvents: 'none',
        duration: 0.5,
        ease: 'power2.inOut',
        delay: 0.2,
        onComplete: () => {
          isAnimatingRef.current = false;
        }
      });
    }
  });

  const handleNav = (id: string) => {
    if (isOpen && !isAnimatingRef.current) {
      toggleMenu();
      setTimeout(() => {
        const el = document.getElementById(id);
        if (!el) return;
        const lenis = (window as any).__lenis;
        if (lenis) {
          lenis.scrollTo(el, { offset: 0, duration: 1.2 });
        } else {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 700); // Wait for open/close animation to finish out before scrolling
    }
  };

  return (
    <div ref={containerRef}>
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] as const }}
        className="fixed top-0 left-0 w-full z-[220] p-4 md:p-8 flex justify-between items-start pointer-events-none">
        
        <div className="pointer-events-auto flex items-center gap-3">
          {siteContent?.header?.logo_image && (
            <img
              src={siteContent.header.logo_image}
              alt="Logo"
              className="h-8 md:h-10 w-auto object-contain"
              style={{ background: 'transparent' }}
            />
          )}
          <div className="flex flex-col gap-0.5">
            <span className="font-impact text-[12px] md:text-[14px] text-white tracking-[0.2em] uppercase opacity-90">
              {siteContent?.header?.logo_text || ''}
            </span>
            <div className="w-10 md:w-12 h-[1px] bg-[#E0A9C5]" />
          </div>
        </div>

        <div
          onClick={() => toggleMenu()}
          className="pointer-events-auto cursor-pointer group flex flex-col items-center gap-0"
        >
          <div className="relative w-8 md:w-10 h-6 flex flex-col items-center justify-center gap-1.5">
            <span className={`w-6 md:w-8 h-[2px] bg-white transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-[4px]' : ''}`}></span>
            <span className={`w-6 md:w-8 h-[2px] bg-white transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-[4px]' : ''}`}></span>
          </div>
          <span className="font-mono text-[8px] md:text-[9px] text-white/60 uppercase tracking-[0.2em] select-none">
            {isOpen ? 'CLOSE' : 'MENU'}
          </span>
        </div>
      </motion.nav>

      {/* GSAP Managed Backdrop */}
      <div
        ref={backdropRef}
        onClick={() => { if (isOpen && !isAnimatingRef.current) toggleMenu() }}
        className="fixed inset-0 z-[205] bg-black/60 backdrop-blur-sm pointer-events-none opacity-0"
      />

      {/* GSAP Managed Drawer */}
      <div
        ref={drawerRef}
        className="fixed top-0 right-0 h-screen w-[320px] sm:w-[400px] z-[210] bg-black border-l border-zinc-800 flex flex-col shadow-2xl overflow-hidden translate-x-full pointer-events-auto"
      >
        <div className="flex-1 py-16 px-6 sm:px-8 flex flex-col justify-between h-screen">
          <div className="font-mono text-[8px] md:text-[10px] text-[#E0A9C5] tracking-[0.3em] mb-4 uppercase text-center w-full pb-4 border-b border-zinc-900 opacity-100">
            [ NAVIGATION ]
          </div>

          <div className="flex flex-col gap-4 sm:gap-6 items-center w-full">
            {sections.map((section, idx) => {
              const isReserve = section.name === 'RESERVE NOW';
              return (
                <div
                  key={section.id}
                  ref={(el) => { menuItemsRef.current[idx] = el; }}
                  onClick={() => handleNav(section.id)}
                  className={`group cursor-pointer relative w-full text-center opacity-0 ${isReserve ? 'mt-4' : ''}`}
                >
                  {isReserve ? (
                    <div className="relative overflow-hidden inline-block border border-white/20 hover:border-[#db72a8] transition-colors duration-500 bg-white/5 hover:bg-white/10 px-6 py-2 sm:px-8 sm:py-3 group">
                      <span className="font-impact text-xl sm:text-3xl text-[#db72a8] tracking-widest uppercase relative z-10 transition-colors duration-300">
                        {section.name}
                      </span>
                      <div className="absolute inset-0 bg-[#db72a8]/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-0" />
                    </div>
                  ) : (
                    <span className="font-impact text-3xl sm:text-5xl text-white group-hover:text-[#db72a8] transition-all duration-300 tracking-tighter uppercase inline-block relative py-1">
                      {section.name}
                      <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#db72a8] transition-all duration-500 group-hover:w-full" />
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-auto pt-8 w-full border-t border-zinc-900 opacity-100"></div>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
