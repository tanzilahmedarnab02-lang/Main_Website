import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/all';


gsap.registerPlugin(ScrollTrigger);

export default function HeroSbg() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Simple parallax effect
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
        <div ref={containerRef} className="absolute inset-0 w-full h-full overflow-hidden bg-black">
            <img 
                src="https://oqgzypdognvjdscujofz.supabase.co/storage/v1/object/public/about%20section/hero-bg.webp" 
                className="w-full h-full object-cover"
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                }}
                alt=""
                fetchPriority="high"
            />
        </div>
    );
}
