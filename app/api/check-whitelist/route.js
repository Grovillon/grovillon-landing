import { NextResponse } from 'next/server';
import { getWhitelistData } from '@/lib/keys/getWhitelistData';

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ allowed: false, error: 'Missing credentials' });
    }

    const whitelist = await getWhitelistData();

    console.log('🔍 WHITELIST DEBUG:', whitelist); // ✅ Εδώ βλέπεις τι φορτώνεται

    const isAllowed = whitelist.some(
      (user) =>
        user.email === email.toLowerCase() && user.password === password
    );

    return NextResponse.json({ allowed: isAllowed });
  } catch (error) {
    console.error('Error in check-whitelist API:', error);
    return NextResponse.json({ allowed: false, error: 'Server error' }, { status: 500 });
  }
}
