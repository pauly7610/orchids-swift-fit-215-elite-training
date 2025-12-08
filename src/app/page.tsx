"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Phone, MapPin, Clock, Dumbbell, Users, Target, Zap, Heart, Trophy, Award, CheckCircle2, Star, Facebook, Instagram, Play, Menu, X } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { sendContactEmail } from "@/app/actions/send-email"
import { toast } from "sonner"
import { GalleryImage } from "@/components/gallery-image"

export default function Home() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null)

  // Load saved form data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('contact-form-data')
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        setFormData(parsed)
      } catch (error) {
        // Ignore invalid data
      }
    }
  }, [])

  // Auto-save form data to localStorage
  useEffect(() => {
    if (formData.name || formData.email || formData.phone || formData.message) {
      localStorage.setItem('contact-form-data', JSON.stringify(formData))
    }
  }, [formData])

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false)
        mobileMenuButtonRef.current?.focus()
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isMobileMenuOpen])

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node) && isMobileMenuOpen) {
        setIsMobileMenuOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMobileMenuOpen])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  // Focus trap for mobile menu
  useEffect(() => {
    if (!isMobileMenuOpen || !mobileMenuRef.current) return

    const focusableElements = mobileMenuRef.current.querySelectorAll(
      'a[href], button:not([disabled])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    document.addEventListener('keydown', handleTab)
    firstElement?.focus()

    return () => document.removeEventListener('keydown', handleTab)
  }, [isMobileMenuOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prevent double submission
    if (isSubmitting) return
    
    // Client-side validation
    if (!formData.name.trim()) {
      toast.error("Please enter your name")
      return
    }
    
    if (!formData.email.trim()) {
      toast.error("Please enter your email")
      return
    }
    
    if (!formData.phone.trim()) {
      toast.error("Please enter your phone number")
      return
    }
    
    if (!formData.message.trim()) {
      toast.error("Please enter a message")
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Get honeypot value from form
      const form = e.target as HTMLFormElement
      const honeypot = form.querySelector<HTMLInputElement>('input[name="website"]')?.value || ''
      
      const result = await sendContactEmail({
        ...formData,
        honeypot
      })
      
      if (result.success) {
        toast.success("Thank you for your interest! Check your email for confirmation. We'll contact you soon.")
        setFormData({ name: "", email: "", phone: "", message: "" })
        // Clear saved form data from localStorage
        localStorage.removeItem('contact-form-data')
      } else {
        toast.error(result.error || "Failed to send message. Please try again or call us directly.")
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again or call us at (267) 939-0254.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Skip to main content link for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        Skip to main content
      </a>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-secondary/95 backdrop-blur-sm border-b border-primary/20">
        <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-6 w-6 md:h-8 md:w-8 text-primary" aria-hidden="true" />
            <div>
              <h1 className="font-display text-xl md:text-2xl text-white tracking-wider">SWIFTFIT 215</h1>
              <p className="text-[10px] md:text-xs text-primary/80 -mt-1">Speed & Strength Training</p>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
            <a href="#services" className="text-white/80 hover:text-primary transition-colors text-sm font-medium">Services</a>
            <a href="#about" className="text-white/80 hover:text-primary transition-colors text-sm font-medium">About</a>
            <a href="#gallery" className="text-white/80 hover:text-primary transition-colors text-sm font-medium">Gallery</a>
            <a href="/pilates" className="text-white/80 hover:text-primary transition-colors text-sm font-medium">Pilates</a>
            <a href="#contact" className="text-white/80 hover:text-primary transition-colors text-sm font-medium">Contact</a>
            <a href="tel:2679390254">
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                Call Now
              </Button>
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <button
            ref={mobileMenuButtonRef}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div 
            id="mobile-menu"
            className="md:hidden border-t border-primary/20 bg-secondary/98 backdrop-blur-sm" 
            ref={mobileMenuRef}
            role="dialog"
            aria-label="Mobile navigation menu"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-4" aria-label="Mobile navigation">
              <a 
                href="#services" 
                className="text-white/80 hover:text-primary transition-colors text-base font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Services
              </a>
              <a 
                href="#about" 
                className="text-white/80 hover:text-primary transition-colors text-base font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </a>
              <a 
                href="#gallery" 
                className="text-white/80 hover:text-primary transition-colors text-base font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Gallery
              </a>
              <a 
                href="/pilates" 
                className="text-white/80 hover:text-primary transition-colors text-base font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pilates
              </a>
              <a 
                href="#contact" 
                className="text-white/80 hover:text-primary transition-colors text-base font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </a>
              <a href="tel:2679390254">
                <Button size="sm" className="bg-primary hover:bg-primary/90 w-full">
                  Call Now
                </Button>
              </a>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main id="main-content">
        {/* Hero Section */}
        <section className="relative pt-20 pb-16 md:pt-32 md:pb-32 overflow-hidden bg-gradient-to-br from-secondary via-secondary/95 to-black" aria-labelledby="hero-heading">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80')] bg-cover bg-center opacity-20" role="img" aria-label="Gym equipment background"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary/90 to-transparent"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl">
              <Badge className="mb-4 md:mb-6 bg-primary/20 text-primary border-primary/30 text-xs md:text-sm px-3 md:px-4 py-1">
                Featured on 3CBS, 6ABC, 10NBC & FOX29
              </Badge>
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white mb-4 md:mb-6 leading-tight tracking-wide" id="hero-heading">
                Elite Speed & Strength Training in the Heart of Philadelphia
              </h1>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-primary mb-3 md:mb-4 leading-tight tracking-wide">
                TRANSFORM YOUR BODY TODAY
              </h2>
              <p className="text-base md:text-lg text-white/70 mb-6 md:mb-8 max-w-2xl">
                Join Philadelphia's premier boutique gym where champions are made. From beginners to elite athletes, we build stronger bodies and unbreakable mindsets.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <a href="#contact" className="w-full sm:w-auto">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-white text-base md:text-lg h-12 md:h-14 px-6 md:px-8 w-full">
                    Get Free Consultation
                  </Button>
                </a>
                <a href="#services" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="border-white bg-white/10 text-white hover:bg-white hover:text-secondary text-base md:text-lg h-12 md:h-14 px-6 md:px-8 w-full">
                    View Membership
                  </Button>
                </a>
              </div>
              <div className="flex flex-wrap items-center gap-4 md:gap-8 mt-8 md:mt-10">
                <div className="text-center">
                  <div className="font-display text-3xl md:text-4xl text-primary">$45</div>
                  <div className="text-xs md:text-sm text-white/60">Per Month</div>
                </div>
                <div className="h-10 md:h-12 w-px bg-white/20"></div>
                <div className="text-center">
                  <div className="font-display text-3xl md:text-4xl text-primary">A+</div>
                  <div className="text-xs md:text-sm text-white/60">BBB Rating</div>
                </div>
                <div className="h-10 md:h-12 w-px bg-white/20"></div>
                <div className="text-center">
                  <div className="font-display text-3xl md:text-4xl text-primary">20K+</div>
                  <div className="text-xs md:text-sm text-white/60">Community</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-16 md:py-20 bg-background" aria-labelledby="services-heading">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-secondary mb-3 md:mb-4 tracking-wide" id="services-heading">OUR SERVICES</h2>
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
                State-of-the-art facility with elite training programs designed for your success
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
              <Card className="border-2 hover:border-primary transition-colors group">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Dumbbell className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Gym Membership</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="font-display text-4xl text-primary mb-2">$45<span className="text-lg text-muted-foreground">/mo</span></div>
                  <CardDescription className="mb-4">No annual fees or commitments</CardDescription>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>State-of-the-art equipment</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Open 7 days a week</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Boutique gym atmosphere</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary transition-colors group">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Personal Training</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="font-display text-4xl text-primary mb-2">1-ON-1</div>
                  <CardDescription className="mb-4">Personalized fitness plans</CardDescription>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Free consultation</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Certified trainers</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Progress tracking</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary transition-colors group">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Athletic Training</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="font-display text-4xl text-primary mb-2">ELITE</div>
                  <CardDescription className="mb-4">Speed & strength development</CardDescription>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Team training programs</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Football, basketball & track</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>College prep & recruitment</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary transition-colors group">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Wellness Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="font-display text-4xl text-primary mb-2">RECOVER</div>
                  <CardDescription className="mb-4">Recovery & flexibility</CardDescription>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Assisted stretch therapy</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Mat Pilates classes</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Cryotherapy</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Pregame routines</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="py-16 md:py-20 bg-muted/30" aria-labelledby="social-proof-heading">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-secondary mb-3 md:mb-4 tracking-wide" id="social-proof-heading">TRUSTED BY THE BEST</h2>
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
                Join a community of champions and achievers
              </p>
            </div>
            
            {/* Proven Track Record Banner */}
            <Card className="mb-8 md:mb-12 overflow-hidden border-2 border-primary/20 bg-gradient-to-r from-secondary via-secondary/95 to-black">
              <div className="p-6 md:p-12 text-center">
                <Badge className="mb-3 md:mb-4 bg-primary/20 text-primary border-primary/30 text-xs md:text-sm">PROVEN TRACK RECORD</Badge>
                <h3 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white mb-3 md:mb-4 tracking-wide px-2">
                  BUILDING CHAMPIONS, CREATING FUTURES
                </h3>
                <p className="text-white/80 text-sm md:text-lg mb-6 md:mb-8 max-w-3xl mx-auto px-2">
                  Coach Darren Swift has transformed hundreds of athletes into college competitors and NFL professionals
                </p>
                <div className="grid sm:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
                  <div className="text-center">
                    <div className="font-display text-5xl md:text-6xl lg:text-7xl text-primary mb-2">100s</div>
                    <div className="text-white text-base md:text-lg font-semibold mb-1">College Athletes</div>
                    <div className="text-white/60 text-xs md:text-sm px-2">Sent to compete at the collegiate level</div>
                  </div>
                  <div className="text-center">
                    <div className="font-display text-5xl md:text-6xl lg:text-7xl text-primary mb-2">Dozens</div>
                    <div className="text-white text-base md:text-lg font-semibold mb-1">NFL Players</div>
                    <div className="text-white/60 text-xs md:text-sm px-2">Trained to play at the highest level</div>
                  </div>
                  <div className="text-center">
                    <div className="font-display text-5xl md:text-6xl lg:text-7xl text-primary mb-2">20+</div>
                    <div className="text-white text-base md:text-lg font-semibold mb-1">Years Experience</div>
                    <div className="text-white/60 text-xs md:text-sm px-2">Dedicated to elite athlete development</div>
                  </div>
                </div>
              </div>
            </Card>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-12">
              <Card className="text-center p-6 md:p-8 border-2">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <div className="font-display text-4xl text-primary mb-2">A+</div>
                <div className="font-semibold mb-2">BBB Rating</div>
                <p className="text-sm text-muted-foreground">
                  Highest trust rating from Better Business Bureau
                </p>
              </Card>

              <Card className="text-center p-6 md:p-8 border-2">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Trophy className="h-8 w-8 text-primary" />
                </div>
                <div className="font-display text-4xl text-primary mb-2">MEDIA</div>
                <div className="font-semibold mb-2">Featured On</div>
                <div className="flex flex-wrap justify-center gap-2 mb-3">
                  <Badge variant="secondary" className="text-xs">3CBS</Badge>
                  <Badge variant="secondary" className="text-xs">6ABC</Badge>
                  <Badge variant="secondary" className="text-xs">10NBC</Badge>
                  <Badge variant="secondary" className="text-xs">FOX29</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Recognized by Philadelphia's major news networks
                </p>
              </Card>

              <Card className="text-center p-6 md:p-8 border-2 sm:col-span-2 lg:col-span-1">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <div className="font-display text-4xl text-primary mb-2">20K+</div>
                <div className="font-semibold mb-2">Community Members</div>
                <p className="text-sm text-muted-foreground">
                  Active social media following and growing family
                </p>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-4 md:gap-6">
              <Card className="p-5 md:p-6 bg-card">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 md:h-5 md:w-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-base md:text-lg mb-4 italic">
                  "Trust the vision that your trainer has for you. Always be comfortable with being uncomfortable. This is where champions are made."
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="font-display text-primary text-sm">DS</span>
                  </div>
                  <div>
                    <div className="font-semibold text-sm md:text-base">Darren Swift</div>
                    <div className="text-xs md:text-sm text-muted-foreground">Owner & Head Trainer</div>
                  </div>
                </div>
              </Card>

              <Card className="p-5 md:p-6 bg-card">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 md:h-5 md:w-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-base md:text-lg mb-4 italic">
                  "SwiftFit is more than a gym—it's a family. The personalized attention and elite training programs have transformed not just my body, but my entire mindset."
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="font-display text-primary text-sm">AT</span>
                  </div>
                  <div>
                    <div className="font-semibold text-sm md:text-base">Athlete Testimonial</div>
                    <div className="text-xs md:text-sm text-muted-foreground">Youth Basketball Player</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section id="gallery" className="py-16 md:py-20 bg-background" aria-labelledby="gallery-heading">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 md:mb-16">
              <h2 id="gallery-heading" className="font-display text-4xl md:text-5xl lg:text-6xl text-secondary mb-3 md:mb-4 tracking-wide">SEE US IN ACTION</h2>
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
                Experience the energy, dedication, and transformations happening at SwiftFit 215
              </p>
            </div>

            {/* Videos Section */}
            <div className="mb-12 md:mb-16">
              <h3 className="font-display text-2xl md:text-3xl text-secondary mb-6 md:mb-8 tracking-wide">TRAINING VIDEOS</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <Card className="overflow-hidden border-2 hover:border-primary transition-colors group">
                  <div className="relative aspect-video bg-muted">
                    <iframe
                      src="https://player.vimeo.com/video/1129611570?badge=0&autopause=0&player_id=0&app_id=58479"
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
                      title="1 on 1 Training session with personal trainer and client"
                      className="absolute inset-0 w-full h-full"
                    ></iframe>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg md:text-xl">1 on 1 Training</CardTitle>
                    <CardDescription className="text-sm">Personalized coaching and individualized training sessions</CardDescription>
                  </CardHeader>
                </Card>

                <Card className="overflow-hidden border-2 hover:border-primary transition-colors group">
                  <div className="relative aspect-video bg-muted">
                    <iframe
                      src="https://player.vimeo.com/video/1129613316?badge=0&autopause=0&player_id=0&app_id=58479"
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
                      title="Team training session with multiple athletes working together"
                      className="absolute inset-0 w-full h-full"
                    ></iframe>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg md:text-xl">Team Training</CardTitle>
                    <CardDescription className="text-sm">Group training sessions and team athletic development</CardDescription>
                  </CardHeader>
                </Card>

                <Card className="overflow-hidden border-2 hover:border-primary transition-colors group">
                  <div className="relative aspect-video bg-muted">
                    <iframe
                      src="https://player.vimeo.com/video/1129611092?title=0&byline=0&portrait=0&badge=0&autopause=0&player_id=0&app_id=58479"
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                      title="Youth training program for young athletes"
                      className="absolute inset-0 w-full h-full"
                    ></iframe>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg md:text-xl">Youth Training</CardTitle>
                    <CardDescription className="text-sm">Elite development programs for young athletes</CardDescription>
                  </CardHeader>
                </Card>

                <Card className="overflow-hidden border-2 hover:border-primary transition-colors group">
                  <div className="relative aspect-video bg-muted">
                    <iframe
                      src="https://player.vimeo.com/video/1129611184?title=0&byline=0&portrait=0&badge=0&autopause=0&player_id=0&app_id=58479"
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                      title="Group training session with high-energy group workout"
                      className="absolute inset-0 w-full h-full"
                    ></iframe>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg md:text-xl">Group Training Session</CardTitle>
                    <CardDescription className="text-sm">High-energy group workouts and community training</CardDescription>
                  </CardHeader>
                </Card>

                <Card className="overflow-hidden border-2 hover:border-primary transition-colors group">
                  <div className="relative aspect-video bg-muted">
                    <iframe
                      src="https://player.vimeo.com/video/1129620623?title=0&byline=0&portrait=0&badge=0&autopause=0&player_id=0&app_id=58479"
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
                      title="Speed training drills and acceleration exercises"
                      className="absolute inset-0 w-full h-full"
                    ></iframe>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg md:text-xl">Speed Training</CardTitle>
                    <CardDescription className="text-sm">Elite speed development and acceleration drills</CardDescription>
                  </CardHeader>
                </Card>

                <Card className="overflow-hidden border-2 hover:border-primary transition-colors group">
                  <div className="relative aspect-video bg-muted">
                    <iframe
                      src="https://player.vimeo.com/video/1129624043?badge=0&autopause=0&player_id=0&app_id=58479"
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
                      title="Cryotherapy wellness and recovery session"
                      className="absolute inset-0 w-full h-full"
                    ></iframe>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg md:text-xl">Cryotherapy Wellness</CardTitle>
                    <CardDescription className="text-sm">Advanced recovery and wellness therapy</CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </div>

            {/* Photos Section */}
            <div>
              <h3 className="font-display text-2xl md:text-3xl text-secondary mb-6 md:mb-8 tracking-wide">FACILITY & TRAINING PHOTOS</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                <GalleryImage
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/image000008-1761154858471.jpg?width=8000&height=8000&resize=contain"
                  alt="NFL players Mark Webb, Nasir Adderley, and D'Andre Swift standing together at SwiftFit 215, showcasing athletes trained by Coach Darren Swift since middle school"
                  caption="NFL Players - Trained Since Middle School"
                />

                <GalleryImage
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/image000004-1761157644837.JPG?width=8000&height=8000&resize=contain"
                  alt="Coach Darren Swift with New Orleans Saints running back Alvin Kamara at SwiftFit 215 gym"
                  caption="With NFL Star Alvin Kamara"
                />

                <GalleryImage
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/6681838086304031860-1761158981369.jpg?width=8000&height=8000&resize=contain"
                  alt="Coach Darren Swift with Chicago Bears wide receiver D.J. Moore at SwiftFit 215 training facility"
                  caption="With NFL Star D.J. Moore"
                />

                <GalleryImage
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/IMG_3029-1761152347064.jpg?width=8000&height=8000&resize=contain"
                  alt="Women's group fitness training session at SwiftFit 215 with multiple participants exercising together"
                  caption="Women's Group Training Session"
                />

                <GalleryImage
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/51EE0F41-EA39-442B-8017-19FAF07E1CBE-1761150357302.JPG?width=8000&height=8000&resize=contain"
                  alt="Athlete holding championship trophy after training at SwiftFit 215, celebrating victory"
                  caption="Championship Winner"
                />

                <GalleryImage
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/D0DE188D-D296-4F2E-B29D-47E7E04ED80B-1761152385752.jpg?width=8000&height=8000&resize=contain"
                  alt="Client showing dramatic fitness transformation results from training at SwiftFit 215"
                  caption="Client Transformation"
                />

                <GalleryImage
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/image000006-1761148932677.JPG?width=8000&height=8000&resize=contain"
                  alt="Coach Darren Swift, owner and head trainer of SwiftFit 215, demonstrating professional training expertise"
                  caption="Coach Darren Swift"
                />

                <GalleryImage
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/IMG_5516-1761152368498.jpg?width=8000&height=8000&resize=contain"
                  alt="Coach Darren Swift with Dallas Cowboys linebacker Micah Parsons at SwiftFit 215 training facility"
                  caption="With NFL Star Micah Parsons"
                />

                <GalleryImage
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/arsb-1761158486526.jpg?width=8000&height=8000&resize=contain"
                  alt="Coach Darren Swift with Detroit Lions wide receiver Amon-Ra St. Brown at SwiftFit 215"
                  caption="With NFL Star Amon-Ra St. Brown"
                />

                <GalleryImage
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/ryan-clark-1761158486622.jpg?width=8000&height=8000&resize=contain"
                  alt="Coach Darren Swift with NFL legend and ESPN commentator Ryan Clark at SwiftFit 215"
                  caption="With NFL Legend Ryan Clark"
                />

                <GalleryImage
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/team-training-photo-1761158486722.jpg?width=8000&height=8000&resize=contain"
                  alt="Team athletic training session at SwiftFit 215 with multiple athletes working together on strength and conditioning"
                  caption="Team Training Session"
                />

                <GalleryImage
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Darren-Swift-coaches-running-backs-at-the-premier-high-school-program-in-the-state-1761158484380.jpg?width=8000&height=8000&resize=contain"
                  alt="Darren Swift coaching running backs at Pennsylvania's premier high school football program"
                  caption="RB Coach at Premier High School Program"
                />

                <GalleryImage
                  src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80"
                  alt="Modern gym equipment including dumbbells, barbells, and strength training machines at SwiftFit 215"
                  caption="State-of-the-Art Equipment"
                />

                <GalleryImage
                  src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80"
                  alt="Open training floor area at SwiftFit 215 gym with spacious layout for workouts"
                  caption="Open Training Floor"
                />
              </div>
            </div>

            <div className="mt-10 md:mt-12 text-center">
              <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6 px-4">Follow us on social media for daily training content and updates</p>
              <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 px-4">
                <a 
                  href="https://www.instagram.com/swiftfit215/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Follow SwiftFit 215 on Instagram"
                  className="w-full sm:w-auto"
                >
                  <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                    <Instagram className="h-5 w-5 mr-2" aria-hidden="true" />
                    Follow on Instagram
                  </Button>
                </a>
                <a 
                  href="https://www.facebook.com/SwiftFit215/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Like SwiftFit 215 on Facebook"
                  className="w-full sm:w-auto"
                >
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 w-full sm:w-auto">
                    <Facebook className="h-5 w-5 mr-2" aria-hidden="true" />
                    Like on Facebook
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* About/Philosophy Section */}
        <section id="about" className="py-16 md:py-20 bg-background" aria-labelledby="about-heading">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
              <div>
                <Badge className="mb-3 md:mb-4 bg-primary/20 text-primary border-primary/30 text-xs md:text-sm">Est. May 2021</Badge>
                <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-secondary mb-4 md:mb-6 tracking-wide" id="about-heading">
                  WHERE VISION MEETS REALITY
                </h2>
                <p className="text-base md:text-lg text-muted-foreground mb-4 md:mb-6">
                  Founded by <span className="text-foreground font-semibold">Darren Swift</span>, SwiftFit 215 is Philadelphia's premier boutique gym specializing in elite speed and strength training. Located in the heart of the Harrowgate community, we've been transforming bodies and building champions since 2021.
                </p>
                <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 md:h-10 md:w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold mb-1 text-sm md:text-base">Elite Athletic Training</div>
                      <p className="text-xs md:text-sm text-muted-foreground">Training top youth athletes including nationally ranked basketball players</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 md:h-10 md:w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold mb-1 text-sm md:text-base">Holistic Approach</div>
                      <p className="text-xs md:text-sm text-muted-foreground">Combining strength, wellness, recovery, and mindset coaching</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 md:h-10 md:w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold mb-1 text-sm md:text-base">Community-Focused</div>
                      <p className="text-xs md:text-sm text-muted-foreground">Building a family atmosphere with personalized attention</p>
                    </div>
                  </div>
                </div>
                <a href="#contact">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                    Start Your Transformation
                  </Button>
                </a>
              </div>
              <div className="relative order-first lg:order-last">
                <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-muted relative">
                  <img 
                    src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/image-1761152758760.png?width=8000&height=8000&resize=contain" 
                    alt="SwiftFit 215 Training" 
                    className="object-cover object-[center_30%] w-full h-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-secondary/60 to-transparent"></div>
                </div>
                <Card className="absolute -bottom-4 -left-4 md:-bottom-6 md:-left-6 p-4 md:p-6 bg-secondary text-white border-0 max-w-[280px] md:max-w-xs">
                  <div className="font-display text-2xl md:text-3xl text-primary mb-2">IT GETS GREATER, LATER</div>
                  <p className="text-xs md:text-sm text-white/80">
                    Trust the process. Your success is our mission.
                  </p>
                </Card>
              </div>
            </div>

            <div className="mt-16 md:mt-20 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              <div className="text-center">
                <div className="h-12 w-12 md:h-16 md:w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <Target className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                </div>
                <div className="font-display text-xl md:text-2xl mb-1 md:mb-2">VISION</div>
                <p className="text-xs md:text-sm text-muted-foreground px-2">Trust in the vision your trainer has designed for you</p>
              </div>
              <div className="text-center">
                <div className="h-12 w-12 md:h-16 md:w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <Zap className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                </div>
                <div className="font-display text-xl md:text-2xl mb-1 md:mb-2">INTENSITY</div>
                <p className="text-xs md:text-sm text-muted-foreground px-2">Always be comfortable with being uncomfortable</p>
              </div>
              <div className="text-center">
                <div className="h-12 w-12 md:h-16 md:w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <Trophy className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                </div>
                <div className="font-display text-xl md:text-2xl mb-1 md:mb-2">RESULTS</div>
                <p className="text-xs md:text-sm text-muted-foreground px-2">Your success is our goal—we track every milestone</p>
              </div>
              <div className="text-center">
                <div className="h-12 w-12 md:h-16 md:w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <Heart className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                </div>
                <div className="font-display text-xl md:text-2xl mb-1 md:mb-2">LIFESTYLE</div>
                <p className="text-xs md:text-sm text-muted-foreground px-2">Fitness as a lifestyle, not just a hobby</p>
              </div>
            </div>

            {/* Darren's Philosophy Quotes */}
            <div className="mt-16 md:mt-20">
              <div className="text-center mb-8 md:mb-12">
                <h3 className="font-display text-3xl md:text-4xl lg:text-5xl text-secondary mb-2 md:mb-3 tracking-wide">WORDS FROM DARREN</h3>
                <p className="text-sm md:text-base text-muted-foreground px-4">Motivation and mindset from our founder</p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <Card className="p-5 md:p-6 border-l-4 border-l-primary">
                  <p className="text-base md:text-lg font-medium mb-3 text-foreground italic">
                    "Your success is our goal. We don't just track numbers—we build champions."
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground">— Darren Swift</p>
                </Card>

                <Card className="p-5 md:p-6 border-l-4 border-l-primary">
                  <p className="text-base md:text-lg font-medium mb-3 text-foreground italic">
                    "Where else would I be? This isn't just a job—it's my calling, my lifestyle, my family."
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground">— Darren Swift</p>
                </Card>

                <Card className="p-5 md:p-6 border-l-4 border-l-primary">
                  <p className="text-base md:text-lg font-medium mb-3 text-foreground italic">
                    "It gets greater, later. Trust the process and watch yourself transform."
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground">— Darren Swift</p>
                </Card>

                <Card className="p-5 md:p-6 border-l-4 border-l-primary">
                  <p className="text-base md:text-lg font-medium mb-3 text-foreground italic">
                    "We're not just building bodies—we're shifting mindsets and changing lives."
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground">— Darren Swift</p>
                </Card>

                <Card className="p-5 md:p-6 border-l-4 border-l-primary">
                  <p className="text-base md:text-lg font-medium mb-3 text-foreground italic">
                    "Fitness isn't a hobby here—it's a lifestyle. We live it, breathe it, embody it."
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground">— Darren Swift</p>
                </Card>

                <Card className="p-5 md:p-6 border-l-4 border-l-primary">
                  <p className="text-base md:text-lg font-medium mb-3 text-foreground italic">
                    "This is where champions are made. Elite training, personal attention, unbreakable results."
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground">— Darren Swift</p>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Contact/Location Section */}
        <section id="contact" className="py-16 md:py-20 bg-muted/30" aria-labelledby="contact-heading">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-secondary mb-3 md:mb-4 tracking-wide" id="contact-heading">GET STARTED TODAY</h2>
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
                Visit us in Philadelphia or reach out for your free consultation
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 md:gap-12">
              <div className="space-y-6">
                <Card className="p-6 md:p-8">
                  <h3 className="font-display text-2xl md:text-3xl mb-4 md:mb-6 tracking-wide">LOCATION & HOURS</h3>
                  <div className="space-y-4 md:space-y-6">
                    <div className="flex gap-3 md:gap-4">
                      <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold mb-1 text-sm md:text-base">Address</div>
                        <p className="text-sm md:text-base text-muted-foreground">2245 E Tioga Street</p>
                        <p className="text-sm md:text-base text-muted-foreground">Philadelphia, PA 19134</p>
                        <p className="text-xs md:text-sm text-muted-foreground mt-1">(Entrance on Weikel Street)</p>
                      </div>
                    </div>
                    <div className="flex gap-3 md:gap-4">
                      <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Phone className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold mb-1 text-sm md:text-base">Phone</div>
                        <a href="tel:2679390254" className="text-primary hover:underline block text-sm md:text-base">(267) 939-0254</a>
                      </div>
                    </div>
                    <div className="flex gap-3 md:gap-4">
                      <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Clock className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold mb-2 text-sm md:text-base">Hours of Operation</div>
                        <div className="space-y-1 text-xs md:text-sm">
                          <div className="flex justify-between gap-4 md:gap-8">
                            <span className="text-muted-foreground">Monday - Friday</span>
                            <span className="font-medium">7:00 AM - 8:00 PM</span>
                          </div>
                          <div className="flex justify-between gap-4 md:gap-8">
                            <span className="text-muted-foreground">Saturday - Sunday</span>
                            <span className="font-medium">8:00 AM - 5:00 PM</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                <div className="aspect-video rounded-2xl overflow-hidden bg-muted">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3056.4268889166894!2d-75.11843!3d39.99123!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c6c4e5e5e5e5e5%3A0x5e5e5e5e5e5e5e5e!2s2245%20E%20Tioga%20St%2C%20Philadelphia%2C%20PA%2019134!5e0!3m2!1sen!2sus!4v1234567890"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="SwiftFit 215 Location"
                  ></iframe>
                </div>
              </div>

              <Card className="p-6 md:p-8">
                <h3 className="font-display text-2xl md:text-3xl mb-2 tracking-wide">REQUEST A FREE CONSULTATION</h3>
                <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6">
                  Fill out the form below and we'll get back to you within 24 hours
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Honeypot field - hidden from users, visible to bots */}
                  <div className="absolute left-[-9999px]" aria-hidden="true">
                    <label htmlFor="website">Website (leave blank)</label>
                    <input
                      type="text"
                      name="website"
                      id="website"
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="name" className="text-sm md:text-base">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="John Doe"
                      className="mt-1 h-10 md:h-11"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-sm md:text-base">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      placeholder="john@example.com"
                      className="mt-1 h-10 md:h-11"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-sm md:text-base">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      placeholder="(215) 555-0123"
                      className="mt-1 h-10 md:h-11"
                    />
                  </div>
                  <div>
                    <Label htmlFor="message" className="text-sm md:text-base">Message</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us about your fitness goals..."
                      rows={4}
                      className="mt-1"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90 h-11 md:h-12 text-base md:text-lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Get Your Free Consultation"}
                  </Button>
                  <p className="text-[10px] md:text-xs text-center text-muted-foreground">
                    By submitting this form, you agree to be contacted by SwiftFit 215
                  </p>
                </form>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-secondary text-white py-10 md:py-12" role="contentinfo">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-6 md:mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3 md:mb-4">
                <Dumbbell className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                <div>
                  <h3 className="font-display text-xl md:text-2xl tracking-wider">SWIFTFIT 215</h3>
                </div>
              </div>
              <p className="text-white/70 text-xs md:text-sm mb-3 md:mb-4">
                Philadelphia's premier speed and strength training academy
              </p>
              <div className="flex gap-3">
                <a 
                  href="https://www.instagram.com/swiftfit215/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-white/10 hover:bg-primary flex items-center justify-center transition-colors"
                  aria-label="Follow us on Instagram"
                >
                  <Instagram className="h-4 w-4 md:h-5 md:w-5" />
                </a>
                <a 
                  href="https://www.facebook.com/SwiftFit215/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-white/10 hover:bg-primary flex items-center justify-center transition-colors"
                  aria-label="Follow us on Facebook"
                >
                  <Facebook className="h-4 w-4 md:h-5 md:w-5" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">Quick Links</h4>
              <ul className="space-y-2 text-xs md:text-sm text-white/70">
                <li><a href="#services" className="hover:text-primary transition-colors">Services</a></li>
                <li><a href="#about" className="hover:text-primary transition-colors">About</a></li>
                <li><a href="#contact" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">Services</h4>
              <ul className="space-y-2 text-xs md:text-sm text-white/70">
                <li>Gym Membership</li>
                <li>Personal Training</li>
                <li>Athletic Training</li>
                <li>Wellness Services</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">Contact</h4>
              <ul className="space-y-2 text-xs md:text-sm text-white/70">
                <li>(267) 939-0254</li>
                <li>2245 E Tioga Street</li>
                <li>Philadelphia, PA 19134</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 md:pt-8 text-center text-xs md:text-sm text-white/60">
            <p>© 2025 SwiftFit 215. All rights reserved. | Established May 2021</p>
            <p className="mt-2 font-display text-primary text-sm md:text-base">TRANSFORM YOUR BODY TODAY</p>
          </div>
        </div>
      </footer>
    </div>
  )
}