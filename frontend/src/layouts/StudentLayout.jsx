import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import {
  LayoutDashboard, CalendarDays, FileText, History as HistoryIcon,
  Trophy, Award, Bell, Settings, Menu, X
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import '../pages/Student/StudentSection.css';

const navItems = [
  { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/student/events', icon: CalendarDays, label: 'Browse Events' },
  { to: '/student/applications', icon: FileText, label: 'Applications' },
  { to: '/student/history', icon: HistoryIcon, label: 'History' },
  { to: '/student/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { to: '/student/certificates', icon: Award, label: 'Certificates' },
  { to: '/student/notifications', icon: Bell, label: 'Notifications' },
  { to: '/student/settings', icon: Settings, label: 'Settings' },
];

/**
 * StudentLayout Component
 *
 * Renders persistent left sidebar navigation with Arrow collapse toggle.
 * When collapsed, hides item names and displays icons only.
 */
const StudentLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden relative">

      {/* Mobile Header Bar for Student Panel */}
      <div className="md:hidden flex items-center justify-between px-4 py-2.5 bg-white border-b border-slate-200 flex-shrink-0 z-20">
        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Student Navigation</span>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Persistent Left Sidebar (Desktop) & Sliding Drawer (Mobile) */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 flex-shrink-0 h-full bg-white border-r border-slate-200/80 transition-all duration-300 transform ${collapsed ? 'w-20' : 'w-64'
          } ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <Sidebar
          showBrand={false}
          sectionTitle="NAVIGATION"
          navItems={navItems}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          onClose={() => setMobileMenuOpen(false)}
        />
      </aside>

      {/* Main Page Workspace */}
      <div className="flex-1 h-full overflow-y-auto p-4 md:p-6 lg:p-8 relative bg-gradient-to-br from-blue-50/60 via-white to-purple-50/40 transition-all duration-300">

        {/* Background ambient lighting */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-purple-200/40 to-blue-200/30 blur-3xl" />
          <div className="absolute -bottom-40 -left-20 w-[420px] h-[420px] rounded-full bg-gradient-to-tr from-blue-200/35 to-purple-200/25 blur-3xl" />
        </div>

        <Outlet />
      </div>
    </div>
  );
};

export default StudentLayout;
