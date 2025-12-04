"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Users, Zap, Calendar, DollarSign, Clock, ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function PilatesLanding() {
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
            <Link href="/pilates/classes" className="text-[#5A5550] hover:text-[#9BA899] transition-colors text-sm">Classes</Link>
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
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden bg-gradient-to-b from-[#F5F2EE] to-[#FAF8F5]">
        <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-[#9BA899]/5 blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-[#B8AFA5]/5 blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8 inline-block">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#9BA899]/10 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full border-2 border-[#B8AFA5] flex items-center justify-center">
                  <Heart className="h-10 w-10 text-[#B8AFA5]" fill="#B8AFA5" />
                </div>
              </div>
            </div>
            <h1 className="font-serif text-5xl md:text-7xl text-[#5A5550] mb-4 leading-tight font-light">
              Swift Fit
            </h1>
            <p className="text-sm tracking-[0.3em] text-[#9BA899] mb-8 uppercase">
              Pilates and Wellness Studio
            </p>
            <p className="text-xl md:text-2xl text-[#5A5550] mb-4 font-light leading-relaxed">
              A warm, welcoming space created for real people on real journeys.
            </p>
            <p className="text-base text-[#7A736B] mb-12 max-w-2xl mx-auto leading-relaxed">
              Whether you're stepping onto the mat for Pilates, flowing through yoga, breaking a sweat in a workout class, or grounding yourself through meditation and wellness workshops, this is your place to reset, recharge, and rise.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/pilates/schedule">
                <Button size="lg" className="bg-[#9BA899] hover:bg-[#8A9788] text-white text-base h-12 px-8 rounded-full">
                  Book a Class
                </Button>
              </Link>
              <Link href="/pilates/pricing">
                <Button size="lg" variant="outline" className="border-[#B8AFA5] bg-white text-[#5A5550] hover:bg-[#F5F2EE] text-base h-12 px-8 rounded-full">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-4xl md:text-5xl text-[#5A5550] mb-8 font-light">
              Our Mission
            </h2>
            <p className="text-lg text-[#7A736B] leading-relaxed mb-6">
              To provide a safe, supportive environment where you can work on you. We believe in building healthy habits, nurturing the mind–body connection, and giving you the space to take what you need from every session—strength, clarity, community, or peace.
            </p>
            <p className="text-base text-[#5A5550] font-serif italic text-xl">
              At Swift Fit, it's not about being perfect. It's about showing up, moving with purpose, and becoming the best version of yourself, one day at a time.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-20 bg-[#F5F2EE]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl text-[#5A5550] mb-4 font-light">
              Explore Our Studio
            </h2>
            <p className="text-base text-[#7A736B]">
              Everything you need to start your wellness journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Link href="/pilates/about">
              <Card className="border-[#B8AFA5]/30 hover:border-[#9BA899] transition-all group cursor-pointer h-full bg-white hover:shadow-lg">
                <CardHeader>
                  <div className="w-14 h-14 rounded-full bg-[#9BA899]/10 flex items-center justify-center mb-4 group-hover:bg-[#9BA899]/20 transition-colors">
                    <Heart className="h-7 w-7 text-[#9BA899]" />
                  </div>
                  <CardTitle className="text-xl text-[#5A5550] flex items-center justify-between font-serif font-normal">
                    About Us
                    <ArrowRight className="h-5 w-5 text-[#9BA899] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-[#7A736B]">
                    Learn about our philosophy, values, and what makes our studio a welcoming space for everyone.
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>

            <Link href="/pilates/instructors">
              <Card className="border-[#B8AFA5]/30 hover:border-[#9BA899] transition-all group cursor-pointer h-full bg-white hover:shadow-lg">
                <CardHeader>
                  <div className="w-14 h-14 rounded-full bg-[#9BA899]/10 flex items-center justify-center mb-4 group-hover:bg-[#9BA899]/20 transition-colors">
                    <Users className="h-7 w-7 text-[#9BA899]" />
                  </div>
                  <CardTitle className="text-xl text-[#5A5550] flex items-center justify-between font-serif font-normal">
                    Meet the Team
                    <ArrowRight className="h-5 w-5 text-[#9BA899] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-[#7A736B]">
                    Get to know our passionate instructors who guide you through every step of your journey.
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>

            <Link href="/pilates/classes">
              <Card className="border-[#B8AFA5]/30 hover:border-[#9BA899] transition-all group cursor-pointer h-full bg-white hover:shadow-lg">
                <CardHeader>
                  <div className="w-14 h-14 rounded-full bg-[#9BA899]/10 flex items-center justify-center mb-4 group-hover:bg-[#9BA899]/20 transition-colors">
                    <Zap className="h-7 w-7 text-[#9BA899]" />
                  </div>
                  <CardTitle className="text-xl text-[#5A5550] flex items-center justify-between font-serif font-normal">
                    Class Types
                    <ArrowRight className="h-5 w-5 text-[#9BA899] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-[#7A736B]">
                    Explore our diverse class offerings from Mat Pilates to yoga, meditation, and dance fitness.
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>

            <Link href="/pilates/pricing">
              <Card className="border-[#B8AFA5]/30 hover:border-[#9BA899] transition-all group cursor-pointer h-full bg-white hover:shadow-lg">
                <CardHeader>
                  <div className="w-14 h-14 rounded-full bg-[#9BA899]/10 flex items-center justify-center mb-4 group-hover:bg-[#9BA899]/20 transition-colors">
                    <DollarSign className="h-7 w-7 text-[#9BA899]" />
                  </div>
                  <CardTitle className="text-xl text-[#5A5550] flex items-center justify-between font-serif font-normal">
                    Pricing & Packages
                    <ArrowRight className="h-5 w-5 text-[#9BA899] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-[#7A736B]">
                    Find the perfect package for your needs, from drop-in classes to unlimited monthly memberships.
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>

            <Link href="/pilates/schedule">
              <Card className="border-[#B8AFA5]/30 hover:border-[#9BA899] transition-all group cursor-pointer h-full bg-white hover:shadow-lg">
                <CardHeader>
                  <div className="w-14 h-14 rounded-full bg-[#9BA899]/10 flex items-center justify-center mb-4 group-hover:bg-[#9BA899]/20 transition-colors">
                    <Calendar className="h-7 w-7 text-[#9BA899]" />
                  </div>
                  <CardTitle className="text-xl text-[#5A5550] flex items-center justify-between font-serif font-normal">
                    Class Schedule
                    <ArrowRight className="h-5 w-5 text-[#9BA899] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-[#7A736B]">
                    View our full schedule and book your spot in upcoming classes. Up to 50 spots per class.
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>

            <Link href="/pilates/faq">
              <Card className="border-[#B8AFA5]/30 hover:border-[#9BA899] transition-all group cursor-pointer h-full bg-white hover:shadow-lg">
                <CardHeader>
                  <div className="w-14 h-14 rounded-full bg-[#9BA899]/10 flex items-center justify-center mb-4 group-hover:bg-[#9BA899]/20 transition-colors">
                    <Clock className="h-7 w-7 text-[#9BA899]" />
                  </div>
                  <CardTitle className="text-xl text-[#5A5550] flex items-center justify-between font-serif font-normal">
                    FAQs
                    <ArrowRight className="h-5 w-5 text-[#9BA899] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-[#7A736B]">
                    Get answers to common questions about classes, what to bring, and studio policies.
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-b from-[#9BA899]/10 to-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#B8AFA5]/10 blur-3xl"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="font-serif text-4xl md:text-5xl text-[#5A5550] mb-6 font-light">
            Ready to Begin Your Journey?
          </h2>
          <p className="text-lg text-[#7A736B] mb-10 max-w-2xl mx-auto">
            Join our community and experience the transformation. Your first step starts here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pilates/schedule">
              <Button size="lg" className="bg-[#9BA899] hover:bg-[#8A9788] text-white text-base h-12 px-8 rounded-full">
                Book Your First Class
              </Button>
            </Link>
            <Link href="/pilates/pricing">
              <Button size="lg" variant="outline" className="border-[#B8AFA5] bg-white text-[#5A5550] hover:bg-[#F5F2EE] text-base h-12 px-8 rounded-full">
                View New Student Intro
              </Button>
            </Link>
          </div>
          <p className="text-sm text-[#9BA899] mt-6">
            New students: Try 3 classes for just $49!
          </p>
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