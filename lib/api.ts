"use client";

import axios from "axios";
import { PortfolioResponse } from "@/lib/types";

export async function fetchPortfolio() {
  const response = await axios.get<PortfolioResponse>("/api/portfolio");
  return response.data;
}
