import React from 'react';
import { Award, CheckCircle2, XCircle, AlertTriangle, FileText, Stamp, Hash, Calendar, Building } from 'lucide-react';
import { Bidder, TenderRequirement, VerificationResult } from '../../types/index.ts';

interface CACertificateEvidenceViewProps {
  bidder: Bidder | null;
  requirement: TenderRequirement | null;
  result: VerificationResult | null;
}

export const CACertificateEvidenceView: React.FC<CACertificateEvidenceViewProps> = ({
  bidder,
  requirement,
  result,
}) => {
  return (
    <div className="bg-amber-50/40 rounded-xl border border-amber-200/80 p-6 shadow-sm font-serif select-none relative overflow-hidden text-slate-800">
      {/* ICAI / Formal Header */}
      <div className="text-center border-b-2 border-double border-slate-400 pb-4 mb-4">
        <div className="text-lg sm:text-xl font-bold tracking-wider text-slate-900 uppercase">
          S R & ASSOCIATES
        </div>
        <div className="text-xs text-slate-600 font-sans tracking-wide">
          CHARTERED ACCOUNTANTS · FIRM REGISTRATION NO: 014298S
        </div>
        <div className="text-[11px] text-slate-500 font-sans mt-0.5">
          Level 4, Express Towers, Nariman Point, Mumbai - 400021
        </div>
      </div>

      {/* Certificate Title */}
      <div className="text-center my-4">
        <h4 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-widest inline-block border-b border-slate-700 pb-1">
          TO WHOMSOEVER IT MAY CONCERN
        </h4>
        <div className="text-[11px] font-sans font-semibold text-slate-500 mt-1">
          ANNUAL TURNOVER & NET WORTH COMPLIANCE CERTIFICATE
        </div>
      </div>

      {/* Certificate Text Body */}
      <div className="text-xs sm:text-sm leading-relaxed text-slate-800 space-y-3 font-sans">
        <p>
          This is to certify that M/s{' '}
          <strong className="font-serif font-bold text-slate-950 underline decoration-slate-400">
            {bidder?.legalName || 'ABC Technologies Pvt Ltd'}
          </strong>
          , having its registered office at{' '}
          <span className="font-serif">
            {bidder?.location || 'Pune, Maharashtra'} (PAN: {bidder?.pan || 'ABCDE1234F'}, GSTIN: {bidder?.gstin || '27ABCDE1234F1Z5'})
          </span>{' '}
          has achieved the following annual audited turnover based on the books of account and audited financial statements:
        </p>

        {/* Financial Year Table */}
        <div className="overflow-x-auto my-3 font-sans">
          <table className="w-full text-xs border border-slate-300">
            <thead className="bg-slate-100 text-slate-800 border-b border-slate-300 font-semibold">
              <tr>
                <th className="p-2 border-r border-slate-300 text-left">Financial Year</th>
                <th className="p-2 border-r border-slate-300 text-right">Turnover (INR)</th>
                <th className="p-2 text-right">Turnover (in Words)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr className="bg-red-50/60 font-semibold text-red-950">
                <td className="p-2 border-r border-slate-300">2023 - 2024</td>
                <td className="p-2 border-r border-slate-300 text-right font-mono text-red-700 font-bold">
                  ₹ 3,80,00,000
                </td>
                <td className="p-2 text-right">Rupees Three Crore Eighty Lakh Only</td>
              </tr>
              <tr className="text-slate-700">
                <td className="p-2 border-r border-slate-300">2022 - 2023</td>
                <td className="p-2 border-r border-slate-300 text-right font-mono">₹ 3,45,00,000</td>
                <td className="p-2 text-right">Rupees Three Crore Forty-Five Lakh</td>
              </tr>
              <tr className="text-slate-700">
                <td className="p-2 border-r border-slate-300">2021 - 2022</td>
                <td className="p-2 border-r border-slate-300 text-right font-mono">₹ 3,10,00,000</td>
                <td className="p-2 text-right">Rupees Three Crore Ten Lakh</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-[11px] text-slate-600">
          This certificate is issued at the specific request of the enterprise for participation in GeM tender procurement compliance verification.
        </p>
      </div>

      {/* Signature, Stamp & Official Seal Section */}
      <div className="mt-6 pt-4 border-t border-slate-300 flex items-end justify-between font-sans">
        <div className="space-y-1 text-xs">
          <div className="text-[11px] text-slate-500">Date: 12-August-2024</div>
          <div className="text-[11px] text-slate-500">Place: Mumbai</div>
          <div className="flex items-center gap-1 font-mono text-[10px] text-blue-900 bg-blue-100/70 px-2 py-0.5 rounded border border-blue-200 mt-1">
            <Hash className="w-3 h-3" />
            <span>UDIN: 24082415BKLP8901</span>
          </div>
        </div>

        {/* Visual CA Rubber Stamp & Signature */}
        <div className="relative flex flex-col items-center">
          {/* Circular Stamp Graphic */}
          <div className="w-24 h-24 rounded-full border-2 border-dashed border-blue-800 text-blue-900 flex flex-col items-center justify-center text-center p-1 transform -rotate-12 opacity-85 select-none bg-blue-50/30">
            <span className="text-[7px] font-black uppercase tracking-tight">S R & ASSOCIATES</span>
            <span className="text-[6px] font-bold text-blue-700">CHARTERED ACCOUNTANTS</span>
            <span className="text-[7px] font-mono font-bold my-0.5">MUMBAI</span>
            <span className="text-[6px] text-blue-600">FRN 014298S</span>
          </div>

          {/* Hand-drawn style Signature SVG overlay */}
          <svg className="absolute -top-3 left-2 w-28 h-14 text-blue-900 opacity-90" viewBox="0 0 100 40">
            <path
              d="M 5 25 Q 25 5 45 28 Q 65 35 75 15 Q 85 5 95 30"
              stroke="#1e3a8a"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M 20 28 L 85 28"
              stroke="#1e3a8a"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
          </svg>

          <div className="text-center mt-1">
            <div className="text-xs font-bold text-slate-900">CA S. R. Sharma</div>
            <div className="text-[10px] text-slate-600">Partner · M.No: 082415</div>
          </div>
        </div>
      </div>

      {/* Discrepancy Alert Banner */}
      <div className="mt-4 bg-red-50 border border-red-300 rounded-lg p-3 flex items-start gap-2.5 font-sans">
        <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
        <div className="text-xs">
          <div className="font-bold text-red-900">
            Statutory Knockout Requirement Discrepancy (Clause 5.2)
          </div>
          <div className="text-red-700 mt-0.5">
            Tender Minimum Required Turnover: <strong>₹ 5.00 Crore</strong>. Certified Extracted Turnover: <strong>₹ 3.80 Crore</strong>. Deficit: <strong>-₹ 1.20 Crore (24% shortfall)</strong>.
          </div>
        </div>
      </div>
    </div>
  );
};
