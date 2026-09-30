/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import {
  Tender,
  Bidder,
  BidSubmission,
  BidDocument,
  VerificationResult,
  TenderRequirement,
  AuditEvent,
  User,
  ActiveTab,
} from './types/index.ts';
import {
  initialTenders,
  initialBidders,
  initialSubmissions,
  initialDocuments,
  initialVerificationResults,
  initialRequirements,
  initialAuditEvents,
  initialUsers,
} from './db/mockData.ts';
import {
  fetchTenders,
  fetchBidders,
  fetchAuditTrail,
  fetchSourceAdapters,
  fetchSession,
  fetchHealth,
  runVerificationPipeline,
  overrideVerificationResult,
  recordOfficerDecision,
  setActiveUserContext,
  loginAsRole,
  respondToClarification,
} from './services/api.ts';
import { Navbar } from './components/common/Navbar.tsx';
import { GovNoticeBanner } from './components/common/GovNoticeBanner.tsx';
import { DashboardView } from './components/dashboard/DashboardView.tsx';
import { TenderList } from './components/tender/TenderList.tsx';
import { BidderEvaluationView } from './components/evaluation/BidderEvaluationView.tsx';
import { AuditTrailView } from './components/audit/AuditTrailView.tsx';
import { SourceGatewayModal } from './components/adapters/SourceGatewayModal.tsx';
import { CreateTenderModal } from './components/tender/CreateTenderModal.tsx';
import { LandingView } from './components/landing/LandingView.tsx';
import { LoginView } from './components/auth/LoginView.tsx';
import { DatabaseInspectorModal } from './components/database/DatabaseInspectorModal.tsx';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('DASHBOARD');
  const [currentUser, setCurrentUser] = useState<User>(initialUsers[0]); // Rajesh Kumar (Procurement Officer)
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [tenders, setTenders] = useState<Tender[]>(initialTenders);
  const [bidders, setBidders] = useState<Bidder[]>(initialBidders);
  const [submissions, setSubmissions] = useState<BidSubmission[]>(initialSubmissions);
  const [documents, setDocuments] = useState<BidDocument[]>(initialDocuments);
  const [requirements, setRequirements] = useState<TenderRequirement[]>(initialRequirements);
  const [verificationResults, setVerificationResults] = useState<VerificationResult[]>(initialVerificationResults);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>(initialAuditEvents);

  const [selectedBidderId, setSelectedBidderId] = useState<string>('bidder-01'); // Default ABC Technologies
  const [isCreateTenderModalOpen, setIsCreateTenderModalOpen] = useState(false);
  const [isSourceGatewayModalOpen, setIsSourceGatewayModalOpen] = useState(false);
  const [isDatabaseModalOpen, setIsDatabaseModalOpen] = useState(false);

  const [adapterModes, setAdapterModes] = useState<Record<string, 'LIVE' | 'MOCK' | 'MANUAL'>>({
    GSTN: 'MOCK',
    UDYAM: 'MOCK',
    MCA: 'MOCK',
    INCOME_TAX: 'MOCK',
    EPFO: 'MOCK',
    ESIC: 'MOCK',
    DIGILOCKER: 'MOCK',
    DEBARMENT: 'MOCK',
  });

  const [roleToast, setRoleToast] = useState<{ role: string; name: string; title: string; desc: string } | null>(null);
  const navigationReady = useRef(false);
  const createTenderModalRef = useRef(false);
  createTenderModalRef.current = isCreateTenderModalOpen;

  useEffect(() => {
    window.history.replaceState({ ...window.history.state, bidsureTab: activeTab }, '', window.location.href);
    navigationReady.current = true;
    const handlePopState = (event: PopStateEvent) => {
      if (createTenderModalRef.current) {
        setIsCreateTenderModalOpen(false);
        return;
      }
      const previousTab = event.state?.bidsureTab as ActiveTab | undefined;
      if (previousTab) setActiveTab(previousTab);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (!navigationReady.current || window.history.state?.bidsureTab === activeTab) return;
    window.history.pushState({ bidsureTab: activeTab }, '', window.location.href);
  }, [activeTab]);

  const openCreateTender = () => {
    window.history.pushState({ ...window.history.state, bidsureModal: 'create-tender' }, '', window.location.href);
    setIsCreateTenderModalOpen(true);
  };

  const roleCanUseTab = (tab: ActiveTab) => {
    if (tab === 'LANDING' || tab === 'LOGIN') return false;
    if (tab === 'SOURCE_GATEWAY') {
      return ['PROCUREMENT_OFFICER', 'COMPLIANCE_ANALYST', 'ADMIN'].includes(currentUser.role);
    }
    return ['DASHBOARD', 'TENDERS', 'EVALUATION', 'COMPLIANCE_MATRIX', 'AUDIT_TRAIL'].includes(tab);
  };

  useEffect(() => {
    if (!roleCanUseTab(activeTab)) setActiveTab('DASHBOARD');
  }, [activeTab, currentUser.role]);

  // Load live data from API if server is running
  useEffect(() => {
    async function loadInitialData() {
      // Wake Render before the session request so a sleeping free instance is ready by the time the user submits login.
      void fetchHealth().catch(() => undefined);
      try {
        const session: any = await fetchSession();
        if (session?.currentUser) {
          setIsAuthenticated(true);
          setCurrentUser(session.currentUser);
          setActiveUserContext(session.currentUser.role, session.currentUser.id);
          if (session.currentUser.role === 'BIDDER_VENDOR') {
            setSelectedBidderId('bidder-01');
          }
        }
      } catch (e) {
        setIsAuthenticated(false);
        setActiveTab('LOGIN');
      } finally {
        setAuthChecked(true);
      }

      try {
        const loadedTenders = await fetchTenders();
        if (Array.isArray(loadedTenders) && loadedTenders.length > 0) {
          setTenders(loadedTenders);
        }
      } catch (e) {
        // Use fallback seed data
      }

      try {
        const loadedBidders = await fetchBidders();
        if (Array.isArray(loadedBidders) && loadedBidders.length > 0) {
          setBidders(loadedBidders);
        }
      } catch (e) {}

      try {
        const loadedAudits = await fetchAuditTrail();
        if (Array.isArray(loadedAudits) && loadedAudits.length > 0) {
          setAuditEvents(loadedAudits);
        }
      } catch (e) {}

      try {
        const adapters = await fetchSourceAdapters();
        if (adapters?.modes) {
          setAdapterModes(adapters.modes);
        }
      } catch (e) {}
    }

    loadInitialData();
  }, []);

  // Switch demo user
  const handleSwitchUser = async (role: string, email?: string, password?: string) => {
    setAuthError('');
    const user = initialUsers.find((u) => u.role === role) || initialUsers[0];
    setCurrentUser(user);
    setActiveUserContext(user.role, user.id);

    // Instant scoping & offline guarantees
    if (role === 'BIDDER_VENDOR') {
      setSelectedBidderId('bidder-01');
      setBidders(initialBidders.filter((b) => b.id === 'bidder-01'));
    } else {
      setBidders(initialBidders);
    }

    // Role toast feedback
    const toastDetails: Record<string, { title: string; desc: string }> = {
      PROCUREMENT_OFFICER: {
        title: 'Rajesh Kumar • Senior Procurement Officer',
        desc: 'Full Adjudication Authority: Create Tenders, Override Checks, Final Qualified/Disqualified Decisions.',
      },
      COMPLIANCE_ANALYST: {
        title: 'Priya Sharma • Technical Compliance Analyst',
        desc: 'Vigilance & QA Review Mode: Inspect statutory evidence & discrepancy audit. Read-Only (no create/override).',
      },
      BIDDER_VENDOR: {
        title: 'Amit Patel • Bidder Representative (ABC Technologies)',
        desc: 'Vendor Privacy Mode: Review your bid status, respond to clarifications & upload evidence. Competitor data hidden.',
      },
      ADMIN: {
        title: 'System Administrator • GeM Nodal Admin',
        desc: 'Platform Operations: Inspect relational database, configure statutory adapters & audit engine.',
      },
    };

    setRoleToast({
      role: user.role,
      name: user.name,
      title: toastDetails[user.role]?.title || `${user.name} (${user.role})`,
      desc: toastDetails[user.role]?.desc || user.designation,
    });
    setTimeout(() => setRoleToast(null), 4000);

    try {
      await loginAsRole(user.role, email || user.email, password);
      setIsAuthenticated(true);
      const [updatedBidders, updatedAudits] = await Promise.all([fetchBidders(), fetchAuditTrail()]);
      if (Array.isArray(updatedBidders) && updatedBidders.length > 0) setBidders(updatedBidders);
      if (Array.isArray(updatedAudits) && updatedAudits.length > 0) setAuditEvents(updatedAudits);
    } catch (e) {
      setIsAuthenticated(false);
      setActiveTab('LOGIN');
      setAuthError(e instanceof Error ? e.message : 'Sign-in failed. Please check the selected account and try again.');
    }

    const newAudit: AuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorUserId: user.id,
      actorName: user.name,
      actorRole: user.designation,
      action: 'USER_ROLE_SWITCH',
      entityType: 'TENDER',
      entityId: user.id,
      summary: `Active user switched to ${user.name} (${user.role}).`,
      ruleVersion: 'v2.4-2026',
    };
    setAuditEvents((prev) => [newAudit, ...prev]);
  };

  // Run AI & deterministic verification
  const handleRunVerification = async (submissionId: string) => {
    if (!['PROCUREMENT_OFFICER', 'COMPLIANCE_ANALYST'].includes(currentUser.role)) return;
    try {
      const data = await runVerificationPipeline(submissionId);
      if (data?.submission) {
        setSubmissions((prev) =>
          prev.map((s) => (s.id === submissionId ? { ...s, ...data.submission } : s))
        );
      }
      if (Array.isArray(data?.results)) {
        setVerificationResults((prev) =>
          prev.map((r) => {
            const updated = data.results?.find((ur: any) => ur.id === r.id);
            return updated || r;
          })
        );
      }

      // Add audit event
      const newAudit: AuditEvent = {
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actorUserId: currentUser.id,
        actorName: currentUser.name,
        actorRole: currentUser.designation,
        action: 'VERIFICATION_EXECUTED',
        entityType: 'VERIFICATION',
        entityId: submissionId,
        summary: `AI verification pipeline and deterministic rules engine completed. New score: ${data?.score || 82}%.`,
        ruleVersion: 'v2.4-2026',
      };
      setAuditEvents((prev) => [newAudit, ...prev]);
    } catch (e) {
      console.error('Verification run error:', e);
    }
  };

  // Officer override of specific check
  const handleOverrideResult = async (resultId: string, newStatus: string, reason: string) => {
    if (currentUser.role !== 'PROCUREMENT_OFFICER') return;
    try {
      await overrideVerificationResult(resultId, newStatus, reason);

      setVerificationResults((prev) =>
        prev.map((r) => {
          if (r.id === resultId) {
            return {
              ...r,
              status: newStatus as any,
              officerOverridden: true,
              overrideReason: reason,
              overriddenByUserId: currentUser.id,
            };
          }
          return r;
        })
      );

      // Re-calculate submission score
      setSubmissions((prev) =>
        prev.map((sub) => {
          if (sub.bidderId === selectedBidderId) {
            const updatedScore = Math.min(100, sub.overallScore + (newStatus === 'PASS' ? 8 : -8));
            return {
              ...sub,
              overallScore: updatedScore,
              checksPassed: newStatus === 'PASS' ? sub.checksPassed + 1 : sub.checksPassed,
              checksReview: sub.checksReview > 0 ? sub.checksReview - 1 : 0,
            };
          }
          return sub;
        })
      );

      const newAudit: AuditEvent = {
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actorUserId: currentUser.id,
        actorName: currentUser.name,
        actorRole: currentUser.designation,
        action: 'OFFICER_OVERRIDE',
        entityType: 'VERIFICATION',
        entityId: resultId,
        summary: `Officer override applied by ${currentUser.name}: requirement marked ${newStatus}. Reason: "${reason}".`,
        ruleVersion: 'v2.4-2026',
      };
      setAuditEvents((prev) => [newAudit, ...prev]);
    } catch (e) {
      console.error('Failed to override:', e);
    }
  };

  // Final Decision confirmation
  const handleConfirmDecision = async (decisionData: any) => {
    if (currentUser.role !== 'PROCUREMENT_OFFICER') return;
    try {
      await recordOfficerDecision(decisionData);

      setSubmissions((prev) =>
        prev.map((s) => {
          if (s.id === decisionData.submissionId) {
            let newStatus: any = 'REVIEW_REQUIRED';
            if (decisionData.decision === 'APPROVE_QUALIFIED') newStatus = 'QUALIFIED';
            if (decisionData.decision === 'REJECT_DISQUALIFIED') newStatus = 'DISQUALIFIED';
            if (decisionData.decision === 'SEND_CLARIFICATION') newStatus = 'CLARIFICATION_REQUESTED';

            return {
              ...s,
              status: newStatus,
              decidedAt: new Date().toISOString(),
            };
          }
          return s;
        })
      );

      const newAudit: AuditEvent = {
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actorUserId: currentUser.id,
        actorName: currentUser.name,
        actorRole: currentUser.designation,
        action: 'FINAL_DECISION_RECORDED',
        entityType: 'DECISION',
        entityId: decisionData.submissionId,
        summary: `Formal decision recorded: ${decisionData.decision}. Remarks: "${decisionData.remarks}".`,
        ruleVersion: 'v2.4-2026',
      };
      setAuditEvents((prev) => [newAudit, ...prev]);
    } catch (e) {
      console.error('Failed to save decision:', e);
    }
  };

  // New tender creation callback
  const handleTenderCreated = (newTender: Tender) => {
    setTenders((prev) => [newTender, ...prev]);

    const newAudit: AuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorUserId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.designation,
      action: 'TENDER_CREATED',
      entityType: 'TENDER',
      entityId: newTender.id,
      summary: `Tender ${newTender.tenderId} successfully created and published on evaluation desk.`,
      ruleVersion: 'v2.4-2026',
    };
    setAuditEvents((prev) => [newAudit, ...prev]);
  };

  // Vendor Clarification Response handler
  const handleRespondClarification = async (data: any) => {
    try {
      const response: any = await respondToClarification(data);

      if (response?.document) {
        setDocuments((previous) => [...previous.filter((document) => document.id !== response.document.id), response.document]);
      }
      if (response?.submission) {
        setSubmissions((previous) => previous.map((submission) => submission.id === response.submission.id ? { ...submission, ...response.submission } : submission));
      }
      if (response?.turnoverResult) {
        setVerificationResults((previous) => previous.map((result) => result.id === response.turnoverResult.id ? { ...result, ...response.turnoverResult } : result));
      }

      // Refresh verification results and submissions from server
      const freshBidders = await fetchBidders();
      if (freshBidders.length) {
        setBidders(freshBidders);
        const freshSubmissions = freshBidders.flatMap((b: any) => b.submissions || []);
        if (freshSubmissions.length) setSubmissions(freshSubmissions);
      }

      const newAudit: AuditEvent = {
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actorUserId: currentUser.id,
        actorName: currentUser.name,
        actorRole: currentUser.designation,
        action: 'CLARIFICATION_RESPONSE_SUBMITTED',
        entityType: 'DOCUMENT',
        entityId: data.submissionId,
        summary: `Vendor submitted clarification response: "${data.documentTitle}". MSE turnover exemption claim filed under PPP 2012.`,
        ruleVersion: 'v2.4-2026',
      };
      setAuditEvents((prev) => [newAudit, ...prev]);
    } catch (e) {
      console.error('Failed to submit clarification:', e);
    }
  };

  if (!authChecked) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm font-semibold text-slate-600">Loading secure session…</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <GovNoticeBanner onOpenAdapters={() => undefined} />
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          <LoginView
            currentUser={currentUser}
            onLoginSuccess={(role, email, password) => {
              return handleSwitchUser(role, email, password);
            }}
            onNavigateToDashboard={() => setActiveTab('DASHBOARD')}
            authError={authError}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Government Notice Banner */}
      <GovNoticeBanner onOpenAdapters={() => setIsSourceGatewayModalOpen(true)} />

      {/* Main Official Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        onOpenAdapters={() => setIsSourceGatewayModalOpen(true)}
        onOpenDatabase={() => setIsDatabaseModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {!['LANDING', 'LOGIN', 'DASHBOARD'].includes(activeTab) && (
          <button
            onClick={() => setActiveTab('DASHBOARD')}
            className="mb-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
        )}
        {activeTab === 'LANDING' && (
          <LandingView
            onGetStarted={() => setActiveTab('DASHBOARD')}
            onExploreWorkflow={() => {
              setActiveTab('EVALUATION');
              setSelectedBidderId('bidder-01');
            }}
          />
        )}

        {activeTab === 'LOGIN' && (
          <LoginView
            currentUser={currentUser}
            onLoginSuccess={(role, email, password) => {
              return handleSwitchUser(role, email, password);
            }}
            onNavigateToDashboard={() => setActiveTab('DASHBOARD')}
            authError={authError}
          />
        )}

        {activeTab === 'DASHBOARD' && (
          <DashboardView
            currentUser={currentUser}
            tenders={tenders}
            submissions={submissions}
            bidders={bidders}
            onSelectTender={() => {
              setActiveTab('EVALUATION');
            }}
            onSelectBidder={(bId) => {
              setSelectedBidderId(bId);
              setActiveTab('EVALUATION');
            }}
            onOpenCreateTender={openCreateTender}
            onOpenAdapters={() => setIsSourceGatewayModalOpen(true)}
          />
        )}

        {activeTab === 'TENDERS' && (
          <TenderList
            tenders={tenders}
            submissions={submissions}
            onSelectTender={() => setActiveTab('EVALUATION')}
            onOpenCreateTender={openCreateTender}
            canCreateTender={currentUser.role === 'PROCUREMENT_OFFICER'}
          />
        )}

        {(activeTab === 'EVALUATION' || activeTab === 'COMPLIANCE_MATRIX') && (
          <BidderEvaluationView
            currentUser={currentUser}
            tenders={tenders}
            bidders={bidders}
            submissions={submissions}
            selectedBidderId={selectedBidderId}
            onSelectBidder={(id) => setSelectedBidderId(id)}
            requirements={requirements}
            verificationResults={verificationResults}
            documents={documents}
            onRunVerification={handleRunVerification}
            onOverrideResult={handleOverrideResult}
            onConfirmDecision={handleConfirmDecision}
            onRespondClarification={handleRespondClarification}
          />
        )}

        {activeTab === 'AUDIT_TRAIL' && (
          <AuditTrailView events={auditEvents} currentUser={currentUser} />
        )}
      </main>

      {/* Footer with Government Trust Notes */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <div className="font-bold text-slate-800 flex items-center justify-center sm:justify-start gap-1.5">
              <span>BidSure Verification Platform</span>
              <span className="text-slate-300">·</span>
              <span className="font-mono text-blue-800">CPCL Procurement Operations</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Built for Smart India Hackathon (SIH 2026) · Problem Statement 26100 · General Financial Rules (GFR 2017) Compliant
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 text-xs font-medium">
            <button
              onClick={() => setActiveTab('DASHBOARD')}
              className="hover:text-blue-700 cursor-pointer"
            >
              Dashboard
            </button>
            <span>·</span>
            <button
              onClick={() => setActiveTab('TENDERS')}
              className="hover:text-blue-700 cursor-pointer"
            >
              Tenders
            </button>
            <span>·</span>
            <button
              onClick={() => setActiveTab('EVALUATION')}
              className="hover:text-blue-700 cursor-pointer"
            >
              Evaluation
            </button>
            <span>·</span>
            <button
              onClick={() => setActiveTab('AUDIT_TRAIL')}
              className="hover:text-blue-700 cursor-pointer"
            >
              Audit
            </button>
            <span>·</span>
            <button
              onClick={() => setIsSourceGatewayModalOpen(true)}
              className="hover:text-blue-700 cursor-pointer text-emerald-700 font-semibold"
            >
              Adapters
            </button>
            <span>·</span>
            <button
              onClick={() => setIsDatabaseModalOpen(true)}
              className="hover:text-blue-700 cursor-pointer text-purple-700 font-semibold"
            >
              Database
            </button>
          </div>
        </div>
      </footer>

      {/* Statutory Source Gateway Modal */}
      <SourceGatewayModal
        isOpen={isSourceGatewayModalOpen}
        onClose={() => setIsSourceGatewayModalOpen(false)}
        modes={adapterModes}
        onModesUpdated={(newModes) => setAdapterModes(newModes)}
      />

      {/* Create Tender Modal */}
      <CreateTenderModal
        isOpen={isCreateTenderModalOpen}
        onClose={() => {
          setIsCreateTenderModalOpen(false);
          if (window.history.state?.bidsureModal === 'create-tender') window.history.back();
        }}
        onTenderCreated={handleTenderCreated}
      />

      {/* Floating Role Switch Feedback Toast */}
      {roleToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-slate-900 text-white p-4 rounded-xl shadow-2xl border border-slate-700 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 font-bold text-sm shadow-xs ${
              roleToast.role === 'PROCUREMENT_OFFICER'
                ? 'bg-blue-600 text-white'
                : roleToast.role === 'COMPLIANCE_ANALYST'
                ? 'bg-purple-600 text-white'
                : roleToast.role === 'BIDDER_VENDOR'
                ? 'bg-emerald-600 text-white'
                : 'bg-amber-600 text-white'
            }`}
          >
            ✓
          </div>
          <div className="flex-1 pr-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-300">
                Active Profile Switched
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-slate-800 text-slate-300 border border-slate-700">
                {roleToast.role}
              </span>
            </div>
            <div className="text-xs font-bold text-slate-100 mt-0.5">{roleToast.title}</div>
            <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">{roleToast.desc}</div>
          </div>
          <button
            onClick={() => setRoleToast(null)}
            className="text-slate-400 hover:text-white text-xs cursor-pointer p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Relational Database & Entity Relationship Inspector Modal */}
      <DatabaseInspectorModal
        isOpen={isDatabaseModalOpen}
        onClose={() => setIsDatabaseModalOpen(false)}
        tenders={tenders}
        bidders={bidders}
        submissions={submissions}
        verificationResults={verificationResults}
        documents={documents}
        auditEvents={auditEvents}
        users={initialUsers}
      />
    </div>
  );
}
