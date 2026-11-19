import { Grid2X2, Mail, Mouse, Crosshair } from "lucide-react";
import { motion } from "framer-motion";
export function Eyebrow({ number, name }: { number: string; name: string }) {
  return (
    <div className="eyebrow">
      <b>{number}</b>
      <i /> <span>{name}</span>
    </div>
  );
}
export default function Hero({ navigate }: { navigate: (i: number) => void }) {
  return (
    <section
      className="hero section-frame"
      id="hero"
      aria-labelledby="hero-title"
    >
      <div className="hero-copy">
        <Eyebrow number="01" name="HERO" />
        <h1 id="hero-title">
          Alizhan
          <br />
          Toleukhan<span className="name-dot">.</span>
        </h1>
        <div className="role">
          <span />
          iOS &amp; Full-Stack Developer
        </div>
        <p className="intro">
          Разрабатываю iOS-приложения и веб-сервисы.
          <br className="desktop-br" /> От интерфейса до серверной архитектуры.
        </p>
        <div className="actions">
          <motion.button
            whileTap={{ scale: 0.975 }}
            className="btn primary"
            onClick={() => navigate(2)}
          >
            <Grid2X2 size={15} />
            Смотреть проекты
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.975 }}
            className="btn secondary"
            onClick={() => navigate(3)}
          >
            <Mail size={16} />
            Связаться
          </motion.button>
        </div>
      </div>
      <button
        className="scroll-hint"
        onClick={() => navigate(1)}
        aria-label="Прокрутить к разделу обо мне"
      >
        <Mouse size={17} />
        <span>ПРОКРУТИТЬ</span>
        <i />
      </button>
      <div className="vehicle-caption">
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
          COMPETITION <i /> 4.4L V8
        </div>
      </div>
      <div className="camera-tag">
        <Crosshair size={13} />
        <span>
          CAM 01 <b>/</b> FRONT ¾
        </span>
      </div>
    </section>
  );
}
