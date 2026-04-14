import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]       = useState({ name: '', email: '', password: '', phone: '' });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.length < 2)    e.name     = 'Name must be at least 2 characters';
    if (!/^\S+@\S+\.\S+$/.test(form.email))           e.email    = 'Enter a valid email';
    if (form.password.length < 6)                      e.password = 'Password must be at least 6 characters';
    if (form.phone && !/^[0-9]{10}$/.test(form.phone)) e.phone   = 'Enter a valid 10-digit phone number';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setErrors({ api: err.response?.data?.message || 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: '', api: '' }));
  };

  return (
    <div className="auth-bg">
      <div className="auth-card card fade-in" style={{ maxWidth: 480 }}>
        <div className="auth-logo">🏙️</div>
        <div className="auth-header">
          <h2>Create your account</h2>
          <p>Join CivicFix and report civic issues in your area</p>
        </div>

        {errors.api && <div className="auth-error">{errors.api}</div>}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name <span className="required">*</span></label>
            <input
              id="name" name="name" type="text"
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="John Doe"
              value={form.name} onChange={onChange} autoComplete="name"
            />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email Address <span className="required">*</span></label>
            <input
              id="reg-email" name="email" type="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="you@example.com"
              value={form.email} onChange={onChange} autoComplete="email"
            />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password <span className="required">*</span></label>
            <input
              id="reg-password" name="password" type="password"
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="Minimum 6 characters"
              value={form.password} onChange={onChange} autoComplete="new-password"
            />
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="phone">Phone Number (optional)</label>
            <input
              id="phone" name="phone" type="tel"
              className={`form-input ${errors.phone ? 'error' : ''}`}
              placeholder="10-digit mobile number"
              value={form.phone} onChange={onChange}
            />
            {errors.phone && <span className="form-error">{errors.phone}</span>}
          </div>

          <button id="register-submit-btn" type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in →</Link>
        </p>
      </div>
    </div>
  );
}
