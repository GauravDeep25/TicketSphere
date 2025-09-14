import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Filter, Calendar, MapPin, Loader, AlertCircle } from 'lucide-react';
import { eventAPI, handleAPIError } from '../api/index.js';
import { useAuth } from '../context/AuthContext';
import TicketSelectionModal from '../components/TicketSelectionModal';
import './EventsPage.css';

const EventCard = ({ event, onBookNow }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatPrice = (ticketTypes) => {
    if (!ticketTypes || ticketTypes.length === 0) return 'Price on request';
    const minPrice = Math.min(...ticketTypes.map(t => t.price));
    return `₹${minPrice} onwards`;
  };

  return (
    <div className="event-card">
      <div className="event-card-image">
        <div className="event-category-badge">
          {event.category.toUpperCase()}
        </div>
        {event.imageUrl && (
          <img 
            src={event.imageUrl} 
            alt={event.title} 
            className="event-image"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        )}
      </div>
      <div className="event-card-details">
        <h3 className="event-name">{event.title}</h3>
        <div className="event-meta">
          <Calendar size={14} />
          <span>{formatDate(event.date)}</span>
        </div>
        <div className="event-location">
          <MapPin size={14} />
          <span>{event.venue}, {event.location}</span>
        </div>
        <div className="event-price">
          {formatPrice(event.ticketTypes)}
        </div>
        <button 
          className="event-book-button"
          onClick={() => onBookNow(event)}
        >
          Book Now
        </button>
      </div>
    </div>
  );
};

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Payment flow state
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showTicketSelection, setShowTicketSelection] = useState(false);
  
  // Available categories
  const categories = ['Concert', 'Sports', 'Comedy', 'Festival', 'Movie', 'Other'];
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get category from URL parameters on component mount
  useEffect(() => {
    const categoryFromURL = searchParams.get('category');
    if (categoryFromURL) {
      setSelectedCategory(categoryFromURL);
    }
  }, [searchParams]);

  // Fetch events from API
  useEffect(() => {
    fetchEvents({ category: selectedCategory });
  }, [selectedCategory]);

  // Fetch events from API with optional filters
  const fetchEvents = async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters for backend filtering
      const params = {};
      if (filters.category && filters.category !== '') {
        params.category = filters.category;
      }
      if (filters.search && filters.search !== '') {
        params.search = filters.search;
      }
      
      const response = await eventAPI.getEvents(params);
      // API returns tickets in 'events' field for frontend compatibility
      const eventsData = response.data.events || response.data.tickets || [];
      setEvents(eventsData);
    } catch (err) {
      console.error('Events API Error:', err);
      const errorMessage = handleAPIError(err);
      
      // Check if it's a timeout error specifically
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setError('Connection timeout - The database might be temporarily unavailable. Showing sample events below.');
      } else {
        setError(errorMessage);
      }
      
      // Always show fallback mock data when API fails
      const mockEvents = [
        {
          _id: 'mock1',
          title: 'Cricket Match: India vs Australia',
          category: 'Sports',
          date: '2025-11-14T18:00:00Z',
          venue: 'Wankhede Stadium',
          location: 'Mumbai',
          ticketTypes: [{ type: 'General', price: 500 }, { type: 'VIP', price: 1500 }],
          imageUrl: null
        },
        {
          _id: 'mock2',
          title: 'Arijit Singh Live Concert',
          category: 'Concert',
          date: '2025-10-12T19:00:00Z',
          venue: 'JLN Stadium',
          location: 'Delhi',
          ticketTypes: [{ type: 'Silver', price: 1500 }, { type: 'Gold', price: 2500 }],
          imageUrl: null
        },
        {
          _id: 'mock3',
          title: 'Stand-up Comedy Night',
          category: 'Comedy',
          date: '2025-12-05T20:00:00Z',
          venue: 'Phoenix MarketCity',
          location: 'Bangalore',
          ticketTypes: [{ type: 'Regular', price: 800 }],
          imageUrl: null
        },
        {
          _id: 'mock4',
          title: 'Sunburn Festival 2025',
          category: 'Festival',
          date: '2025-12-28T15:00:00Z',
          venue: 'Vagator Beach',
          location: 'Goa',
          ticketTypes: [{ type: 'Early Bird', price: 3500 }, { type: 'Premium', price: 5000 }],
          imageUrl: null
        }
      ];
      setEvents(mockEvents);
    } finally {
      setLoading(false);
    }
  };

  // Filter events based on search term and category
  useEffect(() => {
    let filtered = events;

    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.venue.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(event =>
        event.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    setFilteredEvents(filtered);
  }, [events, searchTerm, selectedCategory]);

  // Handle book now button click
  const handleBookNow = (event) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // Check if email is verified
    if (!currentUser.emailVerified) {
      alert('Please verify your email address before booking tickets. Check your inbox (and spam folder) for the verification email, then reload this page.');
      return;
    }

    setSelectedEvent(event);
    setShowTicketSelection(true);
  };

  // Handle ticket selection from modal
  const handleTicketSelect = (ticketType) => {
    // Navigate to payment page with event and ticket type information
    const paymentUrl = `/payment/${selectedEvent._id}?ticketType=${encodeURIComponent(ticketType._id || ticketType.type)}&eventTicket=true`;
    navigate(paymentUrl, {
      state: {
        event: selectedEvent,
        ticketType: ticketType,
        isEventTicket: true
      }
    });
  };

  // Handle ticket selection modal close
  const handleTicketSelectionClose = () => {
    setShowTicketSelection(false);
    setSelectedEvent(null);
  };

  return (
    <div className="events-page">
      <div className="container">
        {/* Header */}
        <header className="events-header">
          <h1>Discover Amazing Events</h1>
          <p>Find and book tickets for the best events in your city</p>
        </header>

        {/* Search and Filters */}
        <div className="events-controls">
          <div className="search-container">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search events, venues, or cities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-container">
            <Filter size={20} className="filter-icon" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="filter-select"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="results-info">
          <p>{filteredEvents.length} event(s) found</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-container">
            <Loader className="loading-spinner" />
            <p>Loading events...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="error-container">
            <AlertCircle className="error-icon" />
            <p>{error}</p>
            <button onClick={fetchEvents} className="retry-button">
              Try Again
            </button>
          </div>
        )}

        {/* Events Grid */}
        {!loading && !error && (
          <div className="events-grid">
            {filteredEvents.length > 0 ? (
              filteredEvents.map(event => (
                <EventCard 
                  key={event._id || event.id} 
                  event={event} 
                  onBookNow={handleBookNow}
                />
              ))
            ) : (
              <div className="no-events">
                <p>No events found matching your criteria.</p>
                <button onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                }} className="clear-filters-button">
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Ticket Selection Modal */}
      {showTicketSelection && selectedEvent && (
        <TicketSelectionModal
          event={selectedEvent}
          onClose={handleTicketSelectionClose}
          onSelectTicket={handleTicketSelect}
        />
      )}
    </div>
  );
};

export default EventsPage;
