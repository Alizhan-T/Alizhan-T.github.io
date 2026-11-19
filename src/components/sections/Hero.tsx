import { Grid2X2, Send, Mouse, Crosshair, Github } from "lucide-react";
import { motion } from "framer-motion";
import { contact } from "../../data/portfolio";

export function Eyebrow({ number, name }: { number: string; name: string }) {
  return (
    <div className="eyebrow">
      <b>{number}</b>
      <i /> <span>{name}</span>
    </div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.11,
      delayChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.68, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function Hero({ navigate }: { navigate: (i: number) => void }) {
  return (
    <section
      className="hero section-frame"
      id="hero"
      aria-labelledby="hero-title"
    >
      <motion.div
        className="hero-copy"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <Eyebrow number="01" name="HERO // ASTANA IT UNIVERSITY" />
        </motion.div>

        <motion.h1 id="hero-title" variants={itemVariants}>
          <span className="hero-first">Alizhan</span>
          <br />
          Toleukhan<span className="name-cursor">_</span>
        </motion.h1>

        <motion.div className="role" variants={itemVariants}>
          <span />
          iOS &amp; Full-Stack Engineer · Computer Vision
        </motion.div>

        <motion.p className="intro" variants={itemVariants}>
          Проектирую быстрые нативные iOS-приложения на SwiftUI, CV-пайплайны на
          FastAPI/YOLOv8
          <br className="desktop-br" /> и веб-системы для реальных рабочих
          процессов.
        </motion.p>

        <motion.div className="actions" variants={itemVariants}>
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.975 }}
            className="btn primary"
            onClick={() => navigate(2)}
          >
            <Grid2X2 size={15} />
            Смотреть проекты
          </motion.button>
          <motion.a
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.975 }}
            className="btn secondary"
            href={contact.telegram}
            target="_blank"
            rel="noreferrer"
          >
            <Send size={15} />
            Telegram @alizhnn
          </motion.a>
          <motion.a
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.975 }}
            className="btn secondary ghost-btn"
            href={contact.github}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub профиль Alizhan-T"
          >
            <Github size={15} />
            GitHub
          </motion.a>
        </motion.div>
      </motion.div>

      <button
        className="scroll-hint"
        onClick={() => navigate(1)}
        aria-label="Прокрутить к разделу обо мне"
      >
        <Mouse size={17} />
        <span>SCROLL TELEMETRY</span>
        <i />
      </button>

      <motion.div
        className="vehicle-caption"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.75, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="model-line">
          <i className="m-stripes">
            <b />
            <b />
            <b />
          </i>
          <strong>BMW M5</strong>
          <span>F90</span>
        </div>
        <div className="caption-spec">
          COMPETITION <i /> 4.4L V8 <i /> 625 HP <i /> 0–100 3.3S
        </div>
      </motion.div>

      <div className="camera-tag">
        <Crosshair size={13} className="cam-reticle" />
        <span>
          CAM 01 <b>/</b> FRONT ¾ <b>/</b> 35MM
        </span>
      </div>
    </section>
  );
}
