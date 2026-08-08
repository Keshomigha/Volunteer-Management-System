import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { forgotPassword, verifyOtp } from '../../services/authService';

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('link'); // 'link' | 'otp'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Resend cooldown timer
  const [cooldown, setCooldown] = useState(0);

  const otpInputsRef = useRef([]);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // Submit Email & Automatically Advance to OTP Code Enter Window
  const handleRequestReset = async (e) => {
    e?.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      await forgotPassword(email);
      // Automatically advance to 6-Digit OTP Code Enter Window
      setActiveTab('otp');
      setCooldown(60);
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 150);
    } catch (err) {
      if (!err.response) {
        setError('Could not connect to backend server. If using Render, please wait 15–30 seconds for the server to wake up and try again, or check your backend connection.');
      } else {
        setError(err.response?.data?.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      otpInputsRef.current[5]?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const fullOtp = otp.join('');
    if (!email) {
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
      await verifyOtp(email, fullOtp);
      // Navigate to reset password page with email and OTP in route state
      navigate('/reset-password/otp-mode', {
        state: { email, otp: fullOtp }
      });
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 pt-28 pb-12 animate-fadeIn">
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <span className="text-xl font-extrabold text-slate-800 tracking-tight">
          Volunteer<span className="text-blue-600">Hub</span>
        </span>
      </div>

      {/* Page Title */}
      <h1 className="text-3xl font-bold text-slate-900 mb-1 text-center">
        Account Recovery
      </h1>
      <p className="text-slate-500 text-sm mb-8 text-center max-w-sm">
        {activeTab === 'link' 
          ? 'Enter your registered email address to receive your 6-digit OTP code' 
          : `Enter the 6-digit OTP code sent to ${email}`}
      </p>

      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 w-full max-w-md p-8 relative overflow-hidden">
        {/* Top Accent Gradient */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-6 border border-slate-200/60">
          <button
            type="button"
            onClick={() => { setActiveTab('link'); setError(''); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
              activeTab === 'link'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            1. Email Address
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('otp'); setError(''); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
              activeTab === 'otp'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            2. Enter 6-Digit OTP
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-start gap-2.5 bg-red-50 text-red-600 text-xs px-4 py-3 rounded-xl mb-5 border border-red-100 font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: EMAIL REQUEST FORM */}
        {activeTab === 'link' && (
          <form onSubmit={handleRequestReset} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Registered Email Address
              </label>
              <div className="flex items-center border border-slate-300 rounded-xl px-3.5 py-2.5 gap-2.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all bg-slate-50/50">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 outline-none text-xs text-slate-800 placeholder-slate-400 bg-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white font-semibold text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] transition-all shadow-md shadow-blue-500/20 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
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

        {/* STEP 2: OTP CODE ENTER WINDOW (Displayed automatically after submitting email) */}
        {activeTab === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4 text-left">
            <div className="bg-blue-50/80 border border-blue-100 rounded-xl p-3 flex items-center justify-between text-xs text-blue-900">
              <div>
                <span className="text-slate-500 block text-[10px]">Verification code sent to:</span>
                <span className="font-bold text-blue-700">{email || 'your email'}</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('link')}
                className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
              >
                Change Email
              </button>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Enter 6-Digit Code
                </label>
                <span className="text-[10px] text-slate-400">Check your email inbox</span>
              </div>
              <div className="flex gap-2 justify-between" onPaste={handleOtpPaste}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputsRef.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-11 h-12 text-center text-lg font-bold text-slate-900 border border-slate-300 rounded-xl focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-slate-50/50"
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleRequestReset}
                disabled={loading || cooldown > 0}
                className="text-xs font-bold text-blue-600 hover:underline disabled:opacity-50 cursor-pointer"
              >
                {cooldown > 0 ? `Resend Code in ${cooldown}s` : 'Resend Code'}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white font-semibold text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] transition-all shadow-md shadow-blue-500/20 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
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

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-slate-200"></div>
          <span className="text-[11px] text-slate-400 font-medium">
            Remembered your credentials?
          </span>
          <div className="flex-1 h-px bg-slate-200"></div>
        </div>

        {/* Sign In Links */}
        <button
          onClick={() => navigate('/signin')}
          className="w-full py-2.5 rounded-xl text-slate-700 font-semibold text-xs border border-slate-300 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Back to Sign In</span>
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;
