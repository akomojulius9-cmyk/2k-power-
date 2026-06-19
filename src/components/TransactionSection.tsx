/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Transaction, Product, Customer, TransactionCategory } from '../types';
import { Landmark, ArrowUpRight, ArrowDownLeft, Search, Plus, Calendar, Filter, ShoppingBag, User, CheckCircle2, ChevronDown, Edit2, Trash2 } from 'lucide-react';
import InteractiveModal from './InteractiveModal';

interface TransactionSectionProps {
  transactions: Transaction[];
  products: Product[];
  customers: Customer[];
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

export default function TransactionSection({
  transactions,
  products,
  customers,
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
}: TransactionSectionProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'inflow' | 'outflow'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Modal form toggle states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Form states
  const [type, setType] = useState<'inflow' | 'outflow'>('inflow');
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState<string>(
    new Date().toISOString().slice(0, 16) // Format as YYYY-MM-DDTHH:mm
  );
  const [description, setDescription] = useState('');
  const [linkedProductId, setLinkedProductId] = useState('');
  const [linkedCustomerId, setLinkedCustomerId] = useState('');
  const [category, setCategory] = useState<string>(TransactionCategory.SALE);
  const [paymentMethod, setPaymentMethod] = useState<'MTN' | 'Airtel Money' | ''>('');

  // Sort transactions by date (most recent first)
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Filter listings
  const filteredTxs = sortedTransactions.filter((tx) => {
    const matchesSearch =
      tx.description.toLowerCase().includes(search.toLowerCase()) ||
      (tx.category && tx.category.toLowerCase().includes(search.toLowerCase()));
    
    const matchesType = typeFilter === 'all' || tx.type === typeFilter;
    const matchesCategory = categoryFilter === 'all' || tx.category === categoryFilter;

    return matchesSearch && matchesType && matchesCategory;
  });

  // Unique categories in transactions
  const uniqueCategories = Array.from(new Set(transactions.map((t) => t.category)));

  // Preset categories depending on Flow type
  const getCategoriesForType = (flowType: 'inflow' | 'outflow') => {
    if (flowType === 'inflow') {
      return [TransactionCategory.SALE, TransactionCategory.UPGRADE, TransactionCategory.REFUND];
    }
    return [
      TransactionCategory.RESTOCK,
      TransactionCategory.RENT,
      TransactionCategory.MARKETING,
      TransactionCategory.UTILITIES,
      TransactionCategory.OPERATIONS,
      TransactionCategory.REFUND,
    ];
  };

  // React to Form flow selection swaps
  const handleTypeChange = (newType: 'inflow' | 'outflow') => {
    setType(newType);
    const available = getCategoriesForType(newType);
    setCategory(available[0]);
    
    // Clear product/customer defaults if swapping to outflow expense
    if (newType === 'outflow') {
      setLinkedProductId('');
      setLinkedCustomerId('');
      setAmount(100);
    } else {
      setAmount(150);
    }
  };

  // React to Product linking inside the Sale Inflow input form
  // Prefills prices automatically!
  const handleProductLink = (prodId: string) => {
    setLinkedProductId(prodId);
    if (!prodId) return;
    const foundProduct = products.find((p) => p.id === prodId);
    if (foundProduct) {
      setAmount(foundProduct.price);
      setDescription(`Purchase of "${foundProduct.name}"`);
    }
  };

  // Form handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || !description.trim()) return;

    // Convert date string input to clean ISO string
    const isoDateString = new Date(date).toISOString();

    const txPayload = {
      type,
      amount: Number(amount),
      date: isoDateString,
      description,
      productId: linkedProductId || undefined,
      customerId: linkedCustomerId || undefined,
      category,
      paymentMethod: paymentMethod || undefined,
    };

    if (editingTransaction) {
      onEditTransaction({
        ...editingTransaction,
        ...txPayload,
      });
    } else {
      onAddTransaction(txPayload);
    }

    setIsModalOpen(false);
  };

  const handleOpenCreate = () => {
    setEditingTransaction(null);
    setType('inflow');
    setAmount(185);
    setCategory(TransactionCategory.SALE);
    setDescription('Sale of premium brand collection bags');
    setLinkedProductId('');
    setLinkedCustomerId('');
    setPaymentMethod('');
    setDate(new Date().toISOString().slice(0, 16));
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tx: Transaction) => {
    setEditingTransaction(tx);
    setType(tx.type);
    setAmount(tx.amount);
    
    // Safely format for datetime-local
    const dObj = new Date(tx.date);
    const tzoffset = dObj.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(dObj.getTime() - tzoffset)).toISOString().slice(0, 16);
    setDate(localISOTime);
    
