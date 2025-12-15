"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Activity, Wind, Flame, Brain, Music, Users } from "lucide-react"
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
    instructor: "Life",
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
    instructor: "Drelle, Jewlz, Tyra",
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
    instructor: "Des",
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
    name: "Group Fitness / Zumba",
    icon: Users,
    instructor: "Ivori",
    description: "High-energy group fitness classes that combine dance moves with cardio for a fun, full-body workout. Get moving to upbeat music while burning calories and building endurance in a supportive group environment.",
    benefits: [
      "High-energy cardio workout",
      "Fun, dance-based movements",
      "Community and group motivation",
      "Full-body conditioning",
      "Stress relief through movement"
    ],
    bestFor: "All levels - come ready to move and have fun"
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
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#FAF8F5]/95 backdrop-blur-sm border-b border-[#B8AFA5]/20">
        <div className="container mx-auto px-4 py-5 flex items-center justify-between">
          <Link href="/pilates" className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-full bg-[#9BA899]/10 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full border-2 border-[#B8AFA5] flex items-center justify-center">
                <Heart className="h-5 w-5 text-[#B8AFA5]" fill="#B8AFA5" />
              </div>
            </div>
            <div>
              <h1 className="font-serif text-xl tracking-wide text-[#5A5550]">Swift Fit</h1>
              <p className="text-xs text-[#9BA899] -mt-0.5 tracking-wider">PILATES AND WELLNESS STUDIO</p>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/pilates/about" className="text-[#5A5550] hover:text-[#9BA899] transition-colors text-sm">About</Link>
            <Link href="/pilates/instructors" className="text-[#5A5550] hover:text-[#9BA899] transition-colors text-sm">Instructors</Link>
            <Link href="/pilates/classes" className="text-[#9BA899] font-medium transition-colors text-sm">Classes</Link>
            <Link href="/pilates/pricing" className="text-[#5A5550] hover:text-[#9BA899] transition-colors text-sm">Pricing</Link>
            <Link href="/pilates/schedule" className="text-[#5A5550] hover:text-[#9BA899] transition-colors text-sm">Schedule</Link>
            <Link href="/pilates/faq" className="text-[#5A5550] hover:text-[#9BA899] transition-colors text-sm">FAQ</Link>
            <Link href="/">
              <Button size="sm" variant="outline" className="border-[#B8AFA5] text-[#5A5550] hover:bg-[#9BA899]/10">
                Back to Gym
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-[#F5F2EE] to-[#FAF8F5] relative overflow-hidden">
        <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-[#9BA899]/5 blur-3xl"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-serif text-5xl md:text-6xl text-[#5A5550] mb-4 font-light">
              Class Types
            </h1>
            <p className="text-lg text-[#7A736B] leading-relaxed">
              From Mat Pilates to yoga, meditation, and dance fitness - find the perfect class for your journey.
            </p>
          </div>
        </div>
      </section>

      {/* Class Types Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="space-y-8">
              {classTypes.map((classType, index) => {
                const Icon = classType.icon
                return (
                  <Card key={index} className="p-8 border-2 border-[#B8AFA5]/30 hover:border-[#9BA899] transition-all bg-[#FAF8F5]">
                    <div className="grid md:grid-cols-3 gap-8">
                      <div className="md:col-span-2">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="h-16 w-16 rounded-full bg-[#9BA899]/10 flex items-center justify-center flex-shrink-0 border border-[#B8AFA5]/30">
                            <Icon className="h-8 w-8 text-[#9BA899]" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-3xl font-serif text-[#5A5550] mb-2 font-light">
                              {classType.name}
                            </h3>
                            <p className="text-sm text-[#7A736B] mb-1">
                              <span className="font-semibold">Instructor:</span> {classType.instructor}
                            </p>
                            <Badge variant="outline" className="text-xs border-[#9BA899] text-[#5A5550]">
                              {classType.bestFor}
                            </Badge>
                          </div>
                        </div>
                        
                        <p className="text-[#7A736B] leading-relaxed mb-6">
                          {classType.description}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-[#5A5550] mb-3">Benefits:</h4>
                        <ul className="space-y-2">
                          {classType.benefits.map((benefit, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-[#7A736B]">
                              <div className="h-1.5 w-1.5 rounded-full bg-[#9BA899] mt-2 flex-shrink-0" />
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
      <section className="py-20 bg-[#F5F2EE]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-serif text-4xl md:text-5xl text-[#5A5550] mb-6 font-light">
                What to Expect
              </h2>
              <p className="text-base text-[#7A736B]">
                Every class is designed with intention and guided by instructors who care about your progress.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 border-[#B8AFA5]/30 bg-white">
                <h3 className="text-xl font-serif font-normal text-[#5A5550] mb-3">Class Size</h3>
                <p className="text-[#7A736B]">
                  Maximum 50 students per class to ensure quality instruction while maintaining community energy.
                </p>
              </Card>

              <Card className="p-6 border-[#B8AFA5]/30 bg-white">
                <h3 className="text-xl font-serif font-normal text-[#5A5550] mb-3">Duration</h3>
                <p className="text-[#7A736B]">
                  Most classes are 60 minutes, perfectly designed to fit into your busy schedule while providing a complete workout.
                </p>
              </Card>

              <Card className="p-6 border-[#B8AFA5]/30 bg-white">
                <h3 className="text-xl font-serif font-normal text-[#5A5550] mb-3">All Levels Welcome</h3>
                <p className="text-[#7A736B]">
                  Whether you're brand new or experienced, our instructors provide modifications and progressions for every ability level.
                </p>
              </Card>

              <Card className="p-6 border-[#B8AFA5]/30 bg-white">
                <h3 className="text-xl font-serif font-normal text-[#5A5550] mb-3">Intentional Practice</h3>
                <p className="text-[#7A736B]">
                  Take what you need from each session - whether it's strength, clarity, community, or peace.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-[#9BA899]/10 to-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#B8AFA5]/10 blur-3xl"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="font-serif text-4xl md:text-5xl text-[#5A5550] mb-6 font-light">
            Ready to Try a Class?
          </h2>
          <p className="text-lg text-[#7A736B] mb-8 max-w-2xl mx-auto">
            View our schedule and book your spot in an upcoming class. New students get 3 classes for just $49!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pilates/schedule">
              <Button size="lg" className="bg-[#9BA899] hover:bg-[#8A9788] text-white text-base h-12 px-8 rounded-full">
                View Schedule & Book
              </Button>
            </Link>
            <Link href="/pilates/pricing">
              <Button size="lg" variant="outline" className="border-[#B8AFA5] bg-white text-[#5A5550] hover:bg-[#F5F2EE] text-base h-12 px-8 rounded-full">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#5A5550] text-[#FAF8F5] py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full border border-[#B8AFA5] flex items-center justify-center">
                  <Heart className="h-5 w-5 text-[#B8AFA5]" fill="#B8AFA5" />
                </div>
                <div>
                  <h3 className="font-serif text-xl tracking-wide">Swift Fit</h3>
                  <p className="text-xs text-[#9BA899] tracking-wider">PILATES AND WELLNESS</p>
                </div>
              </div>
              <p className="text-[#B8AFA5] text-sm leading-relaxed">
                A warm, welcoming space for real people on real journeys.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-[#FAF8F5]">Quick Links</h4>
              <ul className="space-y-2 text-sm text-[#B8AFA5]">
                <li><Link href="/pilates" className="hover:text-[#9BA899] transition-colors">Home</Link></li>
                <li><Link href="/pilates/about" className="hover:text-[#9BA899] transition-colors">About</Link></li>
                <li><Link href="/pilates/instructors" className="hover:text-[#9BA899] transition-colors">Instructors</Link></li>
                <li><Link href="/pilates/classes" className="hover:text-[#9BA899] transition-colors">Classes</Link></li>
                <li><Link href="/pilates/pricing" className="hover:text-[#9BA899] transition-colors">Pricing</Link></li>
                <li><Link href="/pilates/schedule" className="hover:text-[#9BA899] transition-colors">Schedule</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-[#FAF8F5]">Contact</h4>
              <ul className="space-y-2 text-sm text-[#B8AFA5]">
                <li>swiftfitpws@gmail.com</li>
                <li>2245 E Tioga Street</li>
                <li>Philadelphia, PA 19134</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#B8AFA5]/20 pt-8 text-center text-sm text-[#B8AFA5]">
            <p>© 2025 Swift Fit Pilates + Wellness Studio. All rights reserved.</p>
            <p className="mt-2">Part of <Link href="/" className="text-[#9BA899] hover:underline">SwiftFit 215</Link> family</p>
          </div>
        </div>
      </footer>
    </div>
  )
}