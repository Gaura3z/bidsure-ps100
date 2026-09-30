import React, { useState } from 'react';
import {
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Sparkles,
  ExternalLink,
  UploadCloud,
  FileText,
  Search,
  Eye,
  ShieldCheck,
  Building,
  ArrowRight,
  RefreshCw,
  Edit3,
  Upload,
  Plus,
} from 'lucide-react';
import {
  Bidder,
  BidSubmission,
  BidDocument,
  VerificationResult,
  TenderRequirement,
  Tender,
  User,
} from '../../types/index.ts';
import { Badge } from '../common/Badge.tsx';
import { AiVerificationProgressModal } from './AiVerificationProgressModal.tsx';
import { DocumentEvidenceModal } from './DocumentEvidenceModal.tsx';
import { FinalDecisionModal } from './FinalDecisionModal.tsx';
import { BidderClarificationModal } from './BidderClarificationModal.tsx';

interface BidderEvaluationViewProps {
  currentUser: User;
  tenders: Tender[];
  bidders: Bidder[];
  submissions: BidSubmission[];
  selectedBidderId: string;
  selectedTenderId?: string;
  onSelectBidder: (id: string) => void;
  onApplyTender?: (tenderId: string) => Promise<void>;
  requirements: TenderRequirement[];
  verificationResults: VerificationResult[];
  documents: BidDocument[];
  onRunVerification: (submissionId: string) => void;
  onOverrideResult: (resultId: string, newStatus: string, reason: string) => void;
  onConfirmDecision: (decisionData: any) => void;
  onRespondClarification?: (data: any) => Promise<void>;
}

