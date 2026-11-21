import { useEffect, useRef } from "react";
import { useLang } from "../i18n/LangContext";
import type * as THREE from "three";
import {
  CAR_LENGTH_M,
  DRACO_PATH,
  HDRI_URL,
  HEADLIGHT_MATERIAL_RE,
  MODEL_FRONT_AXIS,
  MODEL_INTRO_DURATION,
  MODEL_LOAD_TIMEOUT_MS,
  MODEL_URL,
  REAR_LIGHT_MATERIAL_RE,
  type FrontAxis,
} from "./modelIntroConfig";

interface CarModelIntroProps {
  fading: boolean;
  replayKey: number;
  onBeginFade: () => void;
  /** Called if the GLB or WebGL fails, so the caller can fall back to the video intro */
  onFail: () => void;
}

const FRONT_ROT: Record<FrontAxis, number> = {
  "+z": 0,
  "-z": Math.PI,
  "+x": -Math.PI / 2,
  "-x": Math.PI / 2,
};

export function CarModelIntro({ fading, replayKey, onBeginFade, onFail }: CarModelIntroProps) {
  const { t } = useLang();
  const tRef = useRef(t);
  tRef.current = t;
  const hostRef = useRef<HTMLDivElement | null>(null);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const loaderTextRef = useRef<HTMLSpanElement | null>(null);
  const fadeOnce = useRef(false);
  const cbRef = useRef({ onBeginFade, onFail });
  cbRef.current = { onBeginFade, onFail };

  useEffect(() => {
    fadeOnce.current = false;
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    let cleanup = () => {};

    const requestFade = () => {
      if (fadeOnce.current) return;
      fadeOnce.current = true;
      cbRef.current.onBeginFade();
    };

    (async () => {
      try {
        const [THREE, { GLTFLoader }, { DRACOLoader }, { MeshoptDecoder }, { RoomEnvironment }, { RGBELoader }, gsapMod] =
          await Promise.all([
            import("three"),
            import("three/examples/jsm/loaders/GLTFLoader.js"),
            import("three/examples/jsm/loaders/DRACOLoader.js"),
            import("three/examples/jsm/libs/meshopt_decoder.module.js"),
            import("three/examples/jsm/environments/RoomEnvironment.js"),
            import("three/examples/jsm/loaders/RGBELoader.js"),
            import("gsap"),
          ]);
        const gsap = gsapMod.gsap ?? gsapMod.default;
        if (disposed) return;

        const params = new URLSearchParams(window.location.search);
        const front = (params.get("front") as FrontAxis) || MODEL_FRONT_AXIS;
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const mobile = window.innerWidth < 700;
        const nav = navigator as Navigator & { deviceMemory?: number };
        const weak = (nav.deviceMemory ?? 8) <= 4 || (navigator.hardwareConcurrency ?? 8) <= 4;
        // quality tier: 2 = high, 1 = medium, 0 = low
        let tier = reduced || (mobile && weak) ? 0 : mobile || weak ? 1 : 2;

        const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
        const pr = Math.min(window.devicePixelRatio, tier === 2 ? 2 : tier === 1 ? 1.5 : 1.15);
        renderer.setPixelRatio(pr);
        renderer.setSize(host.clientWidth, host.clientHeight);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.0;
        renderer.shadowMap.enabled = tier > 0;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        host.prepend(renderer.domElement);
        renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%";
        renderer.domElement.addEventListener("webglcontextlost", (e) => {
          e.preventDefault();
          if (!disposed && !fadeOnce.current) cbRef.current.onFail();
        });

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x04060a);
        scene.fog = new THREE.Fog(0x04060a, 10, 26);
        const camera = new THREE.PerspectiveCamera(32, host.clientWidth / host.clientHeight, 0.1, 80);

        // --- Start downloading the model right away, in parallel with environment setup ---
        const loader = new GLTFLoader();
        const draco = new DRACOLoader();
        draco.setDecoderPath(DRACO_PATH);
        loader.setDRACOLoader(draco);
        loader.setMeshoptDecoder(MeshoptDecoder);
        const loadStart = performance.now();
        const gltfPromise = Promise.race([
          loader.loadAsync(MODEL_URL, (e) => {
            if (e.lengthComputable && loaderTextRef.current) {
              loaderTextRef.current.textContent = `${tRef.current.intro.loading} ${Math.round((e.loaded / e.total) * 100)}%`;
            }
          }),
          new Promise<never>((_, rej) => window.setTimeout(() => rej(new Error("model load timeout")), MODEL_LOAD_TIMEOUT_MS)),
        ]);
        gltfPromise.catch(() => {});

        // --- Environment (HDRI if provided, else built-in studio) ---
        const pmrem = new THREE.PMREMGenerator(renderer);
        let envTex: THREE.Texture;
        try {
          const hdr = await new RGBELoader().loadAsync(HDRI_URL);
          envTex = pmrem.fromEquirectangular(hdr).texture;
          hdr.dispose();
        } catch {
          envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
        }
        scene.environment = envTex;
        scene.environmentIntensity = 0;

        // --- Dark studio floor ---
        const floor = new THREE.Mesh(
          new THREE.CircleGeometry(16, 96),
          new THREE.MeshPhysicalMaterial({
            color: 0x010203, roughness: 0.4, metalness: 0, specularIntensity: 0.05, envMapIntensity: 0.08,
          }),
        );
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        scene.add(floor);

        // --- Lights ---
        const key = new THREE.SpotLight(0xcfe4ff, 0, 30, 0.5, 0.9, 1.4);
        key.position.set(-5, 7, 5);
        key.castShadow = tier > 0;
        key.shadow.mapSize.set(tier === 2 ? 1024 : 512, tier === 2 ? 1024 : 512);
        key.shadow.radius = 8;
        key.shadow.bias = -0.0002;
        scene.add(key, key.target);
        const rimL = new THREE.SpotLight(0x4aa8ff, 0, 25, 0.35, 1, 1.5);
        rimL.position.set(6, 3.5, -5);
        const rimR = new THREE.SpotLight(0x8ac4ff, 0, 25, 0.35, 1, 1.5);
        rimR.position.set(-6, 3.5, -5);
        scene.add(rimL, rimL.target, rimR, rimR.target);

        // --- Wait for the model ---
        const gltf = await gltfPromise;
        void loadStart;
        if (disposed) return;

        // drop degenerate helper geometry
        gltf.scene.updateMatrixWorld(true);
        const junk: THREE.Object3D[] = [];
        gltf.scene.traverse((o) => {
          const m = o as THREE.Mesh;
          if (!m.isMesh) return;
          const sz = new THREE.Box3().setFromObject(o).getSize(new THREE.Vector3());
          if ([sz.x, sz.y, sz.z].filter((v) => v < 0.002).length >= 2) junk.push(o);
        });
        junk.forEach((o) => o.parent?.remove(o));

        if (loaderRef.current) loaderRef.current.style.opacity = "0";
        const car = new THREE.Group();
        const model = gltf.scene;
        car.add(model);
        model.rotation.y = FRONT_ROT[front] ?? 0;
        let box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        model.scale.multiplyScalar(CAR_LENGTH_M / Math.max(size.x, size.z));
        box = new THREE.Box3().setFromObject(model);
        const centre = box.getCenter(new THREE.Vector3());
        model.position.set(-centre.x, -box.min.y, -centre.z);
        scene.add(car);
        car.updateMatrixWorld(true);
        const carBox = new THREE.Box3().setFromObject(car);
        const carH = carBox.max.y;
        const frontZ = carBox.max.z;
        const halfLen = (carBox.max.z - carBox.min.z) / 2;

        // reveal clip plane: keeps z <= constant (sweeps rear → front)
        const clip = new THREE.Plane(new THREE.Vector3(0, 0, -1), -halfLen - 0.5);
        renderer.clippingPlanes = [clip];

        // materials, headlights
        const headMats: THREE.MeshStandardMaterial[] = [];
        const hlSum = [new THREE.Vector3(), new THREE.Vector3()];
        const hlCnt = [0, 0];
        const v = new THREE.Vector3();
        model.traverse((o) => {
          const mesh = o as THREE.Mesh;
          if (!mesh.isMesh) return;
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          for (const m of mats) {
            const sm = m as THREE.MeshStandardMaterial;
            if (!sm.isMeshStandardMaterial) continue;
            sm.envMapIntensity = 1.0;
            const name = `${sm.name} ${mesh.name}`;
            if (HEADLIGHT_MATERIAL_RE.test(name) && !REAR_LIGHT_MATERIAL_RE.test(name)) {
              if (sm.emissive.getHex() === 0) sm.emissive = new THREE.Color(0xdcecff);
              sm.emissiveIntensity = 0;
              headMats.push(sm);
              const pos = mesh.geometry.getAttribute("position");
              for (let i = 0; i < pos.count; i += 3) {
                v.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld);
                if (v.z > frontZ - 0.8 && Math.abs(v.x) > 0.25) {
                  const side = v.x > 0 ? 1 : 0;
                  hlSum[side].add(v);
                  hlCnt[side]++;
                }
              }
            }
          }
        });
        const best = hlCnt[1] >= hlCnt[0] ? 1 : 0;
        const bestPos = hlCnt[best] > 20 ? hlSum[best].clone().divideScalar(hlCnt[best]) : null;
        const hlPos = [-1, 1].map((sx) =>
          bestPos
            ? new THREE.Vector3(sx * Math.abs(bestPos.x), bestPos.y, bestPos.z)
            : new THREE.Vector3(sx * 0.62, carH * 0.47, frontZ - 0.3),
        );
        void ((i: number) => i);
        const _unused = [-1, 1].map((sx, i) =>
          hlCnt[i] > 20
            ? hlSum[i].clone().divideScalar(hlCnt[i])
            : new THREE.Vector3(sx * 0.62, carH * 0.47, frontZ - 0.3),
        );
        void _unused;

        // --- LED headlights: beams + flares, parented to the car so they move with it ---
        const flareTex = (() => {
          const c = document.createElement("canvas");
          c.width = c.height = 128;
          const g = c.getContext("2d")!;
          const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
          gr.addColorStop(0, "rgba(255,255,255,1)");
          gr.addColorStop(0.12, "rgba(235,246,255,0.95)");
          gr.addColorStop(0.35, "rgba(90,170,255,0.45)");
          gr.addColorStop(1, "rgba(30,100,255,0)");
          g.fillStyle = gr;
          g.fillRect(0, 0, 128, 128);
          const t = new THREE.CanvasTexture(c);
          t.colorSpace = THREE.SRGBColorSpace;
          return t;
        })();
        const flares: THREE.Sprite[] = [];
        const beams: THREE.SpotLight[] = [];
        for (const p of hlPos) {
          const sp = new THREE.Sprite(
            new THREE.SpriteMaterial({ map: flareTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false }),
          );
          sp.position.copy(p).add(new THREE.Vector3(0, 0, 0.12));
          sp.scale.setScalar(0.01);
          car.add(sp);
          flares.push(sp);
          const s = new THREE.SpotLight(0xe6f1ff, 0, 22, 0.34, 0.7, 1.3);
          s.position.copy(p);
          s.target.position.set(p.x * 1.1, 0, p.z + 9);
          car.add(s, s.target);
          beams.push(s);
        }
        key.target.position.set(0, carH * 0.4, 0);
        rimL.target.position.set(0, carH * 0.5, 0);
        rimR.target.position.set(0, carH * 0.5, 0);

        // --- Sample the car surface → particle targets (area-weighted) ---
        const meshes: { mesh: THREE.Mesh; cum: Float32Array; total: number }[] = [];
        model.traverse((o) => {
          const mesh = o as THREE.Mesh;
          if (!mesh.isMesh) return;
          const pos = mesh.geometry.getAttribute("position");
          const idx = mesh.geometry.getIndex();
          const triCount = idx ? idx.count / 3 : pos.count / 3;
          const cum = new Float32Array(triCount);
          const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
          let acc = 0;
          for (let t = 0; t < triCount; t++) {
            const i0 = idx ? idx.getX(t * 3) : t * 3, i1 = idx ? idx.getX(t * 3 + 1) : t * 3 + 1, i2 = idx ? idx.getX(t * 3 + 2) : t * 3 + 2;
            a.fromBufferAttribute(pos, i0); b.fromBufferAttribute(pos, i1); c.fromBufferAttribute(pos, i2);
            b.sub(a); c.sub(a);
            acc += b.cross(c).length() * 0.5;
            cum[t] = acc;
          }
          if (acc > 0) meshes.push({ mesh, cum, total: acc });
        });
        const meshCum: number[] = [];
        let grand = 0;
        for (const m of meshes) { grand += m.total; meshCum.push(grand); }
        const bsearch = (arr: ArrayLike<number>, x: number) => {
          let lo = 0, hi = arr.length - 1;
          while (lo < hi) { const mid = (lo + hi) >> 1; if (arr[mid] < x) lo = mid + 1; else hi = mid; }
          return lo;
        };

        const N = tier === 0 ? 20000 : tier === 1 ? 38000 : 70000;
        const aStart = new Float32Array(N * 3), aTarget = new Float32Array(N * 3), aSeed = new Float32Array(N), aGlyph = new Float32Array(N);
        const q = new THREE.Vector3(), qa = new THREE.Vector3(), qb = new THREE.Vector3(), qc = new THREE.Vector3();
        for (let i = 0; i < N; i++) {
          const mi = bsearch(meshCum, Math.random() * grand);
          const m = meshes[mi];
          const ti = bsearch(m.cum, Math.random() * m.total);
          const pos = m.mesh.geometry.getAttribute("position");
          const idx = m.mesh.geometry.getIndex();
          const i0 = idx ? idx.getX(ti * 3) : ti * 3, i1 = idx ? idx.getX(ti * 3 + 1) : ti * 3 + 1, i2 = idx ? idx.getX(ti * 3 + 2) : ti * 3 + 2;
          qa.fromBufferAttribute(pos, i0); qb.fromBufferAttribute(pos, i1); qc.fromBufferAttribute(pos, i2);
          let r1 = Math.random(), r2 = Math.random();
          if (r1 + r2 > 1) { r1 = 1 - r1; r2 = 1 - r2; }
          q.copy(qa).addScaledVector(qb.sub(qa), r1).addScaledVector(qc.sub(qa), r2).applyMatrix4(m.mesh.matrixWorld);
          aTarget.set([q.x, q.y, q.z], i * 3);
          // spiral vortex: 3 arms, a funnel rising outward
          const rad = 0.8 + Math.pow(Math.random(), 0.85) * 7.5;
          const arm = Math.floor(Math.random() * 3) * ((Math.PI * 2) / 3);
          const ang = arm + rad * 0.62 + (Math.random() - 0.5) * 0.55;
          aStart.set([Math.cos(ang) * rad, 0.2 + rad * 0.28 + (Math.random() - 0.5) * 0.9, Math.sin(ang) * rad], i * 3);
          aSeed[i] = Math.random();
          aGlyph[i] = Math.floor(Math.random() * 16);
        }
        const atlas = (() => {
          const c = document.createElement("canvas");
          c.width = c.height = 256;
          const g = c.getContext("2d")!;
          g.fillStyle = "#fff";
          g.font = "bold 46px 'JetBrains Mono', monospace";
          g.textAlign = "center";
          g.textBaseline = "middle";
          "01{}=>;()/*[]&|#$".split("").forEach((ch, i) => g.fillText(ch, (i % 4) * 64 + 32, Math.floor(i / 4) * 64 + 34));
          const t = new THREE.CanvasTexture(c);
          t.generateMipmaps = true;
          t.minFilter = THREE.LinearMipmapLinearFilter;
          return t;
        })();
        const pGeo = new THREE.BufferGeometry();
        pGeo.setAttribute("position", new THREE.BufferAttribute(aTarget, 3));
        pGeo.setAttribute("aStart", new THREE.BufferAttribute(aStart, 3));
        pGeo.setAttribute("aSeed", new THREE.BufferAttribute(aSeed, 1));
        pGeo.setAttribute("aGlyph", new THREE.BufferAttribute(aGlyph, 1));
        pGeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 60);
        const pMat = new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          uniforms: {
            uConv: { value: 0 }, uTime: { value: 0 }, uFade: { value: 1 }, uCar: { value: 0 },
            uSize: { value: 56 * pr * (mobile ? 0.8 : 1) }, uAtlas: { value: atlas },
          },
          vertexShader: `
            attribute vec3 aStart; attribute float aSeed; attribute float aGlyph;
            uniform float uConv, uTime, uCar, uSize;
            varying float vGlyph; varying float vBright; varying float vMix;
            void main(){
              float t = clamp(uConv*1.35 - aSeed*0.35, 0.0, 1.0);
              t = t*t*(3.0-2.0*t);
              vec3 p = mix(aStart, position, t);
              float ang = (1.0 - t) * (uTime*0.9 + aSeed*4.0);
              float c = cos(ang), s = sin(ang);
              p.xz = mat2(c, -s, s, c) * p.xz;
              float lag = 0.08 + fract(aSeed*7.31)*0.92;
              p.z += uCar * lag;
              p += (1.0 - t) * 0.12 * vec3(sin(uTime*2.0+aSeed*30.0), cos(uTime*1.7+aSeed*20.0), 0.0);
              vec4 mv = modelViewMatrix * vec4(p, 1.0);
              gl_Position = projectionMatrix * mv;
              gl_PointSize = min(uSize * (0.55 + aSeed*0.7) / max(-mv.z, 1.5), uSize * 0.5);
              vGlyph = aGlyph; vMix = fract(aSeed*13.7);
              vBright = 0.55 + 0.9*t;
            }`,
          fragmentShader: `
            uniform sampler2D uAtlas; uniform float uFade;
            varying float vGlyph; varying float vBright; varying float vMix;
            void main(){
              vec2 cell = vec2(mod(vGlyph,4.0), floor(vGlyph/4.0));
              vec2 uv = (cell + vec2(gl_PointCoord.x, gl_PointCoord.y)) / 4.0;
              float a = texture2D(uAtlas, uv).a;
              if(a < 0.06) discard;
              vec3 col = mix(vec3(0.12,0.45,1.0), vec3(0.8,0.93,1.0), step(0.78, vMix));
              gl_FragColor = vec4(col * vBright, a * uFade);
            }`,
        });
        const points = new THREE.Points(pGeo, pMat);
        points.frustumCulled = false;
        scene.add(points);

        // floating code tokens (words) that get pulled into the car
        const WORDS = ["const", "async", "=>", "0101", "await", "{ }", "fn()", "return", "import", "git", "0xF90", "</>"];
        const words = WORDS.concat(WORDS).map((w, i) => {
          const c = document.createElement("canvas");
          c.width = 256; c.height = 96;
          const g = c.getContext("2d")!;
          g.font = "bold 54px 'JetBrains Mono', monospace";
          g.textAlign = "center"; g.textBaseline = "middle";
          g.shadowColor = "#38bdf8"; g.shadowBlur = 14;
          g.fillStyle = "#cfe8ff";
          g.fillText(w, 128, 50);
          const tex = new THREE.CanvasTexture(c);
          tex.colorSpace = THREE.SRGBColorSpace;
          const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
          sp.scale.set(0.9, 0.34, 1);
          scene.add(sp);
          return { sp, ang: (i / 24) * Math.PI * 2 + Math.random(), rad: 3 + Math.random() * 5, y: Math.random() * 4.5, sp0: 0.5 + Math.random() * 0.6 };
        });

        // --- Camera rig + state, driven by GSAP ---
        const rig = { angle: 0.6, radius: 15, height: 9, lookY: 1.2, lookZ: 0 };
        const st = { conv: 0, clip: -halfLen - 0.5, fade: 1, lights: 0, flash: 0, key: 0, rim: 0, env: 0, carZ: 0, words: 1, time: 0 };
        const apply = (dt: number) => {
          st.time += dt;
          pMat.uniforms.uConv.value = st.conv;
          pMat.uniforms.uTime.value = st.time;
          pMat.uniforms.uFade.value = st.fade;
          pMat.uniforms.uCar.value = st.carZ;
          clip.constant = st.clip;
          car.position.z = st.carZ;
          floor.visible = st.carZ < 9;
          scene.environmentIntensity = st.env;
          key.intensity = st.key * 40;
          rimL.intensity = rimR.intensity = st.rim * 20;
          const glow = st.lights + st.flash;
          for (const m of headMats) m.emissiveIntensity = glow * 5;
          for (const b of beams) b.intensity = st.lights * 8 + st.flash * 18;
          for (const f of flares) {
            f.scale.setScalar(0.02 + st.flash * 0.8 + st.lights * 0.28);
            (f.material as THREE.SpriteMaterial).opacity = Math.min(1, st.flash * 0.9 + st.lights * 0.5);
          }
          for (const w of words) {
            const t = Math.min(1, Math.max(0, st.conv * 1.1));
            const e = t * t * (3 - 2 * t);
            const a = w.ang + st.time * w.sp0 * (1 - e) * 0.9;
            const r = w.rad * (1 - e) + 0.3;
            w.sp.position.set(Math.cos(a) * r, w.y * (1 - e) + carH * 0.5 * e, Math.sin(a) * r);
            (w.sp.material as THREE.SpriteMaterial).opacity = Math.max(0, 0.9 * (1 - e) * st.words);
          }
          camera.position.set(Math.sin(rig.angle) * rig.radius, rig.height, Math.cos(rig.angle) * rig.radius);
          camera.lookAt(0, rig.lookY, rig.lookZ);
        };

        const k = reduced ? 0.55 : 1;
        const D = MODEL_INTRO_DURATION * k;
        const tl = gsap.timeline();
        tl.call(requestFade, [], (MODEL_INTRO_DURATION - 0.8) * k);
        // 1) vortex of code, camera drifts in
        tl.to(rig, { angle: 0.32, radius: 6.4, height: 0.9, duration: 4.6 * k, ease: "sine.inOut" }, 0)
          .to(rig, { lookY: carH * 0.45 }, 0)
          // 2) particles converge into the car silhouette
          .to(st, { conv: 1, duration: 2.6 * k, ease: "power2.inOut" }, 1.1 * k)
          // 3) the real model is scanned in, lighting comes up
          .to(st, { clip: halfLen + 0.6, duration: 1.1 * k, ease: "power1.inOut" }, 3.0 * k)
          .to(st, { fade: 0.2, duration: 1.1 * k }, 3.0 * k)
          .to(st, { env: 0.6, key: 1, rim: 1, duration: 1.2 * k, ease: "sine.inOut" }, 3.0 * k)
          // 4) LED headlights flash on
          .to(st, { flash: 1, duration: 0.16 * k, ease: "power4.out" }, 4.15 * k)
          .to(st, { lights: 1, duration: 0.3 * k }, 4.15 * k)
          .to(st, { flash: 0.25, duration: 0.55 * k, ease: "power2.out" }, 4.31 * k)
          .to(st, { fade: 0.95, duration: 0.3 * k }, 4.3 * k)
          // 5) the car launches past the camera, leaving a trail of code
          .to(st, { carZ: 17, duration: 1.9 * k, ease: "power3.in" }, 4.75 * k)
          .to(rig, { lookZ: 4.5, duration: 1.7 * k, ease: "power2.in" }, 4.8 * k)
          .to(st, { fade: 0, duration: 0.9 * k, ease: "power1.in" }, 5.4 * k)
          .to(st, { lights: 0, flash: 0, key: 0.2, rim: 0.2, duration: 1.2 * k }, 5.9 * k)
          .to({}, { duration: 0.01 }, D);
        if (params.has("t")) tl.pause().progress(Number(params.get("t")));

        let raf = 0;
        let last = performance.now();
        // adaptive quality: watch frame times and step down when the device struggles
        const noAdapt = params.has("t") || params.get("adapt") === "0";
        let acc = 0, cnt = 0, started = performance.now();
        const downgrade = () => {
          tier = Math.max(0, tier - 1);
          renderer.setPixelRatio(Math.min(window.devicePixelRatio, tier === 1 ? 1.25 : 1));
          renderer.setSize(host.clientWidth, host.clientHeight);
          pMat.uniforms.uSize.value *= 1.15;
          pGeo.setDrawRange(0, Math.floor(N * (tier === 1 ? 0.6 : 0.35)));
          if (tier === 0) { key.castShadow = false; renderer.shadowMap.enabled = false; }
        };
        const frame = (now: number) => {
          const rawDt = now - last;
          if (rawDt < 500) { acc += rawDt; cnt++; }
          if (cnt >= 40 && !noAdapt) {
            const avg = acc / cnt;
            acc = 0; cnt = 0;
            if (avg > 45) {
              if (tier > 0) downgrade();
              else if (avg > 90 && performance.now() - started < 4500 && !fadeOnce.current) {
                // hopeless device: hand over to the lightweight video intro
                cbRef.current.onFail();
                return;
              }
            }
          }
          apply(Math.min(0.05, rawDt / 1000));
          last = now;
          renderer.render(scene, camera);
          raf = requestAnimationFrame(frame);
        };
        raf = requestAnimationFrame(frame);

        const onResize = () => {
          renderer.setSize(host.clientWidth, host.clientHeight);
          camera.aspect = host.clientWidth / host.clientHeight;
          camera.fov = camera.aspect < 1 ? 48 : 32;
          camera.updateProjectionMatrix();
        };
        onResize();
        window.addEventListener("resize", onResize);

        cleanup = () => {
          tl.kill();
          cancelAnimationFrame(raf);
          window.removeEventListener("resize", onResize);
          draco.dispose();
          envTex.dispose();
          pmrem.dispose();
          pGeo.dispose(); pMat.dispose(); atlas.dispose(); flareTex.dispose();
          words.forEach((w) => { (w.sp.material as THREE.SpriteMaterial).map?.dispose(); w.sp.material.dispose(); });
          scene.traverse((o) => {
            const m = o as THREE.Mesh;
            if (m.isMesh) {
              m.geometry.dispose();
              const mats = Array.isArray(m.material) ? m.material : [m.material];
              mats.forEach((x: THREE.Material) => x.dispose());
            }
          });
          renderer.dispose();
          renderer.domElement.remove();
        };
        if (disposed) cleanup();
      } catch (err) {
        console.warn("3D intro unavailable, using video fallback", err);
        if (!disposed) cbRef.current.onFail();
      }
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [replayKey]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.intro.label}
      data-testid="intro-model-overlay"
      data-intro-fading={fading ? "true" : "false"}
      className={`fixed inset-0 z-50 overflow-hidden bg-[#04060A] transition-opacity duration-[1400ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
        fading ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div
        ref={loaderRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center font-mono text-xs tracking-[0.35em] text-[#38BDF8]/70 transition-opacity duration-500"
      >
        <span ref={loaderTextRef} className="animate-pulse">{t.intro.loading}</span>
      </div>
      <div ref={hostRef} className="absolute inset-0">
      </div>
      <div aria-hidden="true" className="m5-intro-vignette pointer-events-none absolute inset-0" />
      {!fading && (
        <button
          type="button"
          onClick={() => {
            if (fadeOnce.current) return;
            fadeOnce.current = true;
            cbRef.current.onBeginFade();
          }}
          data-testid="skip-intro-btn"
          autoFocus
          className="fixed right-4 bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-[60] inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-white/15 bg-[#04060A]/80 px-4 py-2 font-mono text-xs tracking-wide text-slate-200 transition-colors hover:border-[#38BDF8]/60 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38BDF8] sm:right-6 sm:bottom-6 sm:min-h-0 sm:px-3.5"
        >
          <span>{t.intro.skip}</span>
          <span className="hidden text-[#38BDF8] sm:inline">[ESC]</span>
        </button>
      )}
    </div>
  );
}
