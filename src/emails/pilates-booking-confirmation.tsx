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

interface PilatesBookingConfirmationProps {
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

export const PilatesBookingConfirmation = ({
  studentName,
  bookings,
  location,
  totalCreditsUsed,
  cancellationPolicy,
}: PilatesBookingConfirmationProps) => {
  const multipleClasses = bookings.length > 1;
  
  return (
    <Html>
      <Head>
        <Font
          fontFamily="Cormorant"
          fallbackFontFamily="Georgia"
          webFont={{
            url: 'https://fonts.googleapis.com/css2?family=Cormorant:wght@300;400;500;600;700&display=swap',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>Your {multipleClasses ? 'classes are' : 'class is'} confirmed at Swift Fit Pilates & Wellness</Preview>
      <Body style={{ backgroundColor: '#FAF8F5', fontFamily: 'Cormorant, Georgia, serif' }}>
        <Container style={{ backgroundColor: '#ffffff', padding: '48px', maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ 
              width: '64px', 
              height: '64px', 
              margin: '0 auto 16px', 
              borderRadius: '50%', 
              backgroundColor: '#9BA899', 
              opacity: 0.1 
            }}></div>
            <Heading style={{ 
              color: '#5A5550', 
              fontSize: '36px', 
              fontWeight: '300', 
              marginBottom: '4px',
              letterSpacing: '0.5px'
            }}>
              Swift Fit
            </Heading>
            <Text style={{ 
              color: '#9BA899', 
              fontSize: '11px', 
              marginTop: '0', 
              marginBottom: '0',
              letterSpacing: '2px',
              textTransform: 'uppercase'
            }}>
              Pilates and Wellness Studio
            </Text>
          </div>
          
          <Section style={{ 
            backgroundColor: '#F5F2EE', 
            padding: '24px', 
            borderRadius: '8px', 
            marginBottom: '32px',
            borderLeft: '3px solid #9BA899'
          }}>
            <Text style={{ 
              color: '#5A5550', 
              fontSize: '18px', 
              margin: '0 0 8px 0',
              fontWeight: '500'
            }}>
              ✓ Booking Confirmed
            </Text>
            <Text style={{ color: '#7A736B', margin: '0', fontSize: '15px', lineHeight: '1.6' }}>
              Welcome, {studentName}. We're delighted to see you on your mat{multipleClasses ? ' for these upcoming classes' : ''}.
            </Text>
          </Section>
          
          <Heading style={{ 
            color: '#5A5550', 
            fontSize: '24px', 
            marginBottom: '24px', 
            marginTop: '32px',
            fontWeight: '400',
            letterSpacing: '0.5px'
          }}>
            {multipleClasses ? 'Your Classes' : 'Class Details'}
          </Heading>
          
          {bookings.map((booking, index) => (
            <Section 
              key={index}
              style={{ 
                backgroundColor: '#FAF8F5', 
                padding: '24px', 
                borderRadius: '8px',
                marginBottom: index < bookings.length - 1 ? '16px' : '0',
                border: '1px solid #B8AFA5',
                borderWidth: '1px 1px 1px 1px'
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tr>
                  <td style={{ paddingBottom: '16px' }}>
                    <Text style={{ 
                      margin: '0', 
                      color: '#9BA899', 
                      fontSize: '11px', 
                      textTransform: 'uppercase', 
                      letterSpacing: '1px',
                      fontWeight: '500'
                    }}>
                      Class
                    </Text>
                    <Text style={{ 
                      margin: '4px 0 0 0', 
                      color: '#5A5550', 
                      fontSize: '18px', 
                      fontWeight: '500',
                      letterSpacing: '0.3px'
                    }}>
                      {booking.className}
                    </Text>
                  </td>
                </tr>
                <tr>
                  <td style={{ paddingBottom: '16px' }}>
                    <Text style={{ 
                      margin: '0', 
                      color: '#9BA899', 
                      fontSize: '11px', 
                      textTransform: 'uppercase', 
                      letterSpacing: '1px',
                      fontWeight: '500'
                    }}>
                      Date & Time
                    </Text>
                    <Text style={{ 
                      margin: '4px 0 0 0', 
                      color: '#5A5550', 
                      fontSize: '16px', 
                      fontWeight: '400'
                    }}>
                      {booking.classDate} at {booking.classTime}
                    </Text>
                  </td>
                </tr>
                <tr>
                  <td style={{ paddingBottom: '16px' }}>
                    <Text style={{ 
                      margin: '0', 
                      color: '#9BA899', 
                      fontSize: '11px', 
                      textTransform: 'uppercase', 
                      letterSpacing: '1px',
                      fontWeight: '500'
                    }}>
                      Instructor
                    </Text>
                    <Text style={{ 
                      margin: '4px 0 0 0', 
                      color: '#5A5550', 
                      fontSize: '16px', 
                      fontWeight: '400'
                    }}>
                      {booking.instructorName}
                    </Text>
                  </td>
                </tr>
                <tr>
                    <td>
                      <Text style={{ 
                        margin: '0', 
                        color: '#9BA899', 
                        fontSize: '11px', 
                        textTransform: 'uppercase', 
                        letterSpacing: '1px',
                        fontWeight: '500'
                      }}>
                        {booking.creditsUsed !== undefined && booking.creditsUsed > 0 ? 'Credits Used' : 'Cost'}
                      </Text>
                      <Text style={{ 
                        margin: '4px 0 0 0', 
                        color: booking.creditsUsed !== undefined && booking.creditsUsed > 0 ? '#9BA899' : '#E8B4B8', 
                        fontSize: '16px', 
                        fontWeight: '600'
                      }}>
                        {booking.creditsUsed !== undefined && booking.creditsUsed > 0 
                          ? `${booking.creditsUsed} credit${booking.creditsUsed > 1 ? 's' : ''}`
                          : 'FREE ✨'}
                      </Text>
                    </td>
                  </tr>
              </table>
            </Section>
          ))}
          
          {multipleClasses && totalCreditsUsed > 0 && (
            <Section style={{ marginTop: '24px', textAlign: 'right' }}>
              <Text style={{ 
                color: '#7A736B', 
                fontSize: '14px', 
                margin: '0',
                fontWeight: '500'
              }}>
                Total Credits Used: <span style={{ color: '#9BA899', fontWeight: '600' }}>{totalCreditsUsed}</span>
              </Text>
            </Section>
          )}
          
          <Section style={{ marginTop: '32px', backgroundColor: '#F5F2EE', padding: '20px', borderRadius: '8px' }}>
            <Text style={{ 
              color: '#7A736B', 
              fontSize: '14px', 
              margin: '0 0 8px 0',
              fontWeight: '500'
            }}>
              Location
            </Text>
            <Text style={{ color: '#5A5550', fontSize: '15px', margin: '0' }}>
              {location}
            </Text>
          </Section>
          
          <Hr style={{ borderColor: '#B8AFA5', borderWidth: '1px', margin: '32px 0', opacity: 0.3 }} />
          
          <Section>
            <Heading style={{ 
              color: '#5A5550', 
              fontSize: '18px', 
              marginBottom: '12px',
              fontWeight: '500'
            }}>
              Cancellation Policy
            </Heading>
            <Text style={{ 
              color: '#7A736B', 
              fontSize: '14px', 
              lineHeight: '1.7', 
              margin: '0',
              fontWeight: '400'
            }}>
              {cancellationPolicy}
            </Text>
          </Section>
          
          <Section style={{ marginTop: '32px', textAlign: 'center' }}>
            <Button
              href="https://swiftfit215.com/student"
              style={{
                backgroundColor: '#9BA899',
                color: '#ffffff',
                padding: '14px 32px',
                borderRadius: '24px',
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: '500',
                display: 'inline-block',
                letterSpacing: '0.5px'
              }}
            >
              View My Bookings
            </Button>
          </Section>
          
          <Hr style={{ borderColor: '#B8AFA5', borderWidth: '1px', margin: '32px 0', opacity: 0.3 }} />
          
          <Section>
            <Text style={{ 
              color: '#7A736B', 
              fontSize: '14px', 
              lineHeight: '1.7', 
              margin: '0',
              textAlign: 'center'
            }}>
              Questions? Email us at{' '}
              <a href="mailto:swiftfitpws@gmail.com" style={{ color: '#9BA899', textDecoration: 'none' }}>
                swiftfitpws@gmail.com
              </a>
            </Text>
          </Section>
          
          <Section style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #B8AFA5', opacity: 0.3 }}>
            <Text style={{ 
              color: '#9BA899', 
              fontSize: '13px', 
              lineHeight: '1.6', 
              margin: '0',
              textAlign: 'center'
            }}>
              <strong style={{ fontWeight: '500' }}>Swift Fit Pilates & Wellness Studio</strong><br />
              2245 E Tioga Street<br />
              Philadelphia, PA 19134
            </Text>
          </Section>
          
          <Text style={{ 
            color: '#B8AFA5', 
            fontSize: '12px', 
            marginTop: '24px', 
            textAlign: 'center',
            fontWeight: '300'
          }}>
            © 2025 Swift Fit Pilates & Wellness Studio. All rights reserved.
          </Text>
          
          <Text style={{ 
            color: '#B8AFA5', 
            fontSize: '11px', 
            marginTop: '16px', 
            textAlign: 'center'
          }}>
            <a href="https://swiftfit215.com/student" style={{ color: '#9BA899', textDecoration: 'underline' }}>
              Manage notification preferences
            </a>
          </Text>
        </Container>
      </Body>
    </Html>
  );
};