export const BidderEvaluationView: React.FC<BidderEvaluationViewProps> = ({
  currentUser,
  tenders,
  bidders,
  submissions,
  selectedBidderId,
  selectedTenderId,
  onSelectBidder,
  onApplyTender,
  requirements,
  verificationResults,
  documents,
  onRunVerification,
  onOverrideResult,
  onConfirmDecision,
  onRespondClarification,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'MATRIX' | 'EXPLANATION' | 'DOCUMENTS' | 'RISK'>('MATRIX');
  const [isVerifyingModalOpen, setIsVerifyingModalOpen] = useState(false);
  const [evidenceModalResult, setEvidenceModalResult] = useState<VerificationResult | null>(null);
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [isClarificationModalOpen, setIsClarificationModalOpen] = useState(false);

  const currentBidder = bidders.find((b) => b.id === selectedBidderId) || bidders[0];
  const currentTender = tenders.find((t) => t.id === selectedTenderId) || tenders.find((t) => t.id === submissions.find((s) => s.bidderId === currentBidder.id)?.tenderId) || tenders[0];
  const currentSubmission = submissions.find((s) => s.bidderId === currentBidder.id && s.tenderId === currentTender?.id);

  const bidderDocuments = documents.filter((d) => d.bidderId === currentBidder.id && d.bidSubmissionId === currentSubmission?.id);
  const bidderResults = verificationResults.filter((r) => r.bidSubmissionId === currentSubmission?.id);

  // Group stats
  const passedCount = bidderResults.filter((r) => r.status === 'PASS').length;
  const reviewCount = bidderResults.filter((r) => r.status === 'NEEDS_REVIEW').length;
  const failedCount = bidderResults.filter((r) => r.status === 'FAIL').length;

  if (!currentSubmission) {
    return (
      <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">{currentTender?.title || 'Tender application'}</h2>
        <p className="mt-2 text-sm text-slate-600">You have not applied for this tender yet. Apply to create your bid workspace and upload the required documents.</p>
        {currentTender && currentUser.role === 'BIDDER_VENDOR' && onApplyTender && (
          <button onClick={() => void onApplyTender(currentTender.id)} className="mt-6 rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800">
            Apply for this tender
          </button>
        )}
      </div>
    );
  }

  const handleOpenEvidence = (result: VerificationResult) => {
    setEvidenceModalResult(result);
  };

  const handleCloseEvidence = () => {
    setEvidenceModalResult(null);
  };

  const selectedRequirementForEvidence = evidenceModalResult
    ? requirements.find((r) => r.id === evidenceModalResult.requirementId) || null
    : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Stepper (matching screens 4 & 5) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {currentTender.tenderId}
              </span>
              <span className="text-xs text-slate-500 font-medium">Evaluation Cycle v2.4</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 mt-1">
              Bidder Compliance Evaluation Desk
            </h2>
            <p className="text-xs text-slate-500">
              Package: <strong>{currentTender.title}</strong> · Estimated: ₹{(currentTender.estimatedValue / 10000000).toFixed(2)} Cr
            </p>
          </div>

          <div className="flex items-center gap-2">
            {currentUser.role !== 'BIDDER_VENDOR' && (
              <button
                onClick={() => setIsVerifyingModalOpen(true)}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Re-run AI Verification
              </button>
            )}

            {currentUser.role === 'PROCUREMENT_OFFICER' ? (
              <button
                onClick={() => setIsDecisionModalOpen(true)}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                Proceed to Decision
              </button>
            ) : currentUser.role === 'BIDDER_VENDOR' ? (
              <button
                onClick={() => setIsClarificationModalOpen(true)}
                className="px-3.5 py-2 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5 shadow-sm transition-all cursor-pointer animate-pulse"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Required Documents & Evidence</span>
              </button>
            ) : (
              <div
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200 flex items-center gap-1.5"
                title="Only Procurement Officers hold statutory adjudication authority"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>Adjudication: Officer Authority Only</span>
              </div>
            )}
          </div>
        </div>

        {/* 4-Stage Stepper (matching screenshot 4) */}
        <div className="pt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>1. Upload Documents</span>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>2. AI Verification</span>
          </div>
          <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-300 text-blue-900 font-bold flex items-center justify-center gap-2 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
            <span>3. Compliance Analysis</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 font-medium flex items-center justify-center gap-2">
            <span className="w-4 h-4 rounded-full border border-slate-300 text-[10px] flex items-center justify-center">4</span>
            <span>4. Review & Decision</span>
          </div>
        </div>
      </div>

      {/* Bidder Selection Tabs (Role-Scoped: Bidders only see their own company; Officers see all) */}
      {currentUser.role === 'BIDDER_VENDOR' ? (
        <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-700" />
            <span className="text-xs font-bold text-slate-900">
              My Company: {currentBidder.legalName} ({currentBidder.pan})
            </span>
          </div>
          <span className="text-[11px] font-medium text-blue-800 bg-white px-2.5 py-1 rounded border border-blue-200">
            GFR 2017 Confidentiality: Competitor submissions protected
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {bidders.map((b) => {
            const sub = submissions.find((s) => s.bidderId === b.id);
            const isSelected = b.id === currentBidder.id;

            return (
              <button
                key={b.id}
                onClick={() => onSelectBidder(b.id)}
                className={`p-3 rounded-xl border text-left min-w-[240px] transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-700 bg-white shadow-sm ring-2 ring-blue-100'
                    : 'border-slate-200 bg-white/70 hover:bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-bold text-xs truncate max-w-[150px] ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                    {b.legalName}
                  </span>
                  <span className="font-mono text-xs font-black">
                    {sub?.overallScore || 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1 text-[11px]">
                  <span className="text-slate-500 truncate">{b.location}</span>
                  <Badge
                    variant={sub?.riskLevel === 'HIGH' ? 'fail' : sub?.riskLevel === 'MEDIUM' ? 'review' : 'pass'}
                    size="sm"
                  >
                    {sub?.riskLevel}
                  </Badge>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Bidder Identity & Profile Card (matching screenshot 4) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-700" />
              <h3 className="text-lg font-bold text-slate-900">{currentBidder.legalName}</h3>
              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                {currentBidder.entityType.replace('_', ' ')}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-600">
              <span>GSTIN: <strong className="font-mono text-slate-900">{currentBidder.gstin}</strong></span>
              <span>·</span>
              <span>PAN: <strong className="font-mono text-slate-900">{currentBidder.pan}</strong></span>
              <span>·</span>
              <span>Udyam: <strong className="font-mono text-slate-900">{currentBidder.udyamNumber || 'N/A'}</strong></span>
              <span>·</span>
              <span>Category: <strong className="text-slate-900">{currentBidder.msmeCategory || 'Non-MSME'}</strong></span>
              <span>·</span>
              <span>Location: <strong className="text-slate-900">{currentBidder.location}</strong></span>
            </div>
          </div>

          {/* Compliance Score Gauge & Pill summary */}
          <div className="flex items-center gap-6 p-3 rounded-xl bg-slate-50 border border-slate-200/80 shrink-0">
            <div className="text-center">
              <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">Compliance Score</span>
              <span className="text-3xl font-black font-mono text-slate-900 tabular-nums">
                {currentSubmission.overallScore}%
              </span>
            </div>
            <div className="border-l border-slate-200 pl-4 space-y-1 text-xs">
              <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>{passedCount} Passed</span>
              </div>
              <div className="flex items-center gap-2 text-amber-700 font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>{reviewCount} Need Review</span>
              </div>
              <div className="flex items-center gap-2 text-rose-700 font-semibold">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>{failedCount} Failed</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Recommendation Banner (matching screenshot 5) */}
        <div className="mt-4 p-3.5 rounded-xl border border-amber-200 bg-amber-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
            <div>
              <strong className="text-amber-950 font-bold block">
                AI Recommendation: {currentSubmission.riskLevel === 'HIGH' ? 'Knockout Disqualification' : 'Manual Review & Clarification Required'}
              </strong>
              <span className="text-amber-900">
                {currentSubmission.riskLevel === 'HIGH'
                  ? 'Critical debarment record identified on statutory index. Rejection recommended under Clause 10.1.'
                  : 'Annual turnover of ₹3.80 Cr is 24% below the ₹5.00 Cr requirement. OEM Authorization warranty text is unclear. Clarification advised.'}
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsDecisionModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shrink-0 cursor-pointer shadow-2xs"
          >
            Adjudicate Bid
          </button>
        </div>
      </div>

      {/* Sub-Tabs: Matrix vs AI Explanation vs Documents vs Risk */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="flex items-center border-b border-slate-200 bg-slate-50/80 px-4 pt-2 gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('MATRIX')}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
              activeSubTab === 'MATRIX'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Compliance Matrix ({bidderResults.length})
          </button>
          <button
            onClick={() => setActiveSubTab('EXPLANATION')}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'EXPLANATION'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            AI Explanation & Findings
          </button>
          <button
            onClick={() => setActiveSubTab('DOCUMENTS')}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
              activeSubTab === 'DOCUMENTS'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Submitted Documents ({bidderDocuments.length})
          </button>
          <button
            onClick={() => setActiveSubTab('RISK')}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
              activeSubTab === 'RISK'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Risk Analysis
          </button>
        </div>

        {/* Tab 1: Compliance Matrix Table (matching screenshot 5 & 7) */}
        {activeSubTab === 'MATRIX' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Requirement / Clause</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Extracted Value</th>
                  <th className="py-3 px-4">Tender Requirement</th>
                  <th className="py-3 px-4">Source & Provenance</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {bidderResults.map((res) => {
                  const req = requirements.find((r) => r.id === res.requirementId);

                  return (
                    <tr
                      key={res.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        res.status === 'FAIL'
                          ? 'bg-rose-50/20'
                          : res.status === 'NEEDS_REVIEW'
                          ? 'bg-amber-50/20'
                          : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{req?.title || 'Requirement'}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {req?.clauseNumber} · {req?.category}
                          {req?.isKnockout && (
                            <span className="text-rose-600 font-bold ml-1">● Knockout</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            res.status === 'PASS'
                              ? 'pass'
                              : res.status === 'FAIL'
                              ? 'fail'
                              : 'review'
                          }
                        >
                          {res.status === 'PASS'
                            ? 'Pass'
                            : res.status === 'FAIL'
                            ? 'Fail'
                            : 'Review'}
                        </Badge>
                        {res.officerOverridden && (
                          <span className="block text-[10px] text-purple-700 font-medium mt-0.5">
                            Overridden by Officer
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono font-medium max-w-xs">
                        <div className={res.status === 'FAIL' ? 'text-rose-700 font-bold' : 'text-slate-800'}>
                          {res.extractedValue}
                        </div>
                        {res.differenceSummary && (
                          <div className="text-[10px] text-slate-500 font-sans mt-0.5">
                            {res.differenceSummary}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-700 font-mono text-[11px]">
                        {res.requiredValue}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{res.sourceAdapter}</div>
                        <Badge variant="mock" size="sm" className="mt-0.5">
                          {res.sourceType}
                        </Badge>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {currentUser.role === 'BIDDER_VENDOR' && (res.status === 'FAIL' || res.status === 'NEEDS_REVIEW') && (
                            <button
                              onClick={() => setIsClarificationModalOpen(true)}
                              className="text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-2.5 py-1 rounded-md transition-colors cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                              title="Submit Clarification & Exemption Evidence"
                            >
                              <Upload className="w-3 h-3" />
                              <span>Respond</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenEvidence(res)}
                            className="text-xs font-semibold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded transition-colors cursor-pointer inline-flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: AI Grounded Explanation & Findings (matching screenshot 9) */}
        {activeSubTab === 'EXPLANATION' && (
          <div className="p-6 space-y-6">
            {/* Grounded Summary Box */}
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-blue-700" />
                  AI Analysis Summary (Grounded in Verified Extracted Evidence)
                </div>
                <button
                  onClick={() => onRunVerification(currentSubmission.id)}
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                >
                  <RefreshCw className="w-3 h-3" />
                  Re-synthesize with Gemini
                </button>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                The bidder meets most of the statutory and eligibility requirements (GST, Udyam, PAN, EPFO, ESIC are verified Active). However, the certified annual turnover of <strong>₹3.80 Crore</strong> is below the tender threshold of <strong>₹5.00 Crore</strong> (Clause 5.2). Furthermore, the OEM authorization document stamp contrast is low and requires manual verification for clause 4.2 back-to-back warranty. Overall compliance score is <strong>{currentSubmission.overallScore}%</strong> with <strong>{currentSubmission.riskLevel}</strong> risk.
              </p>
            </div>

            {/* Key Findings List (matching screenshot 9) */}
            <div>
              <h4 className="font-bold text-slate-900 text-xs mb-3 uppercase tracking-wider text-slate-500">
                Key Verification Findings
              </h4>
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/40 flex items-start gap-2 text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <strong>Statutory Registrations Verified:</strong> GSTN (Active), Udyam MSME (Small), PAN (Operative), EPFO (Regular ECR up to Aug 2026), and ESIC are valid.
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/40 flex items-start gap-2 text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <strong>Tax Compliance:</strong> Income tax return acknowledgements verified filed for Assessment Years 2023-24 and 2024-25.
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-rose-200 bg-rose-50/50 flex items-start gap-2 text-rose-900">
                  <XCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                  <div>
                    <strong>Annual Turnover Deficiency:</strong> Certified turnover of ₹3.80 Crore is below required ≥ ₹5.00 Crore threshold. (Deficiency of ₹1.20 Cr / 24%).
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/50 flex items-start gap-2 text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <strong>OEM Authorization Document Ambiguity:</strong> Document page 2 has handwritten tender ID annotations and obscured warranty clauses. Manual verification required.
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/40 flex items-start gap-2 text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <strong>Central Debarment Registry:</strong> Zero prohibitive matches found on Central GeM & CPSE consolidated blacklist database.
                  </div>
                </div>
              </div>
            </div>

            {/* Officer Action Recommendation */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Rule Engine Version: <strong className="font-mono text-slate-800">v2.4-2026</strong>
              </span>
              <button
                onClick={() => setIsDecisionModalOpen(true)}
                className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs cursor-pointer shadow-sm"
              >
                Proceed to Formal Decision & Clarification
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Submitted Documents List (matching screenshot 4 & 5) */}
        {activeSubTab === 'DOCUMENTS' && (
          <div className="p-5">
            {bidderDocuments.length === 0 && (
              <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950">
                <strong>Documents required for this tender</strong>
                <ul className="mt-2 list-disc pl-5 space-y-1">
                  {requirements.filter((requirement) => requirement.tenderId === currentTender?.id).map((requirement) => (
                    <li key={requirement.id}>{requirement.evidenceDocType} <span className="text-blue-700">({requirement.clauseNumber})</span></li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-blue-800">Choose “Upload Required Documents & Evidence” to attach documents to this tender bid. Files are scanned and queued for review.</p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {bidderDocuments.map((doc) => {
                const matchingResult = bidderResults.find(
                  (r) => r.documentId === doc.id || r.requiredValue.toLowerCase().includes(doc.docType.toLowerCase().split(' ')[0])
                ) || bidderResults[0];

                return (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">{doc.fileName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {doc.fileSize} · {doc.docType} · {doc.pageCount} pages
                        </div>
                        {(doc as any).status && (
                          <div className="text-[10px] text-slate-500 mt-1">
                            Security: {(doc as any).securityStatus || 'PENDING'} · OCR: {(doc as any).ocrStatus || 'PENDING'}
                            {(doc as any).aiReviewStatus === 'SUPPORTS_CLAIM' && ' · AI supports claim'}
                            {(doc as any).aiReviewStatus === 'DOES_NOT_SUPPORT' && ' · AI does not support claim'}
                            {(doc as any).aiReviewStatus === 'NEEDS_MANUAL_REVIEW' && ' · AI review required'}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={doc.status === 'VERIFIED' ? 'pass' : 'review'} size="sm">
                        {doc.status}
                      </Badge>
                      <button
                        onClick={() => handleOpenEvidence(matchingResult)}
                        className="px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50 rounded border border-blue-200 cursor-pointer flex items-center gap-1"
                        title="Inspect Document Evidence"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 4: Risk Analysis */}
        {activeSubTab === 'RISK' && (
          <div className="p-6 space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 block">Overall Risk Rating</span>
                <span className="text-xl font-bold text-slate-900 uppercase tracking-wide">
                  {currentSubmission.riskLevel} Risk
                </span>
              </div>
              <span className="text-xs text-slate-600 max-w-md text-right">
                Calculated deterministically based on severity weights, missing clauses, and mandatory knockouts.
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <strong className="text-slate-900 block font-semibold">1. Statutory Integrity Risk: Low</strong>
                <p className="text-slate-500 mt-0.5">
                  Entity details, PAN, and GSTIN match 100% across statutory registers with active return filings.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <strong className="text-slate-900 block font-semibold">2. Financial Capacity Risk: High</strong>
                <p className="text-slate-500 mt-0.5">
                  Turnover is ₹3.8 Cr vs ₹5 Cr requirement. Officer must evaluate whether bidder is eligible for MSME turnover relaxation.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <strong className="text-slate-900 block font-semibold">3. Contract Execution Risk: Medium</strong>
                <p className="text-slate-500 mt-0.5">
                  OEM authorization documentation requires written clarification from hardware manufacturer prior to commercial bid opening.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Verification in Progress Modal */}
      <AiVerificationProgressModal
        isOpen={isVerifyingModalOpen}
        onClose={() => setIsVerifyingModalOpen(false)}
        onComplete={() => {
          setIsVerifyingModalOpen(false);
          onRunVerification(currentSubmission.id);
        }}
        bidderName={currentBidder.legalName}
      />

      {/* Document Evidence Viewer Modal */}
      <DocumentEvidenceModal
        isOpen={!!evidenceModalResult}
        onClose={handleCloseEvidence}
        result={evidenceModalResult}
        requirement={selectedRequirementForEvidence}
        bidder={currentBidder}
        onOverride={onOverrideResult}
        onOpenClarification={() => setIsDecisionModalOpen(true)}
        currentUserRole={currentUser.role}
      />

      {/* Final Decision Modal */}
      <FinalDecisionModal
        isOpen={isDecisionModalOpen}
        onClose={() => setIsDecisionModalOpen(false)}
        bidder={currentBidder}
        submission={currentSubmission}
        currentUser={currentUser}
        onConfirmDecision={(data) => {
          onConfirmDecision(data);
          setIsDecisionModalOpen(false);
        }}
      />

      {/* Vendor Clarification Response Modal */}
      <BidderClarificationModal
        isOpen={isClarificationModalOpen}
        onClose={() => setIsClarificationModalOpen(false)}
        bidder={currentBidder}
        submission={currentSubmission}
        tender={currentTender}
        requiredDocuments={requirements.filter((requirement) => requirement.tenderId === currentTender.id).map((requirement) => requirement.evidenceDocType)}
        onSubmitResponse={async (data) => {
          if (onRespondClarification) {
            await onRespondClarification({
              submissionId: currentSubmission.id,
              ...data,
            });
          }
          setIsClarificationModalOpen(false);
        }}
      />
    </div>
  );
};
