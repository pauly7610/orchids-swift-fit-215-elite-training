import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { paymentMethods } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single record by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const paymentMethod = await db.select()
        .from(paymentMethods)
        .where(eq(paymentMethods.id, parseInt(id)))
        .limit(1);

      if (paymentMethod.length === 0) {
        return NextResponse.json({ 
          error: 'Payment method not found' 
        }, { status: 404 });
      }

      return NextResponse.json(paymentMethod[0]);
    }

    // List with filtering and pagination
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const studentProfileId = searchParams.get('studentProfileId');
    const isDefault = searchParams.get('isDefault');

    let query = db.select().from(paymentMethods);

    // Build filter conditions
    const conditions = [];
    
    if (studentProfileId) {
      if (isNaN(parseInt(studentProfileId))) {
        return NextResponse.json({ 
          error: "Valid studentProfileId is required",
          code: "INVALID_STUDENT_PROFILE_ID" 
        }, { status: 400 });
      }
      conditions.push(eq(paymentMethods.studentProfileId, parseInt(studentProfileId)));
    }

    if (isDefault !== null && isDefault !== undefined) {
      const isDefaultBool = isDefault === 'true' || isDefault === '1';
      conditions.push(eq(paymentMethods.isDefault, isDefaultBool ? 1 : 0));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentProfileId, squareCardId, cardBrand, last4, isDefault } = body;

    // Validate required fields
    if (!studentProfileId) {
      return NextResponse.json({ 
        error: "studentProfileId is required",
        code: "MISSING_STUDENT_PROFILE_ID" 
      }, { status: 400 });
    }

    if (!squareCardId) {
      return NextResponse.json({ 
        error: "squareCardId is required",
        code: "MISSING_SQUARE_CARD_ID" 
      }, { status: 400 });
    }

    // Validate studentProfileId is a valid integer
    if (isNaN(parseInt(studentProfileId))) {
      return NextResponse.json({ 
        error: "studentProfileId must be a valid integer",
        code: "INVALID_STUDENT_PROFILE_ID" 
      }, { status: 400 });
    }

    // Sanitize inputs
    const sanitizedSquareCardId = squareCardId.trim();
    const sanitizedCardBrand = cardBrand ? cardBrand.trim() : null;
    const sanitizedLast4 = last4 ? last4.trim() : null;

    // Validate squareCardId is not empty after trimming
    if (!sanitizedSquareCardId) {
      return NextResponse.json({ 
        error: "squareCardId cannot be empty",
        code: "EMPTY_SQUARE_CARD_ID" 
      }, { status: 400 });
    }

    // Prepare insert data
    const insertData = {
      studentProfileId: parseInt(studentProfileId),
      squareCardId: sanitizedSquareCardId,
      cardBrand: sanitizedCardBrand,
      last4: sanitizedLast4,
      isDefault: isDefault === true || isDefault === 1 ? 1 : 0,
      createdAt: new Date().toISOString(),
    };

    const newPaymentMethod = await db.insert(paymentMethods)
      .values(insertData)
      .returning();

    return NextResponse.json(newPaymentMethod[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    
    // Handle unique constraint violation for squareCardId
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ 
        error: 'Payment method with this Square card ID already exists',
        code: "DUPLICATE_SQUARE_CARD_ID"
      }, { status: 400 });
    }

    // Handle foreign key constraint violation
    if (error instanceof Error && error.message.includes('FOREIGN KEY constraint failed')) {
      return NextResponse.json({ 
        error: 'Invalid studentProfileId: student profile does not exist',
        code: "INVALID_STUDENT_PROFILE_REFERENCE"
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}