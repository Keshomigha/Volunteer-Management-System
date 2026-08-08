import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Facebook, Twitter, Linkedin, Send } from "lucide-react";
import "./ContactPage.css";

/**
 * ContactPage Component
 * 
 * Clean, modern, image-free public Contact Us page for VolunteerHub.
 */
const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setSubmitted(true);
      setTimeout(() => {
        setFormData({ name: "", email: "", subject: "", message: "" });
        setSubmitted(false);
        alert("Thank you! Your message has been received.");
      }, 1000);
    }
  };

  return (
    <div className="vh-contact-page">
      
      {/* Hero Header Section */}
      <section className="vh-contact-hero">
        <div className="vh-contact-hero-container">
          <span className="vh-section-subtitle">GET IN TOUCH</span>
          <h1 className="vh-hero-heading" style={{ marginTop: "0.5rem" }}>
            We'd Love to <span className="blue-highlight">Hear From You</span>
          </h1>
          <p className="vh-hero-subtext" style={{ marginTop: "0.75rem" }}>
            Have questions about volunteering or hosting an event? Drop us a message, and we will get back to you shortly.
          </p>
        </div>
      </section>

      {/* Main Content Grid Section */}
      <section className="vh-contact-grid-section">
        <div className="vh-contact-grid-container">

          {/* Left Column: Contact Details Cards */}
          <div className="vh-contact-info-col">
            <h2 className="vh-feature-title" style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Contact Details</h2>

            {/* Phone Card */}
            <div className="vh-contact-card">
              <div className="vh-contact-icon-box">
                <Phone className="w-5 h-5" />
              </div>
              <div className="vh-contact-card-content">
                <h3>Phone Support</h3>
                <p>(555) 123-4567</p>
              </div>
            </div>

            {/* Email Card */}
            <div className="vh-contact-card">
              <div className="vh-contact-icon-box">
                <Mail className="w-5 h-5" />
              </div>
              <div className="vh-contact-card-content">
                <h3>Email Inquiries</h3>
                <p>info@volunteerhub.edu</p>
              </div>
            </div>

            {/* Main Campus Office Card */}
            <div className="vh-contact-card">
              <div className="vh-contact-icon-box">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="vh-contact-card-content">
                <h3>Main Campus Office</h3>
                <p>Student Union, Wing B, Room 302</p>
              </div>
            </div>

            {/* Office Hours Card */}
            <div className="vh-contact-card">
              <div className="vh-contact-icon-box">
                <Clock className="w-5 h-5" />
              </div>
              <div className="vh-contact-card-content">
                <h3>Office Hours</h3>
                <p>Monday - Friday: 8:30 AM - 5:00 PM</p>
              </div>
            </div>

            {/* Social Links Panel */}
            <div className="vh-contact-social-card">
              <h3 className="vh-contact-card-content" style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700 }}>
                Follow Us
              </h3>
              <div className="vh-contact-social-btns">
                <a href="#" className="vh-contact-social-btn" aria-label="Facebook">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="#" className="vh-contact-social-btn" aria-label="Twitter">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="#" className="vh-contact-social-btn" aria-label="LinkedIn">
                  <Linkedin className="w-4 h-4" />
                </a>
              </div>
            </div>

          </div>

          {/* Right Column: Contact Message Form */}
          <div className="vh-contact-form-card">
            <div>
              <h2 className="vh-feature-title" style={{ fontSize: "1.5rem", marginBottom: "0.35rem" }}>Send a Message</h2>
              <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", margin: 0 }}>
                Fill out the form below and our team will get back to you within 24 hours.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div className="vh-contact-form-grid">
                <div className="vh-contact-field-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                    className="vh-contact-input"
                  />
                </div>

                <div className="vh-contact-field-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="you@university.edu"
                    className="vh-contact-input"
                  />
                </div>
              </div>

              <div className="vh-contact-field-group">
                <label htmlFor="subject">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="How can we help?"
                  className="vh-contact-input"
                />
              </div>

              <div className="vh-contact-field-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder="Type your message here..."
                  className="vh-contact-textarea"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitted}
                className="vh-contact-submit-btn"
              >
                {submitted ? "Sending..." : "Send Message"} <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      </section>

    </div>
  );
};

export default ContactPage;
