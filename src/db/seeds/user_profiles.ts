import { db } from '@/db';
import { user, account, userProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
    // First, check if users exist and create them if they don't
    const adminEmail = 'admin@swiftfit215.com';
    const instructorEmail = 'instructor@swiftfit215.com';
    const studentEmail = 'student@swiftfit215.com';

    // Check for existing users
    const existingAdmin = await db.select().from(user).where(eq(user.email, adminEmail)).limit(1);
    const existingInstructor = await db.select().from(user).where(eq(user.email, instructorEmail)).limit(1);
    const existingStudent = await db.select().from(user).where(eq(user.email, studentEmail)).limit(1);

    let adminUserId: string;
    let instructorUserId: string;
    let studentUserId: string;

    // Create admin user if doesn't exist
    if (existingAdmin.length === 0) {
        const newAdmin = await db.insert(user).values({
            id: 'user_admin_swiftfit215',
            name: 'Admin User',
            email: adminEmail,
            emailVerified: true,
            image: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        }).returning();
        adminUserId = newAdmin[0].id;

        // Create account for admin
        await db.insert(account).values({
            id: 'account_admin_swiftfit215',
            accountId: 'admin_swiftfit215',
            providerId: 'credential',
            userId: adminUserId,
            password: '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u', // hashed password for 'Admin123!'
            accessToken: null,
            refreshToken: null,
            idToken: null,
            accessTokenExpiresAt: null,
            refreshTokenExpiresAt: null,
            scope: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    } else {
        adminUserId = existingAdmin[0].id;
    }

    // Create instructor user if doesn't exist
    if (existingInstructor.length === 0) {
        const newInstructor = await db.insert(user).values({
            id: 'user_instructor_swiftfit215',
            name: 'Instructor User',
            email: instructorEmail,
            emailVerified: true,
            image: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        }).returning();
        instructorUserId = newInstructor[0].id;

        // Create account for instructor
        await db.insert(account).values({
            id: 'account_instructor_swiftfit215',
            accountId: 'instructor_swiftfit215',
            providerId: 'credential',
            userId: instructorUserId,
            password: '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u', // hashed password for 'Instructor123!'
            accessToken: null,
            refreshToken: null,
            idToken: null,
            accessTokenExpiresAt: null,
            refreshTokenExpiresAt: null,
            scope: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    } else {
        instructorUserId = existingInstructor[0].id;
    }

    // Create student user if doesn't exist
    if (existingStudent.length === 0) {
        const newStudent = await db.insert(user).values({
            id: 'user_student_swiftfit215',
            name: 'Student User',
            email: studentEmail,
            emailVerified: true,
            image: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        }).returning();
        studentUserId = newStudent[0].id;

        // Create account for student
        await db.insert(account).values({
            id: 'account_student_swiftfit215',
            accountId: 'student_swiftfit215',
            providerId: 'credential',
            userId: studentUserId,
            password: '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u', // hashed password for 'Student123!'
            accessToken: null,
            refreshToken: null,
            idToken: null,
            accessTokenExpiresAt: null,
            refreshTokenExpiresAt: null,
            scope: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    } else {
        studentUserId = existingStudent[0].id;
    }

    // Now create the user profiles
    const sampleUserProfiles = [
        {
            userId: adminUserId,
            role: 'admin',
            phone: '215-555-0001',
            profileImage: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            userId: instructorUserId,
            role: 'instructor',
            phone: '215-555-0002',
            profileImage: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            userId: studentUserId,
            role: 'student',
            phone: '215-555-0003',
            profileImage: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
    ];

    await db.insert(userProfiles).values(sampleUserProfiles);
    
    console.log('✅ User profiles seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});