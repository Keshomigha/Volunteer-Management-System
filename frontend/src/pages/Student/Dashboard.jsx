import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Calendar, Trophy, Award, Clock, MapPin, Download, Eye, X } from 'lucide-react';
import { getStudentDashboard } from '../../services/userService';
import { downloadCertificatePdf } from '../../services/certificateService';
import { CertificateModal } from './StudentCertificates';

const downloadCertificate = async (cert) => {
  try {
    const blobData = await downloadCertificatePdf(cert.id);
    const blob = new Blob([blobData], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `certificate-${cert.certificateId || cert.id}.pdf`;
    link.click();
  } catch (error) {
    console.error("Failed to download certificate PDF", error);
  }
};
const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewingCert, setViewingCert] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const res = await getStudentDashboard();
        setData(res);
      } catch (err) {
        console.error('Error fetching student dashboard data:', err);
        setData({
          joinedEventsCount: 0,
          reputationPoints: 0,
          certificatesCount: 0,
          volunteerHours: 0,
          joinedEvents: [],
          certificates: [],
          hoursHistory: [],
          reputationActivities: [],
          rankLevel: 'Beginner Volunteer'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-b-2 border-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const stats = [
    { label: 'Events Joined',       value: data.joinedEventsCount, icon: Calendar },
    { label: 'Reputation Points',   value: data.reputationPoints, icon: Trophy   },
    { label: 'Certificates Earned', value: data.certificatesCount,  icon: Award    },
    { label: 'Volunteer Hours',     value: data.volunteerHours,  icon: Clock    },
  ];
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Student Dashboard</h1>
        <p className="mt-1 text-gray-500">Welcome back! Here's your volunteer summary.</p>
      </div>

      {/* Stat Cards — full gradient, icon top-left, value top-right, label bottom */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 shadow-sm flex flex-col justify-between min-h-[110px]"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center justify-center flex-shrink-0 rounded-full w-11 h-11 bg-white/20">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-3xl font-bold text-white">{value}</span>
            </div>
            <p className="mt-4 text-sm font-medium text-white/80">{label}</p>
          </div>
        ))}
      </div>
      {/* ── MY JOINED EVENTS SECTION ───────────────────── */}
      <div className="p-6 space-y-4 bg-white border border-gray-100 shadow-sm rounded-2xl">
        <h2 className="text-xl font-bold text-gray-800">My Joined Events</h2>
        {data.joinedEvents.length === 0 ? (
          <div className="py-10 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-purple-100" />
            <p className="font-medium text-gray-400">You haven't joined any events yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {data.joinedEvents.map((je) => (
              <div key={je.id} className="flex flex-col overflow-hidden transition-shadow border border-gray-100 sm:flex-row rounded-xl hover:shadow-sm">
                <img 
                  src={je.image || `https://picsum.photos/seed/${encodeURIComponent(je.title)}/300/200`} 
                  alt={je.title} 
                  className="object-cover w-full h-32 sm:w-32 bg-gray-50"
                  onError={e => {
                    e.currentTarget.src = 'https://picsum.photos/seed/placeholder/300/200';
                  }}
                />
                <div className="flex flex-col justify-between flex-1 p-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-purple-600 tracking-wider">{je.organizer}</span>
                    <h3 className="font-bold text-gray-800 text-sm mt-0.5">{je.title}</h3>
                    <div className="flex flex-wrap mt-2 text-xs text-gray-400 gap-x-3 gap-y-1">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-purple-400" /> {je.date}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-purple-400" /> {je.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        je.applicationStatus === 'Approved' ? 'bg-blue-50 text-blue-600' :
                        je.applicationStatus === 'Rejected' ? 'bg-red-50 text-red-600' :
                        'bg-amber-50 text-amber-600'
                      }`}>
                        App: {je.applicationStatus}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        je.attendanceStatus === 'Present' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                      }`}>
                        Att: {je.attendanceStatus}
                      </span>
                    </div>
                    <Link to={`/events/${je.eventId}`} className="text-xs font-bold text-blue-600 hover:underline">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* ── MY CERTIFICATES SECTION ────────────────────── */}
      <div className="p-6 space-y-4 bg-white border border-gray-100 shadow-sm rounded-2xl">
        <h2 className="text-xl font-bold text-gray-800">My Certificates</h2>
        {data.certificates.length === 0 ? (
          <div className="py-10 text-center">
            <Award className="w-12 h-12 mx-auto mb-3 text-purple-100" />
            <p className="font-medium text-gray-400">No certificates earned yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.certificates.map((cert) => (
              <div key={cert.id} className="flex flex-col justify-between p-4 transition-shadow border border-gray-100 rounded-xl hover:shadow-sm">
                <div>
                  <div className="flex items-center justify-center w-10 h-10 mb-3 text-purple-500 rounded-lg bg-purple-50">
                    <Award className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-800">{cert.event} Certificate</h3>
                  <p className="mt-1 text-xs text-gray-400">Completed: {cert.completedOn}</p>
                  <p className="px-2 py-1 mt-2 font-mono text-xs text-gray-500 rounded bg-gray-50 w-fit">{cert.certificateId}</p>
                </div>
                <div className="flex gap-2 mt-4">
                  <button 
                    onClick={() => setViewingCert(cert)}
                    className="flex-1 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors flex items-center justify-center gap-1 border-none cursor-pointer"
                  >
                    <Eye className="w-3 h-3" /> View Certificate
                  </button>
                  <button 
                    onClick={() => downloadCertificate(cert)}
                    className="flex-1 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center justify-center gap-1 border-none cursor-pointer"
                  >
                    <Download className="w-3 h-3" /> Download Certificate
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* ── HOURS AND REPUTATION SIDE-BY-SIDE ──────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Hours History */}
        <div className="p-6 space-y-4 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Volunteer Hours History</h2>
            <span className="px-3 py-1 text-xs font-bold text-blue-600 rounded-full bg-blue-50">
              Total: {data.volunteerHours} hrs
            </span>
          </div>
          {data.hoursHistory.length === 0 ? (
            <p className="text-sm text-gray-400">No volunteer hours logged yet.</p>
          ) : (
            <div className="pr-1 overflow-y-auto divide-y divide-gray-50 max-h-64">
              {data.hoursHistory.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <p className="font-bold text-gray-800">{item.event}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.date}</p>
                  </div>
                  <span className="font-bold text-emerald-600">+{item.hours} hrs</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Reputation Score & Activities */}
        <div className="p-6 space-y-4 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Reputation Activity</h2>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-xs font-bold text-purple-600 rounded-full bg-purple-50">
                Rank: {data.rankLevel}
              </span>
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-amber-50 text-amber-600">
                Score: {data.reputationPoints} pts
              </span>
            </div>
          </div>
          {data.reputationActivities.length === 0 ? (
            <p className="text-sm text-gray-400">No reputation activities logged yet.</p>
          ) : (
            <div className="pr-1 overflow-y-auto divide-y divide-gray-50 max-h-64">
              {data.reputationActivities.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <p className="font-bold text-gray-800">{item.event}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.date}</p>
                  </div>
                  <span className="font-bold text-purple-600">+{item.points} Points</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Certificate Modal Preview */}
      {viewingCert && (
        <CertificateModal cert={viewingCert} onClose={() => setViewingCert(null)} />
      )}
    </div>
  );
};

export default Dashboard;