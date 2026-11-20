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
      className={`fixed inset-0 z-50 overflow-hidden bg-black transition-opacity duration-500 ease-out ${
        fading ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      {/* Pure original video quality: zero CSS filters, zero blend modes, zero zoom/scale */}
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
        className="h-full w-full object-cover"
      />

      {/* Ultra-thin edge feathering strictly along the outer 10% border — center car 100% untouched */}
      <div
        aria-hidden="true"
        className="m5-intro-vignette pointer-events-none absolute inset-0"
      />

      {/* Discreet SKIP [ESC] button in bottom-right corner */}
      {!fading && (
        <button
          type="button"
          onClick={requestFadeOnce}
          data-testid="skip-intro-btn"
          className="fixed bottom-6 right-6 z-[60] inline-flex items-center gap-2 rounded-lg border border-white/15 bg-black/75 px-3.5 py-2 font-mono text-xs tracking-wide text-slate-300 transition-colors hover:border-[#38BDF8]/60 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38BDF8]"
        >
          <span>SKIP</span>
          <span className="text-[#38BDF8]">[ESC]</span>
        </button>
      )}
    </div>
  );
}
