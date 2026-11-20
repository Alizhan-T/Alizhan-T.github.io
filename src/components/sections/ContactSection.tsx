import { useState } from "react";
import { ArrowUpRight, Check, Copy, Mail } from "lucide-react";
import { CONTACT_LINKS } from "../../services/github";

export function ContactSection() {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_LINKS.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      const input = document.createElement("textarea");
      input.value = CONTACT_LINKS.email;
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2400);
      } finally {
        document.body.removeChild(input);
      }
    }
  };

  return (
    <section
      id="contact"
      className="relative flex flex-col justify-end py-24"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="m5-card rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl space-y-3">
              <p className="font-mono text-xs text-[#38BDF8]">
                04. Contact
              </p>
              <h2 className="font-display text-2xl font-bold tracking-tight text-white text-balance sm:text-4xl">
                Обсудить проект или команду
              </h2>
              <p className="text-sm leading-relaxed text-slate-300">
                Открыт к задачам по iOS (SwiftUI), кроссплатформенной мобильной разработке
                (Flutter), Full-Stack, Web3 и креативным 3D/WebGL продуктам.
              </p>
            </div>

            {/* Direct Channels + One-Click Email Copy */}
            <div className="flex flex-col gap-3 sm:items-end">
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#0052A5] px-4 py-2.5 font-mono text-xs font-medium text-white whitespace-nowrap shrink-0 transition-colors hover:bg-[#1E90FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38BDF8]"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-sky-200" aria-hidden="true" />
                      <span>Скопировано: {CONTACT_LINKS.email}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{CONTACT_LINKS.email}</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 font-mono text-xs text-slate-300">
                <a
                  href={CONTACT_LINKS.github}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 transition-colors hover:text-[#38BDF8]"
                >
                  <span>GitHub</span>
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
                <a
                  href={CONTACT_LINKS.telegram}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 transition-colors hover:text-[#38BDF8]"
                >
                  <span>Telegram</span>
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
                <a
                  href={CONTACT_LINKS.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 transition-colors hover:text-[#38BDF8]"
                >
                  <span>LinkedIn</span>
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
                <a
                  href={`mailto:${CONTACT_LINKS.email}`}
                  className="inline-flex items-center gap-1 transition-colors hover:text-[#38BDF8]"
                >
                  <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Mail</span>
                </a>
              </div>
            </div>
          </div>

          <footer className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-4 font-mono text-[11px] text-slate-500">
            <span>© {new Date().getFullYear()} Alizhan Toleukhan</span>
            <span>BMW M5 F90 · Monte Carlo Blue · Astana, KZ</span>
          </footer>
        </div>
      </div>
    </section>
  );
}
