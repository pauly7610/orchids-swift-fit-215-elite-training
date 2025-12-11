"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  })

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      toast.success("Account created! Please log in.")
    }
    if (searchParams.get('reset') === 'true') {
      toast.success("Password reset successfully! Please log in with your new password.")
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Get redirect parameter if present
    const redirectTo = searchParams.get('redirect')

    try {
      const { data, error } = await authClient.signIn.email({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe,
        callbackURL: redirectTo || "/"
      })

      if (error?.code) {
        toast.error("Invalid email or password. Please make sure you have already registered an account and try again.")
        setIsLoading(false)
        return
      }

      toast.success("Logged in successfully!")
      
      // Redirect based on user role (fetch from user profile)
      const token = localStorage.getItem("bearer_token")
      if (token && data?.user?.id) {
        // Fetch user profile to determine role
        const profileRes = await fetch(`/api/user-profiles?userId=${data.user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (profileRes.ok) {
          const profiles = await profileRes.json()
          if (profiles && profiles.length > 0) {
            const role = profiles[0].role
            
            // If there's a specific redirect, use it
            if (redirectTo) {
              router.push(redirectTo)
              return
            }
            
            // Otherwise redirect based on role
            if (role === 'admin') {
              router.push('/admin')
            } else if (role === 'instructor') {
              router.push('/instructor')
            } else if (role === 'student') {
              router.push('/student')
            } else {
              router.push('/pilates')
            }
            return
          } else {
            // Profile doesn't exist - create one (fallback for old users)
            try {
              const createProfileRes = await fetch('/api/user-profiles', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                  userId: data.user.id,
                  role: 'student',
                  phone: null,
                  profileImage: null
                })
              })
              
              if (createProfileRes.ok) {
                console.log('Created missing user profile')
              }
            } catch (profileError) {
              console.error('Failed to create profile:', profileError)
            }
            
            // Redirect to student dashboard (default for new profiles)
            router.push(redirectTo || '/student')
            return
          }
        }
      }
      
      // Fallback redirect
      router.push(redirectTo || '/pilates')
    } catch (error) {
      toast.error("An error occurred during login")
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-[#B8AFA5]/30 shadow-lg">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-serif font-normal text-[#5A5550]">Welcome Back</CardTitle>
        <CardDescription className="text-[#7A736B]">Sign in to your Swift Fit Pilates account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
              className="mt-1 border-[#B8AFA5]/50 focus:border-[#9BA899] focus:ring-[#9BA899]"
              autoComplete="off"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                className="h-4 w-4 rounded border-[#B8AFA5] text-[#9BA899] focus:ring-[#9BA899]"
              />
              <Label htmlFor="rememberMe" className="ml-2 text-sm cursor-pointer text-[#5A5550]">
                Remember me
              </Label>
            </div>
            <Link href="/forgot-password" className="text-sm text-[#9BA899] hover:text-[#8A9788] hover:underline">
              Forgot password?
            </Link>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-[#9BA899] hover:bg-[#8A9788] text-white rounded-full"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>

          <div className="text-center text-sm text-[#7A736B]">
            Don't have an account?{" "}
            <Link href="/register" className="text-[#9BA899] hover:text-[#8A9788] hover:underline font-semibold">
              Create account
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default function LoginPage() {
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
          <Suspense fallback={
            <Card className="border-[#B8AFA5]/30">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-serif text-[#5A5550]">Welcome Back</CardTitle>
                <CardDescription className="text-[#7A736B]">Loading...</CardDescription>
              </CardHeader>
            </Card>
          }>
            <LoginForm />
          </Suspense>
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
