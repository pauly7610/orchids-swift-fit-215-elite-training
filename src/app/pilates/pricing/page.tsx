"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Sparkles,
  CheckCircle2,
  Star,
  Gift,
  TrendingUp,
  Zap,
  ExternalLink,
  RefreshCw,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import Image from "next/image";
import { AdminBar } from "@/components/admin-bar";

interface Package {
  id: number;
  name: string;
  description: string;
  credits: number;
  price: number;
  expirationDays: number;
  validityType: string;
  swipeSimpleLink: string;
  isActive: boolean;
}

interface Membership {
  id: number;
  name: string;
  description: string;
  priceMonthly: number;
  isUnlimited: boolean;
  creditsPerMonth: number;
  swipeSimpleLink: string;
  isActive: boolean;
}

const iconMap: Record<string, any> = {
  "New Student Intro": Gift,
  "Drop In": Zap,
  "5 Class Pack": Star,
  "10 Class Pack": TrendingUp,
  "20 Class Pack": TrendingUp,
};

// SwipeSimple payment links
const SWIPE_SIMPLE_LINKS: Record<string, string> = {
  // Class Packs
  "New Student Intro":
    "https://swipesimple.com/links/lnk_3170cae99f12bdf4946fbad2f0115779",
  "Drop In":
    "https://swipesimple.com/links/lnk_2fbdf3a609891ea262e844eb8ecd6d0d",
  "5 Class Pack":
    "https://swipesimple.com/links/lnk_31523cd29d05b93f5914fa3810d6d222",
  "10 Class Pack":
    "https://swipesimple.com/links/lnk_05d3b78c3d0a693475d54f08edddeaa0",
  "20 Class Pack":
    "https://swipesimple.com/links/lnk_e67ae0c539f9ef0c8b2715cc6a058d5a",
  // Monthly Memberships
  "4 Class Monthly":
    "https://swipesimple.com/links/lnk_6f005263d89019ae3467b7014930bdb7",
  "8 Class Monthly":
    "https://swipesimple.com/links/lnk_b98d041b9a58327d90aea6dd479ba24b",
  "Unlimited Monthly":
    "https://swipesimple.com/links/lnk_f7a2d31d0342eda1b64db8ae9f170cff",
};

