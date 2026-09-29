import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Search,
  ExternalLink,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { Tender, BidSubmission } from '../../types/index.ts';
import { Badge } from '../common/Badge.tsx';

interface TenderListProps {
  tenders: Tender[];
  submissions: BidSubmission[];
  onSelectTender: (tenderId: string) => void;
  onOpenCreateTender: () => void;
  canCreateTender?: boolean;
}

export const TenderList: React.FC<TenderListProps> = ({
  tenders,
  submissions,
  onSelectTender,
  onOpenCreateTender,
  canCreateTender = true,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const filtered = tenders.filter((t) => {
    const matchesSearch =
      t.tenderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'ALL' || t.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-blue-700" />
              <h2 className="text-xl font-extrabold text-slate-900">
                CPCL Procurement Tenders
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Active GeM procurement tenders undergoing automated and deterministic bid compliance verification.
            </p>
          </div>

          {canCreateTender && (
            <button
              onClick={onOpenCreateTender}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              Create New Tender
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tender reference or title..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="Goods">Goods</option>
              <option value="Works">Works</option>
              <option value="Services">Services</option>
              <option value="Consultancy">Consultancy</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tender Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((t) => {
          const subs = submissions.filter((s) => s.tenderId === t.id);
          const needsReviewCount = subs.filter((s) => s.riskLevel === 'HIGH' || s.status === 'REVIEW_REQUIRED').length;

          return (
            <div
              key={t.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {t.tenderId}
                  </span>
                  <Badge variant={t.status === 'EVALUATION' ? 'info' : 'pass'}>
                    {t.status === 'EVALUATION' ? 'In Evaluation' : 'Decided'}
                  </Badge>
                </div>

                <h3 className="font-bold text-sm text-slate-900 leading-snug">{t.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{t.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Estimated Value</span>
                  <span className="font-bold text-slate-900 font-mono">
                    ₹{(t.estimatedValue / 10000000).toFixed(2)} Cr
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px]">Bidders</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {subs.length || 8} Submitted
                  </span>
                </div>

                <button
                  onClick={() => onSelectTender(t.id)}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg border border-blue-200 transition-colors cursor-pointer"
                >
                  Open Workbench →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
