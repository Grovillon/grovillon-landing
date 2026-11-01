'use client';

import { useEffect, useRef } from 'react';
import { cancelFrame, requestFrame } from './frameClock';
import { lamps, onLamp } from './pageLamp';

// A square grid of hairlines behind the band, with a dot at every crossing: a
// second skin laid over the ground. Near the pointer the skin gathers toward it,
// the cells around it drawn in like a lens, and the hero's lamp travels with the
// pointer, lighting the lines and dots closest to it. A click or a tap sends a
// ripple out through the skin: a ring that moves the crossings as it passes and
// lights what it crosses. A swipe is left to scroll the page, and the grid falls
// quiet behind the words.
//
// Built from the client's reference for the KineticGrid component (a square grid
// that warps toward the pointer and ripples on every click), whose source was not
// supplied. It mounts the same way as LightField (a canvas behind its host's
// content, events read from the host), so the original component can take its
// place for a side-by-side.

// The cell is the band's --grid-cell, the size of the still CSS grid's tile. Both
// run a vertical line through the band's centre and a horizontal one half a cell
// below its top, so the canvas lands exactly on the still grid it replaces.
const CELL = 54; // px, if the band does not say
const HAIR = 0.5; // px: lines sit on pixel centres
const REACH = 220; // px from the pointer over which the skin gathers toward it
const PINCH = 0.45; // share of the way to the pointer a crossing beside it moves
const SUB = 4; // samples per side while a cell moves, so its sides curve instead of kinking
const DOT = 1.1; // px: a crossing's dot at rest
const DOT_LIT = 0.65; // px a dot grows beside the lamp
const DOT_LIT_REACH = 170; // px
const DOT_CREST = 0.9; // px a dot grows as a ripple's front crosses it
// A ripple crosses about 40% of the band's width a second, between these bounds,
// so on a phone it stays in view as long as it lasts.
const RIPPLE_SPEED = [300, 600]; // px/s
const RIPPLE_LIFE = 1.5; // s
const RIPPLE_WIDTH = 40; // px: the half-width of the ripple's lit band
// Alpha of the lamp-coloured light along the ripple's front: mostly on the dots,
// which trace its circle. Lines run tangent to it for a cell or more; lit as
// strongly, they would square it off.
const CREST = [0.22, 0.7]; // lines, dots
// The ripple moves each crossing outward as its front arrives, then back and
// forth a little as it rings on behind: a wave packet that rises over LEAD px
// ahead of the front and dies away over TRAIL px behind it.
const SWELL = 7; // px, at its start
const WAVE = 100; // px from crest to crest
const LEAD = 24; // px
const TRAIL = 70; // px
const RIPPLES = 3;
const RETIRE = 150; // ms for a ripple displaced by a newer one to fade out
const TAP_SLOP = 10; // px a finger may move and still count as a tap
// The quiet zone around each line of text, outermost step first: px beyond the
// line's box, and how much of the grid's remaining light the step takes. No line
// or dot crosses a word; they fade out over the last 18 px before it.
const QUIET = [
  [18, 0.3],
  [12, 0.43],
  [6, 0.6],
  [2, 1],
];
const LAMP_REACH = 260; // px
const SPRING = [170, 26];
const LINE = 0.05; // alpha of the lines at rest
const NODE = 0.09; // alpha of the dots at rest
const INK = '236, 235, 231';
const LAMP = '240, 230, 214';
const TAU = 2 * Math.PI;

