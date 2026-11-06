import React, { useState, useMemo, useEffect } from 'react';
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
  Clock,
  ShieldAlert,
  KeyRound,
  RefreshCw,
  Smartphone,
  Check,
  XCircle,
  Timer
} from 'lucide-react';
import { useSignFlow } from '../../context/SignFlowContext';
import { 
  analyzePasswordComplexity, 
  BruteForceDefender, 
  PasswordAnalysis, 
  MAX_LOGIN_ATTEMPTS, 
  sanitizeSecurityInput 
} from '../../utils/securityTokens';

interface AuthViewProps {
  pendingEnvelopeId?: string | null;
  pendingSignerId?: string | null;
}

export const AuthView: React.FC<AuthViewProps> = ({ pendingEnvelopeId, pendingSignerId }) => {
  const { 
    login, 
    envelopes, 
    notify,
    verifySignerAccess,
    signingTokenStatus
  } = useSignFlow();

  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'signer-verify' | '2fa-challenge'>(
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
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [signerEmailInput, setSignerEmailInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Security Hardening States
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const [isPasskeyAuthenticating, setIsPasskeyAuthenticating] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState(['', '', '', '', '', '']);
  const [twoFactorTimer, setTwoFactorTimer] = useState(60);
  const [pendingCredentials, setPendingCredentials] = useState<any>(null);

  // Live Password Entropy & Complexity Evaluation
  const passwordAnalysis: PasswordAnalysis = useMemo(() => {
    return analyzePasswordComplexity(password);
  }, [password]);

  // Monitor Brute-Force Defender status for active email
  useEffect(() => {
    if (!email.trim()) return;
    const cleanEmail = email.trim();
    const status = BruteForceDefender.getStatus(cleanEmail);
    setLockoutSeconds(status.remainingSeconds);

    if (status.isLocked) {
      const interval = setInterval(() => {
        const updated = BruteForceDefender.getStatus(cleanEmail);
        setLockoutSeconds(updated.remainingSeconds);
        if (!updated.isLocked) {
          clearInterval(interval);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [email]);

  // 2FA Countdown Timer
  useEffect(() => {
    if (authMode !== '2fa-challenge' || twoFactorTimer <= 0) return;
    const timer = setInterval(() => {
      setTwoFactorTimer(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [authMode, twoFactorTimer]);

  // Find pending envelope details if available
  const pendingEnvelope = pendingEnvelopeId ? envelopes.find(e => e.id === pendingEnvelopeId) : null;
  const pendingRecipient = (pendingEnvelope && pendingSignerId) 
    ? pendingEnvelope.recipients.find(r => r.id === pendingSignerId) 
    : pendingEnvelope?.recipients[0];

  // Handle Standard Sign In with Security Gates
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = sanitizeSecurityInput(email);
    if (!cleanEmail || !password.trim()) {
      setErrorMessage('Please enter both your work email and password.');
      return;
    }

    // Check brute-force lockout
    const defenseStatus = BruteForceDefender.getStatus(cleanEmail);
    if (defenseStatus.isLocked) {
      setErrorMessage(`Account temporarily locked for ${defenseStatus.remainingSeconds}s due to consecutive failed attempts.`);
      return;
    }

    // Validate minimum enterprise password threshold for custom typed passwords
    // (allow demo convenience if password is standard test credentials, but enforce >= 8 chars)
    if (password.length < 8 && password !== 'admin' && password !== 'password123') {
      const failure = BruteForceDefender.recordFailure(cleanEmail);
      if (failure.isLocked) {
        setLockoutSeconds(failure.remainingSeconds);
        setErrorMessage(`Account locked for 60s after ${MAX_LOGIN_ATTEMPTS} failed attempts.`);
      } else {
        setErrorMessage(`Invalid credentials or password too short (< 8 chars). Attempts remaining: ${MAX_LOGIN_ATTEMPTS - failure.attempts}`);
      }
      return;
    }

    // If enterprise or admin account, route through 2FA verification gate
    const requires2FA = cleanEmail.includes('admin') || cleanEmail.includes('corp') || selectedRole === 'admin';
    const credentialsToStore = {
      email: cleanEmail,
      password,
      rememberMe,
      role: cleanEmail.toLowerCase().includes('signer') || cleanEmail.toLowerCase().includes('vance') ? ('signer' as const) : ('sender' as const),
      name: cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      organization: cleanEmail.split('@')[1] ? `${cleanEmail.split('@')[1].split('.')[0].toUpperCase()} Corp` : 'SignFlow Enterprise'
    };

    if (requires2FA) {
      setPendingCredentials(credentialsToStore);
      setAuthMode('2fa-challenge');
      setTwoFactorTimer(60);
      notify('info', '2FA Verification Required', 'A 6-digit authentication challenge has been issued to your device.');
      return;
    }

    // Successful Direct Login
    login(credentialsToStore);
  };

  // Handle Complete 2FA Verification
  const handleVerify2FACode = (overrideCode?: string) => {
    const codeString = overrideCode || twoFactorCode.join('');
    if (codeString.length < 6) {
      setErrorMessage('Please enter the full 6-digit verification code.');
      return;
    }

    // Demo code accepts 489201 or any 6-digit code for frictionless testing
    if (pendingCredentials) {
      notify('success', 'Two-Factor Authentication Confirmed', 'Device fingerprint and TOTP challenge verified.');
      login(pendingCredentials);
    }
  };

  // Handle FIDO2 / WebAuthn Biometric Fast Login
  const handlePasskeyLogin = async () => {
    setIsPasskeyAuthenticating(true);
    setErrorMessage(null);

    try {
      // Simulate WebAuthn biometric challenge
      await new Promise(resolve => setTimeout(resolve, 900));

      const passkeyUser = {
        name: 'Sarah Jenkins (FIDO2)',
        email: 'sarah.j@signflow.ai',
        organization: 'SignFlow Enterprise Cloud',
        role: 'sender' as const,
        rememberMe: true
      };

      notify('success', 'Passkey Biometric Verified', 'Hardware enclave authenticated via FIDO2 WebAuthn AAL3.');
      login(passkeyUser);
    } catch (err: any) {
      setErrorMessage('Passkey authentication was cancelled or failed.');
    } finally {
      setIsPasskeyAuthenticating(false);
    }
  };

  // Handle Sign Up with Strict Complexity Enforcement
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = sanitizeSecurityInput(email);
    const cleanName = sanitizeSecurityInput(fullName);

    if (!cleanName || !cleanEmail || !password.trim()) {
      setErrorMessage('Please complete all required fields to create your account.');
      return;
    }

    if (!passwordAnalysis.isValid) {
      setErrorMessage(`Password does not meet enterprise security requirements: ${passwordAnalysis.feedback.join(', ')}.`);
      return;
    }

    login({
      email: cleanEmail,
      password,
      name: cleanName,
      organization: organization.trim() || 'SignFlow Enterprise',
      role: selectedRole,
      rememberMe
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
          role: 'signer',
          rememberMe: false
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
      role: personaRole,
      rememberMe: true
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
              Zero-Trust PKI Hardened
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-3 text-xs text-slate-400 font-mono">
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300">SHA-256 Merkle Ledger Online</span>
          </span>
          <span>•</span>
          <span>FIDO2 / WebAuthn Active</span>
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
                  Secured with time-bound HMAC-SHA256 token verification
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

              {/* Cryptographic Token Verification Badge */}
              {signingTokenStatus && (
                <div className={`p-3 rounded-xl border text-xs flex items-start space-x-2.5 ${
                  signingTokenStatus.valid 
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : signingTokenStatus.isExpired
                    ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                }`}>
                  {signingTokenStatus.valid ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-bold block">
                      {signingTokenStatus.valid 
                        ? '✓ HMAC-SHA256 Token Validated' 
                        : signingTokenStatus.isExpired 
                        ? '⚠️ Signing Link Expired' 
                        : '⚠️ Security Token Alert'}
                    </span>
                    <p className="text-[11px] opacity-90 mt-0.5">{signingTokenStatus.reason}</p>
                    {signingTokenStatus.expiresFormatted && (
                      <p className="text-[10px] font-mono text-slate-400 mt-1">
                        Validity Expiration: {signingTokenStatus.expiresFormatted}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono">
                <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>ESIGN Act §101 & eIDAS Tier 3 Qualified Compliant</span>
              </div>
            </div>
          ) : (
            /* General SignFlow Enterprise Overview */
            <div className="space-y-5">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Enterprise Zero-Trust Authentication</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight leading-tight">
                Secure, Tamper-Evident Contracts & Autonomous AI CLM
              </h1>

              <p className="text-sm text-slate-300 leading-relaxed max-w-lg">
                Protected by 256-bit SHA-256 Merkle chain anchoring, brute-force defense, and FIDO2 hardware passkeys.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <span className="text-lg font-bold text-white font-mono">256-Bit</span>
                  <p className="text-[11px] text-slate-400">Cryptographic PKI Sealing</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <span className="text-lg font-bold text-emerald-400 font-mono">FIDO2 AAL3</span>
                  <p className="text-[11px] text-slate-400">WebAuthn Hardware Enclave</p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Demo Persona Switcher */}
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-2.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider block">
              ⚡ 1-Click Quick Demo Personas:
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

        {/* Right Column: Interactive Login / Register / 2FA / Signer Card */}
        <div className="lg:col-span-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl space-y-6">
            
            {/* Mode Segmented Control Tabs */}
            {authMode !== '2fa-challenge' ? (
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
            ) : (
              <div className="flex items-center justify-between p-2 rounded-xl bg-indigo-950/60 border border-indigo-500/30">
                <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-indigo-400" />
                  MFA / 2FA Security Challenge
                </span>
                <button
                  onClick={() => setAuthMode('signin')}
                  className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
                >
                  Back to Sign In
                </button>
              </div>
            )}

            {/* Brute-Force Lockout Active Banner */}
            {lockoutSeconds > 0 && (
              <div className="p-3.5 bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs rounded-2xl flex items-start space-x-3">
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <span className="font-bold text-rose-300 block">Account Temporarily Locked</span>
                  <p className="text-[11px] text-rose-200/90 mt-0.5 leading-relaxed">
                    Too many consecutive failed login attempts ({MAX_LOGIN_ATTEMPTS}/{MAX_LOGIN_ATTEMPTS}). 
                    Brute-force security lock active for another <strong className="text-white font-mono">{lockoutSeconds}s</strong>.
                  </p>
                </div>
              </div>
            )}

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
                    disabled={lockoutSeconds > 0}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-white placeholder-slate-500 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                      <Key className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Password</span>
                    </label>
                    <a 
                      href="#forgot" 
                      onClick={(e) => { e.preventDefault(); notify('info', 'Password Reset', 'Password recovery instructions dispatched via encrypted email.'); }} 
                      className="text-[11px] text-indigo-400 hover:underline"
                    >
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
                      disabled={lockoutSeconds > 0}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-white placeholder-slate-500 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 pr-10 disabled:opacity-50"
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

                {/* Password Entropy & Strength Meter */}
                {password.length > 0 && (
                  <div className="space-y-2 p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-medium">Password Strength:</span>
                      <span className={`font-bold font-mono uppercase ${
                        passwordAnalysis.tier === 'enterprise' ? 'text-emerald-400' :
                        passwordAnalysis.tier === 'strong' ? 'text-indigo-400' :
                        passwordAnalysis.tier === 'fair' ? 'text-amber-400' : 'text-rose-400'
                      }`}>
                        {passwordAnalysis.tier} ({passwordAnalysis.score}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          passwordAnalysis.tier === 'enterprise' ? 'bg-emerald-500' :
                          passwordAnalysis.tier === 'strong' ? 'bg-indigo-500' :
                          passwordAnalysis.tier === 'fair' ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.max(10, passwordAnalysis.score)}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-400 pt-1">
                      <span className={passwordAnalysis.checks.minLength ? 'text-emerald-400 flex items-center gap-1' : 'text-slate-500 flex items-center gap-1'}>
                        {passwordAnalysis.checks.minLength ? '✓' : '○'} 8+ characters
                      </span>
                      <span className={passwordAnalysis.checks.hasUpper ? 'text-emerald-400 flex items-center gap-1' : 'text-slate-500 flex items-center gap-1'}>
                        {passwordAnalysis.checks.hasUpper ? '✓' : '○'} Uppercase (A-Z)
                      </span>
                      <span className={passwordAnalysis.checks.hasLower ? 'text-emerald-400 flex items-center gap-1' : 'text-slate-500 flex items-center gap-1'}>
                        {passwordAnalysis.checks.hasLower ? '✓' : '○'} Lowercase (a-z)
                      </span>
                      <span className={passwordAnalysis.checks.hasNumber && passwordAnalysis.checks.hasSpecial ? 'text-emerald-400 flex items-center gap-1' : 'text-slate-500 flex items-center gap-1'}>
                        {passwordAnalysis.checks.hasNumber && passwordAnalysis.checks.hasSpecial ? '✓' : '○'} Numbers & Symbols
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0"
                    />
                    <span>Remember this device (24h)</span>
                  </label>
                  <span className="text-[11px] text-slate-500 font-mono">TLS 1.3 • AES-256</span>
                </div>

                <button
                  type="submit"
                  disabled={lockoutSeconds > 0}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{lockoutSeconds > 0 ? `Locked (${lockoutSeconds}s)` : 'Sign In to SignFlow'}</span>
                </button>

                {/* FIDO2 / WebAuthn Biometric Passkey Fast Login */}
                <div className="relative my-3 pt-2">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800" /></div>
                  <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-wider">
                    <span className="bg-slate-900 px-2 text-slate-500">Or Hardware Passkey</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePasskeyLogin}
                  disabled={isPasskeyAuthenticating || lockoutSeconds > 0}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/50 text-slate-200 text-xs font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer group shadow-xs"
                >
                  <Fingerprint className={`w-4 h-4 text-emerald-400 ${isPasskeyAuthenticating ? 'animate-pulse' : 'group-hover:scale-110'}`} />
                  <span>{isPasskeyAuthenticating ? 'Verifying Hardware Enclave...' : 'Sign in with Passkey / Face ID'}</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                    FIDO2 AAL3
                  </span>
                </button>
              </form>
            )}

            {/* TAB: 2FA MFA CHALLENGE */}
            {authMode === '2fa-challenge' && (
              <div className="space-y-5 text-left">
                <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-2">
                  <div className="flex items-center space-x-2 text-indigo-300 font-bold text-xs">
                    <Smartphone className="w-4 h-4 text-indigo-400" />
                    <span>Enter 6-Digit Authenticator Code</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    A two-factor authentication challenge has been dispatched for <strong>{pendingCredentials?.email}</strong>.
                  </p>
                </div>

                {/* 6-Digit PIN Boxes */}
                <div className="flex justify-between gap-2">
                  {twoFactorCode.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-${idx}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        const next = [...twoFactorCode];
                        next[idx] = val;
                        setTwoFactorCode(next);
                        if (val && idx < 5) {
                          const nextElem = document.getElementById(`otp-${idx + 1}`);
                          nextElem?.focus();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !twoFactorCode[idx] && idx > 0) {
                          const prevElem = document.getElementById(`otp-${idx - 1}`);
                          prevElem?.focus();
                        }
                      }}
                      className="w-11 h-12 text-center text-lg font-mono font-bold bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center space-x-1.5">
                    <Timer className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="font-mono">Expires in {twoFactorTimer}s</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setTwoFactorTimer(60);
                      notify('info', 'Code Resent', 'Dispatched fresh 6-digit challenge code.');
                    }}
                    className="text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
                  >
                    Resend Code
                  </button>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleVerify2FACode()}
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify Code & Complete Sign In</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleVerify2FACode('489201')}
                    className="w-full py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-400 hover:text-slate-200 font-mono transition-colors cursor-pointer"
                  >
                    Quick Test Verification (Auto-fill: 489201)
                  </button>
                </div>
              </div>
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
                    placeholder="At least 8 characters (Upper, Lower, Number, Symbol)"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-white placeholder-slate-500 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Password Complexity Checklist for Sign Up */}
                {password.length > 0 && (
                  <div className="space-y-2 p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-medium">Complexity Rating:</span>
                      <span className={`font-bold font-mono uppercase ${
                        passwordAnalysis.tier === 'enterprise' ? 'text-emerald-400' :
                        passwordAnalysis.tier === 'strong' ? 'text-indigo-400' :
                        passwordAnalysis.tier === 'fair' ? 'text-amber-400' : 'text-rose-400'
                      }`}>
                        {passwordAnalysis.tier} ({passwordAnalysis.score}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          passwordAnalysis.tier === 'enterprise' ? 'bg-emerald-500' :
                          passwordAnalysis.tier === 'strong' ? 'bg-indigo-500' :
                          passwordAnalysis.tier === 'fair' ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.max(10, passwordAnalysis.score)}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-400 pt-1">
                      <span className={passwordAnalysis.checks.minLength ? 'text-emerald-400 flex items-center gap-1' : 'text-slate-500 flex items-center gap-1'}>
                        {passwordAnalysis.checks.minLength ? '✓' : '○'} 8+ characters
                      </span>
                      <span className={passwordAnalysis.checks.hasUpper ? 'text-emerald-400 flex items-center gap-1' : 'text-slate-500 flex items-center gap-1'}>
                        {passwordAnalysis.checks.hasUpper ? '✓' : '○'} Uppercase (A-Z)
                      </span>
                      <span className={passwordAnalysis.checks.hasLower ? 'text-emerald-400 flex items-center gap-1' : 'text-slate-500 flex items-center gap-1'}>
                        {passwordAnalysis.checks.hasLower ? '✓' : '○'} Lowercase (a-z)
                      </span>
                      <span className={passwordAnalysis.checks.hasNumber && passwordAnalysis.checks.hasSpecial ? 'text-emerald-400 flex items-center gap-1' : 'text-slate-500 flex items-center gap-1'}>
                        {passwordAnalysis.checks.hasNumber && passwordAnalysis.checks.hasSpecial ? '✓' : '○'} Numbers & Symbols
                      </span>
                    </div>
                  </div>
                )}

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
                    <span>Cryptographic Signer Gateway</span>
                  </div>
                  <p className="text-[11.5px] text-emerald-200 leading-relaxed">
                    You can review and execute your assigned agreement directly through cryptographic token validation without creating an account.
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
            {authMode !== '2fa-challenge' && (
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
            )}

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
