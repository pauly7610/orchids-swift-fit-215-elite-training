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

interface PaymentConfirmationProps {
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

export const PaymentConfirmation = ({
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
}: PaymentConfirmationProps) => {
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
      <Preview>Payment received - {formatCurrency(amount, currency)} for SwiftFit 215</Preview>
      <Body style={{ backgroundColor: '#f4f4f4', fontFamily: 'Inter, Verdana, sans-serif' }}>
        <Container style={{ backgroundColor: '#ffffff', padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
          <Heading style={{ color: '#1a1a1a', fontSize: '32px', fontWeight: 'bold', marginBottom: '8px', fontFamily: 'Bebas Neue, Inter, sans-serif', letterSpacing: '1px' }}>
            SWIFTFIT 215
          </Heading>
          <Text style={{ color: '#FF6B35', fontSize: '14px', marginTop: '0', marginBottom: '32px' }}>
            Speed & Strength Training
          </Text>
          
          <Section style={{ backgroundColor: '#f0fdf4', padding: '20px', borderRadius: '8px', marginBottom: '24px', borderLeft: '4px solid #22c55e' }}>
            <Heading style={{ color: '#166534', fontSize: '20px', margin: '0 0 8px 0' }}>
              ✓ Payment Confirmed
            </Heading>
            <Text style={{ color: '#166534', margin: '0', fontSize: '14px' }}>
              Thank you, {studentName}! Your payment has been processed successfully.
            </Text>
          </Section>
          
          <Heading style={{ color: '#333', fontSize: '24px', marginBottom: '24px', marginTop: '32px' }}>
            Payment Summary
          </Heading>
          
          <Section style={{ backgroundColor: '#f9f9f9', padding: '24px', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tr>
                <td style={{ paddingBottom: '16px' }}>
                  <Text style={{ margin: '0', color: '#999', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Amount Charged</Text>
                  <Text style={{ margin: '4px 0 0 0', color: '#1a1a1a', fontSize: '28px', fontWeight: '700' }}>
                    {formatCurrency(amount, currency)}
                  </Text>
                </td>
              </tr>
              <tr>
                <td style={{ paddingBottom: '16px' }}>
                  <Text style={{ margin: '0', color: '#999', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Purchase Type</Text>
                  <Text style={{ margin: '4px 0 0 0', color: '#1a1a1a', fontSize: '16px', fontWeight: '500' }}>{getPurchaseTypeLabel()}</Text>
                </td>
              </tr>
              {packageName && (
                <tr>
                  <td style={{ paddingBottom: '16px' }}>
                    <Text style={{ margin: '0', color: '#999', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Package Name</Text>
                    <Text style={{ margin: '4px 0 0 0', color: '#1a1a1a', fontSize: '16px', fontWeight: '500' }}>{packageName}</Text>
                  </td>
                </tr>
              )}
              {creditsTotal && creditsTotal > 0 && (
                <tr>
                  <td style={{ paddingBottom: '16px' }}>
                    <Text style={{ margin: '0', color: '#999', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Credits Added</Text>
                    <Text style={{ margin: '4px 0 0 0', color: '#FF6B35', fontSize: '18px', fontWeight: '600' }}>
                      {creditsTotal} credit{creditsTotal > 1 ? 's' : ''}
                    </Text>
                  </td>
                </tr>
              )}
              <tr>
                <td style={{ paddingBottom: '16px' }}>
                  <Text style={{ margin: '0', color: '#999', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Payment Method</Text>
                  <Text style={{ margin: '4px 0 0 0', color: '#1a1a1a', fontSize: '16px', fontWeight: '500' }}>
                    {paymentMethod === 'square' ? 'Credit Card' : paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}
                  </Text>
                </td>
              </tr>
              <tr>
                <td style={{ paddingBottom: '16px' }}>
                  <Text style={{ margin: '0', color: '#999', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Payment Date</Text>
                  <Text style={{ margin: '4px 0 0 0', color: '#1a1a1a', fontSize: '16px', fontWeight: '500' }}>{paymentDate}</Text>
                </td>
              </tr>
              {expiresAt && (
                <tr>
                  <td style={{ paddingBottom: '16px' }}>
                    <Text style={{ margin: '0', color: '#999', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Valid Until</Text>
                    <Text style={{ margin: '4px 0 0 0', color: '#1a1a1a', fontSize: '16px', fontWeight: '500' }}>{expiresAt}</Text>
                  </td>
                </tr>
              )}
              {transactionId && (
                <tr>
                  <td>
                    <Text style={{ margin: '0', color: '#999', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Transaction ID</Text>
                    <Text style={{ margin: '4px 0 0 0', color: '#666', fontSize: '14px', fontFamily: 'monospace' }}>{transactionId}</Text>
                  </td>
                </tr>
              )}
            </table>
          </Section>
          
          <Section style={{ marginTop: '32px', backgroundColor: '#fff7ed', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #FF6B35' }}>
            <Text style={{ color: '#9a3412', fontSize: '14px', lineHeight: '1.6', margin: '0' }}>
              <strong>Ready to Book?</strong><br />
              Your credits have been added to your account. Log in to book your next class!
            </Text>
          </Section>
          
          <Section style={{ marginTop: '32px', textAlign: 'center' }}>
            <Button
              href="https://swiftfitpws.com/student"
              style={{
                backgroundColor: '#FF6B35',
                color: '#ffffff',
                padding: '14px 28px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: '600',
                display: 'inline-block',
                marginRight: '12px',
              }}
            >
              Book a Class
            </Button>
            <Button
              href="https://swiftfitpws.com/student/purchase"
              style={{
                backgroundColor: '#ffffff',
                color: '#1a1a1a',
                padding: '14px 28px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: '600',
                display: 'inline-block',
                border: '2px solid #e5e5e5',
              }}
            >
              View Packages
            </Button>
          </Section>
          
          <Hr style={{ borderColor: '#eee', margin: '32px 0' }} />
          
          <Section>
            <Text style={{ color: '#999', fontSize: '14px', lineHeight: '1.6', margin: '0' }}>
              <strong>Questions about your purchase?</strong><br />
              Contact us at <a href="tel:2679390254" style={{ color: '#FF6B35', textDecoration: 'none' }}>(267) 939-0254</a> or email <a href="mailto:swiftfitpws@gmail.com" style={{ color: '#FF6B35', textDecoration: 'none' }}>swiftfitpws@gmail.com</a>
            </Text>
          </Section>
          
          <Section style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #eee' }}>
            <Text style={{ color: '#999', fontSize: '14px', lineHeight: '1.6', margin: '0' }}>
              <strong>SwiftFit 215</strong><br />
              2245 E Tioga Street<br />
              Philadelphia, PA 19134
            </Text>
          </Section>
          
          <Text style={{ color: '#999', fontSize: '12px', marginTop: '32px', textAlign: 'center' }}>
            © 2025 SwiftFit 215. All rights reserved.<br />
            Keep this email for your records.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};
