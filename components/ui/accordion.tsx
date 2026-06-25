import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function Accordion({
  items,
}: {
  items: {
    title: React.ReactNode;
    content: React.ReactNode;
    value: string;
  }[];
}) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <details
          key={item.value}
          className="group overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] open:border-[color:var(--border-strong)]"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4">
            <div className="min-w-0">{item.title}</div>
            <ChevronDown className="h-4 w-4 shrink-0 text-[var(--text-soft)] transition-transform group-open:rotate-180" />
          </summary>
          <div className={cn("border-t border-[color:var(--border)] px-5 py-4")}>{item.content}</div>
        </details>
      ))}
    </div>
  );
}
