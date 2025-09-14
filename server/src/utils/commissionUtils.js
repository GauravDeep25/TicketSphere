import User from '../models/User.js';
import Commission from '../models/Commission.js';
import mongoose from 'mongoose';

/**
 * Calculate commission amounts for a transaction
 * @param {number} ticketPrice - The original ticket price
 * @param {number} sellerRate - Seller commission rate (default 5%)
 * @param {number} buyerRate - Buyer commission rate (default 5%)
 * @returns {object} Commission calculation breakdown
 */
export const calculateCommissions = (ticketPrice, sellerRate = 0.05, buyerRate = 0.05) => {
  const sellerCommissionAmount = Math.round(ticketPrice * sellerRate * 100) / 100;
  const buyerCommissionAmount = Math.round(ticketPrice * buyerRate * 100) / 100;
  const totalCommissionAmount = sellerCommissionAmount + buyerCommissionAmount;
  const sellerReceives = Math.round((ticketPrice - sellerCommissionAmount) * 100) / 100;
  const buyerPays = Math.round((ticketPrice + buyerCommissionAmount) * 100) / 100;
  
  return {
    sellerCommissionAmount,
    buyerCommissionAmount,
    totalCommissionAmount,
    sellerReceives,
    buyerPays,
    originalPrice: ticketPrice
  };
};

/**
 * Find or create the default admin account to receive commissions
 * @returns {Promise<User>} Admin user document
 */
export const getCommissionRecipientAdmin = async () => {
  try {
    // Look for an existing admin user
    let admin = await User.findOne({ role: 'admin' });
    
    if (!admin) {
      // Create a default admin account for commission collection
      admin = await User.create({
        name: 'System Administrator',
        email: 'admin@ticketmarketplace.com',
        password: 'temp_password_' + Date.now(), // This should be changed in production
        phone: '0000000000',
        city: 'System',
        gender: 'other',
        dob: new Date('1990-01-01'),
        role: 'admin',
        emailVerified: true,
        balance: 0,
        totalCommissionEarned: 0
      });
    }
    
    return admin;
  } catch (error) {
    console.error('Error getting commission recipient admin:', error);
    throw new Error('Failed to get admin account for commissions');
  }
};

/**
 * Create a commission record for a transaction
 * @param {object} params - Commission parameters
 * @returns {Promise<Commission>} Created commission document
 */
export const createCommissionRecord = async ({
  transactionId,
  paymentSessionId,
  ticketId,
  sellerId,
  buyerId,
  ticketPrice,
  adminId,
  sellerRate = 0.05,
  buyerRate = 0.05
}) => {
  try {
    const commissions = calculateCommissions(ticketPrice, sellerRate, buyerRate);
    
    const commission = await Commission.create({
      transactionId,
      paymentSessionId,
      ticketId,
      sellerId,
      buyerId,
      ticketPrice,
      sellerCommissionRate: sellerRate,
      buyerCommissionRate: buyerRate,
      sellerCommissionAmount: commissions.sellerCommissionAmount,
      buyerCommissionAmount: commissions.buyerCommissionAmount,
      totalCommissionAmount: commissions.totalCommissionAmount,
      sellerReceives: commissions.sellerReceives,
      buyerPays: commissions.buyerPays,
      adminId,
      status: 'pending'
    });
    
    return commission;
  } catch (error) {
    console.error('Error creating commission record:', error);
    throw new Error('Failed to create commission record');
  }
};

/**
 * Process commission payment to admin
 * @param {string} commissionId - Commission document ID
 * @param {object} session - MongoDB session for transaction
 * @returns {Promise<Commission>} Updated commission document
 */
export const processCommissionPayment = async (commissionId, session = null) => {
  try {
    const commission = await Commission.findById(commissionId);
    
    if (!commission) {
      throw new Error('Commission record not found');
    }
    
    if (commission.status !== 'pending') {
      throw new Error(`Commission already processed. Status: ${commission.status}`);
    }
    
    // Update admin balance
    const admin = await User.findOne({ _id: commission.adminId }).session(session);
    if (!admin) {
      // Try finding by role if ID lookup fails
      const adminByRole = await User.findOne({ role: 'admin' }).session(session);
      if (!adminByRole) {
        throw new Error('Admin account not found for commission payment');
      }
      commission.adminId = adminByRole._id;
      await commission.save({ session });
    }
    
    // Add commission to admin balance and total earned
    await User.findByIdAndUpdate(
      commission.adminId,
      {
        $inc: {
          balance: commission.totalCommissionAmount,
          totalCommissionEarned: commission.totalCommissionAmount
        }
      },
      { session }
    );
    
    // Mark commission as processed
    commission.markAsProcessed();
    await commission.save({ session });
    
    return commission;
    
  } catch (error) {
    console.error('Error processing commission payment:', error);
    throw error;
  }
};

/**
 * Get commission statistics for admin dashboard
 * @param {string} adminId - Admin user ID (optional)
 * @param {object} dateRange - Date range filter (optional)
 * @returns {Promise<object>} Commission statistics
 */
export const getCommissionStats = async (adminId = null, dateRange = null) => {
  try {
    const filter = {};
    
    if (adminId) {
      filter.adminId = adminId;
    }
    
    if (dateRange && dateRange.start && dateRange.end) {
      filter.createdAt = {
        $gte: new Date(dateRange.start),
        $lte: new Date(dateRange.end)
      };
    }
    
    const stats = await Commission.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalCommissionAmount' },
          avgAmount: { $avg: '$totalCommissionAmount' }
        }
      }
    ]);
    
    const totalStats = await Commission.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalCommissionEarned: { $sum: '$totalCommissionAmount' },
          totalSellerCommission: { $sum: '$sellerCommissionAmount' },
          totalBuyerCommission: { $sum: '$buyerCommissionAmount' }
        }
      }
    ]);
    
    return {
      byStatus: stats,
      totals: totalStats[0] || {
        totalTransactions: 0,
        totalCommissionEarned: 0,
        totalSellerCommission: 0,
        totalBuyerCommission: 0
      }
    };
    
  } catch (error) {
    console.error('Error getting commission stats:', error);
    throw new Error('Failed to get commission statistics');
  }
};