import React, { useState } from 'react';
import {
  X,
  FileCheck2,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Building,
  Calendar,
  Hash,
  Award,
  ShieldAlert,
  Edit3,
} from 'lucide-react';
import { VerificationResult, Bidder, TenderRequirement } from '../../types/index.ts';
import { Badge } from '../common/Badge.tsx';

interface DocumentEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: VerificationResult | null;
  requirement: TenderRequirement | null;
  bidder: Bidder | null;
  onOverride: (resultId: string, newStatus: string, reason: string) => void;
  onOpenClarification: () => void;
  currentUserRole?: string;
}

export const DocumentEvidenceModal: React.FC<DocumentEvidenceModalProps> = ({
  isOpen,
  onClose,
  result,
  requirement,
  bidder,
  onOverride,
  onOpenClarification,
  currentUserRole = 'PROCUREMENT_OFFICER',
}) => {
  const [isOverrideMode, setIsOverrideMode] = useState(false);
  const [overrideStatus, setOverrideStatus] = useState<string>('PASS');
  const [overrideReason, setOverrideReason] = useState('');

  if (!isOpen || !result) return null;

  const handleApplyOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideReason.trim()) return;
    onOverride(result.id, overrideStatus, overrideReason);
    setIsOverrideMode(false);
  };

  const isTurnoverDoc = requirement?.category === 'FINANCIAL' || result.requirementId === 'req-05';
  const isOemDoc = requirement?.category === 'OEM_AUTHORIZATION' || result.requirementId === 'req-07';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm">
                  Document Evidence Viewer & Provenance
                </h3>
                <span className="text-xs font-mono font-bold bg-slate-200 px-2 py-0.5 rounded text-slate-700">
                  {requirement?.clauseNumber || 'Clause 5.2'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Verifying requirement: <strong className="text-slate-800">{requirement?.title || 'Turnover Requirement'}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Split View (Document Visual on Left + Extracted Audit on Right) */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-100/50">
          {/* Left Column: Realistic Document Page Render (matching Screenshot 8) */}
          <div className="bg-white rounded-xl border border-slate-300 shadow-sm p-6 flex flex-col justify-between relative overflow-hidden font-serif">
            {/* Watermark effect */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 text-slate-900 text-7xl font-bold -rotate-45">
              OFFICIAL EVIDENCE
            </div>

            {isTurnoverDoc ? (
              <div className="space-y-4">
                <div className="text-center border-b border-slate-200 pb-3">
                  <div className="text-base font-bold tracking-wide text-slate-900">
                    S R & ASSOCIATES
                  </div>
                  <div className="text-xs text-slate-500 font-sans">
                    Chartered Accountants • Firm Reg No: 104231W
                  </div>
                  <div className="text-[11px] text-slate-400 font-sans">
                    402, Trade Centre, F.C. Road, Shivajinagar, Pune - 411005
                  </div>
                </div>

                <div className="text-center py-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-400 pb-0.5">
                    TO WHOMSOEVER IT MAY CONCERN
                  </span>
                </div>

                <p className="text-xs leading-relaxed text-slate-700 indent-6 font-sans">
                  This is to certify that <strong>M/s. ABC Technologies Pvt. Ltd.</strong>, having its registered office at Plot No. 44, Hinjawadi Phase 1, Pune, Maharashtra 411057, has achieved an annual turnover of:
                </p>

                <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 text-center my-2">
                  <div className="text-2xl font-bold text-slate-900 font-mono">
                    ₹ 3,80,00,000
                  </div>
                  <div className="text-xs text-amber-900 font-medium font-sans">
                    (Rupees Three Crore Eighty Lakh Only)
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 font-sans">
                    For the Financial Year 2023-2024
                  </div>
                </div>

                <p className="text-xs text-slate-600 font-sans leading-normal">
                  The above turnover is certified on the basis of verified Books of Accounts, Audited Financial Statements, and GSTR-9 annual returns produced before us.
                </p>

                {/* CA Stamp and Signature */}
                <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                  <div className="text-[11px] font-sans text-slate-500">
                    <div>Date: 14/06/2026</div>
                    <div>Place: Pune</div>
                    <div className="font-mono text-blue-900 mt-1 font-bold">
                      UDIN: 24098124BKQW1029
                    </div>
                  </div>

                  {/* Circular CA Stamp Graphic */}
                  <div className="w-24 h-24 rounded-full border-2 border-dashed border-blue-900/60 p-1 flex flex-col items-center justify-center text-center text-blue-900/80 transform rotate-6">
                    <span className="text-[8px] font-bold uppercase">S R & Associates</span>
                    <span className="text-[7px]">Chartered Accountants</span>
                    <span className="text-[8px] font-bold mt-0.5">PUNE</span>
                  </div>
                </div>
              </div>
            ) : isOemDoc ? (
              <div className="space-y-4">
                <div className="text-center border-b border-slate-200 pb-3">
                  <div className="text-base font-bold tracking-wide text-slate-900">
                    DELL TECHNOLOGIES INDIA
                  </div>
                  <div className="text-xs text-slate-500 font-sans">
                    Manufacturer Authorization Desk • Bengaluru Central
                  </div>
                </div>

                <div className="text-center py-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-400 pb-0.5">
                    MANUFACTURER AUTHORIZATION FORM (MAF)
                  </span>
                </div>

                <p className="text-xs leading-relaxed text-slate-700 font-sans">
                  We, as original manufacturer of PowerEdge Server hardware, confirm authorization to M/s ABC Technologies Pvt Ltd to quote for enterprise hardware.
                </p>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs font-sans text-slate-700">
                  <div className="font-bold text-amber-900">Document Review Notice:</div>
                  <div className="mt-1">
                    Tender number is handwritten in margin ("CPCL/IT/2026/042"). 5-year comprehensive warranty clause is partially obscured.
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 text-[11px] font-sans text-slate-500">
                  <div>Document Quality: 120 DPI Scan</div>
                  <div>Verification State: Needs Officer Discretion</div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center border-b border-slate-200 pb-3">
                  <div className="text-base font-bold tracking-wide text-slate-900">
                    STATUTORY VERIFICATION EVIDENCE
                  </div>
                  <div className="text-xs text-slate-500 font-sans">
                    Official portal record & evidence audit snapshot
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs font-sans text-slate-800 leading-relaxed">
                  {result.evidenceSnippet || 'Evidence successfully validated across statutory portal adapter.'}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Structured Extracted Information & Discrepancy Breakdown */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="font-bold text-slate-900 text-sm">Extracted Information</h4>
                <Badge variant={result.status === 'PASS' ? 'pass' : result.status === 'FAIL' ? 'fail' : 'review'}>
                  {result.status === 'PASS' ? 'Compliant' : result.status === 'FAIL' ? 'Deficient' : 'Needs Review'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Document Type</span>
                  <span className="font-semibold text-slate-900">{requirement?.evidenceDocType || 'Certificate'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Company Name</span>
                  <span className="font-semibold text-slate-900">{bidder?.legalName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Source Adapter</span>
                  <span className="font-semibold text-blue-900 font-mono">{result.sourceAdapter}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Source Provenance</span>
                  <span className="font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 font-mono">
                    {result.sourceType}
                  </span>
                </div>
              </div>

              {/* Requirement vs Extracted Comparison */}
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Tender Requirement:</span>
                  <span className="font-bold text-slate-900 font-mono">{result.requiredValue}</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200/80 pt-2">
                  <span className="text-slate-500 font-medium">Extracted Value:</span>
                  <span className={`font-bold font-mono ${result.status === 'FAIL' ? 'text-rose-700' : 'text-emerald-700'}`}>
                    {result.extractedValue}
                  </span>
                </div>
              </div>

              {/* Finding Notice Box */}
              {result.status === 'FAIL' ? (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <div>
                    <strong className="block font-semibold">Deficiency Flagged by Deterministic Rule:</strong>
                    Certified turnover is ₹1.20 Cr below mandatory tender requirement (Clause 5.2). This constitutes a knockout condition unless statutory exemption applies.
                  </div>
                </div>
              ) : result.status === 'NEEDS_REVIEW' ? (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                  <div>
                    <strong className="block font-semibold">Ambiguity Flagged:</strong>
                    {result.aiExplanation || 'Requires procurement officer manual inspection and cross-verification with vendor.'}
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                  <div>
                    <strong className="block font-semibold">Verified & Compliant:</strong>
                    Document matches statutory requirement threshold and verified via gateway adapter.
                  </div>
                </div>
              )}

              {/* Officer Override Form Section */}
              {isOverrideMode ? (
                <form onSubmit={handleApplyOverride} className="p-3 rounded-lg bg-blue-50/70 border border-blue-200 space-y-3 text-xs">
                  <div className="font-bold text-blue-900 flex items-center gap-1.5">
                    <Edit3 className="w-4 h-4" />
                    Officer Override with Reason (Recorded in Audit Trail)
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Set New Status</label>
                    <select
                      value={overrideStatus}
                      onChange={(e) => setOverrideStatus(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded text-xs font-semibold"
                    >
                      <option value="PASS">PASS (Compliant)</option>
                      <option value="NEEDS_REVIEW">NEEDS REVIEW (Ambiguous)</option>
                      <option value="FAIL">FAIL (Non-Compliant)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">
                      Mandatory Justification Reason <span className="text-rose-600">*</span>
                    </label>
                    <textarea
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                      placeholder="e.g. Valid MSE certificate exempts turnover requirement under Public Procurement Policy Section 4..."
                      className="w-full p-2 bg-white border border-slate-300 rounded text-xs h-16"
                      required
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsOverrideMode(false)}
                      className="px-3 py-1.5 rounded text-xs font-medium text-slate-600 hover:bg-slate-200 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!overrideReason.trim()}
                      className="px-3 py-1.5 rounded text-xs font-semibold bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-50 cursor-pointer"
                    >
                      Save Override
                    </button>
                  </div>
                </form>
              ) : null}
            </div>

            {/* Officer Actions Bar */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 mt-4">
              {currentUserRole === 'PROCUREMENT_OFFICER' && !isOverrideMode && (
                <button
                  onClick={() => setIsOverrideMode(true)}
                  className="text-xs font-semibold text-purple-700 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Override Check
                </button>
              )}

              {currentUserRole !== 'PROCUREMENT_OFFICER' && (
                <div className="text-[11px] text-slate-500 italic">
                  {currentUserRole === 'COMPLIANCE_ANALYST'
                    ? 'Compliance Analyst (Audit Inspection View - Overrides reserved for Procurement Officer)'
                    : 'Bidder Self-Service View (Confidential Document Copy)'}
                </div>
              )}

              <div className="flex items-center gap-2 ml-auto">
                {currentUserRole !== 'BIDDER_VENDOR' && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenClarification();
                    }}
                    className="text-xs font-semibold text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    Request Clarification
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
