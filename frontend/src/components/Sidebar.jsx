import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * Sidebar — reusable sidebar navigation shell.
 * Features:
 *   - "NAVIGATION" header section with Arrow collapse/expand toggle button.
 *   - Icon-only collapsed mode (hides item names, shows icons and tooltips).
 *   - Expanded mode (shows icon + label).
 *   - Bottom divider line + Red Logout button.
 */
const Sidebar = ({
  logo,
  brandName = 'VolunteerHub',
  showBrand = false,
  sectionTitle = 'NAVIGATION',
  navItems = [],
  activeClass = 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20',
  hoverClass = 'text-slate-600 font-medium hover:bg-slate-100/80 hover:text-slate-900',
  collapsed: externalCollapsed,
  onToggleCollapse: externalToggleCollapse,
  onClose,
}) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [internalCollapsed, setInternalCollapsed] = useState(false);

  const isCollapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;
  const toggleCollapse = externalToggleCollapse || (() => setInternalCollapsed(!internalCollapsed));

  const handleLogout = () => {
    if (onClose) onClose();
    logout();
    navigate('/');
  };

  return (
    <div className="flex flex-col h-full bg-white font-sans text-slate-800 border-r border-slate-200/80 shadow-sm select-none transition-all duration-300">
      
      {/* Brand Logo Row (Optional) */}
      {showBrand && (
        <div className={`flex items-center px-4 py-4 border-b border-slate-100 flex-shrink-0 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            {logo}
            {!isCollapsed && <span className="font-extrabold text-slate-900 text-base truncate">{brandName}</span>}
          </div>
        </div>
      )}

      {/* Sidebar Header Section Title + Arrow Collapse Button */}
      <div className={`flex items-center px-4 py-3.5 border-b border-slate-100/90 bg-slate-50/50 flex-shrink-0 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed ? (
          <span className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase">
            {sectionTitle}
          </span>
        ) : (
          <span className="text-[11px] font-extrabold text-slate-400 tracking-wider">
            •••
          </span>
        )}

        {/* Arrow Collapse / Expand Button */}
        <button
          type="button"
          onClick={toggleCollapse}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Navigation Item List */}
      <nav className="flex-1 py-3 px-2 space-y-1.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            title={isCollapsed ? label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl text-sm transition-all duration-200 cursor-pointer relative group ${
                isCollapsed ? 'justify-center px-0 py-3' : 'px-3.5 py-2.5'
              } ${isActive ? activeClass : hoverClass}`
            }
          >
            {({ isActive }) => (
              <>
                {Icon && (
                  <Icon
                    className={`w-5 h-5 flex-shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                )}

                {/* Hide text label when collapsed */}
                {!isCollapsed && (
                  <span className="truncate flex-1 font-medium">{label}</span>
                )}

                {/* Badge */}
                {badge && (
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-600'
                    } ${isCollapsed ? 'absolute top-1 right-1 px-1.5 py-0 text-[9px]' : ''}`}
                  >
                    {badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Logout Row (Separated by border, in red text) */}
      <div className="p-2 border-t border-slate-100 flex-shrink-0">
        <button
          type="button"
          onClick={handleLogout}
          title={isCollapsed ? "Logout" : undefined}
          className={`flex items-center gap-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 cursor-pointer ${
            isCollapsed ? 'justify-center px-0 py-3' : 'px-3.5 py-2.5 w-full'
          }`}
        >
          <LogOut className="w-5 h-5 text-red-500 flex-shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
