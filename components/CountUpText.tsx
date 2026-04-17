import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let scrollDirection: 'down' | 'up' = 'down';
let lastScrollY = 0;

// Track global scroll direction
if (typeof window !== 'undefined') {
    window.addEventListener('scroll', () => {
        scrollDirection = window.scrollY > lastScrollY ? 'down' : 'up';
        lastScrollY = window.scrollY;
    }, { passive: true });
}

const CountUpText = ({ value }: { value: string | undefined }) => {
    const elRef = useRef<HTMLSpanElement>(null);
    const countValueRef = useRef({ val: 0 });
    
    useEffect(() => {
        if (!value || !elRef.current) return;
        
        const match = value.match(/^(.*?)(\d+(?:\.\d+)?)(.*)$/);
        
        if (!match) {
            elRef.current.innerText = value;
            return;
        }
        
        const prefix = match[1];
        const numLabel = match[2];
        const suffix = match[3];
        const endNum = parseFloat(numLabel);
        const hasDecimal = numLabel.includes('.');
        const decimalPlaces = hasDecimal ? numLabel.split('.')[1].length : 0;
        
        // Reset initial display
        elRef.current.innerText = `${prefix}0${suffix}`;
        
        const triggerElement = elRef.current;
        
        // Create scroll trigger that handles the animation
        ScrollTrigger.create({
            trigger: triggerElement,
            start: 'top 90%',
            onEnter: () => {
                // Only trigger if scrolling down
                if (scrollDirection === 'down') {
                    countValueRef.current.val = 0;
                    gsap.to(countValueRef.current, {
                        val: endNum,
                        duration: 2.5,
                        delay: 0.2,
                        ease: 'power3.out',
                        onUpdate: function() {
                            if (triggerElement) {
                                const displayVal = hasDecimal 
                                    ? countValueRef.current.val.toFixed(decimalPlaces)
                                    : Math.floor(countValueRef.current.val);
                                triggerElement.innerText = prefix + displayVal + suffix;
                            }
                        }
                    });
                }
            },
            onEnterBack: () => {
                // Only trigger if scrolling down, not up from footer
                if (scrollDirection === 'down') {
                    countValueRef.current.val = 0;
                    gsap.to(countValueRef.current, {
                        val: endNum,
                        duration: 2.5,
                        delay: 0.2,
                        ease: 'power3.out',
                        onUpdate: function() {
                            if (triggerElement) {
                                const displayVal = hasDecimal 
                                    ? countValueRef.current.val.toFixed(decimalPlaces)
                                    : Math.floor(countValueRef.current.val);
                                triggerElement.innerText = prefix + displayVal + suffix;
                            }
                        }
                    });
                }
            }
        });
        
        return () => {
            ScrollTrigger.getAll().forEach(trigger => {
                if (trigger.vars.trigger === triggerElement) {
                    trigger.kill();
                }
            });
        };
    }, [value]);
    
    return <span ref={elRef}>{value || ''}</span>;
};

export default CountUpText;
