import React from 'react';
import {
  Html,
  Body,
  Container,
  Head,
  Heading,
  Section,
  Text,
  Button,
  Font,
  Preview,
  Hr,
} from '@react-email/components';

interface AdminNotificationProps {
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

export const AdminNotification = ({
  notificationType,
  studentName,
  studentEmail,
  className,
  classDate,
  classTime,
  instructorName,
  amount,
  currency,
  paymentMethod,
  packageName,
  bookingId,
  paymentId,
  timestamp,
}: AdminNotificationProps) => {
  const getTitle = () => {
    switch (notificationType) {
      case 'new_booking':
        return '🎯 New Class Booking';
      case 'cancellation':
        return '❌ Booking Cancelled';
      case 'payment':
        return '💰 Payment Received';
      default:
        return 'Notification';
    }
  };

  const getBackgroundColor = () => {
    switch (notificationType) {
      case 'new_booking':
        return '#f0fdf4';
      case 'cancellation':
        return '#fef2f2';
      case 'payment':
        return '#f0f9ff';
      default:
        return '#f9f9f9';
    }
  };

  const getBorderColor = () => {
    switch (notificationType) {
      case 'new_booking':
        return '#22c55e';
      case 'cancellation':
        return '#ef4444';
      case 'payment':
        return '#3b82f6';
      default:
        return '#e5e5e5';
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <Html>
      <Head>
        <Font
          fontFamily="Inter"
          fallbackFontFamily="Verdana"
          webFont={{
            url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>{getTitle()} - {studentName}</Preview>
      <Body style={{ backgroundColor: '#f4f4f4', fontFamily: 'Inter, Verdana, sans-serif' }}>
        <Container style={{ backgroundColor: '#ffffff', padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
          <Heading style={{ color: '#1a1a1a', fontSize: '32px', fontWeight: 'bold', marginBottom: '8px', fontFamily: 'Bebas Neue, Inter, sans-serif', letterSpacing: '1px' }}>
            SWIFTFIT 215
          </Heading>
          <Text style={{ color: '#FF6B35', fontSize: '14px', marginTop: '0', marginBottom: '8px' }}>
            Admin Portal
          </Text>
          <Text style={{ color: '#999', fontSize: '12px', marginTop: '0', marginBottom: '32px' }}>
            Activity Alert
          </Text>
          
          <Section style={{ backgroundColor: getBackgroundColor(), padding: '20px', borderRadius: '8px', marginBottom: '24px', borderLeft: `4px solid ${getBorderColor()}` }}>
            <Heading style={{ color: '#1a1a1a', fontSize: '20px', margin: '0 0 8px 0' }}>
              {getTitle()}
            </Heading>
            <Text style={{ color: '#666', margin: '0', fontSize: '14px' }}>
              Activity from {studentName} at {timestamp}
            </Text>
          </Section>
          
          <Heading style={{ color: '#333', fontSize: '24px', marginBottom: '24px', marginTop: '32px' }}>
            Details
          </Heading>
          
          <Section style={{ backgroundColor: '#f9f9f9', padding: '24px', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tr>
                <td style={{ paddingBottom: '16px' }}>
                  <Text style={{ margin: '0', color: '#999', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Student</Text>
                  <Text style={{ margin: '4px 0 0 0', color: '#1a1a1a', fontSize: '16px', fontWeight: '600' }}>{studentName}</Text>
                  <Text style={{ margin: '2px 0 0 0', color: '#666', fontSize: '14px' }}>
                    <a href={`mailto:${studentEmail}`} style={{ color: '#FF6B35', textDecoration: 'none' }}>{studentEmail}</a>
                  </Text>
                </td>
              </tr>
              
              {notificationType === 'payment' && amount && currency && (
                <>
                  <tr>
                    <td style={{ paddingBottom: '16px' }}>
                      <Text style={{ margin: '0', color: '#999', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Amount</Text>
                      <Text style={{ margin: '4px 0 0 0', color: '#22c55e', fontSize: '24px', fontWeight: '700' }}>
                        {formatCurrency(amount, currency)}
                      </Text>
                    </td>
                  </tr>
                  {packageName && (
                    <tr>
                      <td style={{ paddingBottom: '16px' }}>
                        <Text style={{ margin: '0', color: '#999', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Package</Text>
                        <Text style={{ margin: '4px 0 0 0', color: '#1a1a1a', fontSize: '16px', fontWeight: '500' }}>{packageName}</Text>
                      </td>
                    </tr>
                  )}
                  {paymentMethod && (
                    <tr>
                      <td style={{ paddingBottom: '16px' }}>
                        <Text style={{ margin: '0', color: '#999', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Payment Method</Text>
                        <Text style={{ margin: '4px 0 0 0', color: '#1a1a1a', fontSize: '16px', fontWeight: '500' }}>
                          {paymentMethod === 'square' ? 'Credit Card' : paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}
                        </Text>
                      </td>
                    </tr>
                  )}
                  {paymentId && (
                    <tr>
                      <td>
                        <Text style={{ margin: '0', color: '#999', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Payment ID</Text>
                        <Text style={{ margin: '4px 0 0 0', color: '#666', fontSize: '14px', fontFamily: 'monospace' }}>#{paymentId}</Text>
                      </td>
                    </tr>
                  )}
                </>
              )}
              
              {(notificationType === 'new_booking' || notificationType === 'cancellation') && className && (
                <>
                  <tr>
                    <td style={{ paddingBottom: '16px' }}>
                      <Text style={{ margin: '0', color: '#999', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Class</Text>
                      <Text style={{ margin: '4px 0 0 0', color: '#1a1a1a', fontSize: '18px', fontWeight: '600' }}>{className}</Text>
                    </td>
                  </tr>
                  {classDate && classTime && (
                    <tr>
                      <td style={{ paddingBottom: '16px' }}>
                        <Text style={{ margin: '0', color: '#999', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date & Time</Text>
                        <Text style={{ margin: '4px 0 0 0', color: '#1a1a1a', fontSize: '16px', fontWeight: '500' }}>
                          {classDate} at {classTime}
                        </Text>
                      </td>
                    </tr>
                  )}
                  {instructorName && (
                    <tr>
                      <td style={{ paddingBottom: '16px' }}>
                        <Text style={{ margin: '0', color: '#999', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Instructor</Text>
                        <Text style={{ margin: '4px 0 0 0', color: '#1a1a1a', fontSize: '16px', fontWeight: '500' }}>{instructorName}</Text>
                      </td>
                    </tr>
                  )}
                  {bookingId && (
                    <tr>
                      <td>
                        <Text style={{ margin: '0', color: '#999', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Booking ID</Text>
                        <Text style={{ margin: '4px 0 0 0', color: '#666', fontSize: '14px', fontFamily: 'monospace' }}>#{bookingId}</Text>
                      </td>
                    </tr>
                  )}
                </>
              )}
            </table>
          </Section>
          
          <Section style={{ marginTop: '32px', textAlign: 'center' }}>
            <Button
              href="https://swiftfit215.com/admin"
              style={{
                backgroundColor: '#FF6B35',
                color: '#ffffff',
                padding: '14px 28px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: '600',
                display: 'inline-block',
              }}
            >
              View Admin Dashboard
            </Button>
          </Section>
          
          <Hr style={{ borderColor: '#eee', margin: '32px 0' }} />
          
          <Section>
            <Text style={{ color: '#999', fontSize: '14px', lineHeight: '1.6', margin: '0' }}>
              <strong>SwiftFit 215</strong><br />
              2245 E Tioga Street<br />
              Philadelphia, PA 19134
            </Text>
          </Section>
          
          <Text style={{ color: '#999', fontSize: '12px', marginTop: '32px', textAlign: 'center' }}>
            © 2025 SwiftFit 215. All rights reserved.<br />
            This is an automated admin notification.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};
