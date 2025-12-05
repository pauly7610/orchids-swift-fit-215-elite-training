'use server';

import { resend } from '@/lib/resend';
import { BookingConfirmation } from '@/emails/booking-confirmation';
import { PaymentConfirmation } from '@/emails/payment-confirmation';
import { InstructorNotification } from '@/emails/instructor-notification';
import { AdminNotification } from '@/emails/admin-notification';

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

export async function sendBookingConfirmation(
  params: SendBookingConfirmationParams
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await resend.emails.send({
      from: 'SwiftFit 215 <onboarding@resend.dev>',
      to: params.studentEmail,
      subject: `Class Confirmed - ${params.className} on ${params.classDate}`,
      react: BookingConfirmation({
        studentName: params.studentName,
        className: params.className,
        classDate: params.classDate,
        classTime: params.classTime,
        instructorName: params.instructorName,
        location: params.location,
        creditsUsed: params.creditsUsed,
        cancellationPolicy: params.cancellationPolicy,
      }),
      replyTo: process.env.ADMIN_EMAIL || 'contact@swiftfit215.com',
    });

    if (response.error) {
      console.error('Booking confirmation email error:', response.error);
      return { success: false, error: 'Failed to send booking confirmation' };
    }

    return { success: true };
  } catch (error) {
    console.error('Booking confirmation error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function sendPaymentConfirmation(
  params: SendPaymentConfirmationParams
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await resend.emails.send({
      from: 'SwiftFit 215 <onboarding@resend.dev>',
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

    if (response.error) {
      console.error('Payment confirmation email error:', response.error);
      return { success: false, error: 'Failed to send payment confirmation' };
    }

    return { success: true };
  } catch (error) {
    console.error('Payment confirmation error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function sendInstructorNotification(
  params: SendInstructorNotificationParams
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await resend.emails.send({
      from: 'SwiftFit 215 Instructor Portal <onboarding@resend.dev>',
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

    if (response.error) {
      console.error('Instructor notification email error:', response.error);
      return { success: false, error: 'Failed to send instructor notification' };
    }

    return { success: true };
  } catch (error) {
    console.error('Instructor notification error:', error);
    return { success: false, error: 'An unexpected error occurred' };
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

    const response = await resend.emails.send({
      from: 'SwiftFit 215 Admin <onboarding@resend.dev>',
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

    if (response.error) {
      console.error('Admin notification email error:', response.error);
      return { success: false, error: 'Failed to send admin notification' };
    }

    return { success: true };
  } catch (error) {
    console.error('Admin notification error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
