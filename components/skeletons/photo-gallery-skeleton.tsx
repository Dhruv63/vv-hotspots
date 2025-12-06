import { Skeleton } from "@/components/ui/skeleton"

export function PhotoGallerySkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-lg border-2 border-cyber-gray/30" />
        ))}
      </div>
    </div>
  )
}
