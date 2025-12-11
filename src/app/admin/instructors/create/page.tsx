"use client"

import { useEffect, useState } from "react"
import { useSession } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, User } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import Image from "next/image"

export default function CreateInstructorPage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    bio: "",
    specialties: ""
  })

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login?redirect=/admin/instructors/create")
    }
  }, [session, isPending, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const token = localStorage.getItem("bearer_token")
      
      const userRes = await fetch("/api/instructors", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          bio: formData.bio,
          specialties: formData.specialties.split(',').map(s => s.trim()).filter(Boolean)
        })
      })

      if (userRes.ok) {
        toast.success("Instructor created successfully!")
        router.push("/admin/instructors")
      } else {
        const data = await userRes.json()
        toast.error(data.error || "Failed to create instructor")
      }
    } catch (error) {
      toast.error("Failed to create instructor")
    } finally {
      setSubmitting(false)
    }
  }

  if (isPending) {
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
              {[1, 2, 3, 4, 5, 6].map(i => (
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
                onClick={() => router.push("/admin/instructors")}
                className="text-[#7A736B] hover:text-[#5A5550] hover:bg-[#9BA899]/10 rounded-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="min-w-0">
                <h1 className="font-serif text-xl md:text-2xl text-[#5A5550]">Add Instructor</h1>
                <p className="text-xs text-[#9BA899]">Create a new instructor account</p>
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
              <User className="h-5 w-5 text-[#9BA899]" />
              <CardTitle className="font-serif font-normal text-[#5A5550]">Instructor Details</CardTitle>
            </div>
            <CardDescription className="text-[#7A736B]">Fill in the information for the new instructor</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name" className="text-[#5A5550]">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Jane Doe"
                  className="mt-1 border-[#B8AFA5]/30 focus:border-[#9BA899]"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-[#5A5550]">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="jane@swiftfitpilates.com"
                  className="mt-1 border-[#B8AFA5]/30 focus:border-[#9BA899]"
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-[#5A5550]">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  placeholder="Min. 8 characters"
                  minLength={8}
                  className="mt-1 border-[#B8AFA5]/30 focus:border-[#9BA899]"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-[#5A5550]">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(215) 555-0123"
                  className="mt-1 border-[#B8AFA5]/30 focus:border-[#9BA899]"
                />
              </div>

              <div>
                <Label htmlFor="bio" className="text-[#5A5550]">Bio</Label>
                <textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Brief bio about the instructor's background and teaching style"
                  rows={4}
                  className="w-full mt-1 rounded-md border border-[#B8AFA5]/30 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9BA899]"
                />
              </div>

              <div>
                <Label htmlFor="specialties" className="text-[#5A5550]">Specialties (comma-separated)</Label>
                <Input
                  id="specialties"
                  value={formData.specialties}
                  onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                  placeholder="e.g., Mat Pilates, Reformer, Athletic Conditioning"
                  className="mt-1 border-[#B8AFA5]/30 focus:border-[#9BA899]"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1 bg-[#9BA899] hover:bg-[#8A9788] text-white rounded-full"
                  disabled={submitting}
                >
                  {submitting ? "Creating..." : "Create Instructor"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => router.push("/admin/instructors")}
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
