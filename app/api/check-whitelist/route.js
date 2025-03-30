import { NextResponse } from 'next/server';
import { getWhitelistEmails } from '@/lib/keys/getWhitelistEmails';

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ allowed: false, error: 'Missing email' });
    }

    const whitelist = await getWhitelistEmails();

    const allowed = whitelist.includes(email.toLowerCase());

    return NextResponse.json({ allowed });
  } catch (error) {
    console.error('Error in check-whitelist API:', error);
    return NextResponse.json({ allowed: false, error: 'Server error' }, { status: 500 });
  }
}
