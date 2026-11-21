// Procedural intro: code-particle vortex -> original (unbranded) sports sedan -> launch past camera.
// Rendered frame-by-frame by scripts/intro/render.py; window.renderAt(t) draws the frame at time t (s).
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { MeshSurfaceSampler } from "three/addons/math/MeshSurfaceSampler.js";

const mono = new FontFace("JetBrains Mono", "url(/node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2)");
document.fonts.add(await mono.load());

const params = new URLSearchParams(location.search);
const W = Number(params.get("w") || 1920);
const H = Number(params.get("h") || 1080);

// ---------- timeline (seconds) ----------
const T = {
  vortexIn: [0.0, 0.45],
  converge: [1.15, 2.05], // per-particle start window
  convergeDur: [0.55, 0.85],
  glyphOut: [1.5, 2.2],
  reveal: [2.05, 2.65],
  lightsOn: 2.72,
  launch: 3.12,
  end: 5.0,
};

// ---------- helpers ----------
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
const R = rng(20261121);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const gauss = () => {
  const u = Math.max(1e-6, R());
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * R());
};

// ---------- renderer ----------
const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true, alpha: false });
renderer.setPixelRatio(1);
renderer.setSize(W, H);
renderer.setClearColor(0x000000, 1);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = null;
const camera = new THREE.PerspectiveCamera(34, W / H, 0.05, 80);

// Dark studio environment with soft-box strips for clean paint reflections
function buildEnvironment() {
  const env = new THREE.Scene();
  env.background = new THREE.Color(0x000000);
  const box = (w, h, color, intensity, pos, rot) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide }),
    );
    m.position.set(...pos);
    m.rotation.set(...rot);
    env.add(m);
  };
  box(14, 2.2, 0xffffff, 4.0, [0, 7, 0], [Math.PI / 2, 0, 0]); // long overhead strip
  box(14, 0.5, 0xffffff, 5.0, [0, 6.5, -2.2], [Math.PI / 2.4, 0, 0]); // thin side strips -> shoulder highlights
  box(14, 0.5, 0xffffff, 5.0, [0, 6.5, 2.2], [-Math.PI / 2.4, 0, 0]);
  box(0.6, 4, 0xd8ecff, 3.0, [7, 3, -6], [0, -Math.PI / 4, 0]); // front-left kicker
  box(20, 0.25, 0x5ab4ff, 4.0, [0, 0.9, -9], [0, 0, 0]); // horizon line for lower body
  box(2.6, 6, 0xbfe3ff, 2.4, [0, 6.5, 2.6], [Math.PI / 2, 0, 0.0]);
  box(10, 1.6, 0x3aa0ff, 2.6, [0, 2.2, -8], [0, 0, 0]); // blue rim behind
  box(10, 1.6, 0x3aa0ff, 2.0, [0, 2.2, 8], [0, Math.PI, 0]);
  box(2.5, 3.5, 0xffffff, 1.8, [9, 2.5, -4], [0, -Math.PI / 2.4, 0]); // front key
  const pmrem = new THREE.PMREMGenerator(renderer);
  const tex = pmrem.fromScene(env, 0.02).texture;
  pmrem.dispose();
  return tex;
}
scene.environment = buildEnvironment();

const keyLight = new THREE.DirectionalLight(0xdcecff, 2.4);
keyLight.position.set(4, 8, -5);
const hemi = new THREE.HemisphereLight(0x5b8dff, 0x000000, 0.0);
scene.add(hemi);
scene.add(keyLight);
const rimLight = new THREE.DirectionalLight(0x2f8cff, 3.0);
rimLight.position.set(-6, 3, 5);
scene.add(rimLight);

