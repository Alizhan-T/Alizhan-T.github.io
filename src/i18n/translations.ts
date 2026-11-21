export type Lang = "en" | "ru";

export interface Dict {
  skipToContent: string;
  nav: { hero: string; about: string; stack: string; projects: string; contact: string; getInTouch: string; openMenu: string; closeMenu: string; replay: string; primary: string; mobile: string; language: string };
  intro: { loading: string; skip: string; label: string };
  hero: { kicker: string; lead: string; viewProjects: string; aboutStack: string };
  about: { label: string; title: string; focus: string; repos: string; stars: string; followers: string; p2pTitle: string; p2pText: string; languages: string; live: string; cache: string; snapshot: string; openProfile: string; highlights: string[]; summary: string };
  stack: { hintIdle: string; hintPaused: string; roles: Record<string, string>; focus: string };
  projects: { label: string; title: string; filterLabel: string; all: string; loading: string; empty: string; showAll: string; demo: string; code: string; viewCode: string; categories: Record<string, string> };
  contact: { label: string; title: string; text: string; copied: string; mail: string; footerNote: string; modelLead: string; modelBy: string; modelUnder: string };
}

export const DICT: Record<Lang, Dict> = {
  en: {
    skipToContent: "Skip to content",
    nav: { hero: "Hero", about: "About", stack: "Stack", projects: "Projects", contact: "Contact", getInTouch: "Get in Touch", openMenu: "Open menu", closeMenu: "Close menu", replay: "Replay Intro", primary: "Primary navigation", mobile: "Mobile navigation", language: "Language" },
    intro: { loading: "LOADING", skip: "SKIP", label: "Intro animation" },
    hero: { kicker: "iOS, Full-Stack & Web3 Engineer · Astana, KZ", lead: "", viewProjects: "View Projects", aboutStack: "About & Stack" },
    about: { label: "01. About", title: "About & Experience", focus: "Engineering Focus", repos: "Repositories", stars: "Total Stars", followers: "Followers", p2pTitle: "P2P Trading & Crypto", p2pText: "Hands-on experience in P2P crypto markets and USDT liquidity operations — focused on operational discipline, market analytics, and risk management.", languages: "Repository Languages", live: "GitHub API", cache: "GitHub Cached", snapshot: "Synced Snapshot", openProfile: "Open GitHub profile", highlights: [], summary: "" },
    stack: { hintIdle: "Click a card to pause", hintPaused: "Paused · click the card again to resume", roles: {}, focus: "Focus" },
    projects: { label: "03. Selected Works · GitHub Alizhan-T", title: "Selected Projects", filterLabel: "Filter projects by discipline", all: "All", loading: "Loading Alizhan-T repositories from GitHub API...", empty: "No public repositories in this category yet.", showAll: "Show all projects", demo: "Demo", code: "Code", viewCode: "View source code on GitHub", categories: {} },
    contact: { label: "04. Contact", title: "Let's build together", text: "Open to engineering opportunities across iOS (SwiftUI), cross-platform mobile (Flutter), Full-Stack, Web3, AI/CV, and interactive 3D/WebGL products.", copied: "Copied", mail: "Mail", footerNote: "BMW M5 F90 · Astana, KZ", modelLead: "3D model", modelBy: "by", modelUnder: "licensed under" },
  },
  ru: {
    skipToContent: "Перейти к содержимому",
    nav: { hero: "Главная", about: "Обо мне", stack: "Стек", projects: "Проекты", contact: "Контакты", getInTouch: "Связаться", openMenu: "Открыть меню", closeMenu: "Закрыть меню", replay: "Повторить интро", primary: "Основная навигация", mobile: "Мобильная навигация", language: "Язык" },
    intro: { loading: "ЗАГРУЗКА", skip: "ПРОПУСТИТЬ", label: "Анимация-интро" },
    hero: { kicker: "iOS, Full-Stack и Web3 инженер · Астана, KZ", lead: "iOS и Full-Stack разработка · создаю ИИ-инструменты и нативные приложения", viewProjects: "Смотреть проекты", aboutStack: "Обо мне и стек" },
    about: { label: "01. Обо мне", title: "Обо мне и опыт", focus: "Чем занимаюсь", repos: "Репозитории", stars: "Звёзды", followers: "Подписчики", p2pTitle: "P2P-трейдинг и крипто", p2pText: "Практический опыт на P2P-рынках криптовалют и операциях с ликвидностью USDT: операционная дисциплина, рыночная аналитика и управление рисками.", languages: "Языки в репозиториях", live: "GitHub API", cache: "Кэш GitHub", snapshot: "Сохранённый снимок", openProfile: "Открыть профиль GitHub", summary: "iOS и Full-Stack разработка · создаю ИИ-инструменты и нативные приложения", highlights: ["Нативная iOS-разработка (SwiftUI, MVVM, Core Data, MapKit, AVPlayer)", "Кроссплатформенная мобильная разработка (Flutter/Dart) и full-stack веб (TypeScript, React, Node.js, Three.js)", "Пайплайны компьютерного зрения (YOLOv8, FastAPI) и Web3-смарт-контракты (Solidity)", "Упор на плавные 60 FPS, чистую архитектуру и визуальную точность"] },
    stack: { hintIdle: "Нажмите на карточку, чтобы остановить", hintPaused: "Пауза · нажмите на карточку ещё раз, чтобы продолжить", roles: { python: "ИИ · CV", swift: "iOS", nodejs: "БЭКЕНД", flutter: "МОБАЙЛ", solidity: "WEB3", docker: "DEVOPS" }, focus: "Выбрать" },
    projects: { label: "03. Избранные работы · GitHub Alizhan-T", title: "Избранные проекты", filterLabel: "Фильтр проектов по направлению", all: "Все", loading: "Загружаю репозитории Alizhan-T из GitHub API...", empty: "В этой категории пока нет публичных репозиториев.", showAll: "Показать все проекты", demo: "Демо", code: "Код", viewCode: "Открыть исходный код на GitHub", categories: { "AI & Vision": "ИИ и CV", "Web3 & Blockchain": "Web3 и блокчейн", "Mobile (iOS / Flutter)": "Мобильные", "Full-Stack Web": "Full-Stack веб" } },
    contact: { label: "04. Контакты", title: "Давайте создавать вместе", text: "Открыт к инженерным предложениям: iOS (SwiftUI), кроссплатформенная мобильная разработка (Flutter), Full-Stack, Web3, ИИ/CV и интерактивные 3D/WebGL-продукты.", copied: "Скопировано", mail: "Почта", footerNote: "BMW M5 F90 · Астана, KZ", modelLead: "3D-модель", modelBy: "автор", modelUnder: "лицензия" },
  },
};

