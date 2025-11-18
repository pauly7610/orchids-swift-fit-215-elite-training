import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { classes } from '@/db/schema';
import { eq, and, gte, lte, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse pagination parameters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    
    // Parse filter parameters
    const date = searchParams.get('date');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const instructorId = searchParams.get('instructorId');
    const classTypeId = searchParams.get('classTypeId');
    const status = searchParams.get('status') ?? 'scheduled';
    
    // Validate date parameters
    if (date && startDate) {
      return NextResponse.json({ 
        error: "Cannot use both 'date' and 'startDate' parameters simultaneously",
        code: "INVALID_DATE_PARAMS" 
      }, { status: 400 });
    }
    
    if (startDate && !endDate) {
      return NextResponse.json({ 
        error: "When using 'startDate', 'endDate' is also required",
        code: "MISSING_END_DATE" 
      }, { status: 400 });
    }
    
    if (!startDate && endDate) {
      return NextResponse.json({ 
        error: "When using 'endDate', 'startDate' is also required",
        code: "MISSING_START_DATE" 
      }, { status: 400 });
    }
    
    // Validate date formats
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (date && !dateRegex.test(date)) {
      return NextResponse.json({ 
        error: "Invalid date format. Expected YYYY-MM-DD",
        code: "INVALID_DATE_FORMAT" 
      }, { status: 400 });
    }
    
    if (startDate && !dateRegex.test(startDate)) {
      return NextResponse.json({ 
        error: "Invalid startDate format. Expected YYYY-MM-DD",
        code: "INVALID_START_DATE_FORMAT" 
      }, { status: 400 });
    }
    
    if (endDate && !dateRegex.test(endDate)) {
      return NextResponse.json({ 
        error: "Invalid endDate format. Expected YYYY-MM-DD",
        code: "INVALID_END_DATE_FORMAT" 
      }, { status: 400 });
    }
    
    // Validate numeric IDs
    if (instructorId && isNaN(parseInt(instructorId))) {
      return NextResponse.json({ 
        error: "Invalid instructorId. Must be a number",
        code: "INVALID_INSTRUCTOR_ID" 
      }, { status: 400 });
    }
    
    if (classTypeId && isNaN(parseInt(classTypeId))) {
      return NextResponse.json({ 
        error: "Invalid classTypeId. Must be a number",
        code: "INVALID_CLASS_TYPE_ID" 
      }, { status: 400 });
    }
    
    // Validate pagination parameters
    if (isNaN(limit) || limit < 1) {
      return NextResponse.json({ 
        error: "Invalid limit parameter. Must be a positive number",
        code: "INVALID_LIMIT" 
      }, { status: 400 });
    }
    
    if (isNaN(offset) || offset < 0) {
      return NextResponse.json({ 
        error: "Invalid offset parameter. Must be a non-negative number",
        code: "INVALID_OFFSET" 
      }, { status: 400 });
    }
    
    // Build where conditions
    const conditions = [];
    
    // Status filter (default to 'scheduled')
    conditions.push(eq(classes.status, status));
    
    // Date filters
    if (date) {
      conditions.push(eq(classes.date, date));
    } else if (startDate && endDate) {
      conditions.push(gte(classes.date, startDate));
      conditions.push(lte(classes.date, endDate));
    } else {
      // Default: only upcoming classes (from today onwards)
      const today = new Date().toISOString().split('T')[0];
      conditions.push(gte(classes.date, today));
    }
    
    // Instructor filter
    if (instructorId) {
      conditions.push(eq(classes.instructorId, parseInt(instructorId)));
    }
    
    // Class type filter
    if (classTypeId) {
      conditions.push(eq(classes.classTypeId, parseInt(classTypeId)));
    }
    
    // Build and execute query
    const results = await db.select()
      .from(classes)
      .where(and(...conditions))
      .orderBy(asc(classes.date), asc(classes.startTime))
      .limit(limit)
      .offset(offset);
    
    return NextResponse.json(results, { status: 200 });
    
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}