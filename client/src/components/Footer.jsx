import React from 'react';
import './footer.css';

const Footer = () => (
    <footer className="footer">
        <div className="container footer-container">
            <div className="footer-grid">
                <div className="footer-about">
                    <h3 className="footer-logo">TicketSphere</h3>
                    <p>India's most trusted ticket marketplace.</p>
                </div>
                <div className="footer-links">
                    <h4 className="footer-heading">Quick Links</h4>
                    <ul>
                        <li><a href="#">About Us</a></li>
                        <li><a href="#">Sell Tickets</a></li>
                        <li><a href="#">Contact Us</a></li>
                        <li><a href="#">FAQs</a></li>
                    </ul>
                </div>
                <div className="footer-links">
                    <h4 className="footer-heading">Legal</h4>
                    <ul>
                        <li><a href="#">Privacy Policy</a></li>
                        <li><a href="#">Terms of Service</a></li>
                    </ul>
                </div>
                <div className="footer-links">
                    <h4 className="footer-heading">Explore</h4>
                    <ul>
                        <li><a href="#">Concerts</a></li>
                        <li><a href="#">Sports</a></li>
                        <li><a href="#">Comedy</a></li>
                        <li><a href="#">Festivals</a></li>
                    </ul>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} TicketSphere. All Rights Reserved.</p>
            </div>
        </div>
    </footer>
);

export default Footer;
