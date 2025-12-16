"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Award, Sparkles } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { AdminBar } from "@/components/admin-bar"

const instructors = [
  {
    name: "Des",
    specialty: "Dance Fitness",
    badge: "Certified Fitness Instructor",
    bio: "Hi, my name is Des, your certified fitness instructor! I've been dancing since the age of four and created Dance and Release fitness class to help others build strength, confidence, and inner peace through movement. By day, I work in health care administration, bringing discipline and passion to everything I do. Dance is my freedom, and I'm here to help you find yours.",
    classes: ["Dance Fitness", "Dance and Release"],
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/image-1764788581334.png?width=8000&height=8000&resize=contain"
  },
  {
    name: "Life",
    specialty: "Yoga & Group Fitness",
    badge: "Certified Yoga Instructor • BS Health Sciences",
    bio: "I'm a performance-driven group fitness instructor and certified yoga instructor with a Bachelor's degree in Health Sciences. I blend athletic training with personal growth strategies to help clients level up physically and mentally. I thrive on creating a supportive environment where people can build strength, refine their skills, and unlock next level success.",
    classes: ["Yoga", "Group Fitness"],
    image: "" // New profile photo to be provided separately
  },
  {
    name: "Nasir",
    specialty: "Meditation & Herbal Wellness",
    badge: "Self-Taught Herbalist • Meditation Guide",
    bio: "I am a self-taught herbalist and meditation guide who creates warm, grounding spaces for healing and inner balance. Blending mindfulness, breathwork, and culturally rooted spiritual and herbal practices, I support the wider community in reconnecting with their emotional clarity and natural calm. With gentle guidance and soulful presence that helps others return to themselves and move through life with deeper peace and purpose.",
    classes: ["Meditation", "Herbal Wellness", "Breathwork"],
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/image-1764788606511.png?width=8000&height=8000&resize=contain"
  },
  {
    name: "Tyra Woods",
    specialty: "Mat Pilates & Personal Training",
    badge: "Certified Personal Trainer • Mat Pilates Coach • PTA",
    bio: "My name is Tyra Woods. I'm a dedicated, Certified Personal Trainer and Mat Pilates Coach from the Mt. Airy section of Philadelphia. With a Bachelor of Science degree in Kinesiology and my current occupation as Physical Therapist Assistant, I've always had a passion for movement and helping others. I'm excited to be a part and share my love for physical wellness with the SwiftFit community.",
    classes: ["Mat Pilates", "Strength Training", "HIIT"],
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/image-1764788627646.png?width=8000&height=8000&resize=contain"
  },
  {
    name: "Joi",
    specialty: "Mat Pilates & Personal Training",
    badge: "Certified Personal Trainer • Mat Pilates Instructor",
    bio: "Certified personal trainer and mat Pilates instructor helping clients gain strength, balance, and confidence through mindful movement and customized training programs.",
    classes: ["Mat Pilates", "Personal Training"],
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/image-1764788638900.png?width=8000&height=8000&resize=contain"
  },
  {
    name: "Quadrelle Drelle Jin Harris",
    specialty: "Fitness & Strength Training",
    badge: "Communications & Psychology • Model & Dancer",
    bio: "Quadrelle Drelle Jin Harris, 29. A graduate of Communications and Psychology but also making her mark in athletics (track and gymnastics) and a signed model & dancer. Fitness has brought more than physical gains and community; it has also challenged her mentally which she has been able to travel the US to talk into with brands like Nike, UnderArmour and even Roc Nation. The feel good endorphins of dance fitness, strength training and working with professional Athletes is just the beginning of her purpose and you get to come along on the ride through her classes and training sessions.",
    classes: ["Fitness", "Strength Training", "Athletic Training"],
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/image-1764788663358.png?width=8000&height=8000&resize=contain"
  },
  {
    name: "Ivori",
    specialty: "Group Fitness & Zumba",
    badge: "Group Fitness Instructor",
    bio: "Bringing high-energy and positive vibes to every class! Ivori specializes in group fitness and Zumba, creating an inclusive environment where everyone can move, sweat, and have fun together.",
    classes: ["Group Fitness", "Zumba"],
    image: ""
  },
  {
    name: "Jewlz",
    specialty: "Fitness",
    badge: "Fitness Instructor",
    bio: "Jewlz brings passion and dedication to every fitness class, helping you build strength and confidence through dynamic workouts designed to challenge and inspire.",
    classes: ["Fitness"],
    image: ""
  }
]

