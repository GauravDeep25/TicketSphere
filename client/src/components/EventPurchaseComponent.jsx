import React, { useState } from 'react';
import API from '../api';

const EventPurchaseComponent = ({ event, ticketType, onSuccess, onCancel, onError }) => {
  const [purchaseStatus, setPurchaseStatus] = useState('processing'); // processing, success, failed
  const [error, setError] = useState(null);

  React.useEffect(() => {
    purchaseTicket();
  }, []);

  const purchaseTicket = async () => {
    try {
      setPurchaseStatus('processing');
      
      // Use the direct event purchase endpoint instead of payment initiation
      const response = await API.post(`/events/${event._id}/purchase`, {
        ticketTypeId: ticketType._id, // Assuming ticket types have _id
        quantity: 1
      });

      if (response.data.success) {
        setPurchaseStatus('success');
        onSuccess?.(response.data.data);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Purchase error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to purchase ticket';
      setError(errorMessage);
      setPurchaseStatus('failed');
      onError?.(errorMessage);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (purchaseStatus === 'processing') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Purchase</h3>
            <p className="text-gray-600">Please wait while we process your ticket purchase...</p>
            
            <div className="bg-gray-50 rounded-lg p-4 mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Event:</span>
                <span className="font-medium">{event.title}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Ticket Type:</span>
                <span className="font-medium">{ticketType.type}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold text-lg">{formatCurrency(ticketType.price)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (purchaseStatus === 'success') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Purchase Successful!</h3>
            <p className="text-gray-600 mb-6">Your ticket has been purchased successfully.</p>
            
            <button
              onClick={() => onSuccess?.()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              View My Tickets
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (purchaseStatus === 'failed') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Purchase Failed</h3>
            <p className="text-gray-600 mb-6">{error || 'There was an issue with your purchase.'}</p>
            
            <div className="space-y-3">
              <button
                onClick={purchaseTicket}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={onCancel}
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default EventPurchaseComponent;
