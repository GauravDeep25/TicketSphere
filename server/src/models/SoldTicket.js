import mongoose from 'mongoose';

// Schema for purchased tickets - stores individual purchases
const soldTicketSchema = new mongoose.Schema({
  // Reference to the original ticket (from tickets collection)
  ticketId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Ticket',
    required: true 
  },
  
  // Event information (copied for quick access)
  eventTitle: { type: String, required: true },
  eventDate: { type: Date, required: true },
  eventLocation: { type: String, required: true },
  eventVenue: { type: String, required: true },
  
  // Ticket details
  ticketType: { type: String, required: true }, // VIP, General, etc.
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
  
  // Buyer information
  buyerId: { 
    type: String, 
    required: true 
  }, // Firebase UID of the buyer
  buyerEmail: { type: String, required: true },
  buyerName: { type: String, required: true },
  
  // Purchase details
  transactionId: { type: String, unique: true }, // For payment tracking
  purchaseStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'refunded'],
    default: 'confirmed'
  },
  
  // QR code or ticket verification
  ticketCode: { type: String, unique: true }, // Unique code for ticket verification
  
  // Additional metadata
  totalAmount: { type: Number, required: true },
  
}, { timestamps: true });

// Generate unique ticket code before saving
soldTicketSchema.pre('save', function(next) {
  if (!this.ticketCode) {
    this.ticketCode = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  if (!this.transactionId) {
    this.transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  next();
});

// Compound indexes for efficient queries
soldTicketSchema.index({ buyerId: 1, purchaseDate: -1 });
soldTicketSchema.index({ ticketId: 1 });
soldTicketSchema.index({ eventDate: 1 });

const SoldTicket = mongoose.model('SoldTicket', soldTicketSchema);

export default SoldTicket;
