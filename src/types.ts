/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;       // Retail selling price / Principal Investment Amount
  cost: number;        // Cost to acquire/produce
  stock: number;
  description: string;
  hourlyYield?: number; // Hourly return yield in UGX
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  lastActive: string; // ISO Date String
  status: 'active' | 'inactive';
  registeredNum?: string; // Officially registered ID or National ID number
  payoutPhone?: string;   // Recipient mobile money number for payout
  avatarUrl?: string;     // Profile picture / Avatar image
  investmentDays?: number; // Chosen number of days to invest
}

export enum TransactionCategory {
  SALE = 'Sale Revenue',
  UPGRADE = 'Service Upgrade',
  RESTOCK = 'Restock Inventory',
  RENT = 'Rent & Facilities',
  MARKETING = 'Marketing Expenses',
  UTILITIES = 'Utilities & Softwares',
  OPERATIONS = 'General Operations',
  REFUND = 'Refund Reimbursement'
}

export interface Transaction {
  id: string;
  type: 'inflow' | 'outflow';
  amount: number;
  date: string;       // ISO Timestamp (e.g., "2026-06-18T10:00:00Z")
  description: string;
  productId?: string;  // Linked product (optional)
  customerId?: string; // Linked customer (optional)
  category: TransactionCategory | string;
  paymentMethod?: 'MTN' | 'Airtel Money';
}

export interface AnalyticsSummary {
  totalInflow: number;     // Sum of inflows
  totalOutflow: number;    // Sum of outflows
  netProfit: number;       // Inflow - Outflow
  grossMargin: number;     // Profit / Inflow percentage
  totalSalesCount: number; // Count of sale transactions
}
