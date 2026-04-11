import React, { useState, useRef } from 'react';

const SimpleCalendar = ({ onSelect, selectedDate }: { onSelect: (date: Date) => void, selectedDate: Date | null }) => {
    const [currentDate, setCurrentDate] = useState(selectedDate || new Date());
    const [view, setView] = useState<'calendar' | 'picker'>('calendar');
    const backupDateRef = useRef<Date>(new Date());

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const padding = Array.from({ length: firstDay }, (_, i) => i);

    const monthNames = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
    const years = Array.from({ length: 15 }, (_, i) => new Date().getFullYear() + i);

    const openPicker = () => {
        backupDateRef.current = new Date(currentDate);
        setView('picker');
    };

    const handleCancel = () => {
        setCurrentDate(backupDateRef.current);
        setView('calendar');
    };

    return (
        <div className="w-full bg-gradient-to-br from-[#E0A9C5]/30 to-white/5 backdrop-blur-2xl text-white px-6 pt-4 pb-6 flex flex-col h-auto max-h-[400px] border border-white/20 shadow-2xl rounded-[2rem] overflow-hidden">
            <div className="flex justify-between items-center mb-2 border-b border-white/20 pb-2">
                <button onClick={() => { if (view === 'picker') return; setCurrentDate(new Date(new Date(currentDate).setMonth(currentDate.getMonth() - 1))) }} className={`text-xl font-bold hover:text-black px-2 transition-opacity ${view === 'picker' ? 'opacity-0 pointer-events-none' : ''}`}>&lt;</button>
                <button onClick={() => view === 'calendar' ? openPicker() : null} className={`font-impact text-xl tracking-widest hover:text-black transition-colors border-b border-dashed ${view === 'picker' ? 'border-black text-black cursor-default' : 'border-white/30 cursor-pointer'}`}>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</button>
                <button onClick={() => { if (view === 'picker') return; setCurrentDate(new Date(new Date(currentDate).setMonth(currentDate.getMonth() + 1))) }} className={`text-xl font-bold hover:text-black px-2 transition-opacity ${view === 'picker' ? 'opacity-0 pointer-events-none' : ''}`}>&gt;</button>
            </div>
            {view === 'calendar' ? (
                <>
                    <div className="grid grid-cols-7 gap-2 text-center font-mono text-[10px] mb-2">{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <span key={d} className="text-white/60">{d}</span>)}</div>
                    <div className="grid grid-cols-7 gap-2">
                        {padding.map(i => <div key={`pad-${i}`} />)}
                        {days.map(d => {
                            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), d);
                            const isSelected = selectedDate && selectedDate.toDateString() === date.toDateString();
                            const isToday = new Date().toDateString() === date.toDateString();
                            return (
                                <button key={d} onClick={() => onSelect(date)} className={`aspect-square flex items-center justify-center font-mono text-sm border transition-all duration-300 ${isSelected ? 'bg-white border-white text-[#E0A9C5] scale-110 font-bold' : 'border-white/10 hover:border-white text-white bg-black/20 hover:bg-black/40'} ${!isSelected && isToday ? 'underline decoration-[#E0A9C5] underline-offset-4 font-bold' : ''}`}>{d}</button>
                            )
                        })}
                    </div>

                </>
            ) : (
                <div className="flex flex-col h-full overflow-hidden">
                    <div className="flex flex-1 gap-4 overflow-hidden min-h-0 flex-row">
                        <div className="flex-1 overflow-y-auto border-r border-white/20 pr-2">
                            {monthNames.map((m, i) => (
                                <div key={m} onClick={() => { const d = new Date(currentDate); d.setMonth(i); setCurrentDate(d); }} className={`py-3 px-2 font-mono text-xs cursor-pointer hover:text-black mb-1 text-center border border-transparent ${i === currentDate.getMonth() ? 'text-white font-bold border-white/20 bg-white/10' : 'text-white/60'}`}>{m}</div>
                            ))}
                        </div>
                        <div className="flex-1 overflow-y-auto pl-2">
                            {years.map((y) => (
                                <div key={y} onClick={() => { const d = new Date(currentDate); d.setFullYear(y); setCurrentDate(d); }} className={`py-3 px-2 font-mono text-xs cursor-pointer hover:text-black mb-1 text-center border border-transparent ${y === currentDate.getFullYear() ? 'text-white font-bold border-white/20 bg-white/10' : 'text-white/60'}`}>{y}</div>
                            ))}
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between">
                        <button onClick={handleCancel} className="px-4 py-2 font-mono text-[10px] text-white/60 hover:text-white uppercase tracking-widest">[ CANCEL ]</button>
                        <button onClick={() => setView('calendar')} className="px-4 py-2 font-mono text-[10px] text-[#E0A9C5] bg-white hover:bg-black hover:text-white uppercase tracking-widest font-bold">OK</button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default SimpleCalendar;
