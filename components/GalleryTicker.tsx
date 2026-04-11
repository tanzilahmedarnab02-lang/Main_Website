import React from 'react';
import { motion } from 'framer-motion';
import { ServiceItem } from '../types';
import { SERVICES as servicesData } from '../constants';

interface GalleryTickerProps {
  onHover: (item: ServiceItem) => void;
  activeId: string;
}

const GalleryTicker: React.FC<GalleryTickerProps> = ({ onHover, activeId }) => {
  return (
    <div className="fixed bottom-0 left-0 w-full z-30 overflow-hidden bg-black/80 backdrop-blur-xl border-t border-white/10">
      <div className="flex whitespace-nowrap py-3 px-8 overflow-x-auto no-scrollbar scroll-smooth">
        {servicesData.map((service) => (
          <motion.div
            key={service.id}
            onMouseEnter={() => onHover(service)}
            className={`flex-none w-[240px] md:w-[300px] mr-6 cursor-pointer transition-all duration-500 group ${activeId === service.id ? 'opacity-100' : 'opacity-40 grayscale hover:grayscale-0 hover:opacity-80'}`}
          >
            <div className="relative h-[50px] overflow-hidden bg-zinc-900/50 flex items-center gap-4 rounded-sm border border-white/5">
              <div className="w-12 h-full flex-none overflow-hidden bg-zinc-800">
                <img src={service.image} alt={service.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <h4 className="font-impact text-xs md:text-sm tracking-widest text-white leading-none mb-1 truncate">{service.title}</h4>
                <p className="text-[9px] font-mono text-zinc-500 tracking-tighter uppercase">{service.category}</p>
              </div>
              <div className="absolute bottom-0 left-0 h-[1.5px] bg-[#E0A9C5] transition-all duration-500" style={{ width: activeId === service.id ? '100%' : '0%' }} />
            </div>
          </motion.div>
        ))}
      </div>
      <div className="px-4 md:px-8 pb-1.5 flex justify-between items-center text-[7px] md:text-[8px] font-mono text-zinc-500 uppercase tracking-widest border-t border-white/5 pt-1 bg-black/20">
        <div className="flex gap-2 md:gap-4">
          <span>PROJECT: PARLOUR-OS</span>
          <span className="text-[#E0A9C5]/60">V.1.02</span>
        </div>
        <div className="flex gap-2 md:gap-4">
          <span className="text-[#E0A9C5] animate-pulse font-bold">● REC</span>
          <span className="hidden sm:inline">Buffer: 100%</span>
        </div>
        <div className="hidden lg:block">
          FREQ: 48KHZ // BITRATE: 24-BIT
        </div>
      </div>
    </div>
  );
};

export default GalleryTicker;