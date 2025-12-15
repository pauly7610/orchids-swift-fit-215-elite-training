/**
 * Instructor-Specific Notification Emails Configuration
 * 
 * When someone signs up for a class taught by certain instructors,
 * additional notification emails will be sent to the configured addresses.
 * 
 * This configuration is easy to extend - just add new instructor names
 * and their corresponding notification emails.
 */

// Map of instructor names (case-insensitive match) to additional notification emails
export const INSTRUCTOR_NOTIFICATION_EMAILS: Record<string, string[]> = {
  // Desiree (Des) - notify internally.a.queen@gmail.com
  'Des': ['internally.a.queen@gmail.com'],
  'Desiree': ['internally.a.queen@gmail.com'],
  
  // Nasir - notify Aceinvestgp@gmail.com
  'Nasir': ['Aceinvestgp@gmail.com'],
};

/**
 * Get additional notification emails for an instructor
 * @param instructorName The name of the instructor
 * @returns Array of additional email addresses to notify, or empty array if none configured
 */
export function getInstructorNotificationEmails(instructorName: string): string[] {
  // Try exact match first
  if (INSTRUCTOR_NOTIFICATION_EMAILS[instructorName]) {
    return INSTRUCTOR_NOTIFICATION_EMAILS[instructorName];
  }
  
  // Try case-insensitive match
  const lowerName = instructorName.toLowerCase();
  for (const [name, emails] of Object.entries(INSTRUCTOR_NOTIFICATION_EMAILS)) {
    if (name.toLowerCase() === lowerName) {
      return emails;
    }
  }
  
  return [];
}

/**
 * Check if an instructor has additional notification emails configured
 * @param instructorName The name of the instructor
 * @returns True if additional notifications are configured
 */
export function hasInstructorNotifications(instructorName: string): boolean {
  return getInstructorNotificationEmails(instructorName).length > 0;
}

