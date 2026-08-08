import { useState, useEffect } from 'react';
import { 
  Bell, CheckCheck, Trash2, Info, Calendar, UserPlus, AlertTriangle, CheckCircle, Eye, X, Check, Sparkles
} from 'lucide-react';
import { getAdminNotifications, markAsRead, markAllAsRead, deleteNotification } from '../../services/notificationService';

const metaStyles = {
  Organizer: { icon: UserPlus, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100' },
  Event: { icon: Calendar, color: 'text-cyan-600', bg: 'bg-cyan-50 border-cyan-100' },
  Reminder: { icon: Sparkles, color: 'text-teal-600', bg: 'bg-teal-50 border-teal-100' },
  System: { icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-100' }
};

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHrs < 24) return `${diffHrs} ${diffHrs === 1 ? 'hr' : 'hrs'} ago`;
  if (diffDays === 1) return 'Yesterday';
  return date.toLocaleDateString();
};

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [toastMessage, setToastMessage] = useState('');

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await getAdminNotifications();
      const normalized = data.map((n) => {
        let type = 'Reminder';
        const titleLower = n.title.toLowerCase();
        if (titleLower.includes('event')) type = 'Event';
        else if (titleLower.includes('organizer') || titleLower.includes('registration')) type = 'Organizer';
        else if (titleLower.includes('system') || titleLower.includes('alert') || titleLower.includes('maintenance')) type = 'System';

        return {
          id: n.id,
          title: n.title,
          message: n.message,
          status: n.isRead ? 'Read' : 'Unread',
          date: formatTime(n.createdAt),
          type
        };
      });
      setNotifications(normalized);
    } catch (err) {
      console.error("Error loading admin notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleMarkRead = async (id, title) => {
    try {
      await markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'Read' } : n));
      window.dispatchEvent(new Event('voms_notifications_updated'));
      showToast(`Notification marked as read.`);
    } catch (err) {
      console.error("Failed to mark read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    const unreadCount = notifications.filter(n => n.status === 'Unread').length;
    if (unreadCount === 0) return;
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, status: 'Read' })));
      window.dispatchEvent(new Event('voms_notifications_updated'));
      showToast('All notifications marked as read.');
    } catch (err) {
      console.error("Failed to mark all read:", err);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete this notification?`)) {
      return;
    }
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      window.dispatchEvent(new Event('voms_notifications_updated'));
      showToast('Notification deleted successfully.');
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const handleClearAll = async () => {
    if (notifications.length === 0) return;
    if (!window.confirm('Are you sure you want to delete ALL notifications?')) {
      return;
    }
    try {
      await Promise.all(notifications.map(n => deleteNotification(n.id)));
      setNotifications([]);
      window.dispatchEvent(new Event('voms_notifications_updated'));
      showToast('All notifications cleared.');
    } catch (err) {
      console.error("Failed to clear notifications:", err);
    }
  };

  // Filter list
  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return n.status === 'Unread';
    if (filter === 'read') return n.status === 'Read';
    return true; // all
  });

  const unreadCount = notifications.filter(n => n.status === 'Unread').length;

  return (
    <div className="space-y-6 text-[#1E293B]">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-teal-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-5 h-5 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Bell className="w-8 h-8 text-teal-400" /> Notifications Center
          </h1>
          <p className="text-slate-400 mt-1 font-medium text-sm font-sans">View registration alerts, event requests, and announcements.</p>
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 bg-white border border-teal-100 text-teal-600 hover:bg-teal-50 px-3.5 py-2 rounded-2xl text-xs font-semibold shadow-sm transition-all border-none cursor-pointer"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark all read</span>
            </button>
          )}

          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1.5 bg-red-50 border border-red-105 text-red-600 hover:bg-red-100/70 px-3.5 py-2 rounded-2xl text-xs font-semibold shadow-sm transition-all border-none cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="bg-white rounded-2xl border border-teal-100 shadow-sm p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100 w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Alerts' },
            { id: 'unread', label: `Unread (${unreadCount})` },
            { id: 'read', label: 'Read History' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition-all border-none cursor-pointer ${
                filter === tab.id
                  ? 'bg-white text-teal-600 shadow-sm border border-teal-50'
                  : 'text-slate-500 hover:text-slate-800 bg-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        <span className="text-xs font-bold text-slate-500 bg-teal-50/50 px-3 py-1.5 border border-teal-100/50 rounded-xl">
          Total: <span className="text-teal-600">{notifications.length}</span>
        </span>
      </div>

      {/* Notifications list */}
      <div className="space-y-3.5">
        {loading ? (
          <div className="bg-white rounded-2xl border border-teal-100 p-20 text-center">
            <p className="text-slate-500 font-semibold animate-pulse text-base">Loading notifications...</p>
          </div>
        ) : filteredNotifications.map(n => {
          const meta = metaStyles[n.type] || metaStyles.System;
          const MetaIcon = meta.icon;
          const isUnread = n.status === 'Unread';

          return (
            <div
              key={n.id}
              className={`bg-white rounded-2xl border p-4.5 flex gap-4 transition-all duration-200 hover:shadow-sm ${
                isUnread 
                  ? 'border-teal-300 shadow-sm bg-teal-50/5' 
                  : 'border-slate-100 opacity-80'
              }`}
            >
              {/* Icon indicator */}
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 shadow-inner ${meta.bg}`}>
                <MetaIcon className={`w-5 h-5 ${meta.color}`} />
              </div>

              {/* Body */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      {n.type}
                    </span>
                    <h3 className={`text-sm font-bold mt-0.5 ${isUnread ? 'text-slate-800' : 'text-slate-600'}`}>
                      {n.title}
                    </h3>
                  </div>

                  <span className="text-[10px] text-slate-400 font-bold">
                    {n.date}
                  </span>
                </div>

                <p className="text-slate-500 text-xs leading-relaxed mt-2 pr-4 font-medium">
                  {n.message}
                </p>

                {/* Inline Actions */}
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-50 text-[11px] font-bold">
                  {isUnread && (
                    <button
                      onClick={() => handleMarkRead(n.id, n.title)}
                      className="text-teal-600 hover:text-teal-800 flex items-center gap-1 bg-teal-50/50 hover:bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-100 transition-colors cursor-pointer animate-pulse"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Mark Read</span>
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDelete(n.id, n.title)}
                    className="text-red-500 hover:text-red-700 flex items-center gap-1 hover:bg-red-50 px-2.5 py-1 rounded-lg transition-colors ml-auto sm:ml-0 cursor-pointer border-none bg-transparent"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Notification</span>
                  </button>
                </div>
              </div>

              {/* Unread ping dot */}
              {isUnread && (
                <span className="w-2.5 h-2.5 bg-teal-600 rounded-full flex-shrink-0 mt-2 self-start animate-pulse" />
              )}
            </div>
          );
        })}

        {!loading && filteredNotifications.length === 0 && (
          <div className="bg-white rounded-2xl border border-teal-100 p-20 text-center">
            <Bell className="w-14 h-14 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-bold">No notifications found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNotifications;
