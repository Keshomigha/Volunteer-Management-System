import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { loginUser } from '../../services/authService';
import { Mail, Lock, ShieldAlert, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { VolunteerHubLogoIcon } from '../../components/VolunteerHubLogo';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      if (data.user.role !== 'admin') {
        setError('Access denied. Please use the student or organizer login page.');
        return;
      }
      login(data.user, data.token);
      setFormData({ email: '', password: '' });
      navigate('/admin/dashboard');
    } catch (err) {
      if (!err.response) {
        setError('Could not connect to backend server. Please ensure the backend is running on port 5000.');
      } else {
        setError(err.response?.data?.message || 'Invalid admin credentials. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4 py-10">

      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-6">
        <VolunteerHubLogoIcon className="w-9 h-9" />
        <span className="text-xl font-extrabold text-slate-900 tracking-tight">Volunteer<span className="text-[#1D61F2]">Hub</span></span>
      </div>

      {/* Page Heading */}
      <h1 className="text-3xl font-extrabold text-gray-800 mb-1">VolunteerHub Admin Portal</h1>
      <p className="text-gray-500 text-base mb-8">Sign in with your admin credentials to access system utilities</p>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md px-8 py-8">

        {/* Card Header */}
        <div className="flex items-center gap-2 mb-6 border-b border-gray-50 pb-4">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Lock className="w-4.5 h-4.5 text-white" />
          </div>
          <h2 className="text-lg font-bold text-gray-800">Admin Login</h2>
        </div>

        {/* Admin Warning Notice */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-5 flex gap-2.5 items-start">
          <ShieldAlert className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-800 leading-relaxed font-medium">
            This portal is restricted to authorized administrators only. Unauthorized access is strictly prohibited.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4 border border-red-100 font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Admin Email</label>
            <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2.5 gap-2 bg-gray-50
                            focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <Mail className="w-4.5 h-4.5 text-gray-400 flex-shrink-0" />
              <input
                type="email"
                name="email"
                placeholder="admin@university.edu"
                value={formData.email}
                onChange={handleChange}
                required
                className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent w-full"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
            <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2.5 gap-2 bg-gray-50
                            focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <Lock className="w-4.5 h-4.5 text-gray-400 flex-shrink-0" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent w-full"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-blue-500 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-semibold text-base
                       bg-blue-600 hover:bg-blue-700
                       transition-all duration-200 mt-4 shadow-sm hover:shadow
                       disabled:opacity-60 disabled:cursor-not-allowed">
            {loading ? 'Signing In...' : 'Admin Login'}
          </button>

        </form>
      </div>

      {/* Back to Home Button */}
      <Link
        to="/"
        className="mt-6 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-bold transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

    </div>
  );
};

export default AdminLogin;
