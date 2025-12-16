"use client"

import { useEffect, useState } from "react"
import { useSession } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit2, Trash2, Calendar, Search, ArrowLeft, Clock, Users } from "lucide-react"
import { toast } from "sonner"

interface ClassData {
  id: number
  classTypeId: number
  instructorId: number
  date: string
  startTime: string
  endTime: string
  capacity: number
  price: number | null
  status: string
  createdAt: string
  // Joined fields from API
  classTypeName?: string
  instructorName?: string
}

interface ClassType {
  id: number
  name: string
  description: string | null
  durationMinutes: number
}

interface Instructor {
  id: number
  userProfileId: number
  name: string | null
}

export default function ClassScheduleManagement() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [classes, setClasses] = useState<ClassData[]>([])
  const [classTypes, setClassTypes] = useState<ClassType[]>([])
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [userProfiles, setUserProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDate, setFilterDate] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingClass, setEditingClass] = useState<ClassData | null>(null)
  const [formData, setFormData] = useState({
    classTypeId: "",
    instructorId: "",
    date: "",
    startTime: "",
    endTime: "",
    capacity: "15",
    price: "",
    status: "scheduled"
  })

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login?redirect=/admin/classes")
    }
  }, [session, isPending, router])

  useEffect(() => {
    if (session) {
      checkAdminRole()
      fetchData()
    }
  }, [session])

  const checkAdminRole = async () => {
    try {
      const token = localStorage.getItem("bearer_token")
      const res = await fetch("/api/user-profiles", {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (res.ok) {
        const data = await res.json()
        if (data.role !== "admin") {
          toast.error("Access denied. Admin only.")
          router.push("/pilates")
        }
      }
    } catch (error) {
      console.error("Failed to check role")
    }
  }

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("bearer_token")
      const headers = { Authorization: `Bearer ${token}` }
      
      // Get today's date in YYYY-MM-DD format for filtering
      const today = new Date().toISOString().split('T')[0]

      const [classesRes, typesRes, instructorsRes, profilesRes] = await Promise.all([
        fetch(`/api/classes?fromDate=${today}&limit=100`, { headers }),
        fetch("/api/class-types", { headers }),
        fetch("/api/instructors?isActive=true", { headers }),
        fetch("/api/user-profiles?role=instructor", { headers })
      ])

      if (classesRes.ok) setClasses(await classesRes.json())
      if (typesRes.ok) setClassTypes(await typesRes.json())
      if (instructorsRes.ok) setInstructors(await instructorsRes.json())
      if (profilesRes.ok) setUserProfiles(await profilesRes.json())
    } catch (error) {
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.classTypeId || !formData.instructorId || !formData.date || !formData.startTime || !formData.endTime) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      const token = localStorage.getItem("bearer_token")
      const payload = {
        classTypeId: parseInt(formData.classTypeId),
        instructorId: parseInt(formData.instructorId),
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        capacity: parseInt(formData.capacity),
        price: formData.price ? parseFloat(formData.price) : null,
        status: formData.status
      }

      let res
      if (editingClass) {
        res = await fetch(`/api/classes?id=${editingClass.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        })
      } else {
        res = await fetch("/api/classes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        })
      }

      if (res.ok) {
        toast.success(editingClass ? "Class updated!" : "Class created!")
        setIsCreateDialogOpen(false)
        setEditingClass(null)
        resetForm()
        fetchData()
      } else {
        const error = await res.json()
        toast.error(error.error || "Failed to save class")
      }
    } catch (error) {
      toast.error("An error occurred")
    }
  }

  const handleEdit = (classData: ClassData) => {
    setEditingClass(classData)
    setFormData({
      classTypeId: classData.classTypeId.toString(),
      instructorId: classData.instructorId.toString(),
      date: classData.date,
      startTime: classData.startTime,
      endTime: classData.endTime,
      capacity: classData.capacity.toString(),
      price: classData.price?.toString() || "",
      status: classData.status
    })
    setIsCreateDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this class?")) return

    try {
      const token = localStorage.getItem("bearer_token")
      const res = await fetch(`/api/classes?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.ok) {
        toast.success("Class deleted")
        fetchData()
      } else {
        toast.error("Failed to delete class")
      }
    } catch (error) {
      toast.error("An error occurred")
    }
  }

  const resetForm = () => {
    setFormData({
      classTypeId: "",
      instructorId: "",
      date: "",
      startTime: "",
      endTime: "",
      capacity: "15",
      price: "",
      status: "scheduled"
    })
  }

  // Helper to get instructor name by ID (for dropdowns)
  const getInstructorNameById = (id: number) => {
    const instructor = instructors.find(i => i.id === id)
    if (!instructor) return "Unknown"
    if (instructor.name) return instructor.name
    const profile = userProfiles.find((p: any) => p.id === instructor.userProfileId)
    return profile?.displayName || profile?.userName || profile?.userEmail || "Unknown"
  }

  // Use joined data from API, fall back to lookup if needed
  const getClassTypeName = (classData: ClassData) => {
    if (classData.classTypeName) return classData.classTypeName
    return classTypes.find(t => t.id === classData.classTypeId)?.name || "Unknown"
  }
  
  const getInstructorName = (classData: ClassData) => {
    if (classData.instructorName) return classData.instructorName
    return getInstructorNameById(classData.instructorId)
  }

  const filteredClasses = classes.filter(classData => {
    const typeName = getClassTypeName(classData).toLowerCase()
    const instructorName = getInstructorName(classData).toLowerCase()
    const search = searchTerm.toLowerCase()
    const matchesSearch = typeName.includes(search) || instructorName.includes(search)
    const matchesDate = !filterDate || classData.date === filterDate
    return matchesSearch && matchesDate
  }).sort((a, b) => {
    // Sort by date ascending (soonest first), then by time ascending
    const dateCompare = a.date.localeCompare(b.date)
    if (dateCompare !== 0) return dateCompare
    return a.startTime.localeCompare(b.startTime)
  })

  if (isPending || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9BA899] mx-auto mb-4"></div>
          <p className="text-[#7A736B]">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Header */}
      <header className="border-b bg-white border-[#B8AFA5]/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/admin")}
                  className="text-[#7A736B] hover:text-[#5A5550]"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </div>
              <h1 className="font-serif text-3xl text-[#5A5550]">Schedule Management</h1>
              <p className="text-sm text-[#7A736B]">Create and edit class schedule</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
              setIsCreateDialogOpen(open)
              if (!open) {
                setEditingClass(null)
                resetForm()
              }
            }}>
              <DialogTrigger asChild>
                <Button className="bg-[#9BA899] hover:bg-[#8A9788] text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Class
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#FAF8F5] max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-[#5A5550] font-serif text-2xl">
                    {editingClass ? "Edit Class" : "Create New Class"}
                  </DialogTitle>
                  <DialogDescription className="text-[#7A736B]">
                    {editingClass ? "Update class details" : "Schedule a new class session"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="classTypeId" className="text-[#5A5550]">Class Type *</Label>
                      <select
                        id="classTypeId"
                        value={formData.classTypeId}
                        onChange={(e) => setFormData({ ...formData, classTypeId: e.target.value })}
                        required
                        className="w-full mt-1 px-3 py-2 border border-[#B8AFA5]/30 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9BA899] bg-white"
                      >
                        <option value="">Select class type...</option>
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
                        className="w-full mt-1 px-3 py-2 border border-[#B8AFA5]/30 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9BA899] bg-white"
                      >
                        <option value="">Select instructor...</option>
                        {instructors.map(instructor => (
                          <option key={instructor.id} value={instructor.id}>
                            {getInstructorNameById(instructor.id)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="date" className="text-[#5A5550]">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                      className="mt-1 border-[#B8AFA5]/30"
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
                        className="mt-1 border-[#B8AFA5]/30"
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
                        className="mt-1 border-[#B8AFA5]/30"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="capacity" className="text-[#5A5550]">Capacity *</Label>
                      <Input
                        id="capacity"
                        type="number"
                        min="1"
                        value={formData.capacity}
                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                        required
                        className="mt-1 border-[#B8AFA5]/30"
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
                        placeholder="Leave empty for credit-based"
                        className="mt-1 border-[#B8AFA5]/30"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="status" className="text-[#5A5550]">Status</Label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-[#B8AFA5]/30 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9BA899] bg-white"
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" className="flex-1 bg-[#9BA899] hover:bg-[#8A9788] text-white">
                      {editingClass ? "Update Class" : "Create Class"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsCreateDialogOpen(false)
                        setEditingClass(null)
                        resetForm()
                      }}
                      className="border-[#B8AFA5] text-[#5A5550]"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="mb-6 border-[#B8AFA5]/30">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#9BA899]" />
                <Input
                  placeholder="Search by class type or instructor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-[#B8AFA5]/30"
                />
              </div>
              <Input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="border-[#B8AFA5]/30"
                placeholder="Filter by date"
              />
            </div>
          </CardContent>
        </Card>

        {/* Classes List */}
        <div className="space-y-4">
          {filteredClasses.length === 0 ? (
            <Card className="border-[#B8AFA5]/30">
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-[#B8AFA5]" />
                <p className="text-[#7A736B] mb-4">No classes found</p>
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-[#9BA899] hover:bg-[#8A9788] text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Class
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredClasses.map((classData) => (
              <Card key={classData.id} className="border-[#B8AFA5]/30 hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl text-[#5A5550]">
                          {getClassTypeName(classData)}
                        </CardTitle>
                        <Badge
                          variant={
                            classData.status === "scheduled" ? "default" :
                            classData.status === "cancelled" ? "destructive" : "secondary"
                          }
                          className={classData.status === "scheduled" ? "bg-[#9BA899]" : ""}
                        >
                          {classData.status}
                        </Badge>
                      </div>
                      <CardDescription className="text-[#7A736B]">
                        {getInstructorName(classData)}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(classData)}
                        className="border-[#9BA899] text-[#9BA899] hover:bg-[#9BA899]/10"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(classData.id)}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-[#7A736B]">
                      <Calendar className="h-4 w-4 text-[#9BA899]" />
                      {new Date(classData.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-[#7A736B]">
                      <Clock className="h-4 w-4 text-[#9BA899]" />
                      {classData.startTime} - {classData.endTime}
                    </div>
                    <div className="flex items-center gap-2 text-[#7A736B]">
                      <Users className="h-4 w-4 text-[#9BA899]" />
                      Capacity: {classData.capacity}
                    </div>
                    <div className="text-[#7A736B]">
                      {classData.price ? `$${classData.price.toFixed(2)}` : "Credit-based"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
