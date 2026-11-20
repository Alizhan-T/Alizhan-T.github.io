import {
  computeLanguageStats,
  parseProfileReadme,
  rankAndFilterRepos,
  type GitHubRepoRaw,
  type GitHubUserRaw,
  type LanguageStat,
  type ParsedReadme,
  type PortfolioProject,
} from "./githubParser";

export const GITHUB_USERNAME = "Alizhan-T";

export const CONTACT_LINKS = {
  github: `https://github.com/${GITHUB_USERNAME}`,
  telegram: "https://t.me/alizhnn",
  linkedin: "https://www.linkedin.com/in/alizhkamn",
  email: "a.toleuxan06@mail.ru",
} as const;

export interface GitHubPortfolioData {
  source: "live" | "cache" | "fallback";
  fetchedAt: number;
  profile: {
    login: string;
    name: string;
    avatarUrl: string | null;
    bio: string;
    location: string;
    education: string;
    publicRepos: number;
    followers: number;
    following: number;
    totalStars: number;
    profileUrl: string;
  };
  readme: ParsedReadme;
  languages: LanguageStat[];
  projects: PortfolioProject[];
}

const CACHE_KEY = "m5_f90_github_cache_v1";
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes

const FALLBACK_REPOS: GitHubRepoRaw[] = [
  {
    id: 1001,
    name: "FireWatch-AI",
    description:
      "Мониторинг камер Казахстана на карте, HLS-видеопотоки на iPhone и детекция огня и дыма в реальном времени на YOLOv8 + FastAPI.",
    html_url: "https://github.com/Alizhan-T/FireWatch-AI",
    homepage: null,
    language: "Swift",
    stargazers_count: 14,
    forks_count: 3,
    fork: false,
    size: 4200,
    topics: ["swiftui", "yolov8", "fastapi", "computer-vision", "mapkit"],
    updated_at: "2026-08-18T10:00:00Z",
  },
  {
    id: 1002,
    name: "Memechain",
    description:
      "Web3-платформа и смарт-контракты на Solidity для токенизации, минтинга и on-chain торговли мем-активами.",
    html_url: "https://github.com/Alizhan-T/Memechain",
    homepage: null,
    language: "Solidity",
    stargazers_count: 11,
    forks_count: 2,
    fork: false,
    size: 2850,
    topics: ["solidity", "web3", "smart-contracts", "typescript"],
    updated_at: "2026-07-12T10:00:00Z",
  },
  {
    id: 1003,
    name: "OYU-Travel",
    description:
      "Мобильное приложение для путешествий по Казахстану: авторские маршруты, интерактивная карта локаций и офлайн-гид.",
    html_url: "https://github.com/Alizhan-T/OYU-Travel",
    homepage: null,
    language: "Dart",
    stargazers_count: 9,
    forks_count: 1,
    fork: false,
    size: 3100,
    topics: ["flutter", "dart", "mobile", "travel"],
    updated_at: "2026-06-22T10:00:00Z",
  },
  {
    id: 1004,
    name: "KitchenApp",
    description:
      "Нативное iOS-приложение поиска рецептов с офлайн-избранным на Core Data, архитектурой MVVM и live-обсуждением блюд в Firebase.",
    html_url: "https://github.com/Alizhan-T/KitchenApp",
    homepage: null,
    language: "Swift",
    stargazers_count: 8,
    forks_count: 2,
    fork: false,
    size: 1940,
    topics: ["swiftui", "mvvm", "core-data", "firebase"],
    updated_at: "2026-05-14T10:00:00Z",
  },
  {
    id: 1005,
    name: "MultiverseWiki",
    description:
      "Нативный iOS-справочник по вселенной Рика и Морти: асинхронная загрузка API, поиск персонажей и офлайн-коллекция.",
    html_url: "https://github.com/Alizhan-T/MultiverseWiki",
    homepage: null,
    language: "Swift",
    stargazers_count: 7,
    forks_count: 1,
    fork: false,
    size: 1580,
    topics: ["swiftui", "core-data", "mvvm", "urlsession"],
    updated_at: "2026-04-02T10:00:00Z",
  },
  {
    id: 1006,
    name: "alizhmarket",
    description:
      "Full-stack веб-маркетплейс фермерских продуктов: личный кабинет поставщиков, каталог, корзина и оформление заказов.",
    html_url: "https://github.com/Alizhan-T/alizhmarket",
    homepage: null,
    language: "TypeScript",
    stargazers_count: 6,
    forks_count: 1,
    fork: false,
    size: 2100,
    topics: ["nodejs", "express", "mongodb", "fullstack"],
    updated_at: "2026-03-19T10:00:00Z",
  },
];

