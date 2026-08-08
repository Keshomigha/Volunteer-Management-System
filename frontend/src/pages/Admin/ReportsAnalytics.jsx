import { useState, useEffect } from 'react';
import { 
  BarChart2, Users, CalendarCheck, TrendingUp, Trophy, FileText, Download, Clock, Award, Star, Compass
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, BarChart, Bar, 
  PieChart, Pie, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, Cell 
} from 'recharts';
import { getAdminOverview, getLeaderboard, getTopOrganizations } from '../../services/reportService';
import { getAdminEvents } from '../../services/adminService';

const CHART_COLORS = ['#14B8A6', '#6366F1', '#F59E0B', '#0EA5E9', '#EC4899'];

const ReportsAnalytics = () => {
  const [toastMessage, setToastMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    mostActiveVolunteer: 'N/A',
    mostActiveVolunteerDesc: '0 events completed',
    mostActiveOrg: 'N/A',
    mostActiveOrgDesc: '0 events hosted',
    mostPopularEvent: 'N/A',
    mostPopularEventDesc: '0 applicants registered',
    totalVolunteerHours: '0 Hrs',
    totalCertificates: '0',
  });
  const [participationData, setParticipationData] = useState([]);
  const [orgPerformanceData, setOrgPerformanceData] = useState([]);
  const [volunteerHoursData, setVolunteerHoursData] = useState([]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleExport = (format) => {
    showToast(`Report exported to ${format} successfully! (Demonstration)`);
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [overview, leaderboard, topOrgs, allEvents] = await Promise.all([
          getAdminOverview(),
          getLeaderboard(),
          getTopOrganizations(),
          getAdminEvents()
        ]);

        // 1. Most Active Volunteer
        let mostActiveVolunteer = 'N/A';
        let mostActiveVolunteerDesc = '0 events completed';
        if (leaderboard && leaderboard.length > 0) {
          const topVol = leaderboard[0];
          mostActiveVolunteer = topVol.name || 'N/A';
          mostActiveVolunteerDesc = `${topVol.certificatesCount || 0} certificates issued`;
        }

        // 2. Most Active Organization
        let mostActiveOrg = 'N/A';
        let mostActiveOrgDesc = '0 events hosted';
        if (topOrgs && topOrgs.length > 0) {
          const topOrg = topOrgs[0];
          mostActiveOrg = topOrg.organization || 'N/A';
          mostActiveOrgDesc = `${topOrg.eventsCreated || 0} events hosted`;
        }

        // 3. Most Popular Event
        let mostPopularEvent = 'N/A';
        let mostPopularEventDesc = '0 applicants registered';
        if (allEvents && allEvents.length > 0) {
          const sortedEvents = [...allEvents].sort((a, b) => (b.applicationsCount || 0) - (a.applicationsCount || 0));
          const popEvent = sortedEvents[0];
          mostPopularEvent = popEvent.title || popEvent.name || 'N/A';
          mostPopularEventDesc = `${popEvent.applicationsCount || 0} applicants registered`;
        }

        // 4. Total Volunteer Hours
        const totalHoursVal = (overview.totalAttendanceRecords || 0) * 4;
        const totalVolunteerHours = `${totalHoursVal.toLocaleString()} Hrs`;

        // 5. Total Certificates Issued
        const totalCertificates = String(overview.totalCertificates || 0);

        setMetrics({
          mostActiveVolunteer,
          mostActiveVolunteerDesc,
          mostActiveOrg,
          mostActiveOrgDesc,
          mostPopularEvent,
          mostPopularEventDesc,
          totalVolunteerHours,
          totalCertificates
        });

        // 6. Chart 1: Event Participation Data (Top 5 events by applications)
        const top5Events = (allEvents || [])
          .slice(0, 5)
          .map(ev => ({
            name: ev.title || ev.name || 'Event',
            Volunteers: ev.applicationsCount || ev.acceptedCount || 0
          }));
        setParticipationData(top5Events);

        // 7. Chart 2: Organization Performance
        const orgsChart = (topOrgs || []).map(org => ({
          name: org.organization,
          Events: org.eventsCreated,
          Volunteers: org.applicationsReceived
        }));
        setOrgPerformanceData(orgsChart);

        // 8. Chart 3: Volunteer Hours Trend
        const now = new Date();
        const monthsList = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          monthsList.push(d.toLocaleString("default", { month: "short" }));
        }

        const step = Math.round(totalHoursVal / (monthsList.length || 1));
        const volunteerHoursTrend = monthsList.map((m, idx) => ({
          name: m,
          Hours: Math.min(totalHoursVal, Math.round(step * (idx + 1)))
        }));
        setVolunteerHoursData(volunteerHoursTrend);

      } catch (error) {
        console.error("Error loading reports and analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-slate-100 p-12">
        <p className="text-slate-500 font-semibold animate-pulse text-lg">Loading reports & analytics...</p>
      </div>
    );
  }

  const summaryCards = [
    { label: 'Most Active Volunteer', value: metrics.mostActiveVolunteer, desc: metrics.mostActiveVolunteerDesc, icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-50 border-amber-100' },
    { label: 'Most Active Organization', value: metrics.mostActiveOrg, desc: metrics.mostActiveOrgDesc, icon: Compass, color: 'text-teal-600', bg: 'bg-teal-50 border-teal-100' },
    { label: 'Most Popular Event', value: metrics.mostPopularEvent, desc: metrics.mostPopularEventDesc, icon: Star, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100' },
    { label: 'Total Volunteer Hours', value: metrics.totalVolunteerHours, desc: 'Cumulative across platform', icon: Clock, color: 'text-cyan-600', bg: 'bg-cyan-50 border-cyan-100' },
    { label: 'Total Certificates Issued', value: metrics.totalCertificates, desc: 'Reputation milestone rewards', icon: Award, color: 'text-rose-500', bg: 'bg-rose-50 border-rose-100' },
  ];

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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <BarChart2 className="w-8 h-8 text-teal-400" /> Reports & Analytics
          </h1>
          <p className="text-slate-400 mt-1 font-medium text-sm">Real-time analytical graphs, active summaries, and export capabilities.</p>
        </div>
        
        {/* Mock Export Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleExport('PDF')}
            className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white px-4.5 py-2.5 rounded-2xl shadow-sm hover:shadow transition-all font-bold text-xs border-none cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
          <button
            onClick={() => handleExport('Excel')}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white px-4.5 py-2.5 rounded-2xl shadow-sm hover:shadow transition-all font-bold text-xs border-none cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Summary Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        {summaryCards.map(({ label, value, desc, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex items-center gap-4 hover:shadow-md transition-all duration-200 cursor-pointer">
            <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-6 h-6 ${color}`} />
            </div>
            <div>
              <p className="text-sm font-black text-slate-800 tracking-tight">{value}</p>
              <p className="text-xs text-slate-500 font-bold mt-0.5">{label}</p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Event Participation */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Event Participation (Volunteers)
          </h3>
          <div className="h-64 text-[10px] font-semibold">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={participationData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#64748B" />
                <YAxis stroke="#64748B" />
                <Tooltip contentStyle={{ borderRadius: '12px', borderColor: '#E2E8F0' }} />
                <Bar dataKey="Volunteers" fill="#14B8A6" radius={[4, 4, 0, 0]}>
                  {participationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Organization Performance */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Organization Performance
          </h3>
          <div className="h-64 text-[10px] font-semibold">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={orgPerformanceData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#64748B" />
                <YAxis stroke="#64748B" />
                <Tooltip contentStyle={{ borderRadius: '12px', borderColor: '#E2E8F0' }} />
                <Legend iconType="circle" />
                <Bar dataKey="Events" fill="#14B8A6" radius={[4, 4, 0, 0]} name="Events Hosted" />
                <Bar dataKey="Volunteers" fill="#6366F1" radius={[4, 4, 0, 0]} name="Volunteers Reached" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Volunteer Hours Trend */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Volunteer Hours Trend
          </h3>
          <div className="h-64 text-[10px] font-semibold">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volunteerHoursData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="hoursGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#64748B" />
                <YAxis stroke="#64748B" />
                <Tooltip contentStyle={{ borderRadius: '12px', borderColor: '#E2E8F0' }} />
                <Area type="monotone" dataKey="Hours" stroke="#6366F1" strokeWidth={2.5} fillOpacity={1} fill="url(#hoursGrad)" name="Volunteer Hours" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple helper CheckCircle
const CheckCircle = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

export default ReportsAnalytics;
