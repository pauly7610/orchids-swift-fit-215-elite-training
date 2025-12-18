-- Migration: Add pending_purchases table for tracking purchase intents
CREATE TABLE IF NOT EXISTS `pending_purchases` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `student_profile_id` integer NOT NULL REFERENCES `user_profiles`(`id`),
  `package_id` integer REFERENCES `packages`(`id`),
  `membership_id` integer REFERENCES `memberships`(`id`),
  `product_name` text NOT NULL,
  `product_type` text NOT NULL,
  `amount` real NOT NULL,
  `status` text NOT NULL DEFAULT 'pending',
  `created_at` text NOT NULL,
  `confirmed_at` text,
  `confirmed_by` integer REFERENCES `user_profiles`(`id`),
  `notes` text
);

-- Index for faster lookups by status
CREATE INDEX IF NOT EXISTS `idx_pending_purchases_status` ON `pending_purchases`(`status`);
CREATE INDEX IF NOT EXISTS `idx_pending_purchases_student` ON `pending_purchases`(`student_profile_id`);
