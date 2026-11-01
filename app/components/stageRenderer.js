// WebGL renderer for the cinematic stage: one canvas, two scenes, in front of
// one background.
//
// The background is the hero's folded-plate relief, drawn as the hero draws it
// (the same folds at the same size, the same lamp model and grain) under a
// steady lamp of its own. Where the garment stands, the relief's light falls
// away through a soft gradient into the dark: part of how the relief is lit,
// not a layer laid over it, and the unlit garment is as dark as it, so it is
// unseen. Scene A's light falls into that dark: it finds the garment and lifts
// the dark around it by lighting it; when it leaves, the garment is dark and
// unseen again, never faded. Scene B draws
// the six sheets of the layered material over it as sprites under their own
// lamp, each darkened where the sheet above it rests close and softened by the
// camera's depth of field; a plane of light passing down through them draws
// them out of the dark.
//
// Every image keeps its own pixels: the lamp only scales how much of them shows,
// focus only softens them, and unlit areas fall to the page's ground colour,
// never below it.

const FULLSCREEN_VERTEX = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const COMMON = `
precision highp float;
uniform vec2 uRes;
uniform float uScale;
uniform vec3 uGround;
uniform vec3 uLamp;
uniform vec3 uLight;
uniform float uRadius;
uniform float uIntensity;
uniform float uFill;
uniform vec4 uEdges;

float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

vec2 fragPos() { return vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y); }

// The lamp's pool: falls off with distance from the point under the lamp. uFill
// blends it towards 1, the image exactly as photographed.
float exposure(vec2 p) {
  vec2 d = p - uLight.xy;
  float d2 = dot(d, d);
  float pool = uLight.z * inversesqrt(d2 + uLight.z * uLight.z) / (1.0 + d2 / (uRadius * uRadius));
  return uIntensity * mix(pool, 1.0, uFill);
}

// A trace of the lamp's warmth while it leads, neutral once the image shows as
// photographed: the black garment must not read bronze.
vec3 tint() { return mix(uLamp, vec3(1.0), 0.65 + 0.35 * uFill); }

// Below the join with the hero (uEdges.x device px from the stage's top) the
// relief fades up from the ground over uEdges.w device px (none where it runs on
// from the hero's); as the stage leaves (weight uEdges.y), it fades out over
// uEdges.z device px to its bottom edge (none over the grid band's relief).
vec3 finish(vec3 col, vec2 frag) {
  float top = uEdges.w > 0.0 ? smoothstep(uEdges.x, uEdges.x + uEdges.w, frag.y) : step(uEdges.x, frag.y);
  float bottom = mix(1.0, smoothstep(0.0, uEdges.z, uRes.y - frag.y), uEdges.y);
  // The page's grain, at the size the hero draws it (one css px), so the stage,
  // the relief and the page read as one surface.
  return mix(uGround, col, top * bottom) + (hash(floor(frag / max(uScale, 1.0))) - 0.5) * (6.0 / 255.0);
}
`;

