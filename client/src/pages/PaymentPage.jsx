import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api';
import './PaymentPage.css';

const PaymentPage = () => {
  const { ticketId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, isAuthenticated } = useAuth();
  
  const [paymentStatus, setPaymentStatus] = useState('loading'); // loading, ready, processing, success, failed, expired
  const [paymentData, setPaymentData] = useState(null);
  const [ticketDetails, setTicketDetails] = useState(null);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(900); // 15 minutes in seconds
  const [showQRCode, setShowQRCode] = useState(false);
  
  // Check if this is an event ticket purchase
  const isEventTicket = searchParams.get('eventTicket') === 'true';
  const ticketTypeParam = searchParams.get('ticketType');
  
  // Get event and ticket type from navigation state
  const { event, ticketType } = location.state || {};

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (ticketId) {
      if (isEventTicket && event && ticketType) {
        // For event tickets, create ticket details from the passed data
        setTicketDetails({
          _id: ticketId,
          event: {
            title: event.title,
            date: event.date,
            location: event.location,
            venue: event.venue
          },
          ticketType: ticketType.type,
          price: ticketType.price,
          seller: event.seller,
          status: 'live'
        });
        initiateEventTicketPayment();
      } else {
        // For marketplace tickets, fetch ticket details normally
        fetchTicketDetails();
        initiatePayment();
      }
    }
  }, [ticketId, isEventTicket]);

  // Countdown timer
  useEffect(() => {
    if ((paymentStatus === 'ready' || paymentStatus === 'processing') && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setPaymentStatus('expired');
      setError('Payment session expired');
    }
  }, [countdown, paymentStatus]);

  const fetchTicketDetails = async () => {
    try {
      const response = await API.get(`/tickets/${ticketId}`);
      if (response.data.success) {
        setTicketDetails(response.data.data.ticket);
      }
    } catch (error) {
      console.error('Error fetching ticket details:', error);
      setError('Failed to load ticket details');
    }
  };

  const initiatePayment = async () => {
    try {
      setPaymentStatus('loading');
      const response = await API.post('/payments/initiate', {
        ticketId: ticketId
      });

      if (response.data.success) {
        setPaymentData(response.data.data);
        setPaymentStatus('ready');
      }
    } catch (error) {
      console.error('Payment initiation error:', error);
      setError(error.response?.data?.message || 'Failed to initiate payment');
      setPaymentStatus('failed');
    }
  };

  const initiateEventTicketPayment = async () => {
    try {
      setPaymentStatus('loading');
      // For event tickets, use the direct purchase endpoint instead of payment initiation
      // But for now, let's simulate a payment initiation with the ticket type data
      
      // Create payment session data similar to what the payment API would return
      const mockPaymentData = {
        sessionId: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        amount: ticketType.price,
        originalTicketPrice: ticketType.price,
        currency: 'INR',
        ticket: {
          id: ticketId,
          event: event.title,
          ticketType: ticketType.type,
          price: ticketType.price
        },
        upiUrl: `upi://pay?pa=7362065730@ptsbi&pn=TicketSphere&am=${ticketType.price}&cu=INR&tn=${encodeURIComponent(`Ticket for ${event.title} - ${ticketType.type}`)}&tr=${Date.now()}`,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000)
      };

      setPaymentData(mockPaymentData);
      setPaymentStatus('ready');
    } catch (error) {
      console.error('Event ticket payment initiation error:', error);
      setError('Failed to initiate payment for event ticket');
      setPaymentStatus('failed');
    }
  };

  const handleUPIPayment = () => {
    if (paymentData?.upiUrl) {
      // For mobile devices, directly open UPI app
      if (isMobileDevice()) {
        window.location.href = paymentData.upiUrl;
      } else {
        // For desktop, show QR code and also provide the link
        setShowQRCode(true);
        // Still try to open the UPI app if available
        const newWindow = window.open(paymentData.upiUrl, '_blank');
        // If popup was blocked or no UPI app, show QR code
        setTimeout(() => {
          if (newWindow && newWindow.closed) {
            setShowQRCode(true);
          }
        }, 1000);
      }
      setPaymentStatus('processing');
    }
  };

  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  const generateUPIQR = (upiString) => {
    // This would typically use a QR code library like qrcode.js
    // For now, we'll show the UPI string
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiString)}`;
  };

  const handlePaymentVerification = async (status) => {
    try {
      setPaymentStatus('processing');
      
      if (isEventTicket && status === 'success') {
        // For event tickets, use the direct purchase endpoint
        const response = await API.post(`/events/${ticketId}/purchase`, {
          ticketTypeId: ticketType._id || ticketType.type,
          quantity: 1
        });

        if (response.data.success) {
          setPaymentStatus('success');
          setTimeout(() => {
            navigate('/my-tickets?tab=purchased');
          }, 3000);
        } else {
          throw new Error(response.data.message);
        }
      } else {
        // For marketplace tickets, use the original payment verification
        const response = await API.post('/payments/verify', {
          sessionId: paymentData.sessionId,
          status: status
        });

        if (response.data.success) {
          setPaymentStatus('success');
          setTimeout(() => {
            navigate('/my-tickets?tab=purchased');
          }, 3000);
        } else {
          throw new Error(response.data.message);
        }
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setError(error.response?.data?.message || 'Payment verification failed');
      setPaymentStatus('failed');
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const handleCancel = () => {
    navigate(-1); // Go back to previous page
  };

  if (paymentStatus === 'loading') {
    return (
      <div className="payment-page">
        <div className="payment-container loading-state">
          <div className="loading-spinner"></div>
          <h2>Preparing Payment</h2>
          <p>Setting up your payment session...</p>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'ready') {
    return (
      <div className="payment-page">
        <div className="payment-container">
          <div className="payment-header">
            <div className="payment-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h1>Complete Your Payment</h1>
            <p>Secure UPI payment for your ticket</p>
          </div>

          <div className="ticket-summary">
            <h3>Order Summary</h3>
            <div className="summary-details">
              <div className="detail-row">
                <span>Event</span>
                <span>{ticketDetails?.event?.title || 'Loading...'}</span>
              </div>
              <div className="detail-row">
                <span>Ticket Type</span>
                <span>{ticketDetails?.ticketType}</span>
              </div>
              <div className="detail-row">
                <span>Original Price</span>
                <span>{formatCurrency(paymentData?.originalTicketPrice || 0)}</span>
              </div>
              {paymentData?.commissions && (
                <>
                  <div className="detail-row commission">
                    <span>Service Fee (5%)</span>
                    <span>{formatCurrency(paymentData.commissions.buyerCommission)}</span>
                  </div>
                  <div className="detail-row total">
                    <span>Total Amount</span>
                    <span>{formatCurrency(paymentData.amount)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="timer-section">
            <div className="timer">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
              <span>Time remaining: {formatTime(countdown)}</span>
            </div>
          </div>

          <div className="payment-methods">
            <button onClick={handleUPIPayment} className="upi-button">
              <div className="upi-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="upi-content">
                <span className="upi-title">Pay with UPI</span>
                <span className="upi-subtitle">PhonePe, GPay, Paytm & more</span>
              </div>
              <div className="upi-arrow">→</div>
            </button>
          </div>

          <div className="payment-actions">
            <button onClick={handleCancel} className="cancel-button">
              Cancel Payment
            </button>
          </div>

          <div className="security-info">
            <div className="security-icon">🔒</div>
            <span>Secure payment powered by UPI</span>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'processing') {
    return (
      <div className="payment-page">
        <div className="payment-container processing-state">
          {showQRCode && paymentData?.upiUrl && (
            <div className="qr-section">
              <h2>Scan QR Code to Pay</h2>
              <div className="qr-code">
                <img 
                  src={generateUPIQR(paymentData.upiUrl)} 
                  alt="UPI Payment QR Code"
                />
              </div>
              <p>Scan this QR code with any UPI app</p>
              <div className="upi-apps">
                <span>💳 GPay</span>
                <span>📱 PhonePe</span>
                <span>💰 Paytm</span>
                <span>🏦 BHIM</span>
              </div>
            </div>
          )}

          <div className="processing-content">
            <div className="processing-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="animate-pulse">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h2>Waiting for Payment</h2>
            <p>Complete the payment in your UPI app and return here</p>
            
            <div className="timer">
              <span>Time remaining: {formatTime(countdown)}</span>
            </div>

            <div className="verification-buttons">
              <button 
                onClick={() => handlePaymentVerification('success')}
                className="success-button"
              >
                ✓ I've Completed Payment
              </button>
              
              <button 
                onClick={() => handlePaymentVerification('failed')}
                className="failed-button"
              >
                ✗ Payment Failed
              </button>
            </div>

            <button onClick={handleCancel} className="cancel-link">
              Cancel and go back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'success') {
    return (
      <div className="payment-page">
        <div className="payment-container success-state">
          <div className="success-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1>Payment Successful! 🎉</h1>
          <p>Your ticket has been purchased successfully</p>
          
          <div className="success-details">
            <div className="success-amount">
              Amount Paid: {formatCurrency(paymentData?.amount || 0)}
            </div>
          </div>

          <div className="success-actions">
            <button 
              onClick={() => navigate('/my-tickets?tab=purchased')}
              className="primary-button"
            >
              View My Tickets
            </button>
            <button 
              onClick={() => navigate('/events')}
              className="secondary-button"
            >
              Browse More Events
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'failed' || paymentStatus === 'expired') {
    return (
      <div className="payment-page">
        <div className="payment-container failed-state">
          <div className="failed-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <h1>{paymentStatus === 'expired' ? 'Payment Expired' : 'Payment Failed'}</h1>
          <p>{error || 'There was an issue processing your payment'}</p>

          <div className="failed-actions">
            <button onClick={initiatePayment} className="retry-button">
              Try Again
            </button>
            <button onClick={handleCancel} className="cancel-button">
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default PaymentPage;