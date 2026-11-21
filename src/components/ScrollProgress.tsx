import { useEffect, useRef } from "react";

/** Thin blue reading-progress line at the very top of the viewport. */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-[45] h-[2px]">
      <div
        ref={barRef}
        className="h-full origin-left bg-gradient-to-r from-[#0052A5] via-[#38BDF8] to-[#8AC4FF] shadow-[0_0_10px_rgba(56,189,248,0.7)]"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
