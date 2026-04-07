import { cn } from "@/lib/utils";

interface ShimmerSkeletonProps {
  className?: string;
}

export function ShimmerSkeleton({ className }: ShimmerSkeletonProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-muted/50",
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:animate-[shimmer_2s_infinite]",
        "before:bg-gradient-to-r before:from-transparent before:via-foreground/5 before:to-transparent",
        className
      )}
    />
  );
}

export function DreamCardSkeleton() {
  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center gap-3">
        <ShimmerSkeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <ShimmerSkeleton className="h-3 w-24" />
          <ShimmerSkeleton className="h-2 w-16" />
        </div>
      </div>
      <ShimmerSkeleton className="h-5 w-3/4" />
      <ShimmerSkeleton className="h-3 w-full" />
      <ShimmerSkeleton className="h-3 w-2/3" />
      <div className="flex gap-4 pt-2">
        <ShimmerSkeleton className="h-4 w-12" />
        <ShimmerSkeleton className="h-4 w-12" />
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="text-center py-3 glass rounded-xl">
      <ShimmerSkeleton className="w-4 h-4 mx-auto mb-2 rounded" />
      <ShimmerSkeleton className="h-5 w-8 mx-auto mb-1" />
      <ShimmerSkeleton className="h-2 w-10 mx-auto" />
    </div>
  );
}
