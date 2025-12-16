"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Users, Zap, Calendar, DollarSign, Clock, ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { PilatesEmailPopup } from "@/components/pilates-email-popup"
import { SoftOpeningBanner, WeeklyClassSchedule } from "@/components/weekly-class-schedule"
import { PilatesNav } from "@/components/pilates-nav"
import { AdminBar } from "@/components/admin-bar"

export default function PilatesLanding() {
  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Admin Bar - only shows for admins */}
      <AdminBar currentPage="other" />
      
      {/* Email Signup Popup */}
      <PilatesEmailPopup delayMs={3000} />

      {/* Shared Navigation with Sign In/Register */}
      <PilatesNav />

      {/* CTA Banner */}
      <div className="fixed top-[65px] md:top-[73px] left-0 right-0 z-40 bg-linear-to-r from-[#E8B4B8]/90 via-[#9BA899]/90 to-[#B8AFA5]/90 backdrop-blur-sm border-b border-white/20">
        <div className="container mx-auto px-4 py-2.5 md:py-3 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 md:gap-3 text-center sm:text-left">
            <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-white shrink-0" />
            <p className="text-white font-medium text-xs sm:text-sm md:text-base">
              <span className="hidden sm:inline">New Students: </span>Try 3 classes for just $49! 
              <span className="hidden md:inline ml-1">🎉 Limited time offer</span>
            </p>
          </div>
          <Link href="/pilates/schedule" className="w-full sm:w-auto">
            <Button size="sm" className="bg-white text-[#5A5550] hover:bg-white/90 rounded-full font-semibold w-full sm:w-auto text-xs md:text-sm">
              Book Now
            </Button>
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-[120px] pb-16 md:pt-[160px] md:pb-32 overflow-hidden bg-linear-to-b from-[#F5F2EE] to-[#FAF8F5]">
        <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-[#9BA899]/5 blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-[#B8AFA5]/5 blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6 md:mb-8 inline-block">
              <div className="relative w-24 h-24 md:w-32 md:h-32 mx-auto mb-4 md:mb-6">
                <Image
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/image-1765052969010.png?width=8000&height=8000&resize=contain"
                  alt="Swift Fit Pilates and Wellness Studio"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-[#5A5550] mb-3 md:mb-4 leading-tight font-light">
              Swift Fit
            </h1>
            <p className="text-xs md:text-sm tracking-[0.3em] text-[#9BA899] mb-6 md:mb-8 uppercase">
              Pilates and Wellness Studio
            </p>
            <p className="text-lg md:text-xl lg:text-2xl text-[#5A5550] mb-3 md:mb-4 font-light leading-relaxed px-4">
              A warm, welcoming space created for real people on real journeys.
            </p>
            <p className="text-sm md:text-base text-[#7A736B] mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed px-4">
              Whether you're stepping onto the mat for Pilates, flowing through yoga, breaking a sweat in a workout class, or grounding yourself through meditation and wellness workshops, this is your place to reset, recharge, and rise.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4">
              <Link href="/pilates/schedule" className="w-full sm:w-auto">
                <Button size="lg" className="bg-[#9BA899] hover:bg-[#8A9788] text-white text-sm md:text-base h-11 md:h-12 px-6 md:px-8 rounded-full w-full">
                  Book a Class
                </Button>
              </Link>
              <Link href="/pilates/pricing" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="border-[#B8AFA5] bg-white text-[#5A5550] hover:bg-[#F5F2EE] text-sm md:text-base h-11 md:h-12 px-6 md:px-8 rounded-full w-full">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-[#5A5550] mb-6 md:mb-8 font-light px-4">
              Our Mission
            </h2>
            <p className="text-base md:text-lg text-[#7A736B] leading-relaxed mb-4 md:mb-6 px-4">
              To provide a safe, supportive environment where you can work on you. We believe in building healthy habits, nurturing the mind–body connection, and giving you the space to take what you need from every session—strength, clarity, community, or peace.
            </p>
            <p className="text-lg md:text-base font-serif italic md:text-xl text-[#5A5550] px-4">
              At Swift Fit, it's not about being perfect. It's about showing up, moving with purpose, and becoming the best version of yourself, one day at a time.
            </p>
          </div>
        </div>
      </section>

      {/* Schedule Preview Section */}
      <section className="py-16 md:py-20 bg-[#FAF8F5]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <Badge className="mb-4 bg-[#E8B4B8]/20 text-[#5A5550] border-[#E8B4B8]">Coming Soon</Badge>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-[#5A5550] mb-3 md:mb-4 font-light px-4">
              Upcoming Classes
            </h2>
            <p className="text-sm md:text-base text-[#7A736B] max-w-2xl mx-auto px-4">
              Mark your calendars! Our soft opening is December 13, and regular classes begin December 15.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-12">
            <SoftOpeningBanner />
            <WeeklyClassSchedule />
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-16 md:py-20 bg-[#F5F2EE]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-[#5A5550] mb-3 md:mb-4 font-light px-4">
              Explore Our Studio
            </h2>
            <p className="text-sm md:text-base text-[#7A736B] px-4">
              Everything you need to start your wellness journey
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto">
            <Link href="/pilates/about">
              <Card className="border-[#B8AFA5]/30 hover:border-[#9BA899] transition-all group cursor-pointer h-full bg-white hover:shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#9BA899]/10 flex items-center justify-center mb-3 md:mb-4 group-hover:bg-[#9BA899]/20 transition-colors">
                    <Heart className="h-6 w-6 md:h-7 md:w-7 text-[#9BA899]" />
                  </div>
                  <CardTitle className="text-lg md:text-xl text-[#5A5550] flex items-center justify-between font-serif font-normal">
                    About Us
                    <ArrowRight className="h-5 w-5 text-[#9BA899] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-[#7A736B] text-sm">
                    Learn about our philosophy, values, and what makes our studio a welcoming space for everyone.
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>

            <Link href="/pilates/instructors">
              <Card className="border-[#B8AFA5]/30 hover:border-[#9BA899] transition-all group cursor-pointer h-full bg-white hover:shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#9BA899]/10 flex items-center justify-center mb-3 md:mb-4 group-hover:bg-[#9BA899]/20 transition-colors">
                    <Users className="h-6 w-6 md:h-7 md:w-7 text-[#9BA899]" />
                  </div>
                  <CardTitle className="text-lg md:text-xl text-[#5A5550] flex items-center justify-between font-serif font-normal">
                    Meet the Team
                    <ArrowRight className="h-5 w-5 text-[#9BA899] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-[#7A736B] text-sm">
                    Get to know our passionate instructors who guide you through every step of your journey.
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>

            <Link href="/pilates/classes">
              <Card className="border-[#B8AFA5]/30 hover:border-[#9BA899] transition-all group cursor-pointer h-full bg-white hover:shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#9BA899]/10 flex items-center justify-center mb-3 md:mb-4 group-hover:bg-[#9BA899]/20 transition-colors">
                    <Zap className="h-6 w-6 md:h-7 md:w-7 text-[#9BA899]" />
                  </div>
                  <CardTitle className="text-lg md:text-xl text-[#5A5550] flex items-center justify-between font-serif font-normal">
                    Class Types
                    <ArrowRight className="h-5 w-5 text-[#9BA899] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-[#7A736B] text-sm">
                    Explore our diverse class offerings from Mat Pilates to yoga, meditation, and dance fitness.
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>

            <Link href="/pilates/pricing">
              <Card className="border-[#B8AFA5]/30 hover:border-[#9BA899] transition-all group cursor-pointer h-full bg-white hover:shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#9BA899]/10 flex items-center justify-center mb-3 md:mb-4 group-hover:bg-[#9BA899]/20 transition-colors">
                    <DollarSign className="h-6 w-6 md:h-7 md:w-7 text-[#9BA899]" />
                  </div>
                  <CardTitle className="text-lg md:text-xl text-[#5A5550] flex items-center justify-between font-serif font-normal">
                    Pricing & Packages
                    <ArrowRight className="h-5 w-5 text-[#9BA899] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-[#7A736B] text-sm">
                    Find the perfect package for your needs, from drop-in classes to unlimited monthly memberships.
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>

            <Link href="/pilates/schedule">
              <Card className="border-[#B8AFA5]/30 hover:border-[#9BA899] transition-all group cursor-pointer h-full bg-white hover:shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#9BA899]/10 flex items-center justify-center mb-3 md:mb-4 group-hover:bg-[#9BA899]/20 transition-colors">
                    <Calendar className="h-6 w-6 md:h-7 md:w-7 text-[#9BA899]" />
                  </div>
                  <CardTitle className="text-lg md:text-xl text-[#5A5550] flex items-center justify-between font-serif font-normal">
                    Class Schedule
                    <ArrowRight className="h-5 w-5 text-[#9BA899] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-[#7A736B] text-sm">
                    View our full schedule and book your spot in upcoming classes. Up to 50 spots per class.
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>

            <Link href="/pilates/faq">
              <Card className="border-[#B8AFA5]/30 hover:border-[#9BA899] transition-all group cursor-pointer h-full bg-white hover:shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#9BA899]/10 flex items-center justify-center mb-3 md:mb-4 group-hover:bg-[#9BA899]/20 transition-colors">
                    <Clock className="h-6 w-6 md:h-7 md:w-7 text-[#9BA899]" />
                  </div>
                  <CardTitle className="text-lg md:text-xl text-[#5A5550] flex items-center justify-between font-serif font-normal">
                    FAQs
                    <ArrowRight className="h-5 w-5 text-[#9BA899] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-[#7A736B] text-sm">
                    Get answers to common questions about classes, what to bring, and studio policies.
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-linear-to-b from-[#9BA899]/10 to-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#B8AFA5]/10 blur-3xl"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-[#5A5550] mb-4 md:mb-6 font-light px-4">
            Ready to Begin Your Journey?
          </h2>
          <p className="text-base md:text-lg text-[#7A736B] mb-8 md:mb-10 max-w-2xl mx-auto px-4">
            Join our community and experience the transformation. Your first step starts here.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4">
            <Link href="/pilates/schedule" className="w-full sm:w-auto">
              <Button size="lg" className="bg-[#9BA899] hover:bg-[#8A9788] text-white text-sm md:text-base h-11 md:h-12 px-6 md:px-8 rounded-full w-full">
                Book Your First Class
              </Button>
            </Link>
            <Link href="/pilates/pricing" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="border-[#B8AFA5] bg-white text-[#5A5550] hover:bg-[#F5F2EE] text-sm md:text-base h-11 md:h-12 px-6 md:px-8 rounded-full w-full">
                View New Student Intro
              </Button>
            </Link>
          </div>
          <p className="text-xs md:text-sm text-[#9BA899] mt-4 md:mt-6 px-4">
            New students: Try 3 classes for just $49!
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#5A5550] text-[#FAF8F5] py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 md:gap-12 mb-8 md:mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full border border-[#B8AFA5] flex items-center justify-center">
                  <Heart className="h-5 w-5 text-[#B8AFA5]" fill="#B8AFA5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg md:text-xl tracking-wide">Swift Fit</h3>
                  <p className="text-[10px] md:text-xs text-[#9BA899] tracking-wider">PILATES AND WELLNESS</p>
                </div>
              </div>
              <p className="text-[#B8AFA5] text-xs md:text-sm leading-relaxed">
                A warm, welcoming space for real people on real journeys.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 md:mb-4 text-[#FAF8F5] text-sm md:text-base">Quick Links</h4>
              <ul className="space-y-2 text-xs md:text-sm text-[#B8AFA5]">
                <li><Link href="/pilates/about" className="hover:text-[#9BA899] transition-colors">About</Link></li>
                <li><Link href="/pilates/instructors" className="hover:text-[#9BA899] transition-colors">Instructors</Link></li>
                <li><Link href="/pilates/classes" className="hover:text-[#9BA899] transition-colors">Classes</Link></li>
                <li><Link href="/pilates/pricing" className="hover:text-[#9BA899] transition-colors">Pricing</Link></li>
                <li><Link href="/pilates/schedule" className="hover:text-[#9BA899] transition-colors">Schedule</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 md:mb-4 text-[#FAF8F5] text-sm md:text-base">Contact</h4>
              <ul className="space-y-2 text-xs md:text-sm text-[#B8AFA5]">
                <li>swiftfitpws@gmail.com</li>
                <li>2245 E Tioga Street</li>
                <li>Philadelphia, PA 19134</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#B8AFA5]/20 pt-6 md:pt-8 text-center text-xs md:text-sm text-[#B8AFA5]">
            <p>© 2025 Swift Fit Pilates + Wellness Studio. All rights reserved.</p>
            <p className="mt-2">Part of <Link href="/" className="text-[#9BA899] hover:underline">SwiftFit 215</Link> family</p>
          </div>
        </div>
      </footer>
    </div>
  )
}