// hooks/useServerTable.ts
"use client";
import { useEffect, useMemo } from "react";
import { usePagination } from "./usePagination";
import { useSorting, SortOrder } from "./useSorting";
import { useFilters } from "./useFilters";

type FetchFn<T> = (params: {
  page: number;
  limit: number;
  search: string;
  sortBy: string;
  sortOrder: SortOrder;
}) => Promise<{ items: T[]; total: number }>;

export function useServerTable<T>(opts: {
  initialPageSize?: number;
  initialSortField?: string;
  initialSortOrder?: SortOrder;
  fetcher: FetchFn<T>;
}) {
  const {
    page,
    setPage,
    pageSize,
    setPageSize,
    total,
    setTotal,
    totalPages,
    resetPagination,
    clampPage,
  } = usePagination({ page: 1, pageSize: opts.initialPageSize ?? 10 });

  const { sortField, setSortField, sortOrder, toggleSortOrder, resetSorting } =
    useSorting({
      field: opts.initialSortField ?? "createdAt",
      order: opts.initialSortOrder ?? "desc",
    });

  const { searchInput, setSearchInput, search, applySearch, clearSearch } =
    useFilters({ search: "" });

  const buildParams = useMemo(
    () => ({
      page,
      limit: pageSize,
      search,
      sortBy: sortField,
      sortOrder,
    }),
    [page, pageSize, search, sortField, sortOrder]
  );

  // data + loading state live in the caller (so this hook stays pure)
  const fetchPage = async () => {
    const { items, total } = await opts.fetcher(buildParams);
    setTotal(total);
    // ensure current page remains valid if total shrank
    clampPage();
    return items;
  };

  const resetAll = () => {
    clearSearch();
    resetSorting();
    resetPagination();
  };

  return {
    // state
    page,
    setPage,
    pageSize,
    setPageSize,
    total,
    totalPages,

    sortField,
    setSortField,
    sortOrder,
    toggleSortOrder,

    searchInput,
    setSearchInput,
    search,
    applySearch,
    clearSearch,

    // helpers
    buildParams,
    fetchPage,
    resetAll,
  };
}
