import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { OverlayProps } from "../types";
import { WealthChart } from "../components/WealthChart";
import { MilestoneCard } from "../components/MilestoneCard";
import { NumberCounter } from "../components/NumberCounter";
import { ChapterTitle } from "../components/ChapterTitle";
import { IncomeBar } from "../components/IncomeBar";

// Dynamic timing based on .ass caption timestamps from HeyGen
// chapterTimestamps: { ch1: 0, ch2: 83.5, ch3: 165.2, totalDuration: 240.5 }
// These are in SECONDS — we convert to frames at 30fps

export const FinancialOverlay: React.FC<OverlayProps> = (props) => {
  const {
    userName, storyTitle, chapters, keyMoments,
    monthlyIncome, monthlySurplus, savingsRate,
    projectionLedger, retirementCorpus,
    chapterTimestamps,
    videoDuration
  } = props;

  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Convert seconds to frames
  const toFrame = (sec: number) => Math.round(sec * fps);

  // Use dynamic timestamps from .ass parsing, fall back to proportional split
  const totalSec = videoDuration || chapterTimestamps?.totalDuration || 60;
  const ch1Sec = chapterTimestamps?.ch1 ?? 0;
  const ch2Sec = chapterTimestamps?.ch2 ?? (totalSec * 0.33);
  const ch3Sec = chapterTimestamps?.ch3 ?? (totalSec * 0.66);

  const CH1 = { start: toFrame(ch1Sec), end: toFrame(ch2Sec) };
  const CH2 = { start: toFrame(ch2Sec), end: toFrame(ch3Sec) };
  const CH3 = { start: toFrame(ch3Sec), end: durationInFrames };

  // Milestones spaced across ch2
  const ms = keyMoments?.slice(0, 6) || [];
  const ch2Duration = CH2.end - CH2.start;
  const msSpacing = ch2Duration / Math.max(ms.length, 1);

  return (
    <AbsoluteFill style={{ background: "transparent" }}>

      {/* ─── CHAPTER 1: Current State ─── */}
      {CH1.end > CH1.start && (
        <>
          <Sequence from={CH1.start} durationInFrames={Math.min(90, CH1.end - CH1.start)}>
            <ChapterTitle num={1} title={chapters?.[0]?.title || "Where You Stand"} />
          </Sequence>

          <Sequence from={CH1.start + 40} durationInFrames={CH1.end - CH1.start - 40}>
            <IncomeBar income={monthlyIncome} surplus={monthlySurplus} />
          </Sequence>

          <Sequence from={CH1.start + 80} durationInFrames={CH1.end - CH1.start - 80}>
            <NumberCounter
              label="Monthly Income" value={monthlyIncome}
              prefix="₹" x={900} y={530} color="#4ADE80"
            />
          </Sequence>

          <Sequence from={CH1.start + 130} durationInFrames={CH1.end - CH1.start - 130}>
            <NumberCounter
              label="Monthly Surplus" value={monthlySurplus}
              prefix="₹" x={900} y={590} color="#60A5FA"
            />
          </Sequence>
        </>
      )}

      {/* ─── CHAPTER 2: Wealth Journey ─── */}
      {CH2.end > CH2.start && (
        <>
          <Sequence from={CH2.start} durationInFrames={Math.min(90, ch2Duration)}>
            <ChapterTitle num={2} title={chapters?.[1]?.title || "The Wealth Journey"} />
          </Sequence>

          <Sequence from={CH2.start + 40} durationInFrames={ch2Duration - 40}>
            <WealthChart
              ledger={projectionLedger}
              currentFrame={frame - (CH2.start + 40)}
              totalFrames={ch2Duration - 40}
            />
          </Sequence>

          {ms.map((m, i) => {
            const startF = CH2.start + 60 + Math.floor(i * msSpacing);
            const dur = Math.min(Math.floor(msSpacing) - 15, 160);
            return (
              <Sequence key={i} from={startF} durationInFrames={Math.max(dur, 30)}>
                <MilestoneCard age={m.age} label={m.label} amount={m.amount} type={m.type} index={i} />
              </Sequence>
            );
          })}
        </>
      )}

      {/* ─── CHAPTER 3: Action Plan ─── */}
      {CH3.end > CH3.start && (
        <>
          <Sequence from={CH3.start} durationInFrames={Math.min(90, CH3.end - CH3.start)}>
            <ChapterTitle num={3} title={chapters?.[2]?.title || "Your Next 12 Months"} />
          </Sequence>

          <Sequence from={CH3.start + 40} durationInFrames={CH3.end - CH3.start - 40}>
            <NumberCounter
              label="Retirement Corpus" value={retirementCorpus}
              prefix="₹" x={900} y={400} color="#F59E0B"
            />
          </Sequence>
        </>
      )}

    </AbsoluteFill>
  );
};