// The hero's relief (LightField's shade(), unchanged): straight folds every
// uCell.x, zigzag folds whose segments run at the planform angle, every facet
// flat and shaded by one point lamp. Lengths are in units of the hero's
// height; uOrigin places the stage in the hero's pattern.
const RELIEF = `
uniform float uUnit;
uniform vec2 uOrigin;
uniform vec2 uCell;
uniform float uSlope;
uniform float uCos;
uniform vec2 uDepth;
uniform vec3 uLook;
uniform vec3 uReliefLamp;
uniform float uReliefGain;
uniform float uSupersample;
// While the stage scrolls in under the hero, the relief just below the join
// (uEdges.x) is lit by the hero's own lamp (uNearLamp: its position and gain),
// and takes the stage's lamp over across uNearBand.x device px below it; with
// no band, the stage's lamp lights it all. The light is the same on either
// side of the join, so the two reliefs read as one surface; below it the
// stage is lit as scene A's light and dark leave it (dawn()).
uniform vec4 uNearLamp;
uniform vec2 uNearBand;

float handed(vec2 frag, float band) {
  return band > 0.0 ? smoothstep(uEdges.x, uEdges.x + band, frag.y) : 1.0;
}

vec4 lampAt(vec2 frag) {
  return mix(uNearLamp, vec4(uReliefLamp, uReliefGain), handed(frag, uNearBand.x));
}

float distTo(float x, float period) {
  float m = mod(x, period);
  return min(m, period - m);
}

vec3 shade(vec2 p, float px, vec4 lamp) {
  float w = uCell.x;
  float h = uCell.y;
  float zx = mod(p.x, 2.0 * w);
  float s1 = zx < w ? 1.0 : -1.0;
  float zig = (zx < w ? zx : 2.0 * w - zx) * uSlope;
  float yy = p.y - zig;
  float s2 = mod(yy, 2.0 * h) < h ? 1.0 : -1.0;
  float dzdx = s1 * (uDepth.x - uDepth.y * s2 * uSlope);
  float dzdy = uDepth.y * s2;
  vec3 n = normalize(vec3(-dzdx, -dzdy, 1.0));
  vec3 lv = vec3(lamp.xy - p, lamp.z);
  float dist = length(lv);
  vec3 l = lv / dist;
  float diff = max(dot(n, l), 0.0);
  float att = 1.0 / (1.0 + (dist * dist) / (uLook.z * uLook.z));
  vec3 hv = normalize(l + vec3(0.0, 0.0, 1.0));
  float spec = pow(max(dot(n, hv), 0.0), 40.0) * 0.08;
  float light = (diff + spec) * att * lamp.w;
  float crease = distTo(yy, h) * uCos;
  float line = 1.0 - smoothstep(0.0, px * 1.1, crease);
  vec3 col = uGround + uLamp * light * uLook.x;
  col += uLamp * line * att * lamp.w * uLook.y * (0.35 + diff);
  return col;
}

// The hero draws its creases one css px wide and samples each pixel four
// times; on a dense screen the stage's own pixels do the sampling.
vec3 relief(vec2 frag) {
  float px = 1.0 / (uUnit * min(uScale, 1.0));
  vec2 p = frag / (uScale * uUnit) + uOrigin;
  vec4 lamp = lampAt(frag);
  if (uSupersample < 0.5) return shade(p, px, lamp);
  float s = 1.0 / (uScale * uUnit);
  return 0.25 * (shade(p + vec2(0.125, 0.375) * s, px, lamp)
               + shade(p + vec2(0.375, -0.125) * s, px, lamp)
               + shade(p + vec2(-0.125, -0.375) * s, px, lamp)
               + shade(p + vec2(-0.375, 0.125) * s, px, lamp));
}

// The stage's dark (uShade): around the garment's place the relief's light
// falls away into the ground, through a gradient uShadeSoft.x css px wide,
// at strength uShadeSoft.y. uShade.xy is its centre and uShade.zw the half
// size of the part that is fully dark (a rounded rectangle, so the garment's
// shoulders are in it too).
uniform vec4 uShade;
uniform vec2 uShadeSoft;
float shadeLight(vec2 frag) {
  vec2 r = max(uShade.zw, vec2(1.0));
  vec2 n = abs(frag / uScale - uShade.xy) / r;
  float e = pow(pow(n.x, 4.0) + pow(n.y, 4.0), 0.25);
  float lit = smoothstep(1.0, 1.0 + uShadeSoft.x / min(r.x, r.y), e);
  return mix(1.0, lit, uShadeSoft.y);
}
// The light that falls into the dark in scene A (uDawn): a soft pool centred
// at uDawn.xy (css px) reaching about uDawn.z, filling uDawn.w of the dark
// everywhere. Both scale the relief's light, never the ground. Just below the
// join with the hero the hero's own light runs on, unchanged.
uniform vec4 uDawn;
float dawnLight(vec2 frag) {
  vec2 d = (frag / uScale - uDawn.xy) / max(uDawn.z, 1.0);
  return mix(exp(-dot(d, d)), 1.0, uDawn.w);
}
float dawn(vec2 frag) {
  float dark = shadeLight(frag);
  return mix(1.0, dark + (1.0 - dark) * dawnLight(frag), handed(frag, uNearBand.x));
}
vec3 dawned(vec3 col, vec2 frag) {
  return uGround + (col - uGround) * dawn(frag);
}
`;

