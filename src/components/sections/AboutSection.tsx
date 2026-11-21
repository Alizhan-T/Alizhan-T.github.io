import { useState } from "react";
import { ExternalLink } from "lucide-react";
import type { GitHubPortfolioData } from "../../services/github";
import { useLang } from "../../i18n/LangContext";

interface AboutSectionProps {
  data: GitHubPortfolioData;
  loading: boolean;
}

export function AboutSection({ data, loading }: AboutSectionProps) {
  const { t } = useLang();
  const [avatarFailed, setAvatarFailed] = useState(false);
  const { profile, readme, languages } = data;

  const initials = profile.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <section
      id="about"
      className="relative flex items-center py-14 sm:min-h-[110vh] sm:py-24"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="m5-card max-w-xl rounded-2xl p-5 sm:p-8 space-y-5 sm:space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
              {profile.avatarUrl && !avatarFailed ? (
                <img
                  src={profile.avatarUrl}
                  alt={`${profile.name} avatar`}
                  referrerPolicy="no-referrer"
                  onError={() => setAvatarFailed(true)}
                  className="h-12 w-12 rounded-xl border border-white/15 object-cover shrink-0 sm:h-14 sm:w-14"
                />
              ) : (
                <div
                  aria-hidden="true"
                  className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#38BDF8]/30 bg-[#004282]/40 font-display text-base font-bold text-[#38BDF8] shrink-0 sm:h-14 sm:w-14 sm:text-lg"
                >
                  {initials}
                </div>
              )}

              <div className="min-w-0">
                <p className="font-mono text-xs text-[#38BDF8] truncate sm:text-[13px]">
                  {t.about.label} · github.com/{profile.login}
                </p>
                <h2 className="font-display text-xl font-bold tracking-tight text-white sm:text-3xl">
                  {t.about.title}
                </h2>
              </div>
            </div>

            <a
              href={profile.profileUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={`${t.about.openProfile} ${profile.login}`}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-md border border-white/10 px-3 py-1.5 font-mono text-xs text-slate-300 whitespace-nowrap shrink-0 transition-colors hover:border-[#38BDF8]/60 hover:text-white"
            >
              <span>GitHub</span>
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>

          {/* Profile Bio & README Summary */}
          <div className="space-y-3.5 text-[15px] leading-7 text-slate-300">
            <p>{t.about.summary || readme.summary || profile.bio}</p>
            <p className="font-mono text-xs text-slate-400">
              {profile.education} · {profile.location}
            </p>
          </div>

          {/* Live GitHub Stats Strip (tabular numerals, clean hairline separation) */}
          <div className="grid grid-cols-3 gap-4 border-y border-white/10 py-4 font-mono tabular-nums">
            <div>
              <p className="text-xl font-semibold text-white">
                {loading ? "—" : profile.publicRepos}
              </p>
              <p className="text-xs text-slate-400">{t.about.repos}</p>
            </div>
            <div>
              <p className="text-xl font-semibold text-white">
                {loading ? "—" : profile.totalStars}
              </p>
              <p className="text-xs text-slate-400">{t.about.stars}</p>
            </div>
            <div>
              <p className="text-xl font-semibold text-white">
                {loading ? "—" : profile.followers}
              </p>
              <p className="text-xs text-slate-400">{t.about.followers}</p>
            </div>
          </div>

          {/* Parsed README Highlights */}
          <div className="space-y-2.5">
            <h3 className="font-mono text-xs text-slate-400">
              {t.about.focus}
            </h3>
            <ul className="space-y-2.5 text-[15px] leading-7 text-slate-300">
              {(t.about.highlights.length ? t.about.highlights : readme.highlights).map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span
                    aria-hidden="true"
                    className="mt-2 h-1 w-1 rounded-full bg-[#38BDF8] shrink-0"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* P2P Trading & Crypto Markets — concise, practical experience alongside engineering */}
          <div className="space-y-1.5 border-t border-white/10 pt-4">
            <h3 className="font-mono text-xs text-[#38BDF8]">
              {t.about.p2pTitle}
            </h3>
            <p className="text-[15px] leading-7 text-slate-300">
              {t.about.p2pText}
            </p>
          </div>

          {/* Language Distribution computed from GitHub repos */}
          {languages.length > 0 && (
            <div className="space-y-2.5 border-t border-white/10 pt-4">
              <div className="flex items-center justify-between font-mono text-xs text-slate-400">
                <span>{t.about.languages}</span>
                <span>
                  {data.source === "live"
                    ? t.about.live
                    : data.source === "cache"
                      ? t.about.cache
                      : t.about.snapshot}
                </span>
              </div>
              <div className="space-y-2">
                {languages.slice(0, 5).map((lang) => (
                  <div key={lang.language} className="space-y-1">
                    <div className="flex justify-between font-mono text-xs tabular-nums">
                      <span className="text-slate-200">{lang.language}</span>
                      <span className="text-slate-400">{lang.percent}%</span>
                    </div>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full bg-gradient-to-r from-[#0052A5] to-[#38BDF8]"
                        style={{ width: `${Math.max(6, lang.percent)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
