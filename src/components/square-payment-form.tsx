"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

declare global {
  interface Window {
    Square?: any
  }
}

interface SquarePaymentFormProps {
  amount: number
  onSuccess: (paymentId: string) => void
  onCancel?: () => void
}

export function SquarePaymentForm({ amount, onSuccess, onCancel }: SquarePaymentFormProps) {
  const [card, setCard] = useState<any>(null)
  const [processing, setProcessing] = useState(false)
  const [squareLoaded, setSquareLoaded] = useState(false)

  useEffect(() => {
    const initializeSquare = async () => {
      if (!window.Square) {
        const script = document.createElement("script")
        script.src = "https://sandbox.web.squarecdn.com/v1/square.js"
        script.async = true
        script.onload = () => setSquareLoaded(true)
        document.body.appendChild(script)
      } else {
        setSquareLoaded(true)
      }
    }

    initializeSquare()
  }, [])

  useEffect(() => {
    if (squareLoaded && window.Square) {
      initializeCard()
    }
  }, [squareLoaded])

  const initializeCard = async () => {
    try {
      const payments = window.Square.payments(
        process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID,
        process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID
      )

      const cardInstance = await payments.card()
      await cardInstance.attach("#card-container")
      setCard(cardInstance)
    } catch (error) {
      console.error("Failed to initialize Square card:", error)
      toast.error("Failed to load payment form")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!card) {
      toast.error("Payment form not ready")
      return
    }

    setProcessing(true)

    try {
      const result = await card.tokenize()
      
      if (result.status === "OK") {
        const token = result.token

        // Create payment on server
        const tokenBearer = localStorage.getItem("bearer_token")
        const res = await fetch("/api/payments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenBearer}`
          },
          body: JSON.stringify({
            sourceId: token,
            amount: amount * 100, // Convert to cents
            currency: "USD"
          })
        })

        if (res.ok) {
          const data = await res.json()
          toast.success("Payment successful!")
          onSuccess(data.paymentId)
        } else {
          const errorData = await res.json()
          toast.error(errorData.error || "Payment failed")
        }
      } else {
        toast.error("Card tokenization failed")
      }
    } catch (error) {
      console.error("Payment error:", error)
      toast.error("Payment processing failed")
    } finally {
      setProcessing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
        <CardDescription>
          Total Amount: ${amount.toFixed(2)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div id="card-container" className="min-h-[100px]"></div>
          
          <div className="flex gap-4">
            <Button type="submit" disabled={processing || !card} className="flex-1">
              {processing ? "Processing..." : `Pay $${amount.toFixed(2)}`}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Secure payment processed by Square
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