const RELIEF_FRAGMENT = `${COMMON}
${RELIEF}
void main() {
  vec2 frag = fragPos();
  gl_FragColor = vec4(finish(dawned(relief(frag), frag), frag), 1.0);
}
`;

const GARMENT_FRAGMENT = `${COMMON}
${RELIEF}
uniform vec2 uAnchor;
uniform vec2 uCam;
uniform float uZoom;
uniform float uLevel;
uniform vec2 uPresent;
uniform sampler2D uGarment;

const vec2 TEXTURE = vec2(2048.0, 1024.0);
const vec2 IMAGE = vec2(1536.0, 1024.0);
// Behind its matte the relief shows its mean light, without folds, a little
// nearer the ground (UNDER), so the garment's soft edges never show folds
// through them.
const float UNDER = 0.35;

// The photograph is cropped at the waist; as on the page, its lower edge fades out.
float crop(vec2 p) {
  float inside = step(0.0, p.x) * step(0.0, p.y) * step(p.x, IMAGE.x) * step(p.y, IMAGE.y);
  return inside * (1.0 - smoothstep(0.7 * IMAGE.y, IMAGE.y, p.y));
}

// The garment's matte, blurred over so many mip levels of the image, so the blur
// keeps its size on the garment at any zoom and resolution (uLevel undoes the
// sampler's own choice of level).
float matte(vec2 p, float level) {
  return texture2D(uGarment, p / TEXTURE, level + uLevel).a;
}

// The relief's light with its folds averaged out: the mean of a cell's four
// facets under the lamp, as a heavy blur would leave it.
vec3 reliefMean(vec2 frag) {
  vec2 p = frag / (uScale * uUnit) + uOrigin;
  vec4 lamp = lampAt(frag);
  vec3 lv = vec3(lamp.xy - p, lamp.z);
  float dist = length(lv);
  vec3 l = lv / dist;
  float att = 1.0 / (1.0 + (dist * dist) / (uLook.z * uLook.z));
  float diff = 0.0;
  for (int i = 0; i < 4; i++) {
    float s1 = i < 2 ? 1.0 : -1.0;
    float s2 = i == 0 || i == 2 ? 1.0 : -1.0;
    vec3 n = normalize(vec3(-s1 * (uDepth.x - uDepth.y * s2 * uSlope), -uDepth.y * s2, 1.0));
    diff += max(dot(n, l), 0.0);
  }
  return uGround + uLamp * (0.25 * diff * att * lamp.w * uLook.x);
}

// Above the waist the relief behind the garment is its mean wherever the
// garment's matte is; it returns to the folds below the photograph's edge.
float underCrop(vec2 p) {
  float inside = step(0.0, p.x) * step(0.0, p.y) * step(p.x, IMAGE.x) * step(p.y, IMAGE.y);
  return inside * (1.0 - smoothstep(0.88 * IMAGE.y, IMAGE.y, p.y));
}

vec2 toImage(vec2 css) { return uCam + (css - uAnchor) / uZoom; }

void main() {
  vec2 frag = fragPos();
  vec2 css = frag / uScale;
  vec2 pg = toImage(css);
  // uPresent.y: the garment is there at all (1 throughout, except while its
  // texture arrives); uPresent.x: its light, as the texture arrives. It never
  // fades: it is seen only where light falls on it.
  float here = clamp((uPresent.y - 0.65) / 0.35, 0.0, 1.0);
  // The garment takes only the stage's light, never the hero's spilling over
  // the join: it stays unseen until that light falls.
  float lit = dawnLight(frag) * uPresent.x;

  // The garment is solid: it never shows the relief through it. Unlit, it is
  // the ground colour, as dark as the unlit relief around it, so it is unseen
  // until the light that falls on the stage reaches it.
  vec4 g = texture2D(uGarment, pg / TEXTURE) * crop(pg);
  float a = here * g.a;
  vec3 col = here * max(g.rgb * exposure(pg) * lit * tint(), uGround * g.a);

  if (a < 0.998) {
    float under = smoothstep(0.1, 0.6, matte(pg, 4.0)) * underCrop(pg) * here;
    vec3 back = reliefMean(frag);
    back = uGround + (back - uGround) * (1.0 - UNDER * under);
    if (under < 0.998) back = mix(relief(frag), back, under);
    col += dawned(back, frag) * (1.0 - a);
  }

  gl_FragColor = vec4(finish(col, frag), 1.0);
}
`;

