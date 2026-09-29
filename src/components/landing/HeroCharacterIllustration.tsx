import React from 'react';
import { ShieldCheck, CheckCircle2, Award, Sparkles, Building2, Flame } from 'lucide-react';

export const HeroCharacterIllustration: React.FC = () => {
  return (
    <div className="relative w-full max-w-lg mx-auto lg:max-w-none select-none">
      {/* Decorative Glow Backdrop */}
      <div className="absolute -inset-2 bg-gradient-to-r from-blue-600/30 via-sky-500/20 to-emerald-500/30 rounded-3xl blur-2xl opacity-75 -z-10 animate-pulse" />

      {/* Main Illustration Card Container */}
      <div className="relative rounded-2xl bg-gradient-to-b from-slate-900/90 via-blue-950/80 to-slate-900 border border-blue-500/30 shadow-2xl overflow-hidden backdrop-blur-md">
        {/* Tricolor Ribbon Glow Header */}
        <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-white to-emerald-600 opacity-90" />

        {/* SVG Industrial & Character Composition */}
        <div className="relative h-[340px] sm:h-[400px] w-full overflow-hidden flex items-end justify-center">
          {/* Refinery Sky & Structures (SVG Art) */}
          <svg
            className="absolute inset-0 w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 500 400"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0f172a" />
                <stop offset="40%" stopColor="#1e3a8a" />
                <stop offset="80%" stopColor="#0284c7" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
              <linearGradient id="tricolorSky" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.25" />
              </linearGradient>
              <linearGradient id="metalPipe" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="50%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>
              <linearGradient id="goldHelm" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="50%" stopColor="#f8fafc" />
                <stop offset="100%" stopColor="#cbd5e1" />
              </linearGradient>
              <linearGradient id="hiVisVest" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#84cc16" />
                <stop offset="50%" stopColor="#a3e635" />
                <stop offset="100%" stopColor="#65a30d" />
              </linearGradient>
              <linearGradient id="skinTone" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#f5d0b0" />
                <stop offset="60%" stopColor="#d99b70" />
                <stop offset="100%" stopColor="#b47348" />
              </linearGradient>
            </defs>

            {/* Background Sky */}
            <rect width="500" height="400" fill="url(#skyGrad)" />
            <rect width="500" height="180" fill="url(#tricolorSky)" />

            {/* Distant Refinery Silhouette & Flare Tower */}
            <g opacity="0.35" fill="#38bdf8">
              {/* Distillation Columns */}
              <rect x="30" y="120" width="22" height="200" rx="3" />
              <rect x="25" y="100" width="32" height="20" rx="10" />
              <rect x="75" y="150" width="16" height="170" rx="2" />
              <rect x="420" y="110" width="30" height="210" rx="4" />
              <rect x="465" y="140" width="18" height="180" rx="2" />
              {/* Refinery Lattice Towers */}
              <line x1="380" y1="80" x2="380" y2="300" stroke="#7dd3fc" strokeWidth="3" />
              <line x1="400" y1="90" x2="400" y2="300" stroke="#7dd3fc" strokeWidth="3" />
              <line x1="375" y1="120" x2="405" y2="150" stroke="#7dd3fc" strokeWidth="1.5" />
              <line x1="405" y1="120" x2="375" y2="150" stroke="#7dd3fc" strokeWidth="1.5" />
              <line x1="375" y1="180" x2="405" y2="210" stroke="#7dd3fc" strokeWidth="1.5" />
              {/* Refinery Gas Flare */}
              <path d="M 390 80 Q 388 60 392 45 Q 396 60 390 80 Z" fill="#f97316" className="animate-pulse" />
              <circle cx="390" cy="55" r="8" fill="#fbbf24" opacity="0.8" />
            </g>

            {/* Industrial Storage Tanks & Pipeline Horizon */}
            <g fill="#1e293b" opacity="0.6">
              <ellipse cx="140" cy="270" rx="45" ry="30" />
              <rect x="95" y="270" width="90" height="60" />
              <ellipse cx="330" cy="280" rx="55" ry="32" />
              <rect x="275" y="280" width="110" height="50" />
              <path d="M 0 310 Q 150 290 300 320 T 500 300 L 500 400 L 0 400 Z" fill="#0b132b" />
            </g>

            {/* ============================================================== */}
            {/* HERO CHARACTER: INDIAN CPCL PROCUREMENT ENGINEER & OFFICER     */}
            {/* ============================================================== */}
            <g transform="translate(140, 75)">
              {/* Officer Shoulders & Navy Coverall */}
              <path
                d="M 50 200 C 50 170, 70 145, 110 140 C 150 145, 170 170, 170 200 L 175 330 L 45 330 Z"
                fill="#1e3a5f"
              />

              {/* Fluorescent High-Visibility Safety Vest */}
              <path
                d="M 68 152 C 85 147, 95 158, 110 158 C 125 158, 135 147, 152 152 L 164 265 C 135 275, 85 275, 56 265 Z"
                fill="url(#hiVisVest)"
              />
              {/* Silver Reflective Vest Stripes */}
              <path
                d="M 72 170 L 148 170 L 147 185 L 73 185 Z"
                fill="#e2e8f0"
                opacity="0.9"
              />
              <path
                d="M 66 220 L 154 220 L 153 235 L 67 235 Z"
                fill="#e2e8f0"
                opacity="0.9"
              />
              <line x1="90" y1="156" x2="88" y2="265" stroke="#f8fafc" strokeWidth="6" opacity="0.9" />
              <line x1="130" y1="156" x2="132" y2="265" stroke="#f8fafc" strokeWidth="6" opacity="0.9" />

              {/* CPCL Official ID Card Badge on Lanyard */}
              <path d="M 103 155 L 117 155 L 114 185 L 106 185 Z" fill="#0284c7" />
              <rect x="99" y="185" width="22" height="30" rx="2" fill="#ffffff" stroke="#94a3b8" strokeWidth="1" />
              <rect x="103" y="189" width="14" height="10" rx="1" fill="#0284c7" />
              <rect x="102" y="202" width="16" height="2" fill="#334155" />
              <rect x="104" y="207" width="12" height="2" fill="#64748b" />

              {/* Arms Crossed in Confident Pose */}
              <path
                d="M 52 195 Q 65 245 110 248 Q 155 245 168 195 Q 150 260 110 262 Q 70 260 52 195 Z"
                fill="#162e4a"
              />

              {/* Neck */}
              <rect x="98" y="115" width="24" height="30" rx="4" fill="url(#skinTone)" />

              {/* Face & Head */}
              <path
                d="M 88 75 C 88 50, 132 50, 132 75 C 132 105, 126 126, 110 126 C 94 126, 88 105, 88 75 Z"
                fill="url(#skinTone)"
              />
              {/* Ears */}
              <ellipse cx="87" cy="88" rx="4" ry="7" fill="#d99b70" />
              <ellipse cx="133" cy="88" rx="4" ry="7" fill="#d99b70" />

              {/* Facial Features: Eyes, Eyebrows, Well-Groomed Indian Mustache & Smile */}
              <path d="M 94 72 Q 101 69 105 72" stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M 115 72 Q 119 69 126 72" stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <ellipse cx="100" cy="78" rx="2.5" ry="2" fill="#0f172a" />
              <ellipse cx="120" cy="78" rx="2.5" ry="2" fill="#0f172a" />
              <path d="M 109 78 L 111 88 L 107 90" stroke="#b47348" strokeWidth="1.8" fill="none" strokeLinecap="round" />
              {/* Professional Mustache */}
              <path
                d="M 97 97 Q 110 93 110 99 Q 110 93 123 97 Q 118 103 110 101 Q 102 103 97 97 Z"
                fill="#0f172a"
              />
              {/* Warm Smile */}
              <path d="M 103 105 Q 110 110 117 105" stroke="#ffffff" strokeWidth="2" fill="none" strokeLinecap="round" />

              {/* White Engineer Hardhat Helmet (Government / CPCL Spec) */}
              <path
                d="M 82 66 C 82 28, 138 28, 138 66 L 144 68 C 146 72, 142 74, 138 74 L 82 74 C 78 74, 74 72, 76 68 Z"
                fill="url(#goldHelm)"
                stroke="#94a3b8"
                strokeWidth="1.5"
              />
              {/* Helmet Ridge */}
              <path d="M 108 30 Q 110 45 110 73" stroke="#cbd5e1" strokeWidth="3" fill="none" />
              {/* CPCL / Ashok Chakra Helmet Emblem */}
              <circle cx="110" cy="54" r="6" fill="#0284c7" />
              <circle cx="110" cy="54" r="3.5" fill="#ffffff" />
            </g>
          </svg>

          {/* Floating Verified Badge (Exact replica of Reference Screen 1) */}
          <div className="absolute right-4 top-6 sm:right-6 sm:top-8 bg-slate-900/90 border border-emerald-500/40 rounded-xl p-3 shadow-xl backdrop-blur-md animate-in slide-in-from-right-4 duration-500">
            <div className="flex items-center gap-2 border-b border-slate-700/80 pb-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white tracking-wide">VERIFIED</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-auto" />
            </div>
            <ul className="space-y-1.5 text-[11px] text-slate-300">
              <li className="flex items-center gap-1.5 text-emerald-300 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>GST Active & Valid</span>
              </li>
              <li className="flex items-center gap-1.5 text-emerald-300 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Udyam MSME Verified</span>
              </li>
              <li className="flex items-center gap-1.5 text-emerald-300 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>PAN Entity Matched</span>
              </li>
              <li className="flex items-center gap-1.5 text-emerald-300 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>EPFO & ESIC Active</span>
              </li>
              <li className="flex items-center gap-1.5 text-emerald-300 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>No Debarment Record</span>
              </li>
            </ul>
          </div>

          {/* Bottom Live Platform Status Pill */}
          <div className="absolute left-4 bottom-4 bg-slate-950/80 border border-blue-500/30 px-3 py-1.5 rounded-lg flex items-center gap-2 backdrop-blur-sm shadow-md">
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[11px] font-medium text-slate-300">
              CPCL Refinery Operations · Manali, Chennai
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
