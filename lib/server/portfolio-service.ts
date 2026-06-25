import { portfolioSeedHoldings, type PortfolioSeedHolding } from "@/lib/mock-data";
import type { Holding, PortfolioResponse, SectorSummary, SummaryStat } from "@/lib/types";

const CACHE_TTL_MS = 15_000;
const REQUEST_HEADERS = {
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  accept: "text/html,application/json;q=0.9,*/*;q=0.8",
};

let cachedResponse: PortfolioResponse | null = null;
let cacheExpiresAt = 0;

type QuoteResult = {
  cmp: number;
  source: "yahoo" | "fallback";
};

type FundamentalsResult = {
  peRatio: number | null;
  latestEarnings: string;
  source: "google" | "fallback";
};

export async function getPortfolioSnapshot(): Promise<PortfolioResponse> {
  const now = Date.now();

  if (cachedResponse && now < cacheExpiresAt) {
    return cachedResponse;
  }

  const holdings = await Promise.all(portfolioSeedHoldings.map((holding) => buildHolding(holding)));

  const totalInvestment = holdings.reduce((sum, holding) => sum + holding.investment, 0);
  const totalPresentValue = holdings.reduce((sum, holding) => sum + holding.presentValue, 0);
  const totalGainLoss = totalPresentValue - totalInvestment;

  const normalizedHoldings = holdings.map((holding) => ({
    ...holding,
    portfolioPercent: totalPresentValue > 0 ? (holding.presentValue / totalPresentValue) * 100 : 0,
  }));

  const liveQuotes = normalizedHoldings.filter((holding) => holding.quoteSource === "yahoo").length;
  const liveFundamentals = normalizedHoldings.filter(
    (holding) => holding.fundamentalsSource === "google",
  ).length;

  const response: PortfolioResponse = {
    updatedAt: new Date().toISOString(),
    summary: buildSummary(totalInvestment, totalPresentValue, totalGainLoss),
    sectors: buildSectors(normalizedHoldings),
    holdings: normalizedHoldings,
    dataStatus: {
      mode:
        liveQuotes === normalizedHoldings.length && liveFundamentals === normalizedHoldings.length
          ? "live"
          : "partial",
      totalHoldings: normalizedHoldings.length,
      liveQuotes,
      liveFundamentals,
      message:
        liveQuotes === normalizedHoldings.length && liveFundamentals === normalizedHoldings.length
          ? "Live quotes and valuation metrics are refreshing every 15 seconds."
          : `Some Yahoo Finance or Google Finance requests fell back to seeded values. Live quotes: ${liveQuotes}/${normalizedHoldings.length}, live fundamentals: ${liveFundamentals}/${normalizedHoldings.length}.`,
    },
  };

  cachedResponse = response;
  cacheExpiresAt = now + CACHE_TTL_MS;

  return response;
}

async function buildHolding(seed: PortfolioSeedHolding): Promise<Holding> {
  const [quote, fundamentals] = await Promise.all([fetchYahooQuote(seed), fetchGoogleMetrics(seed)]);
  const investment = seed.purchasePrice * seed.qty;
  const presentValue = quote.cmp * seed.qty;

  return {
    stockName: seed.stockName,
    exchangeCode: seed.exchangeCode,
    qty: seed.qty,
    purchasePrice: seed.purchasePrice,
    investment,
    portfolioPercent: 0,
    cmp: quote.cmp,
    presentValue,
    gainLoss: presentValue - investment,
    peRatio: fundamentals.peRatio,
    latestEarnings: fundamentals.latestEarnings,
    sector: seed.sector,
    quoteSource: quote.source,
    fundamentalsSource: fundamentals.source,
  };
}

