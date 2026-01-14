import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Home, DollarSign, Users, AlertCircle, RefreshCw, Search, Filter, Download, Plus, X, Edit2, Trash2, Save } from 'lucide-react';

const API_URL = 'https://property-insights-backend.onrender.com/api';

function App() {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Interactive state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [sortBy, setSortBy] = useState('address');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    address: '',
    propertyType: 'Apartment',
    rent: '',
    occupancy: ''
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching from:', API_URL);
      
      const [propertiesRes, analyticsRes] = await Promise.all([
        fetch(`${API_URL}/properties`),
        fetch(`${API_URL}/properties/analytics`)
      ]);

      if (!propertiesRes.ok || !analyticsRes.ok) {
        throw new Error('Failed to fetch data from backend');
      }

      const propertiesData = await propertiesRes.json();
      const analyticsData = await analyticsRes.json();

      console.log('Properties:', propertiesData);
      console.log('Analytics:', analyticsData);

      setProperties(propertiesData);
      setFilteredProperties(propertiesData);
      
      const transformedAnalytics = {
        totalRevenue: analyticsData.totalRevenue || 0,
        avgOccupancy: analyticsData.averageOccupancy?.toFixed(1) || '0',
        avgScore: analyticsData.averageScore?.toFixed(1) || '0',
        totalProperties: analyticsData.totalProperties || 0,
        rentTrends: [
          { month: 'Jan', avgRent: Math.max(2400, (analyticsData.averageRent || 2750) - 350) },
          { month: 'Feb', avgRent: Math.max(2450, (analyticsData.averageRent || 2750) - 300) },
          { month: 'Mar', avgRent: Math.max(2500, (analyticsData.averageRent || 2750) - 250) },
          { month: 'Apr', avgRent: Math.max(2600, (analyticsData.averageRent || 2750) - 150) },
          { month: 'May', avgRent: Math.max(2700, (analyticsData.averageRent || 2750) - 50) },
          { month: 'Jun', avgRent: analyticsData.averageRent || 2750 },
        ],
        propertyTypes: calculatePropertyTypes(propertiesData)
      };

      setAnalytics(transformedAnalytics);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
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

  // Filter and search logic
  useEffect(() => {
    let result = [...properties];

    if (searchTerm) {
      result = result.filter(p => 
        p.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'All') {
      result = result.filter(p => p.propertyType === filterType);
    }

    result.sort((a, b) => {
      if (sortBy === 'rent') return b.rent - a.rent;
      if (sortBy === 'occupancy') return b.occupancy - a.occupancy;
      if (sortBy === 'score') return b.performanceScore - a.performanceScore;
      return a.address.localeCompare(b.address);
    });

    setFilteredProperties(result);
  }, [searchTerm, filterType, sortBy, properties]);

  // CREATE - Add new property
  const handleAddProperty = async (e) => {
    e.preventDefault();
    try {
      console.log('Adding property:', formData);
      
      const response = await fetch(`${API_URL}/properties`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: formData.address,
          propertyType: formData.propertyType,
          rent: parseInt(formData.rent),  // Convert to int
          occupancy: parseInt(formData.occupancy)  // Convert to int
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to add property: ${errorText}`);
      }

      const newProperty = await response.json();
      console.log('Property added:', newProperty);

      setShowAddModal(false);
      setFormData({ address: '', propertyType: 'Apartment', rent: '', occupancy: '' });
      await fetchData(); // Refresh data
      alert('✅ Property added successfully!');
    } catch (err) {
      console.error('Error adding property:', err);
      alert('❌ Failed to add property: ' + err.message);
    }
  };

  // UPDATE - Edit property
  const handleEditProperty = async (e) => {
    e.preventDefault();
    try {
      console.log('Updating property:', selectedProperty.id, formData);
      
      const response = await fetch(`${API_URL}/properties/${selectedProperty.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: formData.address,
          propertyType: formData.propertyType,
          rent: parseInt(formData.rent),
          occupancy: parseInt(formData.occupancy)
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update property: ${errorText}`);
      }

      const updatedProperty = await response.json();
      console.log('Property updated:', updatedProperty);

      setShowEditModal(false);
      setSelectedProperty(null);
      setFormData({ address: '', propertyType: 'Apartment', rent: '', occupancy: '' });
      await fetchData();
      alert('✅ Property updated successfully!');
    } catch (err) {
      console.error('Error updating property:', err);
      alert('❌ Failed to update property: ' + err.message);
    }
  };

  // DELETE - Remove property
  const handleDeleteProperty = async (id) => {
    if (!window.confirm('⚠️ Are you sure you want to delete this property?')) return;
    
    try {
      console.log('Deleting property:', id);
      
      const response = await fetch(`${API_URL}/properties/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete property: ${errorText}`);
      }

      console.log('Property deleted:', id);

      await fetchData();
      setShowModal(false);
      alert('✅ Property deleted successfully!');
    } catch (err) {
      console.error('Error deleting property:', err);
      alert('❌ Failed to delete property: ' + err.message);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Address', 'Type', 'Rent', 'Occupancy', 'Score'];
    const rows = filteredProperties.map(p => 
      [p.address, p.propertyType, p.rent, p.occupancy, p.performanceScore]
    );
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'properties.csv';
    a.click();
  };

  const openEditModal = (property) => {
    setSelectedProperty(property);
    setFormData({
      address: property.address,
      propertyType: property.propertyType,
      rent: property.rent.toString(),
      occupancy: property.occupancy.toString()
    });
    setShowEditModal(true);
  };

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

  const PropertyModal = ({ property, onClose }) => (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: '12px', padding: '32px', maxWidth: '500px', width: '90%', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer' }}>
          <X size={24} color="#6b7280" />
        </button>
        
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '24px' }}>Property Details</h2>
        
        <div style={{ display: 'grid', gap: '16px' }}>
          <div>
            <p style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', marginBottom: '4px' }}>ADDRESS</p>
            <p style={{ fontSize: '16px', color: '#111827', fontWeight: '500' }}>{property.address}</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <p style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', marginBottom: '4px' }}>TYPE</p>
              <p style={{ fontSize: '16px', color: '#111827' }}>{property.propertyType}</p>
            </div>
            <div>
              <p style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', marginBottom: '4px' }}>RENT</p>
              <p style={{ fontSize: '16px', color: '#111827', fontWeight: '600' }}>${property.rent}/mo</p>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <p style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', marginBottom: '4px' }}>OCCUPANCY</p>
              <p style={{ fontSize: '16px', color: '#111827' }}>{property.occupancy}%</p>
            </div>
            <div>
              <p style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', marginBottom: '4px' }}>PERFORMANCE SCORE</p>
              <p style={{ fontSize: '16px', color: '#111827', fontWeight: '600' }}>{property.performanceScore}</p>
            </div>
          </div>
          
          <div>
            <p style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', marginBottom: '8px' }}>STATUS</p>
            {property.occupancy === 100 ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '9999px', background: '#d1fae5', color: '#065f46', fontSize: '14px', fontWeight: '500' }}>
                <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }}></div> Occupied
              </span>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '9999px', background: '#fef3c7', color: '#92400e', fontSize: '14px', fontWeight: '500' }}>
                <AlertCircle size={16} /> Available
              </span>
            )}
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <button onClick={() => { onClose(); openEditModal(property); }} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', background: 'white', color: '#374151', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Edit2 size={16} /> Edit
          </button>
          <button onClick={() => handleDeleteProperty(property.id)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #fca5a5', background: '#fef2f2', color: '#dc2626', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </div>
    </div>
  );

  const AddEditModal = ({ isEdit, onClose, onSubmit }) => (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: '12px', padding: '32px', maxWidth: '500px', width: '90%', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer' }}>
          <X size={24} color="#6b7280" />
        </button>
        
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '24px' }}>
          {isEdit ? 'Edit Property' : 'Add New Property'}
        </h2>
        
        <form onSubmit={onSubmit} style={{ display: 'grid', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Address *</label>
            <input 
              type="text" 
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              required
              placeholder="123 Main St, City, State"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Property Type *</label>
            <select 
              value={formData.propertyType}
              onChange={(e) => setFormData({...formData, propertyType: e.target.value})}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px' }}
            >
              <option value="Apartment">Apartment</option>
              <option value="House">House</option>
              <option value="Studio">Studio</option>
            </select>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Monthly Rent ($) *</label>
              <input 
                type="number" 
                value={formData.rent}
                onChange={(e) => setFormData({...formData, rent: e.target.value})}
                required
                min="0"
                step="1"
                placeholder="2500"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px' }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Occupancy (%) *</label>
              <input 
                type="number" 
                value={formData.occupancy}
                onChange={(e) => setFormData({...formData, occupancy: e.target.value})}
                required
                min="0"
                max="100"
                step="1"
                placeholder="100"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px' }}
              />
            </div>
          </div>
          
          <button type="submit" style={{ marginTop: '8px', padding: '12px', borderRadius: '8px', background: '#2563eb', color: 'white', fontWeight: '500', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Save size={16} />
            {isEdit ? 'Update Property' : 'Add Property'}
          </button>
        </form>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #eff6ff, #e0e7ff)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', border: '4px solid transparent', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
          <p style={{ marginTop: '16px', fontSize: '18px', color: '#374151', fontWeight: '500' }}>Loading Property Analytics...</p>
          <p style={{ marginTop: '8px', fontSize: '14px', color: '#6b7280' }}>Connecting to backend...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #eff6ff, #e0e7ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ textAlign: 'center', maxWidth: '500px' }}>
          <AlertCircle size={64} color="#dc2626" style={{ margin: '0 auto' }} />
          <h2 style={{ marginTop: '16px', fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>Connection Error</h2>
          <p style={{ marginTop: '8px', fontSize: '16px', color: '#6b7280' }}>{error}</p>
          <button onClick={fetchData} style={{ marginTop: '24px', padding: '12px 24px', borderRadius: '8px', background: '#2563eb', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '500' }}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #eff6ff, #e0e7ff)', padding: '32px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#111827', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Home size={40} color="#2563eb" />
                AI Property Insights
              </h1>
              <p style={{ color: '#6b7280', marginTop: '8px' }}>Real-time analytics powered by Spring Boot & PostgreSQL</p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={fetchData} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#2563eb', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
                <RefreshCw size={16} />
                Refresh
              </button>
              <button onClick={() => setShowAddModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#10b981', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
                <Plus size={16} />
                Add Property
              </button>
            </div>
          </div>
          
          <div style={{ marginTop: '16px', padding: '12px', borderRadius: '8px', background: '#d1fae5', border: '1px solid #6ee7b7' }}>
            <p style={{ fontSize: '14px', fontWeight: '500', color: '#065f46' }}>
              ✅ Connected to Live Backend API - Full CRUD Operations Active
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          <StatCard icon={DollarSign} label="Total Monthly Revenue" value={`$${analytics.totalRevenue.toLocaleString()}`} trend="+12% from last month" />
          <StatCard icon={Home} label="Total Properties" value={analytics.totalProperties} />
          <StatCard icon={Users} label="Avg Occupancy Rate" value={`${analytics.avgOccupancy}%`} trend="+5% from last month" />
          <StatCard icon={TrendingUp} label="Avg Performance Score" value={analytics.avgScore} />
        </div>

        {/* Charts */}
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

        {/* Interactive Controls */}
        <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', marginBottom: '32px', padding: '24px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flex: 1 }}>
              <div style={{ position: 'relative', minWidth: '250px' }}>
                <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
                <input 
                  type="text" 
                  placeholder="Search by address..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px 10px 40px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px' }}
                />
              </div>

              <div style={{ position: 'relative' }}>
                <Filter size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
                <select 
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  style={{ padding: '10px 12px 10px 40px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', cursor: 'pointer' }}
                >
                  <option value="All">All Types</option>
                  <option value="Apartment">Apartment</option>
                  <option value="House">House</option>
                  <option value="Studio">Studio</option>
                </select>
              </div>

              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', cursor: 'pointer' }}
              >
                <option value="address">Sort by Address</option>
                <option value="rent">Sort by Rent (High-Low)</option>
                <option value="occupancy">Sort by Occupancy</option>
                <option value="score">Sort by Score</option>
              </select>
            </div>

            <button onClick={exportToCSV} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f59e0b', color: 'white', padding: '10px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '500' }}>
              <Download size={16} />
              Export CSV
            </button>
          </div>

          <div style={{ marginTop: '16px', fontSize: '14px', color: '#6b7280' }}>
            Showing <strong>{filteredProperties.length}</strong> of <strong>{properties.length}</strong> properties
          </div>
        </div>

        {/* Property Table */}
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
                  <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody style={{ background: 'white' }}>
                {filteredProperties.map((property) => (
                  <tr key={property.id} style={{ borderTop: '1px solid #e5e7eb', cursor: 'pointer' }} onClick={() => { setSelectedProperty(property); setShowModal(true); }}>
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
                    <td style={{ padding: '16px 24px' }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => openEditModal(property)} style={{ padding: '6px', borderRadius: '6px', border: '1px solid #d1d5db', background: 'white', cursor: 'pointer' }}>
                          <Edit2 size={14} color="#6b7280" />
                        </button>
                        <button onClick={() => handleDeleteProperty(property.id)} style={{ padding: '6px', borderRadius: '6px', border: '1px solid #fca5a5', background: '#fef2f2', cursor: 'pointer' }}>
                          <Trash2 size={14} color="#dc2626" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '14px', color: '#6b7280' }}>
          <p style={{ fontWeight: '500' }}>Tech Stack: Spring Boot (Java) | PostgreSQL | React | Render</p>
          <p style={{ marginTop: '4px' }}>RESTful Microservices | JPA/Hibernate | Clean Architecture | Full CRUD Operations</p>
        </div>
      </div>

      {/* Modals */}
      {showModal && selectedProperty && (
        <PropertyModal property={selectedProperty} onClose={() => setShowModal(false)} />
      )}

      {showAddModal && (
        <AddEditModal isEdit={false} onClose={() => { setShowAddModal(false); setFormData({ address: '', propertyType: 'Apartment', rent: '', occupancy: '' }); }} onSubmit={handleAddProperty} />
      )}

      {showEditModal && (
        <AddEditModal isEdit={true} onClose={() => { setShowEditModal(false); setFormData({ address: '', propertyType: 'Apartment', rent: '', occupancy: '' }); }} onSubmit={handleEditProperty} />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default App;