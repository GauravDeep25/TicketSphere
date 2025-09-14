import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import Auth Context (Firebase-based)
import { AuthProvider } from './context/AuthContext';

// Import Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Import Page Components
import HomePage from './pages/HomePage';
import LoginPage from './pages/login';
import PhoneLoginPage from './pages/phone-login';
import RegisterPage from './pages/registration';
import ResetPasswordPage from './pages/forgot_password';
import EventsPage from './pages/EventsPage';
import SellTicketsPage from './pages/SellTicketsPage';
import ProfileSettingsPage from './pages/ProfileSettingsPage';
import AdminDashboard from './pages/AdminDashboard';
import HelpPage from './pages/HelpPage';
import NotFoundPage from './pages/NotFoundPage';
import TicketMarketplace from './pages/TicketMarketplace';
import MyTicketsPage from './pages/my_tickets';
import PaymentPage from './pages/PaymentPage';

// Import Global Styles
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-wrapper">
          <Navbar />
          <main>
            <Routes>
              {/* Define the route for each page */}
              <Route path="/" element={<HomePage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/marketplace" element={<TicketMarketplace />} />
              <Route path="/my-tickets" element={<MyTicketsPage />} />
              <Route path="/sell" element={<SellTicketsPage />} />
              <Route path="/sell-tickets" element={<SellTicketsPage />} />
              <Route path="/profile" element={<ProfileSettingsPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/help" element={<HelpPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/phone-login" element={<PhoneLoginPage />} />
              <Route path="/signup" element={<RegisterPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ResetPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/payment/:ticketId" element={<PaymentPage />} />
              {/* 404 Page - Must be last */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

