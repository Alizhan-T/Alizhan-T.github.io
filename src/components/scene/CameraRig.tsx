import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Vector3, PerspectiveCamera, MathUtils } from "three";

export const cameraShots = [
  {
    label: "Перед ¾",
    code: "FRONT ¾",
    pos: [3.45, 1.32, 4.15] as [number, number, number],
    target: [0, 0.62, 0.15] as [number, number, number],
    fov: 31,
  },
  {
    label: "Колесо M",
    code: "WHEEL DETAIL",
    pos: [2.35, 0.72, 1.85] as [number, number, number],
    target: [0.45, 0.44, 1.32] as [number, number, number],
    fov: 28,
  },
  {
    label: "Сверху ¾",
    code: "HIGH ANGLE",
    pos: [3.8, 3.35, 3.6] as [number, number, number],
    target: [0, 0.48, 0] as [number, number, number],
    fov: 32,
  },
  {
    label: "Корма ¾",
    code: "REAR ¾",
    pos: [-3.35, 1.34, -4.15] as [number, number, number],
    target: [0, 0.65, -0.15] as [number, number, number],
    fov: 31,
  },
] as const;

export default function CameraRig({
  shot,
  zoomEnabled,
}: {
  shot: number;
  zoomEnabled: boolean;
}) {
  const { camera: raw, size, invalidate } = useThree();
  const cam = raw as PerspectiveCamera;
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const animating = useRef(true);
  const userInteracting = useRef(false);

  const mobile = size.width < 760;
  const preset = cameraShots[Math.max(0, Math.min(3, shot))];

  const targets = useMemo(
    () => ({
      pos: new Vector3(...preset.pos),
      look: new Vector3(...preset.target),
    }),
    [preset],
  );

  useEffect(() => {
    const scale = mobile ? 1.24 : 1.0;
    targets.pos.set(
      preset.pos[0] * scale,
      preset.pos[1] * (mobile ? 1.12 : 1),
      preset.pos[2] * scale,
    );
    targets.look.set(...preset.target);
    animating.current = true;
    invalidate();
  }, [preset, mobile, targets, invalidate]);

  useFrame((_, dt) => {
    if (!animating.current || userInteracting.current) return;
    const delta = Math.min(dt, 0.08);
    const speed = 7.5;

    cam.position.x = MathUtils.damp(cam.position.x, targets.pos.x, speed, delta);
    cam.position.y = MathUtils.damp(cam.position.y, targets.pos.y, speed, delta);
    cam.position.z = MathUtils.damp(cam.position.z, targets.pos.z, speed, delta);

    const targetFov = mobile ? preset.fov + 7 : preset.fov;
    cam.fov = MathUtils.damp(cam.fov, targetFov, speed, delta);
    cam.clearViewOffset();
    cam.updateProjectionMatrix();

    if (controlsRef.current) {
      const t = controlsRef.current.target;
      t.x = MathUtils.damp(t.x, targets.look.x, speed, delta);
      t.y = MathUtils.damp(t.y, targets.look.y, speed, delta);
      t.z = MathUtils.damp(t.z, targets.look.z, speed, delta);
      controlsRef.current.update();
    } else {
      cam.lookAt(targets.look);
    }

    const distPos = cam.position.distanceTo(targets.pos);
    if (distPos < 0.008) {
      animating.current = false;
    } else {
      invalidate();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      enablePan={false}
      enableZoom={zoomEnabled}
      minDistance={2.2}
      maxDistance={11}
      minPolarAngle={0.22}
      maxPolarAngle={Math.PI / 2 - 0.05}
      rotateSpeed={0.65}
      zoomSpeed={0.8}
      onStart={() => {
        userInteracting.current = true;
        animating.current = false;
      }}
      onEnd={() => {
        userInteracting.current = false;
      }}
      onChange={() => invalidate()}
    />
  );
}
