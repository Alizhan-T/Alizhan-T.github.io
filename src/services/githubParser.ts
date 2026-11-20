export interface GitHubUserRaw {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  company: string | null;
  location: string | null;
  blog: string | null;
  public_repos: number;
  followers: number;
  following: number;
  html_url: string;
  created_at: string;
}

export interface GitHubRepoRaw {
  id: number;
  name: string;
  full_name?: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  fork: boolean;
  archived?: boolean;
  size: number;
  topics?: string[];
  updated_at: string;
  pushed_at?: string;
}

export interface ParsedReadme {
  headline: string | null;
  summary: string | null;
  highlights: string[];
  skills: string[];
  education: string | null;
}

export interface LanguageStat {
  language: string;
  count: number;
  percent: number;
}

export interface PortfolioProject {
  id: string;
  name: string;
  description: string;
  category: "AI & Vision" | "Web3 & Blockchain" | "Mobile (iOS / Flutter)" | "Full-Stack Web";
  language: string;
  stars: number;
  forks: number;
  tags: string[];
  repoUrl: string;
  demoUrl: string | null;
  updatedAt: string;
  featured: boolean;
  priorityScore: number;
}

const FEATURED_PATTERNS: ReadonlyArray<{
  match: RegExp;
  boost: number;
  category: PortfolioProject["category"];
  fallbackDesc: string;
  extraTags: string[];
}> = [
  {
    match: /firewatch/i,
    boost: 100,
    category: "AI & Vision",
    fallbackDesc:
      "Мониторинг камер Казахстана на карте, HLS-видеопотоки на iPhone и серверный детектор огня и дыма на YOLOv8 + FastAPI.",
    extraTags: ["SwiftUI", "FastAPI", "YOLOv8", "MapKit", "AVPlayer"],
  },
  {
    match: /memechain/i,
    boost: 95,
    category: "Web3 & Blockchain",
    fallbackDesc:
      "Децентрализованная Web3-платформа и смарт-контракты для создания, минтинга и обмена мем-активами в блокчейне.",
    extraTags: ["Solidity", "Web3", "Smart Contracts", "TypeScript"],
  },
  {
    match: /oyu|travel/i,
    boost: 92,
    category: "Mobile (iOS / Flutter)",
    fallbackDesc:
      "Мобильный сервис для путешествий по Казахстану: маршруты, интерактивные точки, гиды и кроссплатформенный UX.",
    extraTags: ["Flutter", "Dart", "Maps", "Mobile"],
  },
  {
    match: /kitchen/i,
    boost: 84,
    category: "Mobile (iOS / Flutter)",
    fallbackDesc:
      "Нативное iOS-приложение рецептов с офлайн-избранным на Core Data, архитектурой MVVM и обсуждением блюд в реальном времени.",
    extraTags: ["SwiftUI", "MVVM", "Core Data", "Firebase"],
  },
  {
    match: /multiverse|wiki/i,
    boost: 78,
    category: "Mobile (iOS / Flutter)",
    fallbackDesc:
      "Нативный iOS-справочник по вселенной Рика и Морти с мгновенным поиском, кэшированием и офлайн-режимом.",
    extraTags: ["SwiftUI", "Core Data", "URLSession", "MVVM"],
  },
  {
    match: /alizhmarket|market/i,
    boost: 75,
    category: "Full-Stack Web",
    fallbackDesc:
      "Full-stack маркетплейс фермерских продуктов: управление каталогом, корзина и обработка заказов.",
    extraTags: ["Node.js", "Express", "MongoDB", "REST API"],
  },
];

