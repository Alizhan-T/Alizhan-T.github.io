import { useCallback, useEffect, useRef } from "react";
import {
  INTRO_END_TIME,
  INTRO_PLAYBACK_RATE,
  INTRO_START_TIME,
  INTRO_VIDEO_SRC,
  hasReachedIntroEnd,
} from "./introTiming";

// Re-export trimming constants at top of component for effortless tweaking
export { INTRO_START_TIME, INTRO_END_TIME, INTRO_PLAYBACK_RATE };

interface IntroVideoOverlayProps {
  /** Whether the intro overlay is currently fading out (opacity: 0 over 500ms, no scale) */
  fading: boolean;
  /** Incremented each time Replay Intro is pressed so the clip cleanly restarts at INTRO_START_TIME */
  replayKey: number;
  /** Triggered once video.currentTime >= INTRO_END_TIME, onEnded, or when user clicks SKIP [ESC] */
  onBeginFade: () => void;
}

export function IntroVideoOverlay({
  fading,
  replayKey,
  onBeginFade,
}: IntroVideoOverlayProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fadeRequestedRef = useRef(false);

  const requestFadeOnce = useCallback(() => {
    if (fadeRequestedRef.current) return;
    fadeRequestedRef.current = true;
    onBeginFade();
  }, [onBeginFade]);

  useEffect(() => {
    fadeRequestedRef.current = false;
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.loop = false;
    video.playbackRate = INTRO_PLAYBACK_RATE;
    video.defaultPlaybackRate = INTRO_PLAYBACK_RATE;

    try {
      video.currentTime = INTRO_START_TIME;
    } catch {
      // Metadata not yet loaded; handled in onLoadedMetadata
    }

    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        window.setTimeout(requestFadeOnce, 500);
      });
    }

    // Sub-frame RAF check ensures exact cut at INTRO_END_TIME without waiting for coarse timeupdate ticks
    let rafId = 0;
    const watch = () => {
      if (fadeRequestedRef.current) return;
      if (hasReachedIntroEnd(video.currentTime, video.duration, INTRO_END_TIME)) {
        requestFadeOnce();
        return;
      }
      rafId = window.requestAnimationFrame(watch);
    };
    rafId = window.requestAnimationFrame(watch);

    return () => {
      window.cancelAnimationFrame(rafId);
      video.pause();
    };
  }, [replayKey, requestFadeOnce]);

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = INTRO_PLAYBACK_RATE;
    if (INTRO_START_TIME > 0 && video.currentTime < INTRO_START_TIME) {
      try {
        video.currentTime = INTRO_START_TIME;
      } catch {
        // Ignore seek errors
      }
    }
  };

  return (
    <div
      data-testid="intro-video-overlay"
      data-intro-fading={fading ? "true" : "false"}
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#04060A] transition-opacity duration-500 ease-out ${
        fading ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      {/* Pure original video quality: full-width uncropped cinema on portrait mobile, full-bleed cover on desktop */}
      <video
        ref={videoRef}
        src={INTRO_VIDEO_SRC}
        autoPlay
        muted
        playsInline
        loop={false}
        preload="auto"
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={(e) => {
          const el = e.currentTarget;
          if (hasReachedIntroEnd(el.currentTime, el.duration, INTRO_END_TIME)) {
            requestFadeOnce();
          }
        }}
        onEnded={requestFadeOnce}
        onError={requestFadeOnce}
        className="h-auto max-h-full w-full object-contain md:h-full md:object-cover"
      />

      {/* Ultra-thin edge feathering strictly along the outer 10% border — center car 100% untouched */}
      <div
        aria-hidden="true"
        className="m5-intro-vignette pointer-events-none absolute inset-0"
      />

      {/* Discreet touch-friendly SKIP [ESC] button in bottom-right corner */}
      {!fading && (
        <button
          type="button"
          onClick={requestFadeOnce}
          data-testid="skip-intro-btn"
          className="fixed right-4 bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-[60] inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-white/15 bg-[#04060A]/80 px-4 py-2 font-mono text-xs tracking-wide text-slate-200 transition-colors hover:border-[#38BDF8]/60 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38BDF8] sm:right-6 sm:bottom-6 sm:min-h-0 sm:px-3.5"
        >
          <span>SKIP</span>
          <span className="hidden text-[#38BDF8] sm:inline">[ESC]</span>
        </button>
      )}
    </div>
  );
}
