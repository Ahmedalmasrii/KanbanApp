import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

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

  if (!stats) return <div className="text-white">Laddar statistik...</div>;

  const chartData = [
    { name: 'Att beställa', value: stats.toOrder },
    { name: 'Beställda', value: stats.ordered },
    { name: 'Levererade', value: stats.delivered }
  ];

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">📊 Statistikpanel</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-10">
        <StatCard title="Totalt antal beställningar" value={stats.totalOrders} />
        <StatCard title="Att beställa" value={stats.toOrder} />
        <StatCard title="Beställda" value={stats.ordered} />
        <StatCard title="Levererade" value={stats.delivered} />
        <StatCard title="Aktiva användare" value={stats.activeUsers} />
        <StatCard title="Låsta konton" value={stats.lockedUsers} />
      </div>

      <div className="bg-gray-800 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Statusfördelning</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip />
            <Bar dataKey="value" fill="#3b82f6" radius={[5, 5, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const StatCard = ({ title, value }) => (
  <div className="bg-gray-800 p-4 rounded-lg shadow text-center">
    <h2 className="text-xl mb-2">{title}</h2>
    <p className="text-3xl font-bold">{value}</p>
  </div>
);

export default StatsPanel;
