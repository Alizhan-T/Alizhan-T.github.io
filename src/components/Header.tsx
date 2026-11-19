import { useEffect, useState } from "react";
import { MapPin, Menu, X } from "lucide-react";
import { sections } from "../data/portfolio";

export function Monogram() {
  return (
    <svg viewBox="0 0 67 37" aria-hidden="true" className="monogram">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M0 34 23 3h10l8 31H30l-1.4-6.3H16L11.6 34Zm20-14h7l-1.9-8.5ZM35 3h32l-5.2 8H51l6 23H46.5l-6-23h-3.3Z"
      />
    </svg>
  );
}

function useAstanaTime() {
  const [time, setTime] = useState("UTC+5");
  useEffect(() => {
    const update = () => {
      try {
        const fmt = new Intl.DateTimeFormat("ru-RU", {
          timeZone: "Asia/Almaty",
          hour: "2-digit",
          minute: "2-digit",
        });
        setTime(fmt.format(new Date()) + " UTC+5");
      } catch {
        setTime("UTC+5");
      }
    };
    update();
    const id = window.setInterval(update, 15000);
    return () => window.clearInterval(id);
  }, []);
  return time;
}

export function Header({
  active,
  navigate,
}: {
  active: number;
  navigate: (i: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const astanaTime = useAstanaTime();

  function go(i: number) {
    setOpen(false);
    navigate(i);
  }

  return (
    <header className="header">
      <div className="header-inner">
        <a
          className="brand"
          href="#hero"
          aria-label="Alizhan Toleukhan — главная"
          onClick={(e) => {
            e.preventDefault();
            go(0);
          }}
        >
          <Monogram />
          <span className="brand-rule" />
          <span className="brand-name">
            ALIZHAN<span>.DEV</span>
          </span>
        </a>
        <nav
          aria-label="Основная навигация"
          className={open ? "nav open" : "nav"}
        >
          {sections.map((s, i) => (
            <a
              key={s.id}
              href={"#" + s.id}
              aria-current={i === active ? "page" : undefined}
              onClick={(e) => {
                e.preventDefault();
                go(i);
              }}
            >
              <span className="nav-index">0{i + 1}</span>
              {s.label}
            </a>
          ))}
        </nav>
        <div className="header-end">
          <span className="status-pill" title="Открыт к проектам и командам">
            <i className="status-dot" />
            AVAILABLE
          </span>
          <span className="place">
            <MapPin size={13} /> ASTANA · {astanaTime}
          </span>
          <button
            className="mobile-menu"
            aria-label={open ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  );
}
