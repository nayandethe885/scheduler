'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface SpotlightAreaProps {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  spotlightSize?: number;
}

export default function SpotlightArea({
  children,
  className = '',
  spotlightColor = 'rgba(217, 83, 38, 0.25)',
  spotlightSize = 380,
}: SpotlightAreaProps) {
  const areaRef = useRef<HTMLDivElement | null>(null);
  const lightRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const area = areaRef.current;
    const light = lightRef.current;
    if (!area || !light) return;

    if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      // Direct offset calculation relative to area container
      const rect = area.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // GSAP smooth follow with duration: 0.2
      gsap.to(light, {
        left: x,
        top: y,
        opacity: 1,
        duration: 0.2,
        ease: 'power2.out',
      });
    };

    const handleMouseLeave = () => {
      gsap.to(light, {
        opacity: 0,
        duration: 0.35,
        ease: 'power2.in',
      });
    };

    area.addEventListener('mousemove', handleMouseMove);
    area.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      area.removeEventListener('mousemove', handleMouseMove);
      area.removeEventListener('mouseleave', handleMouseLeave);
      gsap.killTweensOf(light);
    };
  }, []);

  return (
    <div ref={areaRef} className={`relative overflow-hidden ${className}`}>
      {/* Interactive GSAP Spotlight Light */}
      <div
        ref={lightRef}
        className="pointer-events-none absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl opacity-0 transition-opacity duration-200 z-1"
        style={{
          width: `${spotlightSize}px`,
          height: `${spotlightSize}px`,
          background: `radial-gradient(circle, ${spotlightColor} 0%, rgba(217, 83, 38, 0.06) 50%, transparent 75%)`,
        }}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}

