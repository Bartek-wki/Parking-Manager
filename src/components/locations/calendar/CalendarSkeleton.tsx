import { Skeleton } from "@/components/ui/skeleton";

export function CalendarSkeleton() {
  return (
    <div className="flex flex-col space-y-4 h-full w-full">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-10 w-32" /> {/* Month Title */}
          <div className="flex space-x-1">
            <Skeleton className="h-8 w-8 rounded-full" /> {/* Prev */}
            <Skeleton className="h-8 w-8 rounded-full" /> {/* Next */}
            <Skeleton className="h-8 w-16" /> {/* Today */}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-10 w-48" /> {/* Filter */}
          <Skeleton className="h-10 w-24" /> {/* View Switcher */}
        </div>
      </div>

      {/* Grid Skeleton (approximate 7 cols x 5 rows) */}
      <div className="grid grid-cols-7 gap-px bg-muted border rounded-lg overflow-hidden flex-1 min-h-[600px]">
        {/* Days Header */}
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={`header-${i}`} className="p-4 text-center bg-background border-b">
            <Skeleton className="h-4 w-12 mx-auto" />
          </div>
        ))}

        {/* Calendar Cells */}
        {Array.from({ length: 35 }).map((_, i) => (
          <div
            key={`cell-${i}`}
            className="bg-background min-h-[100px] p-2 border-b border-r relative"
          >
            <div className="flex justify-end mb-2">
              <Skeleton className="h-4 w-6" /> {/* Date number */}
            </div>
            {/* Random "events" to simulate content */}
            {i % 3 === 0 && <Skeleton className="h-6 w-full mb-1 rounded-sm" />}
            {i % 7 === 0 && <Skeleton className="h-6 w-3/4 mb-1 rounded-sm" />}
          </div>
        ))}
      </div>
    </div>
  );
}
