import React, { useRef, useState, useEffect } from 'react';

interface TiltedCardProps {
    imageSrc: string;
    altText?: string;
    captionText?: string;
    containerHeight?: string;
    containerWidth?: string;
    imageHeight?: string;
    imageWidth?: string;
    rotateAmplitude?: number;
    scaleOnHover?: number;
    showMobileWarning?: boolean;
    showTooltip?: boolean;
    displayOverlayContent?: boolean;
    overlayContent?: React.ReactNode;
}

const TiltedCard: React.FC<TiltedCardProps> = ({
    imageSrc,
    altText = 'Tilted Card Image',
    captionText,
    containerHeight = '300px',
    containerWidth = '300px',
    imageHeight = '300px',
    imageWidth = '300px',
    rotateAmplitude = 12,
    scaleOnHover = 1.05,
    showMobileWarning = false,
    showTooltip = false,
    displayOverlayContent = false,
    overlayContent,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [rotation, setRotation] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const mouseX = e.clientX - centerX;
        const mouseY = e.clientY - centerY;

        const rotateX = (mouseY / (rect.height / 2)) * -rotateAmplitude;
        const rotateY = (mouseX / (rect.width / 2)) * rotateAmplitude;

        setRotation({ x: rotateX, y: rotateY });
    };

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => {
        setIsHovered(false);
        setRotation({ x: 0, y: 0 });
    };

    if (!isClient) return null;

    return (
        <div
            ref={containerRef}
            className="relative perspective-container"
            style={{
                height: containerHeight,
                width: containerWidth,
                perspective: '1000px',
            }}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div
                className="w-full h-full transition-transform duration-200 ease-out"
                style={{
                    transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${isHovered ? scaleOnHover : 1})`,
                    transformStyle: 'preserve-3d',
                }}
            >
                {imageSrc ? (
                    <img
                        src={imageSrc}
                        alt={altText}
                        className="w-full h-full object-cover shadow-lg rounded-lg"
                        style={{
                            height: imageHeight,
                            width: imageWidth,
                        }}
                        loading="lazy"
                    />
                ) : (
                    <div
                        className="w-full h-full rounded-lg flex items-center justify-center border border-zinc-800"
                        style={{
                            height: imageHeight,
                            width: imageWidth,
                            background: 'linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 50%, #1a1a1a 100%)',
                        }}
                    >
                        <div className="flex flex-col items-center gap-3 opacity-40">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#E0A9C5" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <polyline points="21 15 16 10 5 21" />
                            </svg>
                            <span className="font-mono text-[9px] text-[#E0A9C5] uppercase tracking-[0.3em]">Image Pending</span>
                        </div>
                    </div>
                )}
                {displayOverlayContent && overlayContent && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                        {overlayContent}
                    </div>
                )}
            </div>
            {captionText && (
                <div className="absolute bottom-0 left-0 right-0 text-center">
                    {showTooltip && (
                        <div className="bg-black/80 text-white text-xs px-2 py-1 rounded mt-1 inline-block">
                            {captionText}
                        </div>
                    )}
                    {!showTooltip && <p className="text-white mt-2 text-sm">{captionText}</p>}
                </div>
            )}
        </div>
    );
};

export default TiltedCard;
