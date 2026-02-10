/**
 * Settings Page - Profile, notifications, integrations
 * Features:
 * - Framer Motion animations for section entrance and transitions
 * - Form sections with enhanced styling and smooth interactions
 * - Profile: Edit name/email, display role & avatar, change password
 * - Appearance: Dark/Light mode toggle
 * - Notifications: Lead assignment alerts, new lead notifications  
 * - Integrations: Slack, WhatsApp, Email, Lead Sources (with OAuth placeholders)
 * - Danger Zone: Delete account with confirmation
 * - React Hot Toast notifications for feedback
 * - Responsive Tailwind CSS layout with consistent spacing
 * - Multi-tenant support: Filter data by companyId
 *
 * TODO - BACKEND INTEGRATION:
 * - OAuth flows: Slack (App config), WhatsApp (Business API), Email (IMAP/SMTP)
 * - API: POST /api/auth/update-profile, POST /api/notifications/preferences
 * - Database: Store OAuth tokens encrypted in Supabase user metadata
 * - Supabase Auth: supabase.auth.updateUser({ data: { name, ... } })
 * - Supabase DB: supabase.from('user_preferences').upsert({ companyId, userId, ... })
 * - Add password verification before delete account
 * - Implement rate limiting for API calls
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Slack, MessageCircle, Mail, Moon, Sun, Eye, EyeOff, Trash2, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import SectionSummary from '../../components/dashboard/SectionSummary';
import { useAuth } from '../../context/AuthContext';

interface NotificationPreferences {
  emailOnAssignment: boolean;
  newLeadAlerts: boolean;
}

interface IntegrationStatus {
  slack: boolean;
  whatsapp: boolean;
  email: boolean;
}

export default function Settings() {
  const { user, company } = useAuth();

  // Profile state
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Appearance state
  const [darkMode, setDarkMode] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    emailOnAssignment: true,
    newLeadAlerts: true,
  });

  // Integrations state
  const [integrations, setIntegrations] = useState<IntegrationStatus>({
    slack: false,
    whatsapp: false,
    email: false,
  });

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState('');

  // Handlers - Profile
  const handleSaveProfile = () => {
    if (!name.trim() || !email.trim()) {
      toast.error('Name and email are required');
      return;
    }

    if (!email.includes('@')) {
      toast.error('Invalid email address');
      return;
    }

    // TODO: API Integration -> POST /api/auth/update-profile
    // const { error } = await supabase.auth.updateUser({
    //   data: { name, email }
    // });
    // if (error) {
    //   toast.error(`Failed to update profile: ${error.message}`);
    //   return;
    // }

    toast.success('Profile updated successfully!');
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('All password fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsChangingPassword(true);

    // TODO: API Integration -> POST /api/auth/change-password
    // const { error } = await supabase.auth.updateUser({
    //   password: newPassword
    // });
    // if (error) {
    //   toast.error(`Failed to change password: ${error.message}`);
    //   setIsChangingPassword(false);
    //   return;
    // }

    // Simulate API call
    setTimeout(() => {
      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
      setShowPasswords(false);
      setIsChangingPassword(false);
    }, 800);
  };

  // Handlers - Appearance
  const handleToggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    
    // TODO: API Integration -> POST /api/user/preferences/appearance
    // Save to localStorage for persistence
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    
    toast.success(`Switched to ${newMode ? 'Dark' : 'Light'} mode`);
  };

  // Handlers - Notifications
  const handleNotificationChange = (key: keyof NotificationPreferences) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSaveNotifications = () => {
    // TODO: API Integration -> POST /api/user/preferences/notifications
    // const { error } = await supabase.from('user_preferences').upsert({
    //   companyId,
    //   userId: user?.id,
    //   emailOnAssignment: notifications.emailOnAssignment,
    //   newLeadAlerts: notifications.newLeadAlerts,
    // });

    toast.success('Notification preferences saved!');
  };

  // Handlers - Integrations
  const handleConnectIntegration = (integration: keyof IntegrationStatus) => {
    // TODO: OAuth Integration Steps
    // Slack: Redirect to https://slack.com/oauth/v2/authorize with client_id
    // WhatsApp: Implement WhatsApp Business API authentication flow
    // Email: Show IMAP/SMTP configuration dialog
    // Store refresh tokens in Supabase auth.users metadata encrypted

    const newStatus = !integrations[integration];

    if (newStatus) {
      switch (integration) {
        case 'slack':
          toast.loading('Redirecting to Slack authorization...');
          setTimeout(() => {
            setIntegrations(prev => ({ ...prev, slack: true }));
            toast.success('Slack connected successfully!');
          }, 1500);
          break;
        case 'whatsapp':
          toast.loading('Initializing WhatsApp Business API...');
          setTimeout(() => {
            setIntegrations(prev => ({ ...prev, whatsapp: true }));
            toast.success('WhatsApp connected successfully!');
          }, 1500);
          break;
        case 'email':
          toast.loading('Setting up email integration...');
          setTimeout(() => {
            setIntegrations(prev => ({ ...prev, email: true }));
            toast.success('Email integration enabled!');
          }, 1500);
          break;
      }
    } else {
      setIntegrations(prev => ({ ...prev, [integration]: false }));
      toast.success(`${integration.charAt(0).toUpperCase() + integration.slice(1)} disconnected`);
    }
  };

  // Handlers - Delete Account
  const handleDeleteAccount = () => {
    if (deleteEmail !== user?.email) {
      toast.error('Email does not match');
      return;
    }

    // TODO: API Integration -> DELETE /api/auth/delete-account
    // - Verify user password first
    // - Archive all company data in Supabase
    // - Delete user account after 30-day grace period notification
    // - Send confirmation email

    toast.loading('Deleting account...');
    setTimeout(() => {
      toast.success('Account deletion initiated. Check your email for confirmation.');
      setShowDeleteConfirm(false);
      setDeleteEmail('');
    }, 1500);
  };

  const getAvatarColor = (role?: string) => {
    const colors = {
      admin: 'from-cyan-400 to-blue-500',
      manager: 'from-purple-400 to-pink-500',
      agent: 'from-emerald-400 to-teal-500',
    };
    return colors[role as keyof typeof colors] || colors.agent;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-slate-50"
    >
      <SectionSummary
        title="Settings"
        description="Manage your profile, notifications, integrations, and security preferences."
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-8 space-y-6 pb-12 max-w-4xl"
      >
        {/* PROFILE SECTION */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="rounded-xl border border-slate-200/50 bg-gradient-to-br from-white to-slate-50/30 p-6 shadow-md"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Profile</h2>
              <p className="mt-1 text-sm text-slate-500 font-medium">Manage your account information.</p>
            </div>
            {/* Avatar Circle - with animation */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className={`rounded-full h-16 w-16 bg-gradient-to-br ${getAvatarColor(user?.role)} flex items-center justify-center text-white font-bold text-xl shadow-lg`}
            >
              {user?.name?.charAt(0)?.toUpperCase() ?? 'A'}
            </motion.div>
          </div>

          <div className="space-y-5 mb-6">
            {/* Name & Email Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300/50 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 caret-cyan-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
                  placeholder="Your full name"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.25 }}
              >
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-300/50 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 caret-cyan-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
                  placeholder="your.email@example.com"
                />
              </motion.div>
            </div>

            {/* Role & Company Display */}
            <div className="grid gap-4 sm:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <label className="block text-sm font-semibold text-slate-700 mb-2">Role</label>
                <div className="rounded-lg border border-slate-300/50 px-4 py-2.5 bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30, delay: 0.35 }}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-cyan-100 text-cyan-700 capitalize uppercase"
                    >
                      {user?.role ?? 'agent'}
                    </motion.span>
                    <p className="text-sm text-slate-600 font-medium">Workspace Role</p>
                  </div>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.35 }}
              >
                <label className="block text-sm font-semibold text-slate-700 mb-2">Company</label>
                <div className="rounded-lg border border-slate-300/50 px-4 py-2.5 bg-slate-50/50">
                  <p className="text-slate-900 font-semibold">{company?.name ?? 'No Company'}</p>
                  <p className="text-xs text-slate-500 mt-1 font-medium">{company?.industry ?? 'Industry not specified'}</p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Profile Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSaveProfile}
              className="flex-1 rounded-lg bg-gradient-to-r from-cyan-600 to-cyan-700 px-4 py-2.5 text-sm font-bold text-white hover:from-cyan-700 hover:to-cyan-800 transition-all shadow-md hover:shadow-lg"
            >
              Save Changes
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="flex-1 sm:flex-initial rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100 hover:border-slate-400 transition-all flex items-center justify-center gap-2"
            >
              <Lock className="h-4 w-4" />
              Change Password
            </motion.button>
          </div>

          {/* Password Change Form with animation */}
          {showPasswordForm && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="mt-6 p-5 rounded-lg bg-slate-50/50 border border-slate-200/50"
            >
              <h3 className="font-bold text-slate-900 mb-5 flex items-center gap-2 text-sm uppercase tracking-wider">
                <Lock className="h-4 w-4 text-cyan-600" />
                Change Your Password
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-300/50 bg-white px-4 py-2.5 text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
                    placeholder="Enter current password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-lg border border-slate-300/50 bg-white px-4 py-2.5 text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
                      placeholder="Enter new password (min 8 characters)"
                    />
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={() => setShowPasswords(!showPasswords)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-900 transition-colors"
                      type="button"
                    >
                      {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </motion.button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm New Password</label>
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-300/50 bg-white px-4 py-2.5 text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
                    placeholder="Confirm new password"
                  />
                </div>

                <div className="flex gap-3 pt-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleChangePassword}
                    disabled={isChangingPassword}
                    className="flex-1 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isChangingPassword ? 'Updating...' : 'Update Password'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setShowPasswordForm(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                    className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-all"
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.section>

        {/* APPEARANCE SECTION */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="rounded-xl border border-slate-200/50 bg-gradient-to-br from-white to-slate-50/30 p-6 shadow-md"
        >
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900 mb-1">Appearance</h2>
            <p className="text-sm text-slate-500 font-medium">Customize how you experience the application.</p>
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="flex items-center justify-between p-5 rounded-lg border border-slate-200/50 bg-white hover:shadow-md transition-all group cursor-pointer"
            whileHover={{ backgroundColor: 'rgb(248 250 252)' }}
          >
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30, delay: 0.35 }}
                className="rounded-lg bg-gradient-to-br from-amber-100 to-slate-100 p-3"
              >
                {darkMode ? (
                  <Moon className="h-6 w-6 text-slate-700" />
                ) : (
                  <Sun className="h-6 w-6 text-amber-500" />
                )}
              </motion.div>
              <div>
                <p className="font-semibold text-slate-900 group-hover:text-cyan-900 transition-colors">Theme</p>
                <p className="text-sm text-slate-500 font-medium">{darkMode ? 'Dark' : 'Light'} mode</p>
              </div>
            </div>

            {/* Toggle Switch with animation */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleToggleDarkMode}
              className={`relative inline-flex items-center h-8 w-16 rounded-full transition-all ${
                darkMode ? 'bg-slate-900 shadow-md shadow-slate-900/20' : 'bg-slate-300 shadow-md shadow-amber-500/20'
              }`}
              role="switch"
              aria-checked={darkMode}
              aria-label="Toggle dark mode"
            >
              <motion.span
                layout
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-all ${
                  darkMode ? 'translate-x-9' : 'translate-x-1'
                }`}
              />
            </motion.button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="text-xs text-slate-500 mt-4 flex items-start gap-2"
          >
            <span className="mt-0.5">💡</span>
            <span><strong>Note:</strong> Dark mode toggle is a UI placeholder. Full theme implementation coming soon.</span>
          </motion.p>
        </motion.section>

        {/* NOTIFICATIONS SECTION */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="rounded-xl border border-slate-200/50 bg-gradient-to-br from-white to-slate-50/30 p-6 shadow-md"
        >
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">Notifications</h2>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Control how you're notified about leads, assignments, and updates.
            </p>
          </div>

          <div className="space-y-3">
            {/* Email on Assignment */}
            <motion.label
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="flex items-center justify-between p-4 rounded-lg border border-slate-200/50 bg-white hover:bg-cyan-50/40 cursor-pointer transition-all group"
              whileHover={{ x: 4 }}
            >
              <div className="flex-1">
                <p className="font-semibold text-slate-900 group-hover:text-cyan-900 transition-colors">Lead assignment notifications</p>
                <p className="text-sm text-slate-500 font-medium">Get notified when a new lead is assigned to you</p>
              </div>
              <motion.input
                type="checkbox"
                checked={notifications.emailOnAssignment}
                onChange={() => handleNotificationChange('emailOnAssignment')}
                className="h-5 w-5 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
              />
            </motion.label>

            {/* New Lead Alerts */}
            <motion.label
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.45 }}
              className="flex items-center justify-between p-4 rounded-lg border border-slate-200/50 bg-white hover:bg-cyan-50/40 cursor-pointer transition-all group"
              whileHover={{ x: 4 }}
            >
              <div className="flex-1">
                <p className="font-semibold text-slate-900 group-hover:text-cyan-900 transition-colors">New lead notifications</p>
                <p className="text-sm text-slate-500 font-medium">Alert when new leads arrive from any source (chat, form, API)</p>
              </div>
              <motion.input
                type="checkbox"
                checked={notifications.newLeadAlerts}
                onChange={() => handleNotificationChange('newLeadAlerts')}
                className="h-5 w-5 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
              />
            </motion.label>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSaveNotifications}
            className="mt-6 rounded-lg bg-gradient-to-r from-cyan-600 to-cyan-700 px-4 py-2.5 text-sm font-bold text-white hover:from-cyan-700 hover:to-cyan-800 shadow-md hover:shadow-lg transition-all"
          >
            Save Preferences
          </motion.button>
        </motion.section>

        {/* INTEGRATIONS SECTION */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.45 }}
          className="rounded-xl border border-slate-200/50 bg-gradient-to-br from-white to-slate-50/30 p-6 shadow-md"
        >
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">Integrations</h2>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Connect tools and platforms to send notifications and ingest leads automatically.
            </p>
          </div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.08, delayChildren: 0.5 }
              }
            }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6"
          >
            {/* Slack Integration */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 }
              }}
              whileHover={{ y: -4, boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)' }}
              className="rounded-lg border border-slate-200/50 p-4 bg-white transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  className="rounded-lg bg-slate-100 p-2.5"
                >
                  <Slack className="h-5 w-5 text-slate-700" />
                </motion.div>
                <h3 className="font-bold text-slate-900">Slack</h3>
              </div>
              <p className="text-sm text-slate-600 mb-4 font-medium">
                Receive lead notifications and updates directly in Slack.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleConnectIntegration('slack')}
                className={`w-full rounded-lg px-4 py-2.5 text-sm font-bold transition-all ${
                  integrations.slack
                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                {integrations.slack ? '✓ Connected' : 'Connect Slack'}
              </motion.button>
              <p className="text-xs text-slate-500 mt-2 font-medium">
                📝 TODO: OAuth flow via Slack App Directory
              </p>
            </motion.div>

            {/* WhatsApp Integration */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 }
              }}
              whileHover={{ y: -4, boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)' }}
              className="rounded-lg border border-slate-200/50 p-4 bg-white transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30, delay: 0.08 }}
                  className="rounded-lg bg-emerald-100 p-2.5"
                >
                  <MessageCircle className="h-5 w-5 text-emerald-600" />
                </motion.div>
                <h3 className="font-bold text-slate-900">WhatsApp</h3>
              </div>
              <p className="text-sm text-slate-600 mb-4 font-medium">
                Connect WhatsApp Business API to send and receive messages.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleConnectIntegration('whatsapp')}
                className={`w-full rounded-lg px-4 py-2.5 text-sm font-bold transition-all ${
                  integrations.whatsapp
                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    : 'bg-emerald-700 text-white hover:bg-emerald-800'
                }`}
              >
                {integrations.whatsapp ? '✓ Connected' : 'Connect WhatsApp'}
              </motion.button>
              <p className="text-xs text-slate-500 mt-2 font-medium">
                📝 TODO: Business API authentication
              </p>
            </motion.div>

            {/* Email Integration */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 }
              }}
              whileHover={{ y: -4, boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)' }}
              className="rounded-lg border border-slate-200/50 p-4 bg-white transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30, delay: 0.16 }}
                  className="rounded-lg bg-blue-100 p-2.5"
                >
                  <Mail className="h-5 w-5 text-blue-600" />
                </motion.div>
                <h3 className="font-bold text-slate-900">Email</h3>
              </div>
              <p className="text-sm text-slate-600 mb-4 font-medium">
                Sync emails and manage inbox integrations securely.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleConnectIntegration('email')}
                className={`w-full rounded-lg px-4 py-2.5 text-sm font-bold transition-all ${
                  integrations.email
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    : 'bg-blue-700 text-white hover:bg-blue-800'
                }`}
              >
                {integrations.email ? '✓ Connected' : 'Connect Email'}
              </motion.button>
              <p className="text-xs text-slate-500 mt-2 font-medium">
                📝 TODO: IMAP/SMTP setup
              </p>
            </motion.div>

            {/* Lead Sources */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 }
              }}
              whileHover={{ y: -4, boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)' }}
              className="rounded-lg border border-slate-200/50 p-4 bg-white transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30, delay: 0.24 }}
                  className="rounded-lg bg-purple-100 p-2.5"
                >
                  <AlertCircle className="h-5 w-5 text-purple-600" />
                </motion.div>
                <h3 className="font-bold text-slate-900">Lead Sources</h3>
              </div>
              <p className="text-sm text-slate-600 mb-4 font-medium">
                Configure website forms, social media, and API integrations.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toast.loading('Lead source configuration coming soon')}
                disabled
                className="w-full rounded-lg bg-purple-700 text-white px-4 py-2.5 text-sm font-bold opacity-50 cursor-not-allowed"
              >
                Configure
              </motion.button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.7 }}
            className="rounded-lg bg-blue-50/80 border border-blue-200/50 px-4 py-3 flex gap-3 backdrop-blur-sm"
          >
            <div className="text-blue-600 flex-shrink-0 mt-0.5">ℹ️</div>
            <div className="text-sm text-blue-900">
              <strong className="font-bold">Backend Integration Coming:</strong> OAuth flows for all services, webhook management, and encrypted credential storage via Supabase.
            </div>
          </motion.div>
        </motion.section>

        {/* DANGER ZONE SECTION */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.55 }}
          className="rounded-xl border-2 border-red-200/50 bg-gradient-to-br from-red-50 to-red-50/30 p-6 shadow-md"
        >
          <div className="mb-6">
            <h2 className="text-xl font-bold text-red-900 mb-2 flex items-center gap-2">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              >
                <AlertCircle className="h-5 w-5" />
              </motion.div>
              Danger Zone
            </h2>
            <p className="text-sm text-red-700 font-medium">Irreversible account actions</p>
          </div>

          <AnimatePresence mode="wait">
            {!showDeleteConfirm ? (
              <motion.div
                key="delete-prompt"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <p className="text-sm text-red-700 font-medium">
                  Deleting your account is permanent and cannot be undone. All your data will be deleted.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDeleteConfirm(true)}
                  className="rounded-lg bg-gradient-to-r from-red-600 to-red-700 px-4 py-2.5 text-sm font-bold text-white hover:from-red-700 hover:to-red-800 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Account
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="delete-confirm"
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="rounded-lg bg-white p-5 border border-red-300/50 backdrop-blur-sm"
              >
                <motion.h3
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                  className="font-bold text-red-900 mb-3 text-base"
                >
                  Are you absolutely sure?
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: 0.15 }}
                  className="text-sm text-red-700 mb-4 font-medium"
                >
                  This action cannot be undone. Please confirm by entering your email address:
                </motion.p>
                <motion.input
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: 0.2 }}
                  type="email"
                  value={deleteEmail}
                  onChange={(e) => setDeleteEmail(e.target.value)}
                  placeholder={user?.email || 'your@email.com'}
                  className="w-full rounded-lg border border-red-300/50 px-4 py-2.5 text-slate-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 caret-red-500 mb-3 transition-all"
                />
                {deleteEmail !== user?.email && deleteEmail && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-600 mb-3 font-medium"
                  >
                    ❌ Email does not match
                  </motion.p>
                )}
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDeleteAccount}
                    disabled={deleteEmail !== user?.email}
                    className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Confirm Delete
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteEmail('');
                    }}
                    className="flex-1 rounded-lg border border-red-300 px-4 py-2.5 text-sm font-bold text-red-700 hover:bg-red-100 transition-all"
                  >
                    Cancel
                  </motion.button>
                </div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: 0.3 }}
                  className="text-xs text-red-600 mt-3 font-medium"
                >
                  📝 TODO: Add password verification, 30-day grace period, and confirmation email.
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>
      </motion.div>
    </motion.div>
  );
}
