import React, { useState, useEffect, useRef } from 'react';
import { Customer, Transaction, Product, TransactionCategory } from '../types';
import { Search, TrendingUp, DollarSign, ArrowUpRight, ShieldCheck, Wallet, Calendar, Sparkles, RefreshCw, Smartphone, Download, Check, Share2, CircleAlert, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OnlineProfitMonitorProps {
  customers: Customer[];
  products: Product[];
  transactions: Transaction[];
  onAddTransaction: (newTx: Omit<Transaction, 'id'>) => void;
  onEditCustomer: (cust: Customer) => void;
}

export default function OnlineProfitMonitor({
  customers,
  products,
  transactions,
  onAddTransaction,
  onEditCustomer,
}: OnlineProfitMonitorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [liveEarnings, setLiveEarnings] = useState<number>(0);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [payoutInputAmount, setPayoutInputAmount] = useState('');
  const [payoutStatus, setPayoutStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [payoutTxMsg, setPayoutTxMsg] = useState('');
  const [reinvestStatus, setReinvestStatus] = useState<'idle' | 'success'>('idle');
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [viewCertificate, setViewCertificate] = useState(false);

  // Extra investment duration states
  const [monitorDays, setMonitorDays] = useState<number>(30);
  const [saveDaysStatus, setSaveDaysStatus] = useState<boolean>(false);

  const localTickerRef = useRef<NodeJS.Timeout | null>(null);

  // Suggested phone numbers/NINs of existing high-fidelity accounts for easy sandbox lookup
  const promoDemoUsers = customers.filter(c => c.totalSpent > 0).slice(0, 4);

  // Format currency helper
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(val);
  };

  // Yield tier lookup helper depending on investment lock-in days
  const getYieldRate = (days: number) => {
    if (days < 14) return { rate: 0.08, name: 'Starter Tier ⚡' };
    if (days <= 30) return { rate: 0.10, name: 'Silver Standard 💎' };
    if (days <= 90) return { rate: 0.13, name: 'Gold Premium 🌟' };
    if (days <= 180) return { rate: 0.16, name: 'Diamond Executive 🏆' };
    return { rate: 0.20, name: 'Sovereign Elite 👑' };
  };

  // Sync monitor days when customer changes
  useEffect(() => {
    if (selectedCustomer) {
      setMonitorDays(selectedCustomer.investmentDays || 30);
    }
  }, [selectedCustomer]);

  // Find user by phone, NIN, email or name query
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;

    const matched = customers.find(
      (c) =>
        c.phone?.toLowerCase().includes(query) ||
        c.payoutPhone?.toLowerCase().includes(query) ||
        (c.registeredNum && c.registeredNum.toLowerCase().includes(query)) ||
        c.name.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query)
    );

    if (matched) {
      setSelectedCustomer(matched);
      setPayoutStatus('idle');
      setReinvestStatus('idle');
      setViewCertificate(false);
      
      const activeDays = matched.investmentDays || 30;
      const rate = getYieldRate(activeDays).rate;
      const hourlyRate = rate / 24;

      const lastActiveTime = new Date(matched.lastActive).getTime();
      const now = Date.now();
      const hoursDiff = Math.max(0.1, (now - lastActiveTime) / (1000 * 3600));
      
      const initialAccrued = matched.totalSpent * hourlyRate * hoursDiff;
      setLiveEarnings(initialAccrued);
      setTimeElapsed(0);
    } else {
      alert('No active investment ledger found for that reference. Try searching with a preset demo investor!');
    }
  };

  // Ticker updater to simulate live profit ticking up in real-time
  useEffect(() => {
    if (!selectedCustomer || selectedCustomer.totalSpent <= 0) {
      if (localTickerRef.current) clearInterval(localTickerRef.current);
      return;
    }

    // Yield logic: dynamic daily return rate based on monitor days selected!
    const dailyReturnRate = getYieldRate(monitorDays).rate;
    const yieldPerSecond = (selectedCustomer.totalSpent * dailyReturnRate) / 86400;

    localTickerRef.current = setInterval(() => {
      setLiveEarnings((prev) => prev + yieldPerSecond * 0.1); // updates every 100ms
      setTimeElapsed((prev) => prev + 0.1);
    }, 100);

    return () => {
      if (localTickerRef.current) clearInterval(localTickerRef.current);
    };
  }, [selectedCustomer, monitorDays]);

  // Handle demo user direct click
  const handleSelectDemo = (cust: Customer) => {
    setSelectedCustomer(cust);
    setSearchQuery(cust.phone || cust.registeredNum || cust.name);
    setPayoutStatus('idle');
    setReinvestStatus('idle');
    setViewCertificate(false);

    const activeDays = cust.investmentDays || 30;
    const rate = getYieldRate(activeDays).rate;
    const hourlyRate = rate / 24;

    const lastActiveTime = new Date(cust.lastActive).getTime();
    const now = Date.now();
    const hoursDiff = Math.max(1, (now - lastActiveTime) / (1000 * 3600));
    
    const initialAccrued = cust.totalSpent * hourlyRate * hoursDiff;
    setLiveEarnings(initialAccrued);
    setTimeElapsed(0);
  };

  // Trigger simulated MOMO payout payout dispatch
  const handlePayoutTrigger = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    const reqAmt = parseFloat(payoutInputAmount);
    if (isNaN(reqAmt) || reqAmt <= 0) {
      alert('Please state a valid cashout yield amount.');
      return;
    }

    if (reqAmt > liveEarnings) {
      alert(`Insufficient live accrued balance. Maximum withdrawable right now is ${formatCurrency(liveEarnings)}`);
      return;
    }

    setPayoutStatus('processing');

    setTimeout(() => {
      // Complete simulated payout inside actual transactions ledger
      onAddTransaction({
        type: 'outflow',
        amount: reqAmt,
        date: new Date().toISOString(),
        description: `MoMo High-Yield Cashout: ${selectedCustomer.name}`,
        customerId: selectedCustomer.id,
        category: TransactionCategory.REFUND,
        paymentMethod: Math.random() > 0.5 ? 'MTN' : 'Airtel Money',
      });

      // Deduct from live ticking earnings
      setLiveEarnings(prev => Math.max(0, prev - reqAmt));
      setPayoutStatus('success');
      setPayoutTxMsg(`Simulated MoMo payout of ${formatCurrency(reqAmt)} has been requested & dispatched to line: ${selectedCustomer.payoutPhone || selectedCustomer.phone}! Check status in MOMO ledger.`);
      setPayoutInputAmount('');
    }, 1800);
  };

  // Trigger a rollover / reinvest yield into principal investment plan
  const handleReinvestAction = () => {
    if (!selectedCustomer || liveEarnings < 1000) {
      alert('Minimum reinvestment capital is 1,000 UGX accumulated yield.');
      return;
    }

    const reinvestAmt = Math.round(liveEarnings);
    setReinvestStatus('idle');

    // Create dynamic inflow (deposit representing the reinvested yield compound increment)
    onAddTransaction({
      type: 'inflow',
      amount: reinvestAmt,
      date: new Date().toISOString(),
      description: `Compound Rollover Reinvestment: ${selectedCustomer.name}`,
      customerId: selectedCustomer.id,
      category: TransactionCategory.UPGRADE,
      paymentMethod: 'MTN', // default
    });

    setLiveEarnings(0);
    setReinvestStatus('success');
    setTimeout(() => setReinvestStatus('idle'), 4000);
  };

  // Share certificate mock
  const handleCopyCode = () => {
    const certText = `Verified Yield Receipt: ${selectedCustomer?.name} has an active high-yield portfolio of ${formatCurrency(selectedCustomer?.totalSpent || 0)} earning 10% daily returns live on the 2K Power App. Registered NIN: ${selectedCustomer?.registeredNum}`;
    navigator.clipboard.writeText(certText);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2000);
  };

  const handleSaveInvestmentTerm = () => {
    if (!selectedCustomer) return;
    const updated: Customer = {
      ...selectedCustomer,
      investmentDays: monitorDays,
      lastActive: new Date().toISOString(),
    };
    onEditCustomer(updated);
    setSelectedCustomer(updated);
    setSaveDaysStatus(true);
    setTimeout(() => setSaveDaysStatus(false), 3000);
  };

  // Filter linked transactions for selected investor
  const linkedTxs = selectedCustomer
    ? transactions.filter((t) => t.customerId === selectedCustomer.id)
    : [];

  return (
    <div className="space-y-6" id="online-profit-monitor-section">
      {/* Search Header Jumbotron */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden border border-indigo-500/10">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-1 bg-indigo-500/15 border border-indigo-400/30 text-indigo-300 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono">
            <Sparkles className="h-3 w-3 text-indigo-400" /> Authorized Real-Time Ledger Monitor
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
            🔴 Live Shilling Profit Watcher
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
            Allow your investors to view their high-yield earnings accumulate line-by-line in real-time. Search by entering their registered Phone number, National ID (NIN), or email address here.
          </p>

          {/* Search Bar Form */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 max-w-lg pt-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Enter Investor Mobile No, Name, or NIN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/70 p-3 pl-10 text-xs text-white placeholder-slate-500 focus:border-indigo-400 focus:bg-slate-950 outline-hidden transition-all duration-200 font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shrink-0 cursor-pointer active:scale-95"
            >
              Scan Live Ledger
            </button>
          </form>

          {/* Preset Pill Buttons */}
          <div className="pt-2">
            <span className="text-[10px] font-mono font-bold text-slate-400 block mb-2">
              Select Demo Investor Profile to Test Real-time Monitor:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {promoDemoUsers.map((cust) => (
                <button
                  key={cust.id}
                  type="button"
                  onClick={() => handleSelectDemo(cust)}
                  className={`text-[11px] font-mono font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedCustomer?.id === cust.id
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm font-bold'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800/80'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${selectedCustomer?.id === cust.id ? 'bg-slate-950 animate-ping' : 'bg-emerald-500'}`} />
                  {cust.name} ({cust.phone || 'N/A'})
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {selectedCustomer ? (
          <motion.div
            key={selectedCustomer.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 gap-6 lg:grid-cols-3"
          >
            {/* Column 1: Investor Live scoreboard & counters */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Ticking Scoreboard Card */}
              <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col justify-between min-h-[220px]">
                {/* Background accent */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    {selectedCustomer.avatarUrl ? (
                      <img
                        src={selectedCustomer.avatarUrl}
                        alt={selectedCustomer.name}
                        className="h-12 w-12 rounded-full object-cover border border-slate-200"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-indigo-100 text-indigo-700 font-display font-black text-sm uppercase flex items-center justify-center">
                        {selectedCustomer.name.split(' ').map(n=>n[0]).join('').slice(0, 2)}
                      </div>
                    )}
                    <div>
                      <h4 className="font-display font-extrabold text-slate-800 flex items-center gap-1.5 text-base leading-tight">
                        {selectedCustomer.name}
                        <span className="text-[9px] uppercase font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 font-mono tracking-wider animate-pulse">
                          Active Pool 🟢
                        </span>
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 font-mono">
                        <span>NIN:</span>
                        <span className="font-bold text-slate-700 bg-slate-100 px-1 rounded uppercase">
                          {selectedCustomer.registeredNum || 'PENDING ASSIGNMENT'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider font-mono">Live Connection Speed</span>
                    <span className="text-[10px] font-bold text-emerald-600 font-mono flex items-center justify-end gap-1.5 mt-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                      SECURE 1.2 GB/S
                    </span>
                  </div>
                </div>

                {/* Scoreboard display */}
                <div className="py-6 text-center lg:text-left">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest font-mono block mb-1">
                    🟢 Accumulating Live Yield (Ticking Up Second-by-Second)
                  </span>
                  
                  <div className="text-4xl lg:text-5xl font-black font-mono tracking-tight text-slate-800 flex flex-wrap items-baseline justify-center lg:justify-start gap-1">
                    <span className="text-2xl text-emerald-600 font-extrabold mr-1">UGX</span>
                    <span>{formatCurrency(liveEarnings).replace('UGX', '')}</span>
                  </div>

                  <div className="text-[10px] font-mono text-slate-500 mt-2.5 flex items-center justify-center lg:justify-start gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 w-fit">
                    <TrendingUp className="h-3 w-3 text-emerald-600 animate-pulse" />
                    <span>Compound Interest Velocity:</span>
                    <strong className="text-slate-700 font-bold">+10% Daily Capital Yield</strong>
                  </div>
                </div>

                {/* Quick actions row */}
                <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="text-slate-400 font-mono text-[10px]">
                    Ledger scan elapsed: <span className="text-slate-700 font-bold">{Math.round(timeElapsed)}s</span> (Constant compounding)
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleReinvestAction}
                      className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 text-white rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all hover:bg-slate-800 flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <RefreshCw className="h-3 w-3 text-emerald-500 animate-spin" />
                      <span>Compound Roll-Over</span>
                    </button>

                    <button
                      onClick={() => setViewCertificate(!viewCertificate)}
                      className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Download className="h-3 w-3" />
                      <span>{viewCertificate ? 'Close Certificate' : 'Yield Certificate'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Choose Investment Holding Period Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                    <Calendar className="h-4.5 w-4.5 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm">
                      Choose Your Investment Holding Period
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      Determine your funds holding duration/days. Longer commitment unlocks premium multiplier tiers!
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  {[
                    { days: 7, label: '7 Days', rate: '8%' },
                    { days: 30, label: '30 Days', rate: '10%' },
                    { days: 90, label: '90 Days', rate: '13%' },
                    { days: 180, label: '180 Days', rate: '16%' },
                    { days: 365, label: '365 Days', rate: '20%' },
                  ].map((preset) => {
                    const isSelected = monitorDays === preset.days;
                    return (
                      <button
                        key={preset.days}
                        type="button"
                        onClick={() => setMonitorDays(preset.days)}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col justify-between items-center gap-1.5 hover:border-indigo-400 ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <span className={`text-xs font-bold font-mono ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                          {preset.label}
                        </span>
                        <span className={`text-[10px] font-black tracking-wide font-mono px-1.5 py-0.5 rounded-md ${
                          isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-indigo-50 text-indigo-700'
                        }`}>
                          {preset.rate} Daily
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Range Slider and Custom input row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center pt-2">
                  <div className="md:col-span-2 space-y-1.5">
                    <div className="flex justify-between text-[11px] text-slate-500 font-mono font-bold">
                      <span>Holding Span: 1 Day</span>
                      <span className="text-indigo-600 font-black">Selected: {monitorDays} Days</span>
                      <span>3 Years (1095 Days)</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="1095"
                      value={monitorDays}
                      onChange={(e) => setMonitorDays(parseInt(e.target.value) || 30)}
                      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1 font-mono">
                      Custom Days Index
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="1095"
                        value={monitorDays}
                        onChange={(e) => setMonitorDays(Math.max(1, parseInt(e.target.value) || 30))}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 font-bold font-mono focus:border-indigo-500 outline-hidden focus:bg-white"
                      />
                      <span className="absolute right-3 top-1.5 text-[9px] text-slate-400 font-mono">Days</span>
                    </div>
                  </div>
                </div>

                {/* dynamic summary cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 rounded-xl p-4 border border-slate-100 text-xs text-slate-600">
                  <div className="space-y-1">
                    <span className="text-slate-400 text-[10px] uppercase font-mono block">Selected Holding Status</span>
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      <span>{getYieldRate(monitorDays).name}</span>
                    </div>
                    <span className="text-slate-450 text-[9px] leading-tight block">
                      Lock-in earns a guaranteed <strong className="text-indigo-600 font-bold">{(getYieldRate(monitorDays).rate * 100).toFixed(0)}%</strong> return rate compounded per-diem.
                    </span>
                  </div>

                  <div className="space-y-1 md:border-l md:border-slate-200 md:pl-4">
                    <span className="text-slate-400 text-[10px] uppercase font-mono block">Maturity Date & Projection</span>
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <Calendar className="h-4 w-4 text-indigo-500" />
                      <span>
                        {new Date(Date.now() + monitorDays * 24 * 3600 * 1000).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <span className="text-slate-450 text-[9px] leading-tight block">
                      Estimated value at maturity: <strong className="text-emerald-600 font-bold">
                        {formatCurrency(
                          selectedCustomer.totalSpent * Math.pow(1 + getYieldRate(monitorDays).rate, monitorDays)
                        )}
                      </strong> (compounded).
                    </span>
                  </div>
                </div>

                {/* Save to profile button */}
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleSaveInvestmentTerm}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                      saveDaysStatus
                        ? 'bg-emerald-500 text-slate-950 shadow-sm'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
                    }`}
                  >
                    {saveDaysStatus ? (
                      <>
                        <Check className="h-4 w-4 stroke-[3]" />
                        <span>Committed & Synchronized!</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" />
                        <span>Lock-in & Commit holding term</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Certificate view drawer */}
              {viewCertificate && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-slate-900 text-white p-6 rounded-2xl border-4 border-dashed border-indigo-500/30 relative select-text"
                >
                  <div className="absolute right-4 top-4 bg-indigo-600/20 text-indigo-400 border border-indigo-500/35 px-2 py-0.5 rounded text-[8px] font-bold font-mono uppercase tracking-widest">
                    Official Active Seal
                  </div>

                  <div className="text-center space-y-1 mb-5">
                    <h3 className="font-display text-sm font-black uppercase text-indigo-400 tracking-widest font-mono">2K POWER APP HIGH-YIELD TRUST</h3>
                    <p className="text-[10px] text-slate-400">Verifiable Yield Statement & Active Guarantee Certificate</p>
                  </div>

                  <div className="font-mono text-xs text-slate-350 space-y-2 border-y border-slate-800 py-4">
                    <div className="flex justify-between">
                      <span>Investor Ident:</span>
                      <strong className="text-white font-extrabold uppercase">{selectedCustomer.name}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Ledger NIN Reference:</span>
                      <strong className="text-white font-semibold">{selectedCustomer.registeredNum || 'GSUA-94110-UG'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Transacting MOMO line:</span>
                      <strong className="text-white font-semibold">{selectedCustomer.phone || 'Walk-in'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Target Payout line:</span>
                      <strong className="text-white font-semibold">{selectedCustomer.payoutPhone || 'N/A'}</strong>
                    </div>
                    <div className="flex justify-between border-t border-slate-800/80 pt-2 text-white">
                      <span>Principal Capital Pool:</span>
                      <strong className="text-emerald-400 font-extrabold">{formatCurrency(selectedCustomer.totalSpent)}</strong>
                    </div>
                    <div className="flex justify-between text-white">
                      <span>Guaranteed Hourly Rate:</span>
                      <strong className="text-emerald-400 font-extrabold">+{formatCurrency(selectedCustomer.totalSpent * 0.00416)} / HR</strong>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-[9px] text-slate-400/80 italic leading-snug">
                      Digital cryptographic signature verifies constant 10% daily yield increment on Uganda Mobile Money block-ledgers. Managed by Criss Julius.
                    </div>
                    <button
                      onClick={handleCopyCode}
                      className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-[10px] uppercase font-mono tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer. select-none shrink-0"
                    >
                      {copiedSuccess ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Copied Verified Statement!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="h-3.5 w-3.5" />
                          <span>Share Statement Text</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Dynamic projections chart block */}
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="mb-4">
                  <h4 className="font-semibold text-slate-800 flex items-center gap-1.5 text-sm">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                    Future Profit Projection Map ({monitorDays}-Day Investment Horizon)
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Visual curve of your compounding returns over {monitorDays} days based on selected interest tier.
                  </p>
                </div>

                {/* SVG Graph for Projections */}
                <div className="pt-2 select-none">
                  <svg viewBox="0 0 540 130" className="w-full h-auto overflow-visible">
                    <defs>
                      <linearGradient id="prjGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.12" />
                        <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal dotted references */}
                    <line x1="30" y1="20" x2="510" y2="20" stroke="#f1f5f9" strokeDasharray="3,3" />
                    <line x1="30" y1="65" x2="510" y2="65" stroke="#f1f5f9" strokeDasharray="3,3" />
                    <line x1="30" y1="110" x2="510" y2="110" stroke="#f1f5f9" strokeDasharray="3,3" />

                    {/* Projections points rendering */}
                    {(() => {
                      const points = [1, 2, 3, 4, 5, 6, 7];
                      const totalC = selectedCustomer.totalSpent;
                      const activeRate = getYieldRate(monitorDays).rate;
                      
                      // map x coords and heights
                      const getX = (i: number) => 30 + (i * 480) / 6;
                      // compound curve y
                      const getY = (i: number) => {
                        const compoundingCoeff = Math.pow(1 + activeRate, i); // compounding index multiplier
                        const outputVal = totalC * compoundingCoeff;
                        const maxExpectedComp = totalC * Math.pow(1 + activeRate, 6);
                        
                        return 110 - ((outputVal - totalC) / Math.max(1000, maxExpectedComp - totalC)) * 85;
                      };

                      const dPath = points.map((p, idx) => `${getX(idx).toFixed(1)},${getY(idx).toFixed(1)}`);
                      const pathDString = `M ${dPath.join(' L ')}`;
                      const areaDString = `${pathDString} L ${getX(points.length - 1).toFixed(1)},110 L ${getX(0).toFixed(1)},110 Z`;

                      return (
                        <>
                          {/* Gradients */}
                          <path d={areaDString} fill="url(#prjGradient)" />
                          {/* Curve line */}
                          <path d={pathDString} fill="none" stroke="#4f46e5" strokeWidth="2.5" />

                          {/* Render nodes */}
                          {points.map((p, idx) => {
                            const compoundingCoeff = Math.pow(1 + activeRate, idx);
                            const milestoneTotal = selectedCustomer.totalSpent * compoundingCoeff;
                            const milestoneProfit = milestoneTotal - selectedCustomer.totalSpent;
                            const x = getX(idx);
                            const y = getY(idx);

                            return (
                              <g key={idx} className="group cursor-pointer">
                                <circle
                                  cx={x}
                                  cy={y}
                                  r="4"
                                  fill="#4f46e5"
                                  stroke="#ffffff"
                                  strokeWidth="1.5"
                                  className="transition-all hover:r-5 hover:fill-emerald-500"
                                />
                                <text
                                  x={x}
                                  y={y - 8}
                                  textAnchor="middle"
                                  className="text-[8px] font-mono font-bold text-slate-700 pointer-events-none"
                                >
                                  +{formatCurrency(milestoneProfit).replace('UGX', 'K')}
                                </text>
                                <text
                                  x={x}
                                  y="124"
                                  textAnchor="middle"
                                  className="text-[8px] font-mono text-slate-400 font-bold pointer-events-none"
                                >
                                  Day {Math.round((monitorDays / 6) * idx)}
                                </text>
                              </g>
                            );
                          })}
                        </>
                      );
                    })()}
                  </svg>
                </div>
              </div>
            </div>

            {/* Column 2: Payout forms & transaction records */}
            <div className="space-y-6 lg:col-span-1">
              {/* Dynamic stats preview cards */}
              <div className="rounded-2xl border border-slate-100 bg-emerald-950/95 text-white p-5 space-y-3 relative overflow-hidden shadow-xs">
                <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
                <span className="text-[10px] font-mono font-extrabold text-emerald-400 uppercase tracking-widest block">Active Investment capital</span>
                <div className="text-3xl font-black font-mono leading-none flex items-baseline gap-1">
                  <span>{formatCurrency(selectedCustomer.totalSpent)}</span>
                </div>
                
                <div className="text-[10px] text-slate-300 leading-snug border-t border-emerald-800/60 pt-3 space-y-1.5 font-mono">
                  <div className="flex justify-between">
                    <span>Active Plan:</span>
                    <strong className="text-white">SHILLING BOOSTER</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Deposit Actions:</span>
                    <strong className="text-white">{selectedCustomer.totalOrders} deposit(s)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Account Status:</span>
                    <strong className="text-emerald-400 font-bold">APPROVED ✔</strong>
                  </div>
                </div>
              </div>

              {/* Instant Mobile Money Payout Block */}
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
                <div>
                  <h4 className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs uppercase tracking-wider font-mono">
                    <Smartphone className="h-4 w-4 text-emerald-600 animate-pulse" />
                    Disburse Mobile Money Payout
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Withdraw part of your accumulated live earnings immediately. Payment dispatches in 2 minutes.
                  </p>
                </div>

                <form onSubmit={handlePayoutTrigger} className="space-y-3">
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Target Disbursal Mobile Channel
                    </label>
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                      <Wallet className="h-4 w-4 text-slate-400 shrink-0" />
                      <div className="text-xs font-mono font-bold text-slate-700 truncate">
                        {selectedCustomer.payoutPhone || selectedCustomer.phone || 'Walk-in'}
                        <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded ml-2">MoMo</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Cashout Amount (UGX)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold font-mono">UGX</span>
                      <input
                        type="number"
                        placeholder="e.g. 5000"
                        min="100"
                        value={payoutInputAmount}
                        onChange={(e) => setPayoutInputAmount(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 pl-11 text-xs font-mono font-bold focus:border-slate-500 focus:bg-white outline-hidden transition-all text-slate-800"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                      Withdrawable balance: {formatCurrency(liveEarnings)}
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={payoutStatus === 'processing'}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      payoutStatus === 'processing'
                        ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs font-bold'
                    }`}
                  >
                    {payoutStatus === 'processing' ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Sending MoMo request...</span>
                      </>
                    ) : (
                      <span>Dispatch MoMo Cashout</span>
                    )}
                  </button>
                </form>

                {/* Status Message Alerts */}
                {payoutStatus === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-[10.5px] font-mono leading-relaxed"
                  >
                    <div className="font-bold flex items-center gap-1 text-[11px] mb-1 text-emerald-950 uppercase">
                      <Check className="h-4 w-4 stroke-[3px]" /> Payout Dispatched
                    </div>
                    {payoutTxMsg}
                  </motion.div>
                )}
                
                {reinvestStatus === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-800 rounded-xl text-[10.5px] font-mono leading-relaxed"
                  >
                    <div className="font-bold flex items-center gap-1 text-[11px] mb-1 text-indigo-950 uppercase">
                      <Check className="h-4 w-4 stroke-[3px]" /> Compound Rollover Success
                    </div>
                    Simulated rollover compounded completed! Yield added back into your Principal Capital investment plan. Compounding velocity boosted!
                  </motion.div>
                )}
              </div>

              {/* Isolated Customer Transactions Log */}
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-widest font-mono">My Deposits & Withdrawals</span>
                  <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded-full font-bold text-slate-500">
                    {linkedTxs.length} Transactions
                  </span>
                </div>

                <div className="space-y-2 max-h-[170px] overflow-y-auto pr-1">
                  {linkedTxs.length > 0 ? (
                    linkedTxs.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition-all text-xs font-mono"
                      >
                        <div className="space-y-0.5 truncate flex-1 pr-2">
                          <span className="font-bold block text-[10px] text-slate-800 truncate leading-tight">
                            {tx.description}
                          </span>
                          <span className="text-[9px] text-slate-400 block">
                            {new Date(tx.date).toLocaleDateString()} &bull; {tx.paymentMethod || 'Ledger'}
                          </span>
                        </div>
                        <span className={`font-bold shrink-0 text-[11px] ${
                          tx.type === 'inflow' ? 'text-emerald-600' : 'text-rose-500'
                        }`}>
                          {tx.type === 'inflow' ? '+' : '-'}{formatCurrency(tx.amount).replace('UGX', '')}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-[10px] font-mono text-slate-400">
                      No transactions found for this investor in local ledger.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-2xl border border-dashed border-slate-200 text-center"
          >
            <div className="h-14 w-14 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-4 border border-slate-100 shadow-3xs">
              <Smartphone className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              No Profile Loaded
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1 mb-5 leading-relaxed">
              Scan your mobile number or select one of our pre-populated client ledger presets from the list above to witness real-time daily profit growth tracking!
            </p>
            <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3.5 py-1.5 rounded-full text-[10px] font-bold font-mono tracking-wide uppercase border border-indigo-100 animate-pulse">
              <Sparkles className="h-3 w-3 text-indigo-500" /> Compounding live returns online
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
