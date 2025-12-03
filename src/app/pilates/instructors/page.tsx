"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Users, Award, Sparkles } from "lucide-react"
import Link from "next/link"

const instructors = [
  {
    name: "Des",
    specialty: "Dance Fitness",
    badge: "Certified Fitness Instructor",
    bio: "Hi, my name is Des, your certified fitness instructor! I've been dancing since the age of four and created Dance and Release fitness class to help others build strength, confidence, and inner peace through movement. By day, I work in health care administration, bringing discipline and passion to everything I do. Dance is my freedom, and I'm here to help you find yours.",
    classes: ["Dance Fitness", "Dance and Release"]
  },
  {
    name: "Maisha",
    specialty: "Yoga & Group Fitness",
    badge: "Certified Yoga Instructor • BS Health Sciences",
    bio: "I'm a performance-driven group fitness instructor and certified yoga instructor with a Bachelor's degree in Health Sciences. I blend athletic training with personal growth strategies to help clients level up physically and mentally. I thrive on creating a supportive environment where people can build strength, refine their skills, and unlock next level success.",
    classes: ["Yoga", "Group Fitness"]
  },
  {
    name: "Nasir",
    specialty: "Meditation & Herbal Wellness",
    badge: "Self-Taught Herbalist • Meditation Guide",
    bio: "I am a self-taught herbalist and meditation guide who creates warm, grounding spaces for healing and inner balance. Blending mindfulness, breathwork, and culturally rooted spiritual and herbal practices, I support the wider community in reconnecting with their emotional clarity and natural calm. With gentle guidance and soulful presence that helps others return to themselves and move through life with deeper peace and purpose.",
    classes: ["Meditation", "Herbal Wellness", "Breathwork"]
  },
  {
    name: "Tyra Woods",
    specialty: "Mat Pilates & Personal Training",
    badge: "Certified Personal Trainer • Mat Pilates Coach • PTA",
    bio: "My name is Tyra Woods. I'm a dedicated, Certified Personal Trainer and Mat Pilates Coach from the Mt. Airy section of Philadelphia. With a Bachelor of Science degree in Kinesiology and my current occupation as Physical Therapist Assistant, I've always had a passion for movement and helping others. I'm excited to be a part and share my love for physical wellness with the SwiftFit community.",
    classes: ["Mat Pilates", "Strength Training", "HIIT"]
  },
  {
    name: "Joi",
    specialty: "Mat Pilates & Personal Training",
    badge: "Certified Personal Trainer • Mat Pilates Instructor",
    bio: "Certified personal trainer and mat Pilates instructor helping clients gain strength, balance, and confidence through mindful movement and customized training programs.",
    classes: ["Mat Pilates", "Personal Training"]
  },
  {
    name: "Quadrelle Drelle Jin Harris",
    specialty: "Fitness & Strength Training",
    badge: "Communications & Psychology • Model & Dancer",
    bio: "Quadrelle Drelle Jin Harris, 29. A graduate of Communications and Psychology but also making her mark in athletics (track and gymnastics) and a signed model & dancer. Fitness has brought more than physical gains and community; it has also challenged her mentally which she has been able to travel the US to talk into with brands like Nike, UnderArmour and even Roc Nation. The feel good endorphins of dance fitness, strength training and working with professional Athletes is just the beginning of her purpose and you get to come along on the ride through her classes and training sessions.",
    classes: ["Fitness", "Strength Training", "Athletic Training"]
  }
]

export default function InstructorsPage() {
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
            <Link href="/pilates/instructors" className="text-primary transition-colors text-sm font-medium">Instructors</Link>
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
              Expert Guidance
            </Badge>
            <h1 className="font-display text-5xl md:text-7xl text-white mb-6 tracking-wide">
              MEET OUR INSTRUCTORS
            </h1>
            <p className="text-xl text-white/80 leading-relaxed">
              Our passionate team of certified instructors who genuinely care about your well-being and progress.
            </p>
          </div>
        </div>
      </section>

      {/* Instructors Grid */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8">
              {instructors.map((instructor, index) => (
                <Card key={index} className="p-8 border-2 hover:border-primary transition-colors">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-display tracking-wide text-primary mb-1">
                        {instructor.name.toUpperCase()}
                      </h3>
                      <p className="text-sm font-semibold text-foreground mb-2">{instructor.specialty}</p>
                      <Badge variant="outline" className="text-xs">
                        <Award className="h-3 w-3 mr-1" />
                        {instructor.badge}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {instructor.bio}
                  </p>
                  
                  <div className="pt-4 border-t">
                    <p className="text-sm font-semibold mb-2">Classes:</p>
                    <div className="flex flex-wrap gap-2">
                      {instructor.classes.map((classType, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {classType}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Instructor Philosophy Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-4xl md:text-5xl text-secondary mb-6 tracking-wide">
                OUR TEACHING PHILOSOPHY
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 text-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Care & Compassion</h3>
                <p className="text-sm text-muted-foreground">
                  We genuinely care about your well-being and progress, creating a supportive environment for growth.
                </p>
              </Card>

              <Card className="p-6 text-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Expert Guidance</h3>
                <p className="text-sm text-muted-foreground">
                  Certified instructors with diverse backgrounds bring expertise and passion to every class.
                </p>
              </Card>

              <Card className="p-6 text-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Intentional Design</h3>
                <p className="text-sm text-muted-foreground">
                  Every class is thoughtfully designed with purpose, allowing you to take what you need.
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
            EXPERIENCE THE DIFFERENCE
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Train with passionate instructors who are dedicated to your success and well-being.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pilates/schedule">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white text-lg h-14 px-8">
                Book a Class
              </Button>
            </Link>
            <Link href="/pilates/classes">
              <Button size="lg" variant="outline" className="border-white bg-white/10 text-white hover:bg-white hover:text-secondary text-lg h-14 px-8">
                View Class Types
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
