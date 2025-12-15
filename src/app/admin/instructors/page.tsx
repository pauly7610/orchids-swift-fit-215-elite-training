"use client"

import { useEffect, useState } from "react"
import { useSession } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit2, Trash2, User, Search, ArrowLeft, Upload, X, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useCallback, useState as useDropzoneState } from "react"
import { useDropzone } from "react-dropzone"

interface Instructor {
  id: number
  userProfileId: number
  bio: string | null
  specialties: string[] | null
  headshotUrl: string | null
  isActive: boolean
  createdAt: string
}

interface UserProfile {
  id: number
  userId: string
  role: string
  phone: string | null
  profileImage: string | null
  userName?: string
  userEmail?: string
}

export default function InstructorManagement() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null)
  const [formData, setFormData] = useState({
    userProfileId: "",
    bio: "",
    specialties: "",
    headshotUrl: "",
    isActive: true
  })
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login?redirect=/admin/instructors")
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

      const [instructorsRes, profilesRes] = await Promise.all([
        fetch("/api/instructors", { headers }),
        fetch("/api/user-profiles?role=instructor", { headers })
      ])

      if (instructorsRes.ok) {
        const data = await instructorsRes.json()
        setInstructors(data)
      }

      if (profilesRes.ok) {
        const data = await profilesRes.json()
        setUserProfiles(data)
      }
    } catch (error) {
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.userProfileId) {
      toast.error("Please select an instructor profile")
      return
    }

    try {
      const token = localStorage.getItem("bearer_token")
      const specialtiesArray = formData.specialties
        ? formData.specialties.split(",").map(s => s.trim()).filter(Boolean)
        : null

      const payload = {
        userProfileId: parseInt(formData.userProfileId),
        bio: formData.bio || null,
        specialties: specialtiesArray,
        headshotUrl: formData.headshotUrl || null,
        isActive: formData.isActive
      }

      let res
      if (editingInstructor) {
        res = await fetch(`/api/instructors?id=${editingInstructor.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        })
      } else {
        res = await fetch("/api/instructors", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        })
      }

      if (res.ok) {
        toast.success(editingInstructor ? "Instructor updated!" : "Instructor added!")
        setIsCreateDialogOpen(false)
        setEditingInstructor(null)
        resetForm()
        fetchData()
      } else {
        const error = await res.json()
        toast.error(error.error || "Failed to save instructor")
      }
    } catch (error) {
      toast.error("An error occurred")
    }
  }

  const handleEdit = (instructor: Instructor) => {
    setEditingInstructor(instructor)
    setFormData({
      userProfileId: instructor.userProfileId.toString(),
      bio: instructor.bio || "",
      specialties: instructor.specialties?.join(", ") || "",
      headshotUrl: instructor.headshotUrl || "",
      isActive: instructor.isActive
    })
    setPreviewUrl(instructor.headshotUrl || null)
    setIsCreateDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this instructor?")) return

    try {
      const token = localStorage.getItem("bearer_token")
      const res = await fetch(`/api/instructors?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.ok) {
        toast.success("Instructor deleted")
        fetchData()
      } else {
        toast.error("Failed to delete instructor")
      }
    } catch (error) {
      toast.error("An error occurred")
    }
  }

  const resetForm = () => {
    setFormData({
      userProfileId: "",
      bio: "",
      specialties: "",
      headshotUrl: "",
      isActive: true
    })
    setPreviewUrl(null)
  }

  // Handle file upload
  const handleFileUpload = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setUploading(true)
    
    // Create local preview
    const localPreview = URL.createObjectURL(file)
    setPreviewUrl(localPreview)

    try {
      const token = localStorage.getItem("bearer_token")
      const uploadFormData = new FormData()
      uploadFormData.append("file", file)
      uploadFormData.append("folder", "instructors")

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: uploadFormData
      })

      if (res.ok) {
        const data = await res.json()
        setFormData(prev => ({ ...prev, headshotUrl: data.url }))
        setPreviewUrl(data.url)
        toast.success("Image uploaded successfully!")
      } else {
        const error = await res.json()
        toast.error(error.error || "Failed to upload image")
        setPreviewUrl(null)
      }
    } catch (error) {
      toast.error("Failed to upload image")
      setPreviewUrl(null)
    } finally {
      setUploading(false)
    }
  }, [])

  // Dropzone configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileUpload,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/gif': ['.gif']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
    disabled: uploading
  })

  // Clear uploaded image
  const handleClearImage = () => {
    setFormData(prev => ({ ...prev, headshotUrl: "" }))
    setPreviewUrl(null)
  }

  const getUserProfileName = (userProfileId: number) => {
    const profile = userProfiles.find(p => p.id === userProfileId)
    return profile?.userName || profile?.userEmail || "Unknown"
  }

  const filteredInstructors = instructors.filter(instructor => {
    const profileName = getUserProfileName(instructor.userProfileId).toLowerCase()
    const bio = (instructor.bio || "").toLowerCase()
    const search = searchTerm.toLowerCase()
    return profileName.includes(search) || bio.includes(search)
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
              <h1 className="font-serif text-3xl text-[#5A5550]">Instructor Management</h1>
              <p className="text-sm text-[#7A736B]">Manage your teaching staff</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
              setIsCreateDialogOpen(open)
              if (!open) {
                setEditingInstructor(null)
                resetForm()
              }
            }}>
              <DialogTrigger asChild>
                <Button className="bg-[#9BA899] hover:bg-[#8A9788] text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Instructor
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#FAF8F5] max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-[#5A5550] font-serif text-2xl">
                    {editingInstructor ? "Edit Instructor" : "Add New Instructor"}
                  </DialogTitle>
                  <DialogDescription className="text-[#7A736B]">
                    {editingInstructor ? "Update instructor information" : "Create a new instructor profile"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="userProfileId" className="text-[#5A5550]">Instructor Profile *</Label>
                    <select
                      id="userProfileId"
                      value={formData.userProfileId}
                      onChange={(e) => setFormData({ ...formData, userProfileId: e.target.value })}
                      required
                      disabled={!!editingInstructor}
                      className="w-full mt-1 px-3 py-2 border border-[#B8AFA5]/30 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9BA899] bg-white"
                    >
                      <option value="">Select a user profile...</option>
                      {userProfiles.map(profile => (
                        <option key={profile.id} value={profile.id}>
                          {profile.userName || profile.userEmail}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="bio" className="text-[#5A5550]">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Brief instructor biography..."
                      rows={4}
                      className="mt-1 border-[#B8AFA5]/30"
                    />
                  </div>

                  <div>
                    <Label htmlFor="specialties" className="text-[#5A5550]">Specialties</Label>
                    <Input
                      id="specialties"
                      value={formData.specialties}
                      onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                      placeholder="Mat Pilates, Yoga, Meditation (comma-separated)"
                      className="mt-1 border-[#B8AFA5]/30"
                    />
                    <p className="text-xs text-[#9BA899] mt-1">Enter specialties separated by commas</p>
                  </div>

                  <div>
                    <Label className="text-[#5A5550]">Headshot Photo</Label>
                    
                    {/* Show preview or dropzone */}
                    {(previewUrl || formData.headshotUrl) ? (
                      <div className="mt-2 relative">
                        <div className="relative w-32 h-32 mx-auto">
                          <img
                            src={previewUrl || formData.headshotUrl}
                            alt="Preview"
                            className="w-full h-full object-cover rounded-lg border-2 border-[#9BA899]"
                          />
                          {uploading && (
                            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                              <Loader2 className="h-6 w-6 text-white animate-spin" />
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={handleClearImage}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-xs text-center text-[#9BA899] mt-2">Click × to remove</p>
                      </div>
                    ) : (
                      <div
                        {...getRootProps()}
                        className={`mt-2 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                          isDragActive 
                            ? 'border-[#9BA899] bg-[#9BA899]/10' 
                            : 'border-[#B8AFA5]/40 hover:border-[#9BA899] hover:bg-[#9BA899]/5'
                        } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <input {...getInputProps()} />
                        <Upload className={`h-8 w-8 mx-auto mb-2 ${isDragActive ? 'text-[#9BA899]' : 'text-[#B8AFA5]'}`} />
                        {isDragActive ? (
                          <p className="text-sm text-[#9BA899]">Drop the image here...</p>
                        ) : (
                          <>
                            <p className="text-sm text-[#7A736B]">
                              Drag & drop an image here, or <span className="text-[#9BA899] font-medium">click to select</span>
                            </p>
                            <p className="text-xs text-[#B8AFA5] mt-1">JPEG, PNG, WebP, GIF • Max 5MB</p>
                          </>
                        )}
                      </div>
                    )}
                    
                    {/* Manual URL input as fallback */}
                    <div className="mt-3">
                      <details className="text-xs">
                        <summary className="text-[#9BA899] cursor-pointer hover:text-[#7A736B]">
                          Or enter image URL manually
                        </summary>
                        <Input
                          type="url"
                          value={formData.headshotUrl}
                          onChange={(e) => {
                            setFormData({ ...formData, headshotUrl: e.target.value })
                            setPreviewUrl(e.target.value || null)
                          }}
                          placeholder="https://example.com/photo.jpg"
                          className="mt-2 border-[#B8AFA5]/30 text-sm"
                        />
                      </details>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded border-[#B8AFA5]/30"
                    />
                    <Label htmlFor="isActive" className="text-[#5A5550]">Active (available for classes)</Label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" className="flex-1 bg-[#9BA899] hover:bg-[#8A9788] text-white">
                      {editingInstructor ? "Update Instructor" : "Create Instructor"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsCreateDialogOpen(false)
                        setEditingInstructor(null)
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
        {/* Search */}
        <Card className="mb-6 border-[#B8AFA5]/30">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#9BA899]" />
              <Input
                placeholder="Search instructors by name or bio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-[#B8AFA5]/30"
              />
            </div>
          </CardContent>
        </Card>

        {/* Instructors List */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInstructors.length === 0 ? (
            <Card className="col-span-full border-[#B8AFA5]/30">
              <CardContent className="py-12 text-center">
                <User className="h-12 w-12 mx-auto mb-4 text-[#B8AFA5]" />
                <p className="text-[#7A736B] mb-4">No instructors found</p>
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-[#9BA899] hover:bg-[#8A9788] text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Instructor
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredInstructors.map((instructor) => (
              <Card key={instructor.id} className="border-[#B8AFA5]/30 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {instructor.headshotUrl ? (
                        <img
                          src={instructor.headshotUrl}
                          alt="Instructor"
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-[#9BA899]/20 flex items-center justify-center">
                          <User className="h-6 w-6 text-[#9BA899]" />
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-lg text-[#5A5550]">
                          {getUserProfileName(instructor.userProfileId)}
                        </CardTitle>
                        <Badge
                          variant={instructor.isActive ? "default" : "secondary"}
                          className={instructor.isActive ? "bg-[#9BA899]" : ""}
                        >
                          {instructor.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {instructor.bio && (
                    <p className="text-sm text-[#7A736B] mb-3 line-clamp-3">{instructor.bio}</p>
                  )}
                  
                  {instructor.specialties && instructor.specialties.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-[#5A5550] mb-2">Specialties:</p>
                      <div className="flex flex-wrap gap-2">
                        {instructor.specialties.map((specialty, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs border-[#E8B4B8] text-[#5A5550]">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(instructor)}
                      className="flex-1 border-[#9BA899] text-[#9BA899] hover:bg-[#9BA899]/10"
                    >
                      <Edit2 className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(instructor.id)}
                      className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
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
