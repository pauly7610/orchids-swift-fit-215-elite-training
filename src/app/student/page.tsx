"use client"

import { useEffect, useState } from "react"
import { useSession, authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, User, CreditCard, Package, CheckCircle2, AlertCircle, RefreshCw, LogOut, ShoppingBag, Settings, Bell, Mail, Pencil, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { format, parseISO } from "date-fns"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Link from "next/link"
import Image from "next/image"

interface Class {
  id: number
  date: string
  startTime: string
  endTime: string
  capacity: number
  status: string
  price: number
  classType: { name: string; description: string; durationMinutes: number }
  instructor: { name: string; headshotUrl: string }
  registeredCount: number
  spotsRemaining: number
  isUserBooked: boolean
  waitlistPosition: number | null
}

interface Booking {
  id: number
  bookingStatus: string
  bookedAt: string
  class: {
    id: number
    date: string
    startTime: string
    classType: { name: string }
    instructor: { name: string }
  }
}

interface Purchase {
  id: number
  purchaseType: string
  creditsRemaining: number
  creditsTotal: number
  expiresAt: string
  autoRenew: boolean
  nextBillingDate: string | null
  package?: { name: string }
  membership?: { name: string }
}

interface UserProfile {
  id: number
  phone: string | null
  emailReminders: boolean
  reminderHoursBefore: number
  marketingEmails: boolean
}

// Skeleton Components
function StatCardSkeleton() {
  return (
    <Card className="border-[#B8AFA5]/30 bg-white">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-24 bg-[#B8AFA5]/20" />
        <Skeleton className="h-4 w-4 rounded bg-[#B8AFA5]/20" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-12 mb-1 bg-[#B8AFA5]/20" />
        <Skeleton className="h-3 w-20 bg-[#B8AFA5]/20" />
      </CardContent>
    </Card>
  )
}

function ClassCardSkeleton() {
  return (
    <Card className="border-[#B8AFA5]/30">
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1 space-y-3">
            <Skeleton className="h-5 w-40 bg-[#B8AFA5]/20" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32 bg-[#B8AFA5]/20" />
              <Skeleton className="h-4 w-28 bg-[#B8AFA5]/20" />
              <Skeleton className="h-4 w-24 bg-[#B8AFA5]/20" />
            </div>
            <Skeleton className="h-5 w-20 rounded-full bg-[#B8AFA5]/20" />
          </div>
          <Skeleton className="h-9 w-28 rounded-full bg-[#B8AFA5]/20" />
        </div>
      </CardContent>
    </Card>
  )
}

export default function StudentDashboard() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [classes, setClasses] = useState<Class[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [togglingRenewal, setTogglingRenewal] = useState<number | null>(null)
  
  // Booking confirmation modal state
  const [bookingClass, setBookingClass] = useState<Class | null>(null)
  const [isBooking, setIsBooking] = useState(false)
  
  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: ""
  })
  const [savingProfile, setSavingProfile] = useState(false)
  
  // Notification preferences state
  const [savingNotifications, setSavingNotifications] = useState(false)

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login?redirect=/student")
    }
  }, [session, isPending, router])

  useEffect(() => {
    if (session) {
      fetchData()
    }
  }, [session])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("bearer_token")
      const headers = { Authorization: `Bearer ${token}` }

      const [classesRes, bookingsRes, purchasesRes, profileRes] = await Promise.all([
        fetch("/api/classes/schedule", { headers }),
        fetch("/api/bookings", { headers }),
        fetch("/api/student-purchases", { headers }),
        fetch("/api/user-profiles", { headers })
      ])

      if (classesRes.ok) setClasses(await classesRes.json())
      if (bookingsRes.ok) setBookings(await bookingsRes.json())
      if (purchasesRes.ok) setPurchases(await purchasesRes.json())
      if (profileRes.ok) {
        const profileData = await profileRes.json()
        setProfile(profileData)
        setProfileForm({
          name: session?.user?.name || "",
          phone: profileData?.phone || ""
        })
      }
    } catch (error) {
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await authClient.signOut()
      localStorage.removeItem("bearer_token")
      toast.success("Signed out successfully")
      router.push("/pilates")
    } catch (error) {
      toast.error("Failed to sign out")
    }
  }

  const confirmBookClass = async () => {
    if (!bookingClass) return
    
    setIsBooking(true)
    try {
      const token = localStorage.getItem("bearer_token")
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ classId: bookingClass.id })
      })

      const data = await res.json()
      
      if (res.ok) {
        toast.success(data.message || "Class booked successfully!")
        fetchData()
        setBookingClass(null)
      } else {
        toast.error(data.error || "Failed to book class")
      }
    } catch (error) {
      toast.error("Failed to book class")
    } finally {
      setIsBooking(false)
    }
  }

  const handleCancelBooking = async (bookingId: number) => {
    try {
      const token = localStorage.getItem("bearer_token")
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      })

      const data = await res.json()
      
      if (res.ok) {
        toast.success(data.message || "Booking cancelled")
        fetchData()
      } else {
        toast.error(data.error || "Failed to cancel booking")
      }
    } catch (error) {
      toast.error("Failed to cancel booking")
    }
  }

  const handleJoinWaitlist = async (classId: number) => {
    try {
      const token = localStorage.getItem("bearer_token")
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ classId })
      })

      const data = await res.json()
      
      if (res.ok) {
        toast.success(`Added to waitlist (Position: ${data.position})`)
        fetchData()
      } else {
        toast.error(data.error || "Failed to join waitlist")
      }
    } catch (error) {
      toast.error("Failed to join waitlist")
    }
  }

  const handleToggleAutoRenewal = async (purchaseId: number, currentValue: boolean) => {
    setTogglingRenewal(purchaseId)
    try {
      const token = localStorage.getItem("bearer_token")
      const res = await fetch(`/api/memberships/${purchaseId}/toggle-renewal`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      })

      const data = await res.json()
      
      if (res.ok) {
        toast.success(currentValue ? "Auto-renewal disabled" : "Auto-renewal enabled")
        fetchData()
      } else {
        toast.error(data.error || "Failed to update auto-renewal")
      }
    } catch (error) {
      toast.error("Failed to update auto-renewal")
    } finally {
      setTogglingRenewal(null)
    }
  }

  const handleSaveProfile = async () => {
    setSavingProfile(true)
    try {
      const token = localStorage.getItem("bearer_token")
      
      // Update user name via auth
      if (profileForm.name !== session?.user?.name) {
        await authClient.updateUser({
          name: profileForm.name
        })
      }
      
      // Update profile phone
      const res = await fetch("/api/user-profiles", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ phone: profileForm.phone || null })
      })

      if (res.ok) {
        toast.success("Profile updated successfully")
        setIsEditingProfile(false)
        fetchData()
      } else {
        toast.error("Failed to update profile")
      }
    } catch (error) {
      toast.error("Failed to update profile")
    } finally {
      setSavingProfile(false)
    }
  }

  const handleUpdateNotifications = async (field: string, value: boolean | number) => {
    setSavingNotifications(true)
    try {
      const token = localStorage.getItem("bearer_token")
      const res = await fetch("/api/user-profiles", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ [field]: value })
      })

      if (res.ok) {
        toast.success("Preferences updated")
        fetchData()
      } else {
        toast.error("Failed to update preferences")
      }
    } catch (error) {
      toast.error("Failed to update preferences")
    } finally {
      setSavingNotifications(false)
    }
  }

  const totalCredits = purchases.reduce((sum, p) => sum + (p.creditsRemaining || 0), 0)
  const activeBookings = bookings.filter(b => b.bookingStatus === "confirmed")
  const upcomingClasses = classes.filter(c => new Date(`${c.date}T${c.startTime}`) > new Date())

  // Loading skeleton
  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col">
        {/* Header Skeleton */}
        <header className="border-b border-[#B8AFA5]/20 bg-white sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3 md:py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#B8AFA5]/20" />
                <div>
                  <Skeleton className="h-5 w-28 mb-1 bg-[#B8AFA5]/20" />
                  <Skeleton className="h-3 w-20 bg-[#B8AFA5]/20" />
                </div>
              </div>
              <Skeleton className="h-9 w-24 rounded-full bg-[#B8AFA5]/20" />
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-4 md:py-8 flex-1">
          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-8">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>

          {/* Tabs Skeleton */}
          <Skeleton className="h-10 w-full max-w-md rounded-full mb-6 bg-[#B8AFA5]/20" />

          {/* Classes Skeleton */}
          <Card className="border-[#B8AFA5]/30 bg-white">
            <CardHeader>
              <Skeleton className="h-6 w-40 mb-2 bg-[#B8AFA5]/20" />
              <Skeleton className="h-4 w-32 bg-[#B8AFA5]/20" />
            </CardHeader>
            <CardContent className="space-y-4">
              <ClassCardSkeleton />
              <ClassCardSkeleton />
              <ClassCardSkeleton />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col">
      {/* Header */}
      <header className="border-b border-[#B8AFA5]/20 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Link href="/pilates" className="shrink-0">
                <div className="relative w-8 h-8 md:w-10 md:h-10">
                  <Image
                    src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/image-1765052969010.png?width=8000&height=8000&resize=contain"
                    alt="Swift Fit"
                    fill
                    className="object-contain"
                  />
                </div>
              </Link>
              <div className="min-w-0">
                <h1 className="font-serif text-lg md:text-xl text-[#5A5550] truncate">My Dashboard</h1>
                <p className="text-xs text-[#9BA899] truncate">Welcome back, {session?.user?.name?.split(' ')[0]}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="hidden sm:flex border-[#9BA899] text-[#9BA899] hover:bg-[#9BA899]/10 rounded-full" 
                onClick={() => router.push("/pilates/schedule")}
              >
                View Schedule
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-[#5A5550] hover:text-[#9BA899] hover:bg-[#9BA899]/10"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 md:py-8 flex-1">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-8">
          <Card className="border-[#B8AFA5]/30 bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[#5A5550]">Available Credits</CardTitle>
              <CreditCard className="h-4 w-4 text-[#9BA899]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-serif text-[#9BA899]">{totalCredits}</div>
              <p className="text-xs text-[#B8AFA5]">
                {purchases.filter(p => p.creditsRemaining > 0).length} active packages
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#B8AFA5]/30 bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[#5A5550]">Active Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-[#9BA899]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-serif text-[#9BA899]">{activeBookings.length}</div>
              <p className="text-xs text-[#B8AFA5]">Upcoming classes</p>
            </CardContent>
          </Card>

          <Card className="border-[#B8AFA5]/30 bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[#5A5550]">Classes Available</CardTitle>
              <Package className="h-4 w-4 text-[#9BA899]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-serif text-[#9BA899]">{upcomingClasses.length}</div>
              <p className="text-xs text-[#B8AFA5]">Book now</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="classes" className="space-y-4 md:space-y-6">
          <TabsList className="w-full justify-start overflow-x-auto flex-nowrap bg-white border border-[#B8AFA5]/30 rounded-full p-1">
            <TabsTrigger value="classes" className="text-xs md:text-sm whitespace-nowrap rounded-full data-[state=active]:bg-[#9BA899] data-[state=active]:text-white">Classes</TabsTrigger>
            <TabsTrigger value="bookings" className="text-xs md:text-sm whitespace-nowrap rounded-full data-[state=active]:bg-[#9BA899] data-[state=active]:text-white">Bookings</TabsTrigger>
            <TabsTrigger value="packages" className="text-xs md:text-sm whitespace-nowrap rounded-full data-[state=active]:bg-[#9BA899] data-[state=active]:text-white">Packages</TabsTrigger>
            <TabsTrigger value="settings" className="text-xs md:text-sm whitespace-nowrap rounded-full data-[state=active]:bg-[#9BA899] data-[state=active]:text-white">
              <Settings className="h-3 w-3 mr-1" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Available Classes */}
          <TabsContent value="classes" className="space-y-4">
            <Card className="border-[#B8AFA5]/30 bg-white">
              <CardHeader>
                <CardTitle className="font-serif font-normal text-[#5A5550]">Available Classes</CardTitle>
                <CardDescription className="text-[#7A736B]">Book your next class</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingClasses.length === 0 ? (
                  <p className="text-center text-[#B8AFA5] py-8">No upcoming classes available</p>
                ) : (
                  upcomingClasses.map((cls) => {
                    const isFull = cls.spotsRemaining <= 0
                    
                    return (
                      <Card key={cls.id} className="border-[#B8AFA5]/30 hover:border-[#9BA899]/50 transition-colors">
                        <CardContent className="p-4 md:p-6">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <h3 className="font-serif text-base md:text-lg text-[#5A5550]">{cls.classType.name}</h3>
                                {cls.isUserBooked && (
                                  <Badge className="bg-[#9BA899] text-white shrink-0 rounded-full">Booked</Badge>
                                )}
                                {cls.waitlistPosition && (
                                  <Badge variant="outline" className="border-[#E8B4B8] text-[#E8B4B8] shrink-0 rounded-full">Waitlist #{cls.waitlistPosition}</Badge>
                                )}
                              </div>
                              
                              <div className="space-y-1 text-xs md:text-sm text-[#7A736B]">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 shrink-0 text-[#9BA899]" />
                                  <span className="truncate">{format(parseISO(cls.date), "EEE, MMM d, yyyy")}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 shrink-0 text-[#9BA899]" />
                                  <span>{cls.startTime} - {cls.endTime} ({cls.classType.durationMinutes} min)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 shrink-0 text-[#9BA899]" />
                                  <span className="truncate">{cls.instructor.name}</span>
                                </div>
                              </div>

                              <div className="mt-3 flex flex-wrap items-center gap-2 md:gap-4">
                                <Badge 
                                  variant="outline" 
                                  className={`rounded-full ${isFull ? 'border-[#E8B4B8] text-[#E8B4B8]' : 'border-[#9BA899] text-[#9BA899]'}`}
                                >
                                  {cls.spotsRemaining > 0 ? `${cls.spotsRemaining} spots left` : "Full"}
                                </Badge>
                                {cls.price > 0 && (
                                  <span className="font-medium text-sm text-[#5A5550]">${cls.price.toFixed(2)}</span>
                                )}
                                {cls.price === 0 && (
                                  <Badge className="bg-[#E8B4B8]/20 text-[#E8B4B8] border-[#E8B4B8] rounded-full">Free</Badge>
                                )}
                              </div>
                            </div>

                            <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
                              {cls.isUserBooked ? (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    const booking = bookings.find(b => b.class.id === cls.id && b.bookingStatus === "confirmed")
                                    if (booking) handleCancelBooking(booking.id)
                                  }}
                                  className="flex-1 sm:flex-none sm:w-28 border-[#B8AFA5] text-[#5A5550] hover:bg-[#FAF8F5] rounded-full"
                                >
                                  Cancel
                                </Button>
                              ) : isFull ? (
                                cls.waitlistPosition ? (
                                  <Button variant="outline" size="sm" disabled className="flex-1 sm:flex-none sm:w-28 rounded-full">
                                    On Waitlist
                                  </Button>
                                ) : (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleJoinWaitlist(cls.id)}
                                    className="flex-1 sm:flex-none sm:w-28 border-[#E8B4B8] text-[#E8B4B8] hover:bg-[#E8B4B8]/10 rounded-full"
                                  >
                                    Join Waitlist
                                  </Button>
                                )
                              ) : (
                                <Button 
                                  size="sm"
                                  onClick={() => totalCredits > 0 ? setBookingClass(cls) : router.push("/student/purchase")}
                                  className="flex-1 sm:flex-none sm:w-auto sm:min-w-[120px] bg-[#9BA899] hover:bg-[#8A9788] text-white rounded-full"
                                >
                                  {totalCredits > 0 ? "Book Class" : "Buy Credits"}
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Bookings */}
          <TabsContent value="bookings" className="space-y-4">
            <Card className="border-[#B8AFA5]/30 bg-white">
              <CardHeader>
                <CardTitle className="font-serif font-normal text-[#5A5550]">My Bookings</CardTitle>
                <CardDescription className="text-[#7A736B]">View and manage your class reservations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeBookings.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-[#B8AFA5] mb-4">No active bookings</p>
                    <Button 
                      onClick={() => router.push("/pilates/schedule")}
                      className="bg-[#9BA899] hover:bg-[#8A9788] text-white rounded-full"
                    >
                      Browse Classes
                    </Button>
                  </div>
                ) : (
                  activeBookings.map((booking) => (
                    <Card key={booking.id} className="border-[#B8AFA5]/30">
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <h4 className="font-serif text-sm md:text-base text-[#5A5550]">{booking.class.classType.name}</h4>
                            <div className="text-xs md:text-sm text-[#7A736B] space-y-0.5 mt-1">
                              <div>{format(parseISO(booking.class.date), "EEE, MMM d, yyyy")}</div>
                              <div>{booking.class.startTime} • {booking.class.instructor.name}</div>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="w-full sm:w-auto shrink-0 border-[#B8AFA5] text-[#5A5550] hover:bg-[#FAF8F5] rounded-full"
                            onClick={() => handleCancelBooking(booking.id)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Packages */}
          <TabsContent value="packages" className="space-y-4">
            <Card className="border-[#B8AFA5]/30 bg-white">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="font-serif font-normal text-[#5A5550]">My Packages & Memberships</CardTitle>
                    <CardDescription className="text-[#7A736B]">View your active packages and manage auto-renewal</CardDescription>
                  </div>
                  <Button 
                    onClick={() => router.push("/student/purchase")}
                    className="bg-[#9BA899] hover:bg-[#8A9788] text-white rounded-full"
                  >
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Buy More
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {purchases.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-[#B8AFA5] mb-4">No packages purchased yet</p>
                    <Button 
                      onClick={() => router.push("/student/purchase")}
                      className="bg-[#9BA899] hover:bg-[#8A9788] text-white rounded-full"
                    >
                      Purchase Your First Package
                    </Button>
                  </div>
                ) : (
                  purchases.map((purchase) => {
                    const isMembership = purchase.purchaseType === 'membership'
                    const isExpiringSoon = purchase.expiresAt && 
                      new Date(purchase.expiresAt).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000
                    
                    return (
                      <Card key={purchase.id} className="border-[#B8AFA5]/30">
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="font-serif text-lg text-[#5A5550]">
                                    {purchase.package?.name || purchase.membership?.name || "Single Class"}
                                  </h4>
                                  <Badge 
                                    variant="outline" 
                                    className={`rounded-full ${purchase.creditsRemaining > 0 ? 'border-[#9BA899] text-[#9BA899]' : 'border-[#B8AFA5] text-[#B8AFA5]'}`}
                                  >
                                    {isMembership ? "Membership" : "Package"}
                                  </Badge>
                                </div>
                                
                                <div className="text-sm text-[#7A736B] space-y-1">
                                  {purchase.creditsTotal !== null && (
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-[#5A5550]">Credits:</span>
                                      <span>{purchase.creditsRemaining} / {purchase.creditsTotal} remaining</span>
                                    </div>
                                  )}
                                  {purchase.expiresAt && (
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-[#5A5550]">Expires:</span>
                                      <span>{format(parseISO(purchase.expiresAt), "MMM d, yyyy")}</span>
                                      {isExpiringSoon && (
                                        <Badge variant="outline" className="text-xs border-[#E8B4B8] text-[#E8B4B8] rounded-full">
                                          <AlertCircle className="h-3 w-3 mr-1" />
                                          Expiring Soon
                                        </Badge>
                                      )}
                                    </div>
                                  )}
                                  {isMembership && purchase.nextBillingDate && (
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-[#5A5550]">Next Billing:</span>
                                      <span>{format(parseISO(purchase.nextBillingDate), "MMM d, yyyy")}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {isMembership && (
                              <div className="pt-4 border-t border-[#B8AFA5]/20">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <RefreshCw className="h-5 w-5 text-[#9BA899]" />
                                    <div>
                                      <Label htmlFor={`auto-renew-${purchase.id}`} className="font-medium cursor-pointer text-[#5A5550]">
                                        Auto-Renewal
                                      </Label>
                                      <p className="text-xs text-[#B8AFA5] mt-0.5">
                                        {purchase.autoRenew 
                                          ? "Your membership will automatically renew monthly" 
                                          : "Turn on to automatically renew your membership"}
                                      </p>
                                    </div>
                                  </div>
                                  <Switch
                                    id={`auto-renew-${purchase.id}`}
                                    checked={purchase.autoRenew}
                                    onCheckedChange={() => handleToggleAutoRenewal(purchase.id, purchase.autoRenew)}
                                    disabled={togglingRenewal === purchase.id}
                                  />
                                </div>
                                {purchase.autoRenew && (
                                  <div className="mt-3 p-3 bg-[#9BA899]/10 rounded-lg">
                                    <p className="text-xs text-[#7A736B] flex items-start gap-2">
                                      <CheckCircle2 className="h-4 w-4 text-[#9BA899] shrink-0 mt-0.5" />
                                      <span>
                                        Your membership will automatically renew on{" "}
                                        <span className="font-medium text-[#5A5550]">
                                          {purchase.nextBillingDate && format(parseISO(purchase.nextBillingDate), "MMMM d, yyyy")}
                                        </span>
                                        . Unused classes roll over for up to 1 month.
                                      </span>
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            {/* Profile Section */}
            <Card className="border-[#B8AFA5]/30 bg-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-serif font-normal text-[#5A5550] flex items-center gap-2">
                      <User className="h-5 w-5 text-[#9BA899]" />
                      Profile Information
                    </CardTitle>
                    <CardDescription className="text-[#7A736B]">Update your personal information</CardDescription>
                  </div>
                  {!isEditingProfile && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsEditingProfile(true)}
                      className="border-[#9BA899] text-[#9BA899] hover:bg-[#9BA899]/10 rounded-full"
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isEditingProfile ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-[#5A5550]">Full Name</Label>
                      <Input
                        id="name"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="mt-1 border-[#B8AFA5]/50 focus:border-[#9BA899]"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-[#5A5550]">Email</Label>
                      <Input
                        id="email"
                        value={session?.user?.email || ""}
                        disabled
                        className="mt-1 border-[#B8AFA5]/50 bg-[#FAF8F5] text-[#B8AFA5]"
                      />
                      <p className="text-xs text-[#B8AFA5] mt-1">Contact support to change your email</p>
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-[#5A5550]">Phone Number</Label>
                      <Input
                        id="phone"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        placeholder="(555) 123-4567"
                        className="mt-1 border-[#B8AFA5]/50 focus:border-[#9BA899]"
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button 
                        onClick={handleSaveProfile}
                        disabled={savingProfile}
                        className="bg-[#9BA899] hover:bg-[#8A9788] text-white rounded-full"
                      >
                        {savingProfile ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                        Save Changes
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setIsEditingProfile(false)
                          setProfileForm({
                            name: session?.user?.name || "",
                            phone: profile?.phone || ""
                          })
                        }}
                        className="border-[#B8AFA5] text-[#5A5550] rounded-full"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-[#B8AFA5]/20">
                      <span className="text-[#7A736B]">Name</span>
                      <span className="text-[#5A5550] font-medium">{session?.user?.name}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-[#B8AFA5]/20">
                      <span className="text-[#7A736B]">Email</span>
                      <span className="text-[#5A5550] font-medium">{session?.user?.email}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-[#7A736B]">Phone</span>
                      <span className="text-[#5A5550] font-medium">{profile?.phone || "Not set"}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notification Preferences */}
            <Card className="border-[#B8AFA5]/30 bg-white">
              <CardHeader>
                <CardTitle className="font-serif font-normal text-[#5A5550] flex items-center gap-2">
                  <Bell className="h-5 w-5 text-[#9BA899]" />
                  Notification Preferences
                </CardTitle>
                <CardDescription className="text-[#7A736B]">Manage how you receive updates and reminders</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Class Reminders */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-[#9BA899]" />
                    <div>
                      <Label className="font-medium text-[#5A5550]">Class Reminders</Label>
                      <p className="text-xs text-[#B8AFA5]">Get reminded before your booked classes</p>
                    </div>
                  </div>
                  <Switch
                    checked={profile?.emailReminders ?? true}
                    onCheckedChange={(value) => handleUpdateNotifications('emailReminders', value)}
                    disabled={savingNotifications}
                  />
                </div>

                {profile?.emailReminders && (
                  <div className="ml-8 p-3 bg-[#FAF8F5] rounded-lg">
                    <Label className="text-sm text-[#5A5550]">Remind me</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <select
                        value={profile?.reminderHoursBefore ?? 24}
                        onChange={(e) => handleUpdateNotifications('reminderHoursBefore', parseInt(e.target.value))}
                        className="border border-[#B8AFA5]/50 rounded-lg px-3 py-1.5 text-sm text-[#5A5550] bg-white focus:border-[#9BA899] focus:outline-none"
                        disabled={savingNotifications}
                      >
                        <option value={1}>1 hour</option>
                        <option value={2}>2 hours</option>
                        <option value={4}>4 hours</option>
                        <option value={12}>12 hours</option>
                        <option value={24}>24 hours</option>
                        <option value={48}>48 hours</option>
                      </select>
                      <span className="text-sm text-[#7A736B]">before class</span>
                    </div>
                  </div>
                )}

                {/* Marketing Emails */}
                <div className="flex items-center justify-between pt-4 border-t border-[#B8AFA5]/20">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-[#9BA899]" />
                    <div>
                      <Label className="font-medium text-[#5A5550]">Marketing Emails</Label>
                      <p className="text-xs text-[#B8AFA5]">Receive news, promotions, and updates</p>
                    </div>
                  </div>
                  <Switch
                    checked={profile?.marketingEmails ?? true}
                    onCheckedChange={(value) => handleUpdateNotifications('marketingEmails', value)}
                    disabled={savingNotifications}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#B8AFA5]/20 bg-white py-4 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-[#7A736B]">
          © 2025 Swift Fit Pilates & Wellness Studio
        </div>
      </footer>

      {/* Booking Confirmation Modal */}
      <Dialog open={!!bookingClass} onOpenChange={() => setBookingClass(null)}>
        <DialogContent className="bg-white border-[#B8AFA5]/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif font-normal text-[#5A5550]">Confirm Booking</DialogTitle>
            <DialogDescription className="text-[#7A736B]">
              You're about to book a class. This will use 1 credit.
            </DialogDescription>
          </DialogHeader>
          
          {bookingClass && (
            <div className="py-4">
              <div className="bg-[#FAF8F5] rounded-lg p-4 space-y-2">
                <h4 className="font-serif text-lg text-[#5A5550]">{bookingClass.classType.name}</h4>
                <div className="text-sm text-[#7A736B] space-y-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#9BA899]" />
                    <span>{format(parseISO(bookingClass.date), "EEEE, MMMM d, yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#9BA899]" />
                    <span>{bookingClass.startTime} - {bookingClass.endTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-[#9BA899]" />
                    <span>{bookingClass.instructor.name}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between p-3 border border-[#B8AFA5]/30 rounded-lg">
                <span className="text-[#7A736B]">Credits after booking:</span>
                <span className="font-serif text-lg text-[#9BA899]">{totalCredits - 1}</span>
              </div>
            </div>
          )}
          
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setBookingClass(null)}
              className="border-[#B8AFA5] text-[#5A5550] rounded-full"
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmBookClass}
              disabled={isBooking}
              className="bg-[#9BA899] hover:bg-[#8A9788] text-white rounded-full"
            >
              {isBooking ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Booking...
                </>
              ) : (
                "Confirm Booking"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
