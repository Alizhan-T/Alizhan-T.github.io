import { ArrowDown, ArrowUpRight } from "lucide-react";

interface HeroSectionProps {
  name: string;
  bio: string;
  onScrollToProjects: () => void;
  onScrollToAbout: () => void;
}

export function HeroSection({
  name,
  bio,
  onScrollToProjects,
  onScrollToAbout,
}: HeroSectionProps) {
  return (
    <section
      id="hero"
      className="relative flex min-h-screen items-center pt-24 pb-20"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl space-y-6">
          {/* Quiet unboxed kicker metadata */}
          <p className="font-mono text-xs tracking-wide text-[#38BDF8]">
            iOS, Full-Stack &amp; Web3 Engineer · Astana, KZ · Procedural BMW M5 F90
          </p>

          {/* Primary Display Headline */}
          <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-white text-balance sm:text-6xl lg:text-7xl">
            {name}
          </h1>

          {/* Lead Copy */}
          <p className="max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
            {bio}
          </p>

          {/* Procedural Specification Note (unboxed monospace metadata) */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-slate-400 tabular-nums">
            <span>100% Procedural Three.js + GLSL</span>
            <span aria-hidden="true" className="text-slate-600">
              ·
            </span>
            <span>0 External .GLB Files</span>
            <span aria-hidden="true" className="text-slate-600">
              ·
            </span>
            <span>Monte Carlo Blue #004282</span>
          </div>

          {/* Primary & Secondary Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onScrollToProjects}
              className="inline-flex items-center gap-2 rounded-lg bg-[#0052A5] px-5 py-3 text-sm font-medium text-white whitespace-nowrap shrink-0 transition-colors hover:bg-[#1E90FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38BDF8]"
            >
              <span>Смотреть проекты</span>
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={onScrollToAbout}
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-medium text-slate-200 whitespace-nowrap shrink-0 transition-colors hover:border-[#38BDF8]/60 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38BDF8]"
            >
              <span>Обо мне и стеке</span>
              <ArrowDown className="h-4 w-4 text-[#38BDF8]" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