// ---------- original sedan geometry (car forward = +x, up = +y) ----------
// Three original body styles, picked with ?car=executive|fastback|sport. No brand features or logos.
const VARIANTS = {
  gt: {
    L: 2.5, W: 0.985, bottom: 0.15, n: 4.8, flare: 0.04, shoulder: 0.012, frontP: 3.8,
    wheel: { x: 1.56, z: 0.83, r: 0.375, w: 0.29 },
    top: [[-2.5, 0.78], [-2.44, 0.94], [-2.28, 1.0], [-1.85, 1.02], [-1.3, 1.0], [0.0, 0.96], [0.7, 0.94],
      [1.4, 0.88], [1.95, 0.8], [2.3, 0.7], [2.5, 0.52]],
    cabin: { xa: -1.95, xb: 0.78, width: 0.78,
      roof: [[-1.95, 0.0], [-1.72, 0.16], [-1.38, 0.35], [-0.95, 0.44], [-0.3, 0.455], [0.08, 0.43], [0.45, 0.25], [0.78, 0.0]] },
    glass: { wind: 0.17, rear: -1.33, sideFront: 0.4, sideRear: -1.62, b: [-0.5, -0.38] },
    doors: [0.55, -0.44, -1.28], handleY: 0.86, headY: 0.69, tailY: 0.9, splitter: true, aggressive: true,
  },
  executive: {
    L: 2.5, W: 0.95, bottom: 0.2, n: 4.6,
    wheel: { x: 1.52, z: 0.8, r: 0.35, w: 0.25 },
    top: [[-2.5, 0.8], [-2.43, 0.96], [-2.25, 1.04], [-1.8, 1.06], [-1.3, 1.04], [0.0, 1.0], [0.95, 0.98],
      [1.6, 0.94], [2.1, 0.87], [2.4, 0.75], [2.5, 0.6]],
    cabin: { xa: -1.82, xb: 1.02, width: 0.8,
      roof: [[-1.82, 0.0], [-1.62, 0.2], [-1.3, 0.39], [-0.9, 0.47], [0.0, 0.48], [0.35, 0.45], [0.72, 0.26], [1.02, 0.0]] },
    glass: { wind: 0.42, rear: -1.28, sideFront: 0.66, sideRear: -1.55, b: [-0.24, -0.1] },
    doors: [0.8, -0.17, -1.08], handleY: 0.9, headY: 0.77, tailY: 0.92,
  },
  fastback: {
    L: 2.48, W: 0.96, bottom: 0.19, n: 4.4,
    wheel: { x: 1.5, z: 0.81, r: 0.355, w: 0.26 },
    top: [[-2.48, 0.78], [-2.4, 0.92], [-2.2, 0.99], [-1.8, 1.01], [-1.2, 1.0], [0.0, 0.97], [0.95, 0.95],
      [1.6, 0.9], [2.1, 0.83], [2.38, 0.71], [2.48, 0.56]],
    cabin: { xa: -2.18, xb: 1.05, width: 0.79,
      roof: [[-2.18, 0.0], [-1.85, 0.12], [-1.4, 0.29], [-0.8, 0.42], [0.0, 0.44], [0.38, 0.41], [0.75, 0.23], [1.05, 0.0]] },
    glass: { wind: 0.45, rear: -1.05, sideFront: 0.68, sideRear: -1.5, b: [-0.2, -0.07] },
    doors: [0.82, -0.14, -1.05], handleY: 0.87, headY: 0.74, tailY: 0.89,
  },
  sport: {
    L: 2.42, W: 0.99, bottom: 0.15, n: 5.0,
    wheel: { x: 1.47, z: 0.83, r: 0.37, w: 0.28 },
    top: [[-2.42, 0.76], [-2.36, 0.93], [-2.18, 1.0], [-1.75, 1.01], [-1.2, 0.99], [0.0, 0.95], [0.95, 0.92],
      [1.55, 0.86], [2.05, 0.77], [2.32, 0.65], [2.42, 0.5]],
    cabin: { xa: -1.85, xb: 1.0, width: 0.8,
      roof: [[-1.85, 0.0], [-1.6, 0.17], [-1.25, 0.34], [-0.8, 0.43], [0.0, 0.44], [0.35, 0.41], [0.72, 0.23], [1.0, 0.0]] },
    glass: { wind: 0.42, rear: -1.22, sideFront: 0.64, sideRear: -1.52, b: [-0.24, -0.1] },
    doors: [0.78, -0.17, -1.07], handleY: 0.85, headY: 0.7, tailY: 0.9, splitter: true,
  },
};
const CAR = VARIANTS[params.get("car") || "gt"] || VARIANTS.gt;
const L = CAR.L;
function catmull(points, x) {
  // points sorted by x: [[x,y],...]
  if (x <= points[0][0]) return points[0][1];
  if (x >= points[points.length - 1][0]) return points[points.length - 1][1];
  let i = 0;
  while (x > points[i + 1][0]) i++;
  const p0 = points[Math.max(0, i - 1)], p1 = points[i], p2 = points[i + 1], p3 = points[Math.min(points.length - 1, i + 2)];
  const t = (x - p1[0]) / (p2[0] - p1[0]);
  const t2 = t * t, t3 = t2 * t;
  return 0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3);
}
const bodyBottom = (x) => CAR.bottom + 0.1 * smooth(L - 0.6, L, Math.abs(x));
const bodyTop = (x) => catmull(CAR.top, x);
const planWidth = (x) => {
  const p = x > 0 ? CAR.frontP || 4.6 : 6.0;
  return CAR.W * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(x) / L, p)), 1 / p);
};
const WHEEL = CAR.wheel;
const ARCH_R = WHEEL.r + 0.075;
const archY = (x) => {
  let y = -10;
  for (const wx of [WHEEL.x, -WHEEL.x]) {
    const d = Math.abs(x - wx);
    if (d < ARCH_R) y = Math.max(y, WHEEL.r + Math.sqrt(ARCH_R * ARCH_R - d * d) - 0.02);
  }
  return y;
};
const N_LOWER = CAR.n;
function bodyZ(x, y) {
  // lateral half-width of the body surface at (x, y)
  const a = planWidth(x);
  const bot = bodyBottom(x), top = bodyTop(x);
  const yc = (bot + top) / 2, b = (top - bot) / 2;
  const s = Math.max(-1, Math.min(1, (y - yc) / b));
  const c = Math.pow(Math.max(0, 1 - Math.pow(Math.abs(s), N_LOWER)), 1 / N_LOWER);
  return a * c * (1 - 0.07 * Math.max(0, s)) + Math.pow(c, 0.5) * sculpt(x, s);
}
function sculpt(x, s) {
  // flared wheel arches + a crisp shoulder line
  if (!CAR.flare) return 0;
  let f = 0;
  for (const wx of [WHEEL.x, -WHEEL.x]) f = Math.max(f, Math.exp(-Math.pow((x - wx) / 0.5, 2)));
  const archBand = smooth(-0.85, -0.2, s) * (1 - smooth(0.25, 0.6, s));
  const shoulder = Math.exp(-Math.pow((s - 0.5) / 0.07, 2)) * smooth(-L, -L + 0.5, x) * (1 - smooth(L - 0.5, L, x));
  return CAR.flare * f * archBand + CAR.shoulder * shoulder;
}
function sectionPoint(x, s01, out) {
  // s01 in [0,1) around the section; returns body surface point
  const a = planWidth(x);
  const bot = bodyBottom(x);
  const top = bodyTop(x);
  const yc = (bot + top) / 2, b = (top - bot) / 2;
  const ang = s01 * Math.PI * 2;
  const c = Math.cos(ang), s = Math.sin(ang);
  const e = 2 / N_LOWER;
  let z = a * Math.sign(c) * Math.pow(Math.abs(c), e);
  let y = yc + b * Math.sign(s) * Math.pow(Math.abs(s), e);
  z *= 1 - 0.07 * Math.max(0, s); // tumblehome
  z += Math.sign(c) * Math.pow(Math.abs(c), 0.5) * sculpt(x, s);
  y = Math.max(y, Math.min(archY(x), yc + b * 0.6)); // wheel-arch cut-outs
  out.set(x, y, z);
  return out;
}
function loft(nx, ns, fn, xa, xb, flip = false, groupOf = null) {
  const pos = [];
  const groups = [[], [], []];
  const v = new THREE.Vector3();
  const xs = [];
  for (let i = 0; i <= nx; i++) {
    const u = i / nx;
    const x = xa + (xb - xa) * (0.5 - 0.5 * Math.cos(Math.PI * u)); // denser at ends
    xs.push(x);
    for (let j = 0; j <= ns; j++) {
      fn(x, j / ns, v);
      pos.push(v.x, v.y, v.z);
    }
  }
  for (let i = 0; i < nx; i++)
    for (let j = 0; j < ns; j++) {
      const a = i * (ns + 1) + j, b = a + ns + 1;
      const gi = groupOf ? groupOf((xs[i] + xs[i + 1]) / 2, (j + 0.5) / ns) : 0;
      if (flip) groups[gi].push(a, a + 1, b, b, a + 1, b + 1);
      else groups[gi].push(a, b, a + 1, b, b + 1, a + 1);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex([...groups[0], ...groups[1], ...groups[2]]);
  g.addGroup(0, groups[0].length, 0);
  g.addGroup(groups[0].length, groups[1].length, 1);
  g.addGroup(groups[0].length + groups[1].length, groups[2].length, 2);
  g.computeVertexNormals();
  return g;
}
const bodyGeo = loft(240, 170, sectionPoint, -L, L);

// Greenhouse: body-colour roof and pillars (group 0) + glass (group 1)
const CB = CAR.cabin;
const cabinBase = (x) => bodyTop(x) - 0.035;
const cabinH = (x) => Math.max(0, catmull(CB.roof, x));
function cabinPoint(x, s01, out) {
  const base = cabinBase(x);
  const h = cabinH(x);
  const wc = CB.width - 0.05 * Math.abs((x + 0.3) / 1.4);
  const ang = s01 * Math.PI; // upper half only
  const c = Math.cos(ang), s = Math.sin(ang);
  const e = 2 / 3.8;
  const z = wc * (1 - 0.22 * s) * Math.sign(c) * Math.pow(Math.abs(c), e);
  const y = base + h * Math.pow(Math.abs(s), e);
  out.set(x, y, z);
  return out;
}
const G = CAR.glass;
function cabinGroup(x, u) {
  const top = u > 0.3 && u < 0.7;
  if (top) return x > G.wind || x < G.rear ? 1 : 0; // windscreen / rear screen, else roof
  if (u > 0.27 && u < 0.3 || u > 0.7 && u < 0.73) return CAR.aggressive ? 2 : 0; // upper window trim
  if (u < 0.035 || u > 0.965) return CAR.aggressive ? 2 : 0; // beltline trim
  if (x > G.sideFront || x < G.sideRear) return 0; // A / C pillars
  if (x > G.b[0] && x < G.b[1]) return CAR.aggressive ? 2 : 0; // B pillar (gloss black on gt)
  return 1;
}
const cabinGeo = loft(200, 120, cabinPoint, CB.xa, CB.xb, false, cabinGroup);

// Shared reveal uniform: the car materialises rear -> front with a glowing scan edge
const revealU = { uReveal: { value: -10 }, uCarX: { value: 0 }, uEdge: { value: new THREE.Color(0x58c8ff) } };
function withReveal(mat, glow = 1.6) {
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uReveal = revealU.uReveal;
    shader.uniforms.uEdge = revealU.uEdge;
    shader.uniforms.uCarX = revealU.uCarX;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying float vRevealX;\nuniform float uCarX;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvRevealX = (modelMatrix * vec4(transformed, 1.0)).x - uCarX;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying float vRevealX;\nuniform float uReveal;\nuniform vec3 uEdge;")
      .replace("#include <clipping_planes_fragment>", "#include <clipping_planes_fragment>\nif (vRevealX > uReveal) discard;")
      .replace(
        "#include <opaque_fragment>",
        `float edgeBand = 1.0 - smoothstep(0.0, 0.12, uReveal - vRevealX);\noutgoingLight += uEdge * edgeBand * ${glow.toFixed(2)};\n#include <opaque_fragment>`,
      );
  };
  mat.customProgramCacheKey = () => "reveal-" + mat.type + glow;
  return mat;
}

