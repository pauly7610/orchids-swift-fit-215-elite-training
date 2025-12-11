"use client"

import { useEffect, useState } from "react"
import { useSession, authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, Users, DollarSign, TrendingUp, Plus, Shield, LogOut, Settings, BarChart3 } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import Image from "next/image"

interface Stats {
  totalRevenue: number
  totalBookings: number
  activeStudents: number
  upcomingClasses: number
}

// Skeleton Component
function StatCardSkeleton() {
  return (
    <Card className="border-[#B8AFA5]/30 bg-white">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-24 bg-[#B8AFA5]/20" />
        <Skeleton className="h-4 w-4 rounded bg-[#B8AFA5]/20" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-1 bg-[#B8AFA5]/20" />
        <Skeleton className="h-3 w-20 bg-[#B8AFA5]/20" />
      </CardContent>
    </Card>
  )
}

export default function AdminDashboard() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    totalBookings: 0,
    activeStudents: 0,
    upcomingClasses: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login?redirect=/admin")
    }
  }, [session, isPending, router])

  useEffect(() => {
    if (session) {
      checkAdminRole()
      fetchStats()
    }
  }, [session])

  const checkAdminRole = async () => {
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

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("bearer_token")
      const headers = { Authorization: `Bearer ${token}` }

      const [revenueRes, classesRes, studentsRes] = await Promise.all([
        fetch("/api/admin/reports/revenue", { headers }),
        fetch("/api/classes", { headers }),
        fetch("/api/user-profiles?role=student", { headers })
      ])

      if (revenueRes.ok) {
        const revenueData = await revenueRes.json()
        setStats(prev => ({ ...prev, totalRevenue: revenueData.totalRevenue || 0 }))
      }
      
      if (classesRes.ok) {
        const classesData = await classesRes.json()
        const upcoming = classesData.filter((c: any) => new Date(`${c.date}T${c.startTime}`) > new Date())
        setStats(prev => ({ ...prev, upcomingClasses: upcoming.length }))
      }
      
      if (studentsRes.ok) {
        const studentsData = await studentsRes.json()
        setStats(prev => ({ ...prev, activeStudents: Array.isArray(studentsData) ? studentsData.length : 0 }))
      }
    } catch (error) {
      toast.error("Failed to load stats")
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

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col">
        {/* Header Skeleton */}
        <header className="border-b border-[#B8AFA5]/20 bg-white sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3 md:py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full bg-[#B8AFA5]/20" />
                <div>
                  <Skeleton className="h-5 w-36 mb-1 bg-[#B8AFA5]/20" />
                  <Skeleton className="h-3 w-24 bg-[#B8AFA5]/20" />
                </div>
              </div>
              <Skeleton className="h-9 w-24 rounded-full bg-[#B8AFA5]/20" />
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-4 md:py-8 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
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
                <h1 className="font-serif text-lg md:text-xl text-[#5A5550] truncate">Admin Dashboard</h1>
                <p className="text-xs text-[#9BA899] truncate">Manage Swift Fit Pilates</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="hidden sm:flex border-[#9BA899] text-[#9BA899] hover:bg-[#9BA899]/10 rounded-full" 
                onClick={() => router.push("/pilates")}
              >
                View Site
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <Card className="border-[#B8AFA5]/30 bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[#5A5550]">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-[#9BA899]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-serif text-[#9BA899]">${stats.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-[#B8AFA5]">All-time earnings</p>
            </CardContent>
          </Card>

          <Card className="border-[#B8AFA5]/30 bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[#5A5550]">Active Students</CardTitle>
              <Users className="h-4 w-4 text-[#9BA899]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-serif text-[#9BA899]">{stats.activeStudents}</div>
              <p className="text-xs text-[#B8AFA5]">Registered users</p>
            </CardContent>
          </Card>

          <Card className="border-[#B8AFA5]/30 bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[#5A5550]">Upcoming Classes</CardTitle>
              <Calendar className="h-4 w-4 text-[#9BA899]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-serif text-[#9BA899]">{stats.upcomingClasses}</div>
              <p className="text-xs text-[#B8AFA5]">Scheduled sessions</p>
            </CardContent>
          </Card>

          <Card className="border-[#B8AFA5]/30 bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[#5A5550]">Total Bookings</CardTitle>
              <TrendingUp className="h-4 w-4 text-[#9BA899]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-serif text-[#9BA899]">{stats.totalBookings}</div>
              <p className="text-xs text-[#B8AFA5]">All-time</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="classes" className="space-y-6">
          <TabsList className="w-full justify-start overflow-x-auto flex-nowrap bg-white border border-[#B8AFA5]/30 rounded-full p-1">
            <TabsTrigger value="classes" className="text-xs md:text-sm whitespace-nowrap rounded-full data-[state=active]:bg-[#9BA899] data-[state=active]:text-white">Classes</TabsTrigger>
            <TabsTrigger value="instructors" className="text-xs md:text-sm whitespace-nowrap rounded-full data-[state=active]:bg-[#9BA899] data-[state=active]:text-white">Instructors</TabsTrigger>
            <TabsTrigger value="users" className="text-xs md:text-sm whitespace-nowrap rounded-full data-[state=active]:bg-[#9BA899] data-[state=active]:text-white">Users</TabsTrigger>
            <TabsTrigger value="packages" className="text-xs md:text-sm whitespace-nowrap rounded-full data-[state=active]:bg-[#9BA899] data-[state=active]:text-white">Packages</TabsTrigger>
            <TabsTrigger value="reports" className="text-xs md:text-sm whitespace-nowrap rounded-full data-[state=active]:bg-[#9BA899] data-[state=active]:text-white">Reports</TabsTrigger>
            <TabsTrigger value="settings" className="text-xs md:text-sm whitespace-nowrap rounded-full data-[state=active]:bg-[#9BA899] data-[state=active]:text-white">Settings</TabsTrigger>
          </TabsList>

          {/* Classes Management */}
          <TabsContent value="classes">
            <Card className="border-[#B8AFA5]/30 bg-white">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="font-serif font-normal text-[#5A5550]">Class Management</CardTitle>
                    <CardDescription className="text-[#7A736B]">Create and manage class schedule</CardDescription>
                  </div>
                  <Button 
                    onClick={() => router.push("/admin/classes")}
                    className="bg-[#9BA899] hover:bg-[#8A9788] text-white rounded-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Manage Classes
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-[#B8AFA5]">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="mb-4 text-[#7A736B]">View and manage all scheduled classes</p>
                  <Button 
                    onClick={() => router.push("/admin/classes")}
                    variant="outline"
                    className="border-[#9BA899] text-[#9BA899] hover:bg-[#9BA899]/10 rounded-full"
                  >
                    Open Schedule Manager
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Instructors Management */}
          <TabsContent value="instructors">
            <Card className="border-[#B8AFA5]/30 bg-white">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="font-serif font-normal text-[#5A5550]">Instructor Management</CardTitle>
                    <CardDescription className="text-[#7A736B]">Manage instructor profiles and availability</CardDescription>
                  </div>
                  <Button 
                    onClick={() => router.push("/admin/instructors")}
                    className="bg-[#9BA899] hover:bg-[#8A9788] text-white rounded-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Manage Instructors
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-[#B8AFA5]">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="mb-4 text-[#7A736B]">Add and manage teaching staff</p>
                  <Button 
                    onClick={() => router.push("/admin/instructors")}
                    variant="outline"
                    className="border-[#9BA899] text-[#9BA899] hover:bg-[#9BA899]/10 rounded-full"
                  >
                    Open Instructor Manager
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Management */}
          <TabsContent value="users">
            <Card className="border-[#B8AFA5]/30 bg-white">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="font-serif font-normal text-[#5A5550]">User Role Management</CardTitle>
                    <CardDescription className="text-[#7A736B]">Manage user roles and permissions (Admin, Instructor, Student)</CardDescription>
                  </div>
                  <Button 
                    onClick={() => router.push("/admin/users")}
                    className="bg-[#9BA899] hover:bg-[#8A9788] text-white rounded-full"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Manage Users
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-[#B8AFA5]">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="mb-4 text-[#7A736B]">Control who can access instructor and admin features</p>
                  <Button 
                    onClick={() => router.push("/admin/users")}
                    variant="outline"
                    className="border-[#9BA899] text-[#9BA899] hover:bg-[#9BA899]/10 rounded-full"
                  >
                    Open User Management
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Packages Management */}
          <TabsContent value="packages">
            <Card className="border-[#B8AFA5]/30 bg-white">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="font-serif font-normal text-[#5A5550]">Packages & Pricing</CardTitle>
                    <CardDescription className="text-[#7A736B]">Manage class packages and memberships</CardDescription>
                  </div>
                  <Button 
                    onClick={() => router.push("/admin/packages/create")}
                    className="bg-[#9BA899] hover:bg-[#8A9788] text-white rounded-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Package
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-[#B8AFA5]">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="mb-4 text-[#7A736B]">Define class credit packages and membership options</p>
                  <Button 
                    onClick={() => router.push("/admin/packages/create")}
                    variant="outline"
                    className="border-[#9BA899] text-[#9BA899] hover:bg-[#9BA899]/10 rounded-full"
                  >
                    Create Your First Package
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports */}
          <TabsContent value="reports">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-[#B8AFA5]/30 bg-white">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-[#9BA899]" />
                    <CardTitle className="font-serif font-normal text-[#5A5550]">Revenue Report</CardTitle>
                  </div>
                  <CardDescription className="text-[#7A736B]">View earnings and payment history</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-serif text-[#9BA899] mb-2">${stats.totalRevenue.toFixed(2)}</div>
                  <p className="text-sm text-[#B8AFA5]">Total revenue all-time</p>
                </CardContent>
              </Card>

              <Card className="border-[#B8AFA5]/30 bg-white">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-[#9BA899]" />
                    <CardTitle className="font-serif font-normal text-[#5A5550]">Attendance Report</CardTitle>
                  </div>
                  <CardDescription className="text-[#7A736B]">Class attendance statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-serif text-[#9BA899] mb-2">{stats.totalBookings}</div>
                  <p className="text-sm text-[#B8AFA5]">Total class bookings</p>
                </CardContent>
              </Card>

              <Card className="border-[#B8AFA5]/30 bg-white">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-[#9BA899]" />
                    <CardTitle className="font-serif font-normal text-[#5A5550]">Popular Classes</CardTitle>
                  </div>
                  <CardDescription className="text-[#7A736B]">Most booked class types</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[#B8AFA5]">Analytics coming soon</p>
                </CardContent>
              </Card>

              <Card className="border-[#B8AFA5]/30 bg-white">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-[#9BA899]" />
                    <CardTitle className="font-serif font-normal text-[#5A5550]">Student Growth</CardTitle>
                  </div>
                  <CardDescription className="text-[#7A736B]">New registrations over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-serif text-[#9BA899] mb-2">{stats.activeStudents}</div>
                  <p className="text-sm text-[#B8AFA5]">Active students</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings">
            <Card className="border-[#B8AFA5]/30 bg-white">
              <CardHeader>
                <CardTitle className="font-serif font-normal text-[#5A5550] flex items-center gap-2">
                  <Settings className="h-5 w-5 text-[#9BA899]" />
                  Studio Settings
                </CardTitle>
                <CardDescription className="text-[#7A736B]">Configure studio information and policies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="p-4 border border-[#B8AFA5]/30 rounded-lg bg-[#FAF8F5]">
                    <h4 className="font-medium mb-2 text-[#5A5550]">Studio Information</h4>
                    <p className="text-sm text-[#7A736B]">Update studio name, address, contact info</p>
                    <Button variant="outline" className="mt-3 border-[#9BA899] text-[#9BA899] hover:bg-[#9BA899]/10 rounded-full" size="sm">Edit Info</Button>
                  </div>

                  <div className="p-4 border border-[#B8AFA5]/30 rounded-lg bg-[#FAF8F5]">
                    <h4 className="font-medium mb-2 text-[#5A5550]">Cancellation Policy</h4>
                    <p className="text-sm text-[#7A736B]">Set cancellation window and penalties</p>
                    <Button variant="outline" className="mt-3 border-[#9BA899] text-[#9BA899] hover:bg-[#9BA899]/10 rounded-full" size="sm">Edit Policy</Button>
                  </div>

                  <div className="p-4 border border-[#B8AFA5]/30 rounded-lg bg-[#FAF8F5]">
                    <h4 className="font-medium mb-2 text-[#5A5550]">Payment Settings</h4>
                    <p className="text-sm text-[#7A736B]">Configure Square integration</p>
                    <Button variant="outline" className="mt-3 border-[#9BA899] text-[#9BA899] hover:bg-[#9BA899]/10 rounded-full" size="sm">Configure</Button>
                  </div>

                  <div className="p-4 border border-[#B8AFA5]/30 rounded-lg bg-[#FAF8F5]">
                    <h4 className="font-medium mb-2 text-[#5A5550]">Notification Settings</h4>
                    <p className="text-sm text-[#7A736B]">Email and SMS notification preferences</p>
                    <Button variant="outline" className="mt-3 border-[#9BA899] text-[#9BA899] hover:bg-[#9BA899]/10 rounded-full" size="sm">Configure</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#B8AFA5]/20 bg-white py-4 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-[#7A736B]">
          © 2025 Swift Fit Pilates & Wellness Studio — Admin Panel
        </div>
      </footer>
    </div>
  )
}
