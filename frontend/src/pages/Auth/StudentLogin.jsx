import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, googleLogin } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { User, Eye, EyeOff } from 'lucide-react';

const StudentLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const handleGoogleCredentialResponse = async (response) => {
    setLoading(true);
    setError('');
    try {
      const res = await googleLogin(response.credential);
      login(res.user, res.token);
      navigate('/');
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

  useEffect(() => {
    const rawClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || import.meta.env.GOOGLE_CLIENT_ID || "527555008291-hs544883ee4apu936ltu543sorp9g2b2.apps.googleusercontent.com";
    const clientId = rawClientId.trim();
    
    const initGoogle = () => {
      const btn = document.getElementById("google-signin-btn");
      if (btn && window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleCredentialResponse,
            cancel_on_tap_outside: false,
          });
          btn.innerHTML = "";
          window.google.accounts.id.renderButton(
            btn,
            { type: "standard", theme: "outline", size: "large", width: 320, text: "signin_with", shape: "rectangular" }
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
      }, 150);
      return () => clearInterval(interval);
    }
  }, []);

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
      if (data.user.role !== 'student') {
        setError('Access denied. Please use the organizer login page.');
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col items-center justify-center p-4 pt-24 pb-10">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Student Sign In</h2>
          <p className="text-sm text-gray-500 mt-1">
            Access your volunteer opportunities and track your impact
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="flex items-center border border-gray-300 rounded-xl px-3 py-2.5 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
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
                placeholder="you@university.edu"
                value={formData.email}
                onChange={handleChange}
                required
                className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent w-full"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="flex items-center border border-gray-300 rounded-xl px-3 py-2.5 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent w-full"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none">
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
            className="w-full py-3 rounded-xl text-white font-semibold text-base bg-blue-600 hover:bg-blue-700 transition-all duration-200 mt-2 disabled:opacity-60 disabled:cursor-not-allowed">
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

        </form>

        {/* Google OAuth Login Button */}
        <div className="mt-4 flex justify-center w-full min-h-[44px]">
          <div id="google-signin-btn" className="w-full flex justify-center"></div>
        </div>

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
          onClick={() => navigate('/register/student')}
          className="w-full py-3 rounded-xl text-blue-600 border border-blue-200 hover:bg-blue-50 font-semibold text-sm transition-all duration-200">
          Create Student Account
        </button>

      </div>

      {/* Link to Organizer Login */}
      <p className="mt-6 text-sm text-gray-300">
        Are you an organization?{' '}
        <span
          onClick={() => navigate('/login/organizer')}
          className="text-blue-400 font-medium cursor-pointer hover:underline">
          Log in as an organizer
        </span>
      </p>

      {/* Link to Admin Portal */}
      <p className="mt-3 text-sm text-gray-400">
        <span
          onClick={() => navigate('/admin/login')}
          className="text-blue-400 font-medium cursor-pointer hover:underline">
          Admin Portal &rarr;
        </span>
      </p>

    </div>
  );
};

export default StudentLogin;