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

interface BatchedBookingConfirmationProps {
  studentName: string;
  bookings: Array<{
    className: string;
    classDate: string;
    classTime: string;
    instructorName: string;
    creditsUsed?: number;
  }>;
  location: string;
  totalCreditsUsed: number;
  cancellationPolicy: string;
}

export const BatchedBookingConfirmation = ({
  studentName,
  bookings,
  location,
  totalCreditsUsed,
  cancellationPolicy,
}: BatchedBookingConfirmationProps) => {
  const multipleClasses = bookings.length > 1;
  
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
      <Preview>Your {multipleClasses ? `${bookings.length} classes are` : 'class is'} confirmed at SwiftFit 215</Preview>
      <Body style={{ backgroundColor: '#f4f4f4', fontFamily: 'Inter, Verdana, sans-serif' }}>
        <Container style={{ backgroundColor: '#ffffff', padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
          <Heading style={{ color: '#1a1a1a', fontSize: '32px', fontWeight: 'bold', marginBottom: '8px', fontFamily: 'Bebas Neue, Inter, sans-serif', letterSpacing: '1px' }}>
            SWIFTFIT 215
          </Heading>
          <Text style={{ color: '#FF6B35', fontSize: '14px', marginTop: '0', marginBottom: '32px' }}>
            Speed & Strength Training
          </Text>
          
          <Section style={{ backgroundColor: '#f0fdf4', padding: '20px', borderRadius: '8px', marginBottom: '24px', borderLeft: '4px solid #22c55e' }}>
            <Heading style={{ color: '#166534', fontSize: '20px', margin: '0 0 8px 0' }}>
              ✓ {multipleClasses ? 'Bookings' : 'Booking'} Confirmed!
            </Heading>
            <Text style={{ color: '#166534', margin: '0', fontSize: '14px' }}>
              You're all set, {studentName}! {multipleClasses ? `We've confirmed ${bookings.length} classes for you.` : 'See you soon.'}
            </Text>
          </Section>
          
          <Heading style={{ color: '#333', fontSize: '24px', marginBottom: '24px', marginTop: '32px' }}>
            {multipleClasses ? 'Your Classes' : 'Class Details'}
          </Heading>
          
          {bookings.map((booking, index) => (
            <Section 
              key={index}
              style={{ 
                backgroundColor: '#f9f9f9', 
                padding: '24px', 
                borderRadius: '8px',
                marginBottom: index < bookings.length - 1 ? '16px' : '0'
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tr>
                  <td style={{ paddingBottom: '16px' }}>
                    <Text style={{ margin: '0', color: '#999', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Class</Text>
                    <Text style={{ margin: '4px 0 0 0', color: '#1a1a1a', fontSize: '18px', fontWeight: '600' }}>{booking.className}</Text>
                  </td>
                </tr>
                <tr>
                  <td style={{ paddingBottom: '16px' }}>
                    <Text style={{ margin: '0', color: '#999', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date & Time</Text>
                    <Text style={{ margin: '4px 0 0 0', color: '#1a1a1a', fontSize: '16px', fontWeight: '500' }}>
                      {booking.classDate} at {booking.classTime}
                    </Text>
                  </td>
                </tr>
                <tr>
                  <td style={{ paddingBottom: '16px' }}>
                    <Text style={{ margin: '0', color: '#999', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Instructor</Text>
                    <Text style={{ margin: '4px 0 0 0', color: '#1a1a1a', fontSize: '16px', fontWeight: '500' }}>{booking.instructorName}</Text>
                  </td>
                </tr>
                {booking.creditsUsed !== undefined && booking.creditsUsed > 0 && (
                  <tr>
                    <td>
                      <Text style={{ margin: '0', color: '#999', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Credits Used</Text>
                      <Text style={{ margin: '4px 0 0 0', color: '#FF6B35', fontSize: '16px', fontWeight: '600' }}>{booking.creditsUsed} credit{booking.creditsUsed > 1 ? 's' : ''}</Text>
                    </td>
                  </tr>
                )}
              </table>
            </Section>
          ))}
          
          {multipleClasses && totalCreditsUsed > 0 && (
            <Section style={{ marginTop: '24px', textAlign: 'right' }}>
              <Text style={{ color: '#666', fontSize: '14px', margin: '0' }}>
                Total Credits Used: <span style={{ color: '#FF6B35', fontWeight: '600' }}>{totalCreditsUsed}</span>
              </Text>
            </Section>
          )}
          
          <Section style={{ marginTop: '32px', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
            <Text style={{ color: '#999', fontSize: '12px', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Location
            </Text>
            <Text style={{ color: '#1a1a1a', fontSize: '16px', margin: '0', fontWeight: '500' }}>
              {location}
            </Text>
          </Section>
          
          <Hr style={{ borderColor: '#eee', margin: '32px 0' }} />
          
          <Section>
            <Heading style={{ color: '#333', fontSize: '18px', marginBottom: '12px' }}>
              Cancellation Policy
            </Heading>
            <Text style={{ color: '#666', fontSize: '14px', lineHeight: '1.6', margin: '0' }}>
              {cancellationPolicy}
            </Text>
          </Section>
          
          <Section style={{ marginTop: '32px', textAlign: 'center' }}>
            <Button
              href="https://swiftfit215.com/student"
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
              View My Bookings
            </Button>
          </Section>
          
          <Hr style={{ borderColor: '#eee', margin: '32px 0' }} />
          
          <Section>
            <Text style={{ color: '#999', fontSize: '14px', lineHeight: '1.6', margin: '0' }}>
              <strong>Questions?</strong><br />
              Call us at <a href="tel:2679390254" style={{ color: '#FF6B35', textDecoration: 'none' }}>(267) 939-0254</a>
            </Text>
          </Section>
          
          <Section style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #eee' }}>
            <Text style={{ color: '#999', fontSize: '14px', lineHeight: '1.6', margin: '0' }}>
              <strong>SwiftFit 215</strong><br />
              2245 E Tioga Street<br />
              Philadelphia, PA 19134
            </Text>
          </Section>
          
          <Text style={{ color: '#999', fontSize: '12px', marginTop: '32px', textAlign: 'center' }}>
            © 2025 SwiftFit 215. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};
