"use client"

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { CldUploadButton } from "next-cloudinary"

interface PhotoUploadButtonProps {
  hotspotId: string
  onUploadComplete?: () => void
  className?: string
  children?: any
}

export function PhotoUploadButton({
  hotspotId,
  className,
  children
}: PhotoUploadButtonProps) {

  const handleUploadSuccess = async (result: any) => {
    const supabase = createClientComponentClient()
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id

    const { data, error } = await supabase.from('hotspot_photos').insert({
      hotspot_id: hotspotId,
      user_id: userId,
      image_url: result.info.secure_url,
      thumbnail_url: result.info.secure_url,
      created_at: new Date().toISOString()
    })

    console.log(data)
    console.log(error)
  }

  const handleUploadError = (error: any) => {
    console.error("[PhotoUploadButton] Cloudinary Upload Error:", error)
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
