"use client"

import { useEffect, useState } from "react"
import { useSession } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

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
      
      // First create the user account
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
        router.push("/admin")
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
              <h1 className="font-display text-3xl text-primary">ADD INSTRUCTOR</h1>
              <p className="text-sm text-muted-foreground">Create a new instructor account</p>
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
            <CardTitle>Instructor Details</CardTitle>
            <CardDescription>Fill in the information for the new instructor</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Jane Doe"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="jane@example.com"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  placeholder="Min. 8 characters"
                  minLength={8}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(215) 555-0123"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Brief bio about the instructor"
                  rows={4}
                  className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <Label htmlFor="specialties">Specialties (comma-separated)</Label>
                <Input
                  id="specialties"
                  value={formData.specialties}
                  onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                  placeholder="e.g., Mat Pilates, Reformer, Athletic Conditioning"
                  className="mt-1"
                />
              </div>

              <div className="flex gap-4">
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={submitting}
                >
                  {submitting ? "Creating..." : "Create Instructor"}
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
