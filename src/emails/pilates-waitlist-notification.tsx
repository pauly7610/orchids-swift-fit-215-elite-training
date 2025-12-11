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

interface PilatesWaitlistNotificationProps {
  studentName: string;
  className: string;
  classDate: string;
  classTime: string;
  instructorName: string;
  waitlistPosition: number;
  spotsAvailable: number;
}

export const PilatesWaitlistNotification = ({
  studentName,
  className,
  classDate,
  classTime,
  instructorName,
  waitlistPosition,
  spotsAvailable,
}: PilatesWaitlistNotificationProps) => {
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
      <Preview>A spot opened up for {className} on {classDate}! Book now before it fills up.</Preview>
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
          
          {/* Exciting News Banner */}
          <Section style={{ 
            backgroundColor: '#E8B4B8', 
            padding: '24px', 
            borderRadius: '8px', 
            marginBottom: '32px',
            textAlign: 'center'
          }}>
            <Text style={{ 
              color: '#5A5550', 
              fontSize: '20px', 
              margin: '0 0 8px 0',
              fontWeight: '600'
            }}>
              🎉 A Spot Just Opened Up!
            </Text>
            <Text style={{ color: '#5A5550', margin: '0', fontSize: '15px', lineHeight: '1.6' }}>
              Great news, {studentName}! You're #{waitlistPosition} on the waitlist and a spot is now available.
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
            Class Details
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
                    Spots Available
                  </Text>
                  <Text style={{ 
                    margin: '4px 0 0 0', 
                    color: '#E8B4B8', 
                    fontSize: '16px',
                    fontWeight: '600'
                  }}>
                    {spotsAvailable} spot{spotsAvailable !== 1 ? 's' : ''} left
                  </Text>
                </td>
              </tr>
            </table>
          </Section>
          
          {/* Urgency Message */}
          <Section style={{ 
            marginTop: '24px', 
            backgroundColor: '#FFF5F5', 
            padding: '16px', 
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <Text style={{ 
              color: '#7A736B', 
              fontSize: '14px', 
              margin: '0',
              fontStyle: 'italic'
            }}>
              ⏰ Spots fill up fast! Book now to secure your place.
            </Text>
          </Section>
          
          {/* Book Now CTA */}
          <Section style={{ marginTop: '32px', textAlign: 'center' }}>
            <Button
              href="https://swiftfit215.com/student"
              style={{
                backgroundColor: '#9BA899',
                color: '#ffffff',
                padding: '16px 40px',
                borderRadius: '24px',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: '600',
                display: 'inline-block',
                letterSpacing: '0.5px'
              }}
            >
              Book This Class Now
            </Button>
          </Section>
          
          <Hr style={{ borderColor: '#B8AFA5', borderWidth: '1px', margin: '32px 0', opacity: 0.3 }} />
          
          {/* Note about waitlist */}
          <Section>
            <Text style={{ 
              color: '#7A736B', 
              fontSize: '14px', 
              lineHeight: '1.7', 
              margin: '0'
            }}>
              <strong style={{ color: '#5A5550' }}>Note:</strong> Being notified doesn't guarantee your spot. 
              You'll need to actively book the class to secure it. Other waitlisted students are also being notified.
            </Text>
          </Section>
          
          <Hr style={{ borderColor: '#B8AFA5', borderWidth: '1px', margin: '32px 0', opacity: 0.3 }} />
          
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
          
          <Text style={{ 
            color: '#B8AFA5', 
            fontSize: '11px', 
            marginTop: '16px', 
            textAlign: 'center'
          }}>
            You received this because you're on the waitlist for this class.{' '}
            <a href="https://swiftfit215.com/student" style={{ color: '#9BA899', textDecoration: 'underline' }}>
              Manage your waitlist
            </a>
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

