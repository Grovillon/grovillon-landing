// The page's lamps, shared where two reliefs meet: the hero's lamp (which the
// pointer moves) and the grid band's. Where the stage's relief meets the hero's
// it is lit by the hero's lamp, and where it meets the band's, by the band's,
// so the surface runs on unbroken from one section into the next. Positions are
// in the hero's units (its height), in the hero's pattern; `gain` scales the
// light (the hero's warms up as the page opens).

const listeners = new Set();

export const lamps = { hero: null, band: null };

export function setLamp(name, x, y, z, gain) {
  const old = lamps[name];
  if (old && old.x === x && old.y === y && old.z === z && old.gain === gain) return;
  lamps[name] = { x, y, z, gain };
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
