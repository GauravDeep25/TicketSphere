import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, Menu, X, User, LogOut, Settings, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // Get auth context
  const { currentUser, logout, getUserDisplayName, isAuthenticated } = useAuth();

  // Check if current user is admin
  const isAdmin = currentUser?.email === 'gauravdeepgd12007@gmail.com';

  useEffect(() => {
    // Check for saved theme preference or default to dark mode
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      setIsDarkMode(prefersDark);
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="navbar">
      <div className="container nav-container">
        <Link to="/" className="logo">TicketSphere</Link>
        <nav className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
          <Link to="/events" onClick={() => setIsMenuOpen(false)}>Events</Link>
          <Link to="/sell" onClick={() => setIsMenuOpen(false)}>Sell Tickets</Link>
          {isAuthenticated && (
            <Link to="/my-tickets" onClick={() => setIsMenuOpen(false)}>My Tickets</Link>
          )}
          <Link to="/help" onClick={() => setIsMenuOpen(false)}>Help</Link>
          
          {/* Mobile auth section */}
          {isMenuOpen && (
            <div className="mobile-auth-section">
              {isAuthenticated ? (
                <div className="mobile-user-info">
                  <div className="mobile-user-details">
                    <span className="mobile-user-name">{getUserDisplayName(currentUser)}</span>
                    <span className="mobile-user-email">{currentUser?.email || currentUser?.phoneNumber}</span>
                  </div>
                  <Link to="/my-tickets" className="mobile-menu-item" onClick={() => setIsMenuOpen(false)}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                    My Tickets
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="mobile-menu-item" onClick={() => setIsMenuOpen(false)}>
                      <Shield size={16} />
                      Admin Dashboard
                    </Link>
                  )}
                  <Link to="/profile" className="mobile-menu-item" onClick={() => setIsMenuOpen(false)}>
                    <Settings size={16} />
                    Profile Settings
                  </Link>
                  <button className="mobile-menu-item mobile-logout" onClick={() => { handleLogout(); setIsMenuOpen(false); }}>
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="mobile-auth-links">
                  <Link to="/login" className="mobile-login-link" onClick={() => setIsMenuOpen(false)}>Log In</Link>
                  <Link to="/register" className="mobile-signup-button" onClick={() => setIsMenuOpen(false)}>Sign Up</Link>
                </div>
              )}
            </div>
          )}
        </nav>
        <div className="nav-actions">
          <button 
            className="theme-button hide-on-mobile"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          {/* Conditional rendering based on authentication */}
          {isAuthenticated ? (
            <div className="user-menu-container">
              <button 
                className="user-menu-button"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <User size={20} />
                <span className="user-name">{getUserDisplayName(currentUser)}</span>
              </button>
              
              {/* User dropdown menu */}
              {showUserMenu && (
                <div className="user-dropdown">
                  <div className="user-info">
                    <p className="user-email">{currentUser?.email || currentUser?.phoneNumber}</p>
                  </div>
                  <div className="dropdown-divider"></div>
                  <Link to="/my-tickets" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                    My Tickets
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="dropdown-item admin-item" onClick={() => setShowUserMenu(false)}>
                      <Shield size={16} />
                      Admin Dashboard
                    </Link>
                  )}
                  <Link to="/profile" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                    <Settings size={16} />
                    Profile Settings
                  </Link>
                  <button className="dropdown-item logout-item" onClick={handleLogout}>
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="login-link">Log In</Link>
              <Link to="/register" className="signup-button">Sign Up</Link>
            </>
          )}
          
          <button className="mobile-menu-button" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      {/* Overlay to close user menu when clicking outside */}
      {showUserMenu && (
        <div 
          className="user-menu-overlay" 
          onClick={() => setShowUserMenu(false)}
        ></div>
      )}
    </header>
  );
};

export default Navbar;
