/**
 * Dashboard Home - Multi-tenant CRM with KPI tracking and animations
 * 
 * Features:
 * - KPI Summary Cards: Leads, Deals, Revenue, Pipeline with color-coded borders
 * - Quick Actions: Assign Lead, Start Chat, View Reports
 * - Chart Placeholders: Revenue line chart & Lead distribution pie chart
 * - Section Links: Grid of main features with icons and descriptions
 * - Responsive: Mobile-first design with Tailwind CSS and Framer Motion animations
 * - Role-based: Admin sees all data; Manager/Agent see filtered data
 * 
 * TODO: Backend Integration Points
 * - [ ] Connect KPI metrics to real database (SQL Server)
 * - [ ] Add real-time updates using WebSocket or polling
 * - [ ] Implement Recharts with actual API data
 * - [ ] Add user action tracking (analytics)
 * - [ ] Implement animation triggers on data changes
 * - [ ] Add data refresh button with loading state
 */
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  MessageSquare,
  TrendingUp,
  DollarSign,
  Settings,
  ChevronRight,
  BarChart3,
  PieChart as PieChartIcon,
  AlertCircle,
  CheckCircle2,
  FileText,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { mockLeads, mockDeals, mockAgents, mockRevenue } from '../../data/mockData';
import { formatINR } from '../../utils/formatINR';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export default function DashboardHome() {
  const { companyId } = useAuth();

  const { leadsCount, dealsCount, totalRevenue, pipelineValue } = useMemo(() => {
    const companyDeals = mockDeals.filter((d) => d.companyId === companyId);
    const companyLeads = mockLeads.filter((l) => l.companyId === companyId);
    const closed = companyDeals.filter((d) => d.stage === 'closed_won');
    return {
      leadsCount: companyLeads.length,
      dealsCount: companyDeals.length,
      totalRevenue: closed.reduce((a, d) => a + d.value, 0),
      pipelineValue: companyDeals.reduce((a, d) => a + d.value, 0),
    };
  }, [companyId]);

  const agentsCount = mockAgents.filter((a) => a.companyId === companyId).length;

  // TODO: Fetch actual KPI data from backend
  // const fetchKPIData = async () => {
  //   const response = await fetch(`/api/companies/${companyId}/kpis`);
  //   return response.json();
  // };

  const kpiCards = [
    {
      id: 'leads',
      label: 'Total Leads',
      value: leadsCount,
      borderColor: 'border-cyan-500',
      bgColor: 'bg-cyan-50',
      iconColor: 'text-cyan-600',
      icon: Users,
      trend: '+12%',
      trendUp: true,
      description: 'New & existing prospects',
    },
    {
      id: 'deals',
      label: 'Active Deals',
      value: dealsCount,
      borderColor: 'border-amber-500',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
      icon: TrendingUp,
      trend: '+8%',
      trendUp: true,
      description: 'Qualified deals in pipeline',
    },
    {
      id: 'revenue',
      label: 'Revenue (Closed)',
      value: formatINR(totalRevenue),
      borderColor: 'border-emerald-500',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      icon: DollarSign,
      trend: '+24%',
      trendUp: true,
      isFormatted: true,
      description: 'Won this period',
    },
    {
      id: 'pipeline',
      label: 'Pipeline Value',
      value: formatINR(pipelineValue),
      borderColor: 'border-sky-500',
      bgColor: 'bg-sky-50',
      iconColor: 'text-sky-600',
      icon: BarChart3,
      trend: '+5%',
      trendUp: true,
      isFormatted: true,
      description: 'All deals in progress',
    },
  ];

  const sections = [
    {
      path: '/dashboard/leads',
      icon: Users,
      label: 'Leads',
      summary: 'All prospects from website, chat, demo sites, social media and referrals.',
      stats: `${leadsCount} total leads`,
    },
    {
      path: '/dashboard/conversations',
      icon: MessageSquare,
      label: 'Conversations',
      summary: 'Shared inbox per company. Manual and auto responses.',
      stats: 'Active chats',
    },
    {
      path: '/dashboard/deals',
      icon: TrendingUp,
      label: 'Deals',
      summary: 'Sales pipeline: qualified, proposal, negotiation to closed.',
      stats: `${dealsCount} deals | ${formatINR(pipelineValue)} pipeline`,
    },
    {
      path: '/dashboard/revenue',
      icon: DollarSign,
      label: 'Revenue',
      summary: 'Revenue by day, month, year. Dynamic company-wise breakdown.',
      stats: `${formatINR(totalRevenue)} closed | View by Day/Month/Year`,
    },
    {
      path: '/dashboard/settings',
      icon: Settings,
      label: 'Settings',
      summary: 'Profile, notifications, lead ingestion and integrations.',
      stats: `${agentsCount} team members`,
    },
  ];

  const navigate = useNavigate();

  const quickActions = [
    {
      id: 'assign',
      label: 'Assign Lead',
      icon: CheckCircle2,
      variant: 'primary',
      // Opens leads list and sets a query param to trigger assign UI
      onClick: () => {
        navigate('/dashboard/leads?assign=true');
        toast.success('Opening assign lead dialog...');
      },
    },
    {
      id: 'chat',
      label: 'Start Chat',
      icon: MessageSquare,
      variant: 'secondary',
      // Navigate to conversations
      onClick: () => {
        navigate('/dashboard/conversations');
      },
    },
    {
      id: 'reports',
      label: 'View Reports',
      icon: FileText,
      variant: 'secondary',
      // Navigate to revenue/analytics page (reports placeholder)
      onClick: () => {
        navigate('/dashboard/reports');
      },
    },
  ];

  const handleRefresh = async () => {
    let toastId: string | number | undefined;
    try {
      toastId = toast.loading('Refreshing dashboard data...');
      // Replace with real refresh API call
      await new Promise((r) => setTimeout(r, 1000));
      toast.success('Dashboard updated!');
    } catch (err: any) {
      toast.error(`Refresh failed: ${err?.message ?? 'Unknown error'}`);
    } finally {
      if (toastId) toast.dismiss(toastId);
    }
  };

  // Role-based filtering: Admin sees all; Manager/Agent may see filtered data per component
  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Dashboard
        </h1>
        <p className="mt-2 text-base text-slate-600">
          Welcome back! Here's your sales overview at a glance.
        </p>
      </div>

      {/* KPI Summary Cards - Mobile First, Responsive Grid */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Key Performance Indicators</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpiCards.map((card, idx) => {
            const path =
              card.id === 'leads'
                ? '/dashboard/leads'
                : card.id === 'deals'
                ? '/dashboard/deals'
                : card.id === 'revenue'
                ? '/dashboard/revenue'
                : '/dashboard/deals';

            return (
              <Link key={card.id} to={path} className="group block">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.1, type: 'spring', stiffness: 400, damping: 30 }}
                  whileHover={{ scale: 1.02 }}
                  role="button"
                  aria-label={`Open ${card.label}`}
                  className={`rounded-xl border-l-4 ${card.borderColor} border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md cursor-pointer pointer-events-auto z-10`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-600">{card.label}</p>
                      <h3 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                        {card.value}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">{card.description}</p>
                    </div>
                    <div className={`rounded-lg ${card.bgColor} p-3`}>
                      <card.icon className={`h-6 w-6 ${card.iconColor}`} />
                    </div>
                  </div>

                  {/* Trend indicator */}
                  {card.trend && (
                    <div className="mt-4 flex items-center gap-1">
                      {card.trendUp ? (
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span
                        className={`text-xs font-semibold ${
                          card.trendUp ? 'text-emerald-600' : 'text-red-600'
                        }`}
                      >
                        {card.trend} from last period
                      </span>
                    </div>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Charts Section - Recharts Placeholders */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        className="space-y-4"
      >
        <h2 className="text-lg font-semibold text-slate-900">Analytics & Insights</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Revenue Line Chart Placeholder */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Revenue Trend
                </h3>
                <p className="mt-1 text-sm text-slate-600">Daily revenue (last 30 days)</p>
              </div>
              <div className="rounded-lg bg-cyan-100 p-3">
                <BarChart3 className="h-5 w-5 text-cyan-600" />
              </div>
            </div>

            {/* TODO: Replace with Recharts LineChart component
                 Backend Integration:
                 - Fetch revenue data: supabase.from('deals').select('*').eq('stage', 'closed_won')
                 - Aggregate by date for time-series visualization
                 - Implement real-time updates with Supabase Realtime
            */}
            <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-3">
              {mockRevenue[companyId]?.daily ? (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={mockRevenue[companyId].daily}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => formatINR(value)} />
                    <Line type="monotone" dataKey="value" stroke="#0EA5A4" strokeWidth={2} dot={{ r: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center">
                  <p className="text-sm text-slate-500">No revenue data available</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Lead Distribution Pie Chart Placeholder */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Leads by Priority
                </h3>
                <p className="mt-1 text-sm text-slate-600">Distribution across levels</p>
              </div>
              <div className="rounded-lg bg-amber-100 p-3">
                <PieChartIcon className="h-5 w-5 text-amber-600" />
              </div>
            </div>

            {/* TODO: Replace with Recharts PieChart component
                 Backend Integration:
                 - Fetch lead counts by priority: supabase.from('leads').select('priority, count')
                 - Use color mapping with status colors (Red, Amber, Sky, Emerald, Slate)
            */}
            <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-3">
              {/* compute priority distribution */}
              {(() => {
                const leads = mockLeads.filter((l) => l.companyId === companyId);
                const counts: Record<string, number> = {};
                leads.forEach((l) => {
                  const p = l.priority ?? 'unknown';
                  counts[p] = (counts[p] || 0) + 1;
                });
                const data = Object.entries(counts).map(([name, value]) => ({ name, value }));
                const COLORS = ['#FB923C', '#F97316', '#0EA5A4', '#60A5FA', '#A3E635'];
                return data.length ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label />
                      {data.map((_, idx) => (
                        <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                      ))}
                      <Legend verticalAlign="bottom" height={36} />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-48 flex items-center justify-center">
                    <p className="text-sm text-slate-500">No lead data available</p>
                  </div>
                );
              })()}
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Quick Actions */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="space-y-4"
      >
        <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
        <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            {quickActions.map(({ id, label, icon: Icon, variant, onClick }) => (
              <motion.button
                key={id}
                onClick={onClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                  variant === 'primary'
                    ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-white hover:from-cyan-700 hover:to-cyan-600 shadow-sm hover:shadow-md'
                    : 'border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 hover:border-slate-400 shadow-sm'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </motion.button>
            ))}
          </div>
          <div className="mt-4 flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <Zap className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">
              <strong>Pro Tip:</strong> Use these shortcuts to quickly manage your leads, send messages, and view detailed reports.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Section Links Grid - Mobile First, Responsive */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Main Features</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {sections.map(({ path, icon: Icon, label, summary, stats }, idx) => (
            <motion.div
              key={path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 + idx * 0.08, type: 'spring', stiffness: 400, damping: 30 }}
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
            >
              <Link
                to={path}
                className="group flex flex-col h-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-cyan-300 hover:shadow-lg sm:p-5"
              >
                <div className="rounded-lg bg-gradient-to-br from-cyan-100 to-cyan-50 p-2.5 w-fit">
                  <Icon className="h-5 w-5 text-cyan-600 group-hover:scale-110 transition-transform" />
                </div>

                <h3 className="mt-3 font-semibold text-slate-900 group-hover:text-cyan-600 transition-colors">
                  {label}
                </h3>

                <p className="mt-1.5 text-xs text-slate-600 line-clamp-2">{summary}</p>

                <p className="mt-auto pt-3 text-xs font-medium text-cyan-600 flex items-center gap-1">
                  {stats}
                  <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Refresh Data Button */}
      <motion.button
        onClick={handleRefresh}
        className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <RefreshCw className="h-4 w-4" />
        Refresh Data
      </motion.button>

      {/* Footer Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="rounded-lg border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4 shadow-sm"
      >
        <div className="flex gap-3">
          <Zap className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-900 mb-1">Tip: Stay Updated</p>
            <p className="text-sm text-amber-800">
              Data updates automatically. Check back regularly for fresh insights on leads, deals, and revenue. 
              <a href="#" className="ml-1 underline hover:text-amber-700 transition-colors">Learn more</a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
