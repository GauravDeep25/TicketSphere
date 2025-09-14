import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { isAdmin } from '../middlewares/isAdminMiddleware.js';
import {
  getPendingEvents,
  getApprovedEvents,
  approveEvent,
  rejectEvent,
  getAdminStats
} from '../controllers/adminController.js';

const router = express.Router();

// All admin routes are protected and require admin access
router.use(protect, isAdmin);

// @desc    Get all pending events for approval
// @route   GET /api/admin/events/pending
// @access  Admin only
router.get('/events/pending', getPendingEvents);

// @desc    Get all approved events
// @route   GET /api/admin/events/approved
// @access  Admin only
router.get('/events/approved', getApprovedEvents);

// @desc    Approve an event
// @route   PUT /api/admin/events/:id/approve
// @access  Admin only
router.put('/events/:id/approve', approveEvent);

// @desc    Reject/Delete an event
// @route   DELETE /api/admin/events/:id/reject
// @access  Admin only
router.delete('/events/:id/reject', rejectEvent);

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Admin only
router.get('/stats', getAdminStats);

export default router;
