"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"
import Link from "next/link"
import { ArrowLeft, Mail, CheckCircle } from "lucide-react"

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [email, setEmail] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast.error("Please enter your email address")
      return
    }

    setIsLoading(true)

    try {
      const { error } = await authClient.forgetPassword({
        email: email.trim(),
        redirectTo: "/reset-password",
      })

      if (error) {
        toast.error("Failed to send reset email. Please try again.")
        setIsLoading(false)
        return
      }

      setEmailSent(true)
      toast.success("Password reset email sent!")
    } catch (error) {
      toast.error("An error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="border-[#B8AFA5]/30">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-[#9BA899]/20 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-[#9BA899]" />
              </div>
              <CardTitle className="text-2xl font-serif text-[#5A5550]">Check Your Email</CardTitle>
              <CardDescription className="text-[#7A736B]">
                We've sent a password reset link to <strong>{email}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-[#7A736B] text-center">
                Click the link in the email to reset your password. The link will expire in 1 hour.
              </p>
              
              <p className="text-xs text-[#B8AFA5] text-center">
                Didn't receive the email? Check your spam folder or{" "}
                <button 
                  onClick={() => setEmailSent(false)} 
                  className="text-[#9BA899] hover:underline"
                >
                  try again
                </button>
              </p>

              <div className="pt-4">
                <Link href="/login">
                  <Button variant="outline" className="w-full border-[#B8AFA5] text-[#5A5550]">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Login
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

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

        <Card className="border-[#B8AFA5]/30">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-[#9BA899]/20 flex items-center justify-center">
              <Mail className="h-8 w-8 text-[#9BA899]" />
            </div>
            <CardTitle className="text-2xl font-serif text-[#5A5550]">Forgot Password?</CardTitle>
            <CardDescription className="text-[#7A736B]">
              Enter your email and we'll send you a link to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-[#5A5550]">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 border-[#B8AFA5]/30 focus:border-[#9BA899]"
                  autoComplete="email"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-[#9BA899] hover:bg-[#8A9788] text-white"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>

              <p className="text-center text-sm text-[#7A736B]">
                Remember your password?{" "}
                <Link href="/login" className="text-[#9BA899] hover:underline font-semibold">
                  Sign in
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