    setDescription(tx.description);
    setLinkedProductId(tx.productId || '');
    setLinkedCustomerId(tx.customerId || '');
    setCategory(tx.category);
    setPaymentMethod(tx.paymentMethod || '');
    setIsModalOpen(true);
  };

  // Helper formatting tools
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatDateStringFriendly = (isoStr: string) => {
    const d = new Date(isoStr);
    return `${d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })} at ${d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  };

  return (
    <div id="transaction-section" className="space-y-6">
      {/* Upper Title Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-slate-800">
            Account Ledger & Fluid Cash Flows
          </h2>
          <p className="text-sm text-slate-500">
            Add general ledger sales inflows and outgoing stock purchases with detailed accounting tagging.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-slate-800 hover:-translate-y-0.5 transition-all self-start"
        >
          <Plus className="h-4 w-4" />
          Log Flow Event
        </button>
      </div>

      {/* Advanced search, categorization & Flow types controller */}
      <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-xs md:grid-cols-4">
        {/* Input search */}
        <div className="relative md:col-span-2">
          <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search flow ledger by keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pr-4 pl-9 text-xs placeholder-slate-400 focus:border-slate-400 focus:bg-white outline-hidden transition-all"
          />
        </div>

        {/* Type selector */}
        <div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 p-2 text-xs focus:border-slate-500 outline-hidden focus:bg-white"
          >
            <option value="all">Types: All Cashflows</option>
            <option value="inflow">Inflows (+) Only</option>
            <option value="outflow">Outflows (-) Only</option>
          </select>
        </div>

        {/* Category filtering */}
        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 p-2 text-xs focus:border-slate-500 outline-hidden focus:bg-white"
          >
            <option value="all">Categories: All</option>
            {uniqueCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Complete Table ledger View */}
      <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 font-semibold text-slate-500 font-display">
                <th className="px-6 py-4">Flow Coordinate</th>
                <th className="px-6 py-4">Description Ledger</th>
                <th className="px-6 py-4">Linked Product</th>
                <th className="px-6 py-4">Client Contact</th>
                <th className="px-6 py-4">Accounting Tag</th>
                <th className="px-6 py-4">Payment Plan</th>
                <th className="px-6 py-4 text-right">Debit / Credit</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
              {filteredTxs.length > 0 ? (
                filteredTxs.map((tx) => {
                  const linkedProd = products.find((p) => p.id === tx.productId);
                  const linkedCust = customers.find((c) => c.id === tx.customerId);

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50/50 transition-all"
                    >
                      {/* Flow status icon & Time */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`rounded-lg p-2 ${
                              tx.type === 'inflow'
                                ? 'bg-emerald-50 text-emerald-600'
                                // Changed class from text-rose-500 to text-rose-600 to be consistent
                                : 'bg-rose-50 text-rose-600'
                            }`}
                          >
                            {tx.type === 'inflow' ? (
                              <ArrowUpRight className="h-4 w-4" />
                            ) : (
                              <ArrowDownLeft className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <span className="block font-semibold text-slate-800">
                              {tx.type === 'inflow' ? 'Cash Inflow' : 'Cash Outflow'}
                            </span>
                            <span className="text-[10px] text-slate-400 block font-mono">
                              {formatDateStringFriendly(tx.date)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Description */}
                      <td className="px-6 py-4 font-sans text-slate-800 max-w-[200px] truncate">
                        {tx.description}
                      </td>

                      {/* Product details */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {linkedProd ? (
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-1 text-[10px] text-slate-700">
                            <ShoppingBag className="h-3 w-3 text-slate-400" />
                            {linkedProd.name}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono italic text-[10px]">None Linked</span>
                        )}
                      </td>

                      {/* Customer information */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {linkedCust ? (
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-indigo-50 px-2 py-1 text-[10px] text-indigo-700 font-semibold">
                            <User className="h-3 w-3 text-indigo-400" />
                            {linkedCust.name}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono italic text-[10px]">Walk-in Anonymous</span>
                        )}
                      </td>

                      {/* Category tag */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-[10px] rounded border border-slate-100 px-2 py-0.5 bg-slate-50 text-slate-500 uppercase tracking-wider">
                          {tx.category}
                        </span>
                      </td>

                      {/* Payment Plan */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {tx.paymentMethod ? (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold font-mono border ${
                            tx.paymentMethod === 'MTN'
                              ? 'bg-amber-100 text-amber-800 border-amber-200'
                              : 'bg-indigo-100 text-indigo-800 border-indigo-200'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${
                              tx.paymentMethod === 'MTN' ? 'bg-amber-500' : 'bg-indigo-600'
                            }`} />
                            {tx.paymentMethod === 'MTN' ? 'M-T-N MoMo' : 'Airtel Money'}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono text-[10px] italic">Standard / Cash</span>
                        )}
                      </td>

                      {/* Color-coded Amount Debit/Credit */}
                      <td className="px-6 py-4 text-right whitespace-nowrap font-mono font-bold text-sm">
                        <span
                          className={
                            tx.type === 'inflow' ? 'text-emerald-600' : 'text-rose-500'
                          }
                        >
                          {tx.type === 'inflow' ? '+' : '-'}
                          {formatCurrency(tx.amount)}
                        </span>
                      </td>

                      {/* Action buttons (Edit & Delete) */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(tx)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors"
                            title="Edit entry"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete this ${tx.type} entry of UGX ${tx.amount.toLocaleString()}?`)) {
                                onDeleteTransaction(tx.id);
                              }
                            }}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                            title="Delete entry"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <Landmark className="mx-auto h-12 w-12 text-slate-300 mb-2" />
                    <h3 className="font-display font-semibold text-slate-700">No Cashflow records found</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Check your search query or add a custom debit/credit event to track profits.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE/EDIT TRANSACTION FLOW FORM MODAL */}
      <InteractiveModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTransaction ? 'Modify Ledger Entry Record' : 'File Cashflow Event Record'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Radio Switch: Inflow / Outflow */}
          <div>
            <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block mb-2">
              Flow Category Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleTypeChange('inflow')}
                className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-semibold transition-all ${
                  type === 'inflow'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                Inflow (Credit Sale)
              </button>
              
              <button
                type="button"
                onClick={() => handleTypeChange('outflow')}
                className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-semibold transition-all ${
                  type === 'outflow'
                    ? 'border-rose-300 bg-rose-50 text-rose-800 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ArrowDownLeft className="h-4 w-4 text-rose-600" />
                Outflow (Debit Expense)
              </button>
            </div>
          </div>

          {/* Conditional Product & Customer dropdowns ONLY valid for Inflows/Sales */}
          {type === 'inflow' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Product link selection */}
              <div>
                <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block mb-1">
                  Investment Plan Link (Auto-fill principal)
                </label>
                <select
                  value={linkedProductId}
                  onChange={(e) => handleProductLink(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:border-slate-500 focus:bg-white outline-hidden transition-all"
                >
                  <option value="">Generic Deposit / Unlinked</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (UGX {p.price.toLocaleString()} principal)
                    </option>
                  ))}
                </select>
              </div>

              {/* Customer link selection */}
              <div>
                <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block mb-1">
                  Customer Purchaser Link
                </label>
                <select
                  value={linkedCustomerId}
                  onChange={(e) => setLinkedCustomerId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:border-slate-500 focus:bg-white outline-hidden transition-all"
                >
                  <option value="">Walk-in Anonymous</option>
                  {customers
                    .filter((c) => c.status === 'active')
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.email})
                      </option>
                    ))}
                </select>
              </div>
            </div>
          )}

          {/* Amount and Accounting tags */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold uppercase text-indigo-600 tracking-wider block mb-1">
                Amount Value (UGX)
              </label>
              <input
                type="number"
                min="1"
                step="any"
                required
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs focus:border-slate-500 focus:bg-white outline-hidden transition-all font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block mb-1">
                Accounting Tag Rule
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs focus:border-slate-500 focus:bg-white outline-hidden transition-all"
              >
                {getCategoriesForType(type).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Custom Date & Hour picker */}
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block mb-1">
                Event Date & Hour
              </label>
              <input
                type="datetime-local"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs focus:border-slate-500 focus:bg-white outline-hidden transition-all font-mono"
              />
            </div>

            {/* Quick pre-sets for date */}
            <div className="flex flex-col justify-end">
              <span className="text-[10px] text-slate-400 font-semibold mb-1 uppercase tracking-wide block">Pre-sets:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDate(new Date().toISOString().slice(0, 16))}
                  className="rounded bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 text-[10px] font-mono transition-colors"
                >
                  Current Time
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    setDate(yesterday.toISOString().slice(0, 16));
                  }}
                  className="rounded bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 text-[10px] font-mono transition-colors"
                >
                  Yesterday
                </button>
              </div>
            </div>
          </div>

          {/* Description summary */}
          <div>
            <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block mb-1">
              Ledger Description Summary
            </label>
            <input
              type="text"
              required
              placeholder="Provide context (e.g. Courier shipping service fees)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs focus:border-slate-500 focus:bg-white outline-hidden transition-all"
            />
          </div>

          {/* Payment Plan / Mobile Money Selection */}
          <div>
            <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block mb-1">
              Payment Plan / Mobile Money Network
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as 'MTN' | 'Airtel Money' | '')}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs focus:border-slate-500 focus:bg-white outline-hidden transition-all font-semibold text-slate-800"
            >
              <option value="">None / Cash / Traditional Bank Transfer</option>
              <option value="MTN">MTN Mobile Money (M-T-N)</option>
              <option value="Airtel Money">Airtel Money</option>
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
              {editingTransaction ? 'Save Adjusted Parameters' : 'Commit Flow Event'}
            </button>
          </div>
        </form>
      </InteractiveModal>
    </div>
  );
}
