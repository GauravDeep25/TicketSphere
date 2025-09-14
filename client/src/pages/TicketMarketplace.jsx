import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import PaymentComponent from '../components/PaymentComponent';
import { useAuth } from '../context/AuthContext';

const TicketMarketplace = () => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    ticketType: ''
  });

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    filterTickets();
  }, [tickets, searchTerm, filters]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await API.get('/tickets', {
        params: {
          status: 'live',
          limit: 50
        }
      });

      if (response.data.success) {
        setTickets(response.data.data.tickets || []);
      } else {
        throw new Error('Failed to fetch tickets');
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setError(error.response?.data?.message || 'Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  const filterTickets = () => {
    let filtered = tickets;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(ticket =>
        ticket.event?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.ticketType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.event?.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Price filter
    if (filters.minPrice) {
      filtered = filtered.filter(ticket => ticket.price >= parseFloat(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(ticket => ticket.price <= parseFloat(filters.maxPrice));
    }

    // Ticket type filter
    if (filters.ticketType) {
      filtered = filtered.filter(ticket =>
        ticket.ticketType?.toLowerCase().includes(filters.ticketType.toLowerCase())
      );
    }

    setFilteredTickets(filtered);
  };

  const handleBuyTicket = (ticket) => {
    if (!user) {
      navigate('/login');
      return;
    }

    setSelectedTicket(ticket);
    setShowPayment(true);
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    setSelectedTicket(null);
    navigate('/my-tickets');
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
    setSelectedTicket(null);
  };

  const handlePaymentError = (error) => {
    setShowPayment(false);
    setSelectedTicket(null);
    setError(error);
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      live: 'bg-green-500 text-white',
      pending_approval: 'bg-yellow-500 text-black',
      sold: 'bg-blue-500 text-white'
    };
    
    return statusColors[status] || 'bg-gray-500 text-white';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-400">Loading tickets...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Ticket Marketplace</h1>
          <p className="text-gray-400">Buy tickets from other users</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-400 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search by event, type, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              />
            </div>

            {/* Min Price */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Min Price</label>
              <input
                type="number"
                placeholder="₹ Min"
                value={filters.minPrice}
                onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              />
            </div>

            {/* Max Price */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Max Price</label>
              <input
                type="number"
                placeholder="₹ Max"
                value={filters.maxPrice}
                onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              />
            </div>

            {/* Ticket Type */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Type</label>
              <input
                type="text"
                placeholder="VIP, General..."
                value={filters.ticketType}
                onChange={(e) => setFilters({...filters, ticketType: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg mb-6">
            <p>{error}</p>
          </div>
        )}

        {/* Tickets Grid */}
        {filteredTickets.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <p className="text-gray-400 text-lg">No tickets found</p>
            <p className="text-gray-500 text-sm mt-2">
              {tickets.length === 0 ? 'No tickets are currently available' : 'Try adjusting your filters'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTickets.map(ticket => (
              <div key={ticket._id} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-gray-600 transition-colors">
                {/* Event Image */}
                {ticket.event?.imageUrl && (
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={ticket.event.imageUrl} 
                      alt={ticket.event?.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-6">
                  {/* Event Title */}
                  <h3 className="text-xl font-bold mb-2">{ticket.event?.title || 'Event Title'}</h3>
                  
                  {/* Ticket Type */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-1 bg-blue-600 text-white text-sm rounded-md">
                      {ticket.ticketType}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(ticket.status)}`}>
                      {ticket.status === 'live' ? 'Available' : ticket.status}
                    </span>
                  </div>

                  {/* Event Details */}
                  <div className="space-y-2 mb-4 text-sm text-gray-400">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2h3z" />
                      </svg>
                      {ticket.event?.date ? formatDate(ticket.event.date) : 'Date TBA'}
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {ticket.event?.venue || 'Venue TBA'}, {ticket.event?.location || 'Location TBA'}
                    </div>
                  </div>

                  {/* Price and Buy Button */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-green-400">{formatCurrency(ticket.price)}</span>
                    </div>
                    <button
                      onClick={() => handleBuyTicket(ticket)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Payment Component */}
        {showPayment && selectedTicket && (
          <PaymentComponent
            ticket={selectedTicket}
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
            onError={handlePaymentError}
          />
        )}
      </div>
    </div>
  );
};

export default TicketMarketplace;