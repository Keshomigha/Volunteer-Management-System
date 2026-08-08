import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getStudentSettings,
  updateStudentSettings,
  changePassword
} from '../../services/userService';
import {
  User as UserIcon,
  BookOpen,
  Star,
  Bell,
  Lock,
  Check,
  Camera,
  Award,
  Clock,
  Plus,
  X,
  Shield,
  Loader2
} from 'lucide-react';

const inputCls =
  'w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 ' +
  'focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 ' +
  'placeholder-gray-400 transition bg-white disabled:bg-gray-50 disabled:text-gray-400';

const labelCls = 'block text-sm font-semibold text-gray-700 mb-1.5';

const SectionCard = ({ icon: Icon, title, children }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
    <div className="h-1.5 bg-blue-600" />
    <div className="p-6">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-blue-600" />
        </div>
        <h2 className="text-lg font-bold text-gray-800">{title}</h2>
      </div>
      {children}
    </div>
  </div>
);

const CustomToggle = ({ checked, onChange, label }) => (
  <button
    type="button"
    onClick={onChange}
    className="flex items-center gap-3 cursor-pointer focus:outline-none text-left border-none bg-transparent"
  >
    <div
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${checked ? 'bg-blue-600' : 'bg-gray-200'
        }`}
    >
      <div
        className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full shadow transition-transform duration-200 ${checked ? 'transform translate-x-5' : ''
          }`}
      />
    </div>
    <span className="text-sm text-gray-600 font-medium">{label}</span>
  </button>
);

