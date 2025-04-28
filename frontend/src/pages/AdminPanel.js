
import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import Header from '../components/Header';

const AdminPanel = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  // State för att hantera användarlista, sökning, vy, mörkt läge och vald användare
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [view, setView] = useState('all'); // 'all' eller 'locked'

  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user',
    active: true,
  });


  // Funktioner för att hämta användare och låsta/inaktiva användare
  const fetchUsers = async () => {
    try {
      const res = await axios.get('/users');
      setUsers(res.data);
    } catch (err) {
      alert('Kunde inte hämta användare');
    }
  };

  const fetchLockedUsers = async () => {
    try {
      const res = await axios.get('/users/inactive-or-locked');
      setUsers(res.data);
    } catch (err) {
      alert('Kunde inte hämta låsta/inaktiva användare');
    }
  };
// Funktioner för att skapa, uppdatera, radera och återställa lösenord för användare
  const createUser = async (e) => {
    e.preventDefault();
    if (!newUser.username || !newUser.email || !newUser.password) {
      return alert('Fyll i alla fält!');
    }

    try {
      await axios.post('/users', newUser);
      refreshData();
      setNewUser({
        username: '',
        email: '',
        password: '',
        role: 'user',
        active: true,
      });
    } catch (err) {
      alert('Kunde inte skapa användaren.');
    }
  };

  const updateUser = async (id, updates) => {
    try {
      await axios.put(`/users/${id}`, updates);
      refreshData();
    } catch (err) {
      alert('Uppdatering misslyckades');
    }
  };

  const deleteUser = async (id) => {
    if (window.confirm('Radera användare?')) {
      try {
        await axios.delete(`/users/${id}`);
        refreshData();
      } catch (err) {
        alert('Radering misslyckades');
      }
    }
  };

  const resetPassword = async (id) => {
    const newPassword = prompt('Ange nytt lösenord för användaren:');
    if (!newPassword) return;

    try {
      await axios.put(`/users/${id}/reset-password`, { newPassword });
      alert('Lösenord återställdes.');
    } catch (err) {
      alert('Kunde inte återställa lösenordet.');
    }
  };

  const refreshData = () => {
    if (view === 'locked') {
      fetchLockedUsers();
    } else {
      fetchUsers();
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      refreshData();
    }
  }, [view]);

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );
// Hantera sökning och filtrering av användare beroende på roll och status
  if (user?.role !== 'admin') {
    return (
      <div className="p-6">
        <Header />
        <div className="text-red-600 text-center font-semibold mt-10">
           Du har inte behörighet att visa denna sida.
        </div>
      </div>
    );
  }
//  Rendera adminpanelen med användarhantering, inklusive sökfält, tabell och formulär för att skapa nya användare
  return (
    <div className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'} min-h-screen p-6 transition`}>
   
      <Header />
    
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">⚙️ Adminpanel</h2>
          
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="px-4 py-2 rounded border text-sm"
          >
            {darkMode ? '🌞 Ljust läge' : '🌙 Mörkt läge'}
          </button>
        </div>

        {/* Flikar */}
        <div className="flex space-x-4 mb-4">
          <button
            onClick={() => setView('all')}
            className={`px-4 py-2 rounded ${view === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-black'}`}
          >
            👥 Alla användare
          </button>
          <button
            onClick={() => setView('locked')}
            className={`px-4 py-2 rounded ${view === 'locked' ? 'bg-red-600 text-white' : 'bg-gray-300 text-black'}`}
          >
            🚫 Inaktiva/Utlåsta konton
          </button>
        </div>

        <div className="grid md:grid-cols-5 gap-4 mb-6">
          <input
            type="text"
            placeholder="🔍 Sök efter användare..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="col-span-2 border p-2 rounded"
          />
        </div>

        {/* Formulär för att skapa användare – endast i vyn 'all' */}
        {view === 'all' && (
          <form
            onSubmit={createUser}
            className={`mb-6 grid grid-cols-1 md:grid-cols-5 gap-4 p-4 rounded shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
          >
            <input
              type="text"
              placeholder="Namn"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              className="border p-2 rounded"
            />
            <input
              type="email"
              placeholder="E-post"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              className="border p-2 rounded"
            />
            <input
              type="password"
              placeholder="Lösenord"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              className="border p-2 rounded"
            />
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              className="border p-2 rounded"
            >
              <option value="admin">admin</option>
              <option value="manager">manager</option>
              <option value="user">user</option>
              <option value="viewer">viewer</option>
            </select>
            <button
              type="submit"
              className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700"
            >
              Skapa användare
            </button>
          </form>
        )}

       
      </div>
    </div>
  );
};

export default AdminPanel;
