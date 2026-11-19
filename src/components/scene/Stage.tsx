import { Suspense, useEffect, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useProgress } from "@react-three/drei";
import { ACESFilmicToneMapping } from "three";
import type { SceneSettings } from "../../data/portfolio";
import CameraRig from "./CameraRig";
import Lighting from "./Lighting";
import Car from "./Car";
type Props = {
  settings: SceneSettings;
  progress: React.RefObject<number>;
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
function Wake() {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    const wake = () => invalidate();
    window.addEventListener("camera-shot", wake);
    return () => window.removeEventListener("camera-shot", wake);
  }, [invalidate]);
  return null;
}
export default function Stage({
  settings,
  progress,
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
        dpr={mobile ? [1, 1.45] : [1, 2]}
        frameloop="demand"
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
          toneMapping: ACESFilmicToneMapping,
        }}
        camera={{ position: [4, 2, 5], fov: 32, near: 0.05, far: 100 }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener("webglcontextlost", onFail, {
            once: true,
          });
          gl.toneMappingExposure = 1.05;
        }}
      >
        <Wake />
        <CameraRig progress={progress} inspect={settings.inspect} />
        <Suspense fallback={null}>
          <Lighting progress={progress} mobile={mobile} />
          <Car settings={settings} active={active} />
          <Ready onReady={onReady} />
        </Suspense>
        {!mobile && (
          <EffectComposer multisampling={0}>
            <Bloom
              intensity={0.24}
              luminanceThreshold={1.25}
              luminanceSmoothing={0.35}
              mipmapBlur
              resolutionScale={0.5}
            />
          </EffectComposer>
        )}
      </Canvas>
    </>
  );
}
