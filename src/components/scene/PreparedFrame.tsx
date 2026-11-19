import { finishes, type SceneSettings } from "../../data/portfolio";
type Layer = "paint" | "lamp" | "indicator" | "brake";
const layers: Layer[] = ["paint", "lamp", "indicator", "brake"];
export function PreparedFrame({
  index,
  path,
  settings,
  zoom,
}: {
  index: number;
  path: string;
  settings: SceneSettings;
  zoom: number;
}) {
  const fill = ["transparent", "#1156aa", "#b0b2b5", "#0c7656"][
    settings.finish
  ];
  return (
    <svg
      viewBox="0 0 896 504"
      role="presentation"
      className="baked-frame"
      style={{ transform: "scale(" + zoom + ")" }}
    >
      <defs>
        {layers.map((layer) => (
          <mask
            key={layer}
            id={"baked-" + layer}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="896"
            height="504"
          >
            <image
              href={"/media/mask-" + layer + ".webp"}
              x={-(index % 6) * 896}
              y={-Math.floor(index / 6) * 504}
              width={5376}
              height={2520}
            />
          </mask>
        ))}
      </defs>
      <image href={path} width="896" height="504" />
      <rect
        width="896"
        height="504"
        fill={fill}
        mask="url(#baked-paint)"
        style={{
          mixBlendMode: settings.finish === 2 ? "screen" : "color",
          opacity: settings.finish === 2 ? 0.36 : 0.85,
          transition: "fill .45s",
        }}
      />
      <rect
        width="896"
        height="504"
        fill={finishes[settings.finish].paint}
        mask="url(#baked-paint)"
        opacity={settings.finish ? 0.1 : 0}
      />
      {!settings.headlights && (
        <rect width="896" height="504" fill="#17191b" mask="url(#baked-lamp)" />
      )}
      {settings.hazards && (
        <rect
          width="896"
          height="504"
          fill="#ffab39"
          mask="url(#baked-indicator)"
          className="hazard-glass"
        />
      )}
      <rect
        width="896"
        height="504"
        fill="#ff2b15"
        mask="url(#baked-brake)"
        opacity={settings.brake ? 1 : 0}
        style={{ transition: "opacity .16s" }}
      />
    </svg>
  );
}
