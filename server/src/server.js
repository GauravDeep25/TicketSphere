import app from './app.js';
import connectDB from './config/db.js';
import './config/firebase.js'; // Initialize Firebase after environment is loaded

// Connect to database
connectDB();

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0'; // Allow access from any IP on the network

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on ${HOST}:${PORT}`);
  console.log(`📡 Health check available at: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Network access available at: http://[YOUR_LOCAL_IP]:${PORT}/api/health`);
});
