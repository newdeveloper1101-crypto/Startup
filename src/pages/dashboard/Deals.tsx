/**
 * Deals Page - Enhanced Kanban board for sales pipeline
 * Stages: Qualified → Proposal → Negotiation → Closed Won → Closed Lost
 * Features:
 * - Kanban columns with Framer Motion animations
 * - Color-coded cards and stage badges from color system
 * - Metric cards with entrance animations
 * - Deal cards with hover interactions and animations
 * - Multi-tenant: company_id filtering
 * - Indian formatting (₹, DD/MM/YYYY)
 *
 * SUPABASE INTEGRATION NOTES:
 * - Fetch deals: supabase.from('deals').select('*').eq('company_id', companyId)
 * - Update deal stage: supabase.from('deals').update({ stage }).eq('id', dealId)
 * - Real-time updates: Enable `.on('*', callback)` for live pipeline sync across agents
 * - Drag-drop handler: Implement optimistic UI update + backend sync
 * - Archive closed deals: Consider separate view/archive for closed deals > 30 days
 * - Performance: Implement query caching and pagination for large pipelines
 */
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowUp, ArrowDown, GripVertical, Eye, EyeOff } from 'lucide-react';
import SectionSummary from '../../components/dashboard/SectionSummary';
import { useAuth } from '../../context/AuthContext';
import { mockDeals, mockAgents } from '../../data/mockData';
import { formatINR, formatDateIN } from '../../utils/formatINR';

type DealStage = 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';

// Enhanced color scheme for kanban columns
const STAGES: { stage: DealStage; label: string; bgColor: string; borderColor: string; headerColor: string; badgeColor: string }[] = [
  { 
    stage: 'qualified', 
    label: 'Qualified', 
    bgColor: 'bg-blue-50', 
    borderColor: 'border-blue-200',
    headerColor: 'bg-blue-100',
    badgeColor: 'bg-blue-200 text-blue-800'
  },
  { 
    stage: 'proposal', 
    label: 'Proposal', 
    bgColor: 'bg-purple-50', 
    borderColor: 'border-purple-200',
    headerColor: 'bg-purple-100',
    badgeColor: 'bg-purple-200 text-purple-800'
  },
  { 
    stage: 'negotiation', 
    label: 'Negotiation', 
    bgColor: 'bg-amber-50', 
    borderColor: 'border-amber-200',
    headerColor: 'bg-amber-100',
    badgeColor: 'bg-amber-200 text-amber-800'
  },
  { 
    stage: 'closed_won', 
    label: 'Closed Won', 
    bgColor: 'bg-emerald-50', 
    borderColor: 'border-emerald-200',
    headerColor: 'bg-emerald-100',
    badgeColor: 'bg-emerald-200 text-emerald-800'
  },
  { 
    stage: 'closed_lost', 
    label: 'Closed Lost', 
    bgColor: 'bg-red-50', 
    borderColor: 'border-red-200',
    headerColor: 'bg-red-100',
    badgeColor: 'bg-red-200 text-red-800'
  },
];

