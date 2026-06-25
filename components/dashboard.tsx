"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { ValueType } from "recharts/types/component/DefaultTooltipContent";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { HoldingsTable } from "@/components/holdings-table";
import { SectorAccordion } from "@/components/sector-accordion";
import { ThemeToggle } from "@/components/theme-toggle";
import { fetchPortfolio } from "@/lib/api";
import { formatCompactCurrency, formatCurrency, formatDateTime, formatPercent } from "@/lib/utils";
import { RefreshCcw } from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const chartColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
];
const REFRESH_INTERVAL_MS = 15_000;

function formatTooltipValue(value: ValueType | undefined) {
  return formatCompactCurrency(Number(value ?? 0));
}

export function Dashboard() {
  const { data, isLoading, isError, refetch, isFetching, dataUpdatedAt } = useQuery({
    queryKey: ["portfolio"],
    queryFn: fetchPortfolio,
    refetchInterval: REFRESH_INTERVAL_MS,
    refetchIntervalInBackground: true,
  });
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(15);

  useEffect(() => {
    const updateCountdown = () => {
      if (isFetching) {
        setSecondsUntilRefresh(15);
        return;
      }

      if (!dataUpdatedAt) {
        setSecondsUntilRefresh(15);
        return;
      }

      const nextRefreshAt = dataUpdatedAt + REFRESH_INTERVAL_MS;
      const remainingMs = Math.max(0, nextRefreshAt - Date.now());
      setSecondsUntilRefresh(Math.ceil(remainingMs / 1000));
    };

    updateCountdown();

    const intervalId = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(intervalId);
  }, [dataUpdatedAt, isFetching]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError || !data) {
    return (
      <main className="page-shell min-h-screen px-4 py-10 md:px-8">
        <div className="mx-auto max-w-7xl">
          <Alert>
            Unable to load the portfolio dashboard right now. Try refreshing the data source.
          </Alert>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell min-h-screen pb-10">
      <section className="sticky top-0 z-30 w-full border-b border-[color:var(--border)] bg-[color:color-mix(in_srgb,var(--surface)_88%,transparent)] shadow-[var(--hero-shadow)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 md:flex-row md:items-center md:justify-between md:px-8 md:py-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--text)] md:text-4xl">
              Portfolio Dashboard
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[var(--text-muted)]">
              <span>Last updated {formatDateTime(data.updatedAt)}</span>
              <Badge tone={data.dataStatus.mode === "live" ? "success" : "danger"}>
                {data.dataStatus.mode === "live" ? "Live data active" : "Fallback data in use"}
              </Badge>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <ThemeToggle />
            <div className="flex flex-col items-stretch gap-1">
              <Button variant="outline" onClick={() => refetch()} className="min-w-36">
                <RefreshCcw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <div className="text-center text-xs text-[var(--text-muted)]">
                {isFetching ? "Refreshing now..." : `Refresh in ${secondsUntilRefresh}s`}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10">
        <section className="grid gap-4 md:grid-cols-3">
          {data.summary.map((item) => {
            const positive = item.value >= 0;
            const detailByLabel: Record<string, string> = {
              "Total Investment": "Total capital deployed across all holdings",
              "Current Portfolio Value": "Latest marked-to-market portfolio value",
              "Total Gain/Loss": "Net unrealized performance versus cost basis",
            };
            return (
              <Card key={item.label} className="overflow-hidden">
                <CardHeader>
                  <CardDescription className="text-[11px] uppercase tracking-[0.18em]">
                    {item.label}
                  </CardDescription>
                  <CardTitle className="text-3xl">{formatCurrency(item.value)}</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <div className="text-sm text-[var(--text-muted)]">
                    {detailByLabel[item.label] ?? "Portfolio summary metric"}
                  </div>
                  {item.change !== undefined ? (
                    <Badge tone={positive ? "success" : "danger"}>{formatPercent(item.change)}</Badge>
                  ) : (
                    <Badge tone="neutral">Current base</Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.05fr_1.25fr]">
          <Card>
            <CardHeader>
              <CardTitle>Sector Summary</CardTitle>
              <CardDescription>
                Sector-wise rollup of investment, current value, and unrealized gain or loss.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SectorAccordion sectors={data.sectors} />
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Sector Allocation</CardTitle>
                <CardDescription>
                  Present value split across sectors based on current portfolio weight.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex min-h-[380px] flex-col">
                <div className="h-[260px] sm:h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.sectors}
                        dataKey="presentValue"
                        nameKey="name"
                        innerRadius={64}
                        outerRadius={100}
                        paddingAngle={3}
                      >
                        {data.sectors.map((entry, index) => (
                          <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={formatTooltipValue}
                        contentStyle={{ background: "var(--surface-elevated)", borderColor: "var(--border)" }}
                        itemStyle={{ color: "var(--text)" }}
                        labelStyle={{ color: "var(--text)" }}
                        wrapperClassName="chart-tooltip"
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-xs text-[var(--text-muted)]">
                  {data.sectors.map((sector, index) => (
                    <div key={sector.name} className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: chartColors[index % chartColors.length] }}
                      />
                      <span>{sector.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Portfolio Distribution</CardTitle>
                <CardDescription>
                  Sector-level comparison of unrealized profit and loss contribution.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.sectors}>
                    <XAxis dataKey="name" tickLine={false} axisLine={false} className="chart-text" />
                    <YAxis tickLine={false} axisLine={false} className="chart-text" />
                    <Tooltip
                      formatter={formatTooltipValue}
                      contentStyle={{ background: "var(--surface-elevated)", borderColor: "var(--border)" }}
                      itemStyle={{ color: "var(--text)" }}
                      labelStyle={{ color: "var(--text)" }}
                      wrapperClassName="chart-tooltip"
                    />
                    <Bar dataKey="gainLoss" radius={[10, 10, 0, 0]}>
                      {data.sectors.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={entry.gainLoss >= 0 ? "var(--success)" : "var(--danger)"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </section>

        <section>
          <Card>
            <CardHeader>
              <CardTitle>Holdings Table</CardTitle>
              <CardDescription>
                Holding-level breakdown covering allocation, valuation, profitability, and earnings data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HoldingsTable data={data.holdings} />
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}

function DashboardSkeleton() {
  return (
    <main className="page-shell min-h-screen pb-10">
      <div className="sticky top-0 z-30 border-b border-[color:var(--border)] bg-[color:color-mix(in_srgb,var(--surface)_88%,transparent)] px-4 py-5 shadow-[var(--hero-shadow)] backdrop-blur-xl md:px-8 md:py-6">
        <div className="mx-auto max-w-7xl">
          <Skeleton className="h-24 rounded-[24px]" />
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10">
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
        </div>
        <div className="grid gap-6 xl:grid-cols-[1.05fr_1.25fr]">
          <Skeleton className="h-[420px]" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-[420px]" />
            <Skeleton className="h-[420px]" />
          </div>
        </div>
        <Skeleton className="h-[520px]" />
      </div>
    </main>
  );
}
