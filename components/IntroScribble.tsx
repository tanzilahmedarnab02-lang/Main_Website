import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SITE_CONTENT } from '../constants';

const IntroScribble: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get intro content from SITE_CONTENT or use defaults
  const introContent = SITE_CONTENT?.intro || {};
  const heading = introContent.phase1_heading || 'BEAUTY REFINED';
  const subtitle = introContent.phase1_subtitle || 'Est. 2024 — Salon & Spa';

  useEffect(() => {
    // Auto-complete after animation
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 1200);
    }, 3500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={containerRef}
          onClick={onComplete}
          onDoubleClick={(e) => { e.stopPropagation(); }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 1.2, ease: [0.25, 0.1, 0.25, 1] as const } }}
          className="fixed inset-0 z-[100] bg-[#0a0a0a] flex flex-col items-center justify-center overflow-hidden cursor-pointer"
          title="Click or double-click to skip"
        >
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#E0A9C5]/5 via-transparent to-[#C485A8]/10" />

          {/* Main Content */}
          <motion.div
            className="relative flex flex-col items-center z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] as const }}
          >
            {/* Elegant Mirror/Frame SVG */}
            <motion.svg
              width="200"
              height="200"
              viewBox="0 0 200 200"
              className="fill-none stroke-[#E0A9C5] mb-8"
              style={{ strokeWidth: 1 }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              {/* Outer decorative frame */}
              <motion.rect
                x="20"
                y="40"
                width="160"
                height="120"
                rx="2"
                strokeWidth="1.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
              {/* Inner mirror shape */}
              <motion.path
                d="M35 50 H165 V130 Q165 150 145 150 H55 Q35 150 35 130 Z"
                strokeWidth="1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 1, duration: 0.8 }}
              />
              {/* Reflection lines */}
              <motion.line
                x1="50"
                y1="60"
                x2="80"
                y2="90"
                strokeWidth="0.5"
                stroke="#E0A9C5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 1.5, duration: 0.5 }}
              />
              <motion.line
                x1="55"
                y1="65"
                x2="75"
                y2="85"
                strokeWidth="0.5"
                stroke="#E0A9C5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 1.7, duration: 0.5 }}
              />
              {/* Crown accent at top */}
              <motion.path
                d="M70 40 L85 20 L100 40 L115 20 L130 40"
                strokeWidth="1"
                fill="none"
                initial={{ pathLength: 0, y: -10 }}
                animate={{ pathLength: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
              />
            </motion.svg>

            {/* Main Heading */}
            <motion.h1
              className="font-serif text-4xl md:text-6xl lg:text-7xl text-white tracking-wide text-center"
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="text-[#E0A9C5]">{heading.split(' ')[0]}</span>
              <br />
              <span className="font-light italic">{heading.split(' ').slice(1).join(' ')}</span>
            </motion.h1>

            {/* Elegant divider */}
            <motion.div
              className="w-24 h-px bg-gradient-to-r from-transparent via-[#E0A9C5] to-transparent mt-6"
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
            />

            {/* Tagline */}
            <motion.p
              className="mt-4 font-sans text-xs md:text-sm text-white/50 uppercase tracking-[0.4em] text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.8 }}
            >
              {subtitle}
            </motion.p>
          </motion.div>

          {/* Decorative corner flourishes */}
          <motion.div
            className="absolute top-8 left-8 w-16 h-16 border-l border-t border-[#E0A9C5]/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
          />
          <motion.div
            className="absolute bottom-8 right-8 w-16 h-16 border-r border-b border-[#E0A9C5]/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
          />

          {/* Skip hint */}
          <motion.div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 font-sans text-[10px] text-white/30 uppercase tracking-[0.3em]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5 }}
          >
            [ click anywhere to enter ]
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IntroScribble;
