import { Link } from 'react-router-dom';
import LogoLoop from '../components/LogoLoop';
import { APP_NAME, APP_TAGLINE } from '../config/brand';
import './LandingPage.css';

const TRUST_LOGOS = [
  { icon: '🛣️', title: 'Roads Desk' },
  { icon: '🚰', title: 'Water Board' },
  { icon: '💡', title: 'Street Lights' },
  { icon: '🧹', title: 'Sanitation' },
  { icon: '🌳', title: 'Parks Cell' },
  { icon: '📍', title: 'Ward Teams' },
];

const FEATURES = [
  { icon: '📍', title: 'Map-first reporting', desc: 'Drop a pin, attach details, and route the complaint with exact location context.' },
  { icon: '📸', title: 'Photo-backed proof', desc: 'Upload clear image evidence so departments understand the issue instantly.' },
  { icon: '🔔', title: 'Live status alerts', desc: 'Track movement from Pending to Resolved with real-time notifications.' },
  { icon: '📊', title: 'Action-ready dashboards', desc: 'Surface trends, volume, and urgency across categories for faster decisions.' },
  { icon: '🧠', title: 'Smart prioritization', desc: 'Highlight critical issues early using severity-aware rules and public demand.' },
  { icon: '🔗', title: 'Duplicate linking', desc: 'Cluster repeat reports and convert them into stronger community signal.' },
];

const STEPS = [
  { step: '01', title: 'Capture the issue', desc: 'Add the problem, photos, and exact spot in under a minute.' },
  { step: '02', title: 'Send it to the right desk', desc: 'Your report is grouped, prioritized, and visible to the right team.' },
  { step: '03', title: 'Watch momentum build', desc: 'Follow updates, linked reports, and progress in one shared timeline.' },
  { step: '04', title: 'Close the loop', desc: 'Resolution proof and status history stay visible for everyone involved.' },
];

export default function LandingPage() {
  return (
    <div className="landing">
      <div className="glow-dot" style={{ width: 540, height: 540, background: 'rgba(99,102,241,0.14)', top: -120, left: -120 }} />
      <div className="glow-dot" style={{ width: 420, height: 420, background: 'rgba(14,165,233,0.1)', top: 180, right: -60 }} />
      <div className="glow-dot" style={{ width: 380, height: 380, background: 'rgba(79,70,229,0.08)', bottom: 80, left: '35%' }} />

      <section className="hero">
        <div className="hero-content fade-in">
          <div className="hero-badge">City operations, citizen clarity</div>
          <h1>
            Report faster.
            <br />
            <span className="gradient-text">Resolve smarter.</span>
          </h1>
          <p className="hero-desc">
            {APP_NAME} gives residents and departments one shared signal system for potholes,
            garbage overflow, lighting issues, drainage problems, and every civic fix in between.
          </p>
          <p className="hero-subcopy">{APP_TAGLINE}</p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary btn-lg" id="hero-register-btn">
              Report an issue
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg" id="hero-login-btn">
              Sign In
            </Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat"><strong>10K+</strong><span>Cases closed</span></div>
            <div className="hero-stat-divider" />
            <div className="hero-stat"><strong>50+</strong><span>Wards covered</span></div>
            <div className="hero-stat-divider" />
            <div className="hero-stat"><strong>98%</strong><span>Status visibility</span></div>
          </div>
        </div>

        <div className="hero-visual fade-in">
          <div className="hero-panel">
            <div className="hero-panel-grid" />
            <div className="hero-orbit hero-orbit-one" />
            <div className="hero-orbit hero-orbit-two" />

            <div className="signal-card signal-card-main">
              <div className="signal-card-top">
                <span className="signal-pill warm">Pending</span>
                <span className="signal-pill hot">High priority</span>
              </div>
              <h3>Water logging near Pragathi Nagar junction</h3>
              <p>3 reports linked · 12 citizens following · Routed to Water & Drainage</p>
              <div className="signal-preview">
                <div className="signal-preview-pin" />
                <div className="signal-preview-line signal-preview-line-a" />
                <div className="signal-preview-line signal-preview-line-b" />
              </div>
              <div className="signal-card-footer">
                <span>Updated 2 min ago</span>
                <span className="signal-link">Open timeline</span>
              </div>
            </div>

            <div className="signal-card signal-card-side">
              <strong>Live queue</strong>
              <div className="signal-metric">
                <span>Resolved today</span>
                <b>124</b>
              </div>
              <div className="signal-metric">
                <span>Avg. first response</span>
                <b>18 min</b>
              </div>
            </div>

            <div className="signal-card signal-card-bottom">
              <span className="signal-dot" />
              <div>
                <strong>New update</strong>
                <p>Field team marked the road barricaded and shared proof.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="loop-section container fade-in">
        <div className="loop-label">Connected departments and issue streams</div>
        <LogoLoop
          logos={TRUST_LOGOS}
          speed={30}
          direction="left"
          gap={16}
          fadeOut
          fadeOutColor="#f4f7fb"
          ariaLabel="Department streams"
        />
      </section>

      <section className="features-section container">
        <div className="section-title text-center">
          <h2>Everything needed to move from report to resolution</h2>
          <p>A cleaner, calmer workflow for citizens, field teams, and administrators</p>
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

      <section className="story-section container">
        <div className="story-card fade-in">
          <div className="story-copy">
            <span className="story-eyebrow">Built for visible civic progress</span>
            <h2>One public signal, one operational timeline</h2>
            <p>
              {APP_NAME} is designed so reports do not disappear into a black box. Every update,
              assignment, linked complaint, and proof image adds clarity for both citizens and officials.
            </p>
          </div>
          <div className="story-rail">
            <div className="story-rail-item">
              <span>01</span>
              <strong>Citizen submits</strong>
              <p>Issue, media, and location are captured in one place.</p>
            </div>
            <div className="story-rail-item">
              <span>02</span>
              <strong>Routing begins</strong>
              <p>Priority and department handoff become visible immediately.</p>
            </div>
            <div className="story-rail-item">
              <span>03</span>
              <strong>Resolution is proven</strong>
              <p>Final proof and timeline stay attached to the case.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="steps-section container">
        <div className="section-title text-center">
          <h2>How {APP_NAME} works</h2>
          <p>Four clear steps, from the first report to verified closure</p>
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

      <section className="cta-section">
        <div className="cta-box container">
          <div className="cta-badge">Start reporting with clarity</div>
          <h2>Make every civic issue impossible to ignore</h2>
          <p>Join residents already using {APP_NAME} to turn local problems into trackable action.</p>
          <Link to="/register" className="btn btn-primary btn-lg" id="cta-register-btn">
            Get started for free
          </Link>
        </div>
      </section>

      <footer className="landing-footer">
        <p>© {APP_NAME}</p>
      </footer>
    </div>
  );
}
