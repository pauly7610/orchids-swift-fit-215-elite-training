"use client"

import { useEffect, useState } from "react"
import { useSession } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Calendar, Clock, User, MapPin, CreditCard } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { format, parseISO, startOfWeek, addDays, isSameDay } from "date-fns"

interface Class {
  id: number
  date: string
  startTime: string
  endTime: string
  capacity: number
  status: string
  price: number
  classType: { id: number; name: string; description: string; durationMinutes: number }
  instructor: { id: number; name: string; bio: string; headshotUrl: string }
  registeredCount: number
  spotsRemaining: number
  isUserBooked: boolean
  waitlistPosition: number | null
}

interface Purchase {
  id: number
  creditsRemaining: number
}

export default function SchedulePage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [classes, setClasses] = useState<Class[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [weekDays, setWeekDays] = useState<Date[]>([])

  useEffect(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 0 })
    const days = Array.from({ length: 7 }, (_, i) => addDays(start, i))
    setWeekDays(days)
  }, [])

  useEffect(() => {
    fetchClasses()
    if (session) {
      fetchPurchases()
    }
  }, [session])

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem("bearer_token")
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      
      const res = await fetch("/api/classes/schedule", { headers })
      if (res.ok) {
        const data = await res.json()
        setClasses(data)
      }
    } catch (error) {
      toast.error("Failed to load schedule")
    } finally {
      setLoading(false)
    }
  }

  const fetchPurchases = async () => {
    try {
      const token = localStorage.getItem("bearer_token")
      const res = await fetch("/api/student-purchases", {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setPurchases(data)
      }
    } catch (error) {
      console.error("Failed to load purchases")
    }
  }

  const handleBookClass = async (classId: number) => {
    if (!session) {
      toast.error("Please login to book classes")
      router.push(`/login?redirect=${encodeURIComponent("/pilates/schedule")}`)
      return
    }

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
        fetchClasses()
        if (session) fetchPurchases()
      } else {
        toast.error(data.error || "Failed to book class")
      }
    } catch (error) {
      toast.error("Failed to book class")
    }
  }

  const handleJoinWaitlist = async (classId: number) => {
    if (!session) {
      toast.error("Please login to join waitlist")
      router.push(`/login?redirect=${encodeURIComponent("/pilates/schedule")}`)
      return
    }

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
        fetchClasses()
      } else {
        toast.error(data.error || "Failed to join waitlist")
      }
    } catch (error) {
      toast.error("Failed to join waitlist")
    }
  }

  const totalCredits = purchases.reduce((sum, p) => sum + (p.creditsRemaining || 0), 0)
  const filteredClasses = selectedDate
    ? classes.filter(cls => isSameDay(parseISO(cls.date), selectedDate))
    : classes

  const groupedByDate = classes.reduce((acc, cls) => {
    if (!acc[cls.date]) acc[cls.date] = []
    acc[cls.date].push(cls)
    return acc
  }, {} as Record<string, Class[]>)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading schedule...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-secondary/95 backdrop-blur-sm border-b border-primary/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/pilates" className="flex items-center gap-2">
            <Heart className="h-8 w-8 text-primary" />
            <div>
              <h1 className="font-display text-2xl text-white tracking-wider">SWIFTFIT PILATES</h1>
              <p className="text-xs text-primary/80 -mt-1">Pilates + Wellness Studio</p>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/pilates/about" className="text-white/80 hover:text-primary transition-colors text-sm font-medium">About</Link>
            <Link href="/pilates/instructors" className="text-white/80 hover:text-primary transition-colors text-sm font-medium">Instructors</Link>
            <Link href="/pilates/classes" className="text-white/80 hover:text-primary transition-colors text-sm font-medium">Classes</Link>
            <Link href="/pilates/pricing" className="text-white/80 hover:text-primary transition-colors text-sm font-medium">Pricing</Link>
            <Link href="/pilates/schedule" className="text-primary transition-colors text-sm font-medium">Schedule</Link>
            <Link href="/pilates/faq" className="text-white/80 hover:text-primary transition-colors text-sm font-medium">FAQ</Link>
            {session ? (
              <Link href="/student">
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  Login
                </Button>
              </Link>
            )}
            <Link href="/">
              <Button size="sm" variant="outline" className="border-white/30 text-secondary hover:bg-white">
                Back to Gym
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-12 bg-gradient-to-br from-secondary via-secondary/95 to-black">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-display text-5xl md:text-7xl text-white mb-6 tracking-wide">
              CLASS SCHEDULE
            </h1>
            <p className="text-xl text-white/80 mb-6">
              Find your perfect class and book your spot today
            </p>
            {session && (
              <div className="flex items-center justify-center gap-4">
                <Badge className="bg-primary/20 text-primary border-primary/30 text-base px-4 py-2">
                  <CreditCard className="h-4 w-4 mr-2" />
                  {totalCredits} Credits Available
                </Badge>
                <Link href="/student/purchase">
                  <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white hover:text-secondary">
                    Buy More Credits
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Week Navigation */}
      <section className="py-8 bg-background border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2 overflow-x-auto">
            {weekDays.map((day) => {
              const isSelected = selectedDate && isSameDay(day, selectedDate)
              const hasClasses = classes.some(cls => isSameDay(parseISO(cls.date), day))
              
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`flex flex-col items-center min-w-[80px] px-4 py-3 rounded-lg border-2 transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10"
                      : hasClasses
                      ? "border-border hover:border-primary/50"
                      : "border-border opacity-50 cursor-not-allowed"
                  }`}
                  disabled={!hasClasses}
                >
                  <span className="text-xs text-muted-foreground mb-1">
                    {format(day, "EEE")}
                  </span>
                  <span className="text-2xl font-bold">
                    {format(day, "d")}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(day, "MMM")}
                  </span>
                  {hasClasses && (
                    <div className="w-1 h-1 rounded-full bg-primary mt-2" />
                  )}
                </button>
              )
            })}
          </div>
          <div className="text-center mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedDate(new Date())}
            >
              Today
            </Button>
          </div>
        </div>
      </section>

      {/* Classes List */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {selectedDate && (
              <div className="mb-8 text-center">
                <h2 className="font-display text-3xl text-primary mb-2">
                  {format(selectedDate, "EEEE, MMMM d, yyyy")}
                </h2>
                <p className="text-muted-foreground">
                  {filteredClasses.length} {filteredClasses.length === 1 ? "class" : "classes"} available
                </p>
              </div>
            )}

            {filteredClasses.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No classes scheduled</h3>
                  <p className="text-muted-foreground mb-6">
                    No classes available for this date. Try selecting another day.
                  </p>
                  <Link href="/pilates/pricing">
                    <Button>View Pricing & Packages</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredClasses.map((cls) => {
                  const isFull = cls.spotsRemaining <= 0
                  const isLowCapacity = cls.spotsRemaining <= 3 && cls.spotsRemaining > 0
                  
                  return (
                    <Card key={cls.id} className="border-2 hover:border-primary transition-colors">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-6">
                          {/* Time Badge */}
                          <div className="flex-shrink-0">
                            <div className="bg-primary/10 rounded-lg px-6 py-4 text-center">
                              <div className="font-display text-3xl text-primary">
                                {cls.startTime}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {cls.classType.durationMinutes} min
                              </div>
                            </div>
                          </div>

                          {/* Class Details */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <div>
                                <h3 className="text-2xl font-display tracking-wide text-primary mb-1">
                                  {cls.classType.name.toUpperCase()}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <User className="h-4 w-4" />
                                  <span>{cls.instructor.name}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                {cls.price && (
                                  <div className="text-2xl font-bold">${cls.price.toFixed(2)}</div>
                                )}
                                <div className="text-xs text-muted-foreground">per class</div>
                              </div>
                            </div>

                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                              {cls.classType.description}
                            </p>

                            <div className="flex flex-wrap items-center gap-3">
                              {cls.isUserBooked ? (
                                <Badge className="bg-green-500">✓ Booked</Badge>
                              ) : isFull ? (
                                <Badge variant="destructive">Full</Badge>
                              ) : isLowCapacity ? (
                                <Badge variant="secondary" className="bg-orange-500 text-white">
                                  Only {cls.spotsRemaining} spots left
                                </Badge>
                              ) : (
                                <Badge variant="secondary">
                                  {cls.spotsRemaining} spots available
                                </Badge>
                              )}

                              {cls.waitlistPosition && (
                                <Badge variant="outline">
                                  Waitlist #{cls.waitlistPosition}
                                </Badge>
                              )}

                              <div className="text-xs text-muted-foreground">
                                {cls.registeredCount} / {cls.capacity} registered
                              </div>
                            </div>
                          </div>

                          {/* Booking Actions */}
                          <div className="flex flex-col gap-2 flex-shrink-0">
                            {cls.isUserBooked ? (
                              <>
                                <Button variant="outline" disabled className="w-full md:w-32">
                                  Booked
                                </Button>
                                <Link href="/student">
                                  <Button variant="ghost" size="sm" className="w-full md:w-32">
                                    Manage
                                  </Button>
                                </Link>
                              </>
                            ) : isFull ? (
                              cls.waitlistPosition ? (
                                <Button variant="outline" disabled className="w-full md:w-32">
                                  On Waitlist
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  onClick={() => handleJoinWaitlist(cls.id)}
                                  className="w-full md:w-32"
                                >
                                  Join Waitlist
                                </Button>
                              )
                            ) : (
                              <Button
                                onClick={() => handleBookClass(cls.id)}
                                className="w-full md:w-32 bg-primary hover:bg-primary/90"
                                disabled={session && totalCredits === 0}
                              >
                                {session ? (totalCredits > 0 ? "Book Now" : "No Credits") : "Login to Book"}
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-secondary via-secondary/95 to-black">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-4xl md:text-5xl text-white mb-6 tracking-wide">
            NEW TO SWIFTFIT PILATES?
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Get started with our introductory offer: 3 classes for just $49!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pilates/pricing">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white text-lg h-14 px-8">
                View Pricing
              </Button>
            </Link>
            {!session && (
              <Link href="/register">
                <Button size="lg" variant="outline" className="border-white bg-white/10 text-white hover:bg-white hover:text-secondary text-lg h-14 px-8">
                  Create Account
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Heart className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-display text-2xl tracking-wider">SWIFTFIT PILATES</h3>
                </div>
              </div>
              <p className="text-white/70 text-sm">
                A warm, welcoming space for real people on real journeys.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><Link href="/pilates" className="hover:text-primary transition-colors">Home</Link></li>
                <li><Link href="/pilates/about" className="hover:text-primary transition-colors">About</Link></li>
                <li><Link href="/pilates/instructors" className="hover:text-primary transition-colors">Instructors</Link></li>
                <li><Link href="/pilates/classes" className="hover:text-primary transition-colors">Classes</Link></li>
                <li><Link href="/pilates/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link href="/pilates/schedule" className="hover:text-primary transition-colors">Schedule</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li>swiftfitpws@gmail.com</li>
                <li>2245 E Tioga Street</li>
                <li>Philadelphia, PA 19134</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-sm text-white/60">
            <p>© 2025 Swift Fit Pilates + Wellness Studio. All rights reserved.</p>
            <p className="mt-2">Part of <Link href="/" className="text-primary hover:underline">SwiftFit 215</Link> family</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
