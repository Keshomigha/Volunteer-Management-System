import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, CheckSquare, Calendar, Users, Building2, 
  Award, BarChart3, Bell, Settings, LogOut, ChevronLeft, 
  ChevronRight, Menu, X, Search, ExternalLink, ShieldCheck 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAdminDashboard } from '../services/adminService';
import { VolunteerHubLogoIcon } from '../components/VolunteerHubLogo';

/**
 * Enterprise Standalone AdminLayout Component
 * 
 * Provides an isolated, professional workspace for Administrators
 * completely separate from the public student/organizer website layout.
 */
const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);

  // Fetch live pending event approvals count for sidebar badge
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getAdminDashboard();
        if (res && res.pendingEvents !== undefined) {
          setPendingApprovalsCount(res.pendingEvents);
        }
      } catch (err) {
        console.error("Failed to load admin counts:", err);
      }
    };
    fetchStats();
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    {
      label: 'Dashboard',
      path: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Event Approvals',
      path: '/admin/event-approval',
      icon: CheckSquare,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : null,
      badgeColor: 'bg-amber-500 text-slate-950 font-extrabold',
    },
    {
      label: 'Manage Events',
      path: '/admin/manage-events',
      icon: Calendar,
    },
    {
      label: 'Manage Users',
      path: '/admin/users',
      icon: Users,
    },
    {
      label: 'Organizations',
      path: '/admin/organizations',
      icon: Building2,
    },
    {
      label: 'Certificates',
      path: '/admin/certificates',
      icon: Award,
    },
    {
      label: 'Reports & Analytics',
      path: '/admin/reports',
      icon: BarChart3,
    },
    {
      label: 'Notifications',
      path: '/admin/notifications',
      icon: Bell,
    },
    {
      label: 'System Settings',
      path: '/admin/settings',
      icon: Settings,
    },
  ];

  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

  useEffect(() => {
    const handleThemeChange = () => {
      setIsDarkMode(localStorage.getItem('darkMode') === 'true');
    };
    window.addEventListener('admin-theme-change', handleThemeChange);
    return () => window.removeEventListener('admin-theme-change', handleThemeChange);
  }, []);

  // Determine current page section title and icon for header bar
  const currentNavItem = navItems.find(item => 
    location.pathname === item.path || (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path))
  ) || navItems[0];
  const CurrentIcon = currentNavItem?.icon;

  return (
    <div className={`admin-workspace h-screen w-screen overflow-hidden flex bg-slate-900 font-sans text-slate-100 antialiased ${isDarkMode ? 'dark' : ''}`}>
      
      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── SIDEBAR NAVIGATION (FIXED 100% HEIGHT) ─────────── */}
      <aside 
        className={`h-full flex-shrink-0 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between transition-all duration-300 z-50 fixed lg:static top-0 bottom-0 left-0 ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Top Sidebar Header / Logo */}
        <div className="flex flex-col h-full overflow-hidden">
          <div className="h-16 flex-shrink-0 flex items-center justify-between px-4 border-b border-slate-800/80">
            <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => navigate('/admin/dashboard')}>
              <VolunteerHubLogoIcon className="w-9 h-9" />
              {!collapsed && (
                <div className="flex flex-col">
                  <span className="font-extrabold text-base tracking-tight text-white leading-tight">Volunteer<span className="text-[#1D61F2]">Hub</span></span>
                  <span className="text-[10px] font-extrabold tracking-wider text-blue-400 uppercase">Admin Portal</span>
                </div>
              )}
            </div>

            {/* Desktop Collapse Toggle */}
            <button 
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
              title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            {/* Mobile Close */}
            <button 
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links (Internal Scroll if needed) */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            <div className={`px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 ${collapsed ? 'text-center' : ''}`}>
              {collapsed ? '•••' : 'Management Menu'}
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all relative group
                    ${isActive 
                      ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30 shadow-sm font-semibold' 
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                    }
                    ${collapsed ? 'justify-center px-0' : ''}
                  `}
                  title={collapsed ? item.label : undefined}
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                      
                      {!collapsed && (
                        <span className="flex-1 truncate">{item.label}</span>
                      )}

                      {/* Badge */}
                      {item.badge && (
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${item.badgeColor || 'bg-blue-600 text-white'} ${collapsed ? 'absolute top-1 right-1 px-1.5 py-0 text-[9px]' : ''}`}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer (Fixed at bottom of sidebar) */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/80 flex-shrink-0 space-y-2">
          {/* Quick View Public Website */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-blue-300 hover:bg-slate-900 border border-transparent hover:border-slate-800/80 transition-all ${
              collapsed ? 'justify-center px-0' : ''
            }`}
            title="Open Public Website"
          >
            <ExternalLink className="w-4 h-4 text-blue-400 flex-shrink-0" />
            {!collapsed && <span>View Public Site</span>}
          </a>

          {/* Dedicated Proper Admin Logout Button */}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/40 transition-all duration-200 cursor-pointer ${
              collapsed ? 'justify-center px-0 py-2.5' : ''
            }`}
            title="Logout from Admin Portal"
          >
            <LogOut className="w-4 h-4 text-rose-400 flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>


      {/* ── MAIN WORKSPACE CONTENT CONTAINER (INDEPENDENT SCROLL) ───── */}
      <div className="flex-1 h-full flex flex-col min-w-0 overflow-hidden bg-slate-900">
        
        {/* Top Admin Header Bar (Fixed Top) */}
        <header className="h-16 flex-shrink-0 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 md:px-6 flex items-center justify-between z-30">
          
          {/* Left: Mobile Toggle & Breadcrumbs */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0 shadow-sm">
                {CurrentIcon && <CurrentIcon className="w-4.5 h-4.5" />}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-slate-100 tracking-tight">{currentNavItem.label}</span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-800 text-slate-400 border border-slate-700/60 uppercase tracking-wider">
                  Admin Portal
                </span>
              </div>
            </div>
          </div>

          {/* Right: Search, Notifications & User Badge */}
          <div className="flex items-center gap-3">
            {/* Quick Admin Search Bar */}
            <div className="hidden md:flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus-within:border-blue-500/50 transition-colors w-64">
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <input 
                type="text" 
                placeholder="Quick admin search..." 
                className="bg-transparent outline-none w-full placeholder-slate-500 text-xs text-slate-200"
              />
            </div>

            {/* Notification Shortcut */}
            <button 
              onClick={() => navigate('/admin/notifications')}
              className="relative p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800/80 transition-colors cursor-pointer"
              title="Admin Notifications"
            >
              <Bell className="w-4 h-4" />
              {pendingApprovalsCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              )}
            </button>

            {/* Status Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
              System Active
            </div>
          </div>
        </header>

        {/* Dynamic Page Content View (Only This View Scrolls) */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-900 text-slate-100">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

    </div>
  );
};

export default AdminLayout;
