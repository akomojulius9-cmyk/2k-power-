import { Product, Customer, Transaction, TransactionCategory } from '../types';

// Investment plans (Products) denominated in Ugandan Shillings (UGX / Shs)
// Enforce minimum investment plans >= 10,000 UGX.
// For 10,000 UGX investment, they receive 1,000 UGX/hour yield.
export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Starter Plan (10k Shs)',
    category: 'Micro Venture',
    price: 10000,
    cost: 3000,
    stock: 250,
    description: 'Entry-level individual investment plan. Generates USh 1,000 per hour (10% hourly return yield) directly onto your mobile wallet.',
    hourlyYield: 1000
  },
  {
    id: 'prod-2',
    name: 'Growth Plan (50k Shs)',
    category: 'Vanguard Growth',
    price: 50000,
    cost: 15000,
    stock: 120,
    description: 'Intermediate high-yield plan. Generates USh 5,000 per hour (10% hourly return yield) matching trade index asset pools.',
    hourlyYield: 5000
  },
  {
    id: 'prod-3',
    name: 'Silver Venture Plan (100k Shs)',
    category: 'Vanguard Growth',
    price: 100000,
    cost: 35000,
    stock: 75,
    description: 'Corporate venture-backed tier. Generates USh 10,000 per hour (10% hourly return yield) leveraging local supply lines.',
    hourlyYield: 10000
  },
  {
    id: 'prod-4',
    name: 'Gold Elite Portfolio (250k Shs)',
    category: 'Elite Capital',
    price: 250000,
    cost: 80000,
    stock: 45,
    description: 'Premium gold tier asset pool. Generates USh 25,000 per hour (10% hourly return yield) matching logistical transit leases.',
    hourlyYield: 25000
  },
  {
    id: 'prod-5',
    name: 'Sovereign Diamond Tier (500k Shs)',
    category: 'Sovereign Capital',
    price: 500000,
    cost: 150000,
    stock: 15,
    description: 'Exclusive state-level wholesale investment yield. Generates USh 50,050 per hour in guaranteed commodity trade options.',
    hourlyYield: 50000
  }
];

// Active East African investor register tracking total LTV deposits
export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'Julius Vance Akomo',
    email: 'akomojulius9@gmail.com',
    phone: '+256 772 458912',
    totalOrders: 8,
    totalSpent: 800000,
    lastActive: '2026-06-18T07:45:00-07:00',
    status: 'active',
    registeredNum: 'NIN: CM92078110JKFA',
    payoutPhone: '+256 772 458912',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 'cust-2',
    name: 'Hana Alero Mukasa',
    email: 'hana@mukasastudio.ug',
    phone: '+256 703 867530',
    totalOrders: 14,
    totalSpent: 1250000,
    lastActive: '2026-06-17T16:20:00-07:00',
    status: 'active',
    registeredNum: 'NIN: CF94112340MALE',
    payoutPhone: '+256 758 944579',
    avatarUrl: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 'cust-3',
    name: 'Marcus Kyobe',
    email: 'm.kyobe@vanguard.co.ug',
    phone: '+256 785 902884',
    totalOrders: 4,
    totalSpent: 300000,
    lastActive: '2026-06-18T05:30:00-07:00',
    status: 'active',
    registeredNum: 'NIN: CM88053120KVAN',
    payoutPhone: '+256 768 613961',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 'cust-4',
    name: 'Elise Dupont Namono',
    email: 'elise.namono@designlab.co.ug',
    phone: '+256 751 555321',
    totalOrders: 23,
    totalSpent: 1750000,
    lastActive: '2026-06-15T11:15:00-07:00',
    status: 'active',
    registeredNum: 'NIN: CF96041590DESL',
    payoutPhone: '+256 751 555321',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 'cust-5',
    name: 'Nikhil Chand',
    email: 'nik@chandconcepts.ug',
    phone: '+256 772 124998',
    totalOrders: 2,
    totalSpent: 110000,
    lastActive: '2026-06-10T14:30:00-07:00',
    status: 'inactive',
    registeredNum: 'NIN: CM77121020CHND',
    payoutPhone: '+256 772 124998',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
  }
];

