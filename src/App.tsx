import { useCallback, useState } from "react";
import {
  ArrowUpRight,
  Check,
  Copy,
  Github,
  Linkedin,
  Rotate3d,
  Send,
  TriangleAlert,
  ZoomIn,
} from "lucide-react";
import {
  allProjects,
  contact,
  coreStack,
  finishes,
  type SceneSettings,
} from "./data/portfolio";
import { cameraShots } from "./components/scene/CameraRig";
import Backdrop from "./components/scene/Backdrop";

const defaults: SceneSettings = {
  finish: 0,
  headlights: true,
  hazards: false,
  inspect: false,
  brake: false,
};

export default function App() {
  const [state, setState] = useState<SceneSettings>(defaults);
  const [shot, setShot] = useState(0);
  const [zoomEnabled, setZoomEnabled] = useState(false);
  const [copied, setCopied] = useState(false);

  const update = useCallback(
    (value: Partial<SceneSettings>) => setState((s) => ({ ...s, ...value })),
    [],
  );

  const accent = finishes[state.finish].accent;

  async function copyHandle() {
    try {
      await navigator.clipboard.writeText(contact.handle);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div
      className="page-shell"
      style={{ "--accent": accent } as React.CSSProperties}
    >
      {/* COMPACT STICKY HEADER */}
      <header className="site-header">
        <div className="container header-row">
          <a href="#top" className="brand-link">
            <span className="brand-dot" />
            <strong>ALIZHAN TOLEUKHAN</strong>
            <span className="brand-sub">iOS &amp; AI</span>
          </a>

          <nav className="top-nav" aria-label="Навигация">
            <a href="#top">3D Шоурум</a>
            <a href="#projects">Проекты</a>
            <a href="#about">Кто я &amp; Стек</a>
            <a href="#contact">Контакты</a>
          </nav>

          <div className="header-actions">
            <span className="avail-badge">
              <i /> OPEN TO WORK
            </span>
            <a
              href={contact.telegram}
              target="_blank"
              rel="noreferrer"
              className="header-cta"
            >
              Telegram ↗
            </a>
          </div>
        </div>
      </header>

      <main id="top" className="container">
        {/* HERO SPLIT: WHO I AM + INTERACTIVE 3D BMW M5 F90 */}
        <section className="hero-grid" aria-labelledby="hero-heading">
          <div className="hero-info">
            <div className="eyebrow-tag">
              ASTANA IT UNIVERSITY · ASTANA, KAZAKHSTAN
            </div>
            <h1 id="hero-heading">
              <span>Alizhan</span> Toleukhan<b>_</b>
            </h1>
            <p className="hero-lead">
              iOS &amp; Full-Stack разработчик. Создаю быстрые нативные
              приложения на <b>SwiftUI</b>, сервисы компьютерного зрения на{" "}
              <b>FastAPI + YOLOv8</b> и прикладные веб-системы.
            </p>

            <div className="quick-stats">
              <div>
                <strong>15</strong>
                <span>репозиториев</span>
              </div>
              <div>
                <strong>30+</strong>
                <span>merged PRs</span>
              </div>
              <div>
                <strong>iOS &amp; CV</strong>
                <span>специализация</span>
              </div>
              <div>
                <strong>AITU</strong>
                <span>Астана · UTC+5</span>
              </div>
            </div>

            <div className="stack-chips" aria-label="Ключевой стек">
              {coreStack.map((tech) => (
                <span key={tech}>{tech}</span>
              ))}
            </div>

            <div className="hero-btns">
              <a href="#projects" className="btn-main">
                Смотреть проекты ↓
              </a>
              <a
                href={contact.telegram}
                target="_blank"
                rel="noreferrer"
                className="btn-ghost"
              >
                <Send size={14} />
                Telegram @alizhnn
              </a>
              <a
                href={contact.github}
                target="_blank"
                rel="noreferrer"
                className="btn-ghost"
              >
                <Github size={14} />
                GitHub
              </a>
            </div>
          </div>

          {/* INTERACTIVE 3D BMW M5 F90 SHOWROOM CARD */}
          <div className="showroom-card">
            <div className="showroom-top">
              <div className="m5-badge">
                <i className="m-bars">
                  <b />
                  <b />
                  <b />
                </i>
                <strong>BMW M5 F90</strong>
                <span>COMPETITION · 4.4L V8</span>
              </div>
              <div className="showroom-hint">
                <span>
                  <Rotate3d size={13} /> Крутите 3D-модель мышью
                </span>
                <button
                  type="button"
                  className={"zoom-toggle " + (zoomEnabled ? "on" : "")}
                  onClick={() => setZoomEnabled((z) => !z)}
                  title="Включить зум колесом мыши"
                >
                  <ZoomIn size={13} />
                  Зум
                </button>
              </div>
            </div>

            <Backdrop settings={state} shot={shot} zoomEnabled={zoomEnabled} />

            <div className="showroom-controls">
              {/* Paint Swatches */}
              <div className="ctrl-group">
                <span className="ctrl-label">
                  {finishes[state.finish].name}
                </span>
                <div className="swatch-row" role="group" aria-label="Цвет кузова">
                  {finishes.map((f, i) => (
                    <button
                      key={f.name}
                      type="button"
                      title={f.name}
                      aria-label={f.name}
                      aria-pressed={state.finish === i}
                      className={state.finish === i ? "active" : ""}
                      style={{ "--swatch": f.sample } as React.CSSProperties}
                      onClick={() => update({ finish: i })}
                    >
                      <span />
                    </button>
                  ))}
                </div>
              </div>

              {/* Camera Angles */}
              <div className="ctrl-group">
                <div className="pill-row" role="group" aria-label="Ракурс камеры">
                  {cameraShots.map((c, i) => (
                    <button
                      key={c.code}
                      type="button"
                      className={"ctrl-pill " + (shot === i ? "active" : "")}
                      onClick={() => {
                        setShot(i);
                        update({ brake: i === 3 });
                      }}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lights */}
              <div className="ctrl-group">
                <div className="pill-row" role="group" aria-label="Оптика">
                  <button
                    type="button"
                    className={
                      "ctrl-pill " + (state.headlights ? "active" : "")
                    }
                    onClick={() => update({ headlights: !state.headlights })}
                  >
                    ДХО
                  </button>
                  <button
                    type="button"
                    className={"ctrl-pill " + (state.hazards ? "active" : "")}
                    onClick={() => update({ hazards: !state.hazards })}
                  >
                    <TriangleAlert size={12} />
                    Аварийка
                  </button>
                  <button
                    type="button"
                    className={"ctrl-pill " + (state.brake ? "active" : "")}
                    onClick={() => {
                      const nextBrake = !state.brake;
                      update({ brake: nextBrake });
                      if (nextBrake) setShot(3);
                    }}
                  >
                    Стоп
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PROJECTS SECTION — CONCISE & CLEAR */}
        <section
          id="projects"
          className="section-block"
          aria-labelledby="projects-heading"
        >
          <div className="section-header">
            <div>
              <span className="section-tag">01 // SHIPPED WORK</span>
              <h2 id="projects-heading">Проекты</h2>
            </div>
            <a
              href="https://github.com/Alizhan-T?tab=repositories"
              target="_blank"
              rel="noreferrer"
              className="all-repos-link"
            >
              Все 15 репозиториев на GitHub <ArrowUpRight size={14} />
            </a>
          </div>

          <div className="projects-bento">
            {allProjects.map((p) => (
              <article key={p.id} className="proj-card">
                <div className="proj-top">
                  <span className="proj-badge">
                    <i style={{ background: p.badgeColor }} />
                    {p.badge}
                  </span>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noreferrer"
                    className="proj-link"
                  >
                    GitHub <ArrowUpRight size={13} />
                  </a>
                </div>
                <h3>{p.name}</h3>
                <p>{p.description}</p>
                <div className="proj-metric">{p.metric}</div>
                <div className="proj-tags">
                  {p.tags.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* WHO I AM, STACK & DIRECT CONTACT BENTO */}
        <section
          id="about"
          className="section-block"
          aria-labelledby="about-heading"
        >
          <div className="section-header">
            <div>
              <span className="section-tag">02 // PROFILE &amp; CONTACT</span>
              <h2 id="about-heading">Кто я, стек и контакты</h2>
            </div>
          </div>

          <div className="bento-three">
            <div className="info-card">
              <span className="card-kicker">01 // КТО Я</span>
              <h3>Инженерный подход без лишней воды</h3>
              <p>
                Учусь в <b>Astana IT University (AITU)</b> в Астане. Строю
                продукты от идеи до рабочего релиза: нативные iOS-клиенты с
                живым видео и офлайн-кэшем, бэкенд на Python/Node.js и
                внутренние CRM-инструменты для образовательных команд.
              </p>
              <ul className="fact-list">
                <li>
                  <span>Локация:</span> Астана, Казахстан (UTC+5)
                </li>
                <li>
                  <span>ВУЗ:</span> Astana IT University
                </li>
                <li>
                  <span>Фокус:</span> Native iOS · Computer Vision · Full-Stack
                </li>
              </ul>
            </div>

            <div className="info-card">
              <span className="card-kicker">02 // ТЕХНОЛОГИИ</span>
              <h3>Стек по направлениям</h3>
              <div className="stack-groups">
                <div>
                  <strong>iOS &amp; Mobile</strong>
                  <p>Swift · SwiftUI · AVPlayer · MapKit · Core Data · MVVM · Flutter</p>
                </div>
                <div>
                  <strong>AI &amp; Backend</strong>
                  <p>Python · FastAPI · YOLOv8 · Node.js · Express · REST API</p>
                </div>
                <div>
                  <strong>Web, Data &amp; DevOps</strong>
                  <p>TypeScript · React · MongoDB · Firebase · Docker · GitHub Actions</p>
                </div>
              </div>
            </div>

            <div
              id="contact"
              className="info-card contact-card"
              onPointerEnter={() => update({ brake: true })}
              onPointerLeave={() => update({ brake: false })}
            >
              <span className="card-kicker">03 // НА СВЯЗИ</span>
              <h3>Открыт к проектам и стажировкам</h3>
              <p>
                Быстрее всего отвечаю в Telegram. Готов обсудить разработку
                iOS-приложения, CV/AI-модуля или веб-сервиса.
              </p>

              <div className="contact-actions">
                <a
                  href={contact.telegram}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-main full-w"
                >
                  <Send size={14} />
                  Написать в Telegram (@alizhnn)
                </a>
                <button
                  type="button"
                  onClick={copyHandle}
                  className="btn-ghost full-w"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Ник @alizhnn скопирован" : "Скопировать @alizhnn"}
                </button>
              </div>

              <div className="contact-links">
                <a href={contact.github} target="_blank" rel="noreferrer">
                  <Github size={14} /> GitHub
                </a>
                <a href={contact.telegram} target="_blank" rel="noreferrer">
                  <Send size={14} /> Telegram
                </a>
                <a href={contact.linkedin} target="_blank" rel="noreferrer">
                  <Linkedin size={14} /> LinkedIn
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-row">
          <span>© 2026 Alizhan Toleukhan · Astana, Kazakhstan (UTC+5)</span>
          <span>
            <a href={contact.github} target="_blank" rel="noreferrer">
              github.com/Alizhan-T
            </a>
            {" · "}
            <a href={contact.telegram} target="_blank" rel="noreferrer">
              t.me/alizhnn
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
