import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { studentPurchases, packages, memberships, payments, userProfiles, user } from '@/db/schema';
import { eq, like, or } from 'drizzle-orm';

// SwipeSimple webhook secret for verification (set in environment)
const WEBHOOK_SECRET = process.env.SWIPESIMPLE_WEBHOOK_SECRET;

// Map SwipeSimple link IDs to package/membership names
const LINK_TO_PRODUCT: Record<string, { type: 'package' | 'membership'; name: string }> = {
  'lnk_3170cae99f12bdf4946fbad2f0115779': { type: 'package', name: 'New Student Intro' },
  'lnk_2fbdf3a609891ea262e844eb8ecd6d0d': { type: 'package', name: 'Drop In' },
  'lnk_31523cd29d05b93f5914fa3810d6d222': { type: 'package', name: '5 Class Pack' },
  'lnk_05d3b78c3d0a693475d54f08edddeaa0': { type: 'package', name: '10 Class Pack' },
  'lnk_e67ae0c539f9ef0c8b2715cc6a058d5a': { type: 'package', name: '20 Class Pack' },
  'lnk_6f005263d89019ae3467b7014930bdb7': { type: 'membership', name: '4 Class Monthly' },
  'lnk_b98d041b9a58327d90aea6dd479ba24b': { type: 'membership', name: '8 Class Monthly' },
  'lnk_f7a2d31d0342eda1b64db8ae9f170cff': { type: 'membership', name: 'Unlimited Monthly' },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('=== SWIPESIMPLE WEBHOOK RECEIVED ===');
    console.log('Payload:', JSON.stringify(body, null, 2));

    // Extract payment details from webhook payload
    // SwipeSimple webhook format may vary - adjust based on actual payload structure
    const {
      event_type,
      payment,
      customer,
      link_id,
      amount,
      status,
      transaction_id,
      // Alternative field names that SwipeSimple might use
      type,
      data,
    } = body;

    // Handle different webhook formats
    const eventType = event_type || type || 'payment.completed';
    const paymentData = payment || data?.payment || body;
    const customerData = customer || data?.customer || paymentData?.customer || {};
    const paymentLinkId = link_id || paymentData?.link_id || paymentData?.metadata?.link_id;
    const paymentAmount = amount || paymentData?.amount || paymentData?.total;
    const paymentStatus = status || paymentData?.status || 'completed';
    const txnId = transaction_id || paymentData?.transaction_id || paymentData?.id;

    // Only process successful payments
    if (paymentStatus !== 'completed' && paymentStatus !== 'COMPLETED' && paymentStatus !== 'approved') {
      console.log('Skipping non-completed payment:', paymentStatus);
      return NextResponse.json({ received: true, skipped: 'not_completed' });
    }

    // Get customer email - try multiple possible locations
    const customerEmail = (
      customerData?.email || 
      paymentData?.email || 
      paymentData?.customer_email ||
      paymentData?.billing_email ||
      body.email
    )?.toLowerCase()?.trim();

    if (!customerEmail) {
      console.error('No customer email found in webhook payload');
      return NextResponse.json(
        { error: 'No customer email in payload', received: true },
        { status: 200 } // Return 200 to acknowledge receipt
      );
    }

    console.log('Customer email:', customerEmail);
    console.log('Payment link ID:', paymentLinkId);

    // Find the user by email
    const userData = await db
      .select({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        profileId: userProfiles.id,
      })
      .from(user)
      .leftJoin(userProfiles, eq(userProfiles.userId, user.id))
      .where(eq(user.email, customerEmail))
      .limit(1);

    if (userData.length === 0) {
      console.log('User not found for email:', customerEmail);
      // Store for manual processing later
      return NextResponse.json({
        received: true,
        warning: 'user_not_found',
        email: customerEmail,
        message: 'User not found - credits need to be added manually'
      });
    }

    const userInfo = userData[0];
    
    if (!userInfo.profileId) {
      console.error('User has no profile:', customerEmail);
      return NextResponse.json({
        received: true,
        warning: 'no_profile',
        email: customerEmail,
        message: 'User has no profile - credits need to be added manually'
      });
    }

    // Determine the product purchased
    let productInfo = paymentLinkId ? LINK_TO_PRODUCT[paymentLinkId] : null;
    
    // If we can't identify by link ID, try to match by amount or description
    if (!productInfo) {
      console.log('Could not identify product by link ID, attempting amount match...');
      // Try to find package/membership by amount
      const amountInDollars = typeof paymentAmount === 'number' 
        ? paymentAmount / 100 // Convert cents to dollars if needed
        : parseFloat(paymentAmount) || 0;
      
      // Check packages
      const matchingPackage = await db
        .select()
        .from(packages)
        .where(eq(packages.price, amountInDollars))
        .limit(1);
      
      if (matchingPackage.length > 0) {
        productInfo = { type: 'package', name: matchingPackage[0].name };
      } else {
        // Check memberships
        const matchingMembership = await db
          .select()
          .from(memberships)
          .where(eq(memberships.priceMonthly, amountInDollars))
          .limit(1);
        
        if (matchingMembership.length > 0) {
          productInfo = { type: 'membership', name: matchingMembership[0].name };
        }
      }
    }

    if (!productInfo) {
      console.log('Could not identify product from payment');
      return NextResponse.json({
        received: true,
        warning: 'product_not_identified',
        email: customerEmail,
        message: 'Could not identify product - credits need to be added manually'
      });
    }

    // Get product details
    let creditsToAdd = 0;
    let expiresAt: string | null = null;
    let packageId: number | null = null;
    let membershipId: number | null = null;
    let purchaseType: string = 'package';

    if (productInfo.type === 'package') {
      const pkg = await db
        .select()
        .from(packages)
        .where(eq(packages.name, productInfo.name))
        .limit(1);

      if (pkg.length > 0) {
        creditsToAdd = pkg[0].credits;
        packageId = pkg[0].id;
        purchaseType = 'package';
        
        if (pkg[0].expirationDays) {
          const expDate = new Date();
          expDate.setDate(expDate.getDate() + pkg[0].expirationDays);
          expiresAt = expDate.toISOString();
        }
      }
    } else if (productInfo.type === 'membership') {
      const membership = await db
        .select()
        .from(memberships)
        .where(eq(memberships.name, productInfo.name))
        .limit(1);

      if (membership.length > 0) {
        membershipId = membership[0].id;
        purchaseType = 'membership';
        creditsToAdd = membership[0].creditsPerMonth || 0; // null for unlimited
        
        // Memberships expire in 30 days
        const expDate = new Date();
        expDate.setDate(expDate.getDate() + 30);
        expiresAt = expDate.toISOString();
      }
    }

    // Create payment record
    const paymentRecord = await db.insert(payments).values({
      studentProfileId: userInfo.profileId,
      amount: typeof paymentAmount === 'number' ? paymentAmount / 100 : parseFloat(paymentAmount) || 0,
      currency: 'USD',
      paymentMethod: 'swipesimple',
      squarePaymentId: `SWIPE-${txnId || Date.now()}`,
      status: 'completed',
      paymentDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }).returning();

    // Create student purchase record
    const newPurchase = await db.insert(studentPurchases).values({
      studentProfileId: userInfo.profileId,
      purchaseType,
      packageId,
      membershipId,
      creditsRemaining: productInfo.type === 'membership' && creditsToAdd === 0 ? null : creditsToAdd, // null for unlimited
      creditsTotal: productInfo.type === 'membership' && creditsToAdd === 0 ? null : creditsToAdd,
      purchasedAt: new Date().toISOString(),
      expiresAt,
      isActive: true,
      paymentId: paymentRecord[0].id,
      autoRenew: purchaseType === 'membership',
    }).returning();

    console.log(`✅ Auto-added ${creditsToAdd || 'unlimited'} credits to ${userInfo.userName} (${customerEmail})`);
    console.log('Purchase record:', newPurchase[0]);

    return NextResponse.json({
      success: true,
      message: `Credits added successfully for ${customerEmail}`,
      purchase: {
        id: newPurchase[0].id,
        credits: creditsToAdd || 'unlimited',
        product: productInfo.name,
        user: userInfo.userName,
      }
    });

  } catch (error) {
    console.error('SwipeSimple webhook error:', error);
    // Return 200 to acknowledge receipt even on error (prevent retries)
    return NextResponse.json(
      { 
        received: true, 
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Error processing webhook - manual review needed'
      },
      { status: 200 }
    );
  }
}

// GET endpoint to verify webhook is set up
export async function GET() {
  return NextResponse.json({
    status: 'active',
    endpoint: '/api/webhooks/swipesimple',
    message: 'SwipeSimple webhook endpoint is ready',
  });
}
