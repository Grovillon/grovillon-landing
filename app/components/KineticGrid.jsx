'use client';

import { useEffect, useRef } from 'react';

// The hero's crease map drawn as monochrome hairlines, at half the hero's
// scale: zigzag creases whose segments run at the page's 30-degree angle, the
// lines LightField's relief draws. They bend around the pointer like a surface
// pressed by the hand, and a click or a tap sends a pulse of light across them,
// the surface itself staying still; the hero's lamp travels with the pointer.
// A swipe is left to scroll the page, and the creases fall quiet behind the words.
//
// Built from the brief's description of the KineticGrid component, whose source
// was not supplied. It mounts the same way as LightField (a canvas behind its
// host's content, events read from the host), so the original component can
// take its place for a side-by-side.

// Creases every CREASE px; each segment spans FOLD px at 30 degrees, with the
// relief's proportions (cell 0.42 x 0.5). The CSS fallback tile matches exactly.
const FOLD = 128;
const CREASE = 152;
const OFFSET = 20;
const SLOPE = Math.tan(Math.PI / 6);
const SUB = 6; // samples per segment while the surface bends, so creases curve instead of kinking
const BEND = 22; // px the creases move on the ring of greatest bend
const REACH = 160; // px from the pointer to that ring
// A pulse crosses about 60% of the band's width a second, between these bounds,
// so on a phone it stays in view as long as it lasts.
const RIPPLE_SPEED = [340, 900]; // px/s
const RIPPLE_LIFE = 1.5; // s
const RIPPLE_WIDTH = 60; // px: the half-width of the pulse's lit band
const CREST = 0.75; // alpha of the lamp-coloured light along the pulse's front
const RIPPLES = 3;
const RETIRE = 150; // ms for a pulse displaced by a newer one to fade out
const TAP_SLOP = 10; // px a finger may move and still count as a tap
const LAMP_REACH = 280; // px
const SPRING = [170, 26];
const INK = '236, 235, 231';
const LAMP = '240, 230, 214';