// Investment inflows and administrative outflow logs in UGX Shillings
export const INITIAL_TRANSACTIONS: Transaction[] = [
  // 7 Days Ago
  {
    id: 'tx-1-1',
    type: 'inflow',
    amount: 10000,
    date: '2026-06-11T10:15:00Z',
    description: 'Activated Starter Plan for Julius Vance Akomo',
    productId: 'prod-1',
    customerId: 'cust-1',
    category: TransactionCategory.SALE,
    paymentMethod: 'MTN'
  },
  {
    id: 'tx-1-2',
    type: 'outflow',
    amount: 5000,
    date: '2026-06-11T14:30:00Z',
    description: 'Bulk SMS marketing campaign via EastAfricaSMS',
    category: TransactionCategory.MARKETING
  },
  {
    id: 'tx-1-3',
    type: 'inflow',
    amount: 50000,
    date: '2026-06-11T16:45:00Z',
    description: 'Purchased Growth Plan via Airtel Money',
    productId: 'prod-2',
    customerId: 'cust-3',
    category: TransactionCategory.SALE,
    paymentMethod: 'Airtel Money'
  },

  // 6 Days Ago
  {
    id: 'tx-2-1',
    type: 'inflow',
    amount: 100000,
    date: '2026-06-12T09:20:00Z',
    description: 'Silver Venture Capital subscription deposit',
    productId: 'prod-3',
    customerId: 'cust-4',
    category: TransactionCategory.SALE,
    paymentMethod: 'MTN'
  },
  {
    id: 'tx-2-2',
    type: 'outflow',
    amount: 15000,
    date: '2026-06-12T11:00:00Z',
    description: 'Hosting & server fee subscription renewal',
    category: TransactionCategory.UTILITIES
  },
  {
    id: 'tx-2-3',
    type: 'inflow',
    amount: 250000,
    date: '2026-06-12T15:10:00Z',
    description: 'Deposit: Gold Elite Portfolio slot active',
    productId: 'prod-4',
    customerId: 'cust-2',
    category: TransactionCategory.SALE,
    paymentMethod: 'Airtel Money'
  },

  // 5 Days Ago
  {
    id: 'tx-3-1',
    type: 'inflow',
    amount: 50000,
    date: '2026-06-13T11:45:00Z',
    description: 'Growth Plan activation via MTN',
    productId: 'prod-2',
    customerId: 'cust-2',
    category: TransactionCategory.SALE,
    paymentMethod: 'MTN'
  },
  {
    id: 'tx-3-2',
    type: 'outflow',
    amount: 40000,
    date: '2026-06-13T12:00:00Z',
    description: 'Legal retainer fees for financial regulatory audit',
    category: TransactionCategory.OPERATIONS
  },

  // 4 Days Ago
  {
    id: 'tx-4-1',
    type: 'inflow',
    amount: 500000,
    date: '2026-06-14T10:00:00Z',
    description: 'Sovereign Diamond Plan active package',
    productId: 'prod-5',
    customerId: 'cust-4',
    category: TransactionCategory.SALE,
    paymentMethod: 'MTN'
  },
  {
    id: 'tx-4-2',
    type: 'inflow',
    amount: 100000,
    date: '2026-06-14T16:00:00Z',
    description: 'Silver Venture Plan deposit registered',
    productId: 'prod-3',
    customerId: 'cust-1',
    category: TransactionCategory.SALE,
    paymentMethod: 'Airtel Money'
  },

  // 3 Days Ago
  {
    id: 'tx-5-1',
    type: 'outflow',
    amount: 120000,
    date: '2026-06-15T09:00:00Z',
    description: 'Office internet fibre network setup and utility rent',
    category: TransactionCategory.RENT
  },
  {
    id: 'tx-5-2',
    type: 'inflow',
    amount: 250000,
    date: '2026-06-15T11:30:00Z',
    description: 'Gold Elite Portfolio allocation subscription',
    productId: 'prod-4',
    customerId: 'cust-4',
    category: TransactionCategory.SALE,
    paymentMethod: 'MTN'
  },
  {
    id: 'tx-5-3',
    type: 'inflow',
    amount: 10000,
    date: '2026-06-15T14:40:00Z',
    description: 'Starter Plan portfolio deposit',
    productId: 'prod-1',
    customerId: 'cust-2',
    category: TransactionCategory.SALE,
    paymentMethod: 'Airtel Money'
  },

  // 2 Days Ago
  {
    id: 'tx-6-1',
    type: 'inflow',
    amount: 250000,
    date: '2026-06-16T10:05:00Z',
    description: 'Gold Elite portfolio allocation deposit',
    productId: 'prod-4',
    customerId: 'cust-2',
    category: TransactionCategory.SALE,
    paymentMethod: 'MTN'
  },
  {
    id: 'tx-6-2',
    type: 'outflow',
    amount: 30000,
    date: '2026-06-16T13:15:00Z',
    description: 'Mobile billing API transaction gateway charge',
    category: TransactionCategory.OPERATIONS
  },
  {
    id: 'tx-6-3',
    type: 'inflow',
    amount: 50000,
    date: '2026-06-16T17:50:00Z',
    description: 'Growth Plan subscription via wallet',
    productId: 'prod-2',
    customerId: 'cust-4',
    category: TransactionCategory.SALE,
    paymentMethod: 'Airtel Money'
  },

  // Yesterday
  {
    id: 'tx-7-1',
    type: 'outflow',
    amount: 25000,
    date: '2026-06-17T08:15:00Z',
    description: 'Promotion server caching subscription costs',
    category: TransactionCategory.RESTOCK
  },
  {
    id: 'tx-7-2',
    type: 'inflow',
    amount: 10000,
    date: '2026-06-17T10:00:00Z',
    description: 'Starter Capital micro-investment registered',
    productId: 'prod-1',
    customerId: 'cust-2',
    category: TransactionCategory.SALE,
    paymentMethod: 'MTN'
  },
  {
    id: 'tx-7-3',
    type: 'inflow',
    amount: 50000,
    date: '2026-06-17T11:45:00Z',
    description: 'Growth Plan purchase - Hana Mukasa partner pool',
    productId: 'prod-2',
    customerId: 'cust-2',
    category: TransactionCategory.SALE,
    paymentMethod: 'Airtel Money'
  },
  {
    id: 'tx-7-4',
    type: 'inflow',
    amount: 100000,
    date: '2026-06-17T13:00:00Z',
    description: 'Silver Venture Plan index purchase',
    productId: 'prod-3',
    customerId: 'cust-2',
    category: TransactionCategory.SALE,
    paymentMethod: 'MTN'
  },
  {
    id: 'tx-7-5',
    type: 'outflow',
    amount: 11000,
    date: '2026-06-17T14:30:00Z',
    description: 'Security hardware multi-sig setup operational bill',
    category: TransactionCategory.OPERATIONS
  },
  {
    id: 'tx-7-6',
    type: 'inflow',
    amount: 250000,
    date: '2026-06-17T16:20:00Z',
    description: 'Gold Elite portfolio upgrade',
    productId: 'prod-4',
    customerId: 'cust-2',
    category: TransactionCategory.SALE,
    paymentMethod: 'Airtel Money'
  },

  // Today (June 18, 2026)
  {
    id: 'tx-8-1',
    type: 'inflow',
    amount: 10000,
    date: '2026-06-18T05:30:00Z',
    description: 'Hourly active investment yield credit (Starter Plan)',
    productId: 'prod-1',
    customerId: 'cust-3',
    category: TransactionCategory.SALE,
    paymentMethod: 'MTN'
  },
  {
    id: 'tx-8-2',
    type: 'inflow',
    amount: 50000,
    date: '2026-06-18T07:45:00Z',
    description: 'Hourly revenue partner share subscription (Growth Plan)',
    productId: 'prod-2',
    customerId: 'cust-1',
    category: TransactionCategory.SALE,
    paymentMethod: 'Airtel Money'
  }
];
