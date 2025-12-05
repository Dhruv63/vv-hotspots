"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { formatDistanceToNow } from "date-fns"
import { Loader2, X, Plus, Camera } from "lucide-react"
import type { HotspotPhoto } from "@/lib/types"
import { CldUploadWidget, CloudinaryUploadWidgetResults } from "next-cloudinary"
import { savePhotoAndAwardPoints } from "@/app/actions/photos"
import { toast } from "sonner"

interface PhotoGalleryProps {
  hotspotId: string
  refreshTrigger?: number
}

export function PhotoGallery({ hotspotId, refreshTrigger }: PhotoGalleryProps) {
  const [photos, setPhotos] = useState<HotspotPhoto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPhoto, setSelectedPhoto] = useState<HotspotPhoto | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const fetchPhotos = async () => {
    // Keep loading state mainly for initial load, but for refreshes after upload we might just want to update
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

  useEffect(() => {
    fetchPhotos()
  }, [hotspotId, refreshTrigger])

  const handleUploadSuccess = async (result: CloudinaryUploadWidgetResults) => {
    if (result.event !== "success" || !result.info || typeof result.info === "string") {
      return
    }

    setIsUploading(true)
    try {
      const secureUrl = result.info.secure_url
      // Construct thumbnail URL (300x300, fill)
      // Standard Cloudinary: replace "/upload/" with "/upload/w_300,h_300,c_fill/"
      const thumbnailUrl = secureUrl.replace("/upload/", "/upload/w_300,h_300,c_fill/")

      const response = await savePhotoAndAwardPoints(hotspotId, secureUrl, thumbnailUrl)

      if (response.success) {
        toast.success(`Photo uploaded! +${response.pointsAwarded} points ⭐`)
        await fetchPhotos()
      }
    } catch (error: any) {
      console.error("Upload processing failed:", error)
      toast.error(error.message || "Failed to process upload")
    } finally {
      setIsUploading(false)
    }
  }

  const handleUploadError = (error: any) => {
    console.error("Upload failed:", error)
    toast.error("Upload failed. Please try again.")
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
         <CldUploadWidget
            signatureEndpoint="/api/sign-cloudinary-params"
            options={{
              cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
              folder: `vv-hotspots/${hotspotId}`,
              maxFileSize: 5000000, // 5MB
              sources: ['local', 'camera'],
              resourceType: 'image',
              clientAllowedFormats: ['png', 'jpeg', 'webp', 'jpg'],
              maxImageWidth: 1200,
              styles: {
                  palette: {
                      window: "#000000",
                      sourceBg: "#000000",
                      windowBorder: "#FFFF00",
                      tabIcon: "#CCFF00",
                      inactiveTabIcon: "#E0E0E0",
                      menuIcons: "#FFFF00",
                      link: "#CCFF00",
                      action: "#FFFF00",
                      inProgress: "#CCFF00",
                      complete: "#39FF14",
                      error: "#FF0000",
                      textDark: "#000000",
                      textLight: "#FFFFFF"
                  }
              }
            }}
            onSuccess={handleUploadSuccess}
            onError={handleUploadError}
          >
            {({ open }) => (
              <div
                onClick={() => open()}
                className="flex flex-col items-center justify-center py-8 text-cyber-gray text-sm italic border border-cyber-gray/30 rounded-lg bg-black/30 cursor-pointer hover:bg-black/50 transition-colors group gap-4"
              >
                <p>No photos yet. Be the first to add one!</p>
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-md font-bold text-sm bg-pink-500 text-white dark:bg-[#FFFF00] dark:text-black shadow-[0_0_10px_rgba(255,20,147,0.4)] dark:shadow-[0_0_10px_rgba(255,255,0,0.4)] hover:shadow-[0_0_20px_rgba(255,20,147,0.6)] dark:hover:shadow-[0_0_20px_rgba(255,255,0,0.6)] transition-all transform group-hover:scale-105"
                >
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                  {isUploading ? "Uploading..." : "📸 Add Photo (+20 points)"}
                </button>
              </div>
            )}
          </CldUploadWidget>
      ) : (
        <div className="space-y-4">
           {/* Add Photo Button (Small) */}
           <div className="flex justify-end">
              <CldUploadWidget
                signatureEndpoint="/api/sign-cloudinary-params"
                options={{
                  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
                  folder: `vv-hotspots/${hotspotId}`,
                  maxFileSize: 5000000,
                  sources: ['local', 'camera'],
                  resourceType: 'image',
                  clientAllowedFormats: ['png', 'jpeg', 'webp', 'jpg'],
                  maxImageWidth: 1200,
                  styles: {
                    palette: {
                        window: "#000000",
                        sourceBg: "#000000",
                        windowBorder: "#FFFF00",
                        tabIcon: "#CCFF00",
                        inactiveTabIcon: "#E0E0E0",
                        menuIcons: "#FFFF00",
                        link: "#CCFF00",
                        action: "#FFFF00",
                        inProgress: "#CCFF00",
                        complete: "#39FF14",
                        error: "#FF0000",
                        textDark: "#000000",
                        textLight: "#FFFFFF"
                    }
                  }
                }}
                onSuccess={handleUploadSuccess}
                onError={handleUploadError}
              >
                {({ open }) => (
                  <button
                    onClick={() => open()}
                    disabled={isUploading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold text-xs bg-pink-500 text-white dark:bg-[#FFFF00] dark:text-black shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                  >
                    {isUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                    Add Photo
                  </button>
                )}
              </CldUploadWidget>
           </div>

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
