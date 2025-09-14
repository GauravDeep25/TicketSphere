import Ticket from '../models/Ticket.js';
import Event from '../models/Event.js';
import SoldTicket from '../models/SoldTicket.js';

// @desc    Create a new ticket listing
// @route   POST /api/tickets
// @access  Private
export const createTicketListing = async (req, res) => {
  try {
    const {
      eventId,
      ticketType,
      price,
      description
    } = req.body;

    // Validate required fields
    if (!eventId || !ticketType || !price) {
      return res.status(400).json({
        success: false,
        message: 'Please provide event ID, ticket type, and price'
      });
    }

    // Check if event exists and is approved
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (!event.isApproved) {
      return res.status(400).json({
        success: false,
        message: 'Cannot sell tickets for unapproved events'
      });
    }

    // Create ticket listing
    const ticket = await Ticket.create({
      event: eventId,
      ticketType,
      price,
      seller: req.user.id, // Firebase UID from auth middleware
      description
    });

    const populatedTicket = await Ticket.findById(ticket._id)
      .populate('event', 'title date location venue');

    res.status(201).json({
      success: true,
      message: 'Ticket listing created successfully and is pending approval',
      data: { ticket: populatedTicket }
    });

  } catch (error) {
    console.error('Create ticket listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create ticket listing',
      error: error.message
    });
  }
};

// @desc    Get all ticket listings
// @route   GET /api/tickets
// @access  Public
export const getTicketListings = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12,
      eventId,
      ticketType,
      minPrice,
      maxPrice,
      status = 'live' // Only show live tickets by default
    } = req.query;

    // Build filter object
    const filter = { status };
    
    if (eventId) {
      filter.event = eventId;
    }
    
    if (ticketType) {
      filter.ticketType = { $regex: ticketType, $options: 'i' };
    }
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Execute query with pagination
    const tickets = await Ticket.find(filter)
      .populate('event', 'title date location venue imageUrl')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get total count for pagination
    const total = await Ticket.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        tickets,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get ticket listings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ticket listings',
      error: error.message
    });
  }
};

// @desc    Get single ticket by ID
// @route   GET /api/tickets/:id
// @access  Public
export const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('event', 'title date location venue imageUrl description')
      .populate('seller', 'name email'); // Assuming you have user data

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { ticket }
    });

  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ticket',
      error: error.message
    });
  }
};

// @desc    Update ticket status (Admin only)
// @route   PUT /api/tickets/:id/status
// @access  Private (Admin)
export const updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending_approval', 'live', 'sold', 'rejected', 'expired'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    ticket.status = status;
    
    if (status === 'live') {
      ticket.approvedBy = req.user.id;
      ticket.approvedAt = new Date();
    }

    await ticket.save();

    const updatedTicket = await Ticket.findById(ticket._id)
      .populate('event', 'title date location venue');

    res.status(200).json({
      success: true,
      message: 'Ticket status updated successfully',
      data: { ticket: updatedTicket }
    });

  } catch (error) {
    console.error('Update ticket status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update ticket status',
      error: error.message
    });
  }
};

// @desc    Get my ticket listings
// @route   GET /api/tickets/my-listings
// @access  Private
export const getMyTicketListings = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12,
      status
    } = req.query;

    // Build filter object
    const filter = { seller: req.user.id };
    
    if (status) {
      filter.status = status;
    }

    // Execute query with pagination
    const tickets = await Ticket.find(filter)
      .populate('event', 'title date location venue imageUrl')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get total count for pagination
    const total = await Ticket.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        tickets,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get my ticket listings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your ticket listings',
      error: error.message
    });
  }
};

// @desc    Get tickets purchased by the user
// @route   GET /api/tickets/my/purchases
// @access  Private
export const getMyTicketPurchases = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12,
      status
    } = req.query;

    // Build filter object
    const filter = { buyer: req.user.id };
    
    if (status) {
      filter.status = status;
    }

    // Execute query with pagination
    const tickets = await Ticket.find(filter)
      .populate('event', 'title date location venue imageUrl')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get total count for pagination
    const total = await Ticket.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        tickets,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get my ticket purchases error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your ticket purchases',
      error: error.message
    });
  }
};

// @desc    Get summary of tickets listed and purchased by the user
// @route   GET /api/tickets/my/summary
// @access  Private
export const getMyTicketsSummary = async (req, res) => {
  try {
    // Get tickets listed by the user (from Tickets collection - events they're selling)
    const listedTickets = await Ticket.find({ seller: req.user.id })
      .select('title date location venue imageUrl ticketTypes isActive isSoldOut')
      .sort({ createdAt: -1 });

    // Get tickets purchased by the user (from SoldTickets collection)
    const purchasedTickets = await SoldTicket.find({ buyerId: req.user.id })
      .populate('ticketId', 'title date location venue imageUrl')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        listedTickets,
        purchasedTickets
      }
    });

  } catch (error) {
    console.error('Get my tickets summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your tickets summary',
      error: error.message
    });
  }
};
