import { useState, useEffect } from "react";
import {
  Calendar, Award, Star, CheckCircle, Trophy, Bell
} from "lucide-react";
import "./HomePage.css";

/**
 * AnimatedCounter Component
 */
const AnimatedCounter = ({ end, suffix = "" }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [end]);

  return (
    <span className="vh-stat-number">
      {count}{suffix}
    </span>
  );
};

/**
 * AboutPage Component
 */
const AboutPage = () => {
  const features = [
    {
      icon: <Calendar className="w-5 h-5" />,
      title: "Event Discovery",
      description: "Browse and apply to hundreds of volunteer opportunities.",
      image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=500&q=80"
    },
    {
      icon: <Award className="w-5 h-5" />,
      title: "Certificate Generation",
      description: "Earn verified certificates for your contributions.",
      image: "https://images.unsplash.com/photo-1579389083078-4e7018379f7e?w=800&q=80"
    },
    {
      icon: <Star className="w-5 h-5" />,
      title: "Reputation Points",
      description: "Build your volunteer reputation and unlock perks.",
      image: "https://images.unsplash.com/photo-1578269174936-2709b6aeb913?w=600&q=80"
    },
    {
      icon: <CheckCircle className="w-5 h-5" />,
      title: "Attendance Tracking",
      description: "Automated check-in and participation monitoring.",
      image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=500&q=80"
    },
    {
      icon: <Trophy className="w-5 h-5" />,
      title: "Volunteer Leaderboard",
      description: "Compete and get recognized for your impact.",
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500&q=80"
    },
    {
      icon: <Bell className="w-5 h-5" />,
      title: "Smart Notifications",
      description: "Never miss an opportunity with real-time alerts.",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&q=80"
    },
  ];

  return (
    <div>

      {/* ── SECTION 1: MINIMALIST ABOUT HERO ─────────────────── */}
      <section className="vh-minimal-hero">
        <div className="vh-minimal-hero-container">
          <div className="vh-minimal-hero-grid">
            {/* Left Side: Content & Vision */}
            <div className="vh-minimal-hero-content">
              <div className="vh-minimal-badge">
                <Star className="w-4 h-4 text-blue-600 fill-blue-50" />
                <span>Our Vision & Mission</span>
              </div>

              <h1 className="vh-minimal-heading">
                Connecting Students with <span className="vh-minimal-highlight">Purposeful Impact</span>
              </h1>

              <p className="vh-minimal-subtext">
                VolunteerHub is dedicated to building a supportive community of students and organizers. We streamline event management, attendance verification, and performance gamification to make student participation in volunteer projects simple, accessible, and deeply rewarding.
              </p>

              {/* Minimalist Feature Pills */}
              <div className="vh-minimal-pills-row">
                <div className="vh-minimal-pill-tag">
                  <span className="vh-pill-check">✓</span> Verified Certificates
                </div>
                <div className="vh-minimal-pill-tag">
                  <span className="vh-pill-check">✓</span> Community Driven
                </div>
                <div className="vh-minimal-pill-tag">
                  <span className="vh-pill-check">✓</span> Gamified Rewards
                </div>
              </div>
            </div>

            {/* Right Side: Clean Minimalist Image Showcase */}
            <div className="vh-minimal-hero-media">
              <div className="vh-minimal-image-frame">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80"
                  alt="Students collaborating"
                  className="vh-minimal-hero-img"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features Section */}
      <section className="vh-features" style={{ background: "var(--bg-body)", padding: "5rem 1.5rem" }}>
        <div className="vh-features-container">
          <div className="vh-section-header">
            <h2 className="vh-section-title">Platform Features</h2>
            <p className="vh-section-subtitle">Everything you need to manage your volunteer journey</p>
          </div>

          <div className="vh-features-grid">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="vh-feature-card"
                style={{
                  padding: 0,
                  overflow: "hidden",
                  borderRadius: "1.15rem",
                  display: "flex",
                  flexDirection: "column",
                  background: "#ffffff",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 4px 10px -2px rgba(0, 0, 0, 0.02)",
                  border: "1px solid rgba(226, 232, 240, 0.8)",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease"
                }}
              >
                <div style={{ height: "155px", width: "100%", overflow: "hidden", position: "relative" }}>
                  {feature.title === "Certificate Generation" ? (
                    <div style={{ height: "155px", width: "100%", overflow: "hidden", position: "relative", background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)", padding: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ width: "100%", height: "100%", background: "#ffffff", borderRadius: "10px", border: "2px solid #d97706", padding: "8px 12px", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", boxShadow: "0 6px 16px rgba(0,0,0,0.25)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <div style={{ width: "14px", height: "14px", borderRadius: "4px", background: "#2563eb", color: "#ffffff", fontSize: "8px", fontWeight: "900", display: "flex", alignItems: "center", justifyContent: "center" }}>VH</div>
                            <span style={{ fontSize: "9px", fontWeight: "800", color: "#1e293b", letterSpacing: "0.5px" }}>VolunteerHub</span>
                          </div>
                          <span style={{ fontSize: "8px", fontWeight: "700", background: "#fef3c7", color: "#b45309", padding: "2px 6px", borderRadius: "4px", border: "1px solid #fde68a" }}>OFFICIAL CERTIFICATE</span>
                        </div>
                        <div style={{ textTransform: "uppercase", fontSize: "10px", fontWeight: "900", color: "#4338ca", letterSpacing: "1px", textAlign: "center", margin: "2px 0" }}>
                          Certificate of Participation
                        </div>
                        <div style={{ fontSize: "8.5px", color: "#475569", textAlign: "center", lineHeight: "1.2" }}>
                          This certifies that <strong style={{ color: "#0f172a" }}>Sarah Chen</strong> completed <strong style={{ color: "#2563eb" }}>25+ Hours</strong> at <span style={{ color: "#7c3aed", fontWeight: "700" }}>IEEE WIE Day</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px dashed #cbd5e1", paddingTop: "4px" }}>
                          <span style={{ fontSize: "7.5px", color: "#94a3b8" }}>ID: #VH-2026-CERT</span>
                          <span style={{ fontSize: "7.5px", fontWeight: "700", color: "#059669", display: "flex", alignItems: "center", gap: "2px" }}>✓ Verified Signature</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={feature.image}
                      alt={feature.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  )}
                  <div style={{ position: "absolute", bottom: "10px", left: "12px", background: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(6px)", padding: "0.35rem 0.5rem", borderRadius: "0.75rem", boxShadow: "0 4px 12px rgba(0,0,0,0.12)", display: "flex", alignItems: "center", gap: "0.5rem", zIndex: 2 }}>
                    <div style={{ color: "var(--primary-color)", display: "flex" }}>
                      {feature.icon}
                    </div>
                  </div>
                </div>
                <div style={{ padding: "1.25rem 1.25rem 1.5rem" }}>
                  <h3 className="vh-feature-title" style={{ fontSize: "1.1rem", margin: 0, fontWeight: 700, color: "#0f172a" }}>{feature.title}</h3>
                  <p className="vh-feature-desc" style={{ marginTop: "0.4rem", fontSize: "0.92rem", color: "#475569", lineHeight: 1.5 }}>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Statistics Banner */}
      <section className="vh-stats">
        <div className="vh-stats-container">
          <div className="vh-stat-item">
            <AnimatedCounter end={500} suffix="+" />
            <p className="vh-stat-label">Active Volunteers</p>
          </div>
          <div className="vh-stat-item">
            <AnimatedCounter end={120} suffix="+" />
            <p className="vh-stat-label">Events Hosted</p>
          </div>
          <div className="vh-stat-item">
            <AnimatedCounter end={20} suffix="+" />
            <p className="vh-stat-label">Partner Clubs</p>
          </div>
          <div className="vh-stat-item">
            <AnimatedCounter end={1500} suffix="+" />
            <p className="vh-stat-label">Volunteer Hours</p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default AboutPage;
