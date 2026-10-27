// Choreography for the cinematic stage. Every value is a pure function of the
// scroll timeline, so a frame always looks the same at the same scroll position
// and the scenes play backwards exactly as they play forwards.
//
// Timeline `t`: scroll progress through the pinned run, 0..1, in one unit
// throughout. It is negative while the stage scrolls into view (from -entry,
// its top at the viewport's bottom edge) and above 1 as it leaves. Scene A runs
// to the cut at 0.615, scene B from it.

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
// How far each sheet sits below its place in the render while the stack is
// closed: the sum of the closed-up spacing beneath it.
const CLOSED_DROP = SHEETS.map((_, k) => SLACK.slice(k).reduce((a, b) => a + (1 - CLOSEST) * b, 0));

// The relief behind both scenes is the hero's, lit by its own steady lamp, and
// it stays as it is from the moment the stage arrives until it leaves: only
// the subjects come and go in front of it. The garment is there from the
// start, unlit, hidden in its own shade on the relief; light falls on it,
// slowly, and at the end of scene A the light goes out and it is dark again.
// Only then, unseen, do it and its shade go; after a pause on the relief
// alone, the closed stack falls into the frame and opens from the top down.
const CUT = 0.615;
const SEAM = [1110, 300]; // where scene A's push-in ends, on the right shoulder seam
const PUSH = 0.38; // the push-in's end, as a share of the hold distance
const LAMP_HEIGHT = 1700; // scene A's lamp above the image, image px
// The garment comes into the light from above its right shoulder, below where
// the relief's lamp hangs: its front spreads from this image point, starting
// at the garment's nearest edge (image px), over the garment's bounds, until
// REVEAL; the camera stays still until then.
const LIGHT_FROM = [1160, -120];
const NEAREST = 345;
const BOUNDS = [220, 66, 1350, 1024];
const REVEAL = 0.21;
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
// Scene B's fall: the closed stack starts this far above the frame's top edge
// (render px), and each sheet eases to rest over this much of the fall on either
// side of its place, so the sheets land one after another, never all at once.
const FALL_CLEAR = 60;
const LANDING = 130;
// The stack has landed open by this point; from here it is framed as it closes.
const OPENED = 0.81;
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
        // Camera distances: close on the shoulder, the whole garment, the push-in.
        closeD: 0.5,
        holdD: 1,
        pushD: PUSH,
        anchor: [Math.max(0.645 * width, copyRight + 24 + 0.45 * GARMENT.width * fit), 0.5 * height],
        // The shoulder at mid-screen: the garment is lit on the left, its collar
        // about a third across, and the pull-back carries it to the right.
        closeAnchor: [0.5 * width, 0.5 * height],
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
      pushD: PUSH * 0.62,
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
// shade, unseen. With the camera still, light falls on the garment from above
// its right shoulder and spreads down and across it, slowly. Only once it is
// fully lit does the camera move: it pulls back from the shoulder to the whole
// garment while the lamp crosses it, the lamp settles as a key light, and the
// camera pushes onto the right shoulder seam while the light gathers there and
// goes out. The garment, dark again in its shade, then leaves unseen.
function garmentScene(t, layout, center) {
  const { fit, closeD, holdD, pushD, anchor, closeAnchor } = layout.garment;
  const framings = [
    { cam: [1010, 330], anchor: closeAnchor, zoom: fit / closeD },
    { cam: [768, 470], anchor, zoom: fit / holdD },
    { cam: SEAM, anchor: center, zoom: fit / pushD },
  ];
  // The camera holds the opening framing, close on the shoulder, until the
  // garment is in the light.
  const view = camera(
    track(t, [
      [REVEAL + 0.005, 0],
      [0.35, 1],
      [0.43, 1],
      [0.51, 2],
    ]),
    framings
  );
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
  const front = t < REVEAL ? mix(NEAREST, farthest + frontSoft, ramp(t, 0, REVEAL)) : FAR;
  // At the end the light gathers onto the seam: the garment goes dark from the
  // edges of the frame inwards, through a gradient wider than half the frame,
  // and the light left around the seam goes out. Once it is dark in its shade
  // the garment and its shade go, unseen, and the relief is left alone.
  const seam = [0, 1].map((k) => view.anchor[k] + (SEAM[k] - view.cam[k]) * view.zoom);
  const reach = Math.hypot(Math.max(seam[0], 2 * center[0] - seam[0]), Math.max(seam[1], 2 * center[1] - seam[1]));
  const goneSoft = (GONE_SOFT * Math.hypot(center[0], center[1])) / view.zoom;
  const gone = t < 0.43 ? FAR : mix(reach / view.zoom + goneSoft, 0.5 * goneSoft, ramp(t, 0.43, 0.555));
  const light = 1 - glide(ramp(t, 0.49, 0.56));
  const present = 1 - ramp(t, 0.56, 0.615);
  // Light falls on the garment from above the frame, over the right shoulder.
  // It carries on across the garment on the page's 30-degree angle, curves up
  // to a key light over the left shoulder and drifts there, then crosses back
  // to the right shoulder seam, where its beam narrows as the camera arrives.
  const lamp = path(t, [
    [0, [1110, -160]],
    [REVEAL, [1110, 200]],
    [0.33, [420, 440]],
    [0.375, [600, 240]],
    [0.43, [640, 260]],
    [0.505, SEAM],
    [CUT, SEAM],
  ]);
  // The pool widens as the light comes down, and narrows for the push-in.
  const radius = track(t, [
    [0, 360],
    [REVEAL, 360],
    [0.33, 560],
    [0.375, 680],
    [0.43, 680],
    [0.505, 260],
    [0.56, 200],
  ]);
  // The lamp is on from the start: the front alone decides what it reaches.
  // Half the fill comes with the front, so the whole garment reads once it is
  // lit; the fill rises as the lamp crosses and falls away for the push-in.
  const intensity = 1;
  const fill =
    mix(0.5 * glide(ramp(t, 0, REVEAL)), 0.82, glide(ramp(t, 0.25, 0.34))) * (1 - glide(ramp(t, 0.43, 0.48)));
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
    // is left; `present` is the garment and its shade, there until it is dark.
    show: [front, frontSoft, gone, goneSoft],
    showAt: [LIGHT_FROM[0], LIGHT_FROM[1], SEAM[0], SEAM[1]],
    light,
    present,
    shown: present > 0,
    // A moving pointer leans the lamp a little once most of the garment is
    // lit, never while it is still dark; at the key light a pointer on the
    // garment takes it, and the held lamp narrows to model it.
    lean: 0.3 * ramp(t, 0.14, 0.18) * (1 - ramp(t, 0.44, 0.47)),
    hold: ramp(t, 0.32, 0.35) * (1 - ramp(t, 0.43, 0.46)),
    heldRadius: 440,
    floor: 0,
    // The heading arrives with the stage, so it shows at the fold below the
    // hero, and goes out before the camera moves in.
    copy: [1 - ramp(t, 0.38, 0.41), 0, 0, 0],
  };
}

