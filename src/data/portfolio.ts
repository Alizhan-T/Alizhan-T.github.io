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
export const projects = [
  {
    id: "fire",
    name: "FireWatch-AI",
    category: "Computer vision / iOS",
    description:
      "Карта камер Казахстана с видеопотоками и модулем распознавания огня и дыма.",
    tags: ["SwiftUI", "MapKit", "YOLOv8", "FastAPI"],
    url: contact.github + "/FireWatch-AI",
  },
  {
    id: "kitchen",
    name: "KitchenApp",
    category: "Mobile / iOS",
    description:
      "Поиск рецептов, избранное без интернета и обсуждения блюд в приложении.",
    tags: ["SwiftUI", "Core Data", "Firebase"],
    url: contact.github + "/KitchenApp",
  },
  {
    id: "market",
    name: "ALIZHMARKET",
    category: "Full-stack / Web",
    description:
      "Маркетплейс фермерских продуктов с корзиной и обработкой заказов для продавца.",
    tags: ["Node.js", "Express", "MongoDB", "EJS"],
    url: contact.github + "/alizhmarket",
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
