import * as React from 'react';
import { Html, Head, Preview, Body, Container, Section, Text, Heading, Hr } from '@react-email/components';

interface BookingPendingEmailProps {
  touristName: string;
  activityTitle: string;
  date: string;
  guests: number;
}

export const BookingPendingEmail: React.FC<BookingPendingEmailProps> = ({
  touristName,
  activityTitle,
  date,
  guests
}) => {
  return (
    <Html>
      <Head />
      <Preview>Your booking request for {activityTitle} is received!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Booking Received!</Heading>
          <Text style={text}>Hi {touristName},</Text>
          <Text style={text}>
            Your reservation request is received! Our team will review and send you a payment invoice shortly.
          </Text>
          
          <Section style={detailsSection}>
            <Text style={detailsText}><strong>Activity:</strong> {activityTitle}</Text>
            <Text style={detailsText}><strong>Date:</strong> {date}</Text>
            <Text style={detailsText}><strong>Guests:</strong> {guests} Pax</Text>
          </Section>

          <Hr style={hr} />
          
          <Text style={footer}>
            If you have any questions, simply reply to this email. We're excited to host you!
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '40px',
  margin: '0 0 20px',
  textAlign: 'center' as const,
};

const text = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 24px',
};

const detailsSection = {
  background: '#f4f4f5',
  padding: '16px 24px',
  margin: '24px',
  borderRadius: '8px',
};

const detailsText = {
  color: '#3f3f46',
  fontSize: '15px',
  lineHeight: '1.5',
  margin: '4px 0',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '16px 24px',
};

export default BookingPendingEmail;
