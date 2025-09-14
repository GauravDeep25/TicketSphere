import express from 'express';
import {
  createTicketListing,
  getTicketListings,
  getTicketById,
  updateTicketStatus,
  getMyTicketListings,
  getMyTicketPurchases,
  getMyTicketsSummary
} from '../controllers/ticketController.js';
import { protect, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getTicketListings);
router.get('/:id', getTicketById);

// Protected routes (require authentication)
router.use(protect);

router.post('/', createTicketListing);
router.get('/my/listings', getMyTicketListings);
router.get('/my/purchases', getMyTicketPurchases);
router.get('/my/summary', getMyTicketsSummary);

// Admin only routes
router.put('/:id/status', isAdmin, updateTicketStatus);

export default router;
