import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

type Props = { num: number; title: string };

export const ChapterTitle: React.FC<Props> = ({ num, title }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const colors = ["#60A5FA", "#4ADE80", "#F59E0B"];
  const color = colors[(num - 1) % 3];
  const scale = spring({ frame, fps, config: { damping: 12 } });
  const opacity = interpolate(frame, [0, 15], [0, 1]);

  return (
    <AbsoluteFill>
      <div style={{
        position: "absolute", bottom: 80, left: 40,
        opacity, transform: `scale(${scale})`,
        background: "rgba(0,0,0,0.85)",
        border: `3px solid ${color}`,
        borderRadius: 12, padding: "14px 24px",
        backdropFilter: "blur(8px)"
      }}>
        <div style={{ color, fontSize: 13, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 4 }}>
          Chapter {num}
        </div>
        <div style={{ color: "#FFFFFF", fontSize: 22, fontWeight: 800, lineHeight: 1.2, maxWidth: 500 }}>
          {title}
        </div>
      </div>
    </AbsoluteFill>
  );
};
