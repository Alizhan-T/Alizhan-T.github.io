import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Github, Maximize2, Play, X } from "lucide-react";
import { projects, type Project } from "../../data/portfolio";
import FireWatch from "../projects/FireWatch";
import Kitchen from "../projects/Kitchen";
import Market from "../projects/Market";
import Multiverse from "../projects/Multiverse";
import { Eyebrow } from "./Hero";

const visuals = {
  fire: FireWatch,
  kitchen: Kitchen,
  wiki: Multiverse,
  market: Market,
};
const demoHash = (project: Project) => "#demo/" + project.name.toLowerCase();
const projectAtLocation = () =>
  projects.find((p) => demoHash(p) === location.hash) ?? null;

function ProjectCard({
  project,
  open,
}: {
  project: Project;
  open: (p: Project) => void;
}) {
  const Viz = visuals[project.id];
  function openLink(event: MouseEvent<HTMLAnchorElement>) {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
      return;
    event.preventDefault();
    open(project);
  }
  return (
    <article className="project-card">
      <button
        className="visual-opener"
        type="button"
        onClick={() => open(project)}
        aria-haspopup="dialog"
        aria-label={"Открыть мини-демо " + project.name}
      >
        <Viz />
        <i>
          <Maximize2 size={14} />
        </i>
      </button>
      <div className="card-content">
        <div className="category">{project.category}</div>
        <h3>{project.name}</h3>
        <p>{project.description}</p>
        <div className="tags">
          {project.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <div className="card-links">
          <a
            href={project.url}
            target="_blank"
            rel="noreferrer"
            aria-label={project.name + " на GitHub"}
          >
            <Github size={14} />
            GitHub
          </a>
          <a
            className="demo-link"
            href={demoHash(project)}
            onClick={openLink}
            aria-haspopup="dialog"
          >
            <Play size={13} />
            Мини-демо
          </a>
        </div>
      </div>
    </article>
  );
}

export default function Projects() {
  const [selected, setSelected] = useState<Project | null>(projectAtLocation);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const sync = () => setSelected(projectAtLocation());
    window.addEventListener("hashchange", sync);
    window.addEventListener("popstate", sync);
    return () => {
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("popstate", sync);
    };
  }, []);
  useEffect(() => {
    const el = dialog.current;
    if (selected && !el?.open) el?.showModal();
    if (!selected && el?.open) el.close();
  }, [selected]);
  function open(project: Project) {
    history.pushState({ showroomDemo: true }, "", demoHash(project));
    setSelected(project);
  }
  function close() {
    if (history.state?.showroomDemo) {
      history.back();
      return;
    }
    history.replaceState(null, "", "#projects");
    setSelected(null);
  }
  const Viz = selected && visuals[selected.id];
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
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} open={open} />
          ))}
        </div>
      </div>
      <dialog
        ref={dialog}
        className="demo-modal"
        aria-labelledby="demo-project-name"
        onCancel={(e) => {
          e.preventDefault();
          close();
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        {selected && Viz && (
          <div className="demo-box" key={selected.id}>
            <div className="modal-header">
              <div>
                <span className="micro">ИНТЕРАКТИВНЫЙ МАКЕТ</span>
                <h3 id="demo-project-name">{selected.name}</h3>
              </div>
              <button
                type="button"
                aria-label="Закрыть мини-демо"
                onClick={close}
                autoFocus
              >
                <X />
              </button>
            </div>
            <Viz interactive />
            <p>{selected.description}</p>
            <a
              className="modal-source"
              href={selected.url}
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
