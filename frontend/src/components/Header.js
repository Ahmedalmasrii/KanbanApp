import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../api/axios';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));
  const [time, setTime] = useState(new Date());
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(res.data);
      } catch (err) {
        console.error('Kunde inte hämta notifikationer');
      }
    };

    if (user) fetchNotifications();
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleBack = () => navigate(-1);
  const handleHome = () => navigate('/kanban');

  const toggleDropdown = async () => {
    const newState = !showDropdown;
    setShowDropdown(newState);

    if (!newState) {
      try {
        const token = localStorage.getItem('token');
        await axios.put('/notifications/read', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications([]);
      } catch (err) {
        console.error('Kunde inte markera notifikationer som lästa');
      }
    }
  };

  return (
    <div className="p-4 bg-gradient-to-r from-purple-900 to-blue-900 text-white shadow-md relative">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-lg font-bold block">📦 Beställnings-Kanban</span>
          <span className="text-sm bg-indigo-600 px-2 py-1 rounded block mt-1">
            Inloggad som: <strong>{user?.username} ({user?.role})</strong>
          </span>
          <span className="text-sm text-gray-300 block">🕒 {time.toLocaleTimeString()}</span>
        </div>

        <div className="md:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-white focus:outline-none">
            ☰
          </button>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <button onClick={toggleDropdown} className="relative z-10">
            🔔
            {notifications.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-1 rounded-full">
                {notifications.length}
              </span>
            )}
          </button>

          {location.pathname !== '/kanban' && (
            <button onClick={handleBack} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded shadow">
              ⬅️ Tillbaka
            </button>
          )}

          {user && (
            <button onClick={handleHome} className="bg-blue-700 hover:bg-blue-600 text-white px-3 py-1 rounded shadow">
              🏠 Hem
            </button>
          )}

          {(user?.role === 'admin' || user?.role === 'manager') && (
            <button onClick={() => navigate('/stats')} className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1 rounded shadow">
              📊 Statistik
            </button>
          )}

          {(user?.role === 'admin' || user?.role === 'manager') && (
            <button onClick={() => navigate('/audit')} className="bg-pink-600 hover:bg-pink-500 text-white px-3 py-1 rounded shadow">
              📜 Audit Trail
            </button>
          )}

          {user?.role === 'admin' && (
            <button onClick={() => navigate('/admin')} className="bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-1 rounded shadow">
              ⚙️ Adminpanel
            </button>
          )}

          <button onClick={handleLogout} className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded shadow">
            🔒 Logga ut
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden mt-4 space-y-2">
          <button onClick={toggleDropdown} className="block w-full bg-gray-700 px-4 py-2 rounded">🔔 Notiser</button>
          {location.pathname !== '/kanban' && (
            <button onClick={handleBack} className="block w-full bg-gray-700 px-4 py-2 rounded">⬅️ Tillbaka</button>
          )}
          {user && (
            <button onClick={handleHome} className="block w-full bg-blue-700 px-4 py-2 rounded">🏠 Hem</button>
          )}
          {(user?.role === 'admin' || user?.role === 'manager') && (
            <button onClick={() => navigate('/stats')} className="block w-full bg-purple-600 px-4 py-2 rounded">📊 Statistik</button>
          )}
          {(user?.role === 'admin' || user?.role === 'manager') && (
            <button onClick={() => navigate('/audit')} className="block w-full bg-pink-600 px-4 py-2 rounded">📜 Audit Trail</button>
          )}
          {user?.role === 'admin' && (
            <button onClick={() => navigate('/admin')} className="block w-full bg-yellow-600 px-4 py-2 rounded">⚙️ Adminpanel</button>
          )}
          <button onClick={handleLogout} className="block w-full bg-red-600 px-4 py-2 rounded">🔒 Logga ut</button>
        </div>
      )}

      {showDropdown && (
        <div className="absolute right-4 top-20 bg-white text-black rounded-lg shadow-2xl w-72 z-50 overflow-hidden animate-fadeIn">
          <div className="bg-indigo-600 text-white px-4 py-2 font-semibold">
            🔔 Notifikationer
          </div>
          {notifications.length === 0 ? (
            <p className="p-4 text-sm text-center text-gray-500">Inga nya notiser</p>
          ) : (
            <ul className="divide-y divide-gray-200 max-h-80 overflow-y-auto">
              {notifications.map((n, i) => {
                const msg = n.text || n.message || "";
                return (
                  <li key={i} className="p-3 hover:bg-gray-100 transition text-sm flex items-start gap-2">
                    <span>
                      {msg.includes("delivered") ? "✅" : msg.includes("ordered") ? "📦" : "ℹ️"}
                    </span>
                    <span>{msg}</span>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="p-2 border-t border-gray-200 text-center">
            <button
              onClick={async () => {
                try {
                  const token = localStorage.getItem('token');
                  await axios.put('/notifications/read', {}, {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  setNotifications([]);
                  setShowDropdown(false);
                } catch (err) {
                  console.error('Kunde inte markera notifikationer som lästa');
                }
              }}
              className="text-indigo-600 hover:underline text-sm"
            >
              Markera som lästa & stäng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
