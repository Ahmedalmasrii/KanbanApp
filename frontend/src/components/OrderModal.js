
import React, { useState, useEffect } from 'react';
import axios from '../api/axios';

const OrderModal = ({ order, onClose, fetchOrders }) => {
  const [comment, setComment] = useState('');
  const [assignedTo, setAssignedTo] = useState(order.assignedTo || '');
  const [timeline, setTimeline] = useState([]);
  const [managers, setManagers] = useState([]);

  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  const isManagerOrAdmin = ['manager', 'admin'].includes(user?.role);

  useEffect(() => {
    if (!order?._id) return;

    // Hämta kommentarhistorik
    axios.get(`/orders/${order._id}/comments`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setTimeline(res.data))
      .catch(() => setTimeline([]));

    // Hämta alla managers
    axios.get('/users/managers', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setManagers(res.data))
      .catch(() => setManagers([]));
  }, [order._id]);

  const handleSave = async () => {
    try {
      if (comment) {
        await axios.post(`/orders/${order._id}/comments`, { text: comment }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      if (assignedTo) {
        await axios.put(`/orders/${order._id}/assign`, { assignedTo }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      fetchOrders();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Kunde inte spara ändringar');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white text-black p-6 rounded-lg w-full max-w-md shadow-xl">
        <h2 className="text-xl font-semibold mb-4">📝 Ändra beställning</h2>

        {isManagerOrAdmin && (
          <>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Kommentar</label>
              <textarea
                rows="3"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Skriv en kommentar..."
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1 font-medium">Tilldela till chef</label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="">-- Välj chef --</option>
                {managers.map(manager => (
                  <option key={manager._id} value={manager._id}>
                    {manager.username} ({manager.email})
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

      
      </div>
    </div>
  );
};

export default OrderModal;
