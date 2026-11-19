import { useState } from "react";

const feeds = [
  {
    city: "ASTANA / CAM 01",
    coords: "51.1694° N · 71.4491° E",
    label: "SMOKE 94%",
    offset: "translate(0 0)",
  },
  {
    city: "ALMATY / CAM 02",
    coords: "43.2389° N · 76.8897° E",
    label: "FIRE 91%",
    offset: "translate(-64 18)",
  },
  {
    city: "AKTOBE / CAM 03",
    coords: "50.2839° N · 57.1670° E",
    label: "SMOKE 89%",
    offset: "translate(38 14)",
  },
] as const;

export default function FireWatch({
  interactive = false,
}: {
  interactive?: boolean;
}) {
  const [camera, setCamera] = useState(0);
  const feed = feeds[camera];

  return (
    <div className="viz fire-viz">
      <svg
        viewBox="0 0 330 166"
        preserveAspectRatio="xMidYMid slice"
        role="img"
        aria-label="Схематическая карта камер Казахстана и зона детекции YOLOv8"
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
        <rect width="330" height="166" fill="#131b19" />
        <rect
          width="330"
          height="166"
          fill={"url(#" + (interactive ? "fieldB" : "fieldA") + ")"}
        />
        <g stroke="#32463d" fill="none" strokeWidth="1.15">
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
          strokeWidth="3.5"
        />
        <g transform={feed.offset} style={{ transition: "transform 0.45s cubic-bezier(0.22,1,0.36,1)" }}>
          <circle
            className="radar-pulse"
            cx="195"
            cy="75"
            r="24"
            fill="#dba154"
            fillOpacity=".14"
          />
          <rect
            x="173"
            y="56"
            width="45"
            height="35"
            stroke="#edbb71"
            strokeWidth="1.3"
            fill="#e5952c"
            fillOpacity=".14"
          />
          <path d="m191 80 4-10 5 10z" fill="#ecbd78" />
          <rect x="173" y="45" width="46" height="11" fill="#edbb71" />
          <text
            x="176"
            y="53"
            fontFamily="monospace"
            fontWeight="700"
            fontSize="6.6"
            fill="#111"
          >
            {feed.label}
          </text>
        </g>
        <circle cx="15" cy="17" r="2.8" fill="#22c55e" />
        <text x="22" y="20" fontSize="7.8" fill="#d1dfd7" fontFamily="monospace">
          {feed.city} · HLS LIVE
        </text>
        <text x="13" y="154" fontSize="7" fill="#7c9288" fontFamily="monospace">
          {feed.coords} · YOLOv8n
        </text>
        <path className="sweep" d="M0 70h330" stroke="#e6c29f" opacity=".36" />
      </svg>
      {interactive && (
        <button
          className="preview-action"
          onClick={() => setCamera((camera + 1) % feeds.length)}
        >
          Сменить камеру ({camera + 1}/{feeds.length})
        </button>
      )}
    </div>
  );
}
