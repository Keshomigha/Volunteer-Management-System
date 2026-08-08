import { useState, useEffect } from 'react';
import { 
  Building2, Search, Mail, Phone, Award, ShieldAlert, CheckCircle, 
  X, Compass, Calendar, Users, Star, Info, ShieldCheck, Ban
} from 'lucide-react';
import { getOrganizations, getOrganizationById, updateUserStatus } from '../../services/adminService';

const Organizations = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrg, setSelectedOrg] = useState(null); // Profile modal
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const data = await getOrganizations();
      const normalized = data.map(org => ({
        ...org,
        name: org.organizationName || org.name || '',
        status: org.status?.toLowerCase() === 'suspended' ? 'Suspended' : 'Active'
      }));
      setOrganizations(normalized);
    } catch (error) {
      console.error('Error fetching organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleViewProfile = async (org) => {
    try {
      const detailed = await getOrganizationById(org.id);
      const mapped = {
        ...detailed.organization,
        name: detailed.organization.organizationName || detailed.organization.name || '',
        status: detailed.organization.status?.toLowerCase() === 'suspended' ? 'Suspended' : 'Active',
        events: detailed.events || [],
        membersCount: detailed.organization.membersCount || 10,
        eventsHosted: detailed.statistics?.totalEvents || 0,
        totalVolunteerHours: detailed.statistics?.totalVolunteerHours || 0
      };
      setSelectedOrg(mapped);
    } catch (error) {
      console.error("Error loading organization details:", error);
      alert("Failed to load organization details");
    }
  };

  const handleToggleSuspend = async (id, name, currentStatus) => {
    const isCurrentlySuspended = currentStatus === 'Suspended';
    const nextStatusText = isCurrentlySuspended ? 'Active' : 'Suspended';
    const nextStatusValue = isCurrentlySuspended ? 'active' : 'suspended';
    if (!window.confirm(`Are you sure you want to change status of "${name}" to ${nextStatusText}?`)) {
      return;
    }
    try {
      await updateUserStatus(id, nextStatusValue);
      setOrganizations(prev => prev.map(org => 
        org.id === id ? { ...org, status: nextStatusText } : org
      ));
      showToast(`Organization "${name}" status updated to ${nextStatusText}.`);
      
      if (selectedOrg?.id === id) {
        setSelectedOrg(prev => ({ ...prev, status: nextStatusText }));
      }
    } catch (err) {
      console.error("Error updating organization status:", err);
      alert(err.response?.data?.message || err.message || "Failed to update organization status");
    }
  };

  // Filter logic
  const filteredOrgs = organizations.filter(org => 
    org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <Building2 className="w-8 h-8 text-teal-400" /> Organizations
        </h1>
        <p className="text-slate-400 mt-1 font-medium text-sm">Verify, manage, and view performance metrics of student clubs, associations, and NGOs.</p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-teal-50 shadow-sm flex flex-col justify-between min-h-[120px]">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Organizations</span>
          <span className="text-4xl font-extrabold text-slate-800 mt-2">{organizations.length}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-teal-50 shadow-sm flex flex-col justify-between min-h-[120px]">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Organizations</span>
          <span className="text-4xl font-extrabold text-emerald-600 mt-2">{organizations.filter(o => o.status === 'Active').length}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-teal-50 shadow-sm flex flex-col justify-between min-h-[120px]">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Suspended Organizations</span>
          <span className="text-4xl font-extrabold text-rose-600 mt-2">{organizations.filter(o => o.status === 'Suspended').length}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-teal-50 shadow-sm flex flex-col justify-between min-h-[120px]">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Volunteer Hours</span>
          <span className="text-4xl font-extrabold text-indigo-600 mt-2">{organizations.reduce((acc, curr) => acc + curr.totalVolunteerHours, 0)} hrs</span>
        </div>
      </div>

      {/* Search Filter */}
      <div className="bg-white rounded-2xl shadow-sm border border-teal-100 p-4 flex flex-col md:flex-row md:items-center gap-4">
        {/* Search */}
        <div className="flex-1 flex items-center gap-3 bg-teal-50/50 border border-teal-100 px-4 py-2.5 rounded-xl focus-within:border-teal-400 transition-colors">
          <Search className="w-5 h-5 text-teal-600 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by organization name or type..."
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
      </div>

      {/* Organization Cards Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center min-h-[300px] flex flex-col items-center justify-center">
          <p className="text-slate-500 font-semibold animate-pulse text-lg">Loading organizations list...</p>
        </div>
      ) : filteredOrgs.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center min-h-[300px] flex flex-col items-center justify-center">
          <Building2 className="w-12 h-12 text-slate-300 mb-3" />
          <h3 className="text-lg font-bold text-slate-700">No Organizations Found</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrgs.map(org => (
            <div 
              key={org.id}
              className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between min-h-[350px] ${
                org.status === 'Suspended' ? 'border-red-200 opacity-80' : 'border-slate-100 hover:border-teal-100'
              }`}
            >
              {/* Card Body */}
              <div className="p-6 flex flex-col flex-1 justify-between">
                <div className="flex items-start justify-between gap-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100/50 flex items-center justify-center text-teal-600 flex-shrink-0">
                    <Building2 className="w-6 h-6" />
                  </div>

                  <span className={`text-[10px] font-bold border px-2.5 py-1 rounded-full flex items-center gap-1 ${
                    org.status === 'Active' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {org.status === 'Active' ? 'Active' : 'Suspended'}
                  </span>
                </div>

                <div className="mt-4 flex-1">
                  <h3 className="text-lg font-black text-slate-800 line-clamp-1">{org.name}</h3>
                  <p className="text-xs font-bold text-indigo-500 mt-1">{org.type}</p>
                </div>

                {/* Details list */}
                <div className="grid grid-cols-3 gap-2 mt-5 py-4 border-y border-slate-100 text-center text-xs text-slate-600 font-semibold bg-slate-50/50 rounded-xl">
                  <div className="border-r border-slate-200">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">Members</p>
                    <p className="text-sm font-extrabold text-slate-800 mt-1">{org.membersCount}</p>
                  </div>
                  <div className="border-r border-slate-200">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">Events Hosted</p>
                    <p className="text-sm font-extrabold text-slate-800 mt-1">{org.eventsHosted}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">Vol. Hours</p>
                    <p className="text-sm font-extrabold text-teal-600 mt-1">{org.totalVolunteerHours}h</p>
                  </div>
                </div>

                <p className="text-xs font-medium text-slate-500 line-clamp-2 leading-relaxed mt-4 bg-white/50">
                  {org.description}
                </p>
              </div>

              {/* Footer Actions */}
              <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  onClick={() => handleViewProfile(org)}
                  className="flex-1 py-2 bg-white border border-slate-200 hover:border-teal-500 hover:text-teal-600 text-slate-600 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Compass className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>View Profile</span>
                </button>

                <button
                  onClick={() => handleToggleSuspend(org.id, org.name, org.status)}
                  className={`flex-1 py-2 border rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm ${
                    org.status === 'Suspended'
                      ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 hover:border-emerald-300'
                      : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 hover:border-rose-300'
                  }`}
                >
                  <Ban className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{org.status === 'Suspended' ? 'Unsuspend' : 'Suspend'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Profile Modal */}
      {selectedOrg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedOrg(null)} />
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
            {/* Header */}
            <div className="p-5.5 border-b border-slate-100 flex justify-between items-start gap-4">
              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100/50 flex items-center justify-center text-teal-600 flex-shrink-0">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-800 leading-snug">
                    {selectedOrg.name}
                  </h2>
                  <p className="text-xs font-bold text-indigo-500 mt-0.5">{selectedOrg.type}</p>
                </div>
              </div>
              <button onClick={() => setSelectedOrg(null)} className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors border-none bg-transparent cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content area */}
            <div className="p-5.5 space-y-4 overflow-y-auto max-h-[60vh] text-xs font-semibold text-slate-600">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 uppercase">About Organization</span>
                <p className="leading-relaxed bg-slate-50 border border-slate-100 p-3 rounded-lg font-medium">{selectedOrg.description}</p>
              </div>

              <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 text-center">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">Members</p>
                  <p className="text-base font-black text-slate-800 mt-1">{selectedOrg.membersCount}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">Events Hosted</p>
                  <p className="text-base font-black text-slate-800 mt-1">{selectedOrg.eventsHosted}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">Volunteer Hours</p>
                  <p className="text-base font-black text-teal-600 mt-1">{selectedOrg.totalVolunteerHours}h</p>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 uppercase">Contact Information</span>
                <div className="space-y-1 bg-slate-50/50 border border-slate-100 p-3 rounded-lg">
                  <p><strong>Primary Email:</strong> {selectedOrg.email}</p>
                  <p><strong>Contact Head:</strong> {selectedOrg.contactPerson}</p>
                  <p><strong>Contact Telephone:</strong> {selectedOrg.phone}</p>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 uppercase">Recent Events History</span>
                <div className="space-y-1.5">
                  {selectedOrg.events.map((ev, i) => (
                    <div key={i} className="flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-100">
                      <span>{ev.name}</span>
                      <strong className="text-slate-400">{ev.date}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => handleToggleSuspend(selectedOrg.id, selectedOrg.name, selectedOrg.status)}
                className={`font-bold px-4 py-2 rounded-xl text-xs border-none cursor-pointer text-white ${
                  selectedOrg.status === 'Suspended' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {selectedOrg.status === 'Suspended' ? 'Reactivate Organization' : 'Suspend Organization'}
              </button>
              <button 
                onClick={() => setSelectedOrg(null)}
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

export default Organizations;
