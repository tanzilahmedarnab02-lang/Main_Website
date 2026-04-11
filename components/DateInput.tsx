import React, { useRef } from 'react';

const DateInput = ({ value, onChange, placeholder, error, triggerKey }: { value: string, onChange: (val: string) => void, placeholder?: string, error?: string, triggerKey?: number }) => {
    const dayRef = useRef<HTMLInputElement>(null);
    const monthRef = useRef<HTMLInputElement>(null);
    const yearRef = useRef<HTMLInputElement>(null);

    // Parse value into segments for display
    const getDisplayValue = () => {
        // Extract day, month, year from DD-MM-YYYY format
        const parts = value.split('-');
        return { day: parts[0] || '', month: parts[1] || '', year: parts[2] || '' };
    };

    const { day, month, year } = getDisplayValue();

    return (
        <div className="relative flex items-center">
            {/* Day field */}
            <input
                ref={dayRef}
                type="text"
                value={day}
                onChange={(e) => {
                    const num = e.target.value.replace(/[^0-9]/g, '').slice(0, 2);
                    onChange(`${num}-${month}-${year}`);
                    // Auto-focus to month when day is filled
                    if (num.length === 2 && monthRef.current) {
                        monthRef.current.focus();
                    }
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Backspace' && day.length === 0 && monthRef.current) {
                        monthRef.current.focus();
                    }
                }}
                placeholder="DD"
                maxLength={2}
                className="bg-transparent font-impact text-2xl text-white outline-none w-11 text-center placeholder-zinc-700"
            />
            <span className="font-impact text-2xl text-white mx-[2px]">-</span>
            {/* Month field */}
            <input
                ref={monthRef}
                type="text"
                value={month}
                onChange={(e) => {
                    const num = e.target.value.replace(/[^0-9]/g, '').slice(0, 2);
                    onChange(`${day}-${num}-${year}`);
                    // Auto-focus to year when month is filled
                    if (num.length === 2 && yearRef.current) {
                        yearRef.current.focus();
                    }
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Backspace' && month.length === 0 && dayRef.current) {
                        dayRef.current.focus();
                    }
                }}
                placeholder="MM"
                maxLength={2}
                className="bg-transparent font-impact text-2xl text-white outline-none w-11 text-center placeholder-zinc-700"
            />
            <span className="font-impact text-2xl text-white mr-2">-</span>
            {/* Year field */}
            <input
                ref={yearRef}
                type="text"
                value={year}
                onChange={(e) => {
                    const num = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                    onChange(`${day}-${month}-${num}`);
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Backspace' && year.length === 0 && monthRef.current) {
                        monthRef.current.focus();
                    }
                }}
                placeholder="YYYY"
                maxLength={4}
                className="bg-transparent font-impact text-2xl text-white outline-none w-16 placeholder-zinc-700"
            />
            {error && <span key={`date-${triggerKey}`} className="absolute -bottom-5 left-0 font-mono text-sm text-red-500 font-bold animate-vibrate">{error}</span>}
        </div>
    );
};

export default DateInput;
