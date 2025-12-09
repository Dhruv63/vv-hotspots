"use client"

import { useState } from "react"
import { Modal } from "@/components/ui/modal"
import { Hotspot } from "@/lib/types"
import { Loader2, Check, MapPin, Globe, Lock } from "lucide-react"
import { toast } from "sonner"

interface CheckInModalProps {
  isOpen: boolean
  onClose: () => void
  hotspot: Hotspot | null
  onCheckIn: (hotspot: Hotspot, note: string, isPublic: boolean) => Promise<void>
}

export function CheckInModal({ isOpen, onClose, hotspot, onCheckIn }: CheckInModalProps) {
  const [note, setNote] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  if (!hotspot) return null

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      await onCheckIn(hotspot, note, isPublic)
      toast.success(`Checked in at ${hotspot.name}!`)
      // Reset form handled by closing
      setTimeout(() => {
        setNote("")
        setIsPublic(true)
        onClose()
      }, 500) // Small delay to show loading state or transition
    } catch (error) {
      // Error handled by parent mostly
    } finally {
      setIsLoading(false)
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
                disabled={isLoading}
            >
                Cancel
            </button>
            <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1 py-3 px-4 rounded-lg bg-[#E8FF00] text-black font-mono font-bold text-sm hover:bg-[#D4E600] transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(232,255,0,0.3)]"
            >
                {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <Check className="w-4 h-4" />
                )}
                CHECK IN
            </button>
        </div>

      </div>
    </Modal>
  )
}