const paint = withReveal(
  new THREE.MeshPhysicalMaterial({
    color: 0x0a2d7a,
    metalness: 0.78,
    roughness: 0.3,
    clearcoat: 1,
    clearcoatRoughness: 0.06,
    envMapIntensity: 1.9,
  }),
);
const glass = withReveal(
  new THREE.MeshPhysicalMaterial({ color: 0x18305e, metalness: 0.75, roughness: 0.12, envMapIntensity: 2.6 }),
);
const glossBlack = withReveal(new THREE.MeshPhysicalMaterial({ color: 0x020305, metalness: 0.2, roughness: 0.42, clearcoat: 0.4, clearcoatRoughness: 0.3, envMapIntensity: 0.6 }), 0.3);
const darkTrim = withReveal(new THREE.MeshStandardMaterial({ color: 0x050608, roughness: 0.6, metalness: 0.2 }), 0.3);
const wellMat = withReveal(new THREE.MeshStandardMaterial({ color: 0x020203, roughness: 0.9, side: THREE.DoubleSide }), 0.0);
const tireMat = withReveal(new THREE.MeshStandardMaterial({ color: 0x0b0c0e, roughness: 0.85 }), 0.4);

function rimTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const g = c.getContext("2d");
  g.clearRect(0, 0, 512, 512);
  g.translate(256, 256);
  // outer lip
  g.strokeStyle = "#5c6878";
  g.lineWidth = 22;
  g.beginPath();
  g.arc(0, 0, 240, 0, Math.PI * 2);
  g.stroke();
  // five twin spokes, machined faces
  for (let i = 0; i < 5; i++) {
    for (const off of [-0.11, 0.11]) {
      g.save();
      g.rotate((i / 5) * Math.PI * 2 + off);
      const grd = g.createLinearGradient(0, 60, 0, 236);
      grd.addColorStop(0, "#2a313b");
      grd.addColorStop(1, "#6d7a8c");
      g.fillStyle = grd;
      g.beginPath();
      g.moveTo(-15, 60);
      g.lineTo(15, 60);
      g.lineTo(19, 236);
      g.lineTo(-19, 236);
      g.closePath();
      g.fill();
      g.restore();
    }
  }
  g.fillStyle = "#3a434f";
  g.beginPath();
  g.arc(0, 0, 70, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#14181e";
  g.beginPath();
  g.arc(0, 0, 26, 0, Math.PI * 2);
  g.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
const rimMat = withReveal(new THREE.MeshStandardMaterial({ map: rimTexture(), metalness: 0.9, roughness: 0.28, alphaTest: 0.5, transparent: false }), 0.4);
const discMat = withReveal(new THREE.MeshStandardMaterial({ color: 0x4b525c, metalness: 0.9, roughness: 0.45 }), 0.2);
const caliperMat = withReveal(new THREE.MeshPhysicalMaterial({ color: 0x1e6fff, metalness: 0.3, roughness: 0.35, clearcoat: 1 }), 0.3);

const car = new THREE.Group();
scene.add(car);
const bodyMesh = new THREE.Mesh(bodyGeo, paint);
car.add(bodyMesh);
const cabinMesh = new THREE.Mesh(cabinGeo, [paint, glass, glossBlack]);
car.add(cabinMesh);

// wheel wells + wheels
for (const wx of [WHEEL.x, -WHEEL.x]) {
  const well = new THREE.Mesh(new THREE.CylinderGeometry(ARCH_R - 0.02, ARCH_R - 0.02, 2 * (WHEEL.z + 0.03), 40, 1, true), wellMat);
  well.rotation.x = Math.PI / 2;
  well.position.set(wx, WHEEL.r, 0);
  well.userData.isWell = true;
  car.add(well);
  for (const sz of [1, -1]) {
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(WHEEL.r, WHEEL.r, WHEEL.w, 56), tireMat);
    tire.rotation.x = Math.PI / 2;
    tire.position.set(wx, WHEEL.r, sz * WHEEL.z);
    car.add(tire);
    const rim = new THREE.Mesh(new THREE.CircleGeometry(WHEEL.r * 0.84, 64), rimMat);
    rim.position.set(wx, WHEEL.r, sz * (WHEEL.z + WHEEL.w / 2 + 0.002));
    if (sz < 0) rim.rotation.y = Math.PI;
    rim.userData.spin = true;
    car.add(rim);
    const disc = new THREE.Mesh(new THREE.CircleGeometry(WHEEL.r * 0.62, 40), discMat);
    disc.position.set(wx, WHEEL.r, sz * (WHEEL.z + WHEEL.w / 2 - 0.05));
    if (sz < 0) disc.rotation.y = Math.PI;
    car.add(disc);
    const cal = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.09, 0.05), caliperMat);
    cal.position.set(wx - 0.13, WHEEL.r + 0.13, sz * (WHEEL.z + WHEEL.w / 2 - 0.035));
    cal.rotation.z = 0.75;
    car.add(cal);
    const inner = new THREE.Mesh(new THREE.CircleGeometry(WHEEL.r * 0.84, 40), tireMat);
    inner.position.set(wx, WHEEL.r, sz * (WHEEL.z + WHEEL.w / 2 - 0.06));
    if (sz < 0) inner.rotation.y = Math.PI;
    car.add(inner);
  }
}

