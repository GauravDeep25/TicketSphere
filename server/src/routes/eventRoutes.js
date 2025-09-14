import express from 'express';
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getMyEvents,
  purchaseTickets,
  getTicketAvailability,
  getMyTickets
} from '../controllers/eventController.js';
import { protect, isSeller } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getEvents);
router.get('/:id', getEventById);
router.get('/:id/availability', getTicketAvailability);

// Protected routes (require authentication)
router.use(protect);

// User ticket routes
router.get('/user/my-tickets', getMyTickets);
router.post('/:id/purchase', purchaseTickets);

// Seller/Admin routes
router.post('/', isSeller, createEvent);
router.get('/seller/my-events', getMyEvents);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);

export default router;
