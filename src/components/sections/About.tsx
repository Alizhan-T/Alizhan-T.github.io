import { Smartphone, Layers3, Database } from "lucide-react";
import { Eyebrow } from "./Hero";
export default function About() {
  return (
    <section
      id="about"
      className="detail-section about section-frame"
      aria-labelledby="about-title"
    >
      <div className="content-pane">
        <Eyebrow number="02" name="ABOUT" />
        <h2 id="about-title">
          Обо мне<span>.</span>
        </h2>
        <p className="lead">
          Я Алижан — iOS и Full-Stack разработчик из Астаны (Astana IT
          University).
        </p>
        <p className="muted">
          В FireWatch-AI соединил карту Казахстана с live HLS-потоками и
          YOLOv8, в KitchenApp построил офлайн-хранилище на Core Data +
          Firebase, а также разработал CRM-систему jas-crm и маркетплейс
          ALIZHMARKET.
        </p>
        <div className="skills">
          {[
            {
              Icon: Smartphone,
              name: "iOS & Mobile",
              tags: "Swift · SwiftUI · AVPlayer · MapKit · Core Data · MVVM",
            },
            {
              Icon: Layers3,
              name: "Backend & Web",
              tags: "Node.js · Express · TypeScript · Python · FastAPI",
            },
            {
              Icon: Database,
              name: "Данные, CV и DevOps",
              tags: "YOLOv8 · MongoDB · Firebase · Docker · Git CI",
            },
          ].map(({ Icon, name, tags }) => (
            <div key={name}>
              <Icon size={19} />
              <span>
                <b>{name}</b>
                <small>{tags}</small>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
