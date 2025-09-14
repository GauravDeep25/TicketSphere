import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, MapPin, Loader, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { eventAPI } from '../api/index.js';
import './HomePage.css';

//--- Page-Specific Components defined within HomePage.jsx for simplicity ---

const EmailVerificationBanner = ({ currentUser, onReload }) => {
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const { resendEmailVerification } = useAuth();

  if (!currentUser || currentUser.emailVerified) return null;

  const handleResendVerification = async () => {
    setResending(true);
    setResendMessage('');
    
    try {
      const result = await resendEmailVerification();
      setResendMessage(result.message);
    } catch (error) {
      setResendMessage('Failed to resend verification email. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="email-verification-banner">
      <div className="container">
        <div className="verification-content">
          <AlertCircle size={20} className="verification-icon" />
          <div className="verification-text">
            <p>
              <strong>Please verify your email address</strong> to access all features. 
              Check your inbox (and spam folder) for the verification email.
            </p>
            {resendMessage && (
              <p className="resend-message">{resendMessage}</p>
            )}
          </div>
          <div className="verification-actions">
            <button 
              className="resend-button" 
              onClick={handleResendVerification}
              disabled={resending}
            >
              {resending ? 'Sending...' : 'Resend Email'}
            </button>
            <button 
              className="reload-button" 
              onClick={onReload}
              title="Click after verifying your email"
            >
              <RefreshCw size={16} />
              Reload Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const HeroSection = () => (
    <section className="hero">
        <div className="hero-content">
            <h1 className="hero-title">Experience It Live.</h1>
            <p className="hero-subtitle">The ultimate destination for tickets to India's most exciting events.</p>
            <div className="search-container">
                <div className="search-wrapper">
                    <div className="search-icon"><Search size={24} /></div>
                    <input type="text" placeholder="Search by event, artist, or city" className="search-input" />
                    <button className="search-button">Search</button>
                </div>
            </div>
        </div>
    </section>
);

const EventCard = ({ event }) => {
  const navigate = useNavigate();

  const handleViewTickets = () => {
    // Map categories to match EventsPage filter categories
    const categoryMapping = {
      'Sports': 'Sports',
      'Concert': 'Concert', 
      'Comedy': 'Comedy',
      'Festival': 'Festival',
      'Movie': 'Movie',
      'Other': 'Other'
    };
    
    const mappedCategory = categoryMapping[event.category] || event.category;
    navigate(`/events?category=${mappedCategory}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <div className="event-card">
      <div className={`card-header ${event.category.toLowerCase().replace(' ', '-')}`}>
        <p className="card-category">{event.category?.toUpperCase()}</p>
        <h2 className="card-title">{event.title}</h2>
      </div>
      <div className="card-body">
        <h3 className="card-event-name">{event.title}</h3>
        <div className="card-details">
          <div className="card-detail-item">
            <Calendar size={16} /><span>{formatDate(event.date)}</span>
          </div>
          <div className="card-detail-item">
            <MapPin size={16} /><span>{event.location}</span>
          </div>
        </div>
        <button className="card-button" onClick={handleViewTickets}>View Tickets</button>
      </div>
    </div>
  );
};

const UpcomingEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch events from MongoDB tickets collection
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Starting to fetch events from API...');
      console.log('🌐 API Base URL:', import.meta.env.VITE_API_URL);
      
      // Fetch upcoming events from tickets API (limit to 4 for homepage)
      const axiosResponse = await eventAPI.getEvents({
        limit: 4,
        sort: 'date',
        order: 'asc'
      });

      console.log('📡 Axios Response received:', axiosResponse);
      
      // Extract the actual API response from axios
      const response = axiosResponse.data;
      console.log('📦 API Data:', response);

      if (response.success) {
        console.log('✅ Events loaded successfully:', response.events || response.tickets || []);
        setEvents(response.events || response.tickets || []);
      } else {
        console.error('❌ API returned success: false');
        throw new Error('Failed to fetch events');
      }
    } catch (err) {
      console.error('💥 Error fetching homepage events:', err);
      console.error('💥 Error details:', {
        message: err.message,
        stack: err.stack,
        name: err.name,
        cause: err.cause
      });
      setError('Failed to load events');
      
      // Fallback to mock data for better user experience
      const mockEvents = [
        { 
          _id: 'mock1', 
          title: 'Cricket Match: India vs Australia T20', 
          category: 'Sports', 
          date: '2025-11-14T18:00:00Z', 
          location: 'Wankhede Stadium, Mumbai',
          venue: 'Wankhede Stadium'
        },
        { 
          _id: 'mock2', 
          title: 'Lollapalooza India', 
          category: 'Festival', 
          date: '2025-12-27T16:00:00Z', 
          location: 'Mahalaxmi Race Course, Mumbai',
          venue: 'Mahalaxmi Race Course'
        },
        { 
          _id: 'mock3', 
          title: 'Arijit Singh: One Night Only', 
          category: 'Concert', 
          date: '2025-10-12T19:00:00Z', 
          location: 'JLN Stadium, Delhi',
          venue: 'JLN Stadium'
        },
        { 
          _id: 'mock4', 
          title: 'Zakir Khan Live', 
          category: 'Comedy', 
          date: '2025-09-20T20:00:00Z', 
          location: 'Shanmukhananda Hall, Mumbai',
          venue: 'Shanmukhananda Hall'
        }
      ];
      setEvents(mockEvents);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  if (loading) {
    return (
      <section className="upcoming-events">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Upcoming Events</h2>
            <p className="section-subtitle">Discover what's happening next in your city.</p>
          </div>
          <div className="loading-container">
            <Loader className="loading-spinner" size={32} />
            <p>Loading upcoming events...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="upcoming-events">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Upcoming Events</h2>
          <p className="section-subtitle">Discover what's happening next in your city.</p>
          {error && (
            <div className="error-message">
              <AlertCircle size={16} />
              <span>{error} - Showing sample events</span>
            </div>
          )}
        </div>
        <div className="events-grid">
          {events.length > 0 ? (
            events.map(event => <EventCard key={event._id || event.id} event={event} />)
          ) : (
            <div className="no-events">
              <p>No upcoming events found. Check back later!</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const SellerCTA = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleStartSelling = () => {
        if (isAuthenticated) {
            navigate('/sell');
        } else {
            navigate('/login');
        }
    };

    return (
        <section className="seller-cta">
            <div className="container">
                <div className="cta-content">
                    <div className="cta-text">
                        <h2 className="cta-title">Have Tickets to Sell?</h2>
                        <p className="cta-description">
                            Reach thousands of fans across India. Listing is fast, simple, and free. Turn your extra tickets into cash.
                        </p>
                    </div>
                    <button className="cta-button" onClick={handleStartSelling}>
                        {isAuthenticated ? 'Start Selling Now' : 'Login to Start Selling'}
                    </button>
                </div>
            </div>
        </section>
    );
};

// This is the main component for the Home Page
const HomePage = () => {
    const { currentUser } = useAuth();

    const handleReload = () => {
        window.location.reload();
    };

    return (
        <>
            <EmailVerificationBanner 
                currentUser={currentUser} 
                onReload={handleReload} 
            />
            <HeroSection />
            <UpcomingEvents />
            <SellerCTA />
        </>
    );
};

export default HomePage;