export default function KineticGrid({ className }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return undefined;
    // Reduced motion keeps the still CSS crease map: no bending, no ripples.
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduceMotion.matches) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    let width = 0;
    let height = 0;
    let dpr = 1;
    // The lamp rests upper right, as in the hero, and the pointer takes it.
    const lamp = { x: 0, y: 0, vx: 0, vy: 0, load: 0, vl: 0 };
    const aim = { x: 0, y: 0, load: 0 };
    const ripples = [];
    let entered = false;
    let visible = false;
    let stopped = false;
    let raf = 0;
    let last = 0;
    let shown = false;
    let tap = null;
    let speed = RIPPLE_SPEED[1];
    // Where the words are, so the creases fall quiet behind them.
    let quiet = [];
    const measureQuiet = () => {
      const base = host.getBoundingClientRect();
      const range = document.createRange();
      quiet = Array.from(host.querySelectorAll('h2, .t-body, .passage-line')).map((el) => {
        range.selectNodeContents(el);
        const r = range.getBoundingClientRect();
        return [r.left - base.left, r.top - base.top, r.width, r.height];
      });
    };

    const rest = () => {
      aim.x = width * 0.78;
      aim.y = Math.min(height * 0.3, 320);
      aim.load = 0;
    };

    const resize = () => {
      const rect = host.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      width = rect.width;
      height = rect.height;
      speed = Math.min(Math.max(0.62 * width, RIPPLE_SPEED[0]), RIPPLE_SPEED[1]);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      if (!aim.load) rest();
      if (!last) {
        lamp.x = aim.x;
        lamp.y = aim.y;
      }
    };

    // The crease map as one path. Crease k rests at y = k CREASE + OFFSET + zig(x);
    // every point is moved by the pointer's load.
    const path = () => {
      const sigma2 = 2 * REACH * REACH;
      const load = lamp.load > 0.001 ? lamp.load : 0;
      const step = FOLD / (load ? SUB : 1);
      const at = [0, 0];
      const place = (bx, by) => {
        let x = bx;
        let y = by;
        if (load) {
          const dx = bx - lamp.x;
          const dy = by - lamp.y;
          // Zero under the pointer, greatest on a ring REACH away, gone beyond.
          const push = (load * BEND * Math.exp(0.5 - (dx * dx + dy * dy) / sigma2)) / REACH;
          x += dx * push;
          y += dy * push;
        }
        at[0] = x;
        at[1] = y;
      };
      const p = new Path2D();
      // Start and end two folds outside the canvas, so a bend never shows a line's end.
      const count = Math.ceil((width + 4 * FOLD) / step);
      for (let base = OFFSET - CREASE; base < height + CREASE; base += CREASE) {
        for (let i = 0; i <= count; i++) {
          const bx = i * step - 2 * FOLD;
          const m = bx - 2 * FOLD * Math.floor(bx / (2 * FOLD));
          place(bx, base + (m < FOLD ? m : 2 * FOLD - m) * SLOPE);
          if (i) p.lineTo(at[0], at[1]);
          else p.moveTo(at[0], at[1]);
        }
      }
      return p;
    };

    const draw = (now) => {
      const lattice = path();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const line = dpr > 1.5 ? 0.75 : 1;
      ctx.lineWidth = line;
      const glow = ctx.createRadialGradient(lamp.x, lamp.y, 0, lamp.x, lamp.y, LAMP_REACH * (1 + 0.4 * lamp.load));
      glow.addColorStop(0, `rgba(${LAMP}, ${0.4 + 0.35 * lamp.load})`);
      glow.addColorStop(0.45, `rgba(${INK}, ${0.2 + 0.1 * lamp.load})`);
      glow.addColorStop(1, `rgba(${INK}, 0.12)`);
      ctx.strokeStyle = glow;
      ctx.stroke(lattice);
      // Each pulse is the lamp's light running out across the creases; its stroke
      // is clipped to the ring's bounds so a pulse costs only the area it covers.
      for (const r of ripples) {
        const age = (now - r.start) / 1000;
        const front = speed * age;
        // Fades out over the pulse's life, reaching nothing as it ends, or over
        // RETIRE ms once a newer pulse has displaced it.
        const retiring = r.retire ? Math.max(1 - (now - r.retire) / RETIRE, 0) : 1;
        const fade = Math.max(1 - age / RIPPLE_LIFE, 0) ** 1.35 * retiring;
        const inner = Math.max(front - RIPPLE_WIDTH, 0);
        const outer = front + RIPPLE_WIDTH;
        const ring = ctx.createRadialGradient(r.x, r.y, inner, r.x, r.y, outer);
        ring.addColorStop(0, `rgba(${LAMP}, 0)`);
        ring.addColorStop(Math.min((front - inner) / (outer - inner), 1), `rgba(${LAMP}, ${CREST * fade})`);
        ring.addColorStop(1, `rgba(${LAMP}, 0)`);
        ctx.save();
        ctx.beginPath();
        ctx.rect(r.x - outer, r.y - outer, 2 * outer, 2 * outer);
        ctx.clip();
        ctx.strokeStyle = ring;
        ctx.lineWidth = 1.25 * line;
        ctx.stroke(lattice);
        ctx.restore();
      }
      // The creases fall quiet behind the words, with a soft edge; less so on a
      // phone, where the words cover most of the band.
      ctx.globalCompositeOperation = 'destination-out';
      const narrow = width < 720;
      ctx.fillStyle = `rgba(0, 0, 0, ${narrow ? 0.4 : 0.25})`;
      const pads = narrow ? [12, 6] : [14, 9, 4];
      for (const [x, y, w, h] of quiet) {
        for (const pad of pads) ctx.fillRect(x - pad, y - pad, w + 2 * pad, h + 2 * pad);
      }
      ctx.globalCompositeOperation = 'source-over';
      if (!shown) {
        shown = true;
        host.dataset.grid = 'on';
      }
    };

    const step = (now) => {
      raf = 0;
      const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
      last = now;
      const [k, c] = SPRING;
      lamp.vx += (-k * (lamp.x - aim.x) - c * lamp.vx) * dt;
      lamp.vy += (-k * (lamp.y - aim.y) - c * lamp.vy) * dt;
      lamp.vl += (-k * (lamp.load - aim.load) - c * lamp.vl) * dt;
      lamp.x += lamp.vx * dt;
      lamp.y += lamp.vy * dt;
      lamp.load += lamp.vl * dt;
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        if ((now - r.start) / 1000 > RIPPLE_LIFE || (r.retire && now - r.retire > RETIRE)) ripples.splice(i, 1);
      }
      const settled =
        Math.abs(lamp.x - aim.x) + Math.abs(lamp.y - aim.y) < 0.05 &&
        Math.abs(lamp.vx) + Math.abs(lamp.vy) < 0.05 &&
        Math.abs(lamp.load - aim.load) < 1e-3 &&
        Math.abs(lamp.vl) < 1e-3;
      if (settled) {
        lamp.x = aim.x;
        lamp.y = aim.y;
        lamp.load = aim.load;
        lamp.vx = lamp.vy = lamp.vl = 0;
      }
      draw(now);
      if ((!settled || ripples.length) && visible && !document.hidden) raf = requestAnimationFrame(step);
      else last = 0;
    };

    const kick = () => {
      if (!raf && !stopped && visible && !document.hidden) raf = requestAnimationFrame(step);
    };

    const local = (event) => {
      const rect = host.getBoundingClientRect();
      return [event.clientX - rect.left, event.clientY - rect.top];
    };

    const ripple = (x, y) => {
      const now = performance.now();
      ripples.push({ x, y, start: now, retire: 0 });
      // Past the limit, the oldest live pulse fades out rather than vanishing.
      const live = ripples.filter((r) => !r.retire);
      if (live.length > RIPPLES) live[0].retire = now;
      kick();
    };

    // Only a mouse or pen bends the surface; on touch the finger is scrolling.
    const onMove = (event) => {
      if (event.pointerType === 'touch') return;
      [aim.x, aim.y] = local(event);
      aim.load = 1;
      entered = true;
      kick();
    };

    // A click pulses at once. A touch pulses on release, and only if it stayed
    // put and the browser never took it for a scroll.
    const onDown = (event) => {
      if (event.button > 0) return;
      entered = true;
      // Pressing on the words selects them; it does not pulse.
      if (event.pointerType !== 'touch' && event.target.closest?.('h2, p')) return;
      if (event.pointerType === 'touch') {
        tap = { id: event.pointerId, x: event.clientX, y: event.clientY };
        return;
      }
      ripple(...local(event));
    };

    const onUp = (event) => {
      if (event.pointerType !== 'touch' || !tap || tap.id !== event.pointerId) return;
      const still = Math.hypot(event.clientX - tap.x, event.clientY - tap.y) <= TAP_SLOP;
      tap = null;
      if (still) ripple(...local(event));
    };

    // Scrolling takes over, or the pointer leaves: the surface relaxes.
    const onRelease = (event) => {
      if (event.pointerType === 'touch') {
        tap = null;
        return;
      }
      rest();
      kick();
    };

    // Reduced motion switched on mid-visit: stop, and hand back to the still crease map.
    const onReduce = () => {
      if (!reduceMotion.matches) return;
      stopped = true;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      ripples.length = 0;
      delete host.dataset.grid;
    };

    // The first time the heading is well into view, the resting lamp sends one
    // pulse out across the creases, from open space beside the words.
    const heading = host.querySelector('h2');
    const entryObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        entryObserver.disconnect();
        if (entered) return;
        ripple(lamp.x, lamp.y);
      },
      { rootMargin: '0px 0px -50% 0px' }
    );

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !shown && !stopped) draw(performance.now());
      kick();
    });

    const onVisibility = () => {
      if (!document.hidden) kick();
    };

    const resizeObserver = new ResizeObserver(() => {
      resize();
      measureQuiet();
      if (visible && !stopped) draw(performance.now());
    });
    // Web fonts can rewrap the words after the first measure.
    document.fonts?.ready.then(() => {
      if (stopped) return;
      measureQuiet();
      if (visible) draw(performance.now());
    });

    resize();
    measureQuiet();
    rest();
    lamp.x = aim.x;
    lamp.y = aim.y;
    resizeObserver.observe(host);
    visibilityObserver.observe(host);
    if (heading) entryObserver.observe(heading);
    host.addEventListener('pointermove', onMove, { passive: true });
    host.addEventListener('pointerdown', onDown, { passive: true });
    host.addEventListener('pointerup', onUp, { passive: true });
    host.addEventListener('pointercancel', onRelease);
    host.addEventListener('pointerleave', onRelease);
    document.addEventListener('visibilitychange', onVisibility);
    reduceMotion.addEventListener('change', onReduce);

    return () => {
      stopped = true;
      if (raf) cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      entryObserver.disconnect();
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerdown', onDown);
      host.removeEventListener('pointerup', onUp);
      host.removeEventListener('pointercancel', onRelease);
      host.removeEventListener('pointerleave', onRelease);
      document.removeEventListener('visibilitychange', onVisibility);
      reduceMotion.removeEventListener('change', onReduce);
      delete host.dataset.grid;
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