const sv = new THREE.Vector3();
function frontX(y, z) {
  for (let x = L; x > 0; x -= 0.004) {
    if (y > bodyTop(x) || y < bodyBottom(x)) continue;
    if (bodyZ(x, y) >= Math.abs(z)) return x;
  }
  return L - 0.05;
}
function rearX(y, z) {
  for (let x = -L; x < 0; x += 0.004) {
    if (y > bodyTop(x) || y < bodyBottom(x)) continue;
    if (bodyZ(x, y) >= Math.abs(z)) return x;
  }
  return -L + 0.05;
}
function tubeThrough(pts, radius, mat, seg = 4) {
  const curve = new THREE.CatmullRomCurve3(pts);
  return new THREE.Mesh(new THREE.TubeGeometry(curve, pts.length * seg, radius, 8, false), mat);
}
function stripAlong(fnPoint, z0, z1, n, radius, mat) {
  const pts = [];
  for (let i = 0; i <= n; i++) pts.push(fnPoint(z0 + ((z1 - z0) * i) / n));
  return tubeThrough(pts, radius, mat);
}

// Front: wide lower intake, optional splitter
const intakeY = bodyBottom(L - 0.1) + 0.17;
car.add(stripAlong((z) => new THREE.Vector3(frontX(intakeY, z) + 0.004, intakeY, z), -0.62, 0.62, 16, 0.05, darkTrim));
if (CAR.splitter) car.add(stripAlong((z) => new THREE.Vector3(frontX(bodyBottom(L) + 0.04, z) + 0.01, bodyBottom(L) + 0.03, z), -0.78, 0.78, 16, 0.018, darkTrim));

