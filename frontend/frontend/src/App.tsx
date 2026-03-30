import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Register from './pages/Register';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

// Admin Imports
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageAttendance from './pages/admin/ManageAttendance';
import AdminSettings from './pages/admin/AdminSettings';
import WeeklyReports from './pages/admin/WeeklyReports';
import ManageTasks from './pages/admin/ManageTasks'; 

// Student Imports
import StudentDashboard from './pages/student/StudentDashboard';
import MyTasks from './pages/student/MyTasks'; 
import StudentProfile from './pages/student/StudentProfile';
import StudentSettings from './pages/student/StudentSettings';

// Define the interface to stay type-safe
interface Task {
  id: number;
  user_id: number;
  title: string;
  task_description: string;
  status: 'Pending' | 'In-Progress' | 'Completed';
  due_date: string;
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);

  // Sync sidebar tasks for Admin View
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/tasks');
        if (response.ok) {
          const data = await response.json();
          setTasks(data);
        }
      } catch (error) {
        console.error("Failed to sync sidebar tasks:", error);
      }
    };

    fetchTasks();
  }, []);

  return (
    <Router>
      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Navigate to="/login" />} />

        {/* --- Admin Protected Routes --- */}
        <Route 
          path="/admin-dashboard" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout tasks={tasks}>
                <AdminDashboard />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/manage-attendance" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout tasks={tasks}>
                <ManageAttendance />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/manage-tasks" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout tasks={tasks}>
                <ManageTasks />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/weekly-reports"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout tasks={tasks}>
                <WeeklyReports />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route 
          path="/admin-settings" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout tasks={tasks}>
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

        <Route 
          path="/tasks" 
          element={
            <ProtectedRoute requiredRole="student">
              <MyTasks />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/student-profile" 
          element={
            <ProtectedRoute requiredRole="student">
              <StudentProfile />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/settings" 
          element={
            <ProtectedRoute requiredRole="student">
              <StudentSettings />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/my-attendance" 
          element={
            <ProtectedRoute requiredRole="student">
              <div className="p-10 text-white bg-[#0f172a] min-h-screen">
                <h1 className="text-3xl font-black mb-4">My Attendance</h1>
                <p className="text-slate-400">Attendance Feature Coming Soon...</p>
              </div>
            </ProtectedRoute>
          } 
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;