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

interface GymContactConfirmationProps {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export const GymContactConfirmation = ({
  name,
  email,
  phone,
  message,
}: GymContactConfirmationProps) => {
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
      <Preview>Thanks for reaching out to SwiftFit 215 - Let's Transform Your Body!</Preview>
      <Body style={{ backgroundColor: '#0a0a0a', fontFamily: 'Inter, Verdana, sans-serif' }}>
        <Container style={{ backgroundColor: '#1a1a1a', padding: '40px', maxWidth: '600px', margin: '0 auto', border: '2px solid #FF6B35' }}>
          {/* Bold Gym Header */}
          <Section style={{ textAlign: 'center', marginBottom: '32px', backgroundColor: '#0a0a0a', padding: '28px', borderRadius: '8px' }}>
            <Heading style={{ 
              color: '#ffffff', 
              fontSize: '48px', 
              fontWeight: 'bold', 
              marginBottom: '4px', 
              fontFamily: 'Bebas Neue, Inter, sans-serif', 
              letterSpacing: '3px',
              textTransform: 'uppercase'
            }}>
              SWIFTFIT 215
            </Heading>
            <Text style={{ color: '#FF6B35', fontSize: '16px', marginTop: '0', marginBottom: '0', fontWeight: '700', letterSpacing: '1px' }}>
              ELITE SPEED & STRENGTH TRAINING
            </Text>
          </Section>
          
          {/* Hero Message */}
          <Section style={{ 
            background: 'linear-gradient(135deg, #FF6B35 0%, #cc5429 100%)', 
            padding: '32px 24px', 
            borderRadius: '8px', 
            marginBottom: '32px',
            textAlign: 'center'
          }}>
            <Heading style={{ 
              color: '#ffffff', 
              fontSize: '32px', 
              margin: '0 0 12px 0', 
              fontWeight: '700',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              fontFamily: 'Bebas Neue, Inter, sans-serif'
            }}>
              🔥 WE GOT YOUR MESSAGE!
            </Heading>
            <Text style={{ color: '#ffffff', margin: '0', fontSize: '18px', fontWeight: '600' }}>
              Time to start your transformation, {name}!
            </Text>
          </Section>
          
          {/* Personal Welcome */}
          <Section style={{ marginBottom: '32px' }}>
            <Text style={{ 
              color: '#ffffff', 
              fontSize: '18px', 
              lineHeight: '1.7', 
              margin: '0 0 16px 0',
              fontWeight: '500'
            }}>
              Hey <strong style={{ color: '#FF6B35' }}>{name}</strong>,
            </Text>
            <Text style={{ 
              color: '#cccccc', 
              fontSize: '16px', 
              lineHeight: '1.8', 
              margin: '0',
              fontWeight: '400'
            }}>
              Thanks for reaching out to SwiftFit 215! We've received your message and are fired up to help you achieve your fitness goals. 
              Our team will get back to you within 24 hours to discuss your journey to becoming stronger, faster, and better.
            </Text>
          </Section>
          
          {/* What You Submitted */}
          <Heading style={{ 
            color: '#FF6B35', 
            fontSize: '20px', 
            marginBottom: '16px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            YOUR MESSAGE TO US
          </Heading>
          
          <Section style={{ 
            backgroundColor: '#0a0a0a', 
            padding: '24px', 
            borderRadius: '8px',
            borderLeft: '4px solid #FF6B35',
            marginBottom: '32px',
            border: '1px solid #333'
          }}>
            <Text style={{ 
              color: '#dddddd', 
              fontSize: '16px', 
              lineHeight: '1.8', 
              margin: '0',
              whiteSpace: 'pre-wrap',
              fontWeight: '400'
            }}>
              {message || 'No specific message provided - looking forward to discussing your goals!'}
            </Text>
          </Section>
          
          {/* Contact Info Summary */}
          <Section style={{ 
            backgroundColor: '#0a0a0a', 
            padding: '24px', 
            borderRadius: '8px',
            marginBottom: '32px',
            border: '1px solid #333'
          }}>
            <Text style={{ 
              color: '#FF6B35', 
              fontSize: '12px', 
              marginBottom: '12px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontWeight: '700',
              margin: '0 0 16px 0'
            }}>
              WE'LL REACH YOU AT:
            </Text>
            <Text style={{ 
              color: '#cccccc', 
              fontSize: '16px', 
              lineHeight: '1.8',
              margin: '0'
            }}>
              <strong style={{ color: '#ffffff', fontWeight: '600' }}>📧 Email:</strong> {email}<br />
              <strong style={{ color: '#ffffff', fontWeight: '600' }}>📱 Phone:</strong> {phone}
            </Text>
          </Section>
          
          {/* What Happens Next */}
          <Section style={{ 
            backgroundColor: '#1f1f1f', 
            padding: '28px', 
            borderRadius: '8px',
            marginBottom: '32px'
          }}>
            <Heading style={{ 
              color: '#FF6B35', 
              fontSize: '24px', 
              margin: '0 0 20px 0',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              WHAT'S NEXT?
            </Heading>
            <table style={{ width: '100%' }}>
              <tr>
                <td style={{ paddingBottom: '16px' }}>
                  <Text style={{ margin: '0', color: '#cccccc', fontSize: '16px', lineHeight: '1.7' }}>
                    <span style={{ color: '#FF6B35', fontWeight: '700', fontSize: '18px' }}>✓</span> <strong style={{ color: '#ffffff', fontWeight: '600' }}>We review your goals</strong> and match you with the right training program
                  </Text>
                </td>
              </tr>
              <tr>
                <td style={{ paddingBottom: '16px' }}>
                  <Text style={{ margin: '0', color: '#cccccc', fontSize: '16px', lineHeight: '1.7' }}>
                    <span style={{ color: '#FF6B35', fontWeight: '700', fontSize: '18px' }}>✓</span> <strong style={{ color: '#ffffff', fontWeight: '600' }}>Our team reaches out</strong> within 24 hours to schedule your free consultation
                  </Text>
                </td>
              </tr>
              <tr>
                <td>
                  <Text style={{ margin: '0', color: '#cccccc', fontSize: '16px', lineHeight: '1.7' }}>
                    <span style={{ color: '#FF6B35', fontWeight: '700', fontSize: '18px' }}>✓</span> <strong style={{ color: '#ffffff', fontWeight: '600' }}>You start your transformation</strong> with Philadelphia's elite training team
                  </Text>
                </td>
              </tr>
            </table>
          </Section>
          
          {/* CTA Section */}
          <Section style={{ textAlign: 'center', marginTop: '36px', marginBottom: '32px' }}>
            <Text style={{ 
              color: '#cccccc', 
              fontSize: '17px', 
              marginBottom: '20px',
              fontWeight: '600',
              margin: '0 0 20px 0'
            }}>
              Can't wait? Give us a call right now:
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
                fontWeight: '700',
                display: 'inline-block',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}
            >
              📞 CALL (267) 939-0254
            </Button>
          </Section>
          
          {/* Motivational Quote */}
          <Section style={{ 
            backgroundColor: '#0a0a0a', 
            padding: '24px', 
            borderRadius: '8px',
            textAlign: 'center',
            marginBottom: '32px',
            border: '1px solid #333'
          }}>
            <Text style={{ 
              color: '#FF6B35', 
              fontSize: '24px', 
              lineHeight: '1.5', 
              margin: '0 0 8px 0', 
              fontWeight: '700',
              fontFamily: 'Bebas Neue, Inter, sans-serif',
              letterSpacing: '2px'
            }}>
              "IT GETS GREATER, LATER"
            </Text>
            <Text style={{ 
              color: '#888', 
              fontSize: '14px',
              margin: '0',
              fontWeight: '500',
              fontStyle: 'italic'
            }}>
              Trust the vision. Stay uncomfortable. Build greatness.
            </Text>
          </Section>
          
          <Hr style={{ borderColor: '#333', margin: '32px 0' }} />
          
          {/* Gym Information */}
          <Section style={{ textAlign: 'center' }}>
            <Text style={{ 
              color: '#888', 
              fontSize: '15px', 
              lineHeight: '1.8', 
              margin: '0'
            }}>
              <strong style={{ color: '#ffffff', fontWeight: '700', fontSize: '16px' }}>SWIFTFIT 215</strong><br />
              Elite Speed & Strength Training Academy<br />
              2245 E Tioga Street, Philadelphia, PA 19134<br />
              <a href="tel:2679390254" style={{ color: '#FF6B35', textDecoration: 'none', fontWeight: '600' }}>
                (267) 939-0254
              </a>
            </Text>
            
            <div style={{ marginTop: '20px' }}>
              <Text style={{ 
                color: '#666', 
                fontSize: '13px',
                margin: '0',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                FEATURED ON
              </Text>
              <Text style={{ 
                color: '#888', 
                fontSize: '14px',
                margin: '8px 0 0 0',
                fontWeight: '500'
              }}>
                3CBS · 6ABC · 10NBC · FOX29
              </Text>
            </div>
          </Section>
          
          <Text style={{ 
            color: '#666', 
            fontSize: '12px', 
            marginTop: '32px', 
            textAlign: 'center',
            margin: '32px 0 0 0'
          }}>
            © 2025 SwiftFit 215. All rights reserved.<br />
            BBB Rating A+ · Established May 2021
          </Text>
        </Container>
      </Body>
    </Html>
  );
};
