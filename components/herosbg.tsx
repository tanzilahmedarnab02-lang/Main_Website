import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/all';
import heroBgImage from './ui/images/xinyi-wen-qjCHPZbeXCQ-unsplash.jpg';

gsap.registerPlugin(ScrollTrigger);

export default function HeroSbg() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Simple parallax effect instead of pinning for 4 screens
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: containerRef.current,
                start: 'top top',
                end: 'bottom top',
                scrub: true,
            },
        });
        
        tl.to(containerRef.current, {
            yPercent: 30,
            ease: "none"
        });

        return () => {
            ScrollTrigger.getAll().forEach((st) => {
                if (st.trigger === containerRef.current) {
                    st.kill();
                }
            });
        };
    }, []);

    return (
        <div
            ref={containerRef}
            style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                backgroundImage: `url(${heroBgImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundColor: '#000',
            }}
        />
    );
}
