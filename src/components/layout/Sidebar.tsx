/**
 * Sidebar - Navigation for Dashboard with role-based access
 * Features:
 * - Framer Motion animations for mobile menu
 * - Role-based navigation (Admin, Manager, Agent filtering in components)
 * - Company switcher (multi-tenant)
 * - Responsive mobile/desktop layout
 * 
 * TODO: Backend Integration
 * - Connect company switcher to real company list from Supabase
 * - Implement role-based conditional nav items
 * - Add user profile menu with logout
 * - Integrate real-time notification badge
 */
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  TrendingUp,
  DollarSign,
  Settings,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';

interface SidebarProps {
  userRole: UserRole;
}

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/dashboard/leads', icon: Users, label: 'Leads' },
  { path: '/dashboard/conversations', icon: MessageSquare, label: 'Conversations' },
  { path: '/dashboard/deals', icon: TrendingUp, label: 'Deals' },
  { path: '/dashboard/revenue', icon: DollarSign, label: 'Revenue' },
  { path: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ userRole }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { company } = useAuth();

  return (
    <>
      {/* Mobile menu button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed left-4 top-4 z-40 rounded-lg bg-white p-2 shadow-md hover:shadow-lg transition-shadow duration-200 lg:hidden"
        aria-label="Open menu"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Menu className="h-6 w-6 text-slate-900" />
      </motion.button>

      {/* Overlay on mobile with animation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="overlay"
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setIsOpen(false)}
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar with animation */}
      <motion.aside
        initial={{ x: -256 }}
        animate={{ x: isOpen ? 0 : -256 }}
        transition={{ duration: 0.3, type: 'spring', stiffness: 400, damping: 30 }}
        className="fixed left-0 top-0 z-50 h-full w-64 transform bg-gradient-to-b from-slate-900 to-slate-950 text-white shadow-2xl lg:translate-x-0"
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-700/50 px-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center">
              <span className="font-bold text-white text-sm">LS</span>
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent">LeadSync</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-1.5 hover:bg-slate-800 transition-colors lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="space-y-1 p-4">
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-cyan-600 text-white shadow-lg'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Company info and switcher */}
        <div className="absolute bottom-4 left-4 right-4 rounded-lg bg-slate-800/50 border border-slate-700/50 px-4 py-3 backdrop-blur-sm">
          <div className="mb-3 border-b border-slate-700/50 pb-3">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Company</p>
            <p className="mt-1 text-sm font-semibold text-white">{company?.name ?? 'Company A'}</p>
            <p className="mt-1 text-xs text-slate-400 capitalize">{userRole} • {company?.industry ?? 'Industry'}</p>
          </div>
          <select 
            className="w-full rounded-lg bg-slate-700 px-3 py-2 text-sm text-white border border-slate-600 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
            defaultValue={company?.id ?? 'co1'}
          >
            <option value="co1">Company A</option>
            <option value="co2">Bakery XYZ</option>
            <option value="co3">Retail Shop 123</option>
          </select>
        </div>
      </motion.aside>

      {/* Desktop spacer */}
      <div className="hidden lg:block lg:w-64" />
    </>
  );
}
