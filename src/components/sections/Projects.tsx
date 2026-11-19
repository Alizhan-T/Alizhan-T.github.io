import { useEffect, useRef, useState } from "react";
import { Github, Maximize2, X, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { moreProjects, projects, type Project } from "../../data/portfolio";
import FireWatch from "../projects/FireWatch";
import Kitchen from "../projects/Kitchen";
import Market from "../projects/Market";
import { Eyebrow } from "./Hero";

const visuals = { fire: FireWatch, kitchen: Kitchen, market: Market };

function ProjectCard({
  p,
  index,
  open,
}: {
  p: Project;
  index: number;
  open: () => void;
}) {
  const Viz = visuals[p.id];
  const cardRef = useRef<HTMLElement>(null);

  function handlePointerMove(e: React.PointerEvent<HTMLElement>) {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--my", `${e.clientY - rect.top}px`);
  }

  return (
    <motion.article
      ref={cardRef}
      className="project-card"
      onPointerMove={handlePointerMove}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.55,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <button
        className="visual-opener"
        onClick={open}
        aria-label={"Открыть превью " + p.name}
      >
        <Viz />
        <i>
          <Maximize2 size={14} />
        </i>
      </button>
      <div className="card-content">
        <div className="category">{p.category}</div>
        <h3>{p.name}</h3>
        <p>{p.description}</p>
        <div className="project-metric">{p.metric}</div>
        <div className="tags">
          {p.tags.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
        <div className="card-links">
          <a href={p.url} target="_blank" rel="noreferrer">
            <Github size={14} />
            GitHub
          </a>
          <button onClick={open}>Интерактивное превью</button>
        </div>
      </div>
    </motion.article>
  );
}

export default function Projects() {
  const [project, set] = useState<Project | null>(null),
    dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (project) dialog.current?.showModal();
    else dialog.current?.close();
  }, [project]);

  const Viz = project && visuals[project.id];

  return (
    <section
      id="projects"
      className="projects section-frame"
      aria-labelledby="projects-title"
    >
      <div className="projects-inner">
        <Eyebrow number="03" name="PROJECTS // SHIPPED WORK" />
        <h2 id="projects-title">
          Избранные проекты<span>.</span>
        </h2>
        <div className="project-grid">
          {projects.map((p, i) => (
            <ProjectCard key={p.id} p={p} index={i} open={() => set(p)} />
          ))}
        </div>

        <div className="more-work-panel" aria-label="Другие репозитории и продукты">
          <div className="more-work-head">
            <span className="micro">MORE SHIPPED REPOSITORIES &amp; EDTECH</span>
            <a
              href="https://github.com/Alizhan-T?tab=repositories"
              target="_blank"
              rel="noreferrer"
              className="more-all-link"
            >
              Все 15 репозиториев <ArrowUpRight size={13} />
            </a>
          </div>
          <div className="more-work-grid">
            {moreProjects.map((item) => (
              <a
                key={item.name}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="more-work-card"
              >
                <div className="more-card-top">
                  <span className="more-badge">{item.badge}</span>
                  <ArrowUpRight size={13} />
                </div>
                <strong>{item.name}</strong>
                <p>{item.summary}</p>
                <small>{item.stack}</small>
              </a>
            ))}
          </div>
        </div>
      </div>

      <dialog
        ref={dialog}
        className="demo-modal"
        onCancel={() => set(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) set(null);
        }}
      >
        {project && Viz && (
          <div className="demo-box">
            <div className="modal-header">
              <div>
                <span className="micro">ИНТЕРАКТИВНОЕ ПРЕВЬЮ</span>
                <h3>{project.name}</h3>
              </div>
              <button
                aria-label="Закрыть превью"
                onClick={() => set(null)}
                autoFocus
              >
                <X />
              </button>
            </div>
            <Viz interactive />
            <p>{project.description}</p>
            <div className="project-metric">{project.metric}</div>
            <a
              className="modal-source"
              href={project.url}
              target="_blank"
              rel="noreferrer"
            >
              <Github size={15} />
              Исходный код на GitHub
            </a>
          </div>
        )}
      </dialog>
    </section>
  );
}
