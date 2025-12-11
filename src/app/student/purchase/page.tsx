"use client"

import { useEffect, useState } from "react"
import { useSession } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import { toast } from "sonner"

interface Package {
  id: number
  name: string
  description: string
  credits: number
  price: number
  expirationDays: number
  isActive: boolean
}

interface Membership {
  id: number
  name: string
  description: string
  priceMonthly: number
  isUnlimited: boolean
  creditsPerMonth: number
  isActive: boolean
}

export default function PurchasePage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [packages, setPackages] = useState<Package[]>([])
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login?redirect=/student/purchase")
    }
  }, [session, isPending, router])

  useEffect(() => {
    if (session) {
      fetchData()
    }
  }, [session])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("bearer_token")
      const headers = { Authorization: `Bearer ${token}` }

      const [packagesRes, membershipsRes] = await Promise.all([
        fetch("/api/packages", { headers }),
        fetch("/api/memberships", { headers })
      ])

      if (packagesRes.ok) {
        const data = await packagesRes.json()
        setPackages(data.filter((p: Package) => p.isActive))
      }
      if (membershipsRes.ok) {
        const data = await membershipsRes.json()
        setMemberships(data.filter((m: Membership) => m.isActive))
      }
    } catch (error) {
      toast.error("Failed to load packages")
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async (type: "package" | "membership", id: number, amount: number) => {
    setPurchasing(true)
    try {
      const token = localStorage.getItem("bearer_token")
      
      // Create payment intent
      const paymentRes = await fetch("/api/payments", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          amount,
          currency: "USD",
          paymentMethod: "square"
        })
      })

      if (!paymentRes.ok) {
        throw new Error("Failed to create payment")
      }

      const paymentData = await paymentRes.json()

      // Create student purchase record
      const purchaseRes = await fetch("/api/student-purchases", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          purchaseType: type,
          packageId: type === "package" ? id : undefined,
          membershipId: type === "membership" ? id : undefined,
          paymentId: paymentData.id
        })
      })

      if (!purchaseRes.ok) {
        throw new Error("Failed to complete purchase")
      }

      toast.success("Purchase successful!")
      router.push("/student")
    } catch (error) {
      toast.error("Purchase failed. Please try again.")
    } finally {
      setPurchasing(false)
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
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-xl sm:text-2xl md:text-3xl text-primary truncate">PURCHASE CREDITS</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Choose a package or membership</p>
            </div>
            <Button variant="outline" size="sm" className="shrink-0" onClick={() => router.push("/student")}>
              <span className="hidden sm:inline">Back to </span>Dashboard
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 md:py-12">
        {/* Memberships */}
        <section className="mb-10 md:mb-16">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-secondary mb-2">MONTHLY MEMBERSHIPS</h2>
            <p className="text-sm md:text-base text-muted-foreground px-4">Unlimited access to all Pilates classes</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
            {memberships.map((membership) => (
              <Card key={membership.id} className="border-2 hover:border-primary transition-colors">
                <CardHeader>
                  <CardTitle className="text-2xl">{membership.name}</CardTitle>
                  <CardDescription>{membership.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <div className="text-4xl font-bold mb-2">
                      ${membership.priceMonthly}
                      <span className="text-lg font-normal text-muted-foreground">/month</span>
                    </div>
                    {membership.isUnlimited ? (
                      <Badge className="bg-primary/10 text-primary">Unlimited Classes</Badge>
                    ) : (
                      <Badge variant="outline">{membership.creditsPerMonth} credits/month</Badge>
                    )}
                  </div>

                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">
                        {membership.isUnlimited ? "Unlimited classes per month" : `${membership.creditsPerMonth} classes per month`}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Priority booking</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Cancel anytime</span>
                    </li>
                  </ul>

                  <Button 
                    className="w-full" 
                    onClick={() => handlePurchase("membership", membership.id, membership.priceMonthly)}
                    disabled={purchasing}
                  >
                    {purchasing ? "Processing..." : "Subscribe Now"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Class Packages */}
        <section>
          <div className="text-center mb-6 md:mb-8">
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-secondary mb-2">CLASS PACKAGES</h2>
            <p className="text-sm md:text-base text-muted-foreground px-4">Pay as you go with flexible credit packages</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto">
            {packages.map((pkg) => (
              <Card key={pkg.id} className="border-2 hover:border-primary transition-colors">
                <CardHeader>
                  <CardTitle className="text-xl">{pkg.name}</CardTitle>
                  <CardDescription>{pkg.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <div className="text-3xl font-bold mb-1">${pkg.price}</div>
                    <div className="text-sm text-muted-foreground mb-2">
                      {pkg.credits} {pkg.credits === 1 ? "class" : "classes"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ${(pkg.price / pkg.credits).toFixed(2)} per class
                    </div>
                  </div>

                  <ul className="space-y-2 mb-6 text-sm">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{pkg.credits} class credits</span>
                    </li>
                    {pkg.expirationDays && (
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Valid for {pkg.expirationDays} days</span>
                      </li>
                    )}
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>All class types</span>
                    </li>
                  </ul>

                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => handlePurchase("package", pkg.id, pkg.price)}
                    disabled={purchasing}
                  >
                    {purchasing ? "Processing..." : "Buy Package"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Note */}
        <div className="max-w-2xl mx-auto mt-8 md:mt-12 px-2">
          <Card className="bg-muted/50">
            <CardContent className="p-4 md:p-6 text-center text-xs md:text-sm text-muted-foreground">
              <p>
                All purchases are processed securely through Square. You can manage your subscription 
                and payment methods from your dashboard.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
