/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Customer, Transaction, TransactionCategory, Product } from '../types';
import { Users, Search, Plus, Edit2, Trash2, Mail, Phone, CalendarCheck, ShieldCheck, TrendingUp, Sparkles, Clock, Wallet, Coins, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import InteractiveModal from './InteractiveModal';

interface CustomerSectionProps {
  customers: Customer[];
  products?: Product[];
  onAddCustomer: (cust: Omit<Customer, 'id' | 'totalOrders' | 'totalSpent'>) => void;
  onEditCustomer: (cust: Customer) => void;
  onDeleteCustomer: (id: string) => void;
  onAddTransaction?: (tx: Omit<Transaction, 'id'>) => void;
}

export default function CustomerSection({
  customers,
  products = [],
  onAddCustomer,
  onEditCustomer,
  onDeleteCustomer,
  onAddTransaction,
}: CustomerSectionProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'active' | 'inactive'>('All');
  
  // Tab states for standard listing vs intelligent RFM segments
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'segmentation'>('all');
  const [selectedSegment, setSelectedSegment] = useState<'High Value' | 'Loyal' | 'New' | 'At Risk'>('High Value');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Hourly withdrawal simulation states
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawingCustomer, setWithdrawingCustomer] = useState<Customer | null>(null);
  const [simulatedHours, setSimulatedHours] = useState<number>(8); // Defaults to 8 simulated hours
  const [selectedWithdrawMethod, setSelectedWithdrawMethod] = useState<'MTN' | 'Airtel Money'>('MTN');
  const [withdrawSuccessMsg, setWithdrawSuccessMsg] = useState<string>('');

  // Mobile Money Deposit states
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositingCustomer, setDepositingCustomer] = useState<Customer | null>(null);
  const [depositAmount, setDepositAmount] = useState<number>(100000); // Default USh 100k
  const [selectedDepositMethod, setSelectedDepositMethod] = useState<'MTN' | 'Airtel Money'>('MTN');
  const [selectedDepositPlanId, setSelectedDepositPlanId] = useState<string>('');
  const [depositSuccessMsg, setDepositSuccessMsg] = useState<string>('');

  // Form inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [registeredNum, setRegisteredNum] = useState('');
  const [payoutPhone, setPayoutPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [investmentDays, setInvestmentDays] = useState<number>(30);

  // Computed hourly yield and platform commission variables (30% user cut)
  const currentHourlyYieldRate = withdrawingCustomer ? Math.round(withdrawingCustomer.totalSpent * 0.1) : 0;
  const currentGrossProfit = currentHourlyYieldRate * simulatedHours;
  const currentPlatformFee = Math.round(currentGrossProfit * 0.30); // 30 percent cut
  const currentNetPayout = currentGrossProfit - currentPlatformFee; // 70 percent paid to client

  // Open withdrawal simulation portal
  const handleOpenWithdrawPortal = (cust: Customer) => {
    setWithdrawingCustomer(cust);
    setSimulatedHours(8); // Default simulated hours
    setSelectedWithdrawMethod('MTN');
    setWithdrawSuccessMsg('');
    setIsWithdrawModalOpen(true);
  };

  // Withdraw accumulated hourly profits
  const handleWithdrawProfits = () => {
    if (!withdrawingCustomer) return;

    if (currentGrossProfit <= 0) {
      alert("No profits are simulated to be withdrawn at this hour.");
      return;
    }

    if (onAddTransaction) {
      // 1. Log net payout outflow transaction
      onAddTransaction({
        type: 'outflow',
        amount: currentNetPayout,
        date: new Date().toISOString(),
        description: `Hourly Yield Net Payout (Hold: ${simulatedHours}h, Gross: USh ${currentGrossProfit.toLocaleString()}, less 30% Admin Cut: USh ${currentPlatformFee.toLocaleString()}) to ${withdrawingCustomer.name}`,
        customerId: withdrawingCustomer.id,
        category: TransactionCategory.REFUND, // Disbursed payout
        paymentMethod: selectedWithdrawMethod,
      });

      // 2. Log 30% commission inflow transaction retained by platform admin
      onAddTransaction({
        type: 'inflow',
        amount: currentPlatformFee,
        date: new Date().toISOString(),
        description: `30% platform profit administration commission retained on withdrawal from ${withdrawingCustomer.name} (${simulatedHours} hrs holding period)`,
        customerId: withdrawingCustomer.id,
        category: TransactionCategory.SALE, // platform fee revenue
        paymentMethod: selectedWithdrawMethod,
      });

      // 3. Mark investor as active on current time
      const updatedCust: Customer = {
        ...withdrawingCustomer,
        lastActive: new Date().toISOString(),
      };
      onEditCustomer(updatedCust);
      setWithdrawingCustomer(updatedCust);

      setWithdrawSuccessMsg(`Disbursement Processed! Total simulated gross yield is USh ${currentGrossProfit.toLocaleString()}. The administrator has retained a 30% profit cut of USh ${currentPlatformFee.toLocaleString()}, and Net USh ${currentNetPayout.toLocaleString()} has been securely transferred to credit your ${selectedWithdrawMethod === 'MTN' ? 'MTN MoMo' : 'Airtel Money'} wallet account ending at ${withdrawingCustomer.phone || 'registered line'}.`);
    }
  };

  // Withdraw full invested principal (initial capital investment)
  const handleWithdrawPrincipal = () => {
    if (!withdrawingCustomer) return;
    const principalToWithdraw = withdrawingCustomer.totalSpent;

    if (principalToWithdraw <= 0) {
      alert("No active principal remains invested in this account.");
      return;
    }

    if (confirm(`Are you absolutely sure you want to withdraw all USh ${principalToWithdraw.toLocaleString()} invested capital? This will dissolve your active high-yield portfolio instantly.`)) {
      if (onAddTransaction) {
        // 1. Log cash outflow transaction
        onAddTransaction({
          type: 'outflow',
          amount: principalToWithdraw,
          date: new Date().toISOString(),
          description: `Full Capital Dissolution: Principal Investment Refund to ${withdrawingCustomer.name}`,
          customerId: withdrawingCustomer.id,
          category: TransactionCategory.REFUND,
          paymentMethod: selectedWithdrawMethod,
        });

        // 2. Clear investment statistics of this participant
        const updatedCust: Customer = {
          ...withdrawingCustomer,
          totalSpent: 0,
          totalOrders: 0,
          status: 'inactive',
          lastActive: new Date().toISOString(),
        };
        onEditCustomer(updatedCust);
        setWithdrawingCustomer(updatedCust);

        setWithdrawSuccessMsg(`Dissolution Success! Full principal capital of USh ${principalToWithdraw.toLocaleString()} has been terminated & returned directly to your mobile wallet. Your plan limits are now released!`);
      }
    }
  };

  // Open Deposit portal
  const handleOpenDepositPortal = (cust: Customer) => {
    setDepositingCustomer(cust);
    setDepositAmount(100000);
    setSelectedDepositMethod('MTN');
    setSelectedDepositPlanId('');
    setDepositSuccessMsg('');
    setIsDepositModalOpen(true);
  };

  // Process MOMO Deposit
  const handleMakeDeposit = () => {
    if (!depositingCustomer) return;
    if (depositAmount <= 0) {
      alert("Please enter a valid deposit amount.");
      return;
    }

    if (onAddTransaction) {
      const selectedPlan = products.find(p => p.id === selectedDepositPlanId);
      const descriptionText = selectedPlan 
        ? `Mobile Money Deposit: Principal Allocated to "${selectedPlan.name}" by ${depositingCustomer.name}`
        : `Mobile Money Deposit: Direct Investment Principal Capital by ${depositingCustomer.name}`;

      // 1. Log payment inflow transaction, which automatically updates customer totals!
      onAddTransaction({
        type: 'inflow',
        amount: depositAmount,
        date: new Date().toISOString(),
        description: `${descriptionText} via ${selectedDepositMethod}`,
        customerId: depositingCustomer.id,
        productId: selectedDepositPlanId || undefined,
        category: TransactionCategory.SALE, // High-yield allocation
        paymentMethod: selectedDepositMethod,
      });

      // 2. Local-sync of edited customer properties
      const updatedCust: Customer = {
        ...depositingCustomer,
        totalSpent: depositingCustomer.totalSpent + depositAmount,
        totalOrders: depositingCustomer.totalOrders + 1,
        status: 'active',
        lastActive: new Date().toISOString(),
      };
      setDepositingCustomer(updatedCust);

      const targetDetails = selectedDepositMethod === 'Airtel Money' 
        ? ' to recipient number 0758944579'
        : ' to MTN recipient number 0768613961';
      setDepositSuccessMsg(`Deposit Received! USh ${depositAmount.toLocaleString()} has been successfully deposited using your ${selectedDepositMethod === 'MTN' ? 'MTN MoMo' : 'Airtel Money'} wallet account ending at ${depositingCustomer.phone || 'registered phone'}${targetDetails}. Your high-yield active capital balance is now fully updated!`);
    }
  };

  // Customer segment sorting/classifying helper
  const getCustomerSegment = (cust: Customer, referenceDateStr = '2026-06-18') => {
    // 1. High Value: Spent >= 500,000 UGX
    if (cust.totalSpent >= 500000) {
      return 'High Value';
    }

    // 2. Loyal: Spent < 500,000 but Orders >= 5
    if (cust.totalOrders >= 5) {
      return 'Loyal';
    }

    // Days since last active:
    const refDate = new Date(referenceDateStr);
    const activeDate = new Date(cust.lastActive);
    const diffTime = Math.abs(refDate.getTime() - activeDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // 3. At Risk: Inactive > 5 days or status inactive
    if (cust.status === 'inactive' || diffDays > 5) {
      return 'At Risk';
    }

    // 4. New: Others (often newer signups / active within past 5 days with low orders)
    return 'New';
  };

  // RFM Metadata segment configuration
  const segmentMetadata = {
    'High Value': {
      title: 'High Value Investors',
      subtitle: 'Premium LTV Deposits (500,000+ UGX)',
      desc: 'High-capital accounts with substantial active deposits. They form the stable premium core of your portfolio.',
      action: 'Prioritize phone assistance and dispatch exclusive gold tier opportunity catalogs.',
      color: 'bg-amber-50/70 text-amber-900 border-amber-200/60 hover:bg-amber-50',
      activeColor: 'ring-2 ring-amber-500 bg-amber-50 border-amber-300 text-amber-900',
      tagColor: 'bg-amber-100/80 text-amber-800 border-amber-200',
      badgeColor: 'bg-amber-500 text-white',
      icon: ShieldCheck,
    },
    'Loyal': {
      title: 'Frequent Partners',
      subtitle: 'High Placement Count (5+)',
      desc: 'Investors showing stellar recurring plan purchases but moderate individual totals. They anchor regular MOM capital inflows.',
      action: 'Deploy SMS milestone appreciation vouchers, loyalty rewards and premium referrals.',
      color: 'bg-emerald-50/70 text-emerald-900 border-emerald-200/60 hover:bg-emerald-50',
      activeColor: 'ring-2 ring-emerald-600 bg-emerald-50 border-emerald-300 text-emerald-900',
      tagColor: 'bg-emerald-100/80 text-emerald-800 border-emerald-200',
      badgeColor: 'bg-emerald-600 text-white',
      icon: TrendingUp,
    },
    'New': {
      title: 'Onboarded Registrants',
      subtitle: 'Recent Onboarding Activities',
      desc: 'Users active within last week with low order history. Fresh partner accounts ready for high-yield allocations.',
      action: 'Deliver automated welcoming walkthroughs and direct mobile wallet guide alerts.',
      color: 'bg-indigo-50/70 text-indigo-900 border-indigo-200/60 hover:bg-indigo-50',
      activeColor: 'ring-2 ring-indigo-600 bg-indigo-50 border-indigo-300 text-indigo-900',
      tagColor: 'bg-indigo-100/80 text-indigo-800 border-indigo-200',
      badgeColor: 'bg-indigo-600 text-white',
      icon: Sparkles,
    },
    'At Risk': {
      title: 'Dormant Portfolios',
      subtitle: 'Dormant Shareholder Activity (5+ Days)',
      desc: 'Accounts with zero transactions or status offline for over 5 workdays. Real-time monitoring suggests possible churn.',
      action: 'Launch mobile wallet deposit win-back incentives and trigger automatic notifications.',
      color: 'bg-rose-50/70 text-rose-900 border-rose-200/60 hover:bg-rose-50',
      activeColor: 'ring-2 ring-rose-500 bg-rose-50 border-rose-300 text-rose-900',
      tagColor: 'bg-rose-100/80 text-rose-800 border-rose-200',
      badgeColor: 'bg-rose-600 text-white',
      icon: CalendarCheck,
    }
  };

  // Filter customers based on search query & active status
  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search);
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getVipThreshold = () => {
    // Top 30% of spends or over 500k UGX spent is flagged as VIP
    return 500000;
  };

  const handleOpenCreate = () => {
    setEditingCustomer(null);
    setName('');
    setEmail('');
    setPhone('');
    setStatus('active');
    setRegisteredNum('');
    setPayoutPhone('');
    setAvatarUrl('');
    setInvestmentDays(30);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cust: Customer) => {
    setEditingCustomer(cust);
    setName(cust.name);
    setEmail(cust.email);
    setPhone(cust.phone);
    setStatus(cust.status);
    setRegisteredNum(cust.registeredNum || '');
    setPayoutPhone(cust.payoutPhone || '');
    setAvatarUrl(cust.avatarUrl || '');
    setInvestmentDays(cust.investmentDays || 30);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    if (editingCustomer) {
      onEditCustomer({
        ...editingCustomer,
        name,
        email,
        phone,
        status,
        lastActive: new Date().toISOString(),
        registeredNum,
        payoutPhone,
        avatarUrl,
        investmentDays,
      });
    } else {
      onAddCustomer({
        name,
        email,
        phone,
        status,
        lastActive: new Date().toISOString(),
        registeredNum,
        payoutPhone,
        avatarUrl,
        investmentDays,
      });
    }
    setIsModalOpen(false);
  };

  // Quick statistics
  const totalCustomersCount = customers.length;
  const activeCustomersCount = customers.filter((c) => c.status === 'active').length;
  const totalCustomerValue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const avgSpentPerCustomer = totalCustomersCount > 0 ? totalCustomerValue / totalCustomersCount : 0;

  return (
    <div id="customer-section" className="space-y-6">
      {/* Visual Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-slate-800">
            Investors & Partners Portfolio
          </h2>
          <p className="text-sm text-slate-500">
            Keep track of individual investor deposits, active cash shares, and elite status allocations.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-slate-800 hover:-translate-y-0.5 transition-all self-start"
        >
          <Plus className="h-4 w-4" />
          Register Investor Partner
        </button>
      </div>

      {/* Customer summary KPI metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Registered Investors</span>
          <span className="text-2xl font-bold font-display text-slate-800 block mt-1">
            {totalCustomersCount} <span className="text-xs text-slate-400 font-normal">({activeCustomersCount} Active)</span>
          </span>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Average Active Portfolio (LTV)</span>
          <span className="text-sm font-extrabold font-mono text-emerald-600 block mt-1">
            USh {Math.round(avgSpentPerCustomer).toLocaleString()}
          </span>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-xs">
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider font-mono">Highest Partner Subscription</span>
          <span className="text-sm font-extrabold font-mono text-slate-800 block mt-1">
            USh {Math.max(...customers.map((c) => c.totalSpent), 0).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex border-b border-slate-200" id="rfm-sub-tabs">
        <button
          onClick={() => setActiveSubTab('all')}
          className={`px-5 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeSubTab === 'all'
              ? 'border-slate-800 text-slate-900 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          All Customer Accounts
        </button>
        <button
          onClick={() => setActiveSubTab('segmentation')}
          className={`flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeSubTab === 'segmentation'
              ? 'border-indigo-600 text-indigo-750 font-bold bg-indigo-50/20'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5 text-indigo-500 animate-pulse" />
          RFM Cohort Segments
        </button>
      </div>

      {activeSubTab === 'all' ? (
        <>
          {/* Filter Options bar */}
          <div className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-xs sm:flex-row sm:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search accounts by name, email database, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pr-4 pl-9 text-xs placeholder-slate-400 focus:border-slate-400 focus:bg-white outline-hidden transition-all"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 self-start sm:self-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mr-1">Status:</span>
              <button
                onClick={() => setStatusFilter('All')}
                className={`rounded-lg px-3 py-1 text-xs font-semibold ${
                  statusFilter === 'All'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Accounts
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`rounded-lg px-3 py-1 text-xs font-semibold ${
                  statusFilter === 'active'
                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setStatusFilter('inactive')}
                className={`rounded-lg px-3 py-1 text-xs font-semibold ${
                  statusFilter === 'inactive'
                    ? 'bg-slate-200 text-slate-700'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                Inactive
              </button>
            </div>
          </div>

          {/* Grid of Custom lists */}
          {filteredCustomers.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCustomers.map((cust) => {
                const isVip = cust.totalSpent >= getVipThreshold();

                return (
                  <div
                    key={cust.id}
                    className="group relative rounded-2xl border border-slate-100 bg-white p-6 shadow-xs hover:shadow-md transition-all duration-200"
                  >
                    {/* Visual Accent for VIP clients */}
                    {isVip && (
                      <div className="absolute top-0 right-10 transform -translate-y-1/2 bg-amber-500 text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" />
                         VIP
                      </div>
                    )}

                     {/* Account details and quick action */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {/* User custom picture / initials bubble */}
                        {cust.avatarUrl ? (
                          <img
                            src={cust.avatarUrl}
                            alt={cust.name}
                            referrerPolicy="no-referrer"
                            className="h-11 w-11 rounded-full object-cover border border-slate-100 shadow-2xs shrink-0"
                          />
                        ) : (
                          <div className={`h-11 w-11 rounded-full flex items-center justify-center font-display text-sm font-semibold select-none shrink-0 ${
                            isVip ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {cust.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                          </div>
                        )}

                        <div>
                          <h3 className="font-display text-sm font-bold text-slate-800 leading-tight">
                            {cust.name}
                          </h3>
                          {/* Active or inactive badge */}
                          <span className={`inline-flex items-center gap-1.5 text-[9px] font-mono mt-1 ${
                            cust.status === 'active' ? 'text-emerald-600' : 'text-slate-400'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${
                              cust.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
                            }`} />
                            {cust.status === 'active' ? 'Active' : 'Archived'}
                          </span>
                        </div>
                      </div>

                      {/* Actions overlay */}
                      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenEdit(cust)}
                          className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors"
                          title="Edit Account Details"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete ${cust.name}?`)) {
                              onDeleteCustomer(cust.id);
                            }
                          }}
                          className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          title="Delete profile"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Email, Phone & Activity Ledger */}
                    <div className="mt-5 space-y-2.5 text-xs text-slate-600 border-t border-slate-50 pt-4 font-mono">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate text-slate-500">{cust.email}</span>
                      </div>

                      <div className="flex items-center gap-2" title="National ID/Registration ID number">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span className="text-[10px] font-bold text-slate-700 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded uppercase tracking-wider">
                          {cust.registeredNum || 'NIN UNREGISTERED'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] pt-0.5">
                        <div className="flex flex-col bg-slate-50/70 p-2 rounded-xl border border-slate-100">
                          <span className="text-[8px] uppercase font-bold text-slate-400 block tracking-wider leading-none">Active MoMo</span>
                          <span className="font-bold text-slate-700 mt-1.5 flex items-center gap-1 truncate select-all" title="Number currently in use for deposits">
                            <Phone className="h-3 w-3 text-emerald-600 shrink-0" />
                            {cust.phone || 'N/A'}
                          </span>
                        </div>
                        <div className="flex flex-col bg-slate-50/70 p-2 rounded-xl border border-slate-100">
                          <span className="text-[8px] uppercase font-bold text-slate-400 block tracking-wider leading-none">Payout Target</span>
                          <span className="font-bold text-slate-700 mt-1.5 flex items-center gap-1 truncate select-all" title="Number where withdrawn money is sent">
                            <Wallet className="h-3 w-3 text-indigo-600 shrink-0" />
                            {cust.payoutPhone || 'N/A'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 border-t border-dashed border-slate-100 pt-2">
                        <CalendarCheck className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="text-[10px] text-slate-400">
                          Last Activity: {new Date(cust.lastActive).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                     {/* Hourly Yield & Withdrawal Action Bar */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] uppercase font-bold text-slate-400">Hourly Yield (Est.)</span>
                        <span className="text-xs font-bold text-emerald-600 font-mono">
                          +{Math.round(cust.totalSpent * 0.1).toLocaleString()} USh/hr
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleOpenDepositPortal(cust)}
                          className="flex items-center justify-center gap-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 hover:-translate-y-0.5 px-2 py-1.5 text-xs font-bold transition-all shadow-xs cursor-pointer"
                          title="Simulate Mobile Money Deposit"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          MOMO Deposit
                        </button>
                        <button
                          onClick={() => handleOpenWithdrawPortal(cust)}
                          disabled={cust.totalSpent === 0}
                          className={`flex items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-xs font-bold transition-all shadow-xs ${
                            cust.totalSpent > 0
                              ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-0.5 cursor-pointer'
                              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          }`}
                          title={cust.totalSpent > 0 ? "Withdraw active hourly yield or principal" : "No active investment"}
                        >
                          <Wallet className="h-3.5 w-3.5" />
                          Payout Portal
                        </button>
                      </div>
                    </div>

                    {/* Bottom Order Statistics */}
                    <div className="grid grid-cols-2 gap-4 mt-5 bg-slate-50/50 -mx-6 -mb-6 p-4 rounded-b-2xl border-t border-slate-50 text-xs">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Active Portfolios</span>
                        <span className="text-xs font-bold font-mono text-slate-800">
                          {cust.totalOrders} plan{cust.totalOrders !== 1 ? 's' : ''} active
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Total Invested</span>
                        <span className="text-xs font-bold font-mono text-emerald-600 flex items-center justify-end gap-1">
                          <TrendingUp className="h-3 w-3 text-emerald-500" />
                          USh {cust.totalSpent.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
              <Users className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-4 font-display text-base font-semibold text-slate-700">No customers registered</h3>
              <p className="mt-1 text-xs text-slate-500">
                Search keywords or create a new client account to track inflows.
              </p>
            </div>
          )}
        </>
      ) : (
        /* SEGMENTATION SUB-PANEL VIEW */
        <div className="space-y-6" id="segmentation-view">
          {/* Segment characteristics summaries cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 animate-[fadeIn_0.2s_ease-out]">
            {(Object.keys(segmentMetadata) as Array<'High Value' | 'Loyal' | 'New' | 'At Risk'>).map((segKey) => {
              const meta = segmentMetadata[segKey];
              const IconComp = meta.icon;
              const count = customers.filter((c) => getCustomerSegment(c) === segKey).length;
              const percent = customers.length > 0 ? ((count / customers.length) * 100).toFixed(0) : '0';
              const isSel = selectedSegment === segKey;

              return (
                <button
                  key={segKey}
                  type="button"
                  onClick={() => setSelectedSegment(segKey)}
                  className={`text-left rounded-2xl border p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between h-full ${
                    isSel ? meta.activeColor : meta.color
                  }`}
                >
                  <div className="w-full">
                    <div className="flex items-center justify-between">
                      <div className={`rounded-xl p-2 md:p-2.5 ${meta.tagColor}`}>
                        <IconComp className="h-5 w-5" />
                      </div>
                      <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${meta.badgeColor}`}>
                        {count} account{count !== 1 ? 's' : ''} ({percent}%)
                      </span>
                    </div>

                    <h3 className="font-display font-semibold text-slate-800 text-sm mt-4">{meta.title}</h3>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono mt-0.5">
                      {meta.subtitle}
                    </p>
                    <p className="text-xs text-slate-600 mt-2.5 font-sans leading-relaxed">
                      {meta.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-medium leading-normal text-slate-500 w-full">
                    <span className="block font-bold uppercase tracking-wider text-[9px] text-slate-400 font-mono mb-1">
                      Recommended Playbook Action
                    </span>
                    {meta.action}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Segment selection cohort details */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs animate-[fadeIn_0.3s_ease-out]">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-secondary-slate-100 pb-4 mb-4">
              <div>
                <h3 className="font-display font-medium text-slate-800 text-lg">
                  Cohort Roster: <span className="font-bold text-slate-900 border-b border-dashed border-indigo-600 pb-0.5">{segmentMetadata[selectedSegment].title}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Filtering database for accounts evaluated under the <span className="font-semibold text-indigo-700">"{selectedSegment}"</span> criteria.
                </p>
              </div>
              <span className="text-[10px] font-mono rounded bg-slate-50 border border-slate-100 px-3 py-1 text-slate-500 font-medium uppercase tracking-wider self-start sm:self-center">
                Ref Interval: Jun 18, 2026
              </span>
            </div>

            {/* List of segmented clients */}
            {customers.filter((c) => getCustomerSegment(c) === selectedSegment).length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 font-semibold text-slate-500 font-display">
                      <th className="px-6 py-3">Customer Profile</th>
                      <th className="px-6 py-3">Account Details</th>
                      <th className="px-6 py-3 text-center">Frequency (Orders)</th>
                      <th className="px-6 py-3 text-right">LTV Contributions</th>
                      <th className="px-6 py-3 text-right font-mono">Recency</th>
                      <th className="px-6 py-3 text-right">MOMO Operations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-medium text-slate-700 font-sans">
                    {customers
                      .filter((c) => getCustomerSegment(c) === selectedSegment)
                      .map((cust) => {
                        const refDate = new Date('2026-06-18');
                        const activeDate = new Date(cust.lastActive);
                        const diffTime = Math.abs(refDate.getTime() - activeDate.getTime());
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                        return (
                          <tr key={cust.id} className="hover:bg-slate-50/40 transition-colors">
                            <td className="px-6 py-3.5 whitespace-nowrap">
                              <div className="flex items-center gap-2.5">
                                {cust.avatarUrl ? (
                                  <img
                                    src={cust.avatarUrl}
                                    alt={cust.name}
                                    referrerPolicy="no-referrer"
                                    className="h-8 w-8 rounded-lg object-cover border border-slate-100 shadow-2xs shrink-0"
                                  />
                                ) : (
                                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 font-bold text-xs uppercase font-display shrink-0">
                                    {cust.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                                  </div>
                                )}
                                <div>
                                  <span className="block font-semibold text-slate-800 leading-tight">{cust.name}</span>
                                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{cust.email}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-3.5 whitespace-nowrap">
                              <div className="font-mono text-[10px] space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-slate-400 uppercase text-[8px] font-bold tracking-wider w-12 block">Active:</span>
                                  <span className="font-semibold text-slate-700 select-all">{cust.phone || 'N/A'}</span>
                                  <span className={`inline-block rounded px-1 py-0.5 text-[8px] uppercase font-bold tracking-wider ${
                                    cust.status === 'active'
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                      : 'bg-slate-50 text-slate-400 border border-slate-100'
                                  }`}>
                                    {cust.status}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-slate-400 uppercase text-[8px] font-bold tracking-wider w-12 block">Payout:</span>
                                  <span className="font-semibold text-slate-700 select-all">{cust.payoutPhone || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-slate-400 uppercase text-[8px] font-bold tracking-wider w-12 block">Reg NIN:</span>
                                  <span className="font-bold text-slate-600 bg-slate-100 px-1 py-0.5 rounded text-[9px] uppercase tracking-wide">{cust.registeredNum || 'No NIN'}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-3.5 text-center whitespace-nowrap font-mono font-bold text-slate-800">
                              {cust.totalOrders} plan{cust.totalOrders !== 1 ? 's' : ''}
                            </td>
                            <td className="px-6 py-3.5 text-right whitespace-nowrap font-mono font-extrabold text-xs text-emerald-600">
                              USh {cust.totalSpent.toLocaleString()}
                            </td>
                            <td className="px-6 py-3.5 text-right whitespace-nowrap font-mono">
                              {diffDays === 0 ? (
                                <span className="text-emerald-600 font-bold">Active Today</span>
                              ) : (
                                <span className="text-slate-500">
                                  {diffDays} day{diffDays !== 1 ? 's' : ''} ago
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-3.5 text-right whitespace-nowrap">
                              <div className="inline-flex gap-2">
                                <button
                                  onClick={() => handleOpenDepositPortal(cust)}
                                  className="inline-flex items-center gap-1 rounded-md bg-emerald-600 hover:bg-emerald-700 hover:-translate-y-0.5 text-white px-2.5 py-1 text-[10px] font-bold transition-all shadow-xs cursor-pointer"
                                  title="Simulate Mobile Money Deposit"
                                >
                                  <Plus className="h-3 w-3" />
                                  Deposit
                                </button>
                                <button
                                  onClick={() => handleOpenWithdrawPortal(cust)}
                                  disabled={cust.totalSpent === 0}
                                  className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[10px] font-bold transition-all shadow-xs ${
                                    cust.totalSpent > 0
                                      ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-0.5 cursor-pointer'
                                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                  }`}
                                  title={cust.totalSpent > 0 ? "Withdraw active hourly yield or principal" : "No active investment"}
                                >
                                  <Wallet className="h-3.5 w-3.5" />
                                  Withdraw
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-100 p-8 text-center text-slate-400">
                <Users className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                <p className="text-xs">Zero registered accounts fulfill the "{selectedSegment}" metrics currently.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FORM REGISTRATION/EDIT MODAL */}
      <InteractiveModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCustomer ? 'Edit Registered Profile' : 'File New Client Profile'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block mb-1">
              Customer Full Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Alastair Sterling"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs focus:border-slate-500 focus:bg-white outline-hidden transition-all"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="name@organization.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs focus:border-slate-500 focus:bg-white outline-hidden transition-all"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block mb-1">
              Registered ID / National ID (NIN)
            </label>
            <input
              type="text"
              placeholder="e.g. CM84013101ABCD"
              value={registeredNum}
              onChange={(e) => setRegisteredNum(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs focus:border-slate-500 focus:bg-white outline-hidden transition-all font-mono uppercase"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block mb-1">
                Active Phone (Transacting Line)
              </label>
              <input
                type="tel"
                placeholder="e.g. 0768613961"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs focus:border-slate-500 focus:bg-white outline-hidden transition-all font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block mb-1">
                Payout Phone (Target Line)
              </label>
              <input
                type="tel"
                placeholder="e.g. 0758944579"
                value={payoutPhone}
                onChange={(e) => setPayoutPhone(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs focus:border-slate-500 focus:bg-white outline-hidden transition-all font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block mb-1">
              Profile Picture / Avatar
            </label>
            <div className="space-y-2">
              <input
                type="url"
                placeholder="Paste avatar image URL (or select preset below)"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs focus:border-slate-500 focus:bg-white outline-hidden transition-all font-mono text-[11px]"
              />
              
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[10px] text-slate-400">Presets:</span>
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {[
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop',
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop',
                    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop',
                    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&h=120&fit=crop',
                    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&h=120&fit=crop',
                    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop',
                  ].map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setAvatarUrl(url)}
                      className={`h-7 w-7 rounded-full border-2 overflow-hidden transition-all shrink-0 ${
                        avatarUrl === url ? 'border-indigo-600 scale-110 shadow-xs' : 'border-slate-200 hover:scale-105'
                      }`}
                    >
                      <img src={url} alt={`Preset ${i+1}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setAvatarUrl('')}
                    className={`h-7 w-7 rounded-full border border-dashed border-slate-300 text-[9px] font-bold text-slate-400 hover:text-slate-600 hover:border-slate-400 shrink-0 flex items-center justify-center ${
                      !avatarUrl ? 'bg-slate-150 border-indigo-600' : ''
                    }`}
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block mb-1">
              Choose Investment Duration (Days)
            </label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {[7, 30, 90, 365].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setInvestmentDays(d)}
                  className={`py-2 text-xs font-mono font-bold rounded-lg border cursor-pointer transition-all ${
                    investmentDays === d
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-205'
                  }`}
                >
                  {d === 365 ? '1 Year' : `${d} Days`}
                </button>
              ))}
            </div>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="1095"
                placeholder="Enter custom duration in days..."
                value={investmentDays}
                onChange={(e) => setInvestmentDays(Math.max(1, parseInt(e.target.value) || 30))}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs focus:border-slate-500 focus:bg-white outline-hidden transition-all font-mono font-bold"
              />
              <span className="absolute right-3.5 top-2 text-[10px] text-slate-400 font-mono">
                Days
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1 font-sans italic">
              * Compounding yields and maturity milestones will automatically re-scale based on this plan duration.
            </span>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block mb-1">
              Account Status Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs focus:border-slate-500 focus:bg-white outline-hidden transition-all"
            >
              <option value="active">Active (Participate in flows)</option>
              <option value="inactive">Archived / Inactive</option>
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-sm"
            >
              {editingCustomer ? 'Save Parameters' : 'Register Account'}
            </button>
          </div>
        </form>
      </InteractiveModal>

      {/* HOURLY WITHDRAWAL SIMULATOR MODAL */}
      <InteractiveModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        title={withdrawingCustomer ? `MOMO Hourly Payout: ${withdrawingCustomer.name}` : 'MOMO Withdrawal Portal'}
      >
        {withdrawingCustomer ? (
          <div className="space-y-4">
            {withdrawSuccessMsg ? (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-5 text-emerald-800 text-xs flex flex-col items-center text-center space-y-3.5 animate-[fadeIn_0.2s_ease-out]">
                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs">
                  <Coins className="h-6 w-6 animate-pulse" />
                </div>
                <h4 className="font-display font-bold text-sm text-emerald-950">Disbursement Complete!</h4>
                <p className="leading-relaxed">{withdrawSuccessMsg}</p>
                <div className="pt-2 w-full flex justify-center">
                  <button
                    onClick={() => {
                      setWithdrawSuccessMsg('');
                      // if principal was dissolved, close modal
                      if (withdrawingCustomer.totalSpent === 0) {
                        setIsWithdrawModalOpen(false);
                      }
                    }}
                    className="rounded-lg bg-slate-900 border border-slate-900 px-4 py-2 font-bold text-xs text-white hover:bg-slate-800 transition-colors"
                  >
                    Close Portal
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Account info header banner */}
                <div className="rounded-xl bg-slate-900 text-white p-4 flex justify-between items-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 h-24 w-24 bg-slate-800 rounded-full opacity-50" />
                  <div className="relative z-10">
                    <span className="text-[9px] uppercase font-bold text-indigo-400 block tracking-widest font-mono">Mobile Money Wallet Link</span>
                    <span className="text-sm font-bold block">{withdrawingCustomer.phone || "0770-000000"}</span>
                    <span className="text-[10px] text-slate-300 font-mono block mt-1">LTV Principal: USh {withdrawingCustomer.totalSpent.toLocaleString()}</span>
                  </div>
                  <div className="relative z-10 text-right">
                    <span className="text-[10px] bg-indigo-500/30 text-indigo-300 font-mono px-2 py-1 rounded-md font-bold uppercase block">
                      Yield rate: 10%/hr
                    </span>
                  </div>
                </div>

                {/* Simulated variables & selectors */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-3.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-indigo-600" />
                      Simulate Hold Earnings (Hourly)
                    </span>
                    <span className="text-xs font-mono font-extrabold text-slate-800 bg-slate-200 px-2.5 py-0.5 rounded-full">
                      {simulatedHours} hour{simulatedHours !== 1 ? 's' : ''} hold
                    </span>
                  </div>

                  {/* Slider & quick hour buttons */}
                  <input
                    type="range"
                    min="1"
                    max="72"
                    value={simulatedHours}
                    onChange={(e) => setSimulatedHours(Number(e.target.value))}
                    className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-ew-resize"
                  />

                  <div className="flex gap-2 justify-between">
                    {[1, 4, 8, 12, 24, 48, 72].map((hr) => (
                      <button
                        key={hr}
                        onClick={() => setSimulatedHours(hr)}
                        className={`text-[10px] font-bold font-mono px-2 py-1 rounded-md transition-colors cursor-pointer ${
                          simulatedHours === hr 
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                      >
                        {hr}h
                      </button>
                    ))}
                  </div>

                  {/* Profit yield calculations with transparent 30% system fee split */}
                  <div className="border-t border-dashed border-slate-200 pt-3 space-y-2.5 text-xs">
                    <div className="flex justify-between items-center bg-slate-100/50 p-2.5 rounded-lg">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Gross Yield ({simulatedHours}h)</span>
                        <span className="text-sm font-extrabold text-slate-800 font-mono">
                          USh {currentGrossProfit.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Base Rate</span>
                        <span className="text-xs font-bold text-slate-600 font-mono">
                          USh {currentHourlyYieldRate.toLocaleString()}/hr
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] px-1 text-rose-600 bg-rose-50/50 py-1.5 rounded-md border border-rose-100/50">
                      <span className="font-bold uppercase tracking-wider block pl-1">Platform Commission Cut (30%)</span>
                      <span className="font-mono font-extrabold pr-1">- USh {currentPlatformFee.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-center bg-indigo-50 border border-indigo-100 p-3 rounded-xl text-indigo-950">
                      <div>
                        <span className="text-[9px] font-mono font-extrabold uppercase text-indigo-500 tracking-wider block">Net Partner Payout (70%)</span>
                        <span className="text-base font-black font-mono text-indigo-600">
                          USh {currentNetPayout.toLocaleString()}
                        </span>
                      </div>
                      <span className="text-[9px] bg-indigo-600 text-white font-mono font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                        MoMo Instant
                      </span>
                    </div>
                  </div>
                </div>

                {/* Form fields for payout carrier network */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block">
                    Choose Carrier Payout Network
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedWithdrawMethod('MTN')}
                      className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl border text-center transition-all cursor-pointer ${
                        selectedWithdrawMethod === 'MTN'
                          ? 'border-amber-400 bg-amber-50 text-amber-950 ring-2 ring-amber-400'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <span className="text-xs font-extrabold font-sans">MTN MoMo</span>
                      <span className="text-[9px] font-mono uppercase text-amber-700 font-bold">Uganda Flagship</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedWithdrawMethod('Airtel Money')}
                      className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl border text-center transition-all cursor-pointer ${
                        selectedWithdrawMethod === 'Airtel Money'
                          ? 'border-rose-400 bg-rose-50 text-rose-950 ring-2 ring-rose-400'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <span className="text-xs font-extrabold font-sans">Airtel Money</span>
                      <span className="text-[9px] font-mono uppercase text-rose-700 font-bold font-semibold">Instant Release</span>
                    </button>
                  </div>
                </div>

                {/* Double Core Actions */}
                <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5">
                  <button
                    onClick={handleWithdrawProfits}
                    disabled={withdrawingCustomer.totalSpent === 0}
                    className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Coins className="h-4 w-4" />
                    Withdraw Net Profits: USh {currentNetPayout.toLocaleString()} (30% Commission Applied)
                  </button>

                  <button
                    onClick={handleWithdrawPrincipal}
                    className="w-full rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-semibold text-xs py-2.5 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ArrowDownRight className="h-4 w-4 text-rose-600" />
                    Withdraw Invested Principal (All USh {withdrawingCustomer.totalSpent.toLocaleString()})
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-slate-500">No customer selected.</p>
        )}
      </InteractiveModal>

      {/* HOURLY DEPOSIT SIMULATOR MODAL */}
      <InteractiveModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        title={depositingCustomer ? `MOMO Deposit Portal: ${depositingCustomer.name}` : 'MOMO Deposit Portal'}
      >
        {depositingCustomer ? (
          <div className="space-y-4">
            {depositSuccessMsg ? (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-5 text-emerald-800 text-xs flex flex-col items-center text-center space-y-3.5 animate-[fadeIn_0.2s_ease-out]">
                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs">
                  <ArrowUpRight className="h-6 w-6 animate-pulse" />
                </div>
                <h4 className="font-display font-bold text-sm text-emerald-950">Deposit Confirmed & Capital Active!</h4>
                <p className="leading-relaxed">{depositSuccessMsg}</p>
                <div className="pt-2 w-full flex justify-center">
                  <button
                    onClick={() => {
                      setDepositSuccessMsg('');
                      setIsDepositModalOpen(false);
                    }}
                    className="rounded-lg bg-slate-900 border border-slate-900 px-4 py-2 font-bold text-xs text-white hover:bg-slate-800 transition-colors"
                  >
                    Close Portal
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Account info header banner */}
                <div className="rounded-xl bg-slate-950 text-white p-4 flex justify-between items-center relative overflow-hidden font-sans">
                  <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 h-24 w-24 bg-slate-800 rounded-full opacity-50" />
                  <div className="relative z-10">
                    <span className="text-[9px] uppercase font-bold text-emerald-400 block tracking-widest font-mono">Mobile Money Source Wallet</span>
                    <span className="text-sm font-bold block">{depositingCustomer.phone || "0770-000000"}</span>
                    <span className="text-[10px] text-slate-300 font-mono block mt-1">Current Active Capital: USh {depositingCustomer.totalSpent.toLocaleString()}</span>
                  </div>
                  <div className="relative z-10 text-right font-mono">
                    <span className="text-[10px] bg-emerald-500/30 text-emerald-300 px-2 py-1 rounded-md font-bold uppercase block">
                      Active Partner
                    </span>
                  </div>
                </div>

                {/* Form fields for deposition carrier network */}
                <div className="space-y-2 font-sans">
                  <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block">
                    Choose Funding MoMo Carrier Network
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedDepositMethod('MTN')}
                      className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl border text-center transition-all cursor-pointer ${
                        selectedDepositMethod === 'MTN'
                          ? 'border-amber-400 bg-amber-50 text-amber-950 ring-2 ring-amber-400'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <span className="text-xs font-extrabold">MTN MoMo</span>
                      <span className="text-[9px] font-mono uppercase text-amber-700 font-bold">Uganda Direct Secure</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedDepositMethod('Airtel Money')}
                      className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl border text-center transition-all cursor-pointer ${
                        selectedDepositMethod === 'Airtel Money'
                          ? 'border-rose-400 bg-rose-50 text-rose-950 ring-2 ring-rose-400'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <span className="text-xs font-extrabold">Airtel Money</span>
                      <span className="text-[9px] font-mono uppercase text-rose-700 font-bold">Instant Core Link</span>
                    </button>
                  </div>
                </div>

                {/* Optional Plan Allocation */}
                {products && products.length > 0 && (
                  <div className="space-y-2 font-sans">
                    <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block">
                      Allocate to High-Yield Investment Plan (Optional)
                    </label>
                    <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDepositPlanId('');
                        }}
                        className={`text-left p-2.5 rounded-lg border text-xs transition-all cursor-pointer ${
                          selectedDepositPlanId === ''
                            ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-bold shadow-xs'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="block font-semibold">Custom Allocation</span>
                        <span className="text-[10px] text-slate-400 font-mono">Any custom amount</span>
                      </button>
                      {products.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setSelectedDepositPlanId(p.id);
                            setDepositAmount(p.price);
                          }}
                          className={`text-left p-2.5 rounded-lg border text-xs transition-all cursor-pointer ${
                            selectedDepositPlanId === p.id
                              ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-bold shadow-xs'
                              : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="block truncate font-semibold">{p.name}</span>
                          <span className="text-[10px] font-mono text-emerald-600 font-semibold">
                            USh {p.price.toLocaleString()}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input Amount */}
                <div className="space-y-2 font-sans">
                  <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block">
                    Deposit Capital Amount (USh)
                  </label>
                  <div className="relative rounded-lg shadow-2xs">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-slate-400 text-xs font-mono font-bold">USh</span>
                    </div>
                    <input
                      type="number"
                      min="1000"
                      step="5000"
                      value={depositAmount || ''}
                      onChange={(e) => {
                        setDepositAmount(Number(e.target.value));
                        setSelectedDepositPlanId(''); // Reset plan selection if they manually scale
                      }}
                      className="block w-full rounded-lg border border-slate-200 py-2.5 pl-12 pr-3 text-xs font-bold font-mono text-slate-800 bg-slate-50 focus:border-slate-500 focus:bg-white outline-hidden transition-all"
                      placeholder="e.g. 250,000"
                    />
                  </div>

                  {/* Preset Buttons */}
                  <div className="flex gap-2 justify-between">
                    {[50000, 100000, 250000, 500000, 1000000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => {
                          setDepositAmount(amt);
                          setSelectedDepositPlanId(''); // override plan selection
                        }}
                        className={`text-[10px] font-bold font-mono px-2 py-1.5 rounded-md transition-colors cursor-pointer ${
                          depositAmount === amt 
                            ? 'bg-slate-900 text-white' 
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        +{amt / 1000}k
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mobile Money Deposit Target Instructions */}
                <div className={`p-3.5 rounded-xl border transition-all ${
                  selectedDepositMethod === 'Airtel Money'
                    ? 'bg-rose-50/80 border-rose-200 text-rose-950 font-sans'
                    : 'bg-amber-50/80 border-amber-200 text-amber-950 font-sans'
                }`}>
                  <div className="flex items-start gap-2.5 text-xs">
                    <div className={`p-2 rounded-lg shrink-0 ${
                      selectedDepositMethod === 'Airtel Money' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      <Phone className="h-4 w-4 animate-bounce" />
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <span className="font-extrabold block text-[11px] uppercase tracking-wider">
                        {selectedDepositMethod} Deposit Destination
                      </span>
                      {selectedDepositMethod === 'Airtel Money' ? (
                        <div>
                          <p className="leading-relaxed text-[11px]">
                            To complete this simulated deposit, please send exactly <strong className="font-mono font-bold text-xs">USh {depositAmount.toLocaleString()}</strong> to our official Airtel Money recipient account:
                          </p>
                          <div className="mt-2.5 flex items-center justify-between bg-white border border-rose-200 rounded-xl px-3.5 py-2">
                            <div>
                              <span className="text-[9px] uppercase font-bold text-slate-400 block font-mono">Receiver Airtel Line</span>
                              <span className="font-extrabold font-mono text-sm tracking-wider text-rose-700 select-all">0758944579</span>
                            </div>
                            <span className="text-[9px] bg-rose-600 text-white font-mono font-extrabold px-2 py-1 rounded-md uppercase tracking-wider shrink-0 shadow-2xs">
                              Airtel Pay
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="leading-relaxed text-[11px]">
                            To complete this simulated deposit, please send exactly <strong className="font-mono font-bold text-xs">USh {depositAmount.toLocaleString()}</strong> to our official MTN recipient gateway:
                          </p>
                          <div className="mt-2.5 flex items-center justify-between bg-white border border-amber-200 rounded-xl px-3.5 py-2">
                            <div>
                              <span className="text-[9px] uppercase font-bold text-slate-400 block font-mono">Receiver MTN Line</span>
                              <span className="font-extrabold font-mono text-sm tracking-wider text-amber-700 select-all">0768613961</span>
                            </div>
                            <span className="text-[9px] bg-amber-500 text-amber-950 font-mono font-extrabold px-2 py-1 rounded-md uppercase tracking-wider shrink-0 shadow-2xs">
                              MoMo Direct
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Yield Forecast Insight Card */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-1.5 font-mono text-[11px]">
                  <span className="font-sans font-bold text-slate-500 uppercase tracking-wide text-[10px] block">
                    ⚡ Projected High-Yield Return Forecast
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-slate-600">
                    <div>
                      <span className="text-[9px] uppercase text-slate-400 block">Simulated Base Rate</span>
                      <span className="font-extrabold text-slate-700">10.0% / hour</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase text-slate-400 block">Hourly Earning Yield</span>
                      <span className="font-extrabold text-emerald-600">+ USh {Math.round(depositAmount * 0.1).toLocaleString()}/hr</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase text-slate-400 block">Weekly Return Projection</span>
                      <span className="font-bold text-slate-700">USh {Math.round(depositAmount * 0.1 * 168).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase text-slate-400 block">Platform Retained (30%)</span>
                      <span className="font-bold text-rose-500">30% on Withdrawal</span>
                    </div>
                  </div>
                </div>

                {/* Core Deposit Actions */}
                <div className="pt-3 border-t border-slate-100">
                  <button
                    onClick={handleMakeDeposit}
                    disabled={depositAmount <= 0}
                    className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                    Commit MOMO Deposit: USh {depositAmount.toLocaleString()} via {selectedDepositMethod}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-slate-500">No customer selected.</p>
        )}
      </InteractiveModal>
    </div>
  );
}
