import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MessageCircle, Search, ChevronDown } from 'lucide-react';
import './HelpPage.css';

const HelpPage = () => {
  const [expandedFaq, setExpandedFaq] = useState(null);

  const faqs = [
    {
      question: "How do I buy tickets on TicketSphere?",
      answer: "Browse events, select your preferred seats, and complete the purchase with secure payment. Your tickets will be delivered instantly via email."
    },
    {
      question: "Is it safe to buy tickets here?",
      answer: "Yes! All transactions are secured with 256-bit SSL encryption. We also offer buyer protection guarantee."
    },
    {
      question: "How do I sell my tickets?",
      answer: "Create a seller account, list your tickets with photos and details, and we'll handle the rest. You get paid securely once sold."
    },
    {
      question: "What if an event is cancelled?",
      answer: "If an event is officially cancelled, you'll receive a full refund within 5-7 business days."
    },
    {
      question: "How do I transfer tickets to someone else?",
      answer: "Go to 'My Tickets' in your account, select the ticket, and use the 'Transfer' option to send to another email address."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, debit cards, UPI, net banking, and digital wallets for secure transactions."
    },
    {
      question: "How do I get a refund?",
      answer: "Refund policies vary by event. Check the event details for specific refund terms or contact our support team for assistance."
    },
    {
      question: "Can I change my ticket after purchase?",
      answer: "Ticket modifications depend on the event organizer's policy. Contact support within 24 hours of purchase for possible changes."
    }
  ];

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="help-page-container">
      {/* Hero Section */}
      <div className="help-hero">
        <div className="help-hero-content">
          <h1 className="help-hero-title">Help & Support</h1>
          <p className="help-hero-subtitle">
            Find answers to common questions or get in touch with our support team.
          </p>
          <div className="help-search-container">
            <Search className="help-search-icon" size={20} />
            <input 
              type="text" 
              placeholder="Search for help..."
              className="help-search-input"
            />
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="help-faq">
        <div className="help-faq-content">
          <h2 className="help-faq-title">Frequently Asked Questions</h2>
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div key={index} className="faq-item">
                <button
                  className="faq-question"
                  onClick={() => toggleFaq(index)}
                >
                  <span>{faq.question}</span>
                  <ChevronDown 
                    className={`faq-chevron ${expandedFaq === index ? 'expanded' : ''}`}
                    size={20}
                  />
                </button>
                <div className={`faq-answer ${expandedFaq === index ? 'expanded' : ''}`}>
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="help-contact">
        <div className="help-contact-content">
          <h2 className="help-contact-title">Still Need Help?</h2>
          <div className="contact-cards">
            <div className="contact-card">
              <div className="contact-icon email">
                <Mail size={24} />
              </div>
              <h3 className="contact-card-title">Email Support</h3>
              <p className="contact-card-description">
                Get detailed help via email. We typically respond within 24 hours.
              </p>
              <a href="mailto:support@ticketsphere.com" className="contact-button">
                <Mail size={16} />
                Send Email
              </a>
            </div>
            <div className="contact-card">
              <div className="contact-icon phone">
                <Phone size={24} />
              </div>
              <h3 className="contact-card-title">Phone Support</h3>
              <p className="contact-card-description">
                Call us for immediate assistance. Available 24/7 for urgent issues.
              </p>
              <a href="tel:+911800123456" className="contact-button">
                <Phone size={16} />
                Call Now
              </a>
            </div>
            <div className="contact-card">
              <div className="contact-icon chat">
                <MessageCircle size={24} />
              </div>
              <h3 className="contact-card-title">Live Chat</h3>
              <p className="contact-card-description">
                Chat with our support team in real-time. Get instant answers.
              </p>
              <button className="contact-button">
                <MessageCircle size={16} />
                Start Chat
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
