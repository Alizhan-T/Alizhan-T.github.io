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
export const MODEL_FRONT_AXIS: FrontAxis = "+z";

/** Полная длительность интро в секундах */
export const MODEL_INTRO_DURATION = 9.2;

/** Имена материалов, которые считаются передней оптикой (подсвечиваются при включении) */
export const HEADLIGHT_MATERIAL_RE = /head|lamp|led|drl|light_f|front_?light/i;
export const REAR_LIGHT_MATERIAL_RE = /tail|rear|brake|back/i;

export async function isModelAvailable(url = MODEL_URL): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "HEAD" });
    if (!res.ok) return false;
    const type = res.headers.get("content-type") ?? "";
    return !type.includes("text/html");
  } catch {
    return false;
  }
}
