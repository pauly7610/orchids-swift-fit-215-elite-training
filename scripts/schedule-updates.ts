/**
 * Schedule Updates Script
 * 
 * This script applies the following schedule changes to the database:
 * 1. Rename instructor "Maisha" to "Life"
 * 2. Remove Nasir from all Wednesdays (recurring)
 * 3. Remove Nasir from Jan 16-19, 2026 (regardless of day)
 * 4. Remove Desiree (Des) from Dec 20, 2025
 * 5. Update Joi's class times to 5:30am-6:30am
 * 
 * Run with: npx tsx scripts/schedule-updates.ts
 */

import 'dotenv/config';
import { db } from '../src/db';
import { classes, instructors, userProfiles, user } from '../src/db/schema';
import { eq, and, or, inArray, like, sql } from 'drizzle-orm';

async function main() {
  console.log('🚀 Starting schedule updates...\n');

  // Get all instructors with their user data
  const allInstructors = await db
    .select({
      id: instructors.id,
      userProfileId: instructors.userProfileId,
      userName: user.name,
      userEmail: user.email,
      userId: user.id,
    })
    .from(instructors)
    .innerJoin(userProfiles, eq(instructors.userProfileId, userProfiles.id))
    .innerJoin(user, eq(userProfiles.userId, user.id));

  console.log('Found instructors:', allInstructors.map(i => `${i.userName} (ID: ${i.id})`).join(', '));

  // Build instructor lookup map
  const instructorByName = new Map<string, typeof allInstructors[0]>();
  for (const inst of allInstructors) {
    instructorByName.set(inst.userName.toLowerCase(), inst);
  }

  // ========================================
  // 1. RENAME "MAISHA" TO "LIFE"
  // ========================================
  console.log('\n📝 1. Renaming Maisha to Life...');
  const maisha = instructorByName.get('maisha');
  if (maisha) {
    await db.update(user)
      .set({ name: 'Life', email: 'life@posh-studio.com' })
      .where(eq(user.id, maisha.userId));
    console.log(`   ✅ Renamed instructor from "Maisha" to "Life"`);
  } else {
    console.log('   ⚠️ Maisha not found in database (may already be renamed to Life)');
    // Check if Life already exists
    const life = instructorByName.get('life');
    if (life) {
      console.log('   ✅ "Life" already exists as an instructor');
    }
  }

  // ========================================
  // 2. REMOVE NASIR FROM WEDNESDAYS
  // ========================================
  console.log('\n📝 2. Removing Nasir from all Wednesdays...');
  const nasir = instructorByName.get('nasir');
  if (nasir) {
    // Get all classes for Nasir
    const nasirClasses = await db.select()
      .from(classes)
      .where(eq(classes.instructorId, nasir.id));
    
    // Filter to Wednesdays (day 3 in JS Date)
    let wednesdayCount = 0;
    for (const cls of nasirClasses) {
      const classDate = new Date(cls.date);
      if (classDate.getDay() === 3) { // Wednesday
        await db.delete(classes).where(eq(classes.id, cls.id));
        wednesdayCount++;
      }
    }
    console.log(`   ✅ Removed ${wednesdayCount} Wednesday classes for Nasir`);
  } else {
    console.log('   ⚠️ Nasir not found in database');
  }

  // ========================================
  // 3. REMOVE NASIR FROM JAN 16-19, 2026
  // ========================================
  console.log('\n📝 3. Removing Nasir from Jan 16-19, 2026...');
  if (nasir) {
    const jan16to19 = ['2026-01-16', '2026-01-17', '2026-01-18', '2026-01-19'];
    const deletedJan = await db.delete(classes)
      .where(
        and(
          eq(classes.instructorId, nasir.id),
          inArray(classes.date, jan16to19)
        )
      )
      .returning();
    console.log(`   ✅ Removed ${deletedJan.length} classes for Nasir on Jan 16-19, 2026`);
  }

  // ========================================
  // 4. REMOVE DESIREE (DES) FROM DEC 20, 2025
  // ========================================
  console.log('\n📝 4. Removing Desiree (Des) from Dec 20, 2025...');
  const des = instructorByName.get('des') || instructorByName.get('desiree');
  if (des) {
    const deletedDec20 = await db.delete(classes)
      .where(
        and(
          eq(classes.instructorId, des.id),
          eq(classes.date, '2025-12-20')
        )
      )
      .returning();
    console.log(`   ✅ Removed ${deletedDec20.length} classes for Des on Dec 20, 2025`);
  } else {
    console.log('   ⚠️ Des/Desiree not found in database');
  }

  // ========================================
  // 5. UPDATE JOI'S CLASS TIMES TO 5:30am-6:30am
  // ========================================
  console.log('\n📝 5. Updating Joi\'s class times to 5:30am-6:30am...');
  const joi = instructorByName.get('joi');
  if (joi) {
    // Get all Joi's classes that start at 06:00
    const joiClasses = await db.select()
      .from(classes)
      .where(
        and(
          eq(classes.instructorId, joi.id),
          eq(classes.startTime, '06:00')
        )
      );
    
    let updatedCount = 0;
    for (const cls of joiClasses) {
      await db.update(classes)
        .set({ startTime: '05:30', endTime: '06:30' })
        .where(eq(classes.id, cls.id));
      updatedCount++;
    }
    console.log(`   ✅ Updated ${updatedCount} classes for Joi from 6:00am to 5:30am-6:30am`);
  } else {
    console.log('   ⚠️ Joi not found in database');
  }

  // ========================================
  // SUMMARY
  // ========================================
  console.log('\n' + '='.repeat(50));
  console.log('📊 SCHEDULE UPDATE SUMMARY');
  console.log('='.repeat(50));
  
  // Verify changes
  const updatedInstructors = await db
    .select({ name: user.name })
    .from(instructors)
    .innerJoin(userProfiles, eq(instructors.userProfileId, userProfiles.id))
    .innerJoin(user, eq(userProfiles.userId, user.id));
  
  console.log('\nCurrent instructors:', updatedInstructors.map(i => i.name).join(', '));
  
  // Count remaining Nasir Wednesday classes
  if (nasir) {
    const remainingWedClasses = await db.select()
      .from(classes)
      .where(eq(classes.instructorId, nasir.id));
    
    const wedCount = remainingWedClasses.filter(c => new Date(c.date).getDay() === 3).length;
    console.log(`Nasir Wednesday classes remaining: ${wedCount}`);
  }
  
  // Count Joi 5:30am classes
  if (joi) {
    const joi530Classes = await db.select()
      .from(classes)
      .where(
        and(
          eq(classes.instructorId, joi.id),
          eq(classes.startTime, '05:30')
        )
      );
    console.log(`Joi 5:30am classes: ${joi530Classes.length}`);
  }

  console.log('\n✅ Schedule updates completed successfully!');
}

main().catch((error) => {
  console.error('❌ Schedule update failed:', error);
  process.exit(1);
});

