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

interface PilatesPaymentConfirmationProps {
  studentName: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentDate: string;
  purchaseType: 'package' | 'membership' | 'single_class';
  packageName?: string;
  creditsTotal?: number;
  expiresAt?: string;
  transactionId?: string;
}

export const PilatesPaymentConfirmation = ({
  studentName,
  amount,
  currency,
  paymentMethod,
  paymentDate,
  purchaseType,
  packageName,
  creditsTotal,
  expiresAt,
  transactionId,
}: PilatesPaymentConfirmationProps) => {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getPurchaseTypeLabel = () => {
    switch (purchaseType) {
      case 'package':
        return 'Class Package';
      case 'membership':
        return 'Membership';
      case 'single_class':
        return 'Single Class';
      default:
        return 'Purchase';
    }
  };

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
      <Preview>Payment received - {formatCurrency(amount, currency)} for Swift Fit Pilates</Preview>
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
          
          {/* Success Banner */}
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
              ✓ Payment Confirmed
            </Text>
            <Text style={{ color: '#7A736B', margin: '0', fontSize: '15px', lineHeight: '1.6' }}>
              Thank you, {studentName}! Your payment has been processed successfully.
            </Text>
          </Section>
          
          {/* Payment Summary */}
          <Heading style={{ 
            color: '#5A5550', 
            fontSize: '24px', 
            marginBottom: '24px', 
            marginTop: '32px',
            fontWeight: '400',
            letterSpacing: '0.5px'
          }}>
            Payment Summary
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
                    Amount Charged
                  </Text>
                  <Text style={{ 
                    margin: '4px 0 0 0', 
                    color: '#5A5550', 
                    fontSize: '28px', 
                    fontWeight: '600'
                  }}>
                    {formatCurrency(amount, currency)}
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
                    Purchase Type
                  </Text>
                  <Text style={{ 
                    margin: '4px 0 0 0', 
                    color: '#5A5550', 
                    fontSize: '16px', 
                    fontWeight: '500'
                  }}>
                    {getPurchaseTypeLabel()}
                  </Text>
                </td>
              </tr>
              {packageName && (
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
                      Package Name
                    </Text>
                    <Text style={{ 
                      margin: '4px 0 0 0', 
                      color: '#5A5550', 
                      fontSize: '16px', 
                      fontWeight: '500'
                    }}>
                      {packageName}
                    </Text>
                  </td>
                </tr>
              )}
              {creditsTotal && creditsTotal > 0 && (
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
                      Credits Added
                    </Text>
                    <Text style={{ 
                      margin: '4px 0 0 0', 
                      color: '#9BA899', 
                      fontSize: '18px', 
                      fontWeight: '600'
                    }}>
                      {creditsTotal} credit{creditsTotal > 1 ? 's' : ''}
                    </Text>
                  </td>
                </tr>
              )}
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
                    Payment Method
                  </Text>
                  <Text style={{ 
                    margin: '4px 0 0 0', 
                    color: '#5A5550', 
                    fontSize: '16px', 
                    fontWeight: '500'
                  }}>
                    {paymentMethod === 'square' ? 'Credit Card' : paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}
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
                    Payment Date
                  </Text>
                  <Text style={{ 
                    margin: '4px 0 0 0', 
                    color: '#5A5550', 
                    fontSize: '16px', 
                    fontWeight: '500'
                  }}>
                    {paymentDate}
                  </Text>
                </td>
              </tr>
              {expiresAt && (
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
                      Valid Until
                    </Text>
                    <Text style={{ 
                      margin: '4px 0 0 0', 
                      color: '#5A5550', 
                      fontSize: '16px', 
                      fontWeight: '500'
                    }}>
                      {expiresAt}
                    </Text>
                  </td>
                </tr>
              )}
              {transactionId && (
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
                      Transaction ID
                    </Text>
                    <Text style={{ 
                      margin: '4px 0 0 0', 
                      color: '#7A736B', 
                      fontSize: '14px', 
                      fontFamily: 'monospace'
                    }}>
                      {transactionId}
                    </Text>
                  </td>
                </tr>
              )}
            </table>
          </Section>
          
          {/* Ready to Book */}
          <Section style={{ 
            marginTop: '24px', 
            backgroundColor: '#E8B4B8', 
            padding: '20px', 
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <Text style={{ color: '#5A5550', fontSize: '15px', lineHeight: '1.6', margin: '0' }}>
              <strong>Ready to Book?</strong><br />
              Your credits have been added to your account. Book your next class now!
            </Text>
          </Section>
          
          {/* CTA Buttons */}
          <Section style={{ marginTop: '32px', textAlign: 'center' }}>
            <Button
              href="https://swiftfitpws.com/student"
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
              Book a Class
            </Button>
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
              <strong style={{ color: '#5A5550' }}>Questions about your purchase?</strong><br />
              Contact us at{' '}
              <a href="tel:2679390254" style={{ color: '#9BA899', textDecoration: 'none' }}>(267) 939-0254</a>
              {' '}or email{' '}
              <a href="mailto:swiftfitpws@gmail.com" style={{ color: '#9BA899', textDecoration: 'none' }}>swiftfitpws@gmail.com</a>
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
            © 2025 Swift Fit Pilates & Wellness Studio. All rights reserved.<br />
            Keep this email for your records.
          </Text>
          
          <Text style={{ 
            color: '#B8AFA5', 
            fontSize: '11px', 
            marginTop: '16px', 
            textAlign: 'center'
          }}>
            <a href="https://swiftfitpws.com/student" style={{ color: '#9BA899', textDecoration: 'underline' }}>
              Manage notification preferences
            </a>
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

