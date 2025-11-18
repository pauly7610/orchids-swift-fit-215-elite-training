import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { payments } from '@/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single record fetch
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const payment = await db
        .select()
        .from(payments)
        .where(eq(payments.id, parseInt(id)))
        .limit(1);

      if (payment.length === 0) {
        return NextResponse.json(
          { error: 'Payment not found', code: 'PAYMENT_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(payment[0], { status: 200 });
    }

    // List with pagination and filters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const studentProfileId = searchParams.get('studentProfileId');
    const status = searchParams.get('status');
    const paymentMethod = searchParams.get('paymentMethod');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let query = db.select().from(payments);

    // Build filter conditions
    const conditions = [];

    if (studentProfileId) {
      const profileId = parseInt(studentProfileId);
      if (!isNaN(profileId)) {
        conditions.push(eq(payments.studentProfileId, profileId));
      }
    }

    if (status) {
      conditions.push(eq(payments.status, status));
    }

    if (paymentMethod) {
      conditions.push(eq(payments.paymentMethod, paymentMethod));
    }

    if (startDate) {
      conditions.push(gte(payments.paymentDate, startDate));
    }

    if (endDate) {
      conditions.push(lte(payments.paymentDate, endDate));
    }

    // Apply filters if any exist
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentProfileId, amount, paymentMethod, currency, squarePaymentId, status, paymentDate } = body;

    // Validate required fields
    if (!studentProfileId) {
      return NextResponse.json(
        { error: 'studentProfileId is required', code: 'MISSING_STUDENT_PROFILE_ID' },
        { status: 400 }
      );
    }

    if (!amount && amount !== 0) {
      return NextResponse.json(
        { error: 'amount is required', code: 'MISSING_AMOUNT' },
        { status: 400 }
      );
    }

    if (!paymentMethod) {
      return NextResponse.json(
        { error: 'paymentMethod is required', code: 'MISSING_PAYMENT_METHOD' },
        { status: 400 }
      );
    }

    // Validate studentProfileId is a number
    const profileId = parseInt(studentProfileId);
    if (isNaN(profileId)) {
      return NextResponse.json(
        { error: 'studentProfileId must be a valid integer', code: 'INVALID_STUDENT_PROFILE_ID' },
        { status: 400 }
      );
    }

    // Validate amount is positive
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      return NextResponse.json(
        { error: 'amount must be a positive number', code: 'INVALID_AMOUNT' },
        { status: 400 }
      );
    }

    // Validate paymentMethod is one of the allowed values
    const validPaymentMethods = ['square', 'cash', 'other'];
    if (!validPaymentMethods.includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'paymentMethod must be one of: square, cash, other', code: 'INVALID_PAYMENT_METHOD' },
        { status: 400 }
      );
    }

    // Validate status if provided
    if (status) {
      const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'status must be one of: pending, completed, failed, refunded', code: 'INVALID_STATUS' },
          { status: 400 }
        );
      }
    }

    // Prepare insert data with defaults
    const currentTimestamp = new Date().toISOString();
    const insertData = {
      studentProfileId: profileId,
      amount: parsedAmount,
      currency: currency?.trim() || 'USD',
      paymentMethod: paymentMethod.trim(),
      squarePaymentId: squarePaymentId?.trim() || null,
      status: status?.trim() || 'pending',
      paymentDate: paymentDate || currentTimestamp,
      createdAt: currentTimestamp,
    };

    const newPayment = await db
      .insert(payments)
      .values(insertData)
      .returning();

    return NextResponse.json(newPayment[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    
    // Handle unique constraint violation for squarePaymentId
    if ((error as Error).message.includes('UNIQUE constraint failed')) {
      return NextResponse.json(
        { error: 'squarePaymentId already exists', code: 'DUPLICATE_SQUARE_PAYMENT_ID' },
        { status: 400 }
      );
    }

    // Handle foreign key constraint violation
    if ((error as Error).message.includes('FOREIGN KEY constraint failed')) {
      return NextResponse.json(
        { error: 'studentProfileId does not exist', code: 'INVALID_STUDENT_PROFILE_REFERENCE' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}