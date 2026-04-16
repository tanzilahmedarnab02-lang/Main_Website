import React from 'react';
import { motion } from 'framer-motion';

// Helper function to calculate balanced line breaks
const calculateBalancedLines = (words: string[]): string[][] => {
    const wordCount = words.length;

    if (wordCount <= 1) {
        return [words];
    }

    // Calculate ideal words per line for visual balance
    const getSplitPoints = (total: number): number[] => {
        switch (total) {
            case 1:
                return [1];
            case 2:
                // For 2 words, keep together unless one word is very long
                return [2];
            case 3:
                // 1+2 or 2+1 split
                return [2];
            case 4:
                // 2+2 split
                return [2];
            case 5:
                // 2+3 or 3+2 split (prefer 2+3 for visual balance)
                return [2];
            case 6:
                // 3+3 split
                return [3];
            case 7:
                // 3+4 or 4+3 (prefer 3+4)
                return [3];
            case 8:
                // Can do 4+4 or 2+3+3, prefer 4+4 for cleaner look
                return [4];
            default:
                // For more than 8 words, divide roughly in half
                return [Math.ceil(total / 2)];
        }
    };

    const splitAt = getSplitPoints(wordCount)[0];
    const firstLine = words.slice(0, splitAt);
    const secondLine = words.slice(splitAt);

    // Handle edge case: if second line would have too many words (>60% of total), rebalance
    if (secondLine.length > wordCount * 0.6 && wordCount > 3) {
        const newSplit = Math.floor(wordCount / 2);
        return [
            words.slice(0, newSplit),
            words.slice(newSplit)
        ];
    }

    return [firstLine, secondLine];
};

// Dynamic Main Heading Component with Balanced Line Breaking
const DynamicMainHeading = ({ text, className = '' }: { text: string, className?: string }) => {
    // Ensure text is never undefined or empty
    const safeText = text || '';
    if (!safeText.trim()) {
        return null; // Don't render anything if text is empty
    }

    const words = safeText.trim().split(/\s+/);
    const lines = calculateBalancedLines(words);

    return (
        <motion.h1
            className={`font-serif text-[clamp(2rem,10vw,6rem)] lg:text-[clamp(2.5rem,6vw,6rem)] leading-[0.85] tracking-tighter uppercase w-full break-words ${className}`}
            style={{
                wordSpacing: 'clamp(0.125rem, 0.5vw, 0.5rem)'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
                duration: 2,
                ease: [0.25, 0.1, 0.25, 1] as const
            }}
        >
            {lines.map((lineWords, lineIndex) => (
                <span
                    key={lineIndex}
                    style={{
                        display: 'block'
                    }}
                >
                    {lineWords.map((word, wordIndex) => (
                        <React.Fragment key={`${lineIndex}-${wordIndex}`}>
                            <span
                                className={lineIndex === 0 ? 'premium-glow-text-white' : 'premium-glow-text'}
                            >
                                {word}
                            </span>
                            {wordIndex < lineWords.length - 1 && ' '}
                        </React.Fragment>
                    ))}
                </span>
            ))}
        </motion.h1>
    );
};

export default DynamicMainHeading;
