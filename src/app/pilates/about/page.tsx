"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Heart, Sparkles, CheckCircle2, Target, Smile } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function AboutPage() {
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
            <Link href="/pilates/about" className="text-[#9BA899] font-medium transition-colors text-sm">About</Link>
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
      <section className="pt-32 pb-16 bg-linear-to-b from-[#F5F2EE] to-[#FAF8F5] relative overflow-hidden">
        <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-[#9BA899]/5 blur-3xl"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-serif text-5xl md:text-6xl text-[#5A5550] mb-4 font-light">
              About Us
            </h1>
            <p className="text-lg text-[#7A736B] leading-relaxed">
              Swift Fit Pilates & Wellness Studio is a warm, welcoming space created for real people on real journeys.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-serif text-4xl md:text-5xl text-[#5A5550] mb-6 font-light">
                Our Mission
              </h2>
            </div>
            
            <Card className="p-8 md:p-12 mb-12 border-[#B8AFA5]/30 bg-[#FAF8F5]">
              <p className="text-xl text-[#5A5550] leading-relaxed mb-6">
                Our mission is simple: to provide a safe, supportive environment where you can work on you. We believe in building healthy habits, nurturing the mind–body connection, and giving you the space to take what you need from every session—strength, clarity, community, or peace.
              </p>
              <p className="text-lg text-[#7A736B] leading-relaxed">
                Every class is designed with intention, guided by instructors who genuinely care about your well-being and your progress.
              </p>
            </Card>

            <div className="text-center mb-12">
              <p className="text-2xl font-serif text-[#9BA899] mb-4 font-light">
                It's Not About Being Perfect
              </p>
              <p className="text-xl text-[#5A5550] italic font-light">
                It's about showing up, moving with purpose, and becoming the best version of yourself, one day at a time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="py-20 bg-[#F5F2EE]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-serif text-4xl md:text-5xl text-[#5A5550] mb-6 font-light">
                What We Offer
              </h2>
              <p className="text-base text-[#7A736B]">
                Here, everyone is invited to show up exactly as they are and grow into who they're becoming.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <Card className="p-6 border-[#B8AFA5]/30 bg-white">
                <div className="h-12 w-12 rounded-full bg-[#9BA899]/10 flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-[#9BA899]" />
                </div>
                <h3 className="text-xl font-serif font-normal text-[#5A5550] mb-3">Mat Pilates</h3>
                <p className="text-[#7A736B]">
                  Build core strength, improve flexibility, and enhance body awareness through intentional movement on the mat.
                </p>
              </Card>

              <Card className="p-6 border-[#B8AFA5]/30 bg-white">
                <div className="h-12 w-12 rounded-full bg-[#9BA899]/10 flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-[#9BA899]" />
                </div>
                <h3 className="text-xl font-serif font-normal text-[#5A5550] mb-3">Yoga</h3>
                <p className="text-[#7A736B]">
                  Flow through sequences that connect breath with movement, cultivating strength, balance, and inner peace.
                </p>
              </Card>

              <Card className="p-6 border-[#B8AFA5]/30 bg-white">
                <div className="h-12 w-12 rounded-full bg-[#9BA899]/10 flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-[#9BA899]" />
                </div>
                <h3 className="text-xl font-serif font-normal text-[#5A5550] mb-3">Fitness & Strength</h3>
                <p className="text-[#7A736B]">
                  Break a sweat in dynamic workout classes that build endurance, power, and confidence.
                </p>
              </Card>

              <Card className="p-6 border-[#B8AFA5]/30 bg-white">
                <div className="h-12 w-12 rounded-full bg-[#9BA899]/10 flex items-center justify-center mb-4">
                  <Smile className="h-6 w-6 text-[#9BA899]" />
                </div>
                <h3 className="text-xl font-serif font-normal text-[#5A5550] mb-3">Meditation & Wellness</h3>
                <p className="text-[#7A736B]">
                  Ground yourself through guided meditation, breathwork, and holistic wellness practices.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-serif text-4xl md:text-5xl text-[#5A5550] mb-6 font-light">
                Our Values
              </h2>
            </div>

            <div className="space-y-6">
              <Card className="p-6 border-l-4 border-l-[#9BA899] border-[#B8AFA5]/30 bg-[#FAF8F5]">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="h-6 w-6 text-[#9BA899] mt-1 shrink-0" />
                  <div>
                    <h3 className="text-xl font-serif font-normal text-[#5A5550] mb-2">Inclusivity & Welcome</h3>
                    <p className="text-[#7A736B]">
                      Everyone is invited to show up exactly as they are. No judgment, no pressure—just support and encouragement.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-l-4 border-l-[#9BA899] border-[#B8AFA5]/30 bg-[#FAF8F5]">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="h-6 w-6 text-[#9BA899] mt-1 shrink-0" />
                  <div>
                    <h3 className="text-xl font-serif font-normal text-[#5A5550] mb-2">Mind-Body Connection</h3>
                    <p className="text-[#7A736B]">
                      We nurture the relationship between physical movement and mental well-being, helping you find balance in both.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-l-4 border-l-[#9BA899] border-[#B8AFA5]/30 bg-[#FAF8F5]">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="h-6 w-6 text-[#9BA899] mt-1 shrink-0" />
                  <div>
                    <h3 className="text-xl font-serif font-normal text-[#5A5550] mb-2">Intentional Practice</h3>
                    <p className="text-[#7A736B]">
                      Every class is thoughtfully designed with purpose, allowing you to take what you need—whether it's strength, clarity, or peace.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-l-4 border-l-[#9BA899] border-[#B8AFA5]/30 bg-[#FAF8F5]">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="h-6 w-6 text-[#9BA899] mt-1 shrink-0" />
                  <div>
                    <h3 className="text-xl font-serif font-normal text-[#5A5550] mb-2">Community & Support</h3>
                    <p className="text-[#7A736B]">
                      More than a studio, we're a community of individuals supporting each other's journeys toward wellness.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-l-4 border-l-[#9BA899] border-[#B8AFA5]/30 bg-[#FAF8F5]">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="h-6 w-6 text-[#9BA899] mt-1 shrink-0" />
                  <div>
                    <h3 className="text-xl font-serif font-normal text-[#5A5550] mb-2">Personal Growth</h3>
                    <p className="text-[#7A736B]">
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
      <section className="py-20 bg-[#F5F2EE]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-serif text-4xl md:text-5xl text-[#5A5550] mb-6 font-light">
                Studio Leadership
              </h2>
            </div>

            <Card className="p-8 md:p-12 border-[#B8AFA5]/30 bg-white">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-24 w-24 rounded-full overflow-hidden shrink-0 border-2 border-[#B8AFA5]">
                  <Image
                    src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/image-1764789079370.png"
                    alt="Deserae C. Smith"
                    width={96}
                    height={96}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-serif text-[#9BA899] font-light">Deserae C. Smith</h3>
                  <p className="text-[#7A736B]">Studio Manager</p>
                </div>
              </div>
              
              <div className="space-y-4 text-[#7A736B]">
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
                <p className="italic text-[#5A5550] font-serif text-lg">
                  Rooted in heart-centered leadership and a deep belief in the power of movement and healing, she is devoted to helping others thrive, feel connected, and leave the studio feeling better than when they arrived.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-linear-to-b from-[#9BA899]/10 to-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#B8AFA5]/10 blur-3xl"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="font-serif text-4xl md:text-5xl text-[#5A5550] mb-6 font-light">
            Ready to Join Our Community?
          </h2>
          <p className="text-lg text-[#7A736B] mb-8 max-w-2xl mx-auto">
            Experience the warmth and support of our studio. Your journey starts here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pilates/schedule">
              <Button size="lg" className="bg-[#9BA899] hover:bg-[#8A9788] text-white text-base h-12 px-8 rounded-full">
                Book Your First Class
              </Button>
            </Link>
            <Link href="/pilates/instructors">
              <Button size="lg" variant="outline" className="border-[#B8AFA5] bg-white text-[#5A5550] hover:bg-[#F5F2EE] text-base h-12 px-8 rounded-full">
                Meet Our Instructors
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