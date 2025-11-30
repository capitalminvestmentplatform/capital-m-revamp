// hooks/useFilters.ts
"use client";
import { useState } from "react";

export function useFilters(initial = { search: "" }) {
  const [searchInput, setSearchInput] = useState(initial.search); // typing
  const [search, setSearch] = useState(initial.search); // applied

  const applySearch = () => setSearch(searchInput.trim());
  const clearSearch = () => {
    setSearchInput("");
    setSearch("");
  };

  return { searchInput, setSearchInput, search, applySearch, clearSearch };
}
