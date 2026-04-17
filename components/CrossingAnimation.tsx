import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface CrossingAnimationProps {
  text?: string;
  symbol?: string;
  speed?: number;
  borderColor?: string;
  textColor?: string;
  className?: string;
  interactive?: boolean;
}

const CrossingAnimation: React.FC<CrossingAnimationProps> = ({
  text = "PREMIUM EXPERIENCE",
  symbol = "✦",
  speed = 3,
  borderColor = "#E0A9C5",
  textColor = "#E0A9C5",
  className = "",
  interactive = false,
}) => {
  // Generate multiple crossing items for both sides
  const leftItems = useMemo(() => Array.from({ length: 8 }), []);
  const rightItems = useMemo(() => Array.from({ length: 8 }), []);

  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.6 } },
  };

  const crossingVariant = (direction: 'left' | 'right', delay: number) => ({
    initial: {
      x: direction === 'left' ? -300 : 300,
      y: direction === 'left' ? 0 : 0,
      opacity: 0,
    },
    animate: {
      x: direction === 'left' ? 50 : -50,
      y: 0,
      opacity: 1,
      transition: {
        duration: speed + 1,
        delay: delay * 0.15,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "reverse" as const,
      },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.4 },
    },
  });

  const itemVariant = (delay: number) => ({
    initial: { scale: 0, rotate: -180, opacity: 0 },
    animate: {
      scale: 1,
      rotate: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        delay: delay * 0.08,
        ease: "easeOut",
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  });

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`relative w-full py-8 md:py-12 px-4 md:px-8 ${className}`}
    >
      {/* Premium Border Container */}
      <div
        className="relative w-full rounded-lg overflow-hidden"
        style={{
          background: "rgba(0, 0, 0, 0.4)",
          border: `2px solid ${borderColor}`,
          boxShadow: `
            0 0 20px ${borderColor}30,
            inset 0 1px 0 rgba(255, 255, 255, 0.1),
            inset 0 0 20px ${borderColor}10
          `,
        }}
      >
        {/* Animated Border Glow */}
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{
            border: `1px solid ${borderColor}`,
            boxShadow: `inset 0 0 30px ${borderColor}40`,
          }}
        />

        {/* Main Content */}
        <div className="relative z-10 flex items-center justify-center min-h-[120px] md:min-h-[140px]">
          {/* Left Crossing Section */}
          <div className="absolute left-4 md:left-8 w-[80px] md:w-[100px] h-full flex flex-col items-center justify-center gap-2 md:gap-3 overflow-hidden">
            {leftItems.map((_, i) => (
              <motion.div
                key={`left-${i}`}
                variants={crossingVariant('left', i)}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <motion.span
                  variants={itemVariant(i)}
                  initial="initial"
                  animate="animate"
                  className="text-base md:text-lg font-bold"
                  style={{ color: borderColor }}
                >
                  {symbol}
                </motion.span>
              </motion.div>
            ))}
          </div>

          {/* Center Text */}
          <div className="flex flex-col items-center justify-center gap-2 md:gap-3 px-4">
            <motion.h3
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="font-impact text-base md:text-2xl uppercase tracking-wider text-center"
              style={{ color: textColor }}
            >
              {text}
            </motion.h3>
            
            {/* Center Divider Line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="h-[1px] w-16 md:w-24"
              style={{
                background: `linear-gradient(90deg, transparent, ${borderColor}, transparent)`,
              }}
            />
          </div>

          {/* Right Crossing Section */}
          <div className="absolute right-4 md:right-8 w-[80px] md:w-[100px] h-full flex flex-col items-center justify-center gap-2 md:gap-3 overflow-hidden">
            {rightItems.map((_, i) => (
              <motion.div
                key={`right-${i}`}
                variants={crossingVariant('right', i)}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <motion.span
                  variants={itemVariant(i)}
                  initial="initial"
                  animate="animate"
                  className="text-base md:text-lg font-bold"
                  style={{ color: borderColor }}
                >
                  {symbol}
                </motion.span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom Accent Line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
          className="absolute bottom-0 left-0 right-0 h-[2px]"
          style={{
            background: `linear-gradient(90deg, transparent, ${borderColor}, transparent)`,
            transformOrigin: "center",
          }}
        />
      </div>

      {/* Interactive Glow Effect (Optional) */}
      {interactive && (
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.3, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
          style={{
            border: `1px solid ${borderColor}`,
            boxShadow: `0 0 30px ${borderColor}50`,
          }}
        />
      )}
    </motion.div>
  );
};

export default CrossingAnimation;
