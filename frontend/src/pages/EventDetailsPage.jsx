import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, ArrowLeft, Star, Tag, AlignLeft, ShieldCheck, Video, ExternalLink, Globe } from 'lucide-react';
import { getEventById } from '../services/eventService';
import { useAuth } from '../context/AuthContext';
import ApplyModal from "./Student/ApplyModel";


const EventDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchEventDetails = async () => {
      setLoading(true);
      try {
        const data = await getEventById(id);
        if (data) {
          setEvent({
            ...data,
            date: data.date || data.eventDate,
            totalSlots: data.totalSlots || data.maxVolunteers || data.volunteerRequired || 30,
            acceptedCount: data.acceptedCount !== undefined ? data.acceptedCount : 0,
            organizer: data.organizer || (data.User ? data.User.name : 'Student Club'),
            volunteerHours: data.volunteerHours || Math.round((data.reputationPoints || 80) / 10) || 4,
            description: data.description || 'No description available for this event.',
          });
        }
      } catch (err) {
        console.error("Error fetching event details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id]);

  const handleApplyClick = () => {
    if (isAuthenticated) {
      if (user?.role === 'student') {
        setShowApplyModal(true);
      } else {
        alert('Organizers and admins cannot apply for events. Please sign in with a volunteer student account.');
      }
    } else {
      navigate('/signin');
    }
  };

  const formatDate = iso => {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    if (!y || !m || !d) return iso;
    return new Date(y, m - 1, d).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isAuthorizedToView = () => {
    if (!event) return false;
    if (user?.role === 'admin' || user?.role === 'organizer') return true;
    const approved = (event.approvalStatus || 'Approved') === 'Approved';
    const notArchived = event.status !== 'Archived';
    return approved && notArchived;
  };

  if (!isAuthorizedToView()) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Event Not Found</h2>
        <p className="text-gray-500 mt-2">The event you are looking for does not exist or has been removed.</p>
        <Link to="/" className="inline-flex items-center gap-2 mt-6 text-blue-600 font-semibold hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>
    );
  }

  const spotsLeft = event.totalSlots - event.acceptedCount;
  const isFull = spotsLeft <= 0;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      {/* Back navigation */}
      <button 
        onClick={() => navigate(user?.role === 'student' ? '/student/events' : '/events')} 
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold mb-6 transition-all border-none cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 text-blue-600" /> Back to Browse Events
      </button>

      {/* Main Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Banner image */}
        <div className="h-64 sm:h-80 w-full relative bg-gray-100">
          <img 
            src={event.image || `https://picsum.photos/seed/${encodeURIComponent(event.title)}/800/400`} 
            alt={event.title} 
            className="w-full h-full object-cover"
            onError={e => {
              e.currentTarget.src = 'https://picsum.photos/seed/defaultbanner/800/400';
            }}
          />
          <div className="absolute top-4 left-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
            {event.category}
          </div>
        </div>

        {/* Content wrapper */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">{event.organizer}</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">{event.title}</h1>
            </div>
            
            {/* Reputation Points Badge */}
            <div className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 shadow-sm w-fit self-start sm:self-auto">
              <Star className="w-4 h-4 text-white fill-white" />
              <span className="text-sm font-bold text-white">{event.reputationPoints} Points</span>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-blue-500 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase">Date & Time</p>
                <p className="text-sm font-bold text-gray-700">{formatDate(event.date)}</p>
                <p className="text-xs text-gray-500">{event.time || '09:00 AM'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {event.eventType === 'Online' || event.meetingLink ? (
                <Video className="w-5 h-5 text-purple-500 flex-shrink-0" />
              ) : (
                <MapPin className="w-5 h-5 text-purple-500 flex-shrink-0" />
              )}
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase">Venue / Mode</p>
                <p className="text-sm font-bold text-gray-700">{event.location}</p>
                {(event.eventType === 'Online' || event.meetingLink) && (
                  <span className="inline-block mt-0.5 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-purple-100 text-purple-700">
                    Online Virtual Event
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase">Capacity</p>
                <p className="text-sm font-bold text-gray-700">
                  {isFull ? 'Event Full' : `${spotsLeft} spots left`}
                </p>
                <p className="text-xs text-gray-500">{event.acceptedCount} / {event.totalSlots} filled</p>
              </div>
            </div>
          </div>

          {/* Online Meeting Join Link Banner */}
          {(event.eventType === 'Online' || event.meetingLink) && (
            <div className="p-5 bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border border-purple-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-purple-500/20">
                  <Video className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-extrabold uppercase tracking-wider text-purple-700">Online Meeting Link</p>
                    <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-purple-200 text-purple-800 uppercase">Live Virtual</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">
                    This event is conducted online via Zoom, Google Meet, or Teams.
                  </p>
                </div>
              </div>

              {event.meetingLink ? (
                <a
                  href={event.meetingLink.startsWith('http') ? event.meetingLink : `https://${event.meetingLink}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm transition-all shadow-md shadow-purple-500/20 no-underline cursor-pointer"
                >
                  <Video className="w-4 h-4" /> Join Online Event <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <span className="text-xs font-bold text-purple-700 bg-purple-100 px-3 py-1.5 rounded-xl border border-purple-200">
                  Meeting link will be activated by organizer
                </span>
              )}
            </div>
          )}

          {/* Description */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <AlignLeft className="w-4 h-4 text-gray-400" /> Event Description
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">{event.description}</p>
          </div>

          {/* Earn list */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-gray-400" /> What You'll Earn
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                {event.volunteerHours} certified volunteer hours
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                Digital participation certificate
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                Leaderboard points & badges
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                Networking with active student clubs
              </li>
            </ul>
          </div>

          {/* Apply Banner */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-orange-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-800">Earn {event.volunteerHours} Volunteer Hours</p>
                <p className="text-xs text-gray-400">Marked upon host confirmation of attendance.</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button 
                onClick={() => navigate(user?.role === 'student' ? '/student/events' : '/events')} 
                className="px-5 py-3 rounded-2xl font-bold text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all border-none cursor-pointer"
              >
                Back to Browse Events
              </button>
              <button
                disabled={isFull}
                onClick={handleApplyClick}
                className={`flex-1 sm:flex-initial px-8 py-3 rounded-2xl font-bold text-sm transition-all shadow-sm cursor-pointer
                  ${isFull
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md'
                  }`}
              >
                {isFull ? 'Registration Full' : 'Register & Apply Now'}
              </button>
            </div>
          </div>

        </div>
      </div>
      {showApplyModal && (
        <ApplyModal 
          event={event} 
          onClose={() => setShowApplyModal(false)} 
        />
      )}
    </div>
  );
};

export default EventDetailsPage;
