import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import ChangePassword from './pages/ChangePassword'; // <-- Lagt till här
import KanbanBoard from './components/KanbanBoard';
import AdminPanel from './pages/AdminPanel';
import ProtectedRoute from './ProtectedRoute';

function App() {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/change-password" element={<ChangePassword />} /> {/* <-- Lagt till här */}

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

        <Route path="*" element={<Navigate to="/kanban" />} />
      </Routes>
    </Router>
  );
}

export default App;
