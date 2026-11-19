import { useEffect, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import {
  Color,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  MathUtils,
} from "three";
import { finishes, type SceneSettings } from "../../data/portfolio";
export default function Car({
  settings,
  active,
}: {
  settings: SceneSettings;
  active: boolean;
}) {
  const { scene } = useGLTF("/models/bmw_m5_f90.glb", "/draco/");
  const parts = useMemo(() => {
    const model = scene.clone(true),
      overrides = new Map<string, MeshStandardMaterial>();
    function material(mat: MeshStandardMaterial) {
      if (overrides.has(mat.name)) return overrides.get(mat.name)!;
      let next: MeshStandardMaterial;
      if (mat.name === "Paint")
        next = new MeshPhysicalMaterial({
          name: "Paint",
          color: finishes[0].paint,
          metalness: 0.82,
          roughness: 0.23,
          clearcoat: 1,
          clearcoatRoughness: 0.095,
          envMapIntensity: 1.2,
        });
      else if (mat.name === "Glass")
        next = new MeshPhysicalMaterial({
          name: "Glass",
          color: "#0d1013",
          metalness: 0.22,
          roughness: 0.105,
          clearcoat: 1,
        });
      else next = mat.clone();
      overrides.set(mat.name, next);
      return next;
    }
    model.traverse((o) => {
      if (o instanceof Mesh) {
        o.material = Array.isArray(o.material)
          ? o.material.map(material)
          : material(o.material);
        o.frustumCulled = true;
      }
    });
    return { model, materials: overrides };
  }, [scene]);
  const invalidate = useThree((s) => s.invalidate),
    target = useMemo(
      () => new Color(finishes[settings.finish].paint),
      [settings.finish],
    ),
    elapsed = useRef(0),
    alive = useRef(2);
  useEffect(() => {
    alive.current = 1.65;
    invalidate();
  }, [settings, active, invalidate]);
  useEffect(
    () => () => {
      parts.materials.forEach((m) => m.dispose());
    },
    [parts],
  );
  useFrame((_, dt) => {
    const delta = Math.min(dt, 0.08);
    elapsed.current += delta;
    alive.current -= delta;
    const fade = MathUtils.smoothstep(elapsed.current, 0, 0.48);
    parts.materials.get("Paint")?.color.lerp(target, 1 - Math.exp(-8 * delta));
    const apply = (name: string, color: string, strength: number) => {
      const m = parts.materials.get(name);
      if (!m) return;
      m.emissive.set(color);
      m.emissiveIntensity = MathUtils.damp(
        m.emissiveIntensity,
        strength,
        14,
        delta,
      );
    };
    apply("DRL", "#e9f4ff", settings.headlights ? 4.2 * fade : 0);
    apply("Tail", "#ea1810", 1.5);
    apply("Brake", "#ff2412", settings.brake ? 5.3 : 0.18);
    const blink = settings.hazards && elapsed.current % 0.96 < 0.47;
    apply("Indicator", "#ffa11b", blink ? 4.5 : 0);
    if (
      active &&
      (alive.current > 0 || settings.hazards || elapsed.current < 1.4)
    )
      invalidate();
  });
  return <primitive object={parts.model} dispose={null} />;
}
