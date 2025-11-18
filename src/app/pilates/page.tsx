"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, Target, Zap, Heart, Award } from "lucide-react"
import { useState } from "react"
import { PilatesNav } from "@/components/pilates-nav"

export default function PilatesPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000))
    alert("Thank you! We'll contact you about our Pilates classes.")
    setFormData({ name: "", email: "", phone: "" })
    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen">
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <a href="/" className="font-display text-2xl text-primary">SWIFTFIT 215</a>
              <nav className="hidden md:flex items-center gap-6">
                <a href="/" className="text-sm font-medium hover:text-primary transition-colors">Home</a>
                <a href="/pilates" className="text-sm font-medium text-primary">Pilates</a>
              </nav>
            </div>
            <PilatesNav />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-32 overflow-hidden bg-gradient-to-br from-secondary via-secondary/95 to-black">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1920&q=80')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary/90 to-transparent"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <Badge className="mb-6 bg-primary/20 text-primary border-primary/30 text-sm px-4 py-1">
              Athletic Pilates Training
            </Badge>
            <h1 className="font-display text-5xl md:text-7xl text-white mb-6 leading-tight tracking-wide">
              MAT PILATES FOR ATHLETES & STRENGTH SEEKERS
            </h1>
            <p className="text-lg text-white/70 mb-8 max-w-2xl">
              Not your typical Pilates class. We combine core strength, flexibility, and athletic conditioning to build powerful, injury-resistant bodies. Perfect for athletes, fitness enthusiasts, and anyone serious about functional strength.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white text-lg h-14 px-8">
                <a href="#signup">Join a Class</a>
              </Button>
              <Button size="lg" variant="outline" className="border-white bg-white/10 text-white hover:bg-white hover:text-secondary text-lg h-14 px-8">
                <a href="#schedule">View Schedule</a>
              </Button>
            </div>
            <div className="flex items-center gap-8 mt-10">
              <div className="text-center">
                <div className="font-display text-4xl text-primary">5AM</div>
                <div className="text-sm text-white/60">Early Session</div>
              </div>
              <div className="h-12 w-px bg-white/20"></div>
              <div className="text-center">
                <div className="font-display text-4xl text-primary">6:30AM</div>
                <div className="text-sm text-white/60">Morning Session</div>
              </div>
              <div className="h-12 w-px bg-white/20"></div>
              <div className="text-center">
                <div className="font-display text-4xl text-primary">50MIN</div>
                <div className="text-sm text-white/60">Class Length</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-5xl md:text-6xl text-secondary mb-4 tracking-wide">WHY PILATES AT SWIFTFIT</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Athletic Pilates designed to complement your training, prevent injury, and build unshakeable core strength
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Core Strength</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Build bulletproof core stability that translates to every movement—from sprinting to lifting to everyday activities.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Flexibility & Mobility</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Increase range of motion and joint mobility to move better, lift more, and reduce injury risk in all your training.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Injury Prevention</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Strengthen stabilizer muscles and correct imbalances to stay healthy, train harder, and perform at your peak.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Athletic Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Enhance power transfer, balance, and body control for better performance in your sport or training regimen.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Active Recovery</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Perfect low-impact workout for recovery days—keep moving while your body repairs and rebuilds stronger.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Mind-Body Connection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Develop better body awareness and movement control through focused, intentional training.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* What to Expect */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-display text-5xl md:text-6xl text-secondary mb-4 tracking-wide">WHAT TO EXPECT</h2>
              <p className="text-lg text-muted-foreground">
                Athletic mat Pilates that complements your training lifestyle
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card className="p-8">
                <h3 className="font-display text-3xl text-primary mb-4 tracking-wide">CLASS FORMAT</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong>50-minute classes</strong> with structured warm-up, main workout, and cool-down</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong>Mat-based exercises</strong> using bodyweight and small equipment</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong>Progressive difficulty</strong> suitable for all fitness levels</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong>Focus on form</strong> with individualized corrections and modifications</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-8">
                <h3 className="font-display text-3xl text-primary mb-4 tracking-wide">WHO IT'S FOR</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong>Athletes</strong> seeking core strength and injury prevention</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong>Gym members</strong> adding variety to their training routine</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong>Beginners</strong> building foundational movement patterns</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong>Anyone</strong> serious about functional strength and mobility</span>
                  </li>
                </ul>
              </Card>
            </div>

            <Card className="p-8 bg-gradient-to-r from-secondary via-secondary/95 to-black text-white border-0">
              <div className="text-center">
                <h3 className="font-display text-3xl text-primary mb-4 tracking-wide">NOT YOUR TYPICAL PILATES</h3>
                <p className="text-lg text-white/80 mb-6">
                  We've adapted traditional Pilates principles for the athletic community. Expect challenging movements, functional strength work, and training that directly enhances your performance and daily life.
                </p>
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  Perfect complement to strength training, running, and sports performance
                </Badge>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Schedule Section */}
      <section id="schedule" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-display text-5xl md:text-6xl text-secondary mb-4 tracking-wide">CLASS SCHEDULE</h2>
              <p className="text-lg text-muted-foreground">
                Early morning sessions to kickstart your day with focused movement
              </p>
            </div>

            <Card className="p-8 mb-8 border-2">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Clock className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <div className="font-display text-3xl text-primary">5:00 AM</div>
                      <div className="text-sm text-muted-foreground">Early Bird Session</div>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Start your day with intentional movement before work or training. Perfect for early risers and those with busy schedules.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span>50-minute mat Pilates class</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span>Small group setting</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span>All levels welcome</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Clock className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <div className="font-display text-3xl text-primary">6:30 AM</div>
                      <div className="text-sm text-muted-foreground">Morning Power Session</div>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Energize your morning with core-focused training. Ideal timing for pre-work movement or before your main training session.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span>50-minute mat Pilates class</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span>Small group setting</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span>All levels welcome</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-muted/50 border-primary/20">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-lg">Included with Gym Membership</h4>
                  <p className="text-muted-foreground mb-4">
                    Mat Pilates classes are included with your $45/month SwiftFit membership—no extra fees, no hidden costs. Already a member? Just show up and join us on the mat.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Not a member yet?</strong> Contact us about starting your membership to access Pilates classes along with all gym facilities and training programs.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Signup Section */}
      <section id="signup" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-5xl md:text-6xl text-secondary mb-4 tracking-wide">JOIN A CLASS</h2>
              <p className="text-lg text-muted-foreground">
                Ready to add Pilates to your training? Fill out the form and we'll get you started.
              </p>
            </div>

            <Card className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="John Doe"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="john@example.com"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    placeholder="(215) 555-0123"
                    className="mt-1"
                  />
                </div>
                
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Preferred Class Time</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="time" value="5am" className="accent-primary" />
                      <span>5:00 AM - Early Bird Session</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="time" value="6:30am" className="accent-primary" />
                      <span>6:30 AM - Morning Power Session</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="time" value="either" className="accent-primary" defaultChecked />
                      <span>Either time works for me</span>
                    </label>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 h-12 text-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Sign Me Up"}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  We'll contact you within 24 hours to confirm your class registration and membership status
                </p>
              </form>
            </Card>

            <div className="mt-12 text-center">
              <p className="text-muted-foreground mb-4">Questions about our Pilates classes?</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline" asChild>
                  <a href="tel:2679390254">(267) 939-0254</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/#contact">Contact Us</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}