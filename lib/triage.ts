import { ask } from './gemini';
import { Email, ScoredEmail } from './types';

const TRIAGE_SYSTEM = `You are an elite executive assistant. Score this email and decide how to handle it.

Return ONLY a valid JSON object — no markdown fences, no explanation, just raw JSON:
{
  "urgency": <number 1-5>,
  "senderRank": "vip|known|unknown",
  "intent": "question|action|fyi|scheduling|sales|other",
  "category": "auto-handle|queue|escalate",
  "reasoning": "one sentence max"
}

Urgency scale:
- 5: time-sensitive, VIP sender, needs same-day action
- 4: important, needs reply within 24h
- 3: normal business email
- 2: informational, no reply needed soon
- 1: newsletters, notifications, automated mail

Category:
- auto-handle: delivery notifications, scheduling confirmations, newsletter unsubs, FAQ replies
- queue: needs real reply, not urgent — draft and wait for human approval
- escalate: sensitive, legal, financial, or from a very important person`;

export async function triageEmail(email: Email): Promise<ScoredEmail> {
  const prompt = `From: ${email.from}\nSubject: ${email.subject}\n\n${email.body || email.snippet}`;

  try {
    let raw = await ask(prompt, TRIAGE_SYSTEM);
    raw = raw.replace(/```json|```/g, '').trim();

    let score;
    try {
      score = JSON.parse(raw);
    } catch {
      // Retry once with more explicit instructions if JSON fails
      raw = await ask(prompt + '\n\nReturn ONLY the JSON object. No markdown, no explanation.', TRIAGE_SYSTEM);
      score = JSON.parse(raw.replace(/```json|```/g, '').trim());
    }

    return { ...email, ...score, status: 'pending' };
  } catch (error) {
    console.error('Gemini triage failed, using fallback:', error);
    return simulateTriage(email);
  }
}

export function simulateTriage(email: Email): ScoredEmail {
  // Simple heuristic triage for demo purposes
  let urgency: 1 | 2 | 3 | 4 | 5 = 1;
  let category: 'auto-handle' | 'queue' | 'escalate' = 'queue';
  let senderRank: 'vip' | 'known' | 'unknown' = 'unknown';
  let intent: 'question' | 'action' | 'fyi' | 'scheduling' | 'sales' | 'other' = 'other';

  const lowerSubject = email.subject.toLowerCase();
  if (lowerSubject.includes('urgent') || lowerSubject.includes('immediately')) {
    urgency = 5;
    category = 'escalate';
  } else if (lowerSubject.includes('review') || lowerSubject.includes('draft')) {
    urgency = 3;
    intent = 'action';
  } else if (lowerSubject.includes('security') || lowerSubject.includes('alert')) {
    urgency = 4;
    category = 'escalate';
  }

  return {
    ...email,
    urgency,
    category,
    senderRank,
    intent,
    reasoning: 'Heuristic fallback applied.',
    status: 'pending'
  };
}
