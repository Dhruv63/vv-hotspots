"use client"

import { useEffect, useState, useRef } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { formatDistanceToNow } from "date-fns"
import { Loader2, X, Plus, Camera } from "lucide-react"
import type { HotspotPhoto } from "@/lib/types"
import { savePhotoAndAwardPoints } from "@/app/actions/photos"
import { toast } from "sonner"

interface PhotoGalleryProps {
  hotspotId: string
  refreshTrigger?: number
}

export function PhotoGallery({ hotspotId, refreshTrigger }: PhotoGalleryProps) {
  const router = useRouter()
  const [photos, setPhotos] = useState<HotspotPhoto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPhoto, setSelectedPhoto] = useState<HotspotPhoto | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchPhotos = async () => {
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
  }, [hotspotId, refreshTrigger])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      toast.error("You must be logged in to upload photos")
      router.push("/auth/login")
      if (fileInputRef.current) fileInputRef.current.value = ""
      return
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
    if (!validTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload JPG, PNG, or WebP.")
      if (fileInputRef.current) fileInputRef.current.value = ""
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image too large. Maximum 5MB.")
      if (fileInputRef.current) fileInputRef.current.value = ""
      return
    }

    // Check Cloudinary Config
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY
    if (!cloudName || !apiKey) {
      toast.error("Configuration error: Missing Cloudinary credentials")
      return
    }

    setIsUploading(true)
    const toastId = toast.loading("Uploading photo...")

    try {
      // 1. Prepare parameters for signature
      const timestamp = Math.round(new Date().getTime() / 1000)
      const folder = `vv-hotspots/${hotspotId}`
      const eager = "w_300,h_300,c_fill"
      const transformation = "w_1200,q_80,c_limit"

      const paramsToSign = {
        folder,
        timestamp,
        eager,
        transformation
      }

      // 2. Get Signature
      const signRes = await fetch('/api/sign-cloudinary-params', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paramsToSign }),
      })

      if (!signRes.ok) throw new Error("Failed to sign upload request")
      const { signature } = await signRes.json()

      // 3. Upload to Cloudinary
      const formData = new FormData()
      formData.append('file', file)
      formData.append('api_key', apiKey)
      formData.append('timestamp', timestamp.toString())
      formData.append('signature', signature)
      formData.append('folder', folder)
      formData.append('eager', eager)
      formData.append('transformation', transformation)

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData
      })

      if (!uploadRes.ok) {
        const errData = await uploadRes.json()
        throw new Error(errData.error?.message || "Upload failed")
      }

      const result = await uploadRes.json()

      // Determine Thumbnail URL
      let thumbnailUrl = result.secure_url
      if (result.eager && result.eager.length > 0) {
        thumbnailUrl = result.eager[0].secure_url
      } else {
        // Fallback
        thumbnailUrl = result.secure_url.replace("/upload/", "/upload/w_300,h_300,c_fill/")
      }

      // 4. Save to Supabase & Award Points
      const response = await savePhotoAndAwardPoints(hotspotId, result.secure_url, thumbnailUrl)

      toast.dismiss(toastId)
      if (response.success) {
        toast.success(`Photo uploaded! +${response.pointsAwarded} points ⭐`)
        fetchPhotos()
      }

    } catch (error: any) {
      console.error("Upload error:", error)
      toast.dismiss(toastId)
      toast.error(error.message || "Upload failed. Try again.")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const triggerUpload = async () => {
    // Check auth before opening file picker
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      toast.error("You must be logged in to upload photos")
      router.push("/auth/login")
      return
    }

    fileInputRef.current?.click()
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
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={handleFileSelect}
      />

      {photos.length === 0 ? (
        <div
          onClick={triggerUpload}
          className="flex flex-col items-center justify-center py-8 text-cyber-gray text-sm italic border border-cyber-gray/30 rounded-lg bg-black/30 cursor-pointer hover:bg-black/50 transition-colors group gap-4"
        >
          <p>No photos yet. Be the first to add one!</p>
          <button
            disabled={isUploading}
            className="flex items-center gap-2 px-4 py-2 rounded-md font-bold text-sm bg-pink-500 text-white dark:bg-[#FFFF00] dark:text-black shadow-[0_0_10px_rgba(255,20,147,0.4)] dark:shadow-[0_0_10px_rgba(255,255,0,0.4)] hover:shadow-[0_0_20px_rgba(255,20,147,0.6)] dark:hover:shadow-[0_0_20px_rgba(255,255,0,0.6)] transition-all transform group-hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            {isUploading ? "Uploading..." : "📸 Upload Photo (+20 points)"}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={triggerUpload}
              disabled={isUploading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold text-xs bg-pink-500 text-white dark:bg-[#FFFF00] dark:text-black shadow-md hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
              {isUploading ? "Uploading..." : "Add Photo"}
            </button>
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
