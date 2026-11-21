import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type TouchEvent,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TechIcon } from "./TechIcons";
import {
  DEFAULT_ACTIVE_STACK_INDEX,
  DESKTOP_ORBIT_CONFIG,
  MOBILE_ORBIT_CONFIG,
  NEUTRAL_TILT,
  TABLET_ORBIT_CONFIG,
  TECH_STACK_CARDS,
  computeCardTilt,
  computeOrbitPose,
  getFrontCardIndex,
  shortestAngleDelta,
  targetPhaseForIndex,
  type CardTilt,
  type OrbitConfig,
} from "./stackCoverflowMath";

gsap.registerPlugin(ScrollTrigger);

// Calm, luxurious orbital speed (~24s per full 6-card revolution, ~4s per tech card)
const AUTO_ORBIT_SPEED_RAD_PER_SEC = -0.26;
const CARD_COUNT = TECH_STACK_CARDS.length;

function resolveOrbitConfig(width: number): OrbitConfig {
  if (width >= 1024) return DESKTOP_ORBIT_CONFIG;
  if (width >= 640) return TABLET_ORBIT_CONFIG;
  return MOBILE_ORBIT_CONFIG;
}

interface StackSectionProps {
  readmeSkills?: string[];
}

export function StackSection(_props: StackSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const cardRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const glareRefs = useRef<Array<HTMLDivElement | null>>([]);

  // Continuous orbit state kept in refs so 60 FPS motion never triggers per-frame React re-renders
  const phaseRef = useRef<number>(
    targetPhaseForIndex(DEFAULT_ACTIVE_STACK_INDEX, CARD_COUNT),
  );
  const velocityRef = useRef<number>(AUTO_ORBIT_SPEED_RAD_PER_SEC);
  const targetPhaseRef = useRef<number | null>(null);
  const isHoveringRef = useRef<boolean>(false);
  const hoveredCardRef = useRef<number | null>(null);
  const tiltRef = useRef<CardTilt>(NEUTRAL_TILT);
  const smoothTiltRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const orbitConfigRef = useRef<OrbitConfig>(
    typeof window !== "undefined"
      ? resolveOrbitConfig(window.innerWidth)
      : DESKTOP_ORBIT_CONFIG,
  );
  const touchStartXRef = useRef<number | null>(null);
  const touchLastXRef = useRef<number | null>(null);
  const isDraggingRef = useRef<boolean>(false);

  const [frontIndex, setFrontIndex] = useState<number>(
    DEFAULT_ACTIVE_STACK_INDEX,
  );
  const frontIndexRef = useRef<number>(DEFAULT_ACTIVE_STACK_INDEX);

  // Sync DOM 3D transforms for all 6 cards from the current orbit phase
  const renderOrbitFrame = useCallback(() => {
    const phase = phaseRef.current;
    const config = orbitConfigRef.current;

    // Smoothly interpolate pointer tilt so cursor enter/leave feels silky
    const targetTiltX = hoveredCardRef.current !== null ? tiltRef.current.rotateX : 0;
    const targetTiltY = hoveredCardRef.current !== null ? tiltRef.current.rotateY : 0;
    smoothTiltRef.current.x += (targetTiltX - smoothTiltRef.current.x) * 0.14;
    smoothTiltRef.current.y += (targetTiltY - smoothTiltRef.current.y) * 0.14;

    const currentFront = getFrontCardIndex(phase, CARD_COUNT);
    if (currentFront !== frontIndexRef.current) {
      frontIndexRef.current = currentFront;
      setFrontIndex(currentFront);
    }

    for (let i = 0; i < CARD_COUNT; i++) {
      const el = cardRefs.current[i];
      if (!el) continue;

      const isHoveredFront = hoveredCardRef.current === i && currentFront === i;
      const cardTilt: CardTilt = isHoveredFront
        ? {
            rotateX: smoothTiltRef.current.x,
            rotateY: smoothTiltRef.current.y,
            glareX: tiltRef.current.glareX,
            glareY: tiltRef.current.glareY,
          }
        : NEUTRAL_TILT;

      const pose = computeOrbitPose(i, CARD_COUNT, phase, config, cardTilt);

      el.style.transform = `translate3d(${pose.x}px, ${pose.y}px, ${pose.z}px) rotateY(${pose.rotateY}deg) rotateX(${pose.rotateX}deg) scale(${pose.scale})`;
      el.style.filter = `brightness(${pose.brightness})`;
      el.style.opacity = String(pose.opacity);
      el.style.pointerEvents = pose.opacity < 0.15 ? "none" : "auto";
      el.style.zIndex = String(pose.zIndex);
    }
  }, []);

  // Main 60 FPS GSAP ticker loop driving calm circular revolution + smooth deceleration on hover + snap-to-click
  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const handleResize = () => {
      orbitConfigRef.current = resolveOrbitConfig(window.innerWidth);
      renderOrbitFrame();
    };
    window.addEventListener("resize", handleResize);

    // Paint initial pose immediately
    renderOrbitFrame();

    let lastTime = performance.now();

    const tick = () => {
      const now = performance.now();
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      if (document.hidden) return;

      if (isDraggingRef.current) {
        renderOrbitFrame();
        return;
      }

      if (targetPhaseRef.current !== null) {
        // Smooth shortest-arc ease toward clicked / selected card
        const delta = shortestAngleDelta(phaseRef.current, targetPhaseRef.current);
        if (Math.abs(delta) < 0.003 || reducedMotion) {
          phaseRef.current = targetPhaseRef.current;
          targetPhaseRef.current = null;
          velocityRef.current = 0;
        } else {
          phaseRef.current += delta * Math.min(1, dt * 6.5);
        }
      } else if (!reducedMotion) {
        // Smoothly brake to 0 when hovered, glide back to calm orbit speed when free
        const desiredVelocity = isHoveringRef.current
          ? 0
          : AUTO_ORBIT_SPEED_RAD_PER_SEC;
        velocityRef.current +=
          (desiredVelocity - velocityRef.current) * Math.min(1, dt * 4.2);

        if (Math.abs(velocityRef.current) > 0.0005) {
          phaseRef.current += velocityRef.current * dt;
        }
      }

      renderOrbitFrame();
    };

    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener("resize", handleResize);
    };
  }, [renderOrbitFrame]);

  // Subtle one-shot entrance reveal for header when scrolling into #stack
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.from(".stack-header-reveal", {
        y: 16,
        opacity: 0,
        duration: 0.65,
        ease: "power3.out",
        scrollTrigger: {
          trigger: section,
          start: "top 82%",
          once: true,
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  const focusCardByIndex = useCallback((index: number) => {
    const wrapped = ((index % CARD_COUNT) + CARD_COUNT) % CARD_COUNT;
    targetPhaseRef.current = targetPhaseForIndex(wrapped, CARD_COUNT);
    velocityRef.current = 0;
  }, []);

  const handleStageMouseEnter = useCallback(() => {
    isHoveringRef.current = true;
  }, []);

  const handleStageMouseLeave = useCallback(() => {
    isHoveringRef.current = false;
    hoveredCardRef.current = null;
    tiltRef.current = NEUTRAL_TILT;
    targetPhaseRef.current = null;
  }, []);

  const handleCardMouseEnter = useCallback((index: number) => {
    isHoveringRef.current = true;
    hoveredCardRef.current = index;
    tiltRef.current = NEUTRAL_TILT;
  }, []);

  const handleCardMouseMove = useCallback(
    (index: number, event: MouseEvent<HTMLButtonElement>) => {
      const el = cardRefs.current[index];
      if (!el) return;
      if (frontIndexRef.current !== index) return;

      const rect = el.getBoundingClientRect();
      const tilt = computeCardTilt(event.clientX, event.clientY, rect, 9);
      tiltRef.current = tilt;

      const glare = glareRefs.current[index];
      if (glare) {
        glare.style.background = `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.16), transparent 62%)`;
      }
    },
    [],
  );

  const handleCardMouseLeave = useCallback(() => {
    hoveredCardRef.current = null;
    tiltRef.current = NEUTRAL_TILT;
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 1) return;
    isDraggingRef.current = true;
    targetPhaseRef.current = null;
    velocityRef.current = 0;
    touchStartXRef.current = e.touches[0].clientX;
    touchLastXRef.current = e.touches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || e.touches.length !== 1) return;
    const x = e.touches[0].clientX;
    const lastX = touchLastXRef.current ?? x;
    const dx = x - lastX;
    touchLastXRef.current = x;
    // Map horizontal thumb swipe directly to orbital angle
    phaseRef.current += dx * 0.0085;
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    const startX = touchStartXRef.current;
    const endX = touchLastXRef.current;
    touchStartXRef.current = null;
    touchLastXRef.current = null;

    // If the user swiped meaningfully, snap gently to the nearest card before resuming calm orbit
    if (startX !== null && endX !== null && Math.abs(endX - startX) > 16) {
      const nearest = getFrontCardIndex(phaseRef.current, CARD_COUNT);
      targetPhaseRef.current = targetPhaseForIndex(nearest, CARD_COUNT);
    }
  }, []);

  const activeCard = TECH_STACK_CARDS[frontIndex];

  return (
    <section
      id="stack"
      ref={sectionRef}
      className="relative flex min-h-[78vh] flex-col items-center justify-center py-20 sm:min-h-[88vh] sm:py-28"
    >
      <div className="mx-auto flex w-full max-w-[1320px] flex-col items-center px-3 sm:px-6 lg:px-8">
        {/* Dark glass showcase backdrop isolating the 3D orbital carousel cleanly from background code */}
        <div
          data-testid="stack-glass-backdrop"
          className="flex w-full flex-col items-center overflow-hidden rounded-3xl border border-white/10 bg-[#05080F]/90 px-4 py-10 shadow-2xl backdrop-blur-xl sm:px-8 sm:py-12"
        >
          {/* Centered Header: T E C H   S T A C K with thin flanking hairlines */}
          <div className="stack-header-reveal mb-4 flex w-full max-w-2xl items-center justify-center gap-4 sm:mb-6 sm:gap-6">
            <span
              aria-hidden="true"
              className="h-px flex-1 bg-gradient-to-r from-transparent via-white/25 to-white/40"
            />
            <h2 className="font-mono text-xs font-medium uppercase tracking-[0.5em] text-slate-100 whitespace-nowrap sm:text-sm sm:tracking-[0.58em]">
              TECH STACK
            </h2>
            <span
              aria-hidden="true"
              className="h-px flex-1 bg-gradient-to-l from-transparent via-white/25 to-white/40"
            />
          </div>

          {/* 3D Continuous Circular Orbit Stage */}
          <div
            onMouseEnter={handleStageMouseEnter}
            onMouseLeave={handleStageMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            data-testid="stack-coverflow-stage"
            data-active-tech={activeCard.id}
            style={{ perspective: "1200px" }}
            className="relative flex h-[320px] w-full items-center justify-center touch-pan-y select-none sm:h-[380px] md:h-[400px]"
          >
            {/* Subtle ambient floor halo synced to the currently centered card's neon color */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute bottom-4 h-24 w-[280px] rounded-full blur-3xl transition-colors duration-700 sm:w-[420px]"
              style={{
                background: `radial-gradient(ellipse at center, rgba(${activeCard.glowRgb}, 0.16), transparent 72%)`,
              }}
            />

            {TECH_STACK_CARDS.map((card, index) => {
              const isFront = index === frontIndex;

              return (
                <button
                  key={card.id}
                  ref={(el) => {
                    cardRefs.current[index] = el;
                  }}
                  type="button"
                  aria-pressed={isFront}
                  aria-label={`${card.name} — ${card.role}`}
                  data-testid={`stack-card-${card.id}`}
                  data-active={isFront ? "true" : "false"}
                  onMouseEnter={() => handleCardMouseEnter(index)}
                  onMouseMove={(e) => handleCardMouseMove(index, e)}
                  onMouseLeave={handleCardMouseLeave}
                  onClick={() => focusCardByIndex(index)}
                  onFocus={() => focusCardByIndex(index)}
                  style={{
                    borderColor: isFront
                      ? `rgba(${card.glowRgb}, 0.85)`
                      : "rgba(255, 255, 255, 0.16)",
                    boxShadow: isFront
                      ? `0 0 28px rgba(${card.glowRgb}, 0.44), 0 0 64px rgba(${card.glowRgb}, 0.22), inset 0 1px 0 rgba(255,255,255,0.24)`
                      : "0 18px 38px rgba(0, 0, 0, 0.72), inset 0 1px 0 rgba(255,255,255,0.06)",
                  }}
                  className="preserve-3d group absolute flex h-[240px] w-[148px] cursor-pointer select-none flex-col items-center justify-between overflow-hidden rounded-2xl border border-white/15 bg-[#0B101B] p-5 text-center transition-[border-color,box-shadow] duration-500 ease-out pointer-events-auto focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#38BDF8] md:h-[300px] md:w-[180px] md:p-6"
                >
                  {/* Dynamic specular cursor sheen on front card */}
                  <div
                    ref={(el) => {
                      glareRefs.current[index] = el;
                    }}
                    aria-hidden="true"
                    className={`pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300 ${
                      isFront ? "opacity-100" : "opacity-0"
                    }`}
                    style={{
                      background: `radial-gradient(circle at 50% 24%, rgba(${card.glowRgb}, 0.18), transparent 65%)`,
                    }}
                  />

                  {/* Subtle top neon edge bloom */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-6 top-0 h-px transition-opacity duration-500"
                    style={{
                      opacity: isFront ? 1 : 0.35,
                      background: `linear-gradient(90deg, transparent, ${card.borderHex}, transparent)`,
                    }}
                  />

                  {/* Top: Square framed technology icon with soft color bloom */}
                  <div className="relative z-10 mt-1 flex flex-col items-center">
                    <div
                      className="flex h-16 w-16 items-center justify-center rounded-xl border transition-all duration-500 md:h-20 md:w-20"
                      style={{
                        borderColor: isFront
                          ? `rgba(${card.glowRgb}, 0.62)`
                          : `rgba(${card.glowRgb}, 0.34)`,
                        backgroundColor: isFront
                          ? `rgba(${card.glowRgb}, 0.16)`
                          : `rgba(${card.glowRgb}, 0.09)`,
                        boxShadow: isFront
                          ? `0 0 26px rgba(${card.glowRgb}, 0.48), inset 0 0 14px rgba(${card.glowRgb}, 0.18)`
                          : `0 0 14px rgba(${card.glowRgb}, 0.18)`,
                        filter: isFront
                          ? `drop-shadow(0 0 10px rgba(${card.glowRgb}, 0.55))`
                          : "none",
                      }}
                    >
                      <TechIcon id={card.id} />
                    </div>
                  </div>

                  {/* Subtle center accent hairline */}
                  <span
                    aria-hidden="true"
                    className="relative z-10 h-px transition-all duration-500"
                    style={{
                      width: isFront ? "2.75rem" : "1.75rem",
                      backgroundColor: isFront
                        ? card.borderHex
                        : "rgba(255, 255, 255, 0.22)",
                      boxShadow: isFront
                        ? `0 0 12px rgba(${card.glowRgb}, 0.85)`
                        : "none",
                    }}
                  />

                  {/* Bottom: Bold high-contrast technology title + crisp monospace subtitle */}
                  <div className="relative z-10 mb-1 flex flex-col items-center gap-1.5">
                    <span
                      className={`font-display text-base font-bold tracking-wide transition-colors duration-300 md:text-xl ${
                        isFront ? "text-white" : "text-white/85"
                      }`}
                    >
                      {card.name}
                    </span>
                    <span
                      className="font-mono text-[11px] font-medium uppercase tracking-widest transition-colors duration-300 md:text-xs"
                      style={{
                        color: isFront ? card.borderHex : "#CBD5E1",
                      }}
                    >
                      {card.role}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Minimalist Orbit Controls (Prev / Active Tech Dash Indicators / Next) */}
          <div className="mt-2 flex items-center justify-center gap-4 sm:mt-4">
            <div
              className="flex items-center gap-2"
              role="group"
              aria-label="Select technology card"
            >
              {TECH_STACK_CARDS.map((card, idx) => {
                const isFront = idx === frontIndex;
                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => focusCardByIndex(idx)}
                    aria-label={`Focus ${card.name}`}
                    aria-current={isFront ? "true" : undefined}
                    className="flex h-6 items-center px-0.5 focus-visible:outline-2 focus-visible:outline-[#38BDF8]"
                  >
                    <span
                      aria-hidden="true"
                      className="block h-1 rounded-full transition-all duration-300"
                      style={{
                        width: isFront ? "24px" : "8px",
                        backgroundColor: isFront
                          ? card.borderHex
                          : "rgba(255, 255, 255, 0.22)",
                        boxShadow: isFront
                          ? `0 0 10px rgba(${card.glowRgb}, 0.85)`
                          : "none",
                      }}
                    />
                  </button>
                );
              })}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
