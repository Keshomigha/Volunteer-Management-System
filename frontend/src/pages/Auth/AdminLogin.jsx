import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
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
      const data = await loginUser({ email: formData.email, password: formData.password });
      if (data.user.role !== 'admin') {
        setError('Access denied. Please use the correct login page.');
        return;
      }
      login(data.user, data.token);
      navigate('/admin/dashboard');
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
    <div className="min-h-screen bg-[#F0FDFB] flex flex-col items-center justify-center px-4 py-10">

      {/* Logo */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-9 h-9 bg-gradient-to-br from-[#14B8A6] to-[#6EE7D8] rounded-xl flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none"
            viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7
                 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0
                 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <span className="text-lg font-bold text-gray-800">VolunteerHub</span>
      </div>

      {/* Page Heading */}
      <h1 className="text-3xl font-bold text-gray-800 mb-1">Admin Portal</h1>
      <p className="text-gray-500 text-base mb-8">Sign in with your admin credentials</p>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-md w-full max-w-md px-8 py-8">

        {/* Card Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#14B8A6] to-[#6EE7D8] rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955
                     0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622
                     5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-800">Admin Login</h2>
          </div>
          <button
            onClick={() => navigate('/')}
            className="text-sm text-teal-500 hover:text-teal-600 font-medium transition-colors">
            Change Role
          </button>
        </div>

        {/* Admin Notice */}
        <div className="bg-teal-50 border border-teal-200 rounded-lg px-4 py-3 mb-5 flex gap-2 items-start">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-teal-700 leading-relaxed">
            This portal is restricted to authorized administrators only. Unauthorized access is strictly prohibited.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-500 text-sm px-4 py-3 rounded-lg mb-4 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email</label>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 gap-2
                            focus-within:border-teal-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 flex-shrink-0"
                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2
                     0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 gap-2
                            focus-within:border-teal-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 flex-shrink-0"
                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0
                     00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent w-full"
              />
            </div>
            <div className="text-right mt-1">
              <span className="text-xs text-teal-500 cursor-pointer hover:underline">Forgot password?</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-semibold text-base
                       bg-gradient-to-r from-[#14B8A6] to-[#6EE7D8]
                       hover:from-teal-600 hover:to-teal-400
                       transition-all duration-200 mt-2
                       disabled:opacity-60 disabled:cursor-not-allowed">
            {loading ? 'Signing In...' : 'Sign In as Admin'}
          </button>

        </form>
      </div>

      {/* Back to Role Select */}
      <p className="mt-6 text-sm text-gray-500">
        Not an admin?{' '}
        <span
          onClick={() => navigate('/')}
          className="text-teal-500 font-medium cursor-pointer hover:underline">
          Choose a different role
        </span>
      </p>

    </div>
  );
};

export default AdminLogin;
