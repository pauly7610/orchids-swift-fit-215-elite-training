"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Users, Sparkles, CheckCircle2, Target, Smile } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
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
            <Link href="/pilates/about" className="text-primary transition-colors text-sm font-medium">About</Link>
            <Link href="/pilates/instructors" className="text-white/80 hover:text-primary transition-colors text-sm font-medium">Instructors</Link>
            <Link href="/pilates/classes" className="text-white/80 hover:text-primary transition-colors text-sm font-medium">Classes</Link>
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
              Our Story
            </Badge>
            <h1 className="font-display text-5xl md:text-7xl text-white mb-6 tracking-wide">
              ABOUT US
            </h1>
            <p className="text-xl text-white/80 leading-relaxed">
              Swift Fit Pilates & Wellness Studio is a warm, welcoming space created for real people on real journeys.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-4xl md:text-5xl text-secondary mb-6 tracking-wide">
                OUR MISSION
              </h2>
            </div>
            
            <Card className="p-8 md:p-12 mb-12">
              <p className="text-xl text-foreground leading-relaxed mb-6">
                Our mission is simple: to provide a safe, supportive environment where you can work on you. We believe in building healthy habits, nurturing the mind–body connection, and giving you the space to take what you need from every session—strength, clarity, community, or peace.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Every class is designed with intention, guided by instructors who genuinely care about your well-being and your progress.
              </p>
            </Card>

            <div className="text-center mb-12">
              <p className="text-2xl font-display text-primary mb-4">
                IT'S NOT ABOUT BEING PERFECT
              </p>
              <p className="text-xl text-foreground italic">
                It's about showing up, moving with purpose, and becoming the best version of yourself, one day at a time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-4xl md:text-5xl text-secondary mb-6 tracking-wide">
                WHAT WE OFFER
              </h2>
              <p className="text-lg text-muted-foreground">
                Here, everyone is invited to show up exactly as they are and grow into who they're becoming.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <Card className="p-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Mat Pilates</h3>
                <p className="text-muted-foreground">
                  Build core strength, improve flexibility, and enhance body awareness through intentional movement on the mat.
                </p>
              </Card>

              <Card className="p-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Yoga</h3>
                <p className="text-muted-foreground">
                  Flow through sequences that connect breath with movement, cultivating strength, balance, and inner peace.
                </p>
              </Card>

              <Card className="p-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Fitness & Strength</h3>
                <p className="text-muted-foreground">
                  Break a sweat in dynamic workout classes that build endurance, power, and confidence.
                </p>
              </Card>

              <Card className="p-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Smile className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Meditation & Wellness</h3>
                <p className="text-muted-foreground">
                  Ground yourself through guided meditation, breathwork, and holistic wellness practices.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-4xl md:text-5xl text-secondary mb-6 tracking-wide">
                OUR VALUES
              </h2>
            </div>

            <div className="space-y-6">
              <Card className="p-6 border-l-4 border-l-primary">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Inclusivity & Welcome</h3>
                    <p className="text-muted-foreground">
                      Everyone is invited to show up exactly as they are. No judgment, no pressure—just support and encouragement.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-l-4 border-l-primary">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Mind-Body Connection</h3>
                    <p className="text-muted-foreground">
                      We nurture the relationship between physical movement and mental well-being, helping you find balance in both.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-l-4 border-l-primary">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Intentional Practice</h3>
                    <p className="text-muted-foreground">
                      Every class is thoughtfully designed with purpose, allowing you to take what you need—whether it's strength, clarity, or peace.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-l-4 border-l-primary">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Community & Support</h3>
                    <p className="text-muted-foreground">
                      More than a studio, we're a community of individuals supporting each other's journeys toward wellness.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-l-4 border-l-primary">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Personal Growth</h3>
                    <p className="text-muted-foreground">
                      We celebrate progress over perfection, honoring wherever you are in your journey and helping you move forward.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Studio Manager Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-4xl md:text-5xl text-secondary mb-6 tracking-wide">
                STUDIO LEADERSHIP
              </h2>
            </div>

            <Card className="p-8 md:p-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-display tracking-wide text-primary">DESERAE C. SMITH</h3>
                  <p className="text-muted-foreground">Studio Manager</p>
                </div>
              </div>
              
              <div className="space-y-4 text-muted-foreground">
                <p>
                  With nearly a decade of experience in the wellness industry and over 15 years as a dedicated business owner, Deserae brings deep leadership, compassion, and expertise to her role as Studio Manager at Swift Fit Pilates & Wellness Studio.
                </p>
                <p>
                  Having previously owned a yoga studio and led countless yoga, meditation, and holistic wellness experiences, she understands what it takes to create a space where people feel supported, grounded, and inspired.
                </p>
                <p>
                  Her passion for mind–body wellness shines through in everything she does—from supporting instructors to guiding members through their journey, to ensuring the studio runs smoothly and feels like a second home for the community.
                </p>
                <p>
                  She is committed to maintaining Swift Fit as a welcoming, inclusive, and uplifting space where every person can grow at their own pace.
                </p>
                <p className="italic text-foreground font-medium">
                  Rooted in heart-centered leadership and a deep belief in the power of movement and healing, she is devoted to helping others thrive, feel connected, and leave the studio feeling better than when they arrived.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-secondary via-secondary/95 to-black">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-4xl md:text-5xl text-white mb-6 tracking-wide">
            READY TO JOIN OUR COMMUNITY?
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Experience the warmth and support of our studio. Your journey starts here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pilates/schedule">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white text-lg h-14 px-8">
                Book Your First Class
              </Button>
            </Link>
            <Link href="/pilates/instructors">
              <Button size="lg" variant="outline" className="border-white bg-white/10 text-white hover:bg-white hover:text-secondary text-lg h-14 px-8">
                Meet Our Instructors
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
