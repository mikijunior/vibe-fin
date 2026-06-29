"use client";

// SPEC §10: per-ticker sparkline canvas mini-chart. Drawn directly on a
// <canvas> for performance — avoid React renders on every tick. The
// component only re-renders when the *length* or *first/last* price of
// the series changes meaningfully (handled by the parent via memoization).

import { useEffect, useRef } from "react";
import clsx from "clsx";

type SparklineProps = {
  /** Price history, oldest first. */
  prices: ReadonlyArray<number>;
  /** Direction of the most recent move — drives the line color. */
  direction?: "up" | "down" | "flat" | null;
  width?: number;
  height?: number;
  className?: string;
};

const UP_COLOR = "#1f8a3a";
const DOWN_COLOR = "#b62324";
const FLAT_COLOR = "#8b949e";

function draw(
  canvas: HTMLCanvasElement,
  prices: ReadonlyArray<number>,
  direction: "up" | "down" | "flat" | null,
  width: number,
  height: number,
) {
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, width, height);

  if (prices.length < 2) {
    // Render a subtle baseline so the row doesn't feel empty.
    ctx.strokeStyle = FLAT_COLOR;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
    return;
  }

  let min = prices[0];
  let max = prices[0];
  for (const p of prices) {
    if (p < min) min = p;
    if (p > max) max = p;
  }
  const span = max - min || 1;
  const stepX = width / (prices.length - 1);
  const padY = 2;

  ctx.strokeStyle =
    direction === "up"
      ? UP_COLOR
      : direction === "down"
        ? DOWN_COLOR
        : FLAT_COLOR;
  ctx.lineWidth = 1.25;
  ctx.lineJoin = "round";
  ctx.beginPath();
  prices.forEach((p, i) => {
    const x = i * stepX;
    const y = padY + (1 - (p - min) / span) * (height - padY * 2);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
}

export function Sparkline({
  prices,
  direction,
  width = 96,
  height = 28,
  className,
}: SparklineProps) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    draw(canvas, prices, direction ?? null, width, height);
  }, [prices, direction, width, height]);

  return (
    <canvas
      ref={ref}
      role="img"
      aria-label={`Sparkline of recent prices, last ${prices.length} ticks`}
      className={clsx("block", className)}
      style={{ width, height }}
      data-testid="sparkline"
    />
  );
}