const GradientCheckbox = ({ checked, onChange, label }) => (
  <div onClick={onChange} className="flex items-center gap-3 cursor-pointer group">
    <div className="relative flex-shrink-0">
      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all
        ${checked
          ? 'bg-blue-600 border-transparent'
          : 'border-gray-300 bg-white group-hover:border-blue-300'}`}
      >
        {checked && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
    </div>
    <span className="text-sm text-gray-600 select-none">{label}</span>
  </div>
);

const MOCK_SETTINGS = {
  name: 'Alex Johnson',
  email: 'alex.johnson@university.edu',
  phone: '555-0199',
  studentId: 'STU202401',
  faculty: 'Computer Science & Engineering',
  university: 'State University',
  degreeProgram: 'BSc. in Computer Science',
  yearOfStudy: '3rd Year',
  bio: 'Passionate about coding, teaching, and contributing to community environment drives.',
  avatar: '',
  skills: ['Teamwork', 'Communication', 'Technology'],
  preferences: ['Environment', 'Technology', 'Community Service'],
  availability: {
    days: ['Weekdays'],
    times: ['Afternoon', 'Evening']
  },
  notifications: {
    eventRecommendations: true,
    applicationUpdates: true,
    eventReminders: true,
    certificateNotifications: true,
    reputationPointUpdates: true
  },
  privacy: {
    showProfileOnLeaderboard: true,
    allowOrganizersToViewSkills: true,
    receivePersonalizedRecommendations: true
  }
};

const DEFAULT_SKILLS = [
  'Leadership',
  'Communication',
  'Teamwork',
  'Teaching',
  'First Aid',
  'Event Management',
  'Fundraising',
  'Public Speaking',
  'Photography',
  'Social Media Management'
];

const PREFERENCE_CATEGORIES = [
  'Community Service',
  'Education',
  'Environment',
  'Healthcare',
  'Technology',
  'Fundraising',
  'Animal Welfare'
];

const StudentSettings = () => {
  const { user, updateUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Section State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');

  const [studentId, setStudentId] = useState('');
  const [university, setUniversity] = useState('State University');
  const [faculty, setFaculty] = useState('');
  const [degreeProgram, setDegreeProgram] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('1st Year');

  const [selectedSkills, setSelectedSkills] = useState([]);
  const [customSkillInput, setCustomSkillInput] = useState('');

  const [selectedPreferences, setSelectedPreferences] = useState([]);

  const [availability, setAvailability] = useState({ days: [], times: [] });

  const [notifications, setNotifications] = useState({
    eventRecommendations: true,
    applicationUpdates: true,
    eventReminders: true,
    certificateNotifications: true,
    reputationPointUpdates: true
  });

  const [privacy, setPrivacy] = useState({
    showProfileOnLeaderboard: true,
    allowOrganizersToViewSkills: true,
    receivePersonalizedRecommendations: true
  });

  // Password Update State
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [passwordUpdating, setPasswordUpdating] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        let settingsData;

        if (token && token.startsWith('dummy')) {
          settingsData = JSON.parse(localStorage.getItem('mock_settings')) || MOCK_SETTINGS;
        } else {
          try {
            settingsData = await getStudentSettings();
          } catch (e) {
            console.log('API error. Using mock data.', e);
            settingsData = JSON.parse(localStorage.getItem('mock_settings')) || MOCK_SETTINGS;
          }
        }

        setName(settingsData.name || '');
        setEmail(settingsData.email || '');
        setPhone(settingsData.phone || '');
        setStudentId(settingsData.studentId || '');
        setFaculty(settingsData.faculty || '');
        setUniversity(settingsData.university || 'State University');
        setDegreeProgram(settingsData.degreeProgram || '');
        setYearOfStudy(settingsData.yearOfStudy || '1st Year');
        setBio(settingsData.bio || '');
        setAvatar(settingsData.avatar || '');
        setAvatarPreview(settingsData.avatar || '');
        setSelectedSkills(settingsData.skills || []);
        setSelectedPreferences(settingsData.preferences || []);
        setAvailability(settingsData.availability || { days: [], times: [] });
        setNotifications({
          eventRecommendations: settingsData.notifications?.eventRecommendations ?? true,
          applicationUpdates: settingsData.notifications?.applicationUpdates ?? true,
          eventReminders: settingsData.notifications?.eventReminders ?? true,
          certificateNotifications: settingsData.notifications?.certificateNotifications ?? true,
          reputationPointUpdates: settingsData.notifications?.reputationPointUpdates ?? true
        });
        setPrivacy({
          showProfileOnLeaderboard: settingsData.privacy?.showProfileOnLeaderboard ?? true,
          allowOrganizersToViewSkills: settingsData.privacy?.allowOrganizersToViewSkills ?? true,
          receivePersonalizedRecommendations: settingsData.privacy?.receivePersonalizedRecommendations ?? true
        });

      } catch (err) {
        console.error('Error fetching settings:', err);
        setError('Could not load profile settings.');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // Image handler
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setError('Only JPG and PNG formats are supported.');
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
      setAvatar(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setAvatar('');
    setAvatarPreview('');
  };

  // Skill toggling
  const handleToggleSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  // Add custom skill
  const handleAddCustomSkill = (e) => {
    e.preventDefault();
    const clean = customSkillInput.trim();
    if (!clean) return;
    if (selectedSkills.includes(clean)) {
      setCustomSkillInput('');
      return;
    }
    setSelectedSkills([...selectedSkills, clean]);
    setCustomSkillInput('');
  };

  // Toggle Preferences
  const handleTogglePreference = (pref) => {
    if (selectedPreferences.includes(pref)) {
      setSelectedPreferences(selectedPreferences.filter(p => p !== pref));
    } else {
      setSelectedPreferences([...selectedPreferences, pref]);
    }
  };

  // Toggle Availability Days
  const handleToggleDay = (day) => {
    const currentDays = availability.days || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];
    setAvailability({ ...availability, days: newDays });
  };

  // Toggle Availability Times
  const handleToggleTime = (time) => {
    const currentTimes = availability.times || [];
    const newTimes = currentTimes.includes(time)
      ? currentTimes.filter(t => t !== time)
      : [...currentTimes, time];
    setAvailability({ ...availability, times: newTimes });
  };

  // Save Settings
  const handleSaveSettings = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    // Validations
    if (!name.trim()) {
      setError('Full Name is required.');
      setSaving(false);
      return;
    }

    const payload = {
      name,
      phone,
      faculty,
      university,
      degreeProgram,
      yearOfStudy,
      bio,
      avatar,
      skills: selectedSkills,
      preferences: selectedPreferences,
      availability,
      notifications,
      privacy,
      studentId
    };

    try {
      const token = localStorage.getItem('token');
      if (token && token.startsWith('dummy')) {
        localStorage.setItem('mock_settings', JSON.stringify(payload));
        // Update user state globally
        updateUser({
          ...user,
          name,
          phone,
          avatar,
          studentProfile: {
            ...user?.studentProfile,
            ...payload
          }
        });
      } else {
        const res = await updateStudentSettings(payload);
        updateUser(res.user);
      }
      setSuccess('Profile settings successfully updated!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save settings details.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  // Password Submit
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    const { current, newPass, confirm } = passwords;
    if (!current || !newPass || !confirm) {
      setPasswordError('Please fill in all password fields.');
      return;
    }

    if (newPass !== confirm) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    if (newPass.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    setPasswordUpdating(true);
    try {
      const token = localStorage.getItem('token');
      if (token && token.startsWith('dummy')) {
        // Mock success
        await new Promise(resolve => setTimeout(resolve, 800));
        setPasswordSuccess('Password successfully updated!');
      } else {
        await changePassword({ currentPassword: current, newPassword: newPass });
        setPasswordSuccess('Password successfully updated!');
      }
      setPasswords({ current: '', newPass: '', confirm: '' });
      setTimeout(() => setPasswordSuccess(''), 4000);
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to update password. Please check current password.');
    } finally {
      setPasswordUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-gray-500 text-sm font-semibold">Loading settings profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Title */}
      <div className="mb-8 border-b border-gray-100 pb-5">
        <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Profile Settings</h1>
        <p className="mt-1.5 text-gray-500 text-base">
          Manage your personal information, volunteer preferences, and account settings.
        </p>
      </div>

      {success && (
        <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 font-semibold text-sm flex items-center gap-2.5 shadow-sm animate-fade-in">
          <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
          {success}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 font-semibold text-sm flex items-center gap-2.5 shadow-sm">
          <X className="w-5 h-5 text-red-500 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Forms column */}
        <div className="lg:col-span-8 space-y-8">

          {/* Section 1: Profile Picture */}
          <SectionCard icon={Camera} title="Profile Picture">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group">
                <div className="w-28 h-28 rounded-full border-4 border-blue-50 overflow-hidden bg-gray-50 flex items-center justify-center shadow-inner">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-300 font-bold text-4xl">
                      {name ? name[0].toUpperCase() : 'U'}
                    </span>
                  )}
                </div>
                <label className="absolute bottom-1 right-1 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer shadow-md transition-all">
                  <Camera className="w-4 h-4" />
                  <input type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleImageChange} />
                </label>
              </div>

              <div className="flex-1 text-center sm:text-left space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-gray-700">Upload your photograph</h3>
                  <p className="text-xs text-gray-400 mt-1">Supports JPG or PNG format.</p>
                </div>
                <div className="flex flex-wrap gap-2.5 justify-center sm:justify-start">
                  <label className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 cursor-pointer transition shadow-sm">
                    Choose Photo
                    <input type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleImageChange} />
                  </label>
                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition border border-red-100"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Section 2: Account Information */}
          <SectionCard icon={UserIcon} title="Account Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>Full Name</label>
                <input
                  type="text"
                  className={inputCls}
                  placeholder="Enter full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>Email Address <span className="text-xs text-gray-400 font-normal">(Read Only)</span></label>
                <input
                  type="email"
                  className={inputCls}
                  value={email}
                  disabled
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Bio / About Me</label>
                <textarea
                  rows={4}
                  className={`${inputCls} resize-none`}
                  placeholder="Share details about your volunteer drive, interests, or background..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Phone Number <span className="text-xs text-gray-400 font-normal">(Optional)</span></label>
                <input
                  type="tel"
                  className={inputCls}
                  placeholder="e.g. +94 77 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
          </SectionCard>

          {/* Section 3: Academic Information */}
          <SectionCard icon={BookOpen} title="Academic Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>Student ID</label>
                <input
                  type="text"
                  className={inputCls}
                  placeholder="e.g. STU123456"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>University / Institution</label>
                <input
                  type="text"
                  className={inputCls}
                  placeholder="Enter university name"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>Faculty / Department</label>
                <input
                  type="text"
                  className={inputCls}
                  placeholder="Enter faculty or department"
                  value={faculty}
                  onChange={(e) => setFaculty(e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>Degree Program</label>
                <input
                  type="text"
                  className={inputCls}
                  placeholder="e.g. BSc. Software Engineering"
                  value={degreeProgram}
                  onChange={(e) => setDegreeProgram(e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Year of Study</label>
                <select
                  className={inputCls}
                  value={yearOfStudy}
                  onChange={(e) => setYearOfStudy(e.target.value)}
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="Postgraduate">Postgraduate</option>
                </select>
              </div>
            </div>
          </SectionCard>

          {/* Section 4: Skills & Interests */}
          <SectionCard icon={Star} title="Skills & Interests">
            <p className="text-xs text-gray-500 -mt-2 mb-4">
              Select multiple skills that match your capabilities. You can add custom skills tags below.
            </p>

            {/* Interactive Grid of skills */}
            <div className="flex flex-wrap gap-2.5 mb-5">
              {DEFAULT_SKILLS.map((skill) => {
                const selected = selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleToggleSkill(skill)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-150 border-none cursor-pointer ${selected
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 border-solid'
                      }`}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>

            {/* Custom tags */}
            {selectedSkills.filter(s => !DEFAULT_SKILLS.includes(s)).length > 0 && (
              <div className="mb-5">
                <h4 className="text-xs font-bold text-gray-700 mb-2.5">Custom Skills Added:</h4>
                <div className="flex flex-wrap gap-2.5">
                  {selectedSkills.filter(s => !DEFAULT_SKILLS.includes(s)).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleToggleSkill(tag)}
                        className="text-blue-500 hover:text-blue-700 focus:outline-none border-none bg-transparent cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Input custom skill */}
            <form onSubmit={handleAddCustomSkill} className="flex gap-2 max-w-sm">
              <input
                type="text"
                className={inputCls}
                placeholder="Enter custom skill tag..."
                value={customSkillInput}
                onChange={(e) => setCustomSkillInput(e.target.value)}
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center shadow transition-colors border-none cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>
          </SectionCard>



          {/* Global Save Button */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
            <span className="text-xs text-gray-400 font-semibold">Verify all forms above before saving.</span>
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2.5 shadow hover:shadow-md disabled:opacity-75 border-none cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>

        </div>

        {/* Sidebar Grid column (Profile Summary and Security) */}
        <div className="lg:col-span-4 space-y-8">

          {/* Section 9: Security / Change Password */}
          <SectionCard icon={Lock} title="Security">
            <p className="text-xs text-gray-500 -mt-2 mb-4">
              Enter your current password to update account security credentials.
            </p>

            {passwordSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 font-semibold text-xs flex items-center gap-2 shadow-sm animate-fade-in">
                <Check className="w-4 h-4 text-green-500" />
                {passwordSuccess}
              </div>
            )}

            {passwordError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 font-semibold text-xs flex items-center gap-2 shadow-sm">
                <X className="w-4 h-4 text-red-500" />
                {passwordError}
              </div>
            )}

            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div>
                <label className={labelCls}>Current Password</label>
                <input
                  type="password"
                  className={inputCls}
                  placeholder="Enter current password"
                  value={passwords.current}
                  onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                />
              </div>
              <div>
                <label className={labelCls}>New Password</label>
                <input
                  type="password"
                  className={inputCls}
                  placeholder="Enter new password (min. 6 chars)"
                  value={passwords.newPass}
                  onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                />
              </div>
              <div>
                <label className={labelCls}>Confirm New Password</label>
                <input
                  type="password"
                  className={inputCls}
                  placeholder="Re-enter new password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                />
              </div>
              <button
                type="submit"
                disabled={passwordUpdating}
                className="w-full py-2.5 bg-gray-800 hover:bg-gray-900 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow border-none cursor-pointer"
              >
                {passwordUpdating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    Update Password
                  </>
                )}
              </button>
            </form>
          </SectionCard>

        </div>
      </div>
    </div>
  );
};

export default StudentSettings;