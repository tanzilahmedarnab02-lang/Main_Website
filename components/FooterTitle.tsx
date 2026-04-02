import React, { useRef, useEffect, useState } from 'react';

interface FooterTitleProps {
    text: string;
    className?: string;
    style?: React.CSSProperties;
}

const FooterTitle: React.FC<FooterTitleProps> = ({ text, className = "", style = {} }) => {
    const textRef = useRef<SVGTextElement>(null);
    const [viewBox, setViewBox] = useState("0 0 200 40");
    const [bboxW, setBboxW] = useState(0);
    const [bboxH, setBboxH] = useState(0);
    const [bboxX, setBboxX] = useState(0);
    const [bboxY, setBboxY] = useState(0);

    useEffect(() => {
        const updateViewBox = () => {
            if (textRef.current) {
                const bbox = textRef.current.getBBox();
                // We use the EXACT bbox with zero padding to ensure mathematical flushness
                if (bbox.width > 0 && bbox.height > 0) {
                    setViewBox(`${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`);
                    setBboxH(bbox.height);
                    setBboxY(bbox.y);
                    setBboxW(bbox.width);
                    setBboxX(bbox.x);
                }
            }
        };

        // Initial measure
        updateViewBox();

        window.addEventListener('resize', updateViewBox);
        return () => window.removeEventListener('resize', updateViewBox);
    }, [text]);

    return (
        <div className={`w-full h-full overflow-hidden ${className}`} style={style}>
            <svg
                viewBox={viewBox}
                width="100%"
                height="100%"
                preserveAspectRatio="xMidYMax meet"
                className="block w-full h-full overflow-visible"
            >
                <text
                    ref={textRef}
                    x={bboxX + bboxW / 2}
                    y={bboxY + bboxH * 1.05}
                    textAnchor="middle"
                    dominantBaseline="alphabetic"
                    className="font-impact fill-current"
                    style={{ fontSize: 'clamp(96px, 25vw, 350px)' }}
                >
                    {text}
                </text>
            </svg>
        </div>
    );
};

export default FooterTitle;
