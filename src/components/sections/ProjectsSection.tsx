import { useMemo, useState } from "react";
import { ArrowUpRight, GitFork, Star } from "lucide-react";
import type { PortfolioProject } from "../../services/githubParser";
import { Reveal } from "../Reveal";
import { useLang } from "../../i18n/LangContext";
import { RU_PROJECT_DESCRIPTIONS } from "../../i18n/translations";

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
  const { t, lang } = useLang();
  const [filter, setFilter] = useState<ProjectFilter>("All");
  const catLabel = (c: string) => t.projects.categories[c] ?? (c === "Mobile (iOS / Flutter)" ? "Mobile" : c);

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
      className="relative flex items-center py-14 sm:min-h-[115vh] sm:py-24"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-5 sm:space-y-8">
          {/* Section Header + Interactive Category Filter */}
          <div className="m5-card flex flex-col gap-4 rounded-2xl p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
            <div>
              <p className="font-mono text-xs text-[#38BDF8]">
                {t.projects.label}
              </p>
              <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-4xl">
                {t.projects.title}
              </h2>
            </div>

            <div
              role="tablist"
              aria-label={t.projects.filterLabel}
              className="no-scrollbar flex w-full flex-nowrap items-center gap-1 overflow-x-auto rounded-lg border border-white/10 bg-white/[0.03] p-1 sm:w-fit sm:flex-wrap"
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
                    className={`min-h-[36px] rounded-md px-3 py-1.5 font-mono text-xs whitespace-nowrap shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-[#38BDF8] sm:min-h-0 sm:px-2.5 ${
                      active
                        ? "bg-[#0052A5] text-white"
                        : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                    }`}
                  >
                    {item === "All" ? t.projects.all : catLabel(item)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Loading State */}
          {loading && filtered.length === 0 ? (
            <div className="m5-card rounded-2xl p-6 font-mono text-sm text-slate-400 sm:p-8">
              {t.projects.loading}
            </div>
          ) : filtered.length === 0 ? (
            <div className="m5-card rounded-2xl p-6 text-sm text-slate-400 sm:p-8">
              {t.projects.empty}{" "}
              <button
                type="button"
                onClick={() => setFilter("All")}
                className="text-[#38BDF8] underline underline-offset-4 hover:text-white"
              >
                {t.projects.showAll}
              </button>
            </div>
          ) : (
            /* 2-Column Clean Minimalist Project Grid */
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filtered.map((project, i) => (
                <Reveal key={project.id} delay={(i % 2) * 90} className="h-full">
                <article
                  className="m5-card m5-project-card group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl p-5 transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-1 hover:border-[#38BDF8]/45 hover:shadow-[0_18px_44px_rgba(0,82,165,0.22)] sm:p-6"
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#38BDF8]/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  />
                  <div className="space-y-3">
                    {/* Quiet unboxed metadata kicker (zero pill sandwiches) */}
                    <div className="flex items-center justify-between gap-3 font-mono text-xs text-slate-400 tabular-nums">
                      <span className="truncate">
                        <span className="text-[#38BDF8]">
                          {catLabel(project.category)}
                        </span>
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
                            <GitFork className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
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
                    <p className="text-[15px] leading-7 text-slate-300">
                      {(lang === "ru" && RU_PROJECT_DESCRIPTIONS[project.name]) || project.description}
                    </p>
                  </div>

                  {/* Unboxed Tech Stack + Direct Links */}
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                    <p className="font-mono text-[13px] leading-6 text-slate-400">
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
                          <span>{t.projects.demo}</span>
                          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </a>
                      )}
                      <a
                        href={project.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${project.name}: ${t.projects.viewCode}`}
                        className="inline-flex items-center gap-1 font-mono text-xs text-slate-200 whitespace-nowrap transition-colors hover:text-[#38BDF8]"
                      >
                        <span>{t.projects.code}</span>
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                    </div>
                  </div>
                </article>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
