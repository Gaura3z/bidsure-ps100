import React from 'react';

interface OfficerAvatarGraphicProps {
  name: string;
  role?: string;
  size?: 'sm' | 'md' | 'lg';
  showRefineryBackdrop?: boolean;
}

export const OfficerAvatarGraphic: React.FC<OfficerAvatarGraphicProps> = ({
  name,
  role = 'Senior Procurement Officer',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-9 h-9 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
  }[size];

  const isAnalyst = name.toLowerCase().includes('priya') || role?.toLowerCase().includes('analyst');
  const isBidder = name.toLowerCase().includes('amit') || role?.toLowerCase().includes('bidder') || role?.toLowerCase().includes('vendor');
  const isAdmin = name.toLowerCase().includes('admin');

  return (
    <div className="relative inline-flex items-center shrink-0">
      {/* Outer Glow Ring */}
      <div
        className={`${sizeClasses} rounded-full p-0.5 shadow-md relative overflow-hidden ${
          isBidder
            ? 'bg-gradient-to-tr from-emerald-600 via-teal-400 to-amber-300'
            : isAnalyst
            ? 'bg-gradient-to-tr from-purple-600 via-pink-400 to-blue-400'
            : isAdmin
            ? 'bg-gradient-to-tr from-indigo-600 via-cyan-400 to-slate-400'
            : 'bg-gradient-to-tr from-blue-600 via-sky-400 to-emerald-400'
        }`}
      >
        <svg
          className="w-full h-full rounded-full bg-slate-900"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="bgProcurement" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e3a8a" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="bgAnalyst" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4c1d95" />
              <stop offset="100%" stopColor="#1e1b4b" />
            </linearGradient>
            <linearGradient id="bgBidder" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#064e3b" />
              <stop offset="100%" stopColor="#022c22" />
            </linearGradient>
            <linearGradient id="skinTone" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f5d0b0" />
              <stop offset="100%" stopColor="#c88b63" />
            </linearGradient>
          </defs>

          {/* Conditional Background */}
          <rect
            width="100"
            height="100"
            fill={isBidder ? 'url(#bgBidder)' : isAnalyst ? 'url(#bgAnalyst)' : 'url(#bgProcurement)'}
          />

          {isBidder ? (
            /* --- AMIT PATEL (Bidder Vendor: Business Executive) --- */
            <g>
              {/* Skyline / Office Backdrop */}
              <rect x="20" y="30" width="12" height="35" rx="1" fill="#10b981" opacity="0.25" />
              <rect x="68" y="25" width="14" height="40" rx="1" fill="#10b981" opacity="0.25" />
              {/* Suit Torso */}
              <path d="M 20 85 C 20 68, 35 62, 50 62 C 65 62, 80 68, 80 85 L 85 100 L 15 100 Z" fill="#1e293b" />
              {/* White Shirt Collar */}
              <polygon points="43,62 50,75 57,62" fill="#ffffff" />
              {/* Emerald Tie */}
              <polygon points="48,70 52,70 54,95 50,100 46,95" fill="#059669" />
              {/* Neck */}
              <rect x="44" y="52" width="12" height="14" rx="2" fill="url(#skinTone)" />
              {/* Head */}
              <ellipse cx="50" cy="42" rx="16" ry="18" fill="url(#skinTone)" />
              {/* Slick Business Haircut */}
              <path d="M 33 36 C 33 20, 67 20, 67 36 C 60 25, 40 25, 33 36 Z" fill="#18181b" />
              <path d="M 32 36 C 34 26, 46 22, 68 25 C 65 33, 50 31, 32 36 Z" fill="#27272a" />
              {/* Eyes & Smile */}
              <circle cx="43" cy="41" r="1.8" fill="#18181b" />
              <circle cx="57" cy="41" r="1.8" fill="#18181b" />
              <path d="M 45 49 Q 50 53 55 49" stroke="#18181b" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              {/* Corporate Lapel Pin */}
              <circle cx="34" cy="74" r="2.5" fill="#10b981" />
            </g>
          ) : isAnalyst ? (
            /* --- PRIYA SHARMA (Compliance Analyst: Technical Vigilance) --- */
            <g>
              {/* Vigilance Backdrop grid */}
              <line x1="20" y1="20" x2="20" y2="60" stroke="#c084fc" strokeWidth="1" opacity="0.3" />
              <line x1="80" y1="20" x2="80" y2="60" stroke="#c084fc" strokeWidth="1" opacity="0.3" />
              {/* Purple Formal Blazer */}
              <path d="M 20 85 C 20 68, 35 62, 50 62 C 65 62, 80 68, 80 85 L 85 100 L 15 100 Z" fill="#581c87" />
              {/* Blouse */}
              <polygon points="42,62 50,75 58,62" fill="#faf5ff" />
              {/* Vigilance Lanyard & Badge */}
              <line x1="47" y1="65" x2="49" y2="82" stroke="#a855f7" strokeWidth="2" />
              <line x1="53" y1="65" x2="51" y2="82" stroke="#a855f7" strokeWidth="2" />
              <rect x="46" y="82" width="8" height="11" rx="1" fill="#ffffff" />
              <rect x="47" y="84" width="6" height="3" fill="#a855f7" />
              {/* Neck */}
              <rect x="44" y="52" width="12" height="14" rx="2" fill="url(#skinTone)" />
              {/* Long Hair Behind */}
              <path d="M 29 40 C 26 55, 27 75, 33 80 L 67 80 C 73 75, 74 55, 71 40 Z" fill="#1e1b4b" />
              {/* Face */}
              <ellipse cx="50" cy="42" rx="15" ry="17" fill="url(#skinTone)" />
              {/* Front Hair with Parting */}
              <path d="M 32 35 C 33 22, 67 22, 68 35 C 64 25, 48 24, 32 35 Z" fill="#1e1b4b" />
              <path d="M 32 35 C 36 44, 40 45, 45 38 C 47 44, 62 42, 68 35 Z" fill="#0f172a" />
              {/* Smart Glasses */}
              <rect x="37" y="37" width="11" height="8" rx="2" fill="none" stroke="#7c3aed" strokeWidth="1.5" />
              <rect x="52" y="37" width="11" height="8" rx="2" fill="none" stroke="#7c3aed" strokeWidth="1.5" />
              <line x1="48" y1="41" x2="52" y2="41" stroke="#7c3aed" strokeWidth="1.5" />
              {/* Eyes & Smile */}
              <circle cx="42.5" cy="41" r="1.5" fill="#18181b" />
              <circle cx="57.5" cy="41" r="1.5" fill="#18181b" />
              <path d="M 46 50 Q 50 53 54 50" stroke="#be185d" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </g>
          ) : (
            /* --- RAJESH KUMAR (Procurement Officer: CPCL Adjudicator) --- */
            <g>
              {/* Refinery Stacks Backdrop */}
              <rect x="15" y="25" width="8" height="35" rx="1" fill="#38bdf8" opacity="0.3" />
              <rect x="75" y="20" width="10" height="40" rx="1" fill="#38bdf8" opacity="0.3" />
              <circle cx="80" cy="18" r="3" fill="#f97316" opacity="0.6" />
              {/* Torso & Reflective CPSE Vest */}
              <path d="M 20 85 C 20 68, 35 62, 50 62 C 65 62, 80 68, 80 85 L 85 100 L 15 100 Z" fill="#1e293b" />
              <path d="M 32 68 L 46 68 L 44 95 L 30 95 Z" fill="#84cc16" />
              <path d="M 54 68 L 68 68 L 70 95 L 56 95 Z" fill="#84cc16" />
              {/* Lanyard & CPCL ID */}
              <line x1="48" y1="65" x2="49" y2="82" stroke="#0284c7" strokeWidth="2" />
              <line x1="52" y1="65" x2="51" y2="82" stroke="#0284c7" strokeWidth="2" />
              <rect x="46" y="82" width="8" height="11" rx="1" fill="#ffffff" />
              <rect x="47" y="84" width="6" height="3" fill="#0284c7" />
              {/* Neck */}
              <rect x="44" y="52" width="12" height="14" rx="2" fill="url(#skinTone)" />
              {/* Face */}
              <ellipse cx="50" cy="42" rx="16" ry="18" fill="url(#skinTone)" />
              {/* Mustache */}
              <path d="M 43 49 Q 50 46 57 49 Q 50 52 43 49 Z" fill="#0f172a" />
              {/* Eyes */}
              <circle cx="43" cy="40" r="1.8" fill="#0f172a" />
              <circle cx="57" cy="40" r="1.8" fill="#0f172a" />
              {/* Hardhat / Safety Helmet */}
              <path d="M 31 34 C 31 16, 69 16, 69 34 L 73 35 L 27 35 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
              <circle cx="50" cy="27" r="3" fill="#0284c7" />
            </g>
          )}

          {/* Online Active Status Pin */}
        </svg>

        {/* Live Active Badge Dot */}
        <span
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
            isBidder ? 'bg-emerald-500' : isAnalyst ? 'bg-purple-500' : 'bg-blue-500'
          }`}
        />
      </div>
    </div>
  );
};
