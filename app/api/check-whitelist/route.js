import { NextResponse } from 'next/server';
import { getWhitelistEmails } from '@/lib/keys/getWhitelistEmails';

export async function POST(req) {
  try {
    const { email } = await req.json();
    console.log('✅ Received email:', email);

    if (!email) {
      console.warn('⚠️ Missing email in request');
      return NextResponse.json({ allowed: false, error: 'Missing email' });
    }

    const whitelist = await getWhitelistEmails();
    console.log('📋 Whitelist loaded:', whitelist);

    const allowed = whitelist.some(user => user.email === email.toLowerCase());
    console.log('✅ Email allowed:', allowed);

    return NextResponse.json({ allowed });
  } catch (error) {
    console.error('❌ Error in check-whitelist API:', error.message, error.stack);
    return NextResponse.json({ allowed: false, error: 'Server error' }, { status: 500 });
  }
}
