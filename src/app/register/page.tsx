"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    // Validate password strength
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long")
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await authClient.signUp.email({
        email: formData.email,
        name: formData.name,
        password: formData.password
      })

      if (error?.code) {
        if (error.code === "USER_ALREADY_EXISTS") {
          toast.error("Email already registered. Please log in instead.")
        } else {
          toast.error("Registration failed. Please try again.")
        }
        setIsLoading(false)
        return
      }

      // Profile is automatically created server-side via auth hook
      toast.success("Account created successfully!")
      router.push("/login?registered=true")
    } catch (error) {
      toast.error("An error occurred during registration")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col">
      {/* Header */}
      <header className="border-b border-[#B8AFA5]/20 bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/pilates" className="flex items-center gap-3">
              <div className="relative w-10 h-10">
                <Image
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/image-1765052969010.png?width=8000&height=8000&resize=contain"
                  alt="Swift Fit"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="font-serif text-lg text-[#5A5550] hidden sm:block">Swift Fit Pilates</span>
            </Link>
            <Link href="/pilates">
              <Button variant="ghost" className="text-[#5A5550] hover:text-[#9BA899] hover:bg-[#9BA899]/10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Studio
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="border-[#B8AFA5]/30 shadow-lg">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-serif font-normal text-[#5A5550]">Create Account</CardTitle>
              <CardDescription className="text-[#7A736B]">Join Swift Fit Pilates and start your wellness journey</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-[#5A5550]">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Jane Smith"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="mt-1 border-[#B8AFA5]/50 focus:border-[#9BA899] focus:ring-[#9BA899]"
                    autoComplete="name"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-[#5A5550]">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="mt-1 border-[#B8AFA5]/50 focus:border-[#9BA899] focus:ring-[#9BA899]"
                    autoComplete="email"
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-[#5A5550]">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={8}
                    className="mt-1 border-[#B8AFA5]/50 focus:border-[#9BA899] focus:ring-[#9BA899]"
                    autoComplete="off"
                  />
                  <p className="text-xs text-[#B8AFA5] mt-1">
                    Must be at least 8 characters
                  </p>
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-[#5A5550]">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    minLength={8}
                    className="mt-1 border-[#B8AFA5]/50 focus:border-[#9BA899] focus:ring-[#9BA899]"
                    autoComplete="off"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-[#9BA899] hover:bg-[#8A9788] text-white rounded-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>

                <div className="text-center text-sm text-[#7A736B]">
                  Already have an account?{" "}
                  <Link href="/login" className="text-[#9BA899] hover:text-[#8A9788] hover:underline font-semibold">
                    Sign in
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#B8AFA5]/20 bg-white py-4">
        <div className="container mx-auto px-4 text-center text-sm text-[#7A736B]">
          © 2025 Swift Fit Pilates & Wellness Studio
        </div>
      </footer>
    </div>
  )
}
