"use client"

import { useState } from "react"
import { CldUploadButton } from "next-cloudinary"
import { toast } from "sonner"
import { savePhotoAndAwardPoints } from "@/app/actions/photos"

interface PhotoUploadButtonProps {
  hotspotId: string
  onUploadComplete?: () => void
  className?: string
  children?: React.ReactNode
}

export function PhotoUploadButton({
  hotspotId,
  onUploadComplete,
  className,
  children
}: PhotoUploadButtonProps) {
  const [isSaving, setIsSaving] = useState(false)

  const handleUploadSuccess = async (result: any) => {
    setIsSaving(true)
    const toastId = toast.loading("Saving photo...")

    try {
      console.log("[PhotoUploadButton] Upload success:", result)
      const info = result.info

      if (!info || !info.secure_url) {
        throw new Error("Invalid upload result: missing secure_url")
      }

      // Determine thumbnail URL
      let thumbnailUrl = info.secure_url
      if (info.eager && info.eager.length > 0) {
        thumbnailUrl = info.eager[0].secure_url
      } else {
        // Fallback
        thumbnailUrl = info.secure_url.replace("/upload/", "/upload/w_300,h_300,c_fill/")
      }

      console.log("[PhotoUploadButton] Saving to database...", {
        hotspotId,
        imageUrl: info.secure_url,
        thumbnailUrl
      })

      const response = await savePhotoAndAwardPoints(hotspotId, info.secure_url, thumbnailUrl)

      toast.dismiss(toastId)
      if (response.success) {
        toast.success(`Photo uploaded! +${response.pointsAwarded} points ⭐`)
        if (onUploadComplete) {
          onUploadComplete()
        }
      }
    } catch (error: any) {
      console.error("[PhotoUploadButton] Error saving photo:", error)
      toast.dismiss(toastId)
      toast.error(error.message || "Failed to save photo.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleUploadError = (error: any) => {
    console.error("[PhotoUploadButton] Cloudinary Upload Error:", error)
    toast.error("Failed to upload photo to cloud.")
  }

  return (
    <CldUploadButton
      options={{
        folder: `vv-hotspots/${hotspotId}`,
        maxFileSize: 5000000,
        sources: ["local", "camera"],
      }}
      signatureEndpoint="/api/sign-cloudinary-params"
      onSuccess={handleUploadSuccess}
      onError={handleUploadError}
      className={className}
    >
      {children}
    </CldUploadButton>
  )
}
