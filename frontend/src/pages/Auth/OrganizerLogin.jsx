import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, googleLogin, googleRegisterOrganizer } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Building, Phone, ArrowRight, X } from 'lucide-react';

const OrganizerLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [onboardingData, setOnboardingData] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingForm, setOnboardingForm] = useState({
    clubName: '',
    contactNumber: ''
  });

  const handleGoogleCredentialResponse = async (response) => {
    setLoading(true);
    setError('');
    try {
      const res = await googleLogin(response.credential, "organizer");
      if (res.status === "needs_onboarding") {
        setOnboardingData({
          email: res.email,
          name: res.name,
          idToken: res.idToken
        });
        setOnboardingForm({
          clubName: res.name || '',
          contactNumber: ''
        });
        setShowOnboarding(true);
      } else {
        login(res.user, res.token);
        navigate('/');
      }
    } catch (err) {
      if (!err.response) {
        setError('Could not connect to backend server. Please ensure the backend is running on port 5000.');
      } else {
        setError(err.response?.data?.message || 'Google authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const phoneRegex = /^\+?[\d\s\-()]{7,20}$/;
    if (onboardingForm.contactNumber && !phoneRegex.test(onboardingForm.contactNumber)) {
      setError('Contact number must be a valid phone number (7 to 20 characters).');
      setLoading(false);
      return;
    }

    try {
      const res = await googleRegisterOrganizer(
        onboardingData.idToken,
        onboardingForm.clubName,
        onboardingForm.contactNumber
      );
      login(res.user, res.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showOnboarding) return;
    const clientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID || import.meta.env.GOOGLE_CLIENT_ID || "527555008291-hs544883ee4apu936ltu543sorp9g2b2.apps.googleusercontent.com").trim();
    
    const initGoogle = () => {
      const btn = document.getElementById("google-signin-btn");
      if (btn && window.google) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleCredentialResponse,
          });
          window.google.accounts.id.renderButton(
            btn,
            { theme: "outline", size: "large", width: 384 }
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
  }, [showOnboarding]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await loginUser({
        email: formData.email,
        password: formData.password,
      });
      if (data.user.role !== 'organizer') {
        setError('Access denied. Please use the student login page.');
        return;
      }
      login(data.user, data.token);
      setFormData({ email: '', password: '' });
      navigate('/');
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

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col
                    items-center justify-center px-4 pt-28 pb-10">



      {/* Page Heading */}
      <h1 className="text-3xl font-bold text-gray-800 mb-1">
        Welcome Back
      </h1>
      <p className="text-gray-500 text-base mb-8">
        Sign in to your organizer account
      </p>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-md w-full
                      max-w-md px-8 py-8">

        {/* Card Header */}
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
            <Building className="w-4.5 h-4.5" />
          </div>
          <h2 className="text-lg font-bold text-gray-800">
            Organizer Login
          </h2>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-500 text-sm px-4
                          py-3 rounded-lg mb-4 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email */}
          <div>
            <label className="block text-sm font-medium
                              text-gray-700 mb-1">
              Email
            </label>
            <div className="flex items-center border border-gray-300
                            rounded-lg px-3 py-2 gap-2
                            focus-within:border-blue-400
                            transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 text-gray-400 flex-shrink-0"
                fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path strokeLinecap="round"
                  strokeLinejoin="round" strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14
                     a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2
                     2v10a2 2 0 002 2z" />
              </svg>
              <input
                type="email"
                name="email"
                placeholder="club@university.edu"
                value={formData.email}
                onChange={handleChange}
                required
                className="flex-1 outline-none text-sm
                           text-gray-700 placeholder-gray-400
                           bg-transparent w-full"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium
                              text-gray-700 mb-1">
              Password
            </label>
            <div className="flex items-center border border-gray-300
                            rounded-lg px-3 py-2 gap-2
                            focus-within:border-blue-400
                            transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 text-gray-400 flex-shrink-0"
                fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path strokeLinecap="round"
                  strokeLinejoin="round" strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0
                     00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10
                     -10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                className="flex-1 outline-none text-sm
                           text-gray-700 placeholder-gray-400
                           bg-transparent w-full"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-blue-500 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Forgot Password */}
            <div className="text-right mt-1">
              <span
                onClick={() => navigate('/forgot-password')}
                className="text-xs text-blue-500 cursor-pointer hover:underline"
              >
                Forgot password?
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-white
                       font-semibold text-base
                       bg-blue-600 hover:bg-blue-700
                       transition-all duration-200 mt-2
                       disabled:opacity-60
                       disabled:cursor-not-allowed">
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

        </form>

        {/* Google OAuth Login Button */}
        <div className="mt-4 flex justify-center">
          <div id="google-signin-btn" className="w-full flex justify-center"></div>
        </div>

        {/* Google Onboarding Form Modal */}
        {showOnboarding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-slate-900/60 p-4 transition-all duration-300">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-100/80 animate-in fade-in-50 zoom-in-95 duration-200">
              {/* Top Branding Banner with Gradient */}
              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 text-white text-center relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowOnboarding(false);
                    setOnboardingData(null);
                  }}
                  className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
                
                {/* Google + Org Icon Ring */}
                <div className="flex justify-center items-center gap-3 mb-3">
                  <div className="bg-white p-2 rounded-xl shadow-lg flex items-center justify-center">
                    <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                    </svg>
                  </div>
                  <div className="h-6 w-px bg-white/30"></div>
                  <div className="bg-white/10 backdrop-blur p-2 rounded-xl text-white flex items-center justify-center">
                    <Building className="w-6 h-6" />
                  </div>
                </div>

                <h3 className="font-extrabold text-xl tracking-tight leading-tight">Onboarding Profile</h3>
                <p className="text-xs text-blue-100 mt-1 opacity-90">Almost there! Complete your organization setup</p>
              </div>

              <div className="p-6">
                <p className="text-sm text-gray-500 mb-5 text-left leading-relaxed">
                  Welcome, <span className="font-semibold text-gray-800">{onboardingData?.name}</span>! Please enter your official details below to register your organization.
                </p>

                <form onSubmit={handleOnboardingSubmit} className="space-y-4">
                  {/* Organization Name Input */}
                  <div className="text-left">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Organization Name
                    </label>
                    <div className="relative flex items-center border border-gray-300 rounded-xl px-3.5 py-2.5 bg-gray-50/50 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/10 focus-within:border-blue-500 transition-all duration-200">
                      <Building className="w-5 h-5 text-gray-400 mr-2.5 flex-shrink-0" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. IEEE Volunteer Club"
                        value={onboardingForm.clubName}
                        onChange={(e) => setOnboardingForm({ ...onboardingForm, clubName: e.target.value })}
                        className="flex-1 outline-none text-sm text-gray-700 bg-transparent w-full"
                      />
                    </div>
                  </div>

                  {/* Contact Number Input */}
                  <div className="text-left">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Contact Number
                    </label>
                    <div className="relative flex items-center border border-gray-300 rounded-xl px-3.5 py-2.5 bg-gray-50/50 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/10 focus-within:border-blue-500 transition-all duration-200">
                      <Phone className="w-5 h-5 text-gray-400 mr-2.5 flex-shrink-0" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. +94712345678"
                        value={onboardingForm.contactNumber}
                        onChange={(e) => setOnboardingForm({ ...onboardingForm, contactNumber: e.target.value })}
                        className="flex-1 outline-none text-sm text-gray-700 bg-transparent w-full"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 text-red-600 px-3.5 py-2.5 rounded-xl text-xs font-semibold border border-red-100 text-left animate-shake">
                      {error}
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="pt-2 space-y-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl py-3 text-sm font-bold shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      {loading ? 'Completing Profile...' : (
                        <>
                          Complete Setup &amp; Log In
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowOnboarding(false);
                        setOnboardingData(null);
                      }}
                      className="w-full text-gray-500 hover:text-gray-700 rounded-xl py-2.5 text-xs font-bold hover:bg-gray-50 transition-all"
                    >
                      Cancel Onboarding
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-xs text-gray-400">
            Don't have an account?
          </span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        {/* Register Link */}
        <button
          onClick={() => navigate('/register/organizer')}
          className="w-full py-3 rounded-xl text-white
                     font-semibold text-base bg-blue-600
                     hover:bg-blue-700 shadow-sm hover:shadow transition-all duration-200">
          Create Organizer Account
        </button>

      </div>

      {/* Link to Student Login */}
      <p className="mt-6 text-sm text-gray-500">
        Not an organizer?{' '}
        <span
          onClick={() => navigate('/signin')}
          className="text-blue-500 font-medium cursor-pointer
                     hover:underline">
          Log in as a student
        </span>
      </p>

      {/* Link to Admin Portal */}
      <p className="mt-3 text-sm text-gray-500">
        <span
          onClick={() => navigate('/admin/login')}
          className="text-blue-500 font-medium cursor-pointer
                     hover:underline">
          Admin Portal &rarr;
        </span>
      </p>

    </div>
  );
};

export default OrganizerLogin;