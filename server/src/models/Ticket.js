import mongoose from 'mongoose';

// This sub-schema defines the different types of tickets available for an approved event
const ticketTypeSchema = new mongoose.Schema({
  type: { type: String, required: true, trim: true }, // e.g., "VIP", "General Admission"
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  sold: { type: Number, default: 0 }
});

// Ticket schema represents approved events that are available for purchase
// Events get moved from the 'events' collection to 'tickets' collection after admin approval
const ticketSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  venue: { type: String, required: true }, // e.g., "Wankhede Stadium"
  category: { 
    type: String, 
    required: true,
    enum: ['Concert', 'Sports', 'Comedy', 'Festival', 'Movie', 'Other']
  },
  imageUrl: { type: String }, // Link to the event poster/image
  seller: { 
    type: String, // Firebase UID of the seller
    required: true 
  },
  ticketTypes: [ticketTypeSchema],
  
  // Approval tracking
  approvedBy: {
    type: String, // Firebase UID of admin who approved
    required: true
  },
  approvedAt: {
    type: Date,
    default: Date.now
  },
  
  // Reference to original event
  originalEventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  
  // Status tracking
  isActive: { type: Boolean, default: true },
  isSoldOut: { type: Boolean, default: false },
  
  // Calculated fields
  totalTickets: { type: Number, default: 0 },
  soldTickets: { type: Number, default: 0 }
  
}, { timestamps: true });

// Pre-save middleware to calculate sold-out status
ticketSchema.pre('save', function(next) {
  const totalTickets = this.ticketTypes.reduce((sum, type) => sum + type.quantity, 0);
  const soldTickets = this.ticketTypes.reduce((sum, type) => sum + type.sold, 0);
  
  this.totalTickets = totalTickets;
  this.soldTickets = soldTickets;
  this.isSoldOut = soldTickets >= totalTickets;
  
  next();
});

const Ticket = mongoose.model('Ticket', ticketSchema);
export default Ticket;

