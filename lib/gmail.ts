import { google } from 'googleapis';
import type { Email } from './types';

function getAuth() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI
  );

  if (process.env.GMAIL_REFRESH_TOKEN) {
    oauth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });
  }

  return oauth2Client;
}

export async function fetchUnreadEmails(maxResults = 20): Promise<Email[]> {
  // If no credentials, use mock data for demo
  if (!process.env.GMAIL_CLIENT_ID || !process.env.GMAIL_REFRESH_TOKEN) {
    console.warn('Gmail credentials missing. Using mock data.');
    return getMockEmails();
  }

  try {
    const gmail = google.gmail({ version: 'v1', auth: getAuth() });

    const list = await gmail.users.messages.list({
      userId: 'me',
      q: 'is:unread',
      maxResults
    });

    const messages = list.data.messages || [];

    const emails = await Promise.all(messages.map(async (msg) => {
      const full = await gmail.users.messages.get({ userId: 'me', id: msg.id! });
      const headers = full.data.payload?.headers || [];
      const getHeader = (name: string) => headers.find(h => h.name === name)?.value || '';

      let body = '';
      const parts = full.data.payload?.parts || [];
      // Look for plain text part
      const findText = (p: any): string | null => {
        if (p.mimeType === 'text/plain' && p.body?.data) return p.body.data;
        if (p.parts) {
          for (const sub of p.parts) {
            const res = findText(sub);
            if (res) return res;
          }
        }
        return null;
      };

      const rawBody = findText(full.data.payload || {});
      if (rawBody) {
        body = Buffer.from(rawBody, 'base64').toString('utf8').slice(0, 500);
      }

      return {
        id: msg.id!,
        threadId: msg.threadId!,
        from: getHeader('From'),
        subject: getHeader('Subject'),
        date: getHeader('Date'),
        snippet: full.data.snippet || '',
        body
      };
    }));

    return emails;
  } catch (error) {
    console.error('Failed to fetch from Gmail API:', error);
    return getMockEmails();
  }
}

export async function sendReply(threadId: string, to: string, subject: string, body: string) {
  if (!process.env.GMAIL_CLIENT_ID) {
    console.log('Simulating send (No Gmail credentials):', { to, subject, body });
    return;
  }

  const gmail = google.gmail({ version: 'v1', auth: getAuth() });

  const message = [
    `To: ${to}`,
    `Subject: Re: ${subject}`,
    `In-Reply-To: ${threadId}`,
    '',
    body
  ].join('\n');

  const encoded = Buffer.from(message).toString('base64url');

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: encoded, threadId }
  });
}

function getMockEmails(): Email[] {
  return [
    {
      id: '1',
      threadId: 't1',
      from: 'Sarah Chen <sarah.c@techcorp.com>',
      subject: 'Urgent: Q2 Strategy Review Session',
      date: new Date().toISOString(),
      snippet: 'Hi, we need to finalize the Q2 strategy deck by tomorrow morning. Can you review the attached draft and let me know your thoughts?',
      body: 'Hi, we need to finalize the Q2 strategy deck by tomorrow morning. Can you review the attached draft and let me know your thoughts?'
    },
    {
      id: '2',
      threadId: 't2',
      from: 'GitHub <noreply@github.com>',
      subject: '[GitHub] Security alert for chief-of-staff repository',
      date: new Date(Date.now() - 3600000).toISOString(),
      snippet: 'We found a high severity security vulnerability in one of your dependencies.',
      body: 'We found a high severity security vulnerability in one of your dependencies.'
    },
    {
      id: '3',
      threadId: 't3',
      from: 'Alex Rivera <alex@designly.io>',
      subject: 'Re: Design System Update',
      date: new Date(Date.now() - 86400000).toISOString(),
      snippet: 'The new icons are ready for review. Take a look at the Figma link when you have a moment.',
      body: 'The new icons are ready for review. Take a look at the Figma link when you have a moment.'
    }
  ];
}
