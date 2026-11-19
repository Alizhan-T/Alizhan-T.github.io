import { useState } from "react";
import {
  Scan,
  TriangleAlert,
  X,
  ChevronDown,
  SlidersHorizontal,
  Check,
} from "lucide-react";
import { finishes, type SceneSettings } from "../data/portfolio";
export function Headlamp({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M12 5c6 0 9 2.6 9 7s-3 7-9 7c-2.7-3.6-2.7-10.4 0-14Z" />
      <path d="M7.5 6.5 2 8m5-1.5M6.7 10 1.5 11.5M6.5 13.5 1.5 15M7.2 17 2 18.5" />
    </svg>
  );
}
type Props = {
  state: SceneSettings;
  onFinish: (i: number) => void;
  onLights: () => void;
  onHazards: () => void;
  onInspect: () => void;
  available: boolean;
};
export function HUD({
  state,
  onFinish,
  onLights,
  onHazards,
  onInspect,
  available,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  return (
    <aside
      className={
        "hud-wrap " +
        (expanded ? "expanded " : "") +
        (state.inspect ? "inspecting" : "")
      }
      aria-label="Управление шоурумом"
    >
      <div className="hud">
        <button
          className="mobile-hud-toggle"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
        >
          <SlidersHorizontal size={17} />
          <span>Настройки сцены</span>
          <ChevronDown size={15} />
        </button>
        <div className="paint-group">
          <div className="hud-copy">
            <span className="micro">ЦВЕТ КУЗОВА</span>
            <strong aria-live="polite">{finishes[state.finish].name}</strong>
          </div>
          <div className="swatches" role="group" aria-label="Цвет кузова">
            {finishes.map((f, i) => (
              <button
                key={f.name}
                aria-label={f.name}
                title={f.name}
                aria-pressed={i === state.finish}
                style={{ "--sample": f.sample } as React.CSSProperties}
                onClick={() => onFinish(i)}
              >
                <span>{i === state.finish && <Check size={12} />}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="light-group">
          <span className="micro">ОПТИКА</span>
          <div className="light-btns">
            <button
              className="optic"
              aria-pressed={state.headlights}
              onClick={onLights}
            >
              <Headlamp />
              <span>ДХО</span>
              <i />
            </button>
            <button
              className="optic"
              aria-pressed={state.hazards}
              onClick={onHazards}
            >
              <TriangleAlert size={18} />
              <span>Аварийка</span>
              <i />
            </button>
          </div>
        </div>
        <button
          className="orbit-btn"
          aria-pressed={state.inspect}
          onClick={onInspect}
          disabled={!available}
          title={
            available
              ? "Свободное вращение камеры"
              : "Для осмотра нужен WebGL 2"
          }
        >
          {state.inspect ? <X size={19} /> : <Scan size={20} />}
          <span>{state.inspect ? "Завершить осмотр" : "Осмотр 360°"}</span>
        </button>
      </div>
    </aside>
  );
}
