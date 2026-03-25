import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

// Admin Imports
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageAttendance from './pages/admin/ManageAttendance';
import AdminSettings from './pages/admin/AdminSettings';

// Student Imports
import StudentDashboard from './pages/student/StudentDashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Navigate to="/login" />} />

        {/* --- Admin Protected Routes --- */}
        {/* We wrap each admin page in AdminLayout so the sidebar stays visible */}
        
        <Route 
          path="/admin-dashboard" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/manage-attendance" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout>
                <ManageAttendance />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin-settings" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout>
                <AdminSettings />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />

        {/* --- Student Protected Routes --- */}
        <Route 
          path="/student-dashboard" 
          element={
            <ProtectedRoute requiredRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Fallback for undefined routes */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;