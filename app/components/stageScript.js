// Choreography for the cinematic stage. Every value is a pure function of the
// scroll timeline, so a frame always looks the same at the same scroll position
// and the scenes play backwards exactly as they play forwards.
//
// Timeline `t`: scroll progress through the pinned run, 0..1, in one unit
// throughout. It is negative while the stage scrolls into view (from -entry,
// its top at the viewport's bottom edge) and above 1 as it leaves. The scenes
// play to the beats in BEATS: scene A to the end of its light-out, scene B from
// there.

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
const SLACK_SUM = SLACK.reduce((a, b) => a + b, 0);
const CLOSEST = 0.3; // fraction of the render's spacing kept when the stack is closed
const WIDEST = 1; // fraction of the render's spacing when it is most open: the render itself
const SPAN = STACK_BOTTOM - SHEETS[0].box[1];
const CLOSED_HEIGHT = SPAN - (1 - CLOSEST) * SLACK_SUM;
const OPEN_HEIGHT = SPAN - (1 - WIDEST) * SLACK_SUM;

// The stage arrives in the dark, the garment unseen in it. Light falls: one
// pool that opens over the garment and spreads until the whole relief is lit,
// so the garment and the relief around it come out of the dark together. The
// garment stands still in the light; at the end of scene A it dissolves into
// the lit relief, and scene B's statement lights in its place while the stack
// is drawn out of the dark beside it. The stack closes, rests closed in its
// light, and that light goes out, so the stage ends on the relief and the
// statement alone.
//
// The beats, as the shares of the pinned run at which each one ends (the
// reveal starts mid-approach, while the stage is still scrolling in). Every
// beat and rest is at least one wheel notch of scroll on the smallest screens
// of its layout; a portrait screen has a shorter run, so its beats are a
// larger share of it. Scene A: a1 the light has spread over the still
// garment, a2 the camera has drawn back while the lamp crosses, a3 the key
// light rests, a4 the camera has pushed onto the seam, a5 the seam rests lit,
// a6 the light is out and the garment gone. Then the relief alone to `cut`.
// (Scene A's beats now mark its light: a1 the light has found the garment, a2 it
// lights the whole garment, a3 the whole relief, a5..a6 the garment dissolves.)
// Scene B: b1 the plane of light has passed, b2 the lamp has crossed the open
// stack and rests, b3 it has closed, b4 it rests closed, b5 its light is out
// and it is gone; the stage rests on the statement until it unpins. `copy`:
// where scene A's copy goes out and scene B's heading and line are lit.
export const BEATS = {
  landscape: {
    reveal: -0.156,
    a1: 0.07,
    a2: 0.17,
    a3: 0.24,
    a4: 0.31,
    a5: 0.37,
    a6: 0.44,
    cut: 0.49,
    b1: 0.62,
    b2: 0.7,
    b3: 0.82,
    b4: 0.89,
    // 0.956, not 0.96: with a run of 3.2 screens this keeps the light-out at
    // >= 150 px and the final rest at >= 100 px on screens 711 px tall and up.
    b5: 0.956,
    copy: [0.37, 0.43, 0.5],
  },
  portrait: {
    reveal: -0.227,
    a1: 0.06,
    a2: 0.13,
    a3: 0.19,
    a4: 0.25,
    a5: 0.3,
    a6: 0.37,
    cut: 0.42,
    b1: 0.56,
    b2: 0.63,
    b3: 0.76,
    b4: 0.84,
    b5: 0.92,
    // The heading at 0.357, not 0.36: on a portrait screen the hero is 96svh,
    // so a second PageDown from the top stops at t 0.3585-0.3591, a few px
    // short of 0.36, on every such screen; lit from 0.357 it is on screen
    // there. Cue spacing stays >= 90 px (92.8 px at the floor, 740 px tall).
    copy: [0.3, 0.357, 0.43],
  },
};
const LAMP_HEIGHT = 1700; // scene A's key light above the image, image px
// The garment in the photograph (image px): its bounds, and the point the
// camera keeps at the screen anchor (the middle of the garment as it shows,
// its lower edge fading out).
const BOUNDS = [220, 66, 1350, 1024];
const GARMENT_W = BOUNDS[2] - BOUNDS[0];
const GARMENT_H = BOUNDS[3] - BOUNDS[1];
const GARMENT_AT = [785, 470];
// The camera eases this much closer over the whole of scene A, at an even
// pace, so the still garment is never quite static.
const DRIFT = 0.04;
// The stage's relief fades up from the ground below the join with the hero,
// whose own relief fades out above it, over this much of the hero's height; it
// fades out again over this much at the stage's bottom edge as it leaves.
const JOIN_FADE = 0.25;
const EXIT_FADE = 0.22;
// While the stage approaches, its relief's lamp hangs this much higher (in
// hero heights), so its light is faint and even while the hero's pool is on
// screen. It comes down as the hero's pool leaves the top of the screen, from
// when the stage's top is LIFTED hero heights below the viewport's top until
// it is SETTLED below it, and stays put from there on.
const LIFT = 1;
const LIFTED = 0.7;
const SETTLED = 0.3;
// Scene B: once the statement is lit, a plane of light passes down through the
// stack where it stands (from `cut` to b1), drawing its layers out of the dark:
// the rows it has passed are there, the rows it has not yet reached are not,
// over SCAN_SOFT render px, and where it crosses a layer the surface catches
// its light (SCAN_GLINT).
const SCAN_SOFT = 56;
const SCAN_GLINT = 0.9;
const FLOOR = 0.3; // the least fill a held lamp leaves on scene B's sheets
// Depth of field in scene B: blur in mip levels per sheet away from the lamp,
// when the stack is fully open; nothing is out of focus while it is closed.
const FOCUS = 0.5;
const FOCUS_MAX = 1.75;
const BASE_BLUR = 0.9; // the base sheet softens less, or it reads as a reflection
const BASE_SHADE = 0.84;
const BASE_RIM = 0.05;
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

