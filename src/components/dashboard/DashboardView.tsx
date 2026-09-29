import React from 'react';
import {
  FileText,
  Users,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ArrowRight,
  ShieldAlert,
  Search,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  FileCheck,
} from 'lucide-react';
import { Tender, Bidder, BidSubmission, User } from '../../types/index.ts';
import { Badge } from '../common/Badge.tsx';
import { OfficerAvatarGraphic } from '../common/OfficerAvatarGraphic.tsx';

interface DashboardViewProps {
  currentUser: User;
  tenders: Tender[];
  submissions: BidSubmission[];
  bidders: Bidder[];
  onSelectTender: (tenderId: string) => void;
  onSelectBidder: (bidderId: string) => void;
  onOpenCreateTender: () => void;
  onOpenAdapters: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  tenders,
  submissions,
  bidders,
  onSelectTender,
  onSelectBidder,
  onOpenCreateTender,
  onOpenAdapters,
}) => {
  // Compute overall stats
  const activeTendersCount = tenders.filter((t) => t.status === 'EVALUATION' || t.status === 'PUBLISHED').length;
  const underReviewCount = submissions.filter((s) => s.status === 'REVIEW_REQUIRED' || s.status === 'UNDER_VERIFICATION').length;
  const completedCount = submissions.filter((s) => s.status === 'QUALIFIED' || s.status === 'DISQUALIFIED').length;
  const attentionCount = submissions.filter((s) => s.riskLevel === 'HIGH' || s.status === 'REVIEW_REQUIRED').length;

  // Role-specific badge and subtitle
  const roleConfig = {
    PROCUREMENT_OFFICER: {
      badge: 'CPCL Refinery Procurement Desk • Final Adjudication Authority',
      subtitle: 'Tender evaluation workspace with multi-source statutory verification (GSTN, Udyam, Income Tax, EPFO, ESIC, Debarment) and officer adjudication authority.',
      roleTitle: 'Senior Procurement Officer',
    },
    COMPLIANCE_ANALYST: {
      badge: 'Vigilance & Quality Assurance Desk • Compliance Analysis Mode',
      subtitle: 'Technical compliance analysis workspace for investigating flagged clauses, document discrepancies, and verifying statutory source evidence.',
      roleTitle: 'Technical Compliance Analyst',
    },
    BIDDER_VENDOR: {
      badge: 'Participating Bidder Portal • GeM Vendor Desk',
      subtitle: 'Vendor submission portal: review compliance evaluation feedback, check missing document flags, and submit clarifications.',
      roleTitle: 'Authorized Bidder Representative',
    },
    ADMIN: {
      badge: 'GeM Nodal Platform Operations • System Administration',
      subtitle: 'Manage statutory source adapters, compliance rule engines v2.4, system audit logs, and user roles.',
      roleTitle: 'System Administrator',
    },
  }[currentUser.role] || {
    badge: 'CPCL Procurement Operations • GeM Portal Sync Active',
    subtitle: 'Integrated bid compliance verification workbench.',
    roleTitle: currentUser.designation,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Dynamic User Welcome Banner with Role Context */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-blue-950 text-white rounded-xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-400 via-white to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <OfficerAvatarGraphic
              name={currentUser.name}
              role={currentUser.designation}
              size="lg"
            />
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-800/60 border border-blue-700/60 px-2.5 py-1 rounded-full text-xs font-medium text-blue-200 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{roleConfig.badge}</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight">
                Welcome back, {currentUser.name}
              </h2>
              <p className="text-xs text-blue-300 font-medium mt-0.5">
                Role: <strong className="text-white">{currentUser.designation}</strong>
                {currentUser.department ? ` · ${currentUser.department}` : ''}
              </p>
              <p className="text-sm text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
                {roleConfig.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {currentUser.role === 'PROCUREMENT_OFFICER' && (
              <button
                onClick={onOpenCreateTender}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Create New Tender
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4 Top Metric Cards (Dynamically scoped by user role) */}
      {currentUser.role === 'BIDDER_VENDOR' ? (
        /* Bidder-Scoped Metrics (Confidential & Personalized to ABC Technologies) */
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">My Active Bids</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-2 font-mono tabular-nums">
              1
            </div>
            <div className="text-xs text-slate-600 mt-1 flex items-center gap-1 font-mono">
              CPCL/IT/2026/042
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">My Uploaded Documents</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <FileCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-2 font-mono tabular-nums">
              8
            </div>
            <div className="text-xs text-emerald-700 mt-1 font-medium">
              Statutory & Technical on file
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">My Compliance Score</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-amber-700 mt-2 font-mono tabular-nums">
              82%
            </div>
            <div className="text-xs text-amber-600 mt-1 font-medium">
              Review Required by CPCL
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-colors bg-amber-50/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-900">Action Required</span>
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-amber-800 mt-2 font-mono tabular-nums">
              1
            </div>
            <div className="text-xs text-amber-700 mt-1 font-medium">
              Turnover Clarification Pending
            </div>
          </div>
        </div>
      ) : (
        /* Authority & Analyst Global Procurement Metrics */
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Active Tenders</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-2 font-mono tabular-nums">
              {activeTendersCount + 10}
            </div>
            <div className="text-xs text-slate-600 mt-1 flex items-center gap-1">
              <span className="text-emerald-700 font-semibold font-mono tabular-nums">+2</span> new this week
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Bidders Under Review</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-2 font-mono tabular-nums">
              {underReviewCount + 44}
            </div>
            <div className="text-xs text-slate-600 mt-1 flex items-center gap-1">
              Across 4 active packages
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Completed Evaluations</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-2 font-mono tabular-nums">
              {completedCount + 33}
            </div>
            <div className="text-xs text-emerald-700 mt-1 font-medium">
              100% audit recorded
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-colors bg-rose-50/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-700">Needs Officer Attention</span>
              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-rose-700 mt-2 font-mono tabular-nums">
              {attentionCount + 4}
            </div>
            <div className="text-xs text-rose-600 mt-1 font-medium">
              Discrepancies & knockouts
            </div>
          </div>
        </div>
      )}

      {/* Middle Grid: Overall Compliance Donut & Attention Action Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compliance Donut Card (matching screenshot 3) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-sm">Overall Verification Status</h3>
              <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-medium">
                Last 30 Days
              </span>
            </div>

            <div className="flex items-center justify-center py-4">
              <div className="relative w-40 h-40 flex items-center justify-center">
                {/* SVG Donut */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="12" fill="none" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#10b981"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray="251.2"
                    strokeDashoffset="45"
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#f59e0b"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray="251.2"
                    strokeDashoffset="190"
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#f43f5e"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray="251.2"
                    strokeDashoffset="225"
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">82%</span>
                  <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Compliance</span>
                </div>
              </div>
            </div>

            {/* Legend Breakdown */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center text-xs">
              <div className="p-2 rounded-lg bg-emerald-50/60">
                <div className="flex items-center justify-center gap-1 text-emerald-800 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-700" />
                  <span>Compliant</span>
                </div>
                <div className="text-base font-bold text-slate-900 mt-0.5 font-mono">28</div>
              </div>
              <div className="p-2 rounded-lg bg-amber-50/60">
                <div className="flex items-center justify-center gap-1 text-amber-800 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-amber-700" />
                  <span>Need Review</span>
                </div>
                <div className="text-base font-bold text-slate-900 mt-0.5 font-mono">12</div>
              </div>
              <div className="p-2 rounded-lg bg-rose-50/60">
                <div className="flex items-center justify-center gap-1 text-rose-800 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-rose-700" />
                  <span>Non-Compliant</span>
                </div>
                <div className="text-base font-bold text-slate-900 mt-0.5 font-mono">7</div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Statutory Gateways:</span>
            <button
              onClick={onOpenAdapters}
              className="text-blue-700 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              8 Adapters Active <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Immediate Review Queue (Role-Scoped: Officer/Analyst vs Vendor Privacy) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          {currentUser.role === 'BIDDER_VENDOR' ? (
            /* Bidder View: Strictly Scoped to Their Own Submission (Confidentiality Safeguard) */
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-blue-700" />
                  <h3 className="font-bold text-slate-900 text-sm">
                    My Bid Submission Status & Compliance Feedback
                  </h3>
                </div>
                <Badge variant="review">1 Clarification Notice</Badge>
              </div>

              {/* My Company Card: ABC Technologies */}
              <div className="p-4 rounded-xl border border-amber-300 bg-amber-50/50 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        ABC Technologies Pvt Ltd
                      </span>
                      <span className="text-xs font-mono bg-blue-100 text-blue-900 px-2 py-0.5 rounded font-semibold">
                        Tender: CPCL/IT/2026/042
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 mt-1">
                      Turnkey supply & deployment of Enterprise Servers & SAN Storage
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-black text-amber-800 bg-amber-100 px-2.5 py-1 rounded-md">
                      Score: 82%
                    </span>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-amber-200 text-xs text-slate-700 space-y-1.5">
                  <div className="font-bold text-amber-950 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Officer Clarification Request (Clause 5.2 - Annual Turnover):</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Tender specifies minimum turnover of <strong>₹5.00 Crore</strong>. Your submitted CA Certificate certifies <strong>₹3.80 Crore</strong>.
                    Under Udyam registration (<strong>UDYAM-MH-12-0012345</strong>), if you are claiming Micro & Small Enterprise (MSE) exemption under Public Procurement Policy 2012, please upload your MSE turnover relaxation certificate.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-[11px] text-slate-500 font-medium">
                    Submission Ref: <span className="font-mono text-slate-800">BID/2026/CPCL/042-01</span> · Submitted on 29 Oct 2026
                  </div>
                  <button
                    onClick={() => onSelectBidder('bidder-01')}
                    className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <span>View My Documents & Respond</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Procurement Authority & Analyst View: Full Multi-Bidder Priority Verification Queue */
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <h3 className="font-bold text-slate-900 text-sm">
                    Priority Verification Queue (Needs Officer Review)
                  </h3>
                </div>
                <span className="text-xs text-amber-800 font-semibold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                  3 Pending Action
                </span>
              </div>

              <div className="space-y-3">
                {/* Bidder 1 Alert: ABC Technologies (From Screenshot) */}
                <div
                  onClick={() => onSelectBidder('bidder-01')}
                  className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/40 hover:bg-amber-50 transition-all cursor-pointer flex items-start justify-between gap-3 group"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm group-hover:text-blue-700 transition-colors">
                        ABC Technologies Pvt Ltd
                      </span>
                      <Badge variant="review">82% • Needs Review</Badge>
                      <span className="text-xs text-slate-600 font-mono">CPCL/IT/2026/042</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      <strong>Deficiency:</strong> Audited turnover of <strong className="text-rose-700">₹3.80 Cr</strong> is below required <strong className="text-slate-900">₹5.00 Cr</strong> threshold. OEM Authorization letter requires manual verification for tender reference clarity.
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500 font-medium">
                      <span>GSTIN: 27ABCDE1234F1Z5</span>
                      <span>·</span>
                      <span>MSME Small (MSE Exemption Applicable?)</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-amber-500 group-hover:translate-x-0.5 transition-transform shrink-0 mt-2" />
                </div>

                {/* Bidder 2 Alert: Zenith Enterprise (FAIL / Knockout) */}
                <div
                  onClick={() => onSelectBidder('bidder-03')}
                  className="p-3.5 rounded-lg border border-rose-200 bg-rose-50/40 hover:bg-rose-50 transition-all cursor-pointer flex items-start justify-between gap-3 group"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm group-hover:text-rose-700 transition-colors">
                        Zenith Enterprise Infra Solutions
                      </span>
                      <Badge variant="fail">36% • Critical Disqualification</Badge>
                      <span className="text-xs text-slate-600 font-mono">CPCL/IT/2026/042</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      <strong>Knockout Triggered:</strong> Positive prohibitive match on Central Debarment / GeM Blacklist Registry. Missing mandatory CA UDIN verified turnover certificate.
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500 font-medium">
                      <span>PAN: AAZFZ5543K</span>
                      <span>·</span>
                      <span className="text-rose-700 font-semibold">Immediate Knockout Recommended</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-rose-500 group-hover:translate-x-0.5 transition-transform shrink-0 mt-2" />
                </div>

                {/* Bidder 3: Bharat Solutions (Compliant benchmark) */}
                <div
                  onClick={() => onSelectBidder('bidder-02')}
                  className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/30 hover:bg-emerald-50/60 transition-all cursor-pointer flex items-start justify-between gap-3 group"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">
                        Bharat Industrial Solutions Ltd
                      </span>
                      <Badge variant="pass">96% • Fully Compliant</Badge>
                      <span className="text-xs text-slate-600 font-mono">CPCL/IT/2026/042</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      All 11 statutory & technical requirements verified. CA Turnover ₹7.20 Cr, valid 5-year OEM warranty, active EPFO/ESIC registrations.
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-emerald-500 group-hover:translate-x-0.5 transition-transform shrink-0 mt-2" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Tenders Table (Role-Aware) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              {currentUser.role === 'BIDDER_VENDOR' ? 'Open CPCL Tenders for Bidding' : 'Recent CPCL Tenders'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentUser.role === 'BIDDER_VENDOR'
                ? 'Official procurement packages published on GeM portal'
                : 'Active procurement packages under technical compliance evaluation'}
            </p>
          </div>
          {currentUser.role === 'PROCUREMENT_OFFICER' && (
            <button
              onClick={onOpenCreateTender}
              className="text-xs font-semibold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Create New Tender
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Tender ID</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Estimated Value</th>
                <th className="py-3 px-4">Bidders</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {tenders.map((tender) => (
                <tr key={tender.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-semibold text-blue-900">
                    {tender.tenderId}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-900 max-w-md">
                    <div>{tender.title}</div>
                    <div className="text-[11px] text-slate-500 truncate">{tender.category} · Deadline: {new Date(tender.submissionDeadline).toLocaleDateString()}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-700 font-medium">
                    ₹{(tender.estimatedValue / 10000000).toFixed(2)} Cr
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded font-mono">
                      {(tender as any).biddersCount || 8} Bidders
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {tender.status === 'EVALUATION' ? (
                      <Badge variant="info">In Evaluation</Badge>
                    ) : tender.status === 'DECIDED' ? (
                      <Badge variant="pass">Completed</Badge>
                    ) : (
                      <Badge variant="review">3 Issues Flagged</Badge>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onSelectTender(tender.id)}
                      className="text-xs font-semibold text-blue-700 hover:text-blue-800 bg-white hover:bg-blue-50 border border-blue-200 px-3 py-1 rounded-md transition-colors cursor-pointer"
                    >
                      View & Evaluate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
