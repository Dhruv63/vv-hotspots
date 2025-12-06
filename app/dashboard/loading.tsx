import { HotspotCardSkeleton } from "@/components/skeletons/hotspot-card-skeleton"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="h-screen flex flex-col bg-cyber-black overflow-hidden">
      {/* Navbar Placeholder */}
      <div className="h-16 border-b border-cyber-gray bg-cyber-black/90 flex items-center px-4 shrink-0">
         <Skeleton className="h-8 w-8 rounded mr-2" />
         <Skeleton className="h-6 w-32" />
         <div className="ml-auto flex gap-4">
            <Skeleton className="h-8 w-20 hidden md:block" />
            <Skeleton className="h-8 w-20 hidden md:block" />
            <Skeleton className="h-8 w-8 rounded-full" />
         </div>
      </div>

      <div className="flex-1 flex relative overflow-hidden">
         {/* Sidebar - Hotspots */}
         <div className="hidden md:block w-72 lg:w-80 h-full bg-cyber-dark border-r border-cyber-gray p-4 overflow-hidden shrink-0">
            <Skeleton className="h-10 w-full mb-4" /> {/* Search */}
            <div className="flex gap-2 mb-4 overflow-hidden">
               <Skeleton className="h-6 w-16" />
               <Skeleton className="h-6 w-16" />
               <Skeleton className="h-6 w-16" />
            </div>
            <div className="space-y-4 overflow-y-auto h-[calc(100%-100px)] pb-4">
               {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-[240px]">
                     <HotspotCardSkeleton />
                  </div>
               ))}
            </div>
         </div>

         {/* Map Area */}
         <div className="flex-1 relative bg-cyber-black flex flex-col">
            <div className="flex-1 relative">
                {/* Simulated Map Shimmer */}
                <div className="absolute inset-0 skeleton-shimmer opacity-20" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex flex-col items-center p-6 bg-cyber-dark/80 border border-cyber-cyan/30 rounded-lg backdrop-blur-sm">
                        <div className="w-12 h-12 border-4 border-cyber-cyan border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-cyber-cyan font-mono text-lg animate-pulse">LOADING SYSTEM...</p>
                    </div>
                </div>
            </div>
         </div>

         {/* Feed Sidebar */}
         <div className="hidden lg:block w-72 lg:w-80 h-full bg-cyber-dark border-l border-cyber-gray p-4 shrink-0 overflow-hidden">
            <Skeleton className="h-6 w-32 mb-4" />
             <div className="space-y-3">
               {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                      <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                      <div className="space-y-2 flex-1">
                          <Skeleton className="h-3 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                      </div>
                  </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  )
}
