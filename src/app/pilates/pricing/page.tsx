"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Sparkles, CheckCircle2, Star, Gift, TrendingUp, Zap, ExternalLink, RefreshCw } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface Package {
  id: number
  name: string
  description: string
  credits: number
  price: number
  expirationDays: number
  validityType: string
  swipeSimpleLink: string
  isActive: boolean
}

interface Membership {
  id: number
  name: string
  description: string
  priceMonthly: number
  isUnlimited: boolean
  creditsPerMonth: number
  swipeSimpleLink: string
  isActive: boolean
}

const iconMap: Record<string, any> = {
  "New Student Intro": Gift,
  "Drop In": Zap,
  "5 Class Pack": Star,
  "10 Class Pack": TrendingUp,
  "20 Class Pack": TrendingUp,
}

export default function PricingPage() {
  const [packages, setPackages] = useState<Package[]>([])
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPricingData()
  }, [])

  const fetchPricingData = async () => {
    try {
      const [packagesRes, membershipsRes] = await Promise.all([
        fetch("/api/packages?isActive=true"),
        fetch("/api/memberships?isActive=true")
      ])

      if (packagesRes.ok) {
        const data = await packagesRes.json()
        setPackages(data)
      }
      if (membershipsRes.ok) {
        const data = await membershipsRes.json()
        setMemberships(data)
      }
    } catch (error) {
      toast.error("Failed to load pricing information")
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = (link: string, name: string) => {
    // Check if running in iframe
    const isInIframe = window.self !== window.top
    
    if (isInIframe) {
      // Post message to parent to open in new tab
      window.parent.postMessage({ 
        type: "OPEN_EXTERNAL_URL", 
        data: { url: link } 
      }, "*")
    } else {
      // Open directly in new tab
      window.open(link, "_blank", "noopener,noreferrer")
    }
    
    toast.success(`Opening payment page for ${name}`)
  }

  const getPerClassPrice = (price: number, credits: number) => {
    return (price / credits).toFixed(2)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading pricing...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-secondary/95 backdrop-blur-sm border-b border-primary/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/pilates" className="flex items-center gap-2">
            <Heart className="h-8 w-8 text-primary" />
            <div>
              <h1 className="font-display text-2xl text-white tracking-wider">SWIFTFIT PILATES</h1>
              <p className="text-xs text-primary/80 -mt-1">Pilates + Wellness Studio</p>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/pilates/about" className="text-white/80 hover:text-primary transition-colors text-sm font-medium">About</Link>
            <Link href="/pilates/instructors" className="text-white/80 hover:text-primary transition-colors text-sm font-medium">Instructors</Link>
            <Link href="/pilates/classes" className="text-white/80 hover:text-primary transition-colors text-sm font-medium">Classes</Link>
            <Link href="/pilates/pricing" className="text-primary transition-colors text-sm font-medium">Pricing</Link>
            <Link href="/pilates/schedule" className="text-white/80 hover:text-primary transition-colors text-sm font-medium">Schedule</Link>
            <Link href="/pilates/faq" className="text-white/80 hover:text-primary transition-colors text-sm font-medium">FAQ</Link>
            <Link href="/">
              <Button size="sm" variant="outline" className="border-white/30 text-secondary hover:bg-white">
                Back to Gym
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-secondary via-secondary/95 to-black">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-primary/20 text-primary border-primary/30 text-sm px-4 py-1">
              <Sparkles className="h-4 w-4 mr-2" />
              Flexible Options
            </Badge>
            <h1 className="font-display text-5xl md:text-7xl text-white mb-6 tracking-wide">
              PRICING & PACKAGES
            </h1>
            <p className="text-xl text-white/80 leading-relaxed">
              Find the perfect package for your wellness journey - from drop-ins to unlimited monthly memberships.
            </p>
          </div>
        </div>
      </section>

      {/* Class Packs Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-4xl md:text-5xl text-secondary mb-4 tracking-wide">
                CLASS PACKS
              </h2>
              <p className="text-lg text-muted-foreground">
                Pay as you go with our flexible class pack options
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg) => {
                const Icon = iconMap[pkg.name] || Star
                const isIntro = pkg.name === "New Student Intro"
                
                return (
                  <Card 
                    key={pkg.id} 
                    className={`relative border-2 transition-all hover:shadow-lg ${
                      isIntro ? 'border-primary bg-primary/5' : 'hover:border-primary'
                    }`}
                  >
                    {isIntro && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-primary text-white">
                          <Star className="h-3 w-3 mr-1" />
                          Best for New Students
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader>
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="font-display text-4xl text-primary">${pkg.price}</span>
                        {pkg.credits > 1 && (
                          <span className="text-sm text-muted-foreground">
                            (${getPerClassPrice(pkg.price, pkg.credits)}/class)
                          </span>
                        )}
                      </div>
                      <CardDescription className="mt-2">{pkg.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3 mb-6">
                        <li className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>{pkg.credits} {pkg.credits === 1 ? 'class' : 'classes'} included</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>Valid for all class types</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>
                            {pkg.expirationDays === 1 
                              ? 'Valid same day only' 
                              : pkg.expirationDays < 60
                              ? `Valid for ${pkg.expirationDays} days`
                              : pkg.validityType === 'annual'
                              ? 'Valid for 1 year from purchase'
                              : 'Flexible scheduling'}
                          </span>
                        </li>
                        {pkg.credits >= 5 && (
                          <li className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>Share with friends/family</span>
                          </li>
                        )}
                        {pkg.credits >= 10 && (
                          <li className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>Priority booking access</span>
                          </li>
                        )}
                      </ul>
                      
                      <Button 
                        className="w-full bg-primary hover:bg-primary/90 text-white"
                        onClick={() => handlePurchase(pkg.swipeSimpleLink, pkg.name)}
                      >
                        Purchase Now
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Monthly Memberships Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-4xl md:text-5xl text-secondary mb-4 tracking-wide">
                MONTHLY MEMBERSHIPS
              </h2>
              <p className="text-lg text-muted-foreground mb-4">
                Commit to your practice with recurring monthly memberships
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <RefreshCw className="h-4 w-4 text-primary" />
                <span>Memberships automatically renew monthly • Manage anytime from your dashboard</span>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {memberships.map((membership) => {
                const isPopular = membership.creditsPerMonth === 8
                
                return (
                  <Card 
                    key={membership.id} 
                    className={`relative border-2 transition-all hover:shadow-lg ${
                      isPopular ? 'border-primary bg-primary/5' : 'hover:border-primary'
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-primary text-white">
                          <Star className="h-3 w-3 mr-1" />
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader>
                      <CardTitle className="text-2xl">{membership.name}</CardTitle>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="font-display text-4xl text-primary">
                          ${membership.priceMonthly}
                        </span>
                        <span className="text-sm text-muted-foreground">/month</span>
                      </div>
                      {!membership.isUnlimited && membership.creditsPerMonth && (
                        <p className="text-sm text-muted-foreground mt-1">
                          (${(membership.priceMonthly / membership.creditsPerMonth).toFixed(2)}/class)
                        </p>
                      )}
                      <CardDescription className="mt-2">{membership.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3 mb-6">
                        <li className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>
                            {membership.isUnlimited 
                              ? 'Unlimited classes per month' 
                              : `${membership.creditsPerMonth} classes per month`}
                          </span>
                        </li>
                        <li className="flex items-start gap-2 text-sm">
                          <RefreshCw className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="font-medium">Automatically renews monthly</span>
                        </li>
                        {!membership.isUnlimited && (
                          <li className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>Rollover unused classes (up to 1 month)</span>
                          </li>
                        )}
                        <li className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>Priority booking</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>Member-only events & wellness perks</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>10% off workshops & merch</span>
                        </li>
                      </ul>
                      
                      <Button 
                        className="w-full bg-primary hover:bg-primary/90 text-white"
                        onClick={() => handlePurchase(membership.swipeSimpleLink, membership.name)}
                      >
                        Subscribe Now
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </Button>
                      
                      <p className="text-xs text-muted-foreground text-center mt-3">
                        Cancel anytime from your student dashboard
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Membership Perks Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-4xl md:text-5xl text-secondary mb-6 tracking-wide">
                MEMBERSHIP PERKS
              </h2>
              <p className="text-lg text-muted-foreground">
                All monthly memberships include these amazing benefits
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 border-l-4 border-l-primary">
                <div className="flex items-start gap-3 mb-2">
                  <RefreshCw className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <h3 className="text-xl font-semibold">Auto-Renewal & Rollover</h3>
                </div>
                <p className="text-muted-foreground">
                  Your membership automatically renews each month so you never miss out. Unused classes roll over for up to 1 month, ensuring you never lose what you've paid for. Cancel anytime from your dashboard.
                </p>
              </Card>

              <Card className="p-6 border-l-4 border-l-primary">
                <h3 className="text-xl font-semibold mb-2">Priority Booking</h3>
                <p className="text-muted-foreground">
                  Members get first access to book classes, ensuring you never miss your favorite instructor or time slot.
                </p>
              </Card>

              <Card className="p-6 border-l-4 border-l-primary">
                <h3 className="text-xl font-semibold mb-2">Member-Only Events</h3>
                <p className="text-muted-foreground">
                  Exclusive access to special events, workshops, and wellness experiences designed just for our community.
                </p>
              </Card>

              <Card className="p-6 border-l-4 border-l-primary">
                <h3 className="text-xl font-semibold mb-2">10% Off Workshops & Merch</h3>
                <p className="text-muted-foreground">
                  Save 10% on all special workshops, studio merchandise, and wellness products.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-secondary via-secondary/95 to-black">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-4xl md:text-5xl text-white mb-6 tracking-wide">
            READY TO GET STARTED?
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Purchase a package above, then book your first class to begin your wellness journey with us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pilates/schedule">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white text-lg h-14 px-8">
                View Schedule & Book
              </Button>
            </Link>
            <Link href="/pilates/faq">
              <Button size="lg" variant="outline" className="border-white bg-white/10 text-white hover:bg-white hover:text-secondary text-lg h-14 px-8">
                Have Questions?
              </Button>
            </Link>
          </div>
          <p className="text-sm text-white/60 mt-6">
            New to the studio? Start with our 3-class intro pack for just $49!
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Heart className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-display text-2xl tracking-wider">SWIFTFIT PILATES</h3>
                </div>
              </div>
              <p className="text-white/70 text-sm">
                A warm, welcoming space for real people on real journeys.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><Link href="/pilates" className="hover:text-primary transition-colors">Home</Link></li>
                <li><Link href="/pilates/about" className="hover:text-primary transition-colors">About</Link></li>
                <li><Link href="/pilates/instructors" className="hover:text-primary transition-colors">Instructors</Link></li>
                <li><Link href="/pilates/classes" className="hover:text-primary transition-colors">Classes</Link></li>
                <li><Link href="/pilates/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link href="/pilates/schedule" className="hover:text-primary transition-colors">Schedule</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li>swiftfitpws@gmail.com</li>
                <li>2245 E Tioga Street</li>
                <li>Philadelphia, PA 19134</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-sm text-white/60">
            <p>© 2025 Swift Fit Pilates + Wellness Studio. All rights reserved.</p>
            <p className="mt-2">Part of <Link href="/" className="text-primary hover:underline">SwiftFit 215</Link> family</p>
          </div>
        </div>
      </footer>
    </div>
  )
}