"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Holding } from "@/lib/types";
import { formatCompactCurrency, formatCurrency, formatPercent } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const columns: ColumnDef<Holding>[] = [
  {
    accessorKey: "stockName",
    header: "Stock Name",
    cell: ({ row }) => (
      <div>
        <div className="font-semibold text-[var(--text)]">{row.original.stockName}</div>
        <div className="text-xs text-[var(--text-muted)]">{row.original.sector}</div>
      </div>
    ),
  },
  { accessorKey: "exchangeCode", header: "Exchange Code" },
  { accessorKey: "qty", header: "Qty" },
  {
    accessorKey: "purchasePrice",
    header: "Purchase Price",
    cell: ({ getValue }) => formatCurrency(Number(getValue())),
  },
  {
    accessorKey: "investment",
    header: "Investment",
    cell: ({ getValue }) => formatCurrency(Number(getValue())),
  },
  {
    accessorKey: "portfolioPercent",
    header: "Portfolio %",
    cell: ({ getValue }) => formatPercent(Number(getValue())),
  },
  {
    accessorKey: "cmp",
    header: "CMP",
    cell: ({ getValue }) => formatCurrency(Number(getValue())),
  },
  {
    accessorKey: "presentValue",
    header: "Present Value",
    cell: ({ getValue }) => formatCurrency(Number(getValue())),
  },
  {
    accessorKey: "gainLoss",
    header: "Gain/Loss",
    cell: ({ getValue }) => {
      const value = Number(getValue());
      return (
        <span
          className={
            value >= 0
              ? "font-medium text-[var(--success)]"
              : "font-medium text-[var(--danger)]"
          }
        >
          {formatCompactCurrency(value)}
        </span>
      );
    },
  },
  {
    accessorKey: "peRatio",
    header: "PE Ratio",
    cell: ({ getValue }) => {
      const value = getValue();
      return typeof value === "number" ? value.toFixed(1) : "—";
    },
  },
  {
    accessorKey: "latestEarnings",
    header: "Latest Earnings",
    cell: ({ row }) => (
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="neutral">{row.original.latestEarnings}</Badge>
        {row.original.fundamentalsSource === "fallback" ? (
          <Badge tone="danger">Fallback</Badge>
        ) : null}
      </div>
    ),
  },
];

export function HoldingsTable({ data }: { data: Holding[] }) {
  // TanStack Table manages internal functions intentionally here.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-[color:var(--border)]">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-[var(--surface-muted)]">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