/** Russian descriptions for known repositories (others keep their GitHub description) */
export const RU_PROJECT_DESCRIPTIONS: Record<string, string> = {
  "FireWatch-AI": "Нативная iOS-карта камер и живой HLS-просмотр по Казахстану с опциональным обнаружением огня и дыма на FastAPI + YOLOv8.",
  Memechain: "Web3-платформа и смарт-контракты на Solidity для токенизации, выпуска и торговли мем-активами в блокчейне.",
  "OYU-Travel": "Кроссплатформенное приложение для путешествий по Казахстану: маршруты, интерактивные карты и офлайн-гид.",
  KitchenApp: "Нативное iOS-приложение с рецептами: офлайн-избранное на Core Data, архитектура MVVM и обсуждения блюд в Firebase.",
  MultiverseWiki: "Нативный iOS-справочник «Рика и Морти»: асинхронные запросы к API, поиск персонажей и офлайн-коллекция.",
  alizhmarket: "Full-stack веб-маркетплейс «от фермера к покупателю»: кабинеты продавцов, каталог, корзина и оформление заказов.",
};

export function detectInitialLang(): Lang {
  try {
    const saved = window.localStorage.getItem("m5_lang");
    if (saved === "en" || saved === "ru") return saved;
  } catch {
    // ignore storage errors
  }
  const nav = (navigator.languages?.[0] ?? navigator.language ?? "en").toLowerCase();
  return /^(ru|kk|be|uk)/.test(nav) ? "ru" : "en";
}
