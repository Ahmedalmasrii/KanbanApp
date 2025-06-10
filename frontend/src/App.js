import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import ChangePassword from './pages/ChangePassword';
import KanbanBoard from './components/KanbanBoard';
import AdminPanel from './pages/AdminPanel';
import ProtectedRoute from './ProtectedRoute';
import Register from './pages/Register';
import StatsPanel from './pages/StatsPanel';
import AuditTrail from './components/AuditTrail';
import LicenseActivation from './pages/LicenseActivation'; // Nytt för licenshantering

function App() {
  const user = JSON.parse(localStorage.getItem('user'));
  const [isLicenseValid, setIsLicenseValid] = useState(false);

  useEffect(() => {
    const licenseKey = localStorage.getItem('licenseKey');
    if (licenseKey) {
      setIsLicenseValid(true);
    }
  }, []);

  if (!isLicenseValid) {
    return (
      <Router>
        <Routes>
          <Route path="*" element={<LicenseActivation onLicenseActivated={() => setIsLicenseValid(true)} />} />
        </Routes>
      </Router>
    );
  }

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

        <Route
          path="/audit"
          element={
            <ProtectedRoute>
              {(user?.role === 'admin' || user?.role === 'manager') ? <AuditTrail /> : <Navigate to="/kanban" />}
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/kanban" />} />
      </Routes>
    </Router>
  );
}

export default App;
