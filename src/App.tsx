import { useCallback, useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Move, ZoomIn } from "lucide-react";
import { finishes, sections, type SceneSettings } from "./data/portfolio";
import { Header } from "./components/Header";
import { HUD } from "./components/HUD";
import Backdrop from "./components/scene/Backdrop";
import Hero from "./components/sections/Hero";
import About from "./components/sections/About";
import Projects from "./components/sections/Projects";
import Contact from "./components/sections/Contact";
gsap.registerPlugin(ScrollTrigger);
const defaults: SceneSettings = {
  finish: 0,
  headlights: true,
  hazards: false,
  inspect: false,
  brake: false,
};
export default function App() {
  const [state, setState] = useState(defaults),
    [pos, setPos] = useState(0),
    [live, setLive] = useState(false);
  const progress = useRef(0),
    lenis = useRef<Lenis | null>(null),
    inspectButton = useRef<HTMLElement | null>(null),
    active = Math.min(3, Math.max(0, Math.round(pos)));
  const update = useCallback(
    (value: Partial<SceneSettings>) => setState((s) => ({ ...s, ...value })),
    [],
  );
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    const scroll = new Lenis({
      duration: m.matches ? 0 : 1.02,
      smoothWheel: !m.matches,
      anchors: false,
      prevent: (node) => node.closest("dialog") !== null,
    });
    lenis.current = scroll;
    const parts = sections.map((s) => document.getElementById(s.id)!);
    let offsets: number[] = [],
      end = 0;
    function measure() {
      end = Math.max(0, document.documentElement.scrollHeight - innerHeight);
      offsets = parts.map((e) => Math.min(e.offsetTop, end));
    }
    function sync() {
      if (!offsets.length) return;
      const y = window.scrollY;
      let k = 0;
      while (k < 2 && y >= offsets[k + 1]) k++;
      const value =
        k +
        Math.max(
          0,
          Math.min(
            1,
            (y - offsets[k]) / Math.max(1, offsets[k + 1] - offsets[k]),
          ),
        );
      progress.current = value;
      setPos(value);
      window.dispatchEvent(new Event("camera-shot"));
    }
    const trigger = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: sync,
      onRefresh: () => {
        measure();
        sync();
      },
    });
    const tick = (t: number) => scroll.raf(t * 1000);
    gsap.ticker.add(tick);
    scroll.on("scroll", ScrollTrigger.update);
    const ro = new ResizeObserver(() => {
      scroll.resize();
      ScrollTrigger.refresh();
    });
    ro.observe(document.querySelector("main")!);
    measure();
    sync();
    const hash = sections.find((s) => "#" + s.id === location.hash);
    if (hash)
      requestAnimationFrame(() =>
        scroll.scrollTo("#" + hash.id, { immediate: true }),
      );
    return () => {
      ro.disconnect();
      trigger.kill();
      gsap.ticker.remove(tick);
      scroll.destroy();
      lenis.current = null;
    };
  }, []);
  const navigate = (i: number) => {
    const el = document.getElementById(sections[i].id);
    if (el) {
      if (lenis.current)
        lenis.current.scrollTo(el, {
          immediate: matchMedia("(prefers-reduced-motion: reduce)").matches,
        });
      else el.scrollIntoView();
      history.replaceState(null, "", "#" + sections[i].id);
    }
  };
  const exit = useCallback(() => {
    update({ inspect: false });
    requestAnimationFrame(() => inspectButton.current?.focus());
  }, [update]);
  useEffect(() => {
    if (!state.inspect) return;
    lenis.current?.stop();
    document.body.classList.add("orbit-mode");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") exit();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      lenis.current?.start();
      document.body.classList.remove("orbit-mode");
      window.removeEventListener("keydown", onKey);
    };
  }, [state.inspect, exit]);
  const accent = finishes[state.finish].accent;
  return (
    <div
      className={"experience " + (state.inspect ? "inspect-mode" : "")}
      style={{ "--accent": accent } as React.CSSProperties}
    >
      <a className="skip" href="#projects">
        К проектам
      </a>
      <Backdrop
        settings={state}
        progress={progress}
        position={pos}
        forceLive={live}
      />
      <div className="ui-shell" inert={state.inspect}>
        <Header active={active} navigate={navigate} />
        <main>
          <Hero navigate={navigate} />
          <About />
          <Projects />
          <Contact brake={(v) => update({ brake: v })} />
        </main>
        <nav className="telemetry" aria-label="Прогресс по разделам">
          <span>{String(active + 1).padStart(2, "0")}</span>
          <div className="tele-track">
            {sections.map((s, i) => (
              <button
                key={s.id}
                className={active === i ? "on" : ""}
                onClick={() => navigate(i)}
                aria-label={s.label}
                aria-current={active === i ? "step" : undefined}
              />
            ))}
            <i style={{ top: (pos / 3) * 75 + "%" }} />
          </div>
          <small>04</small>
        </nav>
      </div>
      {state.inspect && (
        <div className="inspect-info">
          <div>
            <span className="eyebrow">
              <b>360°</b>
              <i /> INSPECTION
            </span>
            <h2>BMW M5 F90</h2>
          </div>
          <p>
            <Move size={15} /> Вращение <i /> <ZoomIn size={15} /> Масштаб
          </p>
        </div>
      )}
      <HUD
        state={state}
        available
        onFinish={(i) => {
          setLive(true);
          update({ finish: i });
        }}
        onLights={() => {
          setLive(true);
          update({ headlights: !state.headlights });
        }}
        onHazards={() => {
          setLive(true);
          update({ hazards: !state.hazards });
        }}
        onInspect={() => {
          if (state.inspect) exit();
          else {
            inspectButton.current = document.activeElement as HTMLElement;
            update({ inspect: true, brake: false });
          }
        }}
      />
    </div>
  );
}
