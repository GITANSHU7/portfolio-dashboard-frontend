import { NextResponse } from "next/server";
import { getPortfolioSnapshot } from "@/lib/server/portfolio-service";
import type { PortfolioResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const backendUrl = process.env.PORTFOLIO_API_SERVER_URL;

  if (backendUrl) {
    try {
      const response = await fetch(resolvePortfolioEndpoint(backendUrl), {
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      });

      if (response.ok) {
        const payload = (await response.json()) as unknown;

        if (isPortfolioResponse(payload)) {
          return NextResponse.json(payload, {
            headers: {
              "cache-control": "no-store",
            },
          });
        }

        console.warn("Portfolio API returned an unexpected payload shape. Falling back locally.");
      }
    } catch {
      // Fall back to local server-side portfolio generation when backend is unavailable.
    }
  }

  const payload = await getPortfolioSnapshot();

  return NextResponse.json(payload, {
    headers: {
      "cache-control": "no-store",
    },
  });
}

function resolvePortfolioEndpoint(rawUrl: string) {
  const normalizedUrl = rawUrl.trim().replace(/\/+$/, "");

  if (normalizedUrl.endsWith("/api/portfolio")) {
    return normalizedUrl;
  }

  return `${normalizedUrl}/api/portfolio`;
}

function isPortfolioResponse(value: unknown): value is PortfolioResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Partial<PortfolioResponse>;

  return (
    typeof payload.updatedAt === "string" &&
    Array.isArray(payload.summary) &&
    Array.isArray(payload.sectors) &&
    Array.isArray(payload.holdings) &&
    typeof payload.dataStatus === "object" &&
    payload.dataStatus !== null &&
    typeof payload.dataStatus.message === "string"
  );
}
