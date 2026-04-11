import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const CountUpText = ({ value }: { value: string | undefined }) => {
    const elRef = useRef<HTMLSpanElement>(null);
    
    useEffect(() => {
        if (!value || !elRef.current) return;
        
        const match = value.match(/^([^0-9]*)([0-9]+)([^0-9]*)$/);
        
        if (!match) {
            elRef.current.innerText = value;
            return;
        }
        
        const prefix = match[1];
        const numLabel = match[2];
        const suffix = match[3];
        const endNum = parseInt(numLabel, 10);
        
        elRef.current.innerText = `${prefix}0${suffix}`;
        
        const ctx = gsap.context(() => {
            gsap.to({ val: 0 }, {
                val: endNum,
                duration: 2.5,
                delay: 0.2,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: elRef.current,
                    start: 'top 90%',
                    once: true,
                },
                onUpdate: function() {
                    if (elRef.current) {
                        elRef.current.innerText = prefix + Math.floor(this.targets()[0].val) + suffix;
                    }
                }
            });
        }, elRef);
        
        return () => ctx.revert();
    }, [value]);
    
    return <span ref={elRef}>{value || ''}</span>;
};

export default CountUpText;
