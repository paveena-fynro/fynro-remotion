import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { OverlayProps } from "../types";
import { WealthChart } from "../components/WealthChart";
import { MilestoneCard } from "../components/MilestoneCard";
import { NumberCounter } from "../components/NumberCounter";
import { ChapterTitle } from "../components/ChapterTitle";
import { IncomeBar } from "../components/IncomeBar";

// Timing (frames at 30fps):
// Ch1:  0  – 600  (0–20s)  current state
// Ch2: 600 – 1350 (20–45s) wealth journey + chart
// Ch3: 1350– 1800 (45–60s) action plan + retirement

export const FinancialOverlay: React.FC<OverlayProps> = (props) => {
  const {
    userName, storyTitle, chapters, keyMoments,
    monthlyIncome, monthlySurplus, savingsRate,
    projectionLedger, retirementCorpus
  } = props;

  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const CH1 = { start: 0, end: 600 };
  const CH2 = { start: 600, end: 1350 };
  const CH3 = { start: 1350, end: 1800 };

  // Milestones spaced across ch2
  const ms = keyMoments.slice(0, 6);
  const msSpacing = (CH2.end - CH2.start - 60) / Math.max(ms.length, 1);

  return (
    <AbsoluteFill style={{ background: "transparent" }}>

      {/* ─── CHAPTER 1: Current State ─── */}
      <Sequence from={CH1.start} durationInFrames={90}>
        <ChapterTitle num={1} title={chapters[0]?.title || "Where You Stand"} />
      </Sequence>

      <Sequence from={CH1.start + 40} durationInFrames={500}>
        <IncomeBar income={monthlyIncome} surplus={monthlySurplus} />
      </Sequence>

      <Sequence from={CH1.start + 80} durationInFrames={460}>
        <NumberCounter
          label="Monthly Income" value={monthlyIncome}
          prefix="₹" x={900} y={530} color="#4ADE80"
        />
      </Sequence>

      <Sequence from={CH1.start + 130} durationInFrames={410}>
        <NumberCounter
          label="Monthly Surplus" value={monthlySurplus}
          prefix="₹" x={900} y={590} color="#60A5FA"
        />
      </Sequence>

      <Sequence from={CH1.start + 180} durationInFrames={360}>
        <SavingsBadge rate={savingsRate} />
      </Sequence>

      {/* ─── CHAPTER 2: Wealth Journey ─── */}
      <Sequence from={CH2.start} durationInFrames={90}>
        <ChapterTitle num={2} title={chapters[1]?.title || "The Wealth Journey"} />
      </Sequence>

      {/* Animated wealth chart on right */}
      <Sequence from={CH2.start + 40} durationInFrames={CH2.end - CH2.start - 40}>
        <WealthChart
          ledger={projectionLedger}
          currentFrame={frame - (CH2.start + 40)}
          totalFrames={CH2.end - CH2.start - 40}
        />
      </Sequence>

      {/* Live portfolio value counter bottom-right */}
      <Sequence from={CH2.start + 40} durationInFrames={CH2.end - CH2.start - 40}>
        <PortfolioCounter
          ledger={projectionLedger}
          frame={frame - (CH2.start + 40)}
          total={CH2.end - CH2.start - 40}
        />
      </Sequence>

      {/* Milestone pop-up cards */}
      {ms.map((m, i) => {
        const startF = CH2.start + 60 + Math.floor(i * msSpacing);
        const dur = Math.min(Math.floor(msSpacing) - 15, 160);
        return (
          <Sequence key={i} from={startF} durationInFrames={dur}>
            <MilestoneCard age={m.age} label={m.label} amount={m.amount} type={m.type} index={i} />
          </Sequence>
        );
      })}

      {/* ─── CHAPTER 3: Action Plan ─── */}
      <Sequence from={CH3.start} durationInFrames={90}>
        <ChapterTitle num={3} title={chapters[2]?.title || "Your Next 12 Months"} />
      </Sequence>

      {/* Big retirement corpus counter */}
      <Sequence from={CH3.start + 60} durationInFrames={500}>
        <RetirementTarget corpus={retirementCorpus} />
      </Sequence>

    </AbsoluteFill>
  );
};

// ── Savings Rate Badge ──
const SavingsBadge: React.FC<{ rate: number }> = ({ rate }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const scale = interpolate(frame, [0, 15], [0.6, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <div style={{
        position: "absolute", bottom: 90, right: 20,
        opacity, transform: `scale(${scale})`,
        background: "rgba(0,0,0,0.8)", borderRadius: 50,
        padding: "10px 18px", border: "2px solid #F59E0B",
        display: "flex", flexDirection: "column", alignItems: "center"
      }}>
        <span style={{ color: "#F59E0B", fontSize: 26, fontWeight: 700, fontFamily: "sans-serif" }}>
          {rate}%
        </span>
        <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, fontFamily: "sans-serif", letterSpacing: 1 }}>
          SAVINGS RATE
        </span>
      </div>
    </AbsoluteFill>
  );
};

// ── Running Portfolio Counter ──
const PortfolioCounter: React.FC<{
  ledger: Array<{ age: number; fund_value: number }>;
  frame: number;
  total: number;
}> = ({ ledger, frame, total }) => {
  const progress = Math.min(frame / total, 1);
  const maxVal = Math.max(...ledger.map(l => l.fund_value));
  const currentVal = Math.round(maxVal * progress);
  const fmt = (v: number) => {
    if (v >= 10000000) return `₹${(v / 10000000).toFixed(2)}Cr`;
    if (v >= 100000)   return `₹${(v / 100000).toFixed(1)}L`;
    return `₹${(v / 1000).toFixed(0)}K`;
  };
  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <div style={{
        position: "absolute", bottom: 20, right: 20, opacity,
        background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)",
        borderRadius: 12, padding: "8px 16px",
        border: "1px solid rgba(74,222,128,0.4)"
      }}>
        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, fontFamily: "sans-serif", letterSpacing: 1.5 }}>
          PORTFOLIO VALUE
        </div>
        <div style={{ color: "#4ADE80", fontSize: 24, fontWeight: 700, fontFamily: "sans-serif" }}>
          {fmt(currentVal)}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Retirement Target ──
const RetirementTarget: React.FC<{ corpus: number }> = ({ corpus }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ fps, frame, config: { damping: 80, stiffness: 30 } });
  const displayVal = Math.round(corpus * Math.min(progress, 1));
  const fmt = (v: number) => {
    if (v >= 10000000) return `₹${(v / 10000000).toFixed(2)} Cr`;
    if (v >= 100000)   return `₹${(v / 100000).toFixed(1)} L`;
    return `₹${(v / 1000).toFixed(0)}K`;
  };
  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <div style={{
        position: "absolute", bottom: 60, right: 20, opacity,
        background: "rgba(0,0,0,0.85)", borderRadius: 16,
        padding: "14px 22px", border: "2px solid #F59E0B",
        minWidth: 200, textAlign: "center"
      }}>
        <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, fontFamily: "sans-serif", letterSpacing: 1.5 }}>
          RETIREMENT TARGET
        </div>
        <div style={{ color: "#F59E0B", fontSize: 32, fontWeight: 700, fontFamily: "sans-serif" }}>
          {fmt(displayVal)}
        </div>
        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, fontFamily: "sans-serif" }}>
          at age 58
        </div>
      </div>
    </AbsoluteFill>
  );
};
