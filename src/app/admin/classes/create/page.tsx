"use client"

import { useEffect, useState } from "react"
import { useSession } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Calendar } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import Image from "next/image"

interface ClassType {
  id: number
  name: string
}

interface Instructor {
  id: number
  userProfile: {
    userId: string
    user: { name: string }
  }
}

export default function CreateClassPage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [classTypes, setClassTypes] = useState<ClassType[]>([])
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    classTypeId: "",
    instructorId: "",
    date: "",
    startTime: "",
    endTime: "",
    capacity: "15",
    price: ""
  })

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login?redirect=/admin/classes/create")
    }
  }, [session, isPending, router])

  useEffect(() => {
    if (session) {
      fetchData()
    }
  }, [session])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("bearer_token")
      const headers = { Authorization: `Bearer ${token}` }

      const [typesRes, instructorsRes] = await Promise.all([
        fetch("/api/class-types", { headers }),
        fetch("/api/instructors", { headers })
      ])

      if (typesRes.ok) setClassTypes(await typesRes.json())
      if (instructorsRes.ok) setInstructors(await instructorsRes.json())
    } catch (error) {
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const token = localStorage.getItem("bearer_token")
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          classTypeId: parseInt(formData.classTypeId),
          instructorId: parseInt(formData.instructorId),
          date: formData.date,
          startTime: formData.startTime,
          endTime: formData.endTime,
          capacity: parseInt(formData.capacity),
          price: formData.price ? parseFloat(formData.price) : null
        })
      })

      if (res.ok) {
        toast.success("Class created successfully!")
        router.push("/admin/classes")
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to create class")
      }
    } catch (error) {
      toast.error("Failed to create class")
    } finally {
      setSubmitting(false)
    }
  }

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col">
        <header className="border-b border-[#B8AFA5]/20 bg-white">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-20 rounded-full bg-[#B8AFA5]/20" />
              <Skeleton className="h-6 w-40 bg-[#B8AFA5]/20" />
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto border-[#B8AFA5]/30">
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2 bg-[#B8AFA5]/20" />
              <Skeleton className="h-4 w-48 bg-[#B8AFA5]/20" />
            </CardHeader>
            <CardContent className="space-y-6">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-10 w-full bg-[#B8AFA5]/20" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col">
      {/* Header */}
      <header className="border-b border-[#B8AFA5]/20 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/admin/classes")}
                className="text-[#7A736B] hover:text-[#5A5550] hover:bg-[#9BA899]/10 rounded-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="min-w-0">
                <h1 className="font-serif text-xl md:text-2xl text-[#5A5550]">Create Class</h1>
                <p className="text-xs text-[#9BA899]">Schedule a new Pilates class</p>
              </div>
            </div>
            <Link href="/pilates" className="shrink-0 hidden sm:block">
              <div className="relative w-8 h-8">
                <Image
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/image-1765052969010.png?width=8000&height=8000&resize=contain"
                  alt="Swift Fit"
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 md:py-8 flex-1">
        <Card className="max-w-2xl mx-auto border-[#B8AFA5]/30 bg-white">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#9BA899]" />
              <CardTitle className="font-serif font-normal text-[#5A5550]">Class Details</CardTitle>
            </div>
            <CardDescription className="text-[#7A736B]">Fill in the information for the new class</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="classTypeId" className="text-[#5A5550]">Class Type *</Label>
                <select
                  id="classTypeId"
                  value={formData.classTypeId}
                  onChange={(e) => setFormData({ ...formData, classTypeId: e.target.value })}
                  required
                  className="w-full mt-1 h-10 rounded-md border border-[#B8AFA5]/30 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9BA899]"
                >
                  <option value="">Select class type</option>
                  {classTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="instructorId" className="text-[#5A5550]">Instructor *</Label>
                <select
                  id="instructorId"
                  value={formData.instructorId}
                  onChange={(e) => setFormData({ ...formData, instructorId: e.target.value })}
                  required
                  className="w-full mt-1 h-10 rounded-md border border-[#B8AFA5]/30 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9BA899]"
                >
                  <option value="">Select instructor</option>
                  {instructors.map(instructor => (
                    <option key={instructor.id} value={instructor.id}>
                      {instructor.userProfile?.user?.name || `Instructor ${instructor.id}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="date" className="text-[#5A5550]">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  className="mt-1 border-[#B8AFA5]/30 focus:border-[#9BA899]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime" className="text-[#5A5550]">Start Time *</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                    className="mt-1 border-[#B8AFA5]/30 focus:border-[#9BA899]"
                  />
                </div>
                <div>
                  <Label htmlFor="endTime" className="text-[#5A5550]">End Time *</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    required
                    className="mt-1 border-[#B8AFA5]/30 focus:border-[#9BA899]"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="capacity" className="text-[#5A5550]">Capacity *</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  required
                  className="mt-1 border-[#B8AFA5]/30 focus:border-[#9BA899]"
                />
              </div>

              <div>
                <Label htmlFor="price" className="text-[#5A5550]">Price (optional)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="Leave empty if credit-based"
                  className="mt-1 border-[#B8AFA5]/30 focus:border-[#9BA899]"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1 bg-[#9BA899] hover:bg-[#8A9788] text-white rounded-full"
                  disabled={submitting}
                >
                  {submitting ? "Creating..." : "Create Class"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => router.push("/admin/classes")}
                  className="border-[#B8AFA5] text-[#5A5550] hover:bg-[#9BA899]/10 rounded-full"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#B8AFA5]/20 bg-white py-4 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-[#7A736B]">
          © 2025 Swift Fit Pilates & Wellness Studio — Admin Panel
        </div>
      </footer>
    </div>
  )
}
