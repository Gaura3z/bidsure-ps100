import React, { useState } from 'react';
import {
  X,
  FilePlus2,
  Sparkles,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  FileText,
  Loader2,
} from 'lucide-react';
import { extractRequirementsAI, createTender } from '../../services/api.ts';
import { Tender } from '../../types/index.ts';

interface CreateTenderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTenderCreated: (newTender: Tender) => void;
}

export const CreateTenderModal: React.FC<CreateTenderModalProps> = ({
  isOpen,
  onClose,
  onTenderCreated,
}) => {
  const [step, setStep] = useState<number>(1);
  const [title, setTitle] = useState('High-Density Server & SAN Storage Cluster Procurement');
  const [tenderId, setTenderId] = useState('CPCL/IT/2026/089');
  const [category, setCategory] = useState<'Goods' | 'Works' | 'Services' | 'Consultancy'>('Goods');
  const [estimatedValue, setEstimatedValue] = useState<number>(65000000); // ₹6.5 Cr
  const [deadline, setDeadline] = useState('2026-11-20');
  const [tenderDocumentText, setTenderDocumentText] = useState(
    'Procurement of Enterprise Hyperconverged Infrastructure for CPCL Data Centre. Bidders must have active GSTIN, valid PAN, minimum 3 years CPSE experience, audited turnover >= 5 Crore for last 3 years with CA UDIN, and tender-specific OEM Manufacturer Authorization with 5-year 24x7 onsite warranty.'
  );
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedRequirements, setExtractedRequirements] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleExtractAI = async () => {
    setIsExtracting(true);
    try {
      const data = await extractRequirementsAI(tenderDocumentText, title);
      setExtractedRequirements(data.requirements || []);
      setStep(3);
    } catch (e) {
      console.error('AI extraction error:', e);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleCreate = async () => {
    setIsSubmitting(true);
    try {
      const newTender = await createTender({
        title,
        tenderId,
        category,
        estimatedValue,
        submissionDeadline: new Date(deadline).toISOString(),
        requirements: extractedRequirements.length > 0 ? extractedRequirements : [
          {
            clauseNumber: 'Clause 3.1',
            category: 'STATUTORY',
            title: 'GST Registration Verification',
            description: 'Active GSTIN registered under the GST Act.',
            isMandatory: true,
            isKnockout: true,
            thresholdValue: 'ACTIVE',
            sourceAdapter: 'GSTN',
          },
          {
            clauseNumber: 'Clause 5.1',
            category: 'FINANCIAL',
            title: 'Minimum Annual Turnover',
            description: `Audited turnover of minimum ₹${(estimatedValue / 10000000).toFixed(1)} Crore for past 3 financial years.`,
            isMandatory: true,
            isKnockout: true,
            thresholdValue: String(estimatedValue),
            sourceAdapter: 'MANUAL',
          }
        ],
      });
      onTenderCreated(newTender);
      onClose();
    } catch (err) {
      console.error('Failed to create tender:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 text-slate-900 relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <FilePlus2 className="w-5 h-5 text-blue-700" />
            <h3 className="font-extrabold text-base text-slate-900">
              Create / Upload Tender Package
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Navigation */}
        <div className="my-4 grid grid-cols-4 gap-2 text-center text-xs">
          <button
            onClick={() => setStep(1)}
            className={`p-2 rounded-lg font-semibold transition-colors cursor-pointer ${
              step === 1 ? 'bg-blue-50 text-blue-700 border border-blue-300' : 'bg-slate-50 text-slate-500'
            }`}
          >
            1. Details
          </button>
          <button
            onClick={() => setStep(2)}
            className={`p-2 rounded-lg font-semibold transition-colors cursor-pointer ${
              step === 2 ? 'bg-blue-50 text-blue-700 border border-blue-300' : 'bg-slate-50 text-slate-500'
            }`}
          >
            2. Document
          </button>
          <button
            onClick={() => setStep(3)}
            className={`p-2 rounded-lg font-semibold transition-colors cursor-pointer ${
              step === 3 ? 'bg-blue-50 text-blue-700 border border-blue-300' : 'bg-slate-50 text-slate-500'
            }`}
          >
            3. Clauses ({extractedRequirements.length})
          </button>
          <button
            onClick={() => setStep(4)}
            className={`p-2 rounded-lg font-semibold transition-colors cursor-pointer ${
              step === 4 ? 'bg-blue-50 text-blue-700 border border-blue-300' : 'bg-slate-50 text-slate-500'
            }`}
          >
            4. Review
          </button>
        </div>

        {/* Step 1: Tender Details */}
        {step === 1 && (
          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Tender Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Tender ID</label>
                <input
                  type="text"
                  value={tenderId}
                  onChange={(e) => setTenderId(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs"
                >
                  <option value="Goods">Goods</option>
                  <option value="Works">Works</option>
                  <option value="Services">Services</option>
                  <option value="Consultancy">Consultancy</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Estimated Value (INR)</label>
                <input
                  type="number"
                  value={estimatedValue}
                  onChange={(e) => setEstimatedValue(Number(e.target.value))}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg font-mono text-xs"
                />
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  ₹{(estimatedValue / 10000000).toFixed(2)} Crore
                </span>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Submission Deadline</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 bg-blue-700 text-white rounded-lg text-xs font-semibold hover:bg-blue-800 cursor-pointer"
              >
                Next: Ingest Document
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Tender Document Text & AI Extraction */}
        {step === 2 && (
          <div className="space-y-3 text-xs">
            <label className="block text-slate-700 font-semibold">
              Tender Document Clauses / Scope of Work
            </label>
            <textarea
              value={tenderDocumentText}
              onChange={(e) => setTenderDocumentText(e.target.value)}
              className="w-full p-3 bg-white border border-slate-300 rounded-lg text-xs h-32 leading-relaxed"
              placeholder="Paste tender specifications, eligibility criteria, or turnover requirements..."
            />

            <div className="p-4 border-2 border-dashed border-blue-200 rounded-xl bg-blue-50/40 text-center">
              <UploadCloud className="w-8 h-8 text-blue-600 mx-auto mb-1" />
              <div className="font-semibold text-slate-800">
                CPCL_IT_Tender_2026_089.pdf · Demo package loaded
              </div>
              <p className="text-[11px] text-slate-500">Tender scope text is ready for AI requirement extraction · GeM Standard Bid Document v4.0</p>
            </div>

            <div className="pt-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded text-xs cursor-pointer"
              >
                Back
              </button>

              <button
                type="button"
                onClick={handleExtractAI}
                disabled={isExtracting}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Extracting Clauses with Gemini...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Extract Requirements with AI
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Extracted Requirements Review */}
        {step === 3 && (
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">
                AI Extracted Eligibility Clauses ({extractedRequirements.length})
              </span>
              <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium border border-emerald-200">
                Grounded in Document
              </span>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {extractedRequirements.map((req, idx) => (
                <div key={idx} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/60">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{req.title}</span>
                    <span className="text-[10px] font-mono bg-slate-200 px-1.5 py-0.5 rounded">
                      {req.clauseNumber}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1">{req.description}</div>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-500 font-mono">
                    <span>Source: {req.sourceAdapter}</span>
                    <span>·</span>
                    <span className="text-rose-700 font-bold">
                      {req.isKnockout ? 'Knockout Rule' : 'Scored Rule'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded text-xs cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Next: Review & Publish
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Final Publish Confirmation */}
        {step === 4 && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Tender ID:</span>
                <span className="font-bold font-mono text-slate-900">{tenderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Title:</span>
                <span className="font-semibold text-slate-900">{title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Estimated Value:</span>
                <span className="font-mono font-bold text-slate-900">
                  ₹{(estimatedValue / 10000000).toFixed(2)} Cr
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Compliance Clauses:</span>
                <span className="font-bold text-blue-900 font-mono">
                  {extractedRequirements.length || 6} Defined
                </span>
              </div>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg text-[11px] text-blue-900">
              Publishing will make this tender active in the BIDSure evaluation pipeline and enable bidder document ingestion.
            </div>

            <div className="pt-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded text-xs cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={isSubmitting}
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                {isSubmitting ? 'Publishing...' : 'Publish Tender Package'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
