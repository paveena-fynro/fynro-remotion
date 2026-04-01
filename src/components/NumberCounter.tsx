import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

type Props = {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  x: number;
  y: number;
  color: string;
  large?: boolean;
};

function formatIndian(n: number): string {
  if (n >= 10000000) return `${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000)   return `${(n / 100000).toFixed(1)} L`;
  if (n >= 1000)     return `${(n / 1000).toFixed(0)}K`;
  return n.toFixed(0);
}

export const NumberCounter: React.FC<Props> = ({
  label, value, prefix = "", suffix = "",
  x, y, color, large = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Count up using spring easing
  const progress = spring({ fps, frame, config: { damping: 60, stiffness: 25 } });
  const displayValue = Math.round(value * Math.min(progress, 1));

  // Slide up + fade in
  const translateY = interpolate(frame, [0, 20], [18, 0], { extrapolateRight: "clamp" });
  const opacity    = interpolate(frame, [0, 15], [0, 1],  { extrapolateRight: "clamp" });

  const fontSize     = large ? 28 : 20;
  const labelSize    = large ? 12 : 10;
  const cardPadding  = large ? "12px 18px" : "7px 14px";

  return (
    <AbsoluteFill>
      <div style={{
        position: "absolute",
        left: x, top: y,
        opacity,
        transform: `translateY(${translateY}px)`,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(8px)",
        borderRadius: 10,
        padding: cardPadding,
        borderLeft: `3px solid ${color}`,
        minWidth: large ? 220 : 180,
      }}>
        <div style={{
          color: "rgba(255,255,255,0.5)",
          fontSize: labelSize, fontFamily: "sans-serif",
          letterSpacing: 1.2, marginBottom: 3,
        }}>
          {label.toUpperCase()}
        </div>
        <div style={{
          color, fontSize, fontWeight: 700,
          fontFamily: "sans-serif", lineHeight: 1,
        }}>
          {prefix}{formatIndian(displayValue)}{suffix}
        </div>
      </div>
    </AbsoluteFill>
  );
};
