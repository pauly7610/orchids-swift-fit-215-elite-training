"use client"

import { useEffect, useState } from "react"
import { useSession } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Mail, Calendar, Shield, ArrowLeft, Search, CheckCircle, XCircle, Copy, Download, Plus, CreditCard } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { format, parseISO } from "date-fns"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import Image from "next/image"

interface UserWithProfile {
  id: string
  name: string
  email: string
  createdAt: string
  emailVerified: boolean
  profile?: {
    id: number
    role: string
    phone: string | null
  }
  creditsRemaining?: number
  hasUnlimitedMembership?: boolean
}

// Skeleton Component
function UserCardSkeleton() {
  return (
    <Card className="border-[#B8AFA5]/30">
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <Skeleton className="h-12 w-12 rounded-full bg-[#B8AFA5]/20" />
            <div className="flex-1">
              <Skeleton className="h-5 w-32 mb-2 bg-[#B8AFA5]/20" />
              <Skeleton className="h-4 w-48 mb-1 bg-[#B8AFA5]/20" />
              <Skeleton className="h-4 w-24 bg-[#B8AFA5]/20" />
            </div>
          </div>
          <Skeleton className="h-9 w-32 bg-[#B8AFA5]/20" />
        </div>
      </CardContent>
    </Card>
  )
}

