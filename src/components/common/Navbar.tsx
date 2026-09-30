import React, { useState } from 'react';
import {
  FileCheck2,
  LayoutDashboard,
  FileSpreadsheet,
  Users2,
  History,
  ShieldCheck,
  ChevronDown,
  UserCheck,
  Building2,
  ExternalLink,
  Database,
  Menu,
  X,
} from 'lucide-react';
import { ActiveTab, User } from '../../types/index.ts';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentUser: User;
  onSwitchUser: (role: string, email?: string, password?: string) => void | Promise<void>;
  onOpenAdapters: () => void;
  onOpenDatabase: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onSwitchUser,
  onOpenAdapters,
  onOpenDatabase,
}) => {
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Role-Based Navigation Items and Visibility
  const isBidder = currentUser.role === 'BIDDER_VENDOR';
  const isAdmin = currentUser.role === 'ADMIN';
  const isOfficer = currentUser.role === 'PROCUREMENT_OFFICER';
  const isAnalyst = currentUser.role === 'COMPLIANCE_ANALYST';
  const profileCredentials: Record<string, { email: string; password: string }> = {
    PROCUREMENT_OFFICER: { email: 'officer@cpcl.gov.in', password: 'Officer@BidSure2026!' },
    COMPLIANCE_ANALYST: { email: 'analyst@cpcl.gov.in', password: 'Analyst@BidSure2026!' },
    BIDDER_VENDOR: { email: 'bidder@abctechnologies.com', password: 'Bidder@BidSure2026!' },
  };
  const switchProfile = (role: string) => {
    const credentials = profileCredentials[role];
    onSwitchUser(role, credentials?.email, credentials?.password);
    setIsRoleDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { id: 'DASHBOARD' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard, visible: true },
    {
      id: 'TENDERS' as ActiveTab,
      label: isBidder ? 'Public Tenders' : 'Tenders',
      icon: FileSpreadsheet,
      visible: true,
    },
    {
      id: 'EVALUATION' as ActiveTab,
      label: isBidder ? 'My Bid Status' : isAnalyst ? 'Compliance Review' : 'Evaluation',
      icon: Users2,
      visible: true,
    },
    {
      id: 'AUDIT_TRAIL' as ActiveTab,
      label: isBidder ? 'My Submissions' : 'Audit Trail',
      icon: History,
      visible: true,
    },
  ].filter((item) => item.visible);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top Official Government Bar */}
      <div className="bg-slate-100/90 border-b border-slate-200/80 py-1.5 px-4 text-xs text-slate-700">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800 tracking-tight">
              <span className="text-base leading-none">🏛️</span>
              <span className="uppercase text-[11px] tracking-wider font-bold">Government of India</span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1.5 text-slate-600 font-medium">
              <Building2 className="w-3.5 h-3.5 text-blue-700" />
              <span>Ministry of Petroleum & Natural Gas</span>
            </div>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span className="text-blue-900 font-semibold hidden sm:inline">
              Chennai Petroleum Corporation Limited (CPCL)
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-slate-500 hidden md:inline">
              {isBidder ? 'GeM Participating Bidder Portal' : 'GeM Integrated Bid Evaluation Desk'}
            </span>
            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono font-medium">
              SIH 2026 • PS 26100
            </span>
          </div>
        </div>
      </div>

      {/* Quick Role Switcher Bar - 1-Click Profile Switching */}
      <div className="hidden bg-slate-900 border-b border-slate-800 py-1.5 px-4 text-xs text-white">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Active Role / Persona:
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-slate-800 text-slate-200 border border-slate-700">
              <span
                className={`w-2 h-2 rounded-full ${
                  isOfficer ? 'bg-blue-400' : isAnalyst ? 'bg-purple-400' : isBidder ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              <span>{currentUser.name}</span>
              <span className="text-[10px] text-slate-400 font-medium">({currentUser.designation})</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-slate-400 font-semibold mr-1 hidden sm:inline">Switch To:</span>
            
            {/* Profile 1: Rajesh Kumar */}
            <button
              onClick={() => onSwitchUser('PROCUREMENT_OFFICER')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isOfficer
                  ? 'bg-blue-600 text-white shadow-xs ring-1 ring-blue-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
              title="Procurement Officer (Full adjudication & tender creation rights)"
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-300" />
              <span>Rajesh Kumar</span>
              <span className="text-[9px] px-1 py-0.2 bg-blue-900/80 rounded font-normal text-blue-200 hidden md:inline">Officer</span>
            </button>

            {/* Profile 2: Priya Sharma */}
            <button
              onClick={() => onSwitchUser('COMPLIANCE_ANALYST')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isAnalyst
                  ? 'bg-purple-600 text-white shadow-xs ring-1 ring-purple-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
              title="Compliance Analyst (Read-only vigilance review mode - no create/override)"
            >
              <Users2 className="w-3.5 h-3.5 text-purple-300" />
              <span>Priya Sharma</span>
              <span className="text-[9px] px-1 py-0.2 bg-purple-900/80 rounded font-normal text-purple-200 hidden md:inline">Analyst (Read-Only)</span>
            </button>

            {/* Profile 3: Amit Patel */}
            <button
              onClick={() => onSwitchUser('BIDDER_VENDOR')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isBidder
                  ? 'bg-emerald-600 text-white shadow-xs ring-1 ring-emerald-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
              title="Bidder Vendor (ABC Technologies - own bid only, competitor data hidden)"
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-300" />
              <span>Amit Patel</span>
              <span className="text-[9px] px-1 py-0.2 bg-emerald-900/80 rounded font-normal text-emerald-200 hidden md:inline">Vendor (ABC Tech)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Header */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div
          className="flex items-center gap-3 cursor-pointer shrink-0"
          onClick={() => setActiveTab('DASHBOARD')}
        >
          <div className="w-10 h-10 rounded-lg bg-blue-700 flex items-center justify-center text-white shadow-sm ring-2 ring-blue-100">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center">
                Bid<span className="text-blue-700">Sure</span>
              </h1>
              <span className="bg-blue-50 text-blue-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-blue-200">
                PROTOTYPE
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium leading-tight">
              AI Integrated Bid Compliance Verification
            </p>
          </div>
        </div>

        {/* Primary Desktop Navigation Bar (Role-filtered) */}
        <nav className="hidden md:flex items-center gap-1 overflow-x-auto py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id || (item.id === 'EVALUATION' && activeTab === 'COMPLIANCE_MATRIX');

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-700 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}

          {/* Statutory Adapters: Only for Officers and Admins (Never for Bidders) */}
          {(isOfficer || isAdmin || isAnalyst) && (
            <button
              onClick={onOpenAdapters}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer whitespace-nowrap"
              title="Statutory Source Gateway Adapters (GSTN, Udyam, Income Tax, EPFO, ESIC, Debarment)"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Adapters
            </button>
          )}

          {/* Relational Database Inspector: Strictly for Administrators */}
          {isAdmin && (
            <button
              onClick={onOpenDatabase}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer whitespace-nowrap"
              title="Inspect Relational Database Schema & Entities"
            >
              <Database className="w-3.5 h-3.5 text-purple-600" />
              Database
            </button>
          )}
        </nav>

        {/* Right Tools: Role Switcher & Hamburger */}
        <div className="flex items-center gap-2">
          {/* User Profile & Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex items-center gap-2 p-1.5 pr-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer bg-white"
            >
              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs border border-blue-300">
                {currentUser.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-semibold text-slate-900 leading-tight flex items-center gap-1">
                  {currentUser.name}
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </div>
                <div className="text-[10px] text-slate-500 font-medium leading-none">
                  {currentUser.designation}
                </div>
              </div>
            </button>

            {/* Role Switcher Menu */}
            {isRoleDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-45"
                  onClick={() => setIsRoleDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 border-b border-slate-100">
                    <div className="font-semibold text-slate-900">Switch Demo Role</div>
                    <div className="text-[11px] text-slate-500">Test different user workflows</div>
                  </div>

                  <button
                    onClick={() => {
                      switchProfile('PROCUREMENT_OFFICER');
                    }}
                    className={`w-full px-3 py-2 text-left flex items-start gap-2 hover:bg-slate-50 cursor-pointer ${
                      currentUser.role === 'PROCUREMENT_OFFICER' ? 'bg-blue-50 text-blue-800' : 'text-slate-700'
                    }`}
                  >
                    <UserCheck className="w-4 h-4 mt-0.5 text-blue-600 shrink-0" />
                    <div>
                      <div className="font-semibold">Rajesh Kumar (Procurement Officer)</div>
                      <div className="text-[10px] text-slate-500">Full adjudication & decision rights</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      switchProfile('COMPLIANCE_ANALYST');
                    }}
                    className={`w-full px-3 py-2 text-left flex items-start gap-2 hover:bg-slate-50 cursor-pointer ${
                      currentUser.role === 'COMPLIANCE_ANALYST' ? 'bg-blue-50 text-blue-800' : 'text-slate-700'
                    }`}
                  >
                    <Users2 className="w-4 h-4 mt-0.5 text-purple-600 shrink-0" />
                    <div>
                      <div className="font-semibold">Priya Sharma (Compliance Analyst)</div>
                      <div className="text-[10px] text-slate-500">Reviews evidence & flags deficiencies</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      switchProfile('BIDDER_VENDOR');
                    }}
                    className={`w-full px-3 py-2 text-left flex items-start gap-2 hover:bg-slate-50 cursor-pointer ${
                      currentUser.role === 'BIDDER_VENDOR' ? 'bg-blue-50 text-blue-800' : 'text-slate-700'
                    }`}
                  >
                    <Building2 className="w-4 h-4 mt-0.5 text-emerald-600 shrink-0" />
                    <div>
                      <div className="font-semibold">Amit Patel (Bidder Vendor)</div>
                      <div className="text-[10px] text-slate-500">Uploads tender documents & views feedback</div>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mobile Hamburger toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu (Visible when hamburger opened) */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white p-3 space-y-2 shadow-lg animate-in slide-in-from-top-2 duration-150 text-xs font-semibold">
          {/* Mobile Role Switcher */}
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Switch Profile:</div>
            <div className="grid grid-cols-1 gap-1">
              <button
                onClick={() => {
                  switchProfile('PROCUREMENT_OFFICER');
                }}
                className={`px-2.5 py-1.5 rounded text-left text-xs font-bold flex items-center gap-2 cursor-pointer ${
                  isOfficer ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 shrink-0" />
                <span>Rajesh Kumar (Officer)</span>
              </button>
              <button
                onClick={() => {
                  switchProfile('COMPLIANCE_ANALYST');
                }}
                className={`px-2.5 py-1.5 rounded text-left text-xs font-bold flex items-center gap-2 cursor-pointer ${
                  isAnalyst ? 'bg-purple-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                <Users2 className="w-3.5 h-3.5 shrink-0" />
                <span>Priya Sharma (Analyst)</span>
              </button>
              <button
                onClick={() => {
                  switchProfile('BIDDER_VENDOR');
                }}
                className={`px-2.5 py-1.5 rounded text-left text-xs font-bold flex items-center gap-2 cursor-pointer ${
                  isBidder ? 'bg-emerald-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 shrink-0" />
                <span>Amit Patel (Vendor)</span>
              </button>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-1 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full px-3 py-2 rounded-lg text-left flex items-center gap-2 cursor-pointer ${
                    isActive ? 'bg-blue-700 text-white' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
          {(isOfficer || isAdmin || isAnalyst) && (
            <div className="pt-2 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => {
                  onOpenAdapters();
                  setIsMobileMenuOpen(false);
                }}
                className="flex-1 px-3 py-2 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Adapters
              </button>
              {isAdmin && (
                <button
                  onClick={() => {
                    onOpenDatabase();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Database className="w-4 h-4 text-purple-600" />
                  Database
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
};
