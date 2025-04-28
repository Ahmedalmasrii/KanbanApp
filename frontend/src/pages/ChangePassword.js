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

  return (
    <div className="flex flex-col items-center mt-20 gap-4">
      <h2 className="text-xl font-bold">Byt lösenord</h2>
      <input
        type="password"
        placeholder="Nytt lösenord"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className="border px-4 py-2 rounded"
      />
      <button
        onClick={handleChange}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Uppdatera lösenord
      </button>
    </div>
  );
};

export default ChangePassword;
