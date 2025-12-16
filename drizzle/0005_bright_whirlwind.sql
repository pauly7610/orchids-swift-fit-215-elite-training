ALTER TABLE `instructors` ADD `name` text;--> statement-breakpoint
ALTER TABLE `user_profiles` ADD `email_reminders` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `user_profiles` ADD `reminder_hours_before` integer DEFAULT 24 NOT NULL;--> statement-breakpoint
ALTER TABLE `user_profiles` ADD `marketing_emails` integer DEFAULT true NOT NULL;