import { NextResponse } from "next/server";
import { getPortfolioSnapshot } from "@/lib/server/portfolio-service";

export const dynamic = "force-dynamic";

export async function GET() {
  const backendUrl = process.env.PORTFOLIO_API_SERVER_URL;

  if (backendUrl) {
    try {
      const response = await fetch(backendUrl, {
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      });

      if (response.ok) {
        const payload = await response.json();

        return NextResponse.json(payload, {
          headers: {
            "cache-control": "no-store",
          },
        });
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
