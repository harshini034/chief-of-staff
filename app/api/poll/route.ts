import { NextResponse } from 'next/server';
import { fetchUnreadEmails, sendReply } from '@/lib/gmail';
import { triageEmail } from '@/lib/triage';
import { ask } from '@/lib/gemini';
import { loadVoiceModel } from '@/lib/voice';

export async function GET() {
  try {
    console.log('AGENT: Starting autonomous polling loop (Gemini + Gmail API)...');
    
    const emails = await fetchUnreadEmails(10);
    const scored = await Promise.all(emails.map(triageEmail));

    const autoHandled: string[] = [];

    for (const email of scored) {
      // Only fully auto-send routine, low-urgency mail
      if (email.category === 'auto-handle' && email.urgency <= 2) {
        console.log(`AGENT: Auto-handling routine email from ${email.from}`);
        
        const voiceModel = loadVoiceModel();
        const styleHint = voiceModel.examples.length > 0
          ? `Write in this style: ${voiceModel.examples.slice(-3).map(e => e.edited).join(' | ')}`
          : 'Write concisely and professionally.';

        const draft = await ask(
          `Write a brief reply to:\nFrom: ${email.from}\nSubject: ${email.subject}\n\n${email.body || email.snippet}`,
          `You are an executive assistant. ${styleHint} Just the email body, no subject line.`
        );

        await sendReply(email.threadId, email.from, email.subject, draft);
        autoHandled.push(email.id);
      }
    }

    const results = {
      processed: scored.length,
      autoHandled: autoHandled.length,
      queued: scored.filter(e => e.category === 'queue').length,
      escalated: scored.filter(e => e.category === 'escalate').length
    };

    console.log('AGENT: Polling loop complete.', results);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results
    });
  } catch (error: any) {
    console.error('AGENT: Polling loop failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