export default function UsersManagementPage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<UserWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingRole, setUpdatingRole] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [addCreditsUser, setAddCreditsUser] = useState<UserWithProfile | null>(null)
  const [creditsToAdd, setCreditsToAdd] = useState("5")
  const [addingCredits, setAddingCredits] = useState(false)

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login?redirect=/admin/users")
    }
  }, [session, isPending, router])

  useEffect(() => {
    if (session) {
      checkAdminRole()
      fetchUsers()
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

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("bearer_token")
      
      // Fetch all users from auth
      const usersRes = await fetch("/api/auth/users", {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      // Fetch all profiles
      const profilesRes = await fetch("/api/user-profiles?limit=500", {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      // Fetch all student purchases to get credit balances
      const purchasesRes = await fetch("/api/student-purchases?limit=500", {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (usersRes.ok && profilesRes.ok) {
        const usersData = await usersRes.json()
        const profilesData = await profilesRes.json()
        const purchasesData = purchasesRes.ok ? await purchasesRes.json() : []
        
        // Calculate credits per student profile
        const creditsByProfile = new Map<number, { credits: number, unlimited: boolean }>()
        if (Array.isArray(purchasesData)) {
          purchasesData.forEach((purchase: any) => {
            if (purchase.isActive) {
              const current = creditsByProfile.get(purchase.studentProfileId) || { credits: 0, unlimited: false }
              // Check for unlimited membership
              if (purchase.creditsRemaining === null && purchase.purchaseType === 'membership') {
                current.unlimited = true
              } else if (purchase.creditsRemaining) {
                current.credits += purchase.creditsRemaining
              }
              creditsByProfile.set(purchase.studentProfileId, current)
            }
          })
        }
        
        // Merge users with their profiles and credits
        const merged = usersData.map((user: any) => {
          const profile = Array.isArray(profilesData) 
            ? profilesData.find((p: any) => p.userId === user.id)
            : undefined
          const creditInfo = profile ? creditsByProfile.get(profile.id) : undefined
          return {
            ...user,
            profile,
            creditsRemaining: creditInfo?.credits || 0,
            hasUnlimitedMembership: creditInfo?.unlimited || false
          }
        })
        
        setUsers(merged)
      } else if (!usersRes.ok) {
        const error = await usersRes.json()
        toast.error(error.error || "Failed to load users")
      }
    } catch (error) {
      toast.error("Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, profileId: number, newRole: string) => {
    setUpdatingRole(userId)
    
    try {
      const token = localStorage.getItem("bearer_token")
      const res = await fetch(`/api/user-profiles?id=${profileId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      })

      if (res.ok) {
        toast.success(`Role updated to ${newRole}`)
        fetchUsers()
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to update role")
      }
    } catch (error) {
      toast.error("Failed to update role")
    } finally {
      setUpdatingRole(null)
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-[#E8B4B8] text-white rounded-full">Admin</Badge>
      case "instructor":
        return <Badge className="bg-[#9BA899] text-white rounded-full">Instructor</Badge>
      case "student":
      default:
        return <Badge variant="outline" className="border-[#B8AFA5] text-[#5A5550] rounded-full">Student</Badge>
    }
  }

  const filteredUsers = users.filter(user => {
    const search = searchTerm.toLowerCase()
    return user.name.toLowerCase().includes(search) || 
           user.email.toLowerCase().includes(search) ||
           (user.profile?.role || "").toLowerCase().includes(search)
  })

  // Get student emails for export (comma-separated for Gmail)
  const getStudentEmails = () => {
    return users
      .filter(u => u.profile?.role === "student")
      .map(u => u.email)
      .join(", ")
  }

  const copyStudentEmails = async () => {
    const emails = getStudentEmails()
    if (!emails) {
      toast.error("No student emails to copy")
      return
    }
    
    try {
      await navigator.clipboard.writeText(emails)
      const count = users.filter(u => u.profile?.role === "student").length
      toast.success(`Copied ${count} student emails to clipboard`)
    } catch (error) {
      toast.error("Failed to copy to clipboard")
    }
  }

  const handleAddCredits = async () => {
    if (!addCreditsUser?.profile?.id) return
    
    setAddingCredits(true)
    try {
      const token = localStorage.getItem("bearer_token")
      const res = await fetch("/api/admin/add-credits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          studentProfileId: addCreditsUser.profile.id,
          credits: parseInt(creditsToAdd),
          expirationDays: 365,
          notes: `Admin added ${creditsToAdd} credits`
        })
      })

      const data = await res.json()
      
      if (res.ok) {
        toast.success(`Added ${creditsToAdd} credits to ${addCreditsUser.name}'s account`)
        setAddCreditsUser(null)
        setCreditsToAdd("5")
        fetchUsers()
      } else {
        toast.error(data.error || "Failed to add credits")
      }
    } catch (error) {
      toast.error("Failed to add credits")
    } finally {
      setAddingCredits(false)
    }
  }

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col">
        {/* Header Skeleton */}
        <header className="border-b border-[#B8AFA5]/20 bg-white">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-20 rounded-full bg-[#B8AFA5]/20" />
                <div>
                  <Skeleton className="h-6 w-40 mb-1 bg-[#B8AFA5]/20" />
                  <Skeleton className="h-4 w-32 bg-[#B8AFA5]/20" />
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <Card key={i} className="border-[#B8AFA5]/30 bg-white">
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24 bg-[#B8AFA5]/20" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-12 bg-[#B8AFA5]/20" />
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="space-y-4">
            <UserCardSkeleton />
            <UserCardSkeleton />
            <UserCardSkeleton />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col">
      {/* Header */}
      <header className="border-b border-[#B8AFA5]/20 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/admin")}
                className="text-[#7A736B] hover:text-[#5A5550] hover:bg-[#9BA899]/10 rounded-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="min-w-0">
                <h1 className="font-serif text-xl md:text-2xl text-[#5A5550]">User Management</h1>
                <p className="text-xs text-[#9BA899]">Manage user roles and permissions</p>
              </div>
            </div>
            <Link href="/pilates" className="shrink-0 hidden sm:block">
              <div className="relative w-8 h-8">
                <Image
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/image-1765052969010.png?width=8000&height=8000&resize=contain"
                  alt="Swift Fit"
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 md:py-8 flex-1">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <Card className="border-[#B8AFA5]/30 bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[#5A5550]">Total Users</CardTitle>
              <Users className="h-4 w-4 text-[#9BA899]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-serif text-[#9BA899]">{users.length}</div>
            </CardContent>
          </Card>

          <Card className="border-[#B8AFA5]/30 bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[#5A5550]">Students</CardTitle>
              <Users className="h-4 w-4 text-[#9BA899]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-serif text-[#9BA899]">
                {users.filter(u => u.profile?.role === "student").length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#B8AFA5]/30 bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[#5A5550]">Instructors</CardTitle>
              <Shield className="h-4 w-4 text-[#9BA899]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-serif text-[#9BA899]">
                {users.filter(u => u.profile?.role === "instructor").length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#B8AFA5]/30 bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[#5A5550]">Admins</CardTitle>
              <Shield className="h-4 w-4 text-[#E8B4B8]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-serif text-[#E8B4B8]">
                {users.filter(u => u.profile?.role === "admin").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Export */}
        <Card className="border-[#B8AFA5]/30 bg-white mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#9BA899]" />
                <Input
                  placeholder="Search by name, email, or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-[#B8AFA5]/30 focus:border-[#9BA899]"
                />
              </div>
              <Button
                onClick={copyStudentEmails}
                variant="outline"
                className="border-[#9BA899] text-[#9BA899] hover:bg-[#9BA899]/10 whitespace-nowrap"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Student Emails
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card className="border-[#B8AFA5]/30 bg-white">
          <CardHeader>
            <CardTitle className="font-serif font-normal text-[#5A5550]">All Users</CardTitle>
            <CardDescription className="text-[#7A736B]">View and manage user roles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-12 text-[#B8AFA5]">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-[#7A736B]">{searchTerm ? "No users match your search" : "No users found"}</p>
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <Card key={user.id} className="border-[#B8AFA5]/30 hover:border-[#9BA899]/50 transition-colors">
                    <CardContent className="p-4 md:p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-[#9BA899]/20 flex items-center justify-center shrink-0">
                            <span className="text-base md:text-lg font-semibold text-[#9BA899]">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h3 className="font-medium text-base md:text-lg text-[#5A5550] truncate">{user.name}</h3>
                              {user.profile && getRoleBadge(user.profile.role)}
                              {user.emailVerified ? (
                                <CheckCircle className="h-4 w-4 text-[#9BA899]" title="Email verified" />
                              ) : (
                                <XCircle className="h-4 w-4 text-[#B8AFA5]" title="Email not verified" />
                              )}
                            </div>
                            
                            <div className="space-y-0.5 text-sm text-[#7A736B]">
                              <div className="flex items-center gap-2">
                                <Mail className="h-3.5 w-3.5 text-[#9BA899]" />
                                <span className="truncate">{user.email}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-3.5 w-3.5 text-[#9BA899]" />
                                <span>Joined {format(new Date(user.createdAt), "MMM d, yyyy")}</span>
                              </div>
                              {user.profile?.role === 'student' && (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#9BA899]/10 text-[#9BA899]">
                                    {user.hasUnlimitedMembership ? '∞ Unlimited' : `${user.creditsRemaining || 0} credits`}
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 px-2 text-xs text-[#9BA899] hover:text-[#5A5550] hover:bg-[#9BA899]/10"
                                    onClick={() => setAddCreditsUser(user)}
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Add
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Role Selector */}
                        <div className="flex items-center gap-3 shrink-0">
                          {user.profile ? (
                            <>
                              <span className="text-sm text-[#B8AFA5] hidden sm:inline">Role:</span>
                              <Select
                                value={user.profile.role}
                                onValueChange={(newRole) => 
                                  handleRoleChange(user.id, user.profile!.id, newRole)
                                }
                                disabled={updatingRole === user.id}
                              >
                                <SelectTrigger className="w-32 border-[#B8AFA5]/50 focus:ring-[#9BA899]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="student">Student</SelectItem>
                                  <SelectItem value="instructor">Instructor</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                            </>
                          ) : (
                            <Badge variant="outline" className="border-[#B8AFA5] text-[#B8AFA5]">No Profile</Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Credits Dialog */}
      <Dialog open={!!addCreditsUser} onOpenChange={(open) => !open && setAddCreditsUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif font-normal text-[#5A5550] flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-[#9BA899]" />
              Add Credits
            </DialogTitle>
            <DialogDescription className="text-[#7A736B]">
              Add credits to {addCreditsUser?.name}'s account
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-[#9BA899]/20 flex items-center justify-center">
                <span className="text-lg font-semibold text-[#9BA899]">
                  {addCreditsUser?.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-[#5A5550]">{addCreditsUser?.name}</p>
                <p className="text-sm text-[#7A736B]">{addCreditsUser?.email}</p>
                <p className="text-xs text-[#9BA899]">
                  Current: {addCreditsUser?.hasUnlimitedMembership ? '∞ Unlimited' : `${addCreditsUser?.creditsRemaining || 0} credits`}
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#5A5550]">Credits to Add</label>
              <div className="flex gap-2">
                {['1', '3', '5', '10', '20'].map((val) => (
                  <Button
                    key={val}
                    type="button"
                    variant={creditsToAdd === val ? "default" : "outline"}
                    size="sm"
                    className={creditsToAdd === val 
                      ? "bg-[#9BA899] hover:bg-[#8A9788] text-white" 
                      : "border-[#B8AFA5] text-[#5A5550] hover:bg-[#9BA899]/10"}
                    onClick={() => setCreditsToAdd(val)}
                  >
                    {val}
                  </Button>
                ))}
              </div>
              <Input
                type="number"
                min="1"
                value={creditsToAdd}
                onChange={(e) => setCreditsToAdd(e.target.value)}
                className="mt-2 border-[#B8AFA5]/50 focus:border-[#9BA899]"
                placeholder="Or enter custom amount"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddCreditsUser(null)}
              className="border-[#B8AFA5] text-[#5A5550]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddCredits}
              disabled={addingCredits || !creditsToAdd || parseInt(creditsToAdd) <= 0}
              className="bg-[#9BA899] hover:bg-[#8A9788] text-white"
            >
              {addingCredits ? "Adding..." : `Add ${creditsToAdd} Credits`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="border-t border-[#B8AFA5]/20 bg-white py-4 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-[#7A736B]">
          © 2025 Swift Fit Pilates & Wellness Studio — Admin Panel
        </div>
      </footer>
    </div>
  )
}
