'use client';

import { useEffect, useRef } from 'react';

export interface SparklineProps {
  /** Recent prices, oldest → newest. */
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}

/**
 * Sparkline — minimal canvas-rendered mini-chart.
 *
 * - Auto-scales to the data range.
 * - Draws a single polyline; never redraws if data is unchanged.
 * - Uses devicePixelRatio for crisp rendering on retina displays.
 *
 * SPEC.md §10 calls for canvas-based charting for performance; a custom
 * sparkline avoids pulling in a heavy library for tiny per-row charts.
 */
export function Sparkline({
  data,
  width = 80,
  height = 24,
  color = '#209dd7',
}: SparklineProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    if (data.length < 2) {
      // Nothing to plot yet — render a flat baseline so the cell doesn't look empty.
      ctx.strokeStyle = '#3a3f4b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
      return;
    }

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const stepX = width / (data.length - 1);

    ctx.strokeStyle = color;
    ctx.lineWidth = 1.25;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    data.forEach((value, i) => {
      const x = i * stepX;
      const y = height - ((value - min) / range) * height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }, [data, width, height, color]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label="price sparkline"
      data-testid="sparkline"
    />
  );
}