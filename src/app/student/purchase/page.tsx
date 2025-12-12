"use client"

import { useEffect, useState } from "react"
import { useSession } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, ArrowLeft, Sparkles, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import Image from "next/image"

// SwipeSimple payment links
const SWIPE_SIMPLE_LINKS: Record<string, string> = {
  // Class Packs
  "New Student Intro": "https://swipesimple.com/links/lnk_3170cae99f12bdf4946fbad2f0115779",
  "Drop In": "https://swipesimple.com/links/lnk_2fbdf3a609891ea262e844eb8ecd6d0d",
  "5 Class Pack": "https://swipesimple.com/links/lnk_31523cd29d05b93f5914fa3810d6d222",
  "10 Class Pack": "https://swipesimple.com/links/lnk_05d3b78c3d0a693475d54f08edddeaa0",
  "20 Class Pack": "https://swipesimple.com/links/lnk_e67ae0c539f9ef0c8b2715cc6a058d5a",
  // Monthly Memberships
  "4 Class Monthly": "https://swipesimple.com/links/lnk_6f005263d89019ae3467b7014930bdb7",
  "8 Class Monthly": "https://swipesimple.com/links/lnk_b98d041b9a58327d90aea6dd479ba24b",
  "Unlimited Monthly": "https://swipesimple.com/links/lnk_f7a2d31d0342eda1b64db8ae9f170cff",
}

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

  const handlePurchase = (name: string) => {
    const link = SWIPE_SIMPLE_LINKS[name]
    
    if (!link) {
      toast.error("Payment link not available. Please contact us.")
      return
    }
    
    // Open SwipeSimple payment page
    window.open(link, "_blank", "noopener,noreferrer")
    toast.success(`Opening payment page for ${name}`)
  }

  if (isPending || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9BA899] mx-auto mb-4"></div>
          <p className="text-[#7A736B]">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Header */}
      <header className="border-b border-[#B8AFA5]/20 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link href="/pilates" className="flex items-center gap-2">
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
                <h1 className="font-serif text-lg sm:text-xl md:text-2xl text-[#5A5550]">Purchase Credits</h1>
                <p className="text-xs text-[#9BA899] hidden sm:block">Choose a package or membership</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="shrink-0 border-[#B8AFA5] text-[#5A5550] hover:bg-[#9BA899]/10 rounded-full" 
              onClick={() => router.push("/student")}
            >
              <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Back to </span>Dashboard
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 md:py-12">
        {/* New Student Intro Offer */}
        <section className="mb-10 md:mb-16">
          <Card className="border-2 border-[#E8B4B8] bg-gradient-to-r from-[#FFF5F7] via-white to-[#F5F9F5] max-w-2xl mx-auto">
            <CardContent className="p-6 md:p-8 text-center">
              <div className="inline-flex items-center gap-2 bg-[#E8B4B8]/20 rounded-full px-4 py-1.5 mb-4">
                <Sparkles className="h-4 w-4 text-[#E8B4B8]" />
                <span className="text-sm font-medium text-[#5A5550]">New Student Special</span>
              </div>
              <h2 className="font-serif text-2xl md:text-3xl text-[#5A5550] mb-2">3 Classes for $49</h2>
              <p className="text-[#7A736B] mb-6">Perfect for trying out different class types and instructors</p>
              <Button 
                className="bg-[#E8B4B8] hover:bg-[#D9A5A9] text-white rounded-full px-8"
                onClick={() => handlePurchase("New Student Intro")}
              >
                Get Started
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Memberships */}
        <section className="mb-10 md:mb-16">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#5A5550] mb-2 font-light">Monthly Memberships</h2>
            <p className="text-sm md:text-base text-[#7A736B] px-4">Unlimited access to all classes</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
            {memberships.map((membership) => (
              <Card key={membership.id} className="border-[#B8AFA5]/30 hover:border-[#9BA899] transition-all hover:shadow-lg bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-serif font-normal text-[#5A5550]">{membership.name}</CardTitle>
                  <CardDescription className="text-[#7A736B]">{membership.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <div className="text-4xl font-serif font-light text-[#9BA899] mb-2">
                      ${membership.priceMonthly}
                      <span className="text-lg text-[#B8AFA5]">/month</span>
                    </div>
                    {membership.isUnlimited ? (
                      <Badge className="bg-[#9BA899]/20 text-[#5A5550] border-[#9BA899] rounded-full">Unlimited Classes</Badge>
                    ) : (
                      <Badge variant="outline" className="border-[#B8AFA5] text-[#7A736B] rounded-full">{membership.creditsPerMonth} credits/month</Badge>
                    )}
                  </div>

                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-[#9BA899] mt-0.5 shrink-0" />
                      <span className="text-sm text-[#5A5550]">
                        {membership.isUnlimited ? "Unlimited classes per month" : `${membership.creditsPerMonth} classes per month`}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-[#9BA899] mt-0.5 shrink-0" />
                      <span className="text-sm text-[#5A5550]">Priority booking</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-[#9BA899] mt-0.5 shrink-0" />
                      <span className="text-sm text-[#5A5550]">Cancel anytime</span>
                    </li>
                  </ul>

                  <Button 
                    className="w-full bg-[#9BA899] hover:bg-[#8A9788] text-white rounded-full" 
                    onClick={() => handlePurchase(membership.name)}
                  >
                    Subscribe Now
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Class Packages */}
        <section>
          <div className="text-center mb-6 md:mb-8">
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#5A5550] mb-2 font-light">Class Packages</h2>
            <p className="text-sm md:text-base text-[#7A736B] px-4">Pay as you go with flexible credit packages</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto">
            {packages.map((pkg) => (
              <Card key={pkg.id} className="border-[#B8AFA5]/30 hover:border-[#9BA899] transition-all hover:shadow-lg bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-serif font-normal text-[#5A5550]">{pkg.name}</CardTitle>
                  <CardDescription className="text-[#7A736B] text-sm">{pkg.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <div className="text-3xl font-serif font-light text-[#5A5550] mb-1">${pkg.price}</div>
                    <div className="text-sm text-[#9BA899] mb-1">
                      {pkg.credits} {pkg.credits === 1 ? "class" : "classes"}
                    </div>
                    <div className="text-xs text-[#B8AFA5]">
                      ${(pkg.price / pkg.credits).toFixed(2)} per class
                    </div>
                  </div>

                  <ul className="space-y-2 mb-6 text-sm">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-[#9BA899] mt-0.5 shrink-0" />
                      <span className="text-[#5A5550]">{pkg.credits} class credits</span>
                    </li>
                    {pkg.expirationDays && (
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-[#9BA899] mt-0.5 shrink-0" />
                        <span className="text-[#5A5550]">Valid for {pkg.expirationDays} days</span>
                      </li>
                    )}
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-[#9BA899] mt-0.5 shrink-0" />
                      <span className="text-[#5A5550]">All class types</span>
                    </li>
                  </ul>

                  <Button 
                    className="w-full rounded-full border-[#9BA899] text-[#9BA899] hover:bg-[#9BA899]/10" 
                    variant="outline"
                    onClick={() => handlePurchase(pkg.name)}
                  >
                    Buy Package
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Note */}
        <div className="max-w-2xl mx-auto mt-8 md:mt-12 px-2">
          <Card className="bg-[#9BA899]/10 border-[#9BA899]/20">
            <CardContent className="p-4 md:p-6 text-center text-xs md:text-sm text-[#7A736B]">
              <p>
                All purchases are processed securely through SwipeSimple. After completing payment, 
                your credits will be added to your account within 24 hours.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#5A5550] text-[#FAF8F5] py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-[#B8AFA5]">
            © 2025 Swift Fit Pilates & Wellness Studio. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
