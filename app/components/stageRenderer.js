// WebGL renderer for the cinematic stage: one canvas, two scenes.
//
// Scene A draws the garment in front of the hero's folded-plate relief. One lamp
// lights both; the garment's matte throws a soft shadow on the relief behind it.
// Scene B draws the six sheets of the layered material as sprites under the same
// lamp, each darkened where the sheet above it rests close and softened by the
// camera's depth of field.
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
uniform vec3 uGround;
uniform vec3 uLamp;
uniform vec3 uLight;
uniform float uRadius;
uniform float uIntensity;
uniform float uFill;
uniform vec3 uEdges;

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

// While the stage scrolls in or out, its moving edge fades into the page's ground;
// as it leaves, the fade rises from its lower edge, so the scene sets.
vec3 finish(vec3 col, vec2 frag) {
  float y = frag.y / uRes.y;
  float top = mix(1.0, smoothstep(0.0, 0.1, y), uEdges.x);
  float bottom = mix(1.0, smoothstep(0.0, 0.3 + 0.5 * uEdges.z, 1.0 - y), uEdges.y);
  // Same amplitude as the page's grain tile, so the stage and the page read as one surface.
  return mix(uGround, col, top * bottom) + (hash(frag) - 0.5) * (6.0 / 255.0);
}
`;

const GROUND_FRAGMENT = `${COMMON}
void main() {
  vec2 frag = fragPos();
  gl_FragColor = vec4(finish(uGround, frag), 1.0);
}
`;

const GARMENT_FRAGMENT = `${COMMON}
uniform float uScale;
uniform vec2 uAnchor;
uniform vec2 uCam;
uniform vec2 uZoom;
uniform float uThrow;
uniform vec2 uHang;
uniform float uWallLamp;
uniform vec2 uCell;
uniform float uSlope;
uniform float uCos;
uniform vec2 uDepth;
uniform vec3 uLook;
uniform float uSupersample;
uniform sampler2D uGarment;

const vec2 TEXTURE = vec2(2048.0, 1024.0);
const vec2 IMAGE = vec2(1536.0, 1024.0);

float distTo(float x, float period) {
  float m = mod(x, period);
  return min(m, period - m);
}

// The photograph is cropped at the waist; as on the page, its lower edge fades out.
float crop(vec2 p) {
  float inside = step(0.0, p.x) * step(0.0, p.y) * step(p.x, IMAGE.x) * step(p.y, IMAGE.y);
  return inside * (1.0 - smoothstep(0.7 * IMAGE.y, IMAGE.y, p.y));
}

// The hero's relief, standing further back: same folds, same lamp model.
vec3 wall(vec2 p, float px, float shadow) {
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
  vec2 lat = uLight.xy - p;
  vec3 l = normalize(vec3(lat, uWallLamp));
  float diff = max(dot(n, l), 0.0);
  float att = 1.0 / (1.0 + dot(lat, lat) / (uLook.z * uLook.z));
  vec3 hv = normalize(l + vec3(0.0, 0.0, 1.0));
  float spec = pow(max(dot(n, hv), 0.0), 40.0) * 0.08;
  float lit = att * uIntensity * (1.0 - 0.88 * shadow);
  float line = 1.0 - smoothstep(0.0, px * 1.1, distTo(yy, h) * uCos);
  return uGround + uLamp * lit * ((diff + spec) * uLook.x + line * uLook.y * (0.35 + diff));
}

