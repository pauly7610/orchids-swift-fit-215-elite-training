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

interface GymContactNotificationProps {
  name: string;
  email: string;
  phone: string;
  message: string;
  timestamp: string;
}

export const GymContactNotification = ({
  name,
  email,
  phone,
  message,
  timestamp,
}: GymContactNotificationProps) => {
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
      <Preview>New Contact Form Submission from {name}</Preview>
      <Body style={{ backgroundColor: '#0a0a0a', fontFamily: 'Inter, Verdana, sans-serif' }}>
        <Container style={{ backgroundColor: '#1a1a1a', padding: '40px', maxWidth: '600px', margin: '0 auto', border: '2px solid #FF6B35' }}>
          {/* Bold Gym Header */}
          <Section style={{ textAlign: 'center', marginBottom: '32px', backgroundColor: '#0a0a0a', padding: '24px', borderRadius: '8px' }}>
            <Heading style={{ 
              color: '#ffffff', 
              fontSize: '40px', 
              fontWeight: 'bold', 
              marginBottom: '4px', 
              fontFamily: 'Bebas Neue, Inter, sans-serif', 
              letterSpacing: '2px',
              textTransform: 'uppercase'
            }}>
              SWIFTFIT 215
            </Heading>
            <Text style={{ color: '#FF6B35', fontSize: '16px', marginTop: '0', marginBottom: '8px', fontWeight: '700', letterSpacing: '1px' }}>
              SPEED & STRENGTH TRAINING
            </Text>
            <Text style={{ color: '#888', fontSize: '12px', marginTop: '0', marginBottom: '0', textTransform: 'uppercase', letterSpacing: '1px' }}>
              NEW CONTACT SUBMISSION
            </Text>
          </Section>
          
          {/* Alert Banner */}
          <Section style={{ 
            backgroundColor: '#FF6B35', 
            padding: '20px', 
            borderRadius: '8px', 
            marginBottom: '32px',
            textAlign: 'center'
          }}>
            <Heading style={{ color: '#ffffff', fontSize: '24px', margin: '0 0 8px 0', fontWeight: '700' }}>
              🔥 NEW LEAD ALERT
            </Heading>
            <Text style={{ color: '#ffffff', margin: '0', fontSize: '16px', fontWeight: '600' }}>
              Potential client from gym website
            </Text>
          </Section>
          
          {/* Contact Details */}
          <Heading style={{ color: '#ffffff', fontSize: '24px', marginBottom: '24px', marginTop: '32px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
            CONTACT DETAILS
          </Heading>
          
          <Section style={{ backgroundColor: '#0a0a0a', padding: '28px', borderRadius: '8px', border: '1px solid #333' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tr>
                <td style={{ paddingBottom: '20px' }}>
                  <Text style={{ margin: '0', color: '#FF6B35', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>
                    NAME
                  </Text>
                  <Text style={{ margin: '8px 0 0 0', color: '#ffffff', fontSize: '20px', fontWeight: '700' }}>
                    {name}
                  </Text>
                </td>
              </tr>
              
              <tr>
                <td style={{ paddingBottom: '20px' }}>
                  <Text style={{ margin: '0', color: '#FF6B35', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>
                    EMAIL
                  </Text>
                  <Text style={{ margin: '8px 0 0 0', color: '#ffffff', fontSize: '18px', fontWeight: '500' }}>
                    <a href={`mailto:${email}`} style={{ color: '#FF6B35', textDecoration: 'none', fontWeight: '600' }}>
                      {email}
                    </a>
                  </Text>
                </td>
              </tr>
              
              <tr>
                <td style={{ paddingBottom: '20px' }}>
                  <Text style={{ margin: '0', color: '#FF6B35', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>
                    PHONE
                  </Text>
                  <Text style={{ margin: '8px 0 0 0', color: '#ffffff', fontSize: '18px', fontWeight: '500' }}>
                    <a href={`tel:${phone.replace(/\D/g, '')}`} style={{ color: '#FF6B35', textDecoration: 'none', fontWeight: '600' }}>
                      {phone}
                    </a>
                  </Text>
                </td>
              </tr>
              
              <tr>
                <td>
                  <Text style={{ margin: '0', color: '#FF6B35', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>
                    TIMESTAMP
                  </Text>
                  <Text style={{ margin: '8px 0 0 0', color: '#888', fontSize: '14px', fontFamily: 'monospace' }}>
                    {timestamp}
                  </Text>
                </td>
              </tr>
            </table>
          </Section>
          
          {/* Message Section */}
          <Heading style={{ color: '#ffffff', fontSize: '24px', marginBottom: '16px', marginTop: '32px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
            MESSAGE
          </Heading>
          
          <Section style={{ 
            backgroundColor: '#0a0a0a', 
            padding: '24px', 
            borderRadius: '8px', 
            border: '1px solid #333',
            borderLeft: '4px solid #FF6B35'
          }}>
            <Text style={{ 
              color: '#cccccc', 
              fontSize: '16px', 
              lineHeight: '1.8', 
              margin: '0',
              whiteSpace: 'pre-wrap',
              fontWeight: '400'
            }}>
              {message || 'No message provided'}
            </Text>
          </Section>
          
          {/* Quick Actions */}
          <Section style={{ marginTop: '40px', textAlign: 'center' }}>
            <table style={{ margin: '0 auto' }}>
              <tr>
                <td style={{ padding: '0 8px' }}>
                  <Button
                    href={`mailto:${email}`}
                    style={{
                      backgroundColor: '#FF6B35',
                      color: '#ffffff',
                      padding: '16px 32px',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      fontSize: '16px',
                      fontWeight: '700',
                      display: 'inline-block',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}
                  >
                    📧 Reply Now
                  </Button>
                </td>
                <td style={{ padding: '0 8px' }}>
                  <Button
                    href={`tel:${phone.replace(/\D/g, '')}`}
                    style={{
                      backgroundColor: '#1a1a1a',
                      color: '#FF6B35',
                      padding: '16px 32px',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      fontSize: '16px',
                      fontWeight: '700',
                      display: 'inline-block',
                      border: '2px solid #FF6B35',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}
                  >
                    📞 Call Now
                  </Button>
                </td>
              </tr>
            </table>
          </Section>
          
          <Hr style={{ borderColor: '#333', margin: '40px 0' }} />
          
          {/* Gym Info */}
          <Section style={{ textAlign: 'center' }}>
            <Text style={{ color: '#888', fontSize: '14px', lineHeight: '1.8', margin: '0' }}>
              <strong style={{ color: '#ffffff', fontWeight: '700' }}>SwiftFit 215</strong><br />
              Elite Speed & Strength Training<br />
              2245 E Tioga Street, Philadelphia, PA 19134<br />
              <a href="tel:2679390254" style={{ color: '#FF6B35', textDecoration: 'none', fontWeight: '600' }}>
                (267) 939-0254
              </a>
            </Text>
          </Section>
          
          <Text style={{ color: '#666', fontSize: '12px', marginTop: '32px', textAlign: 'center' }}>
            © 2025 SwiftFit 215. All rights reserved.<br />
            This is an automated admin notification from the gym website.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};
