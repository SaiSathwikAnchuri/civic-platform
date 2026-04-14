import { useState, useEffect } from 'react';
import { getAnalytics } from '../api/adminAPI';
import './AdminAnalytics.css';
import Loader from '../components/Loader';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area,
} from 'recharts';

const COLORS = ['#6366f1', '#22d3ee', '#f59e0b', '#ef4444', '#22c55e', '#f97316', '#a78bfa', '#34d399', '#fb7185', '#38bdf8'];

const TOOLTIP_STYLE = {
  contentStyle: { background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', color: '#f1f5f9' },
  labelStyle: { color: '#94a3b8' },
};

export default function AdminAnalytics() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data: res } = await getAnalytics();
        setData(res.data);
      } catch { /* handled */ }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <Loader fullScreen />;

  const s = data?.summary || {};
  const statusData = [
    { name: 'Pending',     value: s.pendingCount    || 0, color: '#f59e0b' },
    { name: 'In Progress', value: s.inProgressCount || 0, color: '#6366f1' },
    { name: 'Resolved',    value: s.resolvedCount   || 0, color: '#22c55e' },
    { name: 'Rejected',    value: s.rejectedCount   || 0, color: '#ef4444' },
  ];

  return (
    <div className="page-wrapper">
      <div className="container section">
        <div className="page-header fade-in">
          <h2>Analytics Dashboard</h2>
          <p>Visual breakdown of complaint trends and resolution performance</p>
        </div>

        {/* Summary Cards */}
        <div className="grid-4 fade-in" style={{ marginBottom: '2rem' }}>
          {[
            { label: 'Total',     value: s.totalComplaints || 0, icon: '📋', cls: 'stat-icon-primary' },
            { label: 'Pending',   value: s.pendingCount    || 0, icon: '⏳', cls: 'stat-icon-warning' },
            { label: 'Resolved',  value: s.resolvedCount   || 0, icon: '✅', cls: 'stat-icon-success' },
            { label: 'Citizens',  value: s.totalUsers      || 0, icon: '👥', cls: 'stat-icon-cyan' },
          ].map(st => (
            <div key={st.label} className="stat-card">
              <div className={`stat-icon ${st.cls}`}>{st.icon}</div>
              <div><div className="stat-value">{st.value}</div><div className="stat-label">{st.label}</div></div>
            </div>
          ))}
        </div>

        {/* Row 1: Category Bar + Status Pie */}
        <div className="analytics-grid fade-in">
          <div className="card">
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '1.25rem' }}>Complaints by Category</h4>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data?.byCategory?.map(c => ({ name: c._id, count: c.count }))} margin={{ top: 0, right: 10, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} angle={-35} textAnchor="end" />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="count" radius={[6,6,0,0]}>
                  {data?.byCategory?.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '1.25rem' }}>Status Distribution</h4>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                  {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip {...TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Row 2: Trend Line */}
        <div className="card fade-in" style={{ marginTop: '1.5rem' }}>
          <h4 style={{ color: 'var(--text-primary)', marginBottom: '1.25rem' }}>30-Day Complaint Trend</h4>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data?.resolutionTrend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gResolved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="_id" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ color: '#94a3b8' }} />
              <Area type="monotone" dataKey="total"    stroke="#6366f1" fill="url(#gTotal)"   strokeWidth={2} name="Total" />
              <Area type="monotone" dataKey="resolved" stroke="#22c55e" fill="url(#gResolved)" strokeWidth={2} name="Resolved" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Row 3: Priority Pie */}
        <div className="card fade-in" style={{ marginTop: '1.5rem' }}>
          <h4 style={{ color: 'var(--text-primary)', marginBottom: '1.25rem' }}>Priority Breakdown</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data?.byPriority?.map(p => ({ name: p._id, count: p.count }))} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" tick={{ fill: '#64748b' }} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 13 }} width={80} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="count" radius={[0,6,6,0]}>
                {data?.byPriority?.map((p, i) => {
                  const c = { Critical:'#ef4444', High:'#f97316', Medium:'#f59e0b', Low:'#22c55e' };
                  return <Cell key={i} fill={c[p._id] || '#6366f1'} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
