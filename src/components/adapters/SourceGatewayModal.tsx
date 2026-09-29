import React, { useState } from 'react';
import {
  ShieldCheck,
  X,
  Radio,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Info,
  Server,
  Layers,
} from 'lucide-react';
import { updateAdapterMode } from '../../services/api.ts';

interface SourceGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  modes: Record<string, 'LIVE' | 'MOCK' | 'MANUAL'>;
  onModesUpdated: (newModes: Record<string, 'LIVE' | 'MOCK' | 'MANUAL'>) => void;
}

export const SourceGatewayModal: React.FC<SourceGatewayModalProps> = ({
  isOpen,
  onClose,
  modes,
  onModesUpdated,
}) => {
  const [localModes, setLocalModes] = useState(modes);

  if (!isOpen) return null;

  const adapters = [
    {
      key: 'GSTN',
      name: 'GSTN Taxpayer Verification Gateway',
      authority: 'Goods and Services Tax Network (GSTN)',
      description: 'Verifies active registration, return filing history (GSTR-3B/1), and state jurisdiction.',
      endpoint: 'https://services.gst.gov.in/services/searchtp',
      statusNote: 'Authorized API integration path. Prototype simulates official response schema.',
    },
    {
      key: 'UDYAM',
      name: 'Udyam MSME Registration Gateway',
      authority: 'Ministry of Micro, Small and Medium Enterprises',
      description: 'Verifies enterprise size (Micro/Small/Medium), major activity, and NIC-2008 2-digit classification codes.',
      endpoint: 'https://udyamregistration.gov.in/verify',
      statusNote: 'Permitted enterprise verification route.',
    },
    {
      key: 'INCOME_TAX',
      name: 'Income Tax PAN & e-Filing Gateway',
      authority: 'Central Board of Direct Taxes (CBDT)',
      description: 'Validates operative PAN status, name cross-match, and ITR-V acknowledgement numbers for AY 23-24 & 24-25.',
      endpoint: 'https://eportal.incometax.gov.in',
      statusNote: 'Simulated IT e-filing verification response.',
    },
    {
      key: 'EPFO',
      name: 'EPFO Unified Establishment Gateway',
      authority: 'Employees\' Provident Fund Organisation',
      description: 'Validates establishment code, regular Electronic Challan cum Return (ECR) monthly filings, and member count.',
      endpoint: 'https://unifiedportal-emp.epfindia.gov.in',
      statusNote: 'Public establishment search exists; automated query via permitted access.',
    },
    {
      key: 'ESIC',
      name: 'ESIC Shram Suvidha Gateway',
      authority: 'Ministry of Labour & Employment',
      description: 'Checks employee state insurance employer registration and active compliance status.',
      endpoint: 'https://www.esic.gov.in',
      statusNote: 'Statutory social security validation.',
    },
    {
      key: 'DEBARMENT',
      name: 'Central GeM & CPSE Debarment Registry',
      authority: 'Ministry of Finance / GeM SPV',
      description: 'Authoritative index cross-referencing blacklisting orders issued under GFR 2017 Rule 151.',
      endpoint: 'https://gem.gov.in/debarment-list',
      statusNote: 'Authoritative check for immediate knockout disqualifications.',
    },
    {
      key: 'DIGILOCKER',
      name: 'DigiLocker & API Setu Consent Architecture',
      authority: 'National e-Governance Division (MeitY)',
      description: 'Enables cryptographically signed electronic document retrieval directly from issuing statutory bodies.',
      endpoint: 'https://apisetu.gov.in',
      statusNote: 'Demonstrating consent + partner architecture with sample verified payloads.',
    }
  ];

  const handleToggleMode = async (adapterKey: string, newMode: 'LIVE' | 'MOCK' | 'MANUAL') => {
    setLocalModes((prev) => ({ ...prev, [adapterKey]: newMode }));
    try {
      const res = await updateAdapterMode(adapterKey, newMode);
      if (res?.modes) onModesUpdated(res.modes);
    } catch (e) {
      console.error('Failed to update adapter mode:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 text-slate-900 overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Statutory Source Adapter Gateway
              </h3>
              <p className="text-xs text-slate-500">
                Configure data provenance (LIVE, MOCK or MANUAL) per statutory register
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ethical Transparency Banner */}
        <div className="p-4 bg-amber-50/80 border-b border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Critical SIH Prototype Principle:</strong> Every statutory check displays its exact verification source state. During hackathon evaluation, adapters run in <strong>MOCK mode</strong> using authentic schemas to respect official API restrictions and avoid unauthorized scraping.
          </div>
        </div>

        {/* Adapter List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {adapters.map((adp) => {
            const currentMode = localModes[adp.key] || 'MOCK';

            return (
              <div
                key={adp.key}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{adp.name}</span>
                      <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {adp.key}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">{adp.authority}</div>
                  </div>

                  {/* Mode Switcher Segmented Control */}
                  <div className="flex items-center p-1 bg-slate-100 rounded-lg shrink-0">
                    <button
                      onClick={() => handleToggleMode(adp.key, 'LIVE')}
                      className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                        currentMode === 'LIVE'
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Direct production API connection (Requires authorized credentials)"
                    >
                      LIVE API
                    </button>
                    <button
                      onClick={() => handleToggleMode(adp.key, 'MOCK')}
                      className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                        currentMode === 'MOCK'
                          ? 'bg-sky-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="High-fidelity synthetic schema adapter"
                    >
                      MOCK (Demo)
                    </button>
                    <button
                      onClick={() => handleToggleMode(adp.key, 'MANUAL')}
                      className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                        currentMode === 'MANUAL'
                          ? 'bg-purple-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Officer manual portal inspection"
                    >
                      MANUAL
                    </button>
                  </div>
                </div>

                <p className="text-slate-600 text-xs leading-relaxed">{adp.description}</p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                  <span>{adp.statusNote}</span>
                  <a
                    href={adp.endpoint}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-700 hover:text-blue-800 font-semibold inline-flex items-center gap-1"
                  >
                    Portal Reference <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Current Active Mode: <strong className="text-sky-700 font-mono">MOCK (Safe Sandbox)</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg cursor-pointer"
          >
            Close Gateway Settings
          </button>
        </div>
      </div>
    </div>
  );
};
