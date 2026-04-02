import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useMotionValue } from 'framer-motion';

interface RadialScrollGalleryProps {
  children: (activeIndex: number) => React.ReactNode[];
  header?: React.ReactNode;
  className?: string;
  baseRadius?: number;
  mobileRadius?: number;
}

export const RadialScrollGallery: React.FC<RadialScrollGalleryProps> = ({
  children,
  header,
  className = "",
  baseRadius = 400, // Slightly smaller base radius for tighter focus
  mobileRadius = 260,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const items = children(0);
  const itemCount = items.length;

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (v) => {
      // Offset calculation to pick the active index correctly within the image scroll zone
      const effectiveProgress = Math.max(0, (v - 0.25) / 0.7);
      const index = Math.min(itemCount - 1, Math.max(0, Math.floor(effectiveProgress * itemCount)));
      setActiveIndex(index);
    });
    return () => unsubscribe();
  }, [scrollYProgress, itemCount]);

  // Remove black overlay - keep background always transparent
  // const bgColor = useTransform(
  //   scrollYProgress,
  //   [0, 0.1, 0.9, 1],
  //   ["rgba(0,0,0,0)", "rgba(0,0,0,1)", "rgba(0,0,0,1)", "rgba(0,0,0,0)"]
  // );

  const bgColor = "rgba(0,0,0,0)";

  const radius = typeof window !== 'undefined' && window.innerWidth < 769 ? mobileRadius : baseRadius;
  const nodes = children(activeIndex);

  // Drag-to-scroll functionality
  const handleDrag = (event: any, info: any) => {
    const dragDistance = info.delta.x;
    const scrollAmount = dragDistance * 5; // Sensitivity
    window.scrollBy({ top: -scrollAmount, behavior: 'auto' });
  };

  return (
    <div ref={containerRef} className={`relative h-[650vh] ${className}`}>
      <motion.div
        style={{ backgroundColor: bgColor }}
        className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden pointer-events-none"
      >
        {header && (
          <motion.div
            style={{
              opacity: useTransform(scrollYProgress, [0, 0.1, 0.3, 0.9, 1], [1, 1, 0.2, 0.2, 0]),
              y: useTransform(scrollYProgress, [0.1, 0.3], [0, -40])
            }}
            className="absolute inset-0 z-[60] flex items-start justify-center pt-24 pointer-events-none"
          >
            {header}
          </motion.div>
        )}

        <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
          {nodes.map((node, index) => {
            // Tight focal mapping so items are visible in a specific 3-item window
            const focalPoint = 0.35 + (index / (itemCount - 1)) * 0.55;

            // Arc angle - left images stay left, right images go much further right below header
            const angle = useTransform(
              scrollYProgress,
              [focalPoint - 0.15, focalPoint, focalPoint + 0.15],
              [Math.PI * 0.03, 0, -Math.PI * 0.6]
            );

            // Increased spread - go further right and lower to avoid header overlap
            const x = useTransform(angle, (a) => Math.sin(a) * (radius * 0.9));
            const y = useTransform(angle, (a) => (1 - Math.cos(a)) * (radius * 0.25) + 140);

            const rotate = useTransform(angle, (a) => (a * 180) / Math.PI * 0.35);

            // Opacity - images always fully visible
            const opacity = 1;

            // Scale - images always at full size
            const scale = 1;

            return (
              <motion.div
                key={index}
                style={{
                  position: 'absolute',
                  x,
                  y,
                  rotate,
                  opacity,
                  scale,
                  zIndex: activeIndex === index ? 70 : 10,
                }}
                className="will-change-transform pointer-events-none"
              >
                <div className="pointer-events-auto">
                  {node}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};