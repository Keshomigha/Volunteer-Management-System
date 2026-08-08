import { useState, useEffect } from 'react';
import { 
  CalendarRange, Search, Calendar, Users, Eye, Edit, Archive, X, CheckCircle, SlidersHorizontal, MapPin
} from 'lucide-react';
import { getAdminEvents } from '../../services/adminService';
import { updateEvent, deleteEvent } from '../../services/eventService';

const ManageEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, active, archived
  const [selectedEvent, setSelectedEvent] = useState(null); // view modal
  const [editingEvent, setEditingEvent] = useState(null); // edit modal
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await getAdminEvents();
      const normalized = data.map(ev => ({
        id: ev.id,
        name: ev.title || ev.name || '',
        organizer: ev.User?.name || ev.organizer || '',
        date: ev.eventDate || ev.date || '',
        applicationsCount: ev.applicationsCount || 0,
        attendanceCount: ev.attendanceCount || 0,
        location: ev.location || '',
        description: ev.description || '',
        archived: ev.status === 'Archived',
        status: ev.status,
        volunteerRequired: ev.volunteerRequired || 30
      }));
      setEvents(normalized);
    } catch (error) {
      console.error('Error fetching admin events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleArchive = async (id, name, isArchived) => {
    const actionText = isArchived ? 'unarchive' : 'archive';
    if (!window.confirm(`Are you sure you want to ${actionText} "${name}"?`)) {
      return;
    }
    try {
      if (isArchived) {
        // Unarchive: set status to Upcoming or Active
        await updateEvent(id, { status: 'Upcoming' });
        setEvents(prev => prev.map(ev => ev.id === id ? { ...ev, archived: false, status: 'Upcoming' } : ev));
        showToast(`Event "${name}" was unarchived.`);
        if (selectedEvent?.id === id) {
          setSelectedEvent(prev => ({ ...prev, archived: false, status: 'Upcoming' }));
        }
      } else {
        // Archive
        await deleteEvent(id);
        setEvents(prev => prev.map(ev => ev.id === id ? { ...ev, archived: true, status: 'Archived' } : ev));
        showToast(`Event "${name}" was archived.`);
        if (selectedEvent?.id === id) {
          setSelectedEvent(prev => ({ ...prev, archived: true, status: 'Archived' }));
        }
      }
    } catch (err) {
      console.error("Error toggling event archive:", err);
      alert(err.response?.data?.message || err.message || "Failed to change event archive state");
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const { id, name, date, location, description, volunteerRequired, organizer, applicationsCount, attendanceCount, image } = editingEvent;
    
    try {
      const updateData = {
        title: name,
        eventDate: date,
        location,
        description,
        volunteerRequired: parseInt(volunteerRequired) || 30,
        image: image || ''
      };
      
      await updateEvent(id, updateData);
      
      setEvents(prev => prev.map(ev => 
        ev.id === id 
          ? { 
              ...ev, 
              name, 
              date, 
              location, 
              description,
              image: updateData.image,
              volunteerRequired: parseInt(volunteerRequired) || 30
            } 
          : ev
      ));
      showToast('Event updated successfully.');
      setEditingEvent(null);
    } catch (err) {
      console.error("Error updating event:", err);
      alert(err.response?.data?.message || err.message || "Failed to update event");
    }
  };

  // Filter events
  const filteredEvents = events.filter(ev => {
    const matchesSearch = 
      ev.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.organizer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = 
      filterType === 'all' || 
      (filterType === 'active' && !ev.archived) || 
      (filterType === 'archived' && ev.archived);

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 text-[#1E293B]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-teal-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <CalendarRange className="w-8 h-8 text-teal-400" /> Manage Events
        </h1>
        <p className="text-slate-400 mt-1 font-medium text-sm">Monitor active and archived events, track application rates and volunteer attendance.</p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-teal-50 shadow-sm flex flex-col justify-between min-h-[120px]">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Events</span>
          <span className="text-4xl font-extrabold text-slate-800 mt-2">{events.length}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-teal-50 shadow-sm flex flex-col justify-between min-h-[120px]">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Events</span>
          <span className="text-4xl font-extrabold text-emerald-600 mt-2">{events.filter(e => !e.archived).length}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-teal-50 shadow-sm flex flex-col justify-between min-h-[120px]">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Archived Events</span>
          <span className="text-4xl font-extrabold text-slate-500 mt-2">{events.filter(e => e.archived).length}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-teal-50 shadow-sm flex flex-col justify-between min-h-[120px]">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Applications</span>
          <span className="text-4xl font-extrabold text-indigo-600 mt-2">{events.reduce((acc, curr) => acc + curr.applicationsCount, 0)}</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-teal-100 p-4 flex flex-col md:flex-row md:items-center gap-4">
        {/* Search */}
        <div className="flex-1 flex items-center gap-3 bg-teal-50/50 border border-teal-100 px-4 py-2.5 rounded-xl focus-within:border-teal-400 transition-colors">
          <Search className="w-5 h-5 text-teal-600 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search events by name or organizer..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-slate-700 placeholder-slate-400 text-sm"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="bg-white border border-teal-100 px-3 py-2.5 rounded-xl text-sm text-slate-600 outline-none focus:border-teal-400 cursor-pointer"
          >
            <option value="all">All Events</option>
            <option value="active">Active Only</option>
            <option value="archived">Archived Only</option>
          </select>
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center min-h-[300px] flex flex-col items-center justify-center">
          <p className="text-slate-500 font-semibold animate-pulse text-lg">Loading events list...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center min-h-[300px] flex flex-col items-center justify-center">
          <CalendarRange className="w-12 h-12 text-slate-300 mb-3" />
          <h3 className="text-lg font-bold text-slate-700">No Events Found</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(event => (
            <div 
              key={event.id}
              className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group min-h-[360px] ${
                event.archived ? 'border-slate-200 opacity-75' : 'border-slate-100 hover:border-teal-200'
              }`}
            >
              {/* Body */}
              <div className="p-6 flex flex-col flex-1 justify-between">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-extrabold uppercase bg-teal-50 text-teal-700 px-2 py-0.5 rounded border border-teal-100 tracking-wider">
                    {event.id}
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                    event.archived 
                      ? 'bg-slate-100 text-slate-600 border-slate-300' 
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {event.archived ? 'Archived' : 'Active'}
                  </span>
                </div>

                <div className="mt-4 flex-1">
                  <h3 className="text-base font-black text-slate-800 line-clamp-2 group-hover:text-teal-600 transition-colors" title={event.name}>
                    {event.name}
                  </h3>
                  <div className="mt-3 space-y-1.5 text-xs text-slate-500 font-medium">
                    <p className="flex items-center gap-1.5">
                      <span className="text-slate-400 font-normal">Organizer:</span>
                      <span className="text-indigo-600 font-bold">{event.organizer}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className="text-slate-400 font-normal">Date:</span>
                      <span className="text-slate-700 font-semibold">{event.date}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
                  <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100/60 flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Applications</span>
                    <span className="text-base font-extrabold text-slate-800 mt-1">{event.applicationsCount}</span>
                  </div>
                  <div className="bg-emerald-50/20 p-3 rounded-xl border border-emerald-100/30 flex flex-col">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Attendance</span>
                    <span className="text-base font-extrabold text-emerald-600 mt-1">{event.attendanceCount}</span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  onClick={() => setSelectedEvent(event)}
                  className="flex-1 py-2 bg-white border border-slate-200 hover:border-teal-500 hover:text-teal-600 text-slate-600 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>View</span>
                </button>
                <button
                  onClick={() => setEditingEvent(event)}
                  className="flex-1 py-2 bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-600 text-slate-600 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Edit className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleArchive(event.id, event.name, event.archived)}
                  className={`flex-1 py-2 border rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm ${
                    event.archived
                      ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 hover:border-emerald-300'
                      : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 hover:border-rose-300'
                  }`}
                  title={event.archived ? 'Reactivate' : 'Archive Event'}
                >
                  <Archive className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{event.archived ? 'Activate' : 'Archive'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedEvent(null)} />
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="p-5.5 border-b border-slate-100 flex justify-between items-start">
              <div>
                <span className="text-[10px] font-extrabold uppercase bg-teal-50 text-teal-700 px-2 py-0.5 rounded border border-teal-200 tracking-wider">
                  Event detail overview
                </span>
                <h3 className="text-base font-black text-slate-800 mt-2">{selectedEvent.name}</h3>
                <p className="text-xs font-bold text-indigo-500 mt-0.5">Organized by: {selectedEvent.organizer}</p>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5.5 space-y-4 text-xs font-medium text-slate-600">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">About Event</span>
                <p className="bg-slate-50 border border-slate-100 p-3 rounded-lg leading-relaxed">{selectedEvent.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Date</span>
                  <div className="flex items-center gap-1 font-bold text-slate-700">
                    <Calendar className="w-4 h-4 text-teal-600" />
                    <span>{selectedEvent.date}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Location</span>
                  <div className="flex items-center gap-1 font-bold text-slate-700">
                    <MapPin className="w-4 h-4 text-teal-600" />
                    <span className="truncate" title={selectedEvent.location}>{selectedEvent.location}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100 text-center">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Applications</p>
                  <p className="text-lg font-black text-slate-800 mt-1">{selectedEvent.applicationsCount}</p>
                </div>
                <div className="bg-emerald-50/20 p-2.5 rounded-lg border border-emerald-50">
                  <p className="text-[10px] text-emerald-700 uppercase font-bold">Attendance</p>
                  <p className="text-lg font-black text-emerald-700 mt-1">{selectedEvent.attendanceCount}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => handleArchive(selectedEvent.id, selectedEvent.name, selectedEvent.archived)}
                className={`font-bold px-4 py-2 rounded-xl text-xs border-none cursor-pointer text-white ${
                  selectedEvent.archived ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {selectedEvent.archived ? 'Activate Event' : 'Archive Event'}
              </button>
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

      {/* Edit modal */}
      {editingEvent && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 pt-20">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setEditingEvent(null)} />
          <form onSubmit={handleSaveEdit} className="relative bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="p-5.5 border-b border-slate-100 flex justify-between items-start">
              <div>
                <span className="text-[10px] font-extrabold uppercase bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200 tracking-wider">
                  Edit event card details
                </span>
                <h3 className="text-base font-black text-slate-800 mt-2">Modify Details</h3>
              </div>
              <button type="button" onClick={() => setEditingEvent(null)} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5.5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-500 uppercase mb-1">Event Name</label>
                <input 
                  type="text" 
                  value={editingEvent.name}
                  onChange={e => setEditingEvent({ ...editingEvent, name: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-slate-800 font-semibold outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 uppercase mb-1">Event Banner Image</label>
                {editingEvent.image && (
                  <div className="relative mb-2 rounded-lg overflow-hidden border border-slate-200 h-28 bg-slate-100 flex items-center justify-center">
                    <img src={editingEvent.image} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setEditingEvent({ ...editingEvent, image: '' })}
                      className="absolute top-1.5 right-1.5 bg-slate-900/80 text-white p-1 rounded-full border-none cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                <input 
                  type="text" 
                  placeholder="Paste banner image URL"
                  value={editingEvent.image || ''}
                  onChange={e => setEditingEvent({ ...editingEvent, image: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-slate-800 font-semibold outline-none focus:border-teal-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 uppercase mb-1">Organizer Club</label>
                <input 
                  type="text" 
                  value={editingEvent.organizer}
                  onChange={e => setEditingEvent({ ...editingEvent, organizer: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-slate-800 font-semibold outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-500 uppercase mb-1">Date</label>
                  <input 
                    type="date" 
                    value={editingEvent.date}
                    onChange={e => setEditingEvent({ ...editingEvent, date: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-slate-800 font-semibold outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 uppercase mb-1">Location</label>
                  <input 
                    type="text" 
                    value={editingEvent.location}
                    onChange={e => setEditingEvent({ ...editingEvent, location: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-slate-800 font-semibold outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-500 uppercase mb-1">Applications Count</label>
                  <input 
                    type="number" 
                    value={editingEvent.applicationsCount}
                    onChange={e => setEditingEvent({ ...editingEvent, applicationsCount: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-slate-800 font-semibold outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 uppercase mb-1">Attendance Count</label>
                  <input 
                    type="number" 
                    value={editingEvent.attendanceCount}
                    onChange={e => setEditingEvent({ ...editingEvent, attendanceCount: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-slate-800 font-semibold outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-500 uppercase mb-1">Description</label>
                <textarea 
                  value={editingEvent.description}
                  onChange={e => setEditingEvent({ ...editingEvent, description: e.target.value })}
                  rows="3"
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-slate-800 font-semibold outline-none focus:border-teal-500 resize-none"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button 
                type="button"
                onClick={() => setEditingEvent(null)}
                className="bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2 rounded-xl text-xs border-none cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ManageEvents;
