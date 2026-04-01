import React from "react";
import { AbsoluteFill, interpolate } from "remotion";

type LedgerRow = { age: number; fund_value: number };
type Props = {
  ledger: LedgerRow[];
  currentFrame: number;
  totalFrames: number;
};

export const WealthChart: React.FC<Props> = ({ ledger, currentFrame, totalFrames }) => {
  const W = 400, H = 240;
  const PAD = { top: 30, right: 15, bottom: 35, left: 55 };
  const cW = W - PAD.left - PAD.right;
  const cH = H - PAD.top - PAD.bottom;

  const minAge = ledger[0]?.age || 25;
  const maxAge = ledger[ledger.length - 1]?.age || 58;
  const maxVal = Math.max(...ledger.map(l => l.fund_value)) * 1.08;

  const toX = (age: number) => PAD.left + ((age - minAge) / (maxAge - minAge)) * cW;
  const toY = (v: number) => PAD.top + cH - (v / maxVal) * cH;

  const pts = ledger.map(r => ({ x: toX(r.age), y: toY(r.fund_value), age: r.age, val: r.fund_value }));

  // Smooth bezier path
  const fullPath = pts.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    const prev = pts[i - 1];
    const cpx = ((prev.x + p.x) / 2).toFixed(1);
    return `${acc} C ${cpx} ${prev.y.toFixed(1)}, ${cpx} ${p.y.toFixed(1)}, ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  }, "");

  // Draw progress
  const drawProgress = interpolate(currentFrame, [0, totalFrames], [0, 1], { extrapolateRight: "clamp" });

  // Y-axis labels
  const yLabels = [0, 0.25, 0.5, 0.75, 1].map(f => {
    const v = maxVal * f;
    const label = v >= 10000000 ? `${(v/10000000).toFixed(1)}Cr` : v >= 100000 ? `${(v/100000).toFixed(0)}L` : `${(v/1000).toFixed(0)}K`;
    return { y: toY(v), label };
  });

  // Visible age ticks
  const ageTicks = [25, 30, 35, 40, 45, 50, 55, 58].filter(a => a >= minAge && a <= maxAge);

  // Which milestones are currently visible
  const visibleUpTo = Math.round(minAge + drawProgress * (maxAge - minAge));

  const opacity = interpolate(currentFrame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 60, right: 20, opacity }}>
        <svg width={W} height={H} style={{ overflow: "visible" }}>
          {/* Background */}
          <rect x={PAD.left} y={PAD.top} width={cW} height={cH}
            fill="rgba(0,0,0,0.6)" rx={8} />

          {/* Grid lines */}
          {yLabels.map((l, i) => (
            <g key={i}>
              <line x1={PAD.left} y1={l.y} x2={PAD.left + cW} y2={l.y}
                stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
              <text x={PAD.left - 6} y={l.y + 4} textAnchor="end"
                fill="rgba(255,255,255,0.45)" fontSize={9} fontFamily="sans-serif">
                {l.label}
              </text>
            </g>
          ))}

          {/* Age ticks */}
          {ageTicks.map((age, i) => (
            <g key={i}>
              <line x1={toX(age)} y1={PAD.top + cH} x2={toX(age)} y2={PAD.top + cH + 4}
                stroke="rgba(255,255,255,0.3)" strokeWidth={1} />
              <text x={toX(age)} y={PAD.top + cH + 14} textAnchor="middle"
                fill="rgba(255,255,255,0.45)" fontSize={9} fontFamily="sans-serif">
                {age}
              </text>
            </g>
          ))}

          {/* Chart title */}
          <text x={PAD.left + cW / 2} y={PAD.top - 10} textAnchor="middle"
            fill="rgba(255,255,255,0.7)" fontSize={11} fontFamily="sans-serif" fontWeight={600}>
            Wealth Projection
          </text>

          {/* Gradient fill area */}
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4ADE80" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#4ADE80" stopOpacity="0.02" />
            </linearGradient>
            <clipPath id="lineClip">
              <rect x={PAD.left} y={PAD.top} width={cW * drawProgress} height={cH} />
            </clipPath>
          </defs>

          {/* Area under line */}
          <path
            d={`${fullPath} L ${pts[pts.length-1].x} ${PAD.top + cH} L ${pts[0].x} ${PAD.top + cH} Z`}
            fill="url(#areaGrad)"
            clipPath="url(#lineClip)"
          />

          {/* Main line — draws left to right */}
          <path
            d={fullPath}
            fill="none"
            stroke="#4ADE80"
            strokeWidth={2.5}
            strokeLinecap="round"
            clipPath="url(#lineClip)"
          />

          {/* Milestone dots */}
          {pts.filter(p => p.age <= visibleUpTo).map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={4}
              fill="#4ADE80" stroke="rgba(0,0,0,0.8)" strokeWidth={1.5} />
          ))}

          {/* Moving dot at draw tip */}
          {drawProgress > 0 && drawProgress < 1 && (() => {
            const tipIdx = Math.min(Math.floor(drawProgress * (pts.length - 1)), pts.length - 2);
            const segProg = (drawProgress * (pts.length - 1)) - tipIdx;
            const p1 = pts[tipIdx], p2 = pts[tipIdx + 1];
            const tipX = p1.x + (p2.x - p1.x) * segProg;
            const tipY = p1.y + (p2.y - p1.y) * segProg;
            const tipVal = p1.val + (p2.val - p1.val) * segProg;
            const tipFmt = tipVal >= 10000000 ? `₹${(tipVal/10000000).toFixed(1)}Cr` : `₹${(tipVal/100000).toFixed(0)}L`;
            return (
              <g>
                <circle cx={tipX} cy={tipY} r={6} fill="#4ADE80" opacity={0.9} />
                <rect x={tipX + 8} y={tipY - 16} width={60} height={18} rx={4} fill="rgba(0,0,0,0.8)" />
                <text x={tipX + 12} y={tipY - 3} fill="#4ADE80" fontSize={11} fontFamily="sans-serif" fontWeight={700}>
                  {tipFmt}
                </text>
              </g>
            );
          })()}
        </svg>
      </div>
    </AbsoluteFill>
  );
};
