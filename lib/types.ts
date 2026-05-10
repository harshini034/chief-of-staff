export interface Email {
  id: string;
  threadId: string;
  from: string;
  subject: string;
  body: string;
  date: string;
  snippet: string;
}

// Placeholder for future scoring – will be extended on Day 2.
export interface ScoredEmail extends Email {
  urgency: 1 | 2 | 3 | 4 | 5;
  senderRank: 'vip' | 'known' | 'unknown';
  intent: 'question' | 'action' | 'fyi' | 'scheduling' | 'sales' | 'other';
  category: 'auto-handle' | 'queue' | 'escalate';
  draft?: string;
  status: 'pending' | 'approved' | 'rejected' | 'sent';
}
