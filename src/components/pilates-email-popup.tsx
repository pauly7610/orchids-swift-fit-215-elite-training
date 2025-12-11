"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Mail, Sparkles } from "lucide-react"
import { toast } from "sonner"

interface PilatesEmailPopupProps {
  delayMs?: number
}

export function PilatesEmailPopup({ delayMs = 3000 }: PilatesEmailPopupProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    phone: ""
  })

  useEffect(() => {
    // Check if user has already seen the popup
    const hasSeenPopup = localStorage.getItem('pilates-popup-seen')
    
    if (!hasSeenPopup) {
      // Show popup after delay
      const timer = setTimeout(() => {
        setOpen(true)
      }, delayMs)

      return () => clearTimeout(timer)
    }
  }, [delayMs])

  const handleClose = () => {
    setOpen(false)
    // Mark popup as seen for this session
    localStorage.setItem('pilates-popup-seen', 'true')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isSubmitting) return
    
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/email-subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          name: formData.name.trim() || null,
          phone: formData.phone.trim() || null,
          source: 'pilates_popup'
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("🎉 Welcome! You're on the list! Check your email for exclusive offers.")
        setFormData({ email: "", name: "", phone: "" })
        handleClose()
      } else {
        if (data.code === 'DUPLICATE_EMAIL') {
          toast.error("You're already subscribed! Check your email for updates.")
          handleClose()
        } else {
          toast.error(data.error || "Failed to subscribe. Please try again.")
        }
      }
    } catch (error) {
      console.error('Subscription error:', error)
      toast.error("Something went wrong. Please try again or contact us directly.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md bg-[#FAF8F5] border-[#B8AFA5]/30 max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-10"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </button>
        
        <DialogHeader className="pt-2">
          <div className="mx-auto mb-3 sm:mb-4 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#9BA899]/20 to-[#E8B4B8]/20 flex items-center justify-center">
            <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-[#9BA899]" />
          </div>
          <DialogTitle className="text-xl sm:text-2xl font-serif text-center text-[#5A5550]">
            Join Our Wellness Community
          </DialogTitle>
          <DialogDescription className="text-center text-[#7A736B] text-sm sm:text-base">
            Get exclusive class updates, wellness tips, and special offers delivered to your inbox.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 mt-2 sm:mt-4">
          <div>
            <Label htmlFor="popup-email" className="text-[#5A5550]">Email *</Label>
            <Input
              id="popup-email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="your@email.com"
              className="mt-1 border-[#B8AFA5]/30 focus:border-[#9BA899]"
            />
          </div>

          <div>
            <Label htmlFor="popup-name" className="text-[#5A5550]">Name (Optional)</Label>
            <Input
              id="popup-name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Your name"
              className="mt-1 border-[#B8AFA5]/30 focus:border-[#9BA899]"
            />
          </div>

          <div>
            <Label htmlFor="popup-phone" className="text-[#5A5550]">Phone (Optional)</Label>
            <Input
              id="popup-phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(215) 555-0123"
              className="mt-1 border-[#B8AFA5]/30 focus:border-[#9BA899]"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-2">
            <Button
              type="button"
              onClick={handleClose}
              variant="outline"
              className="border-[#B8AFA5] text-[#5A5550] hover:bg-[#F5F2EE] rounded-full w-full sm:w-auto"
            >
              Maybe Later
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#9BA899] hover:bg-[#8A9788] text-white rounded-full"
            >
              {isSubmitting ? "Subscribing..." : "Sign Me Up"}
            </Button>
          </div>

          <p className="text-[10px] sm:text-xs text-center text-[#9BA899] pb-2">
            We respect your privacy. Unsubscribe anytime.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  )
}
