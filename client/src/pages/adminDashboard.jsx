import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
    const [pendingEvents, setPendingEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const api = axios.create({
        baseURL: import.meta.env.VITE_API_URL,
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Assuming you store token
        }
    });

    const fetchPendingEvents = async () => {
        try {
            const { data } = await api.get('/api/admin/events/pending');
            setPendingEvents(data);
        } catch (err) {
            setError('Failed to fetch events. You might not have admin privileges.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingEvents();
    }, []);

    const handleApprove = async (eventId) => {
        try {
            await api.patch(`/api/admin/events/${eventId}/approve`);
            // Refresh list after approval
            fetchPendingEvents(); 
        } catch (err) {
            alert('Failed to approve event.');
        }
    };
    
    const handleReject = async (eventId) => {
         try {
            await api.patch(`/api/admin/events/${eventId}/reject`);
            // Refresh list after rejection
            fetchPendingEvents();
        } catch (err) {
            alert('Failed to reject event.');
        }
    };

    if (loading) return <p className="text-center text-white">Loading...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;

    return (
        <div className="container mx-auto p-4 bg-gray-900 text-white min-h-screen">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard: Pending Events</h1>
            
            <div className="overflow-x-auto">
                <table className="min-w-full bg-gray-800 rounded-lg">
                    <thead>
                        <tr>
                            <th className="p-4 text-left">Event Title</th>
                            <th className="p-4 text-left">Seller Name</th>
                            <th className="p-4 text-left">Seller Email</th>
                            <th className="p-4 text-left">Date</th>
                            <th className="p-4 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pendingEvents.length > 0 ? pendingEvents.map(event => (
                            <tr key={event._id} className="border-b border-gray-700 hover:bg-gray-700">
                                <td className="p-4">{event.title}</td>
                                <td className="p-4">{event.seller?.name || 'N/A'}</td>
                                <td className="p-4">{event.seller?.email || 'N/A'}</td>
                                <td className="p-4">{new Date(event.date).toLocaleDateString()}</td>
                                <td className="p-4 flex gap-2">
                                    <button onClick={() => handleApprove(event._id)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Approve</button>
                                    <button onClick={() => handleReject(event._id)} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Reject</button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" className="p-4 text-center">No pending events.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminDashboard;
