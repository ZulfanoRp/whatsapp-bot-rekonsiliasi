import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Whitelist from './pages/Whitelist';
import LogActivity from './pages/LogActivity';
import ReconHistory from './pages/ReconHistory';
import AdminLayout from './layout/AdminLayout';

function ProtectedRoute({ children }) {
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  return isLoggedIn ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Navigate to="/whitelist" />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/whitelist"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Whitelist />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/logs"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <LogActivity />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/recon-history"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <ReconHistory />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
