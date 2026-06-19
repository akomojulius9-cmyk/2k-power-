/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Transaction, Product, Customer, TransactionCategory } from '../types';
import { TrendingUp, ArrowUpRight, ArrowDownLeft, DollarSign, Percent, Clock, Calendar, BarChart3, HelpCircle, UserPlus, UserMinus, Users } from 'lucide-react';
import { motion } from 'motion/react';

interface AnalyticsSectionProps {
  transactions: Transaction[];
  products: Product[];
  customers: Customer[];
}

type ChartGranularity = 'daily' | 'hourly';
type HourlyScope = 'today' | 'yesterday' | 'cumulative';

export default function AnalyticsSection({ transactions, products, customers }: AnalyticsSectionProps) {
  const [granularity, setGranularity] = useState<ChartGranularity>('daily');
  const [hourlyScope, setHourlyScope] = useState<HourlyScope>('cumulative');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // States for Customer Growth Analytics
  const [customerChartType, setCustomerChartType] = useState<'daily' | 'cumulative'>('cumulative');
  const [hoveredCustIdx, setHoveredCustIdx] = useState<number | null>(null);

  // Helper: Format currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Calculate metrics on the fly from current transactions
  const totalInflow = transactions
    .filter((t) => t.type === 'inflow')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalOutflow = transactions
    .filter((t) => t.type === 'outflow')
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalInflow - totalOutflow;
  const grossMargin = totalInflow > 0 ? (netProfit / totalInflow) * 100 : 0;
  const totalInflowCount = transactions.filter((t) => t.type === 'inflow').length;

  // Mobile money payment plan analytics (MTN / Airtel Money)
  const mtnInflow = transactions
    .filter((t) => t.type === 'inflow' && t.paymentMethod === 'MTN')
    .reduce((sum, t) => sum + t.amount, 0);
  const mtnCount = transactions.filter((t) => t.type === 'inflow' && t.paymentMethod === 'MTN').length;

  const airtelInflow = transactions
    .filter((t) => t.type === 'inflow' && t.paymentMethod === 'Airtel Money')
    .reduce((sum, t) => sum + t.amount, 0);
  const airtelCount = transactions.filter((t) => t.type === 'inflow' && t.paymentMethod === 'Airtel Money').length;

  const totalMoMoInflow = mtnInflow + airtelInflow;
  const mtnPercent = totalMoMoInflow > 0 ? (mtnInflow / totalMoMoInflow) * 100 : 50;
  const airtelPercent = totalMoMoInflow > 0 ? (airtelInflow / totalMoMoInflow) * 100 : 50;

  // 1b. CUSTOMER TIMELINE AND RETENTION MATRIX (JOINED AND LEFT)
  const getCustomerGrowthData = () => {
    // Standard template dates of June 11 through June 18
    const baseTimeline = [
      { key: '2026-06-11', label: 'Jun 11', baseJoined: 2, baseLeft: 0 },
      { key: '2026-06-12', label: 'Jun 12', baseJoined: 3, baseLeft: 0 },
      { key: '2026-06-13', label: 'Jun 13', baseJoined: 2, baseLeft: 1 },
      { key: '2026-06-14', label: 'Jun 14', baseJoined: 4, baseLeft: 0 },
      { key: '2026-06-15', label: 'Jun 15', baseJoined: 3, baseLeft: 2 },
      { key: '2026-06-16', label: 'Jun 16', baseJoined: 4, baseLeft: 1 },
      { key: '2026-06-17', label: 'Jun 17', baseJoined: 5, baseLeft: 1 },
      { key: '2026-06-18', label: 'Jun 18', baseJoined: 4, baseLeft: 2 },
    ];

    // Compute dynamic shifts from active/inactive status changes or direct registrations
    const updatedTimeline = baseTimeline.map((day) => {
      let joinees = day.baseJoined;
      let retirees = day.baseLeft;

      customers.forEach((cust) => {
        const dateStr = cust.lastActive ? cust.lastActive.split('T')[0] : '2026-06-18';
        if (dateStr === day.key) {
          if (cust.id.startsWith('cust-')) {
            // Seeded customers can shift based on current state toggles in the UI
            if (cust.id === 'cust-5' && cust.status === 'active') {
              retirees = Math.max(0, retirees - 1);
            }
          } else {
            // New user registration
            joinees += 1;
            if (cust.status === 'inactive') {
              retirees += 1;
            }
          }
        }
      });

      return {
        ...day,
        joined: joinees,
        left: retirees,
        net: joinees - retirees
      };
    });

    let cumJoined = 0;
    let cumLeft = 0;

    return updatedTimeline.map((item) => {
      cumJoined += item.joined;
      cumLeft += item.left;
      return {
        ...item,
        cumJoined,
        cumLeft,
        cumNetActive: cumJoined - cumLeft,
      };
    });
  };

  const customerGraphData = getCustomerGrowthData();

  // Coordinate scales parameters for Customer Graph
  const custWidth = 540;
  const custHeight = 180;
  const custPaddingX = 40;
  const custPaddingY = 30;

  const scaleCustX = (index: number) => 
    custPaddingX + (index * (custWidth - custPaddingX * 2)) / (customerGraphData.length - 1);

  const maxCustJoined = Math.max(...customerGraphData.map(d => customerChartType === 'daily' ? d.joined : d.cumJoined), 4);
  const maxCustLeft = Math.max(...customerGraphData.map(d => customerChartType === 'daily' ? d.left : d.cumLeft), 2);
  const maxCustVal = Math.max(maxCustJoined, maxCustLeft, 6);

  const scaleCustY = (val: number) => 
    custHeight - custPaddingY - (val / maxCustVal) * (custHeight - custPaddingY * 2);

  let custJoinPathD = '';
  let custLeftPathD = '';
  let custJoinAreaD = '';
  let custLeftAreaD = '';

  if (customerGraphData.length > 0) {
    const pointsJoin = customerGraphData.map((d, idx) => {
      const val = customerChartType === 'daily' ? d.joined : d.cumJoined;
      return `${scaleCustX(idx).toFixed(1)},${scaleCustY(val).toFixed(1)}`;
    });
    custJoinPathD = `M ${pointsJoin.join(' L ')}`;
    custJoinAreaD = `${custJoinPathD} L ${scaleCustX(customerGraphData.length - 1).toFixed(1)},${(custHeight - custPaddingY).toFixed(1)} L ${scaleCustX(0).toFixed(1)},${(custHeight - custPaddingY).toFixed(1)} Z`;

    const pointsLeft = customerGraphData.map((d, idx) => {
      const val = customerChartType === 'daily' ? d.left : d.cumLeft;
      return `${scaleCustX(idx).toFixed(1)},${scaleCustY(val).toFixed(1)}`;
    });
    custLeftPathD = `M ${pointsLeft.join(' L ')}`;
    custLeftAreaD = `${custLeftPathD} L ${scaleCustX(customerGraphData.length - 1).toFixed(1)},${(custHeight - custPaddingY).toFixed(1)} L ${scaleCustX(0).toFixed(1)},${(custHeight - custPaddingY).toFixed(1)} Z`;
  }

  // 1. Process DAILY data dynamically
  const getDailyData = () => {
    // Generate a set of all unique days across transactions
    const datesSet = new Set<string>();
    
    // Always include the core default range of Jun 11 - Jun 18 so the chart loads beautifully
    const defaultDays = [
      '2026-06-11',
      '2026-06-12',
      '2026-06-13',
      '2026-06-14',
      '2026-06-15',
      '2026-06-16',
      '2026-06-17',
      '2026-06-18',
    ];
    defaultDays.forEach((d) => datesSet.add(d));

    // Incorporate any newer or older custom transaction days
    transactions.forEach((t) => {
      if (t.date) {
        const dStr = t.date.split('T')[0];
        if (dStr && /^\d{4}-\d{2}-\d{2}$/.test(dStr)) {
          datesSet.add(dStr);
        }
      }
    });

    // Chronological order sorting
    const dayKeys = Array.from(datesSet).sort();

    // Map keys to readable visual labels (e.g., '2026-06-11' -> 'Jun 11')
    const labels = dayKeys.map((dayStr) => {
      const parts = dayStr.split('-');
      if (parts.length === 3) {
        const monthNum = parseInt(parts[1], 10);
        const dayNum = parseInt(parts[2], 10);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[monthNum - 1]} ${dayNum}`;
      }
      return dayStr;
    });

    let runningBalance = 0;

    return dayKeys.map((dayStr, idx) => {
      // Find transactions occurring on this calendar day
      const dayTxs = transactions.filter((t) => {
        const txDateStr = t.date.split('T')[0];
        return txDateStr === dayStr;
      });

      const dayInflow = dayTxs.filter((t) => t.type === 'inflow').reduce((sum, t) => sum + t.amount, 0);
      const dayOutflow = dayTxs.filter((t) => t.type === 'outflow').reduce((sum, t) => sum + t.amount, 0);
      const dayProfit = dayInflow - dayOutflow;
      runningBalance += dayProfit;

      return {
        label: labels[idx],
        fullDateStr: dayStr,
        inflow: dayInflow,
        outflow: dayOutflow,
        profit: dayProfit,
        cumulativeProfit: runningBalance,
        txCount: dayTxs.length,
      };
    });
  };

  // 2. Process HOURLY data dynamically
  const getHourlyData = () => {
    const hours = [8, 10, 12, 14, 16, 18, 20, 22];
    const hourLabels = ['08:00 AM', '10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM', '08:00 PM', '10:00 PM'];

    // Dynamically identify "Today" and "Yesterday" relative to the latest registered transaction
    const sortedTxsForDay = [...transactions].sort((a, b) => b.date.localeCompare(a.date));
    const latestTxDayStr = sortedTxsForDay[0] ? sortedTxsForDay[0].date.split('T')[0] : '2026-06-18';
    
    const latestDateObj = new Date(latestTxDayStr + 'T12:00:00');
    latestDateObj.setDate(latestDateObj.getDate() - 1);
    const yesterdayDayStr = latestDateObj.toISOString().split('T')[0];

    // Filter transactions based on selected scope
    const scopedTxs = transactions.filter((t) => {
      const txDay = t.date.split('T')[0];
      if (hourlyScope === 'today') {
        return txDay === latestTxDayStr;
      } else if (hourlyScope === 'yesterday') {
        return txDay === yesterdayDayStr;
      }
      return true; // Cumulative (all transactions combined)
    });

    let runningHourBalance = 0;

    return hours.map((hour, idx) => {
      // Find transactions in the range [hour - 2, hour]
      const hourTxs = scopedTxs.filter((t) => {
        const dateObj = new Date(t.date);
        const hourStr = t.date.split('T')[1]?.split(':')[0];
        const txHour = hourStr ? parseInt(hourStr, 10) : dateObj.getHours();
        return txHour > hour - 2 && txHour <= hour;
      });

      const hourInflow = hourTxs.filter((t) => t.type === 'inflow').reduce((sum, t) => sum + t.amount, 0);
      const hourOutflow = hourTxs.filter((t) => t.type === 'outflow').reduce((sum, t) => sum + t.amount, 0);
      const hourProfit = hourInflow - hourOutflow;
      runningHourBalance += hourProfit;

      return {
        label: hourLabels[idx],
        inflow: hourInflow,
        outflow: hourOutflow,
        profit: hourProfit,
        cumulativeProfit: runningHourBalance,
        txCount: hourTxs.length,
      };
    });
  };

  const chartData = granularity === 'daily' ? getDailyData() : getHourlyData();

  // SVG dimensions & drawing settings
  const width = 600;
  const height = 280;
  const paddingX = 45;
  const paddingY = 30;

  // Derive maximum values for scale plotting
  const maxInflowOutflow = Math.max(
    ...chartData.map((d) => d.inflow),
    ...chartData.map((d) => d.outflow),
    100
  );

  const minCumProfit = Math.min(...chartData.map((d) => d.cumulativeProfit), 0);
  const maxCumProfit = Math.max(...chartData.map((d) => d.cumulativeProfit), 500);
  const cumProfitDiff = maxCumProfit - minCumProfit || 1;

  // Generate SVG coordinates for Bar graphs (Inflow / Outflow)
  // Maps values to [paddingY, height - paddingY]
  const scaleYBar = (val: number) => {
    const usableHeight = height - paddingY * 2;
    const ratio = maxInflowOutflow > 0 ? val / maxInflowOutflow : 0;
    return height - paddingY - ratio * usableHeight;
  };

  // Generate SVG coordinates for Line graph (Cumulative Profit)
  const scaleYLine = (val: number) => {
    const usableHeight = height - paddingY * 2;
    const ratio = (val - minCumProfit) / cumProfitDiff;
    return height - paddingY - ratio * usableHeight;
  };

  const scaleX = (idx: number) => {
    const usableWidth = width - paddingX * 2;
    const step = chartData.length > 1 ? usableWidth / (chartData.length - 1) : usableWidth;
    return paddingX + idx * step;
  };

  // Cumulative line path string
  const linePathD = chartData
    .map((point, index) => {
      const x = scaleX(index);
      const y = scaleYLine(point.cumulativeProfit);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  // Gradient path string (closes the shape to the bottom horizontal axis for smooth layout shading)
  const areaPathD = chartData.length > 0
    ? `${linePathD} L ${scaleX(chartData.length - 1)} ${height - paddingY} L ${scaleX(0)} ${height - paddingY} Z`
    : '';

  // Get active selected hovered node detailed metrics
  const hoveredPoint = hoveredPointIndex !== null ? chartData[hoveredPointIndex] : null;

  return (
    <div id="analytics-section" className="space-y-6">
      {/* Visual Title Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-slate-800">
            Financial Analytics & Profits
          </h2>
          <p className="text-sm text-slate-500">
            Monitor inflows, outflows, and analyze daily and hourly profit accumulations.
          </p>
        </div>

        {/* Chart View Toggle controls */}
        <div className="flex items-center gap-1.5 self-start rounded-xl bg-slate-100 p-1">
          <button
            onClick={() => {
              setGranularity('daily');
              setHoveredPointIndex(null);
            }}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-medium tracking-wide transition-all ${
              granularity === 'daily'
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            Daily Profit Trend
          </button>
          <button
            onClick={() => {
              setGranularity('hourly');
              setHoveredPointIndex(null);
            }}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-medium tracking-wide transition-all ${
              granularity === 'hourly'
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            Hourly Traffic Flow
          </button>
        </div>
      </div>

      {/* KPI Stats Panel */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1: Inflow */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs flex items-center gap-4">
          <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
            <ArrowUpRight className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400 block uppercase tracking-wider">
              Total Inflow (Income)
            </span>
            <span className="text-2xl font-bold font-display text-slate-800">
              {formatCurrency(totalInflow)}
            </span>
            <span className="text-xs text-slate-400 block mt-0.5">
              From {totalInflowCount} incoming events
            </span>
          </div>
        </div>

        {/* Metric 2: Outflow */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs flex items-center gap-4">
          <div className="rounded-xl bg-rose-50 p-3 text-rose-600">
            <ArrowDownLeft className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400 block uppercase tracking-wider">
              Total Outflow (Expenses)
            </span>
            <span className="text-2xl font-bold font-display text-slate-800">
              {formatCurrency(totalOutflow)}
            </span>
            <span className="text-xs text-slate-400 block mt-0.5">
              Material restocking & operations
            </span>
          </div>
        </div>

        {/* Metric 3: Profit */}
        <div className="rounded-2xl border border-slate-200 bg-linear-to-b from-slate-900 to-slate-800 p-5 shadow-sm text-white flex items-center gap-4">
          <div className="rounded-xl bg-emerald-500/20 p-3 text-emerald-400">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-300 block uppercase tracking-wider">
              Net Net-Profits
            </span>
            <span className="text-2xl font-bold font-display text-emerald-400">
              {formatCurrency(netProfit)}
            </span>
            <span className="text-xs text-slate-300 block mt-0.5">
              Calculated real-time ledger
            </span>
          </div>
        </div>

        {/* Metric 4: Gross Margin */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs flex items-center gap-4">
          <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
            <Percent className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400 block uppercase tracking-wider">
              Calculated Margin
            </span>
            <span className="text-2xl font-bold font-display text-slate-800">
              {grossMargin.toFixed(1)}%
            </span>
            <span className="text-xs text-slate-400 block mt-0.5">
              Net Profit/Inflow ratio
            </span>
          </div>
        </div>
      </div>

      {/* CHART MAIN DISPLAY CONTAINER */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
        {/* Chart Header & Sub-filtering options */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h3 className="font-display font-semibold text-slate-800 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-emerald-600" />
              {granularity === 'daily'
                ? 'Profits Escalation (8 Days Trend)'
                : 'Intraday Operational Flow Progression'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Hover on nodes to inspect financial delta logs, inflows, and profit accumulation curves.
            </p>
          </div>

          {/* Sub-toggle ONLY shown on Hourly granularity */}
          {granularity === 'hourly' && (
            <div className="flex items-center gap-1 rounded bg-slate-50 p-1 border border-slate-100">
              <span className="text-[10px] text-slate-400 px-1 font-semibold uppercase tracking-wider">Scope:</span>
              <button
                onClick={() => {
                  setHourlyScope('today');
                  setHoveredPointIndex(null);
                }}
                className={`rounded px-2 py-0.5 text-[10px] font-medium transition-colors ${
                  hourlyScope === 'today'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Today (Jun 18)
              </button>
              <button
                onClick={() => {
                  setHourlyScope('yesterday');
                  setHoveredPointIndex(null);
                }}
                className={`rounded px-2 py-0.5 text-[10px] font-medium transition-colors ${
                  hourlyScope === 'yesterday'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Yesterday (Jun 17)
              </button>
              <button
                onClick={() => {
                  setHourlyScope('cumulative');
                  setHoveredPointIndex(null);
                }}
                className={`rounded px-2 py-0.5 text-[10px] font-medium transition-colors ${
                  hourlyScope === 'cumulative'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                All Combined
              </button>
            </div>
          )}
        </div>

        {/* Grid layout containing SVG chart and interactive panel info */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 items-stretch">
          {/* SVG canvas container */}
          <div className="lg:col-span-3 border border-slate-50 rounded-xl bg-slate-50/50 p-4 relative flex flex-col justify-center">
            
            {/* Visual Legend */}
            <div className="absolute top-2 right-4 flex items-center gap-4 text-[10px] text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>Inflows (Sales)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded bg-rose-400" />
                <span>Outflows (Expenses)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-0.5 w-4 bg-blue-600 relative flex items-center justify-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600 absolute" />
                </div>
                <span className="font-semibold text-blue-600">Accumulated Growth</span>
              </div>
            </div>

            <div className="w-full overflow-x-auto select-none">
              <svg
                width="100%"
                height="100%"
                viewBox={`0 0 ${width} ${height}`}
                preserveAspectRatio="xMidYMid meet"
                className="overflow-visible min-w-[500px]"
              >
                <defs>
                  {/* Cumulative Profit Path Area Gradient */}
                  <linearGradient id="cumProfitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1e40af" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#1e40af" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal reference grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                  const y = paddingY + ratio * (height - paddingY * 2);
                  return (
                    <line
                      key={i}
                      x1={paddingX}
                      y1={y}
                      x2={width - paddingX}
                      y2={y}
                      stroke="#e2e8f0"
                      strokeDasharray="4,4"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Plot: Inflow & Outflow visual bars */}
                {chartData.map((point, index) => {
                  const x = scaleX(index);
                  const barWidth = Math.min(10, (width - paddingX * 2) / (chartData.length * 2.5));
                  
                  const yInflow = scaleYBar(point.inflow);
                  const yOutflow = scaleYBar(point.outflow);
                  
                  const barYHeightInflow = Math.max(0, height - paddingY - yInflow);
                  const barYHeightOutflow = Math.max(0, height - paddingY - yOutflow);

                  return (
                    <g key={index} className="transition-all duration-300">
                      {/* Inflow Bar (Green) */}
                      {point.inflow > 0 && (
                        <rect
                          x={x - barWidth - 1}
                          y={yInflow}
                          width={barWidth}
                          height={barYHeightInflow}
                          fill="#10b981"
                          rx="2"
                          className="opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                        />
                      )}

                      {/* Outflow Bar (Rose/Red) */}
                      {point.outflow > 0 && (
                        <rect
                          x={x + 1}
                          y={yOutflow}
                          width={barWidth}
                          height={barYHeightOutflow}
                          fill="#fb7185"
                          rx="2"
                          className="opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                        />
                      )}
                    </g>
                  );
                })}

                {/* Line Shaded Area of Profit Accumulation */}
                {areaPathD && (
                  <path
                    d={areaPathD}
                    fill="url(#cumProfitGradient)"
                    className="transition-all duration-500"
                  />
                )}

                {/* Curved line graph tracking Cumulative profit */}
                {linePathD && (
                  <path
                    d={linePathD}
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all duration-500"
                  />
                )}

                {/* Highlight Hover Vertical Line indicator */}
                {hoveredPointIndex !== null && (
                  <line
                    x1={scaleX(hoveredPointIndex)}
                    y1={paddingY}
                    x2={scaleX(hoveredPointIndex)}
                    y2={height - paddingY}
                    stroke="#94a3b8"
                    strokeWidth="1.5"
                    strokeDasharray="2,2"
                  />
                )}

                {/* Nodes on Cumulative balance + Interactive transparent hover spots */}
                {chartData.map((point, index) => {
                  const x = scaleX(index);
                  const y = scaleYLine(point.cumulativeProfit);

                  return (
                    <g key={index}>
                      {/* Actual visual node point */}
                      <circle
                        cx={x}
                        cy={y}
                        r={hoveredPointIndex === index ? 6 : 4}
                        fill="#2563eb"
                        stroke="#ffffff"
                        strokeWidth="2"
                        className="transition-all duration-200"
                      />

                      {/* Interactive Transparent circle capturing overlay mouse movements */}
                      <circle
                        cx={x}
                        cy={height / 2}
                        r={Math.max(20, (width - paddingX * 2) / (chartData.length * 1.5))}
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredPointIndex(index)}
                        onMouseLeave={() => setHoveredPointIndex(null)}
                      />
                    </g>
                  );
                })}

                {/* Category Labels for Bottom Axis */}
                {chartData.map((point, index) => {
                  const x = scaleX(index);
                  const y = height - paddingY + 16;
                  return (
                    <text
                      key={index}
                      x={x}
                      y={y}
                      textAnchor="middle"
                      className="text-[9px] font-mono font-medium text-slate-400"
                    >
                      {point.label}
                    </text>
                  );
                })}

                {/* Left vertical index labels (Cumulative scale alignment) */}
                {[0, 0.5, 1].map((ratio, i) => {
                  const val = minCumProfit + ratio * cumProfitDiff;
                  const y = height - paddingY - ratio * (height - paddingY * 2);
                  return (
                    <text
                      key={i}
                      x={paddingX - 8}
                      y={y + 3}
                      textAnchor="end"
                      className="text-[9px] font-mono font-medium text-blue-600"
                    >
                      {formatCurrency(val)}
                    </text>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Side stats card showing hovered data or general summarization */}
          <div className="lg:col-span-1 rounded-xl border border-slate-100 bg-slate-50/50 p-4 flex flex-col justify-between">
            {hoveredPoint ? (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div>
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block font-mono">
                    Time Coordinate
                  </span>
                  <span className="text-sm font-semibold text-slate-800 block">
                    {hoveredPoint.label}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Inflows Added:</span>
                    <span className="text-xs font-mono font-semibold text-emerald-600">
                      +{formatCurrency(hoveredPoint.inflow)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Outflows Added:</span>
                    <span className="text-xs font-mono font-semibold text-rose-500">
                      -{formatCurrency(hoveredPoint.outflow)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Net Delta:</span>
                    <span
                      className={`text-xs font-mono font-bold ${
                        hoveredPoint.profit >= 0 ? 'text-emerald-600' : 'text-rose-500'
                      }`}
                    >
                      {hoveredPoint.profit >= 0 ? '+' : ''}
                      {formatCurrency(hoveredPoint.profit)}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 bg-blue-50/50 -mx-4 -mb-4 p-4 rounded-b-xl space-y-1">
                  <span className="text-[9px] text-blue-600 uppercase tracking-widest font-bold block font-mono">
                    Accumulated Profits
                  </span>
                  <span className="text-xl font-bold font-display text-blue-900 block">
                    {formatCurrency(hoveredPoint.cumulativeProfit)}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    {hoveredPoint.txCount} transaction events inside
                  </span>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col justify-between h-full space-y-4 py-1">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest font-mono block">
                    Profit Mechanism
                  </span>
                  <h4 className="text-xs font-semibold text-slate-700">
                    How are your profits made?
                  </h4>
                  <p className="text-[11px] leading-relaxed text-slate-500">
                    Your profit grows dynamically. Every finished **Sale Revenue** pushes the balance up (green bars), while inventory purchases and utility outflows reduce it. 
                  </p>
                </div>

                <div className="rounded-lg bg-emerald-50 border border-emerald-100/50 p-3 text-[11px] text-emerald-800 space-y-1">
                  <div className="font-semibold flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5" /> Core Drivers
                  </div>
                  <ul className="list-disc pl-4 space-y-0.5 text-emerald-700 font-mono">
                    <li>Top Sales: Bags & Writing</li>
                    <li>Restocks cost ~35% of price</li>
                    <li>VIP customers bring 62% traffic</li>
                  </ul>
                </div>

                <div className="text-[10px] text-center text-slate-400 italic">
                  Hover points to view granular hour/day balance transitions.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Money Payment Plan Distribution Dashboard */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs mt-6" id="mobile-money-analytics">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h3 className="font-display font-semibold text-slate-800 flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
              Mobile Money Inflow Channels
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live collection distribution via local Ugandan and East African mobile carriers (MTN vs Airtel Money).
            </p>
          </div>
          <span className="text-[10px] uppercase tracking-wider font-mono px-3 py-1 rounded-lg bg-orange-50 border border-orange-100 text-orange-700 font-bold">
            Carrier Channels Active
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* MTN stats card */}
          <div className="rounded-xl border border-slate-150 bg-amber-50/40 p-4.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest font-mono">
                  MTN Network (Uganda)
                </span>
                <span className="rounded bg-amber-100 text-amber-800 font-bold font-mono text-[9px] px-1.5 py-0.5">
                  M-T-N MoMo
                </span>
              </div>
              <div className="mt-2.5 font-mono">
                <span className="text-2xl font-extrabold text-slate-800">
                  {formatCurrency(mtnInflow)}
                </span>
                <span className="text-xs text-slate-400 block mt-0.5">
                  {mtnCount} transaction{mtnCount !== 1 ? 's' : ''} captured
                </span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-amber-100/60 flex items-center justify-between text-xs text-slate-650">
              <span>Channel weight:</span>
              <span className="font-bold font-mono text-slate-800">{mtnPercent.toFixed(1)}%</span>
            </div>
          </div>

          {/* Airtel stats card */}
          <div className="rounded-xl border border-slate-150 bg-rose-50/30 p-4.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-rose-700 uppercase tracking-widest font-mono">
                  Airtel Money Network
                </span>
                <span className="rounded bg-rose-100 text-rose-800 font-bold font-mono text-[9px] px-1.5 py-0.5">
                  Airtel MoMo
                </span>
              </div>
              <div className="mt-2.5 font-mono">
                <span className="text-2xl font-extrabold text-slate-800">
                  {formatCurrency(airtelInflow)}
                </span>
                <span className="text-xs text-slate-400 block mt-0.5">
                  {airtelCount} transaction{airtelCount !== 1 ? 's' : ''} captured
                </span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-rose-100/40 flex items-center justify-between text-xs text-slate-600">
              <span>Channel weight:</span>
              <span className="font-bold font-mono text-slate-800">{airtelPercent.toFixed(1)}%</span>
            </div>
          </div>

          {/* Distribution ratio */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4.5 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono">
                Distribution Ratio
              </span>
              <div className="mt-3.5 space-y-3">
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${mtnPercent}%` }}
                    className="bg-amber-400 h-full"
                    title={`MTN Mobile Money: ${mtnPercent.toFixed(1)}%`}
                  />
                  <div
                    style={{ width: `${airtelPercent}%` }}
                    className="bg-rose-500 h-full"
                    title={`Airtel Money: ${airtelPercent.toFixed(1)}%`}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    <span>MTN ({mtnPercent.toFixed(0)}%)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    <span>Airtel ({airtelPercent.toFixed(0)}%)</span>
                  </div>
                </div>
              </div>
            </div>
            
            <p className="mt-4 pt-3.5 border-t border-slate-200/50 text-[11px] text-slate-500 leading-relaxed font-sans">
              Total sales volume captured via mobile money channels: <strong className="text-slate-700 font-mono font-bold">{formatCurrency(totalMoMoInflow)}</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Customer Growth & Retention Chart Block (Joined & Left) */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs mt-6" id="customer-acquisition-analytics">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h3 className="font-display font-semibold text-slate-800 flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              Customer Growth & Attrition Ledger
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparative visualization of investor signups (Joined) vs account deactivations/withdrawals (Left) on a daily or cumulative basis.
            </p>
          </div>

          {/* Granularity switch controls */}
          <div className="inline-flex rounded-xl bg-slate-100 p-0.5 border border-slate-200/45 self-start sm:self-center">
            <button
              onClick={() => {
                setCustomerChartType('cumulative');
                setHoveredCustIdx(null);
              }}
              className={`rounded-lg px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider font-sans transition-all cursor-pointer ${
                customerChartType === 'cumulative'
                  ? 'bg-white text-slate-800 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Cumulative Growth
            </button>
            <button
              onClick={() => {
                setCustomerChartType('daily');
                setHoveredCustIdx(null);
              }}
              className={`rounded-lg px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider font-sans transition-all cursor-pointer ${
                customerChartType === 'daily'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Daily Events
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <div className="lg:col-span-3 border border-slate-100 rounded-2xl p-4.5 bg-slate-50/20 relative">
            
            {/* Legend & stats overview */}
            <div className="absolute top-2.5 right-4 flex items-center gap-4 text-[10px] text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>Customers Joined</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                <span>Customers Left (Inactive)</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold text-slate-700">
                <span className="h-0.5 w-3 bg-indigo-600 block" style={{ height: '3px' }} />
                <span>Net Active Pool</span>
              </div>
            </div>

            <div className="w-full overflow-x-auto select-none mt-6">
              <svg
                width="100%"
                height="100%"
                viewBox={`0 0 ${custWidth} ${custHeight}`}
                preserveAspectRatio="xMidYMid meet"
                className="overflow-visible min-w-[500px]"
              >
                <defs>
                  {/* Join Gradient Fill */}
                  <linearGradient id="custJoinGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                  {/* Left Gradient Fill */}
                  <linearGradient id="custLeftGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal grid guide lines */}
                {[0, 0.5, 1].map((ratio, i) => {
                  const y = custPaddingY + ratio * (custHeight - custPaddingY * 2);
                  return (
                    <line
                      key={i}
                      x1={custPaddingX}
                      y1={y}
                      x2={custWidth - custPaddingX}
                      y2={y}
                      stroke="#f1f5f9"
                      strokeDasharray="4,4"
                      strokeWidth="1.1"
                    />
                  );
                })}

                {/* Area Shaded Under green curve */}
                {custJoinAreaD && (
                  <path
                    d={custJoinAreaD}
                    fill="url(#custJoinGradient)"
                    className="transition-all duration-300 pointer-events-none"
                  />
                )}

                {/* Area Shaded Under red curve */}
                {custLeftAreaD && (
                  <path
                    d={custLeftAreaD}
                    fill="url(#custLeftGradient)"
                    className="transition-all duration-300 pointer-events-none"
                  />
                )}

                {/* Join Path Stroke (Green) */}
                {custJoinPathD && (
                  <path
                    d={custJoinPathD}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all duration-300 pointer-events-none"
                  />
                )}

                {/* Left Path Stroke (Rose) */}
                {custLeftPathD && (
                  <path
                    d={custLeftPathD}
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all duration-300 pointer-events-none"
                  />
                )}

                {/* Vertical hover line indicator */}
                {hoveredCustIdx !== null && (
                  <line
                    x1={scaleCustX(hoveredCustIdx)}
                    y1={custPaddingY}
                    x2={scaleCustX(hoveredCustIdx)}
                    y2={custHeight - custPaddingY}
                    stroke="#cbd5e1"
                    strokeWidth="1.5"
                    strokeDasharray="3,3"
                  />
                )}

                {/* Node markers and interactive capture points */}
                {customerGraphData.map((point, index) => {
                  const x = scaleCustX(index);
                  const valJ = customerChartType === 'daily' ? point.joined : point.cumJoined;
                  const valL = customerChartType === 'daily' ? point.left : point.cumLeft;
                  const yJ = scaleCustY(valJ);
                  const yL = scaleCustY(valL);

                  return (
                    <g key={index}>
                      {/* Join Node */}
                      <circle
                        cx={x}
                        cy={yJ}
                        r={hoveredCustIdx === index ? 5 : 3.5}
                        fill="#10b981"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                        className="transition-all duration-150"
                      />

                      {/* Left Node */}
                      <circle
                        cx={x}
                        cy={yL}
                        r={hoveredCustIdx === index ? 5 : 3.5}
                        fill="#f43f5e"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                        className="transition-all duration-150"
                      />

                      {/* Transparent Hover Interceptor Spot */}
                      <rect
                        x={x - 20}
                        y={0}
                        width={40}
                        height={custHeight}
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredCustIdx(index)}
                        onMouseLeave={() => setHoveredCustIdx(null)}
                      />
                    </g>
                  );
                })}

                {/* Axis Date Labels */}
                {customerGraphData.map((point, index) => {
                  const x = scaleCustX(index);
                  const y = custHeight - custPaddingY + 15;
                  return (
                    <text
                      key={index}
                      x={x}
                      y={y}
                      textAnchor="middle"
                      className="text-[9px] font-mono font-semibold text-slate-400"
                    >
                      {point.label}
                    </text>
                  );
                })}

                {/* Left Y-axis Scale Labels */}
                {[0, 0.5, 1].map((ratio, i) => {
                  const val = Math.round(ratio * maxCustVal);
                  const y = custHeight - custPaddingY - ratio * (custHeight - custPaddingY * 2);
                  return (
                    <text
                      key={i}
                      x={custPaddingX - 8}
                      y={y + 3}
                      textAnchor="end"
                      className="text-[9px] font-mono font-bold text-slate-400"
                    >
                      {val}
                    </text>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Sidebar overview dashboard */}
          <div className="lg:col-span-1 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 flex flex-col justify-between">
            {hoveredCustIdx !== null ? (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div>
                  <span className="text-[10px] font-bold text-slate-505 uppercase tracking-widest block font-mono">
                    Timeframe Focus
                  </span>
                  <span className="text-sm font-semibold text-slate-800 block">
                    {customerGraphData[hoveredCustIdx].label}, 2026
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200/60 space-y-2 font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <UserPlus className="h-3 w-3 text-emerald-600" /> 
                      {customerChartType === 'daily' ? 'New Joins:' : 'Total Joins:'}
                    </span>
                    <span className="text-xs font-bold text-emerald-600">
                      {customerChartType === 'daily'
                        ? customerGraphData[hoveredCustIdx].joined
                        : customerGraphData[hoveredCustIdx].cumJoined}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <UserMinus className="h-3 w-3 text-rose-500" />
                      {customerChartType === 'daily' ? 'Lost/Left:' : 'Total Lost:'}
                    </span>
                    <span className="text-xs font-bold text-rose-500">
                      {customerChartType === 'daily'
                        ? customerGraphData[hoveredCustIdx].left
                        : customerGraphData[hoveredCustIdx].cumLeft}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-200/50 pt-2 font-sans font-bold">
                    <span className="text-xs text-slate-705">Net Active Pool:</span>
                    <span className="text-xs text-indigo-600 font-mono">
                      {customerGraphData[hoveredCustIdx].cumNetActive} users
                    </span>
                  </div>
                </div>

                <div className="bg-slate-900 text-white rounded-xl p-3 text-[10px] space-y-1 font-mono">
                  <div className="text-emerald-400 font-extrabold flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> RETENTION RATE
                  </div>
                  <div className="text-white text-base font-black">
                    {((customerGraphData[hoveredCustIdx].cumNetActive / Math.max(customerGraphData[hoveredCustIdx].cumJoined, 1)) * 100).toFixed(0)}%
                  </div>
                  <span className="text-slate-400 text-[8px] leading-tight block">
                    Ratio of remaining active accounts relative to accumulated join volume.
                  </span>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col justify-between h-full space-y-4 py-1">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 uppercase tracking-widest font-mono">
                    <Users className="h-3.5 w-3.5 text-indigo-600" /> Retention Report
                  </div>
                  <h4 className="text-xs font-bold text-slate-700">
                    Growth vs Churn Dynamics
                  </h4>
                  <p className="text-[11px] leading-relaxed text-slate-500">
                    This visualization compiles historical customer joins and withdrawals. A rising green line signifies active client acquisition, whereas a rising red line denotes capital outflows and inactive status.
                  </p>
                </div>

                <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 text-[11px] text-indigo-900 space-y-1.5">
                  <span className="font-bold block text-[10px] uppercase font-mono tracking-wider text-indigo-950">Active Stats summary</span>
                  <div className="flex justify-between font-mono mt-1 text-[10px] text-indigo-900">
                    <span>Total Registered:</span>
                    <strong className="font-black">{customerGraphData[customerGraphData.length - 1].cumJoined}</strong>
                  </div>
                  <div className="flex justify-between font-mono text-[10px] text-indigo-900">
                    <span>Total Deactivated/Left:</span>
                    <strong className="font-black text-rose-600">{customerGraphData[customerGraphData.length - 1].cumLeft}</strong>
                  </div>
                  <div className="flex justify-between border-t border-indigo-100/50 pt-1.5 font-mono text-[10px]">
                    <span className="font-semibold text-slate-850">Current Active Pool:</span>
                    <strong className="font-extrabold text-emerald-600">{customerGraphData[customerGraphData.length - 1].cumNetActive} users</strong>
                  </div>
                </div>

                <div className="text-[9px] text-center text-slate-400 italic font-mono leading-none">
                  Hover chart points to view specific daily ratios.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