function stripMarkdown(input: string): string {
  return input
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/[`*_~#>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extracts structured bio highlights, education, and skill keywords
 * from a GitHub profile README.md while stripping badges and HTML clutter.
 */
export function parseProfileReadme(markdown: string): ParsedReadme {
  if (!markdown || !markdown.trim()) {
    return {
      headline: null,
      summary: null,
      highlights: [],
      skills: [],
      education: null,
    };
  }

  const lines = markdown.split(/\r?\n/);
  let headline: string | null = null;
  let summary: string | null = null;
  let education: string | null = null;
  const highlights: string[] = [];
  const skillSet = new Set<string>();

  const knownSkills = [
    "Swift",
    "SwiftUI",
    "Flutter",
    "Dart",
    "TypeScript",
    "React",
    "Next.js",
    "Three.js",
    "Node.js",
    "Python",
    "FastAPI",
    "YOLOv8",
    "Solidity",
    "Web3",
    "PostgreSQL",
    "MongoDB",
    "Firebase",
    "Docker",
    "Go",
    "Kotlin",
  ];

  for (const skill of knownSkills) {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (new RegExp(`\\b${escaped}\\b`, "i").test(markdown)) {
      skillSet.add(skill);
    }
  }

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;
    // Skip badge-only lines or HTML comment blocks
    if (/^(\[!\[|!\[|<img|<p|<div|<a |<!--|---)/i.test(trimmed)) continue;

    if (!headline && /^#{1,2}\s+/.test(trimmed)) {
      const cleaned = stripMarkdown(trimmed);
      if (cleaned.length >= 4 && cleaned.length <= 120) {
        headline = cleaned;
      }
      continue;
    }

    if (/^[-*•]\s+/.test(trimmed)) {
      const cleaned = stripMarkdown(trimmed.replace(/^[-*•]\s+/, ""));
      if (cleaned.length >= 10 && cleaned.length <= 180) {
        if (!education && /university|aitu|astana it|b\.sc|degree|студент|университет/i.test(cleaned)) {
          education = cleaned;
        }
        if (highlights.length < 5) {
          highlights.push(cleaned);
        }
      }
      continue;
    }

    if (!summary && !trimmed.startsWith("#")) {
      const cleaned = stripMarkdown(trimmed);
      if (cleaned.length >= 24 && cleaned.length <= 280) {
        summary = cleaned;
        if (!education && /university|aitu|astana it/i.test(cleaned)) {
          education = cleaned;
        }
      }
    }
  }

  return {
    headline,
    summary,
    highlights,
    skills: Array.from(skillSet),
    education,
  };
}

function inferCategory(repo: GitHubRepoRaw): PortfolioProject["category"] {
  const hay = `${repo.name} ${repo.description ?? ""} ${(repo.topics ?? []).join(" ")} ${repo.language ?? ""}`.toLowerCase();
  if (/\b(solidity|web3|blockchain|ethereum|hardhat|dapp|smart.?contract|defi|memechain)\b/.test(hay)) {
    return "Web3 & Blockchain";
  }
  if (/\b(yolo|yolov8|ai|ml|computer.?vision|fastapi|pytorch|neural|llm|firewatch)\b/.test(hay)) {
    return "AI & Vision";
  }
  if (/\b(swift|swiftui|ios|flutter|dart|kotlin|xcode|mobile|iphone|android)\b/.test(hay)) {
    return "Mobile (iOS / Flutter)";
  }
  return "Full-Stack Web";
}

/**
 * Filters out empty/unmodified forks and profile repos, then ranks repositories
 * with featured priority projects (FireWatch-AI, Memechain, OYU Travel, etc.) first.
 */
export function rankAndFilterRepos(
  repos: ReadonlyArray<GitHubRepoRaw>,
  username = "Alizhan-T",
): PortfolioProject[] {
  const lowerUser = username.toLowerCase();

  const filtered = repos.filter((r) => {
    const lowerName = r.name.toLowerCase();
    // Skip profile README repo & github.io site itself
    if (lowerName === lowerUser || lowerName === `${lowerUser}.github.io`) {
      return false;
    }
    // Filter out empty or unmodified forks
    if (r.fork && r.stargazers_count === 0 && !r.description) {
      return false;
    }
    if (r.size === 0 && !r.description) {
      return false;
    }
    if (r.archived) {
      return false;
    }
    return true;
  });

  const mapped: PortfolioProject[] = filtered.map((repo) => {
    const matched = FEATURED_PATTERNS.find((p) => p.match.test(repo.name));
    const category = matched ? matched.category : inferCategory(repo);

    const tagSet = new Set<string>();
    if (repo.language) tagSet.add(repo.language);
    if (repo.topics) {
      for (const t of repo.topics.slice(0, 4)) tagSet.add(t);
    }
    if (matched) {
      for (const t of matched.extraTags) tagSet.add(t);
    }

    const recencyBonus = Math.max(
      0,
      20 -
        Math.floor(
          (Date.now() - new Date(repo.updated_at).getTime()) /
            (1000 * 60 * 60 * 24 * 60),
        ),
    );
    const priorityScore =
      (matched ? matched.boost : 0) +
      repo.stargazers_count * 8 +
      repo.forks_count * 4 +
      (repo.description ? 6 : 0) +
      recencyBonus;

    return {
      id: `${repo.id}-${repo.name}`,
      name: repo.name,
      description:
        repo.description?.trim() ||
        matched?.fallbackDesc ||
        `Инженерный проект на ${repo.language ?? "современном стеке"} в репозитории ${repo.name}.`,
      category,
      language: repo.language ?? "Multi-Stack",
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      tags: Array.from(tagSet).slice(0, 5),
      repoUrl: repo.html_url,
      demoUrl: repo.homepage && repo.homepage.trim().startsWith("http")
        ? repo.homepage.trim()
        : null,
      updatedAt: repo.updated_at,
      featured: Boolean(matched),
      priorityScore,
    };
  });

  return mapped.sort((a, b) => b.priorityScore - a.priorityScore);
}

/**
 * Computes top programming language share across non-fork repositories.
 */
export function computeLanguageStats(
  repos: ReadonlyArray<GitHubRepoRaw>,
  limit = 6,
): LanguageStat[] {
  const counts = new Map<string, number>();
  let total = 0;

  for (const r of repos) {
    if (r.fork || !r.language) continue;
    counts.set(r.language, (counts.get(r.language) ?? 0) + 1);
    total++;
  }

  if (total === 0) return [];

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([language, count]) => ({
      language,
      count,
      percent: Math.round((count / total) * 100),
    }));
}
