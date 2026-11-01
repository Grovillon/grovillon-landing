'use client';

import { useEffect, useRef } from 'react';
import { cancelFrame, requestFrame } from './frameClock';
import { leadPath, leadPose, leadTimeline, waitX, wordLight } from './leadPath';
import { clearLamp, endEntrance, entrance as entranceState, onLamp, setLamp } from './pageLamp';
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

// The lamp follows a fine pointer on a critically damped spring: about 85 ms
// behind a moving hand (ω ≈ 24 rad/s; it was 150 ms), settling without
// overshoot. It steps in slices of at most 1/120 s, so a slow frame does not
// slow the light down.
const SPRING = [560, 47];
const SLICE = 1 / 120;
// The band's pointer share: how quickly a fine pointer takes the resting lamp in
// Scene 05, and gives it back.
const SHARE = [90, 19];
// Horizontal strips of the band's canvas, in css px: each remembers the light it
// was last drawn with, and only stale strips on screen are drawn again.
const STRIP = 48;

// All lengths are in "units" of the hero's height, so the folds keep the same
// physical size wherever the surface appears.
const VARIANTS = {
  hero: {
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
  // The relief under Scenes 04 and 05: the hero's run on below the stage, its
  // folds continuing the stage's, lit by the lamp that leaves the stage (Scene
  // 04's light, leadPath.js) and rests in the grid (Scene 05).
  band: {
    layout(width, unit) {
      const span = width / unit;
      const narrow = span < 1;
      return {
        cell: narrow ? [0.27, 0.31] : [0.42, 0.5],
        depth: [0.06, 0.42],
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

// One step of a critically damped spring toward `to`, in slices.
function spring(p, v, to, dt, k, c) {
  let x = p;
  let u = v;
  for (let left = dt; left > 1e-6; left -= SLICE) {
    const h = Math.min(left, SLICE);
    u += (-k * (x - to) - c * u) * h;
    x += u * h;
  }
  return [x, u];
}

export default function LightField({ className, variant = 'hero' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    const config = VARIANTS[variant];
    if (!canvas || !host || !config) return undefined;
    const band = variant === 'band';
    const key = variant;

    // Without a GPU the shader would run on the CPU and block the main thread;
    // those visitors get the CSS light (hero) or the plain ground (band).
    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'low-power',
      failIfMajorPerformanceCaveat: true,
      // The band draws only the strips on screen; the rest keep their picture.
      preserveDrawingBuffer: band,
    });
    // No relief at all (decided once, as the page opens): the band closes up
    // Scene 04 around its sentence (globals.css).
    if (!gl || isSoftwareRenderer(gl)) {
      host.dataset.field = 'off';
      if (band) host.dataset.relief = 'none';
      if (!band) endEntrance();
      return undefined;
    }

    let scene = createScene(gl);
    if (!scene) {
      host.dataset.field = 'off';
      if (band) host.dataset.relief = 'none';
      if (!band) endEntrance();
      return undefined;
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    // Reduced motion asked for as the page opened gets Scene 04's still pose,
    // with the section closed up around it, for the whole visit (the section
    // stays closed up if the setting is turned off); asked for later, the light
    // stays where it is (`frozen`, a page position), and the page does not move.
    const stillAtLoad = reduceMotion.matches;
    let frozen = null;

    let layout = config.layout(1, 1);
    let unitCss = 1;
    let dpr = 1;
    // Where the canvas sits in the hero's pattern, in units (the band).
    let origin = [0, 0];
    const light = { x: 0, y: 0, vx: 0, vy: 0 };
    const target = { x: 0, y: 0 };
    let z = layout.z;
    let look = layout.look[2];
    let intensity = 1;
    let raf = false;
    let last = 0;
    let visible = true;
    let lost = false;
    let shown = false;
    let disposed = false;

    // ---- the hero: an entrance, then a lamp the pointer takes ----
    const entrance = !band && !reduceMotion.matches;
    let entranceStart = entrance ? -1 : null;
    let entranceTimer = 0;
    let entranceT = 0;
    let handOffAt = null;
    let warmStart = entrance ? -1 : null;
    if (!band && !entrance) endEntrance();
    if (entrance) intensity = 0;
    // The pointer, once it has moved over the page (client px), and whether the
    // lamp has been given to it.
    let pointer = null;
    let following = false;

    // ---- the band: Scene 04's script, Scene 05's rest and pointer ----
    // Scene 04's sentence, word by word (measureBand).
    let words = [];
    // Geometry for leadPath (css px, page positions relative to the unpin).
    let geo = null;
    let timeline = null;
    let unpin = 0;
    let hostTop = 0;
    let hostLeft = 0;
    let zone = null;
    // The pointer's share of the band's lamp (Scene 05, fine pointer only).
    const share = { value: 0, velocity: 0 };
    const held = { x: 0, y: 0, vx: 0, vy: 0, placed: false };
    // The band waits for the hero's entrance before its first full draw, so
    // the entrance has the GPU to itself, unless the reader is already past
    // the hero (a page opened lower down, or scrolled away), as the stage does.
    const past = () => window.scrollY > 0.25 * window.innerHeight;
    let ready = !band || pageEntranceDone() || past();
    let strips = [];

    function pageEntranceDone() {
      return entranceState.done;
    }

    const lightKey = (x, y) => `${x.toFixed(5)},${y.toFixed(5)},${z.toFixed(5)},${look.toFixed(5)},${intensity}`;
    let drawnKey = '';

    // `at` is where the lamp is drawn: the lamp itself, or its target once it is
    // all but there. Only what changed is drawn: the hero redraws when its lamp
    // moves (F28); the band draws the stale strips on screen (or all of them).
    const draw = (force = false, at = light) => {
      if (lost || !scene || !ready) return;
      const x = at.x + origin[0];
      const y = at.y + origin[1];
      const lampKey = lightKey(x, y);
      if (band) {
        // Strips on screen that still show another light are drawn again, and
        // never more than the rows on screen and one row past each edge of it
        // (a band frame costs one viewport and two rows): the browser scales
        // the canvas to the screen, and the screen's edge rows blend in the
        // rows just beyond, which must show the same light. A strip drawn only
        // in part shows two lights, so it stays stale for any light, and the
        // rest of it is drawn when it scrolls in.
        // Strip edges are whole device rows, so no row falls between two draws.
        const strip = Math.max(Math.round(STRIP * dpr), 1);
        const rows = Math.ceil(canvas.height / strip);
        if (strips.length !== rows) strips = new Array(rows).fill('');
        let top = 0;
        let bottom = canvas.height;
        if (!force) {
          const rect = canvas.getBoundingClientRect();
          const viewTop = Math.max(Math.floor(-rect.top * dpr) - 1, 0);
          const viewBottom = Math.min(Math.ceil((window.innerHeight - rect.top) * dpr) + 1, canvas.height);
          if (viewBottom <= viewTop) return publish(x, y, at);
          let from = Math.floor(viewTop / strip);
          let to = Math.min(Math.floor((viewBottom - 1) / strip), rows - 1);
          while (from <= to && strips[from] === lampKey) from += 1;
          while (to >= from && strips[to] === lampKey) to -= 1;
          if (from > to) return publish(x, y, at);
          top = Math.max(from * strip, viewTop);
          bottom = Math.min((to + 1) * strip, viewBottom);
        }
        gl.enable(gl.SCISSOR_TEST);
        gl.scissor(0, canvas.height - bottom, canvas.width, bottom - top);
        for (let i = Math.floor(top / strip); i * strip < bottom; i++) {
          strips[i] = i * strip >= top && Math.min((i + 1) * strip, canvas.height) <= bottom ? lampKey : '';
        }
      } else if (!force && drawnKey === lampKey) {
        return undefined;
      }
      drawnKey = lampKey;
      gl.uniform3f(scene.uLight, x, y, z);
      gl.uniform3f(scene.uLook, layout.look[0], layout.look[1], look);
      gl.uniform1f(scene.uIntensity, intensity);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (band) gl.disable(gl.SCISSOR_TEST);
      if (!shown) {
        shown = true;
        host.dataset.field = 'on';
      }
      return publish(x, y, at);
    };

    // The hero's lamp and the band's light the stage's relief where it meets
    // theirs, and the band's lights the grid (pageLamp.js).
    function publish(x, y, at) {
      setLamp(variant, x, y, z, intensity, band ? [hostLeft + at.x * unitCss, hostTop + at.y * unitCss] : null, band ? look : null);
      return undefined;
    }

    // The pointer can take the hero's lamp mid-entrance: the spring inherits the
    // eased path's velocity and its stiffness ramps in, so the lamp carries its
    // momentum through the turn instead of reversing in one frame.
    const handOff = () => {
      // The entrance still ends on time, even if the pointer takes the lamp
      // before its first frame (the stage waits for it).
      if (!entranceTimer) entranceTimer = window.setTimeout(endEntrance, ENTRANCE_MS);
      const a = Math.max(entranceT - 0.01, 0);
      const b = Math.min(entranceT + 0.01, 1);
      const rate = (easeInOut(b) - easeInOut(a)) / (b - a) / (ENTRANCE_MS / 1000);
      light.vx = 0.5 * (layout.rest[0] - layout.start[0]) * rate;
      light.vy = 0.5 * (layout.rest[1] - layout.start[1]) * rate;
      entranceStart = null;
      handOffAt = -1;
    };

    // The band's geometry for Scene 04 (leadPath.js), measured from the page.
    const measureBand = () => {
      const rect = host.getBoundingClientRect();
      const y = window.scrollY;
      hostTop = rect.top + y;
      hostLeft = rect.left + window.scrollX;
      const view = window.innerHeight;
      const width = rect.width;
      const cine = document.querySelector('.cine[data-cine]');
      const stage = cine?.querySelector('.cine-stage');
      // The scroll position at which the stage unpins: its track's foot reaches
      // the screen's. Without a pinned stage, the band's top at the screen's foot.
      if (stage) {
        const track = cine.getBoundingClientRect();
        unpin = track.top + y + track.height - stage.clientHeight;
      } else {
        unpin = hostTop - view;
      }
      const lamp = reliefLayout(width, unitCss, 0).lamp;
      const heading = host.querySelector('[data-lead="line"]');
      const rest = host.querySelector('[data-lead="rest"]');
      // Scene 04's sentence, held at the centre of the screen while the light
      // reads it (a sticky box in a taller section); not held with reduced
      // motion or without the relief (the stylesheet lets it scroll).
      const moment = host.querySelector('[data-lead="moment"]');
      const held = moment ? moment.querySelector('.moment') : null;
      const sticky = held && getComputedStyle(held).position === 'sticky';
      let enterD = hostTop - unpin + 0.55 * view;
      let lineD = enterD + 0.05 * view;
      let stop = 0.6 * width;
      if (heading) {
        const box = heading.getBoundingClientRect();
        enterD = box.top + y - unpin;
        const range = document.createRange();
        range.selectNodeContents(heading);
        const lines = Array.from(range.getClientRects()).filter((r) => r.width > 1);
        const lastLine = lines[lines.length - 1] || box;
        lineD = lastLine.top + lastLine.height / 2 + y - unpin;
        stop = Math.max(lastLine.right, ...lines.map((line) => line.right)) - rect.left;
      }
      let momentGeo = null;
      words = [];
      if (heading && sticky) {
        // While held, the box sits at the top of the screen: each word's place
        // on screen then is its place in the box. The light's way runs from
        // just before the first word through every word to just past the last.
        const section = moment.getBoundingClientRect();
        const boxTop = held.getBoundingClientRect().top;
        const pinFrom = section.top + y - unpin;
        const pinTo = pinFrom + section.height - held.offsetHeight;
        const spans = Array.from(heading.querySelectorAll('[data-word]'), (el) => ({ el, box: el.getBoundingClientRect() }));
        if (spans.length) {
          const centre = (b) => [b.left + b.width / 2 - rect.left, b.top + b.height / 2 - boxTop];
          const first = spans[0].box;
          const last = spans[spans.length - 1].box;
          const points = [
            [Math.max(first.left - rect.left - 0.04 * width, 0.03 * width), centre(first)[1]],
            ...spans.map(({ box }) => centre(box)),
            [Math.min(last.right - rect.left + 0.04 * width, 0.97 * width), centre(last)[1]],
          ];
          momentGeo = { pin: [pinFrom, pinTo], points };
          words = spans.map(({ el }) => ({ el, lit: -1, near: -1 }));
          // The sentence rises into its place from below: its top meets the
          // screen's foot a screen before it is held.
          enterD = pinFrom + (first.top - boxTop);
          lineD = pinFrom + centre(first)[1];
        }
      }
      let restD = lineD + 0.6 * view;
      if (rest) {
        const box = rest.getBoundingClientRect();
        restD = box.top + box.height / 2 + y - unpin;
      }
      const lampX = waitX(width, stop);
      geo = {
        vh: view,
        hang: [lamp[0] * unitCss, lamp[1] * unitCss],
        lampX,
        enterD,
        lineD,
        restD,
        // The light comes to rest behind the closing's statement, at the centre.
        restX: 0.5 * width,
        moment: momentGeo,
      };
      timeline = leadTimeline(geo);
      zone = host.querySelector('[data-lead="zone"]');
    };

    // Where the band's lamp is for the current scroll, in canvas units, with the
    // lamp's height and pool for this point of Scene 04.
    const scripted = () => {
      if (!geo) return { x: 0, y: 0, z: 1, look: 1, phase: 'rest' };
      const scrollY = window.scrollY;
      const top = hostTop - scrollY;
      if (stillAtLoad || reduceMotion.matches) {
        if (!stillAtLoad && frozen) {
          return { x: (frozen[0] - hostLeft) / unitCss, y: (frozen[1] - hostTop) / unitCss, z: frozen[2], look: frozen[3], phase: 'rest' };
        }
        const pose = leadPose(geo);
        return { x: pose.x / unitCss, y: (pose.d - (hostTop - unpin)) / unitCss, z: 1, look: 1, phase: 'rest' };
      }
      const p = leadPath(scrollY - unpin, geo, timeline);
      return { x: p.x / unitCss, y: (p.y - top) / unitCss, z: p.z, look: p.look, phase: p.phase, progress: p.progress };
    };

    const resize = (force = false) => {
      const rect = host.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      // Soft light needs no device pixels: the shader supersamples, and fill
      // cost stays flat on dense screens.
      dpr = Math.min(window.devicePixelRatio || 1, 1);
      const width = Math.round(rect.width * dpr);
      const height = Math.round(rect.height * dpr);
      const hero = band ? document.querySelector('.hero')?.getBoundingClientRect() : null;
      const unit = band ? hero?.height || window.innerHeight : rect.height;
      // Below a pinned stage the band runs on from the stage's relief, which
      // held still through the pinned run: its pattern continues the stage's
      // from the stage's bottom edge, not from where the page has scrolled to.
      const cine = band ? document.querySelector('.cine[data-cine]') : null;
      const pinned = cine?.querySelector('.cine-stage');
      const run = pinned ? cine.offsetHeight - pinned.clientHeight : 0;
      const place = hero ? [0, (rect.top - hero.top - run) / unit] : [0, 0];
      const changed =
        width !== canvas.width || height !== canvas.height || unit !== unitCss || place[1] !== origin[1];
      unitCss = unit;
      if (band) measureBand();
      if (!force && !changed) return;
      canvas.width = width;
      canvas.height = height;
      origin = place;
      layout = config.layout(rect.width, unitCss);
      strips = [];
      drawnKey = '';
      if (!scene) return;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(scene.uRes, canvas.width, canvas.height);
      gl.uniform2f(scene.uOrigin, origin[0], origin[1]);
      gl.uniform1f(scene.uUnit, unitCss * dpr);
      gl.uniform2f(scene.uCell, layout.cell[0], layout.cell[1]);
      gl.uniform2f(scene.uDepth, layout.depth[0], layout.depth[1]);
      if (band) {
        place_();
      } else {
        if (!following) {
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
        z = layout.z;
        look = layout.look[2];
      }
      draw(true);
    };

    // The band's lamp for this frame: the script, and in Scene 05 a fine
    // pointer's share of it.
    function place_(dt = 0) {
      const p = scripted();
      const resting = p.phase === 'rest';
      const goal = resting && pointer && pointerInZone() && !reduceMotion.matches ? 1 : 0;
      let moving = false;
      if (dt) {
        [share.value, share.velocity] = spring(share.value, share.velocity, goal, dt, SHARE[0], SHARE[1]);
        if (Math.abs(share.value - goal) < 1e-3 && Math.abs(share.velocity) < 1e-3) {
          share.value = goal;
          share.velocity = 0;
        } else {
          moving = true;
        }
      } else {
        share.value = goal;
        share.velocity = 0;
      }
      if (pointer && share.value > 0) {
        const rect = host.getBoundingClientRect();
        const tx = (pointer[0] - rect.left) / unitCss;
        const ty = (pointer[1] - rect.top) / unitCss;
        if (!held.placed || !dt) {
          held.x = tx;
          held.y = ty;
          held.vx = held.vy = 0;
          held.placed = true;
        } else {
          [held.x, held.vx] = spring(held.x, held.vx, tx, dt, SPRING[0], SPRING[1]);
          [held.y, held.vy] = spring(held.y, held.vy, ty, dt, SPRING[0], SPRING[1]);
          if (Math.abs(held.x - tx) + Math.abs(held.y - ty) > 1e-4 || Math.abs(held.vx) + Math.abs(held.vy) > 1e-3) {
            moving = true;
          } else {
            held.x = tx;
            held.y = ty;
            held.vx = held.vy = 0;
          }
        }
      } else if (share.value === 0) {
        held.placed = false;
      }
      const k = share.value;
      light.x = p.x + (held.x - p.x) * k;
      light.y = p.y + (held.y - p.y) * k;
      z = layout.z * p.z;
      look = layout.look[2] * p.look;
      lightWords(p);
      return moving;
    }

    // Scene 04's sentence: each word lights as the light reading it reaches it
    // and stays lit, sharpening out of a blur, and glints while the light is
    // on it. Before the light reaches the sentence every word waits dim; with
    // no light to read it (reduced motion, no relief) every word is lit.
    function lightWords(p) {
      if (!words.length || !timeline?.path) return;
      const marks = timeline.path.marks.slice(1, -1);
      const gaps = marks.slice(1).map((m, i) => m - marks[i]);
      const soft = Math.min(Math.max(0.55 * (gaps.length ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 60), 24), 140);
      const before = p.phase === 'release' || p.phase === 'goes-first' || p.phase === 'waits';
      words.forEach((word, i) => {
        let lit = 1;
        let near = 0;
        if (before) lit = 0;
        else if (p.phase === 'sweep' && Number.isFinite(p.progress)) ({ lit, near } = wordLight(p.progress, marks[i], soft));
        lit = Math.round(lit * 100) / 100;
        near = Math.round(near * 100) / 100;
        if (lit === word.lit && near === word.near) return;
        word.lit = lit;
        word.near = near;
        word.el.style.setProperty('--lit', String(lit));
        word.el.style.setProperty('--near', String(near));
      });
    }

    function pointerInZone() {
      if (!zone || !pointer) return false;
      const r = zone.getBoundingClientRect();
      return pointer[0] >= r.left && pointer[0] <= r.right && pointer[1] >= r.top && pointer[1] <= r.bottom;
    }

    const step = (now) => {
      raf = false;
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 1 / 60;
      last = now;
      let moving = false;
      let there = false;

      if (band) {
        moving = place_(dt);
        draw(false);
        if (moving && visible && !document.hidden) kick();
        else last = 0;
        return;
      }

      if (warmStart !== null) {
        if (warmStart < 0) warmStart = now;
        const w = Math.min((now - warmStart) / WARM_MS, 1);
        intensity = easeOut(w);
        if (w < 1) moving = true;
        else warmStart = null;
      }

      if (entranceStart !== null) {
        if (entranceStart < 0) {
          entranceStart = now;
          if (!entranceTimer) entranceTimer = window.setTimeout(endEntrance, ENTRANCE_MS);
        }
        entranceT = Math.min((now - entranceStart) / ENTRANCE_MS, 1);
        const e = easeInOut(entranceT);
        light.x = layout.start[0] + (layout.rest[0] - layout.start[0]) * e;
        light.y = layout.start[1] + (layout.rest[1] - layout.start[1]) * e;
        if (entranceT >= 1) {
          entranceStart = null;
          endEntrance();
        }
        moving = true;
      } else {
        let k = SPRING[0];
        let c = SPRING[1];
        if (handOffAt !== null) {
          if (handOffAt < 0) handOffAt = now;
          const ramp = Math.min((now - handOffAt) / HANDOFF_MS, 1);
          k = SPRING[0] * Math.max(ramp, 0.05);
          c = 2 * Math.sqrt(k);
          if (ramp >= 1) handOffAt = null;
        }
        [light.x, light.vx] = spring(light.x, light.vx, target.x, dt, k, c);
        [light.y, light.vy] = spring(light.y, light.vy, target.y, dt, k, c);
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
        // Within a quarter of a pixel of its target and all but still, the lamp
        // is drawn there: the frames it takes to close the gap would change the
        // picture by a grey level at most, so they repeat it and are not drawn
        // (F29). The spring itself steps on to rest.
        const near = 0.25 / unitCss;
        there =
          Math.hypot(light.x - target.x, light.y - target.y) < near && Math.hypot(light.vx, light.vy) < 10 * near;
      }

      draw(false, there ? target : light);
      if (moving && visible && !document.hidden) kick();
      else last = 0;
    };

    function kick() {
      if (raf || disposed || lost || !visible || document.hidden) return;
      raf = true;
      requestFrame(key, step);
    }

    // The hero's lamp goes where a mouse is over the hero; beyond the hero's
    // edges it keeps to the nearest point inside them, so leaving the hero the
    // light stays with the hand at its edge instead of sweeping off on its own.
    const follow = () => {
      if (!pointer) return;
      const rect = host.getBoundingClientRect();
      const [cx, cy] = pointer;
      const inside = cx >= rect.left && cx <= rect.right && cy >= rect.top && cy <= rect.bottom;
      if (!following && !inside) return;
      if (!following && entranceStart !== null) handOff();
      following = true;
      const x = Math.min(Math.max(cx - rect.left, 0), rect.width);
      const y = Math.min(Math.max(cy - rect.top, 0), rect.height);
      target.x = x / unitCss;
      target.y = Math.max(y / unitCss, 0.02);
      kick();
    };

    const onPointerMove = (event) => {
      // The band answers to what the grid answers to (a mouse or a pen); the
      // hero's lamp to a mouse.
      if (band ? event.pointerType === 'touch' : event.pointerType !== 'mouse') return;
      if (reduceMotion.matches) return;
      pointer = [event.clientX, event.clientY];
      if (band) {
        if (visible) kick();
        return;
      }
      // A mouse on a touch-first device still moves the light: the event says
      // it is a mouse, whatever the device's primary pointer is.
      if (!visible && !following) return;
      follow();
    };

    // The pointer leaves the window: the hero's light stays where the hand left
    // it; the band's goes back to its rest.
    const onPointerLeave = () => {
      pointer = null;
      if (band) kick();
    };

    const onScroll = () => {
      if (band) {
        if (!ready && past()) {
          ready = true;
          resize(true);
        }
        kick();
        return;
      }
      // The page moves under a still mouse: the light stays under it.
      if (following && pointer && visible) follow();
    };

    const onVisibility = () => {
      if (!document.hidden) kick();
    };

    // A lost context shows the CSS light (hero) or the plain ground (band)
    // until it is restored, rather than a blank canvas.
    // The page keeps its shape (no closing up), and the lamp is released, so
    // the stage's joins fade as they do with no lamp beside them.
    const onLost = (event) => {
      event.preventDefault();
      lost = true;
      raf = false;
      cancelFrame(key);
      host.dataset.field = 'off';
      shown = false;
      clearLamp(variant);
      // No light to read Scene 04's sentence: every word lit.
      for (const word of words) {
        word.lit = word.near = -1;
        word.el.style.removeProperty('--lit');
        word.el.style.removeProperty('--near');
      }
    };

    const onRestored = () => {
      lost = false;
      scene = createScene(gl);
      if (!scene) {
        host.dataset.field = 'off';
        return;
      }
      last = 0;
      resize(true);
      kick();
    };

    const onEntrance = (name) => {
      if (name !== 'entrance' || ready) return;
      ready = true;
      resize(true);
    };
    const unlisten = band ? onLamp(onEntrance) : null;

    const onReduce = () => {
      if (band) {
        frozen = reduceMotion.matches
          ? [hostLeft + light.x * unitCss, hostTop + light.y * unitCss, z / layout.z, look / layout.look[2]]
          : null;
        resize(true);
        return;
      }
      if (reduceMotion.matches) {
        // An entrance that has not started yet is over: the stage must not wait.
        endEntrance();
        following = false;
        pointer = null;
        entranceStart = null;
        warmStart = null;
        intensity = 1;
        target.x = layout.rest[0];
        target.y = layout.rest[1];
        light.x = target.x;
        light.y = target.y;
        light.vx = light.vy = 0;
        draw(true);
      }
    };

    resize(true);
    if (entranceStart !== null) kick();

    const resizeObserver = new ResizeObserver(() => resize());
    resizeObserver.observe(host);
    // The band keeps its place in the hero's pattern and its geometry for
    // Scene 04: what sits above it (the hero, the stage's run) can change height.
    if (band) {
      for (const above of document.querySelectorAll('.hero, .cine')) resizeObserver.observe(above);
    }
    // The band counts as in view a little before it is, so its lamp is in place
    // for the stage's exit, which it lights.
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (!visible) return;
        if (band) resize();
        kick();
      },
      band ? { rootMargin: '50% 0px 50% 0px' } : undefined
    );
    visibilityObserver.observe(host);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    reduceMotion.addEventListener('change', onReduce);
    canvas.addEventListener('webglcontextlost', onLost);
    canvas.addEventListener('webglcontextrestored', onRestored);
    // Web fonts can rewrap the sentence after the first measure.
    if (band) {
      document.fonts?.ready.then(() => {
        if (!disposed) resize(true);
      });
    }

    return () => {
      disposed = true;
      cancelFrame(key);
      window.clearTimeout(entranceTimer);
      unlisten?.();
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);
      reduceMotion.removeEventListener('change', onReduce);
      canvas.removeEventListener('webglcontextlost', onLost);
      canvas.removeEventListener('webglcontextrestored', onRestored);
      if (scene && !lost) {
        gl.deleteBuffer(scene.buffer);
        gl.deleteProgram(scene.program);
      }
      clearLamp(variant);
    };
  }, [variant]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
