const { Resend } = require('resend');
require('dotenv').config({ path: '.env.local' });

const resend = new Resend(process.env.RESEND_API_KEY);

async function test() {
    try {
        const { data, error } = await resend.emails.send({
            from: 'IslandFull <bookings@islandfull.com>',
            to: ['mevan1771@gmail.com'],
            subject: 'Test Email',
            html: '<p>This is a test email.</p>',
        });

        if (error) {
            console.error('Resend error:', error);
        } else {
            console.log('Success:', data);
        }
    } catch (err) {
        console.error('Catch error:', err);
    }
}

test();
