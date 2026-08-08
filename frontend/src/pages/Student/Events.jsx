import { Search, Calendar, MapPin, Users, ChevronDown, ImageOff, User, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import ApplyModal from './ApplyModel';
import { getEvents } from '../../services/eventService';
import { API_BASE_URL } from '../../services/apiConfig';

const BACKEND_URL = API_BASE_URL;

const resolveImage = (image) => {
  if (!image) return null;
  if (image.startsWith('http')) return image;
  return `${BACKEND_URL}${image}`;
};

const mapEvent = (ev) => ({
  id: ev.id,
  title: ev.title,
  organizer: ev.User?.name || 'Organizer',
  date: ev.eventDate,
  time: ev.time || '10:00 AM',
  location: ev.location,
  totalSlots: ev.volunteerRequired,
  acceptedCount: ev.acceptedCount ?? 0,
  category: ev.category || 'Community',
  skills: ev.skills ? ev.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
  reputationPoints: ev.reputationPoints ?? 10,
  volunteerHours: ev.volunteerHours ?? 4,
  description: ev.description,
  image: resolveImage(ev.image),
});

const CATEGORIES = ['All Categories', 'Environment', 'Health', 'Education', 'Community'];
const SKILLS     = ['All Skills', 'Teamwork', 'Physical', 'Organisation', 'Communication', 'Teaching', 'Patience', 'First Aid', 'Empathy', 'Driving License'];

const formatDate = iso => {
  const [y, m, d] = iso.split('-');
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
};

// Returns label, text color, bar color, and bg based on fill %
const spotsTheme = (spotsLeft, total) => {
  if (spotsLeft === 0)          return { label: 'Full',             text: 'text-red-600',    bar: 'bg-red-500',    bg: 'bg-red-50 border-red-200'    };
  const pct = spotsLeft / total;
  if (pct <= 0.15)              return { label: `${spotsLeft} left`, text: 'text-red-500',   bar: 'bg-red-400',    bg: 'bg-red-50 border-red-200'    };
  if (pct <= 0.4)               return { label: `${spotsLeft} left`, text: 'text-orange-500',bar: 'bg-orange-400', bg: 'bg-orange-50 border-orange-200'};
  return                               { label: `${spotsLeft} left`, text: 'text-green-600', bar: 'bg-green-500',  bg: 'bg-green-50 border-green-200' };
};

const selectClass =
  'appearance-none bg-white border border-gray-200 rounded-xl px-3 py-2.5 pr-8 text-sm ' +
  'text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300 cursor-pointer';

const Events = () => {
  const [search,     setSearch]     = useState('');
  const [category,   setCategory]   = useState('All Categories');
  const [skill,      setSkill]      = useState('All Skills');
  const [applyingTo, setApplyingTo] = useState(null);
  const [events,     setEvents]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [loadError,  setLoadError]  = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getEvents();
        if (!cancelled) setEvents(data.map(mapEvent));
      } catch (err) {
        if (!cancelled) setLoadError('Could not load events from the server.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = events.map(ev => ({
    ...ev,
    spotsLeft: ev.totalSlots - ev.acceptedCount,
  })).filter(ev => {
    const matchSearch   = ev.title.toLowerCase().includes(search.toLowerCase()) ||
                          ev.organizer.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === 'All Categories' || ev.category === category;
    const matchSkill    = skill    === 'All Skills'     || ev.skills.includes(skill);
    return matchSearch && matchCategory && matchSkill;
  });

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Browse Events</h1>
        <p className="mt-1 text-gray-500">Discover volunteering opportunities near you</p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1 flex items-center gap-2.5 bg-white border border-gray-200
          rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-purple-300 transition">
          <Search className="flex-shrink-0 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 text-sm text-gray-700 placeholder-gray-400 bg-transparent outline-none"
          />
        </div>

        <div className="relative flex-shrink-0">
          <select value={category} onChange={e => setCategory(e.target.value)} className={selectClass}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        <div className="relative flex-shrink-0">
          <select value={skill} onChange={e => setSkill(e.target.value)} className={selectClass}>
            {SKILLS.map(s => <option key={s}>{s}</option>)}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Loading / error states */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="font-medium text-gray-400">Loading events…</p>
        </div>
      )}

      {!loading && loadError && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="font-medium text-red-400">{loadError}</p>
        </div>
      )}

      {/* Event Cards */}
      {!loading && !loadError && (
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map(ev => {
          const theme   = spotsTheme(ev.spotsLeft, ev.totalSlots);
          const fillPct = Math.min((ev.acceptedCount / ev.totalSlots) * 100, 100);
          const isFull  = ev.spotsLeft === 0;

          return (
            <div
              key={ev.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden
                hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
            >
              {/* Event image */}
              {ev.image ? (
                <img
                  src={ev.image}
                  alt={ev.title}
                  className="object-cover w-full h-44"
                  onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
                />
              ) : null}
              {/* No-image fallback */}
              <div
                className="flex-col items-center justify-center w-full gap-2 bg-gray-100 h-44"
                style={{ display: ev.image ? 'none' : 'flex' }}
              >
                <div className="flex items-center justify-center w-16 h-16 bg-gray-200 rounded-full">
                  <ImageOff className="text-gray-400 w-7 h-7" />
                </div>
                <p className="text-xs font-medium text-gray-400">No image uploaded</p>
              </div>

              {/* Card body */}
              <div className="flex flex-col flex-1 gap-3 p-4">

                {/* Reputation Points badge */}
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full
                  bg-gradient-to-r from-amber-400 to-yellow-500 shadow-sm w-fit">
                  <Star className="w-3.5 h-3.5 text-white fill-white" />
                  <span className="text-xs font-bold text-white">{ev.reputationPoints} pts</span>
                </div>

                {/* Title + Organizer */}
                <div>
                  <h3 className="text-base font-bold leading-snug text-gray-800">{ev.title}</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <User className="flex-shrink-0 w-3 h-3 text-purple-400" />
                    <span className="text-xs font-medium text-purple-600">{ev.organizer}</span>
                  </div>
                </div>

                {/* Info rows */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span>{formatDate(ev.date)},&nbsp;{ev.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span>{ev.location}</span>
                  </div>
                </div>

                {/* Availability section */}
                <div className={`rounded-xl border px-3 py-2 ${theme.bg}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <span className="text-xs text-gray-500">
                        {ev.acceptedCount} / {ev.totalSlots} filled
                      </span>
                    </div>
                    <span className={`text-xs font-bold ${theme.text}`}>
                      {isFull ? 'Event Full' : `${ev.spotsLeft} spot${ev.spotsLeft !== 1 ? 's' : ''} left`}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${theme.bar}`}
                      style={{ width: `${fillPct}%` }}
                    />
                  </div>
                </div>

                {/* Skill tags */}
                <div className="flex flex-wrap gap-1.5">
                  {ev.skills.map(s => (
                    <span key={s} className="px-2.5 py-0.5 rounded-full text-xs font-medium
                      bg-purple-50 text-purple-700 border border-purple-100">
                      {s}
                    </span>
                  ))}
                </div>

                {/* Apply button */}
                <div className="pt-1 mt-auto">
                  <button
                    disabled={isFull}
                    onClick={() => !isFull && setApplyingTo(ev)}
                    className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm
                      ${isFull
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md'
                      }`}
                  >
                    {isFull ? 'No Spots Available' : 'Apply Now'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center col-span-3 py-20 text-center">
            <Search className="w-12 h-12 mb-3 text-gray-200" />
            <p className="font-medium text-gray-400">No events found</p>
            <p className="mt-1 text-sm text-gray-300">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
      )}

      {/* Apply Modal */}
      {applyingTo && (
        <ApplyModal
          event={applyingTo}
          onClose={() => setApplyingTo(null)}
        />
      )}
    </div>
  );
};

export default Events;
