import { useEffect, useRef, useState } from "react";
import { Github, Maximize2, X } from "lucide-react";
import { projects, type Project } from "../../data/portfolio";
import FireWatch from "../projects/FireWatch";
import Kitchen from "../projects/Kitchen";
import Market from "../projects/Market";
import { Eyebrow } from "./Hero";
const visuals = { fire: FireWatch, kitchen: Kitchen, market: Market };
function ProjectCard({ p, open }: { p: Project; open: () => void }) {
  const Viz = visuals[p.id];
  return (
    <article className="project-card">
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
          <button onClick={open}>Превью</button>
        </div>
      </div>
    </article>
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
        <Eyebrow number="03" name="PROJECTS" />
        <h2 id="projects-title">
          Избранные проекты<span>.</span>
        </h2>
        <div className="project-grid">
          {projects.map((p) => (
            <ProjectCard key={p.id} p={p} open={() => set(p)} />
          ))}
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
            <a
              className="modal-source"
              href={project.url}
              target="_blank"
              rel="noreferrer"
            >
              <Github size={15} />
              Исходный код
            </a>
          </div>
        )}
      </dialog>
    </section>
  );
}
