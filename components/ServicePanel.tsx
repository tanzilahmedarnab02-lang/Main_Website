import React from 'react';
import { ServiceItem } from '../services/contentService';

const ServicePanel = ({ services, onToggle, selectedIds, onClose }: { services: ServiceItem[], onToggle: (id: string) => void, selectedIds: string[], onClose?: () => void }) => {
    const [activeCategory, setActiveCategory] = React.useState('ALL');
    const categories = ['ALL', ...Array.from(new Set(services.map(s => s.category)))];

    // Access Lenis from window or find it globally
    const stopLenisScroll = () => {
        const lenis = (window as any).__lenis;
        if (lenis) lenis.stop();
    };

    const startLenisScroll = () => {
        const lenis = (window as any).__lenis;
        if (lenis) lenis.start();
    };

    return (
        <div
            className="w-full h-[70vh] md:h-[80vh] min-h-[500px] bg-gradient-to-br from-[#E0A9C5]/30 to-white/5 backdrop-blur-3xl text-white flex flex-col border border-white/20 shadow-2xl overflow-hidden relative rounded-[2rem]"
            onMouseEnter={() => { document.body.style.overflow = 'hidden'; stopLenisScroll(); }}
            onMouseLeave={() => { document.body.style.overflow = ''; startLenisScroll(); }}
            onWheel={(e) => { e.stopPropagation(); e.preventDefault(); }}
        >
            {/* Close Button */}
            {onClose && (
                <button
                    onClick={(e) => { e.stopPropagation(); onClose(); }}
                    className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center bg-black/30 hover:bg-black/50 text-white font-bold text-lg border border-white/30 hover:border-white transition-all rounded-full"
                >
                    ✕
                </button>
            )}
            {/* Category Filter Header */}
            <div className="flex-none p-4 border-b border-white/10 bg-white/5">
                <div className="flex flex-wrap gap-3">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`font-impact text-sm uppercase tracking-widest transition-colors px-2 py-1 ${activeCategory === cat ? 'text-white bg-black/20 border border-white' : 'text-white/50 hover:text-white border border-transparent hover:border-white/20'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Scrollable Services List with Custom Scrollbar */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-custom" style={{ scrollbarWidth: 'thin', scrollbarColor: 'white transparent' }}>
                <style>{`
          .scrollbar-custom::-webkit-scrollbar {
            width: 10px;
          }
          .scrollbar-custom::-webkit-scrollbar-track {
            background: rgba(255,255,255,0.2);
            border-radius: 5px;
          }
          .scrollbar-custom::-webkit-scrollbar-thumb {
            background: white;
            border-radius: 5px;
          }
          .scrollbar-custom::-webkit-scrollbar-thumb:hover {
            background: white;
          }
          .scrollbar-custom::-webkit-scrollbar-thumb:active {
            background: white;
          }
        `}</style>
                <div className="space-y-1">
                    {services
                        .filter(s => activeCategory === 'ALL' || s.category === activeCategory)
                        .map((s) => (
                            <div
                                key={s.id}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggle(s.id!);
                                }}
                                onMouseDown={(e) => e.stopPropagation()}
                                onTouchStart={(e) => e.stopPropagation()}
                                className={`cursor-pointer group flex justify-between items-center p-2 md:p-4 transition-all duration-300 border-l-4 mb-1 select-none ${selectedIds.includes(s.id!) ? 'bg-black/30 border-white' : 'border-transparent hover:bg-black/10'}`}
                            >
                                <div className="flex items-center gap-2 md:gap-4">
                                    <div className={`w-5 h-5 md:w-6 md:h-6 flex items-center justify-center border transition-colors cursor-pointer pointer-events-none ${selectedIds.includes(s.id!) ? 'border-white bg-white' : 'border-white/40'}`}>
                                        {selectedIds.includes(s.id!) && <span className="text-black font-bold text-[10px]">✓</span>}
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-1 md:gap-2 mb-0.5">
                                            <span className={`font-impact text-lg md:text-xl uppercase leading-none tracking-wider ${selectedIds.includes(s.id!) ? 'text-white' : 'text-white/80 group-hover:text-white'}`}>{s.title}</span>
                                            {activeCategory === 'ALL' && <span className="font-mono text-[6px] md:text-[8px] text-white/40 uppercase bg-black/20 px-1 rounded">{s.category}</span>}
                                        </div>
                                        <span className="font-mono text-[12px] md:text-[14px] text-white/60 uppercase">{s.duration ? `DURATION: ${s.duration}` : ''}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 md:gap-4">
                                    <span className={`font-impact tracking-wide ${selectedIds.includes(s.id!) ? 'text-white' : 'text-white/60'} text-xl md:text-3xl pointer-events-none`}>{s.price}</span>
                                    {selectedIds.includes(s.id!) && (
                                        <div className="w-4 h-4 md:w-5 md:h-5 flex items-center justify-center border border-white text-white font-bold text-[8px] md:text-[10px] pointer-events-none">✕</div>
                                    )}
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    )
}

export default ServicePanel;
