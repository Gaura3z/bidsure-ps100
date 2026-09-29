import React, { useState, useEffect } from 'react';
import { ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

interface GovNoticeBannerProps {
  onOpenAdapters?: () => void;
}

export const GovNoticeBanner: React.FC<GovNoticeBannerProps> = ({ onOpenAdapters }) => {
  const [aiStatus, setAiStatus] = useState<{ configured: boolean; model: string }>({
    configured: true,
    model: 'gemini-3.8-flash',
  });

  useEffect(() => {
    fetch('/api/gemini/status')
      .then((res) => res.json())
      .then((data) => {
        if (data?.model) {
          setAiStatus({ configured: data.configured, model: data.model });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="bg-slate-900 text-slate-100 text-xs py-1.5 px-4 border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-left">
        <div className="flex items-center gap-2 min-w-0">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold text-slate-200 shrink-0">Decision-Support System:</span>
          <span className="text-slate-300 truncate">
            AI recommendations are advisory. The Procurement Officer remains final decision-maker.
          </span>
        </div>
        <div className="flex items-center gap-2.5 shrink-0 text-[11px]">
          <span className="inline-flex items-center gap-1.5 text-blue-200 bg-blue-900/60 px-2 py-0.5 rounded font-mono border border-blue-700/60">
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span>{aiStatus.model}:</span>
            <span className={aiStatus.configured ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
              {aiStatus.configured ? 'Active' : 'Fallback Rules'}
            </span>
          </span>
          <span className="text-slate-700">|</span>
          <span className="inline-flex items-center gap-1 text-slate-300">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-sky-400"></span>
            <span>MOCK Adapters</span>
          </span>
          {onOpenAdapters && (
            <button
              onClick={onOpenAdapters}
              className="text-blue-400 hover:text-blue-300 underline font-medium cursor-pointer ml-1"
            >
              Gateway
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
