import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import ChangePassword from './pages/ChangePassword';
import KanbanBoard from './components/KanbanBoard';
import AdminPanel from './pages/AdminPanel';
import ProtectedRoute from './ProtectedRoute';
import Register from './pages/Register';
import StatsPanel from './pages/StatsPanel';

function App() {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/change-password" element={<ChangePassword />} />

        <Route
          path="/kanban"
          element={
            <ProtectedRoute>
              <KanbanBoard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              {user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/kanban" />}
            </ProtectedRoute>
          }
        />

        <Route
          path="/stats"
          element={
            <ProtectedRoute>
              <StatsPanel />
            </ProtectedRoute>
          }
        />

        {/* Denna SKA ligga sist – fångar upp ogiltiga länkar */}
        <Route path="*" element={<Navigate to="/kanban" />} />
      </Routes>
    </Router>
  );
}

export default App;
