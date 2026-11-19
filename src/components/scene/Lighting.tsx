import { useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  Lightformer,
  MeshReflectorMaterial,
} from "@react-three/drei";
import { useRef } from "react";
import { MathUtils, PointLight } from "three";
export default function Lighting({
  progress,
  mobile,
}: {
  progress: React.RefObject<number>;
  mobile: boolean;
}) {
  const time = useRef(0),
    key = useRef<PointLight>(null),
    invalidate = useThree((s) => s.invalidate);
  useFrame(({ scene }, dt) => {
    time.current += Math.min(dt, 0.08);
    const dim = 1 - 0.4 * Math.max(0, 1 - Math.abs(progress.current - 2));
    scene.environmentIntensity =
      (0.45 + 0.8 * MathUtils.smoothstep(time.current, 0.24, 1.2)) * dim;
    if (key.current) key.current.intensity = 32 * dim;
    if (time.current < 1.25) invalidate();
  });
  return (
    <>
      <color attach="background" args={["#101113"]} />
      <fog attach="fog" args={["#101113", 11, 39]} />
      <ambientLight intensity={0.36} />
      <pointLight ref={key} position={[3.1, 5.4, 3.1]} intensity={32} />
      <directionalLight
        position={[-4, 3, -1]}
        intensity={1.45}
        color="#ecf2ff"
      />
      <Environment resolution={mobile ? 128 : 256} frames={1}>
        <color attach="background" args={["#393b3d"]} />
        <Lightformer
          form="rect"
          intensity={5.2}
          color="white"
          position={[-2.6, 3.1, 0.5]}
          rotation={[Math.PI / 2, 0, 0.2]}
          scale={[0.38, 9, 1]}
        />
        <Lightformer
          form="rect"
          intensity={6.6}
          color="white"
          position={[2.3, 3.1, 0.25]}
          rotation={[Math.PI / 2, 0, -0.15]}
          scale={[0.45, 8, 1]}
        />
        <Lightformer
          form="rect"
          intensity={3.5}
          color="#e7eff8"
          position={[4, 1.6, -3]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={[8, 0.58, 1]}
        />
        <Lightformer
          form="rect"
          intensity={4.4}
          color="white"
          position={[-3.4, 1.7, 1]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[8, 1.1, 1]}
        />
        <Lightformer
          form="rect"
          intensity={3.2}
          color="white"
          position={[0, 4, -5]}
          scale={[8, 0.32, 1]}
        />
      </Environment>
      <mesh position={[0, -0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[110, 110]} />
        <MeshReflectorMaterial
          resolution={128}
          blur={mobile ? [64, 12] : [96, 16]}
          mixBlur={0.78}
          mixStrength={0.85}
          roughness={0.72}
          metalness={0.24}
          color="#292a2c"
          mirror={0.25}
        />
      </mesh>
      {[
        [-6, 4.2, -3],
        [-1.8, 4.2, -3],
        [2.4, 4.2, -3],
        [6.6, 4.2, -3],
      ].map((p, i) => (
        <mesh
          key={i}
          position={p as [number, number, number]}
          rotation={[0, 0, -0.03]}
        >
          <boxGeometry args={[0.047, 0.035, 10]} />
          <meshBasicMaterial color="#eeeeea" toneMapped={false} />
        </mesh>
      ))}
    </>
  );
}
