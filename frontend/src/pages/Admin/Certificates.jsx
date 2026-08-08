import { useState, useEffect } from 'react';
import {
  Award, FileText, CheckCircle, Eye, Settings, ShieldCheck, Activity, ToggleLeft, ToggleRight, Check, X
} from 'lucide-react';
import { getCertificateStats } from '../../services/adminService';

const TEMPLATES = [
  { id: 'standard', name: 'Standard Template', description: 'Classic design with golden double borders and serif headings.', style: 'Classic Font & Double Border' },
  { id: 'modern', name: 'Modern Template', description: 'Clean layout with sans-serif typography and gradient background accents.', style: 'Minimal & Gradient Accents' },
  { id: 'university', name: 'University Template', description: 'Academic style featuring university seal watermark and traditional layout.', style: 'Formal Academic Layout' }
];

const AdminCertificates = () => {
  const [defaultTemplate, setDefaultTemplate] = useState('standard');
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getCertificateStats();
        setStatsData(data);
        if (data.recentActivity && data.recentActivity.length > 0) {
          setRecentActivity(data.recentActivity);
        } else {
          setRecentActivity([]);
        }
      } catch (err) {
        console.error("Failed to load certificate stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);
  
  // Settings state
  const [settings, setSettings] = useState({
    autoGenerate: true,
    enableDownloads: true,
  });

  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleToggleSetting = (key) => {
    setSettings(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      showToast(`Setting "${key === 'autoGenerate' ? 'Auto Generate Certificates' : 'Enable Certificate Downloads'}" was ${updated[key] ? 'enabled' : 'disabled'}.`);
      return updated;
    });
  };

  const handleSetDefaultTemplate = (id, name) => {
    setDefaultTemplate(id);
    showToast(`Default template changed to "${name}".`);
  };

  const statsCards = [
    {
      label: 'Total Certificates Generated',
      value: statsData?.totalCertificates !== undefined ? String(statsData.totalCertificates) : '0',
      subtext: 'System-wide',
      color: 'text-teal-600',
      bg: 'bg-teal-50'
    },
    {
      label: 'Certificates This Month',
      value: statsData?.thisMonthCertificates !== undefined ? String(statsData.thisMonthCertificates) : '0',
      subtext: statsData?.monthYearStr || 'Current Month',
      color: 'text-indigo-600',
      bg: 'bg-indigo-50'
    },
    {
      label: 'Active Templates',
      value: statsData?.activeTemplates !== undefined ? String(statsData.activeTemplates) : '3',
      subtext: 'System styles',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      label: 'Events With Certificates',
      value: statsData?.eventsWithCertificates !== undefined ? String(statsData.eventsWithCertificates) : '0',
      subtext: 'Chapter events',
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-[#14B8A6] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 font-medium">Loading certificate management data...</p>
      </div>
    );
  }

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
          <Award className="w-8 h-8 text-teal-400" /> Certificate Management
        </h1>
        <p className="text-slate-400 mt-1 font-medium text-sm">Manage default certificate templates, review stats, settings, and monitor generation activity system-wide.</p>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-teal-50 shadow-sm flex flex-col justify-between min-h-[120px]">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className={`text-4xl font-extrabold ${stat.color}`}>{stat.value}</span>
              <span className="text-xs text-slate-400 font-medium">{stat.subtext}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Templates */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-teal-50 p-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-teal-600" /> Certificate Templates
            </h2>
            <p className="text-sm text-slate-500 mb-6">Choose and configure the global certificate template layout for student participation awards.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {TEMPLATES.map((tpl) => {
                const isDefault = defaultTemplate === tpl.id;
                return (
                  <div 
                    key={tpl.id}
                    className={`bg-white rounded-xl border p-5 flex flex-col justify-between min-h-[220px] transition-all duration-200 ${
                      isDefault ? 'border-teal-500 shadow-md ring-1 ring-teal-100' : 'border-slate-100 hover:border-teal-200'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="font-extrabold text-sm text-slate-800">{tpl.name}</h3>
                        {isDefault && (
                          <span className="text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 border border-teal-200 rounded font-bold uppercase tracking-wider flex items-center gap-0.5">
                            <Check className="w-3 h-3" /> Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-semibold mt-1">{tpl.style}</p>
                      <p className="text-xs text-slate-500 font-medium mt-3 leading-relaxed">{tpl.description}</p>
                    </div>

                    <div className="flex flex-col gap-2 mt-4 pt-3 border-t border-slate-50">
                      <button
                        onClick={() => setPreviewTemplate(tpl)}
                        className="w-full py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> Preview
                      </button>
                      {!isDefault && (
                        <button
                          onClick={() => handleSetDefaultTemplate(tpl.id, tpl.name)}
                          className="w-full py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-all"
                        >
                          Select Default
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-white rounded-2xl shadow-sm border border-teal-50 p-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-teal-600" /> Recent Certificate Activity
            </h2>
            <div className="overflow-hidden rounded-xl border border-slate-100">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">Event Name</th>
                    <th className="px-6 py-3.5">Certificates Issued</th>
                    <th className="px-6 py-3.5">Activity Time</th>
                    <th className="px-6 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium text-slate-600">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((act, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 font-bold text-slate-800">{act.event}</td>
                        <td className="px-6 py-4">{act.count} Certificates</td>
                        <td className="px-6 py-4 text-slate-400">{act.date}</td>
                        <td className="px-6 py-4">
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            {act.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-6 text-center text-slate-400 italic">
                        No recent certificate activity found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col: Settings */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-teal-50 p-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-teal-600" /> Certificate Settings
            </h2>
            <p className="text-sm text-slate-500 mb-6 font-medium">Configure global system defaults and behaviors for certificates.</p>

            <div className="space-y-5">
              {/* Option 1: Auto Generate */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex-1 min-w-0 pr-3">
                  <h3 className="text-sm font-bold text-slate-800">Auto Generate</h3>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5 leading-snug">Automatically issue certificates once attendance is marked.</p>
                </div>
                <button 
                  onClick={() => handleToggleSetting('autoGenerate')}
                  className="bg-transparent border-none cursor-pointer p-1 text-teal-600 hover:text-teal-700 flex items-center"
                >
                  {settings.autoGenerate ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10 text-slate-300" />}
                </button>
              </div>

              {/* Option 2: Enable Download */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex-1 min-w-0 pr-3">
                  <h3 className="text-sm font-bold text-slate-800">Enable Downloads</h3>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5 leading-snug">Allow student volunteers to download their certificates from dashboard.</p>
                </div>
                <button 
                  onClick={() => handleToggleSetting('enableDownloads')}
                  className="bg-transparent border-none cursor-pointer p-1 text-teal-600 hover:text-teal-700 flex items-center"
                >
                  {settings.enableDownloads ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10 text-slate-300" />}
                </button>
              </div>

              {/* Option 3: Default Template selector dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Default Template</label>
                <select
                  value={defaultTemplate}
                  onChange={(e) => handleSetDefaultTemplate(e.target.value, TEMPLATES.find(t => t.id === e.target.value).name)}
                  className="w-full bg-white border border-slate-200 px-3 py-2.5 rounded-xl text-sm text-slate-700 outline-none focus:border-teal-500 font-semibold cursor-pointer"
                >
                  {TEMPLATES.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0" onClick={() => setPreviewTemplate(null)} />
          <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-scaleUp">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">{previewTemplate.name} — Preview</h3>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">{previewTemplate.style}</p>
              </div>
              <button 
                onClick={() => setPreviewTemplate(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors border-none bg-transparent cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Certificate Template Preview Frame */}
            <div className="p-8 bg-slate-50 flex items-center justify-center">
              <div className="w-full bg-[#FAF9F6] border-[10px] border-double border-amber-800/10 p-8 text-center relative overflow-hidden font-serif min-h-[350px] shadow-md rounded-xl">
                
                {/* Background watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none">
                  <Award className="w-52 h-52 text-amber-800" />
                </div>

                <div className="flex flex-col items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-indigo-500 text-white flex items-center justify-center text-base font-bold shadow mb-1">
                    VH
                  </div>
                  <span className="text-[9px] font-sans font-extrabold uppercase tracking-widest text-teal-600">VolunteerHub</span>
                </div>

                <h2 className="text-2xl font-bold text-amber-900 mb-2">Certificate of Participation</h2>
                <p className="text-xs font-sans italic text-gray-400 mb-4">This certificate is proudly awarded to</p>
                <h1 className="text-3xl font-extrabold text-gray-800 mb-4">[Volunteer Name]</h1>
                
                <div className="max-w-md mx-auto text-gray-500 font-sans text-xs leading-relaxed mb-6">
                  <p>for successfully completing volunteer service at the event</p>
                  <p className="text-base font-serif font-bold text-teal-800 italic my-1">[Event Name]</p>
                  <p>organized by [Organizer Club].</p>
                </div>

                <div className="flex justify-between items-end pt-4 border-t border-gray-100/50 mt-6 font-sans text-[10px]">
                  <div className="text-left">
                    <span className="text-gray-400 block uppercase">Completion Date</span>
                    <span className="text-gray-700 font-bold">15 June 2026</span>
                  </div>
                  <div className="flex items-center gap-1 border border-teal-200 text-teal-600 bg-teal-50 px-2 py-0.5 rounded uppercase tracking-wider font-bold text-[8px]">
                    <ShieldCheck className="w-3 h-3" /> Secure Seal
                  </div>
                  <div className="text-right">
                    <span className="text-gray-400 block uppercase">Authorized Signature</span>
                    <span className="text-amber-800 font-bold italic">VolunteerHub Admin</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setPreviewTemplate(null)}
                className="bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold px-5 py-2 rounded-xl text-xs cursor-pointer shadow-sm"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCertificates;
