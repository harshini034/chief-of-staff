import { NextRequest, NextResponse } from 'next/server';
import { sendReply } from '@/lib/gmail';
import { saveEdit } from '@/lib/voice';

export async function POST(req: NextRequest) {
  try {
    const { email, draft, originalDraft, wasEdited } = await req.json();

    console.log(`API: Sending reply to ${email.from}...`);
    
    // If the user edited the draft, save it to the voice model to learn their style
    if (wasEdited && originalDraft && originalDraft !== draft) {
      console.log('API: Saving user edit to voice model...');
      saveEdit(originalDraft, draft);
    }

    await sendReply(email.threadId, email.from, email.subject, draft);

    return NextResponse.json({ success: true, message: 'Email sent successfully' });
  } catch (error: any) {
    console.error('Send API error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 500 });
  }
}
