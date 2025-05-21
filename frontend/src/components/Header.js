import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleHome = () => {
    navigate('/kanban');
  };

  return (
    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-900 to-blue-900 text-white shadow-md">
      <div className="flex items-center gap-4">
        <span className="text-lg font-bold">📦 Beställnings-Kanban</span>
        <span className="text-sm bg-indigo-600 px-2 py-1 rounded">
          Inloggad som: <strong>{user?.role}</strong>
        </span>
        <span className="text-sm text-gray-300">🕒 {time.toLocaleTimeString()}</span>
      </div>

      <div className="flex items-center gap-2">
        {location.pathname !== '/kanban' && (
          <button
            onClick={handleBack}
            className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded shadow"
          >
            ⬅️ Tillbaka
          </button>
        )}

        {user && (
          <button
            onClick={handleHome}
            className="bg-blue-700 hover:bg-blue-600 text-white px-3 py-1 rounded shadow"
          >
            🏠 Hem
          </button>
        )}

        {(user?.role === 'admin' || user?.role === 'manager') && (
          <button
            onClick={() => navigate('/stats')}
            className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1 rounded shadow"
          >
            📊 Statistik
          </button>
        )}

        {user?.role === 'admin' && (
          <button
            onClick={() => navigate('/admin')}
            className="bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-1 rounded shadow"
          >
            ⚙️ Adminpanel
          </button>
        )}

        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded shadow"
        >
          🔒 Logga ut
        </button>
      </div>
    </div>
  );
};

export default Header;
