import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

type Props = {
  num: number;
  title: string;
};

const CHAPTER_COLORS = ["#60A5FA", "#4ADE80", "#F59E0B"];

export const ChapterTitle: React.FC<Props> = ({ num, title }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { durationInFrames } = { durationInFrames: 90 };

  const color = CHAPTER_COLORS[(num - 1) % CHAPTER_COLORS.length];

  // Slide in from bottom-left
  const slideX = interpolate(frame, [0, 16], [-80, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Fade out near end of sequence
  const fadeOut = interpolate(frame, [60, 88], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const opacity = interpolate(frame, [0, 10], [0, fadeOut], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <div style={{
        position: "absolute",
        bottom: 30,
        left: 30,
        transform: `translateX(${slideX}px)`,
        opacity: Math.min(opacity, fadeOut),
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}>
        {/* Chapter number pill */}
        <div style={{
          background: color,
          borderRadius: 6,
          padding: "3px 10px",
          fontSize: 11,
          fontWeight: 700,
          fontFamily: "sans-serif",
          color: "rgba(0,0,0,0.85)",
          letterSpacing: 0.8,
          whiteSpace: "nowrap",
        }}>
          CH {num}
        </div>

        {/* Title with bottom-border accent */}
        <div style={{
          color: "#fff",
          fontSize: 15,
          fontWeight: 600,
          fontFamily: "sans-serif",
          borderBottom: `2px solid ${color}`,
          paddingBottom: 2,
          maxWidth: 360,
          lineHeight: 1.3,
        }}>
          {title}
        </div>
      </div>
    </AbsoluteFill>
  );
};
