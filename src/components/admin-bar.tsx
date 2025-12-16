"use client"

import { useEffect, useState } from "react"
import { useSession } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Settings, Calendar, Users, Package, LayoutDashboard, X } from "lucide-react"
import Link from "next/link"

interface AdminBarProps {
  currentPage?: 'schedule' | 'instructors' | 'classes' | 'pricing' | 'other'
}

export function AdminBar({ currentPage }: AdminBarProps) {
  const { data: session, isPending } = useSession()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!session?.user) {
        setIsAdmin(false)
        setIsLoading(false)
        return
      }

      try {
        const token = localStorage.getItem("bearer_token")
        if (!token) {
          setIsAdmin(false)
          setIsLoading(false)
          return
        }

        const res = await fetch("/api/user-profiles", {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (res.ok) {
          const data = await res.json()
          setIsAdmin(data.role === "admin")
        }
      } catch (error) {
        console.error("Failed to check admin role")
      } finally {
        setIsLoading(false)
      }
    }

    if (!isPending) {
      checkAdminRole()
    }
  }, [session, isPending])

  if (isPending || isLoading || !isAdmin || !isVisible) {
    return null
  }

  const getEditLink = () => {
    switch (currentPage) {
      case 'schedule':
        return '/admin/classes'
      case 'instructors':
        return '/admin/instructors'
      case 'pricing':
        return '/admin'
      case 'classes':
        return '/admin/classes'
      default:
        return '/admin'
    }
  }

  const getEditLabel = () => {
    switch (currentPage) {
      case 'schedule':
        return 'Edit Schedule'
      case 'instructors':
        return 'Edit Instructors'
      case 'pricing':
        return 'Edit Pricing'
      case 'classes':
        return 'Manage Classes'
      default:
        return 'Admin Dashboard'
    }
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-[#5A5550] to-[#7A736B] text-white shadow-lg">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 animate-pulse" />
            <span className="text-sm font-medium">Admin Mode</span>
            <span className="text-xs text-white/70 hidden sm:inline">— You can edit this page</span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Quick Links */}
            <div className="hidden md:flex items-center gap-1">
              <Link href="/admin">
                <Button size="sm" variant="ghost" className="h-7 text-white hover:bg-white/20 hover:text-white">
                  <LayoutDashboard className="h-3.5 w-3.5 mr-1" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/admin/classes">
                <Button size="sm" variant="ghost" className="h-7 text-white hover:bg-white/20 hover:text-white">
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  Classes
                </Button>
              </Link>
              <Link href="/admin/instructors">
                <Button size="sm" variant="ghost" className="h-7 text-white hover:bg-white/20 hover:text-white">
                  <Users className="h-3.5 w-3.5 mr-1" />
                  Instructors
                </Button>
              </Link>
            </div>

            {/* Primary Edit Button */}
            <Link href={getEditLink()}>
              <Button size="sm" className="h-7 bg-white text-[#5A5550] hover:bg-white/90 font-medium">
                {getEditLabel()}
              </Button>
            </Link>

            {/* Close Button */}
            <button
              onClick={() => setIsVisible(false)}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
              title="Hide admin bar (refreshing will show it again)"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

