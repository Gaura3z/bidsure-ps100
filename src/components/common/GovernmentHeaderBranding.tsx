import React from 'react';

export const GovernmentHeaderBranding: React.FC = () => {
  return (
    <div className="bg-white border-b border-slate-200/80 px-4 py-2 select-none">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: Ashoka Lion Emblem + Ministry */}
        <div className="flex items-center gap-3">
          {/* Ashoka Emblem Graphic */}
          <div className="flex flex-col items-center justify-center shrink-0 w-8">
            <svg
              className="w-7 h-9 text-slate-800"
              viewBox="0 0 100 120"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Simplified Ashoka Pillar Lion Capital silhouette */}
              <circle cx="50" cy="20" r="14" />
              <path d="M 32 30 Q 50 15 68 30 L 64 55 Q 50 60 36 55 Z" />
              <path d="M 28 35 Q 20 40 22 55 L 35 55 Z" />
              <path d="M 72 35 Q 80 40 78 55 L 65 55 Z" />
              {/* Abacus with Dharma Chakra */}
              <rect x="20" y="60" width="60" height="12" rx="2" fill="#1e293b" />
              <circle cx="50" cy="66" r="4.5" fill="#ffffff" />
              <circle cx="50" cy="66" r="2" fill="#1e293b" />
              {/* Base */}
              <path d="M 25 76 L 75 76 L 70 88 L 30 88 Z" fill="#334155" />
              {/* Satyameva Jayate Banner text */}
              <rect x="18" y="93" width="64" height="6" rx="1" fill="#475569" />
            </svg>
            <span className="text-[7px] font-bold tracking-tighter text-slate-700 uppercase">
              सत्यमेव जयते
            </span>
          </div>

          <div className="border-l border-slate-300 pl-3">
            <div className="text-[11px] font-bold text-slate-900 tracking-wide uppercase">
              Government of India
            </div>
            <div className="text-[10px] text-slate-600 font-medium">
              Ministry of Petroleum & Natural Gas
            </div>
          </div>
        </div>

        {/* Center / Right: CPCL Corporate Emblem */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1 rounded-lg">
            {/* CPCL Flame / Refining icon */}
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-700 via-sky-600 to-amber-500 text-white flex items-center justify-center font-black text-xs shadow-xs">
              CPCL
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-slate-900 leading-tight">
                Chennai Petroleum Corporation Limited
              </div>
              <div className="text-[10px] text-slate-500 font-medium leading-tight">
                A Govt. of India Enterprise · Group Company of IndianOil
              </div>
            </div>
          </div>

          {/* SIH 2026 Badge */}
          <div className="hidden md:flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-900 px-2.5 py-1 rounded-md text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>SIH 2026 · PS 26100</span>
          </div>
        </div>
      </div>
    </div>
  );
};
