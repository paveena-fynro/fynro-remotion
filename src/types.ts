export type KeyMoment = {
  age: number;
  label: string;
  amount: string;
  type: "milestone" | "goal" | "warning";
};

export type Chapter = {
  title: string;
  narration: string;
};

export type LedgerRow = {
  age: number;
  fund_value: number;
};

export type OverlayProps = {
  userName: string;
  storyTitle: string;
  chapters: Chapter[];
  keyMoments: KeyMoment[];
  closingLine: string;
  monthlyIncome: number;
  monthlySurplus: number;
  savingsRate: number;
  projectionLedger: LedgerRow[];
  retirementCorpus: number;
};
