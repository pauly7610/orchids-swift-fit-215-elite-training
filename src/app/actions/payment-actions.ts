"use server"

import { Client, Environment, ApiError } from "square"
import { v4 as uuidv4 } from "uuid"
import { db } from "@/db"
import { payments, studentPurchases, packages as packagesTable, memberships as membershipsTable } from "@/db/schema"
import { eq } from "drizzle-orm"

const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN || "",
  environment: process.env.NODE_ENV === "production" ? Environment.Production : Environment.Sandbox,
})

interface ProcessPaymentParams {
  sourceId: string
  amount: number
  currency: string
  studentProfileId: number
  description: string
  type: "package" | "membership" | "single_class"
  packageId?: number
  membershipId?: number
  saveCard?: boolean
}

interface PaymentResult {
  success: boolean
  paymentId?: string
  error?: string
}

export async function processPayment(params: ProcessPaymentParams): Promise<PaymentResult> {
  try {
    const { sourceId, amount, currency, studentProfileId, description, type, packageId, membershipId, saveCard } = params

    // Generate idempotency key for retry safety
    const idempotencyKey = uuidv4()

    // Create payment via Square API
    const response = await client.paymentsApi.createPayment({
      sourceId,
      amountMoney: {
        amount: BigInt(Math.round(amount)), // Convert to cents
        currency,
      },
      idempotencyKey,
      locationId: process.env.SQUARE_LOCATION_ID || "",
    })

    if (!response.result.payment) {
      return {
        success: false,
        error: "Payment processing failed",
      }
    }

    const payment = response.result.payment

    // Store payment in database
    const paymentRecord = await db.insert(payments).values({
      studentProfileId,
      amount: amount / 100, // Store in dollars
      currency,
      paymentMethod: "square",
      squarePaymentId: payment.id || "",
      status: payment.status || "pending",
      paymentDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }).returning()

    if (!paymentRecord || paymentRecord.length === 0) {
      return {
        success: false,
        error: "Failed to save payment record",
      }
    }

    // Handle package purchase
    if (type === "package" && packageId) {
      const packageInfo = await db.select().from(packagesTable).where(eq(packagesTable.id, packageId)).limit(1)
      
      if (packageInfo && packageInfo.length > 0) {
        const pkg = packageInfo[0]
        
        // Calculate expiration date
        let expiresAt = null
        if (pkg.expirationDays) {
          const expirationDate = new Date()
          expirationDate.setDate(expirationDate.getDate() + pkg.expirationDays)
          expiresAt = expirationDate.toISOString()
        }

        await db.insert(studentPurchases).values({
          studentProfileId,
          purchaseType: "package",
          packageId,
          membershipId: null,
          creditsRemaining: pkg.credits,
          creditsTotal: pkg.credits,
          purchasedAt: new Date().toISOString(),
          expiresAt,
          isActive: true,
          paymentId: paymentRecord[0].id,
        })
      }
    }

    // Handle membership signup
    if (type === "membership" && membershipId) {
      // Set expiration to 30 days from now (monthly membership)
      const expirationDate = new Date()
      expirationDate.setDate(expirationDate.getDate() + 30)

      await db.insert(studentPurchases).values({
        studentProfileId,
        purchaseType: "membership",
        packageId: null,
        membershipId,
        creditsRemaining: null, // Unlimited
        creditsTotal: null,
        purchasedAt: new Date().toISOString(),
        expiresAt: expirationDate.toISOString(),
        isActive: true,
        paymentId: paymentRecord[0].id,
      })
    }

    return {
      success: true,
      paymentId: payment.id || "",
    }
  } catch (error) {
    console.error("Payment processing error:", error)
    
    if (error instanceof ApiError) {
      return {
        success: false,
        error: error.errors?.[0]?.detail || "Payment failed",
      }
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function chargeCardOnFile(
  customerId: string,
  amount: number,
  description: string,
  studentProfileId: number
): Promise<PaymentResult> {
  try {
    const idempotencyKey = uuidv4()

    // Get customer's saved card ID
    const customerResponse = await client.customersApi.retrieveCustomer(customerId)
    
    if (!customerResponse.result.customer?.cards || customerResponse.result.customer.cards.length === 0) {
      return { success: false, error: "No saved card found" }
    }

    const cardId = customerResponse.result.customer.cards[0].id

    const response = await client.paymentsApi.createPayment({
      sourceId: cardId,
      amountMoney: {
        amount: BigInt(Math.round(amount)),
        currency: "USD",
      },
      idempotencyKey,
      customerId,
      locationId: process.env.SQUARE_LOCATION_ID || "",
    })

    if (!response.result.payment) {
      return { success: false, error: "Payment failed" }
    }

    // Store payment in database
    await db.insert(payments).values({
      studentProfileId,
      amount: amount / 100,
      currency: "USD",
      paymentMethod: "square",
      squarePaymentId: response.result.payment.id || "",
      status: response.result.payment.status || "pending",
      paymentDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    })

    return {
      success: true,
      paymentId: response.result.payment.id || "",
    }
  } catch (error) {
    console.error("Card on file charge error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}
