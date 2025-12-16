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
  ArrowLeft, Users, Calendar, TrendingUp, Award, 
  BarChart3, UserCheck, UserX, CreditCard
} from "lucide-react"
import { toast } from "sonner"
import { format, subDays } from "date-fns"
import Link from "next/link"
import Image from "next/image"

interface InstructorStats {
  instructorId: number
  instructorName: string
  instructorEmail: string
  headshotUrl: string | null
  totalClasses: number
  totalBookings: number
  totalAttended: number
  totalNoShows: number
  totalConfirmed: number
  attendanceRate: number
  totalCreditsUsed: number
  avgBookingsPerClass: number
}

interface ReportData {
  instructors: InstructorStats[]
  totals: {
    totalInstructors: number
    totalClasses: number
    totalBookings: number
    totalAttended: number
    totalNoShows: number
    totalCreditsUsed: number
    overallAttendanceRate: number
  }
  dateRange: {
    startDate: string
    endDate: string
  }
}

export default function InstructorReportPage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login?redirect=/admin/reports/instructors")
    }
  }, [session, isPending, router])

  useEffect(() => {
    if (session) {
      checkRole()
      fetchReport()
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
        if (data.role !== "admin") {
          toast.error("Access denied. Admin only.")
          router.push("/pilates")
        }
      }
    } catch (error) {
      console.error("Failed to check role")
    }
  }

  const fetchReport = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("bearer_token")
      const res = await fetch(
        `/api/admin/reports/instructor-revenue?startDate=${startDate}&endDate=${endDate}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      if (res.ok) {
        const data = await res.json()
        setReportData(data)
      } else {
        toast.error("Failed to load report")
      }
    } catch (error) {
      toast.error("Failed to load report")
    } finally {
      setLoading(false)
    }
  }

  const handleDateChange = () => {
    fetchReport()
  }

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] p-8">
        <Skeleton className="h-8 w-64 mb-8 bg-[#B8AFA5]/20" />
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 bg-[#B8AFA5]/20" />)}
        </div>
        <Skeleton className="h-64 bg-[#B8AFA5]/20" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Header */}
      <header className="bg-white border-b border-[#B8AFA5]/30 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="ghost" size="icon" className="text-[#5A5550]">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-serif text-[#5A5550]">Instructor Performance Report</h1>
                <p className="text-sm text-[#7A736B]">Track bookings and attendance by instructor</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Date Range Filter */}
        <Card className="border-[#B8AFA5]/30 mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm text-[#5A5550]">From:</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-auto border-[#B8AFA5]/30"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-[#5A5550]">To:</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-auto border-[#B8AFA5]/30"
                />
              </div>
              <Button 
                onClick={handleDateChange}
                className="bg-[#9BA899] hover:bg-[#8A9788] text-white"
              >
                Update Report
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        {reportData && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="border-[#B8AFA5]/30">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-[#9BA899]/20 rounded-full">
                  <Users className="h-5 w-5 text-[#9BA899]" />
                </div>
                <div>
                  <p className="text-2xl font-serif text-[#9BA899]">{reportData.totals.totalInstructors}</p>
                  <p className="text-xs text-[#7A736B]">Active Instructors</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#B8AFA5]/30">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-[#9BA899]/20 rounded-full">
                  <Calendar className="h-5 w-5 text-[#9BA899]" />
                </div>
                <div>
                  <p className="text-2xl font-serif text-[#9BA899]">{reportData.totals.totalClasses}</p>
                  <p className="text-xs text-[#7A736B]">Total Classes</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#B8AFA5]/30">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-[#9BA899]/20 rounded-full">
                  <TrendingUp className="h-5 w-5 text-[#9BA899]" />
                </div>
                <div>
                  <p className="text-2xl font-serif text-[#9BA899]">{reportData.totals.totalBookings}</p>
                  <p className="text-xs text-[#7A736B]">Total Bookings</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#B8AFA5]/30">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <UserCheck className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-serif text-green-600">{reportData.totals.overallAttendanceRate}%</p>
                  <p className="text-xs text-[#7A736B]">Attendance Rate</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Instructor Table */}
        <Card className="border-[#B8AFA5]/30">
          <CardHeader>
            <CardTitle className="font-serif font-normal text-[#5A5550]">Instructor Breakdown</CardTitle>
            <CardDescription>Performance metrics by instructor</CardDescription>
          </CardHeader>
          <CardContent>
            {!reportData || reportData.instructors.length === 0 ? (
              <div className="text-center py-12 text-[#7A736B]">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No data for selected date range</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#B8AFA5]/20">
                      <th className="text-left py-3 px-4 text-sm font-medium text-[#5A5550]">Instructor</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-[#5A5550]">Classes</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-[#5A5550]">Bookings</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-[#5A5550]">Avg/Class</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-[#5A5550]">Attended</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-[#5A5550]">No Shows</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-[#5A5550]">Attendance %</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-[#5A5550]">Credits</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.instructors.map((instructor, idx) => (
                      <tr 
                        key={instructor.instructorId}
                        className={`border-b border-[#B8AFA5]/10 hover:bg-[#FAF8F5] ${idx === 0 ? 'bg-[#9BA899]/5' : ''}`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {instructor.headshotUrl ? (
                              <Image
                                src={instructor.headshotUrl}
                                alt={instructor.instructorName}
                                width={40}
                                height={40}
                                className="rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-[#9BA899]/20 flex items-center justify-center">
                                <span className="text-sm font-medium text-[#9BA899]">
                                  {instructor.instructorName.charAt(0)}
                                </span>
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-[#5A5550] flex items-center gap-2">
                                {instructor.instructorName}
                                {idx === 0 && (
                                  <Award className="h-4 w-4 text-amber-500" />
                                )}
                              </p>
                              <p className="text-xs text-[#7A736B]">{instructor.instructorEmail}</p>
                            </div>
                          </div>
                        </td>
                        <td className="text-center py-3 px-4 text-[#5A5550]">{instructor.totalClasses}</td>
                        <td className="text-center py-3 px-4">
                          <span className="font-medium text-[#9BA899]">{instructor.totalBookings}</span>
                        </td>
                        <td className="text-center py-3 px-4 text-[#5A5550]">{instructor.avgBookingsPerClass}</td>
                        <td className="text-center py-3 px-4">
                          <span className="text-green-600">{instructor.totalAttended}</span>
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className="text-red-500">{instructor.totalNoShows}</span>
                        </td>
                        <td className="text-center py-3 px-4">
                          <Badge 
                            className={
                              instructor.attendanceRate >= 90 ? 'bg-green-500 text-white' :
                              instructor.attendanceRate >= 70 ? 'bg-amber-500 text-white' :
                              'bg-red-500 text-white'
                            }
                          >
                            {instructor.attendanceRate}%
                          </Badge>
                        </td>
                        <td className="text-center py-3 px-4 text-[#5A5550]">{instructor.totalCreditsUsed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
