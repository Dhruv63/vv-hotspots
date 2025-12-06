"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { formatDistanceToNow } from "date-fns"
import { Loader2, X, Plus, Camera } from "lucide-react"
import type { HotspotPhoto } from "@/lib/types"
import { toast } from "sonner"
import { PhotoUploadButton } from "./photo-upload-button"

interface PhotoGalleryProps {
  hotspotId: string
  refreshTrigger?: number
}

export function PhotoGallery({ hotspotId, refreshTrigger }: PhotoGalleryProps) {
  const router = useRouter()
  const [photos, setPhotos] = useState<HotspotPhoto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPhoto, setSelectedPhoto] = useState<HotspotPhoto | null>(null)
  const [session, setSession] = useState<any>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }: { data: { session: any } }) => {
      setSession(data.session)
    })
  }, [])

  const fetchPhotos = async () => {
    const supabase = createClient()

    try {
      let query = supabase
        .from("hotspot_photos")
        .select(`
          *,
          profiles (
            username
          )
        `, { count: 'exact' })
        .eq("hotspot_id", hotspotId)
        .order("created_at", { ascending: false })

      if (!isExpanded) {
        query = query.limit(8)
      } else {
        query = query.limit(50)
      }

      const { data, error, count } = await query

      if (!error && data) {
        setPhotos(data as unknown as HotspotPhoto[])
        if (count !== null) setTotalCount(count)
      }
    } catch (error) {
      console.error("Error fetching photos:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPhotos()

    const supabase = createClient()
    const channel = supabase
      .channel(`hotspot_photos_${hotspotId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'hotspot_photos',
          filter: `hotspot_id=eq.${hotspotId}`,
        },
        () => {
          fetchPhotos()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [hotspotId, refreshTrigger, isExpanded])


  const handleLoginRedirect = () => {
    toast.error("You must be logged in to upload photos")
    router.push("/auth/login")
  }

  if (isLoading && photos.length === 0) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 text-cyber-cyan animate-spin" />
      </div>
    )
  }

  return (
    <>
      {photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-cyber-gray text-sm italic border border-cyber-gray/30 rounded-lg bg-black/30 group gap-4">
          <p>No photos yet. Be the first to add one!</p>
          {session ? (
            <PhotoUploadButton
              hotspotId={hotspotId}
              onUploadComplete={fetchPhotos}
              className="flex items-center gap-2 px-4 py-2 rounded-md font-bold text-sm bg-pink-500 text-white dark:bg-[#FFFF00] dark:text-black shadow-[0_0_10px_rgba(255,20,147,0.4)] dark:shadow-[0_0_10px_rgba(255,255,0,0.4)] hover:shadow-[0_0_20px_rgba(255,20,147,0.6)] dark:hover:shadow-[0_0_20px_rgba(255,255,0,0.6)] transition-all transform group-hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Camera className="w-4 h-4 mr-2" />
              Upload Photo (+20 points)
            </PhotoUploadButton>
          ) : (
            <button
              onClick={handleLoginRedirect}
              className="flex items-center gap-2 px-4 py-2 rounded-md font-bold text-sm bg-pink-500 text-white dark:bg-[#FFFF00] dark:text-black shadow-[0_0_10px_rgba(255,20,147,0.4)] dark:shadow-[0_0_10px_rgba(255,255,0,0.4)] hover:shadow-[0_0_20px_rgba(255,20,147,0.6)] dark:hover:shadow-[0_0_20px_rgba(255,255,0,0.6)] transition-all transform group-hover:scale-105"
            >
              <Camera className="w-4 h-4 mr-2" />
              Upload Photo (+20 points)
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-end">
            {session ? (
              <PhotoUploadButton
                hotspotId={hotspotId}
                onUploadComplete={fetchPhotos}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold text-xs bg-pink-500 text-white dark:bg-[#FFFF00] dark:text-black shadow-md hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Photo
              </PhotoUploadButton>
            ) : (
              <button
                onClick={handleLoginRedirect}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold text-xs bg-pink-500 text-white dark:bg-[#FFFF00] dark:text-black shadow-md hover:shadow-lg transition-all transform hover:scale-105"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Photo
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg border-2 border-pink-500/30 dark:border-[#FFFF00]/30 hover:border-pink-500 dark:hover:border-[#FFFF00] hover:shadow-[0_0_10px_rgba(255,20,147,0.4)] dark:hover:shadow-[0_0_10px_rgba(255,255,0,0.4)] transition-all duration-300 hover:scale-105"
                onClick={() => setSelectedPhoto(photo)}
              >
                <Image
                  src={photo.thumbnail_url || photo.image_url}
                  alt="Hotspot photo"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </div>
            ))}
          </div>

          {!isExpanded && totalCount > 8 && (
            <button
              onClick={() => setIsExpanded(true)}
              className="w-full py-2 text-center text-xs font-mono font-bold text-cyber-cyan hover:text-cyber-pink transition-colors border border-cyber-cyan/30 rounded hover:bg-cyber-cyan/10"
            >
              View all {totalCount} photos
            </button>
          )}
        </div>
      )}

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
