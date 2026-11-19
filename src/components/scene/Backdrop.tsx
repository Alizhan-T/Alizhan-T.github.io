import {
  Component,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { finishes, type SceneSettings } from "../../data/portfolio";
import { PreparedFrame } from "./PreparedFrame";
const Stage = lazy(() => import("./Stage"));
class StageBoundary extends Component<
  { fail: () => void; children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.fail();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
function Poster({ settings }: { settings: SceneSettings }) {
  return (
    <svg
      className="poster-art"
      viewBox="0 0 850 478"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <image href="/media/showroom.webp" width="850" height="478" />
      <g
        className="poster-paint"
        style={{
          fill: finishes[settings.finish].paint,
          opacity: settings.finish ? 0.42 : 0,
        }}
      >
        <path d="M328 276Q371 230 458 217L579 198 633 200 638 220 754 211 784 226 792 261 784 282Q787 241 772 239 749 237 742 302L616 337Q620 260 591 255 557 253 551 351L339 345 325 325Z" />
      </g>
      <g className="lamp-dim" opacity={settings.headlights ? 0 : 0.89}>
        <path
          d="m469 273 8-14 59-13 21-1-18 23-30 9zM333 267l4-15 18 5-2 13z"
          fill="#101114"
        />
      </g>
      {settings.hazards && (
        <g className="hazard-glass">
          <path
            d="m530 256 17-7M335 261l4-5"
            stroke="#ffae3a"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
      )}
    </svg>
  );
}
function Frames({
  settings,
  section,
}: {
  settings: SceneSettings;
  section: number;
}) {
  const [frame, setFrame] = useState(0),
    [zoom, setZoom] = useState(1);
  const drag = useRef<{ x: number; frame: number } | null>(null),
    pinch = useRef<number | null>(null);
  useEffect(() => {
    if (!settings.inspect) {
      setFrame(0);
      setZoom(1);
      return;
    }
    let stop = false;
    const timer = window.setTimeout(async () => {
      for (let i = 0; i < 24 && !stop; i++) {
        const im = new Image();
        im.src = "/media/orbit/" + String(i).padStart(2, "0") + ".webp";
        try {
          await im.decode();
        } catch {
          break;
        }
      }
    }, 150);
    return () => {
      stop = true;
      clearTimeout(timer);
    };
  }, [settings.inspect]);
  const path = settings.inspect
    ? "/media/orbit/" + String(frame).padStart(2, "0") + ".webp"
    : section === 1
      ? "/media/wheel.webp"
      : section === 2
        ? "/media/high.webp"
        : "/media/orbit/08.webp";
  const change = (n: number) => setFrame(((n % 24) + 24) % 24);
  return (
    <div
      className={
        "frame-fallback " + (settings.inspect ? "turntable" : "shot-" + section)
      }
      tabIndex={settings.inspect ? 0 : undefined}
      role={settings.inspect ? "group" : undefined}
      aria-label={
        settings.inspect
          ? "Осмотр автомобиля. Стрелки поворачивают, плюс и минус меняют масштаб."
          : undefined
      }
      onPointerDown={(e) => {
        if (!settings.inspect) return;
        drag.current = { x: e.clientX, frame };
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (drag.current)
          change(
            drag.current.frame + Math.round((drag.current.x - e.clientX) / 15),
          );
      }}
      onPointerUp={() => (drag.current = null)}
      onPointerCancel={() => (drag.current = null)}
      onWheel={(e) => {
        if (settings.inspect)
          setZoom((z) => Math.max(0.85, Math.min(1.75, z - e.deltaY * 0.0013)));
      }}
      onTouchMove={(e) => {
        if (!settings.inspect || e.touches.length !== 2) return;
        const [a, b] = Array.from(e.touches);
        const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        if (pinch.current)
          setZoom((z) =>
            Math.max(0.85, Math.min(1.75, z + d / pinch.current! - 1)),
          );
        pinch.current = d;
        drag.current = null;
      }}
      onTouchEnd={() => (pinch.current = null)}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
          e.preventDefault();
          change(frame + (e.key === "ArrowLeft" ? -1 : 1));
        }
        if (e.key === "+") setZoom((z) => Math.min(z + 0.1, 1.75));
        if (e.key === "-") setZoom((z) => Math.max(z - 0.1, 0.85));
      }}
    >
      <PreparedFrame
        path={path}
        settings={settings}
        zoom={zoom}
        index={
          settings.inspect ? frame : section === 1 ? 24 : section === 2 ? 25 : 8
        }
      />
    </div>
  );
}
type Props = {
  settings: SceneSettings;
  progress: React.RefObject<number>;
  position: number;
  forceLive: boolean;
};
export default function Backdrop({
  settings,
  progress,
  position,
  forceLive,
}: Props) {
  const [gpu, setGpu] = useState(false),
    [failed, setFailed] = useState(false),
    [ready, setReady] = useState(false),
    [load, setLoad] = useState(0);
  const readyFn = useCallback(() => setReady(true), []),
    fail = useCallback(() => {
      setFailed(true);
      setReady(false);
    }, []);
  useEffect(() => {
    let stop = false;
    const id = window.setTimeout(() => {
      try {
        const canvas = document.createElement("canvas");
        const gl = canvas.getContext("webgl2", {
          failIfMajorPerformanceCaveat: true,
        });
        if (gl) {
          gl.getExtension("WEBGL_lose_context")?.loseContext();
          if (!stop) setGpu(true);
        } else fail();
      } catch {
        fail();
      }
    }, 200);
    return () => {
      stop = true;
      clearTimeout(id);
    };
  }, [fail]);
  const showLive = settings.inspect || forceLive || position > 0.035,
    live = ready && showLive && !failed;
  const section = Math.max(0, Math.min(3, Math.round(position)));
  const frames = failed && (settings.inspect || section > 0);
  return (
    <div
      className={"backdrop " + (settings.inspect ? "interactive" : "")}
      aria-hidden={!settings.inspect}
    >
      <div className={"poster-layer " + (live || frames ? "conceal" : "")}>
        <Poster settings={settings} />
      </div>
      {gpu && !failed && (
        <div className={"webgl-layer " + (live ? "visible" : "")}>
          <StageBoundary fail={fail}>
            <Suspense fallback={null}>
              <Stage
                settings={settings}
                progress={progress}
                onReady={readyFn}
                onFail={fail}
                onProgress={setLoad}
                active={live}
              />
            </Suspense>
          </StageBoundary>
        </div>
      )}
      {frames && <Frames settings={settings} section={section} />}
      {showLive && !failed && !ready && (
        <div className="loading-scene" role="status">
          ЗАГРУЗКА МОДЕЛИ <span>{Math.round(load)}%</span>
        </div>
      )}
    </div>
  );
}
