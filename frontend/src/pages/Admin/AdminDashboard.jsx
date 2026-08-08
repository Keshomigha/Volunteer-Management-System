import { useState, useEffect } from 'react';
import { 
  Users, Compass, CalendarCheck, Clock, Award, FileText, CheckCircle, Bell
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, AreaChart, Area 
} from 'recharts';
import { getAdminDashboard } from '../../services/adminService';

const AdminDashboard = () => {
  const [toastMessage, setToastMessage] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await getAdminDashboard();
        setData(res);
      } catch (err) {
        console.error("Failed to load admin dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-[#14B8A6] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium">Loading admin dashboard...</p>
      </div>
    );
  }

  const stats = [
    { label: 'Total Students', value: data?.totalStudents || 0, icon: Users, gradient: 'from-[#14B8A6] to-[#6EE7D8]' },
    { label: 'Total Organizers', value: data?.totalOrganizers || 0, icon: Compass, gradient: 'from-indigo-400 to-indigo-300' },
    { label: 'Total Events', value: data?.approvedEvents !== undefined ? data.approvedEvents : (data?.totalEvents || 0), icon: CalendarCheck, gradient: 'from-sky-400 to-sky-300' },
    { label: 'Pending Approvals', value: data?.pendingEvents || 0, icon: Clock, gradient: 'from-amber-400 to-amber-300' },
    { label: 'Total Applications', value: data?.totalApplications || 0, icon: FileText, gradient: 'from-emerald-400 to-emerald-300' },
    { label: 'Certificates Generated', value: data?.totalCertificates || 0, icon: Award, gradient: 'from-rose-400 to-rose-300' },
  ];

  const registrationsData = (data?.userGrowth || []).map(u => ({
    name: u.name,
    Students: u.students,
    Organizers: u.organizers
  }));

  const eventsCreatedData = (data?.eventTrends || []).map(e => ({
    name: e.name,
    Events: e.events
  }));

  const participationTrendData = (data?.eventTrends || []).map(e => ({
    name: e.name,
    Registrations: e.participation,
    Attendance: e.attendance !== undefined ? e.attendance : 0
  }));

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
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Admin Executive Overview</h1>
        <p className="text-slate-400 mt-1 font-medium text-sm">Real-time system statistics, volunteer participation, and platform metrics.</p>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        {stats.map(({ label, value, icon: Icon, gradient }) => (
          <div 
            key={label} 
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between transition-all duration-200 hover:scale-[1.02] hover:shadow-md cursor-pointer"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="mt-4">
              <p className="text-2xl font-black text-[#1E293B] tracking-tight">{value}</p>
              <p className="text-xs font-semibold text-[#64748B] mt-0.5 leading-snug">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recharts Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: User Registrations */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#1E293B] uppercase tracking-wider text-slate-400 mb-4">
              User Registrations by Month
            </h3>
            <div className="h-64 text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={registrationsData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="name" stroke="#64748B" />
                  <YAxis stroke="#64748B" />
                  <Tooltip contentStyle={{ borderRadius: '12px', borderColor: '#E2E8F0' }} />
                  <Legend iconType="circle" />
                  <Line type="monotone" dataKey="Students" stroke="#14B8A6" strokeWidth={3} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="Organizers" stroke="#6366F1" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Chart 2: Events Created */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#1E293B] uppercase tracking-wider text-slate-400 mb-4">
              Events Created by Month
            </h3>
            <div className="h-64 text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={eventsCreatedData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="name" stroke="#64748B" />
                  <YAxis stroke="#64748B" />
                  <Tooltip contentStyle={{ borderRadius: '12px', borderColor: '#E2E8F0' }} />
                  <Legend iconType="circle" />
                  <Bar dataKey="Events" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Chart 3: Volunteer Participation Trend */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#1E293B] uppercase tracking-wider text-slate-400 mb-4">
              Volunteer Participation Trend
            </h3>
            <div className="h-64 text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={participationTrendData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#14B8A6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="name" stroke="#64748B" />
                  <YAxis stroke="#64748B" />
                  <Tooltip contentStyle={{ borderRadius: '12px', borderColor: '#E2E8F0' }} />
                  <Legend iconType="circle" />
                  <Area type="monotone" dataKey="Registrations" stroke="#14B8A6" strokeWidth={2.5} fillOpacity={1} fill="url(#regGrad)" />
                  <Area type="monotone" dataKey="Attendance" stroke="#6366F1" strokeWidth={2.5} fillOpacity={1} fill="url(#attGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
