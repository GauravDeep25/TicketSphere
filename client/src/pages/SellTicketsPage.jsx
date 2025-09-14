import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { eventAPI, handleAPIError } from '../api/index';
import { Calendar, MapPin, Tag, Users, DollarSign, Plus, Trash2 } from 'lucide-react';
import './sell_tickets.css';

const SellTicketsPage = () => {
    const { currentUser, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    
    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    const [eventDetails, setEventDetails] = useState({
        title: '',
        description: '',
        date: '',
        location: '',
        venue: '',
        category: 'Concert',
    });
    const [ticketTypes, setTicketTypes] = useState([{ 
        type: 'General', 
        price: '', 
        quantity: '', 
        description: '' 
    }]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const categories = ['Concert', 'Sports', 'Comedy', 'Festival', 'Movie', 'Other'];

    const handleEventChange = (e) => {
        setEventDetails({ ...eventDetails, [e.target.name]: e.target.value });
    };

    const handleTicketChange = (index, field, value) => {
        const updatedTickets = [...ticketTypes];
        updatedTickets[index][field] = value;
        setTicketTypes(updatedTickets);
    };

    const addTicketTier = () => {
        setTicketTypes([...ticketTypes, { 
            type: 'VIP', 
            price: '', 
            quantity: '', 
            description: '' 
        }]);
    };

    const removeTicketTier = (index) => {
        if (ticketTypes.length > 1) {
            const updatedTickets = ticketTypes.filter((_, i) => i !== index);
            setTicketTypes(updatedTickets);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validation
        if (!eventDetails.title || !eventDetails.date || !eventDetails.location || !eventDetails.venue) {
            setError('Please fill in all required fields.');
            setLoading(false);
            return;
        }

        // Validate ticket types
        for (let ticket of ticketTypes) {
            if (!ticket.type || !ticket.price || !ticket.quantity) {
                setError('Please fill in all ticket information.');
                setLoading(false);
                return;
            }
        }

        try {
            const eventData = {
                ...eventDetails,
                ticketTypes: ticketTypes,
                status: 'pending' // Events need approval
            };

            await eventAPI.createEvent(eventData);
            
            // Success redirect
            navigate('/events', { 
                state: { message: 'Event submitted for approval! You will be notified once it is reviewed.' } 
            });
        } catch (err) {
            setError(handleAPIError(err) || 'Failed to create event. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated) {
        return null; // Will redirect to login
    }

    return (
        <div className="sell-ticket-page">
            <div className="form-container">
                <div className="page-header">
                    <h1 className="page-title">Create Your Event</h1>
                    <p className="page-subtitle">Fill in the details below to list your event for approval</p>
                </div>

                <form onSubmit={handleSubmit} className="event-form">
                    {/* Event Details Section */}
                    <div className="form-section">
                        <h2 className="section-title">
                            <Calendar className="section-icon" />
                            Event Details
                        </h2>
                        <div className="details-grid">
                            <div className="input-group">
                                <label className="input-label">Event Title *</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={eventDetails.title}
                                    onChange={handleEventChange}
                                    className="form-input"
                                    placeholder="Enter event title"
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Category *</label>
                                <select
                                    name="category"
                                    value={eventDetails.category}
                                    onChange={handleEventChange}
                                    className="form-input"
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="input-group">
                                <label className="input-label">Date & Time *</label>
                                <input
                                    type="datetime-local"
                                    name="date"
                                    value={eventDetails.date}
                                    onChange={handleEventChange}
                                    className="form-input"
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">City/Location *</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={eventDetails.location}
                                    onChange={handleEventChange}
                                    className="form-input"
                                    placeholder="e.g., Mumbai, Delhi"
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Venue *</label>
                                <input
                                    type="text"
                                    name="venue"
                                    value={eventDetails.venue}
                                    onChange={handleEventChange}
                                    className="form-input"
                                    placeholder="e.g., Wankhede Stadium"
                                    required
                                />
                            </div>
                        </div>
                        <div className="input-group full-width">
                            <label className="input-label">Description</label>
                            <textarea
                                name="description"
                                value={eventDetails.description}
                                onChange={handleEventChange}
                                rows={4}
                                className="form-textarea"
                                placeholder="Describe your event..."
                            />
                        </div>
                    </div>

                    {/* Ticket Types Section */}
                    <div className="form-section">
                        <h2 className="section-title">
                            <DollarSign className="section-icon-green" />
                            Ticket Information
                        </h2>
                        {ticketTypes.map((ticket, index) => (
                            <div key={index} className="ticket-tier">
                                <div className="tier-header">
                                    <h3 className="tier-title">Ticket Tier {index + 1}</h3>
                                    {ticketTypes.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeTicketTier(index)}
                                            className="remove-tier-button"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                                <div className="tier-grid">
                                    <div className="input-group">
                                        <label className="input-label">Ticket Type *</label>
                                        <input
                                            type="text"
                                            value={ticket.type}
                                            onChange={(e) => handleTicketChange(index, 'type', e.target.value)}
                                            className="form-input"
                                            placeholder="e.g., General, VIP, Premium"
                                            required
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">Price (₹) *</label>
                                        <input
                                            type="number"
                                        value={ticket.price}
                                        onChange={(e) => handleTicketChange(index, 'price', e.target.value)}
                                        className="form-input"
                                        placeholder="0"
                                        min="0"
                                        required
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Quantity *</label>
                                    <input
                                        type="number"
                                        value={ticket.quantity}
                                        onChange={(e) => handleTicketChange(index, 'quantity', e.target.value)}
                                        className="form-input"
                                        placeholder="0"
                                        min="1"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="input-group full-width">
                                    <label className="input-label">Description</label>
                                    <input
                                        type="text"
                                        value={ticket.description}
                                        onChange={(e) => handleTicketChange(index, 'description', e.target.value)}
                                        className="form-input"
                                        placeholder="Additional details about this ticket type"
                                    />
                                </div>
                            </div>
                        ))}
                        
                        <button
                            type="button"
                            onClick={addTicketTier}
                            className="add-tier-button"
                        >
                            <Plus size={18} />
                            Add Another Ticket Tier
                        </button>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="submit-button"
                    >
                        {loading ? (
                            <>
                                <div className="spinner"></div>
                                Submitting...
                            </>
                        ) : (
                            <>
                                <Tag size={20} />
                                Submit Event for Approval
                            </>
                        )}
                    </button>

                    <p className="helper-text">
                        Your event will be reviewed by our team before going live. You'll be notified once it's approved.
                    </p>
                </form>
            </div>
        </div>
    );
};

export default SellTicketsPage;