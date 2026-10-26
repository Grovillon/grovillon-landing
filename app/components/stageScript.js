// Choreography for the cinematic stage. Every value is a pure function of the
// scroll timeline, so a frame always looks the same at the same scroll position
// and the scenes play backwards exactly as they play forwards.
//
// Timeline `t`: scroll progress through the pinned run, 0..1, in one unit
// throughout. It is negative while the stage scrolls into view (from -entry,
// its top at the viewport's bottom edge) and above 1 as it leaves. Scene A runs
// to the cut at 0.5, scene B from it.

export const GARMENT = { width: 1536, height: 1024 };
const STACK_BOTTOM = 1384;
const STACK_CENTER_X = 514;

// The six sheets cut out of the approved layered-material render (1024 x 1536),
// outermost first. `box` is where each cut-out sits in the render (x, y, w, h),
// `atlas` where it sits in layers.webp, `front` the render row of its front edge.
export const SHEETS = [
  { box: [116, 167, 818, 334], atlas: [16, 16], front: 502 },
  { box: [103, 357, 830, 292], atlas: [1040, 16], front: 647 },
  { box: [97, 486, 840, 345], atlas: [16, 528], front: 835 },
  { box: [97, 627, 835, 385], atlas: [1040, 528], front: 1010 },
  { box: [96, 763, 837, 392], atlas: [16, 1040], front: 1150 },
  { box: [83, 904, 861, 480], atlas: [1040, 1040], front: 1382 },
];

// The render shows the sheets apart, and each one hides the back of the sheet
// below it. Sheets may therefore close up (move down onto the sheet below), but
// never open wider than the render or slide sideways: either would uncover
// surface the render does not contain. `SLACK` is how far each pair can close.
// At its widest the stack is the render itself, with its inner layers kept in
// shadow and out of focus: the scene suggests them, it does not lay them out.
const CONTACT = 14;
const SLACK = SHEETS.slice(0, -1).map((sheet, i) => SHEETS[i + 1].front - sheet.front - CONTACT);
const CLOSEST = 0.3; // fraction of the render's spacing kept when the stack is closed
const WIDEST = 1; // fraction of the render's spacing when it is most open: the render itself
const SPAN = STACK_BOTTOM - SHEETS[0].box[1];
const CLOSED_HEIGHT = SPAN - (1 - CLOSEST) * SLACK.reduce((a, b) => a + b, 0);
const OPEN_HEIGHT = SPAN - (1 - WIDEST) * SLACK.reduce((a, b) => a + b, 0);

// The cut is a match on the light. Scene A's push-in ends on the right shoulder
// seam under a narrow pool; scene B opens on the top sheet under the same pool,
// at the same scale, and pulls back to the whole stack.
const CUT = 0.5;
const SEAM = [1110, 300];
const PUSH = 0.38; // the push-in's end, as a share of the hold distance
const POOL = 130; // the pool's radius at the cut, image px
// Over the push-in's last stretch the relief behind the garment falls dark and
// the lamp eases down, so both sides of the cut are one pool of light on black
// at about the same brightness: the garment's fabric is lighter than the top
// sheet's fleece, and light may only scale an image down.
const CUT_DIM = 0.4;
const LAMP_HEIGHT = 1700; // scene A's lamp above the image, image px
// The relief behind the garment is lit as the hero lights it while the stage
// arrives, so the join reads as one surface, then steps back for the garment.
const HERO_LOOK = [0.19, 0.12, 1100];
const WALL_LOOK = [0.1, 0.055, 820];
const MATCH = [360, 360]; // where the pool falls on the top sheet, render px before the stack closes
const PULL = 0.24; // scene B's pull-back from the close-up, in B's own 0..1
const FLOOR = 0.3; // the least fill a held lamp leaves on scene B's sheets
// Depth of field in scene B: blur in mip levels per sheet away from the lamp,
// when the stack is fully open; nothing is out of focus while it is closed.
const FOCUS = 0.5;
const FOCUS_MAX = 1.75;
const BASE_BLUR = 0.9; // the base sheet softens less, or it reads as a reflection
const TRACED_BLUR = 1.25;

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

