import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle, Clock, XCircle, ClipboardList, X, User, Mail, Phone, Tag, MessageSquare, BookOpen, Calendar, Building2, Video, ExternalLink } from 'lucide-react';
import { getMyApplications } from '../../services/applicationService';
const STATUS = {
  approved: { badge: 'bg-green-100 text-green-700', icon: CheckCircle, iconCls: 'text-green-500', iconBg: 'bg-green-100', label: 'Approved' },
  pending: { badge: 'bg-amber-100 text-amber-700', icon: Clock, iconCls: 'text-amber-500', iconBg: 'bg-amber-100', label: 'Pending' },
  rejected: { badge: 'bg-red-100   text-red-500', icon: XCircle, iconCls: 'text-red-500', iconBg: 'bg-red-100', label: 'Rejected' },
};
const STATS = [
  { key: 'approved', label: 'Approved' },
  { key: 'pending', label: 'Pending' },
  { key: 'rejected', label: 'Rejected' },
];
/* ── View Details Modal ─────────────────────────────────── */
const DetailField = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0 mt-0.5">
      <Icon className="w-4 h-4 text-purple-500" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-700 break-words whitespace-pre-wrap">
        {value || <span className="italic text-gray-300">Not provided</span>}
      </p>
    </div>
  </div>
);
const ViewDetailsModal = ({ app, onClose }) => {
  const s = STATUS[app.status?.toLowerCase()] || STATUS.pending;
  const Icon = s.icon;

  const formatDateString = iso => {
    if (!iso) return '';
    const parts = iso.split('T')[0].split('-');
    if (parts.length < 3) return iso;
    const [y, m, d] = parts;
    return new Date(y, m - 1, d).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  };
  return (
    <div
      className="fixed inset-0 z-[2000] flex items-start justify-center p-4 py-8 overflow-y-auto bg-black/40 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-2xl overflow-hidden bg-white shadow-2xl rounded-2xl">
        {/* Modal header */}
        <div className="h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600" />
        <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-gray-100">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-800 truncate">{app.event}</h2>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold ${s.badge}`}>
                <Icon className="w-3.5 h-3.5" /> {s.label}
              </span>
              <span className="text-xs text-gray-400">Applied on {app.appliedOn}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          {/* Event info row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 rounded-xl">
              <Building2 className="flex-shrink-0 w-4 h-4 text-blue-500" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-400">Club / Organizer</p>
                <p className="text-sm font-semibold text-blue-700">{app.club}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 bg-purple-50 rounded-xl">
              <Calendar className="flex-shrink-0 w-4 h-4 text-purple-500" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-purple-400">Event Date</p>
                <p className="text-sm font-semibold text-purple-700">{formatDateString(app.eventDate)}</p>
              </div>
            </div>
          </div>

          {/* Online Meeting Banner if virtual event */}
          {(app.eventType === 'Online' || app.meetingLink) && (
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-600 text-white flex items-center justify-center flex-shrink-0">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-purple-700">Online Meeting Link</p>
                  <p className="text-xs text-purple-900 font-medium">Virtual event via Zoom / Meet / Teams</p>
                </div>
              </div>
              {app.meetingLink ? (
                <a
                  href={app.meetingLink.startsWith('http') ? app.meetingLink : `https://${app.meetingLink}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-all no-underline cursor-pointer"
                >
                  <Video className="w-3.5 h-3.5" /> Join Meeting <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="text-[11px] font-bold text-purple-600 bg-purple-100 px-2.5 py-1 rounded-md">
                  Meeting link provided by host
                </span>
              )}
            </div>
          )}
          {/* Divider + section label */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">Your Application</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Application form fields */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailField icon={User} label="Full Name" value={app.form?.name} />
              <DetailField icon={Mail} label="Email" value={app.form?.email} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailField icon={Phone} label="Phone Number" value={app.form?.phone} />
              <DetailField icon={Tag} label="Relevant Skills" value={app.form?.skills} />
            </div>
            <DetailField icon={MessageSquare} label="Why I Want to Join" value={app.form?.motivation} />
            <DetailField icon={BookOpen} label="Previous Volunteer Experience" value={app.form?.experience} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-extrabold transition-all shadow-md shadow-blue-500/20 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
/* ── Main Page ──────────────────────────────────────────── */
const ApplyEvent = () => {
  const { user } = useAuth();
  const [viewingApp, setViewingApp] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      try {
        const data = await getMyApplications();
        const normalized = data.map(app => ({
          id: app.id,
          event: app.event?.title || 'Unknown Event',
          club: app.event?.User?.name || 'Organizer',
          eventDate: app.event?.date || app.event?.eventDate || 'N/A',
          meetingLink: app.event?.meetingLink,
          eventType: app.event?.eventType,
          appliedOn: new Date(app.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          status: (app.status || 'Pending').toLowerCase(),
          form: app.formData || app.form || {}
        }));
        setApplications(normalized);
      } catch (err) {
        console.error("Error fetching student applications:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [user]);
  const counts = {
    approved: applications.filter(a => a.status === 'approved').length,
    pending: applications.filter(a => a.status === 'pending').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-800">
          My Applications
        </h1>
        <p className="mt-1 text-gray-500">Track the status of your event applications</p>
      </div>
      {/* Summary stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {STATS.map(({ key, label }) => {
          const s = STATUS[key];
          const Icon = s.icon;
          return (
            <div key={key} className="flex items-center gap-4 p-5 bg-white border border-gray-100 shadow-sm rounded-2xl">
              <div className={`w-12 h-12 rounded-2xl ${s.iconBg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-6 h-6 ${s.iconCls}`} />
              </div>
              <div>
                <p className="text-3xl font-extrabold text-gray-800">{counts[key]}</p>
                <p className="text-sm font-medium text-gray-500">{label}</p>
              </div>
            </div>
          );
        })}
      </div>
      {/* Applications table */}
      <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {['Event Name', 'Club', 'Event Date', 'Applied On', 'Status', 'Action'].map(h => (
                <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {applications.map(app => {
              const statusKey = (app.status || 'pending').toLowerCase();
              const s = STATUS[statusKey] || STATUS.pending;
              const Icon = s.icon;
              return (
                <tr key={app.id} className="transition-colors hover:bg-purple-50/30">
                  <td className="px-5 py-4 font-semibold text-gray-800">{app.event}</td>
                  <td className="px-5 py-4 text-gray-500">{app.club}</td>
                  <td className="px-5 py-4 text-gray-500">{app.eventDate}</td>
                  <td className="px-5 py-4 text-gray-500">{app.appliedOn}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${s.badge}`}>
                      <Icon className="w-3.5 h-3.5" /> {s.label}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {statusKey === 'approved' && (
                      <button
                        onClick={() => setViewingApp(app)}
                        className="text-sm font-semibold text-purple-600 transition-colors hover:text-purple-800"
                      >
                        View Details
                      </button>
                    )}
                    {statusKey === 'pending' && (
                      <button className="text-sm font-semibold text-red-500 transition-colors hover:text-red-700">
                        Withdraw
                      </button>
                    )}
                    {statusKey === 'rejected' && (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* View Details Modal */}
      {viewingApp && (
        <ViewDetailsModal app={viewingApp} onClose={() => setViewingApp(null)} />
      )}
    </div>
  );
};

export default ApplyEvent;