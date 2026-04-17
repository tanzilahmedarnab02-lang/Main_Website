import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/all';

gsap.registerPlugin(ScrollTrigger);

export default function HeroSbg() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Parallax animation disabled to ensure full image loads at once
        // Previously caused horizontal part-by-part loading due to transform animations
        
        return () => {
            ScrollTrigger.getAll().forEach((st) => {
                if (st.trigger === containerRef.current) {
                    st.kill();
                }
            });
        };
    }, []);

    return (
        <div ref={containerRef} className="absolute inset-0 w-full h-full overflow-hidden bg-black" style={{ willChange: 'auto' }}>
            <img
                src="https://oqgzypdognvjdscujofz.supabase.co/storage/v1/object/public/about%20section/hero-bg.webp"
                className="w-full h-full object-cover"
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    willChange: 'auto',
                    backfaceVisibility: 'visible'
                }}
                alt=""
                fetchpriority="high"
                loading="eager"
            />
        </div>
    );
}
