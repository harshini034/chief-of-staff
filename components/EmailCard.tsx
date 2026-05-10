import { ScoredEmail } from '@/lib/types';

type Props = {
  email: ScoredEmail;
  onSelect: (email: ScoredEmail) => void;
};

export default function EmailCard({ email, onSelect }: Props) {
  const getUrgencyColor = (urgency: number) => {
    if (urgency >= 4) return 'bg-red-500/10 text-red-400 border-red-500/50';
    if (urgency === 3) return 'bg-amber-500/10 text-amber-400 border-amber-500/50';
    return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/50';
  };

  const getIntentIcon = (intent: string) => {
    switch (intent) {
      case 'question': return '❓';
      case 'action': return '⚡';
      case 'fyi': return 'ℹ️';
      case 'scheduling': return '📅';
      case 'sales': return '💰';
      default: return '✉️';
    }
  };

  return (
    <div 
      className="group relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/50 p-6 transition-all hover:border-gray-700 hover:bg-gray-800/50 hover:shadow-2xl cursor-pointer"
      onClick={() => onSelect(email)}
    >
      {/* Background Gradient Glow */}
      <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-blue-500/5 blur-3xl transition-all group-hover:bg-blue-500/10"></div>
      
      <div className="relative flex flex-col h-full">
        <div className="mb-4 flex items-start justify-between">
          <div className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${getUrgencyColor(email.urgency)}`}>
            Urgency {email.urgency}
          </div>
          <div className="flex items-center gap-2">
            {email.senderRank === 'vip' && (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500/20 text-xs shadow-lg shadow-yellow-500/10" title="VIP Sender">
                👑
              </span>
            )}
            <span className="text-sm text-gray-500 font-medium">
              {new Date(email.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>

        <h3 className="mb-2 text-xl font-bold text-gray-100 line-clamp-1 group-hover:text-white transition-colors">
          {email.subject}
        </h3>

        <div className="mb-4 flex items-center gap-2">
          <span className="text-lg" title={email.intent}>
            {getIntentIcon(email.intent)}
          </span>
          <span className="text-sm font-medium text-gray-400 truncate">
            {email.from}
          </span>
        </div>

        <p className="mb-6 text-sm leading-relaxed text-gray-400 line-clamp-3">
          {email.snippet || email.body.slice(0, 150)}
        </p>

        <div className="mt-auto pt-4 border-t border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${email.category === 'auto-handle' ? 'bg-emerald-500' : email.category === 'escalate' ? 'bg-red-500' : 'bg-blue-500'}`}></span>
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
              {email.category}
            </span>
          </div>
          
          <button 
            className="rounded-lg bg-gray-800 px-3 py-1.5 text-xs font-bold text-gray-300 transition-colors hover:bg-emerald-600 hover:text-white border border-gray-700 hover:border-emerald-500"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(email);
            }}
          >
            Review & Reply
          </button>
        </div>
      </div>
    </div>
  );
}
