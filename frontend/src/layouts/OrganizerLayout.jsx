import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import {
  LayoutDashboard, PlusCircle, Calendar, FileText,
  ClipboardCheck, Award, Bell, Settings, Menu, X
} from 'lucide-react';
import Sidebar from '../components/Sidebar';

const navItems = [
  { to: '/organizer/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/organizer/create-event', icon: PlusCircle,      label: 'Create Event' },
  { to: '/organizer/events',       icon: Calendar,        label: 'Manage Events' },
  { to: '/organizer/applications', icon: FileText,        label: 'Applications' },
  { to: '/organizer/attendance',   icon: ClipboardCheck,  label: 'Attendance' },
  { to: '/organizer/certificates', icon: Award,           label: 'Certificates' },
  { to: '/organizer/notifications',icon: Bell,            label: 'Notifications' },
  { to: '/organizer/settings',     icon: Settings,        label: 'Settings' },
];

/**
 * OrganizerLayout Component
 *
 * Renders persistent left sidebar navigation with Arrow collapse toggle.
 */
const OrganizerLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden relative">
      
      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-2.5 bg-white border-b border-slate-200 flex-shrink-0 z-20">
        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Organizer Navigation</span>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Persistent Left Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 flex-shrink-0 h-full bg-white border-r border-slate-200/80 transition-all duration-300 transform ${
          collapsed ? 'w-20' : 'w-64'
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

      {/* Main Page Content */}
      <div className="flex-1 h-full overflow-y-auto p-4 md:p-6 lg:p-8 relative bg-gradient-to-br from-cyan-50/60 via-white to-blue-50/40 transition-all duration-300">
        <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-cyan-200/40 to-blue-200/30 blur-3xl" />
          <div className="absolute -bottom-40 -left-20 w-[420px] h-[420px] rounded-full bg-gradient-to-tr from-blue-200/35 to-cyan-200/25 blur-3xl" />
        </div>

        <Outlet />
      </div>
    </div>
  );
};

export default OrganizerLayout;
