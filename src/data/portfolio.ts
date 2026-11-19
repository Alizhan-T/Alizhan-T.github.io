export const contact = {
  github: "https://github.com/Alizhan-T",
  telegram: "https://t.me/alizhnn",
  linkedin: "https://www.linkedin.com/in/alizhkamn",
  handle: "@alizhnn",
};

export const finishes = [
  {
    name: "Frozen Black",
    paint: "#1b1d20",
    accent: "#e6c29f",
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
    accent: "#d4d4d8",
    sample: "#9a9b9d",
  },
  {
    name: "Isle of Man Green",
    paint: "#0d5944",
    accent: "#6dccab",
    sample: "#28594c",
  },
] as const;

export const coreStack = [
  "Swift",
  "SwiftUI",
  "AVPlayer",
  "MapKit",
  "Core Data",
  "Python",
  "FastAPI",
  "YOLOv8",
  "TypeScript",
  "Node.js",
  "Flutter",
  "Docker",
] as const;

export const allProjects = [
  {
    id: "firewatch",
    name: "FireWatch-AI",
    badge: "PUBLIC · iOS + AI",
    badgeColor: "#e6c29f",
    description:
      "Нативное iOS-приложение с картой камер Казахстана, проверкой живых .m3u8 потоков и сервером FastAPI + YOLOv8 для детекции огня и дыма.",
    metric: "→ 9/9 проверенных live HLS-потоков в 4 городах КЗ",
    tags: ["SwiftUI", "AVPlayer", "MapKit", "FastAPI", "YOLOv8"],
    url: "https://github.com/Alizhan-T/FireWatch-AI",
  },
  {
    id: "jas-crm",
    name: "jas-crm",
    badge: "PRIVATE · PRODUCTION",
    badgeColor: "#818cf8",
    description:
      "Ежедневная веб и мобильная CRM для образовательных кураторов: расписания, учёт посещаемости, чаты и аналитика KPI.",
    metric: "→ Авто-выгрузка отчётов в Excel и Telegram-бот",
    tags: ["Full-Stack", "CRM", "Analytics", "Telegram API"],
    url: "https://github.com/Alizhan-T",
  },
  {
    id: "kitchen",
    name: "KitchenApp",
    badge: "PUBLIC · iOS APP",
    badgeColor: "#22c55e",
    description:
      "Мобильное приложение рецептов на SwiftUI (MVVM): debounced-поиск, пагинация, сохранение избранного без интернета и живые обсуждения.",
    metric: "→ Offline-first Core Data + синхронизация Firebase",
    tags: ["SwiftUI", "MVVM", "Core Data", "Firebase"],
    url: "https://github.com/Alizhan-T/KitchenApp",
  },
  {
    id: "market",
    name: "ALIZHMARKET",
    badge: "PUBLIC · FULL-STACK",
    badgeColor: "#e6c29f",
    description:
      "Ролевой маркетплейс фермерских продуктов: личные кабинеты продавца и покупателя, каталог, корзина и обработка заказов.",
    metric: "→ Полный цикл заказа Фермер → Покупатель",
    tags: ["Node.js", "Express", "MongoDB", "EJS"],
    url: "https://github.com/Alizhan-T/alizhmarket",
  },
  {
    id: "multiverse",
    name: "MultiverseWiki",
    badge: "PUBLIC · iOS & QA",
    badgeColor: "#38bdf8",
    description:
      "iOS-приложение с мгновенным поиском, офлайн-базой, архитектурной документацией (ADR), QA-логами и набором автотестов.",
    metric: "→ Чистая архитектура + покрытие Unit-тестами",
    tags: ["Swift", "Unit Tests", "Offline Storage", "ADR"],
    url: "https://github.com/Alizhan-T/MultiverseWiki",
  },
  {
    id: "smartcampus",
    name: "SmartCampus & weather-ios",
    badge: "PUBLIC · SWIFTUI",
    badgeColor: "#a78bfa",
    description:
      "Ролевая система контроля доступа в кампус на SwiftUI и погодный iOS-клиент с живыми прогнозами и синхронизацией через Firebase.",
    metric: "→ ООП доменная модель доступа + нативный UI",
    tags: ["Swift", "SwiftUI", "Firebase", "OOP"],
    url: "https://github.com/Alizhan-T/SmartCampus",
  },
] as const;

export type SceneSettings = {
  finish: number;
  headlights: boolean;
  hazards: boolean;
  inspect: boolean;
  brake: boolean;
};
