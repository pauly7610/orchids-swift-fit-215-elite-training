'use server';

import { resend } from '@/lib/resend';
import { BookingConfirmation } from '@/emails/booking-confirmation';
import { BatchedBookingConfirmation } from '@/emails/batched-booking-confirmation';
import { PilatesBookingConfirmation } from '@/emails/pilates-booking-confirmation';
import { PaymentConfirmation } from '@/emails/payment-confirmation';
import { InstructorNotification } from '@/emails/instructor-notification';
import { AdminNotification } from '@/emails/admin-notification';

interface BookingDetail {
  className: string;
  classDate: string;
  classTime: string;
  instructorName: string;
  creditsUsed?: number;
}

interface SendBatchedBookingConfirmationParams {
  studentEmail: string;
  studentName: string;
  bookings: BookingDetail[];
  location: string;
  totalCreditsUsed: number;
  cancellationPolicy: string;
  isPilates: boolean;
}

interface SendBookingConfirmationParams {
  studentEmail: string;
  studentName: string;
  className: string;
  classDate: string;
  classTime: string;
  instructorName: string;
  location: string;
  creditsUsed?: number;
  cancellationPolicy: string;
  isPilates?: boolean;
}

interface SendPaymentConfirmationParams {
  studentEmail: string;
  studentName: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentDate: string;
  purchaseType: 'package' | 'membership' | 'single_class';
  packageName?: string;
  creditsTotal?: number;
  expiresAt?: string;
  transactionId?: string;
}

interface SendInstructorNotificationParams {
  instructorEmail: string;
  instructorName: string;
  studentName: string;
  className: string;
  classDate: string;
  classTime: string;
  currentCapacity: number;
  maxCapacity: number;
  bookingId: number;
  notificationType: 'new_booking' | 'cancellation';
}

interface SendAdminNotificationParams {
  notificationType: 'new_booking' | 'cancellation' | 'payment';
  studentName: string;
  studentEmail: string;
  className?: string;
  classDate?: string;
  classTime?: string;
  instructorName?: string;
  amount?: number;
  currency?: string;
  paymentMethod?: string;
  packageName?: string;
  bookingId?: number;
  paymentId?: number;
  timestamp: string;
}