export default function InstructorsPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Admin Bar - only shows for admins */}
      <AdminBar currentPage="instructors" />
      
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
            <Link href="/pilates/instructors" className="text-[#9BA899] font-medium transition-colors text-sm">Instructors</Link>
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
      <section className="pt-32 pb-16 bg-gradient-to-b from-[#F5F2EE] to-[#FAF8F5] relative overflow-hidden">
        <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-[#9BA899]/5 blur-3xl"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-serif text-5xl md:text-6xl text-[#5A5550] mb-4 font-light">
              Meet Our Instructors
            </h1>
            <p className="text-lg text-[#7A736B] leading-relaxed">
              Our passionate team of certified instructors who genuinely care about your well-being and progress.
            </p>
          </div>
        </div>
      </section>

      {/* Instructors Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8">
              {instructors.map((instructor, index) => (
                <Card key={index} className="p-8 border-2 border-[#B8AFA5]/30 hover:border-[#9BA899] transition-all bg-[#FAF8F5]">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="h-24 w-24 rounded-full overflow-hidden flex-shrink-0 bg-muted border-2 border-[#B8AFA5] flex items-center justify-center">
                      {instructor.image ? (
                        <Image
                          src={instructor.image}
                          alt={instructor.name}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-serif text-[#9BA899]">{instructor.name.charAt(0)}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-serif text-[#5A5550] mb-1 font-light">
                        {instructor.name}
                      </h3>
                      <p className="text-sm font-semibold text-[#9BA899] mb-2">{instructor.specialty}</p>
                      <Badge variant="outline" className="text-xs border-[#B8AFA5] text-[#5A5550]">
                        <Award className="h-3 w-3 mr-1" />
                        {instructor.badge}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-[#7A736B] leading-relaxed mb-4">
                    {instructor.bio}
                  </p>
                  
                  <div className="pt-4 border-t border-[#B8AFA5]/30">
                    <p className="text-sm font-semibold text-[#5A5550] mb-2">Classes:</p>
                    <div className="flex flex-wrap gap-2">
                      {instructor.classes.map((classType, i) => (
                        <Badge key={i} className="text-xs bg-[#9BA899]/20 text-[#5A5550] border-none">
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
      <section className="py-20 bg-[#F5F2EE]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-serif text-4xl md:text-5xl text-[#5A5550] mb-6 font-light">
                Our Teaching Philosophy
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 text-center border-[#B8AFA5]/30 bg-white">
                <div className="h-12 w-12 rounded-full bg-[#9BA899]/10 flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-6 w-6 text-[#9BA899]" />
                </div>
                <h3 className="font-serif font-normal text-lg mb-2 text-[#5A5550]">Care & Compassion</h3>
                <p className="text-sm text-[#7A736B]">
                  We genuinely care about your well-being and progress, creating a supportive environment for growth.
                </p>
              </Card>

              <Card className="p-6 text-center border-[#B8AFA5]/30 bg-white">
                <div className="h-12 w-12 rounded-full bg-[#9BA899]/10 flex items-center justify-center mx-auto mb-4">
                  <Award className="h-6 w-6 text-[#9BA899]" />
                </div>
                <h3 className="font-serif font-normal text-lg mb-2 text-[#5A5550]">Expert Guidance</h3>
                <p className="text-sm text-[#7A736B]">
                  Certified instructors with diverse backgrounds bring expertise and passion to every class.
                </p>
              </Card>

              <Card className="p-6 text-center border-[#B8AFA5]/30 bg-white">
                <div className="h-12 w-12 rounded-full bg-[#9BA899]/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-6 w-6 text-[#9BA899]" />
                </div>
                <h3 className="font-serif font-normal text-lg mb-2 text-[#5A5550]">Intentional Design</h3>
                <p className="text-sm text-[#7A736B]">
                  Every class is thoughtfully designed with purpose, allowing you to take what you need.
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
            Experience the Difference
          </h2>
          <p className="text-lg text-[#7A736B] mb-8 max-w-2xl mx-auto">
            Train with passionate instructors who are dedicated to your success and well-being.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pilates/schedule">
              <Button size="lg" className="bg-[#9BA899] hover:bg-[#8A9788] text-white text-base h-12 px-8 rounded-full">
                Book a Class
              </Button>
            </Link>
            <Link href="/pilates/classes">
              <Button size="lg" variant="outline" className="border-[#B8AFA5] bg-white text-[#5A5550] hover:bg-[#F5F2EE] text-base h-12 px-8 rounded-full">
                View Class Types
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