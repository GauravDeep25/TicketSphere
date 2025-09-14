import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign,
  Eye,
  AlertTriangle 
} from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [pendingEvents, setPendingEvents] = useState([]);
  const [approvedEvents, setApprovedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [stats, setStats] = useState({
    totalEvents: 0,
    pendingCount: 0,
    approvedCount: 0,
    totalRevenue: 0
  });

  // Check if user is admin (gauravdeepgd12007@gmail.com)
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (currentUser?.email !== 'gauravdeepgd12007@gmail.com') {
      navigate('/');
      return;
    }
  }, [isAuthenticated, currentUser, navigate]);

  // Fetch events and stats
  useEffect(() => {
    if (currentUser?.email === 'gauravdeepgd12007@gmail.com') {
      fetchAdminData();
    }
  }, [currentUser]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(''); // Clear any previous errors
      
      const token = await currentUser.getIdToken();
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      
      console.log('Fetching admin data from:', baseURL);
      
      // Fetch pending events
      const pendingResponse = await fetch(`${baseURL}/admin/events/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Pending events response status:', pendingResponse.status);
      
      // Fetch approved events
      const approvedResponse = await fetch(`${baseURL}/admin/events/approved`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Approved events response status:', approvedResponse.status);
      
      // Fetch stats
      const statsResponse = await fetch(`${baseURL}/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Stats response status:', statsResponse.status);

      if (pendingResponse.ok && approvedResponse.ok && statsResponse.ok) {
        const pendingData = await pendingResponse.json();
        const approvedData = await approvedResponse.json();
        const statsData = await statsResponse.json();
        
        console.log('Pending data:', pendingData);
        console.log('Approved data:', approvedData);
        console.log('Stats data:', statsData);
        
        setPendingEvents(pendingData.events || []);
        setApprovedEvents(approvedData.events || []);
        setStats(statsData.stats || stats);
      } else {
        // Handle specific error responses
        if (!pendingResponse.ok) {
          const errorData = await pendingResponse.json();
          console.error('Pending events error:', errorData);
        }
        if (!approvedResponse.ok) {
          const errorData = await approvedResponse.json();
          console.error('Approved events error:', errorData);
        }
        if (!statsResponse.ok) {
          const errorData = await statsResponse.json();
          console.error('Stats error:', errorData);
        }
        
        setError('Failed to fetch admin data. Please check server connection.');
      }
    } catch (err) {
      console.error('Admin data fetch error:', err);
      setError('Error fetching admin data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveEvent = async (eventId) => {
    try {
      setActionLoading(eventId);
      const token = await currentUser.getIdToken();
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/admin/events/${eventId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchAdminData(); // Refresh data
      } else {
        setError('Failed to approve event');
      }
    } catch (err) {
      setError('Error approving event: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectEvent = async (eventId) => {
    try {
      setActionLoading(eventId);
      const token = await currentUser.getIdToken();
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/admin/events/${eventId}/reject`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchAdminData(); // Refresh data
      } else {
        setError('Failed to reject event');
      }
    } catch (err) {
      setError('Error rejecting event: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateEventRevenue = (ticketTypes) => {
    return ticketTypes.reduce((total, ticket) => total + (ticket.price * ticket.sold), 0);
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-container">
        {/* Header */}
        <div className="admin-header">
          <div className="header-content">
            <div className="header-text">
              <h1 className="admin-title">
                <Shield className="header-icon" />
                Admin Dashboard
              </h1>
              <p className="admin-subtitle">Manage events and monitor platform activity</p>
            </div>
            <div className="admin-badge">
              <span>Admin: {currentUser?.email}</span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <AlertTriangle size={20} />
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon total">
              <Calendar size={24} />
            </div>
            <div className="stat-content">
              <h3>{stats.totalEvents}</h3>
              <p>Total Events</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon pending">
              <Clock size={24} />
            </div>
            <div className="stat-content">
              <h3>{stats.pendingCount}</h3>
              <p>Pending Approval</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon approved">
              <CheckCircle size={24} />
            </div>
            <div className="stat-content">
              <h3>{stats.approvedCount}</h3>
              <p>Approved Events</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon revenue">
              <DollarSign size={24} />
            </div>
            <div className="stat-content">
              <h3>₹{stats.totalRevenue.toLocaleString()}</h3>
              <p>Total Revenue</p>
            </div>
          </div>
        </div>

        {/* Pending Events Section */}
        <div className="admin-section">
          <h2 className="section-title">
            <Clock size={20} />
            Pending Events ({pendingEvents.length})
          </h2>
          
          {pendingEvents.length === 0 ? (
            <div className="empty-state">
              <CheckCircle size={48} />
              <h3>No pending events</h3>
              <p>All events have been reviewed</p>
            </div>
          ) : (
            <div className="events-table">
              <table>
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Date & Venue</th>
                    <th>Seller</th>
                    <th>Tickets</th>
                    <th>Revenue Potential</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingEvents.map((event) => (
                    <tr key={event._id}>
                      <td>
                        <div className="event-info">
                          <h4>{event.title}</h4>
                          <span className="event-category">{event.category}</span>
                        </div>
                      </td>
                      <td>
                        <div className="event-details">
                          <div className="event-date">
                            <Calendar size={16} />
                            {formatDate(event.date)}
                          </div>
                          <div className="event-location">
                            <MapPin size={16} />
                            {event.venue}, {event.location}
                          </div>
                        </div>
                      </td>
                      <td>{event.seller}</td>
                      <td>
                        <div className="ticket-summary">
                          {event.ticketTypes.map((ticket, idx) => (
                            <div key={idx} className="ticket-type">
                              {ticket.type}: {ticket.quantity} @ ₹{ticket.price}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span className="revenue-amount">
                          ₹{event.ticketTypes.reduce((total, ticket) => 
                            total + (ticket.price * ticket.quantity), 0
                          ).toLocaleString()}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => handleApproveEvent(event._id)}
                            disabled={actionLoading === event._id}
                            className="btn btn-approve"
                          >
                            <CheckCircle size={16} />
                            {actionLoading === event._id ? 'Approving...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleRejectEvent(event._id)}
                            disabled={actionLoading === event._id}
                            className="btn btn-reject"
                          >
                            <XCircle size={16} />
                            {actionLoading === event._id ? 'Rejecting...' : 'Reject'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Approved Events Section */}
        <div className="admin-section">
          <h2 className="section-title">
            <CheckCircle size={20} />
            Recent Approved Events ({approvedEvents.length})
          </h2>
          
          {approvedEvents.length === 0 ? (
            <div className="empty-state">
              <Calendar size={48} />
              <h3>No approved events</h3>
              <p>Approved events will appear here</p>
            </div>
          ) : (
            <div className="events-table">
              <table>
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Date & Venue</th>
                    <th>Sales Progress</th>
                    <th>Revenue</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedEvents.slice(0, 10).map((event) => {
                    const totalTickets = event.ticketTypes.reduce((sum, t) => sum + t.quantity, 0);
                    const soldTickets = event.ticketTypes.reduce((sum, t) => sum + t.sold, 0);
                    const salesPercentage = totalTickets > 0 ? (soldTickets / totalTickets) * 100 : 0;
                    const revenue = calculateEventRevenue(event.ticketTypes);
                    
                    return (
                      <tr key={event._id}>
                        <td>
                          <div className="event-info">
                            <h4>{event.title}</h4>
                            <span className="event-category">{event.category}</span>
                          </div>
                        </td>
                        <td>
                          <div className="event-details">
                            <div className="event-date">
                              <Calendar size={16} />
                              {formatDate(event.date)}
                            </div>
                            <div className="event-location">
                              <MapPin size={16} />
                              {event.venue}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="sales-progress">
                            <div className="progress-bar">
                              <div 
                                className="progress-fill" 
                                style={{ width: `${salesPercentage}%` }}
                              ></div>
                            </div>
                            <span className="progress-text">
                              {soldTickets}/{totalTickets} ({Math.round(salesPercentage)}%)
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="revenue-amount">₹{revenue.toLocaleString()}</span>
                        </td>
                        <td>
                          <span className={`status-badge ${salesPercentage === 100 ? 'sold-out' : 'active'}`}>
                            {salesPercentage === 100 ? 'Sold Out' : 'Active'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
