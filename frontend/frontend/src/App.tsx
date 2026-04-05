import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { useState, useEffect } from 'react'; // Removed unused hooks
import Register from './pages/Register';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

// Admin Imports
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageAttendance from './pages/admin/ManageAttendance';
import ManageStudents from './pages/admin/ManageStudents'; 
import AdminSettings from './pages/admin/AdminSettings';
import WeeklyReports from './pages/admin/WeeklyReports';
import ManageTasks from './pages/admin/ManageTasks'; 
import AdminProfile from './pages/admin/AdminProfile';
import AdminCalendar from './pages/admin/AdminCalendar';

// Student Imports
import StudentDashboard from './pages/student/StudentDashboard';
import MyTasks from './pages/student/MyTasks'; 
import StudentProfile from './pages/student/StudentProfile';
import StudentSettings from './pages/student/StudentSettings';

// REMOVED: import logoPhoto from "../../assets/mentorlogOption.png"; 
// REMOVED: interface Task and all task-fetching logic

function App() {
  return (
    <Router>
      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Navigate to="/login" />} />

        {/* --- Admin Protected Routes --- */}
        {[
          { path: "/admin-dashboard", element: <AdminDashboard /> },
          { path: "/manage-students", element: <ManageStudents /> },
          { path: "/manage-attendance", element: <ManageAttendance /> },
          { path: "/admin-calendar", element: <AdminCalendar /> }, 
          { path: "/manage-tasks", element: <ManageTasks /> },
          { path: "/weekly-reports", element: <WeeklyReports /> },
          { path: "/admin-profile", element: <AdminProfile /> }, 
          { path: "/admin-settings", element: <AdminSettings /> },
        ].map((route) => (
          <Route 
            key={route.path}
            path={route.path} 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  {route.element}
                </AdminLayout>
              </ProtectedRoute>
            } 
          />
        ))}

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