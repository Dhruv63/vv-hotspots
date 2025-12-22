"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Hotspot } from "@/lib/types"
import { CyberButton } from "@/components/ui/cyber-button"
import { CyberCard } from "@/components/ui/cyber-card"
import { useRouter } from "next/navigation"
import { Trash2, Edit, MapPin, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { createHotspot, deleteHotspot, updateHotspot } from "@/app/actions/admin"

const hotspotSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.enum(["cafe", "park", "gaming", "food", "hangout", "other"]),
  address: z.string().min(1, "Address is required"),
  latitude: z.coerce.number().refine((val) => !isNaN(val), "Must be a number"),
  longitude: z.coerce.number().refine((val) => !isNaN(val), "Must be a number"),
  description: z.string().optional(),
  image_url: z.string().optional(),
})

type HotspotFormValues = z.infer<typeof hotspotSchema>

interface AdminClientProps {
  initialHotspots: Hotspot[]
  userEmail: string
}

export default function AdminClient({ initialHotspots, userEmail }: AdminClientProps) {
  const [hotspots, setHotspots] = useState<Hotspot[]>(initialHotspots)
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Note: We used to use createClient() here, but now we use Server Actions
  // to ensure strict isolation of hotspot updates from user/profile tables.

  const form = useForm<HotspotFormValues>({
    resolver: zodResolver(hotspotSchema),
    defaultValues: {
      name: "",
      category: "cafe",
      address: "",
      latitude: 0,
      longitude: 0,
      description: "",
      image_url: "",
    },
  })

  const resetForm = () => {
    form.reset({
      name: "",
      category: "cafe",
      address: "",
      latitude: 0,
      longitude: 0,
      description: "",
      image_url: "",
    })
    setIsEditing(null)
  }

  const handleEdit = (hotspot: Hotspot) => {
    setIsEditing(hotspot.id)
    form.reset({
      name: hotspot.name,
      category: hotspot.category,
      address: hotspot.address,
      latitude: hotspot.latitude,
      longitude: hotspot.longitude,
      description: hotspot.description || "",
      image_url: hotspot.image_url || "",
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const onSubmit = async (data: HotspotFormValues) => {
    setIsLoading(true)

    try {
      if (isEditing) {
        // Use Server Action for Update
        const result = await updateHotspot(isEditing, data)

        if (result.error) throw new Error(result.error)

        // Optimistic update (or refetch via router.refresh)
        setHotspots(hotspots.map(h =>
          h.id === isEditing
            ? { ...h, ...data, description: data.description || null, image_url: data.image_url || null }
            : h
        ))
        alert("Hotspot updated successfully!")
      } else {
        // Use Server Action for Create
        const result = await createHotspot(data)

        if (result.error) throw new Error(result.error)

        if (result.data) {
           setHotspots([result.data as Hotspot, ...hotspots])
        }
        alert("Hotspot added successfully!")
      }
      resetForm()
      router.refresh()
    } catch (error: any) {
      console.error("Error saving hotspot:", error)
      alert(`Error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this hotspot?")) return

    setIsLoading(true)
    try {
      const result = await deleteHotspot(id)

      if (result.error) throw new Error(result.error)

      setHotspots(hotspots.filter(h => h.id !== id))
      alert("Hotspot deleted successfully!")
      router.refresh()
    } catch (error: any) {
      console.error("Error deleting hotspot:", error)
      alert(`Error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cyber-black p-4 md:p-8 font-sans text-cyber-white">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex justify-between items-center border-b border-cyber-gray pb-4">
            <h1 className="text-3xl font-bold text-cyber-primary drop-shadow-[0_0_10px_rgba(255,255,0,0.5)]">
              Admin Panel
            </h1>
            <div className="text-sm text-cyber-gray">
                Logged in as: <span className="text-cyber-secondary">{userEmail}</span>
            </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Section */}
            <section className="lg:col-span-1">
                <CyberCard className="p-6 sticky top-8" variant="highlighted">
                    <h2 className="text-xl font-bold mb-4 text-cyber-accent">
                        {isEditing ? "Edit Hotspot" : "Add New Hotspot"}
                    </h2>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-cyber-light">Name</label>
                            <input
                                {...form.register("name")}
                                className="w-full bg-cyber-black/50 border border-cyber-gray rounded p-2 focus:border-cyber-primary focus:outline-none focus:shadow-[0_0_10px_rgba(255,255,0,0.3)] text-white placeholder-cyber-gray"
                                placeholder="Hotspot Name"
                            />
                            {form.formState.errors.name && (
                                <p className="text-red-500 text-xs">{form.formState.errors.name.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-cyber-light">Category</label>
                            <select
                                {...form.register("category")}
                                className="w-full bg-cyber-black/50 border border-cyber-gray rounded p-2 focus:border-cyber-primary focus:outline-none text-white"
                            >
                                <option value="cafe">Cafe</option>
                                <option value="park">Park</option>
                                <option value="gaming">Gaming</option>
                                <option value="food">Food</option>
                                <option value="hangout">Hangout</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-cyber-light">Address</label>
                            <input
                                {...form.register("address")}
                                className="w-full bg-cyber-black/50 border border-cyber-gray rounded p-2 focus:border-cyber-primary focus:outline-none text-white placeholder-cyber-gray"
                                placeholder="123 Cyber St"
                            />
                            {form.formState.errors.address && (
                                <p className="text-red-500 text-xs">{form.formState.errors.address.message}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-cyber-light">Latitude</label>
                                <input
                                    type="number"
                                    step="any"
                                    {...form.register("latitude")}
                                    className="w-full bg-cyber-black/50 border border-cyber-gray rounded p-2 focus:border-cyber-primary focus:outline-none text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-cyber-light">Longitude</label>
                                <input
                                    type="number"
                                    step="any"
                                    {...form.register("longitude")}
                                    className="w-full bg-cyber-black/50 border border-cyber-gray rounded p-2 focus:border-cyber-primary focus:outline-none text-white"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-cyber-light">Description</label>
                            <textarea
                                {...form.register("description")}
                                className="w-full bg-cyber-black/50 border border-cyber-gray rounded p-2 focus:border-cyber-primary focus:outline-none text-white h-24 placeholder-cyber-gray"
                                placeholder="Description..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-cyber-light">Image URL</label>
                            <input
                                {...form.register("image_url")}
                                className="w-full bg-cyber-black/50 border border-cyber-gray rounded p-2 focus:border-cyber-primary focus:outline-none text-white placeholder-cyber-gray"
                                placeholder="https://..."
                            />
                        </div>

                        <div className="flex gap-2 pt-2">
                            <CyberButton type="submit" glowing disabled={isLoading} className="w-full">
                                {isLoading ? <Loader2 className="animate-spin" /> : (isEditing ? "Update" : "Add")}
                            </CyberButton>
                            {isEditing && (
                                <CyberButton type="button" variant="ghost" onClick={resetForm}>
                                    Cancel
                                </CyberButton>
                            )}
                        </div>

                    </form>
                </CyberCard>
            </section>

            {/* List Section */}
            <section className="lg:col-span-2 space-y-4">
                <h2 className="text-2xl font-bold text-cyber-white mb-4">Existing Hotspots</h2>
                <div className="grid grid-cols-1 gap-4">
                    {hotspots.map((hotspot) => (
                        <CyberCard key={hotspot.id} className="p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between group hover:border-cyber-primary transition-colors">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-lg font-bold text-cyber-primary">{hotspot.name}</h3>
                                    <span className={cn(
                                        "text-xs px-2 py-0.5 rounded border uppercase",
                                        hotspot.category === 'cafe' && "border-cyber-primary text-cyber-primary",
                                        hotspot.category === 'park' && "border-cyber-secondary text-cyber-secondary",
                                        hotspot.category === 'gaming' && "border-cyber-accent text-cyber-accent",
                                        hotspot.category === 'food' && "border-yellow-200 text-yellow-200",
                                        hotspot.category === 'hangout' && "border-white text-white",
                                        hotspot.category === 'other' && "border-cyber-gray text-cyber-gray",
                                    )}>
                                        {hotspot.category}
                                    </span>
                                </div>
                                <p className="text-sm text-cyber-gray flex items-center gap-1">
                                    <MapPin size={14} /> {hotspot.address}
                                </p>
                                <p className="text-xs text-cyber-gray/70 mt-1 line-clamp-2">
                                    {hotspot.description}
                                </p>
                            </div>

                            <div className="flex gap-2 shrink-0">
                                <CyberButton
                                    size="sm"
                                    variant="purple"
                                    onClick={() => handleEdit(hotspot)}
                                >
                                    <Edit size={16} />
                                </CyberButton>
                                <CyberButton
                                    size="sm"
                                    variant="pink"
                                    onClick={() => handleDelete(hotspot.id)}
                                >
                                    <Trash2 size={16} />
                                </CyberButton>
                            </div>
                        </CyberCard>
                    ))}

                    {hotspots.length === 0 && (
                        <div className="text-center text-cyber-gray py-12">
                            No hotspots found. Add one!
                        </div>
                    )}
                </div>
            </section>
        </div>
      </div>
    </div>
  )
}
