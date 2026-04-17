import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { SITE_CONTENT } from '../constants';

interface PremiumIntroProps {
    onComplete: () => void;
    siteContent: any;
}

const PremiumIntro: React.FC<PremiumIntroProps> = ({ onComplete, siteContent }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const beamRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLHeadingElement>(null);
    const subtitleRef = useRef<HTMLDivElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);
    const scannerRef = useRef<HTMLDivElement>(null);
    const lightRef = useRef<HTMLDivElement>(null);
    const isSkipping = useRef(false);

    // Get text from siteContent (latest Supabase data) with local constants as fallback
    const introContent = siteContent?.intro || SITE_CONTENT?.intro || {};
    const headingText = introContent?.phase1_heading || 'BEAUTY REFINED';
    const subtitleText = introContent?.phase1_subtitle || 'EST. 2024 — SALON & SPA';

    useEffect(() => {
        const tl = gsap.timeline({
            onComplete: () => {
                if (!isSkipping.current) {
                    onComplete();
                }
            }
        });

        // 1. Initial State
        gsap.set([textRef.current, subtitleRef.current], { 
            opacity: 0, 
            y: 50, 
            filter: 'blur(20px)',
            force3D: true 
        });
        gsap.set(scannerRef.current, { x: '-100vw', opacity: 0, force3D: true });
        gsap.set(progressRef.current, { scaleX: 0 });

        // 2. Initial Subtle Reveal
        tl.to(textRef.current, {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 1.5,
            ease: "expo.out"
        });

        // 3. Scanner Swipe (Glossy Bar)
        tl.to(scannerRef.current, {
            x: '100vw',
            opacity: 1,
            duration: 3.5,
            ease: "power2.inOut",
            force3D: true
        }, 0.5)
        .to(scannerRef.current, {
            opacity: 0,
            duration: 0.5
        }, 3.5);

        // 4. Subtitle Reveal with Char Stagger - Restored to original timing
        tl.to(subtitleRef.current, {
            opacity: 0.8,
            y: 0,
            filter: 'blur(0px)',
            duration: 1,
            ease: "power3.out"
        }, 1.5);

        // 5. Progress Bar - Restored to original timing
        tl.to(progressRef.current, {
            scaleX: 1,
            duration: 2,
            ease: "power1.inOut"
        }, 1.5);

        // 5. Final Glossy Pulse
        tl.to(textRef.current, {
            textShadow: '0 0 20px rgba(255, 193, 227, 0.5)',
            duration: 0.8,
            repeat: 1,
            yoyo: true
        }, 2.5);

        // 6. Background Light Pulse
        gsap.to(lightRef.current, {
            opacity: 0.15,
            scale: 1.2,
            duration: 3,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            force3D: true
        });

        // 7. Exit Animation
        tl.to(containerRef.current, {
            opacity: 0,
            scale: 1.05,
            filter: 'blur(20px)',
            duration: 1.0,
            ease: "power4.inOut"
        }, 4.2);

        return () => {
            tl.kill();
            gsap.killTweensOf(lightRef.current);
        };
    }, []); // Empty dependency array to ensure it only runs once

    const handleSkip = () => {
        if (isSkipping.current) return;
        isSkipping.current = true;
        
        // Instant exit animation
        gsap.to(containerRef.current, {
            opacity: 0,
            scale: 1.1,
            filter: 'blur(30px)',
            duration: 0.8,
            ease: "power3.inOut",
            onComplete: onComplete
        });
    };

    return (
        <div 
            ref={containerRef}
            onClick={handleSkip}
            className="fixed inset-0 z-[9999] bg-[#020202] flex flex-col items-center justify-center overflow-hidden cursor-pointer"
            title="Click to skip"
        >
            {/* Grain Texture */}
            <div className="grain-texture opacity-20" />

            {/* Scanning Bar (Glassmorphic) */}
            <div 
                ref={scannerRef}
                className="absolute top-0 bottom-0 left-0 w-48 bg-white/5 backdrop-blur-sm border-x border-white/10 z-30 pointer-events-none skew-x-[-15deg] will-change-transform opacity-0"
                style={{ 
                    boxShadow: '0 0 50px rgba(255,255,255,0.05)',
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)'
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>

            {/* Backglow / Soft Light */}
            <div 
                ref={lightRef}
                className="absolute w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-[#E0A9C5]/10 blur-[150px] rounded-full pointer-events-none" 
                style={{ opacity: 0 }}
            />

            {/* Content Container */}
            <div className="relative z-20 flex flex-col items-center text-center w-full px-6 max-w-7xl">
                {/* Decorative Elements */}
                <div className="flex gap-2 mb-12">
                    {[...Array(3)].map((_, i) => (
                        <motion.div 
                            key={i}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: 0.5 + i * 0.1, duration: 1 }}
                            className="h-[2px] w-12 bg-white/20 origin-left"
                        />
                    ))}
                </div>

                <h1 
                    ref={textRef}
                    className="font-serif text-[clamp(2.5rem,12vw,9rem)] uppercase leading-[0.9] tracking-tighter text-white mb-10 overflow-hidden"
                >
                    {(headingText || '').split(' ').map((word, i) => (
                        <span key={i} className="inline-block mr-[0.2em] last:mr-0">
                            {(word || '').split('').map((char, j) => (
                                <motion.span 
                                    key={j} 
                                    className="inline-block premium-glow-text-white"
                                    initial={{ y: "100%" }}
                                    animate={{ y: 0 }}
                                    transition={{ 
                                        delay: 0.8 + (i * 0.1) + (j * 0.05),
                                        duration: 0.8,
                                        ease: [0.33, 1, 0.68, 1]
                                    }}
                                >
                                    {char}
                                </motion.span>
                            ))}
                        </span>
                    ))}
                </h1>

                {/* Glassy Progress Line */}
                <div className="w-[80%] max-w-[400px] h-[1px] bg-white/10 relative mb-12 overflow-hidden">
                    <div 
                        ref={progressRef}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFC1E3] to-transparent origin-left"
                    />
                </div>

                <div 
                    ref={subtitleRef}
                    className="flex flex-col items-center gap-6"
                >
                    <span className="font-mono text-xs md:text-sm tracking-[0.6em] text-white/50 uppercase">
                        {subtitleText}
                    </span>
                    
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        transition={{ delay: 2, duration: 1 }}
                        className="flex items-center gap-3"
                    >
                        <div className="w-1.5 h-1.5 rounded-full bg-[#FFC1E3] animate-pulse" />
                        <span className="font-mono text-[10px] tracking-widest text-white/40">SYSTEM.READY_MODE</span>
                    </motion.div>
                </div>
            </div>

            {/* Floating Glossy Accents */}
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-px h-20 bg-gradient-to-b from-transparent via-[#FFC1E3]/20 to-transparent will-change-transform"
                    initial={{ 
                        x: Math.random() * 100 + '%', 
                        y: '-20%',
                        opacity: 0 
                    }}
                    animate={{ 
                        y: '120%',
                        opacity: [0, 1, 0]
                    }}
                    transition={{ 
                        duration: 4 + Math.random() * 4,
                        repeat: Infinity,
                        delay: Math.random() * 5,
                        ease: "linear"
                    }}
                />
            ))}
        </div>
    );
};

export default PremiumIntro;
