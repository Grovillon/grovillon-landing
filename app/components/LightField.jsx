'use client';

import { useEffect, useRef } from 'react';
import { clearLamp, setLamp } from './pageLamp';
import { reliefLayout } from './stageScript';

const VERTEX = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

// Folded-plate relief: straight folds every uCell.x, zigzag folds whose
// segments run at the planform angle. Every facet is flat, so all shading
// comes from one point light falling off across each plane.
const FRAGMENT = `
precision highp float;
uniform vec2 uRes;
uniform float uUnit;
uniform vec3 uLight;
uniform float uIntensity;
uniform vec2 uCell;
uniform float uSlope;
uniform float uCos;
uniform vec2 uDepth;
uniform vec3 uLook;
uniform vec3 uGround;
uniform vec3 uLamp;
uniform vec2 uOrigin;

float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

float distTo(float x, float period) {
  float m = mod(x, period);
  return min(m, period - m);
}

vec3 shade(vec2 p, float px) {
  float w = uCell.x;
  float h = uCell.y;
  float zx = mod(p.x, 2.0 * w);
  float s1 = zx < w ? 1.0 : -1.0;
  float zig = (zx < w ? zx : 2.0 * w - zx) * uSlope;
  float yy = p.y - zig;
  float s2 = mod(yy, 2.0 * h) < h ? 1.0 : -1.0;
  float dzdx = s1 * (uDepth.x - uDepth.y * s2 * uSlope);
  float dzdy = uDepth.y * s2;
  vec3 n = normalize(vec3(-dzdx, -dzdy, 1.0));
  vec3 lv = vec3(uLight.xy - p, uLight.z);
  float dist = length(lv);
  vec3 l = lv / dist;
  float diff = max(dot(n, l), 0.0);
  float att = 1.0 / (1.0 + (dist * dist) / (uLook.z * uLook.z));
  vec3 hv = normalize(l + vec3(0.0, 0.0, 1.0));
  float spec = pow(max(dot(n, hv), 0.0), 40.0) * 0.08;
  float light = (diff + spec) * att * uIntensity;
  float crease = distTo(yy, h) * uCos;
  float line = 1.0 - smoothstep(0.0, px * 1.1, crease);
  vec3 col = uGround + uLamp * light * uLook.x;
  col += uLamp * line * att * uIntensity * uLook.y * (0.35 + diff);
  return col;
}

void main() {
  vec2 frag = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  float px = 1.0 / uUnit;
  // uOrigin places the canvas in the hero's pattern (0 for the hero itself).
  vec3 col = shade((frag + vec2(0.125, 0.375)) * px + uOrigin, px)
           + shade((frag + vec2(0.375, -0.125)) * px + uOrigin, px)
           + shade((frag + vec2(-0.125, -0.375)) * px + uOrigin, px)
           + shade((frag + vec2(-0.375, 0.125)) * px + uOrigin, px);
  col *= 0.25;
  // Same amplitude as the page's grain tile, so relief and ground read as one matte surface.
  col += (hash(frag) - 0.5) * (6.0 / 255.0);
  gl_FragColor = vec4(col, 1.0);
}
`;

const PLANFORM = (30 * Math.PI) / 180;
const ENTRANCE_MS = 1700;
const WARM_MS = 1200;
const HANDOFF_MS = 200;

function cubicBezier(p1x, p1y, p2x, p2y) {
  const cx = 3 * p1x;
  const bx = 3 * (p2x - p1x) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * p1y;
  const by = 3 * (p2y - p1y) - cy;
  const ay = 1 - cy - by;
  const sampleX = (t) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t) => ((ay * t + by) * t + cy) * t;
  return (x) => {
    let lo = 0;
    let hi = 1;
    let t = x;
    for (let i = 0; i < 20; i++) {
      const v = sampleX(t);
      if (Math.abs(v - x) < 1e-5) break;
      if (v < x) lo = t;
      else hi = t;
      t = (lo + hi) / 2;
    }
    return sampleY(t);
  };
}

const easeInOut = cubicBezier(0.77, 0, 0.175, 1);
const easeOut = cubicBezier(0.23, 1, 0.32, 1);

