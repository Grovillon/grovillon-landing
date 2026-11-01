// "The Light Goes First": where the one lamp is at each scroll position after
// the stage unpins, on its way into the page's closing scene. Pure functions of
// scroll, so the light replays exactly in reverse and can be tested in Node.
//
// All lengths are css px. `s` is the scroll since the stage unpinned. A point
// fixed on the page at `d` (px below the top of the screen at the unpin) shows
// at screen y = d − s. The lamp's movements (CHECKPOINT-2-PLAN, Scene 04):
//   1. release: it hangs where the stage's lamp hung and leaves with the page;
//   2. it goes first: it turns and glides down the right side of the relief,
//      faster than the page (never above SPEED_CAP times the scroll);
//   3. it waits, still on screen, where the sentence will arrive; the relief
//      slides under it, and the sentence enters below and rises into it;
//   4. meet, hold, rake: as the sentence's line reaches it, it locks to the
//      page just past the full stop and lowers to a raking angle, its pool
//      narrowing. With a moment (`g.moment`: the sentence held still at the
//      centre of the screen for a stretch of scroll) it waits at the
//      sentence's first word instead, and while the sentence is held it reads
//      it, word by word, along the line and on to the next, lowered to rake;
//   5. hand-off: it settles into the grid's rest, where it stays (Scene 05)
//      unless a fine pointer takes it.
// Its strength never changes: no pulse, no brightening, no second light.

export const SPEED_CAP = 1.6;
// The share of the hand-off spent easing in, and again easing out.
const HAND_RAMP = 0.12;

// Shares of the viewport height (vh) that set the movements' lengths.
export const LEAD = {
  release: 0.05, // the stage's first 5% leaving: the band lamp takes over at the hang
  early: 0.1, // the light arrives this far ahead of the sentence's first line
  wait: 0.62, // where the light waits, as a share of vh from the top
  hold: 0.3, // meet, hold and rake
  sweepMin: 0.3, // the shortest sweep
  handOff: 0.35, // the descent into the grid's rest
  lockBlend: 0.02, // half-width of the smooth lock at the meet
  // The lamp's height and pool, as shares of their values elsewhere on the page:
  // a little lower and tighter while it goes first and waits, so it reads as a
  // light that has gone ahead rather than as the page's general glow; lower and
  // tighter again at the rake. Its strength never changes.
  goZ: 0.8,
  goLook: 0.8,
  rakeZ: 0.42,
  rakeLook: 0.62,
};

// How the glide is lengthened where its turns alone cannot keep the cap (see
// leadTimeline): [share of LEAD.early, share of LEAD.release].
const LONGER = [
  [1, 1],
  [0.9, 1],
  [0.8, 1],
  [0.8, 0.75],
  [0.8, 0.5],
  [0.8, 0.25],
  [0.8, 0],
  [0.6, 0],
  [0.4, 0],
  [0.2, 0],
  [0, 0],
];

const clamp01 = (x) => Math.min(Math.max(x, 0), 1);
const smooth = (u) => u * u * (3 - 2 * u);
// The distance covered over a ramp of length `len` whose velocity eases from
// v0 to v1 (smoothstep in velocity), `u` of the way along it.
const rampPos = (u, len, v0, v1) => len * (v0 * u + (v1 - v0) * (u * u * u - (u * u * u * u) / 2));
// 0..1 at an even pace with eased ends (a fifth of the way each): a sweep that
// reads the line at a steady rhythm instead of rushing its middle.
const RAMP = 0.2;
const PEAK = 1 / (1 - RAMP);
function evenly(u) {
  const x = clamp01(u);
  if (x <= RAMP) return rampPos(x / RAMP, RAMP, 0, PEAK);
  if (x <= 1 - RAMP) return rampPos(1, RAMP, 0, PEAK) + PEAK * (x - RAMP);
  return rampPos(1, RAMP, 0, PEAK) + PEAK * (1 - 2 * RAMP) + rampPos((x - (1 - RAMP)) / RAMP, RAMP, PEAK, 0);
}

