/**
 * Leads Page - Multi-tenant, company_id filtered.
 * Features:
 * - Framer Motion animations for page entrance and table transitions
 * - Responsive grid layout with Tailwind CSS
 * - Company-scoped data filtering with multi-tenant support
 * - Realtime placeholder: subscribe to new leads when backend ready
 * - External lead ingestion: website/social API placeholder in Settings
 *
 * TODO: Supabase Realtime Integration
 * - Subscribe to new leads: supabase.channel(`leads:company_id=eq.${companyId}`).on('postgres_changes', ...)
 * - Real-time updates for lead status changes
 * - Implement presence tracking for concurrent agent actions
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import LeadsTable from '../../components/leads/LeadsTable';
import SectionSummary from '../../components/dashboard/SectionSummary';
import { useAuth } from '../../context/AuthContext';
import { mockLeads, mockAgents, mockMessages } from '../../data/mockData';
import type { Lead } from '../../types';

export default function Leads() {
  const { companyId } = useAuth();
  // TODO: Replace with Supabase - filter by company_id
  // const { data: leads } = useQuery(['leads', companyId], () =>
  //   supabase.from('leads').select('*').eq('company_id', companyId).order('created_at', { ascending: false })
  // );
  const [leads, setLeads] = useState<Lead[]>([]);

  // Filter mock data by companyId - multi-tenant
  useEffect(() => {
    if (!companyId) return;
    const filtered = mockLeads.filter((l) => l.companyId === companyId);
    setLeads(filtered);
  }, [companyId]);

  // PLACEHOLDER: Realtime lead updates - when new lead arrives, append to list
  // Supabase Realtime: supabase.channel('leads').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'leads', filter: `company_id=eq.${companyId}` }, (payload) => setLeads(prev => [payload.new, ...prev])).subscribe()
  // Alternative: Polling or WebSocket for external lead ingestion API (website form, social media webhook)

  const agents = mockAgents.filter((a) => a.companyId === companyId);
  const messagesByLead = mockMessages;

  const handleAssignAgent = (leadId: string, agentId: string) => {
    const agent = agents.find((a) => a.id === agentId);
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId ? { ...l, agentId, agentAssigned: agent?.name } : l
      )
    );
    // TODO: supabase.from('leads').update({ agent_id: agentId }).eq('id', leadId)
  };

  const handleAddNote = (leadId: string, note: string) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, notes: (l.notes ?? '') + '\n' + note } : l))
    );
    // TODO: supabase.from('lead_notes').insert({ lead_id: leadId, note, agent_id: user.id })
  };

  // Role-based: Admin/Manager see all; Agent may see only assigned. Comment for future filtering:
  // const visibleLeads = user?.role === 'agent' ? leads.filter(l => l.agentId === user.id) : leads;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <SectionSummary
          title="Leads"
          description="All prospects from website, chat, demo sites, social media and referrals. Filter by source and priority. Click a row to view full details, assign agent, add notes and see past conversations. Updates dynamically when new leads arrive."
          stats={[
            { label: 'Total', value: String(leads.length) },
            { label: 'Sources', value: 'Website, Chat, Demo, Referral, Social' },
          ]}
        />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <LeadsTable
          leads={leads}
          agents={agents}
          messagesByLead={messagesByLead}
          onAssignAgent={handleAssignAgent}
          onAddNote={handleAddNote}
        />
      </motion.div>
    </motion.div>
  );
}
