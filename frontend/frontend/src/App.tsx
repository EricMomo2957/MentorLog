import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

// These imports correctly point to your new organized folders
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentDashboard from './pages/student/StudentDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Only Admins can enter here */}
        <Route 
            path="/admin-dashboard" 
            element={
                <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                </ProtectedRoute>
            } 
        />

        {/* Only Students can enter here */}
        <Route 
            path="/student-dashboard" 
            element={
                <ProtectedRoute requiredRole="student">
                    <StudentDashboard />
                </ProtectedRoute>
            } 
        />

        {/* Default redirect to login */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;