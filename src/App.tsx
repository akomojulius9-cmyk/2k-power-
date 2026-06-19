/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Product, Customer, Transaction, TransactionCategory } from './types';
import { INITIAL_PRODUCTS, INITIAL_CUSTOMERS, INITIAL_TRANSACTIONS } from './data/mockData';
import AnalyticsSection from './components/AnalyticsSection';
import ProductSection from './components/ProductSection';
import CustomerSection from './components/CustomerSection';
import TransactionSection from './components/TransactionSection';
import OnlineProfitMonitor from './components/OnlineProfitMonitor';
import PlayStoreLaunchConsole from './components/PlayStoreLaunchConsole';
import PaymentGateways from './components/PaymentGateways';
import FirebaseAuthLogin from './components/FirebaseAuthLogin';
import RegulatoryCompliance from './components/RegulatoryCompliance';
import { auth } from './lib/firebase';
import {
  fetchAllDataFromFirestore,
  seedInitialDataToFirestore,
  saveProductToFirestore,
  deleteProductFromFirestore,
  saveCustomerToFirestore,
  deleteCustomerFromFirestore,
  saveTransactionToFirestore,
  deleteTransactionFromFirestore
} from './lib/firestoreSync';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  Landmark, 
  TrendingUp, 
  Sparkles, 
  AlertCircle, 
  Plus, 
  Receipt, 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  MessageCircle, 
  Send, 
  Instagram, 
  Smartphone, 
  Bell, 
  Cpu, 
  LogOut,
  Shield,
  User,
  Scale
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import InvestorPortal from './components/InvestorPortal';
import { useMemo } from 'react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'client' | 'admin'>('client');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'customers' | 'transactions' | 'live-monitor' | 'play-store' | 'payment-gateways' | 'compliance'>('dashboard');

  // Share portal & copy notification states
  const [copiedStatus, setCopiedStatus] = useState<string | null>(null);
  const [footerComplianceOpen, setFooterComplianceOpen] = useState<boolean>(false);
  const shareUrl = "https://ais-pre-nibgjeixvomxcm2xv6kb3h-967103159752.europe-west2.run.app";
  const promoMessage = `🔥 Welcome to the 2K POWER APP! Get 10% high-yield passive returns instantly on your mobile money. Managed officially by Criss Julius. Start compounding your capital today: ${shareUrl}`;

  const handleCopy = (type: string, textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedStatus(type);
    setTimeout(() => {
      setCopiedStatus(null);
    }, 2500);
  };

  // Core global state matrices
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Helper to load fallback local state copies
  const loadLocalData = () => {
    try {
      const storedProducts = localStorage.getItem('bt_products');
      const storedCustomers = localStorage.getItem('bt_customers');
      const storedTransactions = localStorage.getItem('bt_transactions');

      if (storedProducts) setProducts(JSON.parse(storedProducts));
      else {
        setProducts(INITIAL_PRODUCTS);
        localStorage.setItem('bt_products', JSON.stringify(INITIAL_PRODUCTS));
      }

      if (storedCustomers) setCustomers(JSON.parse(storedCustomers));
      else {
        setCustomers(INITIAL_CUSTOMERS);
        localStorage.setItem('bt_customers', JSON.stringify(INITIAL_CUSTOMERS));
      }

      if (storedTransactions) setTransactions(JSON.parse(storedTransactions));
      else {
        setTransactions(INITIAL_TRANSACTIONS);
        localStorage.setItem('bt_transactions', JSON.stringify(INITIAL_TRANSACTIONS));
      }
    } catch (e) {
      setProducts(INITIAL_PRODUCTS);
      setCustomers(INITIAL_CUSTOMERS);
      setTransactions(INITIAL_TRANSACTIONS);
    }
  };

  // Firebase Authentication & Collaborative Firestore Sync Listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const cloudData = await fetchAllDataFromFirestore();
          // If Firestore database has never been seeded or is transiently empty, seed it!
          if (cloudData.products.length === 0 && cloudData.customers.length === 0 && cloudData.transactions.length === 0) {
            await seedInitialDataToFirestore(INITIAL_PRODUCTS, INITIAL_CUSTOMERS, INITIAL_TRANSACTIONS);
            setProducts(INITIAL_PRODUCTS);
            setCustomers(INITIAL_CUSTOMERS);
            setTransactions(INITIAL_TRANSACTIONS);
          } else {
            setProducts(cloudData.products);
            setCustomers(cloudData.customers);
            setTransactions(cloudData.transactions);
          }
        } catch (err) {
          console.error("Firestore initialization error, falling back locally:", err);
          loadLocalData();
        }
      } else {
        setCurrentUser(null);
        // Clear working states for security on logout
        setProducts([]);
        setCustomers([]);
        setTransactions([]);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Match authenticated phone/email to Customer database profile
  const currentCustomer = useMemo(() => {
    if (!currentUser) return null;
    const phone = currentUser.phoneNumber || '';
    const email = currentUser.email || '';
    
    // Clean formatted/country strings for loose endings match
    const cleanNum = (p: string) => p.replace(/[^0-9]/g, '');
    const userPhoneClean = cleanNum(phone);
    
    const matched = customers.find(c => {
      const cPhoneClean = cleanNum(c.phone);
      if (userPhoneClean && cPhoneClean) {
        return cPhoneClean.endsWith(userPhoneClean) || userPhoneClean.endsWith(cPhoneClean);
      }
      return c.email && email && c.email.toLowerCase() === email.toLowerCase();
    });

    if (matched) return matched;

    // Build a fallback customer object so safety workflows run perfectly
    if (phone) {
      return {
        id: `cust-${currentUser.uid || 'dynamic'}`,
        name: currentUser.displayName || `Investor (${phone})`,
        email: email || 'investor@gridpower.ug',
        phone: phone,
        totalOrders: 0,
        totalSpent: 0,
        lastActive: new Date().toISOString(),
        status: 'active' as const,
        payoutPhone: phone,
      };
    }

    return customers[0] || null;
  }, [currentUser, customers]);

  // Save states to standard local storage on every state mutation
  const persist = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (err) {
      console.error('Persistence failed for key: ' + key, err);
    }
  };

  // --- PRODUCT MANAGEMENT ACTION TRIGGERS ---
  const handleAddProduct = (newProd: Omit<Product, 'id'>) => {
    const fresh: Product = {
      ...newProd,
      id: `prod-${Date.now()}`,
    };
    const updated = [...products, fresh];
    setProducts(updated);
    persist('bt_products', updated);
    if (currentUser) {
      saveProductToFirestore(fresh);
    }
  };

  const handleEditProduct = (editedProd: Product) => {
    const updated = products.map((p) => (p.id === editedProd.id ? editedProd : p));
    setProducts(updated);
    persist('bt_products', updated);
    if (currentUser) {
      saveProductToFirestore(editedProd);
    }
  };

  const handleDeleteProduct = (id: string) => {
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    persist('bt_products', updated);
    if (currentUser) {
      deleteProductFromFirestore(id);
    }

    // Also dissociate productId from relevant transactions
    const updatedTxs = transactions.map((t) => {
      if (t.productId === id) {
        const withDissoc = { ...t, productId: undefined };
        if (currentUser) {
          saveTransactionToFirestore(withDissoc);
        }
        return withDissoc;
      }
      return t;
    });
    setTransactions(updatedTxs);
    persist('bt_transactions', updatedTxs);
  };

  // --- CUSTOMER MANAGEMENT ACTION TRIGGERS ---
  const handleAddCustomer = (newCust: Omit<Customer, 'id' | 'totalOrders' | 'totalSpent'>) => {
    const fresh: Customer = {
      ...newCust,
      id: `cust-${Date.now()}`,
      totalOrders: 0,
      totalSpent: 0,
    };
    const updated = [...customers, fresh];
    setCustomers(updated);
    persist('bt_customers', updated);
    if (currentUser) {
      saveCustomerToFirestore(fresh);
    }
  };

  const handleEditCustomer = (editedCust: Customer) => {
    const updated = customers.map((c) => (c.id === editedCust.id ? editedCust : c));
    setCustomers(updated);
    persist('bt_customers', updated);
    if (currentUser) {
      saveCustomerToFirestore(editedCust);
    }
  };

  const handleDeleteCustomer = (id: string) => {
    const updated = customers.filter((c) => c.id !== id);
    setCustomers(updated);
    persist('bt_customers', updated);
    if (currentUser) {
      deleteCustomerFromFirestore(id);
    }

    // Also dissociate customerId from relevant transactions
    const updatedTxs = transactions.map((t) => {
      if (t.customerId === id) {
        const withDissoc = { ...t, customerId: undefined };
        if (currentUser) {
          saveTransactionToFirestore(withDissoc);
        }
        return withDissoc;
      }
      return t;
    });
    setTransactions(updatedTxs);
    persist('bt_transactions', updatedTxs);
  };

  // --- CASHFLOW LEDGER TRANSACTION ACTIONS ---
  const handleAddTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const freshId = `tx-${Date.now()}`;
    const fresh: Transaction = {
      ...newTx,
      id: freshId,
    };

    // Commit transaction immediately
    const updatedTxs = [fresh, ...transactions];
    setTransactions(updatedTxs);
    persist('bt_transactions', updatedTxs);
    if (currentUser) {
      saveTransactionToFirestore(fresh);
    }

    // Business Logic: If listing is associated with Customer / Product, update LTV figures automatically!
    if (newTx.type === 'inflow') {
      // 1. Update Customer LTV orders & totalSpent
      if (newTx.customerId) {
        const updatedCusts = customers.map((c) => {
          if (c.id === newTx.customerId) {
            const upCust = {
              ...c,
              totalOrders: c.totalOrders + 1,
              totalSpent: c.totalSpent + newTx.amount,
              lastActive: newTx.date,
            };
            if (currentUser) {
              saveCustomerToFirestore(upCust);
            }
            return upCust;
          }
          return c;
        });
        setCustomers(updatedCusts);
        persist('bt_customers', updatedCusts);
      }

      // 2. Decrement Product Stock inventory count
      if (newTx.productId) {
        const updatedProds = products.map((p) => {
          if (p.id === newTx.productId) {
            const upProd = {
              ...p,
              stock: Math.max(0, p.stock - 1),
            };
            if (currentUser) {
              saveProductToFirestore(upProd);
            }
            return upProd;
          }
          return p;
        });
        setProducts(updatedProds);
        persist('bt_products', updatedProds);
      }
    } else if (newTx.type === 'outflow') {
      // 3. For Outflows matching a Restock purchase, bump up the linked product's stock count!
      if (newTx.productId && newTx.category === TransactionCategory.RESTOCK) {
        const updatedProds = products.map((p) => {
          if (p.id === newTx.productId) {
            const upProd = {
              ...p,
              stock: p.stock + 10,
            };
            if (currentUser) {
              saveProductToFirestore(upProd);
            }
            return upProd;
          }
          return p;
        });
        setProducts(updatedProds);
        persist('bt_products', updatedProds);
      }
    }
  };

  const handleEditTransaction = (editedTx: Transaction) => {
    const oldTx = transactions.find((t) => t.id === editedTx.id);
    if (!oldTx) return;

    // 1. Revert old transaction impacts
    let tempCustomers = [...customers];
    let tempProducts = [...products];

    if (oldTx.type === 'inflow') {
      if (oldTx.customerId) {
        tempCustomers = tempCustomers.map((c) => {
          if (c.id === oldTx.customerId) {
            return {
              ...c,
              totalOrders: Math.max(0, c.totalOrders - 1),
              totalSpent: Math.max(0, c.totalSpent - oldTx.amount),
            };
          }
          return c;
        });
      }
      if (oldTx.productId) {
        tempProducts = tempProducts.map((p) => {
          if (p.id === oldTx.productId) {
            return { ...p, stock: p.stock + 1 };
          }
          return p;
        });
      }
    } else if (oldTx.type === 'outflow') {
      if (oldTx.productId && oldTx.category === TransactionCategory.RESTOCK) {
        tempProducts = tempProducts.map((p) => {
          if (p.id === oldTx.productId) {
            return { ...p, stock: Math.max(0, p.stock - 10) };
          }
          return p;
        });
      }
    }

    // 2. Apply new transaction impacts
    if (editedTx.type === 'inflow') {
      if (editedTx.customerId) {
        tempCustomers = tempCustomers.map((c) => {
          if (c.id === editedTx.customerId) {
            return {
              ...c,
              totalOrders: c.totalOrders + 1,
              totalSpent: c.totalSpent + editedTx.amount,
              lastActive: editedTx.date,
            };
          }
          return c;
        });
      }
      if (editedTx.productId) {
        tempProducts = tempProducts.map((p) => {
          if (p.id === editedTx.productId) {
            return { ...p, stock: Math.max(0, p.stock - 1) };
          }
          return p;
        });
      }
    } else if (editedTx.type === 'outflow') {
      if (editedTx.productId && editedTx.category === TransactionCategory.RESTOCK) {
        tempProducts = tempProducts.map((p) => {
          if (p.id === editedTx.productId) {
            return { ...p, stock: p.stock + 10 };
          }
          return p;
        });
      }
    }

    // Save states
    setCustomers(tempCustomers);
    persist('bt_customers', tempCustomers);
    setProducts(tempProducts);
    persist('bt_products', tempProducts);

    const updatedTxs = transactions.map((t) => (t.id === editedTx.id ? editedTx : t));
    setTransactions(updatedTxs);
    persist('bt_transactions', updatedTxs);

    if (currentUser) {
      tempCustomers.forEach(c => saveCustomerToFirestore(c));
      tempProducts.forEach(p => saveProductToFirestore(p));
      saveTransactionToFirestore(editedTx);
    }
  };

  const handleDeleteTransaction = (id: string) => {
    const txToDelete = transactions.find((t) => t.id === id);
    if (!txToDelete) return;

    const updatedTxs = transactions.filter((t) => t.id !== id);
    setTransactions(updatedTxs);
    persist('bt_transactions', updatedTxs);
    if (currentUser) {
      deleteTransactionFromFirestore(id);
    }

    // Revert logic:
    if (txToDelete.type === 'inflow') {
      // Revert customer spent/orders
      if (txToDelete.customerId) {
        const updatedCusts = customers.map((c) => {
          if (c.id === txToDelete.customerId) {
            const upCust = {
              ...c,
              totalOrders: Math.max(0, c.totalOrders - 1),
              totalSpent: Math.max(0, c.totalSpent - txToDelete.amount),
            };
            if (currentUser) {
              saveCustomerToFirestore(upCust);
            }
            return upCust;
          }
          return c;
        });
        setCustomers(updatedCusts);
        persist('bt_customers', updatedCusts);
      }
      // Revert product stock (increment back)
      if (txToDelete.productId) {
        const updatedProds = products.map((p) => {
          if (p.id === txToDelete.productId) {
            const upProd = {
              ...p,
              stock: p.stock + 1,
            };
            if (currentUser) {
              saveProductToFirestore(upProd);
            }
            return upProd;
          }
          return p;
        });
        setProducts(updatedProds);
        persist('bt_products', updatedProds);
      }
    } else if (txToDelete.type === 'outflow') {
      // Revert stock boost if it was a restock
      if (txToDelete.productId && txToDelete.category === TransactionCategory.RESTOCK) {
        const updatedProds = products.map((p) => {
          if (p.id === txToDelete.productId) {
            const upProd = {
              ...p,
              stock: Math.max(0, p.stock - 10),
            };
            if (currentUser) {
              saveProductToFirestore(upProd);
            }
            return upProd;
          }
          return p;
        });
        setProducts(updatedProds);
        persist('bt_products', updatedProds);
      }
    }
  };

  // Low stock counter
  const lowStockProductsCount = products.filter((p) => p.stock <= 10).length;

  // Calculate high-fidelity stats for header
  const totalInflowHeader = transactions
    .filter((t) => t.type === 'inflow')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalOutflowHeader = transactions
    .filter((t) => t.type === 'outflow')
    .reduce((sum, t) => sum + t.amount, 0);
  const netIncomeHeader = totalInflowHeader - totalOutflowHeader;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center font-sans antialiased relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.06),transparent_60%)]"></div>
        <div className="flex flex-col items-center gap-4 relative z-10">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-slate-800 border-t-emerald-500 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-emerald-400 animate-pulse" />
            </div>
          </div>
          <div className="text-center mt-2">
            <h2 className="text-emerald-400 text-sm font-mono uppercase tracking-widest font-bold">2K POWER PORTAL</h2>
            <p className="text-xs text-slate-400 font-mono mt-1">Acquiring secure connection coordinates...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <FirebaseAuthLogin onLoginSuccess={(u) => setCurrentUser(u)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans select-none antialiased">
      {/* Upper Unified Commerce Header */}
      <header className="w-full max-w-7xl mx-auto px-6 pt-8 pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-sm font-black tracking-wider uppercase text-emerald-600 mb-1">2K POWER APP</h1>
          <div className="text-3xl font-light tracking-tight text-slate-800">Ugandan High-Yield Investment Portal</div>
          <div className="text-xs text-slate-400 font-mono mt-1.5 font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Manager: <span className="text-slate-600 font-bold uppercase tracking-wider">Criss Julius</span>
          </div>
        </div>
        <div className="flex gap-8 items-end self-stretch md:self-auto justify-between md:justify-end">
          <div className="text-right">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Net Yield Portfolio</div>
            <div className={`text-2xl font-bold font-mono ${netIncomeHeader >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {formatCurrency(netIncomeHeader)}
            </div>
          </div>
          <div className="h-12 w-px bg-slate-200 hidden sm:block"></div>
          
          <div className="flex items-center gap-3">
            {lowStockProductsCount > 0 && (
              <div className="rounded-lg bg-amber-50 border border-amber-100 px-2.5 py-1 flex items-center gap-1.5 text-amber-700">
                <AlertCircle className="h-3.5 w-3.5" />
                <span className="text-[10px] font-semibold font-mono">
                  {lowStockProductsCount} Low Capacity
                </span>
              </div>
            )}
            <div className="text-right hidden sm:block">
              <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider font-mono leading-none">Console Operator</span>
              <span className="text-xs font-bold text-slate-700 block mt-0.5" title={currentUser?.uid}>
                {currentUser?.phoneNumber || "Authorized Operator"}
              </span>
            </div>
            <button
              onClick={() => auth.signOut()}
              className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-900 flex items-center justify-center text-xs font-bold shadow-md cursor-pointer transition-all hover:scale-105 active:scale-95"
              title="Sign Out / Disconnect Console"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Structural Body */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        
        {/* DUAL MODE ROLE SWITCHER */}
        <div id="role-switcher-banner" className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-100/30 text-emerald-700">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Active Portal Mode Selector</h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Operator Profile: <span className="font-bold text-slate-600">{currentCustomer?.name || currentUser?.phoneNumber || 'Authorized Session'}</span>
              </p>
            </div>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/60 font-mono font-bold">
            <button
              onClick={() => {
                setViewMode('client');
                setActiveTab('dashboard');
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wide transition-all cursor-pointer ${
                viewMode === 'client'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-850'
              }`}
            >
              <User className="h-3.5 w-3.5 shrink-0" />
              <span>Investor Portal</span>
            </button>
            <button
              onClick={() => {
                setViewMode('admin');
                setActiveTab('dashboard');
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wide transition-all cursor-pointer ${
                viewMode === 'admin'
                  ? 'bg-slate-900 text-slate-100 shadow-md'
                  : 'text-slate-500 hover:text-slate-850'
              }`}
            >
              <Shield className="h-3.5 w-3.5 shrink-0" />
              <span>Admin Console</span>
            </button>
          </div>
        </div>

        {viewMode === 'client' ? (
          <InvestorPortal
            currentUser={currentUser}
            currentCustomer={currentCustomer}
            customers={customers}
            products={products}
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
            onEditCustomer={handleEditCustomer}
          />
        ) : (
          <>
            {/* Social Share & Invite Hub */}
            <section id="share-social-hub" className="bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 rounded-2xl p-6 text-white shadow-xl border border-emerald-800/15 relative overflow-hidden">
          {/* Subtle cosmic accent glows */}
          <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute left-10 bottom-0 w-60 h-60 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono">
                <Share2 className="h-3.5 w-3.5 text-emerald-400 animate-pulse shrink-0" /> Share & Invite Investors
              </div>
              <h2 className="text-xl md:text-2xl font-black tracking-tight font-sans text-white">
                Share 2K POWER APP Link
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                Ready to recruit new investors or share with friends? Copy the configured high-yield invitation message or use the fast social shortcuts to send via WhatsApp, Instagram, or Telegram instantly!
              </p>
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              {/* WhatsApp Option */}
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(promoMessage)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] font-mono px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-xs"
              >
                <MessageCircle className="h-4 w-4 shrink-0 fill-[#25D366]/10" />
                <span>WhatsApp</span>
                <ExternalLink className="h-3 w-3 opacity-60 ml-1" />
              </a>

              {/* Telegram Option */}
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(promoMessage)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 bg-[#0088cc]/10 hover:bg-[#0088cc]/20 border border-[#0088cc]/40 text-[#0088cc] font-mono px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-xs"
              >
                <Send className="h-4 w-4 shrink-0" />
                <span>Telegram</span>
                <ExternalLink className="h-3 w-3 opacity-60 ml-1" />
              </a>

              {/* Instagram Copy Option */}
              <button
                onClick={() => handleCopy('instagram', promoMessage)}
                className={`flex items-center gap-2 font-mono px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-xs ${
                  copiedStatus === 'instagram'
                    ? 'bg-amber-500 text-slate-950 border border-amber-400'
                    : 'bg-[#E1306C]/10 hover:bg-[#E1306C]/20 border border-[#E1306C]/40 text-[#E1306C]'
                }`}
              >
                <Instagram className="h-4 w-4 shrink-0" />
                <span>{copiedStatus === 'instagram' ? 'Caption Copied!' : 'Instagram Promo'}</span>
              </button>
            </div>
          </div>

          {/* Preset Preview Box & Direct Copy Controls */}
          <div className="mt-5 border-t border-slate-800/60 pt-5 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="w-full flex-1">
              <span className="text-[9px] uppercase font-bold text-emerald-400 block tracking-wider font-mono mb-1.5">
                Configured Invitation Message Template
              </span>
              <div className="bg-slate-950/65 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-300 font-mono select-all leading-relaxed whitespace-pre-wrap">
                {promoMessage}
              </div>
            </div>
            
            <button
              onClick={() => handleCopy('general', promoMessage)}
              className={`w-full md:w-auto h-full min-h-[44px] flex items-center justify-center gap-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all px-6 py-3 border select-none ${
                copiedStatus === 'general'
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow-lg scale-[1.02]'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500/30 hover:scale-[1.01]'
              }`}
            >
              {copiedStatus === 'general' ? (
                <>
                  <Check className="h-4 w-4 stroke-[3px]" />
                  <span>Success! Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy Promo Link</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* Navigation Tabs Header Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-3">
          <nav className="flex flex-wrap gap-2">
            {/* Tab 1: Dashboard */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Yield Metrics & Velocity
            </button>

            {/* Tab 2: Products */}
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'products'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              Investment Plans ({products.length})
            </button>

            {/* Tab 3: Customers */}
            <button
              onClick={() => setActiveTab('customers')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'customers'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              Inflow Investors ({customers.length})
            </button>

            {/* Tab 4: Ledger Transactions */}
            <button
              onClick={() => setActiveTab('transactions')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'transactions'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              <Landmark className="h-3.5 w-3.5" />
              MOMO & Airtel Ledger
            </button>

            {/* Tab 5: Live Profit/Yield Monitor */}
            <button
              onClick={() => setActiveTab('live-monitor')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black tracking-wide transition-all border ${
                activeTab === 'live-monitor'
                  ? 'bg-emerald-600 border-emerald-500 text-white shadow-md'
                  : 'text-emerald-700 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20'
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
              🟢 Online Profit Monitor
            </button>

            {/* Tab 6: Play Store & Notifications Console */}
            <button
              onClick={() => setActiveTab('play-store')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black tracking-wide transition-all border ${
                activeTab === 'play-store'
                  ? 'bg-indigo-600 border-indigo-550 text-white shadow-md'
                  : 'text-indigo-700 bg-indigo-500/10 border-indigo-500/20 hover:bg-indigo-500/20'
              }`}
            >
              <Smartphone className="h-3.5 w-3.5 text-indigo-600" />
              🚀 Play Store & Notifications
            </button>

            {/* Tab 7: Payment Gateways & Developer API Integrations */}
            <button
              onClick={() => setActiveTab('payment-gateways')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black tracking-wide transition-all border ${
                activeTab === 'payment-gateways'
                  ? 'bg-indigo-950 border-indigo-900 text-white shadow-md'
                  : 'text-indigo-900 bg-indigo-500/10 border-indigo-500/20 hover:bg-slate-100'
              }`}
            >
              <Cpu className="h-3.5 w-3.5 text-indigo-900 animate-pulse" />
              🔌 Gateways & APIs
            </button>

            {/* Tab 8: Bank of Uganda Regulatory & Legal Hub */}
            <button
              onClick={() => setActiveTab('compliance')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black tracking-wide transition-all border ${
                activeTab === 'compliance'
                  ? 'bg-slate-900 border-slate-950 text-white shadow-md'
                  : 'text-slate-505 bg-slate-100 border-slate-200 hover:bg-slate-205'
              }`}
            >
              <Scale className="h-3.5 w-3.5 text-slate-800 animate-pulse" />
              ⚖️ BoU Regulations & Legal
            </button>
          </nav>

          {/* Prompt action overview context */}
          <div className="flex items-center gap-2 text-[10px] font-mono font-medium text-slate-400 bg-white shadow-xs rounded-lg px-2.5 py-1 self-start sm:self-center border border-slate-250">
            <Sparkles className="h-3 w-3 text-indigo-500 animate-pulse" />
            <span>Ugandan Shilling (UGX) Portal</span>
          </div>
        </div>

        {/* Tab content controller with framer-motion page transition */}
        <div className="relative overflow-visible">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && (
                <AnalyticsSection
                  transactions={transactions}
                  products={products}
                  customers={customers}
                />
              )}

              {activeTab === 'products' && (
                <ProductSection
                  products={products}
                  onAddProduct={handleAddProduct}
                  onEditProduct={handleEditProduct}
                  onDeleteProduct={handleDeleteProduct}
                />
              )}

              {activeTab === 'customers' && (
                <CustomerSection
                  customers={customers}
                  products={products}
                  onAddCustomer={handleAddCustomer}
                  onEditCustomer={handleEditCustomer}
                  onDeleteCustomer={handleDeleteCustomer}
                  onAddTransaction={handleAddTransaction}
                />
              )}

              {activeTab === 'transactions' && (
                <TransactionSection
                  transactions={transactions}
                  products={products}
                  customers={customers}
                  onAddTransaction={handleAddTransaction}
                  onEditTransaction={handleEditTransaction}
                  onDeleteTransaction={handleDeleteTransaction}
                />
              )}

              {activeTab === 'live-monitor' && (
                <OnlineProfitMonitor
                  customers={customers}
                  products={products}
                  transactions={transactions}
                  onAddTransaction={handleAddTransaction}
                  onEditCustomer={handleEditCustomer}
                />
              )}

              {activeTab === 'play-store' && (
                <PlayStoreLaunchConsole
                  customers={customers}
                  products={products}
                  transactions={transactions}
                  onAddTransaction={handleAddTransaction}
                  onEditCustomer={handleEditCustomer}
                />
              )}

              {activeTab === 'payment-gateways' && (
                <PaymentGateways
                  customers={customers}
                  products={products}
                  transactions={transactions}
                  onAddTransaction={handleAddTransaction}
                  onEditCustomer={handleEditCustomer}
                />
              )}

              {activeTab === 'compliance' && (
                <RegulatoryCompliance
                  customers={customers}
                  products={products}
                  transactions={transactions}
                  onAddTransaction={handleAddTransaction}
                  standaloneView={true}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
          </>
        )}
      </main>

      {/* Ground Footer */}
      <footer className="mt-12 border-t border-slate-200 bg-white p-6 text-center text-xs text-slate-400 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between leading-loose gap-4">
          <span>&copy; {new Date().getFullYear()} 2K POWER APP. All rights reserved.</span>
          <div className="flex flex-wrap justify-center gap-4 text-[11px] font-bold text-slate-500 uppercase">
            <button 
              onClick={() => setFooterComplianceOpen(true)} 
              className="hover:text-indigo-650 cursor-pointer transition-colors"
            >
              ⚖️ BoU compliance & limits
            </button>
            <span>•</span>
            <button 
              onClick={() => setFooterComplianceOpen(true)} 
              className="hover:text-indigo-650 cursor-pointer transition-colors"
            >
              🔒 Privacy Policy
            </button>
            <span>•</span>
            <button 
              onClick={() => setFooterComplianceOpen(true)} 
              className="hover:text-indigo-650 cursor-pointer transition-colors"
            >
              📜 Terms of Service
            </button>
          </div>
          <span>Crafted with meticulous Slate & Emerald High-Yield Design Theme.</span>
        </div>
      </footer>

      {/* GLOBAL DISCLOSURE & REGULATORY OVERLAY */}
      <AnimatePresence>
        {footerComplianceOpen && (
          <div key="global-compliance-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200"
            >
              <RegulatoryCompliance
                customers={customers}
                products={products}
                transactions={transactions}
                onAddTransaction={handleAddTransaction}
                standaloneView={false}
                onRequestClose={() => setFooterComplianceOpen(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
