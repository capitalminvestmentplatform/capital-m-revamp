// hooks/usePagination.ts
"use client";
import { useMemo, useState } from "react";

export function usePagination(initial = { page: 1, pageSize: 10 }) {
  const [page, setPage] = useState(initial.page);
  const [pageSize, setPageSize] = useState(initial.pageSize);
  const [total, setTotal] = useState(0);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize || 1)),
    [total, pageSize]
  );

  const resetPagination = () => {
    setPage(1);
    setPageSize(initial.pageSize);
  };

  // Convenience: clamp page if new totals shrink result set
  const clampPage = () => {
    if (page > totalPages) setPage(totalPages);
  };

  return {
    page,
    setPage,
    pageSize,
    setPageSize,
    total,
    setTotal,
    totalPages,
    resetPagination,
    clampPage,
  };
}
