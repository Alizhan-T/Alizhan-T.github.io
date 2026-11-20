/** Start timestamp in seconds for the intro clip */
export const INTRO_START_TIME = 0;

/** End timestamp in seconds at which the intro smoothly fades out and unmounts */
export const INTRO_END_TIME = 4.5;

/** Native 1.0x playback speed without frame jitter */
export const INTRO_PLAYBACK_RATE = 1.0;

/** Smooth opacity-only fade-out duration in milliseconds */
export const INTRO_FADE_DURATION_MS = 500;

export const INTRO_VIDEO_SRC = "/videos/m5_intro_1080p.mp4";
export const INTRO_SEEN_STORAGE_KEY = "m5_f90_intro_seen";

/**
 * Pure check determining whether the intro video has reached its configured cut point
 * (INTRO_END_TIME) or the end of the media file.
 */
export function hasReachedIntroEnd(
  currentTime: number,
  duration: number,
  endTime = INTRO_END_TIME,
): boolean {
  if (!Number.isFinite(currentTime) || currentTime < 0) return false;
  if (currentTime >= endTime) return true;
  if (Number.isFinite(duration) && duration > 0 && currentTime >= duration - 0.05) {
    return true;
  }
  return false;
}
