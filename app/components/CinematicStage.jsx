'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { createStageRenderer } from './stageRenderer';
import { reliefLayout, reliefLift, stageEdges, stageFocus, stageFrame, stageLayout } from './stageScript';

// Scrubbing follows the scroll through a critically damped spring, so a change
// of direction carries its momentum. A mouse wheel scrolls in separate steps, so
// it gets a soft spring (stiffness 40) that blends them into one move; a
// trackpad, a finger or the keyboard already scroll smoothly, so they get a
// firmer one (stiffness 120) that follows without lag. The spring eases from
// one to the other over about 200 ms, and it is solved exactly each frame, so it
// moves the same at any frame rate.
const SCRUB_WHEEL = Math.sqrt(40);
const SCRUB_GLIDE = Math.sqrt(120);
const SCRUB_EASE = 0.2;
// Close enough to the scroll to stop drawing (in shares of the pinned run, and
// per second): what is left to move is well under a pixel on screen.
const SCRUB_REST = [2e-5, 2e-4];
// The pointer-held lamp uses the hero's spring.
const LAMP = [170, 26];
const DPR_STEPS = [2, 1.5, 1, 0.75];
// The stage wakes once the hero's entrance has played: its relief draws at
// once and its textures start loading. If they take longer than the patience
// to arrive, the page goes back to plain sections once the stage is off screen.
// A subject whose texture lands while the stage is on screen joins it over
// ARRIVAL seconds: the garment as it stands unlit, in its shade, then its light.
const QUIET_START = 2000;
const TEXTURE_PATIENCE = 12000;
const ARRIVAL = { garment: 0.4, atlas: 0.3 };
// The garment's matte, for telling whether the pointer is on it: image px per cell.
const MATTE_CELL = 16;
// On touch, only a deliberate still press takes the light: a swipe is a scroll.
const PRESS_MS = 400;
const PRESS_SLOP = 10;
// Text is lit and dimmed as states, never scrubbed: about 300 ms in, 200 ms out.
const LIGHT_IN = 0.09;
const LIGHT_OUT = 0.06;

const clamp01 = (x) => Math.min(Math.max(x, 0), 1);

// A coarse matte of the garment from its texture's alpha, grown by two cells so
// the pointer counts as on the garment just past its edge.
function buildMatte(image) {
  const w = Math.ceil(image.width / MATTE_CELL);
  const h = Math.ceil(image.height / MATTE_CELL);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(image, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h).data;
  const cells = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[4 * (y * w + x) + 3] < 96) continue;
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const yy = y + dy;
          const xx = x + dx;
          if (yy >= 0 && yy < h && xx >= 0 && xx < w) cells[yy * w + xx] = 1;
        }
      }
    }
  }
  return { w, h, cells };
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.decoding = 'async';
    img.onload = () => (img.decode ? img.decode().catch(() => {}) : Promise.resolve()).then(() => resolve(img));
    img.onerror = reject;
    img.src = src;
  });
}

// Decode off the main thread into a premultiplied bitmap; an image element is
// the fallback where createImageBitmap or its options are missing.
async function decode(src) {
  const response = await fetch(src);
  if (!response.ok) throw new Error(`${src}: ${response.status}`);
  const blob = await response.blob();
  if (window.createImageBitmap) {
    try {
      return await window.createImageBitmap(blob, { premultiplyAlpha: 'premultiply', colorSpaceConversion: 'none' });
    } catch {
      // fall through to an image element
    }
  }
  const url = URL.createObjectURL(blob);
  try {
    return await loadImage(url);
  } finally {
    URL.revokeObjectURL(url);
  }
}