// Door shut lines, handles, side sill
const seamMat = withReveal(new THREE.MeshStandardMaterial({ color: 0x01030a, roughness: 0.5 }), 0.0);
for (const dx of CAR.doors) {
  for (const sz of [1, -1]) {
    const pts = [];
    const y0 = Math.max(bodyBottom(dx) + 0.08, archY(dx) + 0.02), y1 = bodyTop(dx) - 0.03;
    for (let k = 0; k <= 10; k++) {
      const y = y0 + ((y1 - y0) * k) / 10;
      pts.push(new THREE.Vector3(dx - 0.03 * (k / 10), y, sz * (bodyZ(dx, y) + 0.002)));
    }
    car.add(tubeThrough(pts, 0.0045, seamMat, 3));
  }
}
const handleMat = withReveal(new THREE.MeshStandardMaterial({ color: 0x8a96a8, metalness: 1, roughness: 0.25 }), 0.3);
for (let i = 0; i < CAR.doors.length - 1; i++) {
  const hx = CAR.doors[i + 1] + 0.16;
  for (const sz of [1, -1]) {
    const hz = bodyZ(hx, CAR.handleY) + 0.006;
    car.add(tubeThrough([new THREE.Vector3(hx, CAR.handleY, sz * hz), new THREE.Vector3(hx + 0.17, CAR.handleY, sz * (bodyZ(hx + 0.17, CAR.handleY) + 0.006))], 0.009, handleMat, 2));
  }
}
for (const sz of [1, -1]) {
  const pts = [];
  for (let x = -WHEEL.x + ARCH_R + 0.02; x <= WHEEL.x - ARCH_R - 0.02; x += 0.12) {
    const y = bodyBottom(x) + 0.05;
    pts.push(new THREE.Vector3(x, y, sz * (bodyZ(x, y) + 0.004)));
  }
  car.add(tubeThrough(pts, 0.02, darkTrim, 2));
}

// Mirrors (body colour) on short dark stems
for (const sz of [1, -1]) {
  const mx = G.sideFront - 0.02, my = cabinBase(G.sideFront) + 0.09;
  const mz = bodyZ(mx, cabinBase(mx) - 0.02) + 0.1;
  const head = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), paint);
  head.scale.set(0.085, 0.065, 0.12);
  head.position.set(mx - 0.03, my + 0.02, sz * mz);
  car.add(head);
  car.add(tubeThrough([new THREE.Vector3(mx + 0.02, my - 0.02, sz * (mz - 0.13)), new THREE.Vector3(mx, my, sz * (mz - 0.04))], 0.014, darkTrim, 2));
}

// LED headlights (slim swept bars) + thin connecting light bar, full-width tail bar
const headMat = withReveal(new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xe8f6ff, emissiveIntensity: 0 }));
const barMat = withReveal(new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0x6cc8ff, emissiveIntensity: 0 }));
const tailMat = withReveal(new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xff2a3a, emissiveIntensity: 0 }));
const headY = (z) => CAR.headY + 0.045 * smooth(0.5, 0.86, Math.abs(z));
const headPoint = (z) => new THREE.Vector3(frontX(headY(z), z) + 0.006, headY(z), z);
let headL, headR;
if (CAR.aggressive) {
  const swept = (sz, dy, x0) => {
    const pts = [];
    for (let k = 0; k <= 12; k++) {
      const u = k / 12;
      const z = sz * (0.46 + 0.42 * u);
      const y = CAR.headY + dy + 0.075 * u * u;
      pts.push(new THREE.Vector3(frontX(y, z) + 0.006 - 0.2 * u * u * x0, y, z));
    }
    return tubeThrough(pts, 0.016, headMat, 4);
  };
  headL = new THREE.Group();
  headR = new THREE.Group();
  headL.add(swept(1, 0, 1), swept(1, -0.045, 0.6));
  headR.add(swept(-1, 0, 1), swept(-1, -0.045, 0.6));
  // vertical DRL slits in the bumper corners
  for (const sz of [1, -1]) {
    const pts = [];
    for (let k = 0; k <= 6; k++) {
      const y = intakeY + 0.03 + 0.17 * (k / 6);
      const z = sz * (0.74 - 0.02 * (k / 6));
      pts.push(new THREE.Vector3(frontX(y, z) + 0.006, y, z));
    }
    car.add(tubeThrough(pts, 0.008, barMat, 3));
  }
} else {
  headL = stripAlong(headPoint, 0.5, 0.84, 10, 0.022, headMat);
  headR = stripAlong(headPoint, -0.84, -0.5, 10, 0.022, headMat);
}
const lightBar = stripAlong((z) => new THREE.Vector3(frontX(CAR.headY - 0.005, z) + 0.006, CAR.headY - 0.005, z), -0.5, 0.5, 12, 0.009, barMat);
const tailZ = 0.93 * bodyZ(-L + 0.25, CAR.tailY);
const tailBar = stripAlong((z) => new THREE.Vector3(rearX(CAR.tailY, z) - 0.006, CAR.tailY, z), -tailZ, tailZ, 20, 0.016, tailMat);
car.add(headL, headR, lightBar, tailBar);

