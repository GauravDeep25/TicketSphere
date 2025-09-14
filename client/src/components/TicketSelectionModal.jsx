import React, { useState } from 'react';
import { X, Calendar, MapPin, Users } from 'lucide-react';
import './TicketSelectionModal.css';

const TicketSelectionModal = ({ event, onClose, onSelectTicket }) => {
  const [selectedTicketType, setSelectedTicketType] = useState(null);

  if (!event) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
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

  const handleTicketSelect = (ticketType, index) => {
    // Pass both the ticket type and its index to handle cases where _id might not exist
    const ticketTypeWithId = {
      ...ticketType,
      _id: ticketType._id || index.toString() // Use index as fallback ID
    };
    onSelectTicket(ticketTypeWithId);
    onClose();
  };

  const availableTickets = event.ticketTypes?.filter(ticket => 
    ticket.quantity > (ticket.sold || 0)
  ) || [];

  return (
    <div className="ticket-selection-overlay">
      <div className="ticket-selection-modal">
        {/* Header */}
        <div className="ticket-selection-header">
          <div className="flex-1">
            <h2>{event.title}</h2>
            <div className="event-details">
              <div className="event-detail-item">
                <Calendar size={16} />
                <span>{formatDate(event.date)}</span>
              </div>
              <div className="event-detail-item">
                <MapPin size={16} />
                <span>{event.venue}, {event.location}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="close-button"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="ticket-selection-content">
          <h3 className="section-title">Select Ticket Type</h3>
          
          {availableTickets.length === 0 ? (
            <div className="sold-out-container">
              <p className="sold-out-message">Sorry, this event is sold out!</p>
              <button
                onClick={onClose}
                className="close-button-secondary"
              >
                Close
              </button>
            </div>
          ) : (
            <div className="ticket-types-grid">
              {availableTickets.map((ticketType, index) => {
                const availableQuantity = ticketType.quantity - (ticketType.sold || 0);
                
                return (
                  <div
                    key={index}
                    className="ticket-type-card"
                  >
                    <div className="ticket-type-content">
                      <div className="ticket-type-info">
                        <div className="ticket-type-header">
                          <h4 className="ticket-type-name">
                            {ticketType.type}
                          </h4>
                          <span className="ticket-type-price">
                            {formatCurrency(ticketType.price)}
                          </span>
                        </div>
                        
                        <div className="ticket-availability">
                          <Users size={14} />
                          <span className="available-count">
                            {availableQuantity} ticket{availableQuantity !== 1 ? 's' : ''} available
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleTicketSelect(ticketType, index)}
                        className="select-button"
                      >
                        Select
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Event Description */}
          {event.description && (
            <div className="event-description-section">
              <h4 className="description-title">About This Event</h4>
              <p className="description-text">{event.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketSelectionModal;
