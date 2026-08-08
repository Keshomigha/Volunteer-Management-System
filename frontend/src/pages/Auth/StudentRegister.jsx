import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerStudent, googleLogin } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

const StudentRegister = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    studentId: '',
    faculty: '',
    skills: '',
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
        setError(err.response?.data?.message || 'Google registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Client-side validation for Student ID
    if (formData.studentId && !/^STU\d{6}$/.test(formData.studentId)) {
      setError('Student ID must be in the format STU followed by exactly 6 digits (e.g., STU123456).');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name: formData.fullName,
        studentId: formData.studentId,
        faculty: formData.faculty,
        skills: formData.skills,
        email: formData.email,
        password: formData.password,
      };
      await registerStudent(payload);
      navigate('/login/student');
    } catch (err) {
      if (!err.response) {
        setError('Could not connect to backend server. Please ensure the backend is running on port 5000.');
      } else {
        const data = err.response?.data;
        if (data && data.errors && Array.isArray(data.errors)) {
          const fieldMsgs = data.errors.map(e => `${e.field}: ${e.message}`).join(', ');
          setError(fieldMsgs);
        } else {
          setError(data?.message || 'Registration failed. Please try again.');
        }
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
        Create Your Account
      </h1>
      <p className="text-gray-500 text-base mb-8">
        Choose your role to get started
      </p>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-md w-full 
                      max-w-md px-8 py-8">

        {/* Card Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-800">
            Student Registration
          </h2>
          <button
            onClick={() => navigate('/register')}
            className="text-sm text-blue-500 hover:text-blue-600 
                       font-medium transition-colors">
            Change Role
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-500 text-sm px-4 
                          py-3 rounded-lg mb-4 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Full Name + Student ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium 
                                text-gray-700 mb-1">
                Full Name
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 
                       0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <input
                  type="text"
                  name="fullName"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="flex-1 outline-none text-sm 
                             text-gray-700 placeholder-gray-400 
                             bg-transparent w-full"
                />
              </div>
            </div>

            {/* Student ID */}
            <div>
              <label className="block text-sm font-medium 
                                text-gray-700 mb-1">
                Student ID
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
                    d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 
                       2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 
                       114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 
                       2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 
                       2M9 14a3.001 3.001 0 00-2.83 2" />
                </svg>
                <input
                  type="text"
                  name="studentId"
                  placeholder="STU123456"
                  value={formData.studentId}
                  onChange={handleChange}
                  required
                  className="flex-1 outline-none text-sm 
                             text-gray-700 placeholder-gray-400 
                             bg-transparent w-full"
                />
              </div>
            </div>
          </div>

          {/* Faculty */}
          <div>
            <label className="block text-sm font-medium 
                              text-gray-700 mb-1">
              Faculty
            </label>
            <input
              type="text"
              name="faculty"
              placeholder="e.g. Faculty of Engineering"
              value={formData.faculty}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg 
                         px-3 py-2 text-sm text-gray-700 
                         placeholder-gray-400 outline-none 
                         focus:border-blue-400 transition-colors"
            />
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium 
                              text-gray-700 mb-1">
              Skills{' '}
              <span className="text-gray-400 font-normal">
                (comma separated)
              </span>
            </label>
            <input
              type="text"
              name="skills"
              placeholder="Leadership, Communication, Event Planning"
              value={formData.skills}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg 
                         px-3 py-2 text-sm text-gray-700 
                         placeholder-gray-400 outline-none 
                         focus:border-blue-400 transition-colors"
            />
          </div>

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
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 
                     2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 
                     2 0 002 2z" />
              </svg>
              <input
                type="email"
                name="email"
                placeholder="you@university.edu"
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
                placeholder="Create a strong password"
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
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-semibold
                       text-base bg-blue-600 hover:bg-blue-700 transition-all duration-200
                       mt-2 disabled:opacity-60
                       disabled:cursor-not-allowed">
            {loading ? 'Creating Account...' : 'Create Student Account'}
          </button>

        </form>

        {/* Google OAuth Register Button */}
        <div className="mt-4 flex justify-center">
          <div id="google-signin-btn" className="w-full flex justify-center"></div>
        </div>
      </div>

      {/* Sign In Link */}
      <p className="mt-6 text-sm text-gray-500">
        Already have an account?{' '}
        <span
          onClick={() => navigate('/login/student')}
          className="text-blue-500 font-medium cursor-pointer 
                     hover:underline">
          Sign In
        </span>
      </p>

    </div>
  );
};

export default StudentRegister;