// Headlight glow sprites (bloom sources)
function glowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d");
  const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grd.addColorStop(0, "rgba(255,255,255,1)");
  grd.addColorStop(0.15, "rgba(200,235,255,0.75)");
  grd.addColorStop(0.45, "rgba(80,170,255,0.18)");
  grd.addColorStop(1, "rgba(0,60,160,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const glowTex = glowTexture();
const glows = [];
for (const z of [0.68, -0.68]) {
  const sp = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: glowTex, color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 }),
  );
  sp.position.set(frontX(headY(z), z) + 0.06, headY(z), z);
  car.add(sp);
  glows.push(sp);
}

// Ground glow under the car (keeps it grounded on the pure-dark background)
const groundGlow = new THREE.Mesh(
  new THREE.PlaneGeometry(9, 5),
  new THREE.MeshBasicMaterial({ map: glowTex, color: 0x1d6dff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }),
);
groundGlow.rotation.x = -Math.PI / 2;
groundGlow.position.y = 0.005;
car.add(groundGlow);
const beamGlow = new THREE.Mesh(
  new THREE.PlaneGeometry(4.5, 3.2),
  new THREE.MeshBasicMaterial({ map: glowTex, color: 0xbfe6ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }),
);
beamGlow.rotation.x = -Math.PI / 2;
beamGlow.position.set(L + 1.6, 0.006, 0);
car.add(beamGlow);

// ---------- particles ----------
const sampleMesh = new THREE.Mesh(bodyGeo);
const sampler = new MeshSurfaceSampler(sampleMesh).build();
const cabinSampler = new MeshSurfaceSampler(new THREE.Mesh(cabinGeo)).build();

const NP = 26000; // vortex -> car
const NT = 10000; // launch trail
const NTOT = NP + NT;
const pPos = new Float32Array(NTOT * 3);
const pAlpha = new Float32Array(NTOT);
const pSize = new Float32Array(NTOT);
const pTint = new Float32Array(NTOT);
const vortex = [];
const targets = [];
const tmp = new THREE.Vector3();
for (let i = 0; i < NP; i++) {
  const arm = Math.floor(R() * 3);
  const r0 = 0.25 + Math.pow(R(), 0.9) * 2.45;
  vortex.push({
    r0,
    th0: (arm / 3) * Math.PI * 2 + 2.1 * Math.log(r0 + 0.25) + gauss() * (0.12 + 0.05 * r0),
    y0: gauss() * (0.05 + 0.06 * r0),
    w: 2.3 / Math.pow(0.45 + r0, 0.8),
    start: T.converge[0] + R() * (T.converge[1] - T.converge[0]),
    dur: T.convergeDur[0] + R() * (T.convergeDur[1] - T.convergeDur[0]),
    detach: T.launch + 0.02 + R() * 0.4,
    keep: R(),
    drift: new THREE.Vector3(-0.6 - R() * 1.6, Math.abs(gauss()) * 0.12, gauss() * 0.12),
  });
  if (R() < 0.8) sampler.sample(tmp);
  else cabinSampler.sample(tmp);
  targets.push(tmp.clone());
  pSize[i] = 0.6 + R() * 1.2;
  pTint[i] = R();
}
const trail = [];
for (let j = 0; j < NT; j++) {
  sampler.sample(tmp);
  const local = tmp.clone();
  local.x = -L * (0.55 + 0.45 * R()) * (R() < 0.7 ? 1 : -0.3); // mostly rear / flanks
  trail.push({
    local,
    spawn: T.launch + 0.03 + Math.pow(R(), 0.9) * 0.42,
    life: 0.3 + R() * 0.45,
    vel: new THREE.Vector3(-1.5 - R() * 3.5, gauss() * 0.1 + 0.06, gauss() * 0.12),
  });
  pSize[NP + j] = 0.5 + R() * 1.3;
  pTint[NP + j] = R();
}
const pGeo = new THREE.BufferGeometry();
pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
pGeo.setAttribute("aAlpha", new THREE.BufferAttribute(pAlpha, 1));
pGeo.setAttribute("aSize", new THREE.BufferAttribute(pSize, 1));
pGeo.setAttribute("aTint", new THREE.BufferAttribute(pTint, 1));
const pMat = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  uniforms: { uScale: { value: H * 0.02 } },
  vertexShader: /* glsl */ `
    attribute float aAlpha; attribute float aSize; attribute float aTint;
    uniform float uScale;
    varying float vA; varying float vT;
    void main() {
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = clamp(aSize * uScale / -mv.z, 1.5, 28.0);
      vA = aAlpha; vT = aTint;
      gl_Position = projectionMatrix * mv;
    }`,
  fragmentShader: /* glsl */ `
    varying float vA; varying float vT;
    void main() {
      vec2 d = gl_PointCoord - 0.5;
      float r = length(d) * 2.0;
      float core = smoothstep(1.0, 0.0, r);
      core = core * core;
      vec3 blue = vec3(0.12, 0.45, 1.0);
      vec3 cyan = vec3(0.35, 0.85, 1.0);
      vec3 ice = vec3(0.85, 0.96, 1.0);
      vec3 col = mix(blue, cyan, vT);
      col = mix(col, ice, smoothstep(0.85, 1.0, vT));
      if (vA * core < 0.003) discard;
      gl_FragColor = vec4(col * 1.6, vA * core);
    }`,
});
const points = new THREE.Points(pGeo, pMat);
points.frustumCulled = false;
scene.add(points);

