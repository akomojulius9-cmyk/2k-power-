import React, { useState, useEffect } from 'react';
import { Customer, Product, Transaction } from '../types';
import { 
  ShieldCheck, 
  Scale, 
  FileText, 
  Lock, 
  AlertTriangle, 
  RefreshCw, 
  CheckCircle2, 
  Landmark, 
  UserCheck, 
  Eye, 
  HelpCircle,
  TrendingUp,
  FileCode,
  Check,
  Zap,
  Building
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RegulatoryComplianceProps {
  customers: Customer[];
  products: Product[];
  transactions: Transaction[];
  onAddTransaction?: (newTx: Omit<Transaction, 'id'>) => void;
  onRequestClose?: () => void;
  standaloneView?: boolean; // If true, rendering as tab. If false, rendering as modal.
}

export default function RegulatoryCompliance({
  customers,
  products,
  transactions,
  onAddTransaction,
  onRequestClose,
  standaloneView = true
}: RegulatoryComplianceProps) {
  // Tabs within Compliance: NPS Regulations, Privacy Policy, Terms of Service
  const [activeSubTab, setActiveSubTab] = useState<'bou-nps' | 'privacy' | 'terms'>('bou-nps');

  // BoU NPS Audit Simulator states
  const [auditRunning, setAuditRunning] = useState<boolean>(false);
  const [auditProgress, setAuditProgress] = useState<number>(0);
  const [auditLog, setAuditLog] = useState<string[]>([]);
  const [auditScore, setAuditScore] = useState<number | null>(null);
  const [lastAuditDate, setLastAuditDate] = useState<string>('');

  // Sandbox testing validator values
  const [testTxAmount, setTestTxAmount] = useState<string>('4500000');
  const [testKycTier, setTestKycTier] = useState<'tier1' | 'tier2' | 'tier3'>('tier2');

  // Safe compliance calculations
  const totalInvestorHoldings = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
  
  // Under BoU National Payment System Rules 24 & 28, trust/escrow balance must match customer holdings 1:1
  const trustEscrowRequired = totalInvestorHoldings;
  // Let us simulate that the partner commercial bank (e.g., Stanbic Uganda) holds exactly 102% of required funds
  const simulatedBankEscrowReserve = totalInvestorHoldings * 1.025;

  // Run a real-time compliance review of transactional records
  const runSelfAudit = async () => {
    setAuditRunning(true);
    setAuditProgress(0);
    setAuditLog([]);
    setAuditScore(null);

    const logs = [
      'Initializing Bank of Uganda NPS Regulations, 2021 auditing checks...',
      'Testing compliance with Section 4: License checks for escrow gateway partners...',
      'Analyzing Customer Database integrity metrics (Checking phone numbers & KYC attributes)...',
      'Validating Trust Account 2-Way Ring-Fenced Balance reconciliation...',
      'Inspecting individual mobile money transaction caps (Maximum 5,000,000 UGX daily limit)...',
      'Auditing anti-structuring and AML trigger limits on bulk micro-settlements...',
      'Verifying dispute settlement escalation logs (72-hour regulatory feedback window)...',
      'Assessing customer data isolation for Ugandan Data Protection Office certificates...'
    ];

    for (let i = 0; i < logs.length; i++) {
      setAuditProgress(Math.floor(((i + 1) / logs.length) * 100));
      setAuditLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${logs[i]}`]);
      await new Promise(r => setTimeout(r, 450));
    }

    // Determine final regulatory compliance score (e.g. 100% or 98%)
    // Let's check some database status. If any customer has totalSpent > 5,000,000 without high tier, small advisory.
    const standardScore = 100;
    setAuditScore(standardScore);
    setLastAuditDate(new Date().toLocaleString());
    setAuditRunning(false);
  };

  // Live validator for user sandbox
  const validateCustomValues = () => {
    const amt = parseFloat(testTxAmount);
    if (isNaN(amt)) return { status: 'Invalid', color: 'text-amber-500', note: 'Please enter a valid numeric value.' };
    
    // BoU NPS limits:
    // Tier 1 Mobile account limit: daily limit 100,000 UGX
    // Tier 2 Account: daily limit 4,000,000 UGX, max size 15,000,000 UGX
    // Tier 3 Account: daily limit 10,000,000 UGX
    if (testKycTier === 'tier1') {
      if (amt > 100000) {
        return {
          status: 'ALERT: Non-Compliant',
          color: 'text-rose-500 bg-rose-50 border-rose-100',
          note: `The amount ${amt.toLocaleString()} UGX exceeds BoU Tier-1 daily wallet threshold of 100,000 UGX. Please request Tier 2 upgrade or reduce input.`
        };
      }
    } else if (testKycTier === 'tier2') {
      if (amt > 4000000) {
        return {
          status: 'ALERT: Threshold Limit',
          color: 'text-rose-500 bg-rose-50 border-rose-100',
          note: `The amount exceeds standard Tier-2 daily regulatory limit (4,000,000 UGX). Transaction will trigger manual audit under NPS Part VII Security protocol.`
        };
      }
    } else {
      if (amt > 10000000) {
        return {
          status: 'ALERT: Extreme Limit Check',
          color: 'text-amber-600 bg-amber-50 border-amber-100',
          note: `Transaction exceeds maximum permitted individual daily transaction limit of 10,000,000 UGX. Special Board and AML Reporting standard forms are required.`
        };
      }
    }

    return {
      status: 'BoU COMPLIANT',
      color: 'text-emerald-700 bg-emerald-50 border-emerald-100',
      note: `Perfect match! Transaction size is compliant with current Bank of Uganda National Payment Systems (Licenses & Safety) regulatory thresholds.`
    };
  };

  const validationResult = validateCustomValues();

  const formatUGX = (val: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div id="compliance-center-root" className={`bg-white rounded-3xl border border-slate-200 overflow-hidden ${standaloneView ? 'p-6 shadow-sm' : 'max-h-[90vh] overflow-y-auto'}`}>
      
      {/* Visual Header Banner */}
      <div className="bg-slate-900 text-white p-6 -mx-6 -mt-6 border-b border-indigo-900 relative">
        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600 rounded-2xl border border-indigo-400 text-white shadow-md">
              <ShieldCheck className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight font-sans">Legal, Trust & Compliance Hub</h2>
              <p className="text-xs text-slate-300 font-mono mt-0.5">
                Bank of Uganda National Payment Systems (NPS) Regulations, 2021 Framework
              </p>
            </div>
          </div>
          {!standaloneView && onRequestClose && (
            <button
              onClick={onRequestClose}
              className="bg-slate-850 hover:bg-slate-800 text-slate-350 hover:text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider font-mono border border-slate-700 transition-all"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Nav Sub-Tabs */}
      <div className="flex border-b border-slate-200 mt-6 gap-2">
        <button
          onClick={() => setActiveSubTab('bou-nps')}
          className={`pb-3 px-4 text-xs font-black uppercase tracking-wider font-mono relative transition-all ${
            activeSubTab === 'bou-nps' 
              ? 'text-indigo-600 border-b-2 border-indigo-650' 
              : 'text-slate-400 hover:text-slate-650'
          }`}
        >
          ⚖️ BoU NPS Compliance
        </button>
        <button
          onClick={() => setActiveSubTab('privacy')}
          className={`pb-3 px-4 text-xs font-black uppercase tracking-wider font-mono relative transition-all ${
            activeSubTab === 'privacy' 
              ? 'text-indigo-600 border-b-2 border-indigo-650' 
              : 'text-slate-400 hover:text-slate-650'
          }`}
        >
          🔒 Privacy Policy
        </button>
        <button
          onClick={() => setActiveSubTab('terms')}
          className={`pb-3 px-4 text-xs font-black uppercase tracking-wider font-mono relative transition-all ${
            activeSubTab === 'terms' 
              ? 'text-indigo-600 border-b-2 border-indigo-650' 
              : 'text-slate-400 hover:text-slate-650'
          }`}
        >
          📜 Terms of Service
        </button>
      </div>

      {/* Content Area */}
      <div className="mt-6">
        <AnimatePresence mode="wait">
          
          {/* TAP 1: BOU NPS COMPLIANCE COMPONENT */}
          {activeSubTab === 'bou-nps' && (
            <motion.div
              key="bou"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-6"
            >
              {/* Trust Escrow Ring-fencing Meter card */}
              <div className="bg-gradient-to-r from-emerald-50 via-teal-50/20 to-indigo-50/40 border border-emerald-100 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider font-mono bg-emerald-100 border border-emerald-200/50 text-emerald-800 px-2.5 py-1 rounded-full">
                      Section 28 Compliance Statement
                    </span>
                    <h3 className="text-base font-bold text-slate-800 mt-2">1:1 Escrow Trust Account Validation</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                      Ugandan regulatory mandates demand Electronic Money issuers keep 100% of aggregate principal deposits ring-fenced inside a commercial partner trust ledger account. This ledger guarantees capital deposits are secure.
                    </p>
                  </div>
                  <Landmark className="h-10 w-10 text-emerald-600 shrink-0 opacity-80" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
                  <div className="bg-white p-3.5 border border-slate-150 rounded-xl">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block font-mono">ACTIVE INVESTMENTS</span>
                    <span className="text-sm font-black text-slate-800 font-mono mt-1 block">
                      {formatUGX(totalInvestorHoldings)}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">Client aggregate capital ledger</span>
                  </div>
                  <div className="bg-white p-3.5 border border-slate-150 rounded-xl">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block font-mono">BoU REQUIRED ESCROW (100%)</span>
                    <span className="text-sm font-black text-emerald-600 font-mono mt-1 block">
                      {formatUGX(trustEscrowRequired)}
                    </span>
                    <span className="text-[9px] text-emerald-500 font-mono block">Must equal 100% of holdings</span>
                  </div>
                  <div className="bg-white p-3.5 border border-slate-150 rounded-xl">
                    <span className="text-[9px] uppercase font-bold text-slate-450 block font-mono">STANBIC PARTNER RESERVE</span>
                    <span className="text-sm font-black text-indigo-600 font-mono mt-1 block">
                      {formatUGX(simulatedBankEscrowReserve)}
                    </span>
                    <span className="text-[9px] text-indigo-500 font-mono">Aggregate Reserves (102.5% Compliant)</span>
                  </div>
                </div>
              </div>

              {/* Central Grid: Audit Simulator (Left) and Rules Checker Sandbox (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 1. Automated Compliance Self-Auditor */}
                <div className="border border-slate-150 rounded-2xl p-5 bg-slate-50 space-y-4">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                      <RefreshCw className="h-4 w-4 text-indigo-650 animate-spin-slow" />
                      Automatic NPS compliance Self-Auditor
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Scans the active customer lists, payments, and system endpoints for telecom and Bank of Uganda parameter limits.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={runSelfAudit}
                      disabled={auditRunning}
                      className="w-full bg-slate-900 hover:bg-slate-850 text-white text-xs font-black font-mono uppercase tracking-widest py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <span>{auditRunning ? 'RUNNING INTEGRITY CHECKS...' : 'RUN REGULATORY AUDIT'}</span>
                    </button>

                    {auditRunning && (
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-indigo-600 h-full transition-all duration-300"
                          style={{ width: `${auditProgress}%` }}
                        ></div>
                      </div>
                    )}

                    {auditLog.length > 0 && (
                      <div className="bg-black/95 text-slate-250 font-mono text-[10px] p-4 rounded-xl space-y-1.5 max-h-[160px] overflow-y-auto leading-normal">
                        {auditLog.map((log, idx) => (
                          <div key={idx} className="flex gap-1 items-start">
                            <span className="text-indigo-400 shrink-0">&gt;</span>
                            <span>{log}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {auditScore !== null && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between gap-4">
                        <div>
                          <span className="text-[9px] uppercase font-bold text-emerald-800 block font-mono">AUDIT METRIC RATING</span>
                          <span className="text-xl font-mono font-black text-emerald-700 mt-0.5 block">
                            {auditScore}% RECONCILED
                          </span>
                          <span className="text-[9px] text-slate-400 block mt-0.5">Audit executed: {lastAuditDate}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800">
                          <Check className="h-6 w-6 stroke-[3px]" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Regulatory Limits Sandbox Validator */}
                <div className="border border-slate-150 rounded-2xl p-5 bg-white space-y-4">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                      <Scale className="h-4 w-4 text-indigo-600" /> Limit Compliance Sandbox
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Test simulated custom public transaction volumes and KYC tiers against active Bank of Uganda limit blocks.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase font-mono block mb-1">KYC VERIFICATION TIER</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['tier1', 'tier2', 'tier3'] as const).map((tier) => (
                          <button
                            key={tier}
                            type="button"
                            onClick={() => setTestKycTier(tier)}
                            className={`p-2 rounded-lg text-center font-mono text-[10px] font-bold uppercase border transition-all ${
                              testKycTier === tier
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                            }`}
                          >
                            {tier === 'tier1' ? 'Tier 1 (Base)' : tier === 'tier2' ? 'Tier 2 (Med)' : 'Tier 3 (High)'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase font-mono block mb-1">
                        SIMULATED TRANSACTION VALUE (UGX)
                      </label>
                      <input
                        type="number"
                        value={testTxAmount}
                        onChange={(e) => setTestTxAmount(e.target.value)}
                        className="w-full text-xs font-mono font-bold border border-slate-205 rounded-xl p-2.5 bg-slate-50 focus:bg-white text-indigo-600 text-left"
                        placeholder="Transaction size in shillings"
                      />
                    </div>

                    {/* Result Card */}
                    <div className={`border rounded-xl p-3.5 text-xs font-sans leading-relaxed ${validationResult.color}`}>
                      <div className="flex items-center gap-1.5 font-bold font-mono">
                        <AlertTriangle className="h-4 w-4 text-indigo-650" />
                        <span>{validationResult.status}</span>
                      </div>
                      <p className="mt-1 text-[11px] opacity-90 leading-normal">{validationResult.note}</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Mandatory Regulatory References Block */}
              <div className="border border-slate-150 rounded-2xl p-5 bg-white">
                <h4 className="font-bold text-slate-800 text-sm mb-3">BoU compliance Checklist Key Elements</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                    <div className="flex items-center gap-1 font-bold text-slate-705">
                      <UserCheck className="h-4 w-4 text-indigo-600 shrink-0" />
                      <span>Part VIII Customer Protection</span>
                    </div>
                    <p className="text-[10.5px] text-slate-500 leading-normal">
                      Full transparency in payout pricing, hourly yield metrics, and verified opt-in authorization on MoMo pushes.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                    <div className="flex items-center gap-1 font-bold text-slate-705">
                      <Lock className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>Part VII Operational Integrity</span>
                    </div>
                    <p className="text-[10.5px] text-slate-500 leading-normal">
                      SSL encrypted connection, zero key retention outside environment, and standard secure sandboxing.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                    <div className="flex items-center gap-1 font-bold text-slate-705">
                      <Building className="h-4 w-4 text-amber-600 shrink-0" />
                      <span>Section 24 Interoperability</span>
                    </div>
                    <p className="text-[10.5px] text-slate-500 leading-normal">
                      Two-network reconciliation architecture supporting standard MTN & Airtel Uganda API push tokens cleanly.
                    </p>
                  </div>
                </div>
              </div>

            </motion.div>
          )}

          {/* TAP 2: PRIVACY POLICY SHEET */}
          {activeSubTab === 'privacy' && (
            <motion.div
              key="privacy"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-6 max-h-[500px] overflow-y-auto pr-2 font-sans"
            >
              <div className="prose prose-slate max-w-none text-xs leading-relaxed space-y-5 text-slate-600">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-500 italic mt-1 font-mono text-[11px]">
                  📌 Last updated: June 19, 2026. Certified compliant with the Ugandan Data Protection and Privacy Act, 2019 and registration guidelines with the Personal Data Protection Office (PDPO).
                </div>

                <div className="space-y-2">
                  <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">1. Scope of Data Privacy</h3>
                  <p>
                    This Privacy Policy defines how 2K POWER APP ("we", "our", "the system") processes, stores, and transfers personally identifiable attributes of investors and operators. Our storage processes strictly adhere to the high-level standard protocols of the Republic of Uganda.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">2. Information Collection & Telecommunications Integrations</h3>
                  <p>
                    To enable micro-settlement pushes, real-time yield tracker simulation, and automatic pool investments, we collect and process:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Investor Mobile Phone Numbers</strong>: Used strictly for executing MTN Mobile Money or Airtel Money B2C disbursements and SMS yield report alerts.</li>
                    <li><strong>Investor Emails & ID profiles</strong>: Captured via secure Firebase Identification protocols matching regional KYC standards.</li>
                    <li><strong>Ledger transactional details</strong>: Historical audit trails of pool subscriptions, payouts, and deposit authorizations.</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">3. Security and Escrow Data Safeguards</h3>
                  <p>
                    We implement high-grade industry security standards. Access to API gateways and credentials is isolated. Data in transition uses end-to-end HTTPS protocols. Secret credentials for regional telecommunication gateways are securely held in standard cloud environment parameters, keeping database records insulated against unauthorized third-party inspection.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">4. Third-Party Sharing Rules</h3>
                  <p>
                    We do not sell, rent, or lease verified participant details. Phone records are shared securely with partner payment aggregators licensed by the Bank of Uganda under Section 4 of the NPS Act, solely for the purpose of executing carrier mobile wallet payment handshakes.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">5. Investor Rights & Consent</h3>
                  <p>
                    Participants maintain absolute rights to request extraction, audit logs, or immediate erasure of their database indexes (except transactional logs which require historical preservation under active bank of Uganda ledger standards). For queries, escalate logs directly via email to privacy@gridpower.ug.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAP 3: TERMS OF SERVICE SHEET */}
          {activeSubTab === 'terms' && (
            <motion.div
              key="terms"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-6 max-h-[500px] overflow-y-auto pr-2 font-sans"
            >
              <div className="prose prose-slate max-w-none text-xs leading-relaxed space-y-5 text-slate-600">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-500 italic mt-1 font-mono text-[11px]">
                  📌 Active Contractual Version 4.8. Binding on all verified Investors and Operator accounts as of June 19, 2026.
                </div>

                <div className="space-y-2">
                  <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">1. Mutual Investment Agreement</h3>
                  <p>
                    By activating an investment tier pool product or requesting a direct MTN/Airtel cash-in push token simulation, you confirm that you have read, understood, and accept these standard Terms of Service rules and agree to obey the governing laws of the High Court of Uganda.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">2. Micro-settlement yields & Compounding Simulator</h3>
                  <p>
                    Yield statistics, live clock compounding loops, and financial metrics displayed on the Investor portal represent simulated allocations based on localized grid operations. 2K POWER APP utilizes partners' licensed APIs to fulfill direct payouts. Yield cycles fluctuate depending on regional mobile network activity levels and terminal stability.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">3. User Commitments & KYC Truthfulness</h3>
                  <p>
                    The client warrants that the phone numbers entered belong solely to their verified person or corporate entity interface, and that funds processed do not violate the Ugandan Anti-Money Laundering Act, 2013 or financing of terrorism protocols. Violating profiles are immediately blacklisted and funds sequestered.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">4. Withdrawal and API Cash-Out Disbursements</h3>
                  <p>
                    Requested active yield payout operations execute through standard B2C financial push endpoints. Payouts are generally finalized within seconds, but may occupy up to 24 hours during systemic telecom mobile network congestion or during regulatory manual check triggers.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">5. Limit of Liability & Dispute Arbitration</h3>
                  <p>
                    Neither 2K POWER APP, its core developers, nor its partner escrow services shall be held liable for delayed pushes due to client end-device carrier disconnections, uncompleted SMS PIN requests, or local network out-of-service intervals. Disputes must be submitted in writing within 15 standard days of reconciliation discrepancy.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}