// Light changes use a gentler in-out than the page's --ease-in-out: under a
// scrub, that strong curve compresses each change into a few frames and stalls
// at either end, and an ease-out switches light on with a jolt.
const glide = cubicBezier(0.45, 0, 0.55, 1);

const clamp01 = (x) => Math.min(Math.max(x, 0), 1);
const ramp = (t, a, b) => clamp01((t - a) / (b - a));
const mix = (a, b, t) => a + (b - a) * t;
const mixPoint = (a, b, t) => [mix(a[0], b[0], t), mix(a[1], b[1], t)];
const same = (a, b) => a[0] === b[0] && a[1] === b[1];

// Keyframes [[t, value], ...]; values are numbers or arrays of numbers. A
// monotone cubic (Fritsch-Carlson) runs through every key with continuous
// velocity, so a move flows through its keys instead of slowing to a stop at
// each one, and it never overshoots a key. It comes to rest only at either
// end, on a held value (a repeated key) and where it turns back.
function track(t, frames) {
  const n = frames.length;
  if (t <= frames[0][0]) return frames[0][1];
  if (t >= frames[n - 1][0]) return frames[n - 1][1];
  let i = 1;
  while (frames[i][0] < t) i++;
  const value = (j, k) => (k < 0 ? frames[j][1] : frames[j][1][k]);
  // The slope at key j: none at the ends or where the curve turns or holds;
  // elsewhere a weighted harmonic mean of the slopes either side, which keeps
  // both segments monotone.
  const slope = (j, k) => {
    if (j === 0 || j === n - 1) return 0;
    const h0 = frames[j][0] - frames[j - 1][0];
    const h1 = frames[j + 1][0] - frames[j][0];
    const d0 = (value(j, k) - value(j - 1, k)) / h0;
    const d1 = (value(j + 1, k) - value(j, k)) / h1;
    if (d0 * d1 <= 0) return 0;
    return (3 * (h0 + h1)) / ((2 * h1 + h0) / d0 + (h1 + 2 * h0) / d1);
  };
  const h = frames[i][0] - frames[i - 1][0];
  const u = (t - frames[i - 1][0]) / h;
  const u2 = u * u;
  const u3 = u2 * u;
  const curve = (k) =>
    (2 * u3 - 3 * u2 + 1) * value(i - 1, k) +
    (u3 - 2 * u2 + u) * h * slope(i - 1, k) +
    (3 * u2 - 2 * u3) * value(i, k) +
    (u3 - u2) * h * slope(i, k);
  return Array.isArray(frames[0][1]) ? frames[0][1].map((_, k) => curve(k)) : curve(-1);
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

// Scene A's framing: the garment's middle at `anchor` (px) at scale `zoom`, and
// where its light falls from: above the screen, over the garment, down onto its
// shoulders. `revealFill` is how much of the garment the key light shows as
// the light arrives (the rest shows as it settles).
function garmentPlace(anchor, zoom, width, height, revealFill) {
  const shoulders = [anchor[0] + 0.06 * GARMENT_W * zoom, anchor[1] - 0.26 * GARMENT_H * zoom];
  return {
    zoom,
    anchor,
    cam: GARMENT_AT,
    dawnFrom: [shoulders[0] + 0.04 * width, -0.3 * height],
    dawnAt: shoulders,
    revealFill,
  };
}

// Where the image sits for a given stage size. Landscape stages set the copy in
// the page's left column with the image to its right; portrait stages set it
// above the image. The copy's right edge mirrors globals.css. `entry` is the
// stage's approach as a share of the pinned run (viewport height / pinned scroll);
// `statement` is where scene B's copy ends, px from the stage's top. `page`
// passes what the page has already decided, so script and stylesheet agree:
// `landscape` (the stylesheet's media query), `copyRight` (the copy column's
// measured right edge, px from the stage's left) and `run` (the pinned scroll,
// px: with a browser's toolbar showing, the viewport is shorter than the stage).
export function stageLayout(width, height, entry = 0.25, statement = 0, page = {}) {
  const landscape = page.landscape ?? (width >= 720 && width / height >= 1.05);
  const gutter = Math.min(Math.max(0.05 * width, 20), 72);
  // The reveal falls when the stage's top is half a screen from the top of the
  // screen, whatever the run's length (on a short screen the run has a floor).
  // Where the floor lengthens the run, the pause between scene A's copy going
  // out and scene B's heading lighting would grow past 0.2 of a screen (the
  // plan's text gap): it is held there, but never under the cue spacing budget.
  const timed = (beats, spacing) => {
    const run = page.run ?? height / Math.max(entry, 1e-6);
    const [off, heading, line] = beats.copy;
    const gap = Math.min(heading - off, Math.max(0.2 * height, spacing) / run);
    return { ...beats, reveal: -0.5 * entry, copy: [off, off + gap, line] };
  };
  if (landscape) {
    const edge = Math.max(gutter, (width - 1344) / 2 + gutter);
    // Scene B's statement column (left) and scene A's copy column (right), as
    // the stylesheet sets them; the page passes their measured edges.
    const copyRight = page.copyRight ?? edge + Math.min(480, 0.31 * width);
    const copyLeft = page.copyLeft ?? width - edge - Math.min(480, 0.31 * width);
    const room = (width - copyRight - 2 * gutter) / 861;
    const closedZoom = Math.min((0.55 * height) / CLOSED_HEIGHT, room);
    // The garment stands on the left, where scene B's statement will light,
    // clear of scene A's copy on the right.
    const right = copyLeft - Math.max(24, 0.035 * width);
    const zoom = Math.min((right - edge) / GARMENT_W, (0.8 * height) / GARMENT_H);
    return {
      landscape,
      entry,
      beats: timed(BEATS.landscape, 115),
      garment: garmentPlace([(edge + right) / 2, 0.5 * height], zoom, width, height, 0.35),
      stack: {
        // The camera keeps the stack framed: closer while it is closed, further back as it opens.
        openZoom: Math.min((0.78 * height) / OPEN_HEIGHT, room),
        closedZoom,
        anchor: [Math.max(0.6 * width, copyRight + 40 + 0.5 * 861 * closedZoom), 0.52 * height],
      },
    };
  }
  // The largest zoom at which a stack this tall (render px), centred on the
  // anchor, keeps 16px clear of the statement above it; never below half the
  // width's own limit.
  const below = (tall) => Math.max((2 * (0.64 * height - statement - 16)) / tall, (0.42 * width) / 861);
  // On a portrait screen the garment stands in the upper part of the stage and
  // scene A's copy below it.
  const zoom = Math.min((0.98 * width) / GARMENT_W, (0.5 * height) / GARMENT_H);
  return {
    landscape,
    entry,
    beats: timed(BEATS.portrait, 90),
    garment: garmentPlace([0.5 * width, 0.37 * height], zoom, width, height, 0.5),
    stack: {
      // Scene B's statement is lit before the stack is drawn below it, so on a
      // short screen the stack is drawn smaller rather than into the words.
      openZoom: Math.min((0.84 * width) / 861, (0.6 * height) / OPEN_HEIGHT, below(OPEN_HEIGHT)),
      closedZoom: Math.min((0.84 * width) / 861, (0.44 * height) / CLOSED_HEIGHT, below(CLOSED_HEIGHT)),
      anchor: [0.5 * width, 0.64 * height],
    },
  };
}

// The page's relief as the hero draws it (LightField's hero layout), for the
// stage's background: lengths in units of the hero's height (`unit`, px), the
// narrow cell where the screen is narrower than the hero is tall, and a steady
// lamp placed on the stage as the hero's lamp rests on the hero. `offset` is
// how far the stage's top sits below the hero's top, px, so the folds run on
// from the hero's across the join.
export function reliefLayout(width, unit, offset) {
  const span = width / unit;
  const narrow = span < 1;
  return {
    unit,
    origin: offset / unit,
    cell: narrow ? [0.27, 0.31] : [0.42, 0.5],
    depth: [0.06, 0.42],
    lamp: narrow ? [0.82 * span, 0.1, 0.3] : [0.7 * span, 0.13, 0.36],
    look: narrow ? [0.19, 0.12, 0.72] : [0.19, 0.12, 0.95],
  };
}

// Scene A: the stage arrives in the dark, the garment unseen. As the stage
// settles, light falls from above the garment: a pool that comes down onto its
// shoulders and opens until it has lit the garment and then the whole relief,
// so the dark recedes because it is lit, not because a layer of shade is
// taken away. The garment stands still in the light while the camera eases a
// few percent closer; its own key light, over its right shoulder, drifts a
// little across it. At the end the garment dissolves into the lit relief,
// where scene B's statement lights.
function garmentScene(t, layout, width, height) {
  const { zoom, anchor, cam, dawnFrom, dawnAt, revealFill } = layout.garment;
  const { reveal, a1, a2, a3, a5, a6 } = layout.beats;
  const out = a6 - a5;
  const diagonal = Math.hypot(width, height);
  // The light starts to fall as the stage settles, so the reader sees the
  // dark first and the garment come out of it on the still stage.
  const fall = mix(reveal, 0, 0.75);
  // The pool comes down onto the shoulders as it opens, and keeps opening
  // until it reaches past every corner; the relief takes the full light on
  // from when the garment is lit.
  const centre = mixPoint(dawnFrom, dawnAt, glide(ramp(t, fall, a1)));
  const reach = diagonal * mix(0.05, 1.4, glide(ramp(t, fall, a2)));
  const spread = glide(ramp(t, a1, a3));
  // The key light: over the right shoulder, drifting slowly towards the chest.
  const lamp = path(t, [
    [fall, [1150, -60]],
    [a1, [1080, 150]],
    [a5, [930, 230]],
  ]);
  const radius = track(t, [
    [fall, 520],
    [a1, 640],
    [a2, 700],
  ]);
  const fill = mix(revealFill * glide(ramp(t, fall, a1)), 0.78, glide(ramp(t, a1, a2)));
  // The garment dissolves into the lit relief as scene A's copy goes out.
  const leave = 1 - glide(ramp(t, a5 - 0.25 * out, a6 - 0.1 * out));
  return {
    scene: 'garment',
    cam,
    anchor,
    zoomGarment: zoom * (1 + DRIFT * ramp(t, fall, a6)),
    lamp: [lamp[0], lamp[1], LAMP_HEIGHT],
    radius,
    intensity: 1,
    fill,
    // The light that falls on the stage: its centre and reach (px), and how
    // much of the relief it lights everywhere.
    dawn: [centre[0], centre[1], reach, spread],
    light: 1,
    present: 1,
    leave,
    shown: leave > 0,
    // A moving pointer leans the key light a little once the garment is lit;
    // while it rests lit, a pointer on the garment takes it, and the held
    // light narrows to model it. Both let go before the garment dissolves.
    lean: 0.3 * ramp(t, a1, a2) * (1 - ramp(t, a5 - 0.03, a5)),
    hold: ramp(t, a2, a2 + 0.02) * (1 - ramp(t, a5 - 0.03, a5)),
    heldRadius: 440,
    floor: 0,
  };
}

// Scene B: after a pause on the relief alone, the statement is lit first, line
// by line. Then a plane of light passes down through the stack where it stands,
// open at the render's own spacing, and draws its layers out of the dark: what
// it has passed is there, what it has not yet reached is not, and where it
// crosses a layer the surface catches its light. A low lamp then crosses the
// open layers and rests; they close again from the top, into one quiet
// material, which rests in its light until the light goes out and it leaves.
function stackScene(t, layout) {
  const { openZoom, anchor } = layout.stack;
  const { cut, b1, b2, b3, b4, b5 } = layout.beats;
  const cross = b2 - b1;
  const shut = b3 - b2;
  const out = b5 - b4;
  // How far each pair is open: 1 = the render's spacing, 0 = closed up. Once
  // the lamp has crossed them the pairs close from the top, one after another,
  // the last as the closing beat ends.
  const closing = SLACK.map((_, j) => 1 - glide(ramp(t, b2 + 0.09 * j * shut, b2 + (0.62 + 0.09 * j) * shut)));
  // Each sheet's downward shift from its place in the render: the base stays
  // put and each sheet sits at least as low as the sheet below it moved, so no
  // uncovered surface ever shows.
  const shift = new Array(SHEETS.length).fill(0);
  for (let k = SHEETS.length - 2; k >= 0; k--) {
    shift[k] = shift[k + 1] + (1 - mix(CLOSEST, WIDEST, closing[k])) * SLACK[k];
  }
  const open = SLACK.map((slack, j) => 1 - (shift[j] - shift[j + 1]) / ((1 - CLOSEST) * slack));
  const spread = clamp01(SLACK.reduce((sum, slack, j) => sum + slack * open[j], 0) / SLACK_SUM);
  const top = SHEETS[0].box[1] + shift[0];
  const bottom = STACK_BOTTOM + shift[SHEETS.length - 1];
  const sheets = SHEETS.map((sheet, k) => ({
    rect: [sheet.box[0], sheet.box[1] + shift[k], sheet.box[2], sheet.box[3]],
    atlas: sheet.atlas,
    front: sheet.front + shift[k],
    // Contact shadow cast by the sheet above, strongest when the pair is closed.
    shadow: k === 0 ? 0 : 0.62 * (1 - open[k - 1]),
    // As on the page, the outer layers catch the light and the inner ones stay in
    // shadow; the traced layer stays darker still, so it is never put on show.
    // The base, a dark sheet over the relief's dark lower panel, keeps a little
    // more of its light and a faint rim, so its outline holds.
    shade: k === 2 ? 0.8 : k === SHEETS.length - 1 ? BASE_SHADE : 1 - 0.06 * k,
    rim: k === SHEETS.length - 1 ? BASE_RIM : 0,
    blur: 0,
  }));

  // The plane of light, in render rows: from above the stack's top edge to
  // below its base, gathering speed and slowing to rest. One plane for every
  // sheet, so a sheet is never drawn where the one above it is not.
  const scan = glide(ramp(t, cut, b1));
  const front = mix(SHEETS[0].box[1] - 2 * SCAN_SOFT, STACK_BOTTOM + 2 * SCAN_SOFT, scan);
  // The lamp rides the plane down, close over the layers it is reaching, then
  // rises over the open stack and crosses it from left to right, so the light
  // finds their edges one after another, and stays where it has crossed to:
  // the layers then close under it, with nothing else moving but the camera.
  const rise = glide(ramp(t, b1 - 0.2 * cross, b1 + 0.6 * cross));
  const lampY = mix(front - 40, top + 120 + 0.22 * (bottom - top), rise);
  const lampX = track(t, [
    [b1, STACK_CENTER_X],
    [b1 + 0.5 * cross, 450],
    [b2, 690],
  ]);
  // Behind the plane the layers keep a low light, so the plane reads as light
  // passing through them; then the fill rises, and once the stack has closed it
  // is in its photographed light, the lamp a quarter dimmer. It rests so. Then,
  // on every screen, its light goes out and it dissolves a little ahead of
  // the light: the sheets cannot fall below the ground colour, so a stack
  // darker than the lit relief behind it would show as a dark shape. It is
  // gone before that, and the statement ends the film on the relief alone.
  const intensity = (1 - 0.25 * glide(ramp(t, b2 + 0.5 * shut, b3))) * (1 - glide(ramp(t, b4, b5)));
  const show = 1 - glide(ramp(t, b4 + 0.05 * out, b4 + 0.75 * out));
  const fill = track(t, [
    [cut, 0.22],
    [b1, 0.3],
    [b1 + 0.7 * cross, 0.45],
    [b2 + 0.625 * shut, 0.85],
  ]);
  const radius = track(t, [
    [cut, 420],
    [b1, 520],
    [b1 + 0.6 * cross, 600],
    [b2, 600],
    [b2 + 0.625 * shut, 640],
  ]);
  // The camera holds the open stack's framing while the plane passes and the
  // lamp crosses; as the layers come together it eases back with them, 14%
  // over the closing, holds while the material rests, and recedes a little
  // further as it leaves.
  const zoom = openZoom * (1 - 0.14 * glide(ramp(t, b2, b3)) - 0.03 * glide(ramp(t, b4, b5)));
  return {
    scene: 'stack',
    sheets,
    spread,
    center: [STACK_CENTER_X, (top + bottom) / 2],
    anchor,
    zoom,
    lamp: [lampX, lampY, 160],
    radius,
    intensity,
    fill,
    // How much of the stack shows over the relief; it is drawn once the plane
    // of light reaches it.
    show,
    shown: scan > 0 && show > 0,
    // The plane of light: its row, how soft it is, how strongly the layers
    // catch it (gone as it leaves the base).
    reveal: [front, SCAN_SOFT, SCAN_GLINT * (1 - ramp(t, b1 - (b1 - cut) / 6, b1))],
    lean: 0.3 * ramp(t, b1, b1 + 0.25 * cross) * (1 - ramp(t, b4 - 0.3 * (b4 - b3), b4)),
    // A pointer on the open stack takes the lamp while it rests there, and lets
    // go before the layers start to close, so the two never coincide.
    hold: ramp(t, b1, b1 + 0.25 * cross) * (1 - ramp(t, b2 - 0.25 * cross, b2)),
    heldRadius: 380,
    // A held lamp dims the sheets it leaves no further than this, so each of the
    // six keeps its outline and none reads as a hole in the one below it.
    floor: FLOOR,
  };
}

// When each of the stage's three text blocks is lit: scene A's copy, lit as the
// stage arrives, goes out as its light starts to go; scene B's heading is lit
// while the garment is still leaving, and its line once the plane of light
// has set off. The stage switches each block on past 0.65 of its cue and off
// below 0.35, at the beats' copy points, and fades it, so text never rests
// half-lit.
function copyCues(t, beats) {
  const [off, heading, line] = beats.copy;
  const cue = (at) => ramp(t, at - 0.013, at + 0.007);
  return [1 - cue(off), cue(heading), cue(line)];
}

// Scene A plays until its light is out and the garment gone; scene B from there.
export function stageFrame(t, layout, width, height) {
  const frame = t < layout.beats.a6 ? garmentScene(t, layout, width, height) : stackScene(Math.min(t, 1), layout);
  frame.copy = copyCues(t, layout.beats);
  return frame;
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

// Edge fades for the moments the stage is not pinned, in px. Below the join
// with the hero the relief fades up from the ground: the fade belongs to the
// page, so it scrolls with the join, `join` px from the stage's top (0 until
// the stage pins, then above it), and never changes shape. As the stage
// leaves, its relief fades out towards its own bottom edge, the next section's
// top; a 0..1 weight, eased, brings that fade in as the edge rises into view.
// Where the next relief runs on from the stage's under the same lamp (`joined`
// to the hero's, `continued` by the grid band's) there is no fade at that edge.
// Returns [join, exit weight, exit fade, join fade]. `unit` is the hero's height.
export function stageEdges(stageTop, height, unit, join, joined = false, continued = false) {
  const ease = (x) => x * x * (3 - 2 * x);
  return [
    join,
    continued ? 0 : ease(clamp01(-stageTop / (0.1 * height))),
    EXIT_FADE * unit,
    joined ? 0 : JOIN_FADE * unit,
  ];
}

// How much higher the relief's lamp hangs while the stage approaches (in hero
// heights): with the hero's own pool still on screen, the stage's light is
// faint and even; it settles before the stage pins, and never moves once pinned.
export function reliefLift(stageTop, unit) {
  const x = ramp(stageTop / unit, SETTLED, LIFTED);
  return LIFT * x * x * (3 - 2 * x);
}