export default function KineticGrid({ className }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return undefined;
    // Reduced motion draws the grid still, lamp at rest: no gathering, no ripples.
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let still = reduceMotion.matches;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    let width = 0;
    let height = 0;
    let dpr = 1;
    // The lamp rests upper right, as in the hero, and the pointer takes it.
    const lamp = { x: 0, y: 0, vx: 0, vy: 0, load: 0, vl: 0 };
    const aim = { x: 0, y: 0, load: 0 };
    // Where the skin gathers: under the pointer from the moment it arrives, then
    // after it on the same spring; when the pointer leaves, the skin relaxes where
    // it was, while the lamp goes back to rest.
    const gather = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0 };
    // The last mouse or pen position over the band, so a scroll under a still
    // pointer keeps the skin gathered where the pointer is.
    const pointer = { inside: false, x: 0, y: 0 };
    const ripples = [];
    let entered = false;
    let visible = false;
    let stopped = false;
    let raf = 0;
    let last = 0;
    let shown = false;
    // Cleared while off screen (a resize): drawn again as it comes back (F32).
    let dirty = false;
    let tap = null;
    let press = null;
    let speed = RIPPLE_SPEED[1];

    // The grid: crossings on a cols x rows lattice, one cell beyond every edge so
    // a gathered edge never shows a line's end. Positions live in typed arrays,
    // rebuilt only when the band changes size.
    let cell = CELL;
    let cols = 0;
    let rows = 0;
    let left = 0;
    let top = 0;
    let nodeX = new Float32Array(0);
    let nodeY = new Float32Array(0);
    let nodeR = new Float32Array(0);
    let nodeMoving = new Uint8Array(0);
    const layout = () => {
      cell = parseFloat(getComputedStyle(host).getPropertyValue('--grid-cell')) || CELL;
      const half = width / 2;
      left = half - cell * Math.ceil(half / cell + 1) + HAIR;
      top = cell / 2 - cell + HAIR;
      cols = Math.ceil((width - left) / cell) + 2;
      rows = Math.ceil((height - top) / cell) + 2;
      if (nodeX.length !== cols * rows) {
        nodeX = new Float32Array(cols * rows);
        nodeY = new Float32Array(cols * rows);
        nodeR = new Float32Array(cols * rows);
        nodeMoving = new Uint8Array(cols * rows);
      }
    };

    // Where the words are, line by line, so the grid falls quiet behind them:
    // one path per step of the quiet zone, so overlapping lines fill it once.
    let quiet = [];
    const measureQuiet = () => {
      const base = host.getBoundingClientRect();
      const range = document.createRange();
      const lines = [];
      const text = document.createTreeWalker(host, NodeFilter.SHOW_TEXT);
      while (text.nextNode()) {
        if (!text.currentNode.data.trim()) continue;
        range.selectNodeContents(text.currentNode);
        for (const r of range.getClientRects()) lines.push([r.left - base.left, r.top - base.top, r.width, r.height]);
      }
      quiet = QUIET.map(([pad, take]) => {
        const zone = new Path2D();
        for (const [x, y, w, h] of lines) zone.rect(x - pad, y - pad, w + 2 * pad, h + 2 * pad);
        return [zone, `rgba(0, 0, 0, ${take})`];
      });
    };

    // The lamp rests where the band's relief rests its own (LightField writes it on
    // the band: below a pinned stage, where the stage's lamp hangs, above the band),
    // so the grid and the relief under it share one light; otherwise upper right.
    // The lamp is the band's (LightField): the relief and the grid on it share
    // one light, which comes to rest at the centre of the closing, behind its
    // statement. Without the relief (no WebGL) the grid rests its own lamp there.
    const restEl = host.querySelector('[data-lead="rest"]');
    const restX = () => width / 2;
    const shared = () => {
      const page = lamps.band?.page;
      if (!page) return null;
      const rect = host.getBoundingClientRect();
      return [page[0] - (rect.left + window.scrollX), page[1] - (rect.top + window.scrollY)];
    };
    const rest = () => {
      const lamp = shared();
      if (lamp) {
        [aim.x, aim.y] = lamp;
      } else {
        aim.x = restX();
        if (restEl) {
          const r = restEl.getBoundingClientRect();
          aim.y = r.top + r.height / 2 - host.getBoundingClientRect().top;
        } else {
          aim.y = Math.min(height * 0.3, 320);
        }
      }
      aim.load = 0;
    };

    const resize = () => {
      const rect = host.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      width = rect.width;
      height = rect.height;
      speed = Math.min(Math.max(0.4 * width, RIPPLE_SPEED[0]), RIPPLE_SPEED[1]);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      layout();
      if (!aim.load) rest();
      if (!last) {
        lamp.x = aim.x;
        lamp.y = aim.y;
      }
    };

    // The skin's displacement at a resting point (x, y), written to placed: the
    // pull toward the pointer, then each ripple's push along its radius.
    const REACH2 = REACH * REACH;
    const LIT2 = DOT_LIT_REACH * DOT_LIT_REACH;
    let load = 0;
    const placed = { x: 0, y: 0, moving: 0, crest: 0 };
    const place = (x, y) => {
      let dx = 0;
      let dy = 0;
      let moving = 0;
      let crest = 0;
      if (load) {
        const ux = x - gather.x;
        const uy = y - gather.y;
        const d2 = ux * ux + uy * uy;
        if (d2 < REACH2) {
          // Smooth to nothing at REACH; the gathered cells never fold over.
          const f = 1 - d2 / REACH2;
          const pull = PINCH * load * f * f;
          dx -= ux * pull;
          dy -= uy * pull;
          moving = 1;
        }
      }
      for (let k = 0; k < ripples.length; k++) {
        const r = ripples[k];
        if (r.swell < 0.01) continue;
        const ux = x - r.x;
        const uy = y - r.y;
        const d = Math.sqrt(ux * ux + uy * uy);
        const s = d - r.front;
        if (s > 3 * LEAD || s < -3 * TRAIL) continue;
        moving = 1;
        const sigma = s > 0 ? LEAD : TRAIL;
        const envelope = Math.exp(-(s * s) / (sigma * sigma));
        crest += r.fade * Math.exp(-(s * s) / (LEAD * LEAD));
        if (d < 1e-3) continue;
        // The cell where it starts stays calm, so the wave leaves a point, not a knot.
        const calm = d < cell ? (d / cell) ** 2 * (3 - (2 * d) / cell) : 1;
        const push = (calm * r.swell * envelope * Math.cos((TAU * s) / WAVE)) / d;
        dx += ux * push;
        dy += uy * push;
      }
      placed.x = x + dx;
      placed.y = y + dy;
      placed.moving = moving;
      placed.crest = crest;
    };

    const draw = (now) => {
      load = lamp.load > 0.001 ? Math.min(lamp.load, 1.2) : 0;
      for (let k = 0; k < ripples.length; k++) {
        const r = ripples[k];
        // A ripple starts, and a displaced one starts retiring, on the first frame
        // that draws it, so its age is never negative.
        if (r.start < 0) r.start = now;
        if (r.retire < 0) r.retire = now;
        const age = Math.max((now - r.start) / 1000, 0);
        r.front = speed * age;
        // Fades out over the ripple's life, reaching nothing as it ends, or over
        // RETIRE ms once a newer ripple has displaced it.
        const retiring = r.retire ? Math.min(Math.max(1 - (now - r.retire) / RETIRE, 0), 1) : 1;
        r.fade = Math.max(1 - age / RIPPLE_LIFE, 0) ** 1.1 * retiring;
        r.swell = SWELL * r.fade * Math.min(age / 0.08, 1);
      }

      // The crossings, and how large each dot is drawn.
      for (let j = 0, n = 0; j < rows; j++) {
        const y = top + j * cell;
        for (let i = 0; i < cols; i++, n++) {
          place(left + i * cell, y);
          nodeX[n] = placed.x;
          nodeY[n] = placed.y;
          nodeMoving[n] = placed.moving;
          let radius = DOT + DOT_CREST * placed.crest;
          if (load) {
            const ux = placed.x - lamp.x;
            const uy = placed.y - lamp.y;
            const d2 = ux * ux + uy * uy;
            if (d2 < LIT2) radius += DOT_LIT * Math.min(load, 1) * (1 - d2 / LIT2) ** 2;
          }
          nodeR[n] = radius;
        }
      }

      // Every line as one path: rows, then columns. A side whose ends are moving
      // is sampled SUB times so it curves with the skin.
      const lattice = new Path2D();
      const step = cell / SUB;
      for (let j = 0; j < rows; j++) {
        const y = top + j * cell;
        let n = j * cols;
        lattice.moveTo(nodeX[n], nodeY[n]);
        for (let i = 1; i < cols; i++) {
          n++;
          if (nodeMoving[n] | nodeMoving[n - 1]) {
            const x = left + (i - 1) * cell;
            for (let s = 1; s < SUB; s++) {
              place(x + s * step, y);
              lattice.lineTo(placed.x, placed.y);
            }
          }
          lattice.lineTo(nodeX[n], nodeY[n]);
        }
      }
      for (let i = 0; i < cols; i++) {
        const x = left + i * cell;
        let n = i;
        lattice.moveTo(nodeX[n], nodeY[n]);
        for (let j = 1; j < rows; j++) {
          n += cols;
          if (nodeMoving[n] | nodeMoving[n - cols]) {
            const y = top + (j - 1) * cell;
            for (let s = 1; s < SUB; s++) {
              place(x, y + s * step);
              lattice.lineTo(placed.x, placed.y);
            }
          }
          lattice.lineTo(nodeX[n], nodeY[n]);
        }
      }
      const dots = new Path2D();
      for (let n = 0; n < cols * rows; n++) {
        dots.moveTo(nodeX[n] + nodeR[n], nodeY[n]);
        dots.arc(nodeX[n], nodeY[n], nodeR[n], 0, TAU);
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const line = dpr >= 1.5 ? 0.75 : 1;
      ctx.lineWidth = line;
      // The lamp lights the lines and dots around it, warm at its centre.
      const reach = LAMP_REACH * (1 + 0.3 * load);
      const glow = ctx.createRadialGradient(lamp.x, lamp.y, 0, lamp.x, lamp.y, reach);
      glow.addColorStop(0, `rgba(${LAMP}, ${0.2 + 0.28 * load})`);
      glow.addColorStop(0.45, `rgba(${INK}, ${0.09 + 0.04 * load})`);
      glow.addColorStop(1, `rgba(${INK}, ${LINE})`);
      ctx.strokeStyle = glow;
      ctx.stroke(lattice);
      const shine = ctx.createRadialGradient(lamp.x, lamp.y, 0, lamp.x, lamp.y, reach);
      shine.addColorStop(0, `rgba(${LAMP}, ${0.34 + 0.28 * load})`);
      shine.addColorStop(0.45, `rgba(${INK}, ${0.14 + 0.05 * load})`);
      shine.addColorStop(1, `rgba(${INK}, ${NODE})`);
      ctx.fillStyle = shine;
      ctx.fill(dots);
      // Each ripple is the lamp's light running out through the skin; it is
      // clipped to the ring's bounds so a ripple costs only the area it covers.
      for (let k = 0; k < ripples.length; k++) {
        const r = ripples[k];
        if (r.fade < 0.005) continue;
        const inner = Math.max(r.front - RIPPLE_WIDTH, 0);
        const outer = r.front + RIPPLE_WIDTH;
        const crest = Math.min(Math.max((r.front - inner) / (outer - inner), 0), 1);
        ctx.save();
        try {
          ctx.beginPath();
          ctx.rect(r.x - outer, r.y - outer, 2 * outer, 2 * outer);
          ctx.clip();
          for (let pass = 0; pass < 2; pass++) {
            const ring = ctx.createRadialGradient(r.x, r.y, inner, r.x, r.y, outer);
            ring.addColorStop(0, `rgba(${LAMP}, 0)`);
            ring.addColorStop(crest, `rgba(${LAMP}, ${CREST[pass] * r.fade})`);
            ring.addColorStop(1, `rgba(${LAMP}, 0)`);
            if (pass) {
              ctx.fillStyle = ring;
              ctx.fill(dots);
            } else {
              ctx.strokeStyle = ring;
              ctx.stroke(lattice);
            }
          }
        } finally {
          ctx.restore();
        }
      }
      // The grid falls quiet behind the words, ripples included.
      ctx.globalCompositeOperation = 'destination-out';
      for (const [zone, take] of quiet) {
        ctx.fillStyle = take;
        ctx.fill(zone);
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
      // The band's lamp is drawn where the relief's is, this very frame (the
      // frame clock runs the grid after the band). Without it, the grid's own
      // lamp follows the pointer on the band's spring.
      const band = shared();
      if (band) {
        [lamp.x, lamp.y] = band;
        lamp.vx = lamp.vy = 0;
        if (!pointer.inside) [aim.x, aim.y] = band;
      } else {
        lamp.vx += (-k * (lamp.x - aim.x) - c * lamp.vx) * dt;
        lamp.vy += (-k * (lamp.y - aim.y) - c * lamp.vy) * dt;
        lamp.x += lamp.vx * dt;
        lamp.y += lamp.vy * dt;
      }
      lamp.vl += (-k * (lamp.load - aim.load) - c * lamp.vl) * dt;
      lamp.load += lamp.vl * dt;
      gather.vx += (-k * (gather.x - gather.tx) - c * gather.vx) * dt;
      gather.vy += (-k * (gather.y - gather.ty) - c * gather.vy) * dt;
      gather.x += gather.vx * dt;
      gather.y += gather.vy * dt;
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        if (r.start < 0) continue;
        if ((now - r.start) / 1000 > RIPPLE_LIFE || (r.retire > 0 && now - r.retire > RETIRE)) ripples.splice(i, 1);
      }
      const settled =
        (band || Math.abs(lamp.x - aim.x) + Math.abs(lamp.y - aim.y) < 0.05) &&
        Math.abs(lamp.vx) + Math.abs(lamp.vy) < 0.05 &&
        Math.abs(lamp.load - aim.load) < 1e-3 &&
        Math.abs(lamp.vl) < 1e-3 &&
        Math.abs(gather.x - gather.tx) + Math.abs(gather.y - gather.ty) < 0.05 &&
        Math.abs(gather.vx) + Math.abs(gather.vy) < 0.05;
      if (settled) {
        if (!band) {
          lamp.x = aim.x;
          lamp.y = aim.y;
        }
        lamp.load = aim.load;
        lamp.vx = lamp.vy = lamp.vl = 0;
        gather.x = gather.tx;
        gather.y = gather.ty;
        gather.vx = gather.vy = 0;
      }
      draw(now);
      dirty = false;
      if ((!settled || ripples.length) && visible && !document.hidden) {
        raf = 1;
        requestFrame('grid', step);
      } else {
        last = 0;
      }
    };

    const kick = () => {
      if (!raf && !stopped && visible && !document.hidden) {
        raf = 1;
        requestFrame('grid', step);
      }
    };

    const local = (event) => {
      const rect = host.getBoundingClientRect();
      return [event.clientX - rect.left, event.clientY - rect.top];
    };

    // Start and retirement times are set by the frame that first draws them (-1
    // until then), on the same clock as the frames.
    const ripple = (x, y) => {
      if (still) return;
      ripples.push({ x, y, start: -1, retire: 0, front: 0, fade: 0, swell: 0 });
      // Past the limit, the oldest live ripple fades out rather than vanishing.
      const live = ripples.filter((r) => !r.retire);
      if (live.length > RIPPLES) live[0].retire = -1;
      kick();
    };

    // Only a mouse or pen gathers the skin; on touch the finger is scrolling.
    const onMove = (event) => {
      if (event.pointerType === 'touch' || still) return;
      [aim.x, aim.y] = local(event);
      gather.tx = aim.x;
      gather.ty = aim.y;
      // A skin at rest starts to gather right under the pointer.
      if (!aim.load && lamp.load < 0.02) {
        gather.x = aim.x;
        gather.y = aim.y;
        gather.vx = gather.vy = 0;
      }
      aim.load = 1;
      pointer.inside = true;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      entered = true;
      kick();
    };

    // The page scrolls under a still mouse: the skin stays gathered under it,
    // and relaxes once the band has left it.
    const onScroll = () => {
      if (!pointer.inside || stopped || still) return;
      const rect = host.getBoundingClientRect();
      const x = pointer.x - rect.left;
      const y = pointer.y - rect.top;
      if (y < 0 || y > rect.height) {
        pointer.inside = false;
        rest();
      } else {
        aim.x = gather.tx = x;
        aim.y = gather.ty = y;
      }
      kick();
    };

    // A click on open space ripples at once. A click on the words ripples on
    // release, unless it dragged or selected text. A touch ripples on release,
    // and only if it stayed put and the browser never took it for a scroll.
    const onDown = (event) => {
      if (event.button > 0) return;
      // A finger that comes down may be starting a scroll: only a tap counts as
      // having interacted, so the swipe that brings the grid in keeps its
      // entry ripple (F33).
      if (event.pointerType !== 'touch') entered = true;
      if (event.pointerType === 'touch') {
        tap = { id: event.pointerId, x: event.clientX, y: event.clientY };
        return;
      }
      if (event.target.closest?.('h2, p')) {
        press = { id: event.pointerId, x: event.clientX, y: event.clientY };
        return;
      }
      ripple(...local(event));
    };

    const onUp = (event) => {
      const start = event.pointerType === 'touch' ? tap : press;
      tap = press = null;
      if (!start || start.id !== event.pointerId) return;
      if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > TAP_SLOP) return;
      if (event.pointerType !== 'touch' && !(window.getSelection()?.isCollapsed ?? true)) return;
      entered = true;
      ripple(...local(event));
    };

    // Scrolling takes over, or the pointer leaves: the skin relaxes.
    const onRelease = (event) => {
      if (event.pointerType === 'touch') {
        tap = null;
        return;
      }
      press = null;
      pointer.inside = false;
      rest();
      kick();
    };

    // Reduced motion switched on mid-visit: the grid settles at rest and stays
    // still; switched off again, it answers to the pointer once more.
    const onReduce = () => {
      still = reduceMotion.matches;
      if (!still) return;
      if (raf) cancelFrame('grid');
      raf = 0;
      last = 0;
      ripples.length = 0;
      pointer.inside = false;
      rest();
      lamp.x = aim.x;
      lamp.y = aim.y;
      lamp.load = 0;
      lamp.vx = lamp.vy = lamp.vl = 0;
      gather.vx = gather.vy = 0;
      draw(performance.now());
    };

    // The first time the closing's statement is well into view, the resting
    // lamp sends one ripple out through the skin, from where its light rests.
    const heading = restEl || host.querySelector('h2');
    const entryObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        entryObserver.disconnect();
        if (entered || still) return;
        // From where the light rests: read from the page, not the lamp, which a
        // jump here may not have brought down yet.
        const r = restEl?.getBoundingClientRect();
        const top = host.getBoundingClientRect().top;
        const x = restX();
        const y = r ? r.top + r.height / 2 - top : Math.min(height * 0.3, 320);
        ripple(Math.min(Math.max(x, 0), width), Math.min(Math.max(y, 0), height));
      },
      { rootMargin: '0px 0px -50% 0px' }
    );

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      // Drawn on the frame clock, after the band has placed its lamp in the
      // same frame (a jump here leaves the lamp where it was until then).
      if (visible && (!shown || dirty) && !stopped) {
        rest();
        if (!pointer.inside) {
          lamp.x = aim.x;
          lamp.y = aim.y;
        }
        dirty = true;
      }
      kick();
    });

    // The band's lamp moved (Scene 04 bringing it down, a mouse in Scene 05):
    // the grid draws it in the same frame.
    const offLamp = onLamp((name) => {
      if (name !== 'band' || stopped) return;
      if (visible) kick();
      else dirty = true;
    });

    const onVisibility = () => {
      if (!document.hidden) kick();
    };

    const resizeObserver = new ResizeObserver(() => {
      resize();
      measureQuiet();
      if (visible && !stopped) draw(performance.now());
      else dirty = true;
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
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    reduceMotion.addEventListener('change', onReduce);

    return () => {
      stopped = true;
      cancelFrame('grid');
      offLamp();
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      entryObserver.disconnect();
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerdown', onDown);
      host.removeEventListener('pointerup', onUp);
      host.removeEventListener('pointercancel', onRelease);
      host.removeEventListener('pointerleave', onRelease);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);
      reduceMotion.removeEventListener('change', onReduce);
      delete host.dataset.grid;
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