// Scroll-scrubbed moves use a gentler in-out than the page's --ease-in-out:
// under a scrub, that strong curve compresses each move into a few frames and
// stalls at either end, and an ease-out switches light on with a jolt.
const glide = cubicBezier(0.45, 0, 0.55, 1);

const clamp01 = (x) => Math.min(Math.max(x, 0), 1);
const ramp = (t, a, b) => clamp01((t - a) / (b - a));
const mix = (a, b, t) => a + (b - a) * t;
const mixPoint = (a, b, t) => [mix(a[0], b[0], t), mix(a[1], b[1], t)];
const mixAll = (a, b, t) => a.map((v, k) => mix(v, b[k], t));
const same = (a, b) => a[0] === b[0] && a[1] === b[1];

// Keyframes [[t, value], ...]; values are numbers or arrays. Each segment eases
// in and out, which suits camera moves that start and stop.
function track(t, frames, ease = glide) {
  if (t <= frames[0][0]) return frames[0][1];
  for (let i = 1; i < frames.length; i++) {
    const [t1, v1] = frames[i];
    if (t <= t1) {
      const [t0, v0] = frames[i - 1];
      const e = ease((t - t0) / (t1 - t0));
      return Array.isArray(v0) ? v0.map((v, k) => v + (v1[k] - v) * e) : v0 + (v1 - v0) * e;
    }
  }
  return frames[frames.length - 1][1];
}

// A path through [[t, [x, y]], ...] with continuous velocity (Catmull-Rom
// tangents, scaled to uneven key spacing), so a moving light flows through its
// keys instead of stopping at each one. A repeated key is a hold: the path
// arrives at rest and leaves from rest.
function path(t, keys) {
  if (t <= keys[0][0]) return keys[0][1];
  const n = keys.length;
  if (t >= keys[n - 1][0]) return keys[n - 1][1];
  let i = 1;
  while (keys[i][0] < t) i++;
  const [t1, p1] = keys[i - 1];
  const [t2, p2] = keys[i];
  if (same(p1, p2)) return p1;
  const [t0, p0] = keys[i - 2] || keys[i - 1];
  const [t3, p3] = keys[i + 1] || keys[i];
  const span = t2 - t1;
  const u = (t - t1) / span;
  const u2 = u * u;
  const u3 = u2 * u;
  return p1.map((_, k) => {
    const m1 = same(p0, p1) ? 0 : ((p2[k] - p0[k]) / (t2 - t0)) * span;
    const m2 = same(p2, p3) ? 0 : ((p3[k] - p1[k]) / (t3 - t1)) * span;
    return (2 * u3 - 3 * u2 + 1) * p1[k] + (u3 - 2 * u2 + u) * m1 + (3 * u2 - 2 * u3) * p2[k] + (u3 - u2) * m2;
  });
}

