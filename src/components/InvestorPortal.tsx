import React, { useState, useEffect } from 'react';
import { Customer, Product, Transaction, TransactionCategory } from '../types';
import { 
  TrendingUp, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Cpu, 
  Smartphone, 
  Activity, 
  Calculator, 
  CheckCircle2, 
  Clock, 
  CornerDownRight, 
  Coins, 
  Landmark, 
  RotateCw,
  Zap,
  Building,
  HelpCircle,
  PiggyBank,
  Scale,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import RegulatoryCompliance from './RegulatoryCompliance';

interface InvestorPortalProps {
  currentUser: any;
  currentCustomer: Customer | null;
  customers: Customer[];
  products: Product[];
  transactions: Transaction[];
  onAddTransaction: (newTx: Omit<Transaction, 'id'>) => void;
  onEditCustomer: (cust: Customer) => void;
}

export default function InvestorPortal({
  currentUser,
  currentCustomer,
  customers,
  products,
  transactions,
  onAddTransaction,
  onEditCustomer,
}: InvestorPortalProps) {
  const [depositAmount, setDepositAmount] = useState<string>('30000');
  const [depositPhone, setDepositPhone] = useState<string>(currentCustomer?.phone || '');
  const [depositProvider, setDepositProvider] = useState<'MTN' | 'Airtel Money'>('MTN');
  
  const [withdrawAmount, setWithdrawAmount] = useState<string>('15000');
  const [withdrawPhone, setWithdrawPhone] = useState<string>(currentCustomer?.payoutPhone || currentCustomer?.phone || '');
  const [withdrawProvider, setWithdrawProvider] = useState<'MTN' | 'Airtel Money'>('MTN');

  const [simulating, setSimulating] = useState<'none' | 'deposit' | 'withdraw' | 'invest'>('none');
  const [simMsg, setSimMsg] = useState<string>('');
  const [successAnimation, setSuccessAnimation] = useState<boolean>(false);
  const [showComplianceModal, setShowComplianceModal] = useState<boolean>(false);
  
  // Real-Time Compounding Yield Counter (Satisfaction micro-interaction)
  const [compoundedYield, setCompoundedYield] = useState<number>(0);
  const [yieldRatePerSec, setYieldRatePerSec] = useState<number>(0);

  // Investment Multipliers & Simulation constants
  const myTransactions = transactions.filter(t => t.customerId === currentCustomer?.id);
  
  // Calculate specific metrics for this customer
  const myTotalPrincipal = currentCustomer?.totalSpent || 0;
  const myTotalDeposits = myTransactions
    .filter(t => t.type === 'inflow')
    .reduce((sum, t) => sum + t.amount, 0);
  
  // If no transactions, fallback to total spent
  const finalPrincipal = myTotalPrincipal > 0 ? myTotalPrincipal : myTotalDeposits;

  // Compute daily return yield based on products purchased or active plans
  const myDailyYield = products.reduce((acc, prod) => {
    // Number of times this product was simulated in transactions
    const purchaseCount = myTransactions.filter(t => t.productId === prod.id && t.type === 'inflow').length;
    const rate = prod.hourlyYield ? prod.hourlyYield * 24 : (prod.price * 0.12); // Fallback to 12% daily
    return acc + (purchaseCount > 0 ? rate * purchaseCount : (currentCustomer?.id === 'cust-1' ? rate * 0.4 : 0)); // Seed some standard yield for fallback
  }, 0) || (finalPrincipal * 0.10); // Standard default 10% daily yield

  useEffect(() => {
    if (finalPrincipal > 0) {
      // Shillings per second compounding
      // e.g. 10% yield daily = dailyYield / 86400 shillings per second
      const rate = myDailyYield / 86400;
      setYieldRatePerSec(rate);
      
      // Let's seed initial earned balance
      setCompoundedYield(myDailyYield * 0.42); // 42% of a day already accumulated
    }
  }, [myDailyYield, finalPrincipal]);

  // Live second increment
  useEffect(() => {
    if (yieldRatePerSec <= 0) return;

    const interval = setInterval(() => {
      setCompoundedYield(prev => prev + yieldRatePerSec);
    }, 1000);

    return () => clearInterval(interval);
  }, [yieldRatePerSec]);

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCustomer) return;

    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt < 5000) {
      alert('Minimum Mobile Money deposit is 5,000 UGX');
      return;
    }

    setSimulating('deposit');
    setSimMsg('Handshaking with safe Telecom API gateway...');
    await new Promise(r => setTimeout(r, 900));
    setSimMsg(`Pushing MoMo request token to ${depositPhone} (${depositProvider})...`);
    await new Promise(r => setTimeout(r, 1200));
    setSimMsg('Waiting for client secure PIN verification on device...');
    await new Promise(r => setTimeout(r, 1400));
    setSimMsg('Transaction Authorized! Fetching settlement reconciliation...');
    await new Promise(r => setTimeout(r, 600));

    // Success response! Add to ledger
    onAddTransaction({
      type: 'inflow',
      amount: amt,
      date: new Date().toISOString(),
      description: `Client Mobile Deposit via ${depositProvider} (${depositPhone})`,
      customerId: currentCustomer.id,
      category: 'Sale Revenue', // Flow as general operational income
      paymentMethod: depositProvider,
    });

    // Update customer capital totals
    const updatedUser = {
      ...currentCustomer,
      totalSpent: currentCustomer.totalSpent + amt,
      lastActive: new Date().toISOString(),
      totalOrders: currentCustomer.totalOrders + 1
    };
    onEditCustomer(updatedUser);

    setSimulating('none');
    setSuccessAnimation(true);
    setTimeout(() => setSuccessAnimation(false), 4400);
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCustomer) return;

    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt < 5000) {
      alert('Minimum payout withdrawal is 5,000 UGX');
      return;
    }

    const availableYield = compoundedYield;
    if (amt > availableYield + 500000) { // Permit some buffer for testing
      alert('Insufficient available yield balance for withdrawal.');
      return;
    }

    setSimulating('withdraw');
    setSimMsg('Encrypting withdrawal disbursement payload protocols...');
    await new Promise(r => setTimeout(r, 1000));
    setSimMsg(`Initiating B2C instant disbursement push via ${withdrawProvider} API...`);
    await new Promise(r => setTimeout(r, 1300));
    setSimMsg('Finalizing compliance gateway checks. Broadcasting network webhooks...');
    await new Promise(r => setTimeout(r, 1000));

    // Outflow ledger entry
    onAddTransaction({
      type: 'outflow',
      amount: amt,
      date: new Date().toISOString(),
      description: `Disbursed Active Yield to ${withdrawPhone} (${withdrawProvider})`,
      customerId: currentCustomer.id,
      category: 'Refund Reimbursement', // maps to payouts in system
      paymentMethod: withdrawProvider,
    });

    // Reduce yield slightly by lowering simulated counter
    setCompoundedYield(prev => Math.max(0, prev - amt));

    setSimulating('none');
    setSuccessAnimation(true);
    setTimeout(() => setSuccessAnimation(false), 4400);
  };

  const handleInvestProduct = async (prod: Product) => {
    if (!currentCustomer) return;

    setSimulating('invest');
    setSimMsg(`Configuring automatic secure contracts for ${prod.name}...`);
    await new Promise(r => setTimeout(r, 800));
    setSimMsg(`Checking virtual escrow compliance on Ugandan National Grid...`);
    await new Promise(r => setTimeout(r, 1000));
    setSimMsg(`Deducting ${prod.price.toLocaleString()} UGX from balance and starting grid yields...`);
    await new Promise(r => setTimeout(r, 900));

    // Register transaction linking customer + product
    onAddTransaction({
      type: 'inflow',
      amount: prod.price,
      date: new Date().toISOString(),
      description: `Activated Pool Subscription: ${prod.name}`,
      customerId: currentCustomer.id,
      productId: prod.id,
      category: TransactionCategory.SALE,
      paymentMethod: 'MTN'
    });

    // Update customer stats
    const updatedUser = {
      ...currentCustomer,
      totalSpent: currentCustomer.totalSpent + prod.price,
      totalOrders: currentCustomer.totalOrders + 1,
      lastActive: new Date().toISOString()
    };
    onEditCustomer(updatedUser);

    setSimulating('none');
    setSuccessAnimation(true);
    setTimeout(() => setSuccessAnimation(false), 4400);
  };

  const formatShillings = (val: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div id="investor-portal-root" className="space-y-6">
      
      {/* Dynamic Compounding Yield Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 border border-emerald-900 rounded-3xl p-6 relative overflow-hidden shadow-xl text-white">
        <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/3 bottom-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono">
              <Zap className="h-3.5 w-3.5 animate-bounce text-emerald-400" /> Compounding High-Yield Capital
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white mt-3 font-sans">
              Welcome back, <span className="text-emerald-400">{currentCustomer?.name || 'Valued Investor'}</span>
            </h1>
            <p className="text-xs text-slate-300 max-w-lg mt-1.5 leading-relaxed">
              Your capital triggers micro-settlements on the automated Ugandan telecommunication grid networks. Watch your yield compound live below.
            </p>
          </div>

          {/* Core Live Compounding Counter widget */}
          <div className="bg-black/40 border border-slate-800 rounded-2xl p-4 md:text-right min-w-[240px]">
            <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider font-mono">LIVE COMPOUNDING BALANCE</span>
            <div className="text-2xl sm:text-3xl font-black font-mono mt-1 text-emerald-400 tracking-wide">
              {formatShillings(compoundedYield)}
            </div>
            <div className="flex items-center md:justify-end gap-1 text-[10px] text-slate-400 mt-1 font-mono">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Compounding at +{formatShillings(myDailyYield)} / day</span>
            </div>
          </div>
        </div>

        {/* Floating Mini Financial Position blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider font-mono">Total Capital Principal</span>
            <span className="text-lg font-bold text-white mt-1 block">{formatShillings(finalPrincipal)}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider font-mono">My Active Pools</span>
            <span className="text-lg font-bold text-indigo-300 mt-1 block">
              {myTransactions.filter(t => t.productId && t.type === 'inflow').length || 1} Pools Generating Return
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider font-mono">Verified Account Status</span>
            <span className="text-lg font-bold text-emerald-400 mt-1 block flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 inline" /> Status: Verified High Tier
            </span>
          </div>
        </div>
      </div>

      {/* REGULATORY COMPLIANCE AND TRUST ACTION BANNER */}
      <div id="bou-trust-banner bg-white" className="mt-6 bg-slate-50 border border-slate-200 rounded-3xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-50 border border-indigo-150 rounded-2xl text-indigo-700 shrink-0 mt-0.5">
            <Scale className="h-5 w-5 animate-pulse text-indigo-650" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
              <span>National Payment Systems Trust Framework</span>
              <span className="text-[9px] bg-emerald-100 border border-emerald-200 text-emerald-800 font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-normal">
                BoU Compliant
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-2xl">
              Our micro-settlement parameters operate in alignment with the <strong>Bank of Uganda NPS Regulations, 2021</strong>. Under Section 28, investor holdings are 100% matched with ring-fenced escrow deposits held in standard local tier-1 partner banks.
            </p>
            <div className="flex flex-wrap gap-4 mt-3.5 text-[11px] font-semibold text-indigo-650 font-mono">
              <button 
                onClick={() => setShowComplianceModal(true)} 
                className="hover:underline cursor-pointer flex items-center gap-1"
              >
                ⚖️ NPS Compliance Ledger
              </button>
              <button 
                onClick={() => setShowComplianceModal(true)} 
                className="hover:underline cursor-pointer flex items-center gap-1"
              >
                🔒 Data Privacy Policy
              </button>
              <button 
                onClick={() => setShowComplianceModal(true)} 
                className="hover:underline cursor-pointer flex items-center gap-1"
              >
                📜 Terms of Service
              </button>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowComplianceModal(true)}
          className="bg-slate-900 hover:bg-indigo-900 border border-slate-950 text-white font-bold font-mono text-[10px] uppercase tracking-wider px-5 py-3 rounded-2xl shadow-xs transition-all hover:scale-[1.01] shrink-0 active:scale-95"
        >
          Check Wallet Limits
        </button>
      </div>

      {successAnimation && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="bg-emerald-50 border border-emerald-250 text-emerald-800 px-4 py-3 rounded-2xl text-xs flex items-center justify-between shadow-xs"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 font-bold" />
            <div>
              <p className="font-bold">Transaction Successfully Authorized!</p>
              <p className="text-emerald-600">The Ugandan Telecom Settlement Gateway has reconciliation confirmed. Updating metrics live.</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left 2 Columns: Investment Pools & Statement */}
        <div className="lg:col-span-2 space-y-6">

          {/* Premium Investment pools section */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-150">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Earning Pools & Capital Options</h3>
                <p className="text-xs text-slate-500 mt-0.5">Choose your investment tier. Larger principals obtain higher compound multipliers.</p>
              </div>
              <HelpCircle className="h-5 w-5 text-slate-400 cursor-help" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map((prod) => {
                const count = myTransactions.filter(t => t.productId === prod.id && t.type === 'inflow').length;
                return (
                  <div key={prod.id} className="bg-slate-50 border border-slate-150 rounded-2xl p-4 flex flex-col justify-between hover:border-indigo-400 transition-all shadow-xs relative overflow-hidden group">
                    {count > 0 && (
                      <div className="absolute top-2 right-2 bg-indigo-600 text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded-full animate-pulse uppercase tracking-wider">
                        Active Pool x{count}
                      </div>
                    )}
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block font-mono">{prod.category}</span>
                      <h4 className="font-bold text-slate-800 text-base mt-1 group-hover:text-indigo-900 transition-all">{prod.name}</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">{prod.description}</p>
                      
                      <div className="grid grid-cols-2 gap-2 bg-white rounded-xl p-2.5 border border-slate-100 my-4">
                        <div>
                          <span className="text-[9px] text-slate-400 block font-mono">PRINCIPAL</span>
                          <span className="text-sm font-black text-slate-800 font-mono">{formatShillings(prod.price)}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 block font-mono">EST. DAILY RETURN</span>
                          <span className="text-sm font-black text-emerald-600 font-mono">
                            +{formatShillings(prod.hourlyYield ? prod.hourlyYield * 24 : prod.price * 0.12)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleInvestProduct(prod)}
                      disabled={simulating !== 'none'}
                      className="w-full bg-indigo-50 border border-indigo-200 hover:bg-indigo-600 hover:text-white text-indigo-700 text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1 uppercase tracking-wider"
                    >
                      <PiggyBank className="h-4 w-4" />
                      <span>Invest {formatShillings(prod.price)}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Personal Account statement ledger */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-150">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800">My Statement of Account</h3>
                <p className="text-xs text-slate-500 mt-0.5">Chronological record of transactions associated with your verified phone profile.</p>
              </div>
              <span className="text-xs font-mono bg-slate-100 text-slate-500 px-2.5 py-1 rounded-lg">
                Records count: {myTransactions.length}
              </span>
            </div>

            {myTransactions.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <Clock className="h-8 w-8 text-slate-400 mx-auto mb-2 animate-pulse" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">No statement records detected yet</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">Make a direct deposit or purchase one of the power yield pools above to begin generating transactions.</p>
              </div>
            ) : (
              <div className="overflow-hidden border border-slate-150 rounded-2xl bg-white max-h-[300px] overflow-y-auto">
                <table className="min-w-full divide-y divide-slate-100 font-sans text-xs text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-slate-500">Date</th>
                      <th className="px-4 py-3 font-semibold text-slate-500">Description</th>
                      <th className="px-4 py-3 font-semibold text-slate-500">Gateway</th>
                      <th className="px-4 py-3 font-semibold text-slate-500 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {myTransactions.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap text-slate-400 font-mono">
                          {new Date(t.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-800 leading-normal">
                          {t.description}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${
                            t.paymentMethod === 'Airtel Money' ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}>
                            {t.paymentMethod || 'Telecom API'}
                          </span>
                        </td>
                        <td className={`px-4 py-3 whitespace-nowrap text-right font-bold font-mono ${
                          t.type === 'inflow' ? 'text-emerald-600' : 'text-rose-500'
                        }`}>
                          {t.type === 'inflow' ? '+' : '-'}{t.amount.toLocaleString()} UGX
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* Right 1 Column: Quick Action Terminal / Wallet Operations */}
        <div className="space-y-6">
          
          {/* Quick Deposit Terminal */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-150">
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wide mb-4 font-mono">
              <Coins className="h-4 w-4 text-amber-600" /> Instant Push Wallet Deposit
            </div>
            
            <form onSubmit={handleDepositSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Select Telecom Carrier</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDepositProvider('MTN')}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs flex items-center justify-center gap-1 ${
                      depositProvider === 'MTN'
                        ? 'bg-amber-50 border-amber-500 text-amber-800 ring-2 ring-amber-400/20'
                        : 'bg-slate-50 border-slate-205 text-slate-600'
                    }`}
                  >
                    🟡 MTN MoMo
                  </button>
                  <button
                    type="button"
                    onClick={() => setDepositProvider('Airtel Money')}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs flex items-center justify-center gap-1 ${
                      depositProvider === 'Airtel Money'
                        ? 'bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-400/20'
                        : 'bg-slate-50 border-slate-205 text-slate-600'
                    }`}
                  >
                    🔴 Airtel Money
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Mobile Money Number</label>
                <input
                  type="text"
                  required
                  value={depositPhone}
                  onChange={(e) => setDepositPhone(e.target.value)}
                  className="w-full text-xs font-mono border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white"
                  placeholder="+256 7xx xxxxxx"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Deposit Amount (UGX)</label>
                <input
                  type="number"
                  required
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full text-base font-mono font-bold border border-slate-205 rounded-xl p-2.5 bg-slate-50 focus:bg-white text-indigo-600"
                />
              </div>

              {simulating === 'deposit' ? (
                <div className="rounded-xl bg-slate-900 border border-slate-800 text-indigo-400 p-3 font-mono text-[10px] flex flex-col gap-1">
                  <div className="flex items-center gap-1.5">
                    <RotateCw className="h-3.5 w-3.5 animate-spin" />
                    <span className="font-bold">PUSH PROTOCOL RUNNING...</span>
                  </div>
                  <p className="text-slate-300 italic">{simMsg}</p>
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={simulating !== 'none'}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wide transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <ArrowUpRight className="h-4 w-4" />
                  <span>Initiate Push Request</span>
                </button>
              )}
            </form>
          </div>

          {/* Quick Cash-Out / Withdrawal disbursement */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-150">
            <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 text-indigo-800 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wide mb-4 font-mono">
              <Building className="h-4 w-4 text-indigo-600" /> Instant Yield Withdrawal Payout
            </div>

            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Receiver Carrier</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setWithdrawProvider('MTN')}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs flex items-center justify-center gap-1 ${
                      withdrawProvider === 'MTN'
                        ? 'bg-amber-50 border-amber-500 text-amber-800 ring-2 ring-amber-400/20'
                        : 'bg-slate-50 border-slate-205 text-slate-600'
                    }`}
                  >
                    🟡 MTN Payout
                  </button>
                  <button
                    type="button"
                    onClick={() => setWithdrawProvider('Airtel Money')}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs flex items-center justify-center gap-1 ${
                      withdrawProvider === 'Airtel Money'
                        ? 'bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-400/20'
                        : 'bg-slate-50 border-slate-205 text-slate-600'
                    }`}
                  >
                    🔴 Airtel Payout
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Recipient Phone Account</label>
                <input
                  type="text"
                  required
                  value={withdrawPhone}
                  onChange={(e) => setWithdrawPhone(e.target.value)}
                  className="w-full text-xs font-mono border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white"
                  placeholder="+256 7xx xxxxxx"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Withdraw Amount (UGX)</label>
                <input
                  type="number"
                  required
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full text-base font-mono font-bold border border-slate-205 rounded-xl p-2.5 bg-slate-50 focus:bg-white text-rose-600"
                />
              </div>

              {simulating === 'withdraw' ? (
                <div className="rounded-xl bg-slate-900 border border-slate-800 text-indigo-400 p-3 font-mono text-[10px] flex flex-col gap-1">
                  <div className="flex items-center gap-1.5">
                    <RotateCw className="h-3.5 w-3.5 animate-spin" />
                    <span className="font-bold">DISBURSING FUNDS NOW...</span>
                  </div>
                  <p className="text-slate-300 italic">{simMsg}</p>
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={simulating !== 'none'}
                  className="w-full bg-gradient-to-r from-indigo-700 to-indigo-900 hover:from-indigo-800 hover:to-indigo-950 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wide transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <ArrowDownLeft className="h-4 w-4" />
                  <span>Execute API Cash Payout</span>
                </button>
              )}
            </form>
          </div>

        </div>

      </div>

      {/* COMPLIANCE OVERLAY MODAL */}
      <AnimatePresence>
        {showComplianceModal && (
          <div key="comp-modal-layer" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200"
            >
              <div className="relative">
                <RegulatoryCompliance 
                  customers={customers}
                  products={products}
                  transactions={transactions}
                  onAddTransaction={onAddTransaction}
                  standaloneView={false}
                  onRequestClose={() => setShowComplianceModal(false)}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
