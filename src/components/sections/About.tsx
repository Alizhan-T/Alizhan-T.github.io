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
          Я Алижан, iOS и Full-Stack разработчик из Астаны.
        </p>
        <p className="muted">
          В FireWatch-AI я соединил карту с видеопотоками, в KitchenApp добавил
          офлайн-избранное, а для ALIZHMARKET собрал путь от карточки товара до
          заказа.
        </p>
        <div className="skills">
          {[
            {
              Icon: Smartphone,
              name: "iOS",
              tags: "Swift · SwiftUI · MapKit · Core Data",
            },
            {
              Icon: Layers3,
              name: "Backend",
              tags: "Node.js · Express · Python · FastAPI",
            },
            {
              Icon: Database,
              name: "Данные и ML",
              tags: "MongoDB · Firebase · YOLOv8",
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
