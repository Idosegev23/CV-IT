import { NextResponse } from 'next/server';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

export async function POST(request: Request) {
  try {
    const clientData = await request.json();
    
    if (!clientData.name || !clientData.email || !clientData.phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await sendWhatsAppMessage(clientData);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error);
    return NextResponse.json(
      { error: 'Failed to send WhatsApp message' },
      { status: 500 }
    );
  }
} 