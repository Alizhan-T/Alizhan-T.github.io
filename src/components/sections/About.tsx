import { Smartphone, Layers3, Database, Cpu } from "lucide-react";
import { motion } from "framer-motion";
import { telemetryStats } from "../../data/portfolio";
import { Eyebrow } from "./Hero";

const stackBadges = [
  { name: "Swift / SwiftUI", role: "iOS Native", color: "#F05138" },
  { name: "Python / YOLOv8", role: "AI & CV", color: "#387EB8" },
  { name: "Node.js / TS", role: "Backend", color: "#689F63" },
  { name: "Flutter / Dart", role: "Cross-Platform", color: "#47C5FB" },
  { name: "Solidity", role: "Web3", color: "#A1A1AA" },
  { name: "Docker / CI", role: "DevOps", color: "#2396ED" },
] as const;

export default function About() {
  return (
    <section
      id="about"
      className="detail-section about section-frame"
      aria-labelledby="about-title"
    >
      <motion.div
        className="content-pane"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      >
        <Eyebrow number="02" name="ABOUT // ENGINEERING PROFILE" />
        <h2 id="about-title">
          Обо мне<span>.</span>
        </h2>
        <p className="lead">
          Я Алижан — разработчик из Астаны (Astana IT University), создаю
          быстрые iOS-приложения и прикладные инструменты.
        </p>
        <p className="muted">
          В <b>FireWatch-AI</b> я соединил карту Казахстана с живыми
          HLS-потоками и детекцией огня/дыма на YOLOv8, в <b>KitchenApp</b>{" "}
          выстроил офлайн-хранилище на Core Data + Firebase, а в <b>jas-crm</b>{" "}
          автоматизировал ежедневную работу образовательных кураторов.
        </p>

        <div className="telemetry-grid" aria-label="Ключевые показатели">
          {telemetryStats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              className="telemetry-stat"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: idx * 0.07 }}
            >
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </motion.div>
          ))}
        </div>

        <div className="skills">
          {[
            {
              Icon: Smartphone,
              name: "Native iOS & SwiftUI",
              tags: "Swift · SwiftUI · AVPlayer · MapKit · Core Data · MVVM",
            },
            {
              Icon: Cpu,
              name: "Computer Vision & AI",
              tags: "Python · FastAPI · YOLOv8 · HLS Stream Probing",
            },
            {
              Icon: Layers3,
              name: "Full-Stack & CRM",
              tags: "TypeScript · Next.js · Node.js · Express · Telegram Bots",
            },
            {
              Icon: Database,
              name: "Data & Cloud Infrastructure",
              tags: "MongoDB · Firebase · Docker · GitHub Actions CI",
            },
          ].map(({ Icon, name, tags }) => (
            <div key={name} className="skill-row">
              <Icon size={19} />
              <span>
                <b>{name}</b>
                <small>{tags}</small>
              </span>
            </div>
          ))}
        </div>

        <div className="stack-wave-strip" aria-label="Технологический стек">
          {stackBadges.map((item, i) => (
            <div
              key={item.name}
              className="stack-wave-chip"
              style={
                {
                  "--chip-color": item.color,
                  "--wave-delay": `${i * 0.85}s`,
                } as React.CSSProperties
              }
            >
              <i className="chip-dot" />
              <div>
                <strong>{item.name}</strong>
                <small>{item.role}</small>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