// Where the image sits for a given stage size. Landscape stages set the copy in
// the page's left column with the image to its right; portrait stages set it
// above the image. The copy's right edge mirrors globals.css. `entry` is the
// stage's approach as a share of the pinned run (viewport height / pinned scroll).
export function stageLayout(width, height, entry = 0.25) {
  const landscape = width >= 720 && width / height >= 1.05;
  const gutter = Math.min(Math.max(0.05 * width, 20), 72);
  if (landscape) {
    const copyRight = Math.max(gutter, (width - 1344) / 2 + gutter) + Math.min(480, 0.31 * width);
    const fit = Math.min((0.6 * width) / GARMENT.width, (0.8 * height) / GARMENT.height);
    const room = (width - copyRight - 2 * gutter) / 861;
    const closedZoom = Math.min((0.55 * height) / CLOSED_HEIGHT, room);
    return {
      landscape,
      entry,
      garment: {
        fit,
        closeD: 0.5,
        holdD: 1,
        anchor: [Math.max(0.645 * width, copyRight + 24 + 0.45 * GARMENT.width * fit), 0.5 * height],
        closeAnchor: [0.62 * width, 0.5 * height],
      },
      stack: {
        // The camera keeps the stack framed: closer while it is closed, further back as it opens.
        openZoom: Math.min((0.78 * height) / OPEN_HEIGHT, room),
        closedZoom,
        alone: [0.5 * width, 0.52 * height],
        anchor: [Math.max(0.6 * width, copyRight + 40 + 0.5 * 861 * closedZoom), 0.52 * height],
      },
    };
  }
  return {
    landscape,
    entry,
    garment: {
      fit: width / GARMENT.width,
      closeD: 0.4,
      holdD: 0.62,
      anchor: [0.5 * width, 0.58 * height],
      closeAnchor: [0.5 * width, 0.56 * height],
    },
    stack: {
      openZoom: Math.min((0.84 * width) / 861, (0.6 * height) / OPEN_HEIGHT),
      closedZoom: Math.min((0.84 * width) / 861, (0.44 * height) / CLOSED_HEIGHT),
      alone: [0.5 * width, 0.5 * height],
      anchor: [0.5 * width, 0.64 * height],
    },
  };
}

// Scene A: the lamp finds the garment, then the camera pushes into its fabric.
function garmentScene(t, layout, center) {
  const { fit, closeD, holdD, anchor, closeAnchor } = layout.garment;
  const enter = -0.85 * layout.entry;
  const d = track(t, [
    [0, closeD],
    [0.22, holdD],
    [0.37, holdD],
    [CUT, PUSH * holdD],
  ]);
  // The scene opens close on the shoulder and its push-in ends there, closer
  // still, on the seam, where the frame reads as fabric and nothing else.
  const cam = track(t, [
    [0, [1010, 330]],
    [0.22, [768, 470]],
    [0.37, [768, 470]],
    [CUT, SEAM],
  ]);
  const screen = track(t, [
    [0, closeAnchor],
    [0.22, anchor],
    [0.37, anchor],
    [CUT, center],
  ]);
  // The lamp waits upper right, where the hero's lamp rests, crosses the garment
  // on the page's 30-degree angle, curves up to a key light over the left
  // shoulder and drifts there, then crosses back to the right shoulder seam,
  // where its beam narrows to a pool as the camera arrives.
  const lamp = path(t, [
    [enter, [1290, 40]],
    [0, [1180, 110]],
    [0.2, [400, 440]],
    [0.27, [600, 240]],
    [0.35, [640, 260]],
    [0.45, SEAM],
    [CUT, SEAM],
  ]);
  const radius = track(t, [
    [0, 300],
    [0.2, 560],
    [0.27, 680],
    [0.37, 680],
    [0.45, 280],
    [CUT, POOL],
  ]);
  // Already glowing where the hero's lamp rests as the stage arrives at the
  // fold; full strength once the stage has pinned, and through the cut.
  const arrived = glide(ramp(t, enter, 0.15));
  const intensity = mix(0.55, 1, arrived) * mix(1, CUT_DIM, glide(ramp(t, 0.44, CUT)));
  const wallLight = 1 - glide(ramp(t, 0.42, 0.49));
  const fill = 0.82 * glide(ramp(t, 0.14, 0.24)) * (1 - glide(ramp(t, 0.37, 0.42)));
  const wallDepth = 0.45;
  return {
    scene: 'garment',
    cam,
    anchor: screen,
    zoomGarment: fit / d,
    zoomWall: fit / (d + wallDepth),
    lamp: [lamp[0], lamp[1], LAMP_HEIGHT],
    radius,
    intensity,
    fill,
    look: mixAll(HERO_LOOK, WALL_LOOK, arrived).map((v, i) => (i < 2 ? v * wallLight : v)),
    // A moving pointer leans the lamp a little; at the key light a pointer on
    // the garment takes it, and the held lamp narrows to model it.
    lean: 0.3 * ramp(t, -0.05, 0) * (1 - ramp(t, 0.4, 0.44)),
    hold: ramp(t, 0.2, 0.25) * (1 - ramp(t, 0.37, 0.4)),
    heldRadius: 440,
    floor: 0,
    // The heading arrives with the stage, so it shows at the fold below the
    // hero, and goes out before the camera moves in.
    copy: [1 - ramp(t, 0.32, 0.35), 0, 0, 0],
  };
}

