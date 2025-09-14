import express from 'express';
import { getAllUsers, updateUserRole } from '../controllers/userController.js';
import { protect, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All routes require admin access
router.use(protect, isAdmin);

router.get('/', getAllUsers);
router.patch('/:id/role', updateUserRole);

export default router;
