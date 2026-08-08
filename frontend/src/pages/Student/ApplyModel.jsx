import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { applyToEvent } from '../../services/applicationService';
import { X, Calendar, MapPin, Users, Clock, CheckCircle, Award, Heart, Sparkles, Send } from 'lucide-react';
const inputCls =
  'w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 ' +
  'focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 ' +
  'placeholder-gray-400 transition bg-white';

const labelCls = 'block text-sm font-semibold text-gray-700 mb-1.5';
const EARN_ITEMS = [
  ev => `${ev.volunteerHours} certified volunteer hours`,
  () => 'Digital participation certificate',
  () => 'Leaderboard points & badges',
  () => 'Networking with the organizer',
];

const formatDate = iso => {
  const [y, m, d] = iso.split('-');
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
};
const ApplyModal = ({ event, onClose }) => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    skills: user?.studentProfile?.skills ? user.studentProfile.skills.join(', ') : '',
    motivation: '',
    experience: '',
    agreed: false,
  });
  const [submitted, setSubmitted] = useState(false);
  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        name: prev.name || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
        skills: prev.skills || (user.studentProfile?.skills ? user.studentProfile.skills.join(', ') : ''),
      }));
    }
  }, [user]);
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const canSubmit = form.name && form.email && form.phone && form.motivation && form.agreed;
  const handleSubmit = async e => {
    e.preventDefault();
    if (!canSubmit) return;
    
    try {
      const submissionData = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        skills: form.skills,
        motivation: form.motivation,
        experience: form.experience
      };
      
      await applyToEvent(event.id, submissionData);
      
      setSubmitted(true);
      setTimeout(onClose, 1800);
    } catch (err) {
      console.error("Error submitting application:", err);
      alert(err.response?.data?.message || err.message || "Failed to submit application");
    }
  };
  return (
    <div
      className="fixed inset-0 z-[2000] flex items-start justify-center p-4 py-8 overflow-y-auto bg-black/40 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-2xl overflow-hidden bg-white shadow-2xl rounded-2xl p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 shadow-sm rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600">
              <Send className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Apply for this opportunity</h2>
              <p className="text-sm text-gray-500 mt-0.5">Fill in your details to submit your application</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-lg font-bold text-gray-800">Application Submitted!</p>
            <p className="text-sm text-gray-500">We'll notify you once the organizer reviews it.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name + Email */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Full Name <span className="text-red-400">*</span></label>
                <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="John Doe" className={inputCls} required />
              </div>
              <div>
                <label className={labelCls}>Email <span className="text-red-400">*</span></label>
                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@university.edu" className={inputCls} required />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className={labelCls}>Phone Number <span className="text-red-400">*</span></label>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+1 (555) 000-0000" className={inputCls} required />
            </div>

            {/* Relevant Skills */}
            <div>
              <label className={labelCls}>Relevant Skills</label>
              <input type="text" name="skills" value={form.skills} onChange={handleChange} placeholder="e.g., First Aid, Communication, Teaching" className={inputCls} />
            </div>

            {/* Motivation */}
            <div>
              <label className={labelCls}>Why do you want to join? <span className="text-red-400">*</span></label>
              <textarea name="motivation" value={form.motivation} onChange={handleChange} rows={4} placeholder="Share your motivation for joining this event..." className={`${inputCls} resize-none`} required />
            </div>

            {/* Experience */}
            <div>
              <label className={labelCls}>Previous Volunteer Experience</label>
              <textarea name="experience" value={form.experience} onChange={handleChange} rows={3} placeholder="Tell us about any past volunteering experience (optional)..." className={`${inputCls} resize-none`} />
            </div>

            {/* Agreement checkbox */}
            <label className="flex items-start gap-3 p-4 transition-colors border border-gray-100 cursor-pointer rounded-xl hover:bg-purple-50/40">
              <div className="relative flex-shrink-0 mt-0.5">
                <input type="checkbox" name="agreed" checked={form.agreed} onChange={handleChange} className="sr-only" />
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${form.agreed ? 'bg-blue-600 border-transparent' : 'border-gray-300 bg-white'}`}>
                  {form.agreed && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-sm text-gray-600">I agree to the volunteer code of conduct and confirm that the information above is accurate.</span>
            </label>

            {/* Buttons */}
            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={!canSubmit}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${canSubmit ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
              >
                <Sparkles className="w-4 h-4" /> Submit Application
              </button>
              <button type="button" onClick={onClose} className="px-6 py-3 text-sm font-semibold text-gray-600 transition-colors border border-gray-200 rounded-xl hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ApplyModal;