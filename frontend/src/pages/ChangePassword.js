import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';

const ChangePassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleChange = async () => {
    try {
      await axios.post('/auth/change-password', {
        userId: user.id,
        newPassword
      });
      alert('Lösenordet har uppdaterats!');
      navigate('/kanban');
    } catch (err) {
      alert('Fel vid byte av lösenord');
    }
  };


};

export default ChangePassword;
