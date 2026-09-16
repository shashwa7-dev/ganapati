"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number; y: number; vx: number; vy: number;
  r: number; rot: number; vr: number;
  kind: "marigold" | "petal" | "leaf";
  color: string;
};

const COUNT = 340;

/** Reads a colour token off the root so the canvas paints with the same palette as the page. */
function token(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/**
 * A short shower of marigolds, petals and mango leaves, drawn on a canvas
 * over everything and gone in a few seconds. Skipped under reduced motion.
 */
export function Confetti({ duration = 3400 }: { duration?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const colors = {
      turmeric: token("--color-turmeric"),
      terracotta: token("--color-terracotta"),
      sindoor: token("--color-sindoor"),
      leaf: token("--color-leaf"),
      ink: token("--color-umber"),
    };

    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const size = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    window.addEventListener("resize", size);

    const particles: Particle[] = Array.from({ length: COUNT }, () => {
      const roll = Math.random();
      const kind: Particle["kind"] = roll < 0.55 ? "marigold" : roll < 0.85 ? "petal" : "leaf";
      const color =
        kind === "leaf" ? colors.leaf : Math.random() < 0.6 ? colors.turmeric : Math.random() < 0.5 ? colors.terracotta : colors.sindoor;
      return {
        x: Math.random() * w,
        y: -20 - Math.random() * h * 0.35,
        vx: (Math.random() - 0.5) * 2.4,
        vy: 3.5 + Math.random() * 4.5,
        r: kind === "marigold" ? 3 + Math.random() * 4 : 4 + Math.random() * 4,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.25,
        kind,
        color,
      };
    });

    const start = performance.now();
    let last = start;
    let raf = 0;

    const draw = (now: number) => {
      const t = now - start;
      // Frame-rate independent: velocities are per 60Hz frame.
      const dt = Math.min(3, (now - last) / (1000 / 60));
      last = now;
      const fade = t > duration - 600 ? Math.max(0, (duration - t) / 600) : 1;
      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = fade;
      for (const p of particles) {
        if (p.y > h + 20) continue;
        p.x += (p.vx + Math.sin((t + p.r * 100) / 400) * 0.4) * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.strokeStyle = colors.ink;
        ctx.lineWidth = 1;
        ctx.beginPath();
        if (p.kind === "marigold") {
          ctx.arc(0, 0, p.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(0, 0, p.r * 0.45, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          ctx.ellipse(0, 0, p.r * 0.45, p.r, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
        ctx.restore();
      }
      if (t < duration) raf = requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, w, h);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", size);
    };
  }, [duration]);

  return <canvas ref={ref} className="sk-confetti" aria-hidden="true" />;
}
