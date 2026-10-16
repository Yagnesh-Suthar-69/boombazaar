'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  decay: number;
}

export default function FireworksCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Check user preference for reduced motion for accessibility
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles: Particle[] = [];
    interface Ember {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      alpha: number;
      pulse: number;
    }
    const embers: Ember[] = [];

    // Create 18 subtle ambient drifting golden embers
    for (let i = 0; i < 18; i++) {
      embers.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 0.8 + Math.random() * 1.6,
        speedY: 0.2 + Math.random() * 0.4,
        speedX: (Math.random() - 0.5) * 0.3,
        alpha: 0.2 + Math.random() * 0.4,
        pulse: Math.random() * Math.PI,
      });
    }

    const colors = [
      'rgba(234, 88, 12, ',  // Flame orange
      'rgba(217, 119, 6, ',  // Sparkler gold
      'rgba(245, 158, 11, ', // Radiant amber
      'rgba(225, 29, 72, ',  // Rose red
      'rgba(239, 68, 68, ',  // Firecracker vermilion
      'rgba(16, 185, 129, ', // Emerald green
    ];

    const createBurst = (originX: number, originY: number, isUserClick = false) => {
      const particleCount = isUserClick ? 18 + Math.floor(Math.random() * 12) : 22 + Math.floor(Math.random() * 14);
      const baseColor = colors[Math.floor(Math.random() * colors.length)];
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
        const speed = (isUserClick ? 1.8 : 1.4) + Math.random() * (isUserClick ? 2.8 : 2.2);
        particles.push({
          x: originX,
          y: originY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: 1.2 + Math.random() * 1.5,
          color: baseColor,
          alpha: 0.75,
          decay: 0.012 + Math.random() * 0.01,
        });
      }
    };

    // User click spark interaction
    const handleClick = (e: MouseEvent) => {
      createBurst(e.clientX, e.clientY, true);
    };
    window.addEventListener('click', handleClick);

    // Custom celebration event listener
    const handleCustomSparkle = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && typeof customEvent.detail.x === 'number') {
        createBurst(customEvent.detail.x, customEvent.detail.y, true);
      }
    };
    window.addEventListener('boom:sparkle', handleCustomSparkle);

    // Trigger subtle festive sky bursts periodically
    let burstInterval: NodeJS.Timeout;
    const launchRandomBurst = () => {
      const x = width * 0.15 + Math.random() * (width * 0.7);
      const y = height * 0.08 + Math.random() * (height * 0.35);
      createBurst(x, y);
    };

    launchRandomBurst();
    burstInterval = setInterval(launchRandomBurst, 3200);

    let animationFrameId: number;
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render gentle floating embers
      for (const emb of embers) {
        emb.y -= emb.speedY;
        emb.x += emb.speedX;
        emb.pulse += 0.02;
        const currentAlpha = Math.max(0.08, emb.alpha + Math.sin(emb.pulse) * 0.15);

        if (emb.y < -10) {
          emb.y = height + 10;
          emb.x = Math.random() * width;
        }

        ctx.beginPath();
        ctx.arc(emb.x, emb.y, emb.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245, 158, 11, ${currentAlpha})`;
        ctx.shadowBlur = 3;
        ctx.shadowColor = 'rgba(245, 158, 11, 0.4)';
        ctx.fill();
      }

      // Render burst particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.04; // gentle gravity
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.shadowBlur = 6;
        ctx.shadowColor = `${p.color}0.6)`;
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('boom:sparkle', handleCustomSparkle);
      clearInterval(burstInterval);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 opacity-70"
    />
  );
}
