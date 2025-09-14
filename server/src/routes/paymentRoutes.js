import express from 'express';
import {
  initiatePayment,
  verifyPayment,
  getPaymentStatus,
  getCommissionInfo
} from '../controllers/paymentController.js';
import { protect, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All payment routes require authentication
router.use(protect);

// Payment routes
router.post('/initiate', initiatePayment);
router.post('/verify', verifyPayment);
router.get('/status/:sessionId', getPaymentStatus);

// Admin only routes
router.get('/commissions', isAdmin, getCommissionInfo);

export default router;