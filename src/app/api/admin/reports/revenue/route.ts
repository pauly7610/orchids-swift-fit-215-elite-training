import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { payments } from '@/db/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    
    // Date range parameters with defaults
    const endDate = searchParams.get('endDate') || new Date().toISOString().split('T')[0];
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);
    const startDate = searchParams.get('startDate') || defaultStartDate.toISOString().split('T')[0];
    const paymentMethodFilter = searchParams.get('paymentMethod');

    // Validate date parameters
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    
    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      return NextResponse.json({ 
        error: 'Invalid date format. Use YYYY-MM-DD format.',
        code: 'INVALID_DATE_FORMAT'
      }, { status: 400 });
    }

    if (startDateObj > endDateObj) {
      return NextResponse.json({ 
        error: 'Start date must be before or equal to end date',
        code: 'INVALID_DATE_RANGE'
      }, { status: 400 });
    }

    // Build base conditions for date range
    const dateConditions = [
      gte(payments.paymentDate, startDate),
      lte(payments.paymentDate, endDate)
    ];

    // Add payment method filter if specified
    if (paymentMethodFilter) {
      dateConditions.push(eq(payments.paymentMethod, paymentMethodFilter));
    }

    // Get all payments in date range for completed transactions
    const completedPayments = await db
      .select()
      .from(payments)
      .where(and(
        eq(payments.status, 'completed'),
        ...dateConditions
      ));

    // Calculate total revenue and transaction count
    const totalRevenue = completedPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalTransactions = completedPayments.length;
    const averageTransactionAmount = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    // Payment method breakdown for completed payments
    const paymentMethodBreakdown: Record<string, number> = {
      square: 0,
      cash: 0,
      other: 0
    };

    completedPayments.forEach(payment => {
      const method = payment.paymentMethod.toLowerCase();
      if (method === 'square') {
        paymentMethodBreakdown.square += payment.amount;
      } else if (method === 'cash') {
        paymentMethodBreakdown.cash += payment.amount;
      } else {
        paymentMethodBreakdown.other += payment.amount;
      }
    });

    // Get pending payments
    const pendingPayments = await db
      .select()
      .from(payments)
      .where(and(
        eq(payments.status, 'pending'),
        ...dateConditions
      ));

    const pendingAmount = pendingPayments.reduce((sum, payment) => sum + payment.amount, 0);

    // Get refunded payments
    const refundedPayments = await db
      .select()
      .from(payments)
      .where(and(
        eq(payments.status, 'refunded'),
        ...dateConditions
      ));

    const refundedAmount = refundedPayments.reduce((sum, payment) => sum + payment.amount, 0);

    // Revenue by date for trend analysis
    const revenueByDateMap = new Map<string, number>();
    
    completedPayments.forEach(payment => {
      const date = payment.paymentDate;
      const currentAmount = revenueByDateMap.get(date) || 0;
      revenueByDateMap.set(date, currentAmount + payment.amount);
    });

    const revenueByDate = Array.from(revenueByDateMap.entries())
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Return comprehensive revenue statistics
    return NextResponse.json({
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalTransactions,
      averageTransactionAmount: Math.round(averageTransactionAmount * 100) / 100,
      paymentMethodBreakdown: {
        square: Math.round(paymentMethodBreakdown.square * 100) / 100,
        cash: Math.round(paymentMethodBreakdown.cash * 100) / 100,
        other: Math.round(paymentMethodBreakdown.other * 100) / 100
      },
      pendingPayments: Math.round(pendingAmount * 100) / 100,
      refundedAmount: Math.round(refundedAmount * 100) / 100,
      revenueByDate,
      dateRange: {
        startDate,
        endDate
      },
      filters: {
        paymentMethod: paymentMethodFilter || 'all'
      }
    }, { status: 200 });

  } catch (error) {
    console.error('GET revenue statistics error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}