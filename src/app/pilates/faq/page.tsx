"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Sparkles, HelpCircle } from "lucide-react"
import Link from "next/link"

const faqs = [
  {
    category: "Getting Started",
    questions: [
      {
        q: "Is this my first time? What should I expect?",
        a: "Welcome! Your first class will be a warm, welcoming experience. Our instructors will greet you, help you get set up, and provide modifications throughout the class. There's no pressure to be perfect - just show up as you are and take what you need from the session."
      },
      {
        q: "What should I bring to class?",
        a: "Wear comfortable, breathable workout clothes that allow you to move freely. Bring a water bottle and arrive 10-15 minutes early for your first class. We provide mats and any necessary equipment, but you're welcome to bring your own mat if you prefer."
      },
      {
        q: "What if I've never done Pilates/yoga/fitness before?",
        a: "Perfect! All our classes welcome beginners. Our instructors provide modifications for every ability level, so you can work at your own pace. Everyone starts somewhere, and our community is here to support you every step of the way."
      }
    ]
  },
  {
    category: "Booking & Policies",
    questions: [
      {
        q: "How do I book a class?",
        a: "You can book classes through our schedule page. Simply select your desired class, create an account or log in, and reserve your spot. We recommend booking in advance as classes can fill up, especially popular times."
      },
      {
        q: "What is your cancellation policy?",
        a: "We understand life happens! Please cancel at least 2 hours before class time to avoid being charged. Late cancellations or no-shows will result in the loss of that class credit."
      },
      {
        q: "Can I share my class pack with friends or family?",
        a: "Yes! Class packs (5, 10, and 20 class packs) can be shared with friends and family. Just make sure the person attending uses your account to book, or contact us to link the accounts."
      },
      {
        q: "Do class packs or memberships expire?",
        a: "Class packs do not expire - use them at your own pace! Monthly memberships renew automatically each month. Unused classes from monthly memberships roll over for up to 1 month."
      },
      {
        q: "What is the maximum class size?",
        a: "We cap classes at 50 students to ensure quality instruction while maintaining the energy of our community atmosphere."
      }
    ]
  },
  {
    category: "Class Experience",
    questions: [
      {
        q: "What is the class format and duration?",
        a: "Most classes are 60 minutes long. Each class begins with a brief warm-up, moves into the main workout focused on that class type, and ends with a cool-down or relaxation period."
      },
      {
        q: "Can I arrive late to class?",
        a: "We recommend arriving 5-10 minutes early to get settled. If you do arrive late, please enter quietly and wait for the instructor to acknowledge you before joining in. Late arrivals after 10 minutes may not be permitted for safety reasons."
      },
      {
        q: "What if I need to modify movements?",
        a: "Absolutely! Our instructors provide modifications throughout every class. Never feel pressure to do something that doesn't feel right for your body. Listen to yourself and take what you need from each session."
      },
      {
        q: "Are classes suitable for all fitness levels?",
        a: "Yes! Whether you're a complete beginner or an experienced practitioner, our classes are designed to meet you where you are. Instructors offer progressions and modifications so everyone can participate safely and effectively."
      }
    ]
  },
  {
    category: "Membership & Pricing",
    questions: [
      {
        q: "What's the best package for someone new to the studio?",
        a: "We recommend starting with our New Student Intro: 3 classes for $49. This allows you to try different class types, meet instructors, and experience our community before committing to a larger package."
      },
      {
        q: "What are the benefits of a monthly membership?",
        a: "Monthly memberships include rollover classes (up to 1 month), priority booking, access to member-only events, wellness perks, and 10% off workshops and studio merchandise. Plus, you get a better per-class rate!"
      },
      {
        q: "Can I upgrade or downgrade my membership?",
        a: "Yes! Contact us at swiftfitpws@gmail.com to discuss changing your membership level. Changes typically take effect at the start of your next billing cycle."
      },
      {
        q: "Do you offer student or senior discounts?",
        a: "Contact us directly at swiftfitpws@gmail.com to inquire about special pricing. We want to make wellness accessible to everyone in our community."
      }
    ]
  },
  {
    category: "Health & Safety",
    questions: [
      {
        q: "What if I'm pregnant or have an injury?",
        a: "Please inform your instructor before class about any injuries, health conditions, or if you're pregnant. They can provide appropriate modifications and guidance. We recommend consulting with your healthcare provider before starting any new exercise program."
      },
      {
        q: "Is the studio clean and sanitized?",
        a: "Yes! We maintain high cleanliness standards throughout the studio. Mats and equipment are cleaned between classes, and we provide sanitizing wipes for your use."
      },
      {
        q: "What COVID-19 safety measures are in place?",
        a: "We follow current local health guidelines to keep our community safe. Contact us for the most up-to-date information on our health and safety protocols."
      }
    ]
  },
  {
    category: "Studio Information",
    questions: [
      {
        q: "Where are you located?",
        a: "We're located at 2245 E Tioga Street, Philadelphia, PA 19134. Entrance is on Weikel Street. We're part of the SwiftFit 215 facility in the heart of the Harrowgate community."
      },
      {
        q: "What are your hours?",
        a: "Classes run throughout the week - check our schedule page for specific class times. Our first classes typically start early morning (as early as 6 AM) and we offer options throughout the day into evening."
      },
      {
        q: "Is parking available?",
        a: "Yes, parking is available near the studio. Contact us for specific parking information and directions."
      },
      {
        q: "How do I contact the studio?",
        a: "Email us at swiftfitpws@gmail.com for any questions, special requests, or to discuss your wellness journey. We're here to help!"
      }
    ]
  }
]