// Code glyph sprites riding the vortex
const TOKENS = ["const", "async", "=>", "0101", "const", "async", "=>", "0101", "{ }", "await"];
function tokenTexture(text) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 128;
  const g = c.getContext("2d");
  g.font = '600 76px "JetBrains Mono", "DejaVu Sans Mono", monospace';
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.shadowColor = "rgba(80,180,255,0.9)";
  g.shadowBlur = 18;
  g.fillStyle = "#d8f1ff";
  g.fillText(text, 256, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
const tokenTex = Object.fromEntries([...new Set(TOKENS)].map((k) => [k, tokenTexture(k)]));
const glyphs = [];
for (let i = 0; i < 34; i++) {
  const text = TOKENS[i % TOKENS.length];
  const mat = new THREE.SpriteMaterial({
    map: tokenTex[text],
    color: new THREE.Color().setHSL(0.56 + R() * 0.04, 0.9, 0.62),
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    opacity: 0,
  });
  const sp = new THREE.Sprite(mat);
  const r0 = 0.9 + Math.pow(R(), 0.7) * 3.0;
  sp.userData = { r0, th0: R() * Math.PI * 2, y0: gauss() * 0.45, w: 1.9 / Math.pow(0.6 + r0, 0.7), s: 0.15 + R() * 0.13, out: T.glyphOut[0] + R() * (T.glyphOut[1] - T.glyphOut[0]) };
  scene.add(sp);
  glyphs.push(sp);
}

// ---------- animation ----------
const CENTER = new THREE.Vector3(0, 0.72, 0);
const VORTEX_TILT = new THREE.Quaternion()
  .setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(6.6, 1.02 - 0.72, -2.75).normalize())
  .multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0.38, 0, 0.12)));
function vortexPos(v, t, out) {
  const shrink = 1 - 0.28 * smooth(0.0, 1.9, t);
  const r = v.r0 * shrink;
  const th = v.th0 + v.w * t * 1.25;
  out.set(Math.cos(th) * r * 1.15, v.y0 * shrink, Math.sin(th) * r);
  out.applyQuaternion(VORTEX_TILT).add(CENTER);
  return out;
}
const launchX = (t) => {
  if (t < T.launch) return -0.05 * smooth(T.launch - 0.25, T.launch, t); // tiny squat/anticipation
  const d = t - T.launch;
  return 0.5 * 38 * d * d + 1.2 * d;
};

const CAM_A = new THREE.Vector3(7.7, 1.25, -3.25);
const CAM_B = new THREE.Vector3(6.6, 1.02, -2.75);
const lookAt = new THREE.Vector3();

const composerTarget = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 });
const composer = new EffectComposer(renderer, composerTarget);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(
  new ShaderPass({
    uniforms: { tDiffuse: { value: null } },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
    fragmentShader: "uniform sampler2D tDiffuse; varying vec2 vUv; void main(){ vec4 c = texture2D(tDiffuse, vUv); float m = max(c.r, max(c.g, c.b)); gl_FragColor = vec4(c.rgb * min(1.0, 5.0 / max(m, 1e-4)), c.a); }",
  }),
);
const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 0.6, 0.45, 0.72);
composer.addPass(bloom);
composer.addPass(new OutputPass());

