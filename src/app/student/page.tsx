"use client"

import { useEffect, useState } from "react"
import { useSession } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, User, CreditCard, Package, CheckCircle2, XCircle, AlertCircle, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { format, parseISO } from "date-fns"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

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

export default function StudentDashboard() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [classes, setClasses] = useState<Class[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("upcoming")
  const [togglingRenewal, setTogglingRenewal] = useState<number | null>(null)

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

      const [classesRes, bookingsRes, purchasesRes] = await Promise.all([
        fetch("/api/classes", { headers }),
        fetch("/api/bookings", { headers }),
        fetch("/api/student-purchases", { headers })
      ])

      if (classesRes.ok) setClasses(await classesRes.json())
      if (bookingsRes.ok) setBookings(await bookingsRes.json())
      if (purchasesRes.ok) setPurchases(await purchasesRes.json())
    } catch (error) {
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const handleBookClass = async (classId: number) => {
    try {
      const token = localStorage.getItem("bearer_token")
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ classId })
      })

      const data = await res.json()
      
      if (res.ok) {
        toast.success(data.message || "Class booked successfully!")
        fetchData()
      } else {
        toast.error(data.error || "Failed to book class")
      }
    } catch (error) {
      toast.error("Failed to book class")
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

  const totalCredits = purchases.reduce((sum, p) => sum + (p.creditsRemaining || 0), 0)
  const activeBookings = bookings.filter(b => b.bookingStatus === "confirmed")
  const upcomingClasses = classes.filter(c => new Date(`${c.date}T${c.startTime}`) > new Date())

  if (isPending || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl text-primary">STUDENT DASHBOARD</h1>
              <p className="text-sm text-muted-foreground">Welcome back, {session?.user?.name}</p>
            </div>
            <Button variant="outline" onClick={() => router.push("/pilates")}>
              Back to Pilates
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Available Credits</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCredits}</div>
              <p className="text-xs text-muted-foreground">
                {purchases.filter(p => p.creditsRemaining > 0).length} active packages
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeBookings.length}</div>
              <p className="text-xs text-muted-foreground">Upcoming classes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Classes Available</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingClasses.length}</div>
              <p className="text-xs text-muted-foreground">Book now</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="classes" className="space-y-6">
          <TabsList>
            <TabsTrigger value="classes">Available Classes</TabsTrigger>
            <TabsTrigger value="bookings">My Bookings</TabsTrigger>
            <TabsTrigger value="packages">My Packages</TabsTrigger>
          </TabsList>

          {/* Available Classes */}
          <TabsContent value="classes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Available Classes</CardTitle>
                <CardDescription>Book your next Pilates class</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingClasses.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No upcoming classes available</p>
                ) : (
                  upcomingClasses.map((cls) => {
                    const spotsLeft = cls.capacity - cls.registeredCount
                    const isFull = spotsLeft <= 0
                    
                    return (
                      <Card key={cls.id} className="border-2">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-lg">{cls.classType.name}</h3>
                                {cls.isUserBooked && (
                                  <Badge className="bg-green-500">Booked</Badge>
                                )}
                                {cls.waitlistPosition && (
                                  <Badge variant="outline">Waitlist #{cls.waitlistPosition}</Badge>
                                )}
                              </div>
                              
                              <div className="space-y-1 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  <span>{format(parseISO(cls.date), "EEEE, MMMM d, yyyy")}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4" />
                                  <span>{cls.startTime} - {cls.endTime} ({cls.classType.durationMinutes} min)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4" />
                                  <span>{cls.instructor.name}</span>
                                </div>
                              </div>

                              <div className="mt-3 flex items-center gap-4">
                                <Badge variant={isFull ? "destructive" : "secondary"}>
                                  {spotsLeft > 0 ? `${spotsLeft} spots left` : "Full"}
                                </Badge>
                                {cls.price && (
                                  <span className="font-semibold">${cls.price.toFixed(2)}</span>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-col gap-2">
                              {cls.isUserBooked ? (
                                <Button 
                                  variant="outline" 
                                  onClick={() => {
                                    const booking = bookings.find(b => b.class.id === cls.id && b.bookingStatus === "confirmed")
                                    if (booking) handleCancelBooking(booking.id)
                                  }}
                                  className="w-full"
                                >
                                  Cancel
                                </Button>
                              ) : isFull ? (
                                cls.waitlistPosition ? (
                                  <Button variant="outline" disabled className="w-full">
                                    On Waitlist
                                  </Button>
                                ) : (
                                  <Button 
                                    variant="outline" 
                                    onClick={() => handleJoinWaitlist(cls.id)}
                                    className="w-full"
                                  >
                                    Join Waitlist
                                  </Button>
                                )
                              ) : (
                                <Button 
                                  onClick={() => handleBookClass(cls.id)}
                                  className="w-full"
                                  disabled={totalCredits === 0}
                                >
                                  Book Class
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
            <Card>
              <CardHeader>
                <CardTitle>My Bookings</CardTitle>
                <CardDescription>View and manage your class reservations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeBookings.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No active bookings</p>
                ) : (
                  activeBookings.map((booking) => (
                    <Card key={booking.id} className="border-2">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{booking.class.classType.name}</h4>
                            <div className="text-sm text-muted-foreground space-y-1 mt-1">
                              <div>{format(parseISO(booking.class.date), "EEEE, MMMM d, yyyy")}</div>
                              <div>{booking.class.startTime} • {booking.class.instructor.name}</div>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
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
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>My Packages & Memberships</CardTitle>
                    <CardDescription>View your active packages, memberships, and manage auto-renewal</CardDescription>
                  </div>
                  <Button onClick={() => router.push("/pilates/pricing")}>
                    Buy More
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {purchases.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No packages purchased yet</p>
                    <Button onClick={() => router.push("/pilates/pricing")}>
                      Purchase Your First Package
                    </Button>
                  </div>
                ) : (
                  purchases.map((purchase) => {
                    const isMembership = purchase.purchaseType === 'membership'
                    const isExpiringSoon = purchase.expiresAt && 
                      new Date(purchase.expiresAt).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000
                    
                    return (
                      <Card key={purchase.id} className="border-2">
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="font-semibold text-lg">
                                    {purchase.package?.name || purchase.membership?.name || "Single Class"}
                                  </h4>
                                  <Badge variant={purchase.creditsRemaining > 0 ? "default" : "secondary"}>
                                    {isMembership ? "Membership" : "Package"}
                                  </Badge>
                                </div>
                                
                                <div className="text-sm text-muted-foreground space-y-1">
                                  {purchase.creditsTotal !== null && (
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">Credits:</span>
                                      <span>{purchase.creditsRemaining} / {purchase.creditsTotal} remaining</span>
                                    </div>
                                  )}
                                  {purchase.expiresAt && (
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">Expires:</span>
                                      <span>{format(parseISO(purchase.expiresAt), "MMM d, yyyy")}</span>
                                      {isExpiringSoon && (
                                        <Badge variant="outline" className="text-xs">
                                          <AlertCircle className="h-3 w-3 mr-1" />
                                          Expiring Soon
                                        </Badge>
                                      )}
                                    </div>
                                  )}
                                  {isMembership && purchase.nextBillingDate && (
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">Next Billing:</span>
                                      <span>{format(parseISO(purchase.nextBillingDate), "MMM d, yyyy")}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Auto-renewal toggle for memberships */}
                            {isMembership && (
                              <div className="pt-4 border-t">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <RefreshCw className="h-5 w-5 text-primary" />
                                    <div>
                                      <Label htmlFor={`auto-renew-${purchase.id}`} className="font-medium cursor-pointer">
                                        Auto-Renewal
                                      </Label>
                                      <p className="text-xs text-muted-foreground mt-0.5">
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
                                  <div className="mt-3 p-3 bg-primary/5 rounded-lg">
                                    <p className="text-xs text-muted-foreground flex items-start gap-2">
                                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                                      <span>
                                        Your membership will automatically renew on{" "}
                                        <span className="font-medium text-foreground">
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
        </Tabs>
      </div>
    </div>
  )
}