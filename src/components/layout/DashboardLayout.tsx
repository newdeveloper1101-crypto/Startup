/**
 * Dashboard Layout - Main layout wrapper for all dashboard pages
 * Features:
 * - Sidebar navigation with role-based access
 * - Main content area with responsive padding
 * - Global toast notifications
 * - Multi-tenant context from AuthContext
 *
 * TODO: Backend Integration
 * - Track page views and navigation analytics
 * - Implement breadcrumb navigation
 * - Add user profile dropdown menu
 * - Integrate real-time notifications badge
 */
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';

export default function DashboardLayout() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar userRole={user?.role ?? 'AGENT'} />
      <main className="min-h-screen pl-0 transition-all duration-300 lg:pl-64 flex flex-col">
        {/* Main content area */}
        <div className="flex-1 pt-20 lg:pt-8">
          <div className="container-responsive">
            <Outlet />
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white py-6 px-4 sm:px-6 lg:px-8 mt-12">
          <div className="max-w-7xl mx-auto">
            <p className="text-center text-sm text-slate-600">
              LeadSync CRM © 2025 • <a href="#" className="text-cyan-600 hover:text-cyan-700 transition-colors">Privacy</a> • <a href="#" className="text-cyan-600 hover:text-cyan-700 transition-colors">Terms</a>
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
