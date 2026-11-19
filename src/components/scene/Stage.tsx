import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { useProgress } from "@react-three/drei";
import { ACESFilmicToneMapping } from "three";
import type { SceneSettings } from "../../data/portfolio";
import CameraRig from "./CameraRig";
import Lighting from "./Lighting";
import Car from "./Car";

type Props = {
  settings: SceneSettings;
  shot: number;
  zoomEnabled: boolean;
  onReady: () => void;
  onFail: () => void;
  onProgress: (p: number) => void;
  active: boolean;
};

function Ready({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    onReady();
  }, [onReady]);
  return null;
}

function Monitor({ report }: { report: (p: number) => void }) {
  const { progress } = useProgress();
  useEffect(() => report(progress), [progress, report]);
  return null;
}

export default function Stage({
  settings,
  shot,
  zoomEnabled,
  onReady,
  onFail,
  onProgress,
  active,
}: Props) {
  const [mobile, setMobile] = useState(
    matchMedia("(max-width: 760px)").matches,
  );

  useEffect(() => {
    const q = matchMedia("(max-width: 760px)"),
      fn = () => setMobile(q.matches);
    q.addEventListener("change", fn);
    return () => q.removeEventListener("change", fn);
  }, []);

  return (
    <>
      <Monitor report={onProgress} />
      <Canvas
        dpr={mobile ? [1, 1.35] : [1, 1.75]}
        frameloop="demand"
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
          toneMapping: ACESFilmicToneMapping,
        }}
        camera={{ position: [3.45, 1.32, 4.15], fov: 31, near: 0.05, far: 80 }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener("webglcontextlost", onFail, {
            once: true,
          });
          gl.toneMappingExposure = 1.15;
        }}
      >
        <CameraRig shot={shot} zoomEnabled={zoomEnabled} />
        <Suspense fallback={null}>
          <Lighting mobile={mobile} />
          <Car settings={settings} active={active} />
          <Ready onReady={onReady} />
        </Suspense>
      </Canvas>
    </>
  );
}