// All lengths are in "units" of one viewport-height-sized reference, so the
// folds keep the same physical size wherever the surface appears.
const VARIANTS = {
  hero: {
    entrance: true,
    pointer: true,
    spring: [170, 26],
    layout(width, unit) {
      const span = width / unit;
      const narrow = span < 1;
      return {
        cell: narrow ? [0.27, 0.31] : [0.42, 0.5],
        depth: [0.06, 0.42],
        rest: narrow ? [0.82 * span, 0.1] : [0.7 * span, 0.13],
        start: [0.3 * span, 0.3],
        z: narrow ? 0.3 : 0.36,
        look: narrow ? [0.19, 0.12, 0.72] : [0.19, 0.12, 0.95],
      };
    },
  },
  scroll: {
    entrance: false,
    pointer: false,
    // The lamp stays level with the reader's eye line; springing y would make it swim against the scroll.
    trackY: true,
    spring: [90, 19],
    layout(width, unit) {
      const span = width / unit;
      const narrow = span < 1;
      return {
        cell: narrow ? [0.27, 0.31] : [0.42, 0.5],
        depth: [0.06, 0.42],
        rest: [0.5 * span, 0.4],
        z: 0.24,
        look: narrow ? [0.15, 0.16, 0.62] : [0.15, 0.16, 0.8],
      };
    },
  },
  // The grid band's ground: the hero's relief run on below the stage, its folds
  // aligned with the hero's (lengths in the hero's height, the canvas placed in
  // the hero's pattern), under a lamp that rests and follows the pointer as the
  // band's grid lamp does, so the relief and the grid on it share one light.
  band: {
    entrance: false,
    pointer: true,
    aligned: true,
    spring: [170, 26],
    layout(width, unit, height) {
      const span = width / unit;
      const narrow = span < 1;
      return {
        cell: narrow ? [0.27, 0.31] : [0.42, 0.5],
        depth: [0.06, 0.42],
        rest: [0.78 * span, Math.min(0.3 * height, 320) / unit],
        z: narrow ? 0.3 : 0.36,
        look: narrow ? [0.19, 0.12, 0.72] : [0.19, 0.12, 0.95],
      };
    },
  },
};

// failIfMajorPerformanceCaveat does not stop every browser from handing out a
// CPU-rendered context, so the renderer's name is checked as well.
function isSoftwareRenderer(gl) {
  let name = gl.getParameter(gl.RENDERER);
  if (/^webkit webgl$/i.test(name)) {
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    if (info) name = gl.getParameter(info.UNMASKED_RENDERER_WEBGL);
  }
  return /swiftshader|llvmpipe|softpipe|software|basic render/i.test(name || '');
}

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createScene(gl) {
  const vs = compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
  if (!vs || !fs) return null;
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const pos = gl.getAttribLocation(program, 'aPos');
  gl.enableVertexAttribArray(pos);
  gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
  const u = (name) => gl.getUniformLocation(program, name);
  gl.uniform1f(u('uSlope'), Math.tan(PLANFORM));
  gl.uniform1f(u('uCos'), Math.cos(PLANFORM));
  gl.uniform3f(u('uGround'), 10 / 255, 11 / 255, 12 / 255);
  gl.uniform3f(u('uLamp'), 1.0, 0.95, 0.88);
  return {
    program,
    buffer,
    uRes: u('uRes'),
    uUnit: u('uUnit'),
    uLight: u('uLight'),
    uIntensity: u('uIntensity'),
    uCell: u('uCell'),
    uDepth: u('uDepth'),
    uLook: u('uLook'),
    uOrigin: u('uOrigin'),
  };
}

