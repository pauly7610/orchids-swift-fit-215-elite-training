"use client"

import { useEffect, useState } from "react"
import { useSession } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  ArrowLeft, Calendar, Clock, Users, CheckCircle2, XCircle, 
  UserCheck, UserX, Save, AlertCircle
} from "lucide-react"
import { toast } from "sonner"
import { format, parseISO, isPast, isToday } from "date-fns"
import Link from "next/link"

interface ClassWithBookings {
  id: number
  date: string
  startTime: string
  endTime: string
  status: string
  classTypeName: string
  instructorName: string
  capacity: number
  bookings: {
    id: number
    studentName: string
    studentEmail: string
    bookingStatus: string
  }[]
}

export default function AttendancePage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [classes, setClasses] = useState<ClassWithBookings[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClass, setSelectedClass] = useState<ClassWithBookings | null>(null)
  const [attendance, setAttendance] = useState<Record<number, 'attended' | 'no_show' | 'confirmed'>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login?redirect=/admin/attendance")
    }
  }, [session, isPending, router])

  useEffect(() => {
    if (session) {
      checkRole()
      fetchClasses()
    }
  }, [session])

  const checkRole = async () => {
    try {
      const token = localStorage.getItem("bearer_token")
      const res = await fetch("/api/user-profiles", {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (res.ok) {
        const data = await res.json()
        if (data.role !== "admin" && data.role !== "instructor") {
          toast.error("Access denied.")
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
      
      // Get recent and today's classes
      const today = new Date().toISOString().split('T')[0]
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      
      const classesRes = await fetch(`/api/classes?fromDate=${weekAgo}&limit=50`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (!classesRes.ok) throw new Error('Failed to fetch classes')
      
      const classesData = await classesRes.json()
      
      // Fetch bookings for each class
      const classesWithBookings = await Promise.all(
        classesData.map(async (cls: any) => {
          const bookingsRes = await fetch(`/api/bookings?classId=${cls.id}&all=true`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          
          let bookingsData: any[] = []
          if (bookingsRes.ok) {
            bookingsData = await bookingsRes.json()
          }
          
          return {
            id: cls.id,
            date: cls.date,
            startTime: cls.startTime,
            endTime: cls.endTime,
            status: cls.status,
            classTypeName: cls.classTypeName || cls.classType?.name || 'Unknown',
            instructorName: cls.instructorName || 'TBD',
            capacity: cls.capacity,
            bookings: bookingsData
              .filter((b: any) => b.bookingStatus !== 'cancelled')
              .map((b: any) => ({
                id: b.id,
                studentName: b.student?.name || 'Unknown',
                studentEmail: b.student?.email || '',
                bookingStatus: b.bookingStatus,
              }))
          }
        })
      )
      
      // Sort by date/time, most recent first, prioritize today's classes
      classesWithBookings.sort((a, b) => {
        const aDate = new Date(`${a.date}T${a.startTime}`)
        const bDate = new Date(`${b.date}T${b.startTime}`)
        return bDate.getTime() - aDate.getTime()
      })
      
      setClasses(classesWithBookings)
    } catch (error) {
      toast.error("Failed to load classes")
    } finally {
      setLoading(false)
    }
  }

  const selectClass = (cls: ClassWithBookings) => {
    setSelectedClass(cls)
    // Initialize attendance state from existing bookings
    const initialAttendance: Record<number, 'attended' | 'no_show' | 'confirmed'> = {}
    cls.bookings.forEach(b => {
      initialAttendance[b.id] = b.bookingStatus as 'attended' | 'no_show' | 'confirmed'
    })
    setAttendance(initialAttendance)
  }

  const toggleAttendance = (bookingId: number) => {
    setAttendance(prev => {
      const current = prev[bookingId] || 'confirmed'
      // Cycle through: confirmed -> attended -> no_show -> confirmed
      const next = current === 'confirmed' ? 'attended' 
        : current === 'attended' ? 'no_show' 
        : 'confirmed'
      return { ...prev, [bookingId]: next }
    })
  }

  const markAllAttended = () => {
    if (!selectedClass) return
    const newAttendance: Record<number, 'attended' | 'no_show' | 'confirmed'> = {}
    selectedClass.bookings.forEach(b => {
      newAttendance[b.id] = 'attended'
    })
    setAttendance(newAttendance)
  }

  const saveAttendance = async () => {
    if (!selectedClass) return
    
    setSaving(true)
    try {
      const token = localStorage.getItem("bearer_token")
      
      const attendees = Object.entries(attendance)
        .filter(([_, status]) => status === 'attended')
        .map(([id]) => parseInt(id))
      
      const noShows = Object.entries(attendance)
        .filter(([_, status]) => status === 'no_show')
        .map(([id]) => parseInt(id))
      
      const res = await fetch(`/api/attendance`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          classId: selectedClass.id,
          attendees,
          noShows,
        })
      })
      
      if (res.ok) {
        toast.success("Attendance saved successfully")
        fetchClasses() // Refresh data
        setSelectedClass(null)
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to save attendance")
      }
    } catch (error) {
      toast.error("Failed to save attendance")
    } finally {
      setSaving(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'attended':
        return <Badge className="bg-green-500 text-white">Attended</Badge>
      case 'no_show':
        return <Badge className="bg-red-500 text-white">No Show</Badge>
      case 'confirmed':
        return <Badge className="bg-blue-500 text-white">Confirmed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const isClassInPast = (date: string, endTime: string) => {
    const classEnd = new Date(`${date}T${endTime}`)
    return classEnd < new Date()
  }

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] p-8">
        <Skeleton className="h-8 w-48 mb-8 bg-[#B8AFA5]/20" />
        <div className="grid gap-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-24 bg-[#B8AFA5]/20" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Header */}
      <header className="bg-white border-b border-[#B8AFA5]/30 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="icon" className="text-[#5A5550]">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-serif text-[#5A5550]">Attendance Tracking</h1>
              <p className="text-sm text-[#7A736B]">Mark students as attended or no-show</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {selectedClass ? (
          /* Attendance Entry View */
          <Card className="border-[#B8AFA5]/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-[#5A5550]">{selectedClass.classTypeName}</CardTitle>
                  <CardDescription>
                    {format(parseISO(selectedClass.date), 'EEEE, MMMM d')} at {selectedClass.startTime} with {selectedClass.instructorName}
                  </CardDescription>
                </div>
                <Button variant="ghost" onClick={() => setSelectedClass(null)}>
                  <XCircle className="h-5 w-5 mr-2" /> Close
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {selectedClass.bookings.length === 0 ? (
                <div className="text-center py-8 text-[#7A736B]">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No bookings for this class</p>
                </div>
              ) : (
                <>
                  <div className="flex gap-2 mb-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={markAllAttended}
                      className="border-green-500 text-green-600 hover:bg-green-50"
                    >
                      <UserCheck className="h-4 w-4 mr-2" /> Mark All Attended
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {selectedClass.bookings.map(booking => (
                      <div 
                        key={booking.id}
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                          attendance[booking.id] === 'attended' ? 'bg-green-50 border-green-200' :
                          attendance[booking.id] === 'no_show' ? 'bg-red-50 border-red-200' :
                          'bg-white border-[#B8AFA5]/30 hover:bg-[#FAF8F5]'
                        }`}
                        onClick={() => toggleAttendance(booking.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            attendance[booking.id] === 'attended' ? 'bg-green-100' :
                            attendance[booking.id] === 'no_show' ? 'bg-red-100' :
                            'bg-[#9BA899]/20'
                          }`}>
                            {attendance[booking.id] === 'attended' ? (
                              <UserCheck className="h-5 w-5 text-green-600" />
                            ) : attendance[booking.id] === 'no_show' ? (
                              <UserX className="h-5 w-5 text-red-600" />
                            ) : (
                              <Users className="h-5 w-5 text-[#9BA899]" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-[#5A5550]">{booking.studentName}</p>
                            <p className="text-sm text-[#7A736B]">{booking.studentEmail}</p>
                          </div>
                        </div>
                        {getStatusBadge(attendance[booking.id] || booking.bookingStatus)}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#B8AFA5]/20">
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedClass(null)}
                      className="border-[#B8AFA5]"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={saveAttendance}
                      disabled={saving}
                      className="bg-[#9BA899] hover:bg-[#8A9788] text-white"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? 'Saving...' : 'Save Attendance'}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          /* Class List View */
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="h-5 w-5 text-[#E8B4B8]" />
              <p className="text-sm text-[#7A736B]">Click on a past class to record attendance</p>
            </div>
            
            {classes.filter(c => isClassInPast(c.date, c.endTime) && c.status !== 'cancelled').length === 0 ? (
              <Card className="border-[#B8AFA5]/30">
                <CardContent className="py-12 text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-[#B8AFA5]" />
                  <p className="text-[#7A736B]">No past classes to mark attendance for</p>
                </CardContent>
              </Card>
            ) : (
              classes
                .filter(c => isClassInPast(c.date, c.endTime) && c.status !== 'cancelled')
                .map(cls => {
                  const attendedCount = cls.bookings.filter(b => b.bookingStatus === 'attended').length
                  const noShowCount = cls.bookings.filter(b => b.bookingStatus === 'no_show').length
                  const pendingCount = cls.bookings.filter(b => b.bookingStatus === 'confirmed').length
                  
                  return (
                    <Card 
                      key={cls.id}
                      className="border-[#B8AFA5]/30 hover:border-[#9BA899]/50 cursor-pointer transition-colors"
                      onClick={() => selectClass(cls)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="text-center min-w-[60px]">
                              <p className="text-lg font-semibold text-[#5A5550]">
                                {format(parseISO(cls.date), 'MMM d')}
                              </p>
                              <p className="text-sm text-[#7A736B]">{cls.startTime}</p>
                            </div>
                            <div>
                              <p className="font-medium text-[#5A5550]">{cls.classTypeName}</p>
                              <p className="text-sm text-[#7A736B]">with {cls.instructorName}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right text-sm">
                              <p className="text-[#5A5550]">{cls.bookings.length} bookings</p>
                              {pendingCount > 0 && (
                                <p className="text-amber-600">{pendingCount} pending</p>
                              )}
                              {attendedCount > 0 && (
                                <p className="text-green-600">{attendedCount} attended</p>
                              )}
                            </div>
                            {pendingCount > 0 ? (
                              <Badge variant="outline" className="border-amber-500 text-amber-600">
                                Needs Attendance
                              </Badge>
                            ) : cls.bookings.length > 0 ? (
                              <Badge className="bg-green-500 text-white">
                                <CheckCircle2 className="h-3 w-3 mr-1" /> Complete
                              </Badge>
                            ) : null}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
            )}
          </div>
        )}
      </div>
    </div>
  )
}
