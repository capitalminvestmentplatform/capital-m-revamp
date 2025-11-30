"use client";
import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type Props = {
  page: number;
  total: number;
  totalPages: number;
  onChange: (nextPage: number) => void;

  pageSize: number;
  onPageSizeChange: (n: number) => void;
  pageSizeOptions?: number[];

  className?: string;
  windowSize?: number;
};

export default function Pagination({
  page,
  total,
  totalPages,
  onChange,
  pageSize,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50, 100],
  className = "",
  windowSize = 5,
}: Props) {
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const pageNumbers = useMemo(() => {
    if (totalPages <= 0) return [];
    const start = Math.max(1, page - Math.floor(windowSize / 2));
    const end = Math.min(totalPages, start + windowSize - 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [page, totalPages, windowSize]);

  const startIdx = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIdx = Math.min(total, page * pageSize);

  return (
    <div
      className={`mt-6 flex flex-wrap items-center justify-between gap-4 ${className}`}
    >
      {/* Left: total + rows-per-page */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium">{startIdx}</span>–
          <span className="font-medium">{endIdx}</span> of{" "}
          <span className="font-medium">{total}</span>
        </p>

        <div className="flex items-center gap-2">
          <Label htmlFor="rows-per-page" className="text-sm">
            Rows per page:
          </Label>
          <Select
            value={String(pageSize)}
            onValueChange={(val) => onPageSizeChange(Number(val))}
          >
            <SelectTrigger id="rows-per-page" className="w-[80px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Right: pagination controls */}
      <div className="flex items-center gap-3">
        <div className="text-sm text-muted-foreground">
          Page <span className="font-medium">{page}</span> of{" "}
          <span className="font-medium">{totalPages}</span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => canPrev && onChange(page - 1)}
            disabled={!canPrev}
          >
            Prev
          </Button>

          {pageNumbers.map((p) => (
            <Button
              key={p}
              variant={p === page ? "default" : "outline"}
              size="sm"
              onClick={() => onChange(p)}
              className={p === page ? "bg-primaryBG" : ""}
            >
              {p}
            </Button>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={() => canNext && onChange(page + 1)}
            disabled={!canNext}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
