import { useState, useEffect } from "react";
import { useNavigate, Link, useOutletContext } from "react-router-dom";
import { ArrowRight, Star, Calendar, MapPin, Users, ChevronRight, ChevronLeft, Leaf, HeartPulse, Code, BookOpen, Heart, Award, Paintbrush, Trophy } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getEvents } from "../services/eventService";
import "./HomePage.css";

/**
 * AnimatedCounter Component
 * 
 * A utility component that creates a smooth count-up animation from 0 to a specified target number.
 * Useful for statistics banners and data visualization.
 * 
 * @param {Object} props - Component props
 * @param {number} props.end - The final number the counter should reach
 * @param {string} [props.suffix=""] - Optional string to append to the end of the number (e.g., "+", "%")
 * @returns {JSX.Element} The animated number display
 */
const AnimatedCounter = ({ end, suffix = "" }) => {
  // State to track the current animated value
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 2000; // Total animation duration in milliseconds

    // Calculate how much to increment per frame (assuming ~60fps / 16ms per frame)
    const increment = end / (duration / 16);

    // Set up the animation interval
    const timer = setInterval(() => {
      start += increment;

      // Stop the animation once we reach or exceed the target number
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      } else {
        // Round down to ensure clean whole numbers during the animation
        setCount(Math.floor(start));
      }
    }, 16);

    // Cleanup function to clear the interval if the component unmounts
    return () => clearInterval(timer);
  }, [end]);

  return (
    <span className="vh-stat-number">
      {count}{suffix}
    </span>
  );
};

const PLACEHOLDER_EVENTS = [
  // IEEE Tab
  {
    id: 'ieee1',
    title: 'IEEE WIE Day',
    organizer: 'IEEE WIE Student Branch',
    category: 'Technology',
    date: '2026-06-18',
    location: 'University Auditorium',
    maxVolunteers: 50,
    acceptedCount: 45,
    totalSlots: 50,
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'
  },
  {
    id: 'ieee2',
    title: 'IEEE Path Forward 3.0',
    organizer: 'IEEE Student Branch',
    category: 'Education',
    date: '2026-06-25',
    location: 'Main IT Lab',
    maxVolunteers: 40,
    acceptedCount: 38,
    totalSlots: 40,
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800'
  },
  {
    id: 'ieee3',
    title: 'IEEE Tech for Humanity',
    organizer: 'IEEE Student Branch',
    category: 'Technology',
    date: '2026-07-10',
    location: 'Block E Seminar Room',
    maxVolunteers: 30,
    acceptedCount: 12,
    totalSlots: 30,
    image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800'
  },
  // Rotaract Tab
  {
    id: 'rot1',
    title: 'PearlHack 4.0',
    organizer: 'Rotaract Club',
    category: 'Technology',
    date: '2026-07-05',
    location: 'Gymnasium',
    maxVolunteers: 100,
    acceptedCount: 95,
    totalSlots: 100,
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800'
  },
  {
    id: 'rot2',
    title: 'Blood Donation Campaign',
    organizer: 'Rotaract Club',
    category: 'Health',
    date: '2026-06-19',
    location: 'Student Center',
    maxVolunteers: 50,
    acceptedCount: 20,
    totalSlots: 50,
    image: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=800'
  },
  {
    id: 'rot3',
    title: 'Community Service Day',
    organizer: 'Rotaract Club',
    category: 'Community',
    date: '2026-07-12',
    location: 'Jaffna Community Hall',
    maxVolunteers: 30,
    acceptedCount: 15,
    totalSlots: 30,
    image: 'https://images.unsplash.com/photo-1559027615-cd44874e90e5?w=800'
  },
  // Leo Club Tab
  {
    id: 'leo1',
    title: 'Tree Plantation Project',
    organizer: 'Leo Club',
    category: 'Environment',
    date: '2026-06-22',
    location: 'South Campus Gardens',
    maxVolunteers: 40,
    acceptedCount: 8,
    totalSlots: 40,
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800'
  },
  {
    id: 'leo2',
    title: 'Beach Cleanup Program',
    organizer: 'Leo Club',
    category: 'Environment',
    date: '2026-06-12',
    location: 'Galle Beach',
    maxVolunteers: 30,
    acceptedCount: 5,
    totalSlots: 30,
    image: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=800'
  },
  {
    id: 'leo3',
    title: 'School Donation Drive',
    organizer: 'Leo Club',
    category: 'Education',
    date: '2026-07-20',
    location: 'Colombo Primary School',
    maxVolunteers: 25,
    acceptedCount: 10,
    totalSlots: 25,
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800'
  },
  // AIESEC Tab
  {
    id: 'aiesec1',
    title: 'Youth Leadership Summit',
    organizer: 'AIESEC',
    category: 'Leadership',
    date: '2026-07-02',
    location: 'Innovation Center',
    maxVolunteers: 60,
    acceptedCount: 40,
    totalSlots: 60,
    image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800'
  },
  {
    id: 'aiesec2',
    title: 'Global Volunteer Program',
    organizer: 'AIESEC',
    category: 'Community',
    date: '2026-08-01',
    location: 'International Student Lounge',
    maxVolunteers: 15,
    acceptedCount: 5,
    totalSlots: 15,
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800'
  },
  {
    id: 'aiesec3',
    title: 'Cultural Exchange Event',
    organizer: 'AIESEC',
    category: 'Education',
    date: '2026-07-15',
    location: 'Main Hall',
    maxVolunteers: 50,
    acceptedCount: 30,
    totalSlots: 50,
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800'
  },
  // Other Clubs Tab
  {
    id: 'other1',
    title: 'Tech Workshop for Youth',
    organizer: 'Green Force',
    category: 'Technology',
    date: '2026-06-15',
    location: 'Downtown Community Center',
    maxVolunteers: 20,
    acceptedCount: 18,
    totalSlots: 20,
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800'
  },
  {
    id: 'other2',
    title: 'Environmental Awareness Walk',
    organizer: 'Earth Keepers',
    category: 'Environment',
    date: '2026-06-28',
    location: 'Viharamahadevi Park',
    maxVolunteers: 100,
    acceptedCount: 22,
    totalSlots: 100,
    image: 'https://images.unsplash.com/photo-1516216621161-f9c9c02a2270?w=800'
  }
];

