import React from "react";
import { Composition } from "remotion";
import { FinancialOverlay } from "./compositions/FinancialOverlay";
import { OverlayProps } from "./types";

const defaultProps: OverlayProps = {
  userName: "Arumugam Neelakandan",
  storyTitle: "Arumugam — From 62K a Month to 5 Crore Freedom",
  chapters: [
    { title: "Where Arumugam Stands Today", narration: "Arumugam earns one lakh eighty thousand rupees every month..." },
    { title: "The Wealth Journey", narration: "At twenty-five, the journey begins with nine lakh invested yearly..." },
    { title: "The Next 12 Months", narration: "Close the personal loan this month. Build the emergency fund..." },
  ],
  keyMoments: [
    { age: 25, label: "Journey Begins", amount: "₹10.08L", type: "milestone" },
    { age: 27, label: "Family Vacation Fund", amount: "₹4L", type: "goal" },
    { age: 30, label: "Home Downpayment", amount: "₹40L", type: "milestone" },
    { age: 33, label: "Wealth Crosses 1 Crore", amount: "₹1.11Cr", type: "milestone" },
    { age: 38, label: "Son Education SWP", amount: "₹8.75L/yr", type: "goal" },
    { age: 45, label: "Tara Education Funded", amount: "₹31.4L", type: "goal" },
    { age: 51, label: "Home Loan Closed", amount: "₹42L freed", type: "milestone" },
    { age: 58, label: "Retirement!", amount: "₹5.00Cr", type: "milestone" },
  ],
  closingLine: "Every rupee Arumugam invests today is building the freedom of tomorrow.",
  monthlyIncome: 180000,
  monthlySurplus: 62000,
  savingsRate: 34,
  projectionLedger: [
    { age: 25, fund_value: 1008000 },
    { age: 26, fund_value: 2187360 },
    { age: 27, fund_value: 3161163 },
    { age: 28, fund_value: 4707389 },
    { age: 29, fund_value: 6497506 },
    { age: 30, fund_value: 4563698 },
    { age: 31, fund_value: 6462158 },
    { age: 32, fund_value: 8655975 },
    { age: 33, fund_value: 11183967 },
    { age: 35, fund_value: 17422481 },
    { age: 38, fund_value: 29693068 },
    { age: 45, fund_value: 31400000 },
    { age: 51, fund_value: 42000000 },
    { age: 58, fund_value: 50088000 },
  ],
  retirementCorpus: 50088000,
};

export const Root: React.FC = () => (
  <Composition
    id="FinancialOverlay"
    component={FinancialOverlay}
    durationInFrames={1800}
    fps={30}
    width={1280}
    height={720}
    defaultProps={defaultProps}
  />
);
