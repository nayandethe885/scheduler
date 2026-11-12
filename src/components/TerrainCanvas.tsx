'use client';

import React, { useEffect, useRef } from 'react';
import { useTheme } from '@/context/ThemeContext';

interface TerrainCanvasProps {
  className?: string;
}

export default function TerrainCanvas({ className = '' }: TerrainCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener('resize', handleResize);

    // Wave parameters for topographic simulation
    let time = 0;
    const linesCount = 7;
    const mouse = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2 };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      time += 0.012;
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      ctx.clearRect(0, 0, width, height);

      const isDark = document.documentElement.classList.contains('dark');
      const baseAlpha = isDark ? 0.18 : 0.12;

      // Draw multiple contour lines
      for (let i = 0; i < linesCount; i++) {
        const lineOffset = (i / linesCount) * height * 0.85 + height * 0.1;
        const freq = 0.003 + i * 0.0008;
        const amp = 18 + i * 6;

        ctx.beginPath();
        // Burnt orange highlight on center contour, subtle stone gray on others
        if (i === 2) {
          ctx.strokeStyle = `rgba(217, 83, 38, ${baseAlpha * 1.8})`;
          ctx.lineWidth = 1.6;
        } else {
          ctx.strokeStyle = isDark
            ? `rgba(244, 243, 239, ${baseAlpha * (0.6 + (i % 2) * 0.4)})`
            : `rgba(20, 21, 20, ${baseAlpha * (0.6 + (i % 2) * 0.4)})`;
          ctx.lineWidth = 1.0;
        }

        for (let x = 0; x <= width; x += 8) {
          // Distance to mouse gives interactive terrain deformation
          const distToMouse = Math.hypot(x - mouse.x, lineOffset - mouse.y);
          const mouseDeflection = Math.max(0, 1 - distToMouse / 220) * 22;

          const y =
            lineOffset +
            Math.sin(x * freq + time + i * 0.8) * amp +
            Math.cos(x * freq * 0.5 - time * 0.7) * (amp * 0.4) -
            mouseDeflection;

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();

        // Subtle topographic elevation tick tags
        if (i % 2 === 0 && width > 400) {
          const tickX = ((i * 120 + time * 30) % (width - 100)) + 50;
          const tickY = lineOffset + Math.sin(tickX * freq + time + i * 0.8) * amp;
          ctx.fillStyle = isDark ? 'rgba(244, 243, 239, 0.3)' : 'rgba(20, 21, 20, 0.3)';
          ctx.font = '9px monospace';
          ctx.fillText(`+${5100 + i * 40}FT`, tickX, tickY - 4);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
    />
  );
}

