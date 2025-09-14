import Event from '../models/Event.js';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';

// Sample events data for testing
const sampleEvents = [
  {
    title: 'Tech Conference 2025',
    description: 'A conference about the latest in technology and innovation.',
    date: new Date('2025-10-15T09:00:00Z'),
    location: 'Mumbai',
    venue: 'Bombay Convention Center',
    category: 'Conference',
    seller: 'user123', // Sample seller ID
    ticketTypes: [
      { type: 'Early Bird', price: 2500, quantity: 100, sold: 0 },
      { type: 'Regular', price: 3500, quantity: 200, sold: 0 }
    ],
    isApproved: false, // Pending approval
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'Rock Concert - Mumbai',
    description: 'An amazing rock concert featuring top bands.',
    date: new Date('2025-11-20T19:00:00Z'),
    location: 'Mumbai',
    venue: 'NSCI Stadium',
    category: 'Concert',
    seller: 'user456',
    ticketTypes: [
      { type: 'General', price: 1500, quantity: 500, sold: 0 },
      { type: 'VIP', price: 5000, quantity: 50, sold: 0 }
    ],
    isApproved: false, // Pending approval
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'Food Festival',
    description: 'A festival celebrating diverse cuisines from around the world.',
    date: new Date('2025-12-05T11:00:00Z'),
    location: 'Delhi',
    venue: 'India Gate Grounds',
    category: 'Festival',
    seller: 'user789',
    ticketTypes: [
      { type: 'Day Pass', price: 800, quantity: 1000, sold: 150 },
      { type: 'Weekend Pass', price: 1500, quantity: 300, sold: 45 }
    ],
    isApproved: true, // Already approved
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'Stand-up Comedy Night',
    description: 'An evening of laughter with top comedians.',
    date: new Date('2025-09-25T20:00:00Z'),
    location: 'Bangalore',
    venue: 'Comedy Club Central',
    category: 'Entertainment',
    seller: 'user101',
    ticketTypes: [
      { type: 'Standard', price: 600, quantity: 100, sold: 75 },
      { type: 'Premium', price: 1200, quantity: 50, sold: 30 }
    ],
    isApproved: true, // Already approved
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function createSampleEvents() {
  try {
    // Connect to database
    await connectDB();
    
    console.log('🗄️  Connected to MongoDB');
    
    // Clear existing events (optional)
    await Event.deleteMany({});
    console.log('🧹 Cleared existing events');
    
    // Insert sample events
    const createdEvents = await Event.insertMany(sampleEvents);
    console.log(`✅ Created ${createdEvents.length} sample events:`);
    
    createdEvents.forEach((event, index) => {
      console.log(`   ${index + 1}. ${event.title} (${event.isApproved ? 'Approved' : 'Pending'})`);
    });
    
    console.log('\n📊 Summary:');
    const pendingCount = createdEvents.filter(e => !e.isApproved).length;
    const approvedCount = createdEvents.filter(e => e.isApproved).length;
    console.log(`   - Pending events: ${pendingCount}`);
    console.log(`   - Approved events: ${approvedCount}`);
    console.log(`   - Total events: ${createdEvents.length}`);
    
    console.log('\n🎉 Sample data creation completed!');
    
  } catch (error) {
    console.error('❌ Error creating sample events:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('🔒 Database connection closed');
  }
}

// Run the script
createSampleEvents();
