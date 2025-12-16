import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar Placeholder */}
      <div className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-4 shrink-0">
         <Skeleton className="h-8 w-8 rounded mr-2" />
         <Skeleton className="h-6 w-32" />
         <div className="ml-auto flex gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />
         </div>
      </div>

      <div className="container max-w-4xl mx-auto p-4 space-y-6 flex-1">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <Skeleton className="w-24 h-24 rounded-full" />
            <div className="space-y-2 flex-1">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-full max-w-md" />
                <div className="flex gap-2 pt-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-20" />
                </div>
            </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border pb-1">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-40 w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}
