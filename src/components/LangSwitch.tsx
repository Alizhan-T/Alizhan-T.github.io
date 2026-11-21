import { useLang } from "../i18n/LangContext";

/** EN | RU toggle */
export function LangSwitch({ className = "" }: { className?: string }) {
  const { lang, setLang, t } = useLang();
  return (
    <div role="group" aria-label={t.nav.language} className={`inline-flex items-center rounded-md border border-white/15 bg-white/5 p-0.5 font-mono text-xs ${className}`}>
      {(["en", "ru"] as const).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
          lang={code}
          className={`min-h-[28px] min-w-[32px] rounded px-2 py-1 uppercase transition-colors focus-visible:outline-2 focus-visible:outline-[#38BDF8] ${
            lang === code ? "bg-[#0052A5] text-white" : "text-slate-300 hover:text-white"
          }`}
        >
          {code}
        </button>
      ))}
    </div>
  );
}
