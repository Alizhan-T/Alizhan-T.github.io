import { ArrowDown, ArrowUpRight } from "lucide-react";
import { useLang } from "../../i18n/LangContext";

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
  const { t } = useLang();
  return (
    <section
      id="hero"
      className="relative flex min-h-[100svh] items-center overflow-x-clip pt-24 pb-16 sm:pt-28 sm:pb-20"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="m5-hero-scrim max-w-2xl space-y-5 rounded-2xl p-5 sm:space-y-6 sm:rounded-none sm:bg-transparent sm:p-0">
          {/* Quiet unboxed kicker metadata */}
          <p className="font-mono text-xs leading-relaxed tracking-wide text-[#38BDF8] sm:text-[13px]">
            {t.hero.kicker}
          </p>

          {/* Primary Display Headline */}
          <h1 className="font-display text-[2.15rem] font-bold leading-[1.06] tracking-tight text-white text-balance sm:text-6xl lg:text-7xl">
            {name}
          </h1>

          {/* Lead Copy */}
          <p className="max-w-xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
            {t.hero.lead || bio}
          </p>

          {/* Specification Note */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-xs text-slate-400 tabular-nums sm:gap-x-4 sm:text-[13px]">
            <span>SwiftUI · Flutter · Python</span>
            <span aria-hidden="true" className="text-slate-600">
              ·
            </span>
            <span>Three.js &amp; GLSL</span>
            <span aria-hidden="true" className="text-slate-600">
              ·
            </span>
            <span>Monte Carlo Blue #004282</span>
          </div>

          {/* Primary & Secondary Actions (full-width touch targets on mobile) */}
          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap sm:items-center">
            <button
              type="button"
              onClick={onScrollToProjects}
              className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-lg bg-[#0052A5] px-5 py-3 text-sm font-medium text-white whitespace-nowrap shrink-0 transition-colors hover:bg-[#1E90FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38BDF8] sm:w-auto"
            >
              <span>{t.hero.viewProjects}</span>
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={onScrollToAbout}
              className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.05] px-5 py-3 text-sm font-medium text-slate-200 whitespace-nowrap shrink-0 transition-colors hover:border-[#38BDF8]/60 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38BDF8] sm:w-auto"
            >
              <span>{t.hero.aboutStack}</span>
              <ArrowDown className="h-4 w-4 text-[#38BDF8]" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
