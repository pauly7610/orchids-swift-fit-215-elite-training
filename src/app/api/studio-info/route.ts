import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { studioInfo } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      // Get single studio info record
      if (isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const record = await db.select()
        .from(studioInfo)
        .where(eq(studioInfo.id, parseInt(id)))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json({ 
          error: 'Studio info not found',
          code: "NOT_FOUND" 
        }, { status: 404 });
      }

      return NextResponse.json(record[0]);
    }

    // Get all studio info records
    const records = await db.select().from(studioInfo);
    return NextResponse.json(records);

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
    const { 
      studioName, 
      logoUrl, 
      address, 
      phone, 
      email, 
      hours, 
      cancellationWindowHours, 
      lateCancelPenalty, 
      noShowPenalty, 
      cancellationPolicyText, 
      refundPolicyText 
    } = body;

    // Validate required fields
    if (!studioName || typeof studioName !== 'string' || studioName.trim() === '') {
      return NextResponse.json({ 
        error: "Studio name is required and must be a non-empty string",
        code: "MISSING_STUDIO_NAME" 
      }, { status: 400 });
    }

    // Sanitize inputs
    const sanitizedData: any = {
      studioName: studioName.trim(),
      updatedAt: new Date().toISOString()
    };

    // Optional fields with validation
    if (logoUrl !== undefined && logoUrl !== null) {
      sanitizedData.logoUrl = typeof logoUrl === 'string' ? logoUrl.trim() : logoUrl;
    }

    if (address !== undefined && address !== null) {
      sanitizedData.address = typeof address === 'string' ? address.trim() : address;
    }

    if (phone !== undefined && phone !== null) {
      sanitizedData.phone = typeof phone === 'string' ? phone.trim() : phone;
    }

    if (email !== undefined && email !== null) {
      sanitizedData.email = typeof email === 'string' ? email.trim().toLowerCase() : email;
    }

    if (hours !== undefined && hours !== null) {
      sanitizedData.hours = hours;
    }

    if (cancellationWindowHours !== undefined && cancellationWindowHours !== null) {
      if (typeof cancellationWindowHours !== 'number' || cancellationWindowHours < 0) {
        return NextResponse.json({ 
          error: "Cancellation window hours must be a non-negative number",
          code: "INVALID_CANCELLATION_WINDOW" 
        }, { status: 400 });
      }
      sanitizedData.cancellationWindowHours = cancellationWindowHours;
    } else {
      sanitizedData.cancellationWindowHours = 24;
    }

    if (lateCancelPenalty !== undefined && lateCancelPenalty !== null) {
      sanitizedData.lateCancelPenalty = typeof lateCancelPenalty === 'string' ? lateCancelPenalty.trim() : lateCancelPenalty;
    }

    if (noShowPenalty !== undefined && noShowPenalty !== null) {
      sanitizedData.noShowPenalty = typeof noShowPenalty === 'string' ? noShowPenalty.trim() : noShowPenalty;
    }

    if (cancellationPolicyText !== undefined && cancellationPolicyText !== null) {
      sanitizedData.cancellationPolicyText = typeof cancellationPolicyText === 'string' ? cancellationPolicyText.trim() : cancellationPolicyText;
    }

    if (refundPolicyText !== undefined && refundPolicyText !== null) {
      sanitizedData.refundPolicyText = typeof refundPolicyText === 'string' ? refundPolicyText.trim() : refundPolicyText;
    }

    const newRecord = await db.insert(studioInfo)
      .values(sanitizedData)
      .returning();

    return NextResponse.json(newRecord[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const body = await request.json();
    const { 
      studioName, 
      logoUrl, 
      address, 
      phone, 
      email, 
      hours, 
      cancellationWindowHours, 
      lateCancelPenalty, 
      noShowPenalty, 
      cancellationPolicyText, 
      refundPolicyText 
    } = body;

    // Check if record exists
    const existing = await db.select()
      .from(studioInfo)
      .where(eq(studioInfo.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Studio info not found',
        code: "NOT_FOUND" 
      }, { status: 404 });
    }

    // Build update object with only provided fields
    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    if (studioName !== undefined) {
      if (typeof studioName !== 'string' || studioName.trim() === '') {
        return NextResponse.json({ 
          error: "Studio name must be a non-empty string",
          code: "INVALID_STUDIO_NAME" 
        }, { status: 400 });
      }
      updates.studioName = studioName.trim();
    }

    if (logoUrl !== undefined) {
      updates.logoUrl = logoUrl !== null && typeof logoUrl === 'string' ? logoUrl.trim() : logoUrl;
    }

    if (address !== undefined) {
      updates.address = address !== null && typeof address === 'string' ? address.trim() : address;
    }

    if (phone !== undefined) {
      updates.phone = phone !== null && typeof phone === 'string' ? phone.trim() : phone;
    }

    if (email !== undefined) {
      updates.email = email !== null && typeof email === 'string' ? email.trim().toLowerCase() : email;
    }

    if (hours !== undefined) {
      updates.hours = hours;
    }

    if (cancellationWindowHours !== undefined) {
      if (cancellationWindowHours !== null && (typeof cancellationWindowHours !== 'number' || cancellationWindowHours < 0)) {
        return NextResponse.json({ 
          error: "Cancellation window hours must be a non-negative number",
          code: "INVALID_CANCELLATION_WINDOW" 
        }, { status: 400 });
      }
      updates.cancellationWindowHours = cancellationWindowHours;
    }

    if (lateCancelPenalty !== undefined) {
      updates.lateCancelPenalty = lateCancelPenalty !== null && typeof lateCancelPenalty === 'string' ? lateCancelPenalty.trim() : lateCancelPenalty;
    }

    if (noShowPenalty !== undefined) {
      updates.noShowPenalty = noShowPenalty !== null && typeof noShowPenalty === 'string' ? noShowPenalty.trim() : noShowPenalty;
    }

    if (cancellationPolicyText !== undefined) {
      updates.cancellationPolicyText = cancellationPolicyText !== null && typeof cancellationPolicyText === 'string' ? cancellationPolicyText.trim() : cancellationPolicyText;
    }

    if (refundPolicyText !== undefined) {
      updates.refundPolicyText = refundPolicyText !== null && typeof refundPolicyText === 'string' ? refundPolicyText.trim() : refundPolicyText;
    }

    const updated = await db.update(studioInfo)
      .set(updates)
      .where(eq(studioInfo.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0]);

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if record exists
    const existing = await db.select()
      .from(studioInfo)
      .where(eq(studioInfo.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Studio info not found',
        code: "NOT_FOUND" 
      }, { status: 404 });
    }

    const deleted = await db.delete(studioInfo)
      .where(eq(studioInfo.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      message: 'Studio info deleted successfully',
      deleted: deleted[0]
    });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}