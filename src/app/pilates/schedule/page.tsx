"use client"

import { useEffect, useState } from "react"
import { useSession } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Calendar, User, CreditCard } from "lucide-react"
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
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9BA899] mx-auto mb-4"></div>
          <p className="text-[#7A736B]">Loading schedule...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#FAF8F5]/95 backdrop-blur-sm border-b border-[#B8AFA5]/20">
        <div className="container mx-auto px-4 py-5 flex items-center justify-between">
          <Link href="/pilates" className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-full bg-[#9BA899]/10 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full border-2 border-[#B8AFA5] flex items-center justify-center">
                <Heart className="h-5 w-5 text-[#B8AFA5]" fill="#B8AFA5" />
              </div>
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
            <Link href="/pilates/schedule" className="text-[#9BA899] font-medium transition-colors text-sm">Schedule</Link>
            <Link href="/pilates/faq" className="text-[#5A5550] hover:text-[#9BA899] transition-colors text-sm">FAQ</Link>
            {session ? (
              <Link href="/student">
                <Button size="sm" className="bg-[#9BA899] hover:bg-[#8A9788] text-white rounded-full">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button size="sm" className="bg-[#9BA899] hover:bg-[#8A9788] text-white rounded-full">
                  Login
                </Button>
              </Link>
            )}
            <Link href="/">
              <Button size="sm" variant="outline" className="border-[#B8AFA5] text-[#5A5550] hover:bg-[#9BA899]/10">
                Back to Gym
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-12 bg-gradient-to-b from-[#F5F2EE] to-[#FAF8F5] relative overflow-hidden">
        <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-[#9BA899]/5 blur-3xl"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-serif text-5xl md:text-6xl text-[#5A5550] mb-4 font-light">
              Class Schedule
            </h1>
            <p className="text-lg text-[#7A736B] mb-6">
              Find your perfect class and book your spot today
            </p>
            {session && (
              <div className="flex items-center justify-center gap-4">
                <Badge className="bg-[#9BA899]/20 text-[#5A5550] border-[#9BA899] text-base px-6 py-2 rounded-full">
                  <CreditCard className="h-4 w-4 mr-2" />
                  {totalCredits} Credits Available
                </Badge>
                <Link href="/student/purchase">
                  <Button variant="outline" size="sm" className="border-[#B8AFA5] text-[#5A5550] hover:bg-[#9BA899]/10 rounded-full">
                    Buy More Credits
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Week Navigation */}
      <section className="py-8 bg-white border-b border-[#B8AFA5]/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2 overflow-x-auto">
            {weekDays.map((day) => {
              const isSelected = selectedDate && isSameDay(day, selectedDate)
              const hasClasses = classes.some(cls => isSameDay(parseISO(cls.date), day))
              
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`flex flex-col items-center min-w-[80px] px-4 py-3 rounded-2xl border-2 transition-all ${
                    isSelected
                      ? "border-[#9BA899] bg-[#9BA899]/10"
                      : hasClasses
                      ? "border-[#B8AFA5]/30 hover:border-[#9BA899]/50 bg-white"
                      : "border-[#B8AFA5]/20 opacity-50 cursor-not-allowed bg-[#FAF8F5]"
                  }`}
                  disabled={!hasClasses}
                >
                  <span className="text-xs text-[#9BA899] mb-1">
                    {format(day, "EEE")}
                  </span>
                  <span className="text-2xl font-serif font-light text-[#5A5550]">
                    {format(day, "d")}
                  </span>
                  <span className="text-xs text-[#7A736B]">
                    {format(day, "MMM")}
                  </span>
                  {hasClasses && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#9BA899] mt-2" />
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
              className="text-[#9BA899] hover:text-[#8A9788]"
            >
              Today
            </Button>
          </div>
        </div>
      </section>

      {/* Classes List */}
      <section className="py-12 bg-[#FAF8F5]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {selectedDate && (
              <div className="mb-8 text-center">
                <h2 className="font-serif text-3xl text-[#5A5550] mb-2 font-light">
                  {format(selectedDate, "EEEE, MMMM d, yyyy")}
                </h2>
                <p className="text-[#7A736B]">
                  {filteredClasses.length} {filteredClasses.length === 1 ? "class" : "classes"} available
                </p>
              </div>
            )}

            {filteredClasses.length === 0 ? (
              <Card className="text-center py-12 bg-white border-[#B8AFA5]/30">
                <CardContent>
                  <Calendar className="h-16 w-16 text-[#9BA899] mx-auto mb-4" />
                  <h3 className="text-xl font-serif font-normal text-[#5A5550] mb-2">No classes scheduled</h3>
                  <p className="text-[#7A736B] mb-6">
                    No classes available for this date. Try selecting another day.
                  </p>
                  <Link href="/pilates/pricing">
                    <Button className="bg-[#9BA899] hover:bg-[#8A9788] text-white rounded-full">View Pricing & Packages</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredClasses.map((cls) => {
                  const isFull = cls.spotsRemaining <= 0
                  const isLowCapacity = cls.spotsRemaining <= 3 && cls.spotsRemaining > 0
                  
                  return (
                    <Card key={cls.id} className="border-2 border-[#B8AFA5]/30 hover:border-[#9BA899] transition-all bg-white">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-6">
                          {/* Time Badge */}
                          <div className="flex-shrink-0">
                            <div className="bg-[#9BA899]/10 rounded-2xl px-6 py-4 text-center border border-[#B8AFA5]/30">
                              <div className="font-serif text-3xl text-[#9BA899] font-light">
                                {cls.startTime}
                              </div>
                              <div className="text-xs text-[#7A736B] mt-1">
                                {cls.classType.durationMinutes} min
                              </div>
                            </div>
                          </div>

                          {/* Class Details */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <div>
                                <h3 className="text-2xl font-serif font-normal text-[#5A5550] mb-1">
                                  {cls.classType.name}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-[#7A736B]">
                                  <User className="h-4 w-4" />
                                  <span>{cls.instructor.name}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                {cls.price && (
                                  <div className="text-2xl font-serif font-light text-[#9BA899]">${cls.price.toFixed(2)}</div>
                                )}
                                <div className="text-xs text-[#7A736B]">per class</div>
                              </div>
                            </div>

                            <p className="text-sm text-[#7A736B] mb-4 line-clamp-2">
                              {cls.classType.description}
                            </p>

                            <div className="flex flex-wrap items-center gap-3">
                              {cls.isUserBooked ? (
                                <Badge className="bg-[#9BA899] text-white border-none rounded-full">✓ Booked</Badge>
                              ) : isFull ? (
                                <Badge variant="destructive" className="rounded-full">Full</Badge>
                              ) : isLowCapacity ? (
                                <Badge className="bg-orange-500 text-white border-none rounded-full">
                                  Only {cls.spotsRemaining} spots left
                                </Badge>
                              ) : (
                                <Badge className="bg-[#9BA899]/20 text-[#5A5550] border-[#9BA899] rounded-full">
                                  {cls.spotsRemaining} spots available
                                </Badge>
                              )}

                              {cls.waitlistPosition && (
                                <Badge variant="outline" className="border-[#B8AFA5] text-[#5A5550] rounded-full">
                                  Waitlist #{cls.waitlistPosition}
                                </Badge>
                              )}

                              <div className="text-xs text-[#9BA899]">
                                {cls.registeredCount} / {cls.capacity} registered
                              </div>
                            </div>
                          </div>

                          {/* Booking Actions */}
                          <div className="flex flex-col gap-2 flex-shrink-0">
                            {cls.isUserBooked ? (
                              <>
                                <Button variant="outline" disabled className="w-full md:w-32 rounded-full border-[#9BA899] text-[#9BA899]">
                                  Booked
                                </Button>
                                <Link href="/student">
                                  <Button variant="ghost" size="sm" className="w-full md:w-32 text-[#5A5550] hover:text-[#9BA899]">
                                    Manage
                                  </Button>
                                </Link>
                              </>
                            ) : isFull ? (
                              cls.waitlistPosition ? (
                                <Button variant="outline" disabled className="w-full md:w-32 rounded-full border-[#B8AFA5]">
                                  On Waitlist
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  onClick={() => handleJoinWaitlist(cls.id)}
                                  className="w-full md:w-32 rounded-full border-[#9BA899] text-[#9BA899] hover:bg-[#9BA899]/10"
                                >
                                  Join Waitlist
                                </Button>
                              )
                            ) : (
                              <Button
                                onClick={() => handleBookClass(cls.id)}
                                className="w-full md:w-32 bg-[#9BA899] hover:bg-[#8A9788] text-white rounded-full"
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
      <section className="py-20 bg-gradient-to-b from-[#9BA899]/10 to-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#B8AFA5]/10 blur-3xl"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="font-serif text-4xl md:text-5xl text-[#5A5550] mb-6 font-light">
            New to Swift Fit Pilates?
          </h2>
          <p className="text-lg text-[#7A736B] mb-8 max-w-2xl mx-auto">
            Get started with our introductory offer: 3 classes for just $49!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pilates/pricing">
              <Button size="lg" className="bg-[#9BA899] hover:bg-[#8A9788] text-white text-base h-12 px-8 rounded-full">
                View Pricing
              </Button>
            </Link>
            {!session && (
              <Link href="/register">
                <Button size="lg" variant="outline" className="border-[#B8AFA5] bg-white text-[#5A5550] hover:bg-[#F5F2EE] text-base h-12 px-8 rounded-full">
                  Create Account
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#5A5550] text-[#FAF8F5] py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full border border-[#B8AFA5] flex items-center justify-center">
                  <Heart className="h-5 w-5 text-[#B8AFA5]" fill="#B8AFA5" />
                </div>
                <div>
                  <h3 className="font-serif text-xl tracking-wide">Swift Fit</h3>
                  <p className="text-xs text-[#9BA899] tracking-wider">PILATES AND WELLNESS</p>
                </div>
              </div>
              <p className="text-[#B8AFA5] text-sm leading-relaxed">
                A warm, welcoming space for real people on real journeys.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-[#FAF8F5]">Quick Links</h4>
              <ul className="space-y-2 text-sm text-[#B8AFA5]">
                <li><Link href="/pilates" className="hover:text-[#9BA899] transition-colors">Home</Link></li>
                <li><Link href="/pilates/about" className="hover:text-[#9BA899] transition-colors">About</Link></li>
                <li><Link href="/pilates/instructors" className="hover:text-[#9BA899] transition-colors">Instructors</Link></li>
                <li><Link href="/pilates/classes" className="hover:text-[#9BA899] transition-colors">Classes</Link></li>
                <li><Link href="/pilates/pricing" className="hover:text-[#9BA899] transition-colors">Pricing</Link></li>
                <li><Link href="/pilates/schedule" className="hover:text-[#9BA899] transition-colors">Schedule</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-[#FAF8F5]">Contact</h4>
              <ul className="space-y-2 text-sm text-[#B8AFA5]">
                <li>swiftfitpws@gmail.com</li>
                <li>2245 E Tioga Street</li>
                <li>Philadelphia, PA 19134</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#B8AFA5]/20 pt-8 text-center text-sm text-[#B8AFA5]">
            <p>© 2025 Swift Fit Pilates + Wellness Studio. All rights reserved.</p>
            <p className="mt-2">Part of <Link href="/" className="text-[#9BA899] hover:underline">SwiftFit 215</Link> family</p>
          </div>
        </div>
      </footer>
    </div>
  )
}