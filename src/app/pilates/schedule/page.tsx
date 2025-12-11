"use client"

import { useEffect, useState } from "react"
import { useSession } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Calendar, User, CreditCard, Menu, X } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { format, parseISO, startOfWeek, addDays, isSameDay } from "date-fns"
import { useRef } from "react"
import Image from "next/image"

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null)

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
          
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
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
            className="lg:hidden border-t border-[#B8AFA5]/20 bg-[#FAF8F5]/98 backdrop-blur-sm" 
            ref={mobileMenuRef}
            role="dialog"
            aria-label="Mobile navigation menu"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-3" aria-label="Mobile navigation">
              <Link href="/pilates/about" className="text-[#5A5550] hover:text-[#9BA899] transition-colors text-base font-medium py-2" onClick={() => setIsMobileMenuOpen(false)}>About</Link>
              <Link href="/pilates/instructors" className="text-[#5A5550] hover:text-[#9BA899] transition-colors text-base font-medium py-2" onClick={() => setIsMobileMenuOpen(false)}>Instructors</Link>
              <Link href="/pilates/classes" className="text-[#5A5550] hover:text-[#9BA899] transition-colors text-base font-medium py-2" onClick={() => setIsMobileMenuOpen(false)}>Classes</Link>
              <Link href="/pilates/pricing" className="text-[#5A5550] hover:text-[#9BA899] transition-colors text-base font-medium py-2" onClick={() => setIsMobileMenuOpen(false)}>Pricing</Link>
              <Link href="/pilates/schedule" className="text-[#9BA899] font-medium transition-colors text-base py-2" onClick={() => setIsMobileMenuOpen(false)}>Schedule</Link>
              <Link href="/pilates/faq" className="text-[#5A5550] hover:text-[#9BA899] transition-colors text-base font-medium py-2" onClick={() => setIsMobileMenuOpen(false)}>FAQ</Link>
              {session ? (
                <Link href="/student" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button size="sm" className="bg-[#9BA899] hover:bg-[#8A9788] text-white rounded-full w-full">Dashboard</Button>
                </Link>
              ) : (
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button size="sm" className="bg-[#9BA899] hover:bg-[#8A9788] text-white rounded-full w-full">Login</Button>
                </Link>
              )}
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                <Button size="sm" variant="outline" className="border-[#B8AFA5] text-[#5A5550] hover:bg-[#9BA899]/10 w-full">Back to Gym</Button>
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-8 md:pt-32 md:pb-12 bg-gradient-to-b from-[#F5F2EE] to-[#FAF8F5] relative overflow-hidden">
        <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-[#9BA899]/5 blur-3xl"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-[#5A5550] mb-3 md:mb-4 font-light">
              Class Schedule
            </h1>
            <p className="text-base md:text-lg text-[#7A736B] mb-4 md:mb-6 px-4">
              Find your perfect class and book your spot today
            </p>
            {session && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 px-4">
                <Badge className="bg-[#9BA899]/20 text-[#5A5550] border-[#9BA899] text-sm md:text-base px-4 md:px-6 py-1.5 md:py-2 rounded-full">
                  <CreditCard className="h-4 w-4 mr-2" />
                  {totalCredits} Credits Available
                </Badge>
                <Link href="/student/purchase">
                  <Button variant="outline" size="sm" className="border-[#B8AFA5] text-[#5A5550] hover:bg-[#9BA899]/10 rounded-full text-sm">
                    Buy More Credits
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Week Navigation */}
      <section className="py-6 md:py-8 bg-white border-b border-[#B8AFA5]/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-start gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {weekDays.map((day) => {
              const isSelected = selectedDate && isSameDay(day, selectedDate)
              const hasClasses = classes.some(cls => isSameDay(parseISO(cls.date), day))
              
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`flex flex-col items-center min-w-[70px] md:min-w-[80px] px-3 md:px-4 py-2.5 md:py-3 rounded-2xl border-2 transition-all flex-shrink-0 ${
                    isSelected
                      ? "border-[#9BA899] bg-[#9BA899]/10"
                      : hasClasses
                      ? "border-[#B8AFA5]/30 hover:border-[#9BA899]/50 bg-white"
                      : "border-[#B8AFA5]/20 opacity-50 cursor-not-allowed bg-[#FAF8F5]"
                  }`}
                  disabled={!hasClasses}
                >
                  <span className="text-xs text-[#9BA899] mb-0.5 md:mb-1">
                    {format(day, "EEE")}
                  </span>
                  <span className="text-xl md:text-2xl font-serif font-light text-[#5A5550]">
                    {format(day, "d")}
                  </span>
                  <span className="text-xs text-[#7A736B]">
                    {format(day, "MMM")}
                  </span>
                  {hasClasses && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#9BA899] mt-1.5 md:mt-2" />
                  )}
                </button>
              )
            })}
          </div>
          <div className="text-center mt-3 md:mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedDate(new Date())}
              className="text-[#9BA899] hover:text-[#8A9788] text-sm"
            >
              Today
            </Button>
          </div>
        </div>
      </section>

      {/* Classes List */}
      <section className="py-8 md:py-12 bg-[#FAF8F5]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {selectedDate && (
              <div className="mb-6 md:mb-8 text-center">
                <h2 className="font-serif text-2xl md:text-3xl text-[#5A5550] mb-2 font-light px-4">
                  {format(selectedDate, "EEEE, MMMM d, yyyy")}
                </h2>
                <p className="text-sm md:text-base text-[#7A736B]">
                  {filteredClasses.length} {filteredClasses.length === 1 ? "class" : "classes"} available
                </p>
              </div>
            )}

            {filteredClasses.length === 0 ? (
              <Card className="text-center py-10 md:py-12 bg-white border-[#B8AFA5]/30">
                <CardContent>
                  <Calendar className="h-12 w-12 md:h-16 md:w-16 text-[#9BA899] mx-auto mb-4" />
                  <h3 className="text-lg md:text-xl font-serif font-normal text-[#5A5550] mb-2 px-4">No classes scheduled</h3>
                  <p className="text-sm md:text-base text-[#7A736B] mb-6 px-4">
                    No classes available for this date. Try selecting another day.
                  </p>
                  <Link href="/pilates/pricing">
                    <Button className="bg-[#9BA899] hover:bg-[#8A9788] text-white rounded-full">View Pricing & Packages</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {filteredClasses.map((cls) => {
                  const isFull = cls.spotsRemaining <= 0
                  const isLowCapacity = cls.spotsRemaining <= 3 && cls.spotsRemaining > 0
                  
                  return (
                    <Card key={cls.id} className="border-2 border-[#B8AFA5]/30 hover:border-[#9BA899] transition-all bg-white">
                      <CardContent className="p-4 md:p-6">
                        <div className="flex flex-col gap-4 md:gap-6">
                          {/* Mobile: Time at top */}
                          <div className="md:hidden">
                            <div className="bg-[#9BA899]/10 rounded-2xl px-4 py-3 text-center border border-[#B8AFA5]/30 inline-block">
                              <div className="font-serif text-2xl text-[#9BA899] font-light">
                                {cls.startTime}
                              </div>
                              <div className="text-xs text-[#7A736B] mt-0.5">
                                {cls.classType.durationMinutes} min
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                            {/* Desktop: Time Badge */}
                            <div className="hidden md:block flex-shrink-0">
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
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-lg md:text-2xl font-serif font-normal text-[#5A5550] mb-1">
                                    {cls.classType.name}
                                  </h3>
                                  <div className="flex items-center gap-2 text-xs md:text-sm text-[#7A736B]">
                                    <User className="h-3 w-3 md:h-4 md:w-4 shrink-0" />
                                    <span className="truncate">{cls.instructor.name}</span>
                                  </div>
                                </div>
                                {cls.price && (
                                  <div className="text-left sm:text-right">
                                    <div className="text-xl md:text-2xl font-serif font-light text-[#9BA899]">${cls.price.toFixed(2)}</div>
                                    <div className="text-xs text-[#7A736B]">per class</div>
                                  </div>
                                )}
                              </div>

                              <p className="text-xs md:text-sm text-[#7A736B] mb-4 line-clamp-2">
                                {cls.classType.description}
                              </p>

                              <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-4">
                                {cls.isUserBooked ? (
                                  <Badge className="bg-[#9BA899] text-white border-none rounded-full text-xs">✓ Booked</Badge>
                                ) : isFull ? (
                                  <Badge variant="destructive" className="rounded-full text-xs">Full</Badge>
                                ) : isLowCapacity ? (
                                  <Badge className="bg-orange-500 text-white border-none rounded-full text-xs">
                                    Only {cls.spotsRemaining} spots left
                                  </Badge>
                                ) : (
                                  <Badge className="bg-[#9BA899]/20 text-[#5A5550] border-[#9BA899] rounded-full text-xs">
                                    {cls.spotsRemaining} spots available
                                  </Badge>
                                )}

                                {cls.waitlistPosition && (
                                  <Badge variant="outline" className="border-[#B8AFA5] text-[#5A5550] rounded-full text-xs">
                                    Waitlist #{cls.waitlistPosition}
                                  </Badge>
                                )}

                                <div className="text-xs text-[#9BA899]">
                                  {cls.registeredCount} / {cls.capacity} registered
                                </div>
                              </div>

                              {/* Mobile: Booking button at bottom */}
                              <div className="md:hidden">
                                {cls.isUserBooked ? (
                                  <div className="flex gap-2">
                                    <Button variant="outline" disabled className="flex-1 rounded-full border-[#9BA899] text-[#9BA899] text-sm">
                                      Booked
                                    </Button>
                                    <Link href="/student" className="flex-1">
                                      <Button variant="ghost" size="sm" className="w-full text-[#5A5550] hover:text-[#9BA899] text-sm">
                                        Manage
                                      </Button>
                                    </Link>
                                  </div>
                                ) : isFull ? (
                                  cls.waitlistPosition ? (
                                    <Button variant="outline" disabled className="w-full rounded-full border-[#B8AFA5] text-sm">
                                      On Waitlist
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="outline"
                                      onClick={() => handleJoinWaitlist(cls.id)}
                                      className="w-full rounded-full border-[#9BA899] text-[#9BA899] hover:bg-[#9BA899]/10 text-sm"
                                    >
                                      Join Waitlist
                                    </Button>
                                  )
                                ) : (
                                  <Button
                                    onClick={() => handleBookClass(cls.id)}
                                    className="w-full bg-[#9BA899] hover:bg-[#8A9788] text-white rounded-full text-sm"
                                    disabled={session && totalCredits === 0}
                                  >
                                    {session ? (totalCredits > 0 ? "Book Now" : "No Credits") : "Login to Book"}
                                  </Button>
                                )}
                              </div>
                            </div>

                            {/* Desktop: Booking Actions */}
                            <div className="hidden md:flex flex-col gap-2 flex-shrink-0">
                              {cls.isUserBooked ? (
                                <>
                                  <Button variant="outline" disabled className="w-32 rounded-full border-[#9BA899] text-[#9BA899]">
                                    Booked
                                  </Button>
                                  <Link href="/student">
                                    <Button variant="ghost" size="sm" className="w-32 text-[#5A5550] hover:text-[#9BA899]">
                                      Manage
                                    </Button>
                                  </Link>
                                </>
                              ) : isFull ? (
                                cls.waitlistPosition ? (
                                  <Button variant="outline" disabled className="w-32 rounded-full border-[#B8AFA5]">
                                    On Waitlist
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline"
                                    onClick={() => handleJoinWaitlist(cls.id)}
                                    className="w-32 rounded-full border-[#9BA899] text-[#9BA899] hover:bg-[#9BA899]/10"
                                  >
                                    Join Waitlist
                                  </Button>
                                )
                              ) : (
                                <Button
                                  onClick={() => handleBookClass(cls.id)}
                                  className="w-32 bg-[#9BA899] hover:bg-[#8A9788] text-white rounded-full"
                                  disabled={session && totalCredits === 0}
                                >
                                  {session ? (totalCredits > 0 ? "Book Now" : "No Credits") : "Login to Book"}
                                </Button>
                              )}
                            </div>
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
      <section className="py-16 md:py-20 bg-gradient-to-b from-[#9BA899]/10 to-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#B8AFA5]/10 blur-3xl"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-[#5A5550] mb-4 md:mb-6 font-light px-4">
            New to Swift Fit Pilates?
          </h2>
          <p className="text-base md:text-lg text-[#7A736B] mb-6 md:mb-8 max-w-2xl mx-auto px-4">
            Get started with our introductory offer: 3 classes for just $49!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4">
            <Link href="/pilates/pricing" className="w-full sm:w-auto">
              <Button size="lg" className="bg-[#9BA899] hover:bg-[#8A9788] text-white text-sm md:text-base h-11 md:h-12 px-6 md:px-8 rounded-full w-full">
                View Pricing
              </Button>
            </Link>
            {!session && (
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="border-[#B8AFA5] bg-white text-[#5A5550] hover:bg-[#F5F2EE] text-sm md:text-base h-11 md:h-12 px-6 md:px-8 rounded-full w-full">
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