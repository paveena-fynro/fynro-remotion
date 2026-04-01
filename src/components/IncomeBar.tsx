import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

type Props = {
  income: number;
  surplus: number;
};

function fmt(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  return `₹${(n / 1000).toFixed(0)}K`;
}

export const IncomeBar: React.FC<Props> = ({ income, surplus }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const expenses = income - surplus;
  const expenseRatio = expenses / income;
  const surplusRatio = surplus / income;

  // Animate bar width
  const progress = spring({ fps, frame, config: { damping: 50, stiffness: 20 } });
  const clampedProg = Math.min(progress, 1);

  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const slideY  = interpolate(frame, [0, 18], [20, 0], { extrapolateRight: "clamp" });

  const BAR_W = 320;
  const BAR_H = 10;

  return (
    <AbsoluteFill>
      <div style={{
        position: "absolute",
        bottom: 130,
        right: 20,
        opacity,
        transform: `translateY(${slideY}px)`,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(8px)",
        borderRadius: 12,
        padding: "12px 16px",
        width: BAR_W + 32,
      }}>
        {/* Label row */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, fontFamily: "sans-serif", letterSpacing: 1 }}>
            MONTHLY INCOME
          </span>
          <span style={{ color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: "sans-serif" }}>
            {fmt(income)}
          </span>
        </div>

        {/* Bar */}
        <div style={{
          width: BAR_W, height: BAR_H, borderRadius: BAR_H / 2,
          background: "rgba(255,255,255,0.1)", overflow: "hidden",
          position: "relative",
        }}>
          {/* Expenses segment */}
          <div style={{
            position: "absolute", left: 0, top: 0, height: "100%",
            width: BAR_W * expenseRatio * clampedProg,
            background: "#F87171",
            borderRadius: BAR_H / 2,
            transition: "width 0.1s",
          }} />
          {/* Surplus segment */}
          <div style={{
            position: "absolute",
            left: BAR_W * expenseRatio * clampedProg,
            top: 0, height: "100%",
            width: BAR_W * surplusRatio * clampedProg,
            background: "#4ADE80",
            borderRadius: BAR_H / 2,
          }} />
        </div>

        {/* Legend row */}
        <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: "#F87171" }} />
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, fontFamily: "sans-serif" }}>
              Expenses {fmt(expenses)}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: "#4ADE80" }} />
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, fontFamily: "sans-serif" }}>
              Surplus {fmt(surplus)}
            </span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
