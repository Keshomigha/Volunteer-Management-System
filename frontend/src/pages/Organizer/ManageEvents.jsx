import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Pencil, Trash2, Calendar, X, Upload, Image as ImageIcon, Video, Building, Link2 } from 'lucide-react';
import { getMyEvents, updateEvent, deleteEvent } from '../../services/eventService';

const CATEGORIES = ['Community Service', 'Environment', 'Education', 'Health', 'Technology', 'Sports', 'Arts & Culture'];
const STATUSES = ['Draft', 'Upcoming', 'Active', 'Completed', 'Archived'];

const fieldClass =
  'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-base text-gray-700 bg-gray-50 ' +
  'outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all';

const statusStyle = {
  Draft: 'bg-slate-100 text-slate-700',
  Active: 'bg-green-100 text-green-700',
  Upcoming: 'bg-blue-100 text-blue-700',
  Completed: 'bg-purple-100 text-purple-700',
  Archived: 'bg-gray-100 text-gray-600',
};

const approvalStatusStyle = {
  'Pending Approval': 'bg-amber-100 text-amber-700',
  Approved: 'bg-emerald-100 text-emerald-700',
  Rejected: 'bg-rose-100 text-rose-700',
};

const ManageEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [editingEvent, setEditingEvent] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const data = await getMyEvents();
        const normalized = data.map(ev => ({
          ...ev,
          date: ev.eventDate || ev.date || '',
          volunteers: ev.acceptedCount !== undefined ? ev.acceptedCount : (ev.volunteers || 0),
          maxVolunteers: ev.volunteerRequired !== undefined ? ev.volunteerRequired : (ev.maxVolunteers || 30),
          approvalStatus: ev.approvalStatus === 'Pending' ? 'Pending Approval' : ev.approvalStatus
        }));
        setEvents(normalized);
      } catch (err) {
        console.error("Error fetching organizer events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const filtered = events.filter((e) => {
    const matchSearch =
      (e.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (e.category || '').toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' || e.status === filter;
    return matchSearch && matchFilter;
  });

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await deleteEvent(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error("Error deleting event:", err);
      alert(err.response?.data?.message || err.message || "Failed to delete event");
    }
  };

  const openEdit = (event) => {
    setEditingEvent(event);
    setEditForm({
      ...event,
      date: event.eventDate || event.date || '',
      maxVolunteers: event.volunteerRequired || event.maxVolunteers || '',
      image: event.image || '',
      eventType: event.eventType || 'In-Person',
      meetingLink: event.meetingLink || ''
    });
  };

  const closeEdit = () => {
    setEditingEvent(null);
    setEditForm({});
  };

  const handleEditChange = (e) => setEditForm({ ...editForm, [e.target.name]: e.target.value });

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Banner image size should be under 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        title: editForm.title,
        category: editForm.category,
        status: editForm.status,
        eventDate: editForm.date || editForm.eventDate,
        volunteerRequired: parseInt(editForm.maxVolunteers || editForm.volunteerRequired) || 1,
        location: editForm.eventType === 'Online' ? (editForm.location || 'Online Event') : editForm.location,
        eventType: editForm.eventType || 'In-Person',
        meetingLink: editForm.eventType === 'Online' ? (editForm.meetingLink || '') : '',
        description: editForm.description || '',
        skills: editForm.skills ? (Array.isArray(editForm.skills) ? editForm.skills.join(', ') : editForm.skills) : '',
        time: editForm.time || '10:00 AM',
        image: editForm.image || ''
      };

      await updateEvent(editingEvent.id, updateData);

      setEvents((prev) =>
        prev.map((ev) => (ev.id === editingEvent.id ? { 
          ...ev, 
          ...editForm, 
          image: updateData.image, 
          eventType: updateData.eventType,
          meetingLink: updateData.meetingLink,
          eventDate: updateData.eventDate, 
          volunteerRequired: updateData.volunteerRequired 
        } : ev))
      );
      closeEdit();
    } catch (err) {
      console.error("Error updating event:", err);
      alert(err.response?.data?.message || err.message || "Failed to update event");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Manage Events</h1>
          <p className="text-gray-500 text-md mt-0.5">{events.length} total events</p>
        </div>
        <button
          onClick={() => navigate('/organizer/create-event')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
              text-white bg-blue-600 hover:bg-blue-700 transition-all self-start sm:self-auto border-none cursor-pointer"
        >
          <Plus className="w-4 h-4" /> New Event
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 flex-1 border border-gray-200 rounded-xl px-3 py-2
              focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all bg-gray-50">
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events…"
              className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['All', ...STATUSES].map((st) => (
              <button
                key={st} onClick={() => setFilter(st)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                  filter === st
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-4">Event</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Volunteers</th>
                <th className="px-6 py-4">Approval</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-gray-400">Loading events…</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-gray-400">No events found.</td>
                </tr>
              ) : filtered.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-800">
                    <div className="flex items-center gap-3">
                      <img 
                        src={event.image || 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800'} 
                        alt={event.title} 
                        className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-gray-100"
                      />
                      <div>
                        <span>{event.title}</span>
                        {event.eventType === 'Online' && (
                          <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700">
                            Virtual
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{event.category}</td>
                  <td className="px-6 py-4 text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {event.date || 'TBD'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-gray-700">{event.volunteers}</span>
                    <span className="text-gray-400"> / {event.maxVolunteers}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${approvalStatusStyle[event.approvalStatus] || 'bg-amber-100 text-amber-700'}`}>
                      {event.approvalStatus || 'Pending Approval'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyle[event.status] || 'bg-gray-100 text-gray-600'}`}>
                      {event.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(event)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors border-none bg-transparent cursor-pointer"
                        title="Edit Event"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors border-none bg-transparent cursor-pointer"
                        title="Delete Event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Event Modal */}
      {editingEvent && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[2000] flex items-center justify-center p-4 pt-20 transition-all duration-300"
          onClick={(e) => e.target === e.currentTarget && closeEdit()}
        >
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto border border-gray-100 relative">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-800">Edit Event</h2>
              <button
                onClick={closeEdit}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors border-none bg-transparent cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSave} className="space-y-4 text-left">
              <div>
                <label className="block text-base font-medium text-gray-700 mb-1.5">Event Title <span className="text-red-400">*</span></label>
                <input name="title" value={editForm.title || ''} onChange={handleEditChange} required className={fieldClass} />
              </div>

              {/* Event Mode (In-Person vs Virtual) */}
              <div>
                <label className="block text-base font-medium text-gray-700 mb-1.5">
                  Event Mode & Platform
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                  <button
                    type="button"
                    onClick={() => setEditForm(prev => ({ ...prev, eventType: 'In-Person' }))}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                      (editForm.eventType || 'In-Person') === 'In-Person'
                        ? 'bg-blue-50 border-blue-600 text-blue-700 ring-2 ring-blue-100'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Building className="w-4 h-4" /> In-Person Event
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditForm(prev => ({ 
                      ...prev, 
                      eventType: 'Online',
                      location: prev.location || 'Online Event'
                    }))}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                      editForm.eventType === 'Online'
                        ? 'bg-purple-50 border-purple-600 text-purple-700 ring-2 ring-purple-100'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Video className="w-4 h-4" /> Online / Virtual Event
                  </button>
                </div>
              </div>

              {/* Zoom / Virtual Meeting Link Field */}
              {editForm.eventType === 'Online' && (
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-1.5">
                    Zoom / Virtual Meeting Link <span className="text-red-400">*</span>
                  </label>
                  <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2.5 gap-2 bg-gray-50 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-100 transition-all">
                    <Link2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    <input
                      type="url"
                      name="meetingLink"
                      value={editForm.meetingLink || ''}
                      onChange={handleEditChange}
                      required={editForm.eventType === 'Online'}
                      placeholder="https://zoom.us/j/123456789 or https://meet.google.com/abc-defg"
                      className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent w-full"
                    />
                  </div>
                </div>
              )}

              {/* Event Image Banner Upload & URL Input */}
              <div>
                <label className="block text-base font-medium text-gray-700 mb-1.5">
                  Event Banner Image
                </label>
                
                {/* Image Preview */}
                {editForm.image && (
                  <div className="relative mb-2.5 rounded-xl overflow-hidden border border-gray-200 h-36 bg-gray-100 flex items-center justify-center">
                    <img 
                      src={editForm.image} 
                      alt="Banner Preview" 
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setEditForm(prev => ({ ...prev, image: '' }))}
                      className="absolute top-2 right-2 bg-slate-900/75 hover:bg-slate-900 text-white p-1 rounded-full backdrop-blur-sm transition-all border-none cursor-pointer"
                      title="Remove Image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2 mb-2">
                  <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 border border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer transition-all text-xs font-semibold text-gray-700">
                    <Upload className="w-4 h-4 text-blue-600" />
                    <span>{editForm.image ? 'Upload New Image File' : 'Upload Image File'}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageFileChange} 
                      className="hidden" 
                    />
                  </label>
                </div>

                <input
                  type="text"
                  name="image"
                  placeholder="Or paste image URL (e.g. https://...)"
                  value={editForm.image || ''}
                  onChange={handleEditChange}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-700 bg-gray-50 outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-1.5">Category <span className="text-red-400">*</span></label>
                  <select name="category" value={editForm.category || ''} onChange={handleEditChange} required className={fieldClass}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-1.5">Status <span className="text-red-400">*</span></label>
                  <select name="status" value={editForm.status || ''} onChange={handleEditChange} required className={fieldClass}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-1.5">Date <span className="text-red-400">*</span></label>
                  <input type="date" name="date" value={editForm.date || ''} onChange={handleEditChange} required className={fieldClass} />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-1.5">Max Volunteers <span className="text-red-400">*</span></label>
                  <input type="number" name="maxVolunteers" value={editForm.maxVolunteers || ''} onChange={handleEditChange} required min="1" className={fieldClass} />
                </div>
              </div>

              <div>
                <label className="block text-base font-medium text-gray-700 mb-1.5">Location / Venue <span className="text-red-400">*</span></label>
                <input name="location" value={editForm.location || ''} onChange={handleEditChange} required className={fieldClass} />
              </div>

              <div>
                <label className="block text-base font-medium text-gray-700 mb-1.5">Description</label>
                <textarea 
                  name="description" 
                  value={editForm.description || ''} 
                  onChange={handleEditChange} 
                  rows="3" 
                  className={fieldClass}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm
                            bg-blue-600 hover:bg-blue-700 transition-all border-none cursor-pointer"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={closeEdit}
                  className="px-5 py-2.5 rounded-xl text-blue-600 font-semibold text-sm
                            border border-blue-200 hover:bg-blue-50 transition-all cursor-pointer bg-transparent"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageEvents;
