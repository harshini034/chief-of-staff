import { NextRequest, NextResponse } from 'next/server';
import { triageEmail } from '@/lib/triage';

export async function POST(req: NextRequest) {
  try {
    const email = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email data is required' }, { status: 400 });
    }
    
    const scored = await triageEmail(email);
    return NextResponse.json({ scored });
  } catch (error: any) {
    console.error('Triage API error:', error);
    return NextResponse.json({ error: error.message || 'Failed to triage email' }, { status: 500 });
  }
}
