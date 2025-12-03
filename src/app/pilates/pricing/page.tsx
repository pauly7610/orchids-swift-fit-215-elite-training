"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Sparkles, CheckCircle2, Star, Gift, TrendingUp, Zap } from "lucide-react"
import Link from "next/link"

const packages = [
  {
    name: "New Student Intro",
    price: "$49",
    description: "Perfect for trying us out",
    highlight: true,
    icon: Gift,
    features: [
      "3 classes of your choice",
      "Try different class types",
      "Meet our instructors",
      "Experience our community",
      "No commitment required"
    ],
    note: "Best value for first-time students!"
  },
  {
    name: "Drop-In Class",
    price: "$22",
    description: "Single class, no commitment",
    icon: Zap,
    features: [
      "Pay per class",
      "No membership required",
      "All class types included",
      "Book day-of or in advance",
      "Perfect for occasional visits"
    ]
  },
  {
    name: "5 Class Pack",
    price: "$100",
    perClass: "$20/class",
    description: "Great for regular practice",
    icon: Star,
    features: [
      "5 classes to use anytime",
      "Valid for all class types",
      "Better value than drop-in",
      "Flexible scheduling",
      "Share with friends/family"
    ]
  },
  {
    name: "10 Class Pack",
    price: "$190",
    perClass: "$19/class",
    description: "Best value for class packs",
    icon: TrendingUp,
    features: [
      "10 classes to use anytime",
      "Valid for all class types",
      "Maximum flexibility",
      "Best per-class rate",
      "Priority booking access"
    ]
  },
  {
    name: "20 Class Pack",
    price: "$360",
    perClass: "$18/class",
    description: "Ultimate value pack",
    icon: TrendingUp,
    features: [
      "20 classes to use anytime",
      "Valid for all class types",
      "Lowest per-class rate",
      "Priority booking",
      "Member perks included"
    ]
  }
]

const memberships = [
  {
    name: "4 Class Monthly",
    price: "$78",
    perClass: "$19.50/class",
    description: "Perfect for weekly practice",
    features: [
      "4 classes per month",
      "Rollover unused classes (up to 1 month)",
      "Priority booking",
      "Member-only events",
      "10% off workshops & merch"
    ]
  },
  {
    name: "8 Class Monthly",
    price: "$140",
    perClass: "$17.50/class",
    description: "For dedicated practitioners",
    popular: true,
    features: [
      "8 classes per month",
      "Rollover unused classes (up to 1 month)",
      "Priority booking",
      "Member-only events & perks",
      "10% off workshops & merch"
    ]
  },
  {
    name: "Unlimited Monthly",
    price: "$179",
    perClass: "Unlimited",
    description: "For the committed yogi/athlete",
    features: [
      "Unlimited classes per month",
      "All class types included",
      "Priority booking",
      "Member-only events & wellness perks",
      "10% off workshops & merch"
    ]
  }
]

export default function PricingPage() {
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
              <Button size="sm" variant="outline" className="border-white/30 text-white hover:bg-white hover:text-secondary">
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
              {packages.map((pkg, index) => {
                const Icon = pkg.icon
                return (
                  <Card 
                    key={index} 
                    className={`relative border-2 transition-all hover:shadow-lg ${
                      pkg.highlight ? 'border-primary bg-primary/5' : 'hover:border-primary'
                    }`}
                  >
                    {pkg.highlight && (
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
                        <span className="font-display text-4xl text-primary">{pkg.price}</span>
                        {pkg.perClass && (
                          <span className="text-sm text-muted-foreground">({pkg.perClass})</span>
                        )}
                      </div>
                      <CardDescription className="mt-2">{pkg.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {pkg.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      {pkg.note && (
                        <p className="mt-4 text-xs text-primary font-medium italic">
                          {pkg.note}
                        </p>
                      )}
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
              <p className="text-lg text-muted-foreground">
                Commit to your practice with recurring monthly memberships
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {memberships.map((membership, index) => (
                <Card 
                  key={index} 
                  className={`relative border-2 transition-all hover:shadow-lg ${
                    membership.popular ? 'border-primary bg-primary/5' : 'hover:border-primary'
                  }`}
                >
                  {membership.popular && (
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
                      <span className="font-display text-4xl text-primary">{membership.price}</span>
                      <span className="text-sm text-muted-foreground">/month</span>
                    </div>
                    {membership.perClass && (
                      <p className="text-sm text-muted-foreground mt-1">({membership.perClass})</p>
                    )}
                    <CardDescription className="mt-2">{membership.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {membership.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
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
                <h3 className="text-xl font-semibold mb-2">Rollover Classes</h3>
                <p className="text-muted-foreground">
                  Unused classes from your monthly membership roll over for up to 1 month, so you never lose what you've paid for.
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
            Book your first class today and begin your wellness journey with us.
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
