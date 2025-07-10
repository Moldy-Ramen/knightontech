// pages/api/contact.js

import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).end('Method Not Allowed');

  const { name, email, message } = req.body;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: process.env.CONTACT_EMAIL, // contact@knightontech.com
      subject: `New Contact Message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    });
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Contact email error:', err);
    return res.status(500).json({ error: 'Failed to send message' });
  }
}