const SHEET_VERTEX = `
attribute vec2 aPos;
uniform vec4 uRect;
uniform vec2 uAtlasAt;
uniform vec2 uCenter;
uniform vec2 uAnchor;
uniform float uZoom;
uniform vec2 uView;
varying vec2 vRender;
varying vec2 vAtlas;
void main() {
  vec2 local = aPos * uRect.zw;
  vRender = uRect.xy + local;
  vAtlas = uAtlasAt + local;
  vec2 css = uAnchor + (vRender - uCenter) * uZoom;
  vec2 clip = css / uView * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
}
`;

const SHEET_FRAGMENT = `${COMMON}
uniform sampler2D uAtlas;
uniform vec4 uAbove;
uniform vec2 uAboveAt;
uniform float uShadow;
uniform float uShade;
uniform float uBlur;
uniform float uRim;
uniform float uOpacity;
uniform vec3 uReveal;
varying vec2 vRender;
varying vec2 vAtlas;

const float ATLAS = 2048.0;
const float GLINT = 18.0; // render px: the plane's line of light on the layers

void main() {
  // Out of focus: the same pixels, sampled from a coarser mip level.
  vec4 tex = texture2D(uAtlas, vAtlas / ATLAS, uBlur);
  // Contact shadow: the sheet above, softened, falls just below its front edge.
  vec2 q = vRender - uAbove.xy - vec2(0.0, 7.0);
  float inside = step(-16.0, q.x) * step(-16.0, q.y) * step(q.x, uAbove.z + 16.0) * step(q.y, uAbove.w + 16.0);
  float shade = texture2D(uAtlas, (uAboveAt + q) / ATLAS, 3.0).a * inside * uShadow;
  // A faint rim of light just inside the sheet's outline, so a dark sheet over
  // the relief's dark panel keeps its shape.
  float rim = clamp(2.0 * (tex.a - texture2D(uAtlas, vAtlas / ATLAS, uBlur + 3.0).a), 0.0, 1.0) * uRim;
  // The plane of light passing down through the stack: the rows it has passed
  // show, the rows it has not reached yet do not, across uReveal.y render px;
  // where it crosses the sheet, the surface catches its light (uReveal.z).
  float past = (vRender.y - uReveal.x) / uReveal.y;
  float drawn = 1.0 - smoothstep(-1.0, 1.0, past);
  float line = (vRender.y - uReveal.x) / GLINT;
  float glint = exp(-line * line) * drawn * uReveal.z;
  if (tex.a * drawn < 0.004) discard;

  // The page shows this render in monochrome: grayscale(1) brightness(0.96) contrast(1.06).
  vec3 c = tex.rgb / tex.a;
  float y = dot(c, vec3(0.2126, 0.7152, 0.0722)) * 0.96;
  y = clamp((y - 0.5) * 1.06 + 0.5, 0.0, 1.0);
  vec3 col = max(vec3(y) * exposure(vRender) * uShade * (1.0 - shade) * tint(), uGround) + rim * tint();
  col += glint * (0.16 + 0.55 * y) * uLamp;

  vec2 frag = fragPos();
  float a = tex.a * uOpacity * drawn;
  gl_FragColor = vec4(finish(col, frag) * a, a);
}
`;

const PLANFORM = (30 * Math.PI) / 180;

