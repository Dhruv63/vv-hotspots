"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { User } from "@supabase/supabase-js"
import { Profile } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"
import { CldUploadButton } from "next-cloudinary"
import { Loader2, Camera, User as UserIcon, MapPin, Instagram, Twitter, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { sanitizeInput } from "@/lib/security"

interface EditProfileFormProps {
  user: User
  profile: Profile
}

export function EditProfileForm({ user, profile }: EditProfileFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || "")
  const [username, setUsername] = useState(profile.username || "")
  const [bio, setBio] = useState(profile.bio || "")
  const [city, setCity] = useState(profile.city || "Vasai-Virar")
  const [instagramUsername, setInstagramUsername] = useState(profile.instagram_username || "")
  const [twitterUsername, setTwitterUsername] = useState(profile.twitter_username || "")

  const handleSave = async () => {
    // Validation
    if (username.length < 3 || username.length > 20) {
      toast.error("Username must be between 3 and 20 characters")
      return
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      toast.error("Username can only contain letters, numbers, and underscores")
      return
    }
    if (bio.length > 150) {
        toast.error("Bio must be less than 150 characters")
        return
    }

    setIsLoading(true)
    const supabase = createClient()

    try {
        const { error } = await supabase
            .from("profiles")
            .update({
                username: sanitizeInput(username),
                bio: sanitizeInput(bio),
                city: sanitizeInput(city),
                instagram_username: sanitizeInput(instagramUsername),
                twitter_username: sanitizeInput(twitterUsername),
                avatar_url: avatarUrl,
                updated_at: new Date().toISOString()
            })
            .eq("id", user.id)

        if (error) throw error

        toast.success("Profile updated!")
        router.push("/profile")
        router.refresh()
    } catch (error: any) {
        toast.error(error.message || "Failed to update profile")
    } finally {
        setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0E27] p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-[#1A1F3A] rounded-xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.3)] overflow-hidden">

        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#1A1F3A]">
            <div className="flex items-center gap-3">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-xl font-mono font-bold text-white tracking-wide">EDIT PROFILE</h1>
            </div>
        </div>

        <div className="p-6 md:p-8 space-y-8">

            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#E8FF00] shadow-[0_0_20px_rgba(232,255,0,0.2)] bg-[#0A0E27]">
                        {avatarUrl ? (
                            <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#E8FF00]">
                                <UserIcon className="w-10 h-10" />
                            </div>
                        )}
                    </div>
                    <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer pointer-events-none">
                        <Camera className="w-8 h-8 text-white" />
                    </div>
                    <CldUploadButton
                        options={{
                            folder: "vv-hotspots/avatars",
                            maxFileSize: 5000000,
                            sources: ["local", "camera"],
                            multiple: false,
                            cropping: true,
                            showSkipCropButton: false,
                            croppingAspectRatio: 1,
                        }}
                        signatureEndpoint="/api/sign-cloudinary-params"
                        onSuccess={(result: any) => {
                            setAvatarUrl(result.info.secure_url)
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                </div>
                <p className="text-xs text-gray-400 font-mono">Tap to change avatar</p>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">

                {/* Username */}
                <div className="space-y-2">
                    <label className="text-xs font-mono text-[#E8FF00] uppercase tracking-wider">Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-[#0A0E27] border border-gray-700 rounded-lg p-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#E8FF00] focus:ring-1 focus:ring-[#E8FF00] transition-all font-mono"
                        placeholder="username"
                        maxLength={20}
                    />
                    <div className="flex justify-between text-xs text-gray-500 font-mono">
                        <span>3-20 characters, alphanumeric</span>
                        <span>{username.length}/20</span>
                    </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                    <label className="text-xs font-mono text-[#E8FF00] uppercase tracking-wider">Bio</label>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full bg-[#0A0E27] border border-gray-700 rounded-lg p-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#E8FF00] focus:ring-1 focus:ring-[#E8FF00] transition-all font-mono h-24 resize-none"
                        placeholder="Tell us about yourself..."
                        maxLength={150}
                    />
                    <div className="flex justify-end text-xs text-gray-500 font-mono">
                        <span>{bio.length}/150</span>
                    </div>
                </div>

                {/* City */}
                <div className="space-y-2">
                    <label className="text-xs font-mono text-[#E8FF00] uppercase tracking-wider flex items-center gap-2">
                        <MapPin className="w-3 h-3" /> City
                    </label>
                    <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-[#0A0E27] border border-gray-700 rounded-lg p-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#E8FF00] focus:ring-1 focus:ring-[#E8FF00] transition-all font-mono"
                        placeholder="Vasai-Virar"
                    />
                </div>

                {/* Social Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-mono text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <Instagram className="w-3 h-3" /> Instagram
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">@</span>
                            <input
                                type="text"
                                value={instagramUsername}
                                onChange={(e) => setInstagramUsername(e.target.value)}
                                className="w-full bg-[#0A0E27] border border-gray-700 rounded-lg p-3 pl-8 text-white placeholder-gray-600 focus:outline-none focus:border-[#E8FF00] focus:ring-1 focus:ring-[#E8FF00] transition-all font-mono"
                                placeholder="username"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-mono text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <Twitter className="w-3 h-3" /> Twitter / X
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">@</span>
                            <input
                                type="text"
                                value={twitterUsername}
                                onChange={(e) => setTwitterUsername(e.target.value)}
                                className="w-full bg-[#0A0E27] border border-gray-700 rounded-lg p-3 pl-8 text-white placeholder-gray-600 focus:outline-none focus:border-[#E8FF00] focus:ring-1 focus:ring-[#E8FF00] transition-all font-mono"
                                placeholder="username"
                            />
                        </div>
                    </div>
                </div>

            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t border-white/10">
                <button
                    onClick={() => router.back()}
                    className="flex-1 py-3 px-4 rounded-lg border border-gray-600 text-gray-300 font-mono font-bold hover:bg-white/5 transition-colors"
                    disabled={isLoading}
                >
                    CANCEL
                </button>
                <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex-1 py-3 px-4 rounded-lg bg-[#E8FF00] text-black font-mono font-bold hover:bg-[#D4E600] transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(232,255,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        "SAVE CHANGES"
                    )}
                </button>
            </div>
        </div>
      </div>
    </div>
  )
}
