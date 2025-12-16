import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';



// Auth tables for better-auth
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});

// User profiles extending auth
export const userProfiles = sqliteTable('user_profiles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().unique().references(() => user.id, { onDelete: 'cascade' }),
  role: text('role').notNull(), // 'admin', 'instructor', 'student'
  phone: text('phone'),
  profileImage: text('profile_image'),
  // Notification preferences
  emailReminders: integer('email_reminders', { mode: 'boolean' }).notNull().default(true),
  reminderHoursBefore: integer('reminder_hours_before').notNull().default(24),
  marketingEmails: integer('marketing_emails', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Instructors
export const instructors = sqliteTable('instructors', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userProfileId: integer('user_profile_id').notNull().references(() => userProfiles.id, { onDelete: 'cascade' }),
  name: text('name'), // Display name for the instructor
  bio: text('bio'),
  specialties: text('specialties', { mode: 'json' }),
  headshotUrl: text('headshot_url'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
});

// Class types
export const classTypes = sqliteTable('class_types', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  durationMinutes: integer('duration_minutes').notNull().default(50),
  createdAt: text('created_at').notNull(),
});

// Classes
export const classes = sqliteTable('classes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  classTypeId: integer('class_type_id').notNull().references(() => classTypes.id),
  instructorId: integer('instructor_id').notNull().references(() => instructors.id),
  date: text('date').notNull(),
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  capacity: integer('capacity').notNull().default(15),
  price: real('price'),
  status: text('status').notNull().default('scheduled'), // 'scheduled', 'cancelled', 'completed'
  createdAt: text('created_at').notNull(),
});

// Packages
export const packages = sqliteTable('packages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  credits: integer('credits').notNull(),
  price: real('price').notNull(),
  expirationDays: integer('expiration_days'),
  validityType: text('validity_type'),
  swipeSimpleLink: text('swipe_simple_link'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
});

// Memberships
export const memberships = sqliteTable('memberships', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  priceMonthly: real('price_monthly').notNull(),
  isUnlimited: integer('is_unlimited', { mode: 'boolean' }).notNull().default(true),
  creditsPerMonth: integer('credits_per_month'),
  swipeSimpleLink: text('swipe_simple_link'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
});

// Payments
export const payments = sqliteTable('payments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  studentProfileId: integer('student_profile_id').notNull().references(() => userProfiles.id),
  amount: real('amount').notNull(),
  currency: text('currency').notNull().default('USD'),
  paymentMethod: text('payment_method').notNull(), // 'square', 'cash', 'other'
  squarePaymentId: text('square_payment_id').unique(),
  status: text('status').notNull().default('pending'), // 'pending', 'completed', 'failed', 'refunded'
  paymentDate: text('payment_date').notNull(),
  createdAt: text('created_at').notNull(),
});

// Student purchases
export const studentPurchases = sqliteTable('student_purchases', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  studentProfileId: integer('student_profile_id').notNull().references(() => userProfiles.id),
  purchaseType: text('purchase_type').notNull(), // 'package', 'membership', 'single_class'
  packageId: integer('package_id').references(() => packages.id),
  membershipId: integer('membership_id').references(() => memberships.id),
  creditsRemaining: integer('credits_remaining'),
  creditsTotal: integer('credits_total'),
  purchasedAt: text('purchased_at').notNull(),
  expiresAt: text('expires_at'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  paymentId: integer('payment_id').notNull().references(() => payments.id),
  autoRenew: integer('auto_renew', { mode: 'boolean' }).notNull().default(false),
  nextBillingDate: text('next_billing_date'),
  squareCustomerId: text('square_customer_id'),
});

// Bookings
export const bookings = sqliteTable('bookings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  classId: integer('class_id').notNull().references(() => classes.id),
  studentProfileId: integer('student_profile_id').notNull().references(() => userProfiles.id),
  bookingStatus: text('booking_status').notNull().default('confirmed'), // 'confirmed', 'cancelled', 'no_show', 'late_cancel'
  bookedAt: text('booked_at').notNull(),
  cancelledAt: text('cancelled_at'),
  cancellationType: text('cancellation_type'), // 'on_time', 'late', 'no_show'
  paymentId: integer('payment_id').references(() => payments.id),
  creditsUsed: integer('credits_used').notNull().default(0),
});

// Waitlist
export const waitlist = sqliteTable('waitlist', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  classId: integer('class_id').notNull().references(() => classes.id),
  studentProfileId: integer('student_profile_id').notNull().references(() => userProfiles.id),
  position: integer('position').notNull(),
  joinedAt: text('joined_at').notNull(),
  notified: integer('notified', { mode: 'boolean' }).notNull().default(false),
});

// Payment methods
export const paymentMethods = sqliteTable('payment_methods', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  studentProfileId: integer('student_profile_id').notNull().references(() => userProfiles.id),
  squareCardId: text('square_card_id').notNull().unique(),
  cardBrand: text('card_brand'),
  last4: text('last_4'),
  isDefault: integer('is_default', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(),
});

// Studio info
export const studioInfo = sqliteTable('studio_info', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  studioName: text('studio_name').notNull(),
  logoUrl: text('logo_url'),
  address: text('address'),
  phone: text('phone'),
  email: text('email'),
  hours: text('hours', { mode: 'json' }),
  cancellationWindowHours: integer('cancellation_window_hours').notNull().default(24),
  lateCancelPenalty: text('late_cancel_penalty'), // 'lose_credit', 'warning', 'fee'
  noShowPenalty: text('no_show_penalty'), // 'lose_credit', 'warning', 'fee'
  cancellationPolicyText: text('cancellation_policy_text'),
  refundPolicyText: text('refund_policy_text'),
  updatedAt: text('updated_at').notNull(),
});

// Notifications
export const notifications = sqliteTable('notifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userProfileId: integer('user_profile_id').notNull().references(() => userProfiles.id),
  notificationType: text('notification_type').notNull(), // 'booking_confirmation', 'reminder', 'cancellation', 'waitlist_available'
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  sentAt: text('sent_at'),
  status: text('status').notNull().default('pending'), // 'pending', 'sent', 'failed'
  createdAt: text('created_at').notNull(),
});

// Email subscribers table for newsletter/marketing
export const emailSubscribers = sqliteTable('email_subscribers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  name: text('name'),
  phone: text('phone'),
  source: text('source').notNull(),
  subscribedAt: text('subscribed_at').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
});

// Class reminder tracking for 30-day follow-up system
export const classReminderTracking = sqliteTable('class_reminder_tracking', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  studentProfileId: integer('student_profile_id').references(() => userProfiles.id),
  email: text('email'),
  lastClassDate: text('last_class_date').notNull(),
  reminderScheduledFor: text('reminder_scheduled_for').notNull(),
  reminderSent: integer('reminder_sent', { mode: 'boolean' }).notNull().default(false),
  reminderSentAt: text('reminder_sent_at'),
  createdAt: text('created_at').notNull(),
});