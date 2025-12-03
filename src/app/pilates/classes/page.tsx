"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Activity, Sparkles, Wind, Flame, Brain, Music } from "lucide-react"
import Link from "next/link"

const classTypes = [
  {
    name: "Mat Pilates",
    icon: Activity,
    instructor: "Joi, Tyra",
    description: "Build core strength, improve flexibility, and enhance body awareness through intentional movement on the mat. Mat Pilates focuses on controlled movements that strengthen and tone your entire body while improving posture and alignment.",
    benefits: [
      "Core strength and stability",
      "Improved flexibility and range of motion",
      "Better posture and body alignment",
      "Mind-body connection",
      "Low-impact, joint-friendly exercise"
    ],
    bestFor: "All levels welcome - beginners to advanced practitioners"
  },
  {
    name: "Yoga",
    icon: Wind,
    instructor: "Maisha",
    description: "Flow through sequences that connect breath with movement, cultivating strength, balance, and inner peace. Our yoga classes blend athletic training with mindful practice to help you level up physically and mentally.",
    benefits: [
      "Increased flexibility and mobility",
      "Stress reduction and mental clarity",
      "Enhanced strength and balance",
      "Improved breathing and energy",
      "Holistic mind-body wellness"
    ],
    bestFor: "All levels - modifications provided for different abilities"
  },
  {
    name: "Meditation & Herbal Wellness",
    icon: Brain,
    instructor: "Nasir",
    description: "Ground yourself through guided meditation, breathwork, and holistic wellness practices. Blending mindfulness with culturally rooted spiritual and herbal practices to help you reconnect with emotional clarity and natural calm.",
    benefits: [
      "Emotional balance and clarity",
      "Reduced stress and anxiety",
      "Deeper self-awareness",
      "Connection to holistic healing",
      "Inner peace and purpose"
    ],
    bestFor: "Anyone seeking mental wellness and grounding practices"
  },
  {
    name: "Fitness & Strength Training",
    icon: Flame,
    instructor: "Drelle, Tyra",
    description: "Break a sweat in dynamic workout classes that build endurance, power, and confidence. Combining athletic training with strength-building exercises for a full-body workout that challenges you physically and mentally.",
    benefits: [
      "Increased strength and muscle tone",
      "Improved cardiovascular endurance",
      "Enhanced athletic performance",
      "Boosted metabolism and energy",
      "Greater confidence and discipline"
    ],
    bestFor: "All fitness levels - scaled to individual abilities"
  },
  {
    name: "Dance Fitness",
    icon: Music,
    instructor: "Des, Drelle",
    description: "Build strength, confidence, and inner peace through movement. Dance and Release fitness classes combine the joy of dance with effective fitness training, helping you find freedom through rhythm and movement.",
    benefits: [
      "Full-body cardio workout",
      "Improved coordination and rhythm",
      "Stress relief through expression",
      "Increased confidence and joy",
      "Community and connection"
    ],
    bestFor: "All levels - no dance experience required"
  },
  {
    name: "HIIT",
    icon: Flame,
    instructor: "Tyra",
    description: "High-Intensity Interval Training that maximizes calorie burn and builds explosive power. Short bursts of intense exercise alternated with recovery periods for an efficient, effective workout.",
    benefits: [
      "Maximum calorie burn in minimal time",
      "Improved cardiovascular health",
      "Increased metabolism",
      "Enhanced athletic performance",
      "Full-body conditioning"
    ],
    bestFor: "Intermediate to advanced fitness levels"
  }
]

export default function ClassesPage() {
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
            <Link href="/pilates/classes" className="text-primary transition-colors text-sm font-medium">Classes</Link>
            <Link href="/pilates/pricing" className="text-white/80 hover:text-primary transition-colors text-sm font-medium">Pricing</Link>
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
              Diverse Offerings
            </Badge>
            <h1 className="font-display text-5xl md:text-7xl text-white mb-6 tracking-wide">
              CLASS TYPES
            </h1>
            <p className="text-xl text-white/80 leading-relaxed">
              From Mat Pilates to yoga, meditation, and dance fitness - find the perfect class for your journey.
            </p>
          </div>
        </div>
      </section>

      {/* Class Types Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="space-y-8">
              {classTypes.map((classType, index) => {
                const Icon = classType.icon
                return (
                  <Card key={index} className="p-8 border-2 hover:border-primary transition-colors">
                    <div className="grid md:grid-cols-3 gap-8">
                      <div className="md:col-span-2">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Icon className="h-8 w-8 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-3xl font-display tracking-wide text-primary mb-2">
                              {classType.name.toUpperCase()}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-1">
                              <span className="font-semibold">Instructor:</span> {classType.instructor}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {classType.bestFor}
                            </Badge>
                          </div>
                        </div>
                        
                        <p className="text-muted-foreground leading-relaxed mb-6">
                          {classType.description}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-3">Benefits:</h4>
                        <ul className="space-y-2">
                          {classType.benefits.map((benefit, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* What to Expect Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-4xl md:text-5xl text-secondary mb-6 tracking-wide">
                WHAT TO EXPECT
              </h2>
              <p className="text-lg text-muted-foreground">
                Every class is designed with intention and guided by instructors who care about your progress.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-3">Class Size</h3>
                <p className="text-muted-foreground">
                  Maximum 50 students per class to ensure quality instruction while maintaining community energy.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-3">Duration</h3>
                <p className="text-muted-foreground">
                  Most classes are 60 minutes, perfectly designed to fit into your busy schedule while providing a complete workout.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-3">All Levels Welcome</h3>
                <p className="text-muted-foreground">
                  Whether you're brand new or experienced, our instructors provide modifications and progressions for every ability level.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-3">Intentional Practice</h3>
                <p className="text-muted-foreground">
                  Take what you need from each session - whether it's strength, clarity, community, or peace.
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
            READY TO TRY A CLASS?
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            View our schedule and book your spot in an upcoming class. New students get 3 classes for just $49!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pilates/schedule">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white text-lg h-14 px-8">
                View Schedule & Book
              </Button>
            </Link>
            <Link href="/pilates/pricing">
              <Button size="lg" variant="outline" className="border-white bg-white/10 text-white hover:bg-white hover:text-secondary text-lg h-14 px-8">
                View Pricing
              </Button>
            </Link>
          </div>
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