const vp = new THREE.Vector3();
const STILL = params.get("still") === "1";
function renderAt(t) {
  // camera: slow push-in, then subtle pan + shake as the car launches past
  const push = easeInOut(clamp01(t / 3.1));
  camera.position.lerpVectors(CAM_A, CAM_B, push);
  const cx = launchX(t);
  const shake = smooth(T.launch + 0.25, T.launch + 0.5, t) * (1 - smooth(3.9, 4.5, t));
  camera.position.x += Math.sin(t * 61) * 0.012 * shake;
  camera.position.y += Math.sin(t * 47 + 1.3) * 0.01 * shake;
  lookAt.set(Math.min(cx, 7) * 0.32, 0.62 + 0.04 * Math.min(cx, 5) * 0.1, 0);
  camera.lookAt(lookAt);
  camera.updateMatrixWorld();

  // car
  car.position.set(cx, 0, 0);
  const pitch = T.launch <= t ? -0.022 * smooth(T.launch, T.launch + 0.12, t) * (1 - smooth(T.launch + 0.3, T.launch + 0.7, t)) : 0.01 * smooth(T.launch - 0.25, T.launch, t);
  car.rotation.z = pitch;
  revealU.uCarX.value = cx;
  revealU.uReveal.value = -2.75 + 5.6 * easeInOut(clamp01((t - T.reveal[0]) / (T.reveal[1] - T.reveal[0])));
  const spin = Math.max(0, cx) / WHEEL.r;
  car.children.forEach((c) => { if (c.userData.isWell) c.visible = t > T.reveal[1] - 0.02; });
  car.children.forEach((c) => {
    if (c.userData.spin) {
      if (c.geometry.type === "CircleGeometry") c.rotation.z = c.position.z > 0 ? -spin : spin;
    }
  });

  // lights
  const lt = t - T.lightsOn;
  const flash = lt < 0 ? 0 : Math.min(1, lt / 0.05) * (1 + 1.6 * Math.exp(-lt * 7));
  headMat.emissiveIntensity = 5 * flash;
  barMat.emissiveIntensity = 2.2 * flash;
  tailMat.emissiveIntensity = 3.0 * smooth(T.lightsOn, T.lightsOn + 0.2, t);
  glows.forEach((g) => {
    g.material.opacity = 0.45 * Math.min(1, flash);
    const s = 0.42 + 0.9 * Math.exp(-Math.max(0, lt) * 7) * (lt > 0 ? 1 : 0);
    g.scale.set(s, s * 0.62, 1);
  });
  groundGlow.material.opacity = (0.12 * smooth(T.reveal[0], T.reveal[1], t) + 0.06 * Math.min(1, flash)) * (1 - smooth(T.launch, T.launch + 0.35, t));
  beamGlow.visible = false;
  keyLight.intensity = 2.4 * smooth(T.reveal[0], T.reveal[1] + 0.2, t);
  hemi.intensity = 0.3 * smooth(T.reveal[0], T.reveal[1] + 0.2, t);

  // particles
  const fadeIn = smooth(T.vortexIn[0], T.vortexIn[1], t);
  car.updateMatrixWorld();
  for (let i = 0; i < NP; i++) {
    const v = vortex[i];
    vortexPos(v, t, vp);
    const e = easeInOut(clamp01((t - v.start) / v.dur));
    const tg = targets[i];
    let x, y, z, a;
    if (t < v.detach) {
      x = tg.x + cx;
      y = tg.y;
      z = tg.z;
      a = 1;
    } else {
      const dx = launchX(v.detach);
      const age = t - v.detach;
      x = tg.x + dx + v.drift.x * age;
      y = tg.y + v.drift.y * age;
      z = tg.z + v.drift.z * age;
      a = v.keep < 0.4 ? Math.exp(-age * 3.6) : Math.exp(-age * 7.5);
    }
    // swirl into place along the vortex path
    const sw = (1 - e) * 0.6;
    pPos[i * 3] = vp.x + (x - vp.x) * e + Math.sin(i + t * 3) * sw * 0.1;
    pPos[i * 3 + 1] = vp.y + (y - vp.y) * e;
    pPos[i * 3 + 2] = vp.z + (z - vp.z) * e;
    const landed = smooth(0.85, 1.0, e);
    const surfaceDim = (v.keep < 0.12 ? 0.35 : 0.0) + (1 - smooth(T.reveal[0] + 0.05, T.reveal[1] + 0.1, t)) * (v.keep < 0.12 ? 0.65 : 1.0);
    const base = fadeIn * (0.8 + 0.2 * (1 - landed));
    pAlpha[i] = t < v.detach ? base * (1 + (surfaceDim - 1) * landed) : base * a * 0.95;
  }
  for (let j = 0; j < NT; j++) {
    const p = trail[j];
    const k = NP + j;
    const age = t - p.spawn;
    if (age < 0 || age > p.life) {
      pAlpha[k] = 0;
      pPos[k * 3 + 1] = -100;
      continue;
    }
    const sx = launchX(p.spawn);
    pPos[k * 3] = p.local.x + sx + p.vel.x * age;
    pPos[k * 3 + 1] = p.local.y + p.vel.y * age;
    pPos[k * 3 + 2] = p.local.z + p.vel.z * age;
    pAlpha[k] = Math.pow(1 - age / p.life, 1.6) * smooth(0, 0.04, age) * 0.85;
  }
  pGeo.attributes.position.needsUpdate = true;
  pGeo.attributes.aAlpha.needsUpdate = true;

  // glyphs
  for (const g of glyphs) {
    const u = g.userData;
    const shrink = 1 - 0.3 * smooth(0, 1.9, t);
    const th = u.th0 + u.w * t * 1.25;
    vp.set(Math.cos(th) * u.r0 * shrink * 1.15, u.y0 * shrink, Math.sin(th) * u.r0 * shrink).applyQuaternion(VORTEX_TILT).add(CENTER);
    const pull = easeInOut(clamp01((t - (u.out - 0.35)) / 0.6));
    g.position.lerpVectors(vp, CENTER, pull);
    const o = fadeIn * (1 - smooth(u.out - 0.1, u.out + 0.25, t));
    g.material.opacity = 0.85 * o;
    const s = u.s * (1 - 0.6 * pull);
    g.scale.set(s * 4, s, 1);
  }

  if (STILL) { points.visible = false; glyphs.forEach((g) => (g.visible = false)); }
  const camMode = params.get("cam");
  if (camMode === "side") { camera.position.set(0.0, 0.9, -9.5); camera.lookAt(0, 0.7, 0); }
  if (camMode === "top") { camera.position.set(0.0, 10, 0.01); camera.lookAt(0, 0, 0); }
  if (camMode === "front") { camera.position.set(9, 0.8, 0); camera.lookAt(0, 0.7, 0); }
  if (params.get("debug") === "normal" && !window.__dbg) {
    window.__dbg = true;
    const nm = new THREE.MeshNormalMaterial({ side: params.get("side") === "back" ? THREE.BackSide : THREE.FrontSide });
    car.traverse((o) => { if (o.isMesh) o.material = nm; });
  }
  composer.render();
}

window.renderAt = renderAt;
window.T = T;
document.fonts.ready.then(() => {
  window.sceneReady = true;
});
