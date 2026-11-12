'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface CompassHUDProps {
  className?: string;
}

export default function CompassHUD({ className = '' }: CompassHUDProps) {
  const [heading, setHeading] = useState(328);

  // Subtle ambient heading drift
  useEffect(() => {
    const interval = setInterval(() => {
      setHeading(prev => {
        const delta = (Math.random() - 0.5) * 4;
        return Math.round((prev + delta + 360) % 360);
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`relative flex items-center gap-3 font-mono ${className}`}>
      {/* Outer Dial Circle with Radar Sweep */}
      <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
        {/* Rotating Radar Sweep Line */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 4.5, ease: 'linear' }}
          className="absolute inset-0 rounded-full border border-dashed border-[#e0ded4] dark:border-[#272926]"
        >
          <div className="w-1/2 h-[1px] bg-gradient-to-r from-transparent to-[#d95326] origin-right absolute top-1/2 right-1/2" />
        </motion.div>

        {/* Outer Ring Ticks */}
        <svg className="w-full h-full transform" viewBox="0 0 48 48">
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.8"
            className="text-[#e0ded4] dark:text-[#272926]"
          />
          {/* North Tick */}
          <line x1="24" y1="4" x2="24" y2="8" stroke="#d95326" strokeWidth="1.5" />
          {/* East Tick */}
          <line x1="44" y1="24" x2="40" y2="24" stroke="currentColor" strokeWidth="1" className="text-[#989a91]" />
          {/* South Tick */}
          <line x1="24" y1="44" x2="24" y2="40" stroke="currentColor" strokeWidth="1" className="text-[#989a91]" />
          {/* West Tick */}
          <line x1="4" y1="24" x2="8" y2="24" stroke="currentColor" strokeWidth="1" className="text-[#989a91]" />
        </svg>

        {/* Center Needle with heading angle */}
        <motion.div
          animate={{ rotate: heading }}
          transition={{ type: 'spring', stiffness: 80, damping: 15 }}
          className="absolute w-6 h-6 flex items-center justify-center"
        >
          <div className="w-[2px] h-3 bg-[#d95326] absolute -top-1 rounded-xs" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#141514] dark:bg-[#f4f3ef]" />
        </motion.div>
      </div>

      {/* Telemetry Readout */}
      <div className="space-y-0.5 text-left">
        <div className="text-[11px] font-bold text-[#141514] dark:text-[#f4f3ef] tracking-widest uppercase flex items-center gap-1.5">
          <span className="text-[#d95326]">{heading}° NW</span>
          <span className="text-[9px] text-[#989a91] dark:text-[#5c6057]">// BEARING</span>
        </div>
        <div className="text-[9px] text-[#676961] dark:text-[#9ba096] uppercase tracking-wider">
          AZIMUTH NOMINAL
        </div>
      </div>
    </div>
  );
}

