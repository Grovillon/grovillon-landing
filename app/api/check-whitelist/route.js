import { NextResponse } from 'next/server';
import { getWhitelistEmails } from '@/lib/keys/getWhitelistEmails';

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ allowed: false, error: 'Missing email' });
    }

    const whitelist = await getWhitelistEmails();

    const allowed = whitelist.some(user => user.email === email.toLowerCase());

    return NextResponse.json({ allowed });
  } catch (error) {
    console.error('Server error in check-whitelist:', error); // 💥 Δείξε το ακριβές error
    return NextResponse.json(
      { allowed: false, error: error.message || 'Unknown server error' },
      { status: 500 }
    );
  }
}
