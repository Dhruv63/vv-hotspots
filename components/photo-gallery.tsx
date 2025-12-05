"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { formatDistanceToNow } from "date-fns"
import { Loader2, X } from "lucide-react"
import type { HotspotPhoto } from "@/lib/types"

interface PhotoGalleryProps {
  hotspotId: string
  refreshTrigger?: number
}

export function PhotoGallery({ hotspotId, refreshTrigger }: PhotoGalleryProps) {
  const [photos, setPhotos] = useState<HotspotPhoto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPhoto, setSelectedPhoto] = useState<HotspotPhoto | null>(null)

  useEffect(() => {
    const fetchPhotos = async () => {
      setIsLoading(true)
      const supabase = createClient()
      const { data, error } = await supabase
        .from("hotspot_photos")
        .select(`
          *,
          profiles (
            username
          )
        `)
        .eq("hotspot_id", hotspotId)
        .order("created_at", { ascending: false })
        .limit(12)

      if (!error && data) {
        setPhotos(data as unknown as HotspotPhoto[])
      }
      setIsLoading(false)
    }

    fetchPhotos()
  }, [hotspotId, refreshTrigger])

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 text-cyber-cyan animate-spin" />
      </div>
    )
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-8 text-cyber-gray text-sm italic border border-cyber-gray/30 rounded-lg bg-black/30">
        No photos yet. Be the first to add one!
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg border-2 border-transparent hover:scale-105 transition-transform duration-300 dark:hover:border-[#FFFF00] dark:hover:shadow-[0_0_10px_rgba(255,255,0,0.3)] hover:border-pink-500 hover:shadow-[0_0_10px_rgba(255,20,147,0.2)]"
            onClick={() => setSelectedPhoto(photo)}
          >
            <Image
              src={photo.thumbnail_url || photo.image_url}
              alt="Hotspot photo"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 33vw, 25vw"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
            className="fixed inset-0 z-[2000] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative w-full max-w-4xl h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
             <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-12 right-0 md:top-0 md:-right-12 p-2 text-white hover:text-cyber-cyan transition-colors"
            >
              <X className="w-8 h-8" />
            </button>

            <div className="relative flex-1 bg-black rounded-lg overflow-hidden border border-cyber-gray/50 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                <Image
                  src={selectedPhoto.image_url}
                  alt="Hotspot photo full"
                  fill
                  className="object-contain"
                  quality={90}
                />
            </div>

            <div className="mt-4 flex justify-between items-center text-white">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyber-purple to-cyber-pink flex items-center justify-center font-bold text-xs text-white">
                        {selectedPhoto.profiles?.username?.[0]?.toUpperCase() || "?"}
                    </div>
                    <span className="font-mono font-bold text-cyber-light">
                      @{selectedPhoto.profiles?.username || "Unknown"}
                    </span>
                </div>
                <span className="text-gray-400 text-xs font-mono">
                  {formatDistanceToNow(new Date(selectedPhoto.created_at), { addSuffix: true })}
                </span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
