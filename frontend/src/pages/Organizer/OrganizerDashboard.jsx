import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Calendar, Users, UserCheck, TrendingUp,
  CheckCircle, XCircle, Clock, Eye, Edit,
  Activity, MapPin, User, ChevronRight, X, Sparkles
} from 'lucide-react';
import { getOrganizerDashboardStats } from '../../services/eventService';
import { approveApplication, rejectApplication } from '../../services/applicationService';
import { bulkMarkAttendance } from '../../services/attendanceService';

const PIE_COLORS = ['#06B6D4', '#0284C7', '#0EA5E9', '#38BDF8'];

const statusStyle = {
  Pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200 border-solid border',
  Approved: 'bg-emerald-100 text-emerald-800 border border-emerald-200 border-solid border',
  Completed: 'bg-indigo-100 text-indigo-800 border border-indigo-200 border-solid border',
  Rejected: 'bg-rose-100 text-rose-800 border border-rose-200 border-solid border',
};

const appStatusStyle = {
  Pending: 'bg-yellow-100 text-yellow-700 font-semibold',
  Approved: 'bg-green-100 text-green-700 font-semibold',
  Rejected: 'bg-red-100 text-red-600 font-semibold',
};

const StatusIcon = ({ status }) => {
  if (status === 'Approved') return <CheckCircle className="w-3.5 h-3.5" />;
  if (status === 'Rejected') return <XCircle className="w-3.5 h-3.5" />;
  return <Clock className="w-3.5 h-3.5" />;
};

const OrganizerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Lists populated either from database or fall back to mock data
  const [eventsList, setEventsList] = useState([]);
  const [applicationsList, setApplicationsList] = useState([]);
  const [volunteersList, setVolunteersList] = useState([]);
  const [performanceList, setPerformanceList] = useState([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await getOrganizerDashboardStats();
      setDashboardData(res);
      setEventsList(res.myCreatedEvents || []);
      setApplicationsList(res.recentApplications || []);
      setVolunteersList(res.approvedVolunteers || []);
      setPerformanceList(res.eventPerformanceSummary || []);
      setError(null);
    } catch (err) {
      console.error("Failed to load organizer dashboard data:", err);
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleApproveApplication = async (appId) => {
    try {
      setActionLoading(true);
      await approveApplication(appId);
      await fetchDashboardData();
    } catch (err) {
      alert("Failed to approve application: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectApplication = async (appId) => {
    try {
      setActionLoading(true);
      await rejectApplication(appId);
      await fetchDashboardData();
    } catch (err) {
      alert("Failed to reject application: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleAttendance = async (volunteer) => {
    try {
      setActionLoading(true);
      const newStatus = volunteer.attendanceStatus === "Present" ? "Absent" : "Present";
      await bulkMarkAttendance(volunteer.eventId, [
        { userId: volunteer.studentId, status: newStatus }
      ]);
      await fetchDashboardData();
    } catch (err) {
      alert("Failed to update volunteer attendance: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] py-12">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium animate-pulse">Loading organizer dashboard...</p>
      </div>
    );
  }

  const lineChartData = dashboardData?.lineData || [];
  const pieChartData = dashboardData?.pieData || [];

  const stats = [
    { label: 'Active Events', value: dashboardData?.activeEvents || 0, icon: Calendar, color: 'from-blue-500 to-blue-600' },
    { label: 'Total Applications', value: dashboardData?.totalApplications || 0, icon: Users, color: 'from-blue-500 to-blue-600' },
    { label: 'Approved Volunteers', value: dashboardData?.approvedVolunteersCount || (Array.isArray(dashboardData?.approvedVolunteers) ? dashboardData.approvedVolunteers.length : 0), icon: UserCheck, color: 'from-blue-500 to-blue-600' },
    { label: 'Success Rate', value: dashboardData?.successRate || '0%', icon: TrendingUp, color: 'from-blue-500 to-blue-600' },
  ];

  return (
    <div className={`space-y-8 pb-12 relative ${actionLoading ? 'opacity-80 pointer-events-none transition-opacity duration-200' : ''}`}>

      {/* Action Overlay Loader */}
      {actionLoading && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-[1px] flex items-center justify-center z-50">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">Organizer Dashboard <Sparkles className="w-6 h-6 text-blue-600 animate-pulse" /></h1>
          <p className="text-gray-500 text-base mt-1">
            Manage your events and track volunteer engagement
          </p>
        </div>
        <Link
          to="/organizer/create-event"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-blue-200/50 hover:scale-[1.02] active:scale-[0.98] transition-all text-center self-start md:self-auto"
        >
          + Create New Event
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6 animate-fadeIn">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`bg-gradient-to-br ${color} rounded-2xl p-5 text-white shadow-sm hover:scale-[1.02] transition-transform`}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-3xl font-bold">{value}</span>
            </div>
            <p className="text-white/80 text-base font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Line chart */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Applications Over Time</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={lineChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 13 }} />
              <YAxis tick={{ fontSize: 13 }} />
              <Tooltip
                contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
              />
              <Line
                type="monotone"
                dataKey="applications"
                stroke="#06B6D4"
                strokeWidth={2.5}
                dot={{ fill: '#0284C7', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

                {/* Pie chart */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <h2 className="text-lg font-bold text-gray-800 mb-4">Event Participation Rate (%)</h2>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={85}
                        dataKey="value"
                        label={({ name, value }) => `${name.substring(0, 15)}...: ${value}%`}
                        labelLine={true}
                        fontSize={11}
                      >
                        {pieChartData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

      {/* NEW SECTION 1: MY CREATED EVENTS */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
          My Created Events <span className="text-xs bg-cyan-50 text-cyan-600 px-2.5 py-1 rounded-full font-semibold border border-cyan-100">{eventsList.length} total</span>
        </h2>
        {eventsList.length === 0 ? (
          <div className="text-center py-12 text-gray-400 font-medium">
            You haven't created any events yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {eventsList.map((event) => (
              <div key={event.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full animate-fadeIn">
                {/* Image Banner */}
                <div className="h-44 w-full relative overflow-hidden bg-gray-100">
                  <img
                    src={event.image || 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800'}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm ${statusStyle[event.status] || 'bg-gray-100 text-gray-700'}`}>
                      {event.status}
                    </span>
                  </div>
                </div>

                                {/* Content Details */}
                <div className="p-5 flex-1 flex flex-col space-y-4">
                  <div>
                    <span className="text-xs font-bold text-cyan-600 uppercase tracking-wide bg-cyan-50 px-2 py-0.5 rounded">
                      {event.category}
                    </span>
                    <h3 className="text-lg font-bold text-gray-800 mt-2 line-clamp-1">{event.title}</h3>
                  </div>

                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{event.eventDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>

                                    {/* Summary Counters */}
                  <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-xl p-4 text-center border border-gray-100/50">
                    <div>
                      <div className="text-lg font-bold text-gray-800">{event.applicationsCount}</div>
                      <div className="text-[11px] text-gray-500 uppercase tracking-wider">Applications</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-cyan-600">{event.approvedVolunteersCount}</div>
                      <div className="text-[11px] text-gray-500 uppercase tracking-wider">Approved</div>
                    </div>
                  </div>

                  {/* Buttons Stack */}
                  <div className="pt-3 mt-auto grid grid-cols-3 gap-2.5">
                    {String(event.id).startsWith('mock') ? (
                      <button
                        onClick={() => alert(`Visualizing details for mock event: ${event.title}`)}
                        className="px-2.5 py-2 text-xs font-bold text-center border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors flex items-center justify-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Details
                      </button>
                    ) : (
                      <Link
                        to={`/events/${event.id}`}
                        className="px-2.5 py-2 text-xs font-bold text-center border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors flex items-center justify-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Details
                      </Link>
                    )}
                    <Link
                      to="/organizer/events"
                      className="px-2.5 py-2 text-xs font-bold text-center border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors flex items-center justify-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit Event
                    </Link>
                    <Link
                      to="/organizer/applications"
                      className="px-2.5 py-2 text-xs font-bold text-center bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-1 col-span-1"
                    >
                      Manage Applications
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

            {/* NEW SECTION 2: RECENT APPLICATIONS */}
            <div id="recent-applications-section" className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">Recent Applications</h2>
                <Link to="/organizer/applications" className="text-xs text-cyan-600 hover:text-cyan-700 font-bold flex items-center gap-0.5">
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {['Volunteer', 'Event', 'Applied Date', 'Status', 'Actions'].map((h) => (
                        <th key={h} className="text-left text-sm font-semibold text-gray-500 uppercase tracking-wide px-6 py-3.5">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {applicationsList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-10 text-gray-400 font-medium">
                          No applications received yet.
                        </td>
                      </tr>
                    ) : (
                      applicationsList.slice(0, 8).map((app) => (
                        <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center font-bold text-cyan-600 text-xs shadow-inner">
                                {app.studentName.charAt(0)}
                              </div>
                              <div>
                                <div className="text-sm font-bold text-gray-800">{app.studentName}</div>
                                <div className="text-xs text-gray-400">{app.studentEmail}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-600 truncate max-w-[200px]">
                            {app.eventName}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {app.appliedDate}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${appStatusStyle[app.status] || 'bg-gray-100 text-gray-700'}`}>
                              <StatusIcon status={app.status} />
                              {app.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setSelectedStudent({ name: app.studentName, email: app.studentEmail, studentProfile: app.studentProfile })}
                                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-1"
                              >
                                View
                              </button>
                              {app.status === 'Pending' && (
                                <>
                                  <button
                                    onClick={() => handleApproveApplication(app.id)}
                                    className="px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100 rounded-lg text-xs font-bold transition-all"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleRejectApplication(app.id)}
                                    className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100 rounded-lg text-xs font-bold transition-all"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

                  {/* NEW SECTION 3: APPROVED VOLUNTEERS */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Approved Volunteers</h2>
          <Link to="/organizer/attendance" className="text-xs text-cyan-600 hover:text-cyan-700 font-bold flex items-center gap-0.5">
            Manage Attendance <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Volunteer', 'Event', 'Approval Date', 'Attendance', 'Actions'].map((h) => (
                  <th key={h} className="text-left text-sm font-semibold text-gray-500 uppercase tracking-wide px-6 py-3.5">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {volunteersList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-400 font-medium">
                    No approved volunteers yet.
                  </td>
                </tr>
              ) : (
                volunteersList.slice(0, 8).map((vol) => (
                  <tr key={vol.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center font-bold text-cyan-600 text-xs shadow-inner">
                          {vol.studentName.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-800">{vol.studentName}</div>
                          <div className="text-xs text-gray-400">{vol.studentEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-600 truncate max-w-[200px]">
                      {vol.eventName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {vol.approvalDate}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                        vol.attendanceStatus === 'Present'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-gray-100 text-gray-500 border border-gray-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${vol.attendanceStatus === 'Present' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                        {vol.attendanceStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedStudent({ name: vol.studentName, email: vol.studentEmail, studentProfile: vol.studentProfile })}
                          className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          View Profile
                        </button>
                        <button
                          onClick={() => handleToggleAttendance(vol)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                            vol.attendanceStatus === 'Present'
                              ? 'bg-amber-50 text-amber-600 hover:bg-amber-100 border-amber-200'
                              : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200'
                          }`}
                        >
                          Mark Attendance
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

            {/* NEW SECTION 4: EVENT PERFORMANCE SUMMARY */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Event Performance Summary</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Event Name', 'Applications Received', 'Approved Volunteers', 'Attendance Count', 'Success Rate %'].map((h) => (
                  <th key={h} className="text-left text-sm font-semibold text-gray-500 uppercase tracking-wide px-6 py-3.5">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {performanceList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-400 font-medium">
                    No performance data available.
                  </td>
                </tr>
              ) : (
                performanceList.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-gray-800">
                      {item.eventName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.applicationsReceived}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.approvedVolunteers}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.attendanceCount}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-800">{item.successRate}%</span>
                        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all"
                            style={{ width: `${item.successRate}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

            {/* STUDENT PROFILE DETAILED MODAL */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-gray-100 transform scale-100 transition-all duration-300">
            <button
              onClick={() => setSelectedStudent(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-50"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-white flex items-center justify-center text-3xl font-bold mb-4 shadow-md">
                {selectedStudent.name.charAt(0)}
              </div>
              <h3 className="text-xl font-bold text-gray-800">{selectedStudent.name}</h3>
              <p className="text-sm text-cyan-600 font-semibold mb-3">Student Volunteer</p>
              
              <div className="w-full bg-gray-50 rounded-2xl p-4 text-left space-y-3 text-sm text-gray-600 border border-gray-100/50">
                <div>
                  <span className="text-xs text-gray-400 block font-medium uppercase tracking-wider">Email</span>
                  <span className="text-gray-800 font-semibold">{selectedStudent.email}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block font-medium uppercase tracking-wider">Student ID</span>
                  <span className="text-gray-800 font-semibold">{selectedStudent.studentProfile?.studentId || "STU980312"}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block font-medium uppercase tracking-wider">Faculty</span>
                  <span className="text-gray-800 font-semibold">{selectedStudent.studentProfile?.faculty || "Faculty of Computing"}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block font-medium uppercase tracking-wider mb-1">Skills & Certifications</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {(selectedStudent.studentProfile?.skills || ["Teamwork", "Communication", "Event Planning"]).map((skill) => (
                      <span key={skill} className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-100">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default OrganizerDashboard;
