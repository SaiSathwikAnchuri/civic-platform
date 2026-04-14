import { Link } from 'react-router-dom';
import './LandingPage.css';

const FEATURES = [
  { icon: '📍', title: 'Location-Based Reporting', desc: 'Pin your issue on an interactive map. Exact locations ensure faster dispatch.' },
  { icon: '📸', title: 'Photo Evidence', desc: 'Upload up to 5 photos per complaint. Visual proof accelerates resolution.' },
  { icon: '🔔', title: 'Real-Time Notifications', desc: 'Get instant updates via Socket.io whenever your complaint status changes.' },
  { icon: '📊', title: 'Live Analytics', desc: 'Authorities track trends, priorities, and resolution rates on a live dashboard.' },
  { icon: '🤖', title: 'Auto Priority Engine', desc: 'AI-based rules automatically assign Critical, High, Medium, or Low priority.' },
  { icon: '🔗', title: 'Duplicate Detection', desc: 'Same issue reported twice? We link them. Upvotes amplify visibility.' },
];

const STEPS = [
  { step: '01', title: 'Create Your Account', desc: 'Register as a citizen in under 30 seconds.' },
  { step: '02', title: 'Report the Issue', desc: 'Fill in details, attach photos, drop a pin on the map.' },
  { step: '03', title: 'Track in Real Time', desc: 'Watch your complaint move from Pending → In Progress → Resolved.' },
  { step: '04', title: 'Rate & Upvote', desc: 'Upvote existing complaints to boost their priority to authorities.' },
];

export default function LandingPage() {
  return (
    <div className="landing">
      {/* Decorative glows */}
      <div className="glow-dot" style={{ width: 500, height: 500, background: 'rgba(99,102,241,0.15)', top: -100, left: -100 }} />
      <div className="glow-dot" style={{ width: 400, height: 400, background: 'rgba(34,211,238,0.08)', bottom: 200, right: -80 }} />

      {/* Hero */}
      <section className="hero">
        <div className="hero-content fade-in">
          <div className="hero-badge">🚨 Real-Time Civic Issue Tracker</div>
          <h1>
            Your City. <br />
            <span className="gradient-text">Your Voice.</span>
          </h1>
          <p className="hero-desc">
            CivicFix empowers citizens to report potholes, garbage overflow, and civic issues.
            Authorities get real-time alerts and track resolution — transparently.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary btn-lg" id="hero-register-btn">
              🚀 Report an Issue
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg" id="hero-login-btn">
              Sign In
            </Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat"><strong>10K+</strong><span>Complaints Resolved</span></div>
            <div className="hero-stat-divider" />
            <div className="hero-stat"><strong>50+</strong><span>Cities Covered</span></div>
            <div className="hero-stat-divider" />
            <div className="hero-stat"><strong>98%</strong><span>Resolution Rate</span></div>
          </div>
        </div>

        <div className="hero-visual fade-in">
          <div className="mock-card glass">
            <div className="mock-header">
              <span className="mock-status pending">🟡 Pending</span>
              <span className="mock-priority high">🔴 High</span>
            </div>
            <div className="mock-title">Large Pothole on MG Road</div>
            <div className="mock-img-placeholder">🕳️</div>
            <div className="mock-location">📍 MG Road, Near Signal No. 4, Bengaluru</div>
            <div className="mock-footer">
              <span>⬆ 24 upvotes</span>
              <span className="mock-btn">View Details →</span>
            </div>
          </div>
          <div className="mock-notif glass">
            <span>🔔</span>
            <div>
              <strong>Status Updated!</strong>
              <p>Your complaint is now In Progress</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section container">
        <div className="section-title text-center">
          <h2>Everything you need for civic accountability</h2>
          <p>A complete platform bridging citizens and government departments</p>
        </div>
        <div className="grid-3 mt-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="feature-card card card-glow fade-in">
              <div className="feature-icon">{f.icon}</div>
              <h4>{f.title}</h4>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="steps-section container">
        <div className="section-title text-center">
          <h2>How CivicFix Works</h2>
          <p>Four simple steps to get your issue resolved</p>
        </div>
        <div className="steps-grid mt-3">
          {STEPS.map((s, i) => (
            <div key={s.step} className="step-card fade-in">
              <div className="step-number">{s.step}</div>
              <h4>{s.title}</h4>
              <p>{s.desc}</p>
              {i < STEPS.length - 1 && <div className="step-arrow">→</div>}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-box glass container">
          <h2>Ready to make your city better?</h2>
          <p>Join thousands of citizens already using CivicFix to drive change.</p>
          <Link to="/register" className="btn btn-primary btn-lg" id="cta-register-btn">
            Get Started — It's Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© 2025 CivicFix. Built with ♥ for transparent governance.</p>
      </footer>
    </div>
  );
}
