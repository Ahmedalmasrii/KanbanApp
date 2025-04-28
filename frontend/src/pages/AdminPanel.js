
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

  