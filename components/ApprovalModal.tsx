'use client';

import { useState, useEffect } from 'react';
import { ScoredEmail } from '@/lib/types';

type Props = {
  email: ScoredEmail;
  isOpen: boolean;
  onClose: () => void;
  onSent: () => void;
};

export default function ApprovalModal({ email, isOpen, onClose, onSent }: Props) {
  const [draft, setDraft] = useState('');
  const [originalDraft, setOriginalDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadDraft();
    }
  }, [isOpen, email]);

  async function loadDraft() {
    setLoading(true);
    try {
      const res = await fetch('/api/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.draft) {
        setDraft(data.draft);
        setOriginalDraft(data.draft);
      } else if (data.error) {
        setDraft(`⚠️ Error: ${data.error}`);
      }
    } catch (e: any) {
      console.error('Failed to load draft:', e);
      setDraft('⚠️ Connection failed. Please check your terminal for details.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSend() {
    setSending(true);
    try {
      const res = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          draft: draft,
          originalDraft: originalDraft,
          wasEdited: draft !== originalDraft,
        }),
      });
      if (res.ok) {
        onSent();
        onClose();
      }
    } catch (e) {
      console.error('Failed to send:', e);
    } finally {
      setSending(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity">
      <div className="relative w-full max-w-5xl h-[80vh] overflow-hidden rounded-3xl border border-gray-700 bg-gray-900 shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-800 flex items-center justify-between bg-gray-900/50">
          <div>
            <h2 className="text-xl font-bold text-white">Review Draft</h2>
            <p className="text-sm text-gray-400">Reviewing email from {email.from}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
            ✕
          </button>
        </div>

        {/* Content Split Pane */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left: Original Email */}
          <div className="flex-1 p-8 border-r border-gray-800 overflow-y-auto bg-gray-900/30">
            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-2 block">Original Message</span>
              <h3 className="text-2xl font-bold text-white mb-2">{email.subject}</h3>
              <p className="text-sm text-gray-400">Date: {new Date(email.date).toLocaleString()}</p>
            </div>
            <div className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap">
              {email.body}
            </div>
          </div>

          {/* Right: AI Draft */}
          <div className="flex-1 p-8 flex flex-col bg-gray-900/50">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-500">Chief of Staff Draft</span>
              {draft !== originalDraft && (
                <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter border border-blue-500/30">
                  Edited by you — Learning...
                </span>
              )}
            </div>

            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-700 border-t-emerald-500"></div>
                <p className="text-gray-400 animate-pulse">Drafting your response...</p>
              </div>
            ) : (
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="flex-1 w-full bg-transparent border-none focus:ring-0 text-gray-100 resize-none text-lg leading-relaxed placeholder-gray-600"
                placeholder="What should we say?"
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-gray-800 flex items-center justify-between bg-gray-900/50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
              <span className="text-xs font-medium text-gray-400">Tone: Professional & Warm</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-bold text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={loading || sending || !draft}
              className={`relative px-8 py-2.5 rounded-xl font-bold text-white transition-all overflow-hidden ${
                sending ? 'bg-gray-700' : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-900/20 active:scale-95'
              }`}
            >
              {sending ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                  Sending...
                </span>
              ) : (
                'Send Reply'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
