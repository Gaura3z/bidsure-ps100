import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  HelpCircle,
  Clock,
  AlertTriangle,
  X,
  FileCheck2,
} from 'lucide-react';
import { Bidder, BidSubmission, User } from '../../types/index.ts';

interface FinalDecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  bidder: Bidder | null;
  submission: BidSubmission | null;
  currentUser: User;
  onConfirmDecision: (decisionData: {
    submissionId: string;
    decision: string;
    remarks: string;
    clarificationSubject?: string;
    clarificationDeadline?: string;
  }) => void;
}

export const FinalDecisionModal: React.FC<FinalDecisionModalProps> = ({
  isOpen,
  onClose,
  bidder,
  submission,
  currentUser,
  onConfirmDecision,
}) => {
  const [selectedDecision, setSelectedDecision] = useState<string>('SEND_CLARIFICATION');
  const [remarks, setRemarks] = useState<string>(
    'Please provide a valid OEM authorization document with verified clause 4.2 back-to-back warranty and CA clarification on MSME turnover relaxation.'
  );
  const [clarificationSubject, setClarificationSubject] = useState<string>(
    'Clarification on OEM MAF and Turnover Exemption (Tender Ref: CPCL/IT/2026/042)'
  );
  const [clarificationDeadline, setClarificationDeadline] = useState<string>('2026-11-05');

  if (!isOpen || !bidder || !submission) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!remarks.trim()) return;

    onConfirmDecision({
      submissionId: submission.id,
      decision: selectedDecision,
      remarks,
      clarificationSubject: selectedDecision === 'SEND_CLARIFICATION' ? clarificationSubject : undefined,
      clarificationDeadline: selectedDecision === 'SEND_CLARIFICATION' ? clarificationDeadline : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 text-slate-900 relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-blue-700" />
              <h3 className="font-extrabold text-base text-slate-900">
                Procurement Officer Formal Review & Decision
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Bidder: <strong className="text-slate-900">{bidder.legalName}</strong> (Tender: CPCL/IT/2026/042)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Score & Risk Summary Header */}
        <div className="my-4 p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Overall Compliance Score</span>
            <span className="text-2xl font-black font-mono text-slate-900 tabular-nums">
              {submission.overallScore}%
            </span>
            <span className="text-xs text-slate-600 block">
              {submission.checksPassed} Passed · {submission.checksReview} Review · {submission.checksFailed} Failed
            </span>
          </div>

          <div className="text-right">
            <span className="text-xs font-semibold text-slate-500 block">Calculated Risk Level</span>
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                submission.riskLevel === 'HIGH'
                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                  : submission.riskLevel === 'MEDIUM'
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}
            >
              {submission.riskLevel} Risk
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-900 mb-2">
              Select Procurement Officer Adjudication:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <label
                className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-colors ${
                  selectedDecision === 'APPROVE_QUALIFIED'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-950 shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="decision"
                  value="APPROVE_QUALIFIED"
                  checked={selectedDecision === 'APPROVE_QUALIFIED'}
                  onChange={(e) => setSelectedDecision(e.target.value)}
                  className="accent-emerald-600"
                />
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-bold">Approve (Qualified)</div>
                  <div className="text-[10px] text-slate-500">Meets technical criteria</div>
                </div>
              </label>

              <label
                className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-colors ${
                  selectedDecision === 'REJECT_DISQUALIFIED'
                    ? 'border-rose-500 bg-rose-50 text-rose-950 shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="decision"
                  value="REJECT_DISQUALIFIED"
                  checked={selectedDecision === 'REJECT_DISQUALIFIED'}
                  onChange={(e) => setSelectedDecision(e.target.value)}
                  className="accent-rose-600"
                />
                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <div>
                  <div className="font-bold">Reject (Disqualified)</div>
                  <div className="text-[10px] text-slate-500">Knockout condition met</div>
                </div>
              </label>

              <label
                className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-colors ${
                  selectedDecision === 'SEND_CLARIFICATION'
                    ? 'border-blue-500 bg-blue-50 text-blue-950 shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="decision"
                  value="SEND_CLARIFICATION"
                  checked={selectedDecision === 'SEND_CLARIFICATION'}
                  onChange={(e) => setSelectedDecision(e.target.value)}
                  className="accent-blue-600"
                />
                <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <div className="font-bold">Send Clarification</div>
                  <div className="text-[10px] text-slate-500">Request addl. documents</div>
                </div>
              </label>

              <label
                className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-colors ${
                  selectedDecision === 'KEEP_UNDER_REVIEW'
                    ? 'border-amber-500 bg-amber-50 text-amber-950 shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="decision"
                  value="KEEP_UNDER_REVIEW"
                  checked={selectedDecision === 'KEEP_UNDER_REVIEW'}
                  onChange={(e) => setSelectedDecision(e.target.value)}
                  className="accent-amber-600"
                />
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <div className="font-bold">Keep Under Review</div>
                  <div className="text-[10px] text-slate-500">Internal vigilance query</div>
                </div>
              </label>
            </div>
          </div>

          {selectedDecision === 'SEND_CLARIFICATION' && (
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 space-y-2 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Clarification Subject</label>
                <input
                  type="text"
                  value={clarificationSubject}
                  onChange={(e) => setClarificationSubject(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded font-medium text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Response Deadline</label>
                <input
                  type="date"
                  value={clarificationDeadline}
                  onChange={(e) => setClarificationDeadline(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded font-medium text-xs"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1">
              Procurement Officer Decision Remarks <span className="text-rose-600">*</span>
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Provide formal audit justification for this procurement decision..."
              className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs h-20 text-slate-800"
              required
            />
            <p className="text-[11px] text-slate-500 mt-1">
              This remark will be immutably recorded in the tamper-evident audit trail with your digital officer ID.
            </p>
          </div>

          <div className="p-3 bg-slate-100 rounded-lg text-[11px] text-slate-600 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <strong>Government Compliance Clause:</strong> AI recommendations are non-binding. The signing authority (<strong>{currentUser.name}</strong>, {currentUser.designation}) retains legal accountability for bid qualification under GFR 2017.
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!remarks.trim()}
              className="px-5 py-2 text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white rounded-lg shadow-sm disabled:opacity-50 cursor-pointer"
            >
              Save Decision & Sign Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
