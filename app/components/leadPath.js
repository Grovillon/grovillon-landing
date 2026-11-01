// Scene 04, "The Light Goes First": where the one lamp is at each scroll
// position after the stage unpins. Pure functions of scroll, so the light
// replays exactly in reverse and can be tested in Node.
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
//      narrowing, so the folds beyond the sentence read as steps;
//   5. hand-off: it descends straight down into the grid's rest, where it
//      stays (Scene 05) unless a fine pointer takes it.
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

const clamp01 = (x) => Math.min(Math.max(x, 0), 1);
const smooth = (u) => u * u * (3 - 2 * u);
// The distance covered over a ramp of length `len` whose velocity eases from
// v0 to v1 (smoothstep in velocity), `u` of the way along it.
const rampPos = (u, len, v0, v1) => len * (v0 * u + (v1 - v0) * (u * u * u - (u * u * u * u) / 2));

// The scroll positions at which the movements change, from the geometry:
//   vh        viewport height
//   hang      [x, y] of the stage's lamp on screen at the unpin
//   lampX     x of the waiting light (past the sentence's full stop)
//   enterD    page position of the sentence's top (d)
//   lineD     page position of the centre of the line the light meets (d)
//   restD     page position of the grid's rest (d); restX its x
export function leadTimeline(g) {
  const { vh } = g;
  const s1 = LEAD.release * vh;
  const waitY = LEAD.wait * vh;
  // The sentence's top reaches the bottom of the screen at enterD − vh.
  const s2 = Math.max(g.enterD - vh - LEAD.early * vh, s1 + 1);
  // The line's centre reaches the light's height.
  const s3 = Math.max(g.lineD - waitY, s2 + 2 * LEAD.lockBlend * vh);
  const s4 = s3 + LEAD.hold * vh;
  // The descent takes at least LEAD.handOff of a screen, longer where the rest
  // is far enough below the line that its peak would pass the speed cap.
  const fall = Math.max(g.restD - g.lineD, 0);
  const s5 = s4 + Math.max(LEAD.handOff * vh, fall / ((1 - HAND_RAMP) * (1 + 0.98 * SPEED_CAP)));
  // The glide: its velocity on screen eases from the page's (−1) to a cruise
  // and back to rest, so it turns without a kink and stops where it waits.
  // Shorter turns leave a slower cruise; they shorten until the light's speed
  // on screen, across as well as down, is under the cap.
  const L = s2 - s1;
  const startY = g.hang[1] - s1;
  const across = (1.5 * Math.abs(g.lampX - g.hang[0])) / Math.max(L, 1);
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
  return { s1, s2, s3, s4, s5, waitY, startY, L, a, b, cruise };
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
  const { s1, s2, s3, s4, s5, waitY } = tl;
  const [hangX, hangY] = g.hang;
  const lampX = g.lampX;
  const restX = g.restX ?? lampX;
  const w = LEAD.lockBlend * g.vh;
  let x = lampX;
  let y;
  // How far the lamp has gone from its everyday height and pool: 0 everywhere
  // else, 1 while it goes first and waits, 2 at the rake.
  let lower = 0;
  let phase;

  if (s <= s1) {
    phase = 'release';
    x = hangX;
    y = hangY - s;
  } else if (s <= s2) {
    phase = 'goes-first';
    x = hangX + (lampX - hangX) * smooth(clamp01((s - s1) / (s2 - s1)));
    y = glideY(s, tl);
    lower = smooth(clamp01((s - s1) / (s2 - s1)));
  } else if (s <= s3 - w) {
    phase = 'waits';
    y = waitY;
    lower = 1;
  } else if (s <= s4) {
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
    const from = g.lineD;
    const to = g.restD;
    const len = s5 - s4;
    const ramp = HAND_RAMP * len;
    const peak = (to - from) / (len - ramp);
    const u = s - s4;
    let d;
    if (u <= ramp) d = from + rampPos(u / ramp, ramp, 0, peak);
    else if (u <= len - ramp) d = from + rampPos(1, ramp, 0, peak) + peak * (u - ramp);
    else d = from + rampPos(1, ramp, 0, peak) + peak * (len - 2 * ramp) + rampPos((u - (len - ramp)) / ramp, ramp, peak, 0);
    x = lampX + (restX - lampX) * smooth(clamp01(u / len));
    y = d - s;
    lower = 2 * (1 - smooth(clamp01(u / len)));
  } else {
    phase = 'rest';
    x = restX;
    y = g.restD - s;
  }
  const share = (go, rake) => (lower <= 1 ? 1 + (go - 1) * lower : go + (rake - go) * (lower - 1));
  return {
    x,
    y,
    z: share(LEAD.goZ, LEAD.rakeZ),
    look: share(LEAD.goLook, LEAD.rakeLook),
    phase,
  };
}

// The still pose for reduced motion: one light just past the full stop, low
// enough to reach the grid's first rows, fixed on the page (d).
export function leadPose(g) {
  return { x: g.lampX, d: g.lineD + 0.5 * Math.max(g.restD - g.lineD, 0), z: 1, look: 1 };
}