void main() {
  vec2 frag = fragPos();
  vec2 css = frag / uScale;

  // The wall stands behind the garment, so the camera's moves shift it less.
  vec2 pw = uCam + (css - uAnchor) / uZoom.y;
  float px = 1.0 / (uZoom.y * uScale);
  // Shadow: where the line from this wall point to the lamp crosses the garment.
  // The lamp hangs above and to the right of the point it lights (uHang), so
  // the garment's shadow falls down and to the left, as from the hero's lamp.
  vec2 q = pw + (uLight.xy + uHang - pw) * uThrow;
  float shadow = texture2D(uGarment, q / TEXTURE, 4.5).a * crop(q);
  vec3 col;
  if (uSupersample > 0.5) {
    col = 0.25 * (wall(pw + vec2(0.125, 0.375) * px, px, shadow)
                + wall(pw + vec2(0.375, -0.125) * px, px, shadow)
                + wall(pw + vec2(-0.125, -0.375) * px, px, shadow)
                + wall(pw + vec2(-0.375, 0.125) * px, px, shadow));
  } else {
    col = wall(pw, px, shadow);
  }

  vec2 pg = uCam + (css - uAnchor) / uZoom.x;
  vec4 g = texture2D(uGarment, pg / TEXTURE) * crop(pg);
  vec3 lit = max(g.rgb * exposure(pg) * tint(), uGround * g.a);
  col = col * (1.0 - g.a) + lit;

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
varying vec2 vRender;
varying vec2 vAtlas;

const float ATLAS = 2048.0;

void main() {
  // Out of focus: the same pixels, sampled from a coarser mip level.
  vec4 tex = texture2D(uAtlas, vAtlas / ATLAS, uBlur);
  // Contact shadow: the sheet above, softened, falls just below its front edge.
  vec2 q = vRender - uAbove.xy - vec2(0.0, 7.0);
  float inside = step(-16.0, q.x) * step(-16.0, q.y) * step(q.x, uAbove.z + 16.0) * step(q.y, uAbove.w + 16.0);
  float shade = texture2D(uAtlas, (uAboveAt + q) / ATLAS, 3.0).a * inside * uShadow;
  if (tex.a < 0.004) discard;

  // The page shows this render in monochrome: grayscale(1) brightness(0.96) contrast(1.06).
  vec3 c = tex.rgb / tex.a;
  float y = dot(c, vec3(0.2126, 0.7152, 0.0722)) * 0.96;
  y = clamp((y - 0.5) * 1.06 + 0.5, 0.0, 1.0);
  vec3 col = max(vec3(y) * exposure(vRender) * uShade * (1.0 - shade) * tint(), uGround);

  vec2 frag = fragPos();
  gl_FragColor = vec4(finish(col, frag) * tex.a, tex.a);
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

const SHARED = ['uRes', 'uGround', 'uLamp', 'uLight', 'uRadius', 'uIntensity', 'uFill', 'uEdges'];

function createPrograms(gl) {
  const ground = link(gl, FULLSCREEN_VERTEX, GROUND_FRAGMENT, SHARED);
  const garment = link(gl, FULLSCREEN_VERTEX, GARMENT_FRAGMENT, [
    ...SHARED,
    'uScale',
    'uAnchor',
    'uCam',
    'uZoom',
    'uThrow',
    'uHang',
    'uWallLamp',
    'uCell',
    'uSlope',
    'uCos',
    'uDepth',
    'uLook',
    'uSupersample',
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
  ]);
  if (!ground || !garment || !sheets) return null;

  for (const p of [ground, garment, sheets]) {
    gl.useProgram(p.program);
    gl.uniform3f(p.uGround, 10 / 255, 11 / 255, 12 / 255);
    gl.uniform3f(p.uLamp, 1.0, 0.95, 0.88);
  }
  gl.useProgram(garment.program);
  gl.uniform1f(garment.uSlope, Math.tan(PLANFORM));
  gl.uniform1f(garment.uCos, Math.cos(PLANFORM));
  // Relief proportions match the hero's (cell 0.42 x 0.5, the same fold depths).
  gl.uniform2f(garment.uCell, 470, 560);
  gl.uniform2f(garment.uDepth, 0.06, 0.42);
  gl.uniform3f(garment.uLook, 0.1, 0.055, 820);
  gl.uniform1f(garment.uWallLamp, 400);
  gl.uniform1f(garment.uThrow, 0.42);
  gl.uniform2f(garment.uHang, 320, -780);
  gl.uniform1i(garment.uGarment, 0);
  gl.useProgram(sheets.program);
  gl.uniform1i(sheets.uAtlas, 1);

  const quads = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quads);
  // Clip-space quad for full-screen passes, then a unit quad for sprites.
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  return { ground, garment, sheets, quads };
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

  const setShared = (p, frame, edges) => {
    gl.uniform2f(p.uRes, canvas.width, canvas.height);
    gl.uniform3f(p.uEdges, edges[0], edges[1], edges[2]);
    if (!frame) return;
    gl.uniform3f(p.uLight, frame.lamp[0], frame.lamp[1], frame.lamp[2]);
    gl.uniform1f(p.uRadius, frame.radius);
    gl.uniform1f(p.uIntensity, frame.intensity);
    gl.uniform1f(p.uFill, frame.fill);
  };

  const fullscreen = (p) => {
    gl.useProgram(p.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, programs.quads);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  };

  const drawGround = (edges) => {
    const p = programs.ground;
    fullscreen(p);
    setShared(p, null, edges);
    gl.disable(gl.BLEND);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  const drawGarment = (frame, edges) => {
    const p = programs.garment;
    fullscreen(p);
    setShared(p, frame, edges);
    gl.uniform1f(p.uScale, size.scale);
    gl.uniform2f(p.uAnchor, frame.anchor[0], frame.anchor[1]);
    gl.uniform2f(p.uCam, frame.cam[0], frame.cam[1]);
    gl.uniform2f(p.uZoom, frame.zoomGarment, frame.zoomWall);
    gl.uniform3f(p.uLook, frame.look[0], frame.look[1], frame.look[2]);
    // Facets have hard edges: supersampled on a low-density screen.
    gl.uniform1f(p.uSupersample, size.supersample ? 1 : 0);
    gl.disable(gl.BLEND);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  const drawSheets = (frame, edges) => {
    drawGround(edges);
    const p = programs.sheets;
    gl.useProgram(p.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, programs.quads);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 32);
    setShared(p, frame, edges);
    gl.uniform2f(p.uCenter, frame.center[0], frame.center[1]);
    gl.uniform2f(p.uAnchor, frame.anchor[0], frame.anchor[1]);
    gl.uniform1f(p.uZoom, frame.zoom);
    gl.uniform2f(p.uView, size.width, size.height);
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
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
  };

  return {
    get ready() {
      return Boolean(textures.garment && textures.atlas) && !gl.isContextLost();
    },
    // One texture per call, so each upload is its own short task.
    setImage(name, image) {
      images[name] = image;
      if (textures[name]) gl.deleteTexture(textures[name]);
      textures[name] = upload(gl, UNITS[name], image);
    },
    resize(width, height, dpr, supersample = false) {
      const w = Math.max(1, Math.round(width * dpr));
      const h = Math.max(1, Math.round(height * dpr));
      size = { width, height, scale: w / width, supersample };
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
    },
    draw(frame, edges) {
      if (!this.ready) return false;
      if (frame.intensity <= 0) drawGround(edges);
      else if (frame.scene === 'garment') drawGarment(frame, edges);
      else drawSheets(frame, edges);
      return true;
    },
    // After a lost context: rebuild the programs and re-upload the cached images.
    restore() {
      programs = createPrograms(gl);
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
        for (const p of [programs.ground, programs.garment, programs.sheets]) gl.deleteProgram(p.program);
      }
    },
  };
}
