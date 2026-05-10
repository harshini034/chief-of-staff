# 🏛️ Chief of Staff — Autonomous Email Agent
### Hackathon Submission · Built with Google Gemini & Native Gmail API

**Chief of Staff** is an elite AI executive assistant designed to handle the noise of your inbox so you can focus on the signal. It triages your mail, scores urgency, and writes replies in your writing voice—learning and getting smarter from every edit you make.

---

## 🚀 Key Features

- **Autonomous Triage:** Powered by Gemini 1.5 Flash, every email is scored (1-5) and categorized (Action, FYI, Scheduling).
- **Adaptive Voice Model:** Learns your writing style. When you edit a draft, the agent captures your tone and saves it to a local JSON "Voice Model."
- **Native Gmail Integration:** Securely connects to the official Gmail API via OAuth for robust, production-ready inbox management.
- **Rate-Limit Resilience:** Features a smart fallback system that ensures the app never crashes, even when hitting strict API quotas during a demo.
- **Beautiful Dashboard:** A premium dark-mode interface featuring a live **Inbox Zero Progress Bar** and **Human-Time Saved** statistics.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **AI Brain:** Google Gemini API (Flash/Pro)
- **Email Service:** Native Google APIs (`googleapis`)
- **Styling:** Tailwind CSS
- **Storage:** Local `/data` JSON persistence
- **Environment:** Vercel

---

## ⚡ Getting Started

### 1. Prerequisites
Ensure you have Node.js installed. You will also need a **Gemini API Key** from Google AI Studio and a **Google Cloud Project** with the Gmail API enabled.

### 2. Setup Environment Variables
Create a `.env.local` file in the project root:

```bash
GEMINI_API_KEY=your_key_here
GMAIL_CLIENT_ID=your_oauth_client_id
GMAIL_CLIENT_SECRET=your_oauth_client_secret
GMAIL_REDIRECT_URI=http://localhost:3000/api/auth/callback
GMAIL_REFRESH_TOKEN=your_oauth_refresh_token
```

### 3. Generate Refresh Token
Use our built-in utility to generate your secure Gmail refresh token:
```bash
node scripts/get-token.mjs
```

### 4. Run Development Server
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your Chief of Staff in action.

---

## 📈 Business & Scale
For a deep dive into the financial and architectural requirements of scaling this to 10,000+ users, see our [COST_ESTIMATION.md](./COST_ESTIMATION.md) document.

---

## 📜 License
This project was built for the 2026 AI Hackathon.