/**
 * Retry helper with exponential backoff
 * @param fn Function to retry
 * @param maxRetries Maximum number of retry attempts
 * @param baseDelay Base delay in milliseconds (doubles each retry)
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      // Don't retry on last attempt
      if (attempt === maxRetries) {
        break;
      }
      
      // Calculate exponential backoff delay
      const delay = baseDelay * Math.pow(2, attempt);
      console.warn(`Email send attempt ${attempt + 1} failed, retrying in ${delay}ms...`, lastError.message);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError || new Error('Max retries exceeded');
}

export async function sendBatchedBookingConfirmation(
  params: SendBatchedBookingConfirmationParams
): Promise<{ success: boolean; error?: string }> {
  try {
    const multipleClasses = params.bookings.length > 1;
    const firstClass = params.bookings[0];
    
    const EmailComponent = params.isPilates ? PilatesBookingConfirmation : BatchedBookingConfirmation;
    const studioName = params.isPilates ? 'Swift Fit Pilates & Wellness Studio' : 'SwiftFit 215';
    
    const subject = multipleClasses
      ? `${params.bookings.length} Classes Confirmed - ${studioName}`
      : `Class Confirmed - ${firstClass.className} on ${firstClass.classDate}`;

    const response = await retryWithBackoff(async () => {
      const result = await resend.emails.send({
        from: `${studioName} <noreply@swiftfit215.com>`,
        to: params.studentEmail,
        subject: subject,
        react: EmailComponent({
          studentName: params.studentName,
          bookings: params.bookings,
          location: params.location,
          totalCreditsUsed: params.totalCreditsUsed,
          cancellationPolicy: params.cancellationPolicy,
        }),
        replyTo: params.isPilates 
          ? 'swiftfitpws@gmail.com'
          : process.env.ADMIN_EMAIL || 'contact@swiftfit215.com',
      });

      if (result.error) {
        throw new Error(result.error.message || 'Failed to send email');
      }

      return result;
    }, 3, 1000);

    return { success: true };
  } catch (error) {
    console.error('Batched booking confirmation error after retries:', error);
    return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' };
  }
}

export async function sendBookingConfirmation(
  params: SendBookingConfirmationParams
): Promise<{ success: boolean; error?: string }> {
  try {
    const isPilates = params.isPilates || false;
    
    // Use batched function for consistency
    return await sendBatchedBookingConfirmation({
      studentEmail: params.studentEmail,
      studentName: params.studentName,
      bookings: [{
        className: params.className,
        classDate: params.classDate,
        classTime: params.classTime,
        instructorName: params.instructorName,
        creditsUsed: params.creditsUsed,
      }],
      location: params.location,
      totalCreditsUsed: params.creditsUsed || 0,
      cancellationPolicy: params.cancellationPolicy,
      isPilates: isPilates,
    });
  } catch (error) {
    console.error('Booking confirmation error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function sendPaymentConfirmation(
  params: SendPaymentConfirmationParams
): Promise<{ success: boolean; error?: string }> {
  try {
    await retryWithBackoff(async () => {
      const result = await resend.emails.send({
        from: 'SwiftFit 215 <noreply@swiftfit215.com>',
        to: params.studentEmail,
        subject: `Payment Received - ${params.packageName || 'SwiftFit 215'}`,
        react: PaymentConfirmation({
          studentName: params.studentName,
          amount: params.amount,
          currency: params.currency,
          paymentMethod: params.paymentMethod,
          paymentDate: params.paymentDate,
          purchaseType: params.purchaseType,
          packageName: params.packageName,
          creditsTotal: params.creditsTotal,
          expiresAt: params.expiresAt,
          transactionId: params.transactionId,
        }),
        replyTo: process.env.ADMIN_EMAIL || 'contact@swiftfit215.com',
      });

      if (result.error) {
        throw new Error(result.error.message || 'Failed to send email');
      }

      return result;
    }, 3, 1000);

    return { success: true };
  } catch (error) {
    console.error('Payment confirmation error after retries:', error);
    return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' };
  }
}

export async function sendInstructorNotification(
  params: SendInstructorNotificationParams
): Promise<{ success: boolean; error?: string }> {
  try {
    await retryWithBackoff(async () => {
      const result = await resend.emails.send({
        from: 'SwiftFit 215 Instructor Portal <noreply@swiftfit215.com>',
        to: params.instructorEmail,
        subject: params.notificationType === 'new_booking' 
          ? `New Student Booked: ${params.className} on ${params.classDate}`
          : `Cancellation: ${params.className} on ${params.classDate}`,
        react: InstructorNotification({
          instructorName: params.instructorName,
          studentName: params.studentName,
          className: params.className,
          classDate: params.classDate,
          classTime: params.classTime,
          currentCapacity: params.currentCapacity,
          maxCapacity: params.maxCapacity,
          bookingId: params.bookingId,
          notificationType: params.notificationType,
        }),
        replyTo: process.env.ADMIN_EMAIL || 'contact@swiftfit215.com',
      });

      if (result.error) {
        throw new Error(result.error.message || 'Failed to send email');
      }

      return result;
    }, 3, 1000);

    return { success: true };
  } catch (error) {
    console.error('Instructor notification error after retries:', error);
    return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' };
  }
}

export async function sendAdminNotification(
  params: SendAdminNotificationParams
): Promise<{ success: boolean; error?: string }> {
  try {
    const getSubject = () => {
      switch (params.notificationType) {
        case 'new_booking':
          return `New Booking: ${params.studentName} - ${params.className}`;
        case 'cancellation':
          return `Cancellation: ${params.studentName} - ${params.className}`;
        case 'payment':
          return `Payment Received: ${params.studentName} - $${params.amount}`;
        default:
          return `Admin Notification: ${params.studentName}`;
      }
    };

    await retryWithBackoff(async () => {
      const result = await resend.emails.send({
        from: 'SwiftFit 215 Admin <noreply@swiftfit215.com>',
        to: process.env.ADMIN_EMAIL || 'contact@swiftfit215.com',
        subject: getSubject(),
        react: AdminNotification({
          notificationType: params.notificationType,
          studentName: params.studentName,
          studentEmail: params.studentEmail,
          className: params.className,
          classDate: params.classDate,
          classTime: params.classTime,
          instructorName: params.instructorName,
          amount: params.amount,
          currency: params.currency,
          paymentMethod: params.paymentMethod,
          packageName: params.packageName,
          bookingId: params.bookingId,
          paymentId: params.paymentId,
          timestamp: params.timestamp,
        }),
      });

      if (result.error) {
        throw new Error(result.error.message || 'Failed to send email');
      }

      return result;
    }, 3, 1000);

    return { success: true };
  } catch (error) {
    console.error('Admin notification error after retries:', error);
    return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' };
  }
}