// Scene B: the camera opens on the top sheet under the pool scene A ended on,
// and pulls back to the closed stack. The six sheets part, from the outermost
// inwards, to the render's own spacing while a low lamp crosses the outer
// layers; they close again and the statement is lit.
function stackScene(t, layout, center) {
  const b = (t - CUT) / (1 - CUT);
  // The cut: the same pool of light, at the same scale and height, on the top
  // sheet; the camera pulls back from it to the whole stack, and the layers
  // below come into the light as it does.
  const pull = glide(ramp(b, 0, PULL));
  const parting = (j) => glide(ramp(b, 0.18 + 0.04 * j, 0.3 + 0.04 * j));
  // How far each pair has opened: 0 = closed to CLOSEST, 1 = open to WIDEST.
  const open = SLACK.map((_, j) => parting(j) * (1 - glide(ramp(b, 0.56 + 0.04 * j, 0.66 + 0.04 * j))));
  // Each sheet's downward shift; a sheet always sits at least as low as the
  // sheet below it moved, so no uncovered surface ever shows.
  const shift = new Array(SHEETS.length).fill(0);
  for (let k = SHEETS.length - 2; k >= 0; k--) {
    shift[k] = shift[k + 1] + (1 - mix(CLOSEST, WIDEST, open[k])) * SLACK[k];
  }
  const top = SHEETS[0].box[1] + shift[0];
  const spread = clamp01((STACK_BOTTOM - top - CLOSED_HEIGHT) / (OPEN_HEIGHT - CLOSED_HEIGHT));
  const sheets = SHEETS.map((sheet, k) => ({
    rect: [sheet.box[0], sheet.box[1] + shift[k], sheet.box[2], sheet.box[3]],
    atlas: sheet.atlas,
    front: sheet.front + shift[k],
    // Contact shadow cast by the sheet above, strongest when the pair is closed.
    shadow: k === 0 ? 0 : 0.62 * (1 - open[k - 1]),
    // As on the page, the outer layers catch the light and the inner ones stay in
    // shadow; the traced layer stays darker still, so it is never put on show.
    shade: (k === 2 ? 0.8 : 1 - 0.06 * k) * (k ? mix(0.3, 1, pull) : 1),
    blur: 0,
  }));

  const cutZoom = layout.garment.fit / (PUSH * layout.garment.holdD);
  const match = [MATCH[0], MATCH[1] + shift[0]];

  // A low lamp crosses the outer layers from left to right as they part, so the
  // light finds their edges one after another; it settles over the stack as it closes.
  const lampY = top + 120 + 0.22 * (STACK_BOTTOM - top);
  const lampX = track(b, [
    [0.12, 330],
    [0.44, 720],
    [0.6, 640],
    [0.82, 520],
  ]);
  // The lamp leads while the stack is open; once it has closed, the stack is
  // in its photographed light as the statement lands.
  // On a portrait screen the stack sets before the stage leaves, so the
  // statement ends the film on its own rather than over the next section.
  const intensity =
    (b < 0.88 ? 1 : 1 - 0.25 * glide(ramp(b, 0.88, 0.99))) * (layout.landscape ? 1 : 1 - glide(ramp(b, 0.88, 1)));
  const fill = track(b, [
    [0, 0],
    [PULL, 0.42],
    [0.44, 0.45],
    [0.56, 0.45],
    [0.74, 0.85],
  ]);
  const radius = track(b, [
    [PULL, 520],
    [0.44, 600],
    [0.56, 600],
    [0.82, 640],
  ]);
  // The camera keeps the stack framed as it opens and closes, and recedes as
  // the scene ends; the stack starts alone in the frame and makes room for the
  // statement when it is lit.
  const framed =
    mix(layout.stack.closedZoom, layout.stack.openZoom, spread) *
    track(b, [
      [0.86, 1],
      [1, 0.96],
    ]);
  const stackCenter = [STACK_CENTER_X, (top + STACK_BOTTOM) / 2];
  return {
    scene: 'stack',
    sheets,
    spread,
    center: mixPoint(match, stackCenter, pull),
    anchor:
      b < 0.5
        ? mixPoint(center, layout.stack.alone, pull)
        : track(b, [
            [0.5, layout.stack.alone],
            [0.64, layout.stack.anchor],
          ]),
    zoom: Math.exp(mix(Math.log(cutZoom), Math.log(framed), pull)),
    lamp: [mix(match[0], lampX, pull), mix(match[1], lampY, pull), mix(LAMP_HEIGHT, 160, pull)],
    radius: mix(POOL, radius, pull),
    intensity,
    fill,
    lean: 0.3 * ramp(b, 0.14, 0.2) * (1 - ramp(b, 0.84, 0.9)),
    hold: ramp(b, 0.36, 0.4) * (1 - ramp(b, 0.58, 0.62)),
    // Continuous with scene A's held radius across the cut.
    heldRadius: mix(440, 380, pull),
    // A held lamp dims the sheets it leaves no further than this, so each of the
    // six keeps its outline and none reads as a hole in the one below it.
    floor: FLOOR * pull,
    copy: [0, ramp(b, 0.56, 0.6), ramp(b, 0.62, 0.66), ramp(b, 0.68, 0.72)],
  };
}

