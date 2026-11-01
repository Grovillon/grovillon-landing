// The page's lamps, shared where two reliefs meet: the hero's lamp (which the
// pointer moves) and the grid band's. Where the stage's relief meets the hero's
// it is lit by the hero's lamp, and where it meets the band's, by the band's,
// so the surface runs on unbroken from one section into the next. Positions are
// in the hero's units (its height), in the hero's pattern; `gain` scales the
// light (the hero's warms up as the page opens).

const listeners = new Set();

export const lamps = { hero: null, band: null };

// `page` is the lamp's position on the page in css px, where a surface needs it
// there (the grid reads the band's); `look` its pool's radius in units, where it
// differs from the relief's own (Scene 04 tightens it).
export function setLamp(name, x, y, z, gain, page = null, look = null) {
  const old = lamps[name];
  const samePage = old && (old.page === page || (old.page && page && old.page[0] === page[0] && old.page[1] === page[1]));
  if (old && old.x === x && old.y === y && old.z === z && old.gain === gain && old.look === look && samePage) return;
  lamps[name] = { x, y, z, gain, page, look };
  listeners.forEach((listener) => listener(name));
}

export function clearLamp(name) {
  if (!lamps[name]) return;
  lamps[name] = null;
  listeners.forEach((listener) => listener(name));
}

export function onLamp(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Whether the hero's entrance is over (played to its end, or never played): the
// stage waits for it before it starts drawing, so the entrance has the GPU to itself.
export const entrance = { done: false };

export function endEntrance() {
  if (entrance.done) return;
  entrance.done = true;
  listeners.forEach((listener) => listener('entrance'));
}
