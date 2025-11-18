"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, Target, Zap, Heart, Award, Calendar, User, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { PilatesNav } from "@/components/pilates-nav"
import { useSession } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { format, parseISO, startOfWeek, addDays, isSameDay } from "date-fns"

interface ClassWithDetails {
  id: number
  date: string
  startTime: string
  endTime: string
  capacity: number
  status: string
  classType: {
    id: number
    name: string
    description: string
    durationMinutes: number
  }
  instructor: {
    id: number
    name: string
    bio: string
  }
  registeredCount: number
  spotsRemaining: number
  isUserBooked: boolean
  waitlistPosition: number | null
}

interface StudentCredit {
  totalCredits: number
  packages: Array<{
    id: number
    name: string
    creditsRemaining: number
    expiresAt: string
  }>
}

export default function PilatesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [classes, setClasses] = useState<ClassWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [credits, setCredits] = useState<StudentCredit | null>(null)
  const [bookingInProgress, setBookingInProgress] = useState<number | null>(null)

  const weekDays = Array.from({ length: 7 }, (_, i) => 
    addDays(startOfWeek(selectedDate, { weekStartsOn: 1 }), i)
  )

  useEffect(() => {
    fetchClasses()
    if (session) {
      fetchCredits()
    }
  }, [selectedDate, session])

  const fetchClasses = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("bearer_token")
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      
      const res = await fetch("/api/classes/schedule", { headers })
      if (res.ok) {
        const data = await res.json()
        setClasses(data)
      }
    } catch (error) {
      console.error("Failed to fetch classes:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCredits = async () => {
    try {
      const token = localStorage.getItem("bearer_token")
      if (!token) return
      
      const res = await fetch(`/api/students/${session?.user?.id}/credits`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setCredits(data)
      }
    } catch (error) {
      console.error("Failed to fetch credits:", error)
    }
  }

  const handleBookClass = async (classId: number) => {
    if (!session) {
      toast.error("Please log in to book classes")
      router.push(`/login?redirect=/pilates`)
      return
    }

    if (credits && credits.totalCredits === 0) {
      toast.error("No credits available. Please purchase a package.")
      router.push("/student/purchase")
      return
    }

    setBookingInProgress(classId)

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
        toast.success(data.message || "✓ Class booked successfully!")
        await fetchClasses()
        await fetchCredits()
      } else {
        toast.error(data.error || "Failed to book class")
      }
    } catch (error) {
      toast.error("Failed to book class. Please try again.")
    } finally {
      setBookingInProgress(null)
    }
  }

  const handleCancelBooking = async (classId: number) => {
    if (!session) return

    const classData = classes.find(c => c.id === classId)
    if (!classData) return

    setBookingInProgress(classId)

    try {
      const token = localStorage.getItem("bearer_token")
      
      // Find the booking ID
      const bookingsRes = await fetch(`/api/bookings?classId=${classId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (!bookingsRes.ok) {
        toast.error("Failed to find booking")
        return
      }

      const bookings = await bookingsRes.json()
      const booking = bookings.find((b: any) => b.bookingStatus === "confirmed")
      
      if (!booking) {
        toast.error("Booking not found")
        return
      }

      const res = await fetch(`/api/bookings/${booking.id}/cancel`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      })

      const data = await res.json()
      
      if (res.ok) {
        toast.success(data.message || "✓ Booking cancelled")
        await fetchClasses()
        await fetchCredits()
      } else {
        toast.error(data.error || "Failed to cancel booking")
      }
    } catch (error) {
      toast.error("Failed to cancel booking")
    } finally {
      setBookingInProgress(null)
    }
  }

  const handleJoinWaitlist = async (classId: number) => {
    if (!session) {
      toast.error("Please log in to join waitlist")
      router.push(`/login?redirect=/pilates`)
      return
    }

    setBookingInProgress(classId)

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
        toast.success(`✓ Added to waitlist (Position: ${data.position})`)
        await fetchClasses()
      } else {
        toast.error(data.error || "Failed to join waitlist")
      }
    } catch (error) {
      toast.error("Failed to join waitlist")
    } finally {
      setBookingInProgress(null)
    }
  }

  const filteredClasses = classes.filter(cls => {
    const classDate = parseISO(cls.date)
    return isSameDay(classDate, selectedDate)
  })

  return (
    <div className="min-h-screen">
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <a href="/" className="font-display text-2xl text-primary">SWIFTFIT 215</a>
              <nav className="hidden md:flex items-center gap-6">
                <a href="/" className="text-sm font-medium hover:text-primary transition-colors">Home</a>
                <a href="/pilates" className="text-sm font-medium text-primary">Pilates</a>
              </nav>
            </div>
            <PilatesNav />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-32 overflow-hidden bg-gradient-to-br from-secondary via-secondary/95 to-black">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1920&q=80')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary/90 to-transparent"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <Badge className="mb-6 bg-primary/20 text-primary border-primary/30 text-sm px-4 py-1">
              Athletic Pilates Training
            </Badge>
            <h1 className="font-display text-5xl md:text-7xl text-white mb-6 leading-tight tracking-wide">
              MAT PILATES FOR ATHLETES & STRENGTH SEEKERS
            </h1>
            <p className="text-lg text-white/70 mb-8 max-w-2xl">
              Not your typical Pilates class. We combine core strength, flexibility, and athletic conditioning to build powerful, injury-resistant bodies. Perfect for athletes, fitness enthusiasts, and anyone serious about functional strength.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white text-lg h-14 px-8" onClick={() => {
                document.getElementById("book-classes")?.scrollIntoView({ behavior: "smooth" })
              }}>
                Book a Class Now
              </Button>
              <Button size="lg" variant="outline" className="border-white bg-white/10 text-white hover:bg-white hover:text-secondary text-lg h-14 px-8">
                <a href="#schedule">View Schedule</a>
              </Button>
            </div>
            {session && credits && (
              <div className="mt-8 p-4 bg-white/10 backdrop-blur rounded-lg border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Your Available Credits</p>
                    <p className="text-white font-display text-3xl">{credits.totalCredits}</p>
                  </div>
                  {credits.totalCredits === 0 && (
                    <Button variant="outline" className="border-white text-white hover:bg-white hover:text-secondary" onClick={() => router.push("/student/purchase")}>
                      Buy Credits
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-5xl md:text-6xl text-secondary mb-4 tracking-wide">WHY PILATES AT SWIFTFIT</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Athletic Pilates designed to complement your training, prevent injury, and build unshakeable core strength
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Core Strength</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Build bulletproof core stability that translates to every movement—from sprinting to lifting to everyday activities.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Flexibility & Mobility</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Increase range of motion and joint mobility to move better, lift more, and reduce injury risk in all your training.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Injury Prevention</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Strengthen stabilizer muscles and correct imbalances to stay healthy, train harder, and perform at your peak.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Athletic Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Enhance power transfer, balance, and body control for better performance in your sport or training regimen.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Active Recovery</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Perfect low-impact workout for recovery days—keep moving while your body repairs and rebuilds stronger.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Mind-Body Connection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Develop better body awareness and movement control through focused, intentional training.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Real-Time Class Booking Section */}
      <section id="book-classes" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-5xl md:text-6xl text-secondary mb-4 tracking-wide">BOOK YOUR CLASS</h2>
              <p className="text-lg text-muted-foreground mb-2">
                Real-time availability • Instant confirmation • Easy cancellation
              </p>
              {!session && (
                <p className="text-sm text-muted-foreground">
                  <Button variant="link" className="text-primary p-0 h-auto" onClick={() => router.push("/login?redirect=/pilates")}>
                    Log in
                  </Button> or <Button variant="link" className="text-primary p-0 h-auto" onClick={() => router.push("/register")}>
                    create an account
                  </Button> to book classes
                </p>
              )}
            </div>

            {/* Week Selector */}
            <div className="mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(addDays(selectedDate, -7))}
                >
                  ← Previous Week
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(new Date())}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(addDays(selectedDate, 7))}
                >
                  Next Week →
                </Button>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day, idx) => {
                  const isSelected = isSameDay(day, selectedDate)
                  const isToday = isSameDay(day, new Date())
                  const dayClasses = classes.filter(cls => isSameDay(parseISO(cls.date), day))
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedDate(day)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        isSelected 
                          ? "border-primary bg-primary/10" 
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="text-xs text-muted-foreground mb-1">
                        {format(day, "EEE")}
                      </div>
                      <div className={`text-lg font-semibold ${isToday ? "text-primary" : ""}`}>
                        {format(day, "d")}
                      </div>
                      {dayClasses.length > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {dayClasses.length} class{dayClasses.length !== 1 ? "es" : ""}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Classes for Selected Date */}
            <Card>
              <CardHeader>
                <CardTitle>Classes on {format(selectedDate, "EEEE, MMMM d, yyyy")}</CardTitle>
                <CardDescription>
                  {filteredClasses.length} class{filteredClasses.length !== 1 ? "es" : ""} available
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading classes...</p>
                  </div>
                ) : filteredClasses.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No classes scheduled for this date</p>
                    <p className="text-sm text-muted-foreground mt-2">Try selecting a different day</p>
                  </div>
                ) : (
                  filteredClasses.map((cls) => {
                    const isFull = cls.spotsRemaining <= 0
                    const isBooked = cls.isUserBooked
                    const isOnWaitlist = cls.waitlistPosition !== null
                    const isProcessing = bookingInProgress === cls.id
                    
                    return (
                      <Card key={cls.id} className="border-2 hover:border-primary/50 transition-all">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between gap-6">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <h3 className="font-display text-2xl text-primary tracking-wide">
                                  {cls.classType.name}
                                </h3>
                                {isBooked && (
                                  <Badge className="bg-green-500">✓ Booked</Badge>
                                )}
                                {isOnWaitlist && (
                                  <Badge variant="outline">Waitlist #{cls.waitlistPosition}</Badge>
                                )}
                              </div>
                              
                              <p className="text-muted-foreground mb-4 text-sm">
                                {cls.classType.description}
                              </p>

                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-primary" />
                                  <span className="font-semibold">{cls.startTime} - {cls.endTime}</span>
                                  <span className="text-muted-foreground">({cls.classType.durationMinutes} min)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-primary" />
                                  <span>{cls.instructor.name}</span>
                                </div>
                              </div>

                              <div className="mt-4 flex items-center gap-4">
                                <Badge 
                                  variant={isFull ? "destructive" : cls.spotsRemaining <= 3 ? "default" : "secondary"}
                                  className="text-sm"
                                >
                                  {isFull ? "FULL" : `${cls.spotsRemaining} spot${cls.spotsRemaining !== 1 ? "s" : ""} left`}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {cls.registeredCount} / {cls.capacity} registered
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-col gap-2 min-w-[140px]">
                              {isBooked ? (
                                <Button 
                                  variant="outline"
                                  onClick={() => handleCancelBooking(cls.id)}
                                  disabled={isProcessing}
                                  className="w-full"
                                >
                                  {isProcessing ? "Cancelling..." : "Cancel Booking"}
                                </Button>
                              ) : isFull ? (
                                isOnWaitlist ? (
                                  <Button variant="outline" disabled className="w-full">
                                    On Waitlist
                                  </Button>
                                ) : (
                                  <Button 
                                    variant="outline"
                                    onClick={() => handleJoinWaitlist(cls.id)}
                                    disabled={isProcessing || !session}
                                    className="w-full"
                                  >
                                    {isProcessing ? "Joining..." : "Join Waitlist"}
                                  </Button>
                                )
                              ) : (
                                <Button 
                                  onClick={() => handleBookClass(cls.id)}
                                  disabled={isProcessing || !session || (credits && credits.totalCredits === 0)}
                                  className="w-full bg-primary hover:bg-primary/90"
                                >
                                  {isProcessing ? "Booking..." : "Book Now"}
                                </Button>
                              )}
                              
                              {!session && (
                                <p className="text-xs text-center text-muted-foreground mt-1">
                                  Login required
                                </p>
                              )}
                              
                              {session && credits && credits.totalCredits === 0 && !isBooked && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => router.push("/student/purchase")}
                                  className="w-full"
                                >
                                  Buy Credits
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

            {!session && (
              <Card className="mt-8 bg-primary/5 border-primary/20">
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold text-lg mb-2">Ready to get started?</h3>
                  <p className="text-muted-foreground mb-4">
                    Create an account to book classes, purchase packages, and manage your schedule
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button onClick={() => router.push("/register")}>
                      Create Account
                    </Button>
                    <Button variant="outline" onClick={() => router.push("/login?redirect=/pilates")}>
                      Log In
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* What to Expect */}
      <section id="schedule" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-display text-5xl md:text-6xl text-secondary mb-4 tracking-wide">WHAT TO EXPECT</h2>
              <p className="text-lg text-muted-foreground">
                Athletic mat Pilates that complements your training lifestyle
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card className="p-8">
                <h3 className="font-display text-3xl text-primary mb-4 tracking-wide">CLASS FORMAT</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong>50-minute classes</strong> with structured warm-up, main workout, and cool-down</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong>Mat-based exercises</strong> using bodyweight and small equipment</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong>Progressive difficulty</strong> suitable for all fitness levels</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong>Focus on form</strong> with individualized corrections and modifications</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-8">
                <h3 className="font-display text-3xl text-primary mb-4 tracking-wide">WHO IT'S FOR</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong>Athletes</strong> seeking core strength and injury prevention</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong>Gym members</strong> adding variety to their training routine</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong>Beginners</strong> building foundational movement patterns</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong>Anyone</strong> serious about functional strength and mobility</span>
                  </li>
                </ul>
              </Card>
            </div>

            <Card className="p-8 bg-gradient-to-r from-secondary via-secondary/95 to-black text-white border-0">
              <div className="text-center">
                <h3 className="font-display text-3xl text-primary mb-4 tracking-wide">NOT YOUR TYPICAL PILATES</h3>
                <p className="text-lg text-white/80 mb-6">
                  We've adapted traditional Pilates principles for the athletic community. Expect challenging movements, functional strength work, and training that directly enhances your performance and daily life.
                </p>
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  Perfect complement to strength training, running, and sports performance
                </Badge>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-display text-4xl text-secondary mb-4 tracking-wide">QUESTIONS?</h2>
            <p className="text-muted-foreground mb-8">
              Contact us about our Pilates program, membership options, or class packages
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" asChild size="lg">
                <a href="tel:2679390254">(267) 939-0254</a>
              </Button>
              <Button variant="outline" asChild size="lg">
                <a href="/#contact">Contact Us</a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}