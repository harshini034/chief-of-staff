import { NextResponse } from 'next/server';
import { fetchUnreadEmails } from '@/lib/gmail';
import { triageEmail, simulateTriage } from '@/lib/triage';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('API: Fetching and triaging emails...');
    // Fetch 15 emails for a full dashboard experience
    const emails = await fetchUnreadEmails(15);

    // To protect your free tier limits (5 RPM), only the first 3 go to Gemini.
    // The rest are instantly handled locally so you have a full inbox without crashing.
    const scored = await Promise.all(
      emails.map((email, index) => {
        if (index < 3) {
          return triageEmail(email); // Gemini AI (uses 3 out of 5 quota)
        } else {
          return Promise.resolve(simulateTriage(email)); // Instant local fallback (uses 0 quota)
        }
      })
    );

    console.log(`API: Successfully processed ${scored.length} emails.`);
    return NextResponse.json({ emails: scored });
  } catch (error: any) {
    console.error('API Error [emails]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
