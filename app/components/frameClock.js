// One animation frame for every canvas on the page, run in a fixed order: the
// hero, then the band (the relief under Scenes 04 and 05), then the stage, then
// the grid. A lamp moved in a frame therefore lights every surface it reaches in
// that same frame: the stage draws its joins with the hero's and the band's
// lamps as they are now, and the grid's light sits on the relief's, never a
// frame behind (pageLamp.js).
//
// requestFrame(key, fn) queues fn for the next frame, once per key. A key queued
// while the frame is running, by an earlier step (a lamp that moved), runs in
// the same frame if it comes later in the order; otherwise in the next.

export const ORDER = { hero: 0, band: 1, stage: 2, grid: 3 };

const queue = new Map();
let raf = 0;
let running = false;
let floor = -Infinity;
let ran = null;

function run(now) {
  raf = 0;
  running = true;
  floor = -Infinity;
  ran = new Set();
  for (;;) {
    let next = null;
    for (const [key, item] of queue) {
      if (ran.has(key) || item.order < floor) continue;
      if (!next || item.order < next[1].order) next = [key, item];
    }
    if (!next) break;
    const [key, item] = next;
    queue.delete(key);
    ran.add(key);
    floor = item.order;
    try {
      item.fn(now);
    } catch (error) {
      // One surface failing must not stop the others.
      setTimeout(() => {
        throw error;
      });
    }
  }
  running = false;
  ran = null;
  if (queue.size && !raf) raf = requestAnimationFrame(run);
}

export function requestFrame(key, fn) {
  const order = ORDER[key.split(':')[0]] ?? 9;
  queue.set(key, { order, fn });
  if (!raf && !running) raf = requestAnimationFrame(run);
  else if (running && (ran.has(key) || order < floor) && !raf) raf = requestAnimationFrame(run);
}

export function cancelFrame(key) {
  queue.delete(key);
}

export function frameQueued(key) {
  return queue.has(key);
}
