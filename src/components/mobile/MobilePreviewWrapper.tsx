import React, { useState } from 'react';
import {
  Smartphone,
  X,
  ChevronLeft,
  LayoutDashboard,
  FileSpreadsheet,
  Users2,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Eye,
  RefreshCw,
  Building,
} from 'lucide-react';
import { Tender, Bidder, BidSubmission, VerificationResult, BidDocument } from '../../types/index.ts';
import { Badge } from '../common/Badge.tsx';

interface MobilePreviewWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  tenders: Tender[];
  bidders: Bidder[];
  submissions: BidSubmission[];
  verificationResults: VerificationResult[];
  documents: BidDocument[];
  onSelectBidder: (id: string) => void;
}

export const MobilePreviewWrapper: React.FC<MobilePreviewWrapperProps> = ({
  isOpen,
  onClose,
  tenders,
  bidders,
  submissions,
  verificationResults,
  documents,
  onSelectBidder,
}) => {
  const [mobileScreen, setMobileScreen] = useState<
    'DASHBOARD' | 'TENDERS' | 'BIDDER' | 'EVIDENCE' | 'DECISION'
  >('DASHBOARD');

  const [selectedBidderId, setSelectedBidderId] = useState<string>('bidder-01');

  if (!isOpen) return null;

  const currentBidder = bidders.find((b) => b.id === selectedBidderId) || bidders[0];
  const currentSub = submissions.find((s) => s.bidderId === currentBidder.id) || submissions[0];
  const currentResults = verificationResults.filter((r) => r.bidSubmissionId === currentSub?.id);
  const turnoverResult = currentResults.find((r) => r.requirementId === 'req-05');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative flex flex-col items-center">
        {/* Close Button top right */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/80 hover:text-white flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
        >
          <X className="w-5 h-5" />
          <span>Close Mobile View</span>
        </button>

        {/* Smartphone Hardware Frame */}
        <div className="w-[380px] h-[720px] bg-slate-950 rounded-[44px] p-3 shadow-2xl border-4 border-slate-700 flex flex-col relative overflow-hidden">
          {/* Top Speaker & Camera Notch */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-5 bg-slate-900 rounded-full z-30 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-slate-950 mr-2" />
            <div className="w-10 h-1.5 rounded-full bg-slate-800" />
          </div>

          {/* Screen Content Wrapper */}
          <div className="w-full h-full bg-slate-50 rounded-[34px] overflow-hidden flex flex-col relative text-slate-900 font-sans pt-6">
            {/* Top Bar Header */}
            <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between text-xs sticky top-0 z-20">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <FileCheck2 className="w-4 h-4 text-blue-700" />
                <span>BidSure Mobile</span>
              </div>
              <span className="text-[10px] font-mono bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded font-bold">
                CPCL Officer
              </span>
            </div>

            {/* Mobile Screen Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs pb-16">
              {/* Screen 1: Mobile Dashboard */}
              {mobileScreen === 'DASHBOARD' && (
                <div className="space-y-4">
                  <div className="bg-blue-900 text-white p-4 rounded-xl space-y-1">
                    <span className="text-[10px] text-blue-200 font-medium">Rajesh Kumar • CPCL</span>
                    <h3 className="font-extrabold text-sm">Procurement Dashboard</h3>
                    <p className="text-[11px] text-blue-200">12 Active Tenders · 47 Bidders</p>
                  </div>

                  {/* Donut mini card */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-500 font-semibold block">Compliance Rate</span>
                      <span className="text-2xl font-black font-mono text-slate-900">82%</span>
                      <span className="text-[10px] text-slate-500 block">28 Pass · 12 Review · 7 Fail</span>
                    </div>
                    <div className="w-14 h-14 rounded-full border-4 border-emerald-500 border-t-amber-500 border-l-rose-500 flex items-center justify-center font-bold text-xs font-mono">
                      82%
                    </div>
                  </div>

                  {/* Priority Bidder to Review */}
                  <div className="space-y-2">
                    <span className="font-bold text-slate-900 text-[11px] uppercase tracking-wider text-slate-500">
                      Bidders Needing Action
                    </span>

                    {bidders.map((b) => {
                      const sub = submissions.find((s) => s.bidderId === b.id);
                      return (
                        <div
                          key={b.id}
                          onClick={() => {
                            setSelectedBidderId(b.id);
                            setMobileScreen('BIDDER');
                          }}
                          className="bg-white p-3 rounded-xl border border-slate-200 hover:border-blue-400 transition-colors cursor-pointer space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{b.legalName}</span>
                            <Badge
                              variant={sub?.riskLevel === 'HIGH' ? 'fail' : sub?.riskLevel === 'MEDIUM' ? 'review' : 'pass'}
                              size="sm"
                            >
                              {sub?.overallScore}%
                            </Badge>
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center justify-between">
                            <span>{b.location}</span>
                            <span className="text-blue-700 font-medium">Review & Evidence →</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Screen 2: Mobile Bidder Compliance Results (matching screenshot 7) */}
              {mobileScreen === 'BIDDER' && (
                <div className="space-y-3">
                  <button
                    onClick={() => setMobileScreen('DASHBOARD')}
                    className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Back to Dashboard</span>
                  </button>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-900 text-sm">{currentBidder.legalName}</h3>
                      <Badge variant={currentSub?.riskLevel === 'HIGH' ? 'fail' : currentSub?.riskLevel === 'MEDIUM' ? 'review' : 'pass'}>
                        {currentSub?.riskLevel} Risk
                      </Badge>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      GSTIN: {currentBidder.gstin} · PAN: {currentBidder.pan}
                    </div>

                    <div className="p-2 bg-amber-50 rounded border border-amber-200 text-amber-900 text-[11px] leading-tight">
                      <strong>AI Alert:</strong> Turnover is ₹3.8 Cr vs ₹5 Cr required. OEM letter needs verification.
                    </div>
                  </div>

                  {/* Results list */}
                  <div className="space-y-1.5">
                    <span className="font-bold text-[11px] uppercase tracking-wider text-slate-500">
                      Verification Checks ({currentResults.length})
                    </span>

                    {currentResults.map((r) => (
                      <div
                        key={r.id}
                        className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between gap-2"
                      >
                        <div className="max-w-[200px]">
                          <div className="font-semibold text-slate-800 truncate">{r.requiredValue}</div>
                          <div className="text-[10px] text-slate-500 font-mono truncate">{r.extractedValue}</div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge
                            variant={r.status === 'PASS' ? 'pass' : r.status === 'FAIL' ? 'fail' : 'review'}
                            size="sm"
                          >
                            {r.status}
                          </Badge>
                          <button
                            onClick={() => setMobileScreen('EVIDENCE')}
                            className="p-1 text-blue-700 hover:bg-blue-50 rounded cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setMobileScreen('DECISION')}
                    className="w-full py-2.5 bg-blue-700 text-white font-bold rounded-xl text-center cursor-pointer shadow-sm"
                  >
                    Proceed to Officer Decision
                  </button>
                </div>
              )}

              {/* Screen 3: Mobile Evidence View (matching screenshot 8) */}
              {mobileScreen === 'EVIDENCE' && (
                <div className="space-y-3">
                  <button
                    onClick={() => setMobileScreen('BIDDER')}
                    className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Back to Matrix</span>
                  </button>

                  <div className="bg-white p-4 rounded-xl border border-slate-300 font-serif space-y-3 text-center">
                    <div className="font-bold text-xs uppercase text-slate-800">
                      CHARTERED ACCOUNTANT CERTIFICATE
                    </div>
                    <div className="text-[10px] text-slate-500 font-sans">S R & Associates · Pune</div>

                    <div className="p-2.5 bg-amber-50 border border-amber-300 rounded font-sans text-xs">
                      <div className="text-lg font-bold font-mono text-slate-900">₹ 3.80 Crore</div>
                      <div className="text-[10px] text-amber-900">Annual Turnover FY 2023-24</div>
                    </div>

                    <div className="text-[10px] font-sans text-rose-700 font-bold">
                      Does Not Meet Requirement: Required ≥ ₹5.00 Cr
                    </div>
                  </div>

                  <button
                    onClick={() => setMobileScreen('DECISION')}
                    className="w-full py-2 bg-blue-700 text-white font-bold rounded-lg text-center cursor-pointer"
                  >
                    Adjudicate Bid
                  </button>
                </div>
              )}

              {/* Screen 4: Mobile Decision Screen (matching screenshot 10) */}
              {mobileScreen === 'DECISION' && (
                <div className="space-y-3">
                  <button
                    onClick={() => setMobileScreen('BIDDER')}
                    className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                    <h3 className="font-bold text-slate-900 text-sm">Record Final Decision</h3>
                    <div className="space-y-1.5 text-xs">
                      <label className="flex items-center gap-2 p-2 rounded border border-slate-200">
                        <input type="radio" name="mob_dec" defaultChecked />
                        <span>Send Clarification (OEM / Turnover)</span>
                      </label>
                      <label className="flex items-center gap-2 p-2 rounded border border-slate-200">
                        <input type="radio" name="mob_dec" />
                        <span>Approve (Qualified)</span>
                      </label>
                      <label className="flex items-center gap-2 p-2 rounded border border-slate-200">
                        <input type="radio" name="mob_dec" />
                        <span>Reject (Disqualified)</span>
                      </label>
                    </div>

                    <textarea
                      placeholder="Officer justification remark..."
                      defaultValue="Clarification requested on turnover MSME relaxation."
                      className="w-full p-2 border border-slate-200 rounded text-xs h-16"
                    />

                    <button
                      onClick={() => {
                        alert('Decision successfully signed and persisted in audit trail.');
                        setMobileScreen('DASHBOARD');
                      }}
                      className="w-full py-2 bg-emerald-700 text-white font-bold rounded-lg text-center cursor-pointer"
                    >
                      Save & Sign Decision
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Bottom Navigation Bar */}
            <div className="bg-white border-t border-slate-200 px-3 py-2 flex items-center justify-around text-[10px] text-slate-500 font-semibold absolute bottom-0 left-0 right-0 z-20">
              <button
                onClick={() => setMobileScreen('DASHBOARD')}
                className={`flex flex-col items-center gap-0.5 cursor-pointer ${
                  mobileScreen === 'DASHBOARD' ? 'text-blue-700' : 'text-slate-500'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Home</span>
              </button>
              <button
                onClick={() => setMobileScreen('BIDDER')}
                className={`flex flex-col items-center gap-0.5 cursor-pointer ${
                  mobileScreen === 'BIDDER' ? 'text-blue-700' : 'text-slate-500'
                }`}
              >
                <Users2 className="w-4 h-4" />
                <span>Evaluation</span>
              </button>
              <button
                onClick={() => setMobileScreen('EVIDENCE')}
                className={`flex flex-col items-center gap-0.5 cursor-pointer ${
                  mobileScreen === 'EVIDENCE' ? 'text-blue-700' : 'text-slate-500'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>Evidence</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
