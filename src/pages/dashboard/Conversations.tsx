/**
 * Conversations Page - Shared inbox per company
 * Features:
 * - Responsive two-column layout (list & chat panel)
 * - Framer Motion animations for lead list entrance (staggered)
 * - Smooth transitions between selected leads
 * - Company-scoped filtering with multi-tenant support
 * - Real-time message updates placeholder for Supabase Realtime integration
 * - Chat Panel with message display and input
 * - Agent-facing shared inbox - all agents in company see same messages
 *
 * TODO: Supabase Realtime Integration
 * - Subscribe to real-time message updates: supabase.channel(`company:${companyId}`).on('postgres_changes', ...)
 * - Update messages instantly across all agents in the company
 * - Implement presence tracking to show when agents are typing
 * - Handle connection state and reconnection logic
 * - Listen for new messages: `supabase.from('messages').on('*', (payload) => { ... }).subscribe()`
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ChatPanel from '../../components/conversations/ChatPanel';
import SectionSummary from '../../components/dashboard/SectionSummary';
import { useAuth } from '../../context/AuthContext';
import { mockLeads, mockMessages } from '../../data/mockData';
import type { Message } from '../../types';

export default function Conversations() {
  const { companyId } = useAuth();
  // Filter leads by company - shared inbox per company
  const companyLeads = mockLeads.filter((l) => l.companyId === companyId);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(
    companyLeads[0]?.id ?? null
  );
  const [messagesByLead, setMessagesByLead] = useState<Record<string, Message[]>>({});

  useEffect(() => {
    // Filter messages for leads in this company - shared inbox data
    const filtered: Record<string, Message[]> = {};
    mockLeads.filter((l) => l.companyId === companyId).forEach((l) => {
      const msgs = mockMessages[l.id];
      if (msgs) filtered[l.id] = msgs;
    });
    setMessagesByLead(filtered);
  }, [companyId]);

  const selectedLead = companyLeads.find((l) => l.id === selectedLeadId);
  const messages = selectedLeadId ? (messagesByLead[selectedLeadId] ?? []) : [];

  // TODO: Supabase Realtime Channel Subscription
  // useEffect(() => {
  //   const channel = supabase
  //     .channel(`company:${companyId}`)
  //     .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
  //       setMessagesByLead((prev) => ({
  //         ...prev,
  //         [payload.new.leadId]: [...(prev[payload.new.leadId] ?? []), payload.new],
  //       }));
  //     })
  //     .subscribe();
  //   return () => {
  //     supabase.removeChannel(channel);
  //   };
  // }, [companyId]);

  const handleSendMessage = (content: string, isAuto: boolean) => {
    if (!selectedLeadId || !companyId) return;
    const sender = isAuto ? ('auto' as const) : ('agent' as const);
    const newMsg: Message = {
      id: `m-${Date.now()}`,
      leadId: selectedLeadId,
      companyId,
      sender,
      content,
      timestamp: new Date().toISOString(),
    };
    setMessagesByLead((prev) => ({
      ...prev,
      [selectedLeadId]: [...(prev[selectedLeadId] ?? []), newMsg],
    }));
    // TODO: supabase.from('messages').insert(newMsg) - shared inbox, all agents see it
  };

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
          title="Conversations"
          description="Shared inbox per company. Any agent sees the same messages. Select a lead, send manual or auto responses. Realtime updates when backend is connected."
          stats={[{ label: 'Active chats', value: String(companyLeads.length) }]}
        />
      </motion.div>
      
      {/* Main container - responsive layout with animations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 gap-4 lg:grid-cols-12"
      >
        {/* Lead list sidebar - company-scoped with staggered animations */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-3"
        >
          <div className="rounded-xl border border-slate-200/50 bg-white/50 backdrop-blur-sm shadow-sm overflow-hidden h-fit max-h-96 lg:max-h-[calc(100vh-14rem)]">
            <div className="sticky top-0 bg-gradient-to-r from-slate-50 to-slate-100/50 px-4 py-3 border-b border-slate-200/50">
              <h3 className="font-semibold text-slate-900 text-sm">Active Leads ({companyLeads.length})</h3>
            </div>
            <div className="divide-y divide-slate-200/50 overflow-y-auto">
              {companyLeads.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="px-4 py-12 text-center"
                >
                  <p className="text-sm font-medium text-slate-500">No leads yet</p>
                  <p className="text-xs text-slate-400 mt-1">Add leads to start conversations</p>
                </motion.div>
              ) : (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.05,
                        delayChildren: 0.15,
                      },
                    },
                  }}
                  className="divide-y divide-slate-200/50"
                >
                  {companyLeads.map((lead, idx) => (
                    <motion.button
                      key={lead.id}
                      variants={{
                        hidden: { opacity: 0, y: -10 },
                        visible: {
                          opacity: 1,
                          y: 0,
                          transition: { type: 'spring', stiffness: 300, damping: 25 },
                        },
                      }}
                      onClick={() => setSelectedLeadId(lead.id)}
                      whileHover={{ scale: 1.01, backgroundColor: selectedLeadId === lead.id ? undefined : 'rgb(248, 250, 252)' }}
                      whileTap={{ scale: 0.99 }}
                      className={`w-full px-4 py-3 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-500 ${
                        selectedLeadId === lead.id
                          ? 'bg-cyan-50/80 border-l-4 border-cyan-500 shadow-md'
                          : 'border-l-4 border-transparent hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-slate-900 truncate">{lead.name}</p>
                          <p className="text-xs text-slate-500 truncate">{lead.email}</p>
                          {lead.priority && (
                            <motion.span
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.2 + idx * 0.05 }}
                              className={`inline-flex mt-2 px-2.5 py-1 text-xs font-semibold rounded-full ${
                                lead.priority === 'critical'
                                  ? 'bg-red-100 text-red-700'
                                  : lead.priority === 'high'
                                  ? 'bg-amber-100 text-amber-700'
                                  : lead.priority === 'medium'
                                  ? 'bg-sky-100 text-sky-700'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {lead.priority}
                            </motion.span>
                          )}
                        </div>
                        {messagesByLead[lead.id] && messagesByLead[lead.id].length > 0 && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            className="shrink-0 inline-flex items-center justify-center min-w-6 h-6 text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-full shadow-md"
                          >
                            {messagesByLead[lead.id].length > 99 ? '99+' : messagesByLead[lead.id].length}
                          </motion.span>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Chat panel - primary content area with motion entrance */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-9"
        >
          {selectedLead ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              key={selectedLead.id}
            >
              <ChatPanel
                leadId={selectedLead.id}
                leadName={selectedLead.name}
                leadEmail={selectedLead.email}
                leadPriority={selectedLead.priority}
                messages={messages}
                onSendMessage={handleSendMessage}
              />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex h-96 flex-col items-center justify-center rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 text-slate-500"
            >
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-5xl mb-4"
              >
                💬
              </motion.div>
              <p className="text-sm font-medium">No lead selected</p>
              <p className="text-xs text-slate-400 mt-1">Choose a lead from the list to start chatting</p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
