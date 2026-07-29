import { Resend } from 'resend';
import { BookingPendingEmail } from '@/components/emails/BookingPendingEmail';
import { BookingReceiptEmail } from '@/components/emails/BookingReceiptEmail';
import React from 'react';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendPendingEmailProps {
  toEmail: string;
  touristName: string;
  activityTitle: string;
  date: string;
  guests: number;
}

export async function sendPendingEmail(props: SendPendingEmailProps) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'IslandFull <bookings@islandfull.com>',
      to: [props.toEmail],
      subject: `Booking Request Received: ${props.activityTitle}`,
      react: React.createElement(BookingPendingEmail, {
        touristName: props.touristName,
        activityTitle: props.activityTitle,
        date: props.date,
        guests: props.guests,
      }),
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("Failed to send pending email:", err);
    return { success: false, error: err.message };
  }
}

interface SendReceiptEmailProps {
  toEmail: string;
  touristName: string;
  activityTitle: string;
  date: string;
  guests: number;
  qrCodeDataUri: string;
}

export async function sendReceiptEmail(props: SendReceiptEmailProps) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'IslandFull <tickets@islandfull.com>',
      to: [props.toEmail],
      subject: `Your Tickets: ${props.activityTitle}`,
      react: React.createElement(BookingReceiptEmail, {
        touristName: props.touristName,
        activityTitle: props.activityTitle,
        date: props.date,
        guests: props.guests,
        qrCodeDataUri: props.qrCodeDataUri,
      }),
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("Failed to send receipt email:", err);
    return { success: false, error: err.message };
  }
}
