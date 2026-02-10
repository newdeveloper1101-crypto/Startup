/**
 * Leads Table - Columns: Name, Source, Priority, Status, Agent, Date
 * Features:
 * - Framer Motion row hover and entrance animations
 * - Enhanced color system with status badges using Emerald, Red, Amber, Sky
 * - Search, filter, sort, pagination with responsive design
 * - Filters: Source, Priority. Click row opens Lead Detail Modal
 * - Smooth transitions and interactive hover effects
 *
 * BACKEND PLACEHOLDER: Pagination, sorting, and filtering will be handled
 * by backend with offset/limit queries. Example:
 *   supabase.from('leads').select('*')
 *     .eq('company_id', companyId)
 *     .ilike('name', `%${query}%`)
 *     .eq('source', source)
 *     .order('created_at', { ascending: false })
 *     .range(offset, offset + limit - 1)
 */
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Lead, LeadSource, LeadPriority, User, Message } from '../../types';
import { formatDateIN } from '../../utils/formatINR';
import LeadDetailModal from './LeadDetailModal';

interface LeadsTableProps {
  leads: Lead[];
  agents: User[];
  messagesByLead: Record<string, Message[]>;
  onAssignAgent: (leadId: string, agentId: string) => void;
  onAddNote: (leadId: string, note: string) => void;
}

const SOURCES: LeadSource[] = ['website', 'chat', 'demo', 'referral', 'social', 'other'];
const PRIORITIES: LeadPriority[] = ['low', 'medium', 'high', 'critical'];
const PAGE_SIZE = 6; // Mock pagination; backend will handle actual limits via API

export default function LeadsTable({
  leads,
  agents,
  messagesByLead,
  onAssignAgent,
  onAddNote,
}: LeadsTableProps) {
  const [sourceFilter, setSourceFilter] = useState<LeadSource | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<LeadPriority | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'priority'>('date');

  const filtered = useMemo(() => {
    return leads
      .filter((l) => {
        if (sourceFilter !== 'all' && l.source !== sourceFilter) return false;
        if (priorityFilter !== 'all' && l.priority !== priorityFilter) return false;
        if (
          searchQuery &&
          !l.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) &&
          !l.email.toLowerCase().includes(searchQuery.toLowerCase().trim())
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'priority') {
          const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [leads, sourceFilter, priorityFilter, searchQuery, sortBy]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const getPriorityBadgeClass = (priority: LeadPriority) => {
    const map = {
      critical: 'bg-red-100 text-red-800',
      high: 'bg-amber-100 text-amber-800',
      medium: 'bg-sky-100 text-sky-800',
      low: 'bg-slate-100 text-slate-800',
    };
    return map[priority];
  };

  const getStatusBadge = (lead: Lead) => {
    const hasMessages = (messagesByLead[lead.id] ?? []).length > 0;
    return hasMessages ? 'Contacted' : 'New';
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSourceFilter('all');
    setPriorityFilter('all');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Filters & Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="space-y-4 rounded-xl border border-slate-200/50 bg-gradient-to-r from-white via-slate-50/30 to-white p-5 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-slate-300/50 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 caret-cyan-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="rounded-lg border border-slate-300/50 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="priority">Sort by Priority</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-500">Source</label>
            <select
              value={sourceFilter}
              onChange={(e) => {
                setSourceFilter(e.target.value as LeadSource | 'all');
                setPage(1);
              }}
              className="mt-1.5 rounded-lg border border-slate-300/50 bg-white px-3 py-2 text-sm text-slate-900 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
            >
              <option value="all">All</option>
              {SOURCES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value as LeadPriority | 'all');
                setPage(1);
              }}
              className="mt-1.5 rounded-lg border border-slate-300/50 bg-white px-3 py-2 text-sm text-slate-900 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
            >
              <option value="all">All</option>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClearFilters}
              className="rounded-lg bg-gradient-to-r from-slate-200 to-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:from-slate-300 hover:to-slate-200 transition-all shadow-sm"
            >
              Clear Filters
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Results count */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-xs font-medium text-slate-500"
      >
        Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(
          page * PAGE_SIZE,
          filtered.length
        )}{' '}
        of {filtered.length} leads
      </motion.p>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md hover:shadow-lg transition-shadow"
      >
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-slate-200">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Lead Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Source
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Priority
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Agent Assigned
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 bg-white">
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <p className="text-sm text-slate-500">No leads found. Try adjusting filters.</p>
                  </td>
                </tr>
              ) : (
                <motion.tbody
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
                  className="divide-y divide-slate-200/50"
                >
                  {paged.map((lead) => (
                    <motion.tr
                      key={lead.id}
                      variants={{
                        hidden: { opacity: 0, x: -20 },
                        visible: {
                          opacity: 1,
                          x: 0,
                          transition: { type: 'spring', stiffness: 300, damping: 25 },
                        },
                      }}
                      onClick={() => setSelectedLead(lead)}
                      whileHover={{ backgroundColor: 'rgb(6 182 212 / 0.05)', x: 4 }}
                      whileTap={{ scale: 0.99 }}
                      className="cursor-pointer transition-all duration-200"
                    >
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-slate-900">
                        {lead.name}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm capitalize text-slate-600">
                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                          {lead.source}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <motion.span
                          whileHover={{ scale: 1.05 }}
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold transition-all ${getPriorityBadgeClass(lead.priority)}`}
                        >
                          {lead.priority}
                        </motion.span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <motion.span
                          whileHover={{ scale: 1.05 }}
                          className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 transition-all"
                        >
                          {getStatusBadge(lead)}
                        </motion.span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                        {lead.agentAssigned ? (
                          <span className="inline-flex rounded-full bg-cyan-100/50 px-2.5 py-1 text-xs font-medium text-cyan-700">
                            {lead.agentAssigned}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                        {formatDateIN(lead.createdAt)}
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between rounded-lg border border-slate-200 bg-gradient-to-r from-slate-50 to-white px-4 py-3 shadow-sm"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-white hover:border-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </motion.button>
          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
              const pageNum = i + 1;
              return (
                <motion.button
                  key={pageNum}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPage(pageNum)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    page === pageNum
                      ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-white shadow-md'
                      : 'border border-slate-300 text-slate-700 hover:border-cyan-500 hover:text-cyan-600'
                  }`}
                >
                  {pageNum}
                </motion.button>
              );
            })}
            {totalPages > 5 && <span className="text-slate-400">...</span>}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-white hover:border-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </motion.button>
        </motion.div>
      )}

      <LeadDetailModal
        lead={selectedLead}
        agents={agents}
        messages={selectedLead ? messagesByLead[selectedLead.id] ?? [] : []}
        onClose={() => setSelectedLead(null)}
        onAssignAgent={onAssignAgent}
        onAddNote={onAddNote}
      />
    </div>
  );
}
