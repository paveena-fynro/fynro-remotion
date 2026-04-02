import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

type Props = { label: string; value: number; prefix?: string; x: number; y: number; color: string };

export const NumberCounter: React.FC<Props> = ({ label, value, prefix = "", x, y, color }) => {
  const frame = useCurrentFrame();
  const display = Math.round(interpolate(frame, [0, 60], [0, value], { extrapolateRight: "clamp" }));
  const formatted = prefix + (display >= 10000000 ? `${(display/10000000).toFixed(1)}Cr` :
    display >= 100000 ? `${(display/100000).toFixed(1)}L` : display.toLocaleString("en-IN"));
  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div style={{
      position: "absolute", left: x, top: y, opacity,
      background: "rgba(0,0,0,0.85)",
      border: `2px solid ${color}`,
      borderRadius: 8, padding: "6px 14px",
      backdropFilter: "blur(4px)"
    }}>
      <div style={{ color: "#AAAAAA", fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase" }}>
        {label}
      </div>
      <div style={{ color, fontSize: 20, fontWeight: 800 }}>{formatted}</div>
    </div>
  );
};
