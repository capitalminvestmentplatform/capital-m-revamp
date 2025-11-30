// hooks/useSorting.ts
"use client";
import { useState } from "react";

export type SortOrder = "asc" | "desc";

export function useSorting(
  initial = { field: "createdAt", order: "desc" as SortOrder }
) {
  const [sortField, setSortField] = useState(initial.field);
  const [sortOrder, setSortOrder] = useState<SortOrder>(initial.order);

  const toggleSortOrder = () =>
    setSortOrder((p) => (p === "asc" ? "desc" : "asc"));
  const resetSorting = () => {
    setSortField(initial.field);
    setSortOrder(initial.order);
  };

  return {
    sortField,
    setSortField,
    sortOrder,
    setSortOrder,
    toggleSortOrder,
    resetSorting,
  };
}
