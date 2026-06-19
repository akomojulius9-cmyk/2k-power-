/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { Package, Search, Plus, Edit2, Trash2, Tag, AlertTriangle, Coins, Target, TrendingUp, HelpCircle } from 'lucide-react';
import InteractiveModal from './InteractiveModal';

interface ProductSectionProps {
  products: Product[];
  onAddProduct: (prod: Omit<Product, 'id'>) => void;
  onEditProduct: (prod: Product) => void;
  onDeleteProduct: (id: string) => void;
}

export default function ProductSection({
  products,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
}: ProductSectionProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Modal toggle state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState<number>(10000); // Enforce min 10k Shs
  const [cost, setCost] = useState<number>(3000);
  const [stock, setStock] = useState<number>(100);
  const [hourlyYield, setHourlyYield] = useState<number>(1000); // 1,000 Shs / hr default for 10k Shs
  const [description, setDescription] = useState('');

  // Extract unique categories for filters
  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];

  // Filter investment plans based on search term & selected category
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // When price changes, auto-recommend 10% Hourly Dividend (e.g. 10,000 -> 1,000)
  const handlePriceChange = (newPrice: number) => {
    setPrice(newPrice);
    if (newPrice >= 10000) {
      setHourlyYield(Math.round(newPrice * 0.1));
    }
  };

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setName('');
    setCategory('Micro Venture');
    setPrice(10000);
    setCost(3000);
    setStock(150);
    setHourlyYield(1000);
    setDescription('A high-yield asset allocation plan. Capital is backed by diversified digital commerce pools and paid hourly.');
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setCategory(prod.category);
    setPrice(prod.price);
    setCost(prod.cost);
    setStock(prod.stock);
    setHourlyYield(prod.hourlyYield || Math.round(prod.price * 0.1));
    setDescription(prod.description);
    setIsModalOpen(true);
  };

  // Submit form (handles both Edit and Add)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !category.trim()) return;

    if (Number(price) < 10000) {
      alert("⚠️ Error: Investment plans start with anyone starting to invest from 10,000 Ugandan Shillings (UGX) and above!");
      return;
    }

    const payload = {
      name,
      category,
      price: Number(price),
      cost: Number(cost),
      stock: Number(stock),
      hourlyYield: Number(hourlyYield),
      description,
    };

    if (editingProduct) {
      onEditProduct({
        id: editingProduct.id,
        ...payload,
      });
    } else {
      onAddProduct(payload);
    }
    setIsModalOpen(false);
  };

  const formatShs = (val: number) => {
    return `USh ${val.toLocaleString('en-US')}`;
  };

  return (
    <div id="product-section" className="space-y-6">
      {/* Upper header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-slate-800">
            Investment Plans & Capital Packages
          </h2>
          <p className="text-sm text-slate-500">
            Manage your high-yield plans in Ugandan Shillings (UGX). Starting from 10,000 Shs up with automated hourly yield models.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-slate-800 hover:-translate-y-0.5 transition-all self-start"
        >
          <Plus className="h-4 w-4" />
          Create Investment Plan
        </button>
      </div>

      {/* Rules Notice Badge */}
      <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-xs text-blue-800 flex gap-3 items-start">
        <Target className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="font-bold">UGX System Investment Parameters Active:</strong>
          <p className="text-blue-700 leading-relaxed">
            Investment plans start strictly with a minimum capital requirement of <strong className="text-blue-900 font-semibold">10,000 UGX</strong>. 
            The baseline hourly payout return formula rewards clients with <strong className="text-blue-900 font-semibold">1,000 UGX per hour</strong> on a 10,000 UGX deposit (matching custom 10% hourly index rates).
          </p>
        </div>
      </div>

      {/* Filter and search utilities dashboard bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-xs sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search investment plans by name or metrics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pr-4 pl-9 text-xs placeholder-slate-400 focus:border-slate-400 focus:bg-white outline-hidden transition-all"
          />
        </div>

        {/* Categories Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pt-1 sm:pt-0">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mr-1">Tier Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Investment Plans Cards */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((prod) => {
            const calculatedHourlyYield = prod.hourlyYield || Math.round(prod.price * 0.1);
            const yieldPercentage = prod.price > 0 ? (calculatedHourlyYield / prod.price) * 100 : 0;
            const margin = prod.price - prod.cost; // Capital reserve buffer over administrative sourcing fees
            const reservePercent = prod.price > 0 ? (margin / prod.price) * 100 : 0;
            const isFullCapacity = prod.stock === 0;
            const isLimitedPlan = prod.stock <= 15;

            return (
              <div
                key={prod.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-6 shadow-xs hover:shadow-md transition-all duration-200"
              >
                {/* Upper tags & Actions overlay */}
                <div>
                  <div className="flex items-start justify-between">
                    <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600 uppercase tracking-wider font-mono">
                      <Tag className="h-3 w-3" />
                      {prod.category}
                    </span>

                    {/* Quick controls */}
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEdit(prod)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors"
                        title="Edit plan configuration"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete ${prod.name}?`)) {
                            onDeleteProduct(prod.id);
                          }
                        }}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        title="Delete plan"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Product Title and description */}
                  <div className="mt-4">
                    <h3 className="font-display text-base font-bold text-slate-800 leading-tight">
                      {prod.name}
                    </h3>
                    <p className="mt-1.5 text-xs text-slate-500 line-clamp-3 leading-relaxed">
                      {prod.description}
                    </p>
                  </div>
                </div>

                {/* Pricing & yield payouts blocks */}
                <div className="mt-6 pt-4 border-t border-slate-100 space-y-3.5">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-emerald-50/40 p-2 border border-emerald-100/30">
                      <span className="text-[9px] uppercase font-semibold text-slate-400 block tracking-wider">Required Principal</span>
                      <span className="text-xs font-bold font-mono text-emerald-700">
                        {formatShs(prod.price)}
                      </span>
                    </div>

                    <div className="rounded-lg bg-indigo-50/40 p-2 border border-indigo-100/30">
                      <span className="text-[9px] uppercase font-semibold text-slate-400 block tracking-wider">Hourly Yield payout</span>
                      <span className="text-xs font-extrabold font-mono text-indigo-700 flex items-center gap-0.5" title="Hourly dividend distribution">
                        <TrendingUp className="h-3.5 w-3.5 stroke-[2.5]" />
                        {formatShs(calculatedHourlyYield)}
                      </span>
                    </div>
                  </div>

                  {/* Stock capacity and margin reserve stats */}
                  <div className="flex items-center justify-between">
                    {/* Slots Available equivalent to stock */}
                    <div className="flex items-center gap-1.5">
                      <Coins className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-xs font-mono">
                        Slots Status:{' '}
                        <span
                          className={`font-semibold ${
                            isFullCapacity
                              ? 'text-rose-605'
                              : isLimitedPlan
                              ? 'text-amber-600'
                              : 'text-slate-700'
                          }`}
                        >
                          {prod.stock} active limits
                        </span>
                      </span>

                      {/* Stock capacity visual pill */}
                      {isFullCapacity ? (
                        <span className="inline-flex rounded bg-rose-50 px-1 py-0.5 text-[8px] font-bold text-rose-500 uppercase tracking-widest leading-none">
                          Locked
                        </span>
                      ) : isLimitedPlan ? (
                        <span className="inline-flex rounded bg-amber-50 px-1 py-0.5 text-[8px] font-bold text-amber-600 uppercase tracking-widest leading-none" title="High demand">
                          Hot
                        </span>
                      ) : null}
                    </div>

                    {/* Return Rate Percentage */}
                    <div className="text-right">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Hourly ROI Rate</span>
                      <span className="text-xs font-mono font-extrabold text-orange-600 block">
                        +{yieldPercentage.toFixed(1)}% / hour
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <Package className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-4 font-display text-base font-semibold text-slate-700">No investment plans configured</h3>
          <p className="mt-1 text-xs text-slate-500">
            Create custom plans of 10,000 UGX and above, and designate automatic hourly yields.
          </p>
        </div>
      )}

      {/* CREATE & EDIT FORM MODAL CONTAINER */}
      <InteractiveModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Configure Investment Plan Parameters' : 'Deploy New Investment Plan'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block mb-1">
              Investment Plan Identifier Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Starter Plan (10k Shs)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs focus:border-slate-500 focus:bg-white outline-hidden transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block mb-1">
                Risk / Yield Category
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Starter Capital, Venture Pool, High Yield"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs focus:border-slate-500 focus:bg-white outline-hidden transition-all"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block mb-1">
                Account Slot Availability Limit
              </label>
              <input
                type="number"
                min="0"
                required
                value={stock}
                onChange={(e) => setStock(Math.max(0, Number(e.target.value)))}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs focus:border-slate-500 focus:bg-white outline-hidden transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold uppercase text-orange-600 tracking-wider block mb-1 flex items-center gap-1">
                Principal Price (UGX) <span className="text-red-500 font-bold">*</span>
              </label>
              <input
                type="number"
                min="10000"
                step="any"
                required
                value={price || ''}
                onChange={(e) => handlePriceChange(Math.max(0, Number(e.target.value)))}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-800 focus:border-slate-500 focus:bg-white outline-hidden transition-all font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block italic">Minimum 10,000 UGX</span>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block mb-1">
                Administrative Sourcing Reserves (UGX)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                required
                value={cost || ''}
                onChange={(e) => setCost(Math.max(0, Number(e.target.value)))}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs focus:border-slate-500 focus:bg-white outline-hidden transition-all font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase text-indigo-600 block mb-1 tracking-wider">
              Hourly Return yield payout (UGX per hour) <span className="text-slate-400 font-normal italic">(Defaults to 10% auto-calculated)</span>
            </label>
            <input
              type="number"
              min="0"
              required
              value={hourlyYield || ''}
              onChange={(e) => setHourlyYield(Number(e.target.value))}
              className="w-full rounded-lg border border-indigo-200 bg-indigo-50/40 font-bold text-indigo-850 px-3.5 py-2 text-xs focus:border-indigo-500 focus:bg-white outline-hidden transition-all font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block mb-1">
              Detailed Plan Policy Walkthrough
            </label>
            <textarea
              rows={3}
              placeholder="Provide a description of the index or lease pool backing this plan..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs focus:border-slate-500 focus:bg-white outline-hidden transition-all"
            />
          </div>

          {/* Real-time investment payout metrics inside the form */}
          <div className="rounded-xl bg-orange-50/50 p-4 border border-orange-100 flex flex-col gap-1.5 text-xs">
            <div className="flex justify-between items-center text-slate-700">
              <span>Automatic Hourly Return Rate:</span>
              <strong className="font-mono text-orange-700">
                {price > 0 ? ((hourlyYield / price) * 100).toFixed(1) : 0}% / hour payout
              </strong>
            </div>
            <div className="flex justify-between items-center text-slate-500">
              <span>Daily Total Accrued Yield (24 Hrs):</span>
              <span className="font-mono text-slate-700 font-bold">
                {formatShs(hourlyYield * 24)}
              </span>
            </div>
            {price < 10000 && (
              <div className="text-red-500 font-semibold text-[10px] mt-1 flex items-center gap-1 italic">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Error: Principal cannot be less than 10,000 Ugandan Shillings!</span>
              </div>
            )}
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
              {editingProduct ? 'Update Plan' : 'Deploy Plan'}
            </button>
          </div>
        </form>
      </InteractiveModal>
    </div>
  );
}
