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

// The relief behind both scenes is the hero's, lit by its own steady lamp, and
// it stays as it is from the moment the stage arrives until it leaves: only
// the subjects come and go in front of it. The garment is there from the
// start, unlit, hidden in its own shade on the relief; light falls on it,
// slowly, and at the end of scene A the light goes out and it is dark again.
// Only then, unseen, do it and its shade go; after a pause on the relief
// alone, scene B's statement is lit first and the stack is drawn out of the
// dark where it stands. It closes, rests closed in its light, and that light
// goes out too, so the stage ends on the relief and the statement alone.
//
// The beats, as the shares of the pinned run at which each one ends (the
// reveal starts mid-approach, while the stage is still scrolling in). Every
// beat and rest is at least one wheel notch of scroll on the smallest screens
// of its layout; a portrait screen has a shorter run, so its beats are a
// larger share of it. Scene A: a1 the light has spread over the still
// garment, a2 the camera has drawn back while the lamp crosses, a3 the key
// light rests, a4 the camera has pushed onto the seam, a5 the seam rests lit,
// a6 the light is out and the garment gone. Then the relief alone to `cut`.
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
    copy: [0.3, 0.36, 0.43],
  },
};
const SEAM = [1110, 300]; // where scene A's push-in ends, on the right shoulder seam
const PUSH = 0.6; // the push-in's end, as a share of the hold distance
const LAMP_HEIGHT = 1700; // scene A's lamp above the image, image px
// The garment comes into the light from above its right shoulder, below where
// the relief's lamp hangs: its front spreads from this image point, starting
// at the garment's nearest edge (image px), over the garment's bounds.
const LIGHT_FROM = [1160, -120];
const NEAREST = 345;
const BOUNDS = [220, 66, 1350, 1024];
// While the camera holds the push-in's framing, the light stays gathered this
// far onto the seam (the rest of the way as it goes out).
const GATHERED = 0.6;
// How gradually the light comes: over this much of the front's travel a point
// goes from unlit to fully lit; and as the light gathers onto the seam at the
// end, over this much of the frame's half-diagonal. The garment itself is
// solid throughout: only its light changes.
const FRONT_SOFT = 1.3;
const GONE_SOFT = 0.6;
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
// A camera move between two rests, 0..1: it sets off at the scroll's own pace
// (slope 1), so a move starts as soon as the reader scrolls into it, and
// arrives at rest (slope 0).
const setOff = (t, a, b) => {
  const u = ramp(t, a, b);
  return u + u * u - u * u * u;
};
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

// The camera between framings. A framing puts the image point `cam` at the
// screen point `anchor` at scale `zoom`; `u` runs from one framing (its index)
// to the next. Between two framings the camera zooms about the one screen
// point they share, so the scale changes at an even rate (in log space) and
// every point of the image travels in a straight line; with no change of scale
// it is a plain pan.
function camera(u, framings) {
  const i = Math.min(Math.max(Math.floor(u), 0), framings.length - 2);
  const p = clamp01(u - i);
  const a = framings[i];
  const b = framings[i + 1];
  const r = b.zoom / a.zoom;
  const s = r ** p;
  const zoom = a.zoom * s;
  const anchor = mixPoint(a.anchor, b.anchor, p);
  const offset = [0, 1].map((k) => {
    const from = a.anchor[k] - a.zoom * a.cam[k];
    const to = b.anchor[k] - b.zoom * b.cam[k];
    if (Math.abs(r - 1) < 1e-4) return mix(from, to, p);
    const fixed = (to - r * from) / (1 - r);
    return fixed + s * (from - fixed);
  });
  return { zoom, anchor, cam: [(anchor[0] - offset[0]) / zoom, (anchor[1] - offset[1]) / zoom] };
}

