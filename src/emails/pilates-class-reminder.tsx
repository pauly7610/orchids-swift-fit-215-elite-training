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

interface PilatesClassReminderProps {
  studentName: string;
  lastClassDate: string;
  daysSinceLastClass: number;
}

export const PilatesClassReminder = ({
  studentName,
  lastClassDate,
  daysSinceLastClass = 30,
}: PilatesClassReminderProps) => {
  return (
    <Html>
      <Head>
        <Font
          fontFamily="Cormorant"
          fallbackFontFamily="Georgia"
          webFont={{
            url: 'https://fonts.googleapis.com/css2?family=Cormorant:wght@400;600;700&display=swap',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>We miss you at Swift Fit Pilates! It's time to return to your practice.</Preview>
      <Body style={{ backgroundColor: '#FAF8F5', fontFamily: 'Cormorant, Georgia, serif' }}>
        <Container style={{ backgroundColor: '#ffffff', padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
          {/* Header with Logo Space */}
          <Section style={{ textAlign: 'center', marginBottom: '32px' }}>
            <Heading style={{ color: '#5A5550', fontSize: '36px', fontWeight: '400', marginBottom: '8px', fontFamily: 'Cormorant, Georgia, serif', letterSpacing: '2px' }}>
              Swift Fit
            </Heading>
            <Text style={{ color: '#9BA899', fontSize: '12px', marginTop: '0', marginBottom: '0', letterSpacing: '3px', textTransform: 'uppercase' }}>
              Pilates and Wellness Studio
            </Text>
          </Section>
          
          {/* Warm Pink Accent Section */}
          <Section style={{ backgroundColor: '#FFF5F7', padding: '24px', borderRadius: '12px', marginBottom: '32px', borderLeft: '4px solid #E8B4B8' }}>
            <Heading style={{ color: '#5A5550', fontSize: '24px', margin: '0 0 12px 0', fontWeight: '600' }}>
              We Miss You, {studentName}! 💕
            </Heading>
            <Text style={{ color: '#7A736B', margin: '0', fontSize: '16px', lineHeight: '1.6' }}>
              It's been {daysSinceLastClass} days since your last class on {lastClassDate}. Your mat is waiting for you.
            </Text>
          </Section>
          
          <Heading style={{ color: '#5A5550', fontSize: '28px', marginBottom: '16px', marginTop: '32px', fontWeight: '500' }}>
            Your Wellness Journey Awaits
          </Heading>
          
          <Text style={{ color: '#7A736B', fontSize: '16px', lineHeight: '1.8', marginBottom: '24px' }}>
            At Swift Fit, we believe in building healthy habits and nurturing the mind–body connection. 
            Whether you need strength, clarity, community, or peace—we're here for you.
          </Text>

          {/* Benefits Grid */}
          <Section style={{ backgroundColor: '#F5F2EE', padding: '24px', borderRadius: '8px', marginBottom: '32px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tr>
                <td style={{ paddingBottom: '16px', width: '50%', paddingRight: '12px' }}>
                  <Text style={{ margin: '0', color: '#9BA899', fontSize: '14px', fontWeight: '600' }}>✨ Reset & Recharge</Text>
                  <Text style={{ margin: '4px 0 0 0', color: '#7A736B', fontSize: '14px' }}>Find your center again</Text>
                </td>
                <td style={{ paddingBottom: '16px', width: '50%', paddingLeft: '12px' }}>
                  <Text style={{ margin: '0', color: '#9BA899', fontSize: '14px', fontWeight: '600' }}>💪 Build Strength</Text>
                  <Text style={{ margin: '4px 0 0 0', color: '#7A736B', fontSize: '14px' }}>Reconnect with your body</Text>
                </td>
              </tr>
              <tr>
                <td style={{ paddingTop: '8px', width: '50%', paddingRight: '12px' }}>
                  <Text style={{ margin: '0', color: '#9BA899', fontSize: '14px', fontWeight: '600' }}>🧘‍♀️ Find Peace</Text>
                  <Text style={{ margin: '4px 0 0 0', color: '#7A736B', fontSize: '14px' }}>Meditation & mindfulness</Text>
                </td>
                <td style={{ paddingTop: '8px', width: '50%', paddingLeft: '12px' }}>
                  <Text style={{ margin: '0', color: '#9BA899', fontSize: '14px', fontWeight: '600' }}>❤️ Join Community</Text>
                  <Text style={{ margin: '4px 0 0 0', color: '#7A736B', fontSize: '14px' }}>Supportive & welcoming</Text>
                </td>
              </tr>
            </table>
          </Section>
          
          {/* Special Offer */}
          <Section style={{ backgroundColor: '#E8B4B8', padding: '20px', borderRadius: '8px', marginBottom: '32px', textAlign: 'center' }}>
            <Text style={{ color: '#5A5550', fontSize: '16px', margin: '0 0 8px 0', fontWeight: '600' }}>
              🎉 Welcome Back Offer
            </Text>
            <Text style={{ color: '#5A5550', fontSize: '14px', margin: '0' }}>
              Book your return class this week and receive 10% off your next package purchase!
            </Text>
          </Section>

          <Section style={{ marginTop: '32px', textAlign: 'center' }}>
            <Button
              href="https://swiftfit215.com/pilates/schedule"
              style={{
                backgroundColor: '#9BA899',
                color: '#ffffff',
                padding: '16px 32px',
                borderRadius: '50px',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: '600',
                display: 'inline-block',
              }}
            >
              Book Your Return Class
            </Button>
          </Section>

          <Text style={{ color: '#7A736B', fontSize: '14px', lineHeight: '1.6', marginTop: '24px', textAlign: 'center', fontStyle: 'italic' }}>
            "It's not about being perfect. It's about showing up, moving with purpose, and becoming the best version of yourself, one day at a time."
          </Text>
          
          <Hr style={{ borderColor: '#E5E5E5', margin: '32px 0' }} />
          
          <Section>
            <Heading style={{ color: '#5A5550', fontSize: '20px', marginBottom: '16px' }}>
              What's New at Swift Fit
            </Heading>
            <ul style={{ color: '#7A736B', fontSize: '14px', lineHeight: '1.8', paddingLeft: '20px' }}>
              <li>New morning meditation sessions starting at 7:00 AM</li>
              <li>Dance fitness classes added to the schedule</li>
              <li>Extended weekend hours for your convenience</li>
              <li>Special wellness workshops every month</li>
            </ul>
          </Section>
          
          <Hr style={{ borderColor: '#E5E5E5', margin: '32px 0' }} />
          
          <Section>
            <Text style={{ color: '#7A736B', fontSize: '14px', lineHeight: '1.6', margin: '0' }}>
              <strong style={{ color: '#5A5550' }}>Questions or need help booking?</strong><br />
              Email us at <a href="mailto:swiftfitpws@gmail.com" style={{ color: '#9BA899', textDecoration: 'none' }}>swiftfitpws@gmail.com</a> or call{' '}
              <a href="tel:2679390254" style={{ color: '#9BA899', textDecoration: 'none' }}>(267) 939-0254</a>
            </Text>
          </Section>
          
          <Section style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #E5E5E5' }}>
            <Text style={{ color: '#9BA899', fontSize: '14px', lineHeight: '1.6', margin: '0' }}>
              <strong style={{ color: '#5A5550' }}>Swift Fit Pilates + Wellness Studio</strong><br />
              2245 E Tioga Street<br />
              Philadelphia, PA 19134
            </Text>
          </Section>
          
          <Text style={{ color: '#B8AFA5', fontSize: '12px', marginTop: '24px', textAlign: 'center' }}>
            © 2025 Swift Fit Pilates + Wellness Studio. All rights reserved.<br />
            Part of the SwiftFit 215 family
          </Text>

          <Text style={{ color: '#B8AFA5', fontSize: '11px', marginTop: '16px', textAlign: 'center' }}>
            Don't want to receive these reminders?{' '}
            <a href="https://swiftfit215.com/pilates" style={{ color: '#9BA899', textDecoration: 'underline' }}>
              Update your preferences
            </a>
          </Text>
        </Container>
      </Body>
    </Html>
  );
};
