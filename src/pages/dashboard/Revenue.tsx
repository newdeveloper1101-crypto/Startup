/**
 * Revenue Dashboard - Per company. Day/Month/Year views, agent filter, company breakdown
 * Features:
 * - Framer Motion animations for all metric cards and charts
 * - Toggle between day/month/year views with trend calculations
 * - Trend indicators with animated up/down arrows
 * - KPI cards: Total Revenue, Closed Deals, Companies count with entrance animations
 * - Revenue by company with profit visualization and hover effects
 * - Agent-wise breakdown: revenue, deal count, avg deal size
 * - Chart placeholders: Recharts timeline and area charts with staggered animations
 * - Responsive grid layout with Tailwind CSS and smooth transitions
 *
 * Multi-tenant: company_id filtering. Indian formatting (₹, DD/MM/YYYY).
 *
 * TODO: Backend Integration
 * - Replace mockDeals with Supabase query for closed-won deals
 * - Subscribe to real-time deal updates for live metrics
 * - Implement Recharts with real backend data
 * - Add profit margin calculation from deal metadata
 * - Cache revenue data for performance
 */
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { mockDeals, mockAgents, mockRevenue } from '../../data/mockData';
import { TrendingUp, ArrowUp, ArrowDown, DollarSign, Building2, BarChart3, LineChart as LineChartIcon } from 'lucide-react';
import { formatINR } from '../../utils/formatINR';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
} from 'recharts';

type Period = 'day' | 'month' | 'year';

