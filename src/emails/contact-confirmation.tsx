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
            url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>Thank you for contacting SwiftFit 215</Preview>
      <Body style={{ backgroundColor: '#f4f4f4', fontFamily: 'Inter, Verdana, sans-serif' }}>
        <Container style={{ backgroundColor: '#ffffff', padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
          <Heading style={{ color: '#1a1a1a', fontSize: '32px', fontWeight: 'bold', marginBottom: '8px', fontFamily: 'Bebas Neue, Inter, sans-serif', letterSpacing: '1px' }}>
            SWIFTFIT 215
          </Heading>
          <Text style={{ color: '#FF6B35', fontSize: '14px', marginTop: '0', marginBottom: '32px' }}>
            Speed & Strength Training
          </Text>
          
          <Heading style={{ color: '#333', fontSize: '24px', marginBottom: '16px' }}>
            Thank you, {name}!
          </Heading>
          
          <Section style={{ marginTop: '24px' }}>
            <Text style={{ color: '#666', lineHeight: '1.6', fontSize: '16px' }}>
              We've received your message and one of our team members will get back to you within 24 hours.
            </Text>
            
            <Text style={{ color: '#999', fontSize: '14px', marginTop: '24px', marginBottom: '8px', fontWeight: '600' }}>
              YOUR MESSAGE:
            </Text>
            <Text
              style={{
                color: '#666',
                backgroundColor: '#f9f9f9',
                padding: '16px',
                borderRadius: '8px',
                whiteSpace: 'pre-wrap',
                borderLeft: '4px solid #FF6B35',
                fontSize: '14px',
                lineHeight: '1.6',
              }}
            >
              {message || 'No message provided'}
            </Text>
            
            <Text style={{ color: '#999', fontSize: '14px', marginTop: '24px' }}>
              <strong>Your Contact Info:</strong><br />
              Email: {email}<br />
              Phone: {phone}
            </Text>
          </Section>
          
          <Section style={{ marginTop: '40px', textAlign: 'center' }}>
            <Button
              href="tel:2679390254"
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
              Call Us Now: (267) 939-0254
            </Button>
          </Section>
          
          <Section style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid #eee' }}>
            <Text style={{ color: '#999', fontSize: '14px', lineHeight: '1.6', margin: '0' }}>
              <strong>SwiftFit 215</strong><br />
              2245 E Tioga Street<br />
              Philadelphia, PA 19134<br />
              (Entrance on Weikel Street)
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
