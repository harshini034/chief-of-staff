import { google } from 'googleapis';
import readline from 'readline';
import { readFileSync, existsSync } from 'fs';
import path from 'path';

// Helper to read .env.local manually
function getEnv(key) {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!existsSync(envPath)) return null;
  const content = readFileSync(envPath, 'utf8');
  const match = content.match(new RegExp(`^${key}=(.*)$`, 'm'));
  return match ? match[1].trim() : null;
}

const CLIENT_ID = getEnv('GMAIL_CLIENT_ID') || 'PASTE_YOUR_CLIENT_ID';
const CLIENT_SECRET = getEnv('GMAIL_CLIENT_SECRET') || 'PASTE_YOUR_CLIENT_SECRET';
const REDIRECT = getEnv('GMAIL_REDIRECT_URI') || 'http://localhost:3000/api/auth/callback';

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT);

const url = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/gmail.modify'],
  prompt: 'consent' // Force consent to ensure refresh token is returned
});

console.log('\n--- Chief of Staff: Gmail OAuth Setup ---');
console.log('\n1. Open this URL in your browser:\n');
console.log(url);
console.log('\n2. After you approve, you will be redirected to a URL that looks like:');
console.log('   http://localhost:3000/api/auth/callback?code=4/0Af...&scope=...');
console.log('\n3. Copy the "code" parameter from that URL.');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question('\nPaste the code here: ', async (code) => {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    console.log('\n✅ Your refresh token:');
    console.log(tokens.refresh_token);
    console.log('\nACTION: Paste this into GMAIL_REFRESH_TOKEN in your .env.local');
  } catch (error) {
    console.error('\n❌ Failed to get token:', error.message);
  } finally {
    rl.close();
  }
});