export default function Revenue() {
  const { companyId } = useAuth();
  const [period, setPeriod] = useState<Period>('month');
  const [agentFilter, setAgentFilter] = useState('all');

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const yearStart = new Date(now.getFullYear(), 0, 1);

  const filterByPeriod = (d: (typeof mockDeals)[0]) => {
    const closed = d.closedAt ? new Date(d.closedAt) : null;
    if (!closed || d.stage !== 'closed_won') return false;
    if (period === 'day') return closed >= today && closed < new Date(today.getTime() + 86400000);
    if (period === 'month') return closed >= monthStart && closed <= now;
    if (period === 'year') return closed >= yearStart && closed <= now;
    return true;
  };

  const filtered = useMemo(() => {
    return mockDeals.filter((d) => {
      if (d.companyId !== companyId) return false;
      if (agentFilter !== 'all' && d.agentId !== agentFilter) return false;
      return true;
    });
  }, [companyId, agentFilter]);

  const closedWon = filtered.filter(filterByPeriod);
  const totalRevenue = closedWon.reduce((a, d) => a + d.value, 0);

  // Get previous period for trend
  let prevStart, prevEnd;
  if (period === 'day') {
    prevStart = new Date(today.getTime() - 86400000);
    prevEnd = today;
  } else if (period === 'month') {
    const prevMonth = new Date(monthStart);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    prevStart = prevMonth;
    prevEnd = monthStart;
  } else {
    const prevYear = new Date(yearStart);
    prevYear.setFullYear(prevYear.getFullYear() - 1);
    prevStart = prevYear;
    prevEnd = yearStart;
  }

  const prevRevenue = mockDeals
    .filter((d) => {
      if (d.companyId !== companyId) return false;
      if (d.stage !== 'closed_won' || !d.closedAt) return false;
      const closed = new Date(d.closedAt);
      return closed >= prevStart && closed < prevEnd;
    })
    .reduce((a, d) => a + d.value, 0);

  const trendPercent = prevRevenue > 0 ? Math.round(((totalRevenue - prevRevenue) / prevRevenue) * 100) : 0;
  const isPositiveTrend = trendPercent >= 0;

  // Dynamic company-wise breakdown with profit calculation
  // TODO: Replace hardcoded 30% profit margin with actual data from backend deals table
  const companyList = useMemo(() => {
    const byCompany = closedWon.reduce<Record<string, { name: string; revenue: number; profit: number; dealCount: number }>>((acc, d) => {
      const company = d.company || d.leadName;
      // TODO: Fetch actual profit margin from backend (currently estimated at 30%)
      const profit = d.value * 0.3; // Placeholder: 30% profit margin
      if (!acc[company]) acc[company] = { name: company, revenue: 0, profit: 0, dealCount: 0 };
      acc[company].revenue += d.value;
      acc[company].profit += profit;
      acc[company].dealCount += 1;
      return acc;
    }, {});
    return Object.values(byCompany).sort((a, b) => b.revenue - a.revenue);
  }, [closedWon]);

  // Agent-wise breakdown
  const agentList = useMemo(() => {
    const byAgent = closedWon.reduce<Record<string, { name: string; value: number; count: number }>>(
      (acc, d) => {
        const agentId = d.agentId || 'unassigned';
        const agent = mockAgents.find((a) => a.id === agentId);
        const agentName = agent?.name ?? 'Unassigned';
        if (!acc[agentId]) acc[agentId] = { name: agentName, value: 0, count: 0 };
        acc[agentId].value += d.value;
        acc[agentId].count += 1;
        return acc;
      },
      {}
    );
    return Object.values(byAgent).sort((a, b) => b.value - a.value);
  }, [closedWon]);

  const agents = mockAgents.filter((a) => a.companyId === companyId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mb-8 rounded-xl border border-slate-200/50 bg-gradient-to-r from-slate-50 to-cyan-50/30 p-6"
      >
        <h1 className="text-3xl font-bold text-slate-900">Revenue Dashboard</h1>
        <p className="mt-2 text-slate-600 text-sm">
          Track revenue by day, month, or year. Analyze company and agent performance. Dynamic company-wise breakdown.
        </p>
      </motion.div>

      {/* Period Toggle + Agent Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="flex flex-col sm:flex-row gap-4 items-start sm:items-end"
      >
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">View by:</label>
          <motion.div
            whileHover={{ boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
            className="flex rounded-lg border border-slate-200/50 bg-white p-1.5 shadow-sm"
          >
            {(['day', 'month', 'year'] as const).map((p) => (
              <motion.button
                key={p}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPeriod(p)}
                className={`rounded-md px-4 py-2 text-sm font-semibold capitalize transition-all ${
                  period === p
                    ? 'bg-gradient-to-r from-cyan-600 to-cyan-700 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {p}
              </motion.button>
            ))}
          </motion.div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Filter Agent:</label>
          <select
            value={agentFilter}
            onChange={(e) => setAgentFilter(e.target.value)}
            className="rounded-lg border border-slate-300/50 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
          >
            <option value="all">All agents</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Main KPI Cards with staggered animations */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
        className="grid gap-6 sm:grid-cols-3"
      >
        {/* Total Revenue */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
          whileHover={{ scale: 1.02, boxShadow: '0 20px 25px rgba(0, 0, 0, 0.1)' }}
          className="rounded-xl border border-emerald-200/50 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-md transition-all"
        >
          <div className="flex items-start justify-between mb-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="rounded-lg bg-emerald-100 p-3"
            >
              <DollarSign className="h-6 w-6 text-emerald-600" />
            </motion.div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30, delay: 0.1 }}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${
                isPositiveTrend ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
              }`}
            >
              {isPositiveTrend ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
              {Math.abs(trendPercent)}%
            </motion.div>
          </div>
          <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
            Revenue ({period === 'day' ? 'Today' : period === 'month' ? 'This Month' : 'This Year'})
          </p>
          <p className="mt-3 text-4xl font-bold text-slate-900">{formatINR(totalRevenue)}</p>
          <p className="mt-2 text-xs text-slate-600">
            Previous period: {formatINR(prevRevenue)}
          </p>
        </motion.div>

        {/* Closed Deals */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
          whileHover={{ scale: 1.02, boxShadow: '0 20px 25px rgba(0, 0, 0, 0.1)' }}
          className="rounded-xl border border-cyan-200/50 bg-gradient-to-br from-cyan-50 to-white p-6 shadow-md transition-all"
        >
          <div className="flex items-start justify-between mb-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="rounded-lg bg-cyan-100 p-3"
            >
              <TrendingUp className="h-6 w-6 text-cyan-600" />
            </motion.div>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30, delay: 0.1 }}
              className="inline-block bg-cyan-100 px-3 py-1.5 text-xs font-bold text-cyan-700 rounded-full"
            >
              {closedWon.length}
            </motion.span>
          </div>
          <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Closed Deals</p>
          <p className="mt-3 text-4xl font-bold text-slate-900">{closedWon.length}</p>
          <p className="mt-2 text-xs text-slate-600">
            Avg: {closedWon.length > 0 ? formatINR(totalRevenue / closedWon.length) : '-'}
          </p>
        </motion.div>

        {/* Companies */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
          whileHover={{ scale: 1.02, boxShadow: '0 20px 25px rgba(0, 0, 0, 0.1)' }}
          className="rounded-xl border border-amber-200/50 bg-gradient-to-br from-amber-50 to-white p-6 shadow-md transition-all"
        >
          <div className="flex items-start justify-between mb-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="rounded-lg bg-amber-100 p-3"
            >
              <Building2 className="h-6 w-6 text-amber-600" />
            </motion.div>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30, delay: 0.1 }}
              className="inline-block bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-700 rounded-full"
            >
              {companyList.length}
            </motion.span>
          </div>
          <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Companies</p>
          <p className="mt-3 text-4xl font-bold text-slate-900">{companyList.length}</p>
          <p className="mt-2 text-xs text-slate-600">
            Contributing to revenue with closed deals
          </p>
        </motion.div>
      </motion.div>

      {/* Revenue by Company - Table view with visualization */}
      <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Building2 className="h-5 w-5 text-amber-600" />
          Revenue by Company
        </h2>
        <p className="mt-1 text-sm text-slate-500">Track revenue and profit per customer company.</p>

        {companyList.length === 0 ? (
          <div className="mt-6 rounded-lg bg-slate-50 px-6 py-8 text-center text-slate-500">
            No closed deals for selected period.
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200">
                <tr className="text-left text-xs font-semibold text-slate-600 uppercase">
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3 text-right">Revenue</th>
                  <th className="px-4 py-3 text-right">Profit</th>
                  <th className="px-4 py-3 text-right">Deals</th>
                  <th className="px-4 py-3 text-center">Visualization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {companyList.map(({ name, revenue, profit, dealCount }) => {
                  const revenuePercent = totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0;
                  return (
                    <tr key={name} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-4 font-medium text-slate-900">{name}</td>
                      <td className="px-4 py-4 text-right font-semibold text-slate-900">{formatINR(revenue)}</td>
                      <td className="px-4 py-4 text-right font-semibold text-emerald-700">{formatINR(profit)}</td>
                      <td className="px-4 py-4 text-right text-slate-700">{dealCount}</td>
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-cyan-500 to-cyan-600 transition-all"
                              style={{ width: `${revenuePercent}%`, minWidth: '4px' }}
                              title={`${revenuePercent.toFixed(1)}% of total revenue`}
                            />
                          </div>
                          <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all"
                              style={{ width: `${(profit / revenue) * 100}%`, minWidth: '2px' }}
                              title={`${((profit / revenue) * 100).toFixed(1)}% profit margin`}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Agent-wise breakdown */}
      <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <TrendingUp className="h-5 w-5 text-cyan-600" />
          Revenue by Agent
        </h2>
        <p className="mt-1 text-sm text-slate-500">Individual agent performance.</p>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Agent</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">Revenue</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">Deals</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">Avg Deal Size</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {agentList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                    No closed deals yet.
                  </td>
                </tr>
              ) : (
                agentList.map(({ name, value, count }) => (
                  <tr key={name} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{name}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">{formatINR(value)}</td>
                    <td className="px-4 py-3 text-right text-slate-700">{count}</td>
                    <td className="px-4 py-3 text-right text-slate-700">{formatINR(value / count)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Timeline and Area Charts */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2">
        {/* Timeline Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <LineChartIcon className="h-5 w-5 text-cyan-600" />
              Revenue Timeline
            </h3>
            <span className="text-xs font-medium text-slate-500 uppercase">
              {period === 'day' ? 'Hourly' : period === 'month' ? 'Daily' : 'Monthly'}
            </span>
          </div>
          <p className="text-sm text-slate-500 mb-4">
            {period === 'day'
              ? 'Hourly revenue breakdown for today'
              : period === 'month'
                ? 'Daily revenue trend this month'
                : 'Monthly revenue progression this year'}
          </p>
          <div className="h-64 rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <div className="w-full">
                  {companyId && mockRevenue[companyId as keyof typeof mockRevenue] ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart
                        data={
                          period === 'day'
                            ? mockRevenue[companyId as keyof typeof mockRevenue]!.daily
                            : period === 'month'
                            ? mockRevenue[companyId as keyof typeof mockRevenue]!.monthly
                            : mockRevenue[companyId as keyof typeof mockRevenue]!.yearly
                        }
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey={period === 'month' ? 'month' : period === 'year' ? 'year' : 'date'} />
                        <YAxis />
                        <Tooltip formatter={(v: number) => formatINR(v)} />
                        <Line type="monotone" dataKey="value" stroke="#06B6D4" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center">
                      <LineChartIcon className="mx-auto h-12 w-12 text-slate-300 mb-2" />
                      <p className="text-sm text-slate-400">No revenue timeline data</p>
                    </div>
                  )}
                </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            TODO: Integrate Recharts LineChart for time-series revenue data from backend
          </p>
        </div>

        {/* Area Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <BarChart3 className="h-5 w-5 text-emerald-600" />
              Revenue Distribution
            </h3>
            <span className="text-xs font-medium text-slate-500 uppercase">
              Cumulative
            </span>
          </div>
          <p className="text-sm text-slate-500 mb-4">
            Cumulative revenue and profit trend over {period === 'day' ? 'today' : period === 'month' ? 'this month' : 'this year'}
          </p>
          <div className="h-64 rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
            <div className="w-full">
              {companyId && mockRevenue[companyId as keyof typeof mockRevenue] ? (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart
                    data={
                      period === 'day'
                        ? mockRevenue[companyId as keyof typeof mockRevenue]!.daily
                        : period === 'month'
                        ? mockRevenue[companyId as keyof typeof mockRevenue]!.monthly
                        : mockRevenue[companyId as keyof typeof mockRevenue]!.yearly
                    }
                  >
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#34D399" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#34D399" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={period === 'month' ? 'month' : period === 'year' ? 'year' : 'date'} />
                    <YAxis />
                    <Tooltip formatter={(v: number) => formatINR(v)} />
                    <Area type="monotone" dataKey="value" stroke="#10B981" fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center">
                  <BarChart3 className="mx-auto h-12 w-12 text-slate-300 mb-2" />
                  <p className="text-sm text-slate-400">No revenue distribution data</p>
                </div>
              )}
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            TODO: Integrate Recharts AreaChart showing cumulative revenue and profit
          </p>
        </div>
      </div>

      {/* Helper text for chart data */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="rounded-lg border border-amber-200 bg-amber-50 p-4"
      >
        <p className="text-sm text-amber-900">
          <span className="font-semibold">Chart Data Source:</span> Charts use {period === 'day' ? 'hourly' : period === 'month' ? 'daily' : 'monthly'} breakdowns from <code className="bg-amber-100 px-2 py-1 rounded text-xs">mockRevenue.{companyId}</code> in backend integration.
        </p>
      </motion.div>
    </motion.div>
  );
}
