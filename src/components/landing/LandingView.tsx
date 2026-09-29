import React from 'react';
import {
  FileCheck2,
  ShieldCheck,
  Zap,
  Lock,
  ArrowRight,
  TrendingDown,
  Clock,
  Award,
  Layers,
  CheckCircle2,
  Building2,
  ExternalLink,
} from 'lucide-react';
import { HeroCharacterIllustration } from './HeroCharacterIllustration.tsx';
import { GovernmentHeaderBranding } from '../common/GovernmentHeaderBranding.tsx';

interface LandingViewProps {
  onGetStarted: () => void;
  onExploreWorkflow: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onGetStarted,
  onExploreWorkflow,
}) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Official Government & CPCL Top Branding Banner */}
      <div className="rounded-xl overflow-hidden shadow-xs border border-slate-200">
        <GovernmentHeaderBranding />
      </div>

      {/* Hero Section matching Screenshot 1 */}
      <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-6 sm:p-10 lg:p-12 overflow-hidden border border-slate-800 shadow-xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Headline, Actions & Highlights */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 bg-blue-800/50 border border-blue-600/40 px-3 py-1 rounded-full text-xs font-semibold text-blue-200 tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              AI-Powered • Secure • Transparent • Reliable
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Smarter Compliance for a{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-emerald-400">
                Stronger India
              </span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed">
              AI-powered integrated bid compliance verification platform for GeM procurement ensuring compliant, trusted and transparent tender evaluation for CPSEs and Government bodies.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={onGetStarted}
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-blue-900/30 transition-all cursor-pointer hover:scale-102"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onExploreWorkflow}
                className="bg-white/10 hover:bg-white/15 text-white border border-white/20 px-6 py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer backdrop-blur-xs"
              >
                Explore Verification Workbench
              </button>
            </div>

            {/* Quick Floating Verification Stamp (matching screenshot 1) */}
            <div className="pt-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-300 bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>GST Verified</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-300 bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Udyam Active</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-300 bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>PAN Valid</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-300 bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Income Tax Filed</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-300 bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>No Blacklist</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Character & Industrial Refinery Graphic */}
          <div className="lg:col-span-5">
            <HeroCharacterIllustration />
          </div>
        </div>
      </div>

      {/* 4 Key Metric Pillars (matching screenshot 1) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="text-3xl sm:text-4xl font-black text-blue-700 font-mono">60-80%</div>
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mt-1">
            Less Verification Time
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automates manual cross-verification across multi-portal statutory databases.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="text-3xl sm:text-4xl font-black text-emerald-700 font-mono">100%</div>
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mt-1">
            Audit Trail & Traceability
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Every document field, rule version, and officer override is immutably timestamped.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="text-3xl sm:text-4xl font-black text-purple-700 font-mono">AI-Powered</div>
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mt-1">
            Risk & Defect Identification
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Detects masked clauses, blurry seals, and turnover discrepancies without hallucinations.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="text-3xl sm:text-4xl font-black text-amber-700 font-mono">8+ Portals</div>
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mt-1">
            Integrated Gateway Architecture
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pluggable adapters for GSTN, Udyam, Income Tax, EPFO, ESIC, MCA and Debarment.
          </p>
        </div>
      </div>

      {/* Trusted Government Integrations (matching screenshot 1) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
        <div className="text-center max-w-xl mx-auto mb-6">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider text-slate-500">
            Trusted Government Portals & Adapters
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Standardized interfaces with official compliance repositories under Digital India guidelines
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-center text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 font-bold text-slate-800 flex flex-col items-center justify-center">
            <span className="text-lg mb-1">🛒</span>
            <span>GeM</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 font-bold text-slate-800 flex flex-col items-center justify-center">
            <span className="text-lg mb-1">🏭</span>
            <span>UDYAM</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 font-bold text-slate-800 flex flex-col items-center justify-center">
            <span className="text-lg mb-1">📄</span>
            <span>GSTN</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 font-bold text-slate-800 flex flex-col items-center justify-center">
            <span className="text-lg mb-1">🏛️</span>
            <span>Income Tax</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 font-bold text-slate-800 flex flex-col items-center justify-center">
            <span className="text-lg mb-1">🏢</span>
            <span>MCA 21</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 font-bold text-slate-800 flex flex-col items-center justify-center">
            <span className="text-lg mb-1">👥</span>
            <span>EPFO</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 font-bold text-slate-800 flex flex-col items-center justify-center">
            <span className="text-lg mb-1">🏥</span>
            <span>ESIC</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 font-bold text-slate-800 flex flex-col items-center justify-center">
            <span className="text-lg mb-1">🔒</span>
            <span>DigiLocker</span>
          </div>
        </div>
      </div>

      {/* 4 Key Benefits Cards (matching screenshot 1) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
            <Zap className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">Faster Tender Evaluation</h4>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Eliminates weeks of repetitive document scrutiny and manual certificate verification across departments.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">Improved Compliance</h4>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Deterministic rules enforce exact tender thresholds, mandatory knockout clauses, and tender-specific criteria.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center mb-3">
            <Award className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">Reduced Human Errors</h4>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Cross-checks entity names, PAN, GSTIN and CA UDIN registrations to flag subtle discrepancies automatically.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center mb-3">
            <Lock className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">Transparent Procurement</h4>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Full auditability ensures every score, finding, and officer override is backed by verifiable document citations.
          </p>
        </div>
      </div>
    </div>
  );
};
