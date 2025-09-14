import Event from '../models/Event.js';

// @desc    Get all events pending approval
// @route   GET /api/admin/events/pending
// @access  Private/Admin
export const getPendingEvents = async (req, res) => {
    try {
        const events = await Event.find({ isApproved: false }).sort({ createdAt: -1 });
        res.json({ 
            success: true, 
            events,
            count: events.length 
        });
    } catch (error) {
        console.error('Error fetching pending events:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server Error', 
            error: error.message 
        });
    }
};

// @desc    Get all approved events
// @route   GET /api/admin/events/approved
// @access  Private/Admin
export const getApprovedEvents = async (req, res) => {
    try {
        const events = await Event.find({ isApproved: true })
            .sort({ createdAt: -1 })
            .limit(20); // Limit to recent 20 events
        res.json({ 
            success: true, 
            events,
            count: events.length 
        });
    } catch (error) {
        console.error('Error fetching approved events:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server Error', 
            error: error.message 
        });
    }
};

// @desc    Approve an event
// @route   PUT /api/admin/events/:id/approve
// @access  Private/Admin
export const approveEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndUpdate(
            req.params.id,
            { isApproved: true },
            { new: true }
        );
        
        if (!event) {
            return res.status(404).json({ 
                success: false, 
                message: 'Event not found' 
            });
        }
        
        res.json({ 
            success: true, 
            message: 'Event approved successfully', 
            event 
        });
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
        res.status(500).json({ 
            success: false, 
            message: 'Server Error', 
            error: error.message 
        });
    }
};
