import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

type Props = {
  age: number;
  label: string;
  amount: string;
  type: "milestone" | "goal" | "warning";
  index: number;
};

const TYPE_COLORS = {
  milestone: { border: "#F59E0B", text: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
  goal:      { border: "#60A5FA", text: "#60A5FA", bg: "rgba(96,165,250,0.12)" },
  warning:   { border: "#F87171", text: "#F87171", bg: "rgba(248,113,113,0.12)" },
};

const TYPE_ICONS = {
  milestone: "🎯",
  goal: "🏁",
  warning: "⚠️",
};

export const MilestoneCard: React.FC<Props> = ({ age, label, amount, type, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { border, text, bg } = TYPE_COLORS[type] || TYPE_COLORS.milestone;

  // Slide in from right
  const slideX = interpolate(frame, [0, 18], [120, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const scale = spring({ fps, frame, config: { damping: 14, stiffness: 180 } });

  // Stack cards vertically, offset by index
  const bottomPos = 180 + index * 0;

  return (
    <AbsoluteFill>
      <div style={{
        position: "absolute",
        bottom: 180,
        left: 40,
        transform: `translateX(${slideX}px) scale(${Math.min(scale, 1)})`,
        opacity,
        background: bg,
        border: `1.5px solid ${border}`,
        borderRadius: 12,
        padding: "10px 16px",
        minWidth: 240,
        backdropFilter: "blur(10px)",
        boxShadow: `0 4px 24px rgba(0,0,0,0.4)`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>{TYPE_ICONS[type]}</span>
          <div>
            <div style={{
              color: "rgba(255,255,255,0.55)", fontSize: 10,
              fontFamily: "sans-serif", letterSpacing: 1.2, marginBottom: 2
            }}>
              AGE {age}
            </div>
            <div style={{
              color: "#fff", fontSize: 14, fontWeight: 600,
              fontFamily: "sans-serif", lineHeight: 1.2
            }}>
              {label}
            </div>
            <div style={{
              color: text, fontSize: 18, fontWeight: 700,
              fontFamily: "sans-serif", marginTop: 2
            }}>
              {amount}
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
