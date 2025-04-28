
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


};

export default OrderModal;