// failIfMajorPerformanceCaveat does not stop every browser from handing out a
// CPU-rendered context, so the renderer's name is checked as well.
function isSoftwareRenderer(gl) {
  let name = gl.getParameter(gl.RENDERER);
  if (/^webkit webgl$/i.test(name)) {
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    if (info) name = gl.getParameter(info.UNMASKED_RENDERER_WEBGL);
  }
  return /swiftshader|llvmpipe|softpipe|software|basic render/i.test(name || '');
}

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function link(gl, vertex, fragment, names) {
  const vs = compile(gl, gl.VERTEX_SHADER, vertex);
  const fs = compile(gl, gl.FRAGMENT_SHADER, fragment);
  if (!vs || !fs) return null;
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.bindAttribLocation(program, 0, 'aPos');
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  const u = { program };
  for (const name of names) u[name] = gl.getUniformLocation(program, name);
  return u;
}

const SHARED = ['uRes', 'uScale', 'uGround', 'uLamp', 'uLight', 'uRadius', 'uIntensity', 'uFill', 'uEdges'];
// The stage fully lit and no dark: a frame without its own (stageScript's
// frame.dawn and frame.shade).
const FULL_LIGHT = [0, 0, 1, 1];
const NO_SHADE = [0, 0, 1, 1, 1, 0];
const RELIEF_UNIFORMS = [
  'uUnit',
  'uOrigin',
  'uCell',
  'uSlope',
  'uCos',
  'uDepth',
  'uLook',
  'uReliefLamp',
  'uReliefGain',
  'uSupersample',
  'uDawn',
  'uShade',
  'uShadeSoft',
  'uNearLamp',
  'uNearBand',
];

function createPrograms(gl) {
  const relief = link(gl, FULLSCREEN_VERTEX, RELIEF_FRAGMENT, [...SHARED, ...RELIEF_UNIFORMS]);
  const garment = link(gl, FULLSCREEN_VERTEX, GARMENT_FRAGMENT, [
    ...SHARED,
    ...RELIEF_UNIFORMS,
    'uAnchor',
    'uCam',
    'uZoom',
    'uLevel',
    'uPresent',
    'uGarment',
  ]);
  const sheets = link(gl, SHEET_VERTEX, SHEET_FRAGMENT, [
    ...SHARED,
    'uRect',
    'uAtlasAt',
    'uCenter',
    'uAnchor',
    'uZoom',
    'uView',
    'uAtlas',
    'uAbove',
    'uAboveAt',
    'uShadow',
    'uShade',
    'uBlur',
    'uRim',
    'uOpacity',
    'uReveal',
  ]);
  if (!relief || !garment || !sheets) return null;

  for (const p of [relief, garment, sheets]) {
    gl.useProgram(p.program);
    gl.uniform3f(p.uGround, 10 / 255, 11 / 255, 12 / 255);
    gl.uniform3f(p.uLamp, 1.0, 0.95, 0.88);
  }
  for (const p of [relief, garment]) {
    gl.useProgram(p.program);
    gl.uniform1f(p.uSlope, Math.tan(PLANFORM));
    gl.uniform1f(p.uCos, Math.cos(PLANFORM));
  }
  gl.useProgram(garment.program);
  gl.uniform1i(garment.uGarment, 0);
  gl.useProgram(sheets.program);
  gl.uniform1i(sheets.uAtlas, 1);

  const quads = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quads);
  // Clip-space quad for full-screen passes, then a unit quad for sprites.
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  return { relief, garment, sheets, quads };
}

// Textures are premultiplied, so filtering and mipmaps never bleed the
// transparent surround into the edges. An ImageBitmap arrives decoded and
// premultiplied already (the pixel-store flags do not apply to it), which keeps
// the upload off the slow path; an image element is the fallback.
function upload(gl, unit, image) {
  const texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return texture;
}

