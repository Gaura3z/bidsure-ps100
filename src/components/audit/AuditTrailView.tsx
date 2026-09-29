import React, { useState } from 'react';
import {
  History,
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  Upload,
  Sparkles,
  Search,
  Filter,
  Lock,
  Hash,
  User,
} from 'lucide-react';
import { AuditEvent, User as UserType } from '../../types/index.ts';

interface AuditTrailViewProps {
  events: AuditEvent[];
  currentUser?: UserType;
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({ events, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntityType, setSelectedEntityType] = useState<string>('ALL');

  const isBidder = currentUser?.role === 'BIDDER_VENDOR';

  const filteredEvents = events.filter((e) => {
    // If user is a bidder, protect confidentiality: only show events concerning their submission
    if (isBidder) {
      const isVendorEvent =
        e.actorUserId === currentUser?.id ||
        e.entityId === 'sub-01' ||
        e.entityId === 'bidder-01' ||
        e.summary.toLowerCase().includes('abc technologies') ||
        e.action === 'TENDER_CREATED';

      if (!isVendorEvent) return false;
    }

    const matchesSearch =
      e.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.action.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      selectedEntityType === 'ALL' || e.entityType === selectedEntityType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-blue-700" />
              <h2 className="text-xl font-extrabold text-slate-900">
                {isBidder ? 'My Submission Audit Trail & Provenance' : 'Statutory Compliance Audit Trail & History'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {isBidder
                ? 'Time-stamped audit record of your submitted documents, verification receipts, and official communications.'
                : 'Immutable, time-stamped log of document extractions, gateway checks, rule evaluations, and officer overrides under GFR 2017.'}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-800">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Cryptographic Log Integrity Active</span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search audit actions, actors, or ref numbers..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedEntityType}
              onChange={(e) => setSelectedEntityType(e.target.value)}
              className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium cursor-pointer"
            >
              <option value="ALL">All Event Types</option>
              <option value="TENDER">Tenders</option>
              <option value="BID_SUBMISSION">Submissions</option>
              <option value="DOCUMENT">Documents</option>
              <option value="VERIFICATION">Rules & Verification</option>
              <option value="DECISION">Officer Decisions</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chronological Timeline Cards (matching screenshot 11) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
        <div className="relative border-l-2 border-slate-200 ml-4 space-y-6">
          {filteredEvents.map((evt) => (
            <div key={evt.id} className="relative pl-6 group">
              {/* Timeline Node Dot */}
              <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-blue-600 group-hover:scale-125 transition-transform" />

              <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 hover:border-slate-300 hover:bg-slate-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 font-mono text-[11px] bg-slate-200 px-2 py-0.5 rounded">
                      {evt.action}
                    </span>
                    <span className="text-slate-500 font-medium">
                      By <strong className="text-slate-800">{evt.actorName}</strong> ({evt.actorRole})
                    </span>
                  </div>

                  <span className="text-slate-500 font-mono text-[11px]">
                    {new Date(evt.timestamp).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <p className="text-xs text-slate-800 mt-2 font-medium leading-relaxed">
                  {evt.summary}
                </p>

                {/* Technical Hashes and Rules */}
                <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-600 font-mono">
                  {evt.evidenceHash && (
                    <div className="flex items-center gap-1">
                      <Hash className="w-3 h-3 text-slate-500" />
                      <span>SHA-256 Hash: {evt.evidenceHash.slice(0, 16)}...</span>
                    </div>
                  )}
                  {evt.ruleVersion && (
                    <div className="text-slate-600">
                      Rule Version: <strong className="text-slate-700">{evt.ruleVersion}</strong>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