export default function FAQPage() {
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
            <Link href="/pilates/pricing" className="text-white/80 hover:text-primary transition-colors text-sm font-medium">Pricing</Link>
            <Link href="/pilates/schedule" className="text-white/80 hover:text-primary transition-colors text-sm font-medium">Schedule</Link>
            <Link href="/pilates/faq" className="text-primary transition-colors text-sm font-medium">FAQ</Link>
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
              We're Here to Help
            </Badge>
            <h1 className="font-display text-5xl md:text-7xl text-white mb-6 tracking-wide">
              FREQUENTLY ASKED QUESTIONS
            </h1>
            <p className="text-xl text-white/80 leading-relaxed">
              Everything you need to know about classes, booking, and getting started with your wellness journey.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-12">
              {faqs.map((category, categoryIndex) => (
                <div key={categoryIndex}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <HelpCircle className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="font-display text-3xl text-secondary tracking-wide">
                      {category.category.toUpperCase()}
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {category.questions.map((faq, faqIndex) => (
                      <Card key={faqIndex} className="p-6 border-l-4 border-l-primary">
                        <h3 className="text-lg font-semibold mb-3 text-foreground">
                          {faq.q}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {faq.a}
                        </p>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Still Have Questions Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-4xl md:text-5xl text-secondary mb-6 tracking-wide">
              STILL HAVE QUESTIONS?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              We're here to help! Reach out to us and we'll get back to you as soon as possible.
            </p>
            <Card className="p-8">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Email Us</h3>
                  <a href="mailto:swiftfitpws@gmail.com" className="text-primary hover:underline text-lg">
                    swiftfitpws@gmail.com
                  </a>
                </div>
                <div className="text-muted-foreground">
                  <p>We typically respond within 24 hours</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-secondary via-secondary/95 to-black">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-4xl md:text-5xl text-white mb-6 tracking-wide">
            READY TO START YOUR JOURNEY?
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Don't wait - book your first class today and experience the Swift Fit difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pilates/schedule">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white text-lg h-14 px-8">
                View Schedule & Book
              </Button>
            </Link>
            <Link href="/pilates/pricing">
              <Button size="lg" variant="outline" className="border-white bg-white/10 text-white hover:bg-white hover:text-secondary text-lg h-14 px-8">
                See Pricing Options
              </Button>
            </Link>
          </div>
          <p className="text-sm text-white/60 mt-6">
            New students: Try 3 classes for just $49!
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