// Scenes A and B share one pinned stage in front of the hero's relief, which
// stays lit throughout: the garment waits unlit in its shade until light falls
// on it, and goes dark again before it leaves; after a pause the statement is
// lit and a plane of light draws the stack out of the dark.
// The relief needs no texture, so it is there as soon as the stage wakes; each
// subject joins it when its texture arrives.
// Without WebGL, without script or with reduced motion, the same markup stays
// two ordinary sections.
export default function CinematicStage() {
  const trackRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    const stage = track?.querySelector('.cine-stage');
    const canvas = track?.querySelector('.cine-canvas');
    if (!track || !stage || !canvas) return undefined;
    // The stage's background continues the hero's relief.
    const hero = document.querySelector('.hero');
    const statementBlock = track.querySelector('.cine-stack .cine-block');

    // Moving between the static and pinned layouts changes the page's height.
    // Keep the reader where they are: below the stage, shift by the difference;
    // inside it, keep their relative place. The jump bypasses the page's smooth
    // scrolling without relying on behavior: 'instant', which older Safari rejects.
    const jumpTo = (top) => {
      const root = document.documentElement;
      const behavior = root.style.scrollBehavior;
      root.style.scrollBehavior = 'auto';
      window.scrollTo(0, top);
      root.style.scrollBehavior = behavior;
    };
    const setLayoutMode = (mode) => {
      const before = track.getBoundingClientRect();
      const top = before.top + window.scrollY;
      if (mode) {
        track.dataset.cine = mode;
      } else {
        delete track.dataset.cine;
        delete document.documentElement.dataset.stage;
      }
      const after = track.getBoundingClientRect();
      const y = window.scrollY;
      if (y >= top + before.height) {
        jumpTo(y + after.height - before.height);
      } else if (y > top) {
        jumpTo(top + ((y - top) / Math.max(before.height, 1)) * after.height);
      }
    };

    // The head script may already have pinned the stage; without motion or a
    // hardware-rendered WebGL context, it goes back to plain sections.
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const renderer = reduceMotion.matches ? null : createStageRenderer(canvas);
    if (!renderer) {
      if (track.dataset.cine || document.documentElement.dataset.stage) setLayoutMode(null);
      return undefined;
    }

    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const copies = Array.from(track.querySelectorAll('[data-copy]')).sort(
      (a, b) => Number(a.dataset.copy) - Number(b.dataset.copy)
    );
    // Scene A's heading is lit from first paint, as the stylesheet shows it.
    const lights = copies.map((_, i) => ({
      on: i === 0,
      value: i === 0 ? 1 : 0,
      written: i === 0 ? 1 : -1,
      events: i === 0 ? 'auto' : '',
    }));
    const mounted = performance.now();

    let width = 1;
    let height = 1;
    let unit = 1;
    let layout = stageLayout(1, 1);
    const startStep = Math.max(
      DPR_STEPS.findIndex((step) => step <= Math.min(window.devicePixelRatio || 1, 2)),
      0
    );
    let dprStep = startStep;
    // The finest step the stage may return to: one that fails again within a few
    // seconds of the stage stepping back up to it is not tried again.
    let ceiling = startStep;
    let raisedTo = -1;
    let raisedAt = -Infinity;
    let cadence = 1000 / 60;
    let slow = 0;
    let fast = 0;
    let t = 0;
    let tv = 0;
    let target = 0;
    let scrub = SCRUB_WHEEL;
    let scrubGoal = SCRUB_WHEEL;
    let lastWheel = -Infinity;
    let stageTop = 0;
    let trackTop = 0;
    let visible = false;
    let snap = true;
    // The lamp as the visitor holds it: a point in stage pixels and a share.
    const held = { x: 0, y: 0, vx: 0, vy: 0, w: 0, vw: 0, placed: false };
    // The pointer in stage pixels; `moved` until the page next scrolls.
    let pointer = null;
    let grabbed = false;
    let press = null;
    let matte = null;
    let raf = 0;
    let last = 0;
    let lost = false;
    let disposed = false;
    let fresh = false;
    let awake = false;
    // How far each subject has faded in since its texture arrived, 0..1.
    const arrival = { garment: 0, atlas: 0 };
    const timers = new Set();
    const later = (fn, ms) => {
      const id = window.setTimeout(() => {
        timers.delete(id);
        fn();
      }, ms);
      timers.add(id);
      return id;
    };
    const cancel = (id) => {
      window.clearTimeout(id);
      timers.delete(id);
    };

    // The display's frame interval, learned once the hero's entrance has played,
    // so slow frames are judged against the display and not against the entrance.
    later(() => {
      const stamps = [];
      const sample = (now) => {
        stamps.push(now);
        if (stamps.length < 21 && !disposed) {
          requestAnimationFrame(sample);
          return;
        }
        const gaps = stamps.slice(1).map((s, i) => s - stamps[i]).sort((a, b) => a - b);
        if (gaps.length) cadence = Math.min(Math.max(gaps[Math.floor(gaps.length / 4)], 1000 / 120), 50);
      };
      requestAnimationFrame(sample);
    }, QUIET_START);

    const measure = () => {
      const rect = track.getBoundingClientRect();
      const view = window.innerHeight;
      // One unit throughout: the pinned run is 0..1, and the approach before it
      // counts in the same unit, so the motion keeps its pace through the pin.
      target = -rect.top / Math.max(rect.height - height, 1);
      stageTop = rect.top > 0 ? rect.top : Math.min(0, rect.bottom - height);
      trackTop = rect.top;
      visible = rect.bottom > 0 && rect.top < view;
    };

    const resize = () => {
      width = stage.clientWidth;
      height = stage.clientHeight;
      // Scene B's copy is lit before the stack is drawn, so the stack keeps below it.
      const statement = statementBlock
        ? statementBlock.getBoundingClientRect().bottom - stage.getBoundingClientRect().top
        : 0;
      layout = stageLayout(width, height, window.innerHeight / Math.max(track.offsetHeight - height, 1), statement);
      // The relief's unit is the hero's height, and its pattern starts at the
      // hero's top, so the stage's folds run on from the hero's.
      const heroRect = hero?.getBoundingClientRect();
      unit = heroRect?.height || window.innerHeight;
      renderer.setRelief(reliefLayout(width, unit, heroRect ? track.getBoundingClientRect().top - heroRect.top : 0));
      // The relief is supersampled on a low-density screen, decided once: a
      // lower step must cost less than the one it replaces.
      renderer.resize(width, height, DPR_STEPS[dprStep], dprStep === startStep && DPR_STEPS[startStep] < 1.5);
    };

    const render = (frame) => {
      lights.forEach((light, i) => {
        const v = Math.round(light.value * 1000) / 1000;
        if (v !== light.written && copies[i]) {
          light.written = v;
          copies[i].style.opacity = String(v);
        }
        // Unlit text lets the pointer through, so selecting a lit line never
        // catches the unlit one stacked over it.
        const events = light.on ? 'auto' : 'none';
        if (events !== light.events && copies[i]) {
          light.events = events;
          copies[i].style.pointerEvents = events;
        }
      });
      if (lost || !awake || !renderer.live) return;
      renderer.draw(frame, stageEdges(stageTop, height, unit, trackTop - stageTop), reliefLift(stageTop, unit));
      if (track.dataset.cine === 'pending') track.dataset.cine = 'on';
    };

    const step = (now) => {
      raf = 0;
      const gap = last ? now - last : 0;
      // The explicit springs below need a short step; the scrub is exact, so it
      // only guards against a long pause.
      const dt = last ? Math.min(gap / 1000, 1 / 30) : 1 / 60;
      const scrubDt = last ? Math.min(gap / 1000, 0.25) : 1 / 60;
      // A stage that cannot keep up with the display drops resolution; one that
      // has run fast for a while takes it back.
      if (last) {
        slow = gap > 1.6 * cadence ? slow + 1 : Math.max(slow - 1, 0);
        fast = gap < 1.2 * cadence ? fast + 1 : 0;
        if (slow > 24 && dprStep < DPR_STEPS.length - 1) {
          if (dprStep === raisedTo && now - raisedAt < 3000) ceiling = dprStep + 1;
          dprStep += 1;
          slow = 0;
          fast = 0;
          resize();
        } else if (fast > 180 && dprStep > ceiling) {
          dprStep -= 1;
          raisedTo = dprStep;
          raisedAt = now;
          fast = 0;
          resize();
        }
      }
      last = now;
      measure();
      // Textures that never came: the stage stands down once the reader is
      // not looking at it, so the page does not change under them.
      if (tired && !visible) {
        standDown();
        return;
      }

      let moving = false;
      const jump = snap || !visible;
      if (jump) {
        t = target;
        tv = 0;
        snap = !visible;
      } else {
        scrub += (scrubGoal - scrub) * (1 - Math.exp(-scrubDt / SCRUB_EASE));
        const x = t - target;
        const c = tv + scrub * x;
        const decay = Math.exp(-scrub * scrubDt);
        t = target + (x + c * scrubDt) * decay;
        tv = (tv - scrub * c * scrubDt) * decay;
        if (Math.abs(t - target) < SCRUB_REST[0] && Math.abs(tv) < SCRUB_REST[1]) {
          t = target;
          tv = 0;
        } else {
          moving = true;
        }
      }

      const frame = stageFrame(t, layout, width, height);
      // A subject whose texture has just arrived joins the scene where the
      // reader is looking; off screen it is simply there. The relief behind it
      // is already showing. The garment comes as it stands unlit, its shade
      // and then its dark form, and only then its light, so it is never seen
      // through; the stack fades in.
      for (const name of ['garment', 'atlas']) {
        if (!renderer.has(name) || arrival[name] >= 1) continue;
        arrival[name] = visible ? Math.min(arrival[name] + dt / ARRIVAL[name], 1) : 1;
        if (arrival[name] < 1) moving = true;
      }
      const arrived = (x) => {
        const y = clamp01(x);
        return y * y * (3 - 2 * y);
      };
      if (frame.scene === 'garment') {
        frame.present *= arrived(2 * arrival.garment);
        frame.light *= arrived(2 * arrival.garment - 1);
      } else {
        frame.show *= arrived(arrival.atlas);
      }

      // The held lamp springs in stage pixels, towards the pointer while one is
      // there and back onto the scripted lamp when it leaves, so it stays under
      // the cursor while the page scrolls. Only a moving pointer moves it: moving
      // on the subject leans the lamp until the page next scrolls; in a hold,
      // moving on the subject takes the lamp and moving off it lets go, while a
      // still pointer keeps what it has until the hold ends. A pointer anywhere
      // else changes nothing.
      const zoom = frame.scene === 'garment' ? frame.zoomGarment : frame.zoom;
      const origin = frame.scene === 'garment' ? frame.cam : frame.center;
      const sx = frame.anchor[0] + (frame.lamp[0] - origin[0]) * zoom;
      const sy = frame.anchor[1] + (frame.lamp[1] - origin[1]) * zoom;
      const leaning = Boolean(pointer?.moved) && onSubject(frame, pointer.x, pointer.y);
      if (!pointer || frame.hold <= 0) grabbed = false;
      else if (pointer.moved) grabbed = leaning;
      const reach = Math.max(grabbed ? frame.hold : 0, leaning ? frame.lean : 0);
      const aim = pointer ? [pointer.x, pointer.y, reach] : [sx, sy, 0];
      if (!held.placed) {
        held.x = aim[0];
        held.y = aim[1];
        held.placed = true;
      }
      // Once the visitor's share has gone, the held point just sits on the
      // scripted lamp; springing it there would keep drawing identical frames.
      if (!pointer && Math.abs(held.w) < 1e-3 && Math.abs(held.vw) < 1e-3) {
        held.x = aim[0];
        held.y = aim[1];
        held.vx = held.vy = held.w = held.vw = 0;
      }
      const [k, c] = LAMP;
      held.vx += (-k * (held.x - aim[0]) - c * held.vx) * dt;
      held.vy += (-k * (held.y - aim[1]) - c * held.vy) * dt;
      held.vw += (-k * (held.w - aim[2]) - c * held.vw) * dt;
      held.x += held.vx * dt;
      held.y += held.vy * dt;
      held.w += held.vw * dt;
      if (
        Math.abs(held.x - aim[0]) + Math.abs(held.y - aim[1]) < 0.05 &&
        Math.abs(held.vx) + Math.abs(held.vy) < 0.05 &&
        Math.abs(held.w - aim[2]) < 1e-3 &&
        Math.abs(held.vw) < 1e-3
      ) {
        held.x = aim[0];
        held.y = aim[1];
        held.w = aim[2];
        held.vx = held.vy = held.vw = 0;
      } else {
        moving = true;
      }
      const share = clamp01(held.w);
      frame.lamp[0] = origin[0] + (sx + (held.x - sx) * share - frame.anchor[0]) / zoom;
      frame.lamp[1] = origin[1] + (sy + (held.y - sy) * share - frame.anchor[1]) / zoom;
      // A held lamp narrows and models the image: away from it the image falls
      // darker, and let go, the image returns to its photographed light. In
      // scene B the sheets keep a floor of light and the focus follows the
      // lamp into the layers.
      frame.fill = Math.max(frame.fill * (1 - 0.75 * share), Math.min(frame.fill, frame.floor));
      frame.radius += (frame.heldRadius - frame.radius) * share;
      stageFocus(frame);

      // Each text block switches on past 0.65 and off below 0.35 of its cue,
      // then eases there; off screen it lands on the state directly.
      frame.copy.forEach((cue, i) => {
        const light = lights[i];
        light.on = light.on ? cue > 0.35 : cue > 0.65;
        const goal = light.on ? 1 : 0;
        if (!visible) {
          light.value = goal;
        } else {
          light.value += (goal - light.value) * (1 - Math.exp(-dt / (light.on ? LIGHT_IN : LIGHT_OUT)));
          if (Math.abs(goal - light.value) < 0.002) light.value = goal;
          else moving = true;
        }
      });

      // A first frame is drawn as soon as the stage wakes, and again as each
      // texture arrives, even off screen, so the canvas is already showing
      // when the reader reaches it.
      if (visible || fresh) render(frame);
      fresh = false;
      if (moving && visible && !document.hidden) raf = requestAnimationFrame(step);
      else last = 0;
    };

    const kick = () => {
      if (!raf && !disposed && !document.hidden) raf = requestAnimationFrame(step);
    };

    // Whether a stage point is on the scene's subject: the garment's matte, or
    // the sheets of the stack.
    const onSubject = (frame, x, y) => {
      if (frame.scene === 'garment') {
        if (!matte) return false;
        const cx = Math.floor((frame.cam[0] + (x - frame.anchor[0]) / frame.zoomGarment) / MATTE_CELL);
        const cy = Math.floor((frame.cam[1] + (y - frame.anchor[1]) / frame.zoomGarment) / MATTE_CELL);
        return cx >= 0 && cy >= 0 && cx < matte.w && cy < matte.h && matte.cells[cy * matte.w + cx] === 1;
      }
      const rx = frame.center[0] + (x - frame.anchor[0]) / frame.zoom;
      const ry = frame.center[1] + (y - frame.anchor[1]) / frame.zoom;
      return frame.sheets.some(
        ({ rect: [sx, sy, sw, sh] }) => rx >= sx - 24 && rx <= sx + sw + 24 && ry >= sy - 24 && ry <= sy + sh + 24
      );
    };

    // Some engines send a pointermove after scrolling under a still mouse; only a
    // change of position counts as moving.
    const onPointerMove = (event) => {
      if (event.pointerType !== 'mouse' || !finePointer.matches) return;
      const y = event.clientY - stageTop;
      const inside = visible && y >= 0 && y <= height;
      const moved = !pointer || pointer.moved || pointer.cx !== event.clientX || pointer.cy !== event.clientY;
      pointer = inside
        ? { x: event.clientX - stage.getBoundingClientRect().left, y, cx: event.clientX, cy: event.clientY, moved }
        : null;
      kick();
    };

    const onPointerLeave = () => {
      if (pointer?.touch) return;
      pointer = null;
      kick();
    };

    // On touch screens a still press takes the light and holds it while the
    // finger stays put; any movement or scroll lets go, so a swipe stays a scroll.
    const letGo = () => {
      if (!press) return;
      cancel(press.timer);
      press = null;
      if (pointer?.touch) pointer = null;
      kick();
    };
    const onTouchStart = (event) => {
      letGo();
      if (event.touches.length !== 1) return;
      const touch = event.touches[0];
      press = { x: touch.clientX, y: touch.clientY };
      press.timer = later(() => {
        if (!press) return;
        const rect = stage.getBoundingClientRect();
        pointer = { x: press.x - rect.left, y: press.y - rect.top, moved: true, touch: true };
        kick();
      }, PRESS_MS);
    };
    const onTouchMove = (event) => {
      const touch = event.touches[0];
      if (press && touch && Math.hypot(touch.clientX - press.x, touch.clientY - press.y) > PRESS_SLOP) letGo();
    };

    // Scrolling hands the lamp back to the film, except where a hold keeps it;
    // and a reader already scrolling away from the hero does not wait out its entrance.
    const onScroll = () => {
      if (press) letGo();
      if (pointer && !pointer.touch) pointer.moved = false;
      if (!loading && window.scrollY > 0.25 * window.innerHeight) load(true);
      kick();
    };

    // An in-page link that crosses the stage, and keyboard focus moving with Tab,
    // jump instead of scrolling smoothly, so the film does not flash past on the
    // way to the roles; the scene lands where the jump does. The focus target is
    // not known before the browser scrolls to it, so every Tab-driven scroll
    // jumps while the stage is running.
    let jumping = 0;
    let savedBehavior = '';
    const jumpOnce = () => {
      snap = true;
      kick();
      if (jumping) return;
      const root = document.documentElement;
      savedBehavior = root.style.scrollBehavior;
      root.style.scrollBehavior = 'auto';
      jumping = requestAnimationFrame(() => {
        jumping = 0;
        root.style.scrollBehavior = savedBehavior;
      });
    };
    const onLinkClick = (event) => {
      const link = event.target.closest?.('a[href^="#"]');
      const destination = link && document.getElementById(link.getAttribute('href').slice(1));
      if (!destination) return;
      const rect = track.getBoundingClientRect();
      const there = destination.getBoundingClientRect().top;
      if ((rect.top > 0 && there > rect.bottom) || (rect.bottom < window.innerHeight && there < rect.top)) jumpOnce();
    };
    const onKeyDown = (event) => {
      if (event.key === 'Tab') jumpOnce();
      else scrubGoal = SCRUB_GLIDE;
    };

    // A wheel step is a line-based delta, or a large one after a pause; a
    // trackpad sends a stream of small ones.
    const onWheel = (event) => {
      const now = event.timeStamp;
      const notch = event.deltaMode === 1 || (Math.abs(event.deltaY) >= 50 && now - lastWheel > 40);
      lastWheel = now;
      scrubGoal = notch ? SCRUB_WHEEL : SCRUB_GLIDE;
    };

    const onTouchScroll = () => {
      scrubGoal = SCRUB_GLIDE;
    };

    const onVisibility = () => {
      if (!document.hidden) kick();
    };

    const onReduce = () => {
      if (!reduceMotion.matches) return;
      setLayoutMode(null);
      dispose();
    };

    const onLost = (event) => {
      event.preventDefault();
      lost = true;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    const onRestored = () => {
      lost = false;
      if (!renderer.restore()) {
        setLayoutMode(null);
        dispose();
        return;
      }
      resize();
      snap = true;
      kick();
      // A texture that arrived while the context was lost is uploaded now.
      if (queue.length && !uploading) {
        uploading = true;
        requestAnimationFrame(upload);
      }
    };

    // The stage wakes after the page itself has loaded, or as soon as the
    // reader nears the stage, but never during the hero's entrance; a reader
    // already scrolling away from the hero wakes it at once. Awake, it draws
    // the relief and loads the textures, each uploaded in its own frame as it
    // arrives. On a connection too slow to bring them in time, the stage
    // stands down.
    let loading = false;
    let patience = 0;
    let tired = false;
    const standDown = () => {
      if (disposed) return;
      setLayoutMode(null);
      dispose();
    };
    const giveUp = () => {
      tired = true;
      kick();
    };
    const queue = [];
    let uploading = false;
    const upload = () => {
      uploading = false;
      if (disposed || lost || !queue.length) return;
      const [name, image] = queue.shift();
      renderer.setImage(name, image);
      if (name === 'garment') {
        later(() => {
          if (!disposed) matte = buildMatte(image);
        }, 0);
      }
      snap = true;
      fresh = true;
      kick();
      if (queue.length) {
        uploading = true;
        requestAnimationFrame(upload);
      }
    };
    const load = (now) => {
      if (loading || disposed) return;
      const wait = now === true ? 0 : mounted + QUIET_START - performance.now();
      if (wait > 0) {
        later(load, wait);
        return;
      }
      loading = true;
      awake = true;
      fresh = true;
      kick();
      patience = later(giveUp, TEXTURE_PATIENCE);
      let pending = 2;
      for (const [name, src] of [
        ['garment', '/images/stage/garment.webp'],
        ['atlas', '/images/stage/layers.webp'],
      ]) {
        decode(src)
          .then((image) => {
            if (disposed) {
              image.close?.();
              return;
            }
            pending -= 1;
            if (!pending) {
              cancel(patience);
              tired = false;
            }
            queue.push([name, image]);
            if (!uploading) {
              uploading = true;
              requestAnimationFrame(upload);
            }
          })
          .catch(giveUp);
      }
    };
    const nearObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) load();
      },
      { rootMargin: '200% 0px' }
    );
    let idle = 0;
    const onLoad = () => {
      idle = window.requestIdleCallback ? window.requestIdleCallback(load, { timeout: 2500 }) : later(load, 1200);
    };

    setLayoutMode('pending');
    resize();
    measure();
    kick();
    // A page that opens below the hero (a reload, a link to a section) wakes
    // the stage at once.
    if (window.scrollY > 0.25 * window.innerHeight) load(true);

    const resizeObserver = new ResizeObserver(() => {
      resize();
      snap = true;
      kick();
    });
    resizeObserver.observe(stage);
    if (hero) resizeObserver.observe(hero);
    // The web font can rewrap scene B's copy after the first measure.
    if (statementBlock) resizeObserver.observe(statementBlock);
    nearObserver.observe(track);
    if (document.readyState === 'complete') onLoad();
    else window.addEventListener('load', onLoad, { once: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onTouchScroll, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onPointerLeave);
    stage.addEventListener('touchstart', onTouchStart, { passive: true });
    stage.addEventListener('touchmove', onTouchMove, { passive: true });
    stage.addEventListener('touchend', letGo, { passive: true });
    stage.addEventListener('touchcancel', letGo, { passive: true });
    document.addEventListener('click', onLinkClick, true);
    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('visibilitychange', onVisibility);
    reduceMotion.addEventListener('change', onReduce);
    canvas.addEventListener('webglcontextlost', onLost);
    canvas.addEventListener('webglcontextrestored', onRestored);

    function dispose() {
      if (disposed) return;
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      if (jumping) {
        cancelAnimationFrame(jumping);
        jumping = 0;
        document.documentElement.style.scrollBehavior = savedBehavior;
      }
      if (idle && window.cancelIdleCallback) window.cancelIdleCallback(idle);
      for (const id of timers) window.clearTimeout(id);
      timers.clear();
      resizeObserver.disconnect();
      nearObserver.disconnect();
      window.removeEventListener('load', onLoad);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchScroll);
      window.removeEventListener('pointermove', onPointerMove);
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);
      stage.removeEventListener('touchstart', onTouchStart);
      stage.removeEventListener('touchmove', onTouchMove);
      stage.removeEventListener('touchend', letGo);
      stage.removeEventListener('touchcancel', letGo);
      document.removeEventListener('click', onLinkClick, true);
      document.removeEventListener('keydown', onKeyDown, true);
      document.removeEventListener('visibilitychange', onVisibility);
      reduceMotion.removeEventListener('change', onReduce);
      canvas.removeEventListener('webglcontextlost', onLost);
      canvas.removeEventListener('webglcontextrestored', onRestored);
      copies.forEach((copy) => {
        copy.style.removeProperty('opacity');
        copy.style.removeProperty('pointer-events');
      });
      for (const [, image] of queue.splice(0)) image.close?.();
      renderer.destroy();
    }

    return () => {
      dispose();
      delete track.dataset.cine;
      delete document.documentElement.dataset.stage;
    };
  }, []);

  return (
    <div ref={trackRef} className="cine">
      <div className="cine-stage">
        <canvas className="cine-canvas" aria-hidden="true" />

        <section aria-labelledby="worn" className="cine-scene cine-garment wrap pt-[clamp(3rem,5vw,4rem)]">
          <div className="grid grid-cols-1 items-start gap-y-8 md:grid-cols-12 md:gap-x-6">
            <div className="cine-copy md:col-span-5" data-copy="0">
              <h2 id="worn" className="t-statement">
                Worn, not carried.
              </h2>
              <p className="t-body mt-5 max-w-[28ch]">Designed for the moment conditions stop being ideal.</p>
            </div>
            <div
              className="cine-media -mx-[var(--gutter)] md:col-span-7 md:mx-0 md:mr-[calc(var(--gutter)*-1)]"
              role="img"
              aria-label="A close-fitting dark garment with contoured panels"
            >
              <Image
                src="/images/garment.png"
                alt=""
                width={1536}
                height={1024}
                sizes="(min-width: 768px) 68vw, 100vw"
                className="garment-img"
              />
            </div>
          </div>
        </section>

        <section aria-labelledby="complexity" className="cine-scene cine-stack wrap pt-[clamp(7rem,13vw,11rem)]">
          <div className="grid grid-cols-1 gap-y-12 md:grid-cols-12 md:items-center md:gap-x-6">
            <div className="cine-block md:col-span-5">
              <h2 id="complexity" className="t-statement max-w-[15ch]" data-copy="1">
                Its complexity is not visible.
              </h2>
              <div className="cine-lines mt-6">
                <p className="t-lead text-ink-2" data-copy="2">
                  By design.
                </p>
                <p className="t-lead text-ink-2" data-copy="3">
                  Silently present.
                </p>
              </div>
            </div>
            <div
              className="cine-media w-full max-w-[19rem] md:col-span-7 md:max-w-[26rem] md:justify-self-center"
              role="img"
              aria-label="Layered material, shown separated"
            >
              <Image
                src="/images/6 layers textile.png"
                alt=""
                width={1024}
                height={1536}
                sizes="(min-width: 768px) 26rem, 19rem"
                className="layers-img"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
