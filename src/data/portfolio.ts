export const contact = {
  github: "https://github.com/Alizhan-T",
  telegram: "https://t.me/alizhnn",
  linkedin: "https://www.linkedin.com/in/alizhkamn",
  email: "" as string,
};

export const sections = [
  { id: "hero", label: "Главная", code: "HERO", camera: "FRONT ¾" },
  { id: "about", label: "Обо мне", code: "ABOUT", camera: "WHEEL DETAIL" },
  { id: "projects", label: "Проекты", code: "PROJECTS", camera: "HIGH ANGLE" },
  { id: "contact", label: "Контакты", code: "CONTACT", camera: "REAR ¾" },
] as const;

export const finishes = [
  {
    name: "Frozen Black",
    paint: "#1b1d20",
    accent: "#f1b85b",
    sample: "#212225",
  },
  {
    name: "Marina Bay Blue",
    paint: "#0d4288",
    accent: "#7ab6ff",
    sample: "#264b82",
  },
  {
    name: "Donington Grey",
    paint: "#777a79",
    accent: "#ccced0",
    sample: "#9a9b9d",
  },
  {
    name: "Isle of Man Green",
    paint: "#0d5944",
    accent: "#6dccab",
    sample: "#28594c",
  },
] as const;

export const telemetryStats = [
  { value: "15", label: "PUBLIC REPOS" },
  { value: "30+", label: "MERGED PRs" },
  { value: "4 KZ", label: "LIVE HLS CITIES" },
  { value: "AITU", label: "ASTANA · UTC+5" },
] as const;

export const projects = [
  {
    id: "fire",
    name: "FireWatch-AI",
    category: "Computer Vision · Native iOS",
    metric: "→ 9/9 CI-verified live HLS feeds across 4 KZ cities",
    description:
      "Нативное iOS-приложение с картой камер Казахстана, проверкой .m3u8 потоков в реальном времени и сервером FastAPI + YOLOv8 для детекции огня и дыма.",
    tags: ["SwiftUI", "AVPlayer", "MapKit", "FastAPI", "YOLOv8"],
    url: contact.github + "/FireWatch-AI",
  },
  {
    id: "kitchen",
    name: "KitchenApp",
    category: "Mobile Product · iOS",
    metric: "→ Offline-first Core Data + Firebase realtime sync",
    description:
      "Мобильное приложение рецептов на SwiftUI (MVVM): debounced-поиск, пагинация, сохранение в офлайн через Core Data и живой чат на Firebase.",
    tags: ["SwiftUI", "MVVM", "Core Data", "Firebase"],
    url: contact.github + "/KitchenApp",
  },
  {
    id: "market",
    name: "ALIZHMARKET",
    category: "Full-Stack · E-Commerce",
    metric: "→ Role-based Farmer & Buyer order pipeline",
    description:
      "Ролевой агро-маркетплейс для фермеров и покупателей: авторизация, публикация товаров, управление корзиной и полный цикл обработки заказов.",
    tags: ["Node.js", "Express", "MongoDB", "EJS"],
    url: contact.github + "/alizhmarket",
  },
] as const;

export const moreProjects = [
  {
    name: "jas-crm",
    badge: "PRIVATE · PROD",
    stack: "Full-Stack · CRM · Telegram",
    summary:
      "Ежедневная мобильная и веб-CRM для кураторов: посещаемость, расписания, KPI и авто-выгрузки в Excel/Telegram.",
    url: contact.github,
  },
  {
    name: "MultiverseWiki",
    badge: "PUBLIC · iOS QA",
    stack: "Swift · Unit Tests · ADR",
    summary:
      "iOS-приложение с мгновенным поиском, офлайн-избранным, архитектурной документацией (ADR) и автотестами.",
    url: contact.github + "/MultiverseWiki",
  },
  {
    name: "SmartCampus",
    badge: "PUBLIC · iOS",
    stack: "Swift · SwiftUI · OOP",
    summary:
      "Ролевая система контроля доступа в кампус с доменной моделью и нативным интерфейсом на SwiftUI.",
    url: contact.github + "/SmartCampus",
  },
  {
    name: "weather-ios",
    badge: "PUBLIC · iOS",
    stack: "Swift · Firebase · REST",
    summary:
      "Погодный iOS-клиент с живыми прогнозами, избранными городами и облачной синхронизацией через Firebase.",
    url: contact.github + "/weather-ios",
  },
  {
    name: "swift-coursework",
    badge: "PUBLIC · SWIFT",
    stack: "Swift · Architecture · CLI/UI",
    summary:
      "Консолидированный сборник модулей на Swift: менеджер студентов, трекер задач и система контактов.",
    url: contact.github + "/swift-coursework",
  },
] as const;

export type Project = (typeof projects)[number];

export type SceneSettings = {
  finish: number;
  headlights: boolean;
  hazards: boolean;
  inspect: boolean;
  brake: boolean;
};
