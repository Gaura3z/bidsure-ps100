import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Loader2,
  ShieldCheck,
  FileSearch,
  Sparkles,
  AlertCircle,
  Building,
  Check,
  X,
} from 'lucide-react';

interface AiVerificationProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  bidderName: string;
}

export const AiVerificationProgressModal: React.FC<AiVerificationProgressModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  bidderName,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(15);

  const steps = [
    { label: 'Document Classification', desc: 'Categorizing 11 uploaded PDF/Image files' },
    { label: 'Data Extraction (AI OCR)', desc: 'Extracting key fields, numbers, UDIN and seals' },
    { label: 'Cross-Document Identity Verification', desc: 'Matching PAN, GSTIN, and Legal Trade Name' },
    { label: 'GSTN Portal Gateway Verification', desc: 'Verifying active taxpayer status and GSTR-3B filings' },
    { label: 'Udyam / MSME Portal Verification', desc: 'Checking enterprise classification and NIC code' },
    { label: 'Income Tax Central Processing API', desc: 'Verifying AY 2023-24 and 2024-25 acknowledgements' },
    { label: 'EPFO & ESIC Labour Compliance Check', desc: 'Checking active code and regular ECR contributions' },
    { label: 'Central Debarment & Blacklist Registry', desc: 'Cross-checking GFR Section 151 prohibitive orders' },
    { label: 'Deterministic Compliance Rules Engine', desc: 'Evaluating mandatory thresholds, weights & knockouts' },
    { label: 'Grounded AI Analysis & Risk Scoring', desc: 'Synthesizing evidence-linked compliance summary' },
  ];

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setProgress(15);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          const next = prev + 1;
          setProgress(Math.round(((next + 1) / steps.length) * 100));
          return next;
        } else {
          clearInterval(interval);
          setProgress(100);
          setTimeout(() => {
            onComplete();
          }, 800);
          return prev;
        }
      });
    }, 700);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 text-slate-900 relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" />
              <h3 className="font-extrabold text-lg text-slate-900">AI Verification in Progress</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Evaluating compliance package for <strong className="text-blue-900">{bidderName}</strong>
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-blue-50 text-blue-800 border border-blue-200">
            SIMULATED PIPELINE
          </span>
        </div>

        {/* Circular Progress & Percentage Ring */}
        <div className="py-6 flex items-center justify-center">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" stroke="#e2e8f0" strokeWidth="8" fill="none" />
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="#2563eb"
                strokeWidth="8"
                fill="none"
                strokeDasharray="263.89"
                strokeDashoffset={263.89 - (263.89 * progress) / 100}
                strokeLinecap="round"
                className="transition-all duration-300 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-extrabold font-mono text-slate-900 tabular-nums">
                {progress}%
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-600 tracking-wider">
                {progress === 100 ? 'Completed' : 'Verifying'}
              </span>
            </div>
          </div>
        </div>

        {/* Stepper Pipeline List (matching screenshot 6) */}
        <div className="max-h-60 overflow-y-auto space-y-2 pr-2 border-y border-slate-100 py-3">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStep;
            const isCurrent = idx === currentStep;

            return (
              <div
                key={idx}
                className={`flex items-start gap-3 p-2 rounded-lg text-xs transition-colors ${
                  isCurrent
                    ? 'bg-blue-50/80 border border-blue-200 text-blue-900'
                    : isCompleted
                    ? 'text-slate-700 bg-slate-50/50'
                    : 'text-slate-400'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[9px] font-mono">
                      {idx + 1}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-semibold flex items-center justify-between">
                    <span>{step.label}</span>
                    <span className="text-[10px] font-mono">
                      {isCompleted ? 'Done' : isCurrent ? 'Active' : 'Queued'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{step.desc}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Disclaimer footer */}
        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
          <span className="text-[11px]">
            ⚡ Deterministic rules engine + Gemini Grounded Explanation
          </span>
          <button
            onClick={() => {
              setProgress(100);
              onComplete();
            }}
            className="text-blue-700 hover:text-blue-800 font-semibold underline cursor-pointer"
          >
            Skip to Results
          </button>
        </div>
      </div>
    </div>
  );
};
