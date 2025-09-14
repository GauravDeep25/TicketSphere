import mongoose from 'mongoose';

const commissionSchema = new mongoose.Schema({
  // Transaction reference
  transactionId: { 
    type: String, 
    required: true,
    unique: true 
  },
  
  // Payment session reference
  paymentSessionId: { 
    type: String, 
    required: true 
  },
  
  // Ticket and participants
  ticketId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Ticket',
    required: true 
  },
  sellerId: { 
    type: String, // Firebase UID
    required: true 
  },
  buyerId: { 
    type: String, // Firebase UID
    required: true 
  },
  
  // Financial details
  ticketPrice: { 
    type: Number, 
    required: true 
  },
  sellerCommissionRate: { 
    type: Number, 
    default: 0.05 // 5%
  },
  buyerCommissionRate: { 
    type: Number, 
    default: 0.05 // 5%
  },
  sellerCommissionAmount: { 
    type: Number, 
    required: true 
  },
  buyerCommissionAmount: { 
    type: Number, 
    required: true 
  },
  totalCommissionAmount: { 
    type: Number, 
    required: true 
  },
  
  // Payment breakdown
  sellerReceives: { 
    type: Number, 
    required: true // ticketPrice - sellerCommissionAmount
  },
  buyerPays: { 
    type: Number, 
    required: true // ticketPrice + buyerCommissionAmount
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'processed', 'failed', 'refunded'],
    default: 'pending'
  },
  
  // Admin tracking (who receives the commission)
  adminId: { 
    type: String, // Firebase UID of admin account
    required: true 
  },
  
  // Timestamps for processing
  processedAt: Date,
  refundedAt: Date,
  
  // Additional metadata
  notes: String
  
}, { timestamps: true });

// Indexes for efficient queries (transactionId index is already created by unique: true)
commissionSchema.index({ sellerId: 1, createdAt: -1 });
commissionSchema.index({ buyerId: 1, createdAt: -1 });
commissionSchema.index({ adminId: 1, createdAt: -1 });
commissionSchema.index({ status: 1 });

// Methods
commissionSchema.methods.markAsProcessed = function() {
  this.status = 'processed';
  this.processedAt = new Date();
};

commissionSchema.methods.markAsFailed = function() {
  this.status = 'failed';
};

commissionSchema.methods.markAsRefunded = function() {
  this.status = 'refunded';
  this.refundedAt = new Date();
};

// Static methods for calculations
commissionSchema.statics.calculateCommissions = function(ticketPrice, sellerRate = 0.05, buyerRate = 0.05) {
  const sellerCommissionAmount = Math.round(ticketPrice * sellerRate * 100) / 100; // Round to 2 decimal places
  const buyerCommissionAmount = Math.round(ticketPrice * buyerRate * 100) / 100;
  const totalCommissionAmount = sellerCommissionAmount + buyerCommissionAmount;
  const sellerReceives = ticketPrice - sellerCommissionAmount;
  const buyerPays = ticketPrice + buyerCommissionAmount;
  
  return {
    sellerCommissionAmount,
    buyerCommissionAmount,
    totalCommissionAmount,
    sellerReceives,
    buyerPays
  };
};

const Commission = mongoose.model('Commission', commissionSchema);
export default Commission;