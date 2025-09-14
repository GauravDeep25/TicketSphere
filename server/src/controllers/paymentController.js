import Ticket from '../models/Ticket.js';
import Commission from '../models/Commission.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import { calculateCommissions, getCommissionRecipientAdmin, createCommissionRecord, processCommissionPayment } from '../utils/commissionUtils.js';

// @desc    Initiate UPI payment for ticket purchase
// @route   POST /api/payments/initiate
// @access  Private
export const initiatePayment = async (req, res) => {
  try {
    const { ticketId } = req.body;

    if (!ticketId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide ticket ID'
      });
    }

    // Find the ticket
    const ticket = await Ticket.findById(ticketId).populate('event', 'title date location venue');
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check if ticket is available for purchase
    if (ticket.status !== 'live') {
      return res.status(400).json({
        success: false,
        message: 'Ticket is not available for purchase'
      });
    }

    // Check if buyer is not the seller
    if (ticket.seller === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot purchase your own ticket'
      });
    }

    // Check if ticket is already sold
    if (ticket.buyer) {
      return res.status(400).json({
        success: false,
        message: 'Ticket has already been sold'
      });
    }

    // Calculate commission amounts (5% from both buyer and seller)
    const commissions = calculateCommissions(ticket.price, 0.05, 0.05);
    
    // Get admin account for commission
    const admin = await getCommissionRecipientAdmin();

    // Generate payment session
    const paymentSession = {
      ticketId: ticket._id,
      buyerId: req.user.id,
      sellerId: ticket.seller,
      originalAmount: ticket.price,
      amount: commissions.buyerPays, // Total amount buyer pays (price + buyer commission)
      commissions: commissions,
      adminId: admin._id,
      currency: 'INR',
      sessionId: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
    };

    // In a real implementation, you would integrate with a payment gateway like Razorpay, PhonePe, etc.
    // For demo purposes, we'll create a UPI intent URL
    // Common UPI handles: @paytm, @phonepe, @googlepay, @okaxis, @okicici, @upi, @ptsbi
    const upiId = process.env.UPI_ID || '7362065730@ptsbi'; // Use your actual UPI ID
    const merchantName = process.env.MERCHANT_NAME || 'TicketSphere';
    
    // Create UPI payment URL (with commission included)
    // Enhanced UPI URL format with additional parameters for better compatibility
    const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${paymentSession.amount}&cu=INR&tn=${encodeURIComponent(`Ticket-${ticket.event.title}`)}&tr=${paymentSession.sessionId}&mc=0000&tid=${Date.now()}`;

    // Store payment session in memory (in production, use Redis or database)
    global.paymentSessions = global.paymentSessions || new Map();
    global.paymentSessions.set(paymentSession.sessionId, paymentSession);

    res.status(200).json({
      success: true,
      message: 'Payment session created successfully',
      data: {
        sessionId: paymentSession.sessionId,
        upiUrl: upiUrl, // Use the actual UPI URL instead of hardcoded string
        amount: paymentSession.amount,
        originalTicketPrice: paymentSession.originalAmount,
        currency: 'INR',
        ticket: {
          id: ticket._id,
          event: ticket.event.title,
          ticketType: ticket.ticketType,
          price: ticket.price
        },
        commissions: {
          buyerCommission: commissions.buyerCommissionAmount,
          sellerCommission: commissions.sellerCommissionAmount,
          totalCommission: commissions.totalCommissionAmount,
          sellerReceives: commissions.sellerReceives,
          buyerPays: commissions.buyerPays
        },
        expiresAt: paymentSession.expiresAt
      }
    });

  } catch (error) {
    console.error('Initiate payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate payment',
      error: error.message
    });
  }
};

// @desc    Verify and complete payment
// @route   POST /api/payments/verify
// @access  Private
export const verifyPayment = async (req, res) => {
  try {
    const { sessionId, status } = req.body;

    if (!sessionId || !status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide session ID and payment status'
      });
    }

    // Retrieve payment session
    global.paymentSessions = global.paymentSessions || new Map();
    const paymentSession = global.paymentSessions.get(sessionId);

    if (!paymentSession) {
      return res.status(404).json({
        success: false,
        message: 'Payment session not found or expired'
      });
    }

    // Check if session has expired
    if (new Date() > paymentSession.expiresAt) {
      global.paymentSessions.delete(sessionId);
      return res.status(400).json({
        success: false,
        message: 'Payment session has expired'
      });
    }

    // Verify that the user making the request is the same as the one who initiated payment
    if (paymentSession.buyerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized payment verification'
      });
    }

    if (status === 'success') {
      // Start transaction for ticket purchase
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // Find and update the ticket
        const ticket = await Ticket.findById(paymentSession.ticketId)
          .populate('event', 'title date location venue')
          .session(session);

        if (!ticket) {
          await session.abortTransaction();
          session.endSession();
          return res.status(404).json({
            success: false,
            message: 'Ticket not found'
          });
        }

        // Double-check ticket is still available
        if (ticket.status !== 'live' || ticket.buyer) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({
            success: false,
            message: 'Ticket is no longer available'
          });
        }

        // Update ticket with buyer information
        ticket.buyer = req.user.id;
        ticket.status = 'sold';
        ticket.pricePaid = paymentSession.originalAmount; // Original ticket price
        ticket.qrCodeData = `TICKET-${ticket._id}-${Date.now()}`;

        await ticket.save({ session });

        // Create commission record and process payment
        const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        
        const commission = await createCommissionRecord({
          transactionId,
          paymentSessionId: paymentSession.sessionId,
          ticketId: ticket._id,
          sellerId: paymentSession.sellerId,
          buyerId: req.user.id,
          ticketPrice: paymentSession.originalAmount,
          adminId: paymentSession.adminId,
          sellerRate: 0.05,
          buyerRate: 0.05
        });

        // Process commission payment to admin
        await processCommissionPayment(commission._id, session);

        // Commit transaction
        await session.commitTransaction();
        session.endSession();

        // Clean up payment session
        global.paymentSessions.delete(sessionId);

        res.status(200).json({
          success: true,
          message: 'Payment verified and ticket purchased successfully',
          data: {
            ticket: {
              id: ticket._id,
              event: ticket.event,
              ticketType: ticket.ticketType,
              pricePaid: ticket.pricePaid,
              qrCodeData: ticket.qrCodeData,
              status: ticket.status
            },
            transaction: {
              transactionId,
              totalAmountPaid: paymentSession.amount,
              originalTicketPrice: paymentSession.originalAmount,
              commissionCharged: paymentSession.commissions.buyerCommissionAmount,
              sellerReceives: paymentSession.commissions.sellerReceives,
              adminEarned: paymentSession.commissions.totalCommissionAmount
            }
          }
        });

      } catch (transactionError) {
        await session.abortTransaction();
        session.endSession();
        throw transactionError;
      }

    } else if (status === 'failed' || status === 'cancelled') {
      // Clean up payment session
      global.paymentSessions.delete(sessionId);

      res.status(400).json({
        success: false,
        message: `Payment ${status}`,
        data: { status }
      });

    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid payment status'
      });
    }

  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message
    });
  }
};

// @desc    Get payment status
// @route   GET /api/payments/status/:sessionId
// @access  Private
export const getPaymentStatus = async (req, res) => {
  try {
    const { sessionId } = req.params;

    global.paymentSessions = global.paymentSessions || new Map();
    const paymentSession = global.paymentSessions.get(sessionId);

    if (!paymentSession) {
      return res.status(404).json({
        success: false,
        message: 'Payment session not found'
      });
    }

    // Check if session has expired
    if (new Date() > paymentSession.expiresAt) {
      global.paymentSessions.delete(sessionId);
      return res.status(400).json({
        success: false,
        message: 'Payment session has expired'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        sessionId: paymentSession.sessionId,
        status: 'pending',
        amount: paymentSession.amount,
        expiresAt: paymentSession.expiresAt
      }
    });

  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment status',
      error: error.message
    });
  }
};

// @desc    Get commission information (Admin only)
// @route   GET /api/payments/commissions
// @access  Private (Admin)
export const getCommissionInfo = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20,
      status,
      startDate,
      endDate
    } = req.query;

    // Build filter
    const filter = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Get commission records with pagination
    const commissions = await Commission.find(filter)
      .populate('ticketId', 'title ticketType')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count
    const total = await Commission.countDocuments(filter);

    // Get summary statistics
    const stats = await Commission.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalCommissions: { $sum: '$totalCommissionAmount' },
          totalSellerCommissions: { $sum: '$sellerCommissionAmount' },
          totalBuyerCommissions: { $sum: '$buyerCommissionAmount' },
          processedCommissions: {
            $sum: {
              $cond: [{ $eq: ['$status', 'processed'] }, '$totalCommissionAmount', 0]
            }
          },
          pendingCommissions: {
            $sum: {
              $cond: [{ $eq: ['$status', 'pending'] }, '$totalCommissionAmount', 0]
            }
          },
          transactionCount: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        commissions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        },
        summary: stats[0] || {
          totalCommissions: 0,
          totalSellerCommissions: 0,
          totalBuyerCommissions: 0,
          processedCommissions: 0,
          pendingCommissions: 0,
          transactionCount: 0
        }
      }
    });

  } catch (error) {
    console.error('Get commission info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get commission information',
      error: error.message
    });
  }
};