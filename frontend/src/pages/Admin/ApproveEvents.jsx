import { useState, useEffect } from 'react';
import { 
  CalendarCheck, Clock, CheckCircle, XCircle, Eye, ThumbsUp, ThumbsDown, X, FolderOpen, Calendar, MapPin
} from 'lucide-react';
import { getAdminEvents, approveEvent, rejectEvent } from '../../services/adminService';

const ApproveEvents = () => {
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('Pending Approval'); // Pending Approval, Approved, Rejected
  const [selectedEvent, setSelectedEvent] = useState(null); // Detail modal
  const [toastMessage, setToastMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAllEvents = async () => {
    setLoading(true);
    try {
      const data = await getAdminEvents();
      const normalized = data.map(ev => ({
        ...ev,
        date: ev.eventDate || ev.date || '',
        volunteers: ev.acceptedCount !== undefined ? ev.acceptedCount : (ev.volunteers || 0),
        maxVolunteers: ev.volunteerRequired !== undefined ? ev.volunteerRequired : (ev.maxVolunteers || 30),
        organizer: ev.organizer || (ev.User ? ev.User.name : 'Organizer'),
        approvalStatus: ev.approvalStatus === 'Pending' ? 'Pending Approval' : ev.approvalStatus
      }));
      setEvents(normalized);
    } catch (err) {
      console.error("Error loading admin events list:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllEvents();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleApprove = async (id, title) => {
    if (!window.confirm(`Are you sure you want to approve "${title}"?`)) {
      return;
    }
    try {
      await approveEvent(id);
      setEvents(prev => prev.map(ev => String(ev.id) === String(id) ? { ...ev, approvalStatus: 'Approved' } : ev));
      showToast(`Event "${title}" approved successfully!`);
      if (selectedEvent && String(selectedEvent.id) === String(id)) {
        setSelectedEvent(prev => ({ ...prev, approvalStatus: 'Approved' }));
      }
    } catch (err) {
      console.error("Error approving event:", err);
      alert(err.response?.data?.message || err.message || "Failed to approve event");
    }
  };

  const handleReject = async (id, title) => {
    if (!window.confirm(`Are you sure you want to reject "${title}"?`)) {
      return;
    }
    try {
      await rejectEvent(id);
      setEvents(prev => prev.map(ev => String(ev.id) === String(id) ? { ...ev, approvalStatus: 'Rejected' } : ev));
      showToast(`Event "${title}" rejected.`);
      if (selectedEvent && String(selectedEvent.id) === String(id)) {
        setSelectedEvent(prev => ({ ...prev, approvalStatus: 'Rejected' }));
      }
    } catch (err) {
      console.error("Error rejecting event:", err);
      alert(err.response?.data?.message || err.message || "Failed to reject event");
    }
  };

  const filteredEvents = events.filter(ev => (ev.approvalStatus || 'Approved') === activeTab);

  return (
    <div className="space-y-6 text-[#1E293B]">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-teal-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <CalendarCheck className="w-8 h-8 text-teal-400" /> Event Approvals
        </h1>
        <p className="text-slate-400 mt-1 font-medium text-sm">Review and verify events posted by organizer clubs.</p>
      </div>

      {/* Tabs / Filter bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-teal-100 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100 w-full sm:w-auto">
          {[
            { id: 'Pending Approval', label: 'Pending' },
            { id: 'Approved', label: 'Approved' },
            { id: 'Rejected', label: 'Rejected' }
          ].map(tab => {
            const count = events.filter(e => (e.approvalStatus || 'Approved') === tab.id).length;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 sm:flex-initial px-5 py-2 rounded-lg text-xs font-bold transition-all border-none cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-white text-teal-600 shadow-sm border border-teal-50'
                    : 'text-slate-500 hover:text-slate-800 bg-transparent'
                }`}
              >
                {tab.label} ({count})
              </button>
            );
          })}
        </div>
        
        <span className="text-xs font-bold text-slate-400">
          Showing {filteredEvents.length} items
        </span>
      </div>

      {/* Table view */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="text-center py-20 text-slate-400 font-bold text-sm">
            Loading events...
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FolderOpen className="w-14 h-14 text-slate-200 mb-3" />
            <p className="text-slate-400 font-bold text-sm">No events found in this category</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead>
                <tr className="bg-teal-50/20 text-slate-500 font-bold text-xs border-b border-slate-100">
                  <th className="px-6 py-4">Event Name</th>
                  <th className="px-6 py-4">Organizer</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {filteredEvents.map(event => (
                  <tr key={event.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-bold text-slate-800">
                      <div className="flex items-center gap-3">
                        <img 
                          src={event.image || `https://picsum.photos/seed/${encodeURIComponent(event.title || event.name)}/300/200`} 
                          alt="" 
                          className="w-12 h-8 rounded-lg object-cover bg-slate-50 flex-shrink-0"
                          onError={e => { e.currentTarget.src = 'https://picsum.photos/seed/placeholder/300/200'; }}
                        />
                        <span>{event.title || event.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-indigo-500 font-semibold">{event.organizer}</td>
                    <td className="px-6 py-4 text-slate-500">{event.date}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold border text-[10px] ${
                        (event.approvalStatus || 'Approved') === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : (event.approvalStatus || 'Approved') === 'Rejected'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {event.approvalStatus || 'Approved'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedEvent(event)}
                        className="bg-white border border-slate-200 hover:border-teal-500 hover:text-teal-600 p-1.5 rounded-lg text-slate-600 transition-all shadow-sm"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
 
                      {activeTab === 'Pending Approval' && (
                        <>
                          <button
                            onClick={() => handleApprove(event.id, event.title || event.name)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white p-1.5 rounded-lg text-xs font-bold transition-all shadow-sm border-none cursor-pointer"
                            title="Approve Event"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(event.id, event.title || event.name)}
                            className="bg-rose-600 hover:bg-rose-700 text-white p-1.5 rounded-lg text-xs font-bold transition-all shadow-sm border-none cursor-pointer"
                            title="Reject Event"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedEvent(null)} />
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="p-5.5 border-b border-slate-100 flex justify-between items-start">
              <div>
                <span className="text-[10px] font-extrabold uppercase bg-teal-50 text-teal-700 px-2 py-0.5 rounded border border-teal-200 tracking-wider">
                  Event proposal overview
                </span>
                <h3 className="text-base font-black text-slate-800 mt-2">{selectedEvent.title || selectedEvent.name}</h3>
                <p className="text-xs font-bold text-indigo-500 mt-0.5">Proposed by: {selectedEvent.organizer}</p>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Event Banner Image */}
            <div className="h-44 w-full relative bg-gray-100 border-b border-slate-100">
              <img 
                src={selectedEvent.image || `https://picsum.photos/seed/${encodeURIComponent(selectedEvent.title || selectedEvent.name)}/600/300`} 
                alt="" 
                className="w-full h-full object-cover"
                onError={e => { e.currentTarget.src = 'https://picsum.photos/seed/placeholder/600/300'; }}
              />
              <div className="absolute top-3 left-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-[9px] font-extrabold px-2.5 py-1 rounded shadow">
                {selectedEvent.category || 'General'}
              </div>
            </div>

            <div className="p-5.5 space-y-4 text-xs font-medium">
              <div className="space-y-1 text-slate-600">
                <span className="text-[10px] font-bold uppercase text-slate-400">Description</span>
                <p className="bg-slate-50 border border-slate-100 p-3 rounded-lg leading-relaxed text-slate-600">
                  {selectedEvent.description}
                </p>
              </div>

              <div className="flex gap-4">
                <div className="flex-1 space-y-1 text-slate-600">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Proposed Date</span>
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <Calendar className="w-4 h-4 text-teal-600" />
                    <span>{selectedEvent.date}</span>
                  </div>
                </div>
                <div className="flex-1 space-y-1 text-slate-600">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Location</span>
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <MapPin className="w-4 h-4 text-teal-600" />
                    <span className="truncate" title={selectedEvent.location}>{selectedEvent.location}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-slate-600">
                <span>Approval Status:</span>
                <span className={`px-2 py-0.5 rounded font-bold border text-[10px] ${
                  (selectedEvent.approvalStatus || 'Approved') === 'Approved'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : (selectedEvent.approvalStatus || 'Approved') === 'Rejected'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {selectedEvent.approvalStatus || 'Approved'}
                </span>
              </div>
            </div>
 
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              {(selectedEvent.approvalStatus || 'Approved') === 'Pending Approval' && (
                <>
                  <button 
                    onClick={() => handleApprove(selectedEvent.id, selectedEvent.title || selectedEvent.name)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs border-none cursor-pointer"
                  >
                    Approve Event
                  </button>
                  <button 
                    onClick={() => handleReject(selectedEvent.id, selectedEvent.title || selectedEvent.name)}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 rounded-xl text-xs border-none cursor-pointer"
                  >
                    Reject Proposals
                  </button>
                </>
              )}
              <button 
                onClick={() => setSelectedEvent(null)}
                className="bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApproveEvents;
