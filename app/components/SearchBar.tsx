"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUp, ArrowDown } from "lucide-react";

type SearchBarProps = {
  // search
  value: string;
  onChange: (val: string) => void;
  onSearch: () => void;

  // sort
  sortField: string; // e.g. "createdAt"
  onSortFieldChange: (field: string) => void;
  sortOrder: "asc" | "desc";
  onSortOrderToggle: () => void;

  // reset
  onReset: () => void;

  placeholder?: string;
  className?: string;
  sortFields?: { label: string; value: string }[];
};

export default function SearchBar({
  value,
  onChange,
  onSearch,
  sortField,
  onSortFieldChange,
  sortOrder,
  onSortOrderToggle,
  onReset,
  placeholder = "Search...",
  className = "",
  sortFields = [
    { label: "Created At", value: "createdAt" },
    { label: "Client Code", value: "clientCode" },
    { label: "First Name", value: "firstName" },
    { label: "Last Name", value: "lastName" },
  ],
}: SearchBarProps) {
  const canSearch = Boolean(value.trim());

  return (
    <div
      className={`flex flex-col gap-2 sm:flex-row sm:items-center ${className}`}
    >
      {/* Search input */}
      <div className="flex gap-2 flex-1">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && canSearch) onSearch();
          }}
          placeholder={placeholder}
          className="px-3 py-1 text-xs flex-1"
        />
        <Button
          onClick={onSearch}
          disabled={!canSearch}
          className={`px-4 py-2 text-xs font-semibold ${
            canSearch
              ? "bg-primaryBG text-white hover:bg-primaryBG"
              : "bg-gray-300 text-gray-600 cursor-not-allowed"
          }`}
        >
          Search
        </Button>
      </div>

      {/* Sort controls */}
      <div className="flex items-center gap-2">
        <p className="text-sm text-muted-foreground">Sort By: </p>
        <Select
          value={sortField}
          onValueChange={(val) => onSortFieldChange(val)}
        >
          <SelectTrigger className="w-[150px] h-9 text-xs">
            <SelectValue placeholder="Sort field" />
          </SelectTrigger>
          <SelectContent>
            {sortFields.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-xs">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="icon"
          onClick={onSortOrderToggle}
          title={`Sort ${sortOrder === "asc" ? "Ascending" : "Descending"}`}
        >
          {sortOrder === "asc" ? (
            <ArrowUp className="h-4 w-4" />
          ) : (
            <ArrowDown className="h-4 w-4" />
          )}
        </Button>

        {/* Reset */}
        <Button
          variant="outline"
          onClick={onReset}
          className="px-4 py-2 text-xs"
        >
          Reset
        </Button>
      </div>
    </div>
  );
}
