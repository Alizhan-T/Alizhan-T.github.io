/**
 * Настройки 3D-интро с GLB-моделью.
 * Положите свою модель (с подходящей лицензией) в public/models/ под именем MODEL_URL.
 * Если файла нет — сайт автоматически показывает видео-интро.
 */
export const MODEL_URL = "/models/m5_f90.glb";
/** Необязательный HDRI (.hdr). Если файла нет — используется встроенная студия. */
export const HDRI_URL = "/models/studio.hdr";
/** Необязательная папка с Draco-декодером, если модель сжата Draco. */
export const DRACO_PATH = "https://www.gstatic.com/draco/versioned/decoders/1.5.7/";

/** Название на экране в финале интро */
export const INTRO_TITLE = "BMW M5 F90";
export const INTRO_SUBTITLE = "4.4L Twin-Turbo V8 · Black Metallic";

/** Реальная длина автомобиля в метрах — модель масштабируется до неё */
export const CAR_LENGTH_M = 4.97;

/**
 * Куда «смотрит» перед модели в её исходных координатах.
 * Допустимо: "+z" | "-z" | "+x" | "-x". Можно переопределить через ?front=-z
 */
export type FrontAxis = "+z" | "-z" | "+x" | "-x";
export const MODEL_FRONT_AXIS: FrontAxis = "+x";

/** Полная длительность интро в секундах */
/** If the model has not downloaded in this time, fall back to the video intro */
export const MODEL_LOAD_TIMEOUT_MS = 12000;

export const MODEL_INTRO_DURATION = 6.7;

/** Имена материалов, которые считаются передней оптикой (подсвечиваются при включении) */
export const HEADLIGHT_MATERIAL_RE = /LightEmissive|head|lamp|drl|^material_95$/i;
export const REAR_LIGHT_MATERIAL_RE = /tail|rear|brake|back/i;

export async function isModelAvailable(url = MODEL_URL): Promise<boolean> {
  // Data saver / very slow connections: use the lightweight video intro
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  if (conn?.saveData || conn?.effectiveType === "slow-2g" || conn?.effectiveType === "2g") return false;
  // WebGL must be available
  try {
    const c = document.createElement("canvas");
    if (!(c.getContext("webgl2") || c.getContext("webgl"))) return false;
  } catch {
    return false;
  }
  const ctrl = new AbortController();
  const timer = window.setTimeout(() => ctrl.abort(), 4000);
  try {
    const res = await fetch(url, { method: "HEAD", signal: ctrl.signal });
    if (!res.ok) return false;
    const type = res.headers.get("content-type") ?? "";
    return !type.includes("text/html");
  } catch {
    return false;
  } finally {
    window.clearTimeout(timer);
  }
}

/** Атрибуция модели (лицензия CC-BY-4.0 требует указать автора) */
export const MODEL_CREDIT = {
  title: "BMW M5 F90",
  author: "RES1N",
  authorUrl: "https://sketchfab.com/Resinnnn",
  sourceUrl: "https://sketchfab.com/3d-models/bmw-m5-f90-5478e978bd634337adc8e3dc413fbfa3",
  license: "CC BY 4.0",
  licenseUrl: "http://creativecommons.org/licenses/by/4.0/",
};
