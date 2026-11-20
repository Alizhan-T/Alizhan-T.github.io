export const contact = {
  github: "https://github.com/Alizhan-T",
  telegram: "https://t.me/alizhnn",
  linkedin: "https://www.linkedin.com/in/alizhkamn",
  email: "a.toleuxan06@mail.ru",
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
    category: "Computer Vision / Native iOS",
    description:
      "Камеры Казахстана на карте и просмотр HLS-потоков на iPhone. Дополнительный сервис анализирует кадры на признаки огня и дыма.",
    tags: ["SwiftUI", "AVPlayer", "MapKit", "FastAPI", "YOLOv8"],
    url: contact.github + "/FireWatch-AI",
  },
  {
    id: "kitchen",
    name: "KitchenApp",
    category: "Mobile Product / iOS",
    description:
      "Поиск рецептов, избранное без интернета и обсуждение блюд в реальном времени.",
    tags: ["SwiftUI", "MVVM", "Core Data", "Firebase"],
    url: contact.github + "/KitchenApp",
  },
  {
    id: "wiki",
    name: "MultiverseWiki",
    category: "Native iOS / Character Guide",
    description:
      "Справочник по вселенной «Рика и Морти». Поиск персонажей по имени и избранное, доступное без сети.",
    tags: ["SwiftUI", "Core Data", "MVVM", "URLSession"],
    url: contact.github + "/MultiverseWiki",
  },
  {
    id: "market",
    name: "ALIZHMARKET",
    category: "Full-Stack / Web",
    description:
      "Фермеры ведут каталог и собирают заказы. Покупатели выбирают продукты и оформляют корзину.",
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
