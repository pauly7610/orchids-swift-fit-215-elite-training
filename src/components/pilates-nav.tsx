"use client"

import { useState, useEffect, useRef } from "react"
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
import { User, LogOut, LayoutDashboard, Menu, X } from "lucide-react"
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (session?.user) {
      fetchProfile()
    }
  }, [session])

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false)
        mobileMenuButtonRef.current?.focus()
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isMobileMenuOpen])

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node) && isMobileMenuOpen) {
        setIsMobileMenuOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMobileMenuOpen])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

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
      <div className="container mx-auto px-4 py-4 md:py-5 flex items-center justify-between">
        <Link href="/pilates" className="flex items-center gap-2 md:gap-3">
          <div className="relative w-10 h-10 md:w-12 md:h-12">
            <Image
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/image-1765052969010.png?width=8000&height=8000&resize=contain"
              alt="Swift Fit Pilates and Wellness Studio"
              fill
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="font-serif text-lg md:text-xl tracking-wide text-[#5A5550]">Swift Fit</h1>
            <p className="text-[10px] md:text-xs text-[#9BA899] -mt-0.5 tracking-wider">PILATES AND WELLNESS STUDIO</p>
          </div>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
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
              <Button variant="outline" size="sm" onClick={() => router.push("/login")}>
                Sign In
              </Button>
              <Button size="sm" className="bg-[#9BA899] hover:bg-[#8A9788]" onClick={() => router.push("/register")}>
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

        {/* Mobile Menu Button */}
        <button
          ref={mobileMenuButtonRef}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden text-[#5A5550] p-2 hover:bg-[#9BA899]/10 rounded-lg transition-colors"
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div 
          id="mobile-menu"
          className="lg:hidden border-t border-[#B8AFA5]/20 bg-[#FAF8F5]/98 backdrop-blur-sm max-h-[calc(100vh-80px)] overflow-y-auto" 
          ref={mobileMenuRef}
          role="dialog"
          aria-label="Mobile navigation menu"
        >
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-1" aria-label="Mobile navigation">
            <Link 
              href="/pilates/about" 
              className="text-[#5A5550] hover:text-[#9BA899] hover:bg-[#9BA899]/10 transition-colors text-base font-medium py-3 px-2 rounded-lg" 
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link 
              href="/pilates/instructors" 
              className="text-[#5A5550] hover:text-[#9BA899] hover:bg-[#9BA899]/10 transition-colors text-base font-medium py-3 px-2 rounded-lg" 
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Instructors
            </Link>
            <Link 
              href="/pilates/classes" 
              className="text-[#5A5550] hover:text-[#9BA899] hover:bg-[#9BA899]/10 transition-colors text-base font-medium py-3 px-2 rounded-lg" 
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Classes
            </Link>
            <Link 
              href="/pilates/pricing" 
              className="text-[#5A5550] hover:text-[#9BA899] hover:bg-[#9BA899]/10 transition-colors text-base font-medium py-3 px-2 rounded-lg" 
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link 
              href="/pilates/schedule" 
              className="text-[#5A5550] hover:text-[#9BA899] hover:bg-[#9BA899]/10 transition-colors text-base font-medium py-3 px-2 rounded-lg" 
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Schedule
            </Link>
            <Link 
              href="/pilates/faq" 
              className="text-[#5A5550] hover:text-[#9BA899] hover:bg-[#9BA899]/10 transition-colors text-base font-medium py-3 px-2 rounded-lg" 
              onClick={() => setIsMobileMenuOpen(false)}
            >
              FAQ
            </Link>
            
            <div className="border-t border-[#B8AFA5]/20 my-2"></div>
            
            {isPending ? (
              <div className="h-12 rounded-full bg-muted animate-pulse"></div>
            ) : !session?.user ? (
              <div className="flex flex-col gap-2 mt-2">
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full border-[#B8AFA5] text-[#5A5550]">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full bg-[#9BA899] hover:bg-[#8A9788] text-white">
                    Create Account
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2 mt-2">
                <div className="px-2 py-2 text-sm text-[#5A5550]">
                  <div className="font-semibold">{session.user.name}</div>
                  <div className="text-xs text-[#7A736B]">{session.user.email}</div>
                  {profile && (
                    <div className="text-xs text-[#9BA899] capitalize mt-0.5">{profile.role}</div>
                  )}
                </div>
                <Link href={getDashboardLink()} onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full bg-[#9BA899] hover:bg-[#8A9788] text-white">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="w-full border-[#B8AFA5] text-[#5A5550]"
                  onClick={() => {
                    handleSignOut()
                    setIsMobileMenuOpen(false)
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            )}
            
            <div className="border-t border-[#B8AFA5]/20 my-2"></div>
            
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full text-[#5A5550] hover:text-[#9BA899] hover:bg-[#9BA899]/10">
                Back to Gym
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
