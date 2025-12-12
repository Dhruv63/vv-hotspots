import { Skeleton } from "@/components/ui/skeleton"
import { CyberCard } from "@/components/ui/cyber-card"

export default function Loading() {
  return (
    <div className="min-h-screen bg-cyber-black scanlines">
      {/* Navbar Placeholder */}
      <div className="h-16 border-b border-cyber-gray/30 bg-cyber-black flex items-center px-4 fixed w-full z-50">
        <Skeleton className="h-8 w-8 rounded mr-2" />
        <Skeleton className="h-6 w-32" />
      </div>

      <main className="pt-20 pb-12 px-4 max-w-4xl mx-auto">
        {/* Back button */}
        <div className="mb-6">
           <Skeleton className="h-4 w-24" />
        </div>

        {/* Profile Header */}
        <CyberCard className="p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-cyber-dark bg-cyber-dark overflow-hidden shrink-0">
               <Skeleton className="w-full h-full" />
            </div>

            <div className="flex-1 w-full text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-2 justify-center sm:justify-start">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-32 mb-4 mx-auto sm:mx-0" />

              <div className="space-y-2 mb-4">
                 <Skeleton className="h-4 w-40 mx-auto sm:mx-0" />
                 <Skeleton className="h-16 w-full max-w-lg mx-auto sm:mx-0" />
              </div>

              {/* Stats */}
              <div className="flex justify-center sm:justify-start gap-6 sm:gap-8 mt-4">
                 <div className="flex flex-col items-center">
                    <Skeleton className="h-8 w-8 mb-1" />
                    <Skeleton className="h-3 w-16" />
                 </div>
                 <div className="flex flex-col items-center">
                    <Skeleton className="h-8 w-8 mb-1" />
                    <Skeleton className="h-3 w-16" />
                 </div>
                 <div className="flex flex-col items-center">
                    <Skeleton className="h-8 w-8 mb-1" />
                    <Skeleton className="h-3 w-16" />
                 </div>
                 <div className="flex flex-col items-center">
                    <Skeleton className="h-8 w-8 mb-1" />
                    <Skeleton className="h-3 w-16" />
                 </div>
              </div>
            </div>
          </div>
        </CyberCard>

        <div className="mt-8">
          {/* Tabs Navigation */}
          <div className="flex overflow-x-auto border-b border-cyber-gray/30 mb-6 gap-2 pb-1">
             <Skeleton className="h-10 w-32 shrink-0" />
             <Skeleton className="h-10 w-32 shrink-0" />
             <Skeleton className="h-10 w-32 shrink-0" />
             <Skeleton className="h-10 w-32 shrink-0" />
          </div>

          {/* Tab Content Skeleton */}
          <CyberCard className="p-4 h-[400px]">
             <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-16" />
             </div>
             <div className="space-y-4">
                <Skeleton className="h-24 w-full rounded-lg" />
                <Skeleton className="h-24 w-full rounded-lg" />
                <Skeleton className="h-24 w-full rounded-lg" />
             </div>
          </CyberCard>
        </div>
      </main>
    </div>
  )
}
