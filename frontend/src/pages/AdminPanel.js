
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

  );
};

export default AdminPanel;