// How lit a word is when the light has come `pos` px along its way and the
// word is `mark` px along it: 0 before the light reaches it, 1 once it has
// passed, over `soft` px; and how near the light is (1 on it), for a glint.
export function wordLight(pos, mark, soft) {
  const d = (pos - mark) / Math.max(soft, 1);
  return { lit: smooth(clamp01(0.5 + d / 2)), near: Math.exp(-d * d) };
}

// The light's way through a sentence: a smooth curve (Catmull-Rom) through
// `points` ([x, y] px: before the first word, each word, past the last), to
// be travelled at an even pace along its length. `marks` is how far along it
// each point lies; `sample(f)` the point `f` (0..1) of the way along.
export function sweepPath(points) {
  const n = points.length;
  const at = (i) => points[Math.min(Math.max(i, 0), n - 1)];
  const curve = (k) => {
    const i = Math.min(Math.floor(k), n - 2);
    const u = k - i;
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    return [0, 1].map(
      (c) =>
        0.5 *
        (2 * p1[c] +
          (p2[c] - p0[c]) * u +
          (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * u * u +
          (3 * p1[c] - p0[c] - 3 * p2[c] + p3[c]) * u * u * u)
    );
  };
  const PER = 24;
  const steps = PER * Math.max(n - 1, 1);
  const table = [{ len: 0, p: points[0] }];
  for (let j = 1; j <= steps; j++) {
    const p = n > 1 ? curve((j / steps) * (n - 1)) : points[0];
    const prev = table[j - 1];
    table.push({ len: prev.len + Math.hypot(p[0] - prev.p[0], p[1] - prev.p[1]), p });
  }
  const length = table[steps].len;
  const marks = points.map((_, i) => table[Math.min(i * PER, steps)].len);
  const sample = (f) => {
    const target = clamp01(f) * length;
    let j = 1;
    while (j < steps && table[j].len < target) j++;
    const a = table[j - 1];
    const b = table[j];
    const r = b.len > a.len ? (target - a.len) / (b.len - a.len) : 0;
    return { x: a.p[0] + (b.p[0] - a.p[0]) * r, y: a.p[1] + (b.p[1] - a.p[1]) * r, pos: target };
  };
  return { length, marks, sample, start: points[0], end: points[n - 1] };
}

// Where the light waits beside the Scene 04 headline, and rests in Scene 05's
// grid below it: x in css px from the band's left edge, past the end of the
// headline's longest line (`textEnd`), at least 0.78 of the width and never
// nearer the edge than 0.06 of it. On a phone the first line is the longer one
// (R6); at 320 px it nearly fills the line, and the light still clears it.
export function waitX(width, textEnd) {
  return Math.max(0.78 * width, Math.min(textEnd + 0.06 * width, 0.94 * width));
}

// The scroll positions at which the movements change, from the geometry:
//   vh        viewport height
//   hang      [x, y] of the stage's lamp on screen at the unpin
//   lampX     x of the waiting light (past the end of the headline's longest line)
//   enterD    page position of the sentence's top (d)
//   lineD     page position of the centre of the line the light meets (d)
//   restD     page position of the grid's rest (d); restX its x
//   moment    optional: the sentence held at the centre of the screen,
//             `pin` [s, s] while it is held and `points` the light's way
//             through it, on screen while held (see sweepPath)
export function leadTimeline(g) {
  const { vh } = g;
  const path = g.moment ? sweepPath(g.moment.points) : null;
  const waitY = path ? path.start[1] : LEAD.wait * vh;
  const toX = path ? path.start[0] : g.lampX;
  // The glide, from s1 to s2: its velocity on screen eases from the page's (−1)
  // to a cruise and back to rest, so it turns without a kink and stops where it
  // waits. Shorter turns leave a slower cruise; they shorten until the light's
  // speed on screen, across as well as down, is under the cap.
  const glide = (s1, s2) => {
    const L = s2 - s1;
    const startY = g.hang[1] - s1;
    const across = (1.5 * Math.abs(toX - g.hang[0])) / Math.max(L, 1);
    const limit = Math.sqrt(Math.max((0.98 * SPEED_CAP) ** 2 - across ** 2, 0.25));
    let a = 0;
    let b = 0;
    let cruise = 0;
    for (let k = 1; k >= 0.25; k -= 0.05) {
      a = 0.08 * k * L;
      b = 0.1 * k * L;
      cruise = (waitY - startY + a / 2) / Math.max(L - (a + b) / 2, 1);
      if (cruise <= limit) break;
    }
    return { s1, s2, waitY, startY, L, a, b, cruise, within: cruise <= limit };
  };
  // The sentence's top reaches the bottom of the screen at enterD − vh (held,
  // it is still rising into its place until the hold starts); the light
  // arrives LEAD.early of a screen before it. Where even the shortest
  // turns leave the light too fast (a short or very wide screen), the glide
  // takes longer, in this order (shares of LEAD.early, of LEAD.release): it
  // ends later, down to the plan's least lead of 0.08 of a screen; then it
  // leaves the hang sooner; only then does it end later still.
  const enter = g.enterD - vh;
  let tl = null;
  for (const [early, release] of LONGER) {
    const s1 = LEAD.release * vh * release;
    const s2 = Math.max(enter - LEAD.early * vh * early, s1 + 1);
    tl = glide(s1, s2);
    if (tl.within) break;
  }
  if (path) {
    // Held: the light reads the sentence while it is still, from just after
    // the hold starts to a little before it ends, then waits at its end; the
    // descent into the rest starts as the sentence leaves.
    const [pinFrom, pinTo] = g.moment.pin;
    const s3 = Math.max(pinFrom + 0.04 * vh, tl.s2 + 1);
    const s4 = Math.max(pinTo - 0.1 * vh, s3 + LEAD.sweepMin * vh);
    const endD = pinTo + path.end[1];
    const fall = Math.max(g.restD - endD, Math.abs((g.restX ?? path.end[0]) - path.end[0]), 0);
    const s5 = Math.max(s4, pinTo) + Math.max(LEAD.handOff * vh, fall / ((1 - HAND_RAMP) * (1 + 0.98 * SPEED_CAP)));
    return { ...tl, s3, s4, s5, path, pinTo, endD };
  }
  // The line's centre reaches the light's height.
  const s3 = Math.max(g.lineD - waitY, tl.s2 + 2 * LEAD.lockBlend * vh);
  const s4 = s3 + LEAD.hold * vh;
  // The descent takes at least LEAD.handOff of a screen, longer where the rest
  // is far enough below the line that its peak would pass the speed cap.
  const fall = Math.max(g.restD - g.lineD, 0);
  const s5 = s4 + Math.max(LEAD.handOff * vh, fall / ((1 - HAND_RAMP) * (1 + 0.98 * SPEED_CAP)));
  return { ...tl, s3, s4, s5 };
}

// Screen y of the glide, `s` within [s1, s2].
function glideY(s, tl) {
  const { s1, L, a, b, cruise, startY } = tl;
  const x = s - s1;
  if (x <= a) return startY + rampPos(x / a, a, -1, cruise);
  const afterA = startY + rampPos(1, a, -1, cruise);
  if (x <= L - b) return afterA + cruise * (x - a);
  const afterCruise = afterA + cruise * (L - a - b);
  return afterCruise + rampPos((x - (L - b)) / b, b, cruise, 0);
}

// The lamp at scroll `s`: screen position, and its height and pool radius as
// shares of their values elsewhere (1 outside the rake).
export function leadPath(s, g, tl = leadTimeline(g)) {
  const { s1, s2, s3, s4, s5, waitY, path } = tl;
  const [hangX, hangY] = g.hang;
  const lampX = path ? path.start[0] : g.lampX;
  const restX = g.restX ?? lampX;
  const w = LEAD.lockBlend * g.vh;
  let x = lampX;
  let y;
  // How far the lamp has gone from its everyday height and pool: 0 everywhere
  // else, 1 while it goes first and waits, 2 at the rake.
  let lower = 0;
  let phase;
  // How far along the held sentence the light has read (px; see sweepPath).
  let progress = -1;

  if (s <= s1) {
    phase = 'release';
    x = hangX;
    y = hangY - s;
  } else if (s <= s2) {
    phase = 'goes-first';
    x = hangX + (lampX - hangX) * smooth(clamp01((s - s1) / (s2 - s1)));
    y = glideY(s, tl);
    lower = smooth(clamp01((s - s1) / (s2 - s1)));
  } else if (path && s <= s3) {
    // Held: the sentence rises into its place under the waiting light.
    phase = 'waits';
    y = waitY;
    lower = 1;
  } else if (path && s <= Math.max(s4, tl.pinTo)) {
    // Held: the light reads the sentence, lowered to rake, then waits past
    // its last word until the sentence leaves.
    const read = evenly((s - s3) / (s4 - s3));
    const p = path.sample(read);
    phase = s <= s4 ? 'sweep' : 'hold';
    x = p.x;
    y = p.y - Math.max(0, s - tl.pinTo);
    progress = p.pos;
    lower = 1 + smooth(clamp01(read / 0.25));
  } else if (!path && s <= s3 - w) {
    phase = 'waits';
    y = waitY;
    lower = 1;
  } else if (!path && s <= s4) {
    // The lock: on screen the light eases from still to the page's pace over
    // ±w around the meet, so it ends exactly on the line's centre.
    phase = s < s3 ? 'waits' : 'hold';
    if (s < s3 + w) y = waitY + rampPos((s - (s3 - w)) / (2 * w), 2 * w, 0, -1);
    else y = waitY - (s - s3);
    lower = 1 + smooth(clamp01((s - s3) / (s4 - s3)));
  } else if (s <= s5) {
    phase = 'hand-off';
    // In page terms: from the line (still on the page) down into the rest
    // (still on the page), a trapezoid of pace with eased ends.
    const begin = path ? Math.max(s4, tl.pinTo) : s4;
    const from = path ? tl.endD : g.lineD;
    const fromX = path ? path.end[0] : lampX;
    const to = g.restD;
    const len = s5 - begin;
    const ramp = HAND_RAMP * len;
    const peak = (to - from) / (len - ramp);
    const u = s - begin;
    let d;
    if (u <= ramp) d = from + rampPos(u / ramp, ramp, 0, peak);
    else if (u <= len - ramp) d = from + rampPos(1, ramp, 0, peak) + peak * (u - ramp);
    else d = from + rampPos(1, ramp, 0, peak) + peak * (len - 2 * ramp) + rampPos((u - (len - ramp)) / ramp, ramp, peak, 0);
    x = fromX + (restX - fromX) * smooth(clamp01(u / len));
    y = d - s;
    lower = 2 * (1 - smooth(clamp01(u / len)));
    progress = path ? path.length : -1;
  } else {
    phase = 'rest';
    x = restX;
    y = g.restD - s;
    progress = path ? path.length : -1;
  }
  const share = (go, rake) => (lower <= 1 ? 1 + (go - 1) * lower : go + (rake - go) * (lower - 1));
  return {
    x,
    y,
    z: share(LEAD.goZ, LEAD.rakeZ),
    look: share(LEAD.goLook, LEAD.rakeLook),
    phase,
    progress,
  };
}

// The still pose for reduced motion: one light just past the full stop, low
// enough to reach the grid's first rows, fixed on the page (d).
export function leadPose(g) {
  if (g.moment) return { x: g.restX ?? g.lampX, d: g.restD, z: 1, look: 1 };
  return { x: g.lampX, d: g.lineD + 0.5 * Math.max(g.restD - g.lineD, 0), z: 1, look: 1 };
}
