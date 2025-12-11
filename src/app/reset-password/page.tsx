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
import { ArrowLeft, Lock, CheckCircle, AlertCircle } from "lucide-react"

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isInvalid, setIsInvalid] = useState(false)
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  })

  const token = searchParams.get("token")

  useEffect(() => {
    if (!token) {
      setIsInvalid(true)
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long")
      return
    }

    if (!token) {
      toast.error("Invalid reset link")
      return
    }

    setIsLoading(true)

    try {
      const { error } = await authClient.resetPassword({
        newPassword: formData.password,
        token: token,
      })

      if (error) {
        if (error.message?.includes("expired") || error.message?.includes("invalid")) {
          setIsInvalid(true)
          toast.error("This reset link has expired or is invalid")
        } else {
          toast.error("Failed to reset password. Please try again.")
        }
        setIsLoading(false)
        return
      }

      setIsSuccess(true)
      toast.success("Password reset successfully!")
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login?reset=true")
      }, 3000)
    } catch (error) {
      toast.error("An error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  if (isInvalid) {
    return (
      <Card className="border-[#B8AFA5]/30">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-serif text-[#5A5550]">Invalid Reset Link</CardTitle>
          <CardDescription className="text-[#7A736B]">
            This password reset link is invalid or has expired.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-[#7A736B] text-center">
            Password reset links expire after 1 hour for security reasons. Please request a new one.
          </p>
          
          <div className="flex flex-col gap-2">
            <Link href="/forgot-password">
              <Button className="w-full bg-[#9BA899] hover:bg-[#8A9788] text-white">
                Request New Reset Link
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="w-full border-[#B8AFA5] text-[#5A5550]">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isSuccess) {
    return (
      <Card className="border-[#B8AFA5]/30">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-[#9BA899]/20 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-[#9BA899]" />
          </div>
          <CardTitle className="text-2xl font-serif text-[#5A5550]">Password Reset!</CardTitle>
          <CardDescription className="text-[#7A736B]">
            Your password has been successfully reset.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-[#7A736B] text-center">
            You can now log in with your new password. Redirecting you to login...
          </p>
          
          <Link href="/login">
            <Button className="w-full bg-[#9BA899] hover:bg-[#8A9788] text-white">
              Go to Login
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-[#B8AFA5]/30">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-[#9BA899]/20 flex items-center justify-center">
          <Lock className="h-8 w-8 text-[#9BA899]" />
        </div>
        <CardTitle className="text-2xl font-serif text-[#5A5550]">Reset Your Password</CardTitle>
        <CardDescription className="text-[#7A736B]">
          Enter your new password below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="password" className="text-[#5A5550]">New Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={8}
              className="mt-1 border-[#B8AFA5]/30 focus:border-[#9BA899]"
              autoComplete="new-password"
            />
            <p className="text-xs text-[#B8AFA5] mt-1">
              Must be at least 8 characters
            </p>
          </div>

          <div>
            <Label htmlFor="confirmPassword" className="text-[#5A5550]">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              minLength={8}
              className="mt-1 border-[#B8AFA5]/30 focus:border-[#9BA899]"
              autoComplete="new-password"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-[#9BA899] hover:bg-[#8A9788] text-white"
            disabled={isLoading}
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link href="/login">
            <Button variant="ghost" className="text-[#7A736B] hover:text-[#5A5550]">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Button>
          </Link>
        </div>

        <Suspense fallback={
          <Card className="border-[#B8AFA5]/30">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-serif text-[#5A5550]">Loading...</CardTitle>
            </CardHeader>
          </Card>
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}

