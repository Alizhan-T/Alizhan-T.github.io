import { Environment, Lightformer } from "@react-three/drei";

export default function Lighting({ mobile }: { mobile: boolean }) {
  return (
    <>
      <color attach="background" args={["#0b0c10"]} />
      <fog attach="fog" args={["#0b0c10", 12, 34]} />

      <ambientLight intensity={0.45} />
      <directionalLight
        position={[4.5, 6.2, 4.0]}
        intensity={2.4}
        color="#ffffff"
      />
      <directionalLight
        position={[-4.5, 3.5, -2.5]}
        intensity={1.35}
        color="#dbeafe"
      />
      <pointLight position={[0, 4.2, 2.8]} intensity={18} color="#fff7ed" />

      {/* Crisp dark automotive studio environment map (no muddy grey background!) */}
      <Environment resolution={mobile ? 128 : 256} frames={1}>
        <color attach="background" args={["#050608"]} />
        {/* Overhead twin LED studio rails */}
        <Lightformer
          form="rect"
          intensity={9.5}
          color="#ffffff"
          position={[-1.9, 3.4, 0.3]}
          rotation={[Math.PI / 2, 0, 0.08]}
          scale={[0.32, 9.5, 1]}
        />
        <Lightformer
          form="rect"
          intensity={10.5}
          color="#ffffff"
          position={[1.9, 3.4, 0.2]}
          rotation={[Math.PI / 2, 0, -0.08]}
          scale={[0.36, 9.5, 1]}
        />
        {/* Side shoulder rim highlights to accentuate F90 body creases & wheels */}
        <Lightformer
          form="rect"
          intensity={5.5}
          color="#e2e8f0"
          position={[4.2, 1.35, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={[8.5, 0.55, 1]}
        />
        <Lightformer
          form="rect"
          intensity={5.5}
          color="#e2e8f0"
          position={[-4.2, 1.35, 0]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[8.5, 0.55, 1]}
        />
        {/* Front & rear fill strip */}
        <Lightformer
          form="rect"
          intensity={4.2}
          color="#f8fafc"
          position={[0, 2.2, 5.2]}
          rotation={[0, Math.PI, 0]}
          scale={[5.5, 0.45, 1]}
        />
        <Lightformer
          form="rect"
          intensity={3.6}
          color="#f1b85b"
          position={[0, 2.0, -5.2]}
          scale={[5.5, 0.35, 1]}
        />
      </Environment>

      {/* Lightweight zero-lag studio podium & contact shadow under the car */}
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[6.2, 64]} />
        <meshStandardMaterial
          color="#11131a"
          roughness={0.55}
          metalness={0.25}
        />
      </mesh>
      <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.35, 5.15]} />
        <meshBasicMaterial color="#030406" transparent opacity={0.78} />
      </mesh>
    </>
  );
}
