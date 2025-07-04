
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

  const companyName = localStorage.getItem('companyName');
  if (!companyName) {
    return alert('Licensnyckel eller företagsnamn saknas.');
  }

  try {
    await axios.post('/users', { ...newUser, companyName });
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

  const reactivateAll = async () => {
    if (window.confirm('Återställ alla inaktiva eller låsta konton?')) {
      try {
        await axios.put('/users/reactivate-all');
        refreshData();
        alert('Alla konton har återställts.');
      } catch {
        alert('Kunde inte återställa konton.');
      }
    }
  };

  const refreshData = () => {
    view === 'locked' ? fetchLockedUsers() : fetchUsers();
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
          <button
    onClick={async () => {
      if (window.confirm('Återställ alla inaktiva eller låsta konton?')) {
        try {
          await axios.put('/users/reactivate-all');
          refreshData(); // Uppdatera listan
        } catch (err) {
          alert('Kunde inte återställa konton');
        }
      }
    }}
    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
  >
     Återställ alla konton
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

        {/* Tabell */}
        <table className={`w-full border shadow rounded text-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <tr>
              <th className="py-2 px-3 text-left">Namn</th>
              <th className="py-2 px-3">E-post</th>
              <th className="py-2 px-3">Roll</th>
              <th className="py-2 px-3">Status</th>
              <th className="py-2 px-3">Åtgärder</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr
                key={user._id}
                className="border-t hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => setSelectedUser(user)}
              >
                <td className="py-2 px-3 flex items-center gap-2">
                  <div className="bg-blue-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                    {user.username[0]?.toUpperCase()}
                  </div>
                  {user.username}
                </td>
                <td className="py-2 px-3">{user.email}</td>
                <td className="py-2 px-3">
                  <select
                    className="border rounded px-2 py-1"
                    value={user.role}
                    onChange={(e) => updateUser(user._id, { role: e.target.value })}
                  >
                    <option value="admin">admin</option>
                    <option value="manager">manager</option>
                    <option value="user">user</option>
                    <option value="viewer">viewer</option>
                  </select>
                </td>
                <td className="py-2 px-3 text-center">
                  <input
                    type="checkbox"
                    checked={user.active}
                    onChange={(e) => updateUser(user._id, { active: e.target.checked })}
                  />
                </td>
                <td className="py-2 px-3 text-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteUser(user._id);
                    }}
                    className="text-red-600 hover:underline"
                  >
                    Radera
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      resetPassword(user._id);
                    }}
                    className="text-blue-600 hover:underline"
                  >
                    Återställ lösenord
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Detaljpanel */}
        {selectedUser && (
          <div className={`mt-6 p-4 rounded shadow ${darkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
            <h3 className="text-lg font-semibold mb-2">📄 Användardetaljer</h3>
            <p><strong>Namn:</strong> {selectedUser.username}</p>
            <p><strong>E-post:</strong> {selectedUser.email}</p>
            <p><strong>Roll:</strong> {selectedUser.role}</p>
            <p><strong>Status:</strong> {selectedUser.active ? 'Aktiv' : 'Inaktiv'}</p>
            <p><strong>Kontolåsning:</strong> {selectedUser.lockUntil ? new Date(selectedUser.lockUntil).toLocaleString() : 'Ej låst'}</p>
            <button
              onClick={() => setSelectedUser(null)}
              className="mt-3 text-blue-600 hover:underline"
            >
              Stäng
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
