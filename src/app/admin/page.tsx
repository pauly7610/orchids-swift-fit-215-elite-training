"use client"

import { useEffect, useState } from "react"
import { useSession } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Users, DollarSign, TrendingUp, Plus, Shield } from "lucide-react"
import { toast } from "sonner"

interface Stats {
  totalRevenue: number
  totalBookings: number
  activeStudents: number
  upcomingClasses: number
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
        fetch("/api/students", { headers })
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
        setStats(prev => ({ ...prev, activeStudents: studentsData.length }))
      }
    } catch (error) {
      toast.error("Failed to load stats")
    } finally {
      setLoading(false)
    }
  }

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
              <h1 className="font-display text-3xl text-primary">ADMIN DASHBOARD</h1>
              <p className="text-sm text-muted-foreground">Manage your Pilates studio</p>
            </div>
            <Button variant="outline" onClick={() => router.push("/pilates")}>
              Back to Pilates
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">All-time earnings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeStudents}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Classes</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingClasses}</div>
              <p className="text-xs text-muted-foreground">Scheduled sessions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBookings}</div>
              <p className="text-xs text-muted-foreground">All-time</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="classes" className="space-y-6">
          <TabsList>
            <TabsTrigger value="classes">Classes</TabsTrigger>
            <TabsTrigger value="instructors">Instructors</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="packages">Packages</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Classes Management */}
          <TabsContent value="classes">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Class Management</CardTitle>
                    <CardDescription>Create and manage Pilates classes</CardDescription>
                  </div>
                  <Button onClick={() => router.push("/admin/classes/create")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Class
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="mb-4">Class management interface</p>
                  <Button onClick={() => router.push("/admin/classes/create")}>
                    Create Your First Class
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Instructors Management */}
          <TabsContent value="instructors">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Instructor Management</CardTitle>
                    <CardDescription>Manage instructor profiles and availability</CardDescription>
                  </div>
                  <Button onClick={() => router.push("/admin/instructors/create")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Instructor
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="mb-4">Instructor management interface</p>
                  <Button onClick={() => router.push("/admin/instructors/create")}>
                    Add Your First Instructor
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Students Management */}
          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle>Student Management</CardTitle>
                <CardDescription>View and manage student accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Student list will appear here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Management */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>User Role Management</CardTitle>
                    <CardDescription>Manage user roles and permissions (Admin, Instructor, Student)</CardDescription>
                  </div>
                  <Button onClick={() => router.push("/admin/users")}>
                    <Shield className="h-4 w-4 mr-2" />
                    Manage Users
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="mb-4">Control who can access instructor and admin features</p>
                  <Button onClick={() => router.push("/admin/users")}>
                    Open User Management
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Packages Management */}
          <TabsContent value="packages">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Packages & Pricing</CardTitle>
                    <CardDescription>Manage class packages and memberships</CardDescription>
                  </div>
                  <Button onClick={() => router.push("/admin/packages/create")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Package
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="mb-4">Package management interface</p>
                  <Button onClick={() => router.push("/admin/packages/create")}>
                    Create Your First Package
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports */}
          <TabsContent value="reports">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Report</CardTitle>
                  <CardDescription>View earnings and payment history</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">${stats.totalRevenue.toFixed(2)}</div>
                  <p className="text-sm text-muted-foreground">Total revenue all-time</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Attendance Report</CardTitle>
                  <CardDescription>Class attendance statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">{stats.totalBookings}</div>
                  <p className="text-sm text-muted-foreground">Total class bookings</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Popular Classes</CardTitle>
                  <CardDescription>Most booked class types</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Analytics coming soon</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Student Growth</CardTitle>
                  <CardDescription>New registrations over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">{stats.activeStudents}</div>
                  <p className="text-sm text-muted-foreground">Active students</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Studio Settings</CardTitle>
                <CardDescription>Configure studio information and policies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Studio Information</h4>
                    <p className="text-sm text-muted-foreground">Update studio name, address, contact info</p>
                    <Button variant="outline" className="mt-3" size="sm">Edit Info</Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Cancellation Policy</h4>
                    <p className="text-sm text-muted-foreground">Set cancellation window and penalties</p>
                    <Button variant="outline" className="mt-3" size="sm">Edit Policy</Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Payment Settings</h4>
                    <p className="text-sm text-muted-foreground">Configure Square integration</p>
                    <Button variant="outline" className="mt-3" size="sm">Configure</Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Notification Settings</h4>
                    <p className="text-sm text-muted-foreground">Email and SMS notification preferences</p>
                    <Button variant="outline" className="mt-3" size="sm">Configure</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}