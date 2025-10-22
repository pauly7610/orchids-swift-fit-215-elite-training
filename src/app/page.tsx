"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Phone, MapPin, Clock, Dumbbell, Users, Target, Zap, Heart, Trophy, Award, CheckCircle2, Star, Facebook, Instagram, Play } from "lucide-react"
import { useState } from "react"

export default function Home() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000))
    alert("Thank you for your interest! We'll contact you soon.")
    setFormData({ name: "", email: "", phone: "", message: "" })
    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-secondary/95 backdrop-blur-sm border-b border-primary/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-8 w-8 text-primary" />
            <div>
              <h1 className="font-display text-2xl text-white tracking-wider">SWIFT FIT 215</h1>
              <p className="text-xs text-primary/80 -mt-1">Speed & Strength Training</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#services" className="text-white/80 hover:text-primary transition-colors text-sm font-medium">Services</a>
            <a href="#about" className="text-white/80 hover:text-primary transition-colors text-sm font-medium">About</a>
            <a href="#gallery" className="text-white/80 hover:text-primary transition-colors text-sm font-medium">Gallery</a>
            <a href="#contact" className="text-white/80 hover:text-primary transition-colors text-sm font-medium">Contact</a>
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              <a href="tel:2679390254">Call Now</a>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-32 overflow-hidden bg-gradient-to-br from-secondary via-secondary/95 to-black">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary/90 to-transparent"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <Badge className="mb-6 bg-primary/20 text-primary border-primary/30 text-sm px-4 py-1">
              Featured on FOX 29 Philadelphia
            </Badge>
            <h1 className="font-display text-6xl md:text-8xl text-white mb-6 leading-tight tracking-wide">
              TRANSFORM YOUR BODY TODAY
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-4 font-light">
              Elite Speed & Strength Training in the Heart of Philadelphia
            </p>
            <p className="text-lg text-white/70 mb-8 max-w-2xl">
              Join Philadelphia's premier boutique gym where champions are made. From beginners to elite athletes, we build stronger bodies and unbreakable mindsets.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white text-lg h-14 px-8">
                <a href="#contact">Get Free Consultation</a>
              </Button>
              <Button size="lg" variant="outline" className="border-white bg-white/10 text-white hover:bg-white hover:text-secondary text-lg h-14 px-8">
                <a href="#services">View Membership</a>
              </Button>
            </div>
            <div className="flex items-center gap-8 mt-10">
              <div className="text-center">
                <div className="font-display text-4xl text-primary">$45</div>
                <div className="text-sm text-white/60">Per Month</div>
              </div>
              <div className="h-12 w-px bg-white/20"></div>
              <div className="text-center">
                <div className="font-display text-4xl text-primary">A+</div>
                <div className="text-sm text-white/60">BBB Rating</div>
              </div>
              <div className="h-12 w-px bg-white/20"></div>
              <div className="text-center">
                <div className="font-display text-4xl text-primary">3.7K+</div>
                <div className="text-sm text-white/60">Community</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-5xl md:text-6xl text-secondary mb-4 tracking-wide">OUR SERVICES</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              State-of-the-art facility with elite training programs designed for your success
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
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
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-5xl md:text-6xl text-secondary mb-4 tracking-wide">TRUSTED BY THE BEST</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join a community of champions and achievers
            </p>
          </div>
          
          {/* Proven Track Record Banner */}
          <Card className="mb-12 overflow-hidden border-2 border-primary/20 bg-gradient-to-r from-secondary via-secondary/95 to-black">
            <div className="p-8 md:p-12 text-center">
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">PROVEN TRACK RECORD</Badge>
              <h3 className="font-display text-3xl md:text-5xl text-white mb-4 tracking-wide">
                BUILDING CHAMPIONS, CREATING FUTURES
              </h3>
              <p className="text-white/80 text-lg mb-8 max-w-3xl mx-auto">
                Coach Darren Smith has transformed hundreds of athletes into college competitors and NFL professionals
              </p>
              <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                <div className="text-center">
                  <div className="font-display text-6xl md:text-7xl text-primary mb-2">100s</div>
                  <div className="text-white text-lg font-semibold mb-1">College Athletes</div>
                  <div className="text-white/60 text-sm">Sent to compete at the collegiate level</div>
                </div>
                <div className="text-center">
                  <div className="font-display text-6xl md:text-7xl text-primary mb-2">Dozens</div>
                  <div className="text-white text-lg font-semibold mb-1">NFL Players</div>
                  <div className="text-white/60 text-sm">Trained to play at the highest level</div>
                </div>
                <div className="text-center">
                  <div className="font-display text-6xl md:text-7xl text-primary mb-2">20+</div>
                  <div className="text-white text-lg font-semibold mb-1">Years Experience</div>
                  <div className="text-white/60 text-sm">Dedicated to elite athlete development</div>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="text-center p-8 border-2">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <div className="font-display text-4xl text-primary mb-2">A+</div>
              <div className="font-semibold mb-2">BBB Rating</div>
              <p className="text-sm text-muted-foreground">
                Highest trust rating from Better Business Bureau
              </p>
            </Card>

            <Card className="text-center p-8 border-2">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-8 w-8 text-primary" />
              </div>
              <div className="font-display text-4xl text-primary mb-2">FOX 29</div>
              <div className="font-semibold mb-2">Featured On</div>
              <p className="text-sm text-muted-foreground">
                Recognized by Philadelphia's leading news network
              </p>
            </Card>

            <Card className="text-center p-8 border-2">
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

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 bg-card">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-lg mb-4 italic">
                "Trust the vision that your trainer has for you. Always be comfortable with being uncomfortable. This is where champions are made."
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-display text-primary">DS</span>
                </div>
                <div>
                  <div className="font-semibold">Darren Smith</div>
                  <div className="text-sm text-muted-foreground">Owner & Head Trainer</div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-lg mb-4 italic">
                "Swift Fit is more than a gym—it's a family. The personalized attention and elite training programs have transformed not just my body, but my entire mindset."
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-display text-primary">AT</span>
                </div>
                <div>
                  <div className="font-semibold">Athlete Testimonial</div>
                  <div className="text-sm text-muted-foreground">Youth Basketball Player</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-5xl md:text-6xl text-secondary mb-4 tracking-wide">SEE US IN ACTION</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience the energy, dedication, and transformations happening at Swift Fit 215
            </p>
          </div>

          {/* Videos Section */}
          <div className="mb-16">
            <h3 className="font-display text-3xl text-secondary mb-8 tracking-wide">TRAINING VIDEOS</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="overflow-hidden border-2 hover:border-primary transition-colors group">
                <div className="relative aspect-video bg-muted">
                  <iframe
                    src="https://player.vimeo.com/video/1129611570?badge=0&autopause=0&player_id=0&app_id=58479"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
                    title="1 on 1 Training"
                    className="absolute inset-0 w-full h-full"
                  ></iframe>
                </div>
                <CardHeader>
                  <CardTitle>1 on 1 Training</CardTitle>
                  <CardDescription>Personalized coaching and individualized training sessions</CardDescription>
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
                    title="Team Training"
                    className="absolute inset-0 w-full h-full"
                  ></iframe>
                </div>
                <CardHeader>
                  <CardTitle>Team Training</CardTitle>
                  <CardDescription>Group training sessions and team athletic development</CardDescription>
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
                    title="Youth Training"
                    className="absolute inset-0 w-full h-full"
                  ></iframe>
                </div>
                <CardHeader>
                  <CardTitle>Youth Training</CardTitle>
                  <CardDescription>Elite development programs for young athletes</CardDescription>
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
                    title="Group Training Session"
                    className="absolute inset-0 w-full h-full"
                  ></iframe>
                </div>
                <CardHeader>
                  <CardTitle>Group Training Session</CardTitle>
                  <CardDescription>High-energy group workouts and community training</CardDescription>
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
                    title="Speed Training"
                    className="absolute inset-0 w-full h-full"
                  ></iframe>
                </div>
                <CardHeader>
                  <CardTitle>Speed Training</CardTitle>
                  <CardDescription>Elite speed development and acceleration drills</CardDescription>
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
                    title="Cryotherapy Wellness"
                    className="absolute inset-0 w-full h-full"
                  ></iframe>
                </div>
                <CardHeader>
                  <CardTitle>Cryotherapy Wellness</CardTitle>
                  <CardDescription>Advanced recovery and wellness therapy</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>

          {/* Photos Section */}
          <div>
            <h3 className="font-display text-3xl text-secondary mb-8 tracking-wide">FACILITY & TRAINING PHOTOS</h3>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer">
                <img 
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/image000008-1761154858471.jpg?width=8000&height=8000&resize=contain" 
                  alt="Mark Webb, Nasir Adderley, and D'Andre Swift - NFL Players trained by SwiftFit215" 
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white font-semibold">NFL Players - Trained Since Middle School</p>
                  </div>
                </div>
              </div>

              <div className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer">
                <img 
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/IMG_3029-1761152347064.jpg?width=8000&height=8000&resize=contain" 
                  alt="Women's Group Training Session" 
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white font-semibold">Women's Group Training Session</p>
                  </div>
                </div>
              </div>

              <div className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer">
                <img 
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/51EE0F41-EA39-442B-8017-19FAF07E1CBE-1761150357302.JPG?width=8000&height=8000&resize=contain" 
                  alt="Championship Success" 
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white font-semibold">Championship Winner</p>
                  </div>
                </div>
              </div>

              <div className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer">
                <img 
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/D0DE188D-D296-4F2E-B29D-47E7E04ED80B-1761152385752.jpg?width=8000&height=8000&resize=contain" 
                  alt="Client Transformation" 
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white font-semibold">Client Transformation</p>
                  </div>
                </div>
              </div>

              <div className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer">
                <img 
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/image000006-1761148932677.JPG?width=8000&height=8000&resize=contain" 
                  alt="Coach Darren Smith" 
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white font-semibold">Coach Darren Smith</p>
                  </div>
                </div>
              </div>

              <div className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer">
                <img 
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/IMG_5516-1761152368498.jpg?width=8000&height=8000&resize=contain" 
                  alt="Pro Training Connection - Micah Parsons" 
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white font-semibold">With NFL Star Micah Parsons</p>
                  </div>
                </div>
              </div>

              <div className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer">
                <img 
                  src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80" 
                  alt="Gym Equipment" 
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white font-semibold">State-of-the-Art Equipment</p>
                  </div>
                </div>
              </div>

              <div className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer">
                <img 
                  src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80" 
                  alt="Training Floor" 
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white font-semibold">Open Training Floor</p>
                  </div>
                </div>
              </div>

              <div className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer">
                <img 
                  src="https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&q=80" 
                  alt="Strength Zone" 
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white font-semibold">Strength Zone</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-6">Follow us on social media for daily training content and updates</p>
            <div className="flex justify-center gap-4">
              <a 
                href="https://www.instagram.com/swiftfit215/" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button className="bg-primary hover:bg-primary/90">
                  <Instagram className="h-5 w-5 mr-2" />
                  Follow on Instagram
                </Button>
              </a>
              <a 
                href="https://www.facebook.com/SwiftFit215/" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                  <Facebook className="h-5 w-5 mr-2" />
                  Like on Facebook
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* About/Philosophy Section */}
      <section id="about" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">Est. May 2021</Badge>
              <h2 className="font-display text-5xl md:text-6xl text-secondary mb-6 tracking-wide">
                WHERE VISION MEETS REALITY
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Founded by <span className="text-foreground font-semibold">Darren Swift</span>, Swift Fit 215 is Philadelphia's premier boutique gym specializing in elite speed and strength training. Located in the heart of the Harrowgate community, we've been transforming bodies and building champions since 2021.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold mb-1">Elite Athletic Training</div>
                    <p className="text-sm text-muted-foreground">Training top youth athletes including nationally ranked basketball players</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold mb-1">Holistic Approach</div>
                    <p className="text-sm text-muted-foreground">Combining strength, wellness, recovery, and mindset coaching</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold mb-1">Community-Focused</div>
                    <p className="text-sm text-muted-foreground">Building a family atmosphere with personalized attention</p>
                  </div>
                </div>
              </div>
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                <a href="#contact">Start Your Transformation</a>
              </Button>
            </div>
            <div className="relative">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-muted relative">
                <img 
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/image-1761152758760.png?width=8000&height=8000&resize=contain" 
                  alt="Swift Fit 215 Training" 
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-secondary/60 to-transparent"></div>
              </div>
              <Card className="absolute -bottom-6 -left-6 p-6 bg-secondary text-white border-0 max-w-xs">
                <div className="font-display text-3xl text-primary mb-2">IT GETS GREATER, LATER</div>
                <p className="text-sm text-white/80">
                  Trust the process. Your success is our mission.
                </p>
              </Card>
            </div>
          </div>

          <div className="mt-20 grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <div className="font-display text-2xl mb-2">VISION</div>
              <p className="text-sm text-muted-foreground">Trust in the vision your trainer has designed for you</p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <div className="font-display text-2xl mb-2">INTENSITY</div>
              <p className="text-sm text-muted-foreground">Always be comfortable with being uncomfortable</p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-8 w-8 text-primary" />
              </div>
              <div className="font-display text-2xl mb-2">RESULTS</div>
              <p className="text-sm text-muted-foreground">Your success is our goal—we track every milestone</p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <div className="font-display text-2xl mb-2">LIFESTYLE</div>
              <p className="text-sm text-muted-foreground">Fitness as a lifestyle, not just a hobby</p>
            </div>
          </div>

          {/* Darren's Philosophy Quotes */}
          <div className="mt-20">
            <div className="text-center mb-12">
              <h3 className="font-display text-4xl md:text-5xl text-secondary mb-3 tracking-wide">WORDS FROM DARREN</h3>
              <p className="text-muted-foreground">Motivation and mindset from our founder</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="p-6 border-l-4 border-l-primary">
                <p className="text-lg font-medium mb-3 text-foreground italic">
                  "Your success is our goal. We don't just track numbers—we build champions."
                </p>
                <p className="text-sm text-muted-foreground">— Darren Swift</p>
              </Card>

              <Card className="p-6 border-l-4 border-l-primary">
                <p className="text-lg font-medium mb-3 text-foreground italic">
                  "Where else would I be? This isn't just a job—it's my calling, my lifestyle, my family."
                </p>
                <p className="text-sm text-muted-foreground">— Darren Swift</p>
              </Card>

              <Card className="p-6 border-l-4 border-l-primary">
                <p className="text-lg font-medium mb-3 text-foreground italic">
                  "It gets greater, later. Trust the process and watch yourself transform."
                </p>
                <p className="text-sm text-muted-foreground">— Darren Swift</p>
              </Card>

              <Card className="p-6 border-l-4 border-l-primary">
                <p className="text-lg font-medium mb-3 text-foreground italic">
                  "We're not just building bodies—we're shifting mindsets and changing lives."
                </p>
                <p className="text-sm text-muted-foreground">— Darren Swift</p>
              </Card>

              <Card className="p-6 border-l-4 border-l-primary">
                <p className="text-lg font-medium mb-3 text-foreground italic">
                  "Fitness isn't a hobby here—it's a lifestyle. We live it, breathe it, embody it."
                </p>
                <p className="text-sm text-muted-foreground">— Darren Swift</p>
              </Card>

              <Card className="p-6 border-l-4 border-l-primary">
                <p className="text-lg font-medium mb-3 text-foreground italic">
                  "This is where champions are made. Elite training, personal attention, unbreakable results."
                </p>
                <p className="text-sm text-muted-foreground">— Darren Swift</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Contact/Location Section */}
      <section id="contact" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-5xl md:text-6xl text-secondary mb-4 tracking-wide">GET STARTED TODAY</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Visit us in Philadelphia or reach out for your free consultation
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <Card className="p-8 mb-6">
                <h3 className="font-display text-3xl mb-6 tracking-wide">LOCATION & HOURS</h3>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold mb-1">Address</div>
                      <p className="text-muted-foreground">2245 E Tioga Street</p>
                      <p className="text-muted-foreground">Philadelphia, PA 19134</p>
                      <p className="text-sm text-muted-foreground mt-1">(Entrance on Weikel Street)</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold mb-1">Phone</div>
                      <a href="tel:2679390254" className="text-primary hover:underline block">(267) 939-0254</a>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold mb-2">Hours of Operation</div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between gap-8">
                          <span className="text-muted-foreground">Monday - Friday</span>
                          <span className="font-medium">7:00 AM - 8:00 PM</span>
                        </div>
                        <div className="flex justify-between gap-8">
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
                  title="Swift Fit 215 Location"
                ></iframe>
              </div>
            </div>

            <Card className="p-8">
              <h3 className="font-display text-3xl mb-2 tracking-wide">REQUEST A FREE CONSULTATION</h3>
              <p className="text-muted-foreground mb-6">
                Fill out the form below and we'll get back to you within 24 hours
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
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
                <div>
                  <Label htmlFor="message">Message</Label>
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
                  className="w-full bg-primary hover:bg-primary/90 h-12 text-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Get Your Free Consultation"}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  By submitting this form, you agree to be contacted by Swift Fit 215
                </p>
              </form>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Dumbbell className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-display text-2xl tracking-wider">SWIFT FIT 215</h3>
                </div>
              </div>
              <p className="text-white/70 text-sm mb-4">
                Philadelphia's premier speed and strength training academy
              </p>
              <div className="flex gap-3">
                <a 
                  href="https://www.instagram.com/swiftfit215/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="h-10 w-10 rounded-full bg-white/10 hover:bg-primary flex items-center justify-center transition-colors"
                  aria-label="Follow us on Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a 
                  href="https://www.facebook.com/SwiftFit215/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="h-10 w-10 rounded-full bg-white/10 hover:bg-primary flex items-center justify-center transition-colors"
                  aria-label="Follow us on Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><a href="#services" className="hover:text-primary transition-colors">Services</a></li>
                <li><a href="#about" className="hover:text-primary transition-colors">About</a></li>
                <li><a href="#contact" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li>Gym Membership</li>
                <li>Personal Training</li>
                <li>Athletic Training</li>
                <li>Wellness Services</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li>(267) 939-0254</li>
                <li>2245 E Tioga Street</li>
                <li>Philadelphia, PA 19134</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-sm text-white/60">
            <p>© 2025 Swift Fit 215. All rights reserved. | Established May 2021</p>
            <p className="mt-2 font-display text-primary">TRANSFORM YOUR BODY TODAY</p>
          </div>
        </div>
      </footer>
    </div>
  )
}