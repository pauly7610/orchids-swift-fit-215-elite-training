ALTER TABLE `student_purchases` ADD `auto_renew` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `student_purchases` ADD `next_billing_date` text;--> statement-breakpoint
ALTER TABLE `student_purchases` ADD `square_customer_id` text;