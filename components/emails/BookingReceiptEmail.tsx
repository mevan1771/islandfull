import * as React from 'react';
import { Html, Head, Preview, Body, Container, Section, Text, Heading, Hr, Img } from '@react-email/components';

interface BookingReceiptEmailProps {
  touristName: string;
  activityTitle: string;
  date: string;
  guests: number;
  qrCodeUrl: string;
}

export const BookingReceiptEmail: React.FC<BookingReceiptEmailProps> = ({
  touristName,
  activityTitle,
  date,
  guests,
  qrCodeUrl
}) => {
  return (
    <Html>
      <Head />
      <Preview>Your ticket for {activityTitle} is confirmed!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Booking Confirmed!</Heading>
          <Text style={text}>
            Hi {touristName}, your reservation is confirmed! Please present this QR code to your guide upon arrival.
          </Text>
          
          <Section style={detailsSection}>
            <Text style={detailsText}><strong>Activity:</strong> {activityTitle}</Text>
            <Text style={detailsText}><strong>Date:</strong> {date}</Text>
            <Text style={detailsText}><strong>Guests:</strong> {guests} Pax</Text>
          </Section>

          <Section style={qrSection}>
            <Heading as="h2" style={qrHeading}>Your Entry Ticket</Heading>
            <img src={qrCodeUrl} width="200" height="200" alt="Booking QR Code" style={qrCode} />
          </Section>

          <Hr style={hr} />
          
          <Text style={footer}>
            If you need to make changes or have questions, simply reply to this email. Have a great time!
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
  padding: '12px 0 24px',
  marginBottom: '24px',
};

const h1 = {
  color: '#333',
  fontSize: '22px',
  fontWeight: '600',
  lineHeight: '32px',
  margin: '0 0 12px',
  textAlign: 'center' as const,
};

const text = {
  color: '#525f7f',
  fontSize: '15px',
  lineHeight: '22px',
  margin: '12px 24px',
  textAlign: 'center' as const,
};

const detailsSection = {
  background: '#f4f4f5',
  padding: '12px 24px',
  margin: '16px 24px',
  borderRadius: '8px',
};

const detailsText = {
  color: '#3f3f46',
  fontSize: '15px',
  lineHeight: '1.5',
  margin: '4px 0',
};

const qrSection = {
  textAlign: 'center' as const,
  margin: '16px 0',
};

const qrHeading = {
  color: '#333',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 12px',
  textAlign: 'center' as const,
};

const qrCode = {
  margin: '0 auto',
  display: 'block',
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
  textAlign: 'center' as const,
};

export default BookingReceiptEmail;
