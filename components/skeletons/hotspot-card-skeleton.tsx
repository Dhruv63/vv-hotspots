import { Skeleton } from "@/components/ui/skeleton"

export function HotspotCardSkeleton() {
  return (
    <div className="flex flex-col h-full bg-cyber-dark border border-cyber-gray rounded-lg overflow-hidden">
      {/* Image placeholder */}
      <div className="h-[120px] w-full shrink-0 relative">
        <Skeleton className="h-full w-full" />
      </div>

      {/* Content placeholder */}
      <div className="p-3 flex flex-col flex-1 gap-2">
        {/* Title */}
        <Skeleton className="h-5 w-3/4" />

        {/* Address */}
        <div className="flex items-center gap-1 mt-1">
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-3 w-full" />
        </div>

        {/* Rating */}
        <div className="mt-auto flex items-center gap-1 pt-2">
           <Skeleton className="h-4 w-10" />
           <Skeleton className="h-4 w-4 rounded-full" />
        </div>

        {/* Buttons - simulating the two buttons often present */}
        <div className="mt-2 pt-1 w-full flex gap-2">
           <Skeleton className="h-10 w-1/2 rounded-lg" />
           <Skeleton className="h-10 w-1/2 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
