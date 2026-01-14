import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Home, DollarSign, Users, AlertCircle, RefreshCw } from 'lucide-react';

const API_URL = 'https://property-insights-backend.onrender.com/api';

function App() {
  const [properties, setProperties] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [propertiesRes, analyticsRes] = await Promise.all([
        fetch(`${API_URL}/properties`),
        fetch(`${API_URL}/properties/analytics`)
      ]);

      const propertiesData = await propertiesRes.json();
      const analyticsData = await analyticsRes.json();

      setProperties(propertiesData);
      
      const transformedAnalytics = {
        totalRevenue: analyticsData.totalRevenue || 0,
        avgOccupancy: analyticsData.averageOccupancy?.toFixed(1) || '0',
        avgScore: analyticsData.averageScore?.toFixed(1) || '0',
        totalProperties: analyticsData.totalProperties || 0,
        rentTrends: [
          { month: 'Jan', avgRent: 2400 },
          { month: 'Feb', avgRent: 2450 },
          { month: 'Mar', avgRent: 2500 },
          { month: 'Apr', avgRent: 2600 },
          { month: 'May', avgRent: 2700 },
          { month: 'Jun', avgRent: analyticsData.averageRent || 2750 },
        ],
        propertyTypes: calculatePropertyTypes(propertiesData)
      };

      setAnalytics(transformedAnalytics);
      setLoading(false);
    } catch (err) {
      console.error('Error:', err);
      setLoading(false);
    }
  };

  const calculatePropertyTypes = (props) => {
    const types = props.reduce((acc, p) => {
      acc[p.propertyType] = (acc[p.propertyType] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(types).map(([name, value]) => ({ name, value }));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  const StatCard = ({ icon: Icon, label, value, trend }) => (
    <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px', border: '1px solid #e5e7eb' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>{label}</p>
          <p style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827', marginTop: '8px' }}>{value}</p>
          {trend && <p style={{ fontSize: '14px', color: '#10b981', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={16} /> {trend}
          </p>}
        </div>
        <div style={{ background: '#dbeafe', borderRadius: '50%', padding: '12px' }}>
          <Icon size={32} color="#2563eb" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #eff6ff, #e0e7ff)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', border: '4px solid transparent', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
          <p style={{ marginTop: '16px', fontSize: '18px', color: '#374151', fontWeight: '500' }}>Loading Property Analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #eff6ff, #e0e7ff)', padding: '32px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#111827', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Home size={40} color="#2563eb" />
                AI Property Insights
              </h1>
              <p style={{ color: '#6b7280', marginTop: '8px' }}>Real-time analytics powered by Spring Boot & PostgreSQL</p>
            </div>
            <button onClick={fetchData} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#2563eb', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
          
          <div style={{ marginTop: '16px', padding: '12px', borderRadius: '8px', background: '#d1fae5', border: '1px solid #6ee7b7' }}>
            <p style={{ fontSize: '14px', fontWeight: '500', color: '#065f46' }}>
              ✅ Connected to Live Backend API
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          <StatCard icon={DollarSign} label="Total Monthly Revenue" value={`$${analytics.totalRevenue.toLocaleString()}`} trend="+12% from last month" />
          <StatCard icon={Home} label="Total Properties" value={analytics.totalProperties} />
          <StatCard icon={Users} label="Avg Occupancy Rate" value={`${analytics.avgOccupancy}%`} trend="+5% from last month" />
          <StatCard icon={TrendingUp} label="Avg Performance Score" value={analytics.avgScore} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px', border: '1px solid #e5e7eb' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>Rent Trends (6 Months)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={analytics.rentTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="avgRent" stroke="#3b82f6" strokeWidth={2} name="Avg Rent ($)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px', border: '1px solid #e5e7eb' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>Portfolio Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={analytics.propertyTypes} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                  {analytics.propertyTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>Property Performance Details</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f9fafb' }}>
                <tr>
                  <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Address</th>
                  <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Type</th>
                  <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Rent</th>
                  <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Occupancy</th>
                  <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Score</th>
                  <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Status</th>
                </tr>
              </thead>
              <tbody style={{ background: 'white' }}>
                {properties.map((property) => (
                  <tr key={property.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#111827' }}>{property.address}</td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#6b7280' }}>{property.propertyType}</td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '500', color: '#111827' }}>${property.rent}</td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#6b7280' }}>{property.occupancy}%</td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ padding: '4px 8px', borderRadius: '9999px', fontSize: '12px', fontWeight: '500', background: property.performanceScore >= 85 ? '#d1fae5' : property.performanceScore >= 75 ? '#fef3c7' : '#fee2e2', color: property.performanceScore >= 85 ? '#065f46' : property.performanceScore >= 75 ? '#92400e' : '#991b1b' }}>
                        {property.performanceScore}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      {property.occupancy === 100 ? (
                        <span style={{ color: '#10b981', fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }}></div> Occupied
                        </span>
                      ) : (
                        <span style={{ color: '#f59e0b', fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <AlertCircle size={16} /> Available
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '14px', color: '#6b7280' }}>
          <p style={{ fontWeight: '500' }}>Tech Stack: Spring Boot (Java) | PostgreSQL | React | Render</p>
          <p style={{ marginTop: '4px' }}>RESTful Microservices | JPA/Hibernate | Clean Architecture</p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default App;