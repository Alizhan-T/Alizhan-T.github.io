import { useState } from "react";
import { ArrowUpRight, Menu, RotateCcw, X } from "lucide-react";
import { useLang } from "../i18n/LangContext";
import { LangSwitch } from "./LangSwitch";

export interface NavItem {
  id: string;
  label: string;
}

export const NAV_ITEMS: ReadonlyArray<NavItem> = [
  { id: "hero", label: "Hero" },
  { id: "about", label: "About" },
  { id: "stack", label: "Stack" },
  { id: "projects", label: "Projects" },
  { id: "contact", label: "Contact" },
];

interface NavbarProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  onReplayIntro: () => void;
}

export function Navbar({
  activeSection,
  onNavigate,
  onReplayIntro,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useLang();
  const labelFor = (id: string) => t.nav[id as "hero" | "about" | "stack" | "projects" | "contact"];

  const handleMobileNav = (sectionId: string) => {
    setMobileOpen(false);
    onNavigate(sectionId);
  };

  return (
    <header className="m5-bar fixed inset-x-0 top-0 z-30 border-b">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-3.5 lg:px-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <a
          href="#hero"
          onClick={(e) => {
            e.preventDefault();
            handleMobileNav("hero");
          }}
          className="font-display text-base font-bold tracking-tight text-white whitespace-nowrap shrink-0 transition-colors hover:text-[#38BDF8] sm:text-lg"
        >
          Alizhan Toleukhan
        </a>

        {/* Zone 2: Desktop 5 Concise Single-Line Navigation Links */}
        <nav
          aria-label={t.nav.primary}
          className="hidden md:flex items-center gap-7"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(item.id);
                }}
                aria-current={isActive ? "page" : undefined}
                className={`relative py-1 text-sm font-medium whitespace-nowrap shrink-0 transition-colors ${
                  isActive
                    ? "text-white"
                    : "text-slate-400 hover:text-slate-100"
                }`}
              >
                {labelFor(item.id)}
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-0 -bottom-0.5 h-px transition-opacity duration-200 ${
                    isActive
                      ? "bg-[#38BDF8] opacity-100"
                      : "bg-transparent opacity-0"
                  }`}
                />
              </a>
            );
          })}
        </nav>

        {/* Zone 3: Desktop Contact CTA + Mobile Hamburger Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <LangSwitch />
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              handleMobileNav("contact");
            }}
            className="hidden md:inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-medium text-slate-100 whitespace-nowrap shrink-0 transition-colors hover:border-[#38BDF8]/60 hover:bg-[#0052A5]/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38BDF8]"
          >
            <span>{t.nav.getInTouch}</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-[#38BDF8]" aria-hidden="true" />
          </a>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? t.nav.closeMenu : t.nav.openMenu}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-slate-200 transition-colors hover:border-[#38BDF8]/60 hover:text-white md:hidden"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Collapsible Navigation Drawer */}
      {mobileOpen && (
        <nav
          aria-label={t.nav.mobile}
          className="border-t border-white/10 bg-[#04060A]/95 px-4 pb-4 pt-2 md:hidden"
        >
          <div className="flex flex-col divide-y divide-white/5">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleMobileNav(item.id);
                  }}
                  className={`flex min-h-[44px] items-center justify-between py-2.5 text-sm font-medium ${
                    isActive ? "text-[#38BDF8]" : "text-slate-200"
                  }`}
                >
                  <span>{labelFor(item.id)}</span>
                  {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#38BDF8]" aria-hidden="true" />
                  )}
                </a>
              );
            })}

            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onReplayIntro();
              }}
              className="mt-1 flex min-h-[44px] items-center gap-2 pt-3 font-mono text-xs text-slate-400 hover:text-[#38BDF8]"
            >
              <RotateCcw className="h-3.5 w-3.5 text-[#38BDF8]" aria-hidden="true" />
              <span>{t.nav.replay}</span>
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}
