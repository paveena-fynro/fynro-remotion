import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

type Props = { income: number; surplus: number };

export const IncomeBar: React.FC<Props> = ({ income, surplus }) => {
  const frame = useCurrentFrame();
  const safeIncome = income || 1;
  const safeSurplus = surplus || 0;
  const pct = Math.min(safeSurplus / safeIncome, 1);
  const barW = interpolate(frame, [0, 45], [0, pct], { extrapolateRight: "clamp" });
  const opacity = interpolate(frame, [0, 15], [0, 1]);
  const fmt = (v: number) => v >= 100000 ? `₹${(v/100000).toFixed(1)}L` : `₹${(v/1000).toFixed(0)}K`;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", bottom: 160, left: 40, width: 500, opacity, background: "rgba(0,0,0,0.85)", borderRadius: 12, padding: "16px 20px", border: "2px solid rgba(255,255,255,0.15)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <div>
            <div style={{ color: "#888", fontSize: 10, letterSpacing: 2, textTransform: "uppercase" }}>Monthly Income</div>
            <div style={{ color: "#4ADE80", fontSize: 22, fontWeight: 800 }}>{fmt(safeIncome)}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "#888", fontSize: 10, letterSpacing: 2, textTransform: "uppercase" }}>Surplus</div>
            <div style={{ color: "#60A5FA", fontSize: 22, fontWeight: 800 }}>{fmt(safeSurplus)}</div>
          </div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 6, height: 10, overflow: "hidden" }}>
          <div style={{ width: `${barW * 100}%`, height: "100%", background: "linear-gradient(90deg, #4ADE80, #60A5FA)", borderRadius: 6 }} />
        </div>
        <div style={{ color: "#F59E0B", fontSize: 12, fontWeight: 700, marginTop: 6 }}>{Math.round(pct * 100)}% savings rate</div>
      </div>
    </AbsoluteFill>
  );
};
