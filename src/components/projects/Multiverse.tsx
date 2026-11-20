import { useState } from "react";
import { SvgFrame, MiniLabel, type PreviewProps } from "./PreviewFrame";

const characters = ["Rick Sanchez", "Morty Smith"];
function Portrait({ morty }: { morty: boolean }) {
  return (
    <g transform="translate(0 4)" strokeLinejoin="round" strokeLinecap="round">
      {morty ? (
        <>
          <path
            d="M-38 45q0-25 36-28 34 1 40 28"
            fill="#cbb267"
            stroke="#272e2e"
            strokeWidth="2"
          />
          <path
            d="M-24 -3q0-33 26-32 28 0 27 32 8-3 5 7-2 7-8 6-7 20-24 20-22-1-26-21-8 2-8-8 0-8 8-4Z"
            fill="#cba98d"
            stroke="#343f3b"
            strokeWidth="2"
          />
          <path
            d="M-26-5q-7-34 24-38 35-1 34 34l-6-4-5-15-6 4-10-5-11 4-7-4-6 13Z"
            fill="#514638"
            stroke="#283530"
            strokeWidth="2"
          />
        </>
      ) : (
        <>
          <path
            d="M-40 45q2-23 31-28h14q30 3 35 28"
            fill="#c0cdc4"
            stroke="#263e3a"
            strokeWidth="2"
          />
          <path d="m-6 18 8 1 10 27H-15Z" fill="#689f96" />
          <path
            d="m-22 7-15-6 9-7-15-10 16 0-9-17 17 8-3-18 12 12 5-22 6 15 13-14-1 19 11-4-4 12 17-6-12 16 9 1-11 13Z"
            fill="#91b6bd"
            stroke="#304a49"
            strokeWidth="2"
          />
          <path
            d="M-19-10Q-17-27 0-27q18 0 23 17l1 24q-6 17-21 17-19 0-24-17-7 0-7-7t7-5Z"
            fill="#c2c6aa"
            stroke="#37483f"
            strokeWidth="1.8"
          />
        </>
      )}
      <ellipse cx="-9" cy="-2" rx="9" ry="9" fill="#dfdfc8" stroke="#4b554a" />
      <ellipse cx="9" cy="-1" rx="9" ry="9" fill="#dfdfc8" stroke="#4b554a" />
      <g fill="#354539">
        <circle cx="-6" cy="-1" r="1.8" />
        <circle cx="8" cy="-2" r="1.8" />
      </g>
      {!morty && (
        <path
          d="m-18-10 16 2 17-1"
          stroke="#6e9b9f"
          strokeWidth="5"
          fill="none"
        />
      )}
      <path
        d={morty ? "M-8 16q9-6 14 0" : "M-13 14q11 5 22-1"}
        stroke="#586053"
        fill="none"
        strokeWidth="1.7"
      />
    </g>
  );
}
export default function Multiverse({ interactive = false }: PreviewProps) {
  const [step, select] = useState(0);
  const i = step % 2;
  return (
    <SvgFrame
      controls={
        interactive && (
          <>
            <span aria-live="polite">{characters[i]}</span>
            <button
              type="button"
              onClick={() => select((i + 1) % characters.length)}
            >
              Другой персонаж
            </button>
          </>
        )
      }
      label={"Макет справочника персонажей: " + characters[i]}
    >
      <rect width="480" height="184" fill="#13211f" />
      <g transform="translate(347 90)" fill="none">
        {[63, 73, 82, 94].map((r, n) => (
          <ellipse
            key={r}
            rx={r}
            ry={r * 0.79}
            transform={"rotate(" + [25, -24, 35, -33][n] + ")"}
            stroke={n % 2 ? "#3d6857" : "#709e77"}
            opacity={n % 2 ? 0.55 : 0.85}
            strokeDasharray={n % 2 ? "4 5" : "none"}
          />
        ))}
        <g className="character-orbit">
          <ellipse
            rx="58"
            ry="64"
            transform="rotate(28)"
            stroke="#7baf7c"
            strokeWidth="2"
            strokeDasharray="91 14 45 35"
          />
          <ellipse
            rx="52"
            ry="59"
            transform="rotate(19)"
            stroke="#a1c78b"
            strokeWidth="1"
            strokeDasharray="50 22"
          />
        </g>
        <circle r="47" fill="#263e35" stroke="#638d68" />
        <Portrait morty={i === 1} />
      </g>
      <g transform="translate(31 26)">
        <MiniLabel x={0} y={7} color="#94bd9c">
          MULTIVERSE / INDEX
        </MiniLabel>
        <rect
          y="19"
          width="172"
          height="25"
          rx="4"
          fill="#172d26"
          stroke="#476858"
        />
        <circle cx="12" cy="30" r="4" fill="none" stroke="#9db6a6" />
        <path d="m15 33 4 3" stroke="#9db6a6" />
        <MiniLabel x={25} y={34} color="#a8c2af">
          Персонажи
        </MiniLabel>
        {characters.map((name, n) => (
          <g key={name} transform={"translate(0 " + (54 + n * 30) + ")"}>
            <rect
              width="172"
              height="25"
              rx="3"
              fill={i === n ? "#304b3c" : "#1b3229"}
            />
            {i === n && <rect width="2.5" height="25" rx="1" fill="#b4cf96" />}
            <text
              x="12"
              y="16.5"
              fill={i === n ? "#dce7d0" : "#9cb5a2"}
              fontSize="10.8"
            >
              {name}
            </text>
            <MiniLabel x={160} y={16} anchor="end" color="#9bbe97" size={8}>
              #{n + 1}
            </MiniLabel>
          </g>
        ))}
      </g>
    </SvgFrame>
  );
}
