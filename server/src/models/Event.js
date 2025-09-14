import mongoose from 'mongoose';

// This sub-schema defines the different types of tickets available for an event
const ticketTypeSchema = new mongoose.Schema({
  type: { type: String, required: true, trim: true }, // e.g., "VIP", "General Admission"
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  sold: { type: Number, default: 0 }
});

const eventSchema = new mongoose.Schema({
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
    type: String, 
    required: true 
  }, // Firebase UID instead of ObjectId
  ticketTypes: [ticketTypeSchema],
  isApproved: { type: Boolean, default: false }, // For Admin approval
  isSoldOut: { type: Boolean, default: false }, // Track if event is completely sold out
}, { timestamps: true });

// Virtual to check if event is sold out
eventSchema.virtual('soldOutStatus').get(function() {
  const allSoldOut = this.ticketTypes.every(ticket => ticket.sold >= ticket.quantity);
  return allSoldOut;
});

// Method to update sold-out status
eventSchema.methods.updateSoldOutStatus = function() {
  const wasEventSoldOut = this.isSoldOut;
  const isNowSoldOut = this.ticketTypes.every(ticket => ticket.sold >= ticket.quantity);
  
  if (!wasEventSoldOut && isNowSoldOut) {
    this.isSoldOut = true;
    console.log(`Event "${this.title}" is now sold out!`);
  } else if (wasEventSoldOut && !isNowSoldOut) {
    this.isSoldOut = false;
    console.log(`Event "${this.title}" has tickets available again.`);
  }
  
  return this.isSoldOut;
};

// Pre-save middleware to automatically update sold-out status
eventSchema.pre('save', function(next) {
  this.updateSoldOutStatus();
  next();
});

const Event = mongoose.model('Event', eventSchema);
export default Event;
