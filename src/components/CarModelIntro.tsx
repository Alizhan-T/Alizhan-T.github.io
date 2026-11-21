import { useEffect, useRef } from "react";
import type * as THREE from "three";
import {
  CAR_LENGTH_M,
  DRACO_PATH,
  HDRI_URL,
  HEADLIGHT_MATERIAL_RE,
  INTRO_SUBTITLE,
  INTRO_TITLE,
  MODEL_FRONT_AXIS,
  MODEL_INTRO_DURATION,
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
  const hostRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLDivElement | null>(null);
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
        const [THREE, { GLTFLoader }, { DRACOLoader }, { RoomEnvironment }, { RGBELoader }, gsapMod] =
          await Promise.all([
            import("three"),
            import("three/examples/jsm/loaders/GLTFLoader.js"),
            import("three/examples/jsm/loaders/DRACOLoader.js"),
            import("three/examples/jsm/environments/RoomEnvironment.js"),
            import("three/examples/jsm/loaders/RGBELoader.js"),
            import("gsap"),
          ]);
        const gsap = gsapMod.gsap ?? gsapMod.default;
        if (disposed) return;

        const params = new URLSearchParams(window.location.search);
        const front = (params.get("front") as FrontAxis) || MODEL_FRONT_AXIS;
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const speed = reduced ? 2 : 1;

        const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(host.clientWidth, host.clientHeight);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 0;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        host.prepend(renderer.domElement);
        renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%";

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x04060a);
        scene.fog = new THREE.Fog(0x04060a, 9, 22);

        const camera = new THREE.PerspectiveCamera(32, host.clientWidth / host.clientHeight, 0.1, 60);

        // --- Environment: HDRI if provided, otherwise built-in studio ---
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
        scene.environmentIntensity = 0.0;

        // --- Glossy studio floor ---
        const floor = new THREE.Mesh(
          new THREE.CircleGeometry(14, 96),
          new THREE.MeshPhysicalMaterial({
            color: 0x010203,
            roughness: 0.4,
            metalness: 0.0,
            specularIntensity: 0.08,
            clearcoat: 0.35,
            clearcoatRoughness: 0.35,
            envMapIntensity: 0.08,
          }),
        );
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        scene.add(floor);

        // --- Lights: contrasty key/rim with soft shadows ---
        const key = new THREE.SpotLight(0xcfe4ff, 0, 30, 0.5, 0.9, 1.4);
        key.position.set(-5, 7, 5);
        key.castShadow = true;
        key.shadow.mapSize.set(2048, 2048);
        key.shadow.radius = 8;
        key.shadow.bias = -0.0002;
        scene.add(key, key.target);
        const rimL = new THREE.SpotLight(0x4aa8ff, 0, 25, 0.6, 1, 1.5);
        rimL.position.set(6, 3, -5);
        const rimR = new THREE.SpotLight(0x8ac4ff, 0, 25, 0.6, 1, 1.5);
        rimR.position.set(-6, 3, -5);
        scene.add(rimL, rimL.target, rimR, rimR.target);

        // --- Load model ---
        const loader = new GLTFLoader();
        const draco = new DRACOLoader();
        draco.setDecoderPath(DRACO_PATH);
        loader.setDRACOLoader(draco);
        const gltf = await loader.loadAsync(MODEL_URL);
        if (disposed) return;

        const car = new THREE.Group();
        const model = gltf.scene;
        car.add(model);
        // normalise: rotate front to +Z, scale to real length, centre, put on floor
        model.rotation.y = FRONT_ROT[front] ?? 0;
        let box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const scale = CAR_LENGTH_M / Math.max(size.x, size.z);
        model.scale.multiplyScalar(scale);
        box = new THREE.Box3().setFromObject(model);
        const centre = box.getCenter(new THREE.Vector3());
        model.position.set(-centre.x, -box.min.y, -centre.z);
        scene.add(car);
        const carBox = new THREE.Box3().setFromObject(car);
        const carH = carBox.max.y;
        const frontZ = carBox.max.z;

        const headMats: THREE.MeshStandardMaterial[] = [];
        model.traverse((o) => {
          const mesh = o as THREE.Mesh;
          if (!mesh.isMesh) return;
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          for (const m of mats) {
            const sm = m as THREE.MeshStandardMaterial;
            if (!sm.isMeshStandardMaterial) continue;
            sm.envMapIntensity = 1.2;
            const name = `${sm.name} ${mesh.name}`;
            if (HEADLIGHT_MATERIAL_RE.test(name) && !REAR_LIGHT_MATERIAL_RE.test(name)) {
              sm.emissive = new THREE.Color(0xdcecff);
              sm.emissiveIntensity = 0;
              headMats.push(sm);
            }
          }
        });

        // Headlight beams (work even when the model has no named emissive material)
        const beams: THREE.SpotLight[] = [];
        for (const sx of [-1, 1]) {
          const s = new THREE.SpotLight(0xe6f1ff, 0, 18, 0.38, 0.7, 1.4);
          s.position.set(sx * 0.62, carH * 0.5, frontZ - 0.1);
          s.target.position.set(sx * 0.9, 0, frontZ + 8);
          scene.add(s, s.target);
          beams.push(s);
        }
        key.target.position.set(0, carH * 0.4, 0);
        rimL.target.position.set(0, carH * 0.5, 0);
        rimR.target.position.set(0, carH * 0.5, 0);

        // --- Camera rig driven by GSAP ---
        const rig = { angle: 0.0, radius: 11, height: 1.0, lookY: carH * 0.45, lookX: 0 };
        const applyCam = () => {
          camera.position.set(Math.sin(rig.angle) * rig.radius, rig.height, Math.cos(rig.angle) * rig.radius);
          camera.lookAt(rig.lookX, rig.lookY, 0);
        };
        applyCam();

        const state = { exposure: 0, env: 0, lights: 0, key: 0, rim: 0 };
        const apply = () => {
          renderer.toneMappingExposure = state.exposure;
          scene.environmentIntensity = state.env;
          for (const m of headMats) m.emissiveIntensity = state.lights * 6;
          for (const b of beams) b.intensity = state.lights * 40;
          key.intensity = state.key * 55;
          rimL.intensity = rimR.intensity = state.rim * 30;
        };

        const D = MODEL_INTRO_DURATION / speed;
        const k = D / MODEL_INTRO_DURATION;
        const tl = gsap.timeline({ onComplete: requestFade });
        // 1–2: black → headlights switch on
        tl.to(state, { exposure: 0.55, duration: 0.8 * k, ease: "power1.in" }, 0.2 * k)
          .to(state, { lights: 1, duration: 1.1 * k, ease: "power2.inOut" }, 0.5 * k)
          // 3: silhouette emerges from the dark (rim light + environment)
          .to(state, { rim: 1, env: 0.35, duration: 1.8 * k, ease: "sine.inOut" }, 1.4 * k)
          .to(state, { key: 1, env: 1, exposure: 1.05, duration: 2.2 * k, ease: "sine.inOut" }, 2.4 * k)
          // 4: camera glides in to the front
          .to(rig, { radius: 5.4, height: 0.75, lookY: carH * 0.4, duration: 3.4 * k, ease: "power2.inOut" }, 0.4 * k)
          // 5: cinematic fly-around
          .to(rig, { angle: Math.PI * 1.35, duration: 5.2 * k, ease: "sine.inOut" }, 3.2 * k)
          .to(rig, { radius: 6.6, height: 1.5, lookY: carH * 0.5, duration: 5.2 * k, ease: "sine.inOut" }, 3.2 * k)
          // 7: ease out to black before handing over to the site
          .to(state, { exposure: 0.0, duration: 0.7 * k, ease: "power1.in" }, (MODEL_INTRO_DURATION - 0.7) * k);
        // 6: title
        const title = titleRef.current;
        if (title) {
          gsap.set(title, { opacity: 0, y: 14 });
          tl.to(title, { opacity: 1, y: 0, duration: 1.1 * k, ease: "power2.out" }, 5.6 * k).to(
            title,
            { opacity: 0, duration: 0.6 * k, ease: "power1.in" },
            (MODEL_INTRO_DURATION - 0.9) * k,
          );
        }

        let raf = 0;
        const frame = () => {
          apply();
          applyCam();
          renderer.render(scene, camera);
          raf = requestAnimationFrame(frame);
        };
        raf = requestAnimationFrame(frame);

        const onResize = () => {
          renderer.setSize(host.clientWidth, host.clientHeight);
          camera.aspect = host.clientWidth / host.clientHeight;
          camera.fov = camera.aspect < 1 ? 46 : 32;
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
      data-testid="intro-model-overlay"
      data-intro-fading={fading ? "true" : "false"}
      className={`fixed inset-0 z-50 overflow-hidden bg-[#04060A] transition-opacity duration-500 ease-out ${
        fading ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div ref={hostRef} className="absolute inset-0">
        <div
          ref={titleRef}
          className="pointer-events-none absolute inset-x-0 bottom-[14%] z-10 text-center opacity-0"
        >
          <h1 className="font-display text-4xl font-semibold tracking-[0.18em] text-white sm:text-6xl">
            {INTRO_TITLE}
          </h1>
          <p className="mt-3 font-mono text-xs tracking-[0.3em] text-[#38BDF8] sm:text-sm">{INTRO_SUBTITLE}</p>
        </div>
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
          className="fixed right-4 bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-[60] inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-white/15 bg-[#04060A]/80 px-4 py-2 font-mono text-xs tracking-wide text-slate-200 transition-colors hover:border-[#38BDF8]/60 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38BDF8] sm:right-6 sm:bottom-6 sm:min-h-0 sm:px-3.5"
        >
          <span>SKIP</span>
          <span className="hidden text-[#38BDF8] sm:inline">[ESC]</span>
        </button>
      )}
    </div>
  );
}
