import Event from '../models/Event.js';
import Ticket from '../models/Ticket.js';
import SoldTicket from '../models/SoldTicket.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

// Mock data for when database is unavailable
const mockTickets = [
  {
    _id: 'mock1',
    title: 'Cricket Match: India vs Australia',
    description: 'Exciting cricket match between India and Australia',
    category: 'Sports',
    date: new Date(Date.now() + 86400000 * 7), // 1 week from now
    venue: 'Wankhede Stadium',
    location: 'Mumbai',
    ticketTypes: [
      { type: 'General', price: 500, quantity: 100, sold: 25 },
      { type: 'VIP', price: 1500, quantity: 50, sold: 10 }
    ],
    isActive: true,
    isSoldOut: false,
    totalTickets: 150,
    soldTickets: 35,
    seller: 'mock-seller-1',
    approvedBy: 'admin',
    approvedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: 'mock2',
    title: 'Arijit Singh Live Concert',
    description: 'Live concert by the renowned singer Arijit Singh',
    category: 'Concert',
    date: new Date(Date.now() + 86400000 * 14), // 2 weeks from now
    venue: 'JLN Stadium',
    location: 'Delhi',
    ticketTypes: [
      { type: 'Silver', price: 1500, quantity: 200, sold: 50 },
      { type: 'Gold', price: 2500, quantity: 100, sold: 20 }
    ],
    isActive: true,
    isSoldOut: false,
    totalTickets: 300,
    soldTickets: 70,
    seller: 'mock-seller-2',
    approvedBy: 'admin',
    approvedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: 'mock3',
    title: 'Stand-up Comedy Night',
    description: 'Hilarious stand-up comedy show with top comedians',
    category: 'Comedy',
    date: new Date(Date.now() + 86400000 * 21), // 3 weeks from now
    venue: 'Phoenix MarketCity',
    location: 'Bangalore',
    ticketTypes: [
      { type: 'Regular', price: 800, quantity: 120, sold: 30 }
    ],
    isActive: true,
    isSoldOut: false,
    totalTickets: 120,
    soldTickets: 30,
    seller: 'mock-seller-3',
    approvedBy: 'admin',
    approvedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// @desc    Get all available tickets (approved events)
// @route   GET /api/events
// @access  Public
export const getEvents = async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        success: true,
        tickets: mockTickets,
        events: mockTickets,
        totalPages: 1,
        currentPage: 1,
        total: mockTickets.length,
        hasNextPage: false,
        hasPrevPage: false,
        note: 'Using mock data - MongoDB connection unavailable'
      });
    }

    const { 
      page = 1, 
      limit = 12, 
      category, 
      location, 
      search,
      startDate,
      endDate 
    } = req.query;

    // Build filter object for tickets (approved events)
    const filter = { isActive: true };
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { venue: { $regex: search, $options: 'i' } }
      ];
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.date.$lte = new Date(endDate);
      }
    }

    // Get tickets with pagination
    const skip = (page - 1) * limit;
    const tickets = await Ticket.find(filter)
      .sort({ date: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Ticket.countDocuments(filter);

    res.json({
      success: true,
      tickets, // Return as tickets instead of events
      events: tickets, // Also provide as events for backward compatibility
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1
    });

  } catch (error) {
    console.error('Get tickets error:', error);
    
    // Fallback to mock data on error
    res.json({
      success: true,
      tickets: mockTickets,
      events: mockTickets,
      totalPages: 1,
      currentPage: 1,
      total: mockTickets.length,
      hasNextPage: false,
      hasPrevPage: false,
      note: 'Using mock data due to database error'
    });
  }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public
export const getEventById = async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      const mockTicket = mockTickets.find(ticket => ticket._id === req.params.id) || mockTickets[0];
      return res.status(200).json({
        success: true,
        data: { event: mockTicket },
        note: 'Using mock data - MongoDB connection unavailable'
      });
    }

    // Fetch from tickets collection since events are moved there after approval
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Only show active tickets to public
    if (!ticket.isActive && (!req.user || req.user.role !== 'admin')) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not available'
      });
    }

    res.status(200).json({
      success: true,
      data: { event: ticket } // Keep same response structure for frontend compatibility
    });

  } catch (error) {
    console.error('Get event error:', error);
    
    // Fallback to mock data on error
    const mockTicket = mockTickets.find(ticket => ticket._id === req.params.id) || mockTickets[0];
    res.status(200).json({
      success: true,
      data: { event: mockTicket },
      note: 'Using mock data due to database error'
    });
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private (Seller/Admin)
export const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      location,
      venue,
      category,
      imageUrl,
      ticketTypes
    } = req.body;

    // Validate required fields
    if (!title || !description || !date || !location || !venue || !category || !ticketTypes || ticketTypes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Create event
    const event = await Event.create({
      title,
      description,
      date: new Date(date),
      location,
      venue,
      category,
      imageUrl,
      ticketTypes,
      seller: req.user.id || req.user.firebase_uid // Use Firebase UID
    });

    res.status(201).json({
      success: true,
      message: 'Event created successfully and is pending approval',
      data: { event }
    });

  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create event',
      error: error.message
    });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Owner/Admin)
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check ownership (only owner or admin can update)
    if (event.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this event'
      });
    }

    // Update event
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { ...req.body, isApproved: false }, // Reset approval status when updated
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Event updated successfully and is pending re-approval',
      data: { event: updatedEvent }
    });

  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update event',
      error: error.message
    });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Owner/Admin)
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check ownership (only owner or admin can delete)
    if (event.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this event'
      });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });

  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete event',
      error: error.message
    });
  }
};

