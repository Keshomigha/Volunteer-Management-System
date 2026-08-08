import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

// Layouts
import MainLayout from '../layouts/MainLayout';

// Public Pages
import HomePage    from '../pages/HomePage';
import EventsPage  from '../pages/EventsPage';
import AboutPage   from '../pages/AboutPage';
import ContactPage from '../pages/ContactPage';
import EventDetailsPage from '../pages/EventDetailsPage';

// Auth Pages
import UnifiedAuthPage   from '../pages/Auth/UnifiedAuthPage';
import ForgotPassword     from '../pages/Auth/ForgotPassword';
import ResetPassword      from '../pages/Auth/ResetPassword';

// Student Layout + Pages
import StudentLayout         from '../layouts/StudentLayout';
import Dashboard             from '../pages/Student/Dashboard';
import ApplyEvent            from '../pages/Student/ApplyEvent';
import History               from '../pages/Student/History';
import Leaderboard           from '../pages/Student/Leaderboard';
import StudentSettings       from '../pages/Student/StudentSettings';
import StudentCertificates   from '../pages/Student/StudentCertificates';
import StudentNotifications  from '../pages/Student/Notifications';

// Organizer Layout + Pages
import OrganizerLayout      from '../layouts/OrganizerLayout';
import OrganizerDashboard   from '../pages/Organizer/OrganizerDashboard';
import CreateEvent          from '../pages/Organizer/CreateEvent';
import ManageEvents         from '../pages/Organizer/ManageEvents';
import Applications         from '../pages/Organizer/Applications';
import Attendance           from '../pages/Organizer/Attendance';
import Certificates         from '../pages/Organizer/Certificates';
import Notifications        from '../pages/Organizer/Notifications';
import OrganizerSettings    from '../pages/Organizer/OrganizerSettings';

// Admin Layout + Pages
import AdminLayout           from '../layouts/AdminLayout';
import AdminDashboard        from '../pages/Admin/AdminDashboard';
import ManageUsers           from '../pages/Admin/ManageUsers';
import ApproveEvents         from '../pages/Admin/ApproveEvents';
import ReportsAnalytics      from '../pages/Admin/ReportsAnalytics';
import SystemSettings        from '../pages/Admin/SystemSettings';
import AdminNotifications    from '../pages/Admin/AdminNotifications';
import AdminManageEvents     from '../pages/Admin/ManageEvents';
import AdminOrganizations    from '../pages/Admin/Organizations';
import AdminLogin            from '../pages/Auth/AdminLogin';
import AdminCertificates     from '../pages/Admin/Certificates';

const AppRouter = () => {
  return (
    <Routes>

      {/* ── Public Site (nested inside MainLayout) ───── */}
      <Route element={<MainLayout />}>
        <Route path="/"             element={<HomePage />} />
        <Route path="/events"       element={<EventsPage />} />
        <Route path="/events/:id"   element={<EventDetailsPage />} />
        <Route path="/about"        element={<AboutPage />} />
        <Route path="/contact"      element={<ContactPage />} />

        <Route path="/get-started"  element={<UnifiedAuthPage initialTab="register" initialRole="student" />} />
        <Route path="/register"     element={<UnifiedAuthPage initialTab="register" initialRole="student" />} />
        <Route path="/signin"       element={<UnifiedAuthPage initialTab="login" initialRole="student" />} />
        <Route path="/login"        element={<UnifiedAuthPage initialTab="login" initialRole="student" />} />

        {/* ── Auth ─────────────────────────────────────── */}
        <Route path="/register/student"   element={<UnifiedAuthPage initialTab="register" initialRole="student" />} />
        <Route path="/register/organizer" element={<UnifiedAuthPage initialTab="register" initialRole="organizer" />} />

        <Route path="/login/student"   element={<UnifiedAuthPage initialTab="login" initialRole="student" />} />
        <Route path="/login/organizer" element={<UnifiedAuthPage initialTab="login" initialRole="organizer" />} />
        <Route path="/login/admin"     element={<UnifiedAuthPage initialTab="login" initialRole="admin" />} />
        <Route path="/admin/login"     element={<UnifiedAuthPage initialTab="login" initialRole="admin" />} />

        <Route path="/forgot-password"    element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* ── Student Panel (nested layout) ────────────── */}
        <Route path="/student" element={<ProtectedRoute><RoleRoute allowedRoles={['student']}><StudentLayout /></RoleRoute></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"    element={<Dashboard />} />
          <Route path="events"       element={<EventsPage />} />
          <Route path="events/:id"   element={<EventDetailsPage />} />
          <Route path="applications" element={<ApplyEvent />} />
          <Route path="history"      element={<History />} />
          <Route path="leaderboard"  element={<Leaderboard />} />
          <Route path="certificates" element={<StudentCertificates />} />
          <Route path="settings"     element={<StudentSettings />} />
          <Route path="notifications" element={<StudentNotifications />} />
        </Route>

        {/* ── Organizer Panel (nested layout) ──────────── */}
        <Route path="/organizer" element={<ProtectedRoute><RoleRoute allowedRoles={['organizer']}><OrganizerLayout /></RoleRoute></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"     element={<OrganizerDashboard />} />
          <Route path="create-event"  element={<CreateEvent />} />
          <Route path="events"        element={<ManageEvents />} />
          <Route path="applications"  element={<Applications />} />
          <Route path="attendance"    element={<Attendance />} />
          <Route path="certificates"  element={<Certificates />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings"      element={<OrganizerSettings />} />
        </Route>
      </Route>

      {/* ── Standalone Enterprise Admin Portal (Dedicated Layout, No Public Header/Footer) ── */}
      <Route path="/admin" element={<ProtectedRoute><RoleRoute allowedRoles={['admin']}><AdminLayout /></RoleRoute></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"      element={<AdminDashboard />} />
        <Route path="users"          element={<ManageUsers />} />
        <Route path="event-approval" element={<ApproveEvents />} />
        <Route path="manage-events"  element={<AdminManageEvents />} />
        <Route path="organizations"  element={<AdminOrganizations />} />
        <Route path="certificates"   element={<AdminCertificates />} />
        <Route path="reports"        element={<ReportsAnalytics />} />
        <Route path="settings"       element={<SystemSettings />} />
        <Route path="notifications"  element={<AdminNotifications />} />
      </Route>

    </Routes>
  );
};

export default AppRouter;
