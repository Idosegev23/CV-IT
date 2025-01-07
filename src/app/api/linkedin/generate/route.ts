import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  return NextResponse.json(
    { 
      error: 'בבנייה - שירות זה יהיה זמין בקרוב',
      status: 'maintenance'
    },
    { status: 503 }
  );
} 