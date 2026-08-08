import { useState, useEffect } from "react";
import { Link, useNavigate, Outlet, useLocation } from "react-router-dom";
import {
  HandHelping, Menu, X, Mail, Phone, MapPin,
  Facebook, Twitter, Linkedin, Bell
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getNotifications, markAsRead, markAllAsRead, getAdminNotifications } from "../services/notificationService";
import "../pages/HomePage.css";
import AuthModal from "../components/AuthModal";
import { VolunteerHubLogoIcon } from "../components/VolunteerHubLogo";
import { API_BASE_URL } from "../services/apiConfig";

/**
 * MainLayout Component
 * 
 * Provides the shared layout for all public pages (Home, Events, About, Contact).
 * Includes the navigation header (with responsive mobile menu and auth states)
 * and the main footer.
 */
const MainLayout = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // State for mobile drawer menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // State for notifications dropdown
  const [notifications, setNotifications] = useState([]);
  const [notiDropdownOpen, setNotiDropdownOpen] = useState(false);

  // Auth Modal states
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState("login");
  const [authModalRole, setAuthModalRole] = useState("student");
  const [isMaintenance, setIsMaintenance] = useState(false);

  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/public-settings`);
        const data = await res.json();
        if (data && data.maintenanceMode) {
          setIsMaintenance(true);
        } else {
          setIsMaintenance(false);
        }
      } catch (err) {
        // quiet fallback
      }
    };
    checkMaintenance();
  }, [location.pathname]);

  const openAuthModal = (tab = "login", role = "student") => {
    setAuthModalTab(tab);
    setAuthModalRole(role);
    setShowAuthModal(true);
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      const fetchNavbarNotifications = async () => {
        try {
          const data = user.role === 'admin' ? await getAdminNotifications() : await getNotifications();
          const mappedData = (data || []).map(n => ({
            id: n.id,
            title: n.title || 'Notification',
            message: n.message || '',
            time: n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'recent',
            isRead: n.isRead
          }));
          setNotifications(mappedData);
        } catch (error) {
          console.error("Error fetching notifications:", error);
          setNotifications([]);
        }
      };

      fetchNavbarNotifications();

      const handleSync = () => {
        fetchNavbarNotifications();
      };
      window.addEventListener('voms_notifications_updated', handleSync);

      const interval = setInterval(fetchNavbarNotifications, 15000);
      return () => {
        clearInterval(interval);
        window.removeEventListener('voms_notifications_updated', handleSync);
      };
    } else {
      setNotifications([]);
    }
  }, [isAuthenticated, user]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      window.dispatchEvent(new Event('voms_notifications_updated'));
    } catch (e) {
      console.error("Failed to mark notification as read", e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      window.dispatchEvent(new Event('voms_notifications_updated'));
    } catch (e) {
      console.error("Failed to mark all notifications as read", e);
    }
  };

  /**
   * Redirects user to dashboard if logged in, or register page if guest.
   */
  const handleDashboardRedirect = () => {
    if (isAuthenticated) {
      if (user?.role === "student") navigate("/student/dashboard");
      else if (user?.role === "organizer") navigate("/organizer/dashboard");
      else navigate("/admin/dashboard");
    } else {
      openAuthModal("register", "student");
    }
  };

  /**
   * Helper to check if a navigation link is active
   */
  const isActive = (path) => location.pathname === path;
  const isDashboardRoute = location.pathname.startsWith('/student') || location.pathname.startsWith('/organizer') || (location.pathname.startsWith('/admin') && location.pathname !== '/admin/login');
  const isAuthPage = 
    location.pathname === '/register' || 
    location.pathname === '/get-started' || 
    location.pathname === '/signin' || 
    location.pathname === '/login' || 
    location.pathname === '/login/student' || 
    location.pathname === '/login/organizer' || 
    location.pathname === '/login/admin' || 
    location.pathname === '/admin/login' || 
    location.pathname === '/register/student' || 
    location.pathname === '/register/organizer' || 
    location.pathname === '/forgot-password' || 
    location.pathname.startsWith('/reset-password');
  const showNavbar = !isAuthPage && !showAuthModal;

  if (isMaintenance && user?.role !== 'admin' && location.pathname !== '/admin/login' && location.pathname !== '/login/admin') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mb-6 text-blue-400">
          <VolunteerHubLogoIcon className="w-12 h-12" />
        </div>
        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
          System Maintenance Mode Active
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
          VolunteerHub is Under Maintenance
        </h1>
        <p className="text-slate-400 max-w-md text-sm leading-relaxed mb-8 font-medium">
          We are currently updating our platform services to improve your experience. Non-administrative features are temporarily paused.
        </p>
        <div className="flex gap-4">
          <button 
            onClick={() => navigate('/admin/login')} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all border-none cursor-pointer"
          >
            Admin Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="vh-wrapper">
      
      {/* ── HEADER & NAVIGATION ─────────────────────────── */}
      {showNavbar && (
        <header className="vh-navbar">
        <div className="vh-nav-container">
          
          {/* Main Logo & Branding */}
          <Link to="/" className="vh-logo flex items-center gap-2.5">
            <VolunteerHubLogoIcon className="w-8 h-8" />
            <span className="font-extrabold text-xl tracking-tight text-slate-900">Volunteer<span className="text-[#1D61F2]">Hub</span></span>
            {user?.role === 'admin' && (
              <span className="ml-2 bg-blue-50 text-[#1D61F2] border border-blue-200/60 text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider">
                ADMIN PORTAL
              </span>
            )}
          </Link>

          {/* Center Navigation Links (Visible on Desktop) */}
          <nav className="vh-nav-links">
            <Link to="/" className={`vh-nav-link ${isActive("/") ? "active" : ""}`}>Home</Link>
            <Link to="/events" className={`vh-nav-link ${isActive("/events") ? "active" : ""}`}>Events</Link>
            <Link to="/about" className={`vh-nav-link ${isActive("/about") ? "active" : ""}`}>About</Link>
            <Link to="/contact" className={`vh-nav-link ${isActive("/contact") ? "active" : ""}`}>Contact</Link>
          </nav>

          {/* Right Action Buttons (Desktop) */}
          <div className="vh-nav-auth">
            {isAuthenticated ? (
              <div className="vh-nav-user-info relative" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className="vh-user-greeting">Hi, {user?.name?.split(' ')[0] || (user?.role === 'admin' ? 'Admin' : 'Volunteer')}</span>
                
                {/* Notifications Bell Button */}
                <div className="relative">
                  <button 
                    onClick={() => {
                      setNotiDropdownOpen(!notiDropdownOpen);
                      setDropdownOpen(false); // Close profile dropdown if open
                    }}
                    className="relative p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200 focus:outline-none"
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {notiDropdownOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden"
                      style={{ right: '-40px', top: '100%', minWidth: '280px' }}
                      onMouseLeave={() => setNotiDropdownOpen(false)}
                    >
                      {/* Dropdown Header */}
                      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-800">Notifications</span>
                        {unreadCount > 0 && (
                          <button 
                            onClick={handleMarkAllRead}
                            className="text-xs text-blue-600 hover:text-blue-800 hover:underline font-semibold bg-transparent border-none cursor-pointer"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      {/* Dropdown List */}
                      <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-8 text-center text-gray-400 text-sm flex flex-col items-center justify-center">
                            <Bell className="w-8 h-8 mb-2 text-gray-300" />
                            <span>No notifications yet</span>
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div 
                              key={n.id} 
                              onClick={() => handleMarkAsRead(n.id)}
                              className={`px-4 py-3 text-left transition-colors cursor-pointer hover:bg-gray-50 flex gap-2.5 items-start ${!n.isRead ? 'bg-blue-50/40' : ''}`}
                            >
                              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.isRead ? 'bg-blue-500' : 'bg-transparent'}`} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <p className={`text-xs font-bold truncate ${!n.isRead ? 'text-gray-900' : 'text-gray-500'}`}>{n.title}</p>
                                  <span className="text-[9px] text-gray-400 flex-shrink-0">{n.time || 'recent'}</span>
                                </div>
                                <p className="text-[11px] text-gray-500 mt-0.5 leading-snug break-words">{n.message}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Dropdown Footer */}
                      {user?.role === 'organizer' ? (
                        <Link 
                          to="/organizer/notifications" 
                          onClick={() => setNotiDropdownOpen(false)}
                          className="block text-center py-2 bg-gray-50 border-t border-gray-100 text-xs font-bold text-blue-600 hover:bg-gray-100 transition-colors"
                        >
                          View all notifications
                        </Link>
                      ) : user?.role === 'student' ? (
                        <Link 
                          to="/student/notifications" 
                          onClick={() => setNotiDropdownOpen(false)}
                          className="block text-center py-2 bg-gray-50 border-t border-gray-100 text-xs font-bold text-blue-600 hover:bg-gray-100 transition-colors"
                        >
                          View all notifications
                        </Link>
                      ) : user?.role === 'admin' ? (
                        <Link 
                          to="/admin/notifications" 
                          onClick={() => setNotiDropdownOpen(false)}
                          className="block text-center py-2 bg-gray-50 border-t border-gray-100 text-xs font-bold text-blue-600 hover:bg-gray-100 transition-colors"
                        >
                          View all notifications
                        </Link>
                      ) : null}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <img
                    src={
                      user?.avatar ||
                      user?.studentProfile?.avatar ||
                      user?.organizerProfile?.logo ||
                      (user?.role === "organizer" 
                        ? `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(user?.name || 'Club')}`
                        : `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user?.name || 'User')}`)
                    }
                    alt="profile"
                    className={`w-10 h-10 rounded-full border-2 cursor-pointer object-cover hover:scale-105 transition-transform ${
                      user?.role === 'admin' ? 'border-[#14B8A6]' : 'border-blue-500'
                    }`}
                    title="Go to Dashboard"
                    onClick={() => {
                      if (user?.role === 'student') navigate('/student/dashboard');
                      else if (user?.role === 'organizer') navigate('/organizer/dashboard');
                      else if (user?.role === 'admin') navigate('/admin/dashboard');
                      else navigate('/');
                    }}
                  />
                </div>
              </div>
            ) : (
              <>
                <button 
                  onClick={() => openAuthModal("login", "student")} 
                  className="vh-btn-signin bg-transparent border-none cursor-pointer"
                  style={{ display: 'inline-flex', alignItems: 'center' }}
                >
                  Sign In
                </button>
                <button 
                  onClick={() => openAuthModal("register", "student")} 
                  className="vh-btn-create cursor-pointer"
                  style={{ border: 'none' }}
                >
                  Create Account
                </button>
              </>
            )}
          </div>

          {/* Hamburger Menu Toggle (Mobile) */}
          <button
            className="vh-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        <nav className={`vh-mobile-nav ${mobileMenuOpen ? "vh-show" : ""}`}>
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className={`vh-nav-link ${isActive("/") ? "active" : ""}`}>Home</Link>
          <Link to="/events" onClick={() => setMobileMenuOpen(false)} className={`vh-nav-link ${isActive("/events") ? "active" : ""}`}>Events</Link>
          <Link to="/about" onClick={() => setMobileMenuOpen(false)} className={`vh-nav-link ${isActive("/about") ? "active" : ""}`}>About</Link>
          <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className={`vh-nav-link ${isActive("/contact") ? "active" : ""}`}>Contact</Link>
          
          <div className="vh-mobile-auth-stack" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            {isAuthenticated ? (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <img
                  src={
                    user?.avatar ||
                    user?.studentProfile?.avatar ||
                    user?.organizerProfile?.logo ||
                    (user?.role === "organizer" 
                      ? `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(user?.name || 'Club')}`
                      : `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user?.name || 'User')}`)
                  }
                  alt="profile"
                  className="w-12 h-12 rounded-full border-2 border-blue-500 object-cover"
                />
                <span className="vh-user-greeting" style={{ textAlign: "center", fontWeight: 'bold' }}>
                  Hi, {user?.role === 'admin' ? 'Admin' : (user?.name?.split(' ')[0] || "Volunteer")}
                </span>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleDashboardRedirect();
                  }}
                  className="vh-btn-create"
                  style={{ width: "100%", marginTop: '0.25rem' }}
                >
                  Go to Profile
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (user?.role === 'organizer') navigate('/organizer/notifications');
                    else if (user?.role === 'student') navigate('/student/notifications');
                    else navigate('/admin/notifications');
                  }}
                  className="vh-btn-create flex items-center justify-center gap-2"
                  style={{ width: "100%", background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', color: 'white', border: 'none', cursor: 'pointer' }}
                >
                  <Bell className="w-4 h-4" /> Notifications {unreadCount > 0 && `(${unreadCount})`}
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                    navigate('/');
                  }}
                  className="vh-btn-logout"
                  style={{ width: "100%" }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <button 
                  onClick={() => { setMobileMenuOpen(false); openAuthModal("login", "student"); }} 
                  className="vh-btn-signin text-center cursor-pointer" 
                  style={{ width: "100%", display: 'block', border: 'none', background: 'transparent' }}
                >
                  Sign In
                </button>
                <button 
                  onClick={() => { setMobileMenuOpen(false); openAuthModal("register", "student"); }} 
                  className="vh-btn-create text-center cursor-pointer" 
                  style={{ width: "100%", display: 'block', border: 'none' }}
                >
                  Create Account
                </button>
              </>
            )}
          </div>
        </nav>
      </header>
      )}

      {/* ── ACTIVE PAGE CONTENT ────────────────────────── */}
      <main style={isDashboardRoute ? { height: "100vh", overflow: "hidden", paddingTop: "var(--navbar-height)", boxSizing: "border-box" } : (isAuthPage ? { minHeight: "100vh" } : { minHeight: "calc(100vh - var(--navbar-height) - 300px)" })}>
        <Outlet context={{ openAuthModal }} />
      </main>

      {/* ── FOOTER ───────────────────────────────────────── */}
      {!isDashboardRoute && !isAuthPage && (
        <footer className="vh-footer">
          <div className="vh-footer-container">
            <div className="vh-footer-grid">
              {/* Column 1: Brand Info */}
              <div className="vh-footer-col">
                <Link to="/" className="vh-footer-logo">
                  <div className="vh-footer-logo-icon">
                    <HandHelping className="w-4 h-4" />
                  </div>
                  <span>VolunteerHub</span>
                </Link>
                <p className="vh-footer-tagline">
                  Empowering students through meaningful volunteer opportunities.
                </p>
              </div>
  
              {/* Column 2: Quick Links */}
              <div className="vh-footer-col">
                <h4>Quick Links</h4>
                <ul className="vh-footer-links">
                  <li><Link to="/about" className="vh-footer-link">About Us</Link></li>
                  <li><Link to="/events" className="vh-footer-link">Events</Link></li>
                  <li><Link to="/about" className="vh-footer-link">Partner Clubs</Link></li>
                  <li><Link to="/contact" className="vh-footer-link">Contact</Link></li>
                </ul>
              </div>
  
              {/* Column 3: Contact Details */}
              <div className="vh-footer-col">
                <h4>Contact</h4>
                <ul className="vh-footer-contact">
                  <li>
                    <Mail className="w-4 h-4 text-blue-500" />
                    <span>info@volunteerhub.edu</span>
                  </li>
                  <li>
                    <Phone className="w-4 h-4 text-blue-500" />
                    <span>(555) 123-4567</span>
                  </li>
                  <li>
                    <MapPin className="w-4 h-4 text-blue-500" />
                    <span>University Campus</span>
                  </li>
                </ul>
              </div>
  
              {/* Column 4: Socials */}
              <div className="vh-footer-col">
                <h4>Follow Us</h4>
                <div className="vh-social-links">
                  <a href="#" className="vh-social-btn" aria-label="Facebook">
                    <Facebook className="w-4 h-4" />
                  </a>
                  <a href="#" className="vh-social-btn" aria-label="Twitter">
                    <Twitter className="w-4 h-4" />
                  </a>
                  <a href="#" className="vh-social-btn" aria-label="LinkedIn">
                    <Linkedin className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
  
            <div className="vh-footer-bottom">
              &copy; {new Date().getFullYear()} VolunteerHub. All rights reserved.
            </div>
          </div>
        </footer>
      )}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        initialTab={authModalTab} 
        initialRole={authModalRole} 
      />
    </div>
  );
};

export default MainLayout;
