"use client"

import { CldUploadWidget } from "next-cloudinary"
import { Camera, Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { savePhotoAndAwardPoints } from "@/app/actions/photos"
import { cn } from "@/lib/utils"

interface PhotoUploadProps {
  hotspotId: string
  onUploadSuccess: () => void
  className?: string
}

export function PhotoUpload({ hotspotId, onUploadSuccess, className }: PhotoUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  return (
    <div className={cn("w-full", className)}>
      <CldUploadWidget
        signatureEndpoint="/api/sign-cloudinary-params"
        options={{
          sources: ["local", "camera"],
          resourceType: "image",
          maxFileSize: 5000000, // 5MB
          clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
          folder: `vv-hotspots/${hotspotId}`,
          tags: ["hotspot_checkin"],
          maxImageWidth: 1200,
          validateMaxWidthHeight: true,
          styles: {
            palette: {
              window: "#000000",
              sourceBg: "#1a1a1a",
              windowBorder: "#FFFF00",
              tabIcon: "#FFFF00",
              inactiveTabIcon: "#808080",
              menuIcons: "#FFFF00",
              link: "#CCFF00",
              action: "#FFFF00",
              inProgress: "#CCFF00",
              complete: "#00FF00",
              error: "#FF0000",
              textDark: "#000000",
              textLight: "#FFFFFF",
            },
          },
        }}
        onSuccess={async (result, { widget }) => {
          setIsProcessing(true)
          try {
            const info = result.info
            if (typeof info !== "object" || !info || !("secure_url" in info)) {
              throw new Error("No image URL returned")
            }

            const imageUrl = (info as any).secure_url as string
            // Create thumbnail URL (300x300 crop)
            const thumbnailUrl = imageUrl.replace(
              "/upload/",
              "/upload/w_300,h_300,c_fill,q_80/"
            )

            const response = await savePhotoAndAwardPoints(
              hotspotId,
              imageUrl,
              thumbnailUrl
            )

            if (response.success) {
              toast.success("Photo uploaded! +20 points ⭐")
              onUploadSuccess()
            }
          } catch (error) {
            console.error(error)
            toast.error(
              error instanceof Error ? error.message : "Upload failed"
            )
          } finally {
            setIsProcessing(false)
            widget.close()
          }
        }}
        onError={(error) => {
            console.error("Cloudinary Error:", error)
            toast.error("Upload failed. Please try again.")
        }}
      >
        {({ open }) => (
          <button
            onClick={() => open()}
            disabled={isProcessing}
            className="w-full py-3 px-4 bg-gradient-to-r from-cyber-purple to-cyber-pink text-white font-mono font-bold rounded-lg shadow-[0_0_15px_rgba(255,20,147,0.4)] hover:shadow-[0_0_25px_rgba(255,20,147,0.6)] transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                PROCESSING...
              </>
            ) : (
              <>
                <Camera className="w-5 h-5" />
                Add Photo? 📸 (+20 points)
              </>
            )}
          </button>
        )}
      </CldUploadWidget>
    </div>
  )
}
