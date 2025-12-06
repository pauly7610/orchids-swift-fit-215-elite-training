CREATE TABLE `class_reminder_tracking` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`student_profile_id` integer,
	`email` text,
	`last_class_date` text NOT NULL,
	`reminder_scheduled_for` text NOT NULL,
	`reminder_sent` integer DEFAULT false NOT NULL,
	`reminder_sent_at` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`student_profile_id`) REFERENCES `user_profiles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `email_subscribers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`name` text,
	`phone` text,
	`source` text NOT NULL,
	`subscribed_at` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `email_subscribers_email_unique` ON `email_subscribers` (`email`);