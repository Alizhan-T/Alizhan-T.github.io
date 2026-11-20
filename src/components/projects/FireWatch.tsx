import { useId, useState } from "react";
import { SvgFrame, MiniLabel, type PreviewProps } from "./PreviewFrame";

const cameraNames = ["Шымбулак", "Актау", "Астана"];
const feeds = [
  "M31 90 56 69 68 78 86 52 100 69 113 62 138 92",
  "M30 85 Q56 80 79 84 T136 82 L136 95 H30Z",
  "M30 89h12V72h11v15h10V63h9v25h14V57h9v29h10V69h12v18h18",
];
const pins = [
  [115, 85],
  [147, 111],
  [180, 65],
];
function contour(n: number) {
  const pts: string[] = [];
  for (let i = 0; i <= 82; i++) {
    const a = (i / 82) * 2 * Math.PI;
    const r =
      14 +
      n * 7.0 +
      7 * Math.sin(3 * a + n * 0.15) +
      5 * Math.cos(5 * a - n * 0.04);
    pts.push(
      (i ? "L" : "M") +
        (138 + r * 1.24 * Math.cos(a)).toFixed(1) +
        " " +
        (100 + r * 0.78 * Math.sin(a)).toFixed(1),
    );
  }
  return pts.join(" ") + "Z";
}
const contourPaths = Array.from({ length: 22 }, (_, n) => contour(n));

export default function FireWatch({ interactive = false }: PreviewProps) {
  const [step, select] = useState(0);
  const clip = useId();
  const grid = useId();
  const i = step % 3;
  const [px, py] = pins[i];
  return (
    <SvgFrame
      controls={
        interactive && (
          <>
            <span aria-live="polite">{cameraNames[i]}</span>
            <button
              type="button"
              onClick={() => select((i + 1) % cameraNames.length)}
            >
              Сменить камеру
            </button>
          </>
        )
      }
      label={"Макет карты и видеопотока: " + cameraNames[i]}
    >
      <defs>
        <clipPath id={clip}>
          <rect x="17" y="15" width="445" height="153" rx="3" />
        </clipPath>
        <pattern id={grid} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" stroke="#318880" opacity=".18" fill="none" />
        </pattern>
      </defs>
      <rect width="480" height="184" fill="#101c20" />
      <g clipPath={"url(#" + clip + ")"}>
        <rect width="480" height="184" fill={"url(#" + grid + ")"} />
        <g fill="none" stroke="#427775" strokeWidth=".8">
          {contourPaths.map((d, n) => (
            <path key={n} d={d} opacity={n % 4 ? 0.55 : 0.95} />
          ))}
        </g>
        <path
          d="M-9 152 65 130 100 107 132 111 157 69 209 53 270 42"
          stroke="#9aa7a0"
          fill="none"
          strokeDasharray="3 3"
          opacity=".53"
        />
        {pins.map(([x, y], pin) => (
          <g key={x} opacity={pin === i ? 1 : 0.5}>
            <circle cx={x} cy={y} r="5.5" fill="#102a2a" stroke="#80e5cf" />
            <circle cx={x} cy={y} r="2" fill="#a2f6db" />
          </g>
        ))}
        <g transform={"translate(" + px + " " + py + ")"}>
          <circle className="map-pulse" r="13" stroke="#a5ebd9" fill="none" />
          <circle r="23" opacity=".3" stroke="#83bdb1" fill="none" />
        </g>
      </g>
      <path
        d="M17 28V16h12M451 16h12v12M463 155v12h-12M29 167H17v-12"
        fill="none"
        stroke="#549d94"
        opacity=".85"
      />
      <rect x="29" y="26" width="62" height="18" rx="2" fill="#0d1d20" />
      <MiniLabel x={38} y={38} color="#a6e6d7">
        KZ / MAP
      </MiniLabel>
      <g transform="translate(274 25)">
        <rect width="165" height="132" rx="5" fill="#091619" stroke="#4f7473" />
        <circle cx="13" cy="12" r="2.7" fill="#88dfba" />
        <MiniLabel x={23} y={16} color="#a9c4bc">
          HLS / PREVIEW
        </MiniLabel>
        <svg
          x="9"
          y="23"
          width="147"
          height="73"
          viewBox="29 35 109 58"
          preserveAspectRatio="none"
        >
          <rect x="28" y="35" width="111" height="58" fill="#274243" />
          {Array.from({ length: 9 }, (_, n) => (
            <line
              key={n}
              x1="29"
              x2="139"
              y1={40 + 6 * n}
              y2={40 + 6 * n}
              stroke="#d0dab6"
              opacity=".065"
            />
          ))}
          <path
            d="M29 85 55 62 72 76 88 58 118 76 140 63v30H29Z"
            fill="#335455"
          />
          <path d={feeds[i]} fill="#162f32" stroke="#79948a" strokeWidth="1" />
          {i === 0 && (
            <g stroke="#f3c986" strokeWidth=".8">
              <path d="M72 67v-4h5m16 0h5v4m0 9v4h-5m-16 0h-5v-4" fill="none" />
              <text x="72" y="61" fontSize="4.6" fill="#f3c986" stroke="none">
                SMOKE / DEMO
              </text>
            </g>
          )}
          <path
            className="feed-scan"
            d="M32 54h99"
            stroke="#98e7b9"
            opacity=".67"
            strokeWidth=".9"
          />
          <path
            d="M36 50v-8h9m80 0h8v8m0 28v8h-8m-80 0h-9v-8"
            stroke="#e5f4d7"
            strokeWidth=".65"
            fill="none"
          />
        </svg>
        <MiniLabel x={11} y={113} size={11} color="#dce8df">
          {cameraNames[i]}
        </MiniLabel>
        <g fill="#83beb0">
          {[4, 6, 9, 12].map((v, n) => (
            <rect key={v} x={127 + n * 5} y={114 - v} width="3" height={v} />
          ))}
        </g>
      </g>
    </SvgFrame>
  );
}
