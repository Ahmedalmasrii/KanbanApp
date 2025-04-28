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

      <div className="flex gap-2">
        {user?.role === 'admin' && (
          <button
            onClick={() => navigate('/admin')}
            className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
          >
            Adminpanel
          </button>
        )}

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
        >
          Logga ut
        </button>
      </div>
    </div>
  );
};

export default Header;
