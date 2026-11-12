'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function AestheticSpotlight() {
  const lightRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const light = lightRef.current;
    if (!light) return;

    // Skip on touch devices where there is no cursor
    if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      // GSAP smooth cursor follow with 0.2s duration as requested
      gsap.to(light, {
        left: e.clientX,
        top: e.clientY,
        duration: 0.2,
        ease: 'power2.out',
        opacity: 1,
      });
    };

    const handleMouseLeave = () => {
      gsap.to(light, {
        opacity: 0,
        duration: 0.4,
        ease: 'power2.in',
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      gsap.killTweensOf(light);
    };
  }, []);

  return (
    <div
      ref={lightRef}
      className="pointer-events-none fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full z-10 opacity-0 blur-3xl transition-opacity duration-200"
      style={{
        background:
          'radial-gradient(circle, rgba(217, 83, 38, 0.18) 0%, rgba(217, 83, 38, 0.07) 35%, rgba(217, 83, 38, 0.015) 60%, transparent 80%)',
      }}
      aria-hidden="true"
    />
  );
}