export default function PricingPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    fetchPricingData();
  }, []);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
        mobileMenuButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMobileMenuOpen]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target as Node) &&
        isMobileMenuOpen
      ) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const fetchPricingData = async () => {
    try {
      const [packagesRes, membershipsRes] = await Promise.all([
        fetch("/api/packages?isActive=true"),
        fetch("/api/memberships?isActive=true"),
      ]);

      if (packagesRes.ok) {
        const data = await packagesRes.json();
        setPackages(data);
      }
      if (membershipsRes.ok) {
        const data = await membershipsRes.json();
        setMemberships(data);
      }
    } catch (error) {
      toast.error("Failed to load pricing information");
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = (name: string) => {
    const link = SWIPE_SIMPLE_LINKS[name];

    if (!link) {
      toast.error("Payment link not available. Please contact us.");
      return;
    }

    // Check if running in iframe
    const isInIframe = window.self !== window.top;

    if (isInIframe) {
      // Post message to parent to open in new tab
      window.parent.postMessage(
        {
          type: "OPEN_EXTERNAL_URL",
          data: { url: link },
        },
        "*"
      );
    } else {
      // Open directly in new tab
      window.open(link, "_blank", "noopener,noreferrer");
    }

    toast.success(`Opening payment page for ${name}`);
  };

  const getPerClassPrice = (price: number, credits: number) => {
    return (price / credits).toFixed(2);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9BA899] mx-auto mb-4"></div>
          <p className="text-[#7A736B]">Loading pricing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Admin Bar - only shows for admins */}
      <AdminBar currentPage="pricing" />
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#FAF8F5]/95 backdrop-blur-sm border-b border-[#B8AFA5]/20">
        <div className="container mx-auto px-4 py-4 md:py-5 flex items-center justify-between">
          <Link href="/pilates" className="flex items-center gap-2 md:gap-3">
            <div className="relative w-10 h-10 md:w-12 md:h-12">
              <Image
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/image-1765052969010.png?width=8000&height=8000&resize=contain"
                alt="Swift Fit Pilates and Wellness Studio"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="font-serif text-lg md:text-xl tracking-wide text-[#5A5550]">
                Swift Fit
              </h1>
              <p className="text-[10px] md:text-xs text-[#9BA899] -mt-0.5 tracking-wider">
                PILATES AND WELLNESS STUDIO
              </p>
            </div>
          </Link>
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            <Link
              href="/pilates/about"
              className="text-[#5A5550] hover:text-[#9BA899] transition-colors text-sm"
            >
              About
            </Link>
            <Link
              href="/pilates/instructors"
              className="text-[#5A5550] hover:text-[#9BA899] transition-colors text-sm"
            >
              Instructors
            </Link>
            <Link
              href="/pilates/classes"
              className="text-[#5A5550] hover:text-[#9BA899] transition-colors text-sm"
            >
              Classes
            </Link>
            <Link
              href="/pilates/pricing"
              className="text-[#9BA899] font-medium transition-colors text-sm"
            >
              Pricing
            </Link>
            <Link
              href="/pilates/schedule"
              className="text-[#5A5550] hover:text-[#9BA899] transition-colors text-sm"
            >
              Schedule
            </Link>
            <Link
              href="/pilates/faq"
              className="text-[#5A5550] hover:text-[#9BA899] transition-colors text-sm"
            >
              FAQ
            </Link>
            <Link href="/">
              <Button
                size="sm"
                variant="outline"
                className="border-[#B8AFA5] text-[#5A5550] hover:bg-[#9BA899]/10"
              >
                Back to Gym
              </Button>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            ref={mobileMenuButtonRef}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden text-[#5A5550] p-2 hover:bg-[#9BA899]/10 rounded-lg transition-colors"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div
            id="mobile-menu"
            className="lg:hidden border-t border-[#B8AFA5]/20 bg-[#FAF8F5]/98 backdrop-blur-sm"
            ref={mobileMenuRef}
            role="dialog"
            aria-label="Mobile navigation menu"
          >
            <nav
              className="container mx-auto px-4 py-4 flex flex-col gap-3"
              aria-label="Mobile navigation"
            >
              <Link
                href="/pilates/about"
                className="text-[#5A5550] hover:text-[#9BA899] transition-colors text-base font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/pilates/instructors"
                className="text-[#5A5550] hover:text-[#9BA899] transition-colors text-base font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Instructors
              </Link>
              <Link
                href="/pilates/classes"
                className="text-[#5A5550] hover:text-[#9BA899] transition-colors text-base font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Classes
              </Link>
              <Link
                href="/pilates/pricing"
                className="text-[#9BA899] font-medium transition-colors text-base py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="/pilates/schedule"
                className="text-[#5A5550] hover:text-[#9BA899] transition-colors text-base font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Schedule
              </Link>
              <Link
                href="/pilates/faq"
                className="text-[#5A5550] hover:text-[#9BA899] transition-colors text-base font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                FAQ
              </Link>
              <div className="flex flex-col gap-2 mt-2">
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button
                    size="sm"
                    className="bg-[#9BA899] hover:bg-[#8A9788] text-white rounded-full w-full"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-[#B8AFA5] text-[#5A5550] hover:bg-[#9BA899]/10 w-full"
                  >
                    Back to Gym
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-linear-to-b from-[#F5F2EE] to-[#FAF8F5] relative overflow-hidden">
        <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-[#9BA899]/5 blur-3xl"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-serif text-5xl md:text-6xl text-[#5A5550] mb-4 font-light">
              Pricing & Packages
            </h1>
            <p className="text-lg text-[#7A736B] leading-relaxed">
              Find the perfect package for your wellness journey - from drop-ins
              to unlimited monthly memberships.
            </p>
          </div>
        </div>
      </section>

      {/* Class Packs Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-serif text-4xl md:text-5xl text-[#5A5550] mb-4 font-light">
                Class Packs
              </h2>
              <p className="text-base text-[#7A736B]">
                Pay as you go with our flexible class pack options
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg) => {
                const Icon = iconMap[pkg.name] || Star;
                const isIntro = pkg.name === "New Student Intro";

                return (
                  <Card
                    key={pkg.id}
                    className={`relative border-2 transition-all hover:shadow-lg bg-white ${
                      isIntro
                        ? "border-[#9BA899]"
                        : "border-[#B8AFA5]/30 hover:border-[#9BA899]"
                    }`}
                  >
                    {isIntro && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-[#9BA899] text-white border-none">
                          <Star className="h-3 w-3 mr-1" />
                          Best for New Students
                        </Badge>
                      </div>
                    )}

                    <CardHeader>
                      <div className="h-12 w-12 rounded-full bg-[#9BA899]/10 flex items-center justify-center mb-4">
                        <Icon className="h-6 w-6 text-[#9BA899]" />
                      </div>
                      <CardTitle className="text-2xl font-serif font-normal text-[#5A5550]">
                        {pkg.name}
                      </CardTitle>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="font-serif text-4xl text-[#9BA899] font-light">
                          ${pkg.price}
                        </span>
                        {pkg.credits > 1 && (
                          <span className="text-sm text-[#7A736B]">
                            (${getPerClassPrice(pkg.price, pkg.credits)}/class)
                          </span>
                        )}
                      </div>
                      <CardDescription className="mt-2 text-[#7A736B]">
                        {pkg.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3 mb-6">
                        <li className="flex items-start gap-2 text-sm text-[#5A5550]">
                          <CheckCircle2 className="h-4 w-4 text-[#9BA899] mt-0.5 shrink-0" />
                          <span>
                            {pkg.credits}{" "}
                            {pkg.credits === 1 ? "class" : "classes"} included
                          </span>
                        </li>
                        <li className="flex items-start gap-2 text-sm text-[#5A5550]">
                          <CheckCircle2 className="h-4 w-4 text-[#9BA899] mt-0.5 shrink-0" />
                          <span>Valid for all class types</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm text-[#5A5550]">
                          <CheckCircle2 className="h-4 w-4 text-[#9BA899] mt-0.5 shrink-0" />
                          <span>
                            {pkg.expirationDays === 1
                              ? "Valid same day only"
                              : pkg.expirationDays < 60
                                ? `Valid for ${pkg.expirationDays} days`
                                : pkg.validityType === "annual"
                                  ? "Valid for 1 year from purchase"
                                  : "Flexible scheduling"}
                          </span>
                        </li>
                        {pkg.credits >= 5 && (
                          <li className="flex items-start gap-2 text-sm text-[#5A5550]">
                            <CheckCircle2 className="h-4 w-4 text-[#9BA899] mt-0.5 shrink-0" />
                            <span>Share with friends/family</span>
                          </li>
                        )}
                        {pkg.credits >= 10 && (
                          <li className="flex items-start gap-2 text-sm text-[#5A5550]">
                            <CheckCircle2 className="h-4 w-4 text-[#9BA899] mt-0.5 shrink-0" />
                            <span>Priority booking access</span>
                          </li>
                        )}
                      </ul>

                      <Button
                        className="w-full bg-[#9BA899] hover:bg-[#8A9788] text-white rounded-full"
                        onClick={() => handlePurchase(pkg.name)}
                      >
                        Purchase Now
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Monthly Memberships Section */}
      <section className="py-20 bg-[#F5F2EE]">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-serif text-4xl md:text-5xl text-[#5A5550] mb-4 font-light">
                Monthly Memberships
              </h2>
              <p className="text-base text-[#7A736B] mb-4">
                Commit to your practice with recurring monthly memberships
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-[#9BA899]">
                <RefreshCw className="h-4 w-4" />
                <span>
                  Memberships automatically renew monthly • Manage anytime from
                  your dashboard
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {memberships.map((membership) => {
                const isPopular = membership.creditsPerMonth === 8;

                return (
                  <Card
                    key={membership.id}
                    className={`relative border-2 transition-all hover:shadow-lg bg-white ${
                      isPopular
                        ? "border-[#9BA899]"
                        : "border-[#B8AFA5]/30 hover:border-[#9BA899]"
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-[#9BA899] text-white border-none">
                          <Star className="h-3 w-3 mr-1" />
                          Most Popular
                        </Badge>
                      </div>
                    )}

                    <CardHeader>
                      <CardTitle className="text-2xl font-serif font-normal text-[#5A5550]">
                        {membership.name}
                      </CardTitle>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="font-serif text-4xl text-[#9BA899] font-light">
                          ${membership.priceMonthly}
                        </span>
                        <span className="text-sm text-[#7A736B]">/month</span>
                      </div>
                      {!membership.isUnlimited &&
                        membership.creditsPerMonth && (
                          <p className="text-sm text-[#7A736B] mt-1">
                            ($
                            {(
                              membership.priceMonthly /
                              membership.creditsPerMonth
                            ).toFixed(2)}
                            /class)
                          </p>
                        )}
                      <CardDescription className="mt-2 text-[#7A736B]">
                        {membership.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3 mb-6">
                        <li className="flex items-start gap-2 text-sm text-[#5A5550]">
                          <CheckCircle2 className="h-4 w-4 text-[#9BA899] mt-0.5 shrink-0" />
                          <span>
                            {membership.isUnlimited
                              ? "Unlimited classes per month"
                              : `${membership.creditsPerMonth} classes per month`}
                          </span>
                        </li>
                        <li className="flex items-start gap-2 text-sm text-[#5A5550]">
                          <RefreshCw className="h-4 w-4 text-[#9BA899] mt-0.5 shrink-0" />
                          <span className="font-medium">
                            Automatically renews monthly
                          </span>
                        </li>
                        {!membership.isUnlimited && (
                          <li className="flex items-start gap-2 text-sm text-[#5A5550]">
                            <CheckCircle2 className="h-4 w-4 text-[#9BA899] mt-0.5 shrink-0" />
                            <span>Rollover unused classes (up to 1 month)</span>
                          </li>
                        )}
                        <li className="flex items-start gap-2 text-sm text-[#5A5550]">
                          <CheckCircle2 className="h-4 w-4 text-[#9BA899] mt-0.5 shrink-0" />
                          <span>Priority booking</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm text-[#5A5550]">
                          <CheckCircle2 className="h-4 w-4 text-[#9BA899] mt-0.5 shrink-0" />
                          <span>Member-only events & wellness perks</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm text-[#5A5550]">
                          <CheckCircle2 className="h-4 w-4 text-[#9BA899] mt-0.5 shrink-0" />
                          <span>10% off workshops & merch</span>
                        </li>
                      </ul>

                      <Button
                        className="w-full bg-[#9BA899] hover:bg-[#8A9788] text-white rounded-full"
                        onClick={() => handlePurchase(membership.name)}
                      >
                        Subscribe Now
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </Button>

                      <p className="text-xs text-[#9BA899] text-center mt-3">
                        Cancel anytime from your student dashboard
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Membership Perks Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-serif text-4xl md:text-5xl text-[#5A5550] mb-6 font-light">
                Membership Perks
              </h2>
              <p className="text-base text-[#7A736B]">
                All monthly memberships include these amazing benefits
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 border-l-4 border-l-[#9BA899] border-[#B8AFA5]/30 bg-[#FAF8F5]">
                <div className="flex items-start gap-3 mb-2">
                  <RefreshCw className="h-5 w-5 text-[#9BA899] shrink-0 mt-0.5" />
                  <h3 className="text-xl font-serif font-normal text-[#5A5550]">
                    Auto-Renewal & Rollover
                  </h3>
                </div>
                <p className="text-[#7A736B]">
                  Your membership automatically renews each month so you never
                  miss out. Unused classes roll over for up to 1 month, ensuring
                  you never lose what you've paid for. Cancel anytime from your
                  dashboard.
                </p>
              </Card>

              <Card className="p-6 border-l-4 border-l-[#9BA899] border-[#B8AFA5]/30 bg-[#FAF8F5]">
                <h3 className="text-xl font-serif font-normal text-[#5A5550] mb-2">
                  Priority Booking
                </h3>
                <p className="text-[#7A736B]">
                  Members get first access to book classes, ensuring you never
                  miss your favorite instructor or time slot.
                </p>
              </Card>

              <Card className="p-6 border-l-4 border-l-[#9BA899] border-[#B8AFA5]/30 bg-[#FAF8F5]">
                <h3 className="text-xl font-serif font-normal text-[#5A5550] mb-2">
                  Member-Only Events
                </h3>
                <p className="text-[#7A736B]">
                  Exclusive access to special events, workshops, and wellness
                  experiences designed just for our community.
                </p>
              </Card>

              <Card className="p-6 border-l-4 border-l-[#9BA899] border-[#B8AFA5]/30 bg-[#FAF8F5]">
                <h3 className="text-xl font-serif font-normal text-[#5A5550] mb-2">
                  10% Off Workshops & Merch
                </h3>
                <p className="text-[#7A736B]">
                  Save 10% on all special workshops, studio merchandise, and
                  wellness products.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-linear-to-b from-[#9BA899]/10 to-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#B8AFA5]/10 blur-3xl"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="font-serif text-4xl md:text-5xl text-[#5A5550] mb-6 font-light">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-[#7A736B] mb-8 max-w-2xl mx-auto">
            Purchase a package above, then book your first class to begin your
            wellness journey with us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pilates/schedule">
              <Button
                size="lg"
                className="bg-[#9BA899] hover:bg-[#8A9788] text-white text-base h-12 px-8 rounded-full"
              >
                View Schedule & Book
              </Button>
            </Link>
            <Link href="/pilates/faq">
              <Button
                size="lg"
                variant="outline"
                className="border-[#B8AFA5] bg-white text-[#5A5550] hover:bg-[#F5F2EE] text-base h-12 px-8 rounded-full"
              >
                Have Questions?
              </Button>
            </Link>
          </div>
          <p className="text-sm text-[#9BA899] mt-6">
            New to the studio? Start with our 3-class intro pack for just $49!
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
                  <h3 className="font-serif text-xl tracking-wide">
                    Swift Fit
                  </h3>
                  <p className="text-xs text-[#9BA899] tracking-wider">
                    PILATES AND WELLNESS
                  </p>
                </div>
              </div>
              <p className="text-[#B8AFA5] text-sm leading-relaxed">
                A warm, welcoming space for real people on real journeys.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-[#FAF8F5]">Quick Links</h4>
              <ul className="space-y-2 text-sm text-[#B8AFA5]">
                <li>
                  <Link
                    href="/pilates"
                    className="hover:text-[#9BA899] transition-colors"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pilates/about"
                    className="hover:text-[#9BA899] transition-colors"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pilates/instructors"
                    className="hover:text-[#9BA899] transition-colors"
                  >
                    Instructors
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pilates/classes"
                    className="hover:text-[#9BA899] transition-colors"
                  >
                    Classes
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pilates/pricing"
                    className="hover:text-[#9BA899] transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pilates/schedule"
                    className="hover:text-[#9BA899] transition-colors"
                  >
                    Schedule
                  </Link>
                </li>
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
            <p>
              © 2025 Swift Fit Pilates + Wellness Studio. All rights reserved.
            </p>
            <p className="mt-2">
              Part of{" "}
              <Link href="/" className="text-[#9BA899] hover:underline">
                SwiftFit 215
              </Link>{" "}
              family
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
