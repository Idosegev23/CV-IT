import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(request: Request) {
  try {
    const { to, subject, html, errorId } = await request.json();

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
      headers: {
        'X-Error-ID': errorId
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to send error report email:', error);
    return NextResponse.json(
      { error: 'Failed to send error report' },
      { status: 500 }
    );
  }
} 