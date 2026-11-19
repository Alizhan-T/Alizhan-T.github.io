import { useState } from "react";
export default function FireWatch({
  interactive = false,
}: {
  interactive?: boolean;
}) {
  const [camera, setCamera] = useState(0);
  return (
    <div className="viz fire-viz">
      <svg
        viewBox="0 0 330 166"
        preserveAspectRatio="xMidYMid slice"
        role="img"
        aria-label="Схематическая карта камер и зона обнаружения"
      >
        <defs>
          <pattern
            id={interactive ? "fieldB" : "fieldA"}
            width="15"
            height="15"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0 0h15v15"
              fill="none"
              stroke="#343e3b"
              strokeWidth=".6"
            />
          </pattern>
        </defs>
        <rect width="330" height="166" fill="#151e1c" />
        <rect
          width="330"
          height="166"
          fill={"url(#" + (interactive ? "fieldB" : "fieldA") + ")"}
        />
        <g stroke="#374a40" fill="none" strokeWidth="1.2">
          {Array.from({ length: 12 }, (_, i) => (
            <path
              transform={"translate(" + i * 6 + " " + -i * 3 + ")"}
              key={i}
              d="M-50 147Q-10 105 32 119T104 100Q135 67 169 92T233 79Q241 65 286 55T388 37"
            />
          ))}
        </g>
        <path
          d="M-10 113Q70 85 119 99T225 65L355 41"
          fill="none"
          stroke="#4b666b"
          strokeWidth="4"
        />
        <g transform={camera ? "translate(-67 20)" : undefined}>
          <circle
            className="radar-pulse"
            cx="195"
            cy="75"
            r="22"
            fill="#dba154"
            fillOpacity=".1"
          />
          <rect
            x="175"
            y="57"
            width="41"
            height="34"
            stroke="#edbb71"
            strokeWidth="1.3"
            fill="#e5952c"
            fillOpacity=".12"
          />
          <path d="m192 80 4-10 5 10z" fill="#ecbd78" />
          <rect x="175" y="46" width="42" height="11" fill="#edbb71" />
          <text x="178" y="54" fontFamily="monospace" fontSize="7" fill="#111">
            SMOKE
          </text>
        </g>
        <text x="13" y="20" fontSize="8" fill="#b1c0b7" fontFamily="monospace">
          FIREWATCH / CAM 0{camera + 1}
        </text>
        <path className="sweep" d="M0 70h330" stroke="#c9d8bb" opacity=".3" />
      </svg>
      {interactive && (
        <button
          className="preview-action"
          onClick={() => setCamera(1 - camera)}
        >
          Сменить камеру
        </button>
      )}
    </div>
  );
}