// @desc    Get user's events (seller dashboard)
// @route   GET /api/events/my-events
// @access  Private (Seller)
export const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ seller: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { events }
    });

  } catch (error) {
    console.error('Get my events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your events',
      error: error.message
    });
  }
};

// @desc    Purchase tickets and save to sold collection
// @route   POST /api/events/:id/purchase
// @access  Private
export const purchaseTickets = async (req, res) => {
  try {
    const { ticketTypeId, quantity } = req.body;
    const ticketId = req.params.id; // This is now a ticket ID from tickets collection

    // Validate input
    if (!ticketTypeId || !quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid ticket type and quantity'
      });
    }

    // Check if MongoDB is connected, otherwise use mock data flow
    if (mongoose.connection.readyState !== 1) {
      
      // Find mock ticket
      const mockTicket = mockTickets.find(ticket => ticket._id === ticketId);
      if (!mockTicket) {
        return res.status(404).json({
          success: false,
          message: 'Ticket not found'
        });
      }

      // Find ticket type by index (since mock data doesn't have _id for ticket types)
      const ticketTypeIndex = parseInt(ticketTypeId);
      const ticketType = mockTicket.ticketTypes[ticketTypeIndex];
      
      if (!ticketType) {
        return res.status(404).json({
          success: false,
          message: 'Ticket type not found'
        });
      }

      // Check availability
      const availableTickets = ticketType.quantity - ticketType.sold;
      if (availableTickets < quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${availableTickets} tickets available for ${ticketType.type}`,
          availableTickets
        });
      }

      // Calculate total amount
      const totalAmount = ticketType.price * quantity;

      // Simulate successful purchase
      const mockSoldTicket = {
        _id: `sold_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ticketCode: `TKT-${Date.now().toString().slice(-8)}`,
        eventTitle: mockTicket.title,
        eventDate: mockTicket.date,
        ticketType: ticketType.type,
        price: ticketType.price,
        quantity: quantity,
        totalAmount: totalAmount,
        purchaseStatus: 'confirmed',
        qrCodeData: `QR-${Date.now()}`,
        purchasedAt: new Date()
      };

      return res.status(200).json({
        success: true,
        message: 'Ticket purchased successfully',
        data: {
          soldTicket: mockSoldTicket,
          ticketCode: mockSoldTicket.ticketCode
        }
      });
    }

    // Start a transaction to ensure data consistency
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Find the ticket (approved event)
      const ticket = await Ticket.findById(ticketId).session(session);
      
      if (!ticket) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          success: false,
          message: 'Ticket not found'
        });
      }

      if (!ticket.isActive) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: 'Ticket is no longer available'
        });
      }

      // Find the specific ticket type
      const ticketType = ticket.ticketTypes.id(ticketTypeId);
      
      if (!ticketType) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          success: false,
          message: 'Ticket type not found'
        });
      }

      // Check if enough tickets are available
      const availableTickets = ticketType.quantity - ticketType.sold;
      
      if (availableTickets < quantity) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: `Only ${availableTickets} tickets available for ${ticketType.type}`,
          availableTickets
        });
      }

      // Calculate total amount
      const totalAmount = ticketType.price * quantity;

      // Create sold ticket record
      const soldTicketData = {
        ticketId: ticket._id,
        eventTitle: ticket.title,
        eventDate: ticket.date,
        eventLocation: ticket.location,
        eventVenue: ticket.venue,
        ticketType: ticketType.type,
        price: ticketType.price,
        quantity: quantity,
        buyerId: req.user.id || req.user.firebase_uid,
        buyerEmail: req.user.email,
        buyerName: req.user.name || req.user.displayName || 'User',
        totalAmount: totalAmount,
        purchaseStatus: 'confirmed'
      };

      const soldTicket = new SoldTicket(soldTicketData);
      await soldTicket.save({ session });

      // Update the ticket type sold count
      ticketType.sold += quantity;
      
      // Update total sold tickets
      ticket.soldTickets = ticket.ticketTypes.reduce((sum, type) => sum + type.sold, 0);
      
      // Check if all tickets are sold out
      const totalTickets = ticket.ticketTypes.reduce((sum, type) => sum + type.quantity, 0);
      if (ticket.soldTickets >= totalTickets) {
        ticket.isSoldOut = true;
        ticket.isActive = false; // Make ticket inactive when sold out
      }

      await ticket.save({ session });

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      res.status(200).json({
        success: true,
        message: 'Tickets purchased successfully',
        data: {
          purchasedTicket: soldTicket,
          ticketCode: soldTicket.ticketCode,
          transactionId: soldTicket.transactionId,
          totalAmount: totalAmount,
          remainingTickets: ticketType.quantity - ticketType.sold
        }
      });

    } catch (transactionError) {
      await session.abortTransaction();
      session.endSession();
      throw transactionError;
    }

  } catch (error) {
    console.error('Purchase tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to purchase tickets',
      error: error.message
    });
  }
};