// `copy` says when each of the stage's four text blocks is lit (scene A's copy,
// then scene B's heading and its two closing lines); the stage switches each
// on or off past a threshold and fades it, so text never rests half-lit.
export function stageFrame(t, layout, width, height) {
  const center = [width / 2, height / 2];
  if (t < CUT) return garmentScene(t, layout, center);
  return stackScene(Math.min(t, 1), layout, center);
}

// Scene B's depth of field, once the lamp is placed (the visitor may hold it):
// the sheet under the lamp is in focus and the others soften with their
// distance from it, more as the stack opens. Blur only removes detail.
export function stageFocus(frame) {
  if (frame.scene !== 'stack') return;
  const { sheets } = frame;
  // Each sheet shows a band from the front edge of the sheet above to its own.
  const bands = sheets.map((sheet, k) => (k ? (sheets[k - 1].front + sheet.front) / 2 : sheet.front - 160));
  const y = frame.lamp[1];
  let focus = 0;
  if (y >= bands[bands.length - 1]) {
    focus = bands.length - 1;
  } else if (y > bands[0]) {
    let k = 0;
    while (y > bands[k + 1]) k++;
    focus = k + (y - bands[k]) / (bands[k + 1] - bands[k]);
  }
  sheets.forEach((sheet, k) => {
    sheet.blur = Math.min(FOCUS * Math.abs(k - focus) * frame.spread, k === sheets.length - 1 ? BASE_BLUR : FOCUS_MAX);
  });
  // The traced layer is never brought into sharp focus while the stack is open.
  sheets[2].blur = Math.max(sheets[2].blur, TRACED_BLUR * frame.spread);
}

// Edge fades for the moments the stage is not pinned: 0..1 weights for its top
// edge (scrolling in) and bottom edge (scrolling out), eased so the fade
// settles into the pin rather than stopping at it, and how far the lower fade
// has risen as the stage leaves.
export function stageEdges(stageTop, height) {
  const ease = (x) => x * x * (3 - 2 * x);
  return [
    ease(clamp01(stageTop / (0.1 * height))),
    ease(clamp01(-stageTop / (0.1 * height))),
    ease(clamp01(-stageTop / (0.35 * height))),
  ];
}
