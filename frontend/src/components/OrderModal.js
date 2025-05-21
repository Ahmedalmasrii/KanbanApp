import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';

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

    axios
      .get(`/orders/${order._id}/comments`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => setTimeline(res.data))
      .catch(() => setTimeline([]));

    axios
      .get('/users/managers', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => setManagers(res.data))
      .catch(() => setManagers([]));
  }, [order._id]);

  const handleSave = async () => {
    try {
      if (comment) {
        await axios.post(
          `/orders/${order._id}/comments`,
          { text: comment },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      if (assignedTo) {
        await axios.put(
          `/orders/${order._id}/assign`,
          { assignedTo },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      fetchOrders();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Kunde inte spara ändringar');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ scale: 0.8, y: -50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 50 }}
          transition={{ duration: 0.25 }}
          className="backdrop-blur-lg bg-white/10 text-white p-6 rounded-xl shadow-xl w-full max-w-lg border border-white/20"
        >
          <h2 className="text-2xl font-bold mb-4">📝 Ändra beställning</h2>

          {isManagerOrAdmin && (
            <>
              <div className="mb-4">
                <label className="block mb-1 font-medium text-white">
                  Kommentar
                </label>
                <textarea
                  rows="3"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full rounded px-3 py-2 bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring focus:ring-blue-500"
                  placeholder="Skriv en kommentar..."
                />
              </div>

              <div className="mb-4">
                <label className="block mb-1 font-medium text-white">
                  Tilldela till chef
                </label>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full rounded px-3 py-2 bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring focus:ring-blue-500"
                >
                  <option value="">-- Välj chef --</option>
                  {managers.map((manager) => (
                    <option key={manager._id} value={manager._id}>
                      {manager.username} ({manager.email})
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <h3 className="font-medium mt-6 mb-2">🕓 Kommentarhistorik</h3>
          <div className="bg-gray-900 p-3 rounded max-h-40 overflow-y-auto border border-gray-700 text-sm">
            {timeline.length > 0 ? (
              timeline.map((entry, index) => (
                <div key={index} className="mb-2">
                  <p className="font-semibold text-blue-300">
                    {entry.user} – {new Date(entry.timestamp).toLocaleString()}
                  </p>
                  <p className="ml-2 text-gray-300">{entry.text}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">Inga kommentarer ännu</p>
            )}
          </div>

          <div className="flex justify-end mt-6 gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
            >
              Avbryt
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
            >
              Spara
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OrderModal;
