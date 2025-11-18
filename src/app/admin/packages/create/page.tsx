"use client"

import { useEffect, useState } from "react"
import { useSession } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

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
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl text-primary">CREATE PACKAGE</h1>
              <p className="text-sm text-muted-foreground">Add a new class package or membership</p>
            </div>
            <Button variant="outline" onClick={() => router.push("/admin")}>
              Back to Admin
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Package Details</CardTitle>
            <CardDescription>Choose between a class package or monthly membership</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label>Type *</Label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={packageType === "package"}
                      onChange={() => setPackageType("package")}
                      className="accent-primary"
                    />
                    <span>Class Package</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={packageType === "membership"}
                      onChange={() => setPackageType("membership")}
                      className="accent-primary"
                    />
                    <span>Monthly Membership</span>
                  </label>
                </div>
              </div>

              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder={packageType === "package" ? "10-Class Package" : "Unlimited Monthly"}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description"
                  rows={3}
                  className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              {packageType === "package" ? (
                <>
                  <div>
                    <Label htmlFor="credits">Number of Classes *</Label>
                    <Input
                      id="credits"
                      type="number"
                      min="1"
                      value={formData.credits}
                      onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="price">Price *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                      placeholder="99.00"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="expirationDays">Expiration (days)</Label>
                    <Input
                      id="expirationDays"
                      type="number"
                      min="1"
                      value={formData.expirationDays}
                      onChange={(e) => setFormData({ ...formData, expirationDays: e.target.value })}
                      placeholder="90"
                      className="mt-1"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label htmlFor="priceMonthly">Monthly Price *</Label>
                    <Input
                      id="priceMonthly"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.priceMonthly}
                      onChange={(e) => setFormData({ ...formData, priceMonthly: e.target.value })}
                      required
                      placeholder="149.00"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isUnlimited}
                        onChange={(e) => setFormData({ ...formData, isUnlimited: e.target.checked })}
                        className="accent-primary"
                      />
                      <span className="text-sm font-medium">Unlimited Classes</span>
                    </label>
                  </div>

                  {!formData.isUnlimited && (
                    <div>
                      <Label htmlFor="creditsPerMonth">Classes per Month *</Label>
                      <Input
                        id="creditsPerMonth"
                        type="number"
                        min="1"
                        value={formData.creditsPerMonth}
                        onChange={(e) => setFormData({ ...formData, creditsPerMonth: e.target.value })}
                        required
                        className="mt-1"
                      />
                    </div>
                  )}
                </>
              )}

              <div className="flex gap-4">
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={submitting}
                >
                  {submitting ? "Creating..." : `Create ${packageType === "package" ? "Package" : "Membership"}`}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => router.push("/admin")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
