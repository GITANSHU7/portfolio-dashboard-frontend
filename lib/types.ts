export type SummaryStat = {
  label: string;
  value: number;
  change?: number;
};

export type Holding = {
  stockName: string;
  exchangeCode: string;
  qty: number;
  purchasePrice: number;
  investment: number;
  portfolioPercent: number;
  cmp: number;
  presentValue: number;
  gainLoss: number;
  peRatio: number | null;
  latestEarnings: string;
  sector: string;
  quoteSource: "yahoo" | "fallback";
  fundamentalsSource: "google" | "fallback";
};

export type SectorSummary = {
  name: string;
  investment: number;
  presentValue: number;
  gainLoss: number;
  holdings: number;
};

export type PortfolioResponse = {
  updatedAt: string;
  summary: SummaryStat[];
  sectors: SectorSummary[];
  holdings: Holding[];
  dataStatus: {
    mode: "live" | "partial";
    totalHoldings: number;
    liveQuotes: number;
    liveFundamentals: number;
    message: string;
  };
};
