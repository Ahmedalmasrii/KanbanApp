import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FaBox, FaClipboardList, FaTruck, FaUserCheck, FaUserLock, FaBoxes } from 'react-icons/fa';

const StatsPanel = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/stats', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setStats(res.data);
      } catch (err) {
        console.error('Fel vid hämtning av statistik:', err);
      }
    };
    fetchStats();
  }, []);

  if (!stats) return <div className="text-white p-6">Laddar statistik...</div>;

  const chartData = [
    { name: 'Att beställa', value: stats.toOrder },
    { name: 'Beställda', value: stats.ordered },
    { name: 'Levererade', value: stats.delivered }
  ];

  const statCards = [
    { title: 'Totalt antal beställningar', icon: <FaBoxes size={20} />, value: stats.totalOrders },
    { title: 'Att beställa', icon: <FaClipboardList size={20} />, value: stats.toOrder },
    { title: 'Beställda', icon: <FaBox size={20} />, value: stats.ordered },
    { title: 'Levererade', icon: <FaTruck size={20} />, value: stats.delivered },
    { title: 'Aktiva användare', icon: <FaUserCheck size={20} />, value: stats.activeUsers },
    { title: 'Låsta konton', icon: <FaUserLock size={20} />, value: stats.lockedUsers }
  ];

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6 text-center">📊 Statistikpanel</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {statCards.map((card, index) => (
          <div key={index} className="bg-gray-800 p-5 rounded-2xl shadow-md flex items-center justify-between hover:shadow-lg transition duration-300">
            <div className="text-left">
              <p className="text-sm text-gray-400">{card.title}</p>
              <h2 className="text-3xl font-bold mt-1">{card.value}</h2>
            </div>
            <div className="text-indigo-400">{card.icon}</div>
          </div>
        ))}
      </div>

      <div className="bg-gray-800 p-6 rounded-2xl shadow-md">
        <h2 className="text-xl font-semibold mb-4">📦 Statusfördelning</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="name" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip />
            <Bar dataKey="value" fill="#4F46E5" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatsPanel;
