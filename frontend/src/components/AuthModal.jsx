import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Building, Eye, EyeOff, HandHelping, Phone, CheckCircle2, KeyRound, Mail, ArrowLeft, ShieldCheck, RefreshCw } from 'lucide-react';
import { 
  loginUser, 
  registerStudent, 
  registerOrganizer, 
  googleLogin, 
  googleRegisterOrganizer,
  forgotPassword,
  verifyOtp,
  resetPasswordWithOtp
} from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { VolunteerHubLogoIcon } from './VolunteerHubLogo';

const AuthModal = ({ isOpen, onClose, initialTab = 'login', initialRole = 'student' }) => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Active mode: 'login' | 'register' | 'forgot'
  const [activeRole, setActiveRole] = useState(initialRole === 'admin' ? 'student' : initialRole);
  const [activeTab, setActiveTab] = useState(initialTab);

  // Form states - Login
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  // Form states - Registration
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

  // Form states - Forgot Password Step Sequence ('email' -> 'otp' -> 'reset' -> 'success')
  const [forgotStep, setForgotStep] = useState('email'); 
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState(['', '', '', '', '', '']);
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotCooldown, setForgotCooldown] = useState(0);

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Onboarding (specifically for Organizer Google Login)
  const [onboardingData, setOnboardingData] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingForm, setOnboardingForm] = useState({
    clubName: '',
    contactNumber: ''
  });

  const otpInputsRef = useRef([]);

  // Resend cooldown timer for Forgot Password
  useEffect(() => {
    let timer;
    if (forgotCooldown > 0) {
      timer = setInterval(() => {
        setForgotCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [forgotCooldown]);

  // Reset errors and settings on open/change
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setActiveRole(initialRole === 'admin' ? 'student' : initialRole);
      setError('');
      setShowPassword(false);
      setShowOnboarding(false);
      setForgotStep('email');
      setForgotMessage('');
      setForgotEmail('');
      setForgotOtp(['', '', '', '', '', '']);
      setForgotNewPassword('');
      setForgotConfirmPassword('');
      setLoginData({ email: '', password: '' });
      setStudentRegisterData({
        fullName: '',
        studentId: '',
        faculty: '',
        skills: '',
        email: '',
        password: '',
      });
      setOrganizerRegisterData({
        clubName: '',
        contactNumber: '',
        email: '',
        password: '',
      });
    }
  }, [isOpen, initialTab, initialRole]);

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setError('');
    setShowPassword(false);
    if (tab === 'forgot') {
      setForgotStep('email');
      setForgotMessage('');
    }
  };

  const handleRoleSwitch = (role) => {
    setActiveRole(role);
    setError('');
    setShowPassword(false);
  };

  const handleOnboardingChange = (e) => {
    setOnboardingForm({ ...onboardingForm, [e.target.name]: e.target.value });
  };

  // Google Credential Callback
  const handleGoogleCredentialResponse = async (response) => {
    setLoading(true);
    setError('');
    try {
      const targetRole = activeTab === 'register' ? activeRole : 'student';
      const res = await googleLogin(response.credential, targetRole);
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
        onClose();
        const userRole = res.user?.role;
        if (userRole === 'student') navigate('/student/dashboard');
        else if (userRole === 'organizer') navigate('/organizer/dashboard');
        else if (userRole === 'admin') navigate('/admin/dashboard');
        else navigate('/');
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

  // Google OAuth button renderer inside modal
  useEffect(() => {
    if (!isOpen || showOnboarding || activeTab === 'forgot') return;

    const rawClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || import.meta.env.GOOGLE_CLIENT_ID || "527555008291-hs544883ee4apu936ltu543sorp9g2b2.apps.googleusercontent.com";
    const clientId = rawClientId.trim();

    const initGoogle = () => {
      const btn = document.getElementById("google-signin-btn-modal");
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
  }, [isOpen, activeTab, activeRole, showOnboarding]);

  // Submit Organizer Google Onboarding
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
      onClose();
      navigate('/organizer/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Single Login Submit for Student, Organizer & Admin
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await loginUser(loginData);
      login(data.user, data.token);
      setLoginData({ email: '', password: '' });
      onClose();

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

  // Register Submit for Student or Organizer
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (activeRole === 'student') {
      if (studentRegisterData.studentId && !/^STU\d{6}$/.test(studentRegisterData.studentId)) {
        setError('Student ID must be in the format STU followed by exactly 6 digits (e.g., STU123456).');
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
          setError('Could not connect to backend server. Please ensure the backend is running on port 5000.');
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
          setError('Could not connect to backend server. Please ensure the backend is running on port 5000.');
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

  // ── FORGOT PASSWORD STEP 1: Submit Email & Automatically Advance to OTP Input Window ──
  const handleRequestResetEmail = async (e) => {
    e?.preventDefault();
    if (!forgotEmail || !forgotEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError('');
    setForgotMessage('');

    try {
      await forgotPassword(forgotEmail);
      // Automatically advance to Step 2: OTP Code Enter Window
      setForgotStep('otp');
      setForgotCooldown(60);
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 150);
    } catch (err) {
      if (!err.response) {
        setError('Could not connect to backend server. Please check your network.');
      } else {
        setError(err.response?.data?.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...forgotOtp];
    newOtp[index] = value.slice(-1);
    setForgotOtp(newOtp);
    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !forgotOtp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      setForgotOtp(pastedData.split(''));
      otpInputsRef.current[5]?.focus();
    }
  };

  // ── FORGOT PASSWORD STEP 2: Verify OTP Code ──
  const handleVerifyOtpInModal = async (e) => {
    e.preventDefault();
    const fullOtp = forgotOtp.join('');
    if (!forgotEmail) {
      setError('Please enter your email address.');
      return;
    }
    if (fullOtp.length !== 6) {
      setError('Please enter a complete 6-digit OTP code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await verifyOtp(forgotEmail, fullOtp);
      // Automatically advance to Step 3: New Password Reset Window
      setForgotStep('reset');
    } catch (err) {
      if (!err.response) {
        setError('Could not connect to backend server.');
      } else {
        setError(err.response?.data?.message || 'Invalid or expired OTP code.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── FORGOT PASSWORD STEP 3: Save New Password ──
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (forgotNewPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const fullOtp = forgotOtp.join('');
      await resetPasswordWithOtp(forgotEmail, fullOtp, forgotNewPassword);
      setForgotStep('success');
      setTimeout(() => {
        setLoginData({ email: forgotEmail, password: '' });
        setActiveTab('login');
        setForgotStep('email');
        setError('');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300">
      {/* Backdrop Click-to-Close listener */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="bg-white w-full max-w-xl md:max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100 p-6 md:p-8 relative z-10 max-h-[92vh] overflow-y-auto transition-all duration-300 transform scale-100">
          
          {/* Header/Logo (Visible on Mobile only) */}
          <div className="flex items-center gap-2 mb-6 md:hidden">
            <VolunteerHubLogoIcon className="w-8 h-8" />
            <span className="font-extrabold text-slate-900 text-lg">Volunteer<span className="text-[#1D61F2]">Hub</span></span>
          </div>

          <div className="mb-6 text-left">
            <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight mb-2">
              {showOnboarding 
                ? 'Complete Sign-In' 
                : activeTab === 'forgot'
                ? (forgotStep === 'email' ? 'Forgot Password' : forgotStep === 'otp' ? 'Enter Verification Code' : forgotStep === 'reset' ? 'Set New Password' : 'Password Reset Complete')
                : (activeTab === 'login' 
                    ? 'Welcome Back!' 
                    : (activeRole === 'student' ? 'Join VolunteerHub' : 'Register Organization'))}
            </h3>
            <p className="text-slate-500 text-xs md:text-sm font-medium leading-relaxed">
              {showOnboarding 
                ? 'Please complete your organization profile to proceed.'
                : activeTab === 'forgot'
                ? (forgotStep === 'email' 
                    ? 'Enter your registered email address to receive a 6-digit OTP verification code.'
                    : forgotStep === 'otp'
                    ? `Enter the 6-digit OTP code sent to ${forgotEmail}`
                    : forgotStep === 'reset'
                    ? 'Create a new secure password for your VolunteerHub account.'
                    : 'Your password has been updated securely!')
                : (activeTab === 'login' 
                    ? 'Sign in to access your VolunteerHub account as a Student, Organizer, or Administrator.'
                    : (activeRole === 'student'
                        ? 'Create your free student account to start building your campus volunteer reputation.'
                        : 'Register your student club or organization to publish events and recruit volunteers.'))}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 text-xs px-4 py-3 rounded-xl mb-4 border border-red-100 font-medium">
              {error}
            </div>
          )}

          {/* Onboarding Mode Form */}
          {showOnboarding ? (
            <form onSubmit={handleOnboardingSubmit} className="space-y-4">
              <div className="text-left mb-4">
                <p className="text-xs text-gray-500">
                  Please finalize your Google Registration for <strong className="text-gray-800">{onboardingData?.email}</strong>.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Club / Organization Name
                </label>
                <div className="flex items-center border border-gray-300 rounded-xl px-3.5 py-2.5 gap-2 focus-within:border-blue-500 transition-colors">
                  <Building className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <input
                    type="text"
                    name="clubName"
                    value={onboardingForm.clubName}
                    onChange={handleOnboardingChange}
                    placeholder="Enter your club name"
                    required
                    className="flex-1 outline-none text-sm text-gray-700 bg-transparent w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Contact Number
                </label>
                <div className="flex items-center border border-gray-300 rounded-xl px-3.5 py-2.5 gap-2 focus-within:border-blue-500 transition-colors">
                  <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <input
                    type="tel"
                    name="contactNumber"
                    value={onboardingForm.contactNumber}
                    onChange={handleOnboardingChange}
                    placeholder="e.g. +94771234567"
                    required
                    className="flex-1 outline-none text-sm text-gray-700 bg-transparent w-full"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-white font-bold text-sm bg-blue-600 hover:bg-blue-700 transition-all duration-200 mt-2 disabled:opacity-60"
              >
                {loading ? 'Completing...' : 'Finish Registration'}
              </button>
            </form>
          ) : activeTab === 'forgot' ? (
            // ── FORGOT PASSWORD AUTOMATIC WIZARD POPUP VIEW ──────────────────────────
            <div className="space-y-4 text-left">

              {/* STEP 1: Enter Email */}
              {forgotStep === 'email' && (
                <form onSubmit={handleRequestResetEmail} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Registered Email Address
                    </label>
                    <div className="flex items-center border border-gray-300 rounded-xl px-3.5 py-2.5 gap-2 focus-within:border-blue-500 transition-colors">
                      <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <input
                        type="email"
                        required
                        placeholder="name@example.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent w-full"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl text-white font-bold text-sm bg-blue-600 hover:bg-blue-700 transition-all shadow-sm disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Sending Code...</span>
                      </>
                    ) : (
                      <span>Send Verification Code</span>
                    )}
                  </button>
                </form>
              )}

              {/* STEP 2: Enter 6-Digit OTP Code (Displayed immediately after submitting Email) */}
              {forgotStep === 'otp' && (
                <form onSubmit={handleVerifyOtpInModal} className="space-y-4">
                  <div className="bg-blue-50/80 border border-blue-100 rounded-xl p-3.5 flex items-center justify-between text-xs text-blue-900">
                    <div>
                      <span className="text-gray-500 block text-[10px]">Verification code sent to:</span>
                      <span className="font-bold text-blue-700">{forgotEmail}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForgotStep('email')}
                      className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      Change Email
                    </button>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Enter 6-Digit Code
                      </label>
                      <span className="text-[10px] text-gray-400">Check email inbox</span>
                    </div>
                    <div className="flex gap-2 justify-between" onPaste={handleOtpPaste}>
                      {forgotOtp.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => (otpInputsRef.current[idx] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          className="w-11 h-12 text-center text-lg font-bold text-slate-900 border border-gray-300 rounded-xl focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors bg-gray-50/50"
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={handleRequestResetEmail}
                      disabled={loading || forgotCooldown > 0}
                      className="text-xs font-bold text-blue-600 hover:underline disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>{forgotCooldown > 0 ? `Resend Code in ${forgotCooldown}s` : 'Resend Code'}</span>
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl text-white font-bold text-sm bg-blue-600 hover:bg-blue-700 transition-all shadow-sm disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Verifying Code...</span>
                      </>
                    ) : (
                      <span>Verify Code & Continue</span>
                    )}
                  </button>
                </form>
              )}

              {/* STEP 3: Enter New Password (Displayed after OTP is verified) */}
              {forgotStep === 'reset' && (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      New Password
                    </label>
                    <div className="flex items-center border border-gray-300 rounded-xl px-3.5 py-2.5 gap-2 focus-within:border-blue-500 transition-colors">
                      <KeyRound className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="At least 6 characters"
                        value={forgotNewPassword}
                        onChange={(e) => setForgotNewPassword(e.target.value)}
                        className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent w-full"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-blue-500 transition-colors focus:outline-none"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Confirm New Password
                    </label>
                    <div className="flex items-center border border-gray-300 rounded-xl px-3.5 py-2.5 gap-2 focus-within:border-blue-500 transition-colors">
                      <ShieldCheck className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="Re-enter new password"
                        value={forgotConfirmPassword}
                        onChange={(e) => setForgotConfirmPassword(e.target.value)}
                        className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent w-full"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl text-white font-bold text-sm bg-blue-600 hover:bg-blue-700 transition-all shadow-sm disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <span>Reset Password</span>
                    )}
                  </button>
                </form>
              )}

              {/* STEP 4: Success Message */}
              {forgotStep === 'success' && (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 animate-bounce">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-lg font-extrabold text-slate-800">Password Reset Complete!</h4>
                    <p className="text-xs text-slate-500 mt-1">Your password has been updated securely.</p>
                  </div>
                  <p className="text-xs text-blue-600 font-bold">Redirecting to Sign In...</p>
                </div>
              )}

              {/* Back to Sign In Link inside Modal */}
              {forgotStep !== 'success' && (
                <div className="pt-3 border-t border-gray-100 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => { setActiveTab('login'); setError(''); setForgotStep('email'); }}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 font-bold transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Sign In</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Standard Forms (Sign In / Register)
            <>
              {/* ACTION CHOOSE OPTION TABS (Sign In vs Create Account) */}
              <div className="flex justify-center gap-6 mb-5">
                <button
                  type="button"
                  onClick={() => handleTabSwitch('login')}
                  className={`text-sm font-bold pb-1.5 border-b-2 transition-colors duration-200 cursor-pointer ${
                    activeTab === 'login'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => handleTabSwitch('register')}
                  className={`text-sm font-bold pb-1.5 border-b-2 transition-colors duration-200 cursor-pointer ${
                    activeTab === 'register'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* PORTAL CHOOSE OPTION TABS (ONLY SHOWN ON CREATE ACCOUNT TAB) */}
              {activeTab === 'register' && (
                <div className="flex border border-gray-100 bg-gray-50/70 p-1 rounded-2xl mb-5 gap-1">
                  <button
                    type="button"
                    onClick={() => handleRoleSwitch('student')}
                    className={`flex-1 py-2 text-center text-xs font-bold rounded-xl transition-all duration-250 flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeRole === 'student'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    Student Account
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleSwitch('organizer')}
                    className={`flex-1 py-2 text-center text-xs font-bold rounded-xl transition-all duration-250 flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeRole === 'organizer'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    <Building className="w-3.5 h-3.5" />
                    Organizer Account
                  </button>
                </div>
              )}

              {activeTab === 'login' ? (
                // ── SINGLE UNIFIED LOGIN FORM ─────────────────────────────
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="you@university.edu"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Password
                      </label>
                      <span
                        onClick={() => { setActiveTab('forgot'); setForgotStep('email'); setError(''); }}
                        className="text-[11px] text-blue-500 hover:underline cursor-pointer font-medium"
                      >
                        Forgot password?
                      </span>
                    </div>
                    <div className="flex items-center border border-gray-300 rounded-xl px-3.5 py-2.5 gap-2 focus-within:border-blue-500 transition-colors">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        required
                        placeholder="Enter password"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent w-full"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-blue-500 transition-colors focus:outline-none"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl text-white font-bold text-base shadow-sm transition-all duration-250 mt-2 disabled:opacity-60 cursor-pointer bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                  </button>

                  {/* Google OAuth Button Container */}
                  <div className="mt-4 flex flex-col items-center justify-center w-full min-h-[44px]">
                    <div className="w-full flex items-center gap-3 mb-3">
                      <div className="flex-1 h-px bg-gray-200"></div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Or Sign In With Google</span>
                      <div className="flex-1 h-px bg-gray-200"></div>
                    </div>

                    <div className="w-full flex justify-center">
                      <div id="google-signin-btn-modal" className="w-full flex justify-center"></div>
                    </div>
                  </div>
                </form>
              ) : (
                // ── REGISTRATION FORM (COMPACT 2-COLUMN GRID) ──────────────
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  {activeRole === 'student' ? (
                    /* Student 2-Column Grid */
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          required
                          placeholder="John Doe"
                          value={studentRegisterData.fullName}
                          onChange={(e) => setStudentRegisterData({ ...studentRegisterData, fullName: e.target.value })}
                          className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                          Student ID
                        </label>
                        <input
                          type="text"
                          name="studentId"
                          required
                          placeholder="STU123456"
                          value={studentRegisterData.studentId}
                          onChange={(e) => setStudentRegisterData({ ...studentRegisterData, studentId: e.target.value })}
                          className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                          Faculty
                        </label>
                        <input
                          type="text"
                          name="faculty"
                          required
                          placeholder="Faculty of Engineering"
                          value={studentRegisterData.faculty}
                          onChange={(e) => setStudentRegisterData({ ...studentRegisterData, faculty: e.target.value })}
                          className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                          Skills <span className="text-gray-400 font-normal lowercase">(optional)</span>
                        </label>
                        <input
                          type="text"
                          name="skills"
                          placeholder="Leadership, Writing"
                          value={studentRegisterData.skills}
                          onChange={(e) => setStudentRegisterData({ ...studentRegisterData, skills: e.target.value })}
                          className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          placeholder="student@university.edu"
                          value={studentRegisterData.email}
                          onChange={(e) => setStudentRegisterData({ ...studentRegisterData, email: e.target.value })}
                          className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                          Password
                        </label>
                        <div className="flex items-center border border-gray-300 rounded-xl px-3.5 py-2 gap-2 focus-within:border-blue-500 transition-colors">
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            required
                            placeholder="Choose password"
                            value={studentRegisterData.password}
                            onChange={(e) => setStudentRegisterData({ ...studentRegisterData, password: e.target.value })}
                            className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent w-full"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-gray-400 hover:text-blue-500 transition-colors focus:outline-none"
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
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                          Club / Organization Name
                        </label>
                        <input
                          type="text"
                          name="clubName"
                          required
                          placeholder="Rotaract Club"
                          value={organizerRegisterData.clubName}
                          onChange={(e) => setOrganizerRegisterData({ ...organizerRegisterData, clubName: e.target.value })}
                          className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                          Contact Phone Number
                        </label>
                        <input
                          type="tel"
                          name="contactNumber"
                          required
                          placeholder="+94771234567"
                          value={organizerRegisterData.contactNumber}
                          onChange={(e) => setOrganizerRegisterData({ ...organizerRegisterData, contactNumber: e.target.value })}
                          className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          placeholder="club@organization.com"
                          value={organizerRegisterData.email}
                          onChange={(e) => setOrganizerRegisterData({ ...organizerRegisterData, email: e.target.value })}
                          className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                          Password
                        </label>
                        <div className="flex items-center border border-gray-300 rounded-xl px-3.5 py-2 gap-2 focus-within:border-blue-500 transition-colors">
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
                            className="text-gray-400 hover:text-blue-500 transition-colors focus:outline-none"
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
                  <div className="mt-3 flex flex-col items-center justify-center w-full min-h-[44px]">
                    <div className="w-full flex items-center gap-3 mb-2">
                      <div className="flex-1 h-px bg-gray-200"></div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Or Register With Google</span>
                      <div className="flex-1 h-px bg-gray-200"></div>
                    </div>

                    <div className="w-full flex justify-center">
                      <div id="google-signin-btn-modal" className="w-full flex justify-center"></div>
                    </div>
                  </div>
                </form>
              )}

              {/* Role Features Preview Badge */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-center gap-2 text-xs font-semibold text-blue-600">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>
                  {activeTab === 'login'
                    ? 'VolunteerHub: Connecting Students, Organizers & Administrators'
                    : activeRole === 'student' 
                    ? 'Student Perks: Earn Verified Certificates & Leaderboard Points' 
                    : 'Organizer Perks: Automated Attendance & Volunteer Analytics'}
                </span>
              </div>
            </>
          )}
      </div>
    </div>
  );
};

export default AuthModal;
