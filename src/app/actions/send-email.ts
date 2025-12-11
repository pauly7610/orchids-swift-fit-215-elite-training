'use server';

import { resend } from '@/lib/resend';
import { GymContactConfirmation } from '@/emails/gym-contact-confirmation';
import { GymContactNotification } from '@/emails/gym-contact-notification';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
  honeypot?: string; // Spam prevention field
  adminEmail?: string; // Optional: specify which admin email to send to
}

interface SendEmailResponse {
  success: boolean;
  error?: string;
  messageId?: string;
}

// Simple in-memory rate limiting (resets on server restart)
const submissionTracker = new Map<string, { count: number; firstSubmission: number }>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_SUBMISSIONS_PER_WINDOW = 3;

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const tracked = submissionTracker.get(identifier);

  if (!tracked) {
    submissionTracker.set(identifier, { count: 1, firstSubmission: now });
    return true;
  }

  // Reset if window expired
  if (now - tracked.firstSubmission > RATE_LIMIT_WINDOW) {
    submissionTracker.set(identifier, { count: 1, firstSubmission: now });
    return true;
  }

  // Check if under limit
  if (tracked.count < MAX_SUBMISSIONS_PER_WINDOW) {
    tracked.count++;
    return true;
  }

  return false;
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of submissionTracker.entries()) {
    if (now - value.firstSubmission > RATE_LIMIT_WINDOW) {
      submissionTracker.delete(key);
    }
  }
}, RATE_LIMIT_WINDOW);

export async function sendContactEmail(
  data: ContactFormData
): Promise<SendEmailResponse> {
  try {
    // Honeypot check - if filled, it's likely a bot
    if (data.honeypot) {
      console.log('Honeypot triggered - potential spam blocked');
      return { 
        success: true, // Return success to not alert bots
        messageId: 'blocked-spam'
      };
    }

    // Input validation
    if (!data.name || !data.email || !data.phone) {
      return { success: false, error: 'Missing required fields' };
    }

    if (!isValidEmail(data.email)) {
      return { success: false, error: 'Invalid email address' };
    }

    if (!isValidPhone(data.phone)) {
      return { success: false, error: 'Invalid phone number' };
    }

    // Rate limiting check (using email as identifier)
    if (!checkRateLimit(data.email.toLowerCase())) {
      return { 
        success: false, 
        error: 'Too many submissions. Please try again later or call us directly at (267) 939-0254.' 
      };
    }

    // Send confirmation email to user
    const userEmailResponse = await resend.emails.send({
      from: 'Swift Fit <noreply@swiftfitpws.com>',
      to: data.email,
      subject: 'Thank you for contacting SwiftFit 215',
      react: GymContactConfirmation({
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
      }),
      replyTo: 'swiftfitpws@gmail.com',
    });

    if (userEmailResponse.error) {
      console.error('User email error:', userEmailResponse.error);
      return {
        success: false,
        error: 'Failed to send confirmation email',
      };
    }

    // Use custom admin email if provided, otherwise fall back to env variable
    const recipientEmail = data.adminEmail || process.env.ADMIN_EMAIL || 'swiftfitpws@gmail.com';

    // Send notification email to admin using React component
    const adminEmailResponse = await resend.emails.send({
      from: 'Swift Fit <noreply@swiftfitpws.com>',
      to: recipientEmail,
      subject: `New Contact Form: ${data.name}`,
      react: GymContactNotification({
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
        timestamp: new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }) + ' EST',
      }),
      replyTo: data.email,
    });

    if (adminEmailResponse.error) {
      console.error('Admin email error:', adminEmailResponse.error);
      // Don't fail the request if admin email fails
    }

    return {
      success: true,
      messageId: userEmailResponse.data?.id,
    };
  } catch (error) {
    console.error('Email sending error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again or call us directly.',
    };
  }
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone: string): boolean {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  // Must be 10 or 11 digits (US phone numbers)
  return digits.length >= 10 && digits.length <= 11;
}

function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}