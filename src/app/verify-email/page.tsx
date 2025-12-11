"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, CheckCircle, AlertCircle, Mail, Loader2 } from "lucide-react"

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error" | "pending">("loading")
  const [isResending, setIsResending] = useState(false)
  
  const token = searchParams.get("token")
  const email = searchParams.get("email")

  useEffect(() => {
    if (token) {
      // Verify the token
      verifyEmail(token)
    } else if (email) {
      // User just registered, show pending state
      setStatus("pending")
    } else {
      setStatus("error")
    }
  }, [token, email])

  const verifyEmail = async (verificationToken: string) => {
    try {
      const { error } = await authClient.verifyEmail({
        token: verificationToken,
      })

      if (error) {
        console.error('Verification error:', error)
        setStatus("error")
        return
      }

      setStatus("success")
      toast.success("Email verified successfully!")
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login?verified=true")
      }, 3000)
    } catch (error) {
      console.error('Verification failed:', error)
      setStatus("error")
    }
  }

  const handleResendEmail = async () => {
    if (!email) {
      toast.error("No email address provided")
      return
    }

    setIsResending(true)
    try {
      const { error } = await authClient.sendVerificationEmail({
        email: email,
        callbackURL: "/verify-email",
      })

      if (error) {
        toast.error("Failed to resend verification email")
        return
      }

      toast.success("Verification email sent! Check your inbox.")
    } catch (error) {
      toast.error("Failed to resend verification email")
    } finally {
      setIsResending(false)
    }
  }

  if (status === "loading") {
    return (
      <Card className="border-[#B8AFA5]/30 shadow-lg">
        <CardContent className="pt-8 pb-8">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-[#9BA899] mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-serif text-[#5A5550] mb-2">Verifying Your Email</h2>
            <p className="text-[#7A736B]">Please wait while we verify your email address...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (status === "success") {
    return (
      <Card className="border-[#B8AFA5]/30 shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-[#9BA899]/20 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-[#9BA899]" />
          </div>
          <CardTitle className="text-2xl font-serif font-normal text-[#5A5550]">Email Verified!</CardTitle>
          <CardDescription className="text-[#7A736B]">
            Your email has been successfully verified.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-[#7A736B] text-center">
            You can now log in to your account and start booking classes.
          </p>
          <p className="text-xs text-[#B8AFA5] text-center">
            Redirecting to login...
          </p>
          <Link href="/login">
            <Button className="w-full bg-[#9BA899] hover:bg-[#8A9788] text-white rounded-full">
              Go to Login
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  if (status === "error") {
    return (
      <Card className="border-[#B8AFA5]/30 shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-serif font-normal text-[#5A5550]">Verification Failed</CardTitle>
          <CardDescription className="text-[#7A736B]">
            This verification link is invalid or has expired.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-[#7A736B] text-center">
            Verification links expire after 24 hours. Please request a new one.
          </p>
          <div className="flex flex-col gap-2">
            <Link href="/login">
              <Button className="w-full bg-[#9BA899] hover:bg-[#8A9788] text-white rounded-full">
                Go to Login
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" className="w-full border-[#B8AFA5] text-[#5A5550] rounded-full">
                Register Again
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Pending state - waiting for user to check email
  return (
    <Card className="border-[#B8AFA5]/30 shadow-lg">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-[#9BA899]/20 flex items-center justify-center">
          <Mail className="h-8 w-8 text-[#9BA899]" />
        </div>
        <CardTitle className="text-2xl font-serif font-normal text-[#5A5550]">Check Your Email</CardTitle>
        <CardDescription className="text-[#7A736B]">
          We've sent a verification link to <strong className="text-[#5A5550]">{email}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-[#7A736B] text-center">
          Click the link in the email to verify your account. The link will expire in 24 hours.
        </p>
        
        <div className="bg-[#FAF8F5] rounded-lg p-4">
          <p className="text-xs text-[#B8AFA5] text-center">
            <strong>Didn't receive the email?</strong><br />
            Check your spam folder or click below to resend.
          </p>
        </div>

        <Button 
          variant="outline" 
          className="w-full border-[#9BA899] text-[#9BA899] hover:bg-[#9BA899]/10 rounded-full"
          onClick={handleResendEmail}
          disabled={isResending}
        >
          {isResending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            "Resend Verification Email"
          )}
        </Button>

        <div className="pt-2">
          <Link href="/login">
            <Button variant="ghost" className="w-full text-[#7A736B] hover:text-[#5A5550]">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col">
      {/* Header */}
      <header className="border-b border-[#B8AFA5]/20 bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center">
            <Link href="/pilates" className="flex items-center gap-3">
              <div className="relative w-10 h-10">
                <Image
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/image-1765052969010.png?width=8000&height=8000&resize=contain"
                  alt="Swift Fit"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="font-serif text-lg text-[#5A5550]">Swift Fit Pilates</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Suspense fallback={
            <Card className="border-[#B8AFA5]/30">
              <CardContent className="pt-8 pb-8">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 text-[#9BA899] mx-auto mb-4 animate-spin" />
                  <p className="text-[#7A736B]">Loading...</p>
                </div>
              </CardContent>
            </Card>
          }>
            <VerifyEmailContent />
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

