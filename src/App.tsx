import { useCallback, useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { RotateCcw } from "lucide-react";
import { applyGpuSurfaceClass } from "./three/glCaps";
import AmbientCodeParticles from "./three/AmbientCodeParticles";
import { IntroVideoOverlay } from "./components/IntroVideoOverlay";
import {
  INTRO_FADE_DURATION_MS,
  INTRO_SEEN_STORAGE_KEY,
} from "./components/introTiming";
import {
  createFallbackPortfolioData,
  loadGitHubPortfolio,
  type GitHubPortfolioData,
} from "./services/github";
import { Navbar, NAV_ITEMS } from "./components/Navbar";
import { HeroSection } from "./components/sections/HeroSection";
import { AboutSection } from "./components/sections/AboutSection";
import { StackSection } from "./components/sections/StackSection";
import { ProjectsSection } from "./components/sections/ProjectsSection";
import { ContactSection } from "./components/sections/ContactSection";

gsap.registerPlugin(ScrollTrigger);

type IntroPhase = "playing" | "fading" | "done";

function resolveInitialIntroPhase(): IntroPhase {
  const params = new URLSearchParams(window.location.search);
  if (params.get("intro") === "1") return "playing";
  if (params.get("skipIntro") === "1" || params.get("autostart") === "1") {
    return "done";
  }

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  let seen = false;
  try {
    seen = window.sessionStorage.getItem(INTRO_SEEN_STORAGE_KEY) === "1";
  } catch {
    seen = false;
  }

  return reducedMotion || seen ? "done" : "playing";
}

function markIntroSeen() {
  try {
    window.sessionStorage.setItem(INTRO_SEEN_STORAGE_KEY, "1");
  } catch {
    // Ignore restricted sessionStorage contexts
  }
}

export default function App() {
  const lenisRef = useRef<Lenis | null>(null);
  const fadeTimerRef = useRef<number | null>(null);

  const [introPhase, setIntroPhase] = useState<IntroPhase>(() =>
    resolveInitialIntroPhase(),
  );
  const [replayKey, setReplayKey] = useState(0);
  const [activeSection, setActiveSection] = useState<string>("hero");
  const [githubData, setGithubData] = useState<GitHubPortfolioData>(() =>
    createFallbackPortfolioData(),
  );
  const [githubLoading, setGithubLoading] = useState(true);

  // Detect GPU vs software WebGL once for surface styling
  useEffect(() => {
    applyGpuSurfaceClass();
  }, []);

  // Load live GitHub profile + README.md + repositories (with localStorage cache & fallback)
  useEffect(() => {
    let active = true;
    loadGitHubPortfolio()
      .then((data) => {
        if (active) setGithubData(data);
      })
      .finally(() => {
        if (active) setGithubLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // Lock page scroll strictly while the intro video is actively playing; unlock immediately on dissolve
  const scrollLocked = introPhase === "playing";
  useEffect(() => {
    if (scrollLocked) {
      document.body.style.overflow = "hidden";
      lenisRef.current?.stop();
    } else {
      document.body.style.overflow = "";
      lenisRef.current?.start();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [scrollLocked]);

  // Smooth 700ms dissolve out of the intro overlay into Hero
  const beginIntroFade = useCallback(() => {
    setIntroPhase((prev) => {
      if (prev !== "playing") return prev;
      markIntroSeen();
      if (fadeTimerRef.current !== null) {
        window.clearTimeout(fadeTimerRef.current);
      }
      fadeTimerRef.current = window.setTimeout(() => {
        setIntroPhase("done");
        fadeTimerRef.current = null;
      }, INTRO_FADE_DURATION_MS);
      return "fading";
    });
  }, []);

  // Replay Intro cleanly from anywhere in the portfolio
  const handleReplayIntro = useCallback(() => {
    if (fadeTimerRef.current !== null) {
      window.clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
    setReplayKey((k) => k + 1);
    setIntroPhase("playing");
  }, []);

  useEffect(() => {
    return () => {
      if (fadeTimerRef.current !== null) {
        window.clearTimeout(fadeTimerRef.current);
      }
    };
  }, []);

  // Escape key skips active intro immediately
  useEffect(() => {
    if (introPhase !== "playing") return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        beginIntroFade();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [introPhase, beginIntroFade]);

  // Lenis smooth scroll + active section tracking
  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const lenis = new Lenis({
      duration: reducedMotion ? 0 : 1.05,
      smoothWheel: !reducedMotion,
      wheelMultiplier: 0.95,
    });
    lenisRef.current = lenis;

    if (scrollLocked) {
      lenis.stop();
    }

    const updateActiveNav = () => {
      const midY = window.scrollY + window.innerHeight * 0.42;
      let currentId = NAV_ITEMS[0].id;
      for (const item of NAV_ITEMS) {
        const el = document.getElementById(item.id);
        if (el && el.offsetTop <= midY) {
          currentId = item.id;
        }
      }
      setActiveSection(currentId);
    };

    lenis.on("scroll", () => {
      ScrollTrigger.update();
      updateActiveNav();
    });

    window.addEventListener("scroll", updateActiveNav, { passive: true });

    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const ro = new ResizeObserver(() => {
      lenis.resize();
      ScrollTrigger.refresh();
    });
    const mainEl = document.querySelector("main");
    if (mainEl) ro.observe(mainEl);

    updateActiveNav();

    return () => {
      ro.disconnect();
      gsap.ticker.remove(tick);
      window.removeEventListener("scroll", updateActiveNav);
      lenis.destroy();
      lenisRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollToSection = useCallback((sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (!el) return;
    if (lenisRef.current) {
      lenisRef.current.start();
      lenisRef.current.scrollTo(el, {
        immediate: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      });
    } else {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const introPlaying = introPhase === "playing";
  const introMounted = introPhase !== "done";

  return (
    <div
      className="relative min-h-screen bg-[#04060A] text-slate-100"
      data-intro-phase={introPhase}
    >
      {/* Persistent Crisp Code-Line Background Layer (always above #04060A, below z-10 content cards) */}
      <AmbientCodeParticles />

      {/* Fullscreen Short Video Intro Overlay (pure quality on #000000, unmounts completely after 500ms fade) */}
      {introMounted && (
        <IntroVideoOverlay
          fading={introPhase === "fading"}
          replayKey={replayKey}
          onBeginFade={beginIntroFade}
        />
      )}

      {/* Minimalist 3-Zone Top Navigation Bar */}
      <div
        className={`transition-opacity duration-700 ${
          introPlaying ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <Navbar
          activeSection={activeSection}
          onNavigate={scrollToSection}
          onReplayIntro={handleReplayIntro}
        />
      </div>

      {/* Portfolio Content Sections (smooth entrance as intro dissolves) */}
      <main
        className={`relative z-10 transition-all duration-700 ${
          introPlaying
            ? "pointer-events-none translate-y-4 opacity-0"
            : "translate-y-0 opacity-100"
        }`}
      >
        <HeroSection
          name={githubData.profile.name}
          bio={githubData.profile.bio}
          onScrollToAbout={() => scrollToSection("about")}
          onScrollToProjects={() => scrollToSection("projects")}
        />

        <AboutSection data={githubData} loading={githubLoading} />

        <StackSection readmeSkills={githubData.readme.skills} />

        <ProjectsSection
          projects={githubData.projects}
          loading={githubLoading}
        />

        <ContactSection onReplayIntro={handleReplayIntro} />
      </main>

      {/* Desktop Discreet "Replay Intro" Mini-Button (on mobile, lives cleanly inside Navbar menu & Contact footer) */}
      {introPhase === "done" && (
        <button
          type="button"
          onClick={handleReplayIntro}
          data-testid="replay-intro-btn"
          className="fixed bottom-5 right-5 z-30 hidden items-center gap-1.5 rounded-lg border border-white/10 bg-[#04060A]/80 px-3 py-1.5 font-mono text-[11px] text-slate-400 transition-colors hover:border-[#38BDF8]/50 hover:text-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38BDF8] md:inline-flex"
          title="Повторить видео-интро BMW M5 F90"
        >
          <RotateCcw className="h-3 w-3 text-[#38BDF8]" aria-hidden="true" />
          <span>Replay Intro</span>
        </button>
      )}
    </div>
  );
}
