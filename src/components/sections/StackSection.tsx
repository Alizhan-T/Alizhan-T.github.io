import { useMemo, useState } from "react";

type StackCategory = "All" | "Mobile" | "Backend & AI" | "Web & 3D" | "Web3";

interface StackItem {
  name: string;
  category: Exclude<StackCategory, "All">;
  focus: string;
  level: string;
}

const STACK_ITEMS: ReadonlyArray<StackItem> = [
  {
    name: "Swift & SwiftUI",
    category: "Mobile",
    focus: "Native iOS · MVVM · Core Data · MapKit · AVPlayer",
    level: "Primary",
  },
  {
    name: "Flutter & Dart",
    category: "Mobile",
    focus: "Cross-platform mobile apps · Maps · Offline-first UX",
    level: "Production",
  },
  {
    name: "Python & FastAPI",
    category: "Backend & AI",
    focus: "Async REST APIs · Video Stream Pipelines · Microservices",
    level: "Primary",
  },
  {
    name: "YOLOv8 & OpenCV",
    category: "Backend & AI",
    focus: "Real-time Computer Vision · Fire & Smoke Detection",
    level: "Production",
  },
  {
    name: "TypeScript & React",
    category: "Web & 3D",
    focus: "SPA / SSR Architecture · Vite · Tailwind CSS",
    level: "Primary",
  },
  {
    name: "Three.js & GLSL",
    category: "Web & 3D",
    focus: "Procedural Geometry · Custom Shaders · R3F · GSAP",
    level: "Creative",
  },
  {
    name: "Solidity & Web3",
    category: "Web3",
    focus: "Smart Contracts · Tokenization · EVM Integration",
    level: "Production",
  },
  {
    name: "Node.js & Databases",
    category: "Backend & AI",
    focus: "Express · PostgreSQL · MongoDB · Firebase",
    level: "Production",
  },
];

const PROCEDURAL_M5_MODULES = [
  { file: "bodyShell.ts", desc: "57-station lofted F90 monocoque" },
  { file: "frontFascia.ts", desc: "Double-slat kidney grille & splitter" },
  { file: "optics.ts", desc: "Hex Angel Eyes & 3D L-taillights" },
  { file: "rearAero.ts", desc: "Carbon diffuser & quad M exhaust" },
  { file: "wheels.ts", desc: "Style 789M Y-spokes & M calipers" },
  { file: "cabinGlass.ts", desc: "Hofmeister kink & twin-stalk mirrors" },
] as const;

const CATEGORIES: ReadonlyArray<StackCategory> = [
  "All",
  "Mobile",
  "Backend & AI",
  "Web & 3D",
  "Web3",
];

interface StackSectionProps {
  readmeSkills: string[];
}

export function StackSection({ readmeSkills }: StackSectionProps) {
  const [category, setCategory] = useState<StackCategory>("All");

  const visibleItems = useMemo(() => {
    if (category === "All") return STACK_ITEMS;
    return STACK_ITEMS.filter((item) => item.category === category);
  }, [category]);

  return (
    <section id="stack" className="relative flex items-center py-14 sm:min-h-screen sm:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="ml-auto max-w-2xl space-y-6">
          <div className="m5-card rounded-2xl p-5 sm:p-8 space-y-5 sm:space-y-6">
            <div className="flex flex-col gap-4">
              <div>
                <p className="font-mono text-xs text-[#38BDF8]">
                  02. Stack &amp; Architecture
                </p>
                <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Технологический стек
                </h2>
              </div>

              {/* Interactive Segmented Category Filter (clean single-row scroll on mobile) */}
              <div
                role="tablist"
                aria-label="Фильтр категорий стека"
                className="no-scrollbar flex w-full flex-nowrap items-center gap-1 overflow-x-auto rounded-lg border border-white/10 bg-white/[0.03] p-1 sm:inline-flex sm:w-fit sm:flex-wrap"
              >
                {CATEGORIES.map((cat) => {
                  const active = category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setCategory(cat)}
                      className={`min-h-[36px] rounded-md px-3 py-1.5 font-mono text-xs whitespace-nowrap shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-[#38BDF8] sm:min-h-0 sm:px-2.5 ${
                        active
                          ? "bg-[#0052A5] text-white"
                          : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive Stack Grid */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {visibleItems.map((item) => (
                <div
                  key={item.name}
                  className="rounded-xl border border-white/10 bg-[#04060A]/65 p-4 transition-colors hover:border-[#38BDF8]/40"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-display text-base font-semibold text-white">
                      {item.name}
                    </h3>
                    <span className="font-mono text-[11px] text-[#38BDF8]">
                      {item.level}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                    {item.focus}
                  </p>
                </div>
              ))}
            </div>

            {/* Procedural M5 F90 Module Architecture Reference */}
            <div className="border-t border-white/10 pt-5 space-y-2.5">
              <div className="flex items-center justify-between font-mono text-xs text-slate-400">
                <span>Procedural M5 F90 Engine (src/three/m5/*)</span>
                <span className="tabular-nums text-[#38BDF8]">6/6 pure code</span>
              </div>

              <div className="grid grid-cols-1 gap-x-6 gap-y-1.5 font-mono text-xs sm:grid-cols-2">
                {PROCEDURAL_M5_MODULES.map((mod) => (
                  <div
                    key={mod.file}
                    className="flex items-center justify-between gap-2 py-0.5"
                  >
                    <span className="text-slate-200 truncate">{mod.file}</span>
                    <span className="text-[11px] text-slate-500 truncate">
                      {mod.desc}
                    </span>
                  </div>
                ))}
              </div>

              {readmeSkills.length > 0 && (
                <p className="pt-1 font-mono text-[11px] text-slate-500">
                  GitHub README: {readmeSkills.join(" · ")}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
