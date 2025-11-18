CREATE TABLE `bookings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`class_id` integer NOT NULL,
	`student_profile_id` integer NOT NULL,
	`booking_status` text DEFAULT 'confirmed' NOT NULL,
	`booked_at` text NOT NULL,
	`cancelled_at` text,
	`cancellation_type` text,
	`payment_id` integer,
	`credits_used` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`student_profile_id`) REFERENCES `user_profiles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`payment_id`) REFERENCES `payments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `class_types` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`duration_minutes` integer DEFAULT 50 NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `classes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`class_type_id` integer NOT NULL,
	`instructor_id` integer NOT NULL,
	`date` text NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`capacity` integer DEFAULT 15 NOT NULL,
	`price` real,
	`status` text DEFAULT 'scheduled' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`class_type_id`) REFERENCES `class_types`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`instructor_id`) REFERENCES `instructors`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `instructors` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_profile_id` integer NOT NULL,
	`bio` text,
	`specialties` text,
	`headshot_url` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_profile_id`) REFERENCES `user_profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `memberships` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`price_monthly` real NOT NULL,
	`is_unlimited` integer DEFAULT true NOT NULL,
	`credits_per_month` integer,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_profile_id` integer NOT NULL,
	`notification_type` text NOT NULL,
	`subject` text NOT NULL,
	`message` text NOT NULL,
	`sent_at` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_profile_id`) REFERENCES `user_profiles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `packages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`credits` integer NOT NULL,
	`price` real NOT NULL,
	`expiration_days` integer,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `payment_methods` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`student_profile_id` integer NOT NULL,
	`square_card_id` text NOT NULL,
	`card_brand` text,
	`last_4` text,
	`is_default` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`student_profile_id`) REFERENCES `user_profiles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `payment_methods_square_card_id_unique` ON `payment_methods` (`square_card_id`);--> statement-breakpoint
CREATE TABLE `payments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`student_profile_id` integer NOT NULL,
	`amount` real NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`payment_method` text NOT NULL,
	`square_payment_id` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`payment_date` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`student_profile_id`) REFERENCES `user_profiles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `payments_square_payment_id_unique` ON `payments` (`square_payment_id`);--> statement-breakpoint
CREATE TABLE `student_purchases` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`student_profile_id` integer NOT NULL,
	`purchase_type` text NOT NULL,
	`package_id` integer,
	`membership_id` integer,
	`credits_remaining` integer,
	`credits_total` integer,
	`purchased_at` text NOT NULL,
	`expires_at` text,
	`is_active` integer DEFAULT true NOT NULL,
	`payment_id` integer NOT NULL,
	FOREIGN KEY (`student_profile_id`) REFERENCES `user_profiles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`package_id`) REFERENCES `packages`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`membership_id`) REFERENCES `memberships`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`payment_id`) REFERENCES `payments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `studio_info` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`studio_name` text NOT NULL,
	`logo_url` text,
	`address` text,
	`phone` text,
	`email` text,
	`hours` text,
	`cancellation_window_hours` integer DEFAULT 24 NOT NULL,
	`late_cancel_penalty` text,
	`no_show_penalty` text,
	`cancellation_policy_text` text,
	`refund_policy_text` text,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`role` text NOT NULL,
	`phone` text,
	`profile_image` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_profiles_user_id_unique` ON `user_profiles` (`user_id`);--> statement-breakpoint
CREATE TABLE `waitlist` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`class_id` integer NOT NULL,
	`student_profile_id` integer NOT NULL,
	`position` integer NOT NULL,
	`joined_at` text NOT NULL,
	`notified` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`student_profile_id`) REFERENCES `user_profiles`(`id`) ON UPDATE no action ON DELETE no action
);
