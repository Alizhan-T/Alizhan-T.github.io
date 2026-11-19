import { useEffect, useRef, useState } from "react";
import { Copy, Github, Send, Linkedin, Check } from "lucide-react";
import { motion } from "framer-motion";
import { contact } from "../../data/portfolio";
import { Eyebrow } from "./Hero";

function AsciiEyeWidget({
  onHoverChange,
}: {
  onHoverChange: (active: boolean) => void;
}) {
  const preRef = useRef<HTMLPreElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState("0.0, 0.0");

  useEffect(() => {
    const eyeEl = preRef.current;
    const frameEl = frameRef.current;
    if (!eyeEl || !frameEl) return;

    const COLS = 58;
    const ROWS = 16;
    const CX = (COLS - 1) / 2;
    const CY = (ROWS - 1) / 2;
    const AX = 22.0;
    const AY = 6.2;
    const RAMP = " .',;:clodxk0KXNWM";

    let targetX = 0;
    let targetY = 0;
    let gazeX = 0;
    let gazeY = 0;
    let blink = 0;
    let blinkDir = 0;
    let rafId = 0;
    let frameCount = 0;

    const triggerBlink = () => {
      if (blinkDir === 0) blinkDir = 1;
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = frameEl.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const maxD = Math.max(window.innerWidth * 0.42, 280);
      const nx = Math.max(-1, Math.min(1, dx / maxD));
      const ny = Math.max(-1, Math.min(1, dy / (maxD * 0.6)));
      targetX = nx * 7.5;
      targetY = ny * 1.9;
    };

    frameEl.addEventListener("click", triggerBlink);
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    let blinkTimer = window.setTimeout(function autoBlink() {
      triggerBlink();
      blinkTimer = window.setTimeout(autoBlink, 3800 + Math.random() * 3400);
    }, 4200);

    const render = () => {
      gazeX += (targetX - gazeX) * 0.14;
      gazeY += (targetY - gazeY) * 0.14;

      if (blinkDir === 1) {
        blink += 0.22;
        if (blink >= 1) {
          blink = 1;
          blinkDir = -1;
        }
      } else if (blinkDir === -1) {
        blink -= 0.16;
        if (blink <= 0) {
          blink = 0;
          blinkDir = 0;
        }
      }

      frameCount++;
      if (frameCount % 8 === 0) {
        setCoords(`${gazeX.toFixed(1)}, ${gazeY.toFixed(1)}`);
      }

      const openFactor = 1 - blink * 0.95;
      const lines = new Array<string>(ROWS);

      for (let r = 0; r < ROWS; r++) {
        const dy = (r - CY) / AY;
        let row = "";
        for (let c = 0; c < COLS; c++) {
          const dx = (c - CX) / AX;
          const asymY = 0.045 * dx * (1 - Math.min(1, Math.abs(dx)));
          const effDy = dy - asymY;
          let ch = " ";

          if (Math.abs(dx) <= 1.16) {
            const lidY =
              Math.max(0, 1 - Math.pow(dx / 1.01, 2)) * 0.86 * openFactor;
            const distFromLid = Math.abs(effDy) - lidY;

            if (Math.abs(dx) <= 0.98 && Math.abs(effDy) < lidY) {
              const ix = (c - (CX + gazeX)) * 0.58;
              const iy = r - (CY + gazeY);
              const dist = Math.hypot(ix, iy);
              const catch1 = Math.hypot(ix - 1.35, iy + 0.95);

              if (catch1 < 0.88 && dist < 3.8) {
                ch = catch1 < 0.45 ? "W" : "o";
              } else if (dist < 1.45) {
                ch = dist > 1.18 ? ":" : " ";
              } else if (dist < 3.85) {
                const angle = Math.atan2(iy, ix);
                const fiber = 0.5 + 0.5 * Math.cos(angle * 10 + 0.3);
                const ring =
                  0.66 + 0.34 * Math.abs((dist - 1.45) / 2.4 - 0.46) * 1.65;
                const val = Math.min(1, ring * (0.74 + 0.26 * fiber));
                const idx = Math.max(
                  6,
                  Math.min(
                    RAMP.length - 1,
                    Math.floor(val * (RAMP.length - 1)),
                  ),
                );
                ch = RAMP[idx];
              } else if (Math.abs(dx) > 0.62) {
                const shade = Math.pow((Math.abs(dx) - 0.62) / 0.36, 1.4) * 0.5;
                ch =
                  shade >= 0.09
                    ? RAMP[Math.min(10, Math.floor(shade * 11))]
                    : " ";
              }
            } else {
              let val = 0;
              if (Math.abs(dx) > 0.98) {
                const dCorner = Math.hypot(
                  (Math.abs(dx) - 0.96) * 3.5,
                  (effDy - 0.05) * 2.2,
                );
                val = Math.max(0, 0.7 - dCorner * 0.86);
              } else {
                const upperBoost = effDy < 0 ? 1.16 : 0.85;
                const crease =
                  effDy < 0 && distFromLid > 0.18 && distFromLid < 0.44
                    ? 0.26 * (1 - Math.pow(Math.abs(dx), 1.5))
                    : 0;
                val = Math.max(
                  0,
                  (0.75 - distFromLid * 1.4) * upperBoost + crease,
                );
                val *= Math.max(0, 1 - Math.pow(Math.abs(dx) / 1.14, 3.8));
              }
              if (val >= 0.065) {
                ch =
                  RAMP[
                    Math.min(
                      RAMP.length - 1,
                      Math.floor(val * (RAMP.length - 1)),
                    )
                  ];
              }
            }
          }
          row += ch;
        }
        lines[r] = row;
      }

      eyeEl.textContent = lines.join("\n");
      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(blinkTimer);
      frameEl.removeEventListener("click", triggerBlink);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  return (
    <div
      ref={frameRef}
      id="eye"
      className="ascii-eye-card"
      title="Следит за курсором · кликните, чтобы моргнуть"
      onPointerEnter={() => onHoverChange(true)}
      onPointerLeave={() => onHoverChange(false)}
    >
      <div className="ascii-eye-top">
        <span>VISION TELEMETRY // GAZE Δ({coords})</span>
        <span className="eye-live-tag">
          <i className="status-dot" /> TRACKING
        </span>
      </div>
      <pre
        ref={preRef}
        className="ascii-eye-pre"
        aria-label="Интерактивный ASCII-глаз, следящий за курсором"
      />
      <div className="ascii-eye-foot">
        <span>01 // CV &amp; NATIVE iOS</span>
        <span>ASTANA · UTC+5 · © 2026 ALIZHAN-T</span>
      </div>
    </div>
  );
}

export default function Contact({ brake }: { brake: (b: boolean) => void }) {
  const [copied, setCopied] = useState(false);

  async function copyHandle() {
    try {
      await navigator.clipboard.writeText("@alizhnn");
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const events = {
    onFocus: () => brake(true),
    onBlur: () => brake(false),
    onPointerEnter: () => brake(true),
    onPointerLeave: () => brake(false),
    onPointerDown: () => brake(true),
    onPointerUp: () => brake(false),
  };

  return (
    <section
      id="contact"
      className="detail-section contact section-frame"
      aria-labelledby="contact-title"
    >
      <motion.div
        className="contact-pane"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
      >
        <Eyebrow number="04" name="CONTACT // DIRECT CHANNEL" />
        <h2 id="contact-title">
          На связи<span>.</span>
        </h2>
        <p className="lead">
          Обсудим iOS-приложение, CV/AI-модуль,
          <br />
          веб-сервис или совместный продукт.
        </p>

        <div className="contact-cta-row">
          <a
            className="btn primary"
            href={contact.telegram}
            target="_blank"
            rel="noreferrer"
            {...events}
          >
            <Send size={16} />
            Написать в Telegram
          </a>
          <button
            className="btn secondary"
            type="button"
            onClick={copyHandle}
            {...events}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span aria-live="polite">
              {copied ? "Ник скопирован" : "@alizhnn"}
            </span>
          </button>
        </div>

        <div className="socials">
          {[
            { name: "GitHub", url: contact.github, Icon: Github },
            { name: "Telegram", url: contact.telegram, Icon: Send },
            { name: "LinkedIn", url: contact.linkedin, Icon: Linkedin },
          ].map(({ name, url, Icon }) => (
            <a
              key={name}
              href={url}
              target="_blank"
              rel="noreferrer"
              {...events}
            >
              <Icon size={16} />
              {name}
            </a>
          ))}
        </div>

        <AsciiEyeWidget onHoverChange={brake} />
      </motion.div>
    </section>
  );
}