// Where each sheet sits below its place in the render while the closed stack
// falls: `fall` is how far the stack still has to go. Each sheet eases to rest
// on its place, the top sheet first, and each one below keeps falling until it
// reaches the render's spacing under the sheet above. The easing is monotone
// and never faster than the fall, so a sheet is never further from the one
// below than in the render, nor closer than in the closed stack.
function fallen(fall) {
  return CLOSED_DROP.map((drop) => {
    const x = drop - fall;
    if (x <= -LANDING) return x;
    if (x >= LANDING) return 0;
    return -((LANDING - x) ** 2) / (4 * LANDING);
  });
}

// Scene B: after a pause on the relief alone, the closed stack falls into the
// frame from above, in front of the relief and already in its light, and opens
// from the top down to the render's own spacing. A low lamp crosses the open
// layers; they close again from the top, and the statement is lit.
function stackScene(t, layout) {
  const { openZoom, closedZoom, alone } = layout.stack;
  const openCenter = [STACK_CENTER_X, (SHEETS[0].box[1] + STACK_BOTTOM) / 2];
  // The fall starts with the stack's lowest edge just above the frame, from
  // rest: it gathers speed as it comes into view, then slows to a stop with no
  // bounce, so the stack drops in and its sheets settle one by one; the last
  // one lands at 0.785.
  const frameTop = openCenter[1] - alone[1] / openZoom;
  const start = STACK_BOTTOM - frameTop + FALL_CLEAR;
  const p = ramp(t, 0.615, 0.785);
  const fall = -LANDING + (start + LANDING) * (1 - p) ** 3 * (1 + 3 * p);
  // How far each pair has opened: 0 = closed to CLOSEST, 1 = open to WIDEST.
  // They close again from the top for the statement.
  const closing = SLACK.map((_, j) => 1 - glide(ramp(t, 0.845 + 0.017 * j, 0.895 + 0.017 * j)));
  // Each sheet's downward shift from its place in the render. While falling,
  // the sheets close up as `fallen` says; while closing, the base stays put and
  // each sheet sits at least as low as the sheet below it moved, so no
  // uncovered surface ever shows.
  let shift;
  if (t < OPENED) {
    shift = fallen(fall);
  } else {
    shift = new Array(SHEETS.length).fill(0);
    for (let k = SHEETS.length - 2; k >= 0; k--) {
      shift[k] = shift[k + 1] + (1 - mix(CLOSEST, WIDEST, closing[k])) * SLACK[k];
    }
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

  // The lamp comes down with the stack, low over its upper layers, and crosses
  // the open layers from left to right, so the light finds their edges one
  // after another; it settles over the stack as it closes.
  const lampY = top + 120 + 0.22 * (bottom - top);
  const lampX = track(t, [
    [0.69, 430],
    [OPENED, 720],
    [0.86, 640],
    [0.95, 520],
  ]);
  // The stack falls in already lit, with enough fill that it never shows as a
  // dark cut-out against the relief. Once it has closed it is in its
  // photographed light as the statement lands. On a portrait screen it then
  // dissolves into the relief well before the stage leaves (the scrub trails
  // a fast scroll a little), so the statement ends the film on its own rather
  // than over the next section.
  const intensity = 1 - 0.25 * glide(ramp(t, 0.955, 0.995));
  const show = layout.landscape ? 1 : 1 - glide(ramp(t, 0.93, 0.975));
  const fill = track(t, [
    [0.69, 0.4],
    [0.85, 0.45],
    [0.935, 0.85],
  ]);
  const radius = track(t, [
    [0.65, 420],
    [0.77, 540],
    [OPENED, 600],
    [0.85, 600],
    [0.935, 640],
  ]);
  // The camera holds the open stack's framing while the stack falls into it
  // and opens, so the fall reads as the sheets moving. As the stack closes the
  // camera keeps it framed, closer, and makes room for the statement; it
  // recedes a little as the scene ends.
  const framed = t < OPENED ? 1 : spread;
  const zoom =
    Math.exp(mix(Math.log(closedZoom), Math.log(openZoom), framed)) *
    track(t, [
      [0.95, 1],
      [1, 0.96],
    ]);
  return {
    scene: 'stack',
    sheets,
    spread,
    center: t < OPENED ? openCenter : [STACK_CENTER_X, (top + bottom) / 2],
    anchor: track(t, [
      [0.83, alone],
      [0.895, layout.stack.anchor],
    ]),
    zoom,
    lamp: [lampX, lampY, 160],
    radius,
    intensity,
    fill,
    // How much of the stack shows over the relief; it is drawn once it falls.
    show,
    shown: p > 0 && show > 0,
    lean: 0.3 * ramp(t, 0.69, 0.725) * (1 - ramp(t, 0.95, 0.975)),
    hold: ramp(t, 0.755, 0.785) * (1 - ramp(t, 0.845, 0.875)),
    heldRadius: 380,
    // A held lamp dims the sheets it leaves no further than this, so each of the
    // six keeps its outline and none reads as a hole in the one below it.
    floor: FLOOR,
    copy: [0, ramp(t, 0.855, 0.875), ramp(t, 0.89, 0.91), ramp(t, 0.92, 0.94)],
  };
}

// `copy` says when each of the stage's four text blocks is lit (scene A's copy,
// then scene B's heading and its two closing lines); the stage switches each
// on or off past a threshold and fades it, so text never rests half-lit.
export function stageFrame(t, layout, width, height) {
  const center = [width / 2, height / 2];
  if (t < CUT) return garmentScene(t, layout, center);
  return stackScene(Math.min(t, 1), layout);
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
// Returns [join, exit weight, exit fade, join fade]. `unit` is the hero's height.
export function stageEdges(stageTop, height, unit, join) {
  const ease = (x) => x * x * (3 - 2 * x);
  return [join, ease(clamp01(-stageTop / (0.1 * height))), EXIT_FADE * unit, JOIN_FADE * unit];
}

// How much higher the relief's lamp hangs while the stage approaches (in hero
// heights): with the hero's own pool still on screen, the stage's light is
// faint and even; it settles before the stage pins, and never moves once pinned.
export function reliefLift(stageTop, unit) {
  const x = ramp(stageTop / unit, SETTLED, LIFTED);
  return LIFT * x * x * (3 - 2 * x);
}
