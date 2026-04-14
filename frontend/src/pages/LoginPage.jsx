import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate   = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email.trim())    e.email    = 'Email is required';
    if (!form.password.trim()) e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      const user = await login(form);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    } catch (err) {
      setErrors({ api: err.response?.data?.message || 'Login failed. Please try again.' });
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
      <div className="auth-card card fade-in">
        <div className="auth-logo">🏙️</div>
        <div className="auth-header">
          <h2>Welcome back</h2>
          <p>Sign in to your CivicFix account</p>
        </div>

        {errors.api && <div className="auth-error">{errors.api}</div>}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              id="email" name="email" type="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="you@example.com"
              value={form.email} onChange={onChange} autoComplete="email"
            />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password" name="password" type="password"
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="Enter your password"
              value={form.password} onChange={onChange} autoComplete="current-password"
            />
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>

          <button id="login-submit-btn" type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Create one →</Link>
        </p>

        <div className="auth-demo">
          <p>Demo credentials:</p>
          <div className="demo-accounts">
            <div onClick={() => setForm({ email: 'citizen@demo.com', password: 'demo123' })}>
              👤 Citizen: citizen@demo.com / demo123
            </div>
            <div onClick={() => setForm({ email: 'sathwikpp14@gmail.com', password: 'Admin@1414' })}>
              🛡️ Admin: sathwikpp14@gmail.com / Admin@1414
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
