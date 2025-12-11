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

interface InstructorNotificationProps {
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

export const InstructorNotification = ({
  instructorName,
  studentName,
  className,
  classDate,
  classTime,
  currentCapacity,
  maxCapacity,
  bookingId,
  notificationType,
}: InstructorNotificationProps) => {
  const isNewBooking = notificationType === 'new_booking';
  const backgroundColor = isNewBooking ? '#f0fdf4' : '#fef2f2';
  const borderColor = isNewBooking ? '#22c55e' : '#ef4444';
  const textColor = isNewBooking ? '#166534' : '#991b1b';
  const icon = isNewBooking ? '✓' : '✕';
  const title = isNewBooking ? 'New Student Booked!' : 'Student Cancelled';

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
      <Preview>{title} - {studentName} for {className}</Preview>
      <Body style={{ backgroundColor: '#f4f4f4', fontFamily: 'Inter, Verdana, sans-serif' }}>
        <Container style={{ backgroundColor: '#ffffff', padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
          <Heading style={{ color: '#1a1a1a', fontSize: '32px', fontWeight: 'bold', marginBottom: '8px', fontFamily: 'Bebas Neue, Inter, sans-serif', letterSpacing: '1px' }}>
            SWIFTFIT 215
          </Heading>
          <Text style={{ color: '#FF6B35', fontSize: '14px', marginTop: '0', marginBottom: '8px' }}>
            Instructor Portal
          </Text>
          <Text style={{ color: '#999', fontSize: '12px', marginTop: '0', marginBottom: '32px' }}>
            Hi {instructorName}
          </Text>
          
          <Section style={{ backgroundColor, padding: '20px', borderRadius: '8px', marginBottom: '24px', borderLeft: `4px solid ${borderColor}` }}>
            <Heading style={{ color: textColor, fontSize: '20px', margin: '0 0 8px 0' }}>
              {icon} {title}
            </Heading>
            <Text style={{ color: textColor, margin: '0', fontSize: '14px' }}>
              {isNewBooking 
                ? `${studentName} has booked your ${className} class.`
                : `${studentName} has cancelled their booking for ${className}.`
              }
            </Text>
          </Section>
          
          <Heading style={{ color: '#333', fontSize: '24px', marginBottom: '24px', marginTop: '32px' }}>
            Class Details
          </Heading>
          
          <Section style={{ backgroundColor: '#f9f9f9', padding: '24px', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tr>
                <td style={{ paddingBottom: '16px' }}>
                  <Text style={{ margin: '0', color: '#999', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Class</Text>
                  <Text style={{ margin: '4px 0 0 0', color: '#1a1a1a', fontSize: '18px', fontWeight: '600' }}>{className}</Text>
                </td>
              </tr>
              <tr>
                <td style={{ paddingBottom: '16px' }}>
                  <Text style={{ margin: '0', color: '#999', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date & Time</Text>
                  <Text style={{ margin: '4px 0 0 0', color: '#1a1a1a', fontSize: '16px', fontWeight: '500' }}>
                    {classDate} at {classTime}
                  </Text>
                </td>
              </tr>
              <tr>
                <td style={{ paddingBottom: '16px' }}>
                  <Text style={{ margin: '0', color: '#999', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Student</Text>
                  <Text style={{ margin: '4px 0 0 0', color: '#1a1a1a', fontSize: '16px', fontWeight: '500' }}>{studentName}</Text>
                </td>
              </tr>
              <tr>
                <td style={{ paddingBottom: '16px' }}>
                  <Text style={{ margin: '0', color: '#999', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Current Capacity</Text>
                  <Text style={{ margin: '4px 0 0 0', color: '#FF6B35', fontSize: '20px', fontWeight: '600' }}>
                    {currentCapacity} / {maxCapacity} spots filled
                  </Text>
                </td>
              </tr>
              <tr>
                <td>
                  <Text style={{ margin: '0', color: '#999', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Booking ID</Text>
                  <Text style={{ margin: '4px 0 0 0', color: '#666', fontSize: '14px', fontFamily: 'monospace' }}>#{bookingId}</Text>
                </td>
              </tr>
            </table>
          </Section>
          
          {currentCapacity >= maxCapacity && isNewBooking && (
            <Section style={{ marginTop: '24px', backgroundColor: '#fff7ed', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
              <Text style={{ color: '#9a3412', fontSize: '14px', lineHeight: '1.6', margin: '0', fontWeight: '600' }}>
                ⚠️ Class is now full
              </Text>
              <Text style={{ color: '#9a3412', fontSize: '14px', lineHeight: '1.6', margin: '8px 0 0 0' }}>
                This class has reached maximum capacity. Any additional bookings will be added to the waitlist.
              </Text>
            </Section>
          )}
          
          <Section style={{ marginTop: '32px', textAlign: 'center' }}>
            <Button
              href="https://swiftfitpws.com/instructor"
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
              View Class Roster
            </Button>
          </Section>
          
          <Hr style={{ borderColor: '#eee', margin: '32px 0' }} />
          
          <Section>
            <Text style={{ color: '#999', fontSize: '14px', lineHeight: '1.6', margin: '0' }}>
              <strong>Need help?</strong><br />
              Contact admin at <a href="tel:2679390254" style={{ color: '#FF6B35', textDecoration: 'none' }}>(267) 939-0254</a>
            </Text>
          </Section>
          
          <Text style={{ color: '#999', fontSize: '12px', marginTop: '32px', textAlign: 'center' }}>
            © 2025 SwiftFit 215. All rights reserved.<br />
            This is an automated notification from the instructor portal.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};
