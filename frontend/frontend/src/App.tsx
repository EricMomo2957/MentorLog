import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

// Simple placeholder components for testing
const AdminDashboard = () => <div className="p-10 text-white"><h1>Welcome Admin</h1></div>;
const StudentDashboard = () => <div className="p-10 text-white"><h1>Welcome Student</h1></div>;

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

        {/* Both can enter, or specify 'student' if needed */}
        <Route 
            path="/student-dashboard" 
            element={
                <ProtectedRoute requiredRole="student">
                    <StudentDashboard />
                </ProtectedRoute>
            } 
        />

        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;