import React from 'react';

const TornEdge = ({ color, position = 'top' }: { color: string, position?: 'top' | 'bottom' }) => (
    <div className={`absolute left-0 w-full overflow-hidden leading-[0] z-10 ${position === 'top' ? 'top-0 -translate-y-[99%]' : 'bottom-0 translate-y-[99%]'}`}>
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-[calc(100%+1.3px)] h-[40px] md:h-[70px]" style={{ fill: color }}>
            <path d="M0,0 L30,20 L70,8 L120,25 L170,12 L220,28 L280,10 L340,30 L400,15 L460,32 L520,12 L580,35 L640,15 L700,32 L760,12 L820,35 L880,18 L940,38 L1000,22 L1060,40 L1120,28 L1180,15 L1200,25 V120 H0 Z" />
        </svg>
    </div>
);

export default TornEdge;
