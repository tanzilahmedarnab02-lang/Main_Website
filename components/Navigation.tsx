
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getNavigation, type NavigationItem } from '../services/contentService';
import { SITE_CONTENT } from '../constants';

interface NavigationProps {
  onMenuStateChange?: (isOpen: boolean) => void;
}

const Navigation: React.FC<NavigationProps> = ({ onMenuStateChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuItemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const overlayRef = useRef<HTMLDivElement>(null);
  const isAnimatingRef = useRef(false);
  const [sections, setSections] = useState<{ name: string; id: string }[]>([
    { name: 'HOME', id: 'hero' },
    { name: 'STUDIO', id: 'studio-work' },
    { name: 'ABOUT', id: 'about' },
    { name: 'CATALOG', id: 'catalog' },
    { name: 'RESERVE NOW', id: 'footer' }
  ]);

  const openMenu = () => {
    if (isAnimatingRef.current || isOpen) return;
    isAnimatingRef.current = true;
    setIsOpen(true);
  };

  const closeMenu = () => {
    if (isAnimatingRef.current || !isOpen) return;
    isAnimatingRef.current = true;

    const items = menuItemsRef.current.filter(Boolean);

    // Animate items out
    items.forEach((item) => {
      if (item) {
        item.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
        item.style.opacity = '0';
        item.style.transform = 'translateX(20px)';
      }
    });

    // Animate drawer close
    if (overlayRef.current) {
      setTimeout(() => {
        overlayRef.current.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)';
        overlayRef.current.style.transform = 'translateX(100%)';
      }, 50);
    }

    setTimeout(() => {
      setIsOpen(false);
      isAnimatingRef.current = false;
    }, 400);
  };

  useEffect(() => {
    // Notify parent of menu state change
    if (onMenuStateChange) {
      onMenuStateChange(isOpen);
    }

    // Prevent body scroll when drawer is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    if (isOpen) {
      isAnimatingRef.current = true;
      const items = menuItemsRef.current.filter(Boolean);

      // Reset and animate drawer in
      if (overlayRef.current) {
        overlayRef.current.style.transition = 'none';
        overlayRef.current.style.transform = 'translateX(100%)';

        // Force reflow
        overlayRef.current.offsetHeight;

        // Enable transition and animate
        overlayRef.current.style.transition = 'transform 0.7s cubic-bezier(0.76, 0, 0.24, 1)';
        overlayRef.current.style.transform = 'translateX(0%)';
      }

      // Animate menu items with stagger
      items.forEach((item, index) => {
        if (item) {
          item.style.opacity = '0';
          item.style.transform = 'translateX(20px)';
          item.style.transition = 'none';

          setTimeout(() => {
            item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateX(0)';
          }, 200 + (index * 50));
        }
      });

      setTimeout(() => {
        isAnimatingRef.current = false;
      }, 600);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, onMenuStateChange]);

  const [siteContent, setSiteContent] = useState<typeof SITE_CONTENT | null>(null);

  // Fetch navigation and site content from Supabase
  useEffect(() => {
    const fetchNav = async () => {
      const items = await getNavigation();
      setSiteContent(SITE_CONTENT as typeof SITE_CONTENT);

      if (items.length > 0) {
        const mappedItems = items.map(item => ({
          name: item.name === 'RESERVE' ? 'RESERVE NOW' : item.name,
          id: item.url.replace('#', '')
        }));

        // Ensure HOME and RESERVE NOW are present if they were intended to be
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

  const handleNav = (id: string) => {
    closeMenu();
    setTimeout(() => {
      const el = document.getElementById(id);
      if (!el) return;
      // Lenis আছে কিনা check করো
      const lenis = (window as any).__lenis;
      if (lenis) {
        lenis.scrollTo(el, { offset: 0, duration: 1.2 });
      } else {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 420); // drawer close animation শেষ হওয়ার পরে scroll
  };

  return (
    <>
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
          onClick={() => isOpen ? closeMenu() : openMenu()}
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

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[205] bg-black/60 backdrop-blur-sm pointer-events-auto"
              onClick={closeMenu}
            />

            {/* Side Drawer */}
            <div
              ref={overlayRef}
              className="fixed top-0 right-0 h-screen w-[320px] sm:w-[400px] z-[210] bg-black border-l border-zinc-800 pointer-events-auto flex flex-col shadow-2xl overflow-hidden"
            >
              <div className="flex-1 py-16 px-6 sm:px-8 flex flex-col justify-between h-screen">
                <div className="font-mono text-[8px] md:text-[10px] text-[#E0A9C5] tracking-[0.3em] mb-4 uppercase text-center w-full pb-4 border-b border-zinc-900">
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
                        className={`group cursor-pointer relative w-full text-center ${isReserve ? 'mt-4' : ''}`}
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

                <div className="mt-auto pt-8 w-full border-t border-zinc-900"></div>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;
