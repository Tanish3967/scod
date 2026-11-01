import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Key, 
  ArrowRight, 
  Sparkles, 
  UserCheck, 
  Building, 
  CheckCircle2, 
  Globe, 
  FileText, 
  Fingerprint, 
  LogIn, 
  UserPlus, 
  ChevronRight, 
  AlertCircle,
  Eye,
  EyeOff,
  PenTool,
  Shield,
  Clock
} from 'lucide-react';
import { useSignFlow } from '../../context/SignFlowContext';

interface AuthViewProps {
  pendingEnvelopeId?: string | null;
  pendingSignerId?: string | null;
}

export const AuthView: React.FC<AuthViewProps> = ({ pendingEnvelopeId, pendingSignerId }) => {
  const { 
    login, 
    envelopes, 
    notify,
    verifySignerAccess
  } = useSignFlow();

  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'signer-verify'>(
    pendingEnvelopeId ? 'signer-verify' : 'signin'
  );

  // Sign In Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Sign Up Form States
  const [fullName, setFullName] = useState('');
  const [organization, setOrganization] = useState('');
  const [selectedRole, setSelectedRole] = useState<'sender' | 'signer' | 'admin' | 'notary'>('sender');

  // Signer OTP / Quick Verify States
  const [signerOtp, setSignerOtp] = useState(['', '', '', '', '', '']);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [signerEmailInput, setSignerEmailInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Find pending envelope details if available
  const pendingEnvelope = pendingEnvelopeId ? envelopes.find(e => e.id === pendingEnvelopeId) : null;
  const pendingRecipient = (pendingEnvelope && pendingSignerId) 
    ? pendingEnvelope.recipients.find(r => r.id === pendingSignerId) 
    : pendingEnvelope?.recipients[0];

  // Handle Standard Sign In
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both your work email and password.');
      return;
    }

    login({
      email: email.trim(),
      password,
      role: email.toLowerCase().includes('signer') || email.toLowerCase().includes('vance') ? 'signer' : 'sender',
      name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      organization: email.split('@')[1] ? `${email.split('@')[1].split('.')[0].toUpperCase()} Corp` : 'SignFlow Enterprise'
    });
  };

  // Handle Sign Up
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setErrorMessage('Please complete all required fields to create your account.');
      return;
    }

    login({
      email: email.trim(),
      password,
      name: fullName.trim(),
      organization: organization.trim() || 'SignFlow Enterprise',
      role: selectedRole
    });
  };

  // Handle Instant Signer Verification (Guest / Recipient Direct Access)
  const handleSignerDirectAccess = () => {
    setIsVerifyingOtp(true);
    setErrorMessage(null);

    setTimeout(() => {
      setIsVerifyingOtp(false);
      if (pendingEnvelope) {
        verifySignerAccess(pendingEnvelope.id, pendingRecipient?.id, pendingRecipient?.email);
      } else {
        login({
          email: signerEmailInput || 'signer@counterparty.com',
          name: 'External Signatory',
          organization: 'Counterparty Partner',
          role: 'signer'
        });
      }
    }, 450);
  };

  // 1-Click Quick Demo Persona Login
  const handleQuickPersona = (
    personaName: string, 
    personaEmail: string, 
    personaOrg: string, 
    personaRole: 'sender' | 'signer' | 'admin' | 'notary'
  ) => {
    login({
      name: personaName,
      email: personaEmail,
      organization: personaOrg,
      role: personaRole
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8 antialiased selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Top Header & Brand Bar */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 border border-indigo-400/30">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-display font-bold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
              SignFlow
            </span>
            <span className="ml-2 text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 font-semibold">
              Enterprise CLM & PKI
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-3 text-xs text-slate-400 font-mono">
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300">SHA-256 Merkle Ledger Online</span>
          </span>
          <span>•</span>
          <span>eIDAS Qualified TSP</span>
        </div>
      </header>

      {/* Main Authentication Card Container */}
      <main className="max-w-5xl w-full mx-auto my-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
        
        {/* Left Column: Context Hero & Value Prop */}
        <div className="lg:col-span-6 space-y-6 text-left">
          {pendingEnvelope ? (
            /* Targeted Signing Invitation Context Banner */
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-indigo-500/40 backdrop-blur-xl shadow-2xl space-y-4">
              <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold font-mono uppercase tracking-wider">
                <PenTool className="w-4 h-4 text-indigo-400" />
                <span>Electronic Signature Invitation</span>
              </div>

              <div>
                <h1 className="text-2xl font-display font-bold text-white tracking-tight">
                  You are invited to review & sign
                </h1>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Sent securely via SignFlow Cryptographic Electronic Delivery
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Document:</span>
                  <span className="font-bold text-white truncate max-w-[220px]" title={pendingEnvelope.title}>
                    {pendingEnvelope.title}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Sender:</span>
                  <span className="text-indigo-300 font-semibold">{pendingEnvelope.sender?.name || 'SignFlow Legal Ops'}</span>
                </div>
                {pendingRecipient && (
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
                    <span className="text-slate-400 font-medium">Designated Signatory:</span>
                    <span className="font-mono text-emerald-400 font-semibold">{pendingRecipient.name} ({pendingRecipient.email})</span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono">
                <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>ESIGN Act & eIDAS Tier 3 Qualified Compliant</span>
              </div>
            </div>
          ) : (
            /* General SignFlow Enterprise Overview */
            <div className="space-y-5">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Next-Gen Enterprise Electronic Signatures</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight leading-tight">
                Secure, Tamper-Evident Contracts & Autonomous AI CLM
              </h1>

              <p className="text-sm text-slate-300 leading-relaxed max-w-lg">
                Execute agreements with Qualified Electronic Signatures (QES), Remote Online Notarization (RON), and immutable SHA-256 Merkle audit anchoring.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <span className="text-lg font-bold text-white font-mono">256-Bit</span>
                  <p className="text-[11px] text-slate-400">Cryptographic PKI Sealing</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <span className="text-lg font-bold text-emerald-400 font-mono">99.8%</span>
                  <p className="text-[11px] text-slate-400">Liveness Biometric RON</p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Demo Persona Switcher */}
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-2.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider block">
              ⚡ 1-Click Quick Demo Logins:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickPersona('Sarah Jenkins', 'sarah.j@signflow.ai', 'SignFlow Enterprise Cloud', 'sender')}
                className="p-2 rounded-xl bg-slate-900 hover:bg-indigo-950/60 border border-slate-800 hover:border-indigo-500/50 text-left transition-all cursor-pointer group"
              >
                <div className="font-bold text-slate-200 group-hover:text-indigo-300">💼 Sarah Jenkins</div>
                <div className="text-[10px] text-slate-400">Sender / Legal Ops</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickPersona('Marcus Vance', 'marcus.vance@counterparty.com', 'Apex Partners LLC', 'signer')}
                className="p-2 rounded-xl bg-slate-900 hover:bg-indigo-950/60 border border-slate-800 hover:border-indigo-500/50 text-left transition-all cursor-pointer group"
              >
                <div className="font-bold text-slate-200 group-hover:text-indigo-300">✍️ Marcus Vance</div>
                <div className="text-[10px] text-slate-400">Signatory Persona</div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Login / Register / Signer Verification Card */}
        <div className="lg:col-span-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl space-y-6">
            
            {/* Mode Segmented Control Tabs */}
            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setErrorMessage(null);
                }}
                className={`py-2 rounded-xl transition-all cursor-pointer ${
                  authMode === 'signin' 
                    ? 'bg-indigo-600 text-white shadow-xs font-bold' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setErrorMessage(null);
                }}
                className={`py-2 rounded-xl transition-all cursor-pointer ${
                  authMode === 'signup' 
                    ? 'bg-indigo-600 text-white shadow-xs font-bold' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Register
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('signer-verify');
                  setErrorMessage(null);
                }}
                className={`py-2 rounded-xl transition-all cursor-pointer ${
                  authMode === 'signer-verify' 
                    ? 'bg-emerald-600 text-white shadow-xs font-bold' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Signer Access
              </button>
            </div>

            {/* Validation / Error Message */}
            {errorMessage && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* TAB 1: SIGN IN FORM */}
            {authMode === 'signin' && (
              <form onSubmit={handleSignIn} className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                    <Mail className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Work Email Address</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-white placeholder-slate-500 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                      <Key className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Password</span>
                    </label>
                    <a href="#forgot" onClick={(e) => { e.preventDefault(); notify('info', 'Password Reset', 'Password recovery instructions sent to your email.'); }} className="text-[11px] text-indigo-400 hover:underline">
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-white placeholder-slate-500 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0"
                    />
                    <span>Remember this device</span>
                  </label>
                  <span className="text-[11px] text-slate-500 font-mono">TLS 1.3 Encrypted</span>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In to SignFlow</span>
                </button>
              </form>
            )}

            {/* TAB 2: REGISTER / SIGN UP FORM */}
            {authMode === 'signup' && (
              <form onSubmit={handleSignUp} className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. David Vance"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-white placeholder-slate-500 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Work Email Address *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@organization.com"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-white placeholder-slate-500 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Organization
                    </label>
                    <input
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="e.g. Acme Corp"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-white placeholder-slate-500 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Primary Role
                    </label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-white font-medium focus:outline-none cursor-pointer"
                    >
                      <option value="sender">Sender / Business</option>
                      <option value="signer">Counterparty Signer</option>
                      <option value="admin">IT Administrator</option>
                      <option value="notary">Notary Officer</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Choose Password *
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-white placeholder-slate-500 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create Free Account</span>
                </button>
              </form>
            )}

            {/* TAB 3: SIGNER INSTANT ACCESS / ONE-TIME PASSCODE */}
            {authMode === 'signer-verify' && (
              <div className="space-y-4 text-left">
                <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-1.5">
                  <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold font-display">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>No Account Required to Sign</span>
                  </div>
                  <p className="text-[11.5px] text-emerald-200 leading-relaxed">
                    You can review and execute your assigned agreement directly through cryptographic token validation.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Recipient Signatory Email
                  </label>
                  <input
                    type="email"
                    value={signerEmailInput || pendingRecipient?.email || ''}
                    onChange={(e) => setSignerEmailInput(e.target.value)}
                    placeholder="Enter the email address you received the link on"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-xs text-white placeholder-slate-500 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSignerDirectAccess}
                  disabled={isVerifyingOtp}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] cursor-pointer disabled:opacity-50"
                >
                  {isVerifyingOtp ? (
                    <div className="flex items-center space-x-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Validating Security Token...</span>
                    </div>
                  ) : (
                    <>
                      <PenTool className="w-4 h-4" />
                      <span>Verify & Access Document to Sign</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Enterprise SSO Divider */}
            <div className="pt-2 border-t border-slate-800 text-center">
              <span className="text-[10.5px] font-mono text-slate-500 uppercase tracking-wider block mb-3">
                Or authenticate via Enterprise SSO
              </span>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickPersona('Tanish Khosla', 'tanish.k@google.com', 'Google Workspace', 'sender')}
                  className="py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-semibold text-slate-300 flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <span>Google</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPersona('Marcus Vance', 'marcus.v@microsoft.com', 'Microsoft 365', 'signer')}
                  className="py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-semibold text-slate-300 flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <span>Microsoft</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPersona('Corporate Executive', 'exec@okta.corp', 'Okta SSO Enterprise', 'admin')}
                  className="py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-semibold text-slate-300 flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <span>Okta SSO</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="max-w-6xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 font-mono pt-4 border-t border-slate-800/80 z-10 gap-2">
        <div>
          © 2026 SignFlow Technologies Inc. All rights reserved.
        </div>
        <div className="flex items-center space-x-4">
          <span>ESIGN & UETA Compliant</span>
          <span>•</span>
          <span>SOC 2 Type II Certified</span>
          <span>•</span>
          <span>ISO 27001</span>
        </div>
      </footer>
    </div>
  );
};
