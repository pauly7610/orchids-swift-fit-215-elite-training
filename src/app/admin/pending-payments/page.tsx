"use client"

import { useEffect, useState } from "react"
import { useSession } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, CheckCircle, XCircle, Clock, DollarSign, User, Package, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import Link from "next/link"
import Image from "next/image"

interface PendingPurchase {
  id: number
  studentProfileId: number
  packageId: number | null
  membershipId: number | null
  productName: string
  productType: string
  amount: number
  status: string
  createdAt: string
  studentName: string
  studentEmail: string
}

export default function PendingPaymentsPage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [pending, setPending] = useState<PendingPurchase[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<number | null>(null)

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login?redirect=/admin/pending-payments")
    }
  }, [session, isPending, router])

  useEffect(() => {
    if (session) {
      checkAdminAndFetch()
    }
  }, [session])

  const checkAdminAndFetch = async () => {
    try {
      const token = localStorage.getItem("bearer_token")
      const res = await fetch("/api/user-profiles", {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (res.ok) {
        const data = await res.json()
        if (data.role !== "admin") {
          toast.error("Access denied. Admin only.")
          router.push("/pilates")
          return
        }
      }
      
      fetchPending()
    } catch (error) {
      console.error("Failed to check role")
    }
  }

  const fetchPending = async () => {
    try {
      const token = localStorage.getItem("bearer_token")
      const res = await fetch("/api/pending-purchases?status=pending", {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (res.ok) {
        const data = await res.json()
        setPending(data)
      }
    } catch (error) {
      toast.error("Failed to load pending payments")
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async (id: number) => {
    setProcessing(id)
    try {
      const token = localStorage.getItem("bearer_token")
      const res = await fetch("/api/pending-purchases", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ pendingId: id, action: "confirm" })
      })

      const data = await res.json()
      
      if (res.ok) {
        toast.success(data.message || "Payment confirmed and credits added!")
        fetchPending()
      } else {
        toast.error(data.error || "Failed to confirm payment")
      }
    } catch (error) {
      toast.error("Failed to confirm payment")
    } finally {
      setProcessing(null)
    }
  }

  const handleCancel = async (id: number) => {
    setProcessing(id)
    try {
      const token = localStorage.getItem("bearer_token")
      const res = await fetch("/api/pending-purchases", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ pendingId: id, action: "cancel" })
      })

      if (res.ok) {
        toast.success("Purchase cancelled")
        fetchPending()
      } else {
        toast.error("Failed to cancel")
      }
    } catch (error) {
      toast.error("Failed to cancel")
    } finally {
      setProcessing(null)
    }
  }

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col">
        <header className="border-b border-[#B8AFA5]/20 bg-white">
          <div className="container mx-auto px-4 py-4">
            <Skeleton className="h-8 w-48 bg-[#B8AFA5]/20" />
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="border-[#B8AFA5]/30">
                <CardContent className="p-6">
                  <Skeleton className="h-20 w-full bg-[#B8AFA5]/20" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col">
      {/* Header */}
      <header className="border-b border-[#B8AFA5]/20 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/admin")}
                className="text-[#7A736B] hover:text-[#5A5550] hover:bg-[#9BA899]/10 rounded-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="font-serif text-xl md:text-2xl text-[#5A5550]">Pending Payments</h1>
                <p className="text-xs text-[#9BA899]">Confirm payments to add credits</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchPending}
                className="border-[#B8AFA5] text-[#5A5550]"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Link href="/pilates" className="hidden sm:block">
                <div className="relative w-8 h-8">
                  <Image
                    src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/image-1765052969010.png?width=8000&height=8000&resize=contain"
                    alt="Swift Fit"
                    fill
                    className="object-contain"
                  />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 md:py-8 flex-1">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="border-[#B8AFA5]/30 bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[#5A5550]">Pending</CardTitle>
              <Clock className="h-4 w-4 text-[#E8B4B8]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-serif text-[#E8B4B8]">{pending.length}</div>
              <p className="text-xs text-[#B8AFA5]">Awaiting confirmation</p>
            </CardContent>
          </Card>
          
          <Card className="border-[#B8AFA5]/30 bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[#5A5550]">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-[#9BA899]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-serif text-[#9BA899]">
                ${pending.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
              </div>
              <p className="text-xs text-[#B8AFA5]">Pending amount</p>
            </CardContent>
          </Card>

          <Card className="border-[#B8AFA5]/30 bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[#5A5550]">Quick Actions</CardTitle>
              <Package className="h-4 w-4 text-[#9BA899]" />
            </CardHeader>
            <CardContent>
              <Link href="/admin/users">
                <Button size="sm" variant="outline" className="w-full border-[#9BA899] text-[#9BA899]">
                  Manage Users
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Pending List */}
        <Card className="border-[#B8AFA5]/30 bg-white">
          <CardHeader>
            <CardTitle className="font-serif font-normal text-[#5A5550]">Pending Purchases</CardTitle>
            <CardDescription className="text-[#7A736B]">
              When you receive a SwipeSimple payment notification, find the customer here and confirm
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pending.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-[#9BA899] opacity-50" />
                <p className="text-[#7A736B]">No pending payments</p>
                <p className="text-sm text-[#B8AFA5] mt-1">All caught up!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pending.map((item) => (
                  <Card key={item.id} className="border-[#B8AFA5]/30 hover:border-[#9BA899]/50 transition-colors">
                    <CardContent className="p-4 md:p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="h-10 w-10 rounded-full bg-[#E8B4B8]/20 flex items-center justify-center shrink-0">
                            <User className="h-5 w-5 text-[#E8B4B8]" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h3 className="font-medium text-[#5A5550]">{item.studentName}</h3>
                              <Badge variant="outline" className="border-[#E8B4B8] text-[#E8B4B8] rounded-full">
                                <Clock className="h-3 w-3 mr-1" />
                                Pending
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-[#7A736B] mb-2">{item.studentEmail}</p>
                            
                            <div className="flex flex-wrap items-center gap-3 text-sm">
                              <Badge className="bg-[#9BA899]/20 text-[#5A5550] rounded-full">
                                {item.productName}
                              </Badge>
                              <span className="font-medium text-[#9BA899]">${item.amount.toFixed(2)}</span>
                              <span className="text-[#B8AFA5]">
                                {format(new Date(item.createdAt), "MMM d, h:mm a")}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancel(item.id)}
                            disabled={processing === item.id}
                            className="border-[#B8AFA5] text-[#7A736B] hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleConfirm(item.id)}
                            disabled={processing === item.id}
                            className="bg-[#9BA899] hover:bg-[#8A9788] text-white"
                          >
                            {processing === item.id ? (
                              <>Processing...</>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Confirm Payment
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#B8AFA5]/20 bg-white py-4 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-[#7A736B]">
          © 2025 Swift Fit Pilates & Wellness Studio — Admin Panel
        </div>
      </footer>
    </div>
  )
}
