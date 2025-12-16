"use client"

import { useEffect, useState } from "react"
import { useSession } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Calendar, Clock, User, Search, ArrowLeft, Filter, 
  CheckCircle2, XCircle, AlertCircle, Download, Mail
} from "lucide-react"
import { toast } from "sonner"
import { format, parseISO } from "date-fns"
import Link from "next/link"
import Image from "next/image"

interface Booking {
  id: number
  classId: number
  studentProfileId: number
  bookingStatus: string
  bookedAt: string
  cancelledAt: string | null
  cancellationType: string | null
  paymentId: number | null
  creditsUsed: number
  student: {
    id: number
    name: string
    email: string
  }
  class: {
    id: number
    date: string
    startTime: string
    endTime: string
    status: string
    classType: { name: string }
    instructor: { name: string }
  }
}

function BookingSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 border-b border-[#B8AFA5]/20">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-full bg-[#B8AFA5]/20" />
        <div>
          <Skeleton className="h-4 w-32 mb-2 bg-[#B8AFA5]/20" />
          <Skeleton className="h-3 w-48 bg-[#B8AFA5]/20" />
        </div>
      </div>
      <Skeleton className="h-6 w-20 rounded-full bg-[#B8AFA5]/20" />
    </div>
  )
}

export default function BookingsAuditPage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("")

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login?redirect=/admin/bookings")
    }
  }, [session, isPending, router])

  useEffect(() => {
    if (session) {
      checkAdminRole()
      fetchBookings()
    }
  }, [session])

  const checkAdminRole = async () => {
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
        }
      }
    } catch (error) {
      console.error("Failed to check role")
    }
  }

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("bearer_token")
      const res = await fetch("/api/bookings?all=true&limit=500", {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (res.ok) {
        const data = await res.json()
        setBookings(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      toast.error("Failed to load bookings")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string, classStatus?: string) => {
    // Check if class is in the past (completed)
    const isCompleted = classStatus === 'completed'
    
    switch (status) {
      case "confirmed":
        return isCompleted ? (
          <Badge className="bg-[#9BA899] text-white text-xs">Attended</Badge>
        ) : (
          <Badge className="bg-green-500 text-white text-xs">Confirmed</Badge>
        )
      case "cancelled":
        return <Badge className="bg-gray-400 text-white text-xs">Cancelled</Badge>
      case "no_show":
        return <Badge className="bg-red-500 text-white text-xs">No Show</Badge>
      case "late_cancel":
        return <Badge className="bg-orange-500 text-white text-xs">Late Cancel</Badge>
      default:
        return <Badge className="bg-gray-300 text-xs">{status}</Badge>
    }
  }

  const formatDateTime = (dateStr: string) => {
    try {
      const date = parseISO(dateStr)
      return format(date, "MMM d, yyyy 'at' h:mm a")
    } catch {
      return dateStr
    }
  }

  const formatClassDate = (dateStr: string, timeStr: string) => {
    try {
      return `${format(parseISO(dateStr), "EEE, MMM d, yyyy")} at ${timeStr}`
    } catch {
      return `${dateStr} at ${timeStr}`
    }
  }

  const isClassInPast = (dateStr: string, timeStr: string) => {
    const classDateTime = new Date(`${dateStr}T${timeStr}`)
    return classDateTime < new Date()
  }

  // Filter bookings
  const filteredBookings = bookings.filter(booking => {
    // Search filter
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = !searchTerm || 
      booking.student.name.toLowerCase().includes(searchLower) ||
      booking.student.email.toLowerCase().includes(searchLower) ||
      booking.class.classType.name.toLowerCase().includes(searchLower) ||
      booking.class.instructor.name.toLowerCase().includes(searchLower) ||
      booking.id.toString().includes(searchLower)
    
    // Status filter
    const matchesStatus = statusFilter === "all" || booking.bookingStatus === statusFilter
    
    // Date filter
    const matchesDate = !dateFilter || booking.class.date === dateFilter
    
    return matchesSearch && matchesStatus && matchesDate
  })

  // Group by date for better organization
  const groupedByDate = filteredBookings.reduce((acc, booking) => {
    const date = booking.class.date
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(booking)
    return acc
  }, {} as Record<string, Booking[]>)

  // Sort dates descending (most recent first)
  const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a))

  // Stats
  const totalConfirmed = bookings.filter(b => b.bookingStatus === 'confirmed').length
  const totalCancelled = bookings.filter(b => b.bookingStatus === 'cancelled' || b.bookingStatus === 'late_cancel').length
  const totalNoShow = bookings.filter(b => b.bookingStatus === 'no_show').length

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5]">
        <header className="bg-white border-b border-[#B8AFA5]/30 sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <Skeleton className="h-8 w-48 bg-[#B8AFA5]/20" />
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-4">
            {[1,2,3,4,5].map(i => <BookingSkeleton key={i} />)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Header */}
      <header className="bg-white border-b border-[#B8AFA5]/30 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="ghost" size="icon" className="text-[#5A5550]">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-serif text-[#5A5550]">Booking Audit Trail</h1>
                <p className="text-sm text-[#7A736B]">Track all customer bookings</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-[#9BA899] text-[#9BA899]">
                {bookings.length} Total Bookings
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="border-[#B8AFA5]/30">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-serif text-[#5A5550]">{totalConfirmed}</p>
                <p className="text-xs text-[#7A736B]">Confirmed Bookings</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-[#B8AFA5]/30">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-full">
                <XCircle className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-serif text-[#5A5550]">{totalCancelled}</p>
                <p className="text-xs text-[#7A736B]">Cancellations</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-[#B8AFA5]/30">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-serif text-[#5A5550]">{totalNoShow}</p>
                <p className="text-xs text-[#7A736B]">No Shows</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 border-[#B8AFA5]/30">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#B8AFA5]" />
                <Input
                  placeholder="Search by customer name, email, class, or booking ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-[#B8AFA5]/30"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-[#B8AFA5]/30 rounded-md bg-white text-[#5A5550]"
              >
                <option value="all">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="late_cancel">Late Cancel</option>
                <option value="no_show">No Show</option>
              </select>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-auto border-[#B8AFA5]/30"
                placeholder="Filter by class date"
              />
              {(searchTerm || statusFilter !== "all" || dateFilter) && (
                <Button 
                  variant="ghost" 
                  onClick={() => { setSearchTerm(""); setStatusFilter("all"); setDateFilter(""); }}
                  className="text-[#7A736B]"
                >
                  Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <Card className="border-[#B8AFA5]/30">
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-[#B8AFA5]" />
              <p className="text-[#7A736B]">No bookings found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {sortedDates.map(date => (
              <Card key={date} className="border-[#B8AFA5]/30 overflow-hidden">
                <CardHeader className="bg-[#F5F3F0] py-3 px-4 border-b border-[#B8AFA5]/20">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-[#5A5550] flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {format(parseISO(date), "EEEE, MMMM d, yyyy")}
                      {isClassInPast(date, "23:59") && (
                        <Badge variant="outline" className="text-xs ml-2">Past</Badge>
                      )}
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {groupedByDate[date].length} booking{groupedByDate[date].length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-[#B8AFA5]/20">
                    {groupedByDate[date]
                      .sort((a, b) => a.class.startTime.localeCompare(b.class.startTime))
                      .map(booking => (
                      <div key={booking.id} className="p-4 hover:bg-[#FAF8F5]/50 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          {/* Customer & Class Info */}
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-[#9BA899]/20 flex items-center justify-center">
                                <User className="h-5 w-5 text-[#9BA899]" />
                              </div>
                              <div>
                                <p className="font-medium text-[#5A5550]">{booking.student.name}</p>
                                <p className="text-xs text-[#7A736B] flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {booking.student.email}
                                </p>
                              </div>
                            </div>
                            
                            <div className="ml-13 pl-13 space-y-1 text-sm">
                              <p className="text-[#5A5550]">
                                <span className="font-medium">{booking.class.classType.name}</span>
                                <span className="text-[#7A736B]"> with {booking.class.instructor.name}</span>
                              </p>
                              <p className="text-[#7A736B] flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {booking.class.startTime} - {booking.class.endTime}
                              </p>
                            </div>
                          </div>

                          {/* Booking Details */}
                          <div className="flex flex-col items-end gap-2 text-right">
                            {getStatusBadge(booking.bookingStatus, booking.class.status)}
                            <div className="text-xs text-[#7A736B] space-y-1">
                              <p>Booking #{booking.id}</p>
                              <p>Booked: {formatDateTime(booking.bookedAt)}</p>
                              {booking.creditsUsed > 0 && (
                                <p className="text-[#9BA899]">{booking.creditsUsed} credit{booking.creditsUsed !== 1 ? 's' : ''} used</p>
                              )}
                              {booking.cancelledAt && (
                                <p className="text-red-500">
                                  Cancelled: {formatDateTime(booking.cancelledAt)}
                                  {booking.cancellationType && ` (${booking.cancellationType})`}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
