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

interface PilatesCancellationConfirmationProps {
  studentName: string;
  className: string;
  classDate: string;
  classTime: string;
  instructorName: string;
  cancellationType: 'on_time' | 'late' | 'no_show';
  creditsRefunded: number;
  hoursUntilClass: number;
}

export const PilatesCancellationConfirmation = ({
  studentName,
  className,
  classDate,
  classTime,
  instructorName,
  cancellationType,
  creditsRefunded,
  hoursUntilClass,
}: PilatesCancellationConfirmationProps) => {
  const isOnTime = cancellationType === 'on_time';
  const isLate = cancellationType === 'late';
  
  const statusTitle = isOnTime 
    ? '✓ Booking Cancelled' 
    : isLate 
      ? '⚠️ Late Cancellation' 
      : '❌ No-Show Recorded';
  
  const statusMessage = isOnTime
    ? `Your booking has been cancelled and ${creditsRefunded} credit${creditsRefunded !== 1 ? 's have' : ' has'} been refunded to your account.`
    : isLate
      ? `Your booking was cancelled within 24 hours of the class start time. As per our cancellation policy, your credit has not been refunded.`
      : `You did not attend this class. As per our policy, your credit has not been refunded.`;

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
      <Preview>
        {isOnTime 
          ? `Booking cancelled - ${className} on ${classDate}` 
          : `${isLate ? 'Late cancellation' : 'No-show'} - ${className}`}
      </Preview>
      <Body style={{ backgroundColor: '#FAF8F5', fontFamily: 'Cormorant, Georgia, serif' }}>
        <Container style={{ backgroundColor: '#ffffff', padding: '48px', maxWidth: '600px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
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
          
          {/* Status Banner */}
          <Section style={{ 
            backgroundColor: isOnTime ? '#F5F2EE' : '#FFF5F5', 
            padding: '24px', 
            borderRadius: '8px', 
            marginBottom: '32px',
            borderLeft: `3px solid ${isOnTime ? '#9BA899' : '#E8B4B8'}`
          }}>
            <Text style={{ 
              color: '#5A5550', 
              fontSize: '18px', 
              margin: '0 0 8px 0',
              fontWeight: '500'
            }}>
              {statusTitle}
            </Text>
            <Text style={{ color: '#7A736B', margin: '0', fontSize: '15px', lineHeight: '1.6' }}>
              {statusMessage}
            </Text>
          </Section>
          
          {/* Class Details */}
          <Heading style={{ 
            color: '#5A5550', 
            fontSize: '24px', 
            marginBottom: '24px', 
            marginTop: '32px',
            fontWeight: '400',
            letterSpacing: '0.5px'
          }}>
            Cancelled Class Details
          </Heading>
          
          <Section style={{ 
            backgroundColor: '#FAF8F5', 
            padding: '24px', 
            borderRadius: '8px',
            border: '1px solid #B8AFA5'
          }}>
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
                    fontWeight: '500'
                  }}>
                    {className}
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
                    fontSize: '16px'
                  }}>
                    {classDate} at {classTime}
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
                    fontSize: '16px'
                  }}>
                    {instructorName}
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
                    Credits {isOnTime ? 'Refunded' : 'Forfeited'}
                  </Text>
                  <Text style={{ 
                    margin: '4px 0 0 0', 
                    color: isOnTime ? '#9BA899' : '#E8B4B8', 
                    fontSize: '16px',
                    fontWeight: '600'
                  }}>
                    {isOnTime ? `+${creditsRefunded}` : `-${creditsRefunded}`} credit{creditsRefunded !== 1 ? 's' : ''}
                  </Text>
                </td>
              </tr>
            </table>
          </Section>
          
          {/* Rebook CTA */}
          <Section style={{ marginTop: '32px', textAlign: 'center' }}>
            <Text style={{ color: '#7A736B', fontSize: '15px', marginBottom: '16px' }}>
              Ready to book another class?
            </Text>
            <Button
              href="https://swiftfitpws.com/pilates/schedule"
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
              View Schedule
            </Button>
          </Section>
          
          <Hr style={{ borderColor: '#B8AFA5', borderWidth: '1px', margin: '32px 0', opacity: 0.3 }} />
          
          {/* Cancellation Policy Reminder */}
          {!isOnTime && (
            <Section style={{ marginBottom: '24px' }}>
              <Heading style={{ 
                color: '#5A5550', 
                fontSize: '16px', 
                marginBottom: '12px',
                fontWeight: '500'
              }}>
                Cancellation Policy Reminder
              </Heading>
              <Text style={{ 
                color: '#7A736B', 
                fontSize: '14px', 
                lineHeight: '1.7', 
                margin: '0'
              }}>
                To receive a full credit refund, please cancel at least 24 hours before the class start time. 
                Late cancellations and no-shows result in forfeited credits to ensure fair access for all students.
              </Text>
            </Section>
          )}
          
          {/* Contact */}
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
          
          {/* Footer */}
          <Section style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #B8AFA5', opacity: 0.5 }}>
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
        </Container>
      </Body>
    </Html>
  );
};

