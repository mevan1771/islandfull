import { Resend } from 'resend';
import { BookingPendingEmail } from '@/components/emails/BookingPendingEmail';
import { BookingReceiptEmail } from '@/components/emails/BookingReceiptEmail';
import React from 'react';
import { render } from '@react-email/components';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendPendingEmailProps {
  toEmail: string;
  touristName: string;
  activityTitle: string;
  date: string;
  guests: number;
  imageUrl?: string;
  paymentUrl?: string;
}

export async function sendPendingEmail(props: SendPendingEmailProps) {
  try {
    const htmlString = await render(React.createElement(BookingPendingEmail, {
      touristName: props.touristName,
      activityTitle: props.activityTitle,
      date: props.date,
      guests: props.guests,
      imageUrl: props.imageUrl,
      paymentUrl: props.paymentUrl,
    }));

    const { data, error } = await resend.emails.send({
      from: 'IslandFull <bookings@islandfull.com>',
      replyTo: 'islandfull@gmail.com',
      to: [props.toEmail],
      subject: `Booking Request Received: ${props.activityTitle}`,
      html: htmlString,
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
  qrCodeUrl: string;
  imageUrl?: string;
}

export async function sendReceiptEmail(props: SendReceiptEmailProps) {
  try {
    const htmlString = await render(React.createElement(BookingReceiptEmail, {
      touristName: props.touristName,
      activityTitle: props.activityTitle,
      date: props.date,
      guests: props.guests,
      qrCodeUrl: props.qrCodeUrl,
      imageUrl: props.imageUrl,
    }));

    const { data, error } = await resend.emails.send({
      from: 'IslandFull <bookings@islandfull.com>',
      replyTo: 'islandfull@gmail.com',
      to: [props.toEmail],
      subject: `Your Tickets: ${props.activityTitle}`,
      html: htmlString,
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

interface SendHostEmailProps {
  toEmail: string;
  hostName: string;
  touristName: string;
  activityTitle: string;
  date: string;
  guests: number;
  totalPayout: number;
}

export async function sendHostEmail(props: SendHostEmailProps) {
  try {
    const htmlString = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Booking Received!</h2>
        <p>Hi ${props.hostName},</p>
        <p>You have a new booking for <strong>${props.activityTitle}</strong>.</p>
        <ul>
          <li><strong>Date:</strong> ${props.date}</li>
          <li><strong>Guests:</strong> ${props.guests}</li>
          <li><strong>Tourist Name:</strong> ${props.touristName}</li>
          <li><strong>Expected Payout:</strong> $${props.totalPayout.toFixed(2)}</li>
        </ul>
        <p>Please check your host dashboard for more details.</p>
        <p>Best,<br>IslandFull Team</p>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: 'IslandFull <bookings@islandfull.com>',
      replyTo: 'islandfull@gmail.com',
      to: [props.toEmail],
      subject: `New Booking: ${props.activityTitle}`,
      html: htmlString,
    });

    if (error) {
      console.error("Resend host email error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("Failed to send host email:", err);
    return { success: false, error: err.message };
  }
}
