"use client"

import { useEffect, useState } from "react"
import { useSession } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Users, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { format, parseISO } from "date-fns"

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

  const upcomingClasses = classes.filter(c => c.status === "scheduled")
  const totalStudents = classes.reduce((sum, c) => 
    sum + c.registrations.filter(r => r.bookingStatus === "confirmed").length, 0
  )

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
              <h1 className="font-display text-3xl text-primary">INSTRUCTOR DASHBOARD</h1>
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
              <CardTitle className="text-sm font-medium">Upcoming Classes</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingClasses.length}</div>
              <p className="text-xs text-muted-foreground">Scheduled sessions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStudents}</div>
              <p className="text-xs text-muted-foreground">Registered for your classes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Classes Today</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {classes.filter(c => {
                  const classDate = parseISO(c.date)
                  const today = new Date()
                  return classDate.toDateString() === today.toDateString()
                }).length}
              </div>
              <p className="text-xs text-muted-foreground">Sessions scheduled</p>
            </CardContent>
          </Card>
        </div>

        {/* Class Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Your Class Schedule</CardTitle>
            <CardDescription>View your upcoming classes and registered students</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingClasses.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No upcoming classes scheduled</p>
              </div>
            ) : (
              upcomingClasses.map((cls) => {
                const confirmedStudents = cls.registrations.filter(r => r.bookingStatus === "confirmed")
                const spotsLeft = cls.capacity - confirmedStudents.length
                
                return (
                  <Card key={cls.id} className="border-2">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-xl">{cls.classType.name}</h3>
                            <Badge variant={spotsLeft > 0 ? "default" : "destructive"}>
                              {confirmedStudents.length}/{cls.capacity} registered
                            </Badge>
                          </div>
                          
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>{format(parseISO(cls.date), "EEEE, MMMM d, yyyy")}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>{cls.startTime} - {cls.endTime}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Registered Students */}
                      {confirmedStudents.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Registered Students ({confirmedStudents.length})
                          </h4>
                          <div className="grid sm:grid-cols-2 gap-3">
                            {confirmedStudents.map((reg) => (
                              <div 
                                key={reg.id} 
                                className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                              >
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  <span className="text-xs font-semibold text-primary">
                                    {reg.student.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="font-medium text-sm truncate">{reg.student.name}</div>
                                  <div className="text-xs text-muted-foreground truncate">{reg.student.email}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {confirmedStudents.length === 0 && (
                        <div className="mt-4 pt-4 border-t text-center text-sm text-muted-foreground">
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
    </div>
  )
}
