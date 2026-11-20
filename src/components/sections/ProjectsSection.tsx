import { useMemo, useState } from "react";
import { ArrowUpRight, GitFork, Star } from "lucide-react";
import type { PortfolioProject } from "../../services/githubParser";

type ProjectFilter = "All" | PortfolioProject["category"];

const FILTERS: ReadonlyArray<ProjectFilter> = [
  "All",
  "AI & Vision",
  "Web3 & Blockchain",
  "Mobile (iOS / Flutter)",
  "Full-Stack Web",
];

interface ProjectsSectionProps {
  projects: PortfolioProject[];
  loading: boolean;
}

export function ProjectsSection({ projects, loading }: ProjectsSectionProps) {
  const [filter, setFilter] = useState<ProjectFilter>("All");

  const filtered = useMemo(() => {
    const list =
      filter === "All"
        ? projects
        : projects.filter((p) => p.category === filter);
    return list.slice(0, 8);
  }, [projects, filter]);

  return (
    <section
      id="projects"
      className="relative flex min-h-[135vh] items-center py-24"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Section Header + Interactive Category Filter */}
          <div className="m5-card flex flex-col gap-4 rounded-2xl p-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-xs text-[#38BDF8]">
                03. Selected Works · GitHub Alizhan-T
              </p>
              <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-4xl">
                Ключевые проекты
              </h2>
            </div>

            <div
              role="tablist"
              aria-label="Фильтр проектов по направлению"
              className="flex flex-wrap items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] p-1"
            >
              {FILTERS.map((item) => {
                const active = filter === item;
                return (
                  <button
                    key={item}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setFilter(item)}
                    className={`rounded-md px-2.5 py-1.5 font-mono text-xs whitespace-nowrap shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-[#38BDF8] ${
                      active
                        ? "bg-[#0052A5] text-white"
                        : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                    }`}
                  >
                    {item === "Mobile (iOS / Flutter)" ? "Mobile" : item}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Loading State */}
          {loading && filtered.length === 0 ? (
            <div className="m5-card rounded-2xl p-8 font-mono text-sm text-slate-400">
              Загрузка репозиториев Alizhan-T из GitHub API...
            </div>
          ) : filtered.length === 0 ? (
            <div className="m5-card rounded-2xl p-8 text-sm text-slate-400">
              В выбранной категории пока нет публичных репозиториев.{" "}
              <button
                type="button"
                onClick={() => setFilter("All")}
                className="text-[#38BDF8] underline underline-offset-4 hover:text-white"
              >
                Показать все проекты
              </button>
            </div>
          ) : (
            /* 2-Column Clean Minimalist Project Grid */
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filtered.map((project) => (
                <article
                  key={project.id}
                  className="m5-card group flex flex-col justify-between rounded-2xl p-6 transition-colors hover:border-[#38BDF8]/45"
                >
                  <div className="space-y-3">
                    {/* Quiet unboxed metadata kicker (zero pill sandwiches) */}
                    <div className="flex items-center justify-between gap-3 font-mono text-xs text-slate-400 tabular-nums">
                      <span className="truncate">
                        <span className="text-[#38BDF8]">{project.category}</span>
                        <span className="mx-1.5 text-slate-600" aria-hidden="true">
                          ·
                        </span>
                        <span>{project.language}</span>
                      </span>

                      <span className="inline-flex items-center gap-3 shrink-0">
                        <span className="inline-flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                          {project.stars}
                        </span>
                        {project.forks > 0 && (
                          <span className="inline-flex items-center gap-1">
                            <GitFork className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                            {project.forks}
                          </span>
                        )}
                      </span>
                    </div>

                    {/* Project Title */}
                    <h3 className="font-display text-xl font-bold tracking-tight text-white transition-colors group-hover:text-[#38BDF8]">
                      {project.name}
                    </h3>

                    {/* Project Description */}
                    <p className="text-sm leading-relaxed text-slate-300">
                      {project.description}
                    </p>
                  </div>

                  {/* Unboxed Tech Stack + Direct Links */}
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                    <p className="font-mono text-xs text-slate-400">
                      {project.tags.join(" · ")}
                    </p>

                    <div className="flex items-center gap-3 shrink-0">
                      {project.demoUrl && (
                        <a
                          href={project.demoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-mono text-xs text-[#38BDF8] whitespace-nowrap transition-colors hover:text-white"
                        >
                          <span>Demo</span>
                          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </a>
                      )}
                      <a
                        href={project.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Открыть код ${project.name} на GitHub`}
                        className="inline-flex items-center gap-1 font-mono text-xs text-slate-200 whitespace-nowrap transition-colors hover:text-[#38BDF8]"
                      >
                        <span>Code</span>
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
