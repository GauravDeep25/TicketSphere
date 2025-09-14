import React, { useState, useEffect } from 'react';
import API from '../api';
import './MyTickets.css';

const MyTicketsPage = () => {
    const [listedTickets, setListedTickets] = useState([]);
    const [purchasedTickets, setPurchasedTickets] = useState([]);
    const [activeTab, setActiveTab] = useState('listed');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTicketsData = async () => {
            setLoading(true);
            setError(null);
            
            try {
                // Fetch both listed and purchased tickets using the summary endpoint
                const response = await API.get('/tickets/my/summary');
                
                if (response.data.success) {
                    setListedTickets(response.data.data.listedTickets || []);
                    setPurchasedTickets(response.data.data.purchasedTickets || []);
                } else {
                    throw new Error('Failed to fetch tickets data');
                }
            } catch (error) {
                console.error("Failed to fetch tickets", error);
                setError(error.response?.data?.message || "Failed to fetch tickets");
            } finally {
                setLoading(false);
            }
        };
        
        fetchTicketsData();
    }, []); // Remove dependency on activeTab since we're fetching all data at once
    
    const getStatusClass = (status) => {
        switch (status) {
            case 'live': return 'bg-green-500 text-white';
            case 'pending_approval': return 'bg-yellow-500 text-black';
            case 'rejected': return 'bg-red-500 text-white';
            case 'sold_out': return 'bg-blue-500 text-white';
            case 'inactive': return 'bg-gray-500 text-white';
            default: return 'bg-gray-500 text-white';
        }
    };

    const getTicketStatus = (ticket) => {
        if (!ticket.isActive) return 'inactive';
        if (ticket.isSoldOut) return 'sold_out';
        return 'live';
    };

    const formatStatus = (status) => {
        switch (status) {
            case 'sold_out': return 'Sold Out';
            case 'inactive': return 'Inactive';
            case 'live': return 'Live';
            default: return status.charAt(0).toUpperCase() + status.slice(1);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    return (
        <div className="my-tickets-page">
            <div className="my-tickets-container">
                {/* Header */}
                <div className="page-header">
                    <h1 className="page-title">My Tickets</h1>
                    <p className="page-subtitle">Manage your listed and purchased tickets</p>
                </div>
                
                {/* Tab Navigation */}
                <div className="tab-navigation">
                    <button 
                        onClick={() => setActiveTab('listed')} 
                        className={`tab-button ${activeTab === 'listed' ? 'active' : ''}`}
                    >
                        <svg className="tab-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                        </svg>
                        Selling ({listedTickets.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('purchased')} 
                        className={`tab-button ${activeTab === 'purchased' ? 'active' : ''}`}
                    >
                        <svg className="tab-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        Purchased ({purchasedTickets.length})
                    </button>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <span className="loading-text">Loading your tickets...</span>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="error-container">
                        <div className="error-text">Error loading tickets</div>
                        <div className="error-message">{error}</div>
                    </div>
                )}

                {/* Tab Content */}
                {!loading && !error && (
                    <div className="tab-content">
                        {/* Listed Tickets Tab */}
                        {activeTab === 'listed' && (
                            <div className="tickets-grid">
                                {listedTickets.length === 0 ? (
                                    <div className="empty-state">
                                        <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                        </svg>
                                        <div className="empty-title">No tickets listed yet</div>
                                        <div className="empty-description">Start selling tickets to see them here</div>
                                    </div>
                                ) : (
                                    listedTickets.map(ticket => (
                                        <div key={ticket._id} className="ticket-card">
                                            <div className="ticket-header">
                                                <div className="ticket-info">
                                                    <div className="ticket-image-container">
                                                        {ticket.imageUrl && (
                                                            <img 
                                                                src={ticket.imageUrl} 
                                                                alt={ticket.title}
                                                                className="ticket-image"
                                                            />
                                                        )}
                                                        <div>
                                                            <div className="ticket-title">{ticket.title || 'Event Title'}</div>
                                                            <div className="ticket-subtitle">
                                                                {ticket.ticketTypes?.map(tt => tt.type).join(', ') || ticket.category}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={`status-badge status-${getTicketStatus(ticket).replace('_', '-')}`}>
                                                    {formatStatus(getTicketStatus(ticket))}
                                                </div>
                                            </div>
                                            <div className="ticket-details">
                                                <div className="detail-item">
                                                    <div className="detail-label">Date</div>
                                                    <div className="detail-value">{ticket.date ? formatDate(ticket.date) : 'N/A'}</div>
                                                </div>
                                                <div className="detail-item">
                                                    <div className="detail-label">Venue</div>
                                                    <div className="detail-value">{ticket.venue || 'N/A'}</div>
                                                </div>
                                                <div className="detail-item">
                                                    <div className="detail-label">Sold</div>
                                                    <div className="detail-value">{ticket.soldTickets || 0} / {ticket.totalTickets || 0}</div>
                                                </div>
                                                <div className="detail-item">
                                                    <div className="detail-label">Listed</div>
                                                    <div className="detail-value">{formatDate(ticket.createdAt)}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* Purchased Tickets Tab */}
                        {activeTab === 'purchased' && (
                            <div className="tickets-grid">
                                {purchasedTickets.length === 0 ? (
                                    <div className="empty-state">
                                        <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                        <div className="empty-title">You haven't purchased any tickets yet</div>
                                        <div className="empty-description">Browse events to find tickets to purchase</div>
                                    </div>
                                ) : (
                                    purchasedTickets.map(ticket => (
                                        <div key={ticket._id} className="ticket-card purchased-ticket">
                                            <div className="ticket-header">
                                                <div className="ticket-info">
                                                    <div className="ticket-image-container">
                                                        {ticket.ticketId?.imageUrl && (
                                                            <img 
                                                                src={ticket.ticketId.imageUrl} 
                                                                alt={ticket.eventTitle}
                                                                className="ticket-image"
                                                            />
                                                        )}
                                                        <div>
                                                            <div className="ticket-title">{ticket.eventTitle || 'Event Title'}</div>
                                                            <div className="ticket-subtitle">{ticket.ticketType}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={`status-badge ${ticket.isScanned ? 'status-used' : 'status-valid'}`}>
                                                    {ticket.isScanned ? 'Used' : 'Valid'}
                                                </div>
                                            </div>
                                            <div className="ticket-details">
                                                <div className="detail-item">
                                                    <div className="detail-label">Date</div>
                                                    <div className="detail-value">{ticket.eventDate ? formatDate(ticket.eventDate) : 'N/A'}</div>
                                                </div>
                                                <div className="detail-item">
                                                    <div className="detail-label">Venue</div>
                                                    <div className="detail-value">{ticket.eventVenue || 'N/A'}</div>
                                                </div>
                                                <div className="detail-item">
                                                    <div className="detail-label">Paid</div>
                                                    <div className="detail-value highlight">{formatCurrency(ticket.totalAmount || ticket.price)}</div>
                                                </div>
                                                <div className="detail-item">
                                                    <div className="detail-label">Purchased</div>
                                                    <div className="detail-value">{formatDate(ticket.updatedAt || ticket.createdAt)}</div>
                                                </div>
                                            </div>
                                            {ticket.qrCodeData && (
                                                <div className="qr-section">
                                                    <div className="qr-header">
                                                        <svg className="qr-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                                        </svg>
                                                        <div className="qr-title">Ticket QR Code</div>
                                                    </div>
                                                    <div className="qr-code-display">
                                                        <code className="qr-code-text">{ticket.qrCodeData}</code>
                                                    </div>
                                                    <div className="qr-description">Present this code at the event entrance</div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyTicketsPage;
