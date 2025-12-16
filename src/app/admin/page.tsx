"use client"

import { useEffect, useState } from "react"
import { useSession, authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Calendar, Users, DollarSign, TrendingUp, Plus, Shield, LogOut, Settings, 
  BarChart3, Search, Clock, ChevronRight, User, ArrowUpRight, ArrowDownRight,
  CalendarDays, CreditCard, Package
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import Image from "next/image"
import { format, parseISO, isToday, isTomorrow, addDays } from "date-fns"

interface Stats {
  totalRevenue: number
  totalBookings: number
  activeStudents: number
  upcomingClasses: number
  todayClasses: number
  newStudentsThisWeek: number
  bookingsThisWeek: number
}

interface ClassPreview {
  id: number
  date: string
  startTime: string
  endTime: string
  classTypeName: string
  instructorName: string
  capacity: number
  registeredCount: number
  status: string
}

interface UserPreview {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
}

interface PackagePreview {
  id: number
  name: string
  credits: number
  price: number
}

// Skeleton Components
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

function ListItemSkeleton() {
  return (
    <div className="flex items-center justify-between p-3 border-b border-[#B8AFA5]/20 last:border-b-0">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-full bg-[#B8AFA5]/20" />
        <div>
          <Skeleton className="h-4 w-32 mb-1 bg-[#B8AFA5]/20" />
          <Skeleton className="h-3 w-24 bg-[#B8AFA5]/20" />
        </div>
      </div>
      <Skeleton className="h-6 w-16 rounded-full bg-[#B8AFA5]/20" />
    </div>
  )
}

export default function AdminDashboard() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    totalBookings: 0,
    activeStudents: 0,
    upcomingClasses: 0,
    todayClasses: 0,
    newStudentsThisWeek: 0,
    bookingsThisWeek: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<{users: UserPreview[], classes: ClassPreview[]}>({ users: [], classes: [] })
  const [showSearchResults, setShowSearchResults] = useState(false)
  
  // Preview data
  const [todayClasses, setTodayClasses] = useState<ClassPreview[]>([])
  const [upcomingClasses, setUpcomingClasses] = useState<ClassPreview[]>([])
  const [recentUsers, setRecentUsers] = useState<UserPreview[]>([])
  const [packages, setPackages] = useState<PackagePreview[]>([])

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login?redirect=/admin")
    }
  }, [session, isPending, router])

  useEffect(() => {
    if (session) {
      checkAdminRole()
      fetchAllData()
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

  const fetchAllData = async () => {
    try {
      const token = localStorage.getItem("bearer_token")
      const headers = { Authorization: `Bearer ${token}` }

      // Fetch all data with individual error handling
      const [revenueRes, classesRes, studentsRes, packagesRes, usersRes] = await Promise.all([
        fetch("/api/admin/reports/revenue", { headers }).catch(e => { console.error("Revenue fetch failed:", e); return null }),
        fetch("/api/classes?limit=100", { headers }).catch(e => { console.error("Classes fetch failed:", e); return null }),
        fetch("/api/user-profiles?role=student&limit=100", { headers }).catch(e => { console.error("Students fetch failed:", e); return null }),
        fetch("/api/packages", { headers }).catch(e => { console.error("Packages fetch failed:", e); return null }),
        fetch("/api/auth/users", { headers }).catch(e => { console.error("Users fetch failed:", e); return null })
      ])

      // Process revenue
      if (revenueRes?.ok) {
        const revenueData = await revenueRes.json()
        setStats(prev => ({ ...prev, totalRevenue: revenueData.totalRevenue || 0 }))
      }
      
      // Process classes
      if (classesRes?.ok) {
        const classesData = await classesRes.json()
        const now = new Date()
        const todayStr = format(now, 'yyyy-MM-dd')
        
        // Filter and enrich class data (API now returns flat classTypeName and instructorName)
        const enrichedClasses: ClassPreview[] = classesData.map((c: any) => ({
          id: c.id,
          date: c.date,
          startTime: c.startTime,
          endTime: c.endTime,
          classTypeName: c.classTypeName || c.classType?.name || 'Unknown Class',
          instructorName: c.instructorName || c.instructor?.name || 'TBD',
          capacity: c.capacity,
          registeredCount: c.registeredCount || 0,
          status: c.status
        }))
        
        const upcoming = enrichedClasses
          .filter(c => new Date(`${c.date}T${c.startTime}`) > now && c.status === 'scheduled')
          .sort((a, b) => new Date(`${a.date}T${a.startTime}`).getTime() - new Date(`${b.date}T${b.startTime}`).getTime())
        
        const todaysClasses = enrichedClasses.filter(c => c.date === todayStr && c.status === 'scheduled')
        
        setUpcomingClasses(upcoming.slice(0, 5))
        setTodayClasses(todaysClasses)
        setStats(prev => ({ 
          ...prev, 
          upcomingClasses: upcoming.length,
          todayClasses: todaysClasses.length
        }))
      }
      
      // Process students
      if (studentsRes?.ok) {
        const studentsData = await studentsRes.json()
        const studentCount = Array.isArray(studentsData) ? studentsData.length : 0
        
        // Calculate new students this week
        const weekAgo = addDays(new Date(), -7)
        const newThisWeek = Array.isArray(studentsData) 
          ? studentsData.filter((s: any) => new Date(s.createdAt) > weekAgo).length 
          : 0
        
        setStats(prev => ({ 
          ...prev, 
          activeStudents: studentCount,
          newStudentsThisWeek: newThisWeek
        }))
      }

      // Process users for recent list
      if (usersRes?.ok) {
        const usersData = await usersRes.json()
        const profilesRes = await fetch("/api/user-profiles?limit=100", { headers })
        let profiles: any[] = []
        if (profilesRes.ok) {
          profiles = await profilesRes.json()
        }
        
        const enrichedUsers: UserPreview[] = usersData
          .map((u: any) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: profiles.find((p: any) => p.userId === u.id)?.role || 'student',
            createdAt: u.createdAt
          }))
          .sort((a: UserPreview, b: UserPreview) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5)
        
        setRecentUsers(enrichedUsers)
      }
      
      // Process packages
      if (packagesRes?.ok) {
        const packagesData = await packagesRes.json()
        setPackages(packagesData.slice(0, 5))
      }
    } catch (error) {
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (term: string) => {
    setSearchTerm(term)
    if (term.length < 2) {
      setShowSearchResults(false)
      return
    }

    setShowSearchResults(true)
    // Filter from existing data for instant results
    const filteredUsers = recentUsers.filter(u => 
      u.name.toLowerCase().includes(term.toLowerCase()) ||
      u.email.toLowerCase().includes(term.toLowerCase())
    )
    const filteredClasses = upcomingClasses.filter(c =>
      c.classTypeName.toLowerCase().includes(term.toLowerCase()) ||
      c.instructorName.toLowerCase().includes(term.toLowerCase())
    )
    setSearchResults({ users: filteredUsers, classes: filteredClasses })
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

  const formatClassTime = (cls: ClassPreview) => {
    const classDate = parseISO(cls.date)
    if (isToday(classDate)) return `Today at ${cls.startTime}`
    if (isTomorrow(classDate)) return `Tomorrow at ${cls.startTime}`
    return `${format(classDate, 'EEE, MMM d')} at ${cls.startTime}`
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-[#E8B4B8] text-white text-xs rounded-full">Admin</Badge>
      case "instructor":
        return <Badge className="bg-[#9BA899] text-white text-xs rounded-full">Instructor</Badge>
      default:
        return <Badge variant="outline" className="border-[#B8AFA5] text-[#5A5550] text-xs rounded-full">Student</Badge>
    }
  }

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col">
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
          <Card className="border-[#B8AFA5]/30 bg-white mb-6">
            <CardHeader><Skeleton className="h-6 w-40 bg-[#B8AFA5]/20" /></CardHeader>
            <CardContent>
              <ListItemSkeleton />
              <ListItemSkeleton />
              <ListItemSkeleton />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col">
      {/* Header with Search */}
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
              <div className="min-w-0 hidden sm:block">
                <h1 className="font-serif text-lg md:text-xl text-[#5A5550] truncate">Admin Dashboard</h1>
                <p className="text-xs text-[#9BA899] truncate">Manage Swift Fit Pilates</p>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-4 relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#B8AFA5]" />
                <Input
                  placeholder="Search users, classes..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => searchTerm.length >= 2 && setShowSearchResults(true)}
                  onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                  className="pl-10 border-[#B8AFA5]/30 focus:border-[#9BA899] bg-[#FAF8F5] rounded-full"
                />
              </div>
              
              {/* Search Results Dropdown */}
              {showSearchResults && (searchResults.users.length > 0 || searchResults.classes.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg border border-[#B8AFA5]/30 shadow-lg z-50 max-h-80 overflow-y-auto">
                  {searchResults.users.length > 0 && (
                    <div className="p-2">
                      <p className="text-xs font-medium text-[#B8AFA5] px-2 mb-1">Users</p>
                      {searchResults.users.map(user => (
                        <button
                          key={user.id}
                          onClick={() => router.push('/admin/users')}
                          className="w-full flex items-center gap-2 p-2 hover:bg-[#FAF8F5] rounded-lg text-left"
                        >
                          <div className="h-8 w-8 rounded-full bg-[#9BA899]/20 flex items-center justify-center">
                            <User className="h-4 w-4 text-[#9BA899]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-[#5A5550] truncate">{user.name}</p>
                            <p className="text-xs text-[#B8AFA5] truncate">{user.email}</p>
                          </div>
                          {getRoleBadge(user.role)}
                        </button>
                      ))}
                    </div>
                  )}
                  {searchResults.classes.length > 0 && (
                    <div className="p-2 border-t border-[#B8AFA5]/20">
                      <p className="text-xs font-medium text-[#B8AFA5] px-2 mb-1">Classes</p>
                      {searchResults.classes.map(cls => (
                        <button
                          key={cls.id}
                          onClick={() => router.push('/admin/classes')}
                          className="w-full flex items-center gap-2 p-2 hover:bg-[#FAF8F5] rounded-lg text-left"
                        >
                          <div className="h-8 w-8 rounded-full bg-[#9BA899]/20 flex items-center justify-center">
                            <Calendar className="h-4 w-4 text-[#9BA899]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-[#5A5550] truncate">{cls.classTypeName}</p>
                            <p className="text-xs text-[#B8AFA5] truncate">{formatClassTime(cls)}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="hidden md:flex border-[#9BA899] text-[#9BA899] hover:bg-[#9BA899]/10 rounded-full" 
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
        {/* Stats - Clickable Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6">
          <Card 
            className="border-[#B8AFA5]/30 bg-white cursor-pointer hover:shadow-md hover:border-[#9BA899]/50 transition-all"
            onClick={() => router.push("/admin/users")}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-[#5A5550]">Active Students</CardTitle>
              <Users className="h-4 w-4 text-[#9BA899]" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-serif text-[#9BA899]">{stats.activeStudents}</div>
              <div className="flex items-center gap-1 mt-1">
                {stats.newStudentsThisWeek > 0 ? (
                  <>
                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-600">+{stats.newStudentsThisWeek} this week</span>
                  </>
                ) : (
                  <span className="text-xs text-[#B8AFA5]">Registered users</span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card 
            className="border-[#B8AFA5]/30 bg-white cursor-pointer hover:shadow-md hover:border-[#9BA899]/50 transition-all"
            onClick={() => router.push("/admin/classes")}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-[#5A5550]">Today's Classes</CardTitle>
              <CalendarDays className="h-4 w-4 text-[#9BA899]" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-serif text-[#9BA899]">{stats.todayClasses}</div>
              <span className="text-xs text-[#B8AFA5]">{stats.upcomingClasses} upcoming total</span>
            </CardContent>
          </Card>

          <Card 
            className="border-[#B8AFA5]/30 bg-white cursor-pointer hover:shadow-md hover:border-[#9BA899]/50 transition-all"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-[#5A5550]">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-[#9BA899]" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-serif text-[#9BA899]">${stats.totalRevenue.toFixed(0)}</div>
              <span className="text-xs text-[#B8AFA5]">All-time earnings</span>
            </CardContent>
          </Card>

          <Card 
            className="border-[#B8AFA5]/30 bg-white cursor-pointer hover:shadow-md hover:border-[#9BA899]/50 transition-all"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-[#5A5550]">Bookings</CardTitle>
              <TrendingUp className="h-4 w-4 text-[#9BA899]" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-serif text-[#9BA899]">{stats.totalBookings}</div>
              <span className="text-xs text-[#B8AFA5]">All-time</span>
            </CardContent>
          </Card>
        </div>

        {/* Today's Classes - Quick View */}
        {todayClasses.length > 0 && (
          <Card className="border-[#B8AFA5]/30 bg-white mb-6">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-[#E8B4B8]/20 flex items-center justify-center">
                    <CalendarDays className="h-4 w-4 text-[#E8B4B8]" />
                  </div>
                  <div>
                    <CardTitle className="font-serif font-normal text-[#5A5550] text-lg">Today's Schedule</CardTitle>
                    <CardDescription className="text-[#7A736B]">{format(new Date(), 'EEEE, MMMM d')}</CardDescription>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => router.push("/admin/classes")}
                  className="text-[#9BA899] hover:text-[#8A9788]"
                >
                  View All <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-[#B8AFA5]/20">
                {todayClasses.map(cls => (
                  <div key={cls.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="text-center min-w-[50px]">
                        <p className="text-lg font-semibold text-[#5A5550]">{cls.startTime}</p>
                      </div>
                      <div>
                        <p className="font-medium text-[#5A5550]">{cls.classTypeName}</p>
                        <p className="text-sm text-[#7A736B]">with {cls.instructorName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={`rounded-full ${
                          cls.registeredCount >= cls.capacity 
                            ? 'border-[#E8B4B8] text-[#E8B4B8]' 
                            : 'border-[#9BA899] text-[#9BA899]'
                        }`}
                      >
                        {cls.registeredCount}/{cls.capacity}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Tabs - Improved with Data Previews */}
        <Tabs defaultValue="classes" className="space-y-6">
          <TabsList className="w-full justify-start overflow-x-auto flex-nowrap bg-white border border-[#B8AFA5]/30 rounded-full p-1 gap-1">
            <TabsTrigger value="classes" className="text-xs md:text-sm whitespace-nowrap rounded-full data-[state=active]:bg-[#9BA899] data-[state=active]:text-white">
              <Calendar className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Classes</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="text-xs md:text-sm whitespace-nowrap rounded-full data-[state=active]:bg-[#9BA899] data-[state=active]:text-white">
              <Users className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="packages" className="text-xs md:text-sm whitespace-nowrap rounded-full data-[state=active]:bg-[#9BA899] data-[state=active]:text-white">
              <Package className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Packages</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="text-xs md:text-sm whitespace-nowrap rounded-full data-[state=active]:bg-[#9BA899] data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs md:text-sm whitespace-nowrap rounded-full data-[state=active]:bg-[#9BA899] data-[state=active]:text-white">
              <Settings className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Classes Tab - With Preview */}
          <TabsContent value="classes">
            <Card className="border-[#B8AFA5]/30 bg-white">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="font-serif font-normal text-[#5A5550]">Upcoming Classes</CardTitle>
                    <CardDescription className="text-[#7A736B]">Next {upcomingClasses.length} scheduled classes</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      onClick={() => router.push("/admin/classes")}
                      className="border-[#9BA899] text-[#9BA899] hover:bg-[#9BA899]/10 rounded-full"
                    >
                      View All
                    </Button>
                    <Button 
                      onClick={() => router.push("/admin/classes/create")}
                      className="bg-[#9BA899] hover:bg-[#8A9788] text-white rounded-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Class
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {upcomingClasses.length === 0 ? (
                  <div className="text-center py-8 text-[#B8AFA5]">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-[#7A736B]">No upcoming classes scheduled</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#B8AFA5]/20">
                    {upcomingClasses.map(cls => (
                      <div key={cls.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0 hover:bg-[#FAF8F5] -mx-4 px-4 cursor-pointer" onClick={() => router.push('/admin/classes')}>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-[#9BA899]/10 flex items-center justify-center">
                            <Clock className="h-5 w-5 text-[#9BA899]" />
                          </div>
                          <div>
                            <p className="font-medium text-[#5A5550]">{cls.classTypeName}</p>
                            <p className="text-sm text-[#7A736B]">{formatClassTime(cls)} • {cls.instructorName}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={`rounded-full ${
                              cls.registeredCount >= cls.capacity 
                                ? 'border-[#E8B4B8] text-[#E8B4B8]' 
                                : 'border-[#9BA899] text-[#9BA899]'
                            }`}
                          >
                            {cls.registeredCount}/{cls.capacity}
                          </Badge>
                          <ChevronRight className="h-4 w-4 text-[#B8AFA5]" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab - With Preview */}
          <TabsContent value="users">
            <Card className="border-[#B8AFA5]/30 bg-white">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="font-serif font-normal text-[#5A5550]">Recent Users</CardTitle>
                    <CardDescription className="text-[#7A736B]">Latest registered accounts</CardDescription>
                  </div>
                  <Button 
                    onClick={() => router.push("/admin/users")}
                    className="bg-[#9BA899] hover:bg-[#8A9788] text-white rounded-full"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Manage All Users
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {recentUsers.length === 0 ? (
                  <div className="text-center py-8 text-[#B8AFA5]">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-[#7A736B]">No users yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#B8AFA5]/20">
                    {recentUsers.map(user => (
                      <div key={user.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0 hover:bg-[#FAF8F5] -mx-4 px-4 cursor-pointer" onClick={() => router.push('/admin/users')}>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-[#9BA899]/20 flex items-center justify-center">
                            <span className="text-sm font-semibold text-[#9BA899]">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-[#5A5550]">{user.name}</p>
                            <p className="text-sm text-[#7A736B]">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getRoleBadge(user.role)}
                          <ChevronRight className="h-4 w-4 text-[#B8AFA5]" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Packages Tab - With Preview */}
          <TabsContent value="packages">
            <Card className="border-[#B8AFA5]/30 bg-white">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="font-serif font-normal text-[#5A5550]">Class Packages</CardTitle>
                    <CardDescription className="text-[#7A736B]">Available packages and memberships</CardDescription>
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
                {packages.length === 0 ? (
                  <div className="text-center py-8 text-[#B8AFA5]">
                    <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-[#7A736B] mb-4">No packages created yet</p>
                    <Button 
                      onClick={() => router.push("/admin/packages/create")}
                      variant="outline"
                      className="border-[#9BA899] text-[#9BA899] hover:bg-[#9BA899]/10 rounded-full"
                    >
                      Create Your First Package
                    </Button>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {packages.map(pkg => (
                      <Card key={pkg.id} className="border-[#B8AFA5]/30">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-[#5A5550]">{pkg.name}</h4>
                            <Badge className="bg-[#9BA899] text-white rounded-full">{pkg.credits} classes</Badge>
                          </div>
                          <p className="text-2xl font-serif text-[#9BA899]">${pkg.price}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-[#B8AFA5]/30 bg-white">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-[#9BA899]" />
                    <CardTitle className="font-serif font-normal text-[#5A5550]">Revenue Overview</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-serif text-[#9BA899] mb-2">${stats.totalRevenue.toFixed(2)}</div>
                  <p className="text-sm text-[#B8AFA5] mb-4">Total revenue all-time</p>
                  <div className="space-y-2 pt-4 border-t border-[#B8AFA5]/20">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#7A736B]">This month</span>
                      <span className="text-[#5A5550] font-medium">Coming soon</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#7A736B]">Last month</span>
                      <span className="text-[#5A5550] font-medium">Coming soon</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#B8AFA5]/30 bg-white">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-[#9BA899]" />
                    <CardTitle className="font-serif font-normal text-[#5A5550]">Attendance Stats</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-serif text-[#9BA899] mb-2">{stats.totalBookings}</div>
                  <p className="text-sm text-[#B8AFA5] mb-4">Total class bookings</p>
                  <div className="space-y-2 pt-4 border-t border-[#B8AFA5]/20">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#7A736B]">Classes this week</span>
                      <span className="text-[#5A5550] font-medium">{stats.upcomingClasses}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#7A736B]">Avg. attendance</span>
                      <span className="text-[#5A5550] font-medium">Coming soon</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#B8AFA5]/30 bg-white">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-[#9BA899]" />
                    <CardTitle className="font-serif font-normal text-[#5A5550]">Student Growth</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-serif text-[#9BA899] mb-2">{stats.activeStudents}</div>
                  <p className="text-sm text-[#B8AFA5] mb-4">Total registered students</p>
                  <div className="space-y-2 pt-4 border-t border-[#B8AFA5]/20">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#7A736B]">New this week</span>
                      <span className="text-green-600 font-medium flex items-center gap-1">
                        <ArrowUpRight className="h-3 w-3" />
                        {stats.newStudentsThisWeek}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#B8AFA5]/30 bg-white">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-[#9BA899]" />
                    <CardTitle className="font-serif font-normal text-[#5A5550]">Popular Classes</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[#B8AFA5]">Analytics coming soon</p>
                  <p className="text-xs text-[#B8AFA5] mt-2">Track which class types are most popular with your students</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
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
                  <div className="p-4 border border-[#B8AFA5]/30 rounded-lg bg-[#FAF8F5] hover:border-[#9BA899]/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium mb-1 text-[#5A5550]">Studio Information</h4>
                        <p className="text-sm text-[#7A736B]">Update studio name, address, contact info</p>
                      </div>
                      <Button variant="outline" className="border-[#9BA899] text-[#9BA899] hover:bg-[#9BA899]/10 rounded-full" size="sm">Edit</Button>
                    </div>
                  </div>

                  <div className="p-4 border border-[#B8AFA5]/30 rounded-lg bg-[#FAF8F5] hover:border-[#9BA899]/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium mb-1 text-[#5A5550]">Cancellation Policy</h4>
                        <p className="text-sm text-[#7A736B]">Set cancellation window and credit return policy</p>
                      </div>
                      <Button variant="outline" className="border-[#9BA899] text-[#9BA899] hover:bg-[#9BA899]/10 rounded-full" size="sm">Edit</Button>
                    </div>
                  </div>

                  <div className="p-4 border border-[#B8AFA5]/30 rounded-lg bg-[#FAF8F5] hover:border-[#9BA899]/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium mb-1 text-[#5A5550]">Payment Integration</h4>
                        <p className="text-sm text-[#7A736B]">Configure Square payment processing</p>
                      </div>
                      <Button variant="outline" className="border-[#9BA899] text-[#9BA899] hover:bg-[#9BA899]/10 rounded-full" size="sm">Configure</Button>
                    </div>
                  </div>

                  <div className="p-4 border border-[#B8AFA5]/30 rounded-lg bg-[#FAF8F5] hover:border-[#9BA899]/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium mb-1 text-[#5A5550]">Email Notifications</h4>
                        <p className="text-sm text-[#7A736B]">Booking confirmations, reminders, and marketing</p>
                      </div>
                      <Button variant="outline" className="border-[#9BA899] text-[#9BA899] hover:bg-[#9BA899]/10 rounded-full" size="sm">Configure</Button>
                    </div>
                  </div>

                  <div className="p-4 border border-[#B8AFA5]/30 rounded-lg bg-[#FAF8F5] hover:border-[#9BA899]/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium mb-1 text-[#5A5550]">Instructor Management</h4>
                        <p className="text-sm text-[#7A736B]">Manage instructor profiles and schedules</p>
                      </div>
                      <Button 
                        variant="outline" 
                        className="border-[#9BA899] text-[#9BA899] hover:bg-[#9BA899]/10 rounded-full" 
                        size="sm"
                        onClick={() => router.push("/admin/instructors")}
                      >
                        Manage
                      </Button>
                    </div>
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
