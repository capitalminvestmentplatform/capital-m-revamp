import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

interface TableSkeletonProps {
  rows?: number;
  cols?: number;
  showSearch?: boolean;
}

export function TableSkeleton({
  rows = 8,
  cols = 5,
  showSearch = true,
}: TableSkeletonProps) {
  return (
    <Card className="p-4 space-y-3">
      {showSearch && (
        <div className="flex gap-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-9 w-24" />
        </div>
      )}
      <div className="flex gap-2">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-2 items-center">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-10 flex-1" />
          ))}
        </div>
      ))}
    </Card>
  );
}
