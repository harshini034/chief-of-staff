'use client';

import { useEffect, useState } from 'react';
import EmailCard from '@/components/EmailCard';
import ApprovalModal from '@/components/ApprovalModal';
import StatsRow from '@/components/StatsRow';
import InboxZeroBar from '@/components/InboxZeroBar';
import type { ScoredEmail } from '@/lib/types';

export default function Home() {
  const [emails, setEmails] = useState<ScoredEmail[]>([]);
  const [totalEmails, setTotalEmails] = useState(0);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modal State
  const [selectedEmail, setSelectedEmail] = useState<ScoredEmail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadAndScore();
  }, []);

  async function loadAndScore() {
    setLoading(true);
    try {
      const res = await fetch('/api/emails');
      if (!res.ok) throw new Error(`Failed to fetch emails: ${res.status}`);
      const { emails: raw } = await res.json();
      
      setTotalEmails(raw.length);

      const scored: ScoredEmail[] = [];
      for (const e of raw) {
        try {
          const triageRes = await fetch('/api/triage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(e),
          });
          if (!triageRes.ok) throw new Error('Triaging failed');
          const { scored: s } = await triageRes.json();
          scored.push(s);
        } catch (triageError) {
          console.error('Triage error for email:', e.id, triageError);
          scored.push({ ...e, urgency: 1, senderRank: 'unknown', intent: 'other', category: 'queue', status: 'pending' });
        }
      }
      setEmails(scored);
    } catch (e: any) {
      console.error(e);
      setError(e.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  const runAgent = async () => {
    setPolling(true);
    try {
      const res = await fetch('/api/poll');
      if (res.ok) {
        setSuccessMessage('Agent finished background processing cycle!');
        setTimeout(() => setSuccessMessage(null), 4000);
        await loadAndScore(); // Refresh list
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPolling(false);
    }
  };

  const handleSelectEmail = (email: ScoredEmail) => {
    setSelectedEmail(email);
    setIsModalOpen(true);
  };

  const handleSent = () => {
    setSuccessMessage('Reply sent successfully! Learning your voice...');
    setTimeout(() => setSuccessMessage(null), 4000);
    if (selectedEmail) {
      setEmails(prev => prev.filter(e => e.id !== selectedEmail.id));
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-gray-100">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-600 border-t-blue-500"></div>
          <div className="animate-pulse font-medium text-blue-400 text-lg">Agent thinking…</div>
          <p className="text-gray-500 text-sm">Triaging your inbox with Claude</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8 md:p-12">
      {/* Background decoration */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/5 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/5 blur-[120px]"></div>
      </div>

      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className={`h-3 w-3 rounded-full ${polling ? 'bg-blue-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`}></div>
            <span className={`text-xs font-bold uppercase tracking-[0.2em] ${polling ? 'text-blue-500' : 'text-emerald-500'}`}>
              {polling ? 'Agent Processing...' : 'System Online'}
            </span>
          </div>
          <h1 className="text-5xl font-black tracking-tight text-white">Chief of Staff</h1>
          <p className="mt-2 text-xl text-gray-400 font-medium italic opacity-70">"Handling the noise, so you can focus on the signal."</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={runAgent}
            disabled={polling}
            className="rounded-2xl bg-gray-800 px-6 py-3 text-sm font-bold text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/10 transition-all flex items-center gap-2"
          >
            {polling ? 'Working...' : '▶ Run Agent Now'}
          </button>
          <div className="rounded-2xl bg-gray-800/50 px-6 py-3 text-sm font-bold text-gray-200 border border-gray-700 backdrop-blur-md">
            {emails.length} Action Items
          </div>
        </div>
      </header>

      {/* Day 5 UI Polish */}
      <InboxZeroBar handled={totalEmails - emails.length} total={totalEmails} />
      <StatsRow />

      {successMessage && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold shadow-2xl animate-bounce border border-emerald-400/30">
          ✨ {successMessage}
        </div>
      )}

      {error && (
        <div className="mb-8 rounded-2xl border border-red-500/50 bg-red-900/10 p-6 text-center text-red-400">
          ⚠️ Connection issues. Showing cached/simulated items.
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {emails.map((email) => (
          <EmailCard 
            key={email.id} 
            email={email} 
            onSelect={handleSelectEmail}
          />
        ))}
      </div>
      
      {emails.length === 0 && (
        <div className="flex h-96 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-800 bg-gray-900/20 text-gray-500">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-gray-300">Inbox Zero</h3>
          <p className="mt-2">All routine matters have been handled.</p>
        </div>
      )}

      {selectedEmail && (
        <ApprovalModal
          email={selectedEmail}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSent={handleSent}
        />
      )}
    </div>
  );
}
