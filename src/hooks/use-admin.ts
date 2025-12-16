"use client"

import { useEffect, useState } from "react"
import { useSession } from "@/lib/auth-client"

export function useAdmin() {
  const { data: session, isPending } = useSession()
  const [isAdmin, setIsAdmin] = useState(false)
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

  return { isAdmin, isLoading: isPending || isLoading }
}

