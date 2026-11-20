export type TechId =
  | "python"
  | "swift"
  | "nodejs"
  | "flutter"
  | "solidity"
  | "docker";

export interface TechStackCard {
  id: TechId;
  name: string;
  role: string;
  accentHex: string;
  glowRgb: string;
  borderHex: string;
}

export const DEFAULT_ACTIVE_STACK_INDEX = 3; // Flutter (MOBILE)

export const TECH_STACK_CARDS: ReadonlyArray<TechStackCard> = [
  {
    id: "python",
    name: "Python",
    role: "AI - CV",
    accentHex: "#3B82F6",
    glowRgb: "59, 130, 246",
    borderHex: "#60A5FA",
  },
  {
    id: "swift",
    name: "Swift",
    role: "iOS",
    accentHex: "#F97316",
    glowRgb: "249, 115, 22",
    borderHex: "#FB923C",
  },
  {
    id: "nodejs",
    name: "Node.js",
    role: "BACKEND",
    accentHex: "#22C55E",
    glowRgb: "34, 197, 94",
    borderHex: "#4ADE80",
  },
  {
    id: "flutter",
    name: "Flutter",
    role: "MOBILE",
    accentHex: "#38BDF8",
    glowRgb: "56, 189, 248",
    borderHex: "#38BDF8",
  },
  {
    id: "solidity",
    name: "Solidity",
    role: "WEB3",
    accentHex: "#A855F7",
    glowRgb: "168, 85, 247",
    borderHex: "#C084FC",
  },
  {
    id: "docker",
    name: "Docker",
    role: "DEVOPS",
    accentHex: "#06B6D4",
    glowRgb: "6, 182, 212",
    borderHex: "#22D3EE",
  },
];

export interface CardTilt {
  rotateX: number;
  rotateY: number;
  glareX: number;
  glareY: number;
}

export const NEUTRAL_TILT: CardTilt = {
  rotateX: 0,
  rotateY: 0,
  glareX: 50,
  glareY: 30,
};

export interface OrbitConfig {
  radiusX: number;
  radiusZ: number;
  yLift: number;
  /** Controls how much wider outer flank cards sit relative to front neighbors (0..0.48) */
  flankSpread: number;
  maxRotateY: number;
}

export const DESKTOP_ORBIT_CONFIG: OrbitConfig = {
  radiusX: 372,
  radiusZ: 170,
  yLift: 12,
  flankSpread: 0.4,
  maxRotateY: 28,
};

export const TABLET_ORBIT_CONFIG: OrbitConfig = {
  radiusX: 270,
  radiusZ: 130,
  yLift: 10,
  flankSpread: 0.36,
  maxRotateY: 26,
};

export const MOBILE_ORBIT_CONFIG: OrbitConfig = {
  radiusX: 142,
  radiusZ: 96,
  yLift: 8,
  flankSpread: 0.34,
  maxRotateY: 26,
};

export interface OrbitPose {
  angle: number;
  x: number;
  y: number;
  z: number;
  rotateY: number;
  rotateX: number;
  scale: number;
  brightness: number;
  opacity: number;
  zIndex: number;
  /** 1.0 when dead-front, 0.0 when directly in back */
  frontness: number;
  isFront: boolean;
}

export const TWO_PI = Math.PI * 2;

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Wraps any radian angle cleanly into (-PI, PI]. */
export function normalizeAngle(rad: number): number {
  let a = ((rad + Math.PI) % TWO_PI + TWO_PI) % TWO_PI - Math.PI;
  if (a <= -Math.PI) a += TWO_PI;
  return a;
}

/** Shortest signed radian difference from `fromRad` to `toRad` in (-PI, PI]. */
export function shortestAngleDelta(fromRad: number, toRad: number): number {
  return normalizeAngle(toRad - fromRad);
}

/** Exact orbit phase where card `index` sits dead-center at angle = 0. */
export function targetPhaseForIndex(index: number, count: number): number {
  if (count <= 0) return 0;
  const step = TWO_PI / count;
  return normalizeAngle(-index * step);
}

