import { useState, useEffect } from 'react';
import { 
  Settings, Shield, Bell, Save, Monitor, AppWindow, Mail, Sparkles, CheckCircle
} from 'lucide-react';
import { getSettings, updateSettings } from '../../services/adminService';

const SystemSettings = () => {
  const [formData, setFormData] = useState({
    siteName: 'VolunteerHub',
    adminEmail: 'admin@volunteerhub.com',
    eventApprovalRequired: true,
    notificationsEnabled: true,
    registrationOpen: true,
    darkModeEnabled: false,
    maintenanceMode: false,
  });

  const [toastMessage, setToastMessage] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchSettingsData = async () => {
      try {
        const data = await getSettings();
        const isDark = data.darkModeEnabled !== undefined ? data.darkModeEnabled : (localStorage.getItem('darkMode') === 'true');
        setFormData({
          siteName: data.siteName || 'VolunteerHub',
          adminEmail: data.adminEmail || 'admin@volunteerhub.com',
          eventApprovalRequired: data.eventApprovalRequired !== undefined ? data.eventApprovalRequired : true,
          notificationsEnabled: data.notificationsEnabled !== undefined ? data.notificationsEnabled : true,
          registrationOpen: data.registrationOpen !== undefined ? data.registrationOpen : true,
          darkModeEnabled: isDark,
          maintenanceMode: data.maintenanceMode !== undefined ? data.maintenanceMode : false,
        });

        localStorage.setItem('darkMode', String(isDark));
        window.dispatchEvent(new Event('admin-theme-change'));
      } catch (err) {
        console.error("Error fetching system settings:", err);
      }
    };
    fetchSettingsData();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    setFormData((prev) => ({
      ...prev,
      [name]: val,
    }));

    if (name === 'darkModeEnabled') {
      localStorage.setItem('darkMode', String(val));
      window.dispatchEvent(new Event('admin-theme-change'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateSettings(formData);
      setSuccess(true);
      showToast('System configuration saved successfully!');
      
      localStorage.setItem('darkMode', String(formData.darkModeEnabled));
      window.dispatchEvent(new Event('admin-theme-change'));
      
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      console.error("Error saving system settings:", err);
      alert(err.response?.data?.message || err.message || "Failed to save settings");
    }
  };

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
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-8 h-8 text-teal-400" /> System Settings
        </h1>
        <p className="text-slate-400 mt-1 font-medium text-sm">Configure application variables, notification defaults, and system toggles.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Help Panel */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-teal-100 p-5 space-y-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wider">
              <Sparkles className="w-5 h-5 text-teal-600" /> Settings Assistance
            </h3>
            <p className="text-slate-500 text-xs leading-relaxed font-semibold">
              These variables affect the volunteer hub's business rules globally. Keep them updated to ensure smooth club activities.
            </p>
            <div className="space-y-3.5 pt-2">
              <div className="flex gap-3 text-xs text-slate-600">
                <Shield className="w-5 h-5 text-teal-600 flex-shrink-0" />
                <div>
                  <span className="font-bold block text-slate-700">Approval Toggle</span>
                  If disabled, events submitted by club organizers bypass approval and go live immediately.
                </div>
              </div>
              <div className="flex gap-3 text-xs text-slate-600">
                <Bell className="w-5 h-5 text-teal-600 flex-shrink-0" />
                <div>
                  <span className="font-bold block text-slate-700">Notifications Toggle</span>
                  Send system alerts and email updates to students and organizers automatically.
                </div>
              </div>
              <div className="flex gap-3 text-xs text-slate-600">
                <Monitor className="w-5 h-5 text-teal-600 flex-shrink-0" />
                <div>
                  <span className="font-bold block text-slate-700">Dark Theme Setup</span>
                  Toggle database-supported theme mode which enables custom system colors.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-teal-100 p-6 space-y-6">
              <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Settings className="w-5 h-5 text-teal-600" /> Platform Configuration Form
              </h2>

              {success && (
                <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-200 text-xs flex items-center gap-2 animate-pulse font-bold">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 text-green-700" />
                  <span>System settings updated successfully! Local records synchronized.</span>
                </div>
              )}

              <div className="space-y-5 text-xs">
                {/* Platform Name */}
                <div>
                  <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Platform Name
                  </label>
                  <div className="flex items-center bg-slate-50 border border-teal-100 rounded-xl focus-within:border-teal-400 transition-colors">
                    <span className="pl-4 pr-1 text-slate-400 font-semibold flex items-center">
                      <AppWindow className="w-4 h-4 text-teal-600" />
                    </span>
                    <input
                      type="text"
                      name="siteName"
                      value={formData.siteName}
                      onChange={handleChange}
                      required
                      placeholder="e.g. VolunteerHub"
                      className="w-full bg-transparent border-none outline-none px-3 py-2.5 text-slate-700 font-bold"
                    />
                  </div>
                </div>

                {/* Admin Email */}
                <div>
                  <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Admin Email Address
                  </label>
                  <div className="flex items-center bg-slate-50 border border-teal-100 rounded-xl focus-within:border-teal-400 transition-colors">
                    <span className="pl-4 pr-1 text-slate-400 font-semibold flex items-center">
                      <Mail className="w-4 h-4 text-teal-600" />
                    </span>
                    <input
                      type="email"
                      name="adminEmail"
                      value={formData.adminEmail}
                      onChange={handleChange}
                      required
                      placeholder="e.g. admin@volunteerhub.com"
                      className="w-full bg-transparent border-none outline-none px-3 py-2.5 text-slate-700 font-bold"
                    />
                  </div>
                </div>

                {/* Toggles Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {/* Require Event Approval */}
                  <div className="flex items-center justify-between p-4 bg-teal-50/20 rounded-xl border border-teal-100">
                    <div className="space-y-0.5 pr-2">
                      <label className="block font-bold text-slate-700 uppercase tracking-wide">
                        Require Event Approval
                      </label>
                      <span className="text-[10px] text-slate-400 leading-tight block font-semibold">
                        Organizer events must be checked by Admins before listing.
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="eventApprovalRequired"
                        checked={formData.eventApprovalRequired}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                    </label>
                  </div>

                  {/* Enable Notifications */}
                  <div className="flex items-center justify-between p-4 bg-teal-50/20 rounded-xl border border-teal-100">
                    <div className="space-y-0.5 pr-2">
                      <label className="block font-bold text-slate-700 uppercase tracking-wide">
                        Enable Notifications
                      </label>
                      <span className="text-[10px] text-slate-400 leading-tight block font-semibold">
                        Allow notifications for event submissions, signups, etc.
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="notificationsEnabled"
                        checked={formData.notificationsEnabled}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                    </label>
                  </div>

                  {/* Open Registrations */}
                  <div className="flex items-center justify-between p-4 bg-teal-50/20 rounded-xl border border-teal-100">
                    <div className="space-y-0.5 pr-2">
                      <label className="block font-bold text-slate-700 uppercase tracking-wide">
                        Open Registrations
                      </label>
                      <span className="text-[10px] text-slate-400 leading-tight block font-semibold">
                        Allow new students/organizers to create active accounts.
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="registrationOpen"
                        checked={formData.registrationOpen}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                    </label>
                  </div>

                  {/* Dark Mode Support */}
                  <div className="flex items-center justify-between p-4 bg-teal-50/20 rounded-xl border border-teal-100">
                    <div className="space-y-0.5 pr-2">
                      <label className="block font-bold text-slate-700 uppercase tracking-wide">
                        Dark Mode Support
                      </label>
                      <span className="text-[10px] text-slate-400 leading-tight block font-semibold">
                        Enable dark mode palette across UI and dashboards.
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="darkModeEnabled"
                        checked={formData.darkModeEnabled}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                    </label>
                  </div>

                  {/* Maintenance Mode */}
                  <div className="flex items-center justify-between p-4 bg-teal-50/20 rounded-xl border border-teal-100 col-span-1 md:col-span-2">
                    <div className="space-y-0.5 pr-2">
                      <label className="block font-bold text-slate-700 uppercase tracking-wide">
                        Enable Maintenance Mode
                      </label>
                      <span className="text-[10px] text-slate-400 leading-tight block font-semibold">
                        Bypasses login for non-admins and shows a "Maintenance" notification page.
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="maintenanceMode"
                        checked={formData.maintenanceMode}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-500 hover:from-teal-700 hover:to-cyan-600 text-white px-5 py-2.5 rounded-2xl shadow-sm hover:shadow transition-all font-bold text-xs border-none cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
