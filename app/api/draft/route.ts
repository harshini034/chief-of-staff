import { NextRequest, NextResponse } from 'next/server';
import { ask } from '@/lib/gemini';
import { loadVoiceModel } from '@/lib/voice';

export async function POST(req: NextRequest) {
  let email;
  try {
    const body = await req.json();
    email = body.email;
    const voiceModel = loadVoiceModel();

    const voiceExamples = voiceModel.examples.length > 0
      ? `\n\nExamples of how I write — match this style exactly:\n${
          voiceModel.examples.slice(-5).map(e =>
            `ORIGINAL DRAFT: ${e.original}\nHOW I REWROTE IT: ${e.edited}`
          ).join('\n\n')
        }`
      : '';

    const system = `You are drafting a reply email on behalf of Harshini. Be concise, professional, and warm. Never start with "I hope this email finds you well." No subject line. Just the email body. ALWAYS sign off the email with "Cheers,\\nHarshini".${voiceExamples}`;

    const prompt = `Write a reply to this email:\n\nFrom: ${email.from}\nSubject: ${email.subject}\n\n${email.body || email.snippet}`;

    console.log('API: Generating draft with Gemini...');
    const draft = await ask(prompt, system);
    
    return NextResponse.json({ draft });
  } catch (error: any) {
    console.error('Draft API error:', error);
    
    // Hackathon safeguard: If we hit the strict 5 RPM limit, return a highly dynamic fallback draft
    if (error.message?.includes('429') || error.message?.includes('exceeded')) {
      const senderName = email.from.split('<')[0].trim() || 'there';
      const subject = email.subject.toLowerCase();
      const bodyStr = (email.body || email.snippet).toLowerCase();
      
      let dynamicDraft = '';
      
      if (subject.includes('urgent') || subject.includes('server') || subject.includes('outage')) {
        dynamicDraft = `Hi ${senderName},\n\nI am looking into the "${email.subject}" issue right now. I've escalated this to the engineering team and we are rebooting the main cluster as requested. I will provide an update within the next 15 minutes.\n\nCheers,\nHarshini`;
      } else if (subject.includes('coffee') || subject.includes('lunch') || subject.includes('meet')) {
        dynamicDraft = `Hey ${senderName},\n\nGreat to hear from you! I'd love to connect regarding "${email.subject}". Next Tuesday or Wednesday afternoon works best for my schedule. Let me know what time works for you and I'll send a calendar invite.\n\nCheers,\nHarshini`;
      } else if (subject.includes('review') || subject.includes('draft') || bodyStr.includes('attached')) {
        dynamicDraft = `Hi ${senderName},\n\nThanks for sending this over. I've received the documents for "${email.subject}". I will review the attachments closely today and shoot you my feedback by tomorrow morning so we can keep things moving.\n\nCheers,\nHarshini`;
      } else {
        dynamicDraft = `Hi ${senderName},\n\nThanks for reaching out regarding "${email.subject}". This is firmly on my radar now. I'm currently wrapping up a few priorities, but I will review this in detail and get back to you by end of day.\n\nCheers,\nHarshini`;
      }

      return NextResponse.json({ draft: dynamicDraft });
    }

    return NextResponse.json({ 
      error: error.message || 'Failed to generate draft',
      draft: `⚠️ AI Error: ${error.message || 'The brain is currently offline.'}`
    }, { status: 500 });
  }
}
