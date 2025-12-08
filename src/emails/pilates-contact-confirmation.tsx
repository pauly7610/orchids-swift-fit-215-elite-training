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

interface PilatesContactConfirmationProps {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export const PilatesContactConfirmation = ({
  name,
  email,
  phone,
  message,
}: PilatesContactConfirmationProps) => {
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
      <Preview>Thank you for reaching out to Swift Fit Pilates & Wellness</Preview>
      <Body style={{ backgroundColor: '#FAF8F5', fontFamily: 'Cormorant, Georgia, serif' }}>
        <Container style={{ backgroundColor: '#ffffff', padding: '48px', maxWidth: '600px', margin: '0 auto' }}>
          {/* Elegant Header */}
          <Section style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              margin: '0 auto 20px', 
              borderRadius: '50%', 
              backgroundColor: '#9BA899', 
              opacity: 0.15 
            }}></div>
            <Heading style={{ 
              color: '#5A5550', 
              fontSize: '42px', 
              fontWeight: '300', 
              marginBottom: '8px',
              letterSpacing: '1px'
            }}>
              Swift Fit
            </Heading>
            <Text style={{ 
              color: '#9BA899', 
              fontSize: '12px', 
              marginTop: '0', 
              marginBottom: '0',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              fontWeight: '400'
            }}>
              Pilates and Wellness Studio
            </Text>
          </Section>
          
          {/* Warm Welcome Section */}
          <Section style={{ 
            backgroundColor: '#FFF5F7', 
            padding: '28px', 
            borderRadius: '12px', 
            marginBottom: '36px',
            borderLeft: '3px solid #E8B4B8'
          }}>
            <Heading style={{ 
              color: '#5A5550', 
              fontSize: '26px', 
              margin: '0 0 12px 0',
              fontWeight: '500',
              letterSpacing: '0.5px'
            }}>
              Thank You, {name} 💕
            </Heading>
            <Text style={{ 
              color: '#7A736B', 
              margin: '0', 
              fontSize: '17px', 
              lineHeight: '1.7',
              fontWeight: '400'
            }}>
              We've received your message and appreciate you taking the time to connect with us. 
              A member of our wellness team will respond within 24 hours.
            </Text>
          </Section>
          
          {/* Message Review */}
          <Heading style={{ 
            color: '#5A5550', 
            fontSize: '22px', 
            marginBottom: '16px',
            fontWeight: '500',
            letterSpacing: '0.5px'
          }}>
            Your Message
          </Heading>
          
          <Section style={{ 
            backgroundColor: '#F5F2EE', 
            padding: '24px', 
            borderRadius: '10px',
            marginBottom: '32px'
          }}>
            <Text style={{ 
              color: '#7A736B', 
              fontSize: '16px', 
              lineHeight: '1.8', 
              margin: '0',
              whiteSpace: 'pre-wrap',
              fontWeight: '400'
            }}>
              {message || 'No message provided'}
            </Text>
          </Section>
          
          {/* Contact Info Summary */}
          <Section style={{ marginBottom: '36px' }}>
            <Text style={{ 
              color: '#9BA899', 
              fontSize: '13px', 
              marginBottom: '12px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontWeight: '500'
            }}>
              Your Contact Information
            </Text>
            <Text style={{ 
              color: '#7A736B', 
              fontSize: '15px', 
              lineHeight: '1.8',
              margin: '0'
            }}>
              <strong style={{ color: '#5A5550', fontWeight: '500' }}>Email:</strong> {email}<br />
              <strong style={{ color: '#5A5550', fontWeight: '500' }}>Phone:</strong> {phone}
            </Text>
          </Section>
          
          {/* What Happens Next */}
          <Section style={{ 
            backgroundColor: '#F5F2EE', 
            padding: '24px', 
            borderRadius: '10px',
            marginBottom: '32px'
          }}>
            <Heading style={{ 
              color: '#5A5550', 
              fontSize: '20px', 
              margin: '0 0 16px 0',
              fontWeight: '500'
            }}>
              What Happens Next?
            </Heading>
            <table style={{ width: '100%' }}>
              <tr>
                <td style={{ paddingBottom: '12px' }}>
                  <Text style={{ margin: '0', color: '#7A736B', fontSize: '15px', lineHeight: '1.6' }}>
                    <span style={{ color: '#9BA899', fontWeight: '600' }}>✓</span> We'll review your inquiry carefully
                  </Text>
                </td>
              </tr>
              <tr>
                <td style={{ paddingBottom: '12px' }}>
                  <Text style={{ margin: '0', color: '#7A736B', fontSize: '15px', lineHeight: '1.6' }}>
                    <span style={{ color: '#9BA899', fontWeight: '600' }}>✓</span> A wellness specialist will reach out within 24 hours
                  </Text>
                </td>
              </tr>
              <tr>
                <td>
                  <Text style={{ margin: '0', color: '#7A736B', fontSize: '15px', lineHeight: '1.6' }}>
                    <span style={{ color: '#9BA899', fontWeight: '600' }}>✓</span> We'll answer your questions and help you get started
                  </Text>
                </td>
              </tr>
            </table>
          </Section>
          
          {/* Call to Action */}
          <Section style={{ textAlign: 'center', marginTop: '36px' }}>
            <Text style={{ 
              color: '#7A736B', 
              fontSize: '16px', 
              marginBottom: '20px',
              fontStyle: 'italic'
            }}>
              Or if you prefer to speak with us right away:
            </Text>
            <Button
              href="tel:2679390254"
              style={{
                backgroundColor: '#9BA899',
                color: '#ffffff',
                padding: '16px 36px',
                borderRadius: '50px',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: '500',
                display: 'inline-block',
                letterSpacing: '0.5px'
              }}
            >
              Call Us: (267) 939-0254
            </Button>
          </Section>
          
          {/* Inspirational Quote */}
          <Text style={{ 
            color: '#7A736B', 
            fontSize: '15px', 
            lineHeight: '1.7', 
            marginTop: '36px', 
            textAlign: 'center', 
            fontStyle: 'italic',
            padding: '0 20px'
          }}>
            "Wellness is a journey, not a destination. We're honored to walk alongside you."
          </Text>
          
          <Hr style={{ borderColor: '#B8AFA5', margin: '36px 0', opacity: 0.3 }} />
          
          {/* Studio Information */}
          <Section style={{ textAlign: 'center' }}>
            <Text style={{ 
              color: '#9BA899', 
              fontSize: '15px', 
              lineHeight: '1.8', 
              margin: '0'
            }}>
              <strong style={{ color: '#5A5550', fontWeight: '500' }}>Swift Fit Pilates & Wellness Studio</strong><br />
              2245 E Tioga Street<br />
              Philadelphia, PA 19134<br />
              <a href="mailto:swiftfitpws@gmail.com" style={{ color: '#9BA899', textDecoration: 'none' }}>
                swiftfitpws@gmail.com
              </a>
            </Text>
          </Section>
          
          <Text style={{ 
            color: '#B8AFA5', 
            fontSize: '12px', 
            marginTop: '28px', 
            textAlign: 'center',
            fontWeight: '300'
          }}>
            © 2025 Swift Fit Pilates & Wellness Studio. All rights reserved.<br />
            Part of the SwiftFit 215 family
          </Text>
        </Container>
      </Body>
    </Html>
  );
};
