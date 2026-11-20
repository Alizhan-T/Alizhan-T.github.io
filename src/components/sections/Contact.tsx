import {
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type PointerEvent,
} from "react";
import { Copy, Github, Send, Linkedin, Check } from "lucide-react";
import { contact } from "../../data/portfolio";
import { Eyebrow } from "./Hero";

const links = [
  { name: "GitHub", url: contact.github, Icon: Github },
  { name: "Telegram", url: contact.telegram, Icon: Send },
  { name: "LinkedIn", url: contact.linkedin, Icon: Linkedin },
];

async function copyEmail() {
  try {
    await navigator.clipboard.writeText(contact.email);
    return true;
  } catch {
    const field = document.createElement("textarea");
    field.value = contact.email;
    field.setAttribute("readonly", "");
    field.style.cssText = "position:fixed;left:-9999px;top:0";
    const previous = document.activeElement;
    document.body.append(field);
    field.select();
    try {
      return document.execCommand("copy");
    } catch {
      return false;
    } finally {
      field.remove();
      if (previous instanceof HTMLElement)
        previous.focus({ preventScroll: true });
    }
  }
}

export default function Contact({
  brake,
}: {
  brake: (enabled: boolean) => void;
}) {
  const [status, setStatus] = useState<"idle" | "copied" | "manual">("idle");
  const timeout = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timeout.current), []);
  async function copy() {
    const copied = await copyEmail();
    setStatus(copied ? "copied" : "manual");
    window.clearTimeout(timeout.current);
    if (copied)
      timeout.current = window.setTimeout(() => setStatus("idle"), 2200);
  }
  const events = {
    onFocus: () => brake(true),
    onBlur: (e: FocusEvent<HTMLElement>) =>
      brake(e.currentTarget.matches(":hover")),
    onPointerEnter: () => brake(true),
    onPointerLeave: (e: PointerEvent<HTMLElement>) =>
      brake(e.currentTarget.matches(":focus-visible")),
    onPointerDown: () => brake(true),
    onPointerUp: (e: PointerEvent<HTMLElement>) =>
      brake(
        e.pointerType === "mouse" || e.currentTarget.matches(":focus-visible"),
      ),
    onPointerCancel: () => brake(false),
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
        <button
          className="btn primary email"
          onClick={copy}
          aria-label={"Скопировать email " + contact.email}
          {...events}
        >
          {status === "copied" ? <Check size={18} /> : <Copy size={18} />}
          <span>{contact.email}</span>
        </button>
        <output className="copy-feedback" role="status">
          {status === "copied" ? (
            "Скопировано"
          ) : status === "manual" ? (
            <>
              Адрес для копирования — <span>{contact.email}</span>
            </>
          ) : null}
        </output>
        <div className="socials">
          {links.map(({ name, url, Icon }) => (
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