// Where the image sits for a given stage size. Landscape stages set the copy in
// the page's left column with the image to its right; portrait stages set it
// above the image. The copy's right edge mirrors globals.css. `entry` is the
// stage's approach as a share of the pinned run (viewport height / pinned scroll);
// `statement` is where scene B's copy ends, px from the stage's top. `page`
// passes what the page has already decided, so script and stylesheet agree:
// `landscape` (the stylesheet's media query) and `copyRight` (the copy column's
// measured right edge, px from the stage's left).
export function stageLayout(width, height, entry = 0.25, statement = 0, page = {}) {
  const landscape = page.landscape ?? (width >= 720 && width / height >= 1.05);
  const gutter = Math.min(Math.max(0.05 * width, 20), 72);
  // The reveal falls when the stage's top is half a screen from the top of the
  // screen, whatever the run's length (on a short screen the run has a floor).
  const timed = (beats) => ({ ...beats, reveal: -0.5 * entry });
  if (landscape) {
    const copyRight = page.copyRight ?? Math.max(gutter, (width - 1344) / 2 + gutter) + Math.min(480, 0.31 * width);
    const fit = Math.min((0.38 * width) / GARMENT.width, (0.52 * height) / GARMENT.height);
    const room = (width - copyRight - 2 * gutter) / 861;
    const closedZoom = Math.min((0.55 * height) / CLOSED_HEIGHT, room);
    return {
      landscape,
      entry,
      beats: timed(BEATS.landscape),
      garment: {
        fit,
        // Camera distances: the garment on the left, the whole garment, the push-in.
        closeD: 0.75,
        holdD: 1,
        pushD: PUSH,
        anchor: [Math.max(0.645 * width, copyRight + 24 + 0.45 * GARMENT.width * fit), 0.5 * height],
        // The opening framing puts the chest (image px) a third of the way
        // across, inside the dark of the veil, which darkens the relief from the
        // left edge to `veil[0]` and is gone by `veil[1]` (px); the pull-back
        // carries the garment out of it, to the right.
        close: [745, 420],
        closeAnchor: [0.33 * width, 0.5 * height],
        veil: [0.55 * width, 0.85 * width],
        // The fill the front brings: low, so the light falls from the right
        // and the garment's left, under the copy, stays in shadow.
        revealFill: 0.35,
      },
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
  return {
    landscape,
    entry,
    beats: timed(BEATS.portrait),
    garment: {
      fit: width / GARMENT.width,
      closeD: 0.72,
      holdD: 0.95,
      pushD: 0.62,
      anchor: [0.5 * width, 0.6 * height],
      close: [770, 430],
      closeAnchor: [0.5 * width, 0.58 * height],
      veil: null,
      revealFill: 0.5,
    },
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

// Larger than any distance on the image: a front that has passed everything.
const FAR = 1e6;

// Scene A: the stage arrives with the relief lit and the garment unlit in its
// shade, unseen; on a landscape screen it stands on the left, where a veil
// darkens the relief. Light starts to fall on the garment while the stage is
// still scrolling in, from above its right shoulder, and spreads down and
// across it with the camera still. Once it is lit the camera moves: it pulls
// back to the whole garment while the lamp crosses it and the veil lifts, the
// lamp rests as a key light, and the camera pushes onto the right shoulder
// seam while the light gathers there. The seam rests lit; then the light goes
// out, and the garment, dark again in its shade, leaves unseen.
function garmentScene(t, layout, center) {
  const { fit, closeD, holdD, pushD, anchor, close, closeAnchor, veil, revealFill } = layout.garment;
  const { reveal, a1, a2, a3, a4, a5, a6 } = layout.beats;
  const pull = a2 - a1;
  const push = a4 - a3;
  const out = a6 - a5;
  const framings = [
    { cam: close, anchor: closeAnchor, zoom: fit / closeD },
    { cam: [768, 470], anchor, zoom: fit / holdD },
    { cam: SEAM, anchor: center, zoom: fit / pushD },
  ];
  // The camera holds the opening framing while the light spreads, then draws
  // back, rests on the whole garment, and pushes in onto the seam.
  const view = camera(setOff(t, a1, a2) + setOff(t, a3, a4), framings);
  // The light's front spreads down and across the garment from above its
  // right shoulder until it has passed the farthest point the opening frame
  // shows. After that the whole garment stays in the light: the rest of it is
  // only seen once the camera has moved.
  const first = framings[0];
  const seen = [0, 1].map((k) => [
    Math.max(first.cam[k] - first.anchor[k] / first.zoom, BOUNDS[k]),
    Math.min(first.cam[k] + (2 * center[k] - first.anchor[k]) / first.zoom, BOUNDS[k + 2]),
  ]);
  const farthest = Math.hypot(
    Math.max(LIGHT_FROM[0] - seen[0][0], seen[0][1] - LIGHT_FROM[0]),
    Math.max(LIGHT_FROM[1] - seen[1][0], seen[1][1] - LIGHT_FROM[1])
  );
  const frontSoft = FRONT_SOFT * (farthest - NEAREST);
  const front = t < a1 ? mix(NEAREST, farthest + frontSoft, ramp(t, reveal, a1)) : FAR;
  // As the camera pushes in, the light gathers onto the seam: the garment goes
  // dark from the edges of the frame inwards, through a gradient wider than
  // half the frame, and holds there while the seam rests lit. Then the light
  // left around the seam goes out. Once it is dark in its shade the garment
  // and its shade go, unseen, and the relief is left alone.
  const seam = [0, 1].map((k) => view.anchor[k] + (SEAM[k] - view.cam[k]) * view.zoom);
  const reach = Math.hypot(Math.max(seam[0], 2 * center[0] - seam[0]), Math.max(seam[1], 2 * center[1] - seam[1]));
  const goneSoft = (GONE_SOFT * Math.hypot(center[0], center[1])) / view.zoom;
  const gathered = GATHERED * ramp(t, a3, a4) + (1 - GATHERED) * ramp(t, a5, a6 - out / 14);
  const gone = t < a3 ? FAR : mix(reach / view.zoom + goneSoft, 0.5 * goneSoft, gathered);
  const light = 1 - glide(ramp(t, a5, a6));
  // The garment and its shade dissolve together while the light goes out, so
  // neither is ever left on the relief as a dark shape: gone as it goes dark.
  const leave = 1 - glide(ramp(t, a5 + out / 7, a6 - out / 14));
  // Light falls on the garment from above the frame, over the right shoulder,
  // straight down. As the camera moves it carries on across the garment on
  // the page's 30-degree angle and curves up to a key light over the left
  // shoulder, where it rests; then it crosses back to the right shoulder seam,
  // where its beam narrows as the camera arrives, and stays there until it
  // goes out.
  const lamp = path(t, [
    [reveal, [1110, -160]],
    [a1, [1110, 200]],
    [a1 + 1e-4, [1110, 200]],
    [a1 + 0.83 * pull, [420, 440]],
    [a2, [620, 250]],
    [a3, [620, 250]],
    [a4, SEAM],
    [a6, SEAM],
  ]);
  // The pool widens as the light comes down, narrows for the push-in, and a
  // little more as it goes out.
  const radius = track(t, [
    [a1, 360],
    [a1 + 0.83 * pull, 560],
    [a2, 680],
    [a3, 680],
    [a4, 260],
    [a5, 260],
    [a6, 200],
  ]);
  // The lamp is on from the start: the front alone decides what it reaches.
  // Some fill comes with the front, so the whole garment reads once it is lit;
  // the fill rises as the lamp crosses and falls away for the push-in, so the
  // seam rests in the lamp's own pool.
  const intensity = 1;
  const fill =
    mix(revealFill * glide(ramp(t, reveal, a1)), 0.82, glide(ramp(t, a1 + 0.13 * pull, a1 + 0.91 * pull))) *
    (1 - glide(ramp(t, a3, a3 + 0.62 * push)));
  return {
    scene: 'garment',
    cam: view.cam,
    anchor: view.anchor,
    zoomGarment: view.zoom,
    lamp: [lamp[0], lamp[1], LAMP_HEIGHT],
    radius,
    intensity,
    fill,
    // Where light reaches the garment, in image px: within the light's front
    // (its radius about LIGHT_FROM, and how much of it is soft) and within its
    // reach of the seam as it gathers there (likewise). `light` puts out what
    // is left; `present` is the garment and its shade as they arrive (with a
    // late texture), `leave` the two of them going together at the end.
    show: [front, frontSoft, gone, goneSoft],
    showAt: [LIGHT_FROM[0], LIGHT_FROM[1], SEAM[0], SEAM[1]],
    light,
    present: 1,
    leave,
    shown: leave > 0,
    // The veil over the left of the relief, px: dark to its first edge, gone
    // by its second, at full strength until the garment is lit, lifting as
    // the camera draws back. It is the relief's, there before the garment.
    veil: veil ? [veil[0], veil[1], 1 - glide(ramp(t, a1, a1 + 0.83 * pull))] : [0, 1, 0],
    // The shade round the garment eases once it is lit and the camera moves it,
    // where it only has to ground it in the key light, and deepens again as the
    // light gathers onto the seam, so that the garment leaves unseen.
    pool: 1 - 0.6 * glide(ramp(t, a1, a1 + 0.83 * pull)) * (1 - glide(ramp(t, a3, a3 + 0.75 * push))),
    // A moving pointer leans the lamp a little once most of the garment is
    // lit, never while it is still dark; while the key light rests a pointer
    // on the garment takes it, and the held lamp narrows to model it. Both
    // let go before the camera pushes in, so the two never coincide.
    lean: 0.3 * ramp(t, mix(reveal, a1, 0.67), mix(reveal, a1, 0.86)) * (1 - ramp(t, a3 - 0.02, a3)),
    hold: ramp(t, a2 - 0.02, a2) * (1 - ramp(t, a3 - 0.02, a3)),
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
  const closing = SLACK.map((_, j) => 1 - glide(ramp(t, b2 + 0.136 * j * shut, b2 + (0.455 + 0.136 * j) * shut)));
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
  // lamp crosses; as the layers come together it draws back with them, 20%
  // over the closing, holds while the material rests, and recedes a little
  // further as it leaves.
  const zoom = openZoom * (1 - 0.2 * setOff(t, b2, b3) - 0.03 * glide(ramp(t, b4, b5)));
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
  const center = [width / 2, height / 2];
  const frame = t < layout.beats.a6 ? garmentScene(t, layout, center) : stackScene(Math.min(t, 1), layout);
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
