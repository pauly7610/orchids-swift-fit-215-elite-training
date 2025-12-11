"use client"

import { useEffect, useState } from "react"
import { useSession, authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Users, CheckCircle2, LogOut } from "lucide-react"
import { toast } from "sonner"
import { format, parseISO } from "date-fns"
import Link from "next/link"
import Image from "next/image"

interface ClassWithRegistrations {
  id: number
  date: string
  startTime: string
  endTime: string
  capacity: number
  status: string
  classType: { name: string; description: string }
  registrations: Array<{
    id: number
    bookingStatus: string
    student: {
      name: string
      email: string
    }
  }>
}

export default function InstructorDashboard() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [classes, setClasses] = useState<ClassWithRegistrations[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login?redirect=/instructor")
    }
  }, [session, isPending, router])

  useEffect(() => {
    if (session) {
      checkInstructorRole()
      fetchClasses()
    }
  }, [session])

  const checkInstructorRole = async () => {
    try {
      const token = localStorage.getItem("bearer_token")
      const res = await fetch("/api/user-profiles", {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (res.ok) {
        const data = await res.json()
        if (data.role !== "instructor" && data.role !== "admin") {
          toast.error("Access denied. Instructors only.")
          router.push("/pilates")
        }
      }
    } catch (error) {
      console.error("Failed to check role")
    }
  }

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem("bearer_token")
      const res = await fetch("/api/classes?instructor=me", {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.ok) {
        const data = await res.json()
        // Filter to show only upcoming classes
        const upcoming = data.filter((c: ClassWithRegistrations) => 
          new Date(`${c.date}T${c.startTime}`) > new Date()
        )
        setClasses(upcoming)
      }
    } catch (error) {
      toast.error("Failed to load classes")
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

  const upcomingClasses = classes.filter(c => c.status === "scheduled")
  const totalStudents = classes.reduce((sum, c) => 
    sum + c.registrations.filter(r => r.bookingStatus === "confirmed").length, 0
  )

  if (isPending || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9BA899] mx-auto mb-4"></div>
          <p className="text-[#7A736B]">Loading your dashboard...</p>
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
                <h1 className="font-serif text-lg md:text-xl text-[#5A5550] truncate">Instructor Dashboard</h1>
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
              <CardTitle className="text-sm font-medium text-[#5A5550]">Upcoming Classes</CardTitle>
              <Calendar className="h-4 w-4 text-[#9BA899]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-serif text-[#9BA899]">{upcomingClasses.length}</div>
              <p className="text-xs text-[#B8AFA5]">Scheduled sessions</p>
            </CardContent>
          </Card>

          <Card className="border-[#B8AFA5]/30 bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[#5A5550]">Total Students</CardTitle>
              <Users className="h-4 w-4 text-[#9BA899]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-serif text-[#9BA899]">{totalStudents}</div>
              <p className="text-xs text-[#B8AFA5]">Registered for your classes</p>
            </CardContent>
          </Card>

          <Card className="border-[#B8AFA5]/30 bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[#5A5550]">Classes Today</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-[#9BA899]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-serif text-[#9BA899]">
                {classes.filter(c => {
                  const classDate = parseISO(c.date)
                  const today = new Date()
                  return classDate.toDateString() === today.toDateString()
                }).length}
              </div>
              <p className="text-xs text-[#B8AFA5]">Sessions scheduled</p>
            </CardContent>
          </Card>
        </div>

        {/* Class Schedule */}
        <Card className="border-[#B8AFA5]/30 bg-white">
          <CardHeader>
            <CardTitle className="font-serif font-normal text-[#5A5550]">Your Class Schedule</CardTitle>
            <CardDescription className="text-[#7A736B]">View your upcoming classes and registered students</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingClasses.length === 0 ? (
              <div className="text-center py-12 text-[#B8AFA5]">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No upcoming classes scheduled</p>
              </div>
            ) : (
              upcomingClasses.map((cls) => {
                const confirmedStudents = cls.registrations.filter(r => r.bookingStatus === "confirmed")
                const spotsLeft = cls.capacity - confirmedStudents.length
                
                return (
                  <Card key={cls.id} className="border-[#B8AFA5]/30 hover:border-[#9BA899]/50 transition-colors">
                    <CardContent className="p-4 md:p-6">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h3 className="font-serif text-lg md:text-xl text-[#5A5550]">{cls.classType.name}</h3>
                            <Badge 
                              variant="outline" 
                              className={`rounded-full ${spotsLeft > 0 ? 'border-[#9BA899] text-[#9BA899]' : 'border-[#E8B4B8] text-[#E8B4B8]'}`}
                            >
                              {confirmedStudents.length}/{cls.capacity} registered
                            </Badge>
                          </div>
                          
                          <div className="space-y-1 text-sm text-[#7A736B]">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-[#9BA899]" />
                              <span>{format(parseISO(cls.date), "EEEE, MMMM d, yyyy")}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-[#9BA899]" />
                              <span>{cls.startTime} - {cls.endTime}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Registered Students */}
                      {confirmedStudents.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-[#B8AFA5]/20">
                          <h4 className="font-medium text-sm mb-3 flex items-center gap-2 text-[#5A5550]">
                            <Users className="h-4 w-4 text-[#9BA899]" />
                            Registered Students ({confirmedStudents.length})
                          </h4>
                          <div className="grid sm:grid-cols-2 gap-3">
                            {confirmedStudents.map((reg) => (
                              <div 
                                key={reg.id} 
                                className="flex items-center gap-3 p-3 bg-[#FAF8F5] rounded-lg"
                              >
                                <div className="h-8 w-8 rounded-full bg-[#9BA899]/20 flex items-center justify-center shrink-0">
                                  <span className="text-xs font-semibold text-[#9BA899]">
                                    {reg.student.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="font-medium text-sm truncate text-[#5A5550]">{reg.student.name}</div>
                                  <div className="text-xs text-[#B8AFA5] truncate">{reg.student.email}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {confirmedStudents.length === 0 && (
                        <div className="mt-4 pt-4 border-t border-[#B8AFA5]/20 text-center text-sm text-[#B8AFA5]">
                          No students registered yet
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#B8AFA5]/20 bg-white py-4 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-[#7A736B]">
          © 2025 Swift Fit Pilates & Wellness Studio
        </div>
      </footer>
    </div>
  )
}