/** Returns which card index [0..count-1] is currently closest to dead-front (angle = 0). */
export function getFrontCardIndex(phase: number, count: number): number {
  if (count <= 0) return 0;
  const step = TWO_PI / count;
  let bestIdx = 0;
  let bestDist = Infinity;

  for (let i = 0; i < count; i++) {
    const dist = Math.abs(normalizeAngle(phase + i * step));
    if (dist < bestDist) {
      bestDist = dist;
      bestIdx = i;
    }
  }
  return bestIdx;
}

/**
 * Computes subtle 3D tilt angles (in degrees) and specular spotlight percentages
 * from pointer coordinates inside a card's bounding box.
 */
export function computeCardTilt(
  clientX: number,
  clientY: number,
  rect: { left: number; top: number; width: number; height: number },
  maxTiltDeg = 9,
): CardTilt {
  if (rect.width <= 0 || rect.height <= 0) {
    return NEUTRAL_TILT;
  }

  const normX = clamp(((clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
  const normY = clamp(((clientY - rect.top) / rect.height) * 2 - 1, -1, 1);

  return {
    rotateX: Number((-normY * maxTiltDeg).toFixed(2)),
    rotateY: Number((normX * maxTiltDeg).toFixed(2)),
    glareX: Number((((normX + 1) / 2) * 100).toFixed(1)),
    glareY: Number((((normY + 1) / 2) * 100).toFixed(1)),
  };
}

/**
 * Computes continuous C-infinity 3D orbital carousel pose for card `index` at orbit `phase`.
 * - Cards glide smoothly along a 3D ring with staggered flanks (`sin(theta) * (1 - flankSpread * cos(theta))`)
 *   so outer cards remain visible outside front neighbors instead of stacking directly behind them.
 * - All 5 visible cards (0deg, +-60deg, +-120deg) stay 100% solid opaque (opacity: 1) so background code
 *   never bleeds through; only the single card crossing deep behind the front hero softly dissolves.
 */
export function computeOrbitPose(
  index: number,
  count: number,
  phase: number,
  config: OrbitConfig = DESKTOP_ORBIT_CONFIG,
  tilt: CardTilt = NEUTRAL_TILT,
): OrbitPose {
  const step = count > 0 ? TWO_PI / count : 0;
  const angle = normalizeAngle(phase + index * step);
  const sinA = Math.sin(angle);
  const cosA = Math.cos(angle);

  // 1.0 dead front, 0.5 sides, 0.0 dead back
  const frontness = (cosA + 1) * 0.5;
  const isFront = Math.abs(angle) < step * 0.45;

  // Staggered horizontal orbit curve: front neighbors sit closer to center, back flanks sit wider
  const x = sinA * (1 - config.flankSpread * cosA) * config.radiusX;
  const z = cosA * config.radiusZ;
  // Subtle perspective arc: front card drops gently forward, back cards sit slightly higher
  const y = (cosA - 0.35) * config.yLift;

  // Smooth front-facing 3D curvature (cards stay readable all the way around, never flipped backward)
  const baseRotateY = -sinA * config.maxRotateY;
  const tiltWeight = Math.pow(Math.max(0, cosA), 3);
  const rotateY = baseRotateY + tilt.rotateY * tiltWeight;
  const rotateX = tilt.rotateX * tiltWeight;

  // Scale smoothly from 0.68 (deep back, cleanly hidden behind front card) up to 1.08 (front hero)
  const scale = 0.68 + frontness * 0.4;

  // Dim via brightness cleanly from 0.62 (outer flank) to 1.0 (front)
  const brightness = 0.62 + frontness * 0.38;

  // 100% solid opaque across all 5 visible cards (frontness >= 0.22); soft dissolve only behind center hero
  const opacity = clamp((frontness - 0.02) / 0.2, 0, 1);

  // Crisp z-index layering strictly ordered by depth
  const zIndex = Math.round(frontness * 100);

  return {
    angle,
    x: Number(x.toFixed(2)),
    y: Number(y.toFixed(2)),
    z: Number(z.toFixed(2)),
    rotateY: Number(rotateY.toFixed(2)),
    rotateX: Number(rotateX.toFixed(2)),
    scale: Number(scale.toFixed(4)),
    brightness: Number(brightness.toFixed(3)),
    opacity: Number(opacity.toFixed(3)),
    zIndex,
    frontness: Number(frontness.toFixed(4)),
    isFront,
  };
}
