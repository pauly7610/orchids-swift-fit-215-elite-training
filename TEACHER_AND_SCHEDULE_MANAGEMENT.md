# Teacher and Schedule Management Guide

This guide explains how to add new teachers (instructors) and edit the class schedule for Swift Fit Pilates + Wellness Studio.

---

## Table of Contents
1. [Adding New Teachers](#adding-new-teachers)
2. [Editing the Schedule](#editing-the-schedule)
3. [Managing Classes](#managing-classes)
4. [Setting Up 30-Day Reminders](#setting-up-30-day-reminders)
5. [API Reference](#api-reference)

---

## Adding New Teachers

### Overview
Teachers in the system are called "instructors" and they must first have a user account before becoming an instructor.

### Step-by-Step Process

#### Step 1: Create User Account
First, the teacher needs to register on the platform:
- Go to `/register` page
- Have them create an account with:
  - Name
  - Email
  - Password

#### Step 2: Upgrade User to Instructor (Admin Only)

Once the user account is created, an admin needs to:

1. **Create User Profile** (if not exists)
   ```bash
   POST /api/user-profiles
   Headers: Authorization: Bearer <admin_token>
   Body: {
     "userId": "<user_id_from_auth>",
     "role": "instructor",
     "phone": "+1234567890",
     "profileImage": "https://example.com/photo.jpg"
   }
   ```

2. **Create Instructor Profile**
   ```bash
   POST /api/instructors
   Headers: Authorization: Bearer <admin_token>
   Body: {
     "userProfileId": <user_profile_id>,
     "bio": "Sarah is a certified Pilates instructor with 10+ years of experience...",
     "specialties": ["Mat Pilates", "Yoga", "Meditation"],
     "headshotUrl": "https://example.com/sarah-headshot.jpg",
     "isActive": true
   }
   ```

### Through Admin Dashboard

If you're logged in as an admin, you can use the admin interface:

1. Navigate to `/admin/instructors`
2. Click "Add New Instructor"
3. Fill in the form:
   - Select existing user OR invite new user
   - Add bio (instructor background, certifications)
   - Add specialties (Pilates, Yoga, etc.)
   - Upload headshot photo
   - Set active status
4. Click "Save"

### Important Notes
- Instructors must have an active user profile with role="instructor"
- Instructors can be deactivated (not deleted) by setting `isActive: false`
- Headshot images should be optimized (recommended: 800x800px, WebP format)

---

## Editing the Schedule

### Overview
The schedule consists of individual classes that link instructors, class types, dates, and times.

### Adding a New Class to Schedule

#### Method 1: Through Admin Dashboard
1. Navigate to `/admin/classes`
2. Click "Create New Class"
3. Fill in the form:
   - **Class Type**: Select from dropdown (Mat Pilates, Yoga, etc.)
   - **Instructor**: Select from active instructors
   - **Date**: Pick date from calendar
   - **Start Time**: Set time (e.g., "09:00")
   - **End Time**: Set time (e.g., "10:00")
   - **Capacity**: Number of spots (default: 15, max: 50)
   - **Price**: Optional (overrides package pricing)
   - **Status**: scheduled, cancelled, or completed
4. Click "Create Class"

#### Method 2: Via API
```bash
POST /api/classes
Headers: Authorization: Bearer <admin_token>
Body: {
  "classTypeId": 1,
  "instructorId": 2,
  "date": "2024-12-25",
  "startTime": "09:00",
  "endTime": "10:00",
  "capacity": 20,
  "price": null,
  "status": "scheduled"
}
```

### Bulk Schedule Creation

To create multiple classes at once (e.g., weekly recurring classes):

```bash
POST /api/classes/bulk
Headers: Authorization: Bearer <admin_token>
Body: {
  "classTypeId": 1,
  "instructorId": 2,
  "startDate": "2024-12-01",
  "endDate": "2024-12-31",
  "daysOfWeek": ["monday", "wednesday", "friday"],
  "startTime": "09:00",
  "endTime": "10:00",
  "capacity": 15
}
```

### Editing an Existing Class

```bash
PUT /api/classes/<class_id>
Headers: Authorization: Bearer <admin_token>
Body: {
  "instructorId": 3,  // Change instructor
  "startTime": "10:00",  // Change time
  "capacity": 20  // Change capacity
}
```

### Cancelling a Class

```bash
PUT /api/classes/<class_id>
Headers: Authorization: Bearer <admin_token>
Body: {
  "status": "cancelled"
}
```

**Important**: When cancelling a class:
- All students with confirmed bookings will be notified automatically
- Credits will be returned to students' accounts
- The class remains in the database but won't show on the public schedule

---

## Managing Classes

### View Upcoming Classes
```bash
GET /api/classes/schedule?startDate=2024-12-01&endDate=2024-12-31
```

### View Classes by Instructor
```bash
GET /api/classes?instructorId=2
```

### Class Capacity Management
- When a class reaches capacity, new bookings go to waitlist
- Waitlist is managed automatically via `/api/waitlist`
- When a spot opens up, first person on waitlist is notified

### Class Types

To add new class types (e.g., "Barre", "Stretching"):

```bash
POST /api/class-types
Headers: Authorization: Bearer <admin_token>
Body: {
  "name": "Barre Fitness",
  "description": "Ballet-inspired workout combining dance and Pilates movements",
  "durationMinutes": 60
}
```

---

## Setting Up 30-Day Reminders

### ✅ Fully Automated System

The 30-day reminder system is **now fully automated** and will:
- Track when students attend classes
- Automatically send beautiful email reminders 30 days after their last class
- Include a special "Welcome Back" 10% discount offer
- Send you (admin) a daily summary report of reminders sent

### How It Works

1. **Automatic Tracking**: When a class is completed, the system schedules a reminder for 30 days later
2. **Daily Email Sending**: A cron job runs every day at 9:00 AM to send due reminders
3. **Beautiful Emails**: Students receive a warm, branded email with:
   - Personalized greeting with their name
   - Days since their last class
   - Special welcome-back offer (10% off next package)
   - Direct booking link to schedule page
   - Studio updates and new class offerings

### Setting Up the Cron Job

#### Option 1: Vercel Cron Jobs (Recommended)

If you're hosting on Vercel, add this to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/send-class-reminders",
      "schedule": "0 9 * * *"
    }
  ]
}
```

Then add your cron secret to environment variables:
```bash
CRON_SECRET=your-random-secret-here
```

#### Option 2: External Cron Service

Use a service like [cron-job.org](https://cron-job.org) or [EasyCron](https://easycron.com):

1. **Create new cron job** that runs daily at 9:00 AM
2. **Set URL**: `https://yourdomain.com/api/cron/send-class-reminders`
3. **Add Header**: `Authorization: Bearer your-cron-secret`
4. **Save and activate**

#### Option 3: Manual Testing

To manually trigger the reminder sending (for testing):

```bash
curl -X GET https://yourdomain.com/api/cron/send-class-reminders \
  -H "Authorization: Bearer your-cron-secret"
```

### Email Configuration

The reminder system uses **Resend** for email delivery. Make sure you have:

```bash
# In your .env file
RESEND_API_KEY=re_xxxxxxxxxxxxx
CRON_SECRET=your-random-secret-here
```

Get your Resend API key from [resend.com](https://resend.com)

### Admin Notification

Every time reminders are sent, you'll receive an email summary at `swiftfitpws@gmail.com` containing:
- Date of the run
- Total reminders due
- Successfully sent count
- Failed count (if any)
- Detailed error messages

### Customizing the Reminder Email

The email template is located at:
```
src/emails/pilates-class-reminder.tsx
```

You can customize:
- Message text and tone
- Special offers or promotions
- Studio updates section
- Colors and branding
- Call-to-action buttons

### Monitoring Reminders

To see pending reminders:

```bash
GET /api/class-reminders/due
```

To manually mark a reminder as sent:

```bash
POST /api/class-reminders/mark-sent
Body: { "reminderId": 123 }
```

### Troubleshooting

**Problem: Reminders not sending**
- Check that RESEND_API_KEY is set correctly
- Verify cron job is running (check logs)
- Test manually with curl command above

**Problem: Students not receiving emails**
- Check spam/junk folders
- Verify email addresses in database are correct
- Check Resend dashboard for delivery status

**Problem: Admin summary not arriving**
- Verify swiftfitpws@gmail.com is correct in the code
- Check your spam folder
- Review Resend logs

---

## Common Workflows

### Workflow 1: Adding a New Teacher for Monday Morning Classes

1. Have teacher register at `/register`
2. Admin logs in and goes to `/admin/instructors/create`
3. Select the user from dropdown
4. Add bio: "Certified Pilates instructor, specializing in core strength"
5. Add specialties: ["Mat Pilates", "Core Work"]
6. Upload headshot
7. Save instructor
8. Go to `/admin/classes/create`
9. Create recurring Monday 9 AM class with new instructor

### Workflow 2: Instructor Change for a Specific Date

1. Admin goes to `/admin/classes`
2. Find the class on the schedule
3. Click "Edit"
4. Change instructor dropdown to substitute teacher
5. Save changes
6. System notifies students of instructor change

### Workflow 3: Managing Email List & Automated Reminders

1. **Students sign up** via popup on `/pilates` page → stored in `email_subscribers` table
2. **After each class completion**, system automatically calls `/api/class-reminders/schedule`
3. **Daily at 9 AM**, cron job runs `/api/cron/send-class-reminders`
4. **System sends** beautiful reminder emails with 10% welcome-back offer
5. **Admin receives** daily summary report of reminders sent
6. **Students click** booking link and return to schedule page

**✨ Completely hands-free after setup!**

---

## API Reference

### Quick Reference Table

| Action | Method | Endpoint | Auth Required |
|--------|--------|----------|---------------|
| List instructors | GET | `/api/instructors` | No |
| Add instructor | POST | `/api/instructors` | Admin |
| Update instructor | PUT | `/api/instructors/<id>` | Admin |
| List classes | GET | `/api/classes` | No |
| Get schedule | GET | `/api/classes/schedule` | No |
| Create class | POST | `/api/classes` | Admin |
| Update class | PUT | `/api/classes/<id>` | Admin |
| Cancel class | PUT | `/api/classes/<id>` | Admin |
| Add class type | POST | `/api/class-types` | Admin |
| Schedule reminder | POST | `/api/class-reminders/schedule` | Admin |
| Get due reminders | GET | `/api/class-reminders/due` | No (for cron) |
| Mark reminder sent | POST | `/api/class-reminders/mark-sent` | Admin |

### Authentication

All admin endpoints require a bearer token in the Authorization header:

```bash
Authorization: Bearer <token>
```

Get the token from:
- Admin login session: `localStorage.getItem('bearer_token')`
- Better-auth session API

---

## Troubleshooting

### Problem: Can't add instructor
**Solution**: Make sure the user has been registered first and has a `user_profile` with `role: "instructor"`

### Problem: Class doesn't show on schedule
**Solution**: Check that:
- Class status is "scheduled" (not "cancelled")
- Date is in the future
- Instructor is active (`isActive: true`)

### Problem: Reminders not sending
**Solution**: 
- Verify cron job is running
- Check `/api/class-reminders/due` returns results
- Ensure email service is configured

---

## Need Help?

- Check the API documentation: [API docs link]
- Contact developer support
- Review database schema: `src/db/schema.ts`

---

**Last Updated**: December 2024
**Version**: 1.0