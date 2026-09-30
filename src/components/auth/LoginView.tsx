import React, { useState } from 'react';
import {
  FileCheck2,
  ShieldCheck,
  UserCheck,
  Users2,
  Building2,
  Lock,
  Mail,
  KeyRound,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';
import { User } from '../../types/index.ts';

interface LoginViewProps {
  currentUser: User;
  onLoginSuccess: (role: string, email?: string, password?: string) => void | Promise<void>;
  onNavigateToDashboard: () => void;
  authError?: string;
}

export const LoginView: React.FC<LoginViewProps> = ({
  currentUser,
  onLoginSuccess,
  onNavigateToDashboard,
  authError,
}) => {
  const [selectedRole, setSelectedRole] = useState<'PROCUREMENT_OFFICER' | 'COMPLIANCE_ANALYST' | 'BIDDER_VENDOR' | 'ADMIN'>('PROCUREMENT_OFFICER');
  const [activeSubTab, setActiveSubTab] = useState<'SIGN_IN' | 'REGISTER'>('SIGN_IN');
  const [email, setEmail] = useState('officer@cpcl.gov.in');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [registrationName, setRegistrationName] = useState('');
  const [registrationEmail, setRegistrationEmail] = useState('');
  const [registrationOrganization, setRegistrationOrganization] = useState('');
  const [registrationRole, setRegistrationRole] = useState<'BIDDER_VENDOR' | 'COMPLIANCE_ANALYST'>('BIDDER_VENDOR');
  const [registrationStatus, setRegistrationStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [registrationBusy, setRegistrationBusy] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  const demoPasswords: Record<string, string> = {
    PROCUREMENT_OFFICER: 'Officer@BidSure2026!',
    COMPLIANCE_ANALYST: 'Analyst@BidSure2026!',
    BIDDER_VENDOR: 'Bidder@BidSure2026!',
    ADMIN: 'Admin@BidSure2026!',
  };

  const handleRoleSelect = (role: 'PROCUREMENT_OFFICER' | 'COMPLIANCE_ANALYST' | 'BIDDER_VENDOR' | 'ADMIN') => {
    setSelectedRole(role);
    if (role === 'PROCUREMENT_OFFICER') setEmail('officer@cpcl.gov.in');
    else if (role === 'COMPLIANCE_ANALYST') setEmail('analyst@cpcl.gov.in');
    else if (role === 'BIDDER_VENDOR') setEmail('bidder@abctechnologies.com');
    else setEmail('admin@bidsure.gov.in');
    setPassword(demoPasswords[role]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSigningIn(true);
    try {
      await onLoginSuccess(selectedRole, email, password);
      onNavigateToDashboard();
    } finally {
      setSigningIn(false);
    }
  };

  const handleSsoLogin = () => {
    onLoginSuccess(selectedRole, email, password);
    onNavigateToDashboard();
  };

  const handleGoogleLogin = () => {
    window.location.assign('/api/auth/google/start');
  };

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegistrationBusy(true);
    setRegistrationStatus(null);
    try {
      const response = await fetch('/api/auth/register-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          name: registrationName,
          email: registrationEmail,
          organization: registrationOrganization,
          requestedRole: registrationRole,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Unable to submit your request.');
      setRegistrationStatus({ type: 'success', message: `${payload.message} Request ID: ${payload.requestId}` });
      setRegistrationName('');
      setRegistrationEmail('');
      setRegistrationOrganization('');
    } catch (error) {
      setRegistrationStatus({ type: 'error', message: error instanceof Error ? error.message : 'Unable to submit your request.' });
    } finally {
      setRegistrationBusy(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Header matching screenshot 2 */}
        <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white p-6 text-center relative">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center mx-auto mb-3 shadow-md border border-blue-400">
            <FileCheck2 className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-black tracking-tight">BidSure</h2>
          <p className="text-xs text-blue-200 mt-0.5">Procurement Compliance Platform</p>
        </div>

        {/* Sign In vs Register tabs */}
        <div className="grid grid-cols-2 border-b border-slate-200 text-xs font-bold text-center">
          <button
            onClick={() => setActiveSubTab('SIGN_IN')}
            className={`py-3 transition-colors cursor-pointer border-b-2 ${
              activeSubTab === 'SIGN_IN'
                ? 'border-blue-700 text-blue-700 bg-blue-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setActiveSubTab('REGISTER')}
            className={`py-3 transition-colors cursor-pointer border-b-2 ${
              activeSubTab === 'REGISTER'
                ? 'border-blue-700 text-blue-700 bg-blue-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            New Registration
          </button>
        </div>

        <div className="p-6 space-y-5">
          {authError && activeSubTab === 'SIGN_IN' && (
            <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
              {authError}
            </div>
          )}
          {/* Select Your Role (matching screenshot 2) */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">
              Select Your Role
            </label>
            <div className="space-y-2 text-xs">
              {/* Role 1: Procurement Officer */}
              <button
                type="button"
                onClick={() => handleRoleSelect('PROCUREMENT_OFFICER')}
                className={`w-full p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                  selectedRole === 'PROCUREMENT_OFFICER'
                    ? 'border-blue-700 bg-blue-50/80 shadow-xs ring-1 ring-blue-600'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-slate-900">Procurement Officer</div>
                  <div className="text-[11px] text-slate-500">CPSE / Central Government Desk</div>
                </div>
                {selectedRole === 'PROCUREMENT_OFFICER' && (
                  <CheckCircle2 className="w-4 h-4 text-blue-700 shrink-0" />
                )}
              </button>

              {/* Role 2: Compliance Analyst */}
              <button
                type="button"
                onClick={() => handleRoleSelect('COMPLIANCE_ANALYST')}
                className={`w-full p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                  selectedRole === 'COMPLIANCE_ANALYST'
                    ? 'border-purple-700 bg-purple-50/80 shadow-xs ring-1 ring-purple-600'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
                  <Users2 className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-slate-900">Compliance Analyst</div>
                  <div className="text-[11px] text-slate-500">Priya Sharma • Vigilance & QA Desk</div>
                </div>
                {selectedRole === 'COMPLIANCE_ANALYST' && (
                  <CheckCircle2 className="w-4 h-4 text-purple-700 shrink-0" />
                )}
              </button>

              {/* Role 3: Bidder / Vendor */}
              <button
                type="button"
                onClick={() => handleRoleSelect('BIDDER_VENDOR')}
                className={`w-full p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                  selectedRole === 'BIDDER_VENDOR'
                    ? 'border-blue-700 bg-blue-50/80 shadow-xs ring-1 ring-blue-600'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-slate-900">Bidder / Vendor</div>
                  <div className="text-[11px] text-slate-500">Participating in GeM tender</div>
                </div>
                {selectedRole === 'BIDDER_VENDOR' && (
                  <CheckCircle2 className="w-4 h-4 text-blue-700 shrink-0" />
                )}
              </button>

              {/* Role 3: Admin */}
              <button
                type="button"
                onClick={() => handleRoleSelect('ADMIN')}
                className={`w-full p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                  selectedRole === 'ADMIN'
                    ? 'border-blue-700 bg-blue-50/80 shadow-xs ring-1 ring-blue-600'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-slate-900">Admin / Authority</div>
                  <div className="text-[11px] text-slate-500">System Administration & Rules</div>
                </div>
                {selectedRole === 'ADMIN' && (
                  <CheckCircle2 className="w-4 h-4 text-blue-700 shrink-0" />
                )}
              </button>
            </div>
          </div>

          {activeSubTab === 'SIGN_IN' && <>
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Login Credentials</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:bg-white focus:outline-hidden"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:bg-white focus:outline-hidden"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-blue-700 focus:ring-0"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => alert('Demo password reset link simulated to ' + email)}
                className="text-blue-700 hover:underline font-semibold cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={signingIn}
              className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer mt-2"
            >
              <span>{signingIn ? 'Signing in securely…' : `Sign In as ${selectedRole.replace('_', ' ')}`}</span>
              {!signingIn && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* OR Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
              or
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Login with Government SSO Parichay (matching screenshot 2) */}
          <button
            onClick={handleSsoLogin}
            type="button"
            className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer"
          >
            <span className="text-base">🏛️</span>
            <span>Login with Government SSO (Parichay)</span>
          </button>

          <button
            onClick={handleGoogleLogin}
            type="button"
            className="w-full py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer"
          >
            <span className="text-base">G</span>
            <span>Continue with Google</span>
          </button>
          </>}

          {activeSubTab === 'REGISTER' && (
            <form onSubmit={handleRegistration} className="space-y-4 text-xs">
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-[11px] leading-relaxed text-blue-900">
                Request BidSure access. An administrator will verify your organization and provision the approved account.
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Full name</label>
                <input value={registrationName} onChange={(e) => setRegistrationName(e.target.value)} placeholder="Enter your full name" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-hidden" required minLength={2} />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Work email</label>
                <div className="relative"><Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" /><input type="email" value={registrationEmail} onChange={(e) => setRegistrationEmail(e.target.value)} placeholder="name@organization.gov.in" className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-hidden" required /></div>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Organization / company</label>
                <div className="relative"><Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" /><input value={registrationOrganization} onChange={(e) => setRegistrationOrganization(e.target.value)} placeholder="Organization name" className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-hidden" required minLength={2} /></div>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Access requested for</label>
                <select value={registrationRole} onChange={(e) => setRegistrationRole(e.target.value as 'BIDDER_VENDOR' | 'COMPLIANCE_ANALYST')} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-hidden">
                  <option value="BIDDER_VENDOR">Bidder / Vendor</option>
                  <option value="COMPLIANCE_ANALYST">Compliance Analyst</option>
                </select>
              </div>
              {registrationStatus && <div role="status" className={`rounded-lg p-3 text-[11px] ${registrationStatus.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>{registrationStatus.message}</div>}
              <button type="submit" disabled={registrationBusy} className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer">
                {registrationBusy ? 'Submitting…' : 'Submit Registration Request'}
                {!registrationBusy && <ArrowRight className="w-4 h-4" />}
              </button>
              <button type="button" onClick={() => setActiveSubTab('SIGN_IN')} className="w-full text-blue-700 hover:underline font-semibold cursor-pointer">Back to Sign In</button>
            </form>
          )}
        </div>

        {/* Footer Note */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[10px] text-slate-500 font-medium">
          Secure • Government Verified • Role Based Access Control
        </div>
      </div>
    </div>
  );
};
