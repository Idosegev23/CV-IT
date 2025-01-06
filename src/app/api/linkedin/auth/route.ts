import { NextResponse } from 'next/server';

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/linkedin/callback`;

const LINKEDIN_AUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization';
const SCOPE = 'r_liteprofile r_emailaddress w_member_social';

export async function GET(req: Request) {
  const state = Math.random().toString(36).substring(7);
  
  const authUrl = `${LINKEDIN_AUTH_URL}?` + new URLSearchParams({
    response_type: 'code',
    client_id: LINKEDIN_CLIENT_ID!,
    redirect_uri: REDIRECT_URI,
    state,
    scope: SCOPE
  });

  return NextResponse.json({ authUrl });
} 