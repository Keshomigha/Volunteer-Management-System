import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Calendar, MapPin, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { getEvents } from "../services/eventService";
import { useAuth } from "../context/AuthContext";
import ApplyModal from "./Student/ApplyModel";
import "./EventsPage.css";

const EventsPage = ({ embedded = false }) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedClub, setSelectedClub] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [applyingTo, setApplyingTo] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const data = await getEvents();
        const approvedDbEvents = data ? data.filter(ev => (ev.approvalStatus || 'Approved') === 'Approved') : [];
        const normalized = approvedDbEvents.map(ev => ({
          ...ev,
          date: ev.date || ev.eventDate,
          totalSlots: ev.totalSlots || ev.maxVolunteers || ev.volunteerRequired || 30,
          acceptedCount: ev.acceptedCount !== undefined ? ev.acceptedCount : 0,
          organizer: ev.organizer || (ev.User ? ev.User.name : 'Student Club')
        }));
        setEvents(normalized);
      } catch (err) {
        console.error("Error fetching events from API:", err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Helper to determine status text (Open / Full / Closed)
  const getEventStatusText = (ev) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const evDate = new Date(ev.date || ev.eventDate);
    evDate.setHours(0, 0, 0, 0);

    if (evDate < today) {
      return "Closed";
    }
    const slotsLeft = (ev.totalSlots || ev.volunteerRequired || 0) - (ev.acceptedCount || 0);
    if (slotsLeft <= 0) {
      return "Full";
    }
    return "Open";
  };

  // Filter events based on search term, category dropdown, club dropdown, and date
  const filteredEvents = events.filter(ev => {
    // Show only approved events, excluding archived ones
    if ((ev.approvalStatus || 'Approved') !== 'Approved') return false;
    if (ev.status === 'Archived') return false;

    // Search query check
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      const title = (ev.title || "").toLowerCase();
      const desc = (ev.description || "").toLowerCase();
      const org = (ev.organizer || "").toLowerCase();
      if (!title.includes(query) && !desc.includes(query) && !org.includes(query)) {
        return false;
      }
    }

    // Category filter
    if (selectedCategory) {
      if ((ev.category || "").toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
    }

    // Club filter
    if (selectedClub) {
      const org = (ev.organizer || "").toLowerCase();
      if (selectedClub === "Other") {
        if (org.includes("ieee") || org.includes("rotaract") || org.includes("leo") || org.includes("aiesec")) {
          return false;
        }
      } else {
        if (!org.includes(selectedClub.toLowerCase())) {
          return false;
        }
      }
    }

    // Date filter
    if (selectedDate) {
      const evDate = new Date(ev.date || ev.eventDate);
      const selDate = new Date(selectedDate);
      evDate.setHours(0, 0, 0, 0);
      selDate.setHours(0, 0, 0, 0);
      if (evDate < selDate) return false;
    }

    return true;
  });

  const isFilterActive = searchTerm || selectedCategory || selectedClub || selectedDate;

  // Sorting helper lists for shelves
  const getPopularList = () => {
    return [...filteredEvents]
      .sort((a, b) => {
        const aPop = a.acceptedCount !== undefined ? a.acceptedCount : 0;
        const bPop = b.acceptedCount !== undefined ? b.acceptedCount : 0;
        return bPop - aPop;
      })
      .slice(0, 8);
  };

  const getNewList = () => {
    return [...filteredEvents]
      .sort((a, b) => new Date(b.createdAt || b.date || b.eventDate) - new Date(a.createdAt || a.date || a.eventDate))
      .slice(0, 8);
  };

  const getTrendingList = () => {
    return [...filteredEvents]
      .sort((a, b) => {
        const aTrend = a.views || 0;
        const bTrend = b.views || 0;
        return bTrend - aTrend;
      })
      .slice(0, 8);
  };

  const getClubList = () => {
    return filteredEvents
      .filter(ev => {
        const org = (ev.organizer || "").toLowerCase();
        return org.includes("ieee") || org.includes("rotaract") || org.includes("leo") || org.includes("aiesec");
      })
      .slice(0, 8);
  };

  const popularList = getPopularList();
  const newList = getNewList();
  const trendingList = getTrendingList();
  const clubList = getClubList();

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedClub("");
    setSelectedDate("");
  };

  const handleApplyClick = (ev) => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (user?.role === 'student') {
      setApplyingTo(ev);
    } else {
      alert('Organizers and admins cannot apply for events. Please sign in with a volunteer student account.');
    }
  };

  return (
    <div className={`vh-events-page ${embedded ? 'vh-events-page--embedded' : ''}`}>
      
      {/* ── HEADER SECTION ─────────────────────────────── */}
      <header className="vh-events-header-section">
        <div className="vh-events-header-container">
          <h1 className="vh-events-title">All Volunteer Opportunities</h1>
          <p className="vh-events-subtitle">Discover and participate in meaningful volunteer events.</p>
        </div>
      </header>

      {/* ── FILTERS SECTION ────────────────────────────── */}
      <section className="vh-events-filters-section">
        <div className="vh-events-filters-container">
          {/* Search bar */}
          <div className="vh-filter-search-wrapper">
            <Search className="vh-filter-search-icon w-4 h-4" />
            <input
              type="text"
              placeholder="Search by event title, organizer club or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="vh-filter-search-input"
            />
          </div>

          {/* Category Dropdown */}
          <div className="vh-filter-select-wrapper">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="vh-filter-select"
            >
              <option value="">All Categories</option>
              <option value="Community Service">Community Service</option>
              <option value="Education">Education</option>
              <option value="Environment">Environment</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Technology">Technology</option>
              <option value="Fundraising">Fundraising</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Club Dropdown */}
          <div className="vh-filter-select-wrapper">
            <select
              value={selectedClub}
              onChange={(e) => setSelectedClub(e.target.value)}
              className="vh-filter-select"
            >
              <option value="">All Clubs</option>
              <option value="IEEE">IEEE</option>
              <option value="Rotaract">Rotaract</option>
              <option value="Leo Club">Leo Club</option>
              <option value="AIESEC">AIESEC</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Date Picker */}
          <div className="vh-filter-select-wrapper">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="vh-filter-date-input"
            />
          </div>

          {/* Clear Filters Button */}
          {isFilterActive && (
            <button onClick={handleClearFilters} className="vh-filter-clear-btn">
              Clear Filters
            </button>
          )}
        </div>
      </section>

      {/* ── EVENTS DISPLAY ─────────────────────────────── */}
      <section className="vh-events-display-section">
        {loading ? (
          <div className="flex items-center justify-center py-20 w-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : isFilterActive ? (
          /* SINGLE GRID LIST FOR SEARCH RESULTS */
          <div className="vh-events-display-container vh-results-section">
            <div className="vh-results-header">
              <h2 className="vh-results-title">Search Results ({filteredEvents.length} opportunities found)</h2>
            </div>
            
            {filteredEvents.length > 0 ? (
              <div className="vh-results-grid">
                {filteredEvents.map((ev) => {
                  const status = getEventStatusText(ev);
                  const isMyEvent = isAuthenticated && user?.role === 'organizer' && (
                    ev.UserId === user?.id || 
                    (ev.organizer && user?.name && ev.organizer.toLowerCase().includes(user.name.split(' ')[0].toLowerCase()))
                  );
                  return (
                    <div key={ev.id} className="vh-event-shelf-card">
                      <div className="vh-event-shelf-card-image-wrapper">
                        <img 
                          src={ev.image || `https://picsum.photos/seed/${encodeURIComponent(ev.title)}/300/200`} 
                          alt={ev.title} 
                          className="vh-event-shelf-card-image"
                          onError={e => {
                            e.currentTarget.src = 'https://picsum.photos/seed/placeholder/300/200';
                          }}
                        />
                        <span className={`vh-event-shelf-card-status status-${status.toLowerCase()}`}>
                          {status}
                        </span>
                        <span className="vh-event-shelf-card-category">{ev.category}</span>
                        {isMyEvent && (
                          <span className="vh-event-shelf-card-created-badge">
                            Created by You
                          </span>
                        )}
                      </div>
                      
                      <div className="vh-event-shelf-card-body">
                        <div className="vh-event-shelf-card-org">
                          <span className="vh-event-shelf-card-organizer">{ev.organizer || 'Student Club'}</span>
                        </div>
                        <h4 className="vh-event-shelf-card-title" title={ev.title}>{ev.title}</h4>
                        
                        <div className="vh-event-shelf-card-details">
                          <div className="vh-event-shelf-card-detail-item">
                            <Calendar className="w-3.5 h-3.5 text-blue-500" />
                            <span>{ev.date || ev.eventDate}</span>
                          </div>
                          <div className="vh-event-shelf-card-detail-item">
                            <MapPin className="w-3.5 h-3.5 text-purple-500" />
                            <span>{ev.location}</span>
                          </div>
                          <div className="vh-event-shelf-card-detail-item">
                            <Users className="w-3.5 h-3.5 text-emerald-500" />
                            <span>
                              Available slots: {Math.max(0, (ev.totalSlots || ev.volunteerRequired || 0) - (ev.acceptedCount || 0))} / {ev.totalSlots || ev.volunteerRequired}
                            </span>
                          </div>
                        </div>

                        <div className="vh-event-shelf-card-actions" style={{ flexWrap: 'wrap' }}>
                          {isMyEvent ? (
                            <>
                              <Link to={`/events/${ev.id}`} className="vh-event-shelf-card-btn" style={{ flex: '1 1 calc(50% - 0.25rem)' }}>
                                View Details
                              </Link>
                              <Link to="/organizer/events" className="vh-event-shelf-card-edit-btn">
                                Edit Event
                              </Link>
                              <Link to="/organizer/applications" className="vh-event-shelf-card-manage-btn">
                                Manage Applications
                              </Link>
                            </>
                          ) : (
                            <>
                              <Link to={user?.role === 'student' ? `/student/events/${ev.id}` : `/events/${ev.id}`} className="vh-event-shelf-card-btn">
                                View Details
                              </Link>
                              {(!isAuthenticated || user?.role === 'student') && (
                                <button 
                                  className="vh-event-shelf-card-apply-btn"
                                  onClick={() => handleApplyClick(ev)}
                                  disabled={status !== 'Open'}
                                >
                                  Apply Now
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="vh-results-empty-state">
                <h3 className="vh-results-empty-title">No volunteer opportunities match your search</h3>
                <p>Try clearing some filters or using different keywords to browse available events.</p>
              </div>
            )}
          </div>
        ) : (
          /* SHELF DISPLAYS FOR BROWSING DEFAULTS */
          <div className="vh-events-display-container">
            {[
              { title: "Most Popular Events", list: popularList, id: "popular-all-shelf" },
              { title: "New Events", list: newList, id: "new-all-shelf" },
              { title: "Trending Events", list: trendingList, id: "trending-all-shelf" },
              { title: "Club Events", list: clubList, id: "club-all-shelf" }
            ].map((shelf) => shelf.list.length > 0 && (
              <div key={shelf.id} className="vh-events-shelf-row">
                <div className="vh-events-shelf-row-header">
                  <h3 className="vh-events-shelf-row-title">{shelf.title}</h3>
                  <div className="vh-events-shelf-nav-arrows">
                    <button 
                      className="vh-events-shelf-arrow-btn"
                      onClick={() => {
                        const list = document.getElementById(shelf.id);
                        if (list) list.scrollBy({ left: -300, behavior: "smooth" });
                      }}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button 
                      className="vh-events-shelf-arrow-btn"
                      onClick={() => {
                        const list = document.getElementById(shelf.id);
                        if (list) list.scrollBy({ left: 300, behavior: "smooth" });
                      }}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div id={shelf.id} className="vh-events-shelf-cards-container">
                  {shelf.list.map((ev) => {
                    const status = getEventStatusText(ev);
                    const isMyEvent = isAuthenticated && user?.role === 'organizer' && (
                      ev.UserId === user?.id || 
                      (ev.organizer && user?.name && ev.organizer.toLowerCase().includes(user.name.split(' ')[0].toLowerCase()))
                    );
                    return (
                      <div key={ev.id} className="vh-event-shelf-card">
                        <div className="vh-event-shelf-card-image-wrapper">
                          <img 
                            src={ev.image || `https://picsum.photos/seed/${encodeURIComponent(ev.title)}/300/200`} 
                            alt={ev.title} 
                            className="vh-event-shelf-card-image"
                            onError={e => {
                              e.currentTarget.src = 'https://picsum.photos/seed/placeholder/300/200';
                            }}
                          />
                          <span className={`vh-event-shelf-card-status status-${status.toLowerCase()}`}>
                            {status}
                          </span>
                          <span className="vh-event-shelf-card-category">{ev.category}</span>
                          {isMyEvent && (
                            <span className="vh-event-shelf-card-created-badge">
                              Created by You
                            </span>
                          )}
                        </div>
                        
                        <div className="vh-event-shelf-card-body">
                          <div className="vh-event-shelf-card-org">
                            <span className="vh-event-shelf-card-organizer">{ev.organizer || 'Student Club'}</span>
                          </div>
                          <h4 className="vh-event-shelf-card-title" title={ev.title}>{ev.title}</h4>
                          
                          <div className="vh-event-shelf-card-details">
                            <div className="vh-event-shelf-card-detail-item">
                              <Calendar className="w-3.5 h-3.5 text-blue-500" />
                              <span>{ev.date || ev.eventDate}</span>
                            </div>
                            <div className="vh-event-shelf-card-detail-item">
                              <MapPin className="w-3.5 h-3.5 text-purple-500" />
                              <span>{ev.location}</span>
                            </div>
                            <div className="vh-event-shelf-card-detail-item">
                              <Users className="w-3.5 h-3.5 text-emerald-500" />
                              <span>
                                Available slots: {Math.max(0, (ev.totalSlots || ev.volunteerRequired || 0) - (ev.acceptedCount || 0))} / {ev.totalSlots || ev.volunteerRequired}
                              </span>
                            </div>
                          </div>

                          <div className="vh-event-shelf-card-actions" style={{ flexWrap: 'wrap' }}>
                            {isMyEvent ? (
                              <>
                                <Link to={`/events/${ev.id}`} className="vh-event-shelf-card-btn" style={{ flex: '1 1 calc(50% - 0.25rem)' }}>
                                  View Details
                                </Link>
                                <Link to="/organizer/events" className="vh-event-shelf-card-edit-btn">
                                  Edit Event
                                </Link>
                                <Link to="/organizer/applications" className="vh-event-shelf-card-manage-btn">
                                  Manage Applications
                                </Link>
                              </>
                            ) : (
                              <>
                                <Link to={user?.role === 'student' ? `/student/events/${ev.id}` : `/events/${ev.id}`} className="vh-event-shelf-card-btn">
                                  View Details
                                </Link>
                                {(!isAuthenticated || user?.role === 'student') && (
                                  <button 
                                    className="vh-event-shelf-card-apply-btn"
                                    onClick={() => handleApplyClick(ev)}
                                    disabled={status !== 'Open'}
                                  >
                                    Apply Now
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

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

export default EventsPage;