export default function Deals() {
  const { companyId } = useAuth();
  const [agentFilter, setAgentFilter] = useState<string>('all');
  const [collapsedStages, setCollapsedStages] = useState<Set<DealStage>>(new Set());
  const [hoveredDeal, setHoveredDeal] = useState<string | null>(null);

  // Filter deals by company (multi-tenant) and by agent
  const filtered = useMemo(() => {
    return mockDeals.filter((d) => {
      if (d.companyId !== companyId) return false;
      if (agentFilter !== 'all' && d.agentId !== agentFilter) return false;
      return true;
    });
  }, [companyId, agentFilter]);

  const agents = mockAgents.filter((a) => a.companyId === companyId);
  
  // Calculate stage-wise metrics for all deals
  const stageMetrics = STAGES.map((s) => {
    const stageDeals = filtered.filter((d) => d.stage === s.stage);
    return {
      ...s,
      count: stageDeals.length,
      value: stageDeals.reduce((a, d) => a + d.value, 0),
      deals: stageDeals,
    };
  });

  // Overall metrics
  const totalValue = filtered.reduce((a, d) => a + d.value, 0);
  const activeDealCount = filtered.filter((d) => d.stage !== 'closed_won' && d.stage !== 'closed_lost').length;
  const wonValue = filtered.filter((d) => d.stage === 'closed_won').reduce((a, d) => a + d.value, 0);
  const lostValue = filtered.filter((d) => d.stage === 'closed_lost').reduce((a, d) => a + d.value, 0);
  const avgDealSize = filtered.length > 0 ? totalValue / filtered.length : 0;
  const conversionRate = filtered.length > 0 ? ((wonValue / totalValue) * 100).toFixed(1) : '0';
  
  // Mock previous period for trend comparison
  const prevWonValue = 4000000;

  // Toggle stage collapse
  const toggleStageCollapse = (stage: DealStage) => {
    const newCollapsed = new Set(collapsedStages);
    if (newCollapsed.has(stage)) {
      newCollapsed.delete(stage);
    } else {
      newCollapsed.add(stage);
    }
    setCollapsedStages(newCollapsed);
  };

  // Get agent name from ID
  const getAgentName = (agentId?: string) => {
    return mockAgents.find((a) => a.id === agentId)?.name ?? 'Unassigned';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <SectionSummary
          title="Deals Pipeline"
          description="Visualize your sales pipeline across stages. Drag deals to move them (Supabase integration ready)."
          stats={[
            { label: 'Total deals', value: String(filtered.length) },
            { label: 'Pipeline value', value: formatINR(totalValue) },
            { label: 'Conversion rate', value: `${conversionRate}%` },
          ]}
        />
      </motion.div>

      {/* Agent Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6 rounded-lg border border-slate-200/50 bg-gradient-to-r from-white to-slate-50/30 p-5"
      >
        <div className="flex-1">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Filter by Agent</label>
          <select
            value={agentFilter}
            onChange={(e) => setAgentFilter(e.target.value)}
            className="w-full rounded-lg border border-slate-300/50 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
          >
            <option value="all">All Agents</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Key Metrics Cards with Animations */}
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
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {/* Total Deals */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
          whileHover={{ scale: 1.02, boxShadow: '0 20px 25px rgba(0, 0, 0, 0.1)' }}
          className="rounded-lg border border-slate-200/50 bg-gradient-to-br from-white to-slate-50/50 p-5 shadow-sm transition-all"
        >
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Deals</p>
          <p className="text-4xl font-bold text-slate-900">{filtered.length}</p>
          <p className="mt-2 text-xs text-slate-500">In pipeline</p>
        </motion.div>

        {/* Pipeline Value */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
          whileHover={{ scale: 1.02, boxShadow: '0 20px 25px rgba(0, 0, 0, 0.1)' }}
          className="rounded-lg border border-slate-200/50 bg-gradient-to-br from-white to-slate-50/50 p-5 shadow-sm transition-all"
        >
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Pipeline Value</p>
          <p className="text-3xl font-bold text-slate-900">{formatINR(totalValue)}</p>
          <p className="mt-2 text-xs text-slate-500">Total value</p>
        </motion.div>

        {/* Average Deal Size */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
          whileHover={{ scale: 1.02, boxShadow: '0 20px 25px rgba(0, 0, 0, 0.1)' }}
          className="rounded-lg border border-slate-200/50 bg-gradient-to-br from-white to-slate-50/50 p-5 shadow-sm transition-all"
        >
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Avg Deal Size</p>
          <p className="text-3xl font-bold text-slate-900">{formatINR(avgDealSize)}</p>
          <p className="mt-2 text-xs text-slate-500">{filtered.length || 0} deals total</p>
        </motion.div>

        {/* Won This Period */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
          whileHover={{ scale: 1.02, boxShadow: '0 20px 25px rgba(0, 0, 0, 0.1)' }}
          className={`rounded-lg border p-5 shadow-sm transition-all ${
            wonValue > prevWonValue
              ? 'border-emerald-200/50 bg-gradient-to-br from-emerald-50 to-emerald-100/30'
              : 'border-red-200/50 bg-gradient-to-br from-red-50 to-red-100/30'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Won This Period</p>
              <p className="text-3xl font-bold text-slate-900">{formatINR(wonValue)}</p>
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className={`p-2.5 rounded-full ${wonValue > prevWonValue ? 'bg-emerald-100' : 'bg-red-100'}`}
            >
              {wonValue > prevWonValue ? (
                <ArrowUp className="h-5 w-5 text-emerald-600" />
              ) : (
                <ArrowDown className="h-5 w-5 text-red-600" />
              )}
            </motion.div>
          </div>
          <p className="mt-2 text-xs text-slate-600 font-medium">
            {wonValue > prevWonValue ? '+' : '-'}{formatINR(Math.abs(wonValue - prevWonValue))} vs previous
          </p>
        </motion.div>

        {/* Active Deals */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
          whileHover={{ scale: 1.02, boxShadow: '0 20px 25px rgba(0, 0, 0, 0.1)' }}
          className="rounded-lg border border-slate-200/50 bg-gradient-to-br from-white to-slate-50/50 p-5 shadow-sm transition-all"
        >
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Active Deals</p>
          <p className="text-4xl font-bold text-slate-900">{activeDealCount}</p>
          <p className="mt-2 text-xs text-slate-500">In progress</p>
        </motion.div>

        {/* Closed Won */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
          whileHover={{ scale: 1.02, boxShadow: '0 20px 25px rgba(0, 0, 0, 0.1)' }}
          className="rounded-lg border border-emerald-200/50 bg-gradient-to-br from-emerald-50 to-emerald-100/30 p-5 shadow-sm transition-all"
        >
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Closed Won</p>
          <p className="text-3xl font-bold text-emerald-700">{filtered.filter(d => d.stage === 'closed_won').length}</p>
          <p className="mt-2 text-xs text-slate-600 font-medium">{formatINR(wonValue)}</p>
        </motion.div>

        {/* Closed Lost */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
          whileHover={{ scale: 1.02, boxShadow: '0 20px 25px rgba(0, 0, 0, 0.1)' }}
          className="rounded-lg border border-red-200/50 bg-gradient-to-br from-red-50 to-red-100/30 p-5 shadow-sm transition-all"
        >
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Closed Lost</p>
          <p className="text-3xl font-bold text-red-700">{filtered.filter(d => d.stage === 'closed_lost').length}</p>
          <p className="mt-2 text-xs text-slate-600 font-medium">{formatINR(lostValue)}</p>
        </motion.div>
      </motion.div>

      {/* Kanban Board - Horizontal Columns with Animations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="rounded-xl border border-slate-200/50 bg-gradient-to-b from-white to-slate-50/30 p-6 shadow-md"
      >
        {/* Kanban Header */}
        <motion.div
          className="mb-6 flex items-center justify-between"
        >
          <h2 className="text-2xl font-bold text-slate-900">Pipeline Board</h2>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm font-semibold text-slate-600 bg-slate-100 px-3.5 py-2 rounded-full"
          >
            {filtered.length} deal{filtered.length !== 1 ? 's' : ''} • {formatINR(totalValue)}
          </motion.div>
        </motion.div>

        {/* Responsive Kanban Container with staggered column animations */}
        <div className="overflow-x-auto pb-4">
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
            className="inline-flex gap-4 min-w-max"
          >
            {stageMetrics.map(({ stage, label, bgColor, borderColor, headerColor, badgeColor, count, value, deals }) => (
              <motion.div
                key={stage}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                whileHover={{ y: -4 }}
                className={`flex flex-col w-80 rounded-lg border-2 ${borderColor} ${bgColor} overflow-hidden shadow-md hover:shadow-xl transition-all`}
              >
                {/* Column Header */}
                <motion.div
                  className={`${headerColor} p-4 flex items-center justify-between cursor-pointer group hover:brightness-95 transition-all`}
                  onClick={() => toggleStageCollapse(stage)}
                  whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                >
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 text-sm">{label}</h3>
                    <p className="text-xs text-slate-600 mt-1.5 font-medium">
                      {count} • {formatINR(value)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      className={`inline-flex items-center justify-center h-7 w-7 rounded-full font-bold text-xs text-slate-900 ${badgeColor}`}
                    >
                      {count}
                    </motion.span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-1 rounded hover:bg-white/30 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStageCollapse(stage);
                      }}
                    >
                      {collapsedStages.has(stage) ? (
                        <Eye className="h-4 w-4 text-slate-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-slate-600" />
                      )}
                    </motion.button>
                  </div>
                </motion.div>

                {/* Column Content */}
                {!collapsedStages.has(stage) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 p-4 space-y-3 max-h-96 overflow-y-auto"
                  >
                    {deals.length > 0 ? (
                      <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={{
                          hidden: { opacity: 0 },
                          visible: {
                            opacity: 1,
                            transition: {
                              staggerChildren: 0.05,
                            },
                          },
                        }}
                        className="space-y-3"
                      >
                        {deals.map((deal) => (
                          <motion.div
                            key={deal.id}
                            variants={{
                              hidden: { opacity: 0, y: 10 },
                              visible: { opacity: 1, y: 0 },
                            }}
                            onMouseEnter={() => setHoveredDeal(deal.id)}
                            onMouseLeave={() => setHoveredDeal(null)}
                            whileHover={{ scale: 1.02, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                            className="rounded-lg bg-white p-3.5 shadow-sm border border-white/60 hover:border-slate-300 cursor-move group transition-all"
                          >
                            {/* Deal Card Header */}
                            <div className="flex items-start gap-2 mb-2">
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: hoveredDeal === deal.id ? 1 : 0 }}
                                transition={{ duration: 0.2 }}
                                className="mt-0.5"
                              >
                                <GripVertical className="h-4 w-4 text-slate-400" />
                              </motion.div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-slate-900 text-sm truncate">{deal.leadName}</p>
                                <p className="text-xs text-slate-500 truncate">{deal.company}</p>
                              </div>
                            </div>

                            {/* Deal Value */}
                            <div className={hoveredDeal === deal.id ? 'mb-3 pl-6' : 'mb-3 pl-0'}>
                              <p className="text-sm font-bold text-slate-900">{formatINR(deal.value)}</p>
                              <p className="text-xs text-slate-500 font-medium">
                                {deal.closedAt ? formatDateIN(deal.closedAt) : 'Active'}
                              </p>
                            </div>

                            {/* Deal Footer - Agent Badge */}
                            <div className={hoveredDeal === deal.id ? 'pl-6 flex items-center justify-between' : 'flex items-center justify-between'}>
                              <motion.span
                                whileHover={{ scale: 1.05 }}
                                className="inline-block text-xs bg-gradient-to-r from-slate-100 to-slate-50 text-slate-700 px-2.5 py-1 rounded font-semibold border border-slate-200/50"
                              >
                                {getAgentName(deal.agentId)}
                              </motion.span>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-center h-32 text-slate-400"
                      >
                        <p className="text-xs font-medium">No deals yet</p>
                      </motion.div>
                    )}

                    {/* Drag-drop placeholder indicator */}
                    <motion.div
                      whileHover={{ borderColor: 'rgb(34, 197, 94)', backgroundColor: 'rgba(34, 197, 94, 0.02)' }}
                      className="rounded-lg border-2 border-dashed border-slate-300 p-4 text-center text-xs text-slate-400 hover:border-emerald-500 transition-all"
                    >
                      Drop here to move
                    </motion.div>
                  </motion.div>
                )}

                {/* Collapsed state message */}
                {collapsedStages.has(stage) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 text-xs text-slate-500 text-center font-medium"
                  >
                    Click to expand
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Empty State */}
        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-64 text-slate-500"
          >
            <TrendingUp className="h-16 w-16 mb-3 text-slate-300" />
            <p className="text-sm font-medium">No deals match your filters. Adjust your selection to see deals.</p>
          </motion.div>
        )}
      </motion.div>

      {/* Integration Notes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-lg border border-slate-200/50 bg-gradient-to-r from-blue-50 to-cyan-50/30 p-4 text-xs text-slate-600 space-y-2 shadow-sm"
      >
        <p className="font-semibold text-slate-700">📌 Supabase Integration Roadmap</p>
        <ul className="space-y-1.5 ml-4 list-disc text-slate-600">
          <li>{"Drag-drop will update deal.stage via supabase.from('deals').update({ stage })"}</li>
          <li>Real-time sync: Enable Realtime subscription for live updates across agents</li>
          <li>Optimistic UI: Update card position immediately, sync with backend asynchronously</li>
          <li>Historical view: Archive closed deals and show trends in separate analytics page</li>
          <li>Permissions: Implement RLS policies so agents only see their own deals (public.deals. manager can see all)</li>
        </ul>
      </motion.div>
    </motion.div>
  );
}
