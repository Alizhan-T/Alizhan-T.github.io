import { ArrowUpRight } from "lucide-react";

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
}

export function Navbar({ activeSection, onNavigate }: NavbarProps) {
  return (
    <header className="m5-bar fixed inset-x-0 top-0 z-30 border-b">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <a
          href="#hero"
          onClick={(e) => {
            e.preventDefault();
            onNavigate("hero");
          }}
          className="font-display text-base font-bold tracking-tight text-white whitespace-nowrap shrink-0 transition-colors hover:text-[#38BDF8] sm:text-lg"
        >
          Alizhan Toleukhan
        </a>

        {/* Zone 2: 5 Concise Single-Line Navigation Links */}
        <nav
          aria-label="Основная навигация"
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
                {item.label}
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

        {/* Zone 3: Single Primary Action */}
        <a
          href="#contact"
          onClick={(e) => {
            e.preventDefault();
            onNavigate("contact");
          }}
          className="inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-medium text-slate-100 whitespace-nowrap shrink-0 transition-colors hover:border-[#38BDF8]/60 hover:bg-[#0052A5]/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38BDF8]"
        >
          <span>Связаться</span>
          <ArrowUpRight className="h-3.5 w-3.5 text-[#38BDF8]" aria-hidden="true" />
        </a>
      </div>
    </header>
  );
}
