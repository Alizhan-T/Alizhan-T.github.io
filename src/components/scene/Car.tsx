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
      if (mat.name === "Paint") {
        next = new MeshPhysicalMaterial({
          name: "Paint",
          color: finishes[0].paint,
          metalness: 0.78,
          roughness: 0.23,
          clearcoat: 0.88,
          clearcoatRoughness: 0.12,
          reflectivity: 0.9,
          envMapIntensity: 1.2,
        });
      } else if (mat.name === "Glass") {
        next = new MeshPhysicalMaterial({
          name: "Glass",
          color: "#05070a",
          metalness: 0.15,
          roughness: 0.05,
          clearcoat: 1.0,
          clearcoatRoughness: 0.02,
          envMapIntensity: 2.1,
        });
      } else if (mat.name === "Rim cut face" || mat.name === "Machined aluminum") {
        next = new MeshStandardMaterial({
          name: mat.name,
          color: "#d4d8e0",
          metalness: 0.95,
          roughness: 0.14,
          envMapIntensity: 1.9,
        });
      } else if (mat.name === "Rim graphite" || mat.name === "Shadowline") {
        next = new MeshStandardMaterial({
          name: mat.name,
          color: "#111318",
          metalness: 0.85,
          roughness: 0.22,
          envMapIntensity: 1.5,
        });
      } else if (mat.name === "Caliper") {
        next = new MeshPhysicalMaterial({
          name: "Caliper",
          color: "#d91b1b",
          metalness: 0.45,
          roughness: 0.2,
          clearcoat: 0.9,
        });
      } else {
        next = mat.clone();
        next.envMapIntensity = 1.45;
      }
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
    alive = useRef(1.2);

  useEffect(() => {
    alive.current = 1.1;
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
    const fade = MathUtils.smoothstep(elapsed.current, 0, 0.4);
    parts.materials.get("Paint")?.color.lerp(target, 1 - Math.exp(-10 * delta));

    const apply = (name: string, color: string, strength: number) => {
      const m = parts.materials.get(name);
      if (!m) return;
      m.emissive.set(color);
      m.emissiveIntensity = MathUtils.damp(
        m.emissiveIntensity,
        strength,
        16,
        delta,
      );
    };

    apply("DRL", "#f0f7ff", settings.headlights ? 4.8 * fade : 0);
    apply("Tail", "#ef1a12", 1.8);
    apply("Brake", "#ff2412", settings.brake ? 5.6 : 0.22);
    const blink = settings.hazards && elapsed.current % 0.92 < 0.46;
    apply("Indicator", "#ffa11b", blink ? 4.8 : 0);

    if (
      active &&
      (alive.current > 0 || settings.hazards || elapsed.current < 1.0)
    ) {
      invalidate();
    }
  });

  return <primitive object={parts.model} dispose={null} />;
}
