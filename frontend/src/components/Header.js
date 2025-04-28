import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="flex justify-between items-center p-4 bg-gray-200 mb-4">
      <span className="text-gray-800">
        Inloggad som: <strong>{user?.role}</strong>
      </span>

   
    </div>
  );
};

export default Header;
