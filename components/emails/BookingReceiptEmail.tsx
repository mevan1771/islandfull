import * as React from 'react';
import { Html, Head, Preview, Body, Container, Section, Text, Heading, Hr, Img } from '@react-email/components';

interface BookingReceiptEmailProps {
  touristName: string;
  activityTitle: string;
  date: string;
  guests: number;
  qrCodeUrl: string;
  imageUrl?: string;
}

export const BookingReceiptEmail: React.FC<BookingReceiptEmailProps> = ({
  touristName,
  activityTitle,
  date,
  guests,
  qrCodeUrl,
  imageUrl
}) => {
  const isVideo = imageUrl?.match(/\.(mp4|webm|mov)$/i);
  const finalImageUrl = isVideo 
    ? 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80' 
    : imageUrl;
  return (
    <Html>
      <Head />
      <Preview>Your ticket for {activityTitle} is confirmed!</Preview>
      <Body style={main}>
        <Container style={container}>
          {finalImageUrl && (
            <img 
              src={finalImageUrl} 
              alt={activityTitle} 
              width="100%"
              height="120"
              style={heroImage} 
            />
          )}
          <Heading style={h1}>Your Ticket</Heading>
          <Text style={text}>
            Hi {touristName}, you're all set! Present this pass to your guide.
          </Text>
          
          <Section style={detailsSection}>
            <Text style={detailsText}><strong>Activity:</strong> {activityTitle}</Text>
            <Text style={detailsText}><strong>Date:</strong> {date}</Text>
            <Text style={detailsText}><strong>Guests:</strong> {guests} Pax</Text>

            <Section style={qrSection}>
              <img src={qrCodeUrl} width="160" height="160" alt="Booking QR Code" style={qrCode} />
            </Section>
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
  padding: '0 0 24px',
  marginBottom: '24px',
  width: '100%',
  maxWidth: '600px',
  borderRadius: '8px',
  overflow: 'hidden',
};

const heroImage = {
  width: '100%',
  height: '120px',
  objectFit: 'cover' as const,
  display: 'block',
};

const h1 = {
  color: '#333',
  fontSize: '20px',
  fontWeight: '600',
  lineHeight: '28px',
  margin: '16px 0 8px',
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
  margin: '16px auto',
  width: '85%',
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
