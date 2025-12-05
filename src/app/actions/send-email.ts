'use server';

import { resend } from '@/lib/resend';
import { ContactConfirmation } from '@/emails/contact-confirmation';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

interface SendEmailResponse {
  success: boolean;
  error?: string;
  messageId?: string;
}

export async function sendContactEmail(
  data: ContactFormData
): Promise<SendEmailResponse> {
  try {
    // Input validation
    if (!data.name || !data.email || !data.phone) {
      return { success: false, error: 'Missing required fields' };
    }

    if (!isValidEmail(data.email)) {
      return { success: false, error: 'Invalid email address' };
    }

    // Send confirmation email to user
    const userEmailResponse = await resend.emails.send({
      from: 'SwiftFit 215 <onboarding@resend.dev>', // Replace with your verified domain
      to: data.email,
      subject: 'Thank you for contacting SwiftFit 215',
      react: ContactConfirmation({
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
      }),
      replyTo: 'info@swiftfit215.com',
    });

    if (userEmailResponse.error) {
      console.error('User email error:', userEmailResponse.error);
      return {
        success: false,
        error: 'Failed to send confirmation email',
      };
    }

    // Send notification email to admin
    const adminEmailResponse = await resend.emails.send({
      from: 'SwiftFit 215 <onboarding@resend.dev>',
      to: process.env.ADMIN_EMAIL || 'admin@swiftfit215.com',
      subject: `New Contact Form: ${data.name}`,
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1a1a1a; border-bottom: 3px solid #FF6B35; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 8px 0;"><strong>Name:</strong> ${escapeHtml(data.name)}</p>
            <p style="margin: 8px 0;"><strong>Email:</strong> <a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></p>
            <p style="margin: 8px 0;"><strong>Phone:</strong> <a href="tel:${escapeHtml(data.phone)}">${escapeHtml(data.phone)}</a></p>
          </div>
          
          <div style="margin: 20px 0;">
            <strong style="color: #666;">Message:</strong>
            <pre style="background: #f9f9f9; padding: 16px; border-radius: 8px; border-left: 4px solid #FF6B35; white-space: pre-wrap; font-family: Inter, sans-serif; line-height: 1.6;">${escapeHtml(data.message)}</pre>
          </div>
          
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            Received: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} EST
          </p>
        </div>
      `,
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