export function createFallbackPortfolioData(): GitHubPortfolioData {
  const projects = rankAndFilterRepos(FALLBACK_REPOS, GITHUB_USERNAME);
  const languages = computeLanguageStats(FALLBACK_REPOS);
  const totalStars = FALLBACK_REPOS.reduce((acc, r) => acc + r.stargazers_count, 0);

  return {
    source: "fallback",
    fetchedAt: Date.now(),
    profile: {
      login: GITHUB_USERNAME,
      name: "Alizhan Toleukhan",
      avatarUrl: null,
      bio: "iOS, Flutter, Full-Stack & Web3 Engineer. Проектирую нативные мобильные продукты, компьютерное зрение на YOLOv8/FastAPI и интерактивные WebGL-интерфейсы.",
      location: "Astana, Kazakhstan",
      education: "Astana IT University · Software Engineering",
      publicRepos: 24,
      followers: 18,
      following: 16,
      totalStars,
      profileUrl: CONTACT_LINKS.github,
    },
    readme: {
      headline: "Alizhan Toleukhan — Mobile, Full-Stack & Web3 Engineer",
      summary:
        "Студент Astana IT University. Создаю нативные iOS-приложения на SwiftUI, кроссплатформенные продукты на Flutter, CV-пайплайны на Python/FastAPI и смарт-контракты на Solidity.",
      highlights: [
        "Разработка нативных iOS-приложений (SwiftUI, MVVM, Core Data, MapKit, AVPlayer)",
        "Кроссплатформенный mobile (Flutter/Dart) и full-stack веб (TypeScript, React, Node.js, Three.js)",
        "Интеграция Computer Vision (YOLOv8, FastAPI) и Web3 смарт-контрактов (Solidity)",
        "Инженерный фокус на 60 FPS плавности, чистой архитектуре и визуальной точности",
      ],
      skills: [
        "Swift",
        "SwiftUI",
        "Flutter",
        "TypeScript",
        "React",
        "Three.js",
        "Python",
        "FastAPI",
        "YOLOv8",
        "Solidity",
        "Node.js",
        "PostgreSQL",
      ],
      education: "Astana IT University · B.Sc. Software Engineering",
    },
    languages,
    projects,
  };
}

function readCache(): GitHubPortfolioData | null {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GitHubPortfolioData;
    if (!parsed || typeof parsed.fetchedAt !== "number") return null;
    if (Date.now() - parsed.fetchedAt > CACHE_TTL_MS) return null;
    return { ...parsed, source: "cache" };
  } catch {
    return null;
  }
}

function writeCache(data: GitHubPortfolioData) {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage quota or private-mode restrictions
  }
}

async function fetchProfileReadme(): Promise<string> {
  const branches = ["main", "master"];
  for (const branch of branches) {
    try {
      const res = await fetch(
        `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${GITHUB_USERNAME}/${branch}/README.md`,
        { signal: AbortSignal.timeout(4500) },
      );
      if (res.ok) {
        return await res.text();
      }
    } catch {
      // Try next branch
    }
  }
  return "";
}

/**
 * Fetches live GitHub profile, README.md, and repositories for Alizhan-T
 * with localStorage caching and seamless fallback on API rate-limit or offline.
 */
export async function loadGitHubPortfolio(): Promise<GitHubPortfolioData> {
  const cached = readCache();
  if (cached) return cached;

  const fallback = createFallbackPortfolioData();

  try {
    const [userRes, reposRes, readmeMd] = await Promise.all([
      fetch(`https://api.github.com/users/${GITHUB_USERNAME}`, {
        headers: { Accept: "application/vnd.github+json" },
        signal: AbortSignal.timeout(5000),
      }),
      fetch(
        `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`,
        {
          headers: { Accept: "application/vnd.github+json" },
          signal: AbortSignal.timeout(5000),
        },
      ),
      fetchProfileReadme(),
    ]);

    if (!userRes.ok || !reposRes.ok) {
      return fallback;
    }

    const user = (await userRes.json()) as GitHubUserRaw;
    const repos = (await reposRes.json()) as GitHubRepoRaw[];
    const parsedReadme = parseProfileReadme(readmeMd);

    // Rank real repos; if user has fewer than 4 non-empty repos, supplement with featured entries
    const liveProjects = rankAndFilterRepos(repos, GITHUB_USERNAME);
    const mergedProjects = [...liveProjects];
    const existingNames = new Set(liveProjects.map((p) => p.name.toLowerCase()));
    for (const fp of fallback.projects) {
      if (mergedProjects.length >= 8) break;
      if (!existingNames.has(fp.name.toLowerCase()) && fp.featured) {
        mergedProjects.push(fp);
      }
    }
    mergedProjects.sort((a, b) => b.priorityScore - a.priorityScore);

    const liveLanguages = computeLanguageStats(repos);
    const totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);

    const result: GitHubPortfolioData = {
      source: "live",
      fetchedAt: Date.now(),
      profile: {
        login: user.login || GITHUB_USERNAME,
        name: user.name?.trim() || "Alizhan Toleukhan",
        avatarUrl: user.avatar_url || null,
        bio: user.bio?.trim() || parsedReadme.summary || fallback.profile.bio,
        location: user.location?.trim() || fallback.profile.location,
        education:
          parsedReadme.education ||
          user.company?.trim() ||
          fallback.profile.education,
        publicRepos: user.public_repos ?? liveProjects.length,
        followers: user.followers ?? 0,
        following: user.following ?? 0,
        totalStars,
        profileUrl: user.html_url || CONTACT_LINKS.github,
      },
      readme: {
        headline: parsedReadme.headline || fallback.readme.headline,
        summary: parsedReadme.summary || user.bio?.trim() || fallback.readme.summary,
        highlights:
          parsedReadme.highlights.length > 0
            ? parsedReadme.highlights
            : fallback.readme.highlights,
        skills:
          parsedReadme.skills.length >= 4
            ? parsedReadme.skills
            : fallback.readme.skills,
        education: parsedReadme.education || fallback.readme.education,
      },
      languages: liveLanguages.length > 0 ? liveLanguages : fallback.languages,
      projects: mergedProjects,
    };

    writeCache(result);
    return result;
  } catch {
    return fallback;
  }
}
