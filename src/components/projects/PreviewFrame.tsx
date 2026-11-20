import type { ReactNode } from "react";
import "./visualizations.css";

export type PreviewProps = { interactive?: boolean };

export function SvgFrame({
  children,
  label,
  controls,
}: {
  children: ReactNode;
  label: string;
  controls?: ReactNode;
}) {
  return (
    <div className="viz project-visual">
      <svg
        className="preview-drawing"
        viewBox="0 0 480 184"
        role="img"
        aria-label={label}
      >
        {children}
      </svg>
      {controls && <div className="demo-controls">{controls}</div>}
    </div>
  );
}

export function MiniLabel({
  x,
  y,
  children,
  color = "currentColor",
  size = 9,
  anchor = "start",
}: {
  x: number;
  y: number;
  children: ReactNode;
  color?: string;
  size?: number;
  anchor?: "start" | "middle" | "end";
}) {
  return (
    <text
      x={x}
      y={y}
      fill={color}
      fontSize={size}
      textAnchor={anchor}
      className="preview-mono"
    >
      {children}
    </text>
  );
}
