import { useEffect, useState } from "react";
import { CarModelIntro } from "./CarModelIntro";
import { IntroVideoOverlay } from "./IntroVideoOverlay";
import { isModelAvailable } from "./modelIntroConfig";
import { useLang } from "../i18n/LangContext";

interface IntroOverlayProps {
  fading: boolean;
  replayKey: number;
  onBeginFade: () => void;
}

type Mode = "checking" | "model" | "video";

/** Uses the 3D GLB intro when /models/m5_f90.glb exists, otherwise the video intro. */
export function IntroOverlay(props: IntroOverlayProps) {
  const { t } = useLang();
  const [mode, setMode] = useState<Mode>("checking");

  useEffect(() => {
    let alive = true;
    isModelAvailable().then((ok) => alive && setMode(ok ? "model" : "video"));
    return () => {
      alive = false;
    };
  }, []);

  if (mode === "checking") {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#04060A] font-mono text-xs tracking-[0.35em] text-[#38BDF8]/70"
        aria-hidden="true"
      >
        <span className="animate-pulse">{t.intro.loading}</span>
      </div>
    );
  }
  if (mode === "model") {
    return <CarModelIntro {...props} onFail={() => setMode("video")} />;
  }
  return <IntroVideoOverlay {...props} />;
}
