import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type ProjectedReturn = {
  type: "percentage" | "amount";
  mode: "fixed" | "range";
  fixedValue?: number;
  minValue?: number;
  maxValue?: number;
  currency?: string | null;
};

/**
 * Formats a projectedReturn object into a human-readable string.
 * Examples:
 *   { type:"percentage", mode:"fixed", fixedValue:20 } → "20%"
 *   { type:"amount", mode:"fixed", fixedValue:200000, currency:"AED" } → "200,000 AED"
 *   { type:"percentage", mode:"range", minValue:10, maxValue:20 } → "10% - 20%"
 *   { type:"amount", mode:"range", minValue:100000, maxValue:150000, currency:"AED" } → "100,000 AED - 150,000 AED"
 */
export function formatProjectedReturn(pr?: ProjectedReturn | null): string {
  if (!pr) return "-";

  const formatter = new Intl.NumberFormat("en-US");

  if (pr.mode === "fixed") {
    if (pr.type === "percentage") {
      return `${formatter.format(pr.fixedValue ?? 0)}%`;
    } else {
      return `${formatter.format(pr.fixedValue ?? 0)} ${pr.currency || "AED"}`;
    }
  }

  if (pr.mode === "range") {
    if (pr.type === "percentage") {
      return `${formatter.format(pr.minValue ?? 0)}% - ${formatter.format(
        pr.maxValue ?? 0
      )}%`;
    } else {
      return `${formatter.format(pr.minValue ?? 0)} ${pr.currency || "AED"} - ${formatter.format(
        pr.maxValue ?? 0
      )} ${pr.currency || "AED"}`;
    }
  }

  return "-";
}