export default function LightField({ className, variant = 'hero' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    const config = VARIANTS[variant];
    if (!canvas || !host || !config) return undefined;

    // Without a GPU the shader would run on the CPU and block the main thread;
    // those visitors get the CSS light instead.
    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'low-power',
      failIfMajorPerformanceCaveat: true,
    });
    if (!gl || isSoftwareRenderer(gl)) {
      host.dataset.field = 'off';
      return undefined;
    }

    let scene = createScene(gl);
    if (!scene) {
      host.dataset.field = 'off';
      return undefined;
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const [springK, springC] = config.spring;

    let layout = config.layout(1, 1, 1);
    let unitCss = 1;
    // Where the canvas sits in the hero's pattern, in units (aligned variants).
    let origin = [0, 0];
    const light = { x: 0, y: 0, vx: 0, vy: 0 };
    const target = { x: 0, y: 0 };
    const entrance = config.entrance && !reduceMotion.matches;
    let entranceStart = entrance ? -1 : null;
    let entranceT = 0;
    let handOffAt = null;
    let warmStart = entrance ? -1 : null;
    let intensity = entrance ? 0 : 1;
    let pointerActive = false;
    let raf = 0;
    let last = 0;
    let visible = true;
    let lost = false;
    let shown = false;

    const draw = () => {
      if (lost || !scene) return;
      gl.uniform3f(scene.uLight, light.x + origin[0], light.y + origin[1], layout.z);
      gl.uniform1f(scene.uIntensity, intensity);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      // The hero's lamp and the band's light the stage's relief where it meets
      // theirs (pageLamp.js).
      if (variant === 'hero' || variant === 'band') {
        setLamp(variant, light.x + origin[0], light.y + origin[1], layout.z, intensity);
      }
      if (!shown) {
        shown = true;
        host.dataset.field = 'on';
      }
    };

    // The pointer can take the lamp mid-entrance: the spring inherits the eased
    // path's velocity and its stiffness ramps in, so the lamp carries its
    // momentum through the turn instead of reversing in one frame.
    const handOff = () => {
      const a = Math.max(entranceT - 0.01, 0);
      const b = Math.min(entranceT + 0.01, 1);
      const rate = (easeInOut(b) - easeInOut(a)) / (b - a) / (ENTRANCE_MS / 1000);
      light.vx = (layout.rest[0] - layout.start[0]) * rate;
      light.vy = (layout.rest[1] - layout.start[1]) * rate;
      entranceStart = null;
      handOffAt = -1;
    };

    // The scroll variant's lamp crosses the surface as the section passes
    // through the viewport and stays level with the reader's eye line.
    const scrollTarget = () => {
      const rect = host.getBoundingClientRect();
      const view = window.innerHeight;
      if (reduceMotion.matches) {
        target.x = layout.rest[0];
        target.y = Math.min(0.45, rect.height / unitCss / 2);
        return;
      }
      const progress = Math.min(Math.max((view - rect.top) / (view + rect.height), 0), 1);
      const span = rect.width / unitCss;
      target.x = span * (0.08 + 0.84 * progress);
      target.y = (view * 0.42 - rect.top) / unitCss;
    };

    const resize = (force = false) => {
      const rect = host.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      // Soft light needs no device pixels: the shader supersamples, and fill cost stays flat on dense screens.
      const dpr = Math.min(window.devicePixelRatio || 1, 1);
      const width = Math.round(rect.width * dpr);
      const height = Math.round(rect.height * dpr);
      const hero = config.aligned ? document.querySelector('.hero')?.getBoundingClientRect() : null;
      const unit = variant === 'hero' ? rect.height : hero?.height || window.innerHeight;
      // Below a pinned stage an aligned canvas runs on from the stage's relief,
      // which held still through the pinned run: its pattern continues the
      // stage's from the stage's bottom edge, not from where the page has
      // scrolled to.
      const cine = config.aligned ? document.querySelector('.cine[data-cine]') : null;
      const pinned = cine?.querySelector('.cine-stage');
      const run = pinned ? cine.offsetHeight - pinned.clientHeight : 0;
      const place = hero ? [0, (rect.top - hero.top - run) / unit] : [0, 0];
      if (
        !force &&
        width === canvas.width &&
        height === canvas.height &&
        unit === unitCss &&
        place[1] === origin[1]
      ) {
        return;
      }
      canvas.width = width;
      canvas.height = height;
      unitCss = unit;
      origin = place;
      layout = config.layout(rect.width, unitCss, rect.height);
      if (pinned) {
        // ... and its lamp rests where the stage's lamp hangs, above it.
        const lamp = reliefLayout(rect.width, unitCss, 0).lamp;
        layout.rest = [lamp[0], lamp[1] - pinned.clientHeight / unitCss];
        layout.z = lamp[2];
      }
      // The band's grid rests its own lamp there too (KineticGrid reads it).
      if (variant === 'band') host.dataset.lamp = `${layout.rest[0] * unitCss},${layout.rest[1] * unitCss}`;
      if (!scene) return;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(scene.uRes, canvas.width, canvas.height);
      gl.uniform2f(scene.uOrigin, origin[0], origin[1]);
      gl.uniform1f(scene.uUnit, unitCss * dpr);
      gl.uniform2f(scene.uCell, layout.cell[0], layout.cell[1]);
      gl.uniform2f(scene.uDepth, layout.depth[0], layout.depth[1]);
      gl.uniform3f(scene.uLook, layout.look[0], layout.look[1], layout.look[2]);
      if (variant === 'scroll') {
        scrollTarget();
      } else if (!pointerActive) {
        target.x = layout.rest[0];
        target.y = layout.rest[1];
      }
      if (entranceStart === null) {
        light.x = target.x;
        light.y = target.y;
        light.vx = 0;
        light.vy = 0;
      } else if (entranceStart < 0) {
        light.x = layout.start[0];
        light.y = layout.start[1];
      }
      draw();
    };

    const step = (now) => {
      raf = 0;
      const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
      last = now;
      let moving = false;

      if (warmStart !== null) {
        if (warmStart < 0) warmStart = now;
        const w = Math.min((now - warmStart) / WARM_MS, 1);
        intensity = easeOut(w);
        if (w < 1) moving = true;
        else warmStart = null;
      }

      if (entranceStart !== null) {
        if (entranceStart < 0) entranceStart = now;
        entranceT = Math.min((now - entranceStart) / ENTRANCE_MS, 1);
        const e = easeInOut(entranceT);
        light.x = layout.start[0] + (layout.rest[0] - layout.start[0]) * e;
        light.y = layout.start[1] + (layout.rest[1] - layout.start[1]) * e;
        if (entranceT >= 1) entranceStart = null;
        moving = true;
      } else {
        let k = springK;
        let c = springC;
        if (handOffAt !== null) {
          if (handOffAt < 0) handOffAt = now;
          const ramp = Math.min((now - handOffAt) / HANDOFF_MS, 1);
          k = springK * ramp;
          c = 2 * Math.sqrt(k);
          if (ramp >= 1) handOffAt = null;
        }
        const ax = -k * (light.x - target.x) - c * light.vx;
        light.vx += ax * dt;
        light.x += light.vx * dt;
        if (config.trackY) {
          light.y = target.y;
        } else {
          const ay = -k * (light.y - target.y) - c * light.vy;
          light.vy += ay * dt;
          light.y += light.vy * dt;
        }
        const settled =
          Math.abs(light.x - target.x) < 1e-4 &&
          Math.abs(light.y - target.y) < 1e-4 &&
          Math.abs(light.vx) < 1e-3 &&
          Math.abs(light.vy) < 1e-3;
        if (settled) {
          light.x = target.x;
          light.y = target.y;
          light.vx = 0;
          light.vy = 0;
        } else {
          moving = true;
        }
      }

      draw();
      if (moving && visible && !document.hidden) raf = requestAnimationFrame(step);
      else last = 0;
    };

    const kick = () => {
      if (!raf && visible && !lost && !document.hidden) raf = requestAnimationFrame(step);
    };

    // The lamp goes where the pointer is over the host, and back to rest when
    // it is not.
    const follow = (clientX, clientY) => {
      const rect = host.getBoundingClientRect();
      const inside = clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
      pointerActive = inside;
      if (inside) {
        if (entranceStart !== null) handOff();
        target.x = (clientX - rect.left) / unitCss;
        target.y = Math.max((clientY - rect.top) / unitCss, 0.02);
      } else {
        target.x = layout.rest[0];
        target.y = layout.rest[1];
      }
      kick();
    };

    // An aligned variant shares its lamp with the grid on the same host, so it
    // answers to what the grid answers to (a mouse or a pen) and, like the
    // grid's lamp, stays under a still pointer while the page scrolls.
    let still = null;
    const onPointerMove = (event) => {
      const answers = config.aligned ? event.pointerType !== 'touch' : event.pointerType === 'mouse' && finePointer.matches;
      if (!answers || reduceMotion.matches || !visible) return;
      still = [event.clientX, event.clientY];
      follow(event.clientX, event.clientY);
    };

    const onPointerLeave = () => {
      pointerActive = false;
      still = null;
      target.x = layout.rest[0];
      target.y = layout.rest[1];
      kick();
    };

    const onScroll = () => {
      if (!visible || reduceMotion.matches) return;
      if (config.aligned) {
        if (still) follow(still[0], still[1]);
        return;
      }
      scrollTarget();
      kick();
    };

    const onVisibility = () => {
      if (!document.hidden) kick();
    };

    const onLost = (event) => {
      event.preventDefault();
      lost = true;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    const onRestored = () => {
      lost = false;
      scene = createScene(gl);
      if (!scene) {
        host.dataset.field = 'off';
        return;
      }
      resize(true);
    };

    resize();
    if (entranceStart !== null) kick();

    const resizeObserver = new ResizeObserver(() => resize());
    resizeObserver.observe(host);
    // An aligned canvas keeps its place in the hero's pattern: what sits above
    // it (the hero, the stage's run) can change height while it is in view.
    if (config.aligned) {
      for (const above of document.querySelectorAll('.hero, .cine')) resizeObserver.observe(above);
    }
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) return;
      // An aligned canvas checks its place in the hero's pattern as it comes
      // into view: what sits above it may have changed height since.
      if (config.aligned) resize();
      if (variant === 'scroll') {
        scrollTarget();
        light.x = target.x;
        light.y = target.y;
        light.vx = 0;
        light.vy = 0;
        draw();
      }
      kick();
    });
    visibilityObserver.observe(host);
    if (config.pointer) {
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      document.documentElement.addEventListener('pointerleave', onPointerLeave);
    }
    if (variant === 'scroll' || config.aligned) window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    canvas.addEventListener('webglcontextlost', onLost);
    canvas.addEventListener('webglcontextrestored', onRestored);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('webglcontextlost', onLost);
      canvas.removeEventListener('webglcontextrestored', onRestored);
      if (scene && !lost) {
        gl.deleteBuffer(scene.buffer);
        gl.deleteProgram(scene.program);
      }
      if (variant === 'hero' || variant === 'band') clearLamp(variant);
      if (variant === 'band') delete host.dataset.lamp;
    };
  }, [variant]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
