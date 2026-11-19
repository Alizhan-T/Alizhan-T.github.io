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

function FallbackTurntable({ settings }: { settings: SceneSettings }) {
  const [frame, setFrame] = useState(8);
  const drag = useRef<{ x: number; frame: number } | null>(null);
  const path = "/media/orbit/" + String(frame).padStart(2, "0") + ".webp";
  const change = (n: number) => setFrame(((n % 24) + 24) % 24);

  return (
    <div
      className="turntable-fallback"
      onPointerDown={(e) => {
        drag.current = { x: e.clientX, frame };
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (drag.current) {
          change(
            drag.current.frame + Math.round((drag.current.x - e.clientX) / 14),
          );
        }
      }}
      onPointerUp={() => (drag.current = null)}
      onPointerCancel={() => (drag.current = null)}
    >
      <PreparedFrame path={path} settings={settings} zoom={1} index={frame} />
    </div>
  );
}

export default function Backdrop({
  settings,
  shot,
  zoomEnabled,
}: {
  settings: SceneSettings;
  shot: number;
  zoomEnabled: boolean;
}) {
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
    return () => {
      stop = true;
    };
  }, [fail]);

  const live = ready && !failed;

  return (
    <div className="stage-canvas-wrap">
      {!live && !failed && (
        <div className="stage-poster">
          <Poster settings={settings} />
        </div>
      )}
      {gpu && !failed && (
        <div className={"stage-webgl " + (live ? "is-ready" : "")}>
          <StageBoundary fail={fail}>
            <Suspense fallback={null}>
              <Stage
                settings={settings}
                shot={shot}
                zoomEnabled={zoomEnabled}
                onReady={readyFn}
                onFail={fail}
                onProgress={setLoad}
                active={live}
              />
            </Suspense>
          </StageBoundary>
        </div>
      )}
      {failed && <FallbackTurntable settings={settings} />}
      {!failed && !ready && (
        <div className="stage-loader" role="status">
          <span>3D M5 F90 · {Math.round(load)}%</span>
        </div>
      )}
    </div>
  );
}
