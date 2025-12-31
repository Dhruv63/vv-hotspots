"use client"

import { useState, useEffect } from "react"
import { Modal } from "@/components/ui/modal"
import { Hotspot } from "@/lib/types"
import { Loader2, Check, MapPin, Globe, Lock } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { sanitizeInput, checkRateLimit } from "@/lib/security"
import { calculateDistance } from "@/lib/utils"

interface CheckInModalProps {
  isOpen: boolean
  onClose: () => void
  hotspot: Hotspot | null
  onCheckInSuccess: (hotspotId: string) => void
}

export function CheckInModal({ isOpen, onClose, hotspot, onCheckInSuccess }: CheckInModalProps) {
  const [note, setNote] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false)
      setIsLoading(false)
    }
  }, [isOpen])

  if (!hotspot) return null

  const handleSubmit = async () => {
    if (isLoading) return
    setIsLoading(true)
    const supabase = createClient()

    try {
      // 0. Verify Location (Strict Geofencing)
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("Geolocation is not supported by your browser"))
        } else {
          navigator.geolocation.getCurrentPosition(
            resolve,
            () => reject(new Error("Unable to retrieve your location. Please enable GPS.")),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
          )
        }
      })

      const { latitude, longitude, accuracy } = position.coords
      const distanceKm = calculateDistance(
        latitude,
        longitude,
        Number(hotspot.latitude),
        Number(hotspot.longitude)
      )
      const distanceMeters = Math.round(distanceKm * 1000)

      console.log(`Check-in Debug: Distance ${distanceMeters}m, Accuracy ${accuracy}m`)

      // Warn if accuracy is poor
      if (accuracy > 100) {
        toast.warning(`Your GPS signal is weak (${Math.round(accuracy)}m accuracy). Try moving outside.`)
      }

      // STRICT 100m Check
      if (distanceMeters > 100) {
        throw new Error(`You are ${distanceMeters}m away! Move closer to the entrance to check in.`)
      }

      // 1. Get User
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      console.log("Check-in Debug: User ID", user?.id)
      console.log("Check-in Debug: Hotspot ID", hotspot.id)

      if (authError || !user) {
        throw new Error("Authentication required")
      }

      // 2. Rate Limit
      const rateCheck = checkRateLimit("checkIn", user.id)
      if (!rateCheck.allowed && rateCheck.waitTime) {
        throw new Error(`Please wait ${rateCheck.waitTime} seconds before checking in again`)
      }

      // 3. Deactivate old check-ins
      const { error: updateError } = await supabase
        .from("check_ins")
        .update({ is_active: false })
        .eq("user_id", user.id)
        .eq("is_active", true)

      if (updateError) {
         console.error("Error deactivating old check-ins:", updateError)
         throw updateError
      }

      // 4. Insert new check-in
      const sanitizedNote = note ? sanitizeInput(note) : null
      const { data: insertData, error: insertError } = await supabase
        .from("check_ins")
        .insert({
          user_id: user.id,
          hotspot_id: hotspot.id,
          is_active: true,
          checked_in_at: new Date().toISOString(),
          note: sanitizedNote,
          is_public: isPublic
        })
        .select()
        .single()

      console.log("Check-in Debug: Insert Response", { data: insertData, error: insertError })

      if (insertError) throw insertError

      // Success
      setIsSuccess(true)
      toast.success(
        <div className="flex flex-col gap-1">
          <span className="font-bold">Checked in at {hotspot.name}!</span>
          <span className="text-xs flex items-center gap-1">
            <Check className="w-3 h-3" /> Verified Visit (&lt;100m)
          </span>
        </div>
      )

      // Delay closing to show success state and trigger refresh
      setTimeout(() => {
        onCheckInSuccess(hotspot.id)
        setNote("")
        setIsPublic(true)
        setIsSuccess(false)
        onClose()
      }, 1000)

    } catch (error: any) {
      console.error("Check-in error:", error)
      toast.error(error.message || "Failed to check in")
      setIsLoading(false) // Only stop loading on error, on success we keep showing success state until close
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Check In">
      <div className="p-6 space-y-6">

        {/* Hotspot Info */}
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white font-mono">{hotspot.name}</h2>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <MapPin className="w-4 h-4" />
            <span className="line-clamp-1">{hotspot.address}</span>
          </div>
        </div>

        {/* Note Input */}
        <div className="space-y-2">
            <label className="text-xs font-mono text-[#E8FF00] uppercase tracking-wider">Add a Note</label>
            <div className="relative">
                <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    maxLength={150}
                    placeholder="What are you doing here?"
                    className="w-full bg-[#0A0E27] border border-gray-700 rounded-lg p-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#E8FF00] focus:ring-1 focus:ring-[#E8FF00] transition-all resize-none h-24 text-sm"
                />
                <span className="absolute bottom-2 right-2 text-[10px] text-gray-500 font-mono">
                    {note.length}/150
                </span>
            </div>
        </div>

        {/* Privacy Toggle */}
        <div className="flex items-center justify-between bg-[#0A0E27] p-3 rounded-lg border border-gray-800">
            <div className="flex items-center gap-3">
                {isPublic ? <Globe className="w-5 h-5 text-cyan-400" /> : <Lock className="w-5 h-5 text-pink-500" />}
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">{isPublic ? "Public Check-in" : "Private Check-in"}</span>
                    <span className="text-xs text-gray-500">{isPublic ? "Visible to everyone" : "Only visible to you"}</span>
                </div>
            </div>

            <button
                onClick={() => setIsPublic(!isPublic)}
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${isPublic ? "bg-cyan-500" : "bg-gray-600"}`}
            >
                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${isPublic ? "translate-x-6" : "translate-x-0"}`} />
            </button>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
            <button
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-lg border border-gray-600 text-gray-300 font-mono text-sm hover:bg-gray-800 transition-colors"
                disabled={isLoading || isSuccess}
            >
                Cancel
            </button>
            <button
                onClick={handleSubmit}
                disabled={isLoading || isSuccess}
                className={`flex-1 py-3 px-4 rounded-lg font-mono font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(232,255,0,0.3)] ${
                    isSuccess
                        ? "bg-green-500 text-white hover:bg-green-600"
                        : "bg-[#E8FF00] text-black hover:bg-[#D4E600]"
                }`}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Checking in...
                    </>
                ) : isSuccess ? (
                    <>
                        <Check className="w-4 h-4" />
                        CHECKED IN
                    </>
                ) : (
                    <>
                        <Check className="w-4 h-4" />
                        CHECK IN
                    </>
                )}
            </button>
        </div>

      </div>
    </Modal>
  )
}
