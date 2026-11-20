import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { detectSoftwareGl } from "./glCaps";
import { buildAmbientParticleField } from "./ambientParticles";

function ParticleLayerScene({ isSoftwareGl }: { isSoftwareGl: boolean }) {
  const { gl, camera, size, invalidate } = useThree();
  const pointerRef = useRef({ x: 0, y: 0, smoothX: 0, smoothY: 0 });
  const timeAccumRef = useRef(0);

  const field = useMemo(() => buildAmbientParticleField(1600), []);

  useEffect(() => {
    return () => {
      field.dispose();
    };
  }, [field]);

  // Smooth mouse tracking for cursor parallax & gentle particle repulsion
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointerRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointerRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
      if (isSoftwareGl) invalidate();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [isSoftwareGl, invalidate]);

  // Re-invalidate on viewport resize for software WebGL
  useEffect(() => {
    if (isSoftwareGl) invalidate();
  }, [size.width, size.height, isSoftwareGl, invalidate]);

  // Paced software-GL rendering via WebGL2 fenceSync so headless Chromium never stalls
  useEffect(() => {
    if (!isSoftwareGl) return;
    let disposed = false;
    let timerId = 0;

    const scheduleNext = () => {
      if (disposed) return;
      const ctx = gl.getContext() as WebGL2RenderingContext;
      if (ctx && typeof ctx.fenceSync === "function") {
        const sync = ctx.fenceSync(ctx.SYNC_GPU_COMMANDS_COMPLETE, 0);
        ctx.flush();
        const poll = () => {
          if (disposed) {
            if (sync) ctx.deleteSync(sync);
            return;
          }
          const status = sync
            ? ctx.getSyncParameter(sync, ctx.SYNC_STATUS)
            : ctx.SIGNALED;
          if (status === ctx.UNSIGNALED) {
            timerId = window.setTimeout(poll, 16);
          } else {
            if (sync) ctx.deleteSync(sync);
            timerId = window.setTimeout(() => {
              if (!disposed) {
                invalidate();
                scheduleNext();
              }
            }, 150);
          }
        };
        timerId = window.setTimeout(poll, 16);
      } else {
        timerId = window.setTimeout(() => {
          if (!disposed) {
            invalidate();
            scheduleNext();
          }
        }, 160);
      }
    };

    invalidate();
    scheduleNext();

    return () => {
      disposed = true;
      window.clearTimeout(timerId);
    };
  }, [isSoftwareGl, gl, invalidate]);

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    const isMobile = size.width < 768;
    timeAccumRef.current += dt * (isMobile ? 0.36 : 0.48);

    pointerRef.current.smoothX = THREE.MathUtils.damp(
      pointerRef.current.smoothX,
      pointerRef.current.x,
      4.5,
      dt,
    );
    pointerRef.current.smoothY = THREE.MathUtils.damp(
      pointerRef.current.smoothY,
      pointerRef.current.y,
      4.5,
      dt,
    );

    const u = field.uniforms;
    u.uTime.value = timeAccumRef.current;
    u.uSizeScale.value = isMobile ? 0.48 : 1.0;
    u.uOpacity.value = isMobile ? 0.42 : 0.56;
    u.uMouseReact.value = isMobile ? 0.25 : 1.0;
    u.uPointer.value.set(pointerRef.current.smoothX, pointerRef.current.smoothY);

    const px = pointerRef.current.smoothX * (isMobile ? 0.15 : 0.5);
    const py = pointerRef.current.smoothY * (isMobile ? 0.1 : 0.28);
    const targetZ = isMobile ? 9.0 : 7.2;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, px, 3.5, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, py, 3.5, dt);
    camera.position.z = isSoftwareGl
      ? targetZ
      : THREE.MathUtils.damp(camera.position.z, targetZ, 4.5, dt);
    camera.lookAt(0, 0, -2.0);
  });

  return <primitive object={field.mesh} />;
}

export default function AmbientCodeParticles() {
  const [contextLost, setContextLost] = useState(false);
  const isSoftwareGl = useMemo(() => detectSoftwareGl(), []);

  if (contextLost) return null;

  return (
    <div
      data-testid="ambient-code-particles"
      className="pointer-events-none fixed inset-0 z-[1]"
    >
      <Canvas
        frameloop={isSoftwareGl ? "demand" : "always"}
        dpr={isSoftwareGl ? 1 : [1, 2]}
        camera={{ position: [0, 0, 7.2], fov: 48, near: 0.1, far: 45 }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          gl.outputColorSpace = THREE.SRGBColorSpace;
          const dom = gl.domElement;
          dom.addEventListener("webglcontextlost", (e) => {
            e.preventDefault();
            setContextLost(true);
          });
          dom.addEventListener("webglcontextrestored", () => {
            setContextLost(false);
          });
        }}
      >
        <ParticleLayerScene isSoftwareGl={isSoftwareGl} />
      </Canvas>
    </div>
  );
}
