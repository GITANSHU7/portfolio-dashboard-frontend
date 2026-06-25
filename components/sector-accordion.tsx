import { Accordion } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { formatCompactCurrency, formatPercent } from "@/lib/utils";
import { SectorSummary } from "@/lib/types";

export function SectorAccordion({ sectors }: { sectors: SectorSummary[] }) {
  return (
    <Accordion
      items={sectors.map((sector) => ({
        value: sector.name,
        title: (
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm font-semibold text-[var(--text)]">{sector.name}</div>
              <div className="text-xs text-[var(--text-muted)]">{sector.holdings} holdings</div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-left md:flex md:items-center md:gap-6">
              <Metric label="Investment" value={formatCompactCurrency(sector.investment)} />
              <Metric label="Present Value" value={formatCompactCurrency(sector.presentValue)} />
              <Metric
                label="Gain/Loss"
                value={formatCompactCurrency(sector.gainLoss)}
                positive={sector.gainLoss >= 0}
              />
            </div>
          </div>
        ),
        content: (
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="max-w-2xl text-sm text-[var(--text-muted)]">
              {sector.name} remains{" "}
              <span className="font-medium text-[var(--text)]">
                {sector.gainLoss >= 0 ? "above cost basis" : "under cost basis"}
              </span>{" "}
              with a sector return of{" "}
              <span
                className={
                  sector.gainLoss >= 0 ? "text-[var(--success)]" : "text-[var(--danger)]"
                }
              >
                {formatPercent((sector.gainLoss / sector.investment) * 100)}
              </span>
              .
            </p>
            <Badge tone={sector.gainLoss >= 0 ? "success" : "danger"}>
              {sector.gainLoss >= 0 ? "Profit Sector" : "Watchlist Sector"}
            </Badge>
          </div>
        ),
      }))}
    />
  );
}

function Metric({
  label,
  value,
  positive,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--text-soft)]">{label}</div>
      <div
        className={
          positive === undefined
            ? "text-sm font-semibold text-[var(--text)]"
            : positive
              ? "text-sm font-semibold text-[var(--success)]"
              : "text-sm font-semibold text-[var(--danger)]"
        }
      >
        {value}
      </div>
    </div>
  );
}
