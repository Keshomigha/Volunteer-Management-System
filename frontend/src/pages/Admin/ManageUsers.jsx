import { useState, useEffect } from 'react';
import { 
  Users, Search, GraduationCap, Briefcase, 
  Edit, X, Ban, CheckCircle, Eye
} from 'lucide-react';
import { getAdminUsers, updateAdminUser, updateUserStatus } from '../../services/adminService';

const initials = name => {
  if (!name) return 'U';
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase().slice(0, 2);
};

const ManageUsers = () => {
  const [activeTab, setActiveTab] = useState('students'); // students, organizers
  const [students, setStudents] = useState([]);
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modals state
  const [selectedUser, setSelectedUser] = useState(null); // for viewing
  const [editingUser, setEditingUser] = useState(null); // for editing
  const [toastMessage, setToastMessage] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getAdminUsers();
      
      const studentsList = data
        .filter(u => u.role === 'student')
        .map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          reputationPoints: u.reputationPoints !== undefined ? u.reputationPoints : (u.eventsCount * 80),
          joinedEvents: u.eventsCount || 0,
          status: u.status === 'suspended' ? 'Suspended' : 'Active',
          role: 'Student'
        }));

      const organizersList = data
        .filter(u => u.role === 'organizer')
        .map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          eventsCreated: u.eventsCount || 0,
          status: u.status === 'suspended' ? 'Suspended' : 'Approved',
          role: 'Organizer'
        }));

      setStudents(studentsList);
      setOrganizers(organizersList);
    } catch (err) {
      console.error("Error loading admin users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Actions for Students
  const handleSuspendStudent = async (id, name, currentStatus) => {
    const nextStatus = currentStatus === 'Suspended' ? 'active' : 'suspended';
    const confirmLabel = currentStatus === 'Suspended' ? 'activate' : 'suspend';
    if (!window.confirm(`Are you sure you want to change "${name}" status to ${confirmLabel}?`)) {
      return;
    }
    try {
      await updateUserStatus(id, nextStatus);
      showToast(`Student "${name}" is now ${nextStatus === 'active' ? 'Active' : 'Suspended'}.`);
      await loadUsers();
    } catch (err) {
      console.error("Error updating user status:", err);
      alert(err.response?.data?.message || err.message || "Failed to update status");
    }
  };

  // Actions for Organizers
  const handleSuspendOrganizer = async (id, name, currentStatus) => {
    const nextStatus = currentStatus === 'Suspended' ? 'active' : 'suspended';
    const confirmLabel = currentStatus === 'Suspended' ? 'activate' : 'suspend';
    if (!window.confirm(`Are you sure you want to change "${name}" status to ${confirmLabel}?`)) {
      return;
    }
    try {
      await updateUserStatus(id, nextStatus);
      showToast(`Organizer "${name}" status updated to ${nextStatus === 'active' ? 'Approved' : 'Suspended'}.`);
      await loadUsers();
    } catch (err) {
      console.error("Error updating organizer status:", err);
      alert(err.response?.data?.message || err.message || "Failed to update status");
    }
  };

  const handleApproveOrganizer = async (id, name) => {
    if (!window.confirm(`Are you sure you want to approve the organizer "${name}"?`)) {
      return;
    }
    try {
      await updateUserStatus(id, 'active');
      showToast(`Organizer "${name}" has been approved.`);
      await loadUsers();
    } catch (err) {
      console.error("Error approving organizer:", err);
      alert(err.response?.data?.message || err.message || "Failed to approve organizer");
    }
  };

  // Save Edit Student Handler
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const { id, name, email, role } = editingUser;
    try {
      await updateAdminUser(id, { name, email });
      showToast(`${role} details updated.`);
      setEditingUser(null);
      await loadUsers();
    } catch (err) {
      console.error("Error editing user details:", err);
      alert(err.response?.data?.message || err.message || "Failed to update user details");
    }
  };

  // Filters
  const filteredStudents = students.filter(s => 
    (s.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const filteredOrganizers = organizers.filter(o => 
    (o.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (o.email || '').toLowerCase().includes(search.toLowerCase())
  );

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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Users className="w-8 h-8 text-teal-400" /> User Management
          </h1>
          <p className="text-slate-400 mt-1 font-medium text-sm">Manage student volunteers and organization accounts.</p>
        </div>
      </div>

      {/* Tabs & Search Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-teal-100 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Toggle tabs */}
        <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100 w-full md:w-auto">
          <button
            onClick={() => { setActiveTab('students'); setSearch(''); }}
            className={`flex-1 md:flex-initial px-6 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 border-none cursor-pointer ${
              activeTab === 'students'
                ? 'bg-white text-teal-600 shadow-sm border border-teal-50'
                : 'text-slate-500 hover:text-slate-800 bg-transparent'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Students ({students.length})</span>
          </button>
          <button
            onClick={() => { setActiveTab('organizers'); setSearch(''); }}
            className={`flex-1 md:flex-initial px-6 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 border-none cursor-pointer ${
              activeTab === 'organizers'
                ? 'bg-white text-indigo-600 shadow-sm border border-indigo-50'
                : 'text-slate-500 hover:text-slate-800 bg-transparent'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Organizers ({organizers.length})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="w-full md:w-72 flex items-center gap-3 bg-teal-50/50 border border-teal-100 px-4 py-2 rounded-xl focus-within:border-teal-400 transition-colors">
          <Search className="w-4 h-4 text-teal-600 flex-shrink-0" />
          <input
            type="text"
            placeholder={activeTab === 'students' ? 'Search students...' : 'Search organizers...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-slate-700 placeholder-slate-400 text-xs"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Grid/Table content */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="text-center py-20 text-slate-400 font-bold text-sm">
            Loading users...
          </div>
        ) : activeTab === 'students' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead>
                <tr className="bg-teal-50/20 text-slate-500 font-bold text-xs border-b border-slate-100">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4 text-center">Reputation Points</th>
                  <th className="px-6 py-4 text-center">Joined Events</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {filteredStudents.map(student => (
                  <tr key={student.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-bold text-slate-800">{student.name}</td>
                    <td className="px-6 py-4 text-slate-500">{student.email}</td>
                    <td className="px-6 py-4 text-center font-bold text-teal-600">{student.reputationPoints} RP</td>
                    <td className="px-6 py-4 text-center font-semibold text-slate-600">{student.joinedEvents}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold border text-[10px] ${
                        student.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedUser(student)}
                        className="bg-white border border-slate-200 hover:border-teal-500 hover:text-teal-600 p-1.5 rounded-lg text-slate-600 transition-all shadow-sm"
                        title="View details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingUser(student)}
                        className="bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-600 p-1.5 rounded-lg text-slate-600 transition-all shadow-sm"
                        title="Edit profile"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleSuspendStudent(student.id, student.name, student.status)}
                        className={`p-1.5 rounded-lg border transition-all ${
                          student.status === 'Suspended'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                            : 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                        }`}
                        title={student.status === 'Suspended' ? 'Unsuspend' : 'Suspend Student'}
                      >
                        <Ban className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead>
                <tr className="bg-indigo-50/20 text-slate-500 font-bold text-xs border-b border-slate-100">
                  <th className="px-6 py-4">Organization</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4 text-center">Events Created</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {filteredOrganizers.map(org => (
                  <tr key={org.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-bold text-slate-800">{org.name}</td>
                    <td className="px-6 py-4 text-slate-500">{org.email}</td>
                    <td className="px-6 py-4 text-center font-semibold text-slate-600">{org.eventsCreated}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold border text-[10px] ${
                        org.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : org.status === 'Pending'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {org.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedUser(org)}
                        className="bg-white border border-slate-200 hover:border-indigo-500 hover:text-indigo-600 p-1.5 rounded-lg text-slate-600 transition-all shadow-sm"
                        title="View details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      
                      {org.status === 'Pending' && (
                        <button
                          onClick={() => handleApproveOrganizer(org.id, org.name)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white p-1.5 rounded-lg text-xs font-bold transition-all shadow-sm border-none cursor-pointer"
                          title="Approve Organizer"
                        >
                          Approve
                        </button>
                      )}

                      <button
                        onClick={() => handleSuspendOrganizer(org.id, org.name, org.status)}
                        className={`p-1.5 rounded-lg border transition-all ${
                          org.status === 'Suspended'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                            : 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                        }`}
                        title={org.status === 'Suspended' ? 'Approve/Reactivate' : 'Suspend Organization'}
                      >
                        <Ban className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details View Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedUser(null)} />
          <div className="relative bg-white w-full max-w-sm rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="p-5.5 border-b border-slate-100 flex justify-between items-start">
              <div>
                <span className="text-[10px] font-extrabold uppercase bg-teal-50 text-teal-700 px-2 py-0.5 rounded border border-teal-200 tracking-wider">
                  {selectedUser.role} Detail Profile
                </span>
                <h3 className="text-base font-black text-slate-800 mt-2">{selectedUser.name}</h3>
              </div>
              <button onClick={() => setSelectedUser(null)} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-5.5 space-y-4 text-xs font-medium text-slate-600">
              <div className="flex justify-between py-1 border-b border-slate-55">
                <span>Email Address:</span>
                <strong className="text-slate-800">{selectedUser.email}</strong>
              </div>
              
              {selectedUser.role === 'Student' ? (
                <>
                  <div className="flex justify-between py-1 border-b border-slate-55">
                    <span>Reputation Points:</span>
                    <strong className="text-teal-600">{selectedUser.reputationPoints} RP</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-55">
                    <span>Joined Events count:</span>
                    <strong className="text-slate-800">{selectedUser.joinedEvents} events</strong>
                  </div>
                </>
              ) : (
                <div className="flex justify-between py-1 border-b border-slate-55">
                  <span>Events Created:</span>
                  <strong className="text-slate-800">{selectedUser.eventsCreated} events</strong>
                </div>
              )}

              <div className="flex justify-between py-1">
                <span>Account Status:</span>
                <span className={`px-2 py-0.5 rounded font-bold border text-[10px] ${
                  selectedUser.status === 'Active' || selectedUser.status === 'Approved'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                  {selectedUser.status}
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setSelectedUser(null)}
                className="bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit View Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setEditingUser(null)} />
          <form onSubmit={handleSaveEdit} className="relative bg-white w-full max-w-sm rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="p-5.5 border-b border-slate-100 flex justify-between items-start">
              <div>
                <span className="text-[10px] font-extrabold uppercase bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200 tracking-wider">
                  Edit {editingUser.role} Profile
                </span>
                <h3 className="text-base font-black text-slate-800 mt-2">Modify Details</h3>
              </div>
              <button type="button" onClick={() => setEditingUser(null)} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5.5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-500 uppercase mb-1">Name</label>
                <input 
                  type="text" 
                  value={editingUser.name}
                  onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-25 px-3 py-2 rounded-lg text-slate-800 font-semibold outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 uppercase mb-1">Email</label>
                <input 
                  type="email" 
                  value={editingUser.email}
                  onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-25 px-3 py-2 rounded-lg text-slate-800 font-semibold outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button 
                type="button"
                onClick={() => setEditingUser(null)}
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

export default ManageUsers;
