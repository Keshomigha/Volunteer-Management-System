import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Building, Eye, EyeOff, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';
import { VolunteerHubLogoIcon } from '../../components/VolunteerHubLogo';
import { loginUser, registerStudent, registerOrganizer, googleLogin } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../services/apiConfig';

const UnifiedAuthPage = ({ initialTab = 'login', initialRole = 'student' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [activeRole, setActiveRole] = useState(initialRole);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [registrationOpen, setRegistrationOpen] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/public-settings`)
      .then(res => res.json())
      .then(data => {
        if (data.registrationOpen !== undefined) {
          setRegistrationOpen(data.registrationOpen);
        }
      })
      .catch(() => {});
  }, []);

  // Sync state if initial props or route changes
  useEffect(() => {
    setActiveTab(initialTab);
    setActiveRole(initialRole === 'admin' ? 'student' : initialRole);
  }, [initialTab, initialRole, location.pathname]);

  // Form states
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  const [studentRegisterData, setStudentRegisterData] = useState({
    fullName: '',
    studentId: '',
    faculty: '',
    skills: '',
    email: '',
    password: '',
  });

  const [organizerRegisterData, setOrganizerRegisterData] = useState({
    clubName: '',
    contactNumber: '',
    email: '',
    password: '',
  });

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Google Onboarding State for Organizers
  const [onboardingData, setOnboardingData] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const handleRoleSwitch = (role) => {
    setActiveRole(role);
    setError('');
    setShowPassword(false);
  };

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setError('');
    setShowPassword(false);
  };

  // Google Credential Callback
  const handleGoogleCredentialResponse = async (response) => {
    setLoading(true);
    setError('');
    try {
      const targetRole = activeTab === 'register' ? activeRole : 'student';
      const res = await googleLogin(response.credential, targetRole);
      if (res.status === "needs_onboarding") {
        setOnboardingData({ email: res.email, name: res.name, idToken: res.idToken });
        setShowOnboarding(true);
      } else {
        login(res.user, res.token);
        const userRole = res.user?.role;
        if (userRole === 'student') navigate('/student/dashboard');
        else if (userRole === 'organizer') navigate('/organizer/dashboard');
        else if (userRole === 'admin') navigate('/admin/dashboard');
        else navigate('/');
      }
    } catch (err) {
      if (!err.response) {
        setError('Could not connect to backend server. Please check backend execution on port 5000.');
      } else {
        setError(err.response?.data?.message || 'Google authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth button renderer
  useEffect(() => {
    if (showOnboarding) return;

    const rawClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || import.meta.env.GOOGLE_CLIENT_ID || "527555008291-hs544883ee4apu936ltu543sorp9g2b2.apps.googleusercontent.com";
    const clientId = rawClientId.trim();

    const initGoogle = () => {
      const btn = document.getElementById("google-signin-btn-page");
      if (btn && window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleCredentialResponse,
            cancel_on_tap_outside: false,
          });
          btn.innerHTML = "";
          const parentWidth = btn.parentElement ? btn.parentElement.clientWidth : 320;
          const targetWidth = Math.min(Math.max(parentWidth, 240), 400);

          window.google.accounts.id.renderButton(
            btn,
            { 
              type: "standard",
              theme: "outline", 
              size: "large", 
              width: targetWidth,
              text: activeTab === 'login' ? 'signin_with' : 'signup_with',
              shape: "rectangular"
            }
          );
          return true;
        } catch (err) {
          console.error("Google Sign-In initialization failed:", err);
        }
      }
      return false;
    };

    if (!initGoogle()) {
      const interval = setInterval(() => {
        if (initGoogle()) {
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [activeTab, activeRole, showOnboarding]);

  // Submit Single Login for Student, Organizer & Admin
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await loginUser(loginData);
      login(data.user, data.token);
      setLoginData({ email: '', password: '' });

      const userRole = data.user?.role;
      if (userRole === 'student') navigate('/student/dashboard');
      else if (userRole === 'organizer') navigate('/organizer/dashboard');
      else if (userRole === 'admin') navigate('/admin/dashboard');
      else navigate('/');
    } catch (err) {
      if (!err.response) {
        setError('Could not connect to backend server. Please ensure the backend is running on port 5000.');
      } else {
        setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Submit Register (Student or Organizer)
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (activeRole === 'student') {
      if (studentRegisterData.studentId && !/^STU\d{6}$/.test(studentRegisterData.studentId)) {
        setError('Student ID must be in the format STU followed by 6 digits (e.g., STU123456).');
        setLoading(false);
        return;
      }

      try {
        const payload = {
          name: studentRegisterData.fullName,
          studentId: studentRegisterData.studentId,
          faculty: studentRegisterData.faculty,
          skills: studentRegisterData.skills,
          email: studentRegisterData.email,
          password: studentRegisterData.password,
        };
        await registerStudent(payload);
        setError('');
        setActiveTab('login');
        setLoginData({ email: studentRegisterData.email, password: '' });
      } catch (err) {
        if (!err.response) {
          setError('Could not connect to backend server. Please check your network connection.');
        } else {
          const data = err.response?.data;
          if (data && data.errors && Array.isArray(data.errors)) {
            setError(data.errors.map(e => `${e.field}: ${e.message}`).join(', '));
          } else {
            setError(data?.message || 'Registration failed. Please try again.');
          }
        }
      } finally {
        setLoading(false);
      }
    } else if (activeRole === 'organizer') {
      const phoneRegex = /^\+?[\d\s\-()]{7,20}$/;
      if (organizerRegisterData.contactNumber && !phoneRegex.test(organizerRegisterData.contactNumber)) {
        setError('Contact number must be a valid phone number (7 to 20 characters).');
        setLoading(false);
        return;
      }

      try {
        const payload = {
          organizationName: organizerRegisterData.clubName,
          phone: organizerRegisterData.contactNumber,
          email: organizerRegisterData.email,
          password: organizerRegisterData.password,
        };
        await registerOrganizer(payload);
        setError('');
        setActiveTab('login');
        setLoginData({ email: organizerRegisterData.email, password: '' });
      } catch (err) {
        if (!err.response) {
          setError('Could not connect to backend server. Please check your network connection.');
        } else {
          const data = err.response?.data;
          if (data && data.errors && Array.isArray(data.errors)) {
            setError(data.errors.map(e => `${e.field}: ${e.message}`).join(', '));
          } else {
            setError(data?.message || 'Registration failed. Please try again.');
          }
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/90 to-blue-50/50 flex flex-col items-center justify-center px-4 pt-24 pb-12 relative overflow-hidden font-sans">
      
      {/* Dynamic Ambient Background Glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
        <div className="absolute -top-32 -right-32 w-[550px] h-[550px] rounded-full blur-3xl transition-all duration-700 bg-blue-500/10" />
        <div className="absolute -bottom-40 -left-20 w-[450px] h-[450px] rounded-full blur-3xl transition-all duration-700 bg-indigo-500/10" />
      </div>

      {/* Top Brand Logo */}
      <div className="flex items-center gap-2.5 mb-6 cursor-pointer group" onClick={() => navigate('/')}>
        <VolunteerHubLogoIcon className="w-11 h-11" />
        <div className="flex flex-col">
          <span className="font-extrabold text-2xl text-slate-900 tracking-tight leading-none">Volunteer<span className="text-[#1D61F2]">Hub</span></span>
          <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mt-0.5">Campus Opportunity Portal</span>
        </div>
      </div>

      {/* Main Container Card */}
      <div className="bg-white w-full max-w-xl md:max-w-2xl rounded-[2rem] shadow-2xl shadow-slate-200/80 overflow-hidden border border-slate-200/80 p-6 md:p-8 flex flex-col justify-start relative z-10 transition-all duration-300">
          
          {/* Header Title & Dynamic Subtitle */}
          <div className="mb-5 text-left">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight mb-1.5">
              {activeTab === 'login' 
                ? 'Welcome Back!' 
                : (activeRole === 'student' ? 'Join VolunteerHub' : 'Register Organization')}
            </h2>
            <p className="text-slate-500 text-xs md:text-sm font-medium leading-relaxed">
              {activeTab === 'login' 
                ? 'Sign in to access your VolunteerHub account as a Student, Organizer, or Administrator.'
                : (activeRole === 'student'
                    ? 'Create your free student account to start building your campus volunteer reputation.'
                    : 'Register your student club or organization to publish events and recruit volunteers.')}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-rose-50 text-rose-600 text-xs px-4 py-2.5 rounded-2xl mb-4 border border-rose-100 font-semibold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0 animate-ping" />
              <span>{error}</span>
            </div>
          )}

          {/* Registration Closed Notice */}
          {activeTab === 'register' && !registrationOpen && (
            <div className="bg-amber-50 text-amber-800 text-xs p-3.5 rounded-2xl mb-4 border border-amber-200 font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>New user registrations are currently closed by system administrators.</span>
            </div>
          )}

          {/* Mode Selector (Sign In vs Create Account) */}
          <div className="flex justify-center gap-8 mb-5 border-b border-slate-100 pb-2.5">
            <button
              type="button"
              onClick={() => handleTabSwitch('login')}
              className={`text-sm font-extrabold pb-2 transition-all cursor-pointer border-b-2 ${
                activeTab === 'login'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleTabSwitch('register')}
              className={`text-sm font-extrabold pb-2 transition-all cursor-pointer border-b-2 ${
                activeTab === 'register'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Role Selector (ONLY SHOWN ON CREATE ACCOUNT TAB FOR STUDENT & ORGANIZER) */}
          {activeTab === 'register' && (
            <div className="flex border border-slate-200/80 bg-slate-100/70 p-1.5 rounded-2xl mb-5 shadow-inner gap-1">
              <button
                type="button"
                onClick={() => handleRoleSwitch('student')}
                className={`flex-1 py-2.5 text-center text-xs font-extrabold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                  activeRole === 'student' 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <User className="w-4 h-4" />
                Student Account
              </button>
              <button
                type="button"
                onClick={() => handleRoleSwitch('organizer')}
                className={`flex-1 py-2.5 text-center text-xs font-extrabold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                  activeRole === 'organizer' 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Building className="w-4 h-4" />
                Organizer Account
              </button>
            </div>
          )}

          {/* Forms */}
          {activeTab === 'login' ? (
            /* SINGLE UNIFIED LOGIN FORM (Student, Organizer & Admin) */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="you@university.edu"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  <span
                    onClick={() => navigate('/forgot-password')}
                    className="text-[11px] font-bold hover:underline cursor-pointer text-blue-600"
                  >
                    Forgot password?
                  </span>
                </div>
                <div className="flex items-center border border-slate-300 rounded-xl px-3.5 py-2.5 gap-2 transition-all focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-600">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="flex-1 outline-none text-sm text-slate-800 placeholder-slate-400 bg-transparent w-full"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-700 transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-white font-extrabold text-base transition-all duration-250 mt-2 disabled:opacity-60 cursor-pointer shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-600/25"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>

              {/* Google OAuth Button Container */}
              <div className="mt-4 flex flex-col items-center justify-center w-full">
                <div className="w-full flex items-center gap-3 mb-3">
                  <div className="flex-1 h-px bg-slate-200"></div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Or Sign In With Google</span>
                  <div className="flex-1 h-px bg-slate-200"></div>
                </div>

                <div className="relative w-full overflow-hidden rounded-xl h-[46px]">
                  <div className="w-full h-full rounded-xl border border-slate-300 bg-white hover:bg-slate-50 flex items-center justify-center gap-3 text-slate-700 font-extrabold text-sm shadow-sm transition-all pointer-events-none">
                    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                    </svg>
                    <span>Sign in with Google</span>
                  </div>

                  <div 
                    id="google-signin-btn-page" 
                    className="absolute inset-0 opacity-0 cursor-pointer flex justify-center items-center scale-x-[1.7] scale-y-[1.3]"
                  />
                </div>
              </div>
            </form>
          ) : (
            /* REGISTER FORM (COMPACT 2-COLUMN GRID FOR STUDENT OR ORGANIZER) */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {activeRole === 'student' ? (
                /* Student 2-Column Grid */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      placeholder="John Doe"
                      value={studentRegisterData.fullName}
                      onChange={(e) => setStudentRegisterData({ ...studentRegisterData, fullName: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                      Student ID
                    </label>
                    <input
                      type="text"
                      name="studentId"
                      required
                      placeholder="STU123456"
                      value={studentRegisterData.studentId}
                      onChange={(e) => setStudentRegisterData({ ...studentRegisterData, studentId: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                      Faculty
                    </label>
                    <input
                      type="text"
                      name="faculty"
                      required
                      placeholder="Faculty of Engineering"
                      value={studentRegisterData.faculty}
                      onChange={(e) => setStudentRegisterData({ ...studentRegisterData, faculty: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                      Skills <span className="text-slate-400 font-normal lowercase">(optional)</span>
                    </label>
                    <input
                      type="text"
                      name="skills"
                      placeholder="Leadership, Writing"
                      value={studentRegisterData.skills}
                      onChange={(e) => setStudentRegisterData({ ...studentRegisterData, skills: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="student@university.edu"
                      value={studentRegisterData.email}
                      onChange={(e) => setStudentRegisterData({ ...studentRegisterData, email: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                      Password
                    </label>
                    <div className="flex items-center border border-slate-300 rounded-xl px-3.5 py-2 gap-2 focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-600 transition-all">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        required
                        placeholder="Choose password"
                        value={studentRegisterData.password}
                        onChange={(e) => setStudentRegisterData({ ...studentRegisterData, password: e.target.value })}
                        className="flex-1 outline-none text-sm text-slate-800 placeholder-slate-400 bg-transparent w-full"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-slate-400 hover:text-slate-700 transition-colors focus:outline-none"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Organizer 2-Column Grid */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                      Club / Organization Name
                    </label>
                    <input
                      type="text"
                      name="clubName"
                      required
                      placeholder="Rotaract Club"
                      value={organizerRegisterData.clubName}
                      onChange={(e) => setOrganizerRegisterData({ ...organizerRegisterData, clubName: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                      Contact Phone Number
                    </label>
                    <input
                      type="tel"
                      name="contactNumber"
                      required
                      placeholder="+94771234567"
                      value={organizerRegisterData.contactNumber}
                      onChange={(e) => setOrganizerRegisterData({ ...organizerRegisterData, contactNumber: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="club@organization.com"
                      value={organizerRegisterData.email}
                      onChange={(e) => setOrganizerRegisterData({ ...organizerRegisterData, email: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                      Password
                    </label>
                    <div className="flex items-center border border-slate-300 rounded-xl px-3.5 py-2 gap-2 focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-600 transition-all">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        required
                        placeholder="Choose password"
                        value={organizerRegisterData.password}
                        onChange={(e) => setOrganizerRegisterData({ ...organizerRegisterData, password: e.target.value })}
                        className="flex-1 outline-none text-sm text-slate-800 placeholder-slate-400 bg-transparent w-full"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-slate-400 hover:text-slate-700 transition-colors focus:outline-none"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-white font-extrabold text-base transition-all duration-250 mt-1 disabled:opacity-60 cursor-pointer shadow-lg bg-blue-600 hover:bg-blue-700 shadow-blue-600/25"
              >
                {loading ? 'Creating Account...' : `Create ${activeRole === 'student' ? 'Student Account' : 'Organizer Account'}`}
              </button>

              {/* Bottom Google OAuth Button Container */}
              <div className="mt-3 flex flex-col items-center justify-center w-full">
                <div className="w-full flex items-center gap-3 mb-2">
                  <div className="flex-1 h-px bg-slate-200"></div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Or Register With Google</span>
                  <div className="flex-1 h-px bg-slate-200"></div>
                </div>

                <div className="w-full flex justify-center min-h-[44px]">
                  <div id="google-signin-btn-page" className="w-full flex justify-center"></div>
                </div>
              </div>
            </form>
          )}

          {/* Features Preview Badge */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs font-semibold text-blue-600">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>
              {activeTab === 'login'
                ? 'VolunteerHub: Connecting Students, Organizers & Administrators'
                : activeRole === 'student' 
                ? 'Student Perks: Earn Verified Certificates & Leaderboard Points' 
                : 'Organizer Perks: Automated Attendance & Volunteer Analytics'}
            </span>
          </div>
      </div>

      {/* Back to Home Link */}
      <button
        onClick={() => navigate('/')}
        className="mt-6 flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </button>

    </div>
  );
};

export default UnifiedAuthPage;
