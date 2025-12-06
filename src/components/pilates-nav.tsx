"use client"

import { useState, useEffect } from "react"
import { useSession, authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, LogOut, LayoutDashboard } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"
import Link from "next/link"

interface UserProfile {
  role: string
}

export function PilatesNav() {
  const { data: session, isPending, refetch } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    if (session?.user) {
      fetchProfile()
    }
  }, [session])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("bearer_token")
      const res = await fetch("/api/user-profiles", {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
      }
    } catch (error) {
      console.error("Failed to fetch profile")
    }
  }

  const handleSignOut = async () => {
    const { error } = await authClient.signOut()
    if (error?.code) {
      toast.error(error.code)
    } else {
      localStorage.removeItem("bearer_token")
      refetch()
      router.push("/pilates")
      toast.success("Signed out successfully")
    }
  }

  const getDashboardLink = () => {
    if (!profile) return "/student"
    
    switch (profile.role) {
      case "admin":
        return "/admin"
      case "instructor":
        return "/instructor"
      case "student":
      default:
        return "/student"
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#FAF8F5]/95 backdrop-blur-sm border-b border-[#B8AFA5]/20">
      <div className="container mx-auto px-4 py-5 flex items-center justify-between">
        <Link href="/pilates" className="flex items-center gap-3">
          <div className="relative w-12 h-12">
            <Image
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/image-1765052969010.png?width=8000&height=8000&resize=contain"
              alt="Swift Fit Pilates and Wellness Studio"
              fill
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="font-serif text-xl tracking-wide text-[#5A5550]">Swift Fit</h1>
            <p className="text-xs text-[#9BA899] -mt-0.5 tracking-wider">PILATES AND WELLNESS STUDIO</p>
          </div>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/pilates/about" className="text-[#5A5550] hover:text-[#9BA899] transition-colors text-sm">About</Link>
          <Link href="/pilates/instructors" className="text-[#5A5550] hover:text-[#9BA899] transition-colors text-sm">Instructors</Link>
          <Link href="/pilates/classes" className="text-[#5A5550] hover:text-[#9BA899] transition-colors text-sm">Classes</Link>
          <Link href="/pilates/pricing" className="text-[#5A5550] hover:text-[#9BA899] transition-colors text-sm">Pricing</Link>
          <Link href="/pilates/schedule" className="text-[#5A5550] hover:text-[#9BA899] transition-colors text-sm">Schedule</Link>
          <Link href="/pilates/faq" className="text-[#5A5550] hover:text-[#9BA899] transition-colors text-sm">FAQ</Link>
          <Link href="/">
            <Button size="sm" variant="outline" className="border-[#B8AFA5] text-[#5A5550] hover:bg-[#9BA899]/10">
              Back to Gym
            </Button>
          </Link>
          
          {isPending ? (
            <div className="h-10 w-10 rounded-full bg-muted animate-pulse"></div>
          ) : !session?.user ? (
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => router.push("/login")}>
                Sign In
              </Button>
              <Button onClick={() => router.push("/register")}>
                Register
              </Button>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div>
                    <div className="font-semibold">{session.user.name}</div>
                    <div className="text-xs font-normal text-muted-foreground">
                      {session.user.email}
                    </div>
                    {profile && (
                      <div className="text-xs font-normal text-muted-foreground mt-1 capitalize">
                        {profile.role}
                      </div>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push(getDashboardLink())}>
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>
      </div>
    </header>
  )
}