import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Vector3, PerspectiveCamera, MathUtils } from "three";
const shots = [
  {
    angle: 0.76,
    height: 0.2,
    span: 5.05,
    fill: 0.59,
    offset: 0.17,
    target: [0, 0.73, 0],
  },
  {
    angle: 1.3,
    height: 0.13,
    span: 2.25,
    fill: 0.55,
    offset: -0.24,
    target: [0.7, 0.51, 1.2],
  },
  {
    angle: 0.9,
    height: 0.97,
    span: 5.75,
    fill: 0.67,
    offset: 0.14,
    target: [0, 0.3, 0],
  },
  {
    angle: 2.52,
    height: 0.17,
    span: 5.05,
    fill: 0.61,
    offset: 0.18,
    target: [0, 0.68, -0.2],
  },
];
export default function CameraRig({
  progress,
  inspect,
}: {
  progress: React.RefObject<number>;
  inspect: boolean;
}) {
  const { camera: raw, size, invalidate } = useThree(),
    cam = raw as PerspectiveCamera,
    prev = useRef(-10);
  const v = useMemo(
    () => ({
      target: new Vector3(),
      pos: new Vector3(),
      a: new Vector3(),
      b: new Vector3(),
    }),
    [],
  );
  const mobile = size.width < 760;
  useEffect(() => {
    prev.current = -10;
    invalidate();
    if (inspect) {
      cam.clearViewOffset();
      cam.fov = mobile ? 43 : 33;
      const aspect = size.width / size.height;
      const dist =
        5.3 /
        (2 *
          Math.tan((cam.fov * Math.PI) / 360) *
          aspect *
          (mobile ? 0.88 : 0.67));
      cam.position
        .set(0.68, 0.23, 0.7)
        .normalize()
        .multiplyScalar(Math.max(4.4, dist))
        .add(new Vector3(0, 0.66, 0));
      cam.lookAt(0, 0.66, 0);
      cam.updateProjectionMatrix();
    }
  }, [inspect, size.width, size.height, cam, mobile, invalidate]);
  useFrame(() => {
    if (inspect) return;
    const t = MathUtils.clamp(progress.current, 0, 3);
    if (Math.abs(t - prev.current) < 0.00002) return;
    prev.current = t;
    const k = Math.min(2, Math.floor(t)),
      p = shots[k],
      n = shots[k + 1],
      blend = MathUtils.smoothstep(t - k, 0, 1),
      lerp = (a: number, b: number) => MathUtils.lerp(a, b, blend);
    cam.fov = mobile ? 43 : 32;
    const fill = mobile ? 0.91 : lerp(p.fill, n.fill);
    const span = mobile
      ? Math.max(lerp(p.span, n.span), 3.1)
      : lerp(p.span, n.span);
    const dist =
      span /
      (2 *
        Math.tan((cam.fov * Math.PI) / 360) *
        (size.width / size.height) *
        fill);
    const a = lerp(p.angle, n.angle),
      h = lerp(p.height, n.height);
    v.target.lerpVectors(
      v.a.fromArray(p.target),
      v.b.fromArray(n.target),
      blend,
    );
    v.pos
      .set(Math.sin(a) * Math.cos(h), Math.sin(h), Math.cos(a) * Math.cos(h))
      .multiplyScalar(dist)
      .add(v.target);
    cam.position.copy(v.pos);
    cam.lookAt(v.target);
    const off = mobile ? 0 : lerp(p.offset, n.offset);
    const vOff = mobile
      ? lerp([0.09, -0.24, -0.18, 0.12][k], [0.09, -0.24, -0.18, 0.12][k + 1])
      : 0.005;
    cam.setViewOffset(
      size.width,
      size.height,
      -size.width * off,
      -size.height * vOff,
      size.width,
      size.height,
    );
    cam.updateProjectionMatrix();
  }, -1);
  return inspect ? (
    <OrbitControls
      makeDefault
      target={[0, 0.66, 0]}
      enableDamping
      dampingFactor={0.085}
      minDistance={3}
      maxDistance={mobile ? 18 : 12}
      minPolarAngle={0.19}
      maxPolarAngle={Math.PI / 2 - 0.065}
      enablePan={false}
      zoomSpeed={0.8}
      rotateSpeed={0.66}
      onChange={() => invalidate()}
    />
  ) : null;
}