// Returns null when WebGL is unavailable or software-rendered; the stage then
// stays as plain sections.
export function createStageRenderer(canvas) {
  const gl = canvas.getContext('webgl', {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: 'low-power',
    failIfMajorPerformanceCaveat: true,
  });
  if (!gl || isSoftwareRenderer(gl)) return null;

  let programs = createPrograms(gl);
  if (!programs) return null;

  const UNITS = { garment: 0, atlas: 1 };
  const images = {};
  const textures = {};
  let size = { width: 1, height: 1, scale: 1, supersample: false };
  // The relief as the stage shows it (stageScript's reliefLayout).
  let surface = { unit: 1, origin: 0, cell: [0.42, 0.5], depth: [0.06, 0.42], lamp: [0, 0, 1], look: [0, 0, 1] };
  // What the canvas shows, as the inputs it was drawn from. The canvas keeps
  // its last picture, so a frame drawn from the same inputs is not drawn
  // again; a new size, relief or context clears it.
  let drawn = '';

  const setShared = (p, frame, edges) => {
    gl.uniform2f(p.uRes, canvas.width, canvas.height);
    gl.uniform1f(p.uScale, size.scale);
    // All three lengths in device px (the exit fade's too: in css px it ran over
    // half its height on a dense screen).
    gl.uniform4f(p.uEdges, edges[0] * size.scale, edges[1], edges[2] * size.scale, edges[3] * size.scale);
    if (!frame) return;
    gl.uniform3f(p.uLight, frame.lamp[0], frame.lamp[1], frame.lamp[2]);
    gl.uniform1f(p.uRadius, frame.radius);
    gl.uniform1f(p.uIntensity, frame.intensity);
    gl.uniform1f(p.uFill, frame.fill);
  };

  const setRelief = (p, light, dawn, shade) => {
    const { unit, origin, cell, depth, lamp, look } = surface;
    gl.uniform1f(p.uUnit, unit);
    gl.uniform2f(p.uOrigin, 0, origin);
    gl.uniform2f(p.uCell, cell[0], cell[1]);
    gl.uniform2f(p.uDepth, depth[0], depth[1]);
    gl.uniform3f(p.uLook, look[0], look[1], light?.look ?? look[2]);
    // The relief's lamp, in the hero's pattern: the stage's own, which rests on
    // the stage where the hero's rests on the hero, unless the stage passes in
    // another (CinematicStage: the hero's or the band's, where the reliefs meet).
    const at = light?.lamp || [lamp[0], origin + lamp[1], lamp[2]];
    gl.uniform3f(p.uReliefLamp, at[0], at[1], at[2]);
    gl.uniform1f(p.uReliefGain, light ? light.gain : 1);
    // Just below the join with the hero, the hero's lamp (CinematicStage's `near`:
    // x, y, z, gain, and its band in css px).
    const near = light?.near;
    gl.uniform4f(p.uNearLamp, near ? near[0] : 0, near ? near[1] : 0, near ? near[2] : 1, near ? near[3] : 1);
    gl.uniform2f(p.uNearBand, near ? near[4] * size.scale : 0, near ? near[5] * size.scale : 0);
    // Facets have hard edges: supersampled on a low-density screen.
    gl.uniform1f(p.uSupersample, size.supersample ? 1 : 0);
    gl.uniform4f(p.uDawn, dawn[0], dawn[1], dawn[2], dawn[3]);
    gl.uniform4f(p.uShade, shade[0], shade[1], shade[2], shade[3]);
    gl.uniform2f(p.uShadeSoft, shade[4], shade[5]);
  };

  const fullscreen = (p) => {
    gl.useProgram(p.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, programs.quads);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  };

  const drawRelief = (edges, light, dawn, shade) => {
    const p = programs.relief;
    fullscreen(p);
    setShared(p, null, edges);
    setRelief(p, light, dawn, shade);
    gl.disable(gl.BLEND);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  const drawGarment = (frame, edges, light) => {
    const p = programs.garment;
    fullscreen(p);
    setShared(p, frame, edges);
    setRelief(p, light, frame.dawn, frame.shade || NO_SHADE);
    gl.uniform2f(p.uAnchor, frame.anchor[0], frame.anchor[1]);
    gl.uniform2f(p.uCam, frame.cam[0], frame.cam[1]);
    gl.uniform1f(p.uZoom, frame.zoomGarment);
    gl.uniform1f(p.uLevel, Math.log2(frame.zoomGarment * size.scale));
    gl.uniform2f(p.uPresent, frame.light, frame.present);
    gl.disable(gl.BLEND);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  const drawSheets = (frame, edges) => {
    const p = programs.sheets;
    gl.useProgram(p.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, programs.quads);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 32);
    setShared(p, frame, edges);
    gl.uniform2f(p.uCenter, frame.center[0], frame.center[1]);
    gl.uniform2f(p.uAnchor, frame.anchor[0], frame.anchor[1]);
    gl.uniform1f(p.uZoom, frame.zoom);
    gl.uniform2f(p.uView, size.width, size.height);
    gl.uniform1f(p.uOpacity, frame.show);
    gl.uniform3f(p.uReveal, frame.reveal[0], frame.reveal[1], frame.reveal[2]);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    // Innermost sheet first, so each sheet covers the back of the one below.
    for (let k = frame.sheets.length - 1; k >= 0; k--) {
      const sheet = frame.sheets[k];
      const above = frame.sheets[k - 1];
      gl.uniform4f(p.uRect, sheet.rect[0], sheet.rect[1], sheet.rect[2], sheet.rect[3]);
      gl.uniform2f(p.uAtlasAt, sheet.atlas[0], sheet.atlas[1]);
      if (above) {
        gl.uniform4f(p.uAbove, above.rect[0], above.rect[1], above.rect[2], above.rect[3]);
        gl.uniform2f(p.uAboveAt, above.atlas[0], above.atlas[1]);
      } else {
        gl.uniform4f(p.uAbove, -1e4, -1e4, 0, 0);
        gl.uniform2f(p.uAboveAt, 0, 0);
      }
      gl.uniform1f(p.uShadow, sheet.shadow);
      gl.uniform1f(p.uShade, sheet.shade);
      gl.uniform1f(p.uBlur, sheet.blur);
      gl.uniform1f(p.uRim, sheet.rim);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
  };

  return {
    // The relief needs only the programs; each subject waits for its texture.
    get live() {
      return Boolean(programs) && !gl.isContextLost();
    },
    has(name) {
      return Boolean(textures[name]);
    },
    // One texture per call, so each upload is its own short task.
    setImage(name, image) {
      images[name] = image;
      if (textures[name]) {
        gl.deleteTexture(textures[name]);
        drawn = '';
      }
      textures[name] = upload(gl, UNITS[name], image);
    },
    // The relief's placement and look, from stageScript's reliefLayout.
    setRelief(relief) {
      surface = relief;
      drawn = '';
    },
    resize(width, height, dpr, supersample = false) {
      const w = Math.max(1, Math.round(width * dpr));
      const h = Math.max(1, Math.round(height * dpr));
      size = { width, height, scale: w / width, supersample };
      drawn = '';
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
    },
    // The relief is always drawn; a subject only while some of it shows and
    // once its texture is in. Returns 'same' when the canvas already shows the
    // frame and nothing was drawn.
    draw(frame, edges, light = null) {
      if (!this.live) return false;
      // The subject's texture counts only for the scene that draws it.
      const subject = Boolean(frame.scene === 'garment' ? textures.garment : textures.atlas);
      const inputs = JSON.stringify([frame, edges, light, subject]);
      if (inputs === drawn) return 'same';
      drawn = inputs;
      if (frame.scene === 'garment' && frame.shown && textures.garment) {
        drawGarment(frame, edges, light);
      } else {
        drawRelief(edges, light, frame.dawn || FULL_LIGHT, frame.shade || NO_SHADE);
        if (frame.scene === 'stack' && frame.shown && textures.atlas) drawSheets(frame, edges);
      }
      return true;
    },
    // After a lost context: rebuild the programs and re-upload the cached images.
    restore() {
      programs = createPrograms(gl);
      drawn = '';
      delete textures.garment;
      delete textures.atlas;
      if (!programs) return false;
      for (const name of Object.keys(images)) this.setImage(name, images[name]);
      gl.viewport(0, 0, canvas.width, canvas.height);
      return true;
    },
    destroy() {
      for (const image of Object.values(images)) image.close?.();
      if (gl.isContextLost()) return;
      for (const texture of Object.values(textures)) gl.deleteTexture(texture);
      if (programs) {
        gl.deleteBuffer(programs.quads);
        for (const p of [programs.relief, programs.garment, programs.sheets]) gl.deleteProgram(p.program);
      }
    },
  };
}
