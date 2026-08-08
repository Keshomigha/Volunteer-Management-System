import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Tag, AlignLeft, Clock, ChevronLeft, Video, Globe, Building, Link2, Image as ImageIcon } from 'lucide-react';
import { getOrganizerSettings } from '../../services/userService';
import { createEvent } from '../../services/eventService';

const CATEGORIES = ['Community Service', 'Environment', 'Education', 'Health', 'Technology', 'Sports', 'Arts & Culture'];

const getFallbackImage = (category) => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('environment')) {
    return 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=800';
  }
  if (cat.includes('technology') || cat.includes('education')) {
    return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800';
  }
  if (cat.includes('health') || cat.includes('healthcare')) {
    return 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800';
  }
  return 'https://images.unsplash.com/photo-1559027615-cd44874e90e5?w=800';
};

const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-base font-medium text-gray-700 mb-1.5">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    {children}
  </div>
);

const inputClass =
  'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-base text-gray-700 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-gray-50';

const iconInput = (icon, input) => (
  <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2.5 gap-2 bg-gray-50 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
    <span className="text-gray-400 flex-shrink-0">{icon}</span>
    {input}
  </div>
);

const CreateEvent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    title: '',
    category: '',
    description: '',
    date: '',
    time: '',
    eventType: 'In-Person', // 'In-Person' | 'Online'
    location: '',
    meetingLink: '',
    maxVolunteers: '',
    skills: '',
    image: '',
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Banner image size should be under 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const fetchDefaultPreferences = async () => {
      try {
        const token = localStorage.getItem('token');
        let settingsData;
        if (token && token.startsWith('dummy')) {
          const stored = localStorage.getItem('mock_org_settings');
          if (stored) {
            settingsData = JSON.parse(stored);
          } else {
            settingsData = {
              eventPreferences: { defaultCategory: 'Technology', defaultVolunteerLimit: 40, defaultEventLocation: 'Main Auditorium' }
            };
          }
        } else {
          settingsData = await getOrganizerSettings();
        }

        if (settingsData && settingsData.eventPreferences) {
          const { defaultCategory, defaultVolunteerLimit, defaultEventLocation } = settingsData.eventPreferences;
          setForm(prev => ({
            ...prev,
            category: prev.category || defaultCategory || '',
            maxVolunteers: prev.maxVolunteers || (defaultVolunteerLimit ? String(defaultVolunteerLimit) : ''),
            location: prev.location || defaultEventLocation || ''
          }));
        }
      } catch (err) {
        console.error('Failed to load organizer default preferences for event creation:', err);
      }
    };
    fetchDefaultPreferences();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleEventTypeChange = (type) => {
    setForm(prev => ({
      ...prev,
      eventType: type,
      location: type === 'Online' && !prev.location ? 'Online via Zoom / Teams' : prev.location
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const eventData = {
        title: form.title,
        category: form.category,
        description: form.description,
        eventDate: form.date,
        time: form.time || '10:00 AM',
        eventType: form.eventType,
        location: form.eventType === 'Online' ? (form.location || 'Online Event') : form.location,
        meetingLink: form.eventType === 'Online' ? form.meetingLink : '',
        volunteerRequired: parseInt(form.maxVolunteers) || 0,
        skills: form.skills || '',
        image: form.image || getFallbackImage(form.category),
        reputationPoints: 100,
        volunteerHours: 4
      };

      await createEvent(eventData);

      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        navigate('/organizer/events');
      }, 1500);
    } catch (err) {
      console.error("Error creating event:", err);
      alert(err.response?.data?.message || err.message || "Failed to create event");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/organizer/dashboard')}
          className="p-2 rounded-xl hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-colors border-none cursor-pointer bg-transparent"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Create New Event</h1>
          <p className="text-gray-500 text-base mt-0.5">Fill in the details to publish an in-person or online volunteer event</p>
        </div>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-5 text-sm font-medium">
          Event created successfully! Redirecting…
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Event Mode (In-Person vs Online) */}
          <Field label="Event Mode & Venue" required>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
              <button
                type="button"
                onClick={() => handleEventTypeChange('In-Person')}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border font-bold text-sm transition-all cursor-pointer ${
                  form.eventType === 'In-Person'
                    ? 'bg-blue-50 border-blue-600 text-blue-700 ring-2 ring-blue-100 shadow-sm'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Building className="w-4 h-4" /> In-Person Event
              </button>

              <button
                type="button"
                onClick={() => handleEventTypeChange('Online')}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border font-bold text-sm transition-all cursor-pointer ${
                  form.eventType === 'Online'
                    ? 'bg-purple-50 border-purple-600 text-purple-700 ring-2 ring-purple-100 shadow-sm'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Video className="w-4 h-4" /> Online / Virtual Event
              </button>
            </div>
          </Field>

          {/* Title + Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Event Title" required>
              {iconInput(
                <Tag className="w-4 h-4" />,
                <input
                  name="title" value={form.title} onChange={handleChange} required
                  placeholder={form.eventType === 'Online' ? "Online Technical Workshop" : "Beach Cleanup Drive"}
                  className="flex-1 outline-none text-base text-gray-700 placeholder-gray-400 bg-transparent w-full"
                />
              )}
            </Field>

            <Field label="Category" required>
              <select
                name="category" value={form.category} onChange={handleChange} required
                className={inputClass}
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>

          {/* Description */}
          <Field label="Description" required>
            <div className="flex items-start border border-gray-200 rounded-xl px-3 py-2.5 gap-2 bg-gray-50 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <AlignLeft className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <textarea
                name="description" value={form.description} onChange={handleChange} required
                rows={3} placeholder="Describe what volunteers will be doing…"
                className="flex-1 outline-none text-base text-gray-700 placeholder-gray-400 bg-transparent w-full resize-none"
              />
            </div>
          </Field>

          {/* Date + Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Date" required>
              {iconInput(
                <Calendar className="w-4 h-4" />,
                <input
                  type="date" name="date" value={form.date} onChange={handleChange} required
                  className="flex-1 outline-none text-base text-gray-700 bg-transparent w-full"
                />
              )}
            </Field>

            <Field label="Time" required>
              {iconInput(
                <Clock className="w-4 h-4" />,
                <input
                  type="time" name="time" value={form.time} onChange={handleChange} required
                  className="flex-1 outline-none text-base text-gray-700 bg-transparent w-full"
                />
              )}
            </Field>
          </div>

          {/* Location & Online Join Link */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label={form.eventType === 'Online' ? "Platform / Venue" : "Physical Location"} required>
              {iconInput(
                form.eventType === 'Online' ? <Globe className="w-4 h-4" /> : <MapPin className="w-4 h-4" />,
                <input
                  name="location" value={form.location} onChange={handleChange} required
                  placeholder={form.eventType === 'Online' ? "Zoom Video Call / Google Meet" : "Colombo, Sri Lanka"}
                  className="flex-1 outline-none text-base text-gray-700 placeholder-gray-400 bg-transparent w-full"
                />
              )}
            </Field>

            {form.eventType === 'Online' ? (
              <Field label="Meeting Join Link (Zoom / Meet / Teams)" required>
                {iconInput(
                  <Link2 className="w-4 h-4 text-purple-500" />,
                  <input
                    type="url"
                    name="meetingLink"
                    value={form.meetingLink}
                    onChange={handleChange}
                    required
                    placeholder="https://zoom.us/j/123456789 or https://meet.google.com/xyz"
                    className="flex-1 outline-none text-base text-gray-700 placeholder-gray-400 bg-transparent w-full"
                  />
                )}
              </Field>
            ) : (
              <Field label="Max Volunteers" required>
                {iconInput(
                  <Users className="w-4 h-4" />,
                  <input
                    type="number" name="maxVolunteers" value={form.maxVolunteers} onChange={handleChange} required min="1"
                    placeholder="30"
                    className="flex-1 outline-none text-base text-gray-700 placeholder-gray-400 bg-transparent w-full"
                  />
                )}
              </Field>
            )}
          </div>

          {/* If Online, display Max Volunteers on its own row */}
          {form.eventType === 'Online' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Max Volunteers" required>
                {iconInput(
                  <Users className="w-4 h-4" />,
                  <input
                    type="number" name="maxVolunteers" value={form.maxVolunteers} onChange={handleChange} required min="1"
                    placeholder="30"
                    className="flex-1 outline-none text-base text-gray-700 placeholder-gray-400 bg-transparent w-full"
                  />
                )}
              </Field>
            </div>
          )}

          {/* Skills */}
          <Field label="Required Skills">
            <input
              name="skills" value={form.skills} onChange={handleChange}
              placeholder="e.g. Leadership, Communication, Python"
              className={inputClass}
            />
            <p className="text-xs text-gray-400 mt-1">Separate multiple skills with commas</p>
          </Field>

          {/* Event Banner Image Upload */}
          <Field label="Event Banner Image">
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="w-full sm:w-1/2 h-36 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center p-3 text-center bg-gray-50 hover:border-blue-500 transition-colors relative overflow-hidden group">
                  {form.image ? (
                    <>
                      <img src={form.image} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold pointer-events-none">
                        Change Image
                      </div>
                    </>
                  ) : (
                    <div className="text-gray-400">
                      <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-70" />
                      <span className="text-xs font-medium">Click or drag to upload custom banner image</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>

                <div className="w-full sm:w-1/2 text-left space-y-2">
                  <p className="text-sm font-semibold text-gray-700">Custom Image Upload</p>
                  <p className="text-xs text-gray-400">Upload a high-quality JPG, PNG, or WEBP image banner for your event.</p>
                  {form.image && (
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, image: '' }))}
                      className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors border-none bg-transparent cursor-pointer"
                    >
                      Clear Uploaded Image
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Field>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl text-white font-semibold text-sm
                          bg-blue-600 hover:bg-blue-700 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed border-none cursor-pointer"
            >
              {loading ? 'Publishing…' : 'Publish Event'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/organizer/events')}
              className="px-6 py-3 rounded-xl text-blue-600 font-semibold text-sm
                          border border-blue-200 hover:bg-blue-50 transition-all duration-200 cursor-pointer"
            >
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateEvent;
