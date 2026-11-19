import { useState } from "react";
import { Copy, Mail, Github, Send, Linkedin, Check } from "lucide-react";
import { contact } from "../../data/portfolio";
import { Eyebrow } from "./Hero";
export default function Contact({ brake }: { brake: (b: boolean) => void }) {
  const [copied, setCopied] = useState(false),
    [error, setError] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(contact.email);
      setCopied(true);
      setError(false);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError(true);
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
      <div className="contact-pane">
        <Eyebrow number="04" name="CONTACT" />
        <h2 id="contact-title">
          На связи<span>.</span>
        </h2>
        <p className="lead">
          Обсудим приложение, веб-сервис
          <br />
          или совместный проект.
        </p>
        {contact.email ? (
          <>
            <button className="btn primary email" onClick={copy} {...events}>
              {copied ? <Check size={18} /> : <Copy size={18} />}
              <span aria-live="polite">
                {copied ? "Скопировано" : contact.email}
              </span>
            </button>
            {error && (
              <p role="status">Скопируйте адрес вручную: {contact.email}</p>
            )}
          </>
        ) : (
          <a
            className="btn primary"
            href={
              contact.telegram +
              "?text=" +
              encodeURIComponent(
                "Алижан, здравствуйте! Подскажите, пожалуйста, ваш рабочий email.",
              )
            }
            target="_blank"
            rel="noreferrer"
            {...events}
          >
            <Mail size={17} />
            Запросить email
          </a>
        )}
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
      </div>
    </section>
  );
}
