import React, { useState } from 'react';
import {
  X,
  FileCheck2,
  Upload,
  AlertTriangle,
  Building,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Send,
  Sparkles,
} from 'lucide-react';
import { Bidder, BidSubmission, Tender } from '../../types/index.ts';

interface BidderClarificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  bidder: Bidder;
  submission: BidSubmission;
  tender: Tender;
  requiredDocuments: string[];
  onSubmitResponse: (data: {
    documentTitle: string;
    docType: string;
    remarks: string;
    file: File;
  }) => Promise<void>;
}

export const BidderClarificationModal: React.FC<BidderClarificationModalProps> = ({
  isOpen,
  onClose,
  bidder,
  submission,
  tender,
  requiredDocuments,
  onSubmitResponse,
}) => {
  const [selectedDocType, setSelectedDocType] = useState(requiredDocuments[0] || 'Supporting Document');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [remarks, setRemarks] = useState('Submitting the requested evidence for this tender.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmedDeclaration, setConfirmedDeclaration] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmedDeclaration || !selectedFile) return;
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await onSubmitResponse({
        documentTitle: selectedFile.name,
        docType: selectedDocType,
        remarks,
        file: selectedFile,
      });
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1800);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'The evidence could not be submitted.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col text-slate-900 max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/80 border border-emerald-400 flex items-center justify-center text-white shrink-0">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">Bid Documents & Evidence Upload</span>
                <span className="text-[10px] font-mono bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded font-semibold">
                  Tender: {tender.tenderId}
                </span>
              </div>
              <p className="text-xs text-emerald-200 mt-0.5">
                Authorized Signatory Portal: <strong>{bidder.legalName}</strong> (PAN: {bidder.pan})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-950">
            Upload a separate PDF or image for each requested document. Each file will be linked to bid {submission.submissionRef} and remain pending review until the compliance team checks it.
          </div>

          {isSuccess ? (
            <div className="p-8 text-center space-y-3 bg-emerald-50 rounded-xl border border-emerald-200 animate-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-emerald-950">Document Submitted!</h3>
              <p className="text-xs text-emerald-800 max-w-md mx-auto leading-relaxed">
                Your evidence and formal justification have been recorded and forwarded to the CPCL Tender Committee for officer review.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {errorMessage && <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-rose-800">{errorMessage}</div>}
              {/* Document Type Selector */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Statutory Document Category <span className="text-rose-600">*</span>
                </label>
                <select
                  value={selectedDocType}
                  onChange={(e) => setSelectedDocType(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:bg-white focus:outline-hidden"
                >
                  {[...new Set([...requiredDocuments, 'MSE Turnover Exemption Certificate', 'Supporting Document'])].map((documentType) => (
                    <option key={documentType} value={documentType}>{documentType}</option>
                  ))}
                </select>
              </div>

              {/* Upload Dropzone Preview */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Upload Official Signed Document <span className="text-rose-600">*</span>
                </label>
                <div className="p-4 border-2 border-dashed border-emerald-400/80 bg-emerald-50/40 rounded-xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <span>{selectedFile?.name || 'No file selected'}</span>
                        <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded font-mono font-bold">
                          {selectedFile ? 'READY FOR UPLOAD' : 'REQUIRED'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {selectedFile ? `${Math.ceil(selectedFile.size / 1024)} KB · SHA-256 calculated on server` : 'PDF or PNG/JPEG/WebP · Maximum 10 MB'}
                      </div>
                    </div>
                  </div>

                  <label className="px-2.5 py-1.5 bg-white border border-slate-300 hover:border-slate-400 rounded-lg text-[11px] font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer shrink-0">
                    Choose File
                    <input
                      type="file"
                      accept="application/pdf,image/png,image/jpeg,image/webp"
                      className="sr-only"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    />
                  </label>
                </div>
              </div>

              {/* Written Justification Remarks */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Document notes for the review team
                </label>
                <textarea
                  rows={4}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs leading-relaxed focus:bg-white focus:outline-hidden"
                  placeholder="State statutory legal provisions, registration numbers, and clarifications..."
                  required
                />
              </div>

              {/* Legal Declaration */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2 text-[11px] text-slate-600">
                <input
                  type="checkbox"
                  id="confirmDeclaration"
                  checked={confirmedDeclaration}
                  onChange={(e) => setConfirmedDeclaration(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="confirmDeclaration" className="cursor-pointer leading-normal">
                  I hereby solemnly affirm as the Authorized Signatory of <strong>{bidder.legalName}</strong> that the documents submitted herein are genuine and authentic. Any false declaration shall attract disqualification under <strong>GFR 2017 Rule 175</strong> and GeM debarment.
                </label>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || !confirmedDeclaration || !selectedFile}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-2 cursor-pointer transition-all"
                >
                  {isSubmitting ? (
                    <span>Submitting to CPCL Committee...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Evidence for Officer Review</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
