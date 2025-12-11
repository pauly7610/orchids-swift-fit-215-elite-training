"use client"

import { useEffect, useState } from "react"
import { useSession } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Package } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import Image from "next/image"

export default function CreatePackagePage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [packageType, setPackageType] = useState<"package" | "membership">("package")
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    credits: "10",
    price: "",
    expirationDays: "90",
    priceMonthly: "",
    isUnlimited: false,
    creditsPerMonth: "10"
  })

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login?redirect=/admin/packages/create")
    }
  }, [session, isPending, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const token = localStorage.getItem("bearer_token")
      const endpoint = packageType === "package" ? "/api/packages" : "/api/memberships"
      
      const payload = packageType === "package" 
        ? {
            name: formData.name,
            description: formData.description,
            credits: parseInt(formData.credits),
            price: parseFloat(formData.price),
            expirationDays: parseInt(formData.expirationDays)
          }
        : {
            name: formData.name,
            description: formData.description,
            priceMonthly: parseFloat(formData.priceMonthly),
            isUnlimited: formData.isUnlimited,
            creditsPerMonth: formData.isUnlimited ? null : parseInt(formData.creditsPerMonth)
          }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        toast.success(`${packageType === "package" ? "Package" : "Membership"} created successfully!`)
        router.push("/admin")
      } else {
        const data = await res.json()
        toast.error(data.error || `Failed to create ${packageType}`)
      }
    } catch (error) {
      toast.error(`Failed to create ${packageType}`)
    } finally {
      setSubmitting(false)
    }
  }

  if (isPending) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col">
        <header className="border-b border-[#B8AFA5]/20 bg-white">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-20 rounded-full bg-[#B8AFA5]/20" />
              <Skeleton className="h-6 w-40 bg-[#B8AFA5]/20" />
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto border-[#B8AFA5]/30">
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2 bg-[#B8AFA5]/20" />
              <Skeleton className="h-4 w-48 bg-[#B8AFA5]/20" />
            </CardHeader>
            <CardContent className="space-y-6">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-10 w-full bg-[#B8AFA5]/20" />
              ))}
            </CardContent>
          </Card>
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
                <h1 className="font-serif text-xl md:text-2xl text-[#5A5550]">Create Package</h1>
                <p className="text-xs text-[#9BA899]">Add a new class package or membership</p>
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
        <Card className="max-w-2xl mx-auto border-[#B8AFA5]/30 bg-white">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-[#9BA899]" />
              <CardTitle className="font-serif font-normal text-[#5A5550]">Package Details</CardTitle>
            </div>
            <CardDescription className="text-[#7A736B]">Choose between a class package or monthly membership</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label className="text-[#5A5550]">Type *</Label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={packageType === "package"}
                      onChange={() => setPackageType("package")}
                      className="accent-[#9BA899]"
                    />
                    <span className="text-[#5A5550]">Class Package</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={packageType === "membership"}
                      onChange={() => setPackageType("membership")}
                      className="accent-[#9BA899]"
                    />
                    <span className="text-[#5A5550]">Monthly Membership</span>
                  </label>
                </div>
              </div>

              <div>
                <Label htmlFor="name" className="text-[#5A5550]">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder={packageType === "package" ? "10-Class Package" : "Unlimited Monthly"}
                  className="mt-1 border-[#B8AFA5]/30 focus:border-[#9BA899]"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-[#5A5550]">Description</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the package benefits"
                  rows={3}
                  className="w-full mt-1 rounded-md border border-[#B8AFA5]/30 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9BA899]"
                />
              </div>

              {packageType === "package" ? (
                <>
                  <div>
                    <Label htmlFor="credits" className="text-[#5A5550]">Number of Classes *</Label>
                    <Input
                      id="credits"
                      type="number"
                      min="1"
                      value={formData.credits}
                      onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                      required
                      className="mt-1 border-[#B8AFA5]/30 focus:border-[#9BA899]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="price" className="text-[#5A5550]">Price *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                      placeholder="99.00"
                      className="mt-1 border-[#B8AFA5]/30 focus:border-[#9BA899]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="expirationDays" className="text-[#5A5550]">Expiration (days)</Label>
                    <Input
                      id="expirationDays"
                      type="number"
                      min="1"
                      value={formData.expirationDays}
                      onChange={(e) => setFormData({ ...formData, expirationDays: e.target.value })}
                      placeholder="90"
                      className="mt-1 border-[#B8AFA5]/30 focus:border-[#9BA899]"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label htmlFor="priceMonthly" className="text-[#5A5550]">Monthly Price *</Label>
                    <Input
                      id="priceMonthly"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.priceMonthly}
                      onChange={(e) => setFormData({ ...formData, priceMonthly: e.target.value })}
                      required
                      placeholder="149.00"
                      className="mt-1 border-[#B8AFA5]/30 focus:border-[#9BA899]"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isUnlimited}
                        onChange={(e) => setFormData({ ...formData, isUnlimited: e.target.checked })}
                        className="accent-[#9BA899] rounded"
                      />
                      <span className="text-sm font-medium text-[#5A5550]">Unlimited Classes</span>
                    </label>
                  </div>

                  {!formData.isUnlimited && (
                    <div>
                      <Label htmlFor="creditsPerMonth" className="text-[#5A5550]">Classes per Month *</Label>
                      <Input
                        id="creditsPerMonth"
                        type="number"
                        min="1"
                        value={formData.creditsPerMonth}
                        onChange={(e) => setFormData({ ...formData, creditsPerMonth: e.target.value })}
                        required
                        className="mt-1 border-[#B8AFA5]/30 focus:border-[#9BA899]"
                      />
                    </div>
                  )}
                </>
              )}

              <div className="flex gap-4 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1 bg-[#9BA899] hover:bg-[#8A9788] text-white rounded-full"
                  disabled={submitting}
                >
                  {submitting ? "Creating..." : `Create ${packageType === "package" ? "Package" : "Membership"}`}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => router.push("/admin")}
                  className="border-[#B8AFA5] text-[#5A5550] hover:bg-[#9BA899]/10 rounded-full"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
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
