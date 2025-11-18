"use client"

import { useEffect, useState } from "react"
import { useSession } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

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
        router.push("/admin")
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl text-primary">CREATE CLASS</h1>
              <p className="text-sm text-muted-foreground">Schedule a new Pilates class</p>
            </div>
            <Button variant="outline" onClick={() => router.push("/admin")}>
              Back to Admin
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Class Details</CardTitle>
            <CardDescription>Fill in the information for the new class</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="classTypeId">Class Type *</Label>
                <select
                  id="classTypeId"
                  value={formData.classTypeId}
                  onChange={(e) => setFormData({ ...formData, classTypeId: e.target.value })}
                  required
                  className="w-full mt-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select class type</option>
                  {classTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="instructorId">Instructor *</Label>
                <select
                  id="instructorId"
                  value={formData.instructorId}
                  onChange={(e) => setFormData({ ...formData, instructorId: e.target.value })}
                  required
                  className="w-full mt-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select instructor</option>
                  {instructors.map(instructor => (
                    <option key={instructor.id} value={instructor.id}>
                      {instructor.userProfile.user.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Start Time *</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">End Time *</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="capacity">Capacity *</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="price">Price (optional)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="Leave empty if included in membership"
                  className="mt-1"
                />
              </div>

              <div className="flex gap-4">
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={submitting}
                >
                  {submitting ? "Creating..." : "Create Class"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => router.push("/admin")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
