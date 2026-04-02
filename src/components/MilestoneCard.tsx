import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

type Props = { age: number; label: string; amount: string | null; type: string; index: number };

const TYPE_COLORS: Record<string, string> = {
  milestone: "#F59E0B",
  goal: "#4ADE80",
  retirement: "#60A5FA",
  withdrawal: "#F87171",
  lifestyle: "#C084FC",
};

export const MilestoneCard: React.FC<Props> = ({ age, label, amount, type, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const color = TYPE_COLORS[type] || "#F59E0B";
  const scale = spring({ frame, fps, config: { damping: 10 } });
  const opacity = interpolate(frame, [0, 10], [0, 1]);

  const positions = [
    { bottom: 200, left: 40 }, { bottom: 200, left: 280 },
    { bottom: 200, left: 520 }, { bottom: 120, left: 40 },
    { bottom: 120, left: 280 }, { bottom: 120, left: 520 },
  ];
  const pos = positions[index % positions.length];

  return (
    <AbsoluteFill>
      <div style={{
        position: "absolute", ...pos,
        opacity, transform: `scale(${scale})`,
        background: "rgba(0,0,0,0.88)",
        border: `2px solid ${color}`,
        borderRadius: 10, padding: "10px 16px", width: 210,
        backdropFilter: "blur(8px)"
      }}>
        <div style={{ color, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>
          Age {age}
        </div>
        <div style={{ color: "#FFFFFF", fontSize: 15, fontWeight: 700, margin: "4px 0 2px" }}>
          {label}
        </div>
        {amount && (
          <div style={{ color, fontSize: 18, fontWeight: 800 }}>{amount}</div>
        )}
      </div>
    </AbsoluteFill>
  );
};