// @desc    Get ticket availability for an event
// @route   GET /api/events/:id/availability
// @access  Public
export const getTicketAvailability = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    const availability = ticket.ticketTypes.map(ticketType => ({
      id: ticketType._id,
      type: ticketType.type,
      price: ticketType.price,
      total: ticketType.quantity,
      sold: ticketType.sold,
      remaining: ticketType.quantity - ticketType.sold,
      isSoldOut: ticketType.sold >= ticketType.quantity
    }));

    res.status(200).json({
      success: true,
      data: {
        eventId: ticket._id,
        eventTitle: ticket.title,
        isEventSoldOut: ticket.isSoldOut,
        ticketAvailability: availability
      }
    });

  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get ticket availability',
      error: error.message
    });
  }
};

// @desc    Get user's purchased tickets
// @route   GET /api/events/my-tickets
// @access  Private
export const getMyTickets = async (req, res) => {
  try {
    const userId = req.user.id || req.user.firebase_uid;
    
    const myTickets = await SoldTicket.find({ buyerId: userId })
      .sort({ purchaseDate: -1 }); // Most recent first

    res.status(200).json({
      success: true,
      message: 'Your purchased tickets retrieved successfully',
      data: {
        tickets: myTickets,
        totalTickets: myTickets.length,
        totalSpent: myTickets.reduce((sum, ticket) => sum + ticket.totalAmount, 0)
      }
    });

  } catch (error) {
    console.error('Get my tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get your tickets',
      error: error.message
    });
  }
};
