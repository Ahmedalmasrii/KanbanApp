import React, { useState } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      const decoded = JSON.parse(atob(res.data.token.split('.')[1]));
      localStorage.setItem('user', JSON.stringify({ id: decoded.id, role: decoded.role }));
      if (res.data.mustChangePassword) {
        navigate('/change-password');
      } else {
        navigate('/kanban');
      }
    } catch (err) {
      alert('Fel inloggning');
    }
  };

  
};

export default Login;
