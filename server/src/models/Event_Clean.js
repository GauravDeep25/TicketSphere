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
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  ticketTypes: [ticketTypeSchema],
  isApproved: { type: Boolean, default: false }, // For Admin approval
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);
export default Event;