/**
 * Home Component
 * 
 * The main landing homepage for the VolunteerHub application.
 * Contains navigation hero section, statistics, and testimonials.
 * 
 * @returns {JSX.Element} The rendered Home page layout
 */
const Home = () => {
  // Authentication context for handling user sessions and navigation
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { openAuthModal } = useOutletContext() || {};

  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState("IEEE");
  const [publicStats, setPublicStats] = useState({
    activeVolunteers: 112,
    eventsHosted: 85,
    partnerClubs: 61,
    volunteerHours: 164
  });

  const fetchPublicStats = async () => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiBaseUrl}/api/public-stats`);
      if (res.ok) {
        const data = await res.json();
        setPublicStats({
          activeVolunteers: data.activeVolunteers ?? 112,
          eventsHosted: data.eventsHosted ?? 85,
          partnerClubs: data.partnerClubs ?? 61,
          volunteerHours: data.volunteerHours ?? 164
        });
      }
    } catch (err) {
      console.error("Could not load dynamic public stats", err);
    }
  };

  const fetchHomeEvents = async () => {
    const isApprovedAndNotArchived = ev => (ev.approvalStatus || 'Approved') === 'Approved' && ev.status !== 'Archived';
    try {
      const data = await getEvents();
      if (data && data.length > 0) {
        const normalized = data.map(ev => ({
          ...ev,
          date: ev.date || ev.eventDate,
          totalSlots: ev.totalSlots || ev.maxVolunteers || ev.volunteerRequired || 30,
          acceptedCount: ev.acceptedCount !== undefined ? ev.acceptedCount : (ev.volunteers || 0),
          organizer: ev.organizer || (ev.User ? ev.User.name : 'Student Club')
        })).filter(isApprovedAndNotArchived);
        setEvents(normalized);
      } else {
        throw new Error("No database events");
      }
    } catch (error) {
      const stored = localStorage.getItem('voms_events');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const normalized = parsed.map(ev => ({
            ...ev,
            date: ev.date || ev.eventDate,
            totalSlots: ev.totalSlots || ev.maxVolunteers || ev.volunteerRequired || 30,
            acceptedCount: ev.acceptedCount !== undefined ? ev.acceptedCount : (ev.volunteers || 0),
            organizer: ev.organizer || 'Student Club'
          })).filter(isApprovedAndNotArchived);
          setEvents(normalized);
        } catch (e) {
          setEvents(PLACEHOLDER_EVENTS.filter(isApprovedAndNotArchived));
        }
      } else {
        setEvents(PLACEHOLDER_EVENTS.filter(isApprovedAndNotArchived));
      }
    }
  };

  useEffect(() => {
    fetchHomeEvents();
    fetchPublicStats();
  }, []);

  const currentClubEvents = events.filter(ev => {
    const org = (ev.organizer || '').toLowerCase();
    if (activeTab === "IEEE") return org.includes("ieee");
    if (activeTab === "Rotaract") return org.includes("rotaract");
    if (activeTab === "Leo Club") return org.includes("leo");
    if (activeTab === "AIESEC") return org.includes("aiesec");
    return !org.includes("ieee") && !org.includes("rotaract") && !org.includes("leo") && !org.includes("aiesec");
  });

  const getPopularEvents = () => {
    return [...events]
      .sort((a, b) => {
        const aPop = a.acceptedCount !== undefined ? a.acceptedCount : (a.volunteers || 0);
        const bPop = b.acceptedCount !== undefined ? b.acceptedCount : (b.volunteers || 0);
        return bPop - aPop;
      })
      .slice(0, 8);
  };

  const getNewEvents = () => {
    return [...events]
      .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
      .slice(0, 8);
  };

  const getTrendingEvents = () => {
    return [...events]
      .sort((a, b) => {
        const aTrend = (a.views || 0) + (a.acceptedCount !== undefined ? a.acceptedCount : (a.volunteers || 0)) * 2;
        const bTrend = (b.views || 0) + (b.acceptedCount !== undefined ? b.acceptedCount : (b.volunteers || 0)) * 2;
        return bTrend - aTrend;
      })
      .slice(0, 8);
  };

  const popularList = getPopularEvents();
  const newList = getNewEvents();
  const trendingList = getTrendingEvents();



  /**
   * Top testimonials configuration (Displayed in a 3-Column Grid)
   */
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Gold Volunteer",
      feedback: "This platform transformed my university experience. I've met amazing people and gained skills I couldn't get in a classroom.",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120",
    },
    {
      name: "Ahmed Hassan",
      role: "Event Organizer",
      feedback: "Managing events has never been easier. From tracking attendance to issuing certificates, everything is streamlined.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120",
    },
    {
      name: "Maria Rodriguez",
      role: "Student Leader",
      feedback: "The leaderboard motivated me to participate more. Earning points and certificates really built my campus reputation.",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120",
    },
  ];

  /**
   * Handles navigation when the user clicks "Explore Events"
   * Redirects based on user role (student, organizer, admin) or to sign-in.
   */
  const handleExplore = () => {
    navigate("/events");
  };

  /**
   * Handles navigation when the user clicks "Join Now" or "Dashboard"
   * Directs authenticated users to their respective dashboards, or unauthenticated users to register.
   */
  const handleJoinNow = () => {
    if (isAuthenticated) {
      if (user?.role === "student") navigate("/student/dashboard");
      else if (user?.role === "organizer") navigate("/organizer/dashboard");
      else navigate("/admin/dashboard");
    } else {
      if (openAuthModal) {
        openAuthModal("register", "student");
      } else {
        navigate("/register");
      }
    }
  };

  return (
    <div>

      {/* ── SECTION 1: MINIMALIST HERO ─────────────────── */}
      <section className="vh-minimal-hero">
        <div className="vh-minimal-hero-container">
          <div className="vh-minimal-hero-grid">
            {/* Left Side: Content & Actions */}
            <div className="vh-minimal-hero-content">
              <h1 className="vh-minimal-heading">
                Empowering Students To Lead & <span className="vh-minimal-highlight">Make Real Impact</span>
              </h1>

              <p className="vh-minimal-subtext">
                Join over 500+ students across 20+ active university clubs. Discover high-impact volunteer opportunities, earn verified digital certificates, and build your leadership legacy.
              </p>

              <div className="vh-minimal-buttons">
                <button onClick={handleExplore} className="vh-btn-minimal-primary">
                  Explore Opportunities <ArrowRight className="w-4 h-4" />
                </button>
                <button onClick={handleJoinNow} className="vh-btn-minimal-secondary">
                  Join as Volunteer
                </button>
              </div>

              {/* Minimalist Stats Highlights Row */}
              <div className="vh-minimal-stats-row">
                <div className="vh-minimal-stat-item">
                  <span className="vh-minimal-stat-num">{publicStats.activeVolunteers}+</span>
                  <span className="vh-minimal-stat-label">Active Volunteers</span>
                </div>
                <div className="vh-minimal-stat-sep"></div>
                <div className="vh-minimal-stat-item">
                  <span className="vh-minimal-stat-num">{publicStats.eventsHosted}+</span>
                  <span className="vh-minimal-stat-label">Events Hosted</span>
                </div>
                <div className="vh-minimal-stat-sep"></div>
                <div className="vh-minimal-stat-item">
                  <span className="vh-minimal-stat-num">{publicStats.partnerClubs}+</span>
                  <span className="vh-minimal-stat-label">Partner Clubs</span>
                </div>
                <div className="vh-minimal-stat-sep"></div>
                <div className="vh-minimal-stat-item">
                  <span className="vh-minimal-stat-num">{publicStats.volunteerHours}+</span>
                  <span className="vh-minimal-stat-label">Volunteer Hours</span>
                </div>
              </div>
            </div>

            {/* Right Side: Clean Minimalist Image Showcase */}
            <div className="vh-minimal-hero-media">
              <div className="vh-minimal-image-frame">
                <img
                  src="/images/hero-volunteers.jpg"
                  alt="Students volunteering together"
                  className="vh-minimal-hero-img"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── NEW AND POPULAR EVENTS SECTION ────────────────── */}
      <section className="vh-discovery-shelf-section">
        <div className="vh-discovery-shelf-container">
          <div className="vh-discovery-shelf-header">
            <h2 className="vh-discovery-shelf-title">New and Popular Events</h2>
            <p className="vh-discovery-shelf-subtitle">Discover high-impact volunteer opportunities on VolunteerHub</p>
          </div>

          {[
            { title: "Most Popular Events", list: popularList, id: "popular-shelf" },
            { title: "Hot New Releases", list: newList, id: "new-shelf" },
            { title: "Trending Events", list: trendingList, id: "trending-shelf" }
          ].map((shelf) => (
            <div key={shelf.id} className="vh-shelf-row">
              <div className="vh-shelf-row-header">
                <h3 className="vh-shelf-row-title">{shelf.title}</h3>
                <div className="vh-shelf-nav-arrows">
                  <button
                    className="vh-shelf-arrow-btn"
                    onClick={() => {
                      const list = document.getElementById(shelf.id);
                      if (list) list.scrollBy({ left: -300, behavior: "smooth" });
                    }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    className="vh-shelf-arrow-btn"
                    onClick={() => {
                      const list = document.getElementById(shelf.id);
                      if (list) list.scrollBy({ left: 300, behavior: "smooth" });
                    }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div id={shelf.id} className="vh-shelf-cards-container">
                {shelf.list.map((ev) => (
                  <div key={ev.id} className="vh-shelf-card">
                    <div className="vh-shelf-card-image-wrapper">
                      <img
                        src={ev.image || `https://picsum.photos/seed/${encodeURIComponent(ev.title)}/300/200`}
                        alt={ev.title}
                        className="vh-shelf-card-image"
                        onError={e => {
                          e.currentTarget.src = 'https://picsum.photos/seed/placeholder/300/200';
                        }}
                      />
                      <span className="vh-shelf-card-category">{ev.category}</span>
                    </div>

                    <div className="vh-shelf-card-body">
                      <div className="vh-shelf-card-org">
                        <span className="vh-shelf-card-organizer">{ev.organizer || 'Student Club'}</span>
                      </div>
                      <h4 className="vh-shelf-card-title" title={ev.title}>{ev.title}</h4>

                      <div className="vh-shelf-card-details">
                        <div className="vh-shelf-card-detail-item">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{ev.date}</span>
                        </div>
                        <div className="vh-shelf-card-detail-item">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{ev.location}</span>
                        </div>
                      </div>

                      <Link to={`/events/${ev.id}`} className="vh-shelf-card-btn">
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CLUB OPPORTUNITIES DISCOVERY SECTION ──────────── */}
      <section className="vh-club-section">
        <div className="vh-club-container">
          <div className="vh-club-header">
            <h2 className="vh-club-section-title">Explore Opportunities by Club</h2>
          </div>

          <div className="vh-club-gradient-box">
            {/* Left Side: Promo Panel */}
            <div className="vh-club-promo">
              <h3 className="vh-club-promo-title">
                Find Volunteer Opportunities Through Student Clubs
              </h3>
              <p className="vh-club-promo-desc">
                Join impactful volunteer events organized by university clubs and build your leadership, teamwork, and community service experience.
              </p>
              <button onClick={handleExplore} className="vh-club-promo-btn">
                Explore Events <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Right Side: Tabs & Cards Shelf */}
            <div className="vh-club-content">
              {/* Tabs */}
              <div className="vh-club-tabs">
                {["IEEE", "Rotaract", "Leo Club", "AIESEC", "Other Clubs"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`vh-club-tab-pill ${activeTab === tab ? "active" : ""}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Event Cards Shelf */}
              <div className="vh-club-cards-shelf">
                {currentClubEvents.map((ev) => (
                  <div key={ev.id} className="vh-club-card">
                    <div className="vh-club-card-image-wrapper">
                      <img
                        src={ev.image || `https://picsum.photos/seed/${encodeURIComponent(ev.title)}/300/200`}
                        alt={ev.title}
                        className="vh-club-card-image"
                        onError={e => {
                          e.currentTarget.src = 'https://picsum.photos/seed/placeholder/300/200';
                        }}
                      />
                      <span className="vh-club-card-category-badge">{ev.category}</span>
                    </div>

                    <div className="vh-club-card-body">
                      <div className="vh-club-card-org">
                        <div className="vh-club-card-org-dot"></div>
                        <span>{ev.organizer || 'Student Club'}</span>
                      </div>

                      <h4 className="vh-club-card-title" title={ev.title}>
                        {ev.title}
                      </h4>

                      <div className="vh-club-card-details">
                        <div className="vh-club-card-detail-item">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{ev.date}</span>
                        </div>
                        <div className="vh-club-card-detail-item">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{ev.location}</span>
                        </div>
                        <div className="vh-club-card-detail-item">
                          <Users className="w-3.5 h-3.5" />
                          <span>
                            {ev.acceptedCount !== undefined ? ev.acceptedCount : (ev.volunteers || 0)} / {ev.totalSlots || ev.maxVolunteers || 50} Slots
                          </span>
                        </div>
                      </div>

                      <Link to={`/events/${ev.id}`} className="vh-club-card-btn">
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
                {currentClubEvents.length === 0 && (
                  <div className="vh-club-empty-state">
                    <p>No active volunteer opportunities found for this club.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CLUB LOGOS PARTNERS BANNER ───────────────────── */}
      <section className="vh-club-logos-section">
        <div className="vh-club-logos-container">
          <h4 className="vh-club-logos-title">Explore Opportunities from 20+ Active Clubs</h4>

          <div className="vh-club-logos-wrapper">
            <div id="vh-club-logos-list" className="vh-club-logos-list">
              {[
                { name: "IEEE", char: "I", bg: "#1D4ED8" },
                { name: "Rotaract", char: "R", bg: "#BE185D" },
                { name: "Leo Club", char: "L", bg: "#B45309" },
                { name: "AIESEC", char: "A", bg: "#0891B2" },
                { name: "Gavel Club", char: "G", bg: "#6D28D9" },
                { name: "Eco Club", char: "E", bg: "#047857" },
                { name: "Green Force", char: "G", bg: "#15803D" },
                { name: "Earth Keepers", char: "E", bg: "#0F766E" },
                { name: "Sports Club", char: "S", bg: "#C2410C" },
                { name: "Drama Society", char: "D", bg: "#A21CAF" }
              ].map((club, idx) => (
                <div key={idx} className="vh-club-logo-pill" onClick={() => {
                  const exploreSection = document.querySelector(".vh-club-section");
                  if (exploreSection) {
                    exploreSection.scrollIntoView({ behavior: "smooth" });
                  }
                  if (["IEEE", "Rotaract", "Leo Club", "AIESEC"].includes(club.name)) {
                    setActiveTab(club.name);
                  } else {
                    setActiveTab("Other Clubs");
                  }
                }}>
                  <div className="vh-club-logo-avatar" style={{ backgroundColor: club.bg }}>
                    {club.char}
                  </div>
                  <span>{club.name}</span>
                </div>
              ))}
            </div>

            <button className="vh-club-logos-scroll-btn" onClick={() => {
              const list = document.getElementById("vh-club-logos-list");
              if (list) {
                list.scrollBy({ left: 200, behavior: "smooth" });
              }
            }}>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: STATS BANNER ─────────────────────────── */}
      <section className="vh-stats">
        <div className="vh-stats-container">
          <div className="vh-stat-item">
            <AnimatedCounter end={publicStats.activeVolunteers} suffix="+" />
            <p className="vh-stat-label">Active Volunteers</p>
          </div>
          <div className="vh-stat-item">
            <AnimatedCounter end={publicStats.eventsHosted} suffix="+" />
            <p className="vh-stat-label">Events Hosted</p>
          </div>
          <div className="vh-stat-item">
            <AnimatedCounter end={publicStats.partnerClubs} suffix="+" />
            <p className="vh-stat-label">Partner Clubs</p>
          </div>
          <div className="vh-stat-item">
            <AnimatedCounter end={publicStats.volunteerHours} suffix="+" />
            <p className="vh-stat-label">Volunteer Hours</p>
          </div>
        </div>
      </section>

      {/* ── EXPLORE CATEGORIES SECTION ─────────────────────── */}
      <section className="vh-categories-section">
        <div className="vh-categories-container">
          <h2 className="vh-categories-title">Explore categories</h2>

          <div className="vh-categories-grid">
            {[
              { name: "Environment", icon: Leaf },
              { name: "Healthcare", icon: HeartPulse },
              { name: "Coding & Technology", icon: Code },
              { name: "Education", icon: BookOpen },
              { name: "Community Service", icon: Heart },
              { name: "Leadership", icon: Award },
              { name: "Arts & Culture", icon: Paintbrush },
              { name: "Sports & Wellness", icon: Trophy }
            ].map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <div
                  key={idx}
                  className="vh-category-pill"
                  onClick={() => {
                    navigate("/events");
                  }}
                >
                  <Icon className="w-4 h-4" />
                  <span>{cat.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SECTION 3: TESTIMONIALS ─────────────────────────── */}
      <section className="vh-testimonials">
        <div className="vh-testimonials-container">
          <div className="vh-section-header">
            <span className="vh-testimonial-badge">Community Feedback</span>
            <h2 className="vh-section-title">What Students Say</h2>
            <p className="vh-section-subtitle">Real experiences from our volunteer community</p>
          </div>

          <div className="vh-testimonials-grid">
            {testimonials.map((t, idx) => (
              <div key={idx} className="vh-testimonial-wrapper">
                <div className="vh-testimonial-bubble">
                  <div className="vh-testimonial-card-header">
                    <div className="vh-testimonial-stars">
                      {[...Array(5)].map((_, sIdx) => (
                        <Star key={sIdx} className="vh-testimonial-star-icon" />
                      ))}
                    </div>
                    <span className="vh-testimonial-verified">
                      <span className="vh-testimonial-verified-dot" />
                      Verified Student
                    </span>
                  </div>
                  <p className="vh-testimonial-quote">
                    "{t.feedback}"
                  </p>
                  <div className="vh-testimonial-quote-mark">“</div>
                </div>
                <div className="vh-testimonial-author">
                  <div className="vh-testimonial-avatar-wrapper">
                    <img
                      src={t.image}
                      alt={t.name}
                      className="vh-testimonial-avatar"
                    />
                  </div>
                  <div className="vh-testimonial-meta">
                    <h4 className="vh-testimonial-name">{t.name}</h4>
                    <span className="vh-testimonial-role">{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;