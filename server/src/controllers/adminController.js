import Event from '../models/Event.js';
import Ticket from '../models/Ticket.js';
import SoldTicket from '../models/SoldTicket.js';
import mongoose from 'mongoose';

// Mock data for when database is not available
const mockPendingEvents = [
  {
    _id: '67890123456789012345',
    title: 'Sample Concert Event',
    description: 'A sample event for testing admin approval',
    date: new Date(Date.now() + 86400000), // Tomorrow
    location: 'Mumbai',
    venue: 'Sample Venue',
    category: 'Concert',
    seller: 'sample_user_id',
    ticketTypes: [
      { type: 'General', price: 1000, quantity: 100, sold: 0 },
      { type: 'VIP', price: 2000, quantity: 50, sold: 0 }
    ],
    isApproved: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const mockApprovedEvents = [
  {
    _id: '12345678901234567890',
    title: 'Approved Sample Event',
    description: 'A sample approved event',
    date: new Date(Date.now() + 172800000), // Day after tomorrow
    location: 'Delhi',
    venue: 'Sample Arena',
    category: 'Sports',
    seller: 'sample_user_id',
    ticketTypes: [
      { type: 'Standard', price: 500, quantity: 200, sold: 50 },
      { type: 'Premium', price: 1500, quantity: 100, sold: 30 }
    ],
    isApproved: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// @desc    Get all events pending approval
// @route   GET /api/admin/events/pending
// @access  Private/Admin
export const getPendingEvents = async (req, res) => {
    try {
        // Check if MongoDB is connected
        if (mongoose.connection.readyState !== 1) {
            console.log('⚠️  MongoDB not connected, using mock data for pending events');
            return res.json({ 
                success: true, 
                events: mockPendingEvents,
                count: mockPendingEvents.length,
                note: 'Using mock data - MongoDB connection unavailable'
            });
        }

        const events = await Event.find({ isApproved: false }).sort({ createdAt: -1 });
        res.json({ 
            success: true, 
            events,
            count: events.length 
        });
    } catch (error) {
        console.error('Error fetching pending events:', error);
        
        // Fallback to mock data on error
        console.log('📋 Falling back to mock data due to database error');
        res.json({ 
            success: true, 
            events: mockPendingEvents,
            count: mockPendingEvents.length,
            note: 'Using mock data due to database error'
        });
    }
};

// @desc    Get all approved events (now from tickets collection)
// @route   GET /api/admin/events/approved
// @access  Private/Admin
export const getApprovedEvents = async (req, res) => {
    try {
        // Check if MongoDB is connected
        if (mongoose.connection.readyState !== 1) {
            console.log('⚠️  MongoDB not connected, using mock data for approved events');
            return res.json({ 
                success: true, 
                events: mockApprovedEvents,
                count: mockApprovedEvents.length,
                note: 'Using mock data - MongoDB connection unavailable'
            });
        }

        // Fetch approved events from tickets collection
        const tickets = await Ticket.find({ isActive: true })
            .sort({ approvedAt: -1 })
            .limit(20); // Limit to recent 20 approved events
        
        res.json({ 
            success: true, 
            events: tickets, // Return tickets as events for frontend compatibility
            count: tickets.length 
        });
    } catch (error) {
        console.error('Error fetching approved events:', error);
        
        // Fallback to mock data on error
        console.log('📋 Falling back to mock data due to database error');
        res.json({ 
            success: true, 
            events: mockApprovedEvents,
            count: mockApprovedEvents.length,
            note: 'Using mock data due to database error'
        });
    }
};

// @desc    Approve an event and move it to tickets collection
// @route   PUT /api/admin/events/:id/approve
// @access  Private/Admin
export const approveEvent = async (req, res) => {
    try {
        // Start a MongoDB transaction to ensure data consistency
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Find the event to approve
            const event = await Event.findById(req.params.id).session(session);
            
            if (!event) {
                await session.abortTransaction();
                session.endSession();
                return res.status(404).json({ 
                    success: false, 
                    message: 'Event not found' 
                });
            }

            // Create a new ticket from the approved event
            const ticketData = {
                title: event.title,
                description: event.description,
                date: event.date,
                location: event.location,
                venue: event.venue,
                category: event.category,
                imageUrl: event.imageUrl,
                seller: event.seller,
                ticketTypes: event.ticketTypes,
                originalEventId: event._id, // Keep reference to original event
                approvedBy: req.user.id || req.user.firebase_uid, // Track who approved
                isActive: true,
                totalTickets: event.ticketTypes.reduce((sum, type) => sum + type.quantity, 0),
                soldTickets: event.ticketTypes.reduce((sum, type) => sum + type.sold, 0)
            };

            // Create the ticket in the tickets collection
            const newTicket = new Ticket(ticketData);
            await newTicket.save({ session });

            // Remove the event from events collection (since it's now a ticket)
            await Event.findByIdAndDelete(req.params.id).session(session);

            // Commit the transaction
            await session.commitTransaction();
            session.endSession();

            console.log('✅ Event approved and moved to tickets collection:', newTicket.title);
            
            res.json({ 
                success: true, 
                message: 'Event approved and moved to tickets collection successfully', 
                ticket: newTicket 
            });

        } catch (transactionError) {
            // Rollback transaction on error
            await session.abortTransaction();
            session.endSession();
            throw transactionError;
        }

    } catch (error) {
        console.error('Error approving event:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server Error', 
            error: error.message 
        });
    }
};

// @desc    Reject/Delete an event
// @route   DELETE /api/admin/events/:id/reject
// @access  Private/Admin
export const rejectEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        
        if (!event) {
            return res.status(404).json({ 
                success: false, 
                message: 'Event not found' 
            });
        }
        
        res.json({ 
            success: true, 
            message: 'Event rejected and removed successfully' 
        });
    } catch (error) {
        console.error('Error rejecting event:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server Error', 
            error: error.message 
        });
    }
};

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getAdminStats = async (req, res) => {
    try {
        // Check if MongoDB is connected
        if (mongoose.connection.readyState !== 1) {
            console.log('⚠️  MongoDB not connected, using mock stats');
            return res.json({
                success: true,
                stats: {
                    totalEvents: mockPendingEvents.length + mockApprovedEvents.length,
                    pendingCount: mockPendingEvents.length,
                    approvedCount: mockApprovedEvents.length,
                    totalRevenue: 40000 // Mock revenue
                },
                note: 'Using mock data - MongoDB connection unavailable'
            });
        }

        const [totalEvents, pendingCount, approvedCount] = await Promise.all([
            Event.countDocuments(),
            Event.countDocuments({ isApproved: false }),
            Event.countDocuments({ isApproved: true })
        ]);

        // Calculate total potential revenue from all approved events
        const approvedEvents = await Event.find({ isApproved: true });
        const totalRevenue = approvedEvents.reduce((total, event) => {
            return total + event.ticketTypes.reduce((eventTotal, ticket) => {
                return eventTotal + (ticket.price * ticket.sold);
            }, 0);
        }, 0);

        res.json({
            success: true,
            stats: {
                totalEvents,
                pendingCount,
                approvedCount,
                totalRevenue
            }
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        
        // Fallback to mock stats on error
        console.log('📊 Falling back to mock stats due to database error');
        res.json({
            success: true,
            stats: {
                totalEvents: mockPendingEvents.length + mockApprovedEvents.length,
                pendingCount: mockPendingEvents.length,
                approvedCount: mockApprovedEvents.length,
                totalRevenue: 40000 // Mock revenue
            },
            note: 'Using mock data due to database error'
        });
    }
};
