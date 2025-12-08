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

interface PilatesContactNotificationProps {
  name: string;
  email: string;
  phone: string;
  message: string;
  timestamp: string;
}

export const PilatesContactNotification = ({
  name,
  email,
  phone,
  message,
  timestamp,
}: PilatesContactNotificationProps) => {
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
      <Preview>New inquiry from {name} - Swift Fit Pilates</Preview>
      <Body style={{ backgroundColor: '#FAF8F5', fontFamily: 'Cormorant, Georgia, serif' }}>
        <Container style={{ backgroundColor: '#ffffff', padding: '44px', maxWidth: '600px', margin: '0 auto', border: '2px solid #9BA899' }}>
          {/* Elegant Header */}
          <Section style={{ textAlign: 'center', marginBottom: '32px', backgroundColor: '#F5F2EE', padding: '28px', borderRadius: '12px' }}>
            <Heading style={{ 
              color: '#5A5550', 
              fontSize: '38px', 
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
              marginBottom: '12px',
              letterSpacing: '3px',
              textTransform: 'uppercase'
            }}>
              Pilates and Wellness Studio
            </Text>
            <Text style={{ 
              color: '#7A736B', 
              fontSize: '13px', 
              marginTop: '0', 
              marginBottom: '0',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontWeight: '500'
            }}>
              New Contact Inquiry
            </Text>
          </Section>
          
          {/* New Lead Alert */}
          <Section style={{ 
            backgroundColor: '#E8B4B8', 
            padding: '24px', 
            borderRadius: '12px', 
            marginBottom: '32px',
            textAlign: 'center'
          }}>
            <Text style={{ 
              color: '#5A5550', 
              fontSize: '20px', 
              margin: '0 0 8px 0',
              fontWeight: '600',
              letterSpacing: '0.5px'
            }}>
              💕 New Potential Client
            </Text>
            <Text style={{ 
              color: '#5A5550', 
              margin: '0', 
              fontSize: '15px',
              fontWeight: '400'
            }}>
              Inquiry received from pilates website
            </Text>
          </Section>
          
          {/* Contact Details */}
          <Heading style={{ 
            color: '#5A5550', 
            fontSize: '24px', 
            marginBottom: '20px',
            fontWeight: '500',
            letterSpacing: '0.5px'
          }}>
            Contact Information
          </Heading>
          
          <Section style={{ 
            backgroundColor: '#F5F2EE', 
            padding: '28px', 
            borderRadius: '10px',
            marginBottom: '28px'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tr>
                <td style={{ paddingBottom: '20px' }}>
                  <Text style={{ 
                    margin: '0', 
                    color: '#9BA899', 
                    fontSize: '12px', 
                    textTransform: 'uppercase', 
                    letterSpacing: '1px',
                    fontWeight: '500'
                  }}>
                    Name
                  </Text>
                  <Text style={{ 
                    margin: '8px 0 0 0', 
                    color: '#5A5550', 
                    fontSize: '20px', 
                    fontWeight: '600',
                    letterSpacing: '0.3px'
                  }}>
                    {name}
                  </Text>
                </td>
              </tr>
              
              <tr>
                <td style={{ paddingBottom: '20px' }}>
                  <Text style={{ 
                    margin: '0', 
                    color: '#9BA899', 
                    fontSize: '12px', 
                    textTransform: 'uppercase', 
                    letterSpacing: '1px',
                    fontWeight: '500'
                  }}>
                    Email Address
                  </Text>
                  <Text style={{ 
                    margin: '8px 0 0 0', 
                    color: '#5A5550', 
                    fontSize: '17px', 
                    fontWeight: '400'
                  }}>
                    <a href={`mailto:${email}`} style={{ 
                      color: '#9BA899', 
                      textDecoration: 'none',
                      fontWeight: '500'
                    }}>
                      {email}
                    </a>
                  </Text>
                </td>
              </tr>
              
              <tr>
                <td style={{ paddingBottom: '20px' }}>
                  <Text style={{ 
                    margin: '0', 
                    color: '#9BA899', 
                    fontSize: '12px', 
                    textTransform: 'uppercase', 
                    letterSpacing: '1px',
                    fontWeight: '500'
                  }}>
                    Phone Number
                  </Text>
                  <Text style={{ 
                    margin: '8px 0 0 0', 
                    color: '#5A5550', 
                    fontSize: '17px', 
                    fontWeight: '400'
                  }}>
                    <a href={`tel:${phone.replace(/\D/g, '')}`} style={{ 
                      color: '#9BA899', 
                      textDecoration: 'none',
                      fontWeight: '500'
                    }}>
                      {phone}
                    </a>
                  </Text>
                </td>
              </tr>
              
              <tr>
                <td>
                  <Text style={{ 
                    margin: '0', 
                    color: '#9BA899', 
                    fontSize: '12px', 
                    textTransform: 'uppercase', 
                    letterSpacing: '1px',
                    fontWeight: '500'
                  }}>
                    Received
                  </Text>
                  <Text style={{ 
                    margin: '8px 0 0 0', 
                    color: '#B8AFA5', 
                    fontSize: '14px',
                    fontFamily: 'monospace'
                  }}>
                    {timestamp}
                  </Text>
                </td>
              </tr>
            </table>
          </Section>
          
          {/* Message Content */}
          <Heading style={{ 
            color: '#5A5550', 
            fontSize: '24px', 
            marginBottom: '16px',
            fontWeight: '500',
            letterSpacing: '0.5px'
          }}>
            Their Message
          </Heading>
          
          <Section style={{ 
            backgroundColor: '#F5F2EE', 
            padding: '24px', 
            borderRadius: '10px',
            borderLeft: '3px solid #9BA899',
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
          
          {/* Action Buttons */}
          <Section style={{ textAlign: 'center', marginTop: '36px' }}>
            <table style={{ margin: '0 auto', borderSpacing: '12px 0' }}>
              <tr>
                <td>
                  <Button
                    href={`mailto:${email}?subject=Re: Your inquiry to Swift Fit Pilates`}
                    style={{
                      backgroundColor: '#9BA899',
                      color: '#ffffff',
                      padding: '16px 32px',
                      borderRadius: '50px',
                      textDecoration: 'none',
                      fontSize: '15px',
                      fontWeight: '500',
                      display: 'inline-block',
                      letterSpacing: '0.5px'
                    }}
                  >
                    📧 Reply via Email
                  </Button>
                </td>
                <td>
                  <Button
                    href={`tel:${phone.replace(/\D/g, '')}`}
                    style={{
                      backgroundColor: '#ffffff',
                      color: '#9BA899',
                      padding: '16px 32px',
                      borderRadius: '50px',
                      textDecoration: 'none',
                      fontSize: '15px',
                      fontWeight: '500',
                      display: 'inline-block',
                      border: '2px solid #9BA899',
                      letterSpacing: '0.5px'
                    }}
                  >
                    📞 Call Directly
                  </Button>
                </td>
              </tr>
            </table>
          </Section>
          
          {/* Response Tips */}
          <Section style={{ 
            backgroundColor: '#FFF5F7', 
            padding: '20px', 
            borderRadius: '10px',
            marginTop: '36px',
            marginBottom: '32px'
          }}>
            <Text style={{ 
              color: '#7A736B', 
              fontSize: '14px', 
              lineHeight: '1.7', 
              margin: '0',
              textAlign: 'center',
              fontStyle: 'italic'
            }}>
              💡 <strong style={{ fontWeight: '500', color: '#5A5550' }}>Tip:</strong> Respond within 24 hours for best conversion. 
              Personalize your response and mention their specific inquiry.
            </Text>
          </Section>
          
          <Hr style={{ borderColor: '#B8AFA5', margin: '32px 0', opacity: 0.3 }} />
          
          {/* Studio Information */}
          <Section style={{ textAlign: 'center' }}>
            <Text style={{ 
              color: '#9BA899', 
              fontSize: '14px', 
              lineHeight: '1.8', 
              margin: '0'
            }}>
              <strong style={{ color: '#5A5550', fontWeight: '500' }}>Swift Fit Pilates & Wellness Studio</strong><br />
              2245 E Tioga Street<br />
              Philadelphia, PA 19134<br />
              <a href="mailto:swiftfitpws@gmail.com" style={{ color: '#9BA899', textDecoration: 'none' }}>
                swiftfitpws@gmail.com
              </a> · <a href="tel:2679390254" style={{ color: '#9BA899', textDecoration: 'none' }}>
                (267) 939-0254
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
            This is an automated admin notification from the pilates website.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};
