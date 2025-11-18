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

  if (isPending) {
    return (
      <div className="h-10 w-10 rounded-full bg-muted animate-pulse"></div>
    )
  }

  if (!session?.user) {
    return (
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={() => router.push("/login")}>
          Sign In
        </Button>
        <Button onClick={() => router.push("/register")}>
          Register
        </Button>
      </div>
    )
  }

  return (
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
  )
}