async function fetchYahooQuote(seed: PortfolioSeedHolding): Promise<QuoteResult> {
  const fallback = { cmp: seed.fallbackCmp, source: "fallback" as const };

  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${seed.yahooSymbol}?interval=1d&range=1d`,
      {
        headers: REQUEST_HEADERS,
        cache: "no-store",
        signal: AbortSignal.timeout(8_000),
      },
    );

    if (!response.ok) {
      return fallback;
    }

    const payload = (await response.json()) as {
      chart?: {
        result?: Array<{
          meta?: {
            regularMarketPrice?: number;
          };
        }>;
      };
    };

    const cmp = payload.chart?.result?.[0]?.meta?.regularMarketPrice;

    if (typeof cmp !== "number" || Number.isNaN(cmp)) {
      return fallback;
    }

    return { cmp, source: "yahoo" };
  } catch {
    return fallback;
  }
}

async function fetchGoogleMetrics(seed: PortfolioSeedHolding): Promise<FundamentalsResult> {
  const fallback = {
    peRatio: seed.fallbackPeRatio,
    latestEarnings: seed.fallbackLatestEarnings,
    source: "fallback" as const,
  };

  try {
    const response = await fetch(`https://www.google.com/finance/quote/${seed.googleSymbol}?hl=en`, {
      headers: REQUEST_HEADERS,
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });

    if (!response.ok) {
      return fallback;
    }

    const html = await response.text();
    const peRatio = parseNumericMetric(html, "P/E ratio");
    const eps = parseTextMetric(html, "EPS");
    const earningsDate = parseTextMetric(html, "Earnings date");

    if (peRatio === null && !eps && !earningsDate) {
      return fallback;
    }

    return {
      peRatio: peRatio ?? fallback.peRatio,
      latestEarnings: earningsDate ? `Earnings date ${earningsDate}` : eps ? `EPS ${eps}` : fallback.latestEarnings,
      source: "google",
    };
  } catch {
    return fallback;
  }
}

function parseNumericMetric(html: string, label: string): number | null {
  const value = parseTextMetric(html, label);

  if (!value) {
    return null;
  }

  const normalized = value.replace(/,/g, "").match(/-?\d+(\.\d+)?/);
  return normalized ? Number(normalized[0]) : null;
}

function parseTextMetric(html: string, label: string): string | null {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(
      `<div[^>]*class="SwQK7"[^>]*>${escapedLabel}</div><div[^>]*class="dO6ijd"[^>]*>([^<]+)</div>`,
      "i",
    ),
    new RegExp(`${escapedLabel}</div>\\s*<div[^>]*>([^<]+)</div>`, "i"),
    new RegExp(
      `${escapedLabel}[^<]*</div>[\\s\\S]{0,180}?<div[^>]*class="[^"]*"[^>]*>([^<]+)</div>`,
      "i",
    ),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);

    if (match?.[1]?.trim()) {
      return match[1].trim();
    }
  }

  return null;
}

function buildSummary(
  totalInvestment: number,
  totalPresentValue: number,
  totalGainLoss: number,
): SummaryStat[] {
  const gainLossPercent = totalInvestment > 0 ? (totalGainLoss / totalInvestment) * 100 : 0;

  return [
    { label: "Total Investment", value: totalInvestment },
    { label: "Current Portfolio Value", value: totalPresentValue },
    { label: "Total Gain/Loss", value: totalGainLoss, change: gainLossPercent },
  ];
}

function buildSectors(holdings: Holding[]): SectorSummary[] {
  const sectorMap = new Map<string, SectorSummary>();

  for (const holding of holdings) {
    const current = sectorMap.get(holding.sector) ?? {
      name: holding.sector,
      investment: 0,
      presentValue: 0,
      gainLoss: 0,
      holdings: 0,
    };

    current.investment += holding.investment;
    current.presentValue += holding.presentValue;
    current.gainLoss += holding.gainLoss;
    current.holdings += 1;

    sectorMap.set(holding.sector, current);
  }

  return [...sectorMap.values()].sort((left, right) => right.presentValue - left.presentValue);
}
