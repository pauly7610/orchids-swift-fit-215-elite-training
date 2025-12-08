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

interface ContactConfirmationProps {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export const ContactConfirmation = ({
  name,
  email,
  phone,
  message,
}: ContactConfirmationProps) => {
  return (
    <Html>
      <Head>
        <Font
          fontFamily="Inter"
          fallbackFontFamily="Verdana"
          webFont={{
            url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>Thank you for contacting SwiftFit 215 - Your transformation starts here</Preview>
      <Body style={{ backgroundColor: '#0a0a0a', fontFamily: 'Inter, Verdana, sans-serif' }}>
        <Container style={{ backgroundColor: '#1a1a1a', padding: '40px', maxWidth: '600px', margin: '0 auto', border: '2px solid #FF6B35' }}>
          {/* Bold Gym Header */}
          <Section style={{ textAlign: 'center', marginBottom: '32px', backgroundColor: '#0a0a0a', padding: '24px', borderRadius: '8px' }}>
            <Heading style={{ 
              color: '#ffffff', 
              fontSize: '44px', 
              fontWeight: 'bold', 
              marginBottom: '4px', 
              fontFamily: 'Bebas Neue, Inter, sans-serif', 
              letterSpacing: '2px',
              textTransform: 'uppercase'
            }}>
              SWIFTFIT 215
            </Heading>
            <Text style={{ color: '#FF6B35', fontSize: '16px', marginTop: '0', marginBottom: '0', fontWeight: '700', letterSpacing: '1px' }}>
              SPEED & STRENGTH TRAINING
            </Text>
          </Section>
          
          {/* Success Banner */}
          <Section style={{ 
            backgroundColor: '#FF6B35', 
            padding: '24px', 
            borderRadius: '8px', 
            marginBottom: '32px',
            textAlign: 'center'
          }}>
            <Heading style={{ color: '#ffffff', fontSize: '28px', margin: '0 0 8px 0', fontWeight: '800', textTransform: 'uppercase' }}>
              🔥 MESSAGE RECEIVED!
            </Heading>
            <Text style={{ color: '#ffffff', margin: '0', fontSize: '16px', fontWeight: '600' }}>
              Thanks for reaching out, {name}
            </Text>
          </Section>
          
          <Section style={{ marginTop: '28px' }}>
            <Text style={{ color: '#cccccc', lineHeight: '1.8', fontSize: '17px', marginBottom: '24px' }}>
              <strong style={{ color: '#ffffff', fontWeight: '700' }}>We're fired up to help you transform!</strong> 
              <br /><br />
              One of our team members will get back to you within <span style={{ color: '#FF6B35', fontWeight: '700' }}>24 hours</span> to discuss your fitness goals and how we can help you achieve them.
            </Text>
            
            <Text style={{ color: '#FF6B35', fontSize: '13px', marginTop: '24px', marginBottom: '8px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
              YOUR MESSAGE:
            </Text>
            <Section
              style={{
                color: '#cccccc',
                backgroundColor: '#0a0a0a',
                padding: '20px',
                borderRadius: '8px',
                whiteSpace: 'pre-wrap',
                borderLeft: '4px solid #FF6B35',
                fontSize: '15px',
                lineHeight: '1.7',
                border: '1px solid #333'
              }}
            >
              <Text style={{ margin: '0', color: '#cccccc' }}>
                {message || 'No message provided'}
              </Text>
            </Section>
            
            <Section style={{ marginTop: '24px', backgroundColor: '#0a0a0a', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
              <Text style={{ color: '#888', fontSize: '13px', margin: '0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
                YOUR CONTACT INFO:
              </Text>
              <Text style={{ color: '#cccccc', fontSize: '15px', marginTop: '12px', marginBottom: '0', lineHeight: '1.7' }}>
                <strong style={{ color: '#FF6B35' }}>Email:</strong> {email}<br />
                <strong style={{ color: '#FF6B35' }}>Phone:</strong> {phone}
              </Text>
            </Section>
          </Section>
          
          {/* Why Choose Us Section */}
          <Section style={{ marginTop: '36px', backgroundColor: '#0a0a0a', padding: '24px', borderRadius: '8px' }}>
            <Heading style={{ color: '#ffffff', fontSize: '22px', marginBottom: '16px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
              WHILE YOU WAIT...
            </Heading>
            <table style={{ width: '100%' }}>
              <tr>
                <td style={{ paddingBottom: '12px' }}>
                  <Text style={{ margin: '0', color: '#cccccc', fontSize: '15px', lineHeight: '1.6' }}>
                    <span style={{ color: '#FF6B35', fontWeight: '700' }}>💪</span> Elite Training - Work with Philadelphia's best
                  </Text>
                </td>
              </tr>
              <tr>
                <td style={{ paddingBottom: '12px' }}>
                  <Text style={{ margin: '0', color: '#cccccc', fontSize: '15px', lineHeight: '1.6' }}>
                    <span style={{ color: '#FF6B35', fontWeight: '700' }}>🏆</span> Proven Results - Hundreds sent to college & NFL
                  </Text>
                </td>
              </tr>
              <tr>
                <td style={{ paddingBottom: '12px' }}>
                  <Text style={{ margin: '0', color: '#cccccc', fontSize: '15px', lineHeight: '1.6' }}>
                    <span style={{ color: '#FF6B35', fontWeight: '700' }}>💲</span> Affordable - Just $45/month, no commitments
                  </Text>
                </td>
              </tr>
              <tr>
                <td>
                  <Text style={{ margin: '0', color: '#cccccc', fontSize: '15px', lineHeight: '1.6' }}>
                    <span style={{ color: '#FF6B35', fontWeight: '700' }}>👨‍👩‍👧‍👦</span> Family Atmosphere - Join our 20K+ community
                  </Text>
                </td>
              </tr>
            </table>
          </Section>
          
          <Section style={{ marginTop: '40px', textAlign: 'center' }}>
            <Text style={{ color: '#cccccc', fontSize: '16px', marginBottom: '20px' }}>
              Can't wait? Give us a call now:
            </Text>
            <Button
              href="tel:2679390254"
              style={{
                backgroundColor: '#FF6B35',
                color: '#ffffff',
                padding: '18px 40px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: '18px',
                fontWeight: '800',
                display: 'inline-block',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}
            >
              📞 (267) 939-0254
            </Button>
          </Section>
          
          <Hr style={{ borderColor: '#333', margin: '40px 0' }} />
          
          <Section style={{ textAlign: 'center' }}>
            <Text style={{ color: '#888', fontSize: '14px', lineHeight: '1.8', margin: '0' }}>
              <strong style={{ color: '#ffffff', fontWeight: '700' }}>SwiftFit 215</strong><br />
              Elite Speed & Strength Training<br />
              2245 E Tioga Street<br />
              Philadelphia, PA 19134<br />
              (Entrance on Weikel Street)
            </Text>
          </Section>
          
          <Section style={{ marginTop: '32px', textAlign: 'center', backgroundColor: '#0a0a0a', padding: '20px', borderRadius: '8px' }}>
            <Text style={{ color: '#FF6B35', fontSize: '18px', fontWeight: '800', margin: '0', textTransform: 'uppercase', letterSpacing: '1px' }}>
              TRANSFORM YOUR BODY TODAY
            </Text>
          </Section>
          
          <Text style={{ color: '#666', fontSize: '12px', marginTop: '32px', textAlign: 'center' }}>
            © 2025 SwiftFit 215